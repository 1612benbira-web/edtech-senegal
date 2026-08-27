import { createClient } from "@/lib/supabase/server";

export async function getQuizAttempt(quizId: string, profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("id", quizId)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Même précaution que `getPublishedQuestionsForExercise` (voir
 * lib/queries/exercises.ts) : `is_correct` n'est jamais sélectionné ici.
 */
export async function getQuizQuestions(quizId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("order, questions(id, type, prompt, points, question_options(id, label, order))")
    .eq("quiz_attempt_id", quizId)
    .order("order");
  if (error) throw error;
  return data;
}
