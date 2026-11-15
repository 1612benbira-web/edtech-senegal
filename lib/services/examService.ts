import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import {
  EXAM_QUESTION_COUNT,
  isExamQuestionType,
  pickBalancedQuestions,
  type ExamCandidate,
} from "@/lib/algorithms/mockExam";

/**
 * Épreuve blanche (mode BFEM) : une tentative de quiz de type "exam",
 * chronométrée et notée sur 20. Elle réutilise les tables et la correction
 * des quiz existants (quiz_attempts, quiz_questions, gradeQuizAction).
 */

/** Violation de contrainte CHECK : la migration 0031 n'est pas appliquée. */
const CHECK_VIOLATION = "23514";

/** Taille des lots pour les filtres `.in()`, afin de garder des URL courtes. */
const IN_CHUNK_SIZE = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export async function getLevelInfo(levelId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("school_levels")
    .select("id, code, name")
    .eq("id", levelId)
    .maybeSingle();
  return data;
}

/**
 * Questions publiées d'une matière pour un niveau, avec leur chapitre.
 * Même périmètre que le quiz de matière (programmes publiés visibles par
 * l'élève, la RLS s'applique), limité aux types affichables en épreuve.
 */
async function getExamCandidates(subjectId: string, levelId: string): Promise<ExamCandidate[]> {
  const supabase = await createClient();

  const { data: curriculums } = await supabase
    .from("curriculums")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("level_id", levelId)
    .eq("status", "published");
  const curriculumIds = (curriculums ?? []).map((c) => c.id);
  if (curriculumIds.length === 0) return [];

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id")
    .in("curriculum_id", curriculumIds)
    .eq("status", "published")
    .is("deleted_at", null);
  const chapterIds = (chapters ?? []).map((c) => c.id);
  if (chapterIds.length === 0) return [];

  const lessonChapter = new Map<string, string>();
  for (const ids of chunk(chapterIds, IN_CHUNK_SIZE)) {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, chapter_id")
      .in("chapter_id", ids)
      .eq("status", "published")
      .is("deleted_at", null);
    for (const lesson of lessons ?? []) lessonChapter.set(lesson.id, lesson.chapter_id);
  }
  if (lessonChapter.size === 0) return [];

  const exerciseChapter = new Map<string, string>();
  for (const ids of chunk(Array.from(lessonChapter.keys()), IN_CHUNK_SIZE)) {
    const { data: exercises } = await supabase
      .from("exercises")
      .select("id, lesson_id")
      .in("lesson_id", ids)
      .eq("status", "published")
      .is("deleted_at", null);
    for (const exercise of exercises ?? []) {
      const chapterId = lessonChapter.get(exercise.lesson_id);
      if (chapterId) exerciseChapter.set(exercise.id, chapterId);
    }
  }
  if (exerciseChapter.size === 0) return [];

  const candidates: ExamCandidate[] = [];
  for (const ids of chunk(Array.from(exerciseChapter.keys()), IN_CHUNK_SIZE)) {
    const { data: questions } = await supabase
      .from("questions")
      .select("id, type, exercise_id")
      .in("exercise_id", ids)
      .eq("status", "published")
      .is("deleted_at", null);
    for (const question of questions ?? []) {
      if (!isExamQuestionType(question.type)) continue;
      candidates.push({
        id: question.id,
        chapterId: exerciseChapter.get(question.exercise_id) ?? null,
      });
    }
  }
  return candidates;
}

export type GenerateMockExamResult =
  | { ok: true; examId: string }
  | { ok: false; reason: "no_questions" | "unavailable" };

export async function generateMockExam(
  profileId: string,
  subjectId: string,
  levelId: string,
  count: number = EXAM_QUESTION_COUNT
): Promise<GenerateMockExamResult> {
  const candidates = await getExamCandidates(subjectId, levelId);
  const questionIds = pickBalancedQuestions(candidates, count);
  if (questionIds.length === 0) return { ok: false, reason: "no_questions" };

  const supabase = await createClient();
  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      profile_id: profileId,
      type: "exam",
      subject_id: subjectId,
      total_questions: questionIds.length,
    })
    .select("id")
    .single();
  if (attemptError) {
    if (attemptError.code === CHECK_VIOLATION) {
      console.error(
        "[examService] Type de quiz 'exam' refusé : appliquer la migration 0031_exam_quiz_type.sql."
      );
      return { ok: false, reason: "unavailable" };
    }
    throw attemptError;
  }

  const { error: questionsError } = await supabase.from("quiz_questions").insert(
    questionIds.map((questionId, index) => ({
      quiz_attempt_id: attempt.id,
      question_id: questionId,
      order: index + 1,
    }))
  );
  if (questionsError) {
    // Pas d'épreuve sans ses questions : on retire la tentative vide.
    await supabase.from("quiz_attempts").delete().eq("id", attempt.id);
    throw questionsError;
  }

  return { ok: true, examId: attempt.id };
}

