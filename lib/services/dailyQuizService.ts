import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { getTodayInTimezone } from "@/lib/utils/timezone";
import { selectDailyQuizQuestions, type CandidatePools, type DailyQuizConfig } from "@/lib/algorithms/dailyQuiz";

type AnySupabaseClient = SupabaseClient<Database> | Awaited<ReturnType<typeof createClient>>;

const RECENT_LESSON_DAYS = 14;

async function resolveCandidatePools(
  supabase: AnySupabaseClient,
  profileId: string,
  levelId: string
): Promise<CandidatePools> {
  // Chapitres publiés du niveau de l'élève, dans les matières qu'il a choisies.
  const { data: profileSubjects } = await supabase
    .from("profile_subjects")
    .select("subject_id")
    .eq("profile_id", profileId);
  const subjectIds = (profileSubjects ?? []).map((s) => s.subject_id);

  const { data: curriculums } = await supabase
    .from("curriculums")
    .select("id")
    .eq("level_id", levelId)
    .eq("status", "published")
    .in("subject_id", subjectIds.length > 0 ? subjectIds : ["00000000-0000-0000-0000-000000000000"]);
  const curriculumIds = (curriculums ?? []).map((c) => c.id);

  const { data: allChapters } = curriculumIds.length
    ? await supabase.from("chapters").select("id").in("curriculum_id", curriculumIds).eq("status", "published")
    : { data: [] };
  const allChapterIds = (allChapters ?? []).map((c) => c.id);

  async function questionIdsForChapters(chapterIds: string[], minDifficulty?: number) {
    if (chapterIds.length === 0) return [];
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

    let query = supabase
      .from("questions")
      .select("id")
      .in("exercise_id", exerciseIds)
      .eq("status", "published")
      .is("deleted_at", null);
    if (minDifficulty !== undefined) query = query.gte("difficulty_score", minDifficulty);

    const { data: questions } = await query;
    return (questions ?? []).map((q) => q.id);
  }

  // 1. Notions récemment étudiées : chapitres des leçons terminées récemment.
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - RECENT_LESSON_DAYS);
  const { data: recentProgress } = await supabase
    .from("lesson_progress")
    .select("lessons(chapter_id)")
    .eq("profile_id", profileId)
    .eq("status", "completed")
    .gte("completed_at", recentCutoff.toISOString());
  const recentChapterIds = Array.from(
    new Set((recentProgress ?? []).map((p: any) => p.lessons?.chapter_id).filter(Boolean))
  );
  const recentLesson = await questionIdsForChapters(recentChapterIds);

  // 2. Mauvaise maîtrise (competency_progress) — sera peuplé en Phase 10.
  const { data: weakCompetencies } = await supabase
    .from("competency_progress")
    .select("competencies(domains(curriculum_id))")
    .eq("profile_id", profileId)
    .lt("mastery_score", 60);
  const weakMastery: string[] =
    weakCompetencies && weakCompetencies.length > 0 ? await questionIdsForChapters(allChapterIds) : [];

  // 3. Questions précédemment incorrectes (exercices + quiz).
  const { data: wrongExercise } = await supabase
    .from("exercise_attempts")
    .select("question_id")
    .eq("profile_id", profileId)
    .eq("is_correct", false);
  const { data: wrongQuiz } = await supabase
    .from("quiz_questions")
    .select("question_id, quiz_attempts!inner(profile_id)")
    .eq("quiz_attempts.profile_id", profileId)
    .eq("is_correct", false);
  const pastIncorrect = Array.from(
    new Set([
      ...(wrongExercise ?? []).map((e) => e.question_id),
      ...(wrongQuiz ?? []).map((q: any) => q.question_id),
    ])
  );

  // 4. Révision due (next_review_at) — sera peuplé en Phase 10.
  const today = getTodayInTimezone();
  const { data: dueCompetencies } = await supabase
    .from("competency_progress")
    .select("competencies(domains(curriculum_id))")
    .eq("profile_id", profileId)
    .lte("next_review_at", today);
  const dueReview: string[] =
    dueCompetencies && dueCompetencies.length > 0 ? await questionIdsForChapters(allChapterIds) : [];

  // 5. Défi : questions difficiles des chapitres déjà abordés.
  const attemptedChapterIds = recentChapterIds.length > 0 ? recentChapterIds : allChapterIds;
  const harderChallenge = await questionIdsForChapters(attemptedChapterIds, 70);

  // 6. Nouvelles notions : chapitres jamais abordés par l'élève.
  const { data: allProgress } = await supabase
    .from("lesson_progress")
    .select("lessons(chapter_id)")
    .eq("profile_id", profileId);
  const attemptedIds = new Set(
    (allProgress ?? []).map((p: any) => p.lessons?.chapter_id).filter(Boolean)
  );
  const newChapterIds = allChapterIds.filter((id) => !attemptedIds.has(id));
  const newNotion = await questionIdsForChapters(newChapterIds.length > 0 ? newChapterIds : allChapterIds);

  return { recentLesson, weakMastery, pastIncorrect, dueReview, harderChallenge, newNotion };
}

