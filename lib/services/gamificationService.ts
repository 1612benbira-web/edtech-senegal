import { createServiceRoleClient } from "@/lib/supabase/server";
import { getTodayInTimezone } from "@/lib/utils/timezone";

/**
 * Attribue de l'XP à un élève. Insère uniquement dans `xp_transactions` —
 * le trigger `apply_xp_transaction` (migration 0008) maintient
 * `profiles.xp_total` à jour automatiquement, pas besoin de le faire ici.
 *
 * Utilise `service_role` car aucune policy RLS n'autorise l'écriture dans
 * `xp_transactions` pour le rôle `authenticated` (volontairement, pour
 * empêcher toute manipulation de l'XP depuis le client — voir migration 0009).
 *
 * IDEMPOTENCE (migration 0022) : chaque récompense est identifiée de façon
 * unique par (profile_id, reason, referenceId). Un index unique partiel en
 * base empêche qu'un même triplet soit inséré deux fois — protection
 * effective même en cas de double clic, deux onglets ouverts sur la même
 * page, requêtes réseau simultanées, ou nouvelle tentative après un
 * rafraîchissement pendant la correction. Ceci est délibérément vérifié au
 * niveau PostgreSQL (contrainte), pas seulement par un `if` applicatif en
 * amont — un simple check-then-act côté TypeScript reste vulnérable à une
 * course entre le SELECT de vérification et l'INSERT.
 *
 * `referenceId` doit systématiquement être fourni pour une action liée à
 * une ressource précise (id de leçon, de quiz, de question...) : c'est ce
 * qui permet à la contrainte de distinguer "même récompense rejouée" de
 * "récompense différente légitime" (ex. `lesson_completed` sur deux leçons
 * différentes doit bien accorder l'XP deux fois).
 *
 * Retourne `true` si l'XP a effectivement été accordée, `false` si elle
 * l'avait déjà été (no-op silencieux, pas une erreur) ou si l'insertion a
 * échoué pour une autre raison (déjà loggée).
 */
const UNIQUE_VIOLATION = "23505";

export async function awardXp(
  profileId: string,
  amount: number,
  reason: string,
  referenceId?: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("xp_transactions").insert({
    profile_id: profileId,
    amount,
    reason,
    reference_id: referenceId ?? null,
  });

  if (!error) return true;

  if (error.code === UNIQUE_VIOLATION) {
    // Récompense déjà accordée pour ce (profile_id, reason, reference_id) :
    // comportement attendu en cas de double soumission, pas une erreur.
    return false;
  }

  console.error("[gamificationService] Échec awardXp:", error);
  return false;
}

/**
 * Met à jour la série quotidienne (streak) de l'élève. Idempotent : si déjà
 * appelée aujourd'hui pour ce profil, ne change rien (peut être appelée
 * plusieurs fois par jour sans effet de bord, ex. à chaque leçon ou quiz
 * terminé).
 */
export async function updateStreak(profileId: string) {
  const supabase = createServiceRoleClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", profileId)
    .single();
  const today = getTodayInTimezone(profile?.timezone ?? "Africa/Dakar");

  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existing?.last_activity_date === today) {
    return; // déjà comptabilisé aujourd'hui
  }

  const wasYesterday = existing?.last_activity_date
    ? isConsecutiveDay(existing.last_activity_date, today)
    : false;

  const newCurrentStreak = wasYesterday ? (existing?.current_streak ?? 0) + 1 : 1;
  const newLongestStreak = Math.max(existing?.longest_streak ?? 0, newCurrentStreak);

  const { error } = await supabase.from("streaks").upsert(
    {
      profile_id: profileId,
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today,
    },
    { onConflict: "profile_id" }
  );
  if (error) console.error("[gamificationService] Échec updateStreak:", error);
}

export function isConsecutiveDay(lastDateStr: string, todayStr: string): boolean {
  const last = new Date(lastDateStr + "T00:00:00Z");
  const today = new Date(todayStr + "T00:00:00Z");
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86400000);
  return diffDays === 1;
}

interface BadgeCriteria {
  type:
    | "lesson_completed_count"
    | "quiz_completed_count"
    | "question_count"
    | "streak_days"
    | "quiz_perfect_count";
  value: number;
}

/**
 * Évalue les critères de tous les badges non encore obtenus par l'élève,
 * et attribue ceux dont le seuil est atteint. Moteur de règles simple
 * (interprète `badges.criteria`), plutôt qu'un badge codé en dur par cas —
 * un admin peut ajouter un nouveau badge en base sans toucher au code, du
 * moment que son `type` de critère est déjà supporté ici.
 */
export async function evaluateBadges(profileId: string) {
  const supabase = createServiceRoleClient();

  const { data: allBadges } = await supabase.from("badges").select("id, code, criteria");
  const { data: earned } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("profile_id", profileId);
  const earnedIds = new Set((earned ?? []).map((b) => b.badge_id));

  const candidates = (allBadges ?? []).filter((b) => !earnedIds.has(b.id));
  if (candidates.length === 0) return;

  const [lessonCount, quizCount, exerciseAttemptCount, quizQuestionCount, streak, perfectQuizCount] =
    await Promise.all([
      supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId)
        .eq("status", "completed")
        .then((r: { count: number | null }) => r.count ?? 0),
      supabase
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId)
        .not("completed_at", "is", null)
        .then((r: { count: number | null }) => r.count ?? 0),
      supabase
        .from("exercise_attempts")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId)
        .then((r: { count: number | null }) => r.count ?? 0),
      supabase
        .from("quiz_questions")
        .select("*, quiz_attempts!inner(profile_id)", { count: "exact", head: true })
        .eq("quiz_attempts.profile_id", profileId)
        .not("is_correct", "is", null)
        .then((r: { count: number | null }) => r.count ?? 0),
      supabase
        .from("streaks")
        .select("longest_streak")
        .eq("profile_id", profileId)
        .maybeSingle()
        .then((r: { data: { longest_streak: number } | null }) => r.data?.longest_streak ?? 0),
      supabase
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId)
        .eq("score", 100)
        .then((r: { count: number | null }) => r.count ?? 0),
    ]);

  const questionCount = exerciseAttemptCount + quizQuestionCount;

  for (const badge of candidates) {
    const criteria = badge.criteria as unknown as BadgeCriteria;
    let achieved = false;

    switch (criteria?.type) {
      case "lesson_completed_count":
        achieved = lessonCount >= criteria.value;
        break;
      case "quiz_completed_count":
        achieved = quizCount >= criteria.value;
        break;
      case "question_count":
        achieved = questionCount >= criteria.value;
        break;
      case "streak_days":
        achieved = streak >= criteria.value;
        break;
      case "quiz_perfect_count":
        achieved = perfectQuizCount >= criteria.value;
        break;
    }

    if (achieved) {
      const { error } = await supabase
        .from("user_badges")
        .insert({ profile_id: profileId, badge_id: badge.id });
      if (error) console.error("[gamificationService] Échec attribution badge:", error);
    }
  }
}
