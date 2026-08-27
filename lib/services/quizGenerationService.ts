import { createClient } from "@/lib/supabase/server";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = a[i];
    a[i] = a[j] as T;
    a[j] = temp as T;
  }
  return a;
}

/**
 * Récupère les ids de questions publiées appartenant aux chapitres donnés
 * (en remontant chapitre → leçons publiées → exercices publiés → questions
 * publiées). Requêtes séquentielles plutôt qu'une jointure imbriquée
 * complexe, pour rester lisible — le volume de données reste faible au
 * stade MVP.
 */
async function getPublishedQuestionIdsForChapters(chapterIds: string[]): Promise<string[]> {
  if (chapterIds.length === 0) return [];
  const supabase = await createClient();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .in("chapter_id", chapterIds)
    .eq("status", "published");
  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return [];

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id")
    .in("lesson_id", lessonIds)
    .eq("status", "published");
  const exerciseIds = (exercises ?? []).map((e) => e.id);
  if (exerciseIds.length === 0) return [];

  const { data: questions } = await supabase
    .from("questions")
    .select("id")
    .in("exercise_id", exerciseIds)
    .eq("status", "published")
    .is("deleted_at", null);

  return (questions ?? []).map((q) => q.id);
}

async function createQuizAttempt(
  profileId: string,
  type: "chapter" | "subject" | "review" | "evaluation",
  questionIds: string[],
  extra: { subjectId?: string; chapterId?: string } = {}
) {
  const supabase = await createClient();

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      profile_id: profileId,
      type,
      subject_id: extra.subjectId,
      chapter_id: extra.chapterId,
      total_questions: questionIds.length,
    })
    .select("id")
    .single();
  if (attemptError) throw attemptError;

  if (questionIds.length > 0) {
    const { error: qError } = await supabase.from("quiz_questions").insert(
      questionIds.map((questionId, i) => ({
        quiz_attempt_id: attempt.id,
        question_id: questionId,
        order: i + 1,
      }))
    );
    if (qError) throw qError;
  }

  return attempt.id as string;
}

export async function generateChapterQuiz(profileId: string, chapterId: string, count = 8) {
  const allIds = await getPublishedQuestionIdsForChapters([chapterId]);
  const selected = shuffle(allIds).slice(0, count);
  return createQuizAttempt(profileId, "chapter", selected, { chapterId });
}

export async function generateSubjectQuiz(
  profileId: string,
  subjectId: string,
  levelId: string,
  count = 10
) {
  const supabase = await createClient();
  const { data: curriculums } = await supabase
    .from("curriculums")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("level_id", levelId)
    .eq("status", "published");

  const curriculumIds = (curriculums ?? []).map((c) => c.id);
  if (curriculumIds.length === 0) return createQuizAttempt(profileId, "subject", [], { subjectId });

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id")
    .in("curriculum_id", curriculumIds)
    .eq("status", "published");

  const allIds = await getPublishedQuestionIdsForChapters((chapters ?? []).map((c) => c.id));
  const selected = shuffle(allIds).slice(0, count);
  return createQuizAttempt(profileId, "subject", selected, { subjectId });
}

/**
 * Quiz de révision : questions issues des leçons déjà terminées par
 * l'élève. Sélection aléatoire simple pour le MVP — la priorisation par
 * mastery_score / répétition espacée est le rôle du quiz quotidien
 * (Phase 9), pas de ce quiz de révision manuel.
 */
export async function generateReviewQuiz(profileId: string, count = 8) {
  const supabase = await createClient();
  const { data: completedLessons } = await supabase
    .from("lesson_progress")
    .select("lessons(chapter_id)")
    .eq("profile_id", profileId)
    .eq("status", "completed");

  const chapterIds = Array.from(
    new Set((completedLessons ?? []).map((l: any) => l.lessons?.chapter_id).filter(Boolean))
  );

  const allIds = await getPublishedQuestionIdsForChapters(chapterIds);
  const selected = shuffle(allIds).slice(0, count);
  return createQuizAttempt(profileId, "review", selected);
}

export async function generateEvaluationQuiz(
  profileId: string,
  subjectId: string,
  levelId: string,
  count = 15
) {
  // Même périmètre que le quiz de matière, mais un nombre de questions
  // plus élevé pour une évaluation plus complète.
  return generateSubjectQuiz(profileId, subjectId, levelId, count).then(async (id) => {
    const supabase = await createClient();
    await supabase.from("quiz_attempts").update({ type: "evaluation" }).eq("id", id);
    return id;
  });
}
