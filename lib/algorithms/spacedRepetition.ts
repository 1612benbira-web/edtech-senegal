/**
 * Abstraction du service de répétition espacée.
 * L'implémentation MVP est volontairement simple (intervalles fixes) ;
 * cette interface permet de la remplacer plus tard (ex. SM-2) sans
 * modifier les appelants (masteryScore.ts, dailyQuiz.ts).
 */
export interface SpacedRepetitionInput {
  wasCorrect: boolean;
  currentStreak: number; // nombre de réussites consécutives sur cette compétence
  lastIntervalDays: number;
}

export interface SpacedRepetitionResult {
  nextReviewAt: Date;
  newIntervalDays: number;
}

export interface SpacedRepetitionService {
  computeNextReview(input: SpacedRepetitionInput): SpacedRepetitionResult;
}

/**
 * Implémentation MVP — intervalles fixes définis dans le cahier des charges :
 *   Erreur                 -> +1 jour
 *   1ère réussite          -> +2 jours
 *   2 réussites d'affilée  -> +5 jours
 *   3+ réussites d'affilée -> +10 jours
 */
export const spacedRepetitionService: SpacedRepetitionService = {
  computeNextReview({ wasCorrect, currentStreak }) {
    let intervalDays: number;

    if (!wasCorrect) {
      intervalDays = 1;
    } else if (currentStreak <= 1) {
      intervalDays = 2;
    } else if (currentStreak === 2) {
      intervalDays = 5;
    } else {
      intervalDays = 10;
    }

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    return { nextReviewAt, newIntervalDays: intervalDays };
  },
};
