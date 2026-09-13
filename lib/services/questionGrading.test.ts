import { describe, it, expect } from "vitest";
import { gradeQuestion, type QuestionOptionForGrading } from "./questionGrading";

const opt = (over: Partial<QuestionOptionForGrading>): QuestionOptionForGrading => ({
  id: "id",
  label: "",
  is_correct: false,
  match_key: null,
  order: null,
  ...over,
});

describe("gradeQuestion", () => {
  describe("single_choice / true_false", () => {
    const options = [
      opt({ id: "a", label: "Vrai", is_correct: true }),
      opt({ id: "b", label: "Faux", is_correct: false }),
    ];

    it("accepte la bonne option", () => {
      expect(gradeQuestion("single_choice", options, "a")).toBe(true);
    });

    it("rejette une mauvaise option", () => {
      expect(gradeQuestion("single_choice", options, "b")).toBe(false);
    });

    it("rejette une réponse vide", () => {
      expect(gradeQuestion("true_false", options, undefined)).toBe(false);
    });
  });

  describe("multiple_choice", () => {
    const options = [
      opt({ id: "a", is_correct: true }),
      opt({ id: "b", is_correct: true }),
      opt({ id: "c", is_correct: false }),
    ];

    it("accepte les bonnes options dans le désordre", () => {
      expect(gradeQuestion("multiple_choice", options, ["b", "a"])).toBe(true);
    });

    it("rejette une sélection incomplète", () => {
      expect(gradeQuestion("multiple_choice", options, ["a"])).toBe(false);
    });

    it("rejette une option en trop", () => {
      expect(gradeQuestion("multiple_choice", options, ["a", "b", "c"])).toBe(false);
    });

    it("gère une réponse non-tableau (undefined) sans planter", () => {
      expect(gradeQuestion("multiple_choice", options, undefined)).toBe(false);
    });
  });

  describe("numeric", () => {
    const options = [opt({ label: "3.5", is_correct: true })];

    it("accepte la valeur exacte", () => {
      expect(gradeQuestion("numeric", options, "3.5")).toBe(true);
    });

    it("accepte une virgule décimale (saisie FR)", () => {
      expect(gradeQuestion("numeric", options, "3,5")).toBe(true);
    });

    it("rejette une valeur incorrecte", () => {
      expect(gradeQuestion("numeric", options, "4")).toBe(false);
    });

    it("rejette une saisie non numérique sans planter", () => {
      expect(gradeQuestion("numeric", options, "abc")).toBe(false);
    });
  });

  describe("short_answer", () => {
    const options = [opt({ label: "Dakar", is_correct: true })];

    it("est insensible à la casse et aux espaces", () => {
      expect(gradeQuestion("short_answer", options, "  dakar  ")).toBe(true);
    });

    it("rejette une réponse différente", () => {
      expect(gradeQuestion("short_answer", options, "Thiès")).toBe(false);
    });
  });

  describe("ordering", () => {
    // Les options arrivent volontairement dans un ordre différent de
    // `order` pour vérifier qu'on trie bien avant de comparer.
    const options = [
      opt({ id: "c", order: 3 }),
      opt({ id: "a", order: 1 }),
      opt({ id: "b", order: 2 }),
    ];

    it("accepte la séquence correcte", () => {
      expect(gradeQuestion("ordering", options, ["a", "b", "c"])).toBe(true);
    });

    it("rejette une séquence incorrecte", () => {
      expect(gradeQuestion("ordering", options, ["a", "c", "b"])).toBe(false);
    });
  });

  describe("matching", () => {
    // Régression : question-grading suppose que `options` est déjà trié
    // par `order` par l'appelant (voir lib/queries/exercises.ts). Ici on
    // vérifie le comportement pour un ordre déjà correct — la garantie
    // d'ordre elle-même est assurée par la requête SQL, pas par cette
    // fonction.
    const options = [
      opt({ id: "a", label: "Capitale du Sénégal", match_key: "Dakar", order: 1 }),
      opt({ id: "b", label: "Capitale du Mali", match_key: "Bamako", order: 2 }),
    ];

    it("accepte les bonnes correspondances dans l'ordre", () => {
      expect(gradeQuestion("matching", options, ["Dakar", "Bamako"])).toBe(true);
    });

    it("rejette des correspondances inversées", () => {
      expect(gradeQuestion("matching", options, ["Bamako", "Dakar"])).toBe(false);
    });

    it("est insensible à la casse et aux espaces", () => {
      expect(gradeQuestion("matching", options, ["  dakar ", "bamako"])).toBe(true);
    });

    it("rejette une réponse partielle", () => {
      expect(gradeQuestion("matching", options, ["Dakar"])).toBe(false);
    });
  });
});
