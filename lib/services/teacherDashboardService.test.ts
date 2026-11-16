import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeQueryChain } from "@/lib/test-utils/supabase-mocks";

type Result = { data: unknown; error: unknown };

const h = vi.hoisted(() => ({
  tables: {} as Record<string, { data: unknown; error: unknown }>,
  chains: {} as Record<string, any[]>,
  createServiceRoleClient: vi.fn(),
  getCurrentSchool: vi.fn(),
  requireTeacherAccess: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  createServiceRoleClient: h.createServiceRoleClient,
}));
vi.mock("@/lib/services/schoolService", () => ({ getCurrentSchool: h.getCurrentSchool }));
vi.mock("@/lib/services/adminGuard", () => ({
  NotTeacherError: class NotTeacherError extends Error {},
  requireTeacherAccess: h.requireTeacherAccess,
}));
import { getTeacherClassOverview } from "./teacherDashboardService";

const ASSIGNMENT = {
  id: "a1",
  subject_id: "maths",
  level_id: "3e",
  series_id: null,
  subjects: { name: "Mathématiques" },
  school_levels: { name: "3e" },
  school_series: null,
};

function setTables(tables: Record<string, Result>) {
  h.tables = tables;
  h.chains = {};
}

beforeEach(() => {
  vi.clearAllMocks();
  h.getCurrentSchool.mockResolvedValue({ schoolId: "school1", schoolName: "École", role: "teacher" });
  h.requireTeacherAccess.mockResolvedValue({ assignments: [ASSIGNMENT] });
  h.createServiceRoleClient.mockReturnValue({
    from: (table: string) => {
      const chain = makeQueryChain(h.tables[table] ?? { data: [], error: null });
      (h.chains[table] ??= []).push(chain);
      return chain;
    },
  });
  setTables({
    school_members: { data: [{ profile_id: "awa" }, { profile_id: "moussa" }], error: null },
    profiles: {
      data: [
        { id: "awa", first_name: "Awa", last_name: "Diop", level_id: "3e", series_id: null, last_seen_at: new Date().toISOString() },
        { id: "moussa", first_name: "Moussa", last_name: "Ba", level_id: "3e", series_id: null, last_seen_at: null },
      ],
      error: null,
    },
    curriculums: {
      data: [
        { id: "national", title: "Maths 3e national", description: null, series_id: null, created_at: "2026-01-01", school_id: null },
        { id: "ecole", title: "Maths 3e de l'école", description: null, series_id: null, created_at: "2025-01-01", school_id: "school1" },
        { id: "autre", title: "Maths 3e autre école", description: null, series_id: null, created_at: "2026-06-01", school_id: "school2" },
      ],
      error: null,
    },
    chapters: { data: [{ id: "ch1" }], error: null },
    lessons: { data: [{ id: "l1" }, { id: "l2" }], error: null },
    domains: { data: [{ id: "d1" }], error: null },
    competencies: { data: [{ id: "c1", name: "Fractions" }], error: null },
    lesson_progress: {
      data: [
        { profile_id: "awa", lesson_id: "l1" },
        { profile_id: "awa", lesson_id: "leçon-d-une-autre-matière" },
      ],
      error: null,
    },
    quiz_attempts: {
      data: [
        { profile_id: "awa", score: 80, subject_id: "maths", chapter_id: null },
        { profile_id: "awa", score: 40, subject_id: null, chapter_id: "ch1" },
        { profile_id: "awa", score: 0, subject_id: "francais", chapter_id: null },
        { profile_id: "awa", score: 10, subject_id: null, chapter_id: null },
      ],
      error: null,
    },
    competency_progress: {
      data: [
        { profile_id: "awa", competency_id: "c1", mastery_score: 30, attempts_count: 2 },
        { profile_id: "awa", competency_id: "autre-matière", mastery_score: 5, attempts_count: 9 },
      ],
      error: null,
    },
  });
});

describe("getTeacherClassOverview", () => {
  it("refuse une affectation qui n'est pas celle de l'enseignant, sans lire aucune donnée", async () => {
    expect(await getTeacherClassOverview("affectation-d-un-autre")).toBeNull();
    expect(h.createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("vérifie l'enseignant avec sa session avant d'utiliser le client service_role", async () => {
    h.requireTeacherAccess.mockRejectedValue(new Error("NOT_TEACHER"));
    await expect(getTeacherClassOverview("a1")).rejects.toThrow("NOT_TEACHER");
    expect(h.createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("borne les élèves à l'école et au niveau de l'affectation", async () => {
    await getTeacherClassOverview("a1");
    const members = h.chains.school_members?.[0];
    expect(members.eq).toHaveBeenCalledWith("school_id", "school1");
    expect(members.eq).toHaveBeenCalledWith("role", "student");
    expect(members.eq).toHaveBeenCalledWith("status", "active");
    expect(h.chains.profiles?.[0].eq).toHaveBeenCalledWith("level_id", "3e");
    expect(h.chains.lesson_progress?.[0].in).toHaveBeenCalledWith("profile_id", ["awa", "moussa"]);
  });

  it("suit le programme de l'école plutôt que le national, jamais celui d'une autre école", async () => {
    const overview = await getTeacherClassOverview("a1");
    expect(overview?.curriculumTitle).toBe("Maths 3e de l'école");
    expect(h.chains.chapters?.[0].eq).toHaveBeenCalledWith("curriculum_id", "ecole");
  });

  it("ne compte que les leçons, quiz et notions de la matière", async () => {
    const overview = await getTeacherClassOverview("a1");
    const awa = overview?.students.find((s) => s.id === "awa");
    expect(overview?.totalLessons).toBe(2);
    expect(awa).toMatchObject({ completedLessons: 1, progressPercent: 50, quizCount: 2, quizAverage: 60, masteryAverage: 30 });
    expect(overview?.weakNotions).toEqual([
      { competencyId: "c1", name: "Fractions", averageMastery: 30, studentCount: 1 },
    ]);
    expect(overview?.students.find((s) => s.id === "moussa")).toMatchObject({ inactive: true, quizAverage: null });
  });

  it("écarte les élèves d'une autre série quand l'affectation porte sur une série", async () => {
    h.requireTeacherAccess.mockResolvedValue({ assignments: [{ ...ASSIGNMENT, series_id: "s2" }] });
    h.tables.profiles = {
      data: [
        { id: "awa", first_name: "Awa", last_name: "Diop", level_id: "3e", series_id: "s2", last_seen_at: null },
        { id: "moussa", first_name: "Moussa", last_name: "Ba", level_id: "3e", series_id: "l2", last_seen_at: null },
      ],
      error: null,
    };
    const overview = await getTeacherClassOverview("a1");
    expect(overview?.students.map((s) => s.id)).toEqual(["awa"]);
  });

  it("sans programme publié : la classe s'affiche, sans progression", async () => {
    h.tables.curriculums = { data: [], error: null };
    const overview = await getTeacherClassOverview("a1");
    expect(overview).toMatchObject({ curriculumTitle: null, totalLessons: 0, studentCount: 2, averageProgress: 0 });
    expect(h.chains.chapters).toBeUndefined();
  });
});
