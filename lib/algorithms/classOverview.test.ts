import { describe, it, expect } from "vitest";
import { buildClassOverview, daysSince, studentDisplayName, type ClassOverviewInput } from "./classOverview";

const NOW = new Date("2026-11-15T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

function input(overrides: Partial<ClassOverviewInput> = {}): ClassOverviewInput {
  return {
    students: [
      { id: "awa", firstName: "Awa", lastName: "Diop", lastSeenAt: daysAgo(1) },
      { id: "moussa", firstName: "Moussa", lastName: "Ba", lastSeenAt: daysAgo(10) },
      { id: "fatou", firstName: "Fatou", lastName: "Sow", lastSeenAt: null },
    ],
    totalLessons: 10,
    completedLessons: [],
    quizScores: [],
    mastery: [],
    now: NOW,
    ...overrides,
  };
}

describe("buildClassOverview", () => {
  it("calcule la progression de chaque élève et la moyenne de la classe", () => {
    const overview = buildClassOverview(
      input({
        completedLessons: [
          ...["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"].map((lessonId) => ({ profileId: "awa", lessonId })),
          { profileId: "moussa", lessonId: "l1" },
          { profileId: "moussa", lessonId: "l2" },
        ],
      })
    );
    const byId = Object.fromEntries(overview.students.map((s) => [s.id, s]));
    expect(byId.awa).toMatchObject({ completedLessons: 8, progressPercent: 80 });
    expect(byId.moussa).toMatchObject({ completedLessons: 2, progressPercent: 20 });
    expect(byId.fatou).toMatchObject({ completedLessons: 0, progressPercent: 0 });
    expect(overview.averageProgress).toBe(33);
  });

  it("ne compte une leçon qu'une fois et ignore les élèves hors de la classe", () => {
    const overview = buildClassOverview(
      input({
        completedLessons: [
          { profileId: "awa", lessonId: "l1" },
          { profileId: "awa", lessonId: "l1" },
          { profileId: "inconnu", lessonId: "l1" },
        ],
        quizScores: [{ profileId: "inconnu", score: 100 }],
      })
    );
    expect(overview.students.find((s) => s.id === "awa")?.completedLessons).toBe(1);
    expect(overview.averageQuizScore).toBeNull();
  });

  it("place en premier les élèves qui ont le moins avancé", () => {
    const overview = buildClassOverview(
      input({ completedLessons: [{ profileId: "fatou", lessonId: "l1" }] })
    );
    expect(overview.students.map((s) => s.id)).toEqual(["awa", "moussa", "fatou"]);
  });

  it("signale inactif un élève absent depuis 7 jours ou jamais connecté", () => {
    const overview = buildClassOverview(input());
    const byId = Object.fromEntries(overview.students.map((s) => [s.id, s]));
    expect(byId.awa).toMatchObject({ inactive: false, daysSinceSeen: 1 });
    expect(byId.moussa).toMatchObject({ inactive: true, daysSinceSeen: 10 });
    expect(byId.fatou).toMatchObject({ inactive: true, daysSinceSeen: null });
    expect(overview).toMatchObject({ studentCount: 3, activeCount: 1, inactiveCount: 2 });
  });

  it("calcule les moyennes de quiz par élève et pour la classe", () => {
    const overview = buildClassOverview(
      input({
        quizScores: [
          { profileId: "awa", score: 80 },
          { profileId: "awa", score: 60 },
          { profileId: "moussa", score: 40 },
        ],
      })
    );
    const byId = Object.fromEntries(overview.students.map((s) => [s.id, s]));
    expect(byId.awa).toMatchObject({ quizCount: 2, quizAverage: 70 });
    expect(byId.moussa).toMatchObject({ quizCount: 1, quizAverage: 40 });
    expect(byId.fatou).toMatchObject({ quizCount: 0, quizAverage: null });
    expect(overview.averageQuizScore).toBe(60);
  });

  it("liste les notions les moins maîtrisées, la plus faible en premier", () => {
    const overview = buildClassOverview(
      input({
        mastery: [
          { profileId: "awa", competencyId: "c1", competencyName: "Fractions", masteryScore: 30, attemptsCount: 4 },
          { profileId: "moussa", competencyId: "c1", competencyName: "Fractions", masteryScore: 50, attemptsCount: 2 },
          { profileId: "awa", competencyId: "c2", competencyName: "Thalès", masteryScore: 20, attemptsCount: 3 },
          { profileId: "awa", competencyId: "c3", competencyName: "Statistiques", masteryScore: 90, attemptsCount: 5 },
        ],
      })
    );
    expect(overview.weakNotions).toEqual([
      { competencyId: "c2", name: "Thalès", averageMastery: 20, studentCount: 1 },
      { competencyId: "c1", name: "Fractions", averageMastery: 40, studentCount: 2 },
    ]);
    expect(overview.students.find((s) => s.id === "awa")?.masteryAverage).toBe(47);
  });

  it("ignore les notions jamais travaillées (aucune tentative)", () => {
    const overview = buildClassOverview(
      input({
        mastery: [
          { profileId: "awa", competencyId: "c1", competencyName: "Fractions", masteryScore: 0, attemptsCount: 0 },
        ],
      })
    );
    expect(overview.weakNotions).toEqual([]);
    expect(overview.students.find((s) => s.id === "awa")?.masteryAverage).toBeNull();
  });

  it("garde au plus cinq notions à retravailler", () => {
    const mastery = Array.from({ length: 8 }, (_, i) => ({
      profileId: "awa",
      competencyId: `c${i}`,
      competencyName: `Notion ${i}`,
      masteryScore: 10 + i,
      attemptsCount: 1,
    }));
    expect(buildClassOverview(input({ mastery })).weakNotions).toHaveLength(5);
  });

  it("gère une classe vide et un programme sans leçon", () => {
    const empty = buildClassOverview(input({ students: [] }));
    expect(empty).toMatchObject({ studentCount: 0, averageProgress: 0, averageQuizScore: null, students: [] });
    const noLessons = buildClassOverview(
      input({ totalLessons: 0, completedLessons: [{ profileId: "awa", lessonId: "l1" }] })
    );
    expect(noLessons.students.every((s) => s.progressPercent === 0)).toBe(true);
  });
});

describe("utilitaires", () => {
  it("compte les jours écoulés", () => {
    expect(daysSince(daysAgo(3), NOW)).toBe(3);
    expect(daysSince(null, NOW)).toBeNull();
    expect(daysSince("pas une date", NOW)).toBeNull();
  });

  it("construit un nom d'affichage", () => {
    expect(studentDisplayName("Awa", "Diop")).toBe("Awa Diop");
    expect(studentDisplayName(" Awa ", null)).toBe("Awa");
    expect(studentDisplayName(null, null)).toBe("Élève sans nom");
  });
});
