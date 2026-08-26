/**
 * Calcule le nouveau mastery_score (0-100) d'une compétence après une
 * tentative, par moyenne mobile exponentielle pondérée :
 *
 * - Le tout premier essai fixe directement le score (100 si correct, 0
 *   sinon) plutôt que de partir d'une moyenne artificiellement basse.
 * - Les essais suivants lissent le score existant vers le résultat de
 *   l'essai courant, avec un poids (alpha) plus fort tant que peu
 *   d'essais ont eu lieu (le score "bouge" plus facilement au début),
 *   puis plus stable une fois la compétence mieux évaluée.
 *
 * Fonction pure, sans accès DB — voir `progressService.ts` pour
 * l'orchestration (lecture/écriture de `competency_progress`).
 */
export function computeMasteryScore(
  previousScore: number,
  attemptsCount: number,
  wasCorrect: boolean
): number {
  const outcome = wasCorrect ? 100 : 0;

  if (attemptsCount === 0) {
    return outcome;
  }

  const alpha = attemptsCount < 5 ? 0.35 : 0.15;
  const newScore = previousScore + alpha * (outcome - previousScore);

  return Math.max(0, Math.min(100, Math.round(newScore)));
}
