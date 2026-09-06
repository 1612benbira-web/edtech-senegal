"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import {
  generateChapterQuiz,
  generateSubjectQuiz,
  generateReviewQuiz,
  generateEvaluationQuiz,
} from "@/lib/services/quizGenerationService";
import { getOrCreateDailyQuiz } from "@/lib/services/dailyQuizService";
import { recordCompetencyAttempt } from "@/lib/services/progressService";
import { awardXp, updateStreak, evaluateBadges } from "@/lib/services/gamificationService";

async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, level_id")
    .eq("id", user.id)
    .single();
  if (!profile?.level_id) redirect("/onboarding");

  return profile;
}

export async function startChapterQuizAction(chapterId: string) {
  const profile = await getCurrentProfile();
  const quizId = await generateChapterQuiz(profile.id, chapterId);
  redirect(`/quiz/${quizId}`);
}

export async function startSubjectQuizAction(subjectId: string) {
  const profile = await getCurrentProfile();
  const quizId = await generateSubjectQuiz(profile.id, subjectId, profile.level_id!);
  redirect(`/quiz/${quizId}`);
}

export async function startEvaluationQuizAction(subjectId: string) {
  const profile = await getCurrentProfile();
  const quizId = await generateEvaluationQuiz(profile.id, subjectId, profile.level_id!);
  redirect(`/quiz/${quizId}`);
}

export async function startReviewQuizAction(_unused?: string) {
  const profile = await getCurrentProfile();
  const quizId = await generateReviewQuiz(profile.id);
  redirect(`/quiz/${quizId}`);
}

export async function startDailyQuizAction(_unused?: string) {
  const profile = await getCurrentProfile();
  const quizId = await getOrCreateDailyQuiz(profile.id);
  redirect(`/quiz/${quizId}`);
}

// ============================================================
// CORRECTION
// ============================================================

export interface QuizQuestionResult {
  questionId: string;
  isCorrect: boolean;
  explanation: string | null;
  correctLabels: string[];
}

export interface GradeQuizResult {
  results: QuizQuestionResult[];
  score: number;
  correctCount: number;
  totalCount: number;
}

export async function gradeQuizAction(
  quizId: string,
  answers: Record<string, string | string[]>
): Promise<GradeQuizResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  // Vérification explicite de propriété via le client de session (RLS) :
  // indispensable avant de lire les questions en service_role juste après,
  // qui lui contourne la RLS et ne doit donc jamais être utilisé sans ce
  // garde-fou préalable.
  const { data: ownQuiz } = await supabase
    .from("quiz_attempts")
    .select("id, completed_at")
    .eq("id", quizId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!ownQuiz) throw new Error("Quiz introuvable ou non autorisé.");
  if (ownQuiz.completed_at) {
    throw new Error("Ce quiz a déjà été corrigé.");
  }

  // Réclamation atomique : un simple SELECT (ci-dessus) puis un check en
  // mémoire est vulnérable à une course (double clic, deux onglets, requête
  // rejouée pendant la correction) — deux appels concurrents peuvent tous
  // les deux lire `completed_at IS NULL` avant qu'aucun des deux n'écrive.
  // On "réclame" donc le quiz via un UPDATE conditionné sur
  // `completed_at IS NULL` : PostgreSQL sérialise les écritures
  // concurrentes sur la même ligne, donc un seul appel peut gagner cette
  // course. Si `claimed` est vide, un autre appel a déjà gagné la
  // réclamation (ou l'a fait entre notre SELECT et cet UPDATE) : on arrête
  // ici sans corriger une deuxième fois ni ré-attribuer l'XP. Ceci est une
  // protection en profondeur ; la garantie définitive contre le double gain
  // d'XP reste la contrainte unique PostgreSQL de la migration 0022 sur
  // xp_transactions, qui couvre aussi les autres actions (leçon, exercice).
  const { data: claimed } = await supabase
    .from("quiz_attempts")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", quizId)
    .eq("profile_id", user.id)
    .is("completed_at", null)
    .select("id")
    .maybeSingle();
  if (!claimed) {
    throw new Error("Ce quiz a déjà été corrigé.");
  }

  // service_role requis ici : is_correct n'est plus lisible via le client
  // de session depuis la migration 0011 (durcissement colonne). Les
  // écritures plus bas restent sur `supabase` (session) pour que la RLS
  // continue de garantir qu'un élève ne peut modifier que ses propres
  // quiz_attempts/quiz_questions.
  const serviceSupabase = createServiceRoleClient();
  const { data: quizQuestions, error } = await serviceSupabase
    .from("quiz_questions")
    .select("question_id, questions(id, type, explanation, competency_id, question_options(id, label, is_correct))")
    .eq("quiz_attempt_id", quizId);
  if (error) throw error;

  const results: QuizQuestionResult[] = [];
  let correctCount = 0;

  for (const qq of quizQuestions ?? []) {
    const q = (qq as any).questions;
    const options = q.question_options as { id: string; label: string; is_correct: boolean }[];
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
    }

    if (isCorrect) correctCount++;

    if (q.competency_id) {
      await recordCompetencyAttempt(user.id, q.competency_id, isCorrect);
    }

    results.push({
      questionId: q.id,
      isCorrect,
      explanation: q.explanation,
      correctLabels: correctOptions.map((o) => o.label),
    });

    await supabase
      .from("quiz_questions")
      .update({ is_correct: isCorrect, answer_payload: studentAnswer ?? null })
      .eq("quiz_attempt_id", quizId)
      .eq("question_id", q.id);
  }

  const totalCount = quizQuestions?.length ?? 0;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  await supabase
    .from("quiz_attempts")
    .update({
      score,
      correct_answers: correctCount,
      completed_at: new Date().toISOString(),
    })
    .eq("id", quizId);

  await awardXp(user.id, 30, "quiz_completed", quizId);
  if (score === 100) {
    await awardXp(user.id, 50, "quiz_perfect", quizId);
  }
  await updateStreak(user.id);
  await evaluateBadges(user.id);

  return { results, score, correctCount, totalCount };
}