/**
 * Retourne le quiz du jour de l'élève, en le créant s'il n'existe pas
 * encore pour la date du jour (dans son fuseau horaire).
 *
 * `client` est injectable pour permettre l'appel depuis un contexte
 * sans session utilisateur (ex : job planifié de notifications, cf.
 * app/api/cron/daily-quiz-notifications) avec un client service_role.
 * Par défaut, utilise le client lié à la session (comportement
 * historique, inchangé pour tous les appels existants).
 */
export async function getOrCreateDailyQuiz(
  profileId: string,
  client?: AnySupabaseClient
): Promise<string> {
  const supabase = client ?? (await createClient());

  const { data: profile } = await supabase
    .from("profiles")
    .select("level_id, timezone, daily_goal")
    .eq("id", profileId)
    .single();
  if (!profile?.level_id) throw new Error("Niveau scolaire non défini.");

  const today = getTodayInTimezone(profile.timezone ?? "Africa/Dakar");

  const { data: existing } = await supabase
    .from("daily_quizzes")
    .select("quiz_attempt_id")
    .eq("profile_id", profileId)
    .eq("date", today)
    .maybeSingle();
  if (existing?.quiz_attempt_id) return existing.quiz_attempt_id;

  const { data: config } = await supabase
    .from("daily_quiz_config")
    .select("*")
    .eq("id", 1)
    .single();

  const dailyConfig: DailyQuizConfig = {
    questionsCount: config?.questions_count ?? 8,
    ratioRecent: config?.ratio_recent ?? 5,
    ratioReview: config?.ratio_review ?? 2,
    ratioChallenge: config?.ratio_challenge ?? 1,
  };
  const excludeRecentDays = config?.exclude_recent_days ?? 3;

  const pools = await resolveCandidatePools(supabase, profileId, profile.level_id);

  // Questions déjà vues dans les daily_quiz_questions récents, à éviter.
  const excludeCutoff = new Date();
  excludeCutoff.setDate(excludeCutoff.getDate() - excludeRecentDays);
  const { data: recentDailyQuizzes } = await supabase
    .from("daily_quizzes")
    .select("id")
    .eq("profile_id", profileId)
    .gte("date", excludeCutoff.toISOString().slice(0, 10));
  const recentQuizIds = (recentDailyQuizzes ?? []).map((q) => q.id);
  let alreadySeen: Set<string> = new Set();
  if (recentQuizIds.length > 0) {
    const { data: seenQuestions } = await supabase
      .from("daily_quiz_questions")
      .select("question_id")
      .in("daily_quiz_id", recentQuizIds);
    alreadySeen = new Set((seenQuestions ?? []).map((q) => q.question_id));
  }

  const selection = selectDailyQuizQuestions(pools, dailyConfig, alreadySeen);

  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      profile_id: profileId,
      type: "daily",
      total_questions: selection.length,
    })
    .select("id")
    .single();
  if (attemptError) throw attemptError;

  if (selection.length > 0) {
    await supabase.from("quiz_questions").insert(
      selection.map((s, i) => ({
        quiz_attempt_id: attempt.id,
        question_id: s.questionId,
        order: i + 1,
      }))
    );
  }

  const { data: dailyQuiz, error: dailyError } = await supabase
    .from("daily_quizzes")
    .insert({ profile_id: profileId, date: today, quiz_attempt_id: attempt.id })
    .select("id")
    .single();
  if (dailyError) throw dailyError;

  if (selection.length > 0) {
    await supabase.from("daily_quiz_questions").insert(
      selection.map((s) => ({
        daily_quiz_id: dailyQuiz.id,
        question_id: s.questionId,
        reason: s.reason,
      }))
    );
  }

  return attempt.id as string;
}
