"use server";

import { revalidatePath } from "next/cache";
import { requireTeacherAccess } from "@/lib/services/adminGuard";
import { teacherCurriculumAccess } from "@/lib/utils/teacher-scope";
import { chapterSchema, chapterStatusSchema, lessonSchema, lessonStatusSchema } from "@/lib/validations/curriculum";
import { z } from "zod";

export type ActionState = { error?: string; fieldErrors?: Record<string, string>; success?: boolean; message?: string } | null;

function fail(issues: z.ZodIssue[]): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const i of issues) fieldErrors[String(i.path[0])] = i.message;
  return { fieldErrors };
}

const NOT_ALLOWED = "Ce contenu n'existe pas, ou ne fait pas partie d'un programme de ton école qui t'est confié.";

/**
 * Garde commune : l'enseignant doit être membre actif de `schoolId`, et le
 * programme doit appartenir à CETTE école ET entrer dans ses affectations.
 * (la RLS 0026 reste le rempart final ; ceci donne un message clair et
 * constitue une défense en profondeur.)
 */
async function assertCanEdit(schoolId: string, curriculumId: string) {
  const { supabase, assignments } = await requireTeacherAccess(schoolId);
  const { data: c } = await supabase
    .from("curriculums")
    .select("school_id, status, subject_id, level_id, series_id")
    .eq("id", curriculumId)
    .maybeSingle();
  if (!c || teacherCurriculumAccess(schoolId, assignments, c as any) !== "edit") throw new Error(NOT_ALLOWED);
  return supabase;
}

async function curriculumOfChapter(supabase: any, chapterId: string): Promise<string> {
  const { data } = await supabase.from("chapters").select("curriculum_id").eq("id", chapterId).maybeSingle();
  if (!data) throw new Error(NOT_ALLOWED);
  return data.curriculum_id;
}

async function curriculumOfLesson(supabase: any, lessonId: string): Promise<string> {
  const { data } = await supabase.from("lessons").select("chapters(curriculum_id)").eq("id", lessonId).maybeSingle();
  const id = data?.chapters?.curriculum_id;
  if (!id) throw new Error(NOT_ALLOWED);
  return id;
}

const schoolOf = (fd: FormData) => String(fd.get("schoolId") ?? "");
const paths = (curriculumId?: string) => {
  revalidatePath("/teacher/courses");
  if (curriculumId) revalidatePath(`/teacher/courses/${curriculumId}`, "layout");
};
const toObjectives = (s?: string) => (s ? s.split("\n").map((x) => x.trim()).filter(Boolean) : null);

// ---------- Chapitres ----------
export async function createTeacherChapterAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const schoolId = schoolOf(fd);
    const parsed = chapterSchema.safeParse({
      curriculumId: fd.get("curriculumId"), title: fd.get("title"), order: fd.get("order") || "0",
    });
    if (!parsed.success) return fail(parsed.error.issues);
    const d = parsed.data;
    const supabase = await assertCanEdit(schoolId, d.curriculumId);
    const { error } = await supabase.from("chapters").insert({
      curriculum_id: d.curriculumId, title: d.title, order: d.order,
      source: "Contenu propre à l'établissement", status: "draft",
    });
    if (error) return { error: error.message };
    paths(d.curriculumId);
    return { success: true };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function updateTeacherChapterAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const schoolId = schoolOf(fd);
    const parsed = z.object({
      chapterId: z.string().uuid(), title: z.string().min(1, "Titre requis"), order: z.coerce.number().int().min(0),
    }).safeParse({ chapterId: fd.get("chapterId"), title: fd.get("title"), order: fd.get("order") || "0" });
    if (!parsed.success) return fail(parsed.error.issues);
    const d = parsed.data;
    const { supabase } = await requireTeacherAccess(schoolId);
    const curriculumId = await curriculumOfChapter(supabase, d.chapterId);
    await assertCanEdit(schoolId, curriculumId);
    const { data, error } = await supabase.from("chapters").update({ title: d.title, order: d.order })
      .eq("id", d.chapterId).select("id").maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: NOT_ALLOWED };
    paths(curriculumId);
    return { success: true, message: "Chapitre mis à jour." };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function updateTeacherChapterStatusAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const schoolId = schoolOf(fd);
    const parsed = chapterStatusSchema.safeParse({ chapterId: fd.get("chapterId"), status: fd.get("status") });
    if (!parsed.success) return fail(parsed.error.issues);
    const { supabase } = await requireTeacherAccess(schoolId);
    const curriculumId = await curriculumOfChapter(supabase, parsed.data.chapterId);
    await assertCanEdit(schoolId, curriculumId);
    const { data, error } = await supabase.from("chapters").update({ status: parsed.data.status })
      .eq("id", parsed.data.chapterId).select("id").maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: NOT_ALLOWED };
    paths(curriculumId);
    return { success: true };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function deleteTeacherChapterAction(chapterId: string, schoolId: string) {
  const { supabase } = await requireTeacherAccess(schoolId);
  const curriculumId = await curriculumOfChapter(supabase, chapterId);
  await assertCanEdit(schoolId, curriculumId);
  const { data, error } = await supabase.from("chapters").update({ deleted_at: new Date().toISOString() })
    .eq("id", chapterId).select("id").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(NOT_ALLOWED);
  paths(curriculumId);
}

