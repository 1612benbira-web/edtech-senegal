import { describe, it, expect } from "vitest";
import { pickCurriculumForSeries } from "./programme";

// Régression du Bug 1 : un élève de Seconde S2 ne doit JAMAIS recevoir le
// curriculum de Mathématiques Seconde L2 (ou l'inverse), même si celui-ci
// a été créé/modifié plus récemment.
describe("pickCurriculumForSeries", () => {
  const mathsS2 = {
    id: "curriculum-s2",
    description: null,
    series_id: "serie-s2",
    created_at: "2026-01-01T00:00:00Z",
  };
  const mathsL2 = {
    id: "curriculum-l2",
    description: null,
    series_id: "serie-l2",
    created_at: "2026-06-01T00:00:00Z", // plus récent, mais mauvaise série
  };
  const francaisCommun = {
    id: "curriculum-francais",
    description: null,
    series_id: null,
    created_at: "2026-01-01T00:00:00Z",
  };

  it("choisit le curriculum de la série de l'élève, même si un autre est plus récent", () => {
    const result = pickCurriculumForSeries([mathsS2, mathsL2], "serie-s2");
    expect(result?.id).toBe("curriculum-s2");
  });

  it("choisit le curriculum de l'autre série pour un élève L2", () => {
    const result = pickCurriculumForSeries([mathsS2, mathsL2], "serie-l2");
    expect(result?.id).toBe("curriculum-l2");
  });

  it("retombe sur le curriculum commun (series_id null) quand aucun ne correspond à la série", () => {
    const result = pickCurriculumForSeries([francaisCommun], "serie-s2");
    expect(result?.id).toBe("curriculum-francais");
  });

  it("ne propose jamais un curriculum d'une série précise à un élève sans série", () => {
    const result = pickCurriculumForSeries([mathsS2, mathsL2], null);
    expect(result).toBeNull();
  });

  it("propose le curriculum commun à un élève sans série", () => {
    const result = pickCurriculumForSeries([mathsS2, francaisCommun], null);
    expect(result?.id).toBe("curriculum-francais");
  });

  it("retourne null quand aucun candidat ne correspond", () => {
    expect(pickCurriculumForSeries([], "serie-s2")).toBeNull();
  });
});
