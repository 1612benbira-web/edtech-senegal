import { describe, it, expect } from "vitest";
import { computeMasteryScore } from "./masteryScore";

describe("computeMasteryScore", () => {
  it("fixe le score directement au premier essai (correct)", () => {
    expect(computeMasteryScore(0, 0, true)).toBe(100);
  });

  it("fixe le score directement au premier essai (incorrect)", () => {
    expect(computeMasteryScore(0, 0, false)).toBe(0);
  });

  it("garde un score élevé stable après plusieurs essais corrects", () => {
    let score = 100;
    for (let i = 1; i <= 3; i++) {
      score = computeMasteryScore(score, i, true);
    }
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it("fait baisser le score après une erreur, sans chute brutale à zéro", () => {
    const after = computeMasteryScore(100, 5, false);
    expect(after).toBeLessThan(100);
    expect(after).toBeGreaterThan(50);
  });

  it("reste toujours dans les bornes [0, 100]", () => {
    for (let i = 0; i < 50; i++) {
      const score = computeMasteryScore(Math.random() * 100, i, Math.random() > 0.5);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("est plus réactif tôt (peu d'essais) que tard (beaucoup d'essais)", () => {
    // Même écart entre score précédent et résultat, mais à des stades différents
    const earlyChange = Math.abs(computeMasteryScore(50, 2, true) - 50);
    const lateChange = Math.abs(computeMasteryScore(50, 10, true) - 50);
    expect(earlyChange).toBeGreaterThan(lateChange);
  });
});
