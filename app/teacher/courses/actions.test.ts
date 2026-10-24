import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireTeacherAccess } = vi.hoisted(() => ({ requireTeacherAccess: vi.fn() }));
vi.mock("@/lib/services/adminGuard", () => ({ requireTeacherAccess }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { updateTeacherChapterStatusAction, updateTeacherLessonStatusAction } from "./actions";

const UUID = "11111111-1111-4111-8111-111111111111";
const fd = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };

beforeEach(() => vi.clearAllMocks());

describe("publication réservée au responsable d'établissement", () => {
  for (const status of ["published", "validated"]) {
    it(`refuse « ${status} » pour une leçon, sans toucher à la base`, async () => {
      const r = await updateTeacherLessonStatusAction(null, fd({ schoolId: UUID, lessonId: UUID, status }));
      expect(r?.error).toContain("responsable de l'établissement");
      expect(requireTeacherAccess).not.toHaveBeenCalled();
    });
    it(`refuse « ${status} » pour un chapitre, sans toucher à la base`, async () => {
      const r = await updateTeacherChapterStatusAction(null, fd({ schoolId: UUID, chapterId: UUID, status }));
      expect(r?.error).toContain("responsable de l'établissement");
      expect(requireTeacherAccess).not.toHaveBeenCalled();
    });
  }

  it("laisse passer « review » jusqu'au contrôle d'accès", async () => {
    requireTeacherAccess.mockRejectedValue(new Error("STOP"));
    const r = await updateTeacherLessonStatusAction(null, fd({ schoolId: UUID, lessonId: UUID, status: "review" }));
    expect(requireTeacherAccess).toHaveBeenCalledTimes(1);
    expect(r?.error).toBe("STOP");
  });
});
