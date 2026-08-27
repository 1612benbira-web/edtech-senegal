import { describe, it, expect } from "vitest";
import { parseAnswerData } from "./questionOptionsParser";

describe("parseAnswerData", () => {
  it("single_choice : identifie la bonne réponse préfixée par *", () => {
    const result = parseAnswerData("single_choice", "*Une moitié\nUn tiers\nUn quart");
    expect(result).toHaveLength(3);
    expect(result.find((o) => o.label === "Une moitié")?.is_correct).toBe(true);
    expect(result.find((o) => o.label === "Un tiers")?.is_correct).toBe(false);
  });

  it("multiple_choice : identifie plusieurs bonnes réponses", () => {
    const result = parseAnswerData("multiple_choice", "*Paris\nLondres\n*Berlin");
    const correct = result.filter((o) => o.is_correct).map((o) => o.label);
    expect(correct).toEqual(["Paris", "Berlin"]);
  });

  it("true_false : génère deux options Vrai/Faux, correcte selon la ligne saisie", () => {
    const result = parseAnswerData("true_false", "vrai");
    expect(result).toHaveLength(2);
    expect(result.find((o) => o.label === "Vrai")?.is_correct).toBe(true);
    expect(result.find((o) => o.label === "Faux")?.is_correct).toBe(false);
  });

  it("numeric : renvoie une seule option avec la valeur correcte", () => {
    const result = parseAnswerData("numeric", "0.5");
    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("0.5");
    expect(result[0]!.is_correct).toBe(true);
  });

  it("short_answer : toutes les lignes sont des réponses acceptées", () => {
    const result = parseAnswerData("short_answer", "Dakar\nDAKAR\ndakar");
    expect(result).toHaveLength(3);
    expect(result.every((o) => o.is_correct)).toBe(true);
  });

  it("matching : sépare gauche et droite avec =>", () => {
    const result = parseAnswerData("matching", "Chat => Miaou\nChien => Aboiement");
    expect(result[0]).toMatchObject({ label: "Chat", match_key: "Miaou", order: 0 });
    expect(result[1]).toMatchObject({ label: "Chien", match_key: "Aboiement", order: 1 });
  });

  it("ordering : assigne un ordre croissant selon les lignes", () => {
    const result = parseAnswerData("ordering", "Premier\nDeuxième\nTroisième");
    expect(result.map((o) => o.order)).toEqual([1, 2, 3]);
  });

  it("ignore les lignes vides", () => {
    const result = parseAnswerData("single_choice", "*A\n\n\nB\n");
    expect(result).toHaveLength(2);
  });
});
