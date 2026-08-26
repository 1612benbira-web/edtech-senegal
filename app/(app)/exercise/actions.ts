"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { recordCompetencyAttempt } from "@/lib/services/progressService";
import { awardXp, updateStreak, evaluateBadges } from "@/lib/services/gamificationService";
import { getMyProgramme } from "@/lib/queries/programme";

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  explanation: string | null;
  correctLabels: string[]; // révélé seulement après correction
}

export interface GradeExerciseResult {
  results: QuestionResult[];
  score: number; // pourcentage
  correctCount: number;
  totalCount: number;
  /** Présent quand la soumission termine réellement le chapitre. */
  nextChapterUrl: string | null;
}

/**
 * Corrige un exercice côté serveur : relit les questions avec leurs
 * `is_correct` (jamais envoyés au client avant cet appel), compare aux
 * réponses soumises, enregistre une ligne `exercise_attempts` par question,
 * et renvoie le résultat détaillé (avec les bonnes réponses, révélées
 * seulement maintenant).
 *
 * answers: { [questionId]: string | string[] }
 *   - single_choice / true_false : id d'option unique (string)
 *   - multiple_choice : tableau d'ids d'options
 *   - numeric / short_answer : texte saisi par l'élève
 *   - matching : tableau de correspondances, une valeur par élément gauche
 *   - ordering : tableau d'ids dans l'ordre choisi par l'élève
 */
export async function gradeExerciseAction(
  exerciseId: string,
  answers: Record<string, string | string[]>
): Promise<GradeExerciseResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { data: exerciseMeta } = await supabase
    .from("exercises")
    .select("id, lesson_id, lessons(id, chapter_id, chapters(id, curriculum_id, curriculums(subject_id)))")
    .eq("id", exerciseId)
    .eq("status", "published")
    .maybeSingle();

  // service_role requis ici : is_correct n'est plus lisible via le client
  // de session depuis la migration 0011 (durcissement colonne).
  const serviceSupabase = createServiceRoleClient();
  const { data: questions, error } = await serviceSupabase
    .from("questions")
    .select('id, type, explanation, points, competency_id, question_options(id, label, is_correct, match_key, order)')
    .eq("exercise_id", exerciseId)
    .eq("status", "published")
    .is("deleted_at", null);

  if (error) throw error;

  const questionIds = (questions ?? []).map((q) => q.id);

  // Garde-fou anti-farming : sans ceci, un élève pouvait rejouer le même
  // exercice indéfiniment et cumuler 10 XP par bonne réponse à chaque
  // soumission. On autorise toujours de refaire un exercice (utile pour
  // s'entraîner et pour la répétition espacée via recordCompetencyAttempt),
  // mais l'XP n'est accordée que la toute première fois qu'une question
  // donnée est répondue correctement par cet élève.
  const { data: priorAttempts } = await supabase
    .from("exercise_attempts")
    .select("question_id")
    .eq("profile_id", user.id)
    .in("question_id", questionIds.length > 0 ? questionIds : ["00000000-0000-0000-0000-000000000000"]);
  const alreadyAttemptedQuestionIds = new Set((priorAttempts ?? []).map((a) => a.question_id));

  const results: QuestionResult[] = [];
  let correctCount = 0;
  const attemptRows: {
    profile_id: string;
    question_id: string;
    is_correct: boolean;
    answer_payload: string | string[] | null;
  }[] = [];

  for (const q of questions ?? []) {
    const options = (q as any).question_options as {
      id: string;
      label: string;
      is_correct: boolean;
      match_key: string | null;
      order: number | null;
    }[];
    const correctOptions = options.filter((o) => o.is_correct);
    const studentAnswer = answers[q.id];
    let isCorrect = false;

    if (q.type === "single_choice" || q.type === "true_false") {
      isCorrect = !!studentAnswer && correctOptions.some((o) => o.id === studentAnswer);
    } else if (q.type === "multiple_choice") {
      const submitted = Array.isArray(studentAnswer) ? studentAnswer : [];
      const correctIds = correctOptions.map((o) => o.id).sort();
      const submittedSorted = [...submitted].sort();
      isCorrect =
        correctIds.length === submittedSorted.length &&
        correctIds.every((id, i) => id === submittedSorted[i]);
    } else if (q.type === "numeric") {
      const expected = parseFloat(correctOptions[0]?.label ?? "");
      const given = parseFloat(String(studentAnswer ?? "").replace(",", "."));
      isCorrect = !isNaN(expected) && !isNaN(given) && Math.abs(expected - given) < 1e-6;
    } else if (q.type === "short_answer") {
      const given = String(studentAnswer ?? "").trim().toLowerCase();
      isCorrect = correctOptions.some((o) => o.label.trim().toLowerCase() === given);
    } else if (q.type === "matching") {
      const submitted = Array.isArray(studentAnswer) ? studentAnswer : [];
      const expected = options.map((o) => o.match_key ?? "");
      isCorrect =
        expected.length === submitted.length &&
        expected.every((value, index) => value.trim().toLowerCase() === String(submitted[index] ?? "").trim().toLowerCase());
    } else if (q.type === "ordering") {
      const submitted = Array.isArray(studentAnswer) ? studentAnswer : [];
      const expected = [...options]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((o) => o.id);
      isCorrect =
        expected.length === submitted.length &&
        expected.every((id, index) => id === submitted[index]);
    }

    if (isCorrect) {
      correctCount++;
      if (!alreadyAttemptedQuestionIds.has(q.id)) {
        await awardXp(user.id, 10, "correct_answer", q.id);
      }
    }

    if (q.competency_id) {
      await recordCompetencyAttempt(user.id, q.competency_id, isCorrect);
    }

    results.push({
      questionId: q.id,
      isCorrect,
      explanation: q.explanation,
      correctLabels:
        q.type === "matching"
          ? options.map((o) => `${o.label} → ${o.match_key ?? ""}`)
          : q.type === "ordering"
            ? [...options].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((o) => o.label)
            : correctOptions.map((o) => o.label),
    });

    attemptRows.push({
      profile_id: user.id,
      question_id: q.id,
      is_correct: isCorrect,
      answer_payload: studentAnswer ?? null,
    });
  }

  if (attemptRows.length > 0) {
    await supabase.from("exercise_attempts").insert(attemptRows);
  }

  await updateStreak(user.id);
  await evaluateBadges(user.id);

  const totalCount = questions?.length ?? 0;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  let nextChapterUrl: string | null = null;

  const lessonMeta = (exerciseMeta as any)?.lessons;
  const chapterMeta = lessonMeta?.chapters;
  const curriculumMeta = chapterMeta?.curriculums;

  if (chapterMeta?.id && curriculumMeta?.subject_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("level_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.level_id) {
      const programmes = await getMyProgramme(user.id, profile.level_id);
      const programme = programmes.find((item) => item.subjectId === curriculumMeta.subject_id);
      const chapter = programme?.chapters.find((item) => item.id === chapterMeta.id);

      if (chapter?.completed) {
        const nextChapter = programme?.chapters
          .filter((item) => item.order > chapter.order && item.totalLessons > 0)
          .sort((a, b) => a.order - b.order)[0];

        if (nextChapter) {
          nextChapterUrl = `/programme/${programme.subjectId}/${nextChapter.id}`;
        }
      }
    }
  }

  return { results, score, correctCount, totalCount, nextChapterUrl };
}
