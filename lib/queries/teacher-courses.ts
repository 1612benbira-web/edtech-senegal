import { createClient } from "@/lib/supabase/server";
import {
  assignmentCoversCurriculum,
  teacherCurriculumAccess,
  type CurriculumAccess,
  type TeacherAssignment,
} from "@/lib/utils/teacher-scope";

const CURRICULUM_COLS =
  "id, title, status, school_id, subject_id, level_id, series_id, subjects(name), school_levels(name), school_series(name)";

/** Programmes visibles par l'enseignant : ceux de son école (éditables) et le national publié (lecture seule). */
export async function getTeacherCurricula(schoolId: string, assignments: TeacherAssignment[]) {
  if (assignments.length === 0) return { owned: [], national: [] };
  const supabase = await createClient();
  const subjectIds = [...new Set(assignments.map((a) => a.subject_id))];
  const levelIds = [...new Set(assignments.map((a) => a.level_id))];

  const { data, error } = await supabase
    .from("curriculums")
    .select(CURRICULUM_COLS)
    .or(`school_id.eq.${schoolId},school_id.is.null`)
    .in("subject_id", subjectIds)
    .in("level_id", levelIds)
    .order("title");
  if (error) throw error;

  const owned: any[] = [];
  const national: any[] = [];
  for (const c of (data ?? []) as any[]) {
    const access = teacherCurriculumAccess(schoolId, assignments, c);
    if (access === "edit") owned.push(c);
    else if (access === "read") national.push(c);
  }
  return { owned, national };
}

/** Programme + niveau d'accès, ou null si hors périmètre (id forgé, autre école…). */
export async function getTeacherCurriculum(
  curriculumId: string,
  schoolId: string,
  assignments: TeacherAssignment[]
): Promise<{ curriculum: any; access: CurriculumAccess } | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("curriculums").select(CURRICULUM_COLS).eq("id", curriculumId).maybeSingle();
  if (!data) return null;
  const access = teacherCurriculumAccess(schoolId, assignments, data as any);
  if (access === "none") return null;
  return { curriculum: data, access };
}

export async function getChaptersWithLessons(curriculumId: string, editable: boolean) {
  const supabase = await createClient();
  let q = supabase
    .from("chapters")
    .select("id, title, order, status, source, lessons(id, title, order, status, deleted_at)")
    .eq("curriculum_id", curriculumId)
    .is("deleted_at", null)
    .is("lessons.deleted_at", null)
    .order("order");
  if (!editable) q = q.eq("status", "published");
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as any[]).map((ch) => ({
    ...ch,
    lessons: ((ch.lessons ?? []) as any[])
      .filter((l) => editable || l.status === "published")
      .sort((a, b) => a.order - b.order),
  }));
}

export async function getLessonWithCurriculum(lessonId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("id, title, content_md, objectives, summary, order, status, source, chapter_id, deleted_at, chapters(id, title, curriculum_id)")
    .eq("id", lessonId)
    .is("deleted_at", null)
    .maybeSingle();
  return data as any;
}

export { assignmentCoversCurriculum };
