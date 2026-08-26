export type DailyQuizReason =
  | "recent_lesson"
  | "weak_mastery"
  | "past_incorrect"
  | "due_review"
  | "harder_challenge"
  | "new_notion";

export interface CandidatePools {
  recentLesson: string[]; // ids de questions
  weakMastery: string[];
  pastIncorrect: string[];
  dueReview: string[];
  harderChallenge: string[];
  newNotion: string[];
}

export interface DailyQuizConfig {
  questionsCount: number;
  ratioRecent: number;
  ratioReview: number;
  ratioChallenge: number;
}

export interface SelectedQuestion {
  questionId: string;
  reason: DailyQuizReason;
}

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
 * Sélectionne les questions du quiz quotidien selon la priorité définie
 * dans le cahier des charges :
 *   1. Notions récemment étudiées
 *   2. Notions mal maîtrisées
 *   3. Questions précédemment incorrectes
 *   4. Notions nécessitant une révision (répétition espacée)
 *   5. Défi (difficulté supérieure)
 *   6. Nouvelles notions
 *
 * Fonction pure : reçoit des pools de candidats déjà résolus par la
 * couche d'accès aux données (voir dailyQuizService.ts), ne fait aucun
 * accès DB elle-même — facilite les tests unitaires et une évolution
 * future (IA, ML) sans toucher aux appelants.
 */
export function selectDailyQuizQuestions(
  pools: CandidatePools,
  config: DailyQuizConfig,
  alreadySeenQuestionIds: Set<string>
): SelectedQuestion[] {
  const selected: SelectedQuestion[] = [];
  const usedIds = new Set<string>();

  function takeFrom(pool: string[], reason: DailyQuizReason, count: number) {
    const candidates = shuffle(pool).filter(
      (id) => !usedIds.has(id) && !alreadySeenQuestionIds.has(id)
    );
    for (const id of candidates.slice(0, count)) {
      selected.push({ questionId: id, reason });
      usedIds.add(id);
    }
  }

  // Répartition principale selon les ratios configurés.
  takeFrom(pools.recentLesson, "recent_lesson", config.ratioRecent);
  const reviewSlots = config.ratioReview;
  const reviewHalf = Math.ceil(reviewSlots / 2);
  takeFrom(pools.weakMastery, "weak_mastery", reviewHalf);
  takeFrom(pools.dueReview, "due_review", reviewSlots);
  takeFrom(pools.pastIncorrect, "past_incorrect", reviewSlots);
  takeFrom(pools.harderChallenge, "harder_challenge", config.ratioChallenge);

  // Complète avec de nouvelles notions si les catégories prioritaires
  // n'ont pas suffi à atteindre le total demandé (cas fréquent tant que
  // l'élève a peu d'historique).
  const remaining = config.questionsCount - selected.length;
  if (remaining > 0) {
    takeFrom(pools.newNotion, "new_notion", remaining);
  }

  // Dernier recours : si même les nouvelles notions ne suffisent pas,
  // repuise dans les pools déjà utilisés en ignorant la contrainte
  // anti-répétition, plutôt que de renvoyer un quiz trop court.
  const stillRemaining = config.questionsCount - selected.length;
  if (stillRemaining > 0) {
    const everything = shuffle([
      ...pools.recentLesson,
      ...pools.newNotion,
      ...pools.pastIncorrect,
      ...pools.weakMastery,
      ...pools.dueReview,
      ...pools.harderChallenge,
    ]).filter((id) => !usedIds.has(id));
    for (const id of everything.slice(0, stillRemaining)) {
      selected.push({ questionId: id, reason: "new_notion" });
      usedIds.add(id);
    }
  }

  return shuffle(selected).slice(0, config.questionsCount);
}
