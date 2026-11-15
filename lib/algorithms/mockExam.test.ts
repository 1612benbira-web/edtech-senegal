import { describe, it, expect } from "vitest";
import {
  averageNote,
  examAppreciation,
  examDurationSeconds,
  examNote,
  examRemainingSeconds,
  formatCountdown,
  formatNote,
  isBfemLevel,
  isExamQuestionType,
  pickBalancedQuestions,
  summarizeByChapter,
  type ExamCandidate,
} from "./mockExam";

/** Générateur pseudo-aléatoire déterministe pour des tirages reproductibles. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function candidates(perChapter: Record<string, number>): ExamCandidate[] {
  return Object.entries(perChapter).flatMap(([chapterId, n]) =>
    Array.from({ length: n }, (_, i) => ({ id: `${chapterId}-q${i}`, chapterId }))
  );
}

describe("isBfemLevel", () => {
  it("reconnaît la 3e par son code ou son nom", () => {
    expect(isBfemLevel({ code: "3e", name: "3e" })).toBe(true);
    expect(isBfemLevel({ code: "niveau_x", name: "3ème" })).toBe(true);
    expect(isBfemLevel({ code: "3EME", name: null })).toBe(true);
    expect(isBfemLevel({ code: null, name: " 3 e " })).toBe(true);
  });

  it("refuse les autres niveaux", () => {
    expect(isBfemLevel({ code: "4e", name: "4e" })).toBe(false);
    expect(isBfemLevel({ code: "demo_6e", name: "[DEMO] 6e" })).toBe(false);
    expect(isBfemLevel({ code: "terminale", name: "Terminale" })).toBe(false);
    expect(isBfemLevel(null)).toBe(false);
  });
});

describe("isExamQuestionType", () => {
  it("exclut les types que l'écran d'épreuve n'affiche pas", () => {
    expect(isExamQuestionType("single_choice")).toBe(true);
    expect(isExamQuestionType("numeric")).toBe(true);
    expect(isExamQuestionType("matching")).toBe(false);
    expect(isExamQuestionType("ordering")).toBe(false);
  });
});

describe("pickBalancedQuestions", () => {
  it("tire le nombre demandé, sans doublon", () => {
    const picked = pickBalancedQuestions(candidates({ a: 30, b: 30, c: 30 }), 20, seededRandom(1));
    expect(picked).toHaveLength(20);
    expect(new Set(picked).size).toBe(20);
  });

  it("couvre tous les chapitres avant d'en reprendre un", () => {
    const picked = pickBalancedQuestions(
      candidates({ a: 50, b: 4, c: 4, d: 4, e: 4 }),
      10,
      seededRandom(7)
    );
    const perChapter = new Map<string, number>();
    for (const id of picked) {
      const chapter = id.split("-")[0] as string;
      perChapter.set(chapter, (perChapter.get(chapter) ?? 0) + 1);
    }
    expect(perChapter.size).toBe(5);
    expect(Math.max(...perChapter.values())).toBe(2);
  });

  it("complète avec les chapitres restants quand certains sont épuisés", () => {
    const picked = pickBalancedQuestions(candidates({ a: 1, b: 1, c: 10 }), 8, seededRandom(3));
    expect(picked).toHaveLength(8);
    expect(picked.filter((id) => id.startsWith("c-"))).toHaveLength(6);
  });

  it("renvoie tout ce qui existe quand il y a moins de questions que demandé", () => {
    const picked = pickBalancedQuestions(candidates({ a: 2, b: 1 }), 20, seededRandom(5));
    expect(picked).toHaveLength(3);
  });

  it("ignore les doublons d'entrée et accepte les questions sans chapitre", () => {
    const picked = pickBalancedQuestions(
      [
        { id: "q1", chapterId: null },
        { id: "q1", chapterId: null },
        { id: "q2", chapterId: "a" },
      ],
      5,
      seededRandom(9)
    );
    expect(picked.sort()).toEqual(["q1", "q2"]);
  });

  it("renvoie une liste vide sans candidat", () => {
    expect(pickBalancedQuestions([], 20)).toEqual([]);
  });
});

describe("durée et temps restant", () => {
  it("accorde 30 minutes pour 20 questions", () => {
    expect(examDurationSeconds(20)).toBe(1800);
  });

  it("calcule le temps restant à partir de l'heure de début", () => {
    const start = "2026-11-15T10:00:00.000Z";
    expect(examRemainingSeconds(start, 20, new Date("2026-11-15T10:00:00.000Z"))).toBe(1800);
    expect(examRemainingSeconds(start, 20, new Date("2026-11-15T10:10:30.000Z"))).toBe(1170);
  });

  it("ne descend jamais sous zéro une fois le temps écoulé", () => {
    const start = "2026-11-15T10:00:00.000Z";
    expect(examRemainingSeconds(start, 20, new Date("2026-11-15T11:00:00.000Z"))).toBe(0);
  });

  it("renvoie 0 pour une date de début invalide", () => {
    expect(examRemainingSeconds("pas une date", 20)).toBe(0);
  });

  it("formate le compte à rebours", () => {
    expect(formatCountdown(1800)).toBe("30:00");
    expect(formatCountdown(65)).toBe("01:05");
    expect(formatCountdown(-4)).toBe("00:00");
  });
});

describe("note sur 20", () => {
  it("donne un point par bonne réponse sur 20 questions", () => {
    expect(examNote(14, 20)).toBe(14);
    expect(examNote(20, 20)).toBe(20);
    expect(examNote(0, 20)).toBe(0);
  });

  it("arrondit au demi-point quand l'épreuve a moins de 20 questions", () => {
    expect(examNote(7, 12)).toBe(11.5);
    expect(examNote(5, 8)).toBe(12.5);
  });

  it("renvoie 0 pour une épreuve sans question", () => {
    expect(examNote(0, 0)).toBe(0);
  });

  it("écrit la note à la française", () => {
    expect(formatNote(14)).toBe("14");
    expect(formatNote(12.5)).toBe("12,5");
  });

  it("donne une appréciation selon la note", () => {
    expect(examAppreciation(17)).toBe("Très bien");
    expect(examAppreciation(14)).toBe("Bien");
    expect(examAppreciation(12.5)).toBe("Assez bien");
    expect(examAppreciation(10)).toBe("Passable");
    expect(examAppreciation(9.5)).toBe("À renforcer");
  });

  it("calcule une moyenne simple arrondie au demi-point", () => {
    expect(averageNote([12, 15, 9.5])).toBe(12);
    expect(averageNote([10, 13])).toBe(11.5);
    expect(averageNote([])).toBeNull();
  });
});

describe("summarizeByChapter", () => {
  it("regroupe par chapitre et place le moins réussi en premier", () => {
    const summary = summarizeByChapter([
      { chapterId: "a", chapterTitle: "Fractions", isCorrect: true },
      { chapterId: "a", chapterTitle: "Fractions", isCorrect: true },
      { chapterId: "b", chapterTitle: "Thalès", isCorrect: false },
      { chapterId: "b", chapterTitle: "Thalès", isCorrect: true },
      { chapterId: "c", chapterTitle: "Racines carrées", isCorrect: false },
    ]);
    expect(summary.map((s) => s.chapterTitle)).toEqual(["Racines carrées", "Thalès", "Fractions"]);
    expect(summary[1]).toMatchObject({ correct: 1, total: 2, percent: 50 });
  });
});