// ---------- Leçons ----------
export async function createTeacherLessonAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const schoolId = schoolOf(fd);
    const parsed = lessonSchema.safeParse({
      chapterId: fd.get("chapterId"), title: fd.get("title"), contentMd: fd.get("contentMd"),
      objectives: fd.get("objectives") || undefined, summary: fd.get("summary") || undefined, order: fd.get("order") || "0",
    });
    if (!parsed.success) return fail(parsed.error.issues);
    const d = parsed.data;
    const { supabase } = await requireTeacherAccess(schoolId);
    const curriculumId = await curriculumOfChapter(supabase, d.chapterId);
    await assertCanEdit(schoolId, curriculumId);
    const { error } = await supabase.from("lessons").insert({
      chapter_id: d.chapterId, title: d.title, content_md: d.contentMd, objectives: toObjectives(d.objectives),
      summary: d.summary, order: d.order, source: "Contenu propre à l'établissement", status: "draft",
    });
    if (error) return { error: error.message };
    paths(curriculumId);
    return { success: true };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function updateTeacherLessonAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const schoolId = schoolOf(fd);
    const parsed = lessonSchema.omit({ chapterId: true }).extend({ lessonId: z.string().uuid() }).safeParse({
      lessonId: fd.get("lessonId"), title: fd.get("title"), contentMd: fd.get("contentMd"),
      objectives: fd.get("objectives") || undefined, summary: fd.get("summary") || undefined, order: fd.get("order") || "0",
    });
    if (!parsed.success) return fail(parsed.error.issues);
    const d = parsed.data;
    const { supabase } = await requireTeacherAccess(schoolId);
    const curriculumId = await curriculumOfLesson(supabase, d.lessonId);
    await assertCanEdit(schoolId, curriculumId);
    // chapter_id, source et status ne sont volontairement PAS modifiables ici.
    const { data, error } = await supabase.from("lessons").update({
      title: d.title, content_md: d.contentMd, objectives: toObjectives(d.objectives),
      summary: d.summary ?? null, order: d.order,
    }).eq("id", d.lessonId).select("id").maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: NOT_ALLOWED };
    paths(curriculumId);
    return { success: true, message: "Leçon enregistrée." };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function updateTeacherLessonStatusAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const schoolId = schoolOf(fd);
    const parsed = lessonStatusSchema.safeParse({ lessonId: fd.get("lessonId"), status: fd.get("status") });
    if (!parsed.success) return fail(parsed.error.issues);
    const { supabase } = await requireTeacherAccess(schoolId);
    const curriculumId = await curriculumOfLesson(supabase, parsed.data.lessonId);
    await assertCanEdit(schoolId, curriculumId);
    const { data, error } = await supabase.from("lessons").update({ status: parsed.data.status })
      .eq("id", parsed.data.lessonId).select("id").maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: NOT_ALLOWED };
    paths(curriculumId);
    return { success: true };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function deleteTeacherLessonAction(lessonId: string, schoolId: string) {
  const { supabase } = await requireTeacherAccess(schoolId);
  const curriculumId = await curriculumOfLesson(supabase, lessonId);
  await assertCanEdit(schoolId, curriculumId);
  const { data, error } = await supabase.from("lessons").update({ deleted_at: new Date().toISOString() })
    .eq("id", lessonId).select("id").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(NOT_ALLOWED);
  paths(curriculumId);
}
