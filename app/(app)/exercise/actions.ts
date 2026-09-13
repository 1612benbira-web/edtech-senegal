"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { recordCompetencyAttempt } from "@/lib/services/progressService";
import { awardXp, updateStreak, evaluateBadges } from "@/lib/services/gamificationService";
import { getLessonNavigation } from "@/lib/queries/lessons";
import { gradeQuestion, type GradableQuestionType } from "@/lib/services/questionGrading";

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
  /** Navigation proposée après la correction, sans redirection automatique. */
  nextLessonUrl: string | null;
  nextLessonTitle: string | null;
  nextChapterUrl: string | null;
  nextChapterTitle: string | null;
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
    .is("deleted_at", null)
    // Même ordre que getPublishedQuestionsForExercise (voir son commentaire) :
    // requis pour que l'index d'une option corresponde au même item pour
    // l'élève et pour la correction — sinon les questions "matching" sont
    // corrigées sur un mauvais appariement de façon silencieuse.
    .order("order", { referencedTable: "question_options" });

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
    const isCorrect = gradeQuestion(q.type as GradableQuestionType, options, studentAnswer);

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

  let nextLessonUrl: string | null = null;
  let nextLessonTitle: string | null = null;
  let nextChapterUrl: string | null = null;
  let nextChapterTitle: string | null = null;

  const lessonMeta = (exerciseMeta as any)?.lessons;
  const chapterMeta = lessonMeta?.chapters;
  const curriculumMeta = chapterMeta?.curriculums;

  // Navigation post-correction : l'élève reste sur l'écran des résultats
  // afin de pouvoir revoir ses erreurs et son score avant de continuer.
  if (exerciseMeta?.lesson_id) {
    const navigation = await getLessonNavigation(exerciseMeta.lesson_id);

    if (navigation?.nextLesson) {
      nextLessonUrl = `/lesson/${navigation.nextLesson.id}`;
      nextLessonTitle = navigation.nextLesson.title;
    } else if (navigation?.nextChapterLesson) {
      nextChapterUrl = `/lesson/${navigation.nextChapterLesson.id}`;
      nextChapterTitle = navigation.nextChapter?.title ?? null;
    }
  }

  return {
    results,
    score,
    correctCount,
    totalCount,
    nextLessonUrl,
    nextLessonTitle,
    nextChapterUrl,
    nextChapterTitle,
  };
}