export interface ExamAttemptSummary {
  id: string;
  subjectId: string | null;
  totalQuestions: number;
  correctAnswers: number | null;
  startedAt: string;
  completedAt: string | null;
}

/** Épreuves blanches de l'élève, de la plus récente à la plus ancienne. */
export async function getMyExamAttempts(profileId: string): Promise<ExamAttemptSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id, subject_id, total_questions, correct_answers, started_at, completed_at")
    .eq("profile_id", profileId)
    .eq("type", "exam")
    .order("started_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    subjectId: row.subject_id,
    totalQuestions: row.total_questions ?? 0,
    correctAnswers: row.correct_answers,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }));
}

export interface ExamCorrectionItem {
  questionId: string;
  prompt: string;
  isCorrect: boolean;
  /** Réponse donnée par l'élève, en clair (null si la question est restée sans réponse). */
  givenAnswer: string | null;
  correctLabels: string[];
  explanation: string | null;
  chapterId: string | null;
  chapterTitle: string;
}

/**
 * Corrigé détaillé d'une épreuve TERMINÉE appartenant à l'élève.
 *
 * Le client service_role est nécessaire pour lire `is_correct` (colonne
 * masquée aux élèves depuis la migration 0011). Il n'est utilisé qu'après
 * avoir vérifié, avec le client de session (RLS), que l'épreuve appartient
 * bien à l'élève et qu'elle est terminée : jamais de bonne réponse révélée
 * pendant l'épreuve.
 */
export async function getExamCorrection(
  examId: string,
  profileId: string
): Promise<ExamCorrectionItem[] | null> {
  const supabase = await createClient();
  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("id, completed_at")
    .eq("id", examId)
    .eq("profile_id", profileId)
    .eq("type", "exam")
    .maybeSingle();
  if (!attempt?.completed_at) return null;

  const serviceSupabase = createServiceRoleClient();
  const { data: rows, error } = await serviceSupabase
    .from("quiz_questions")
    .select(
      "order, is_correct, answer_payload, questions(id, prompt, explanation, exercise_id, question_options(id, label, is_correct, order))"
    )
    .eq("quiz_attempt_id", examId)
    .order("order");
  if (error) throw error;

  type OptionRow = { id: string; label: string; is_correct: boolean; order: number | null };
  type QuestionRow = {
    id: string;
    prompt: string;
    explanation: string | null;
    exercise_id: string;
    question_options: OptionRow[];
  };
  const entries = (rows ?? [])
    .map((row) => ({
      isCorrect: row.is_correct === true,
      answer: row.answer_payload as unknown,
      question: (row as unknown as { questions: QuestionRow | null }).questions,
    }))
    .filter((entry): entry is typeof entry & { question: QuestionRow } => entry.question !== null);

  // Chapitre de chaque question : exercice → leçon → chapitre.
  const exerciseIds = Array.from(new Set(entries.map((entry) => entry.question.exercise_id)));
  const exerciseChapter = new Map<string, { id: string; title: string }>();
  if (exerciseIds.length > 0) {
    const { data: exercises } = await serviceSupabase
      .from("exercises")
      .select("id, lessons(chapters(id, title))")
      .in("id", exerciseIds);
    for (const exercise of exercises ?? []) {
      const chapter = (
        exercise as unknown as { lessons: { chapters: { id: string; title: string } | null } | null }
      ).lessons?.chapters;
      if (chapter) exerciseChapter.set(exercise.id, chapter);
    }
  }

  return entries.map(({ isCorrect, answer, question }) => {
    const options = [...question.question_options].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const chapter = exerciseChapter.get(question.exercise_id);
    return {
      questionId: question.id,
      prompt: question.prompt,
      isCorrect,
      givenAnswer: describeAnswer(answer, options),
      correctLabels: options.filter((option) => option.is_correct).map((option) => option.label),
      explanation: question.explanation,
      chapterId: chapter?.id ?? null,
      chapterTitle: chapter?.title ?? "Autres notions",
    };
  });
}

/**
 * Traduit la réponse enregistrée (identifiant d'option, liste d'identifiants
 * ou texte libre) en texte lisible par l'élève.
 */
export function describeAnswer(
  answer: unknown,
  options: { id: string; label: string }[]
): string | null {
  const labelOf = (value: string) => options.find((option) => option.id === value)?.label ?? value;
  if (Array.isArray(answer)) {
    const labels = answer.filter((value): value is string => typeof value === "string").map(labelOf);
    return labels.length > 0 ? labels.join(", ") : null;
  }
  if (typeof answer === "string") {
    const trimmed = answer.trim();
    return trimmed === "" ? null : labelOf(trimmed);
  }
  return null;
}
