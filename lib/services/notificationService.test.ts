import { describe, it, expect } from "vitest";
import { decideNextQuizNotificationType } from "./notificationService";

const NOW = new Date("2026-09-02T18:00:00.000Z");

function hoursAgo(hours: number): string {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000).toISOString();
}

describe("decideNextQuizNotificationType", () => {
  it("AC-01 : élève sans aucune notification -> notification initiale", () => {
    expect(decideNextQuizNotificationType([], NOW)).toBe("QUIZ_DAILY_AVAILABLE");
  });

  it("ne renvoie pas de rappel si la notification initiale est trop récente (anti-spam)", () => {
    const existing = [{ type: "QUIZ_DAILY_AVAILABLE", created_at: hoursAgo(0.5) }];
    expect(decideNextQuizNotificationType(existing, NOW)).toBeNull();
  });

  it("renvoie un rappel si la notification initiale date de plus de 2h", () => {
    const existing = [{ type: "QUIZ_DAILY_AVAILABLE", created_at: hoursAgo(3) }];
    expect(decideNextQuizNotificationType(existing, NOW)).toBe("QUIZ_DAILY_REMINDER");
  });

  it("AC-03 : après 1 initiale + 1 rappel déjà envoyés, plus aucune notification (même après de nombreux passages du job)", () => {
    const existing = [
      { type: "QUIZ_DAILY_AVAILABLE", created_at: hoursAgo(10) },
      { type: "QUIZ_DAILY_REMINDER", created_at: hoursAgo(4) },
    ];
    for (let i = 0; i < 10; i++) {
      expect(decideNextQuizNotificationType(existing, NOW)).toBeNull();
    }
  });

  it("ne redemande jamais l'initiale si elle a déjà été envoyée, même juste après", () => {
    const existing = [{ type: "QUIZ_DAILY_AVAILABLE", created_at: hoursAgo(0.01) }];
    expect(decideNextQuizNotificationType(existing, NOW)).not.toBe("QUIZ_DAILY_AVAILABLE");
  });
});
