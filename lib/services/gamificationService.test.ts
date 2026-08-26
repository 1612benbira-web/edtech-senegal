import { describe, it, expect } from "vitest";
import { isConsecutiveDay } from "./gamificationService";

describe("isConsecutiveDay", () => {
  it("reconnaît deux jours consécutifs", () => {
    expect(isConsecutiveDay("2026-08-22", "2026-08-23")).toBe(true);
  });

  it("rejette un écart de plusieurs jours", () => {
    expect(isConsecutiveDay("2026-08-20", "2026-08-23")).toBe(false);
  });

  it("gère correctement un changement de mois", () => {
    expect(isConsecutiveDay("2026-08-31", "2026-09-01")).toBe(true);
  });

  it("gère correctement un changement d'année", () => {
    expect(isConsecutiveDay("2026-12-31", "2027-01-01")).toBe(true);
  });

  it("rejette le même jour (ne compte pas comme +1)", () => {
    expect(isConsecutiveDay("2026-08-23", "2026-08-23")).toBe(false);
  });

  it("gère une année bissextile (29 février)", () => {
    // 2028 est bissextile
    expect(isConsecutiveDay("2028-02-28", "2028-02-29")).toBe(true);
    expect(isConsecutiveDay("2028-02-29", "2028-03-01")).toBe(true);
  });
});
