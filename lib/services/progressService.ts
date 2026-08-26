import { createServiceRoleClient } from "@/lib/supabase/server";
import { computeMasteryScore } from "@/lib/algorithms/masteryScore";
import { spacedRepetitionService } from "@/lib/algorithms/spacedRepetition";

/**
 * Enregistre le résultat d'une tentative liée à une compétence et met à
 * jour `competency_progress` (mastery_score, attempts_count, correct_count,
 * next_review_at).
 *
 * Utilise le client `service_role` car la policy RLS sur
 * `competency_progress` (migration 0009) n'autorise aucune écriture pour
 * le rôle `authenticated` — volontairement, pour empêcher toute
 * manipulation du score de maîtrise depuis le client. L'appelant (les
 * server actions de correction d'exercice/quiz) a déjà authentifié
 * l'utilisateur via `auth.getUser()` avant d'appeler cette fonction.
 *
 * Le "streak" nécessaire à `spacedRepetitionService` n'est pas stocké
 * explicitement en base (pas de colonne dédiée) ; il est approximé à
 * partir du mastery_score précédent. C'est une simplification
 * volontaire pour le MVP plutôt que d'ajouter une colonne dont l'usage
 * se limiterait à ce calcul.
 */
export async function recordCompetencyAttempt(
  profileId: string,
  competencyId: string,
  wasCorrect: boolean
) {
  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from("competency_progress")
    .select("*")
    .eq("profile_id", profileId)
    .eq("competency_id", competencyId)
    .maybeSingle();

  const previousScore = existing?.mastery_score ?? 0;
  const attemptsCount = existing?.attempts_count ?? 0;
  const correctCount = existing?.correct_count ?? 0;

  const newScore = computeMasteryScore(previousScore, attemptsCount, wasCorrect);

  const approximateStreak = previousScore >= 80 ? 3 : previousScore >= 50 ? 2 : previousScore > 0 ? 1 : 0;
  const { nextReviewAt } = spacedRepetitionService.computeNextReview({
    wasCorrect,
    currentStreak: wasCorrect ? approximateStreak : 0,
    lastIntervalDays: 0,
  });

  const { error } = await supabase.from("competency_progress").upsert(
    {
      profile_id: profileId,
      competency_id: competencyId,
      mastery_score: newScore,
      attempts_count: attemptsCount + 1,
      correct_count: correctCount + (wasCorrect ? 1 : 0),
      last_reviewed_at: new Date().toISOString(),
      next_review_at: nextReviewAt.toISOString(),
    },
    { onConflict: "profile_id,competency_id" }
  );

  if (error) {
    // Erreur volontairement journalisée plutôt qu'avalée silencieusement :
    // un échec ici (mauvaise clé service_role, RLS, etc.) ne doit pas
    // passer inaperçu pendant le développement.
    console.error("[progressService] Échec de mise à jour de competency_progress:", error);
  }
}
