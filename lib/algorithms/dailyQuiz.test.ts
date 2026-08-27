import { describe, it, expect } from "vitest";
import { selectDailyQuizQuestions } from "./dailyQuiz";

describe("selectDailyQuizQuestions", () => {
  it("sélectionne le nombre de questions demandé quand assez de nouvelles notions sont disponibles", () => {
    const result = selectDailyQuizQuestions(
      {
        recentLesson: [],
        weakMastery: [],
        pastIncorrect: [],
        dueReview: [],
        harderChallenge: [],
        newNotion: Array.from({ length: 10 }, (_, i) => `q${i}`),
      },
      { questionsCount: 8, ratioRecent: 5, ratioReview: 2, ratioChallenge: 1 },
      new Set()
    );
    expect(result).toHaveLength(8);
  });

  it("exclut les questions déjà vues récemment (anti-répétition)", () => {
    const result = selectDailyQuizQuestions(
      {
        recentLesson: ["q1", "q2"],
        weakMastery: [],
        pastIncorrect: [],
        dueReview: [],
        harderChallenge: [],
        newNotion: ["q3", "q4", "q5", "q6", "q7", "q8"],
      },
      { questionsCount: 5, ratioRecent: 5, ratioReview: 2, ratioChallenge: 1 },
      new Set(["q1"])
    );
    expect(result.some((r) => r.questionId === "q1")).toBe(false);
  });

  it("ne plante pas et renvoie ce qui est disponible en cas de pénurie de questions", () => {
    const result = selectDailyQuizQuestions(
      {
        recentLesson: [],
        weakMastery: [],
        pastIncorrect: [],
        dueReview: [],
        harderChallenge: [],
        newNotion: ["q1"],
      },
      { questionsCount: 8, ratioRecent: 5, ratioReview: 2, ratioChallenge: 1 },
      new Set()
    );
    expect(result).toHaveLength(1);
  });

  it("renvoie un tableau vide si aucun candidat n'est disponible", () => {
    const result = selectDailyQuizQuestions(
      {
        recentLesson: [],
        weakMastery: [],
        pastIncorrect: [],
        dueReview: [],
        harderChallenge: [],
        newNotion: [],
      },
      { questionsCount: 8, ratioRecent: 5, ratioReview: 2, ratioChallenge: 1 },
      new Set()
    );
    expect(result).toHaveLength(0);
  });

  it("ne renvoie jamais de doublon de question", () => {
    const result = selectDailyQuizQuestions(
      {
        recentLesson: ["q1", "q2", "q3"],
        weakMastery: ["q2", "q3"], // chevauchement volontaire avec recentLesson
        pastIncorrect: ["q1"], // chevauchement volontaire
        dueReview: [],
        harderChallenge: [],
        newNotion: ["q4", "q5"],
      },
      { questionsCount: 8, ratioRecent: 5, ratioReview: 2, ratioChallenge: 1 },
      new Set()
    );
    const ids = result.map((r) => r.questionId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("respecte la limite questionsCount même avec beaucoup de candidats", () => {
    const result = selectDailyQuizQuestions(
      {
        recentLesson: Array.from({ length: 20 }, (_, i) => `recent${i}`),
        weakMastery: Array.from({ length: 20 }, (_, i) => `weak${i}`),
        pastIncorrect: Array.from({ length: 20 }, (_, i) => `wrong${i}`),
        dueReview: Array.from({ length: 20 }, (_, i) => `due${i}`),
        harderChallenge: Array.from({ length: 20 }, (_, i) => `hard${i}`),
        newNotion: Array.from({ length: 20 }, (_, i) => `new${i}`),
      },
      { questionsCount: 8, ratioRecent: 5, ratioReview: 2, ratioChallenge: 1 },
      new Set()
    );
    expect(result.length).toBeLessThanOrEqual(8);
  });
});
