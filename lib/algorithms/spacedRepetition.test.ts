import { describe, it, expect } from "vitest";
import { spacedRepetitionService } from "./spacedRepetition";

describe("spacedRepetitionService.computeNextReview", () => {
  it("programme une révision demain en cas d'erreur", () => {
    const { newIntervalDays } = spacedRepetitionService.computeNextReview({
      wasCorrect: false,
      currentStreak: 3,
      lastIntervalDays: 10,
    });
    expect(newIntervalDays).toBe(1);
  });

  it("programme une révision dans 2 jours pour une première réussite", () => {
    const { newIntervalDays } = spacedRepetitionService.computeNextReview({
      wasCorrect: true,
      currentStreak: 0,
      lastIntervalDays: 0,
    });
    expect(newIntervalDays).toBe(2);
  });

  it("programme une révision dans 5 jours après 2 réussites d'affilée", () => {
    const { newIntervalDays } = spacedRepetitionService.computeNextReview({
      wasCorrect: true,
      currentStreak: 2,
      lastIntervalDays: 2,
    });
    expect(newIntervalDays).toBe(5);
  });

  it("programme une révision dans 10 jours après 3+ réussites d'affilée", () => {
    const { newIntervalDays } = spacedRepetitionService.computeNextReview({
      wasCorrect: true,
      currentStreak: 5,
      lastIntervalDays: 5,
    });
    expect(newIntervalDays).toBe(10);
  });

  it("renvoie une date future cohérente avec l'intervalle calculé", () => {
    const before = Date.now();
    const { nextReviewAt, newIntervalDays } = spacedRepetitionService.computeNextReview({
      wasCorrect: true,
      currentStreak: 0,
      lastIntervalDays: 0,
    });
    const expectedMs = before + newIntervalDays * 86400000;
    // Tolérance de quelques secondes pour le temps d'exécution du test
    expect(Math.abs(nextReviewAt.getTime() - expectedMs)).toBeLessThan(5000);
  });
});
