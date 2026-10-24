import { describe, it, expect } from "vitest";
import { assignmentCoversCurriculum, teacherCurriculumAccess, canTeacherSetStatus } from "./teacher-scope";

const A = { subject_id: "m", level_id: "t", series_id: null };
const AS2 = { subject_id: "m", level_id: "t", series_id: "s2" };
const cur = (o: object = {}) => ({ subject_id: "m", level_id: "t", series_id: null, school_id: "ecole1", status: "draft", ...o });

describe("assignmentCoversCurriculum", () => {
  it("couvre même matière+niveau", () => expect(assignmentCoversCurriculum([A], cur())).toBe(true));
  it("refuse une autre matière", () => expect(assignmentCoversCurriculum([A], cur({ subject_id: "x" }))).toBe(false));
  it("refuse un autre niveau", () => expect(assignmentCoversCurriculum([A], cur({ level_id: "x" }))).toBe(false));
  it("affectation sans série couvre toute série", () => expect(assignmentCoversCurriculum([A], cur({ series_id: "s1" }))).toBe(true));
  it("affectation S2 ne couvre pas S1", () => expect(assignmentCoversCurriculum([AS2], cur({ series_id: "s1" }))).toBe(false));
  it("affectation S2 couvre un programme commun (sans série), comme la RLS", () =>
    expect(assignmentCoversCurriculum([AS2], cur())).toBe(true));
  it("aucune affectation = aucun accès", () => expect(assignmentCoversCurriculum([], cur())).toBe(false));
});

describe("teacherCurriculumAccess", () => {
  it("édition sur programme de son école", () => expect(teacherCurriculumAccess("ecole1", [A], cur())).toBe("edit"));
  it("jamais sur le programme d'une autre école", () => expect(teacherCurriculumAccess("ecole1", [A], cur({ school_id: "ecole2" }))).toBe("none"));
  it("lecture seule sur national publié", () => expect(teacherCurriculumAccess("ecole1", [A], cur({ school_id: null, status: "published" }))).toBe("read"));
  it("national non publié refusé", () => expect(teacherCurriculumAccess("ecole1", [A], cur({ school_id: null }))).toBe("none"));
  it("hors périmètre refusé même dans son école", () => expect(teacherCurriculumAccess("ecole1", [A], cur({ subject_id: "x" }))).toBe("none"));
});

describe("canTeacherSetStatus", () => {
  it("autorise brouillon, révision, archivé", () => {
    for (const s of ["draft", "review", "archived"]) expect(canTeacherSetStatus(s)).toBe(true);
  });
  it("refuse publier et valider (réservés au responsable)", () => {
    for (const s of ["published", "validated", "n'importe quoi"]) expect(canTeacherSetStatus(s)).toBe(false);
  });
});
