import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeQueryChain } from "@/lib/test-utils/supabase-mocks";

type Result = { data: unknown; error: unknown };

const mocks = vi.hoisted(() => ({
  tables: {} as Record<string, { data: unknown; error: unknown }>,
  chains: {} as Record<string, any[]>,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => {
      const chain = makeQueryChain(mocks.tables[table] ?? { data: [], error: null });
      (mocks.chains[table] ??= []).push(chain);
      return chain;
    },
  })),
  createServiceRoleClient: vi.fn(),
}));

import { describeAnswer, generateMockExam } from "./examService";

function setTables(tables: Record<string, Result>) {
  mocks.tables = tables;
  mocks.chains = {};
}

const CONTENT: Record<string, Result> = {
  curriculums: { data: [{ id: "cur1" }], error: null },
  chapters: { data: [{ id: "ch1" }], error: null },
  lessons: { data: [{ id: "l1", chapter_id: "ch1" }], error: null },
  exercises: { data: [{ id: "e1", lesson_id: "l1" }], error: null },
  questions: {
    data: [
      { id: "q1", type: "single_choice", exercise_id: "e1" },
      { id: "q2", type: "matching", exercise_id: "e1" },
      { id: "q3", type: "numeric", exercise_id: "e1" },
    ],
    error: null,
  },
};

describe("generateMockExam", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("signale l'absence de questions sans créer d'épreuve", async () => {
    setTables({ curriculums: { data: [], error: null } });
    const result = await generateMockExam("p1", "s1", "lvl1");
    expect(result).toEqual({ ok: false, reason: "no_questions" });
    expect(mocks.chains.quiz_attempts).toBeUndefined();
  });

  it("crée l'épreuve avec les seules questions affichables", async () => {
    setTables({
      ...CONTENT,
      quiz_attempts: { data: { id: "exam1" }, error: null },
      quiz_questions: { data: null, error: null },
    });
    const result = await generateMockExam("p1", "s1", "lvl1");
    expect(result).toEqual({ ok: true, examId: "exam1" });

    expect(mocks.chains.quiz_attempts?.[0].insert).toHaveBeenCalledWith({
      profile_id: "p1",
      type: "exam",
      subject_id: "s1",
      total_questions: 2,
    });
    const rows = mocks.chains.quiz_questions?.[0].insert.mock.calls[0][0] as {
      quiz_attempt_id: string;
      question_id: string;
      order: number;
    }[];
    expect(rows.map((r) => r.question_id).sort()).toEqual(["q1", "q3"]);
    expect(rows.map((r) => r.order)).toEqual([1, 2]);
    expect(rows.every((r) => r.quiz_attempt_id === "exam1")).toBe(true);
  });

  it("répond « indisponible » tant que la migration 0031 n'est pas appliquée", async () => {
    setTables({ ...CONTENT, quiz_attempts: { data: null, error: { code: "23514" } } });
    const result = await generateMockExam("p1", "s1", "lvl1");
    expect(result).toEqual({ ok: false, reason: "unavailable" });
    expect(mocks.chains.quiz_questions).toBeUndefined();
  });

  it("retire la tentative si ses questions n'ont pas pu être enregistrées", async () => {
    setTables({
      ...CONTENT,
      quiz_attempts: { data: { id: "exam1" }, error: null },
      quiz_questions: { data: null, error: { code: "XX000", message: "boom" } },
    });
    await expect(generateMockExam("p1", "s1", "lvl1")).rejects.toMatchObject({ code: "XX000" });
    const cleanup = mocks.chains.quiz_attempts?.[1];
    expect(cleanup.delete).toHaveBeenCalled();
    expect(cleanup.eq).toHaveBeenCalledWith("id", "exam1");
  });
});

describe("describeAnswer", () => {
  const options = [
    { id: "o1", label: "Paris" },
    { id: "o2", label: "Dakar" },
  ];

  it("traduit un identifiant d'option en libellé", () => {
    expect(describeAnswer("o2", options)).toBe("Dakar");
  });

  it("traduit une liste d'options", () => {
    expect(describeAnswer(["o1", "o2"], options)).toBe("Paris, Dakar");
  });

  it("garde le texte libre tel quel", () => {
    expect(describeAnswer(" 3,5 ", options)).toBe("3,5");
  });

  it("renvoie null quand il n'y a pas de réponse", () => {
    expect(describeAnswer(null, options)).toBeNull();
    expect(describeAnswer("", options)).toBeNull();
    expect(describeAnswer([], options)).toBeNull();
  });
});
