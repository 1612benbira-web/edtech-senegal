import { createClient } from "@/lib/supabase/server";
import { isCurriculumAllowedForSchool } from "@/lib/services/schoolService";

/**
 * Requêtes dédiées à la navigation pédagogique en "bibliothèque"
 * (points 7-9) : parcourir Cycle → Niveau → Matière → Programme →
 * Chapitre → Leçon → Exercice, avec des compteurs, sans jamais
 * modifier quoi que ce soit (lecture seule — voir "voir ≠ modifier",
 * point 10). Les vraies actions de création/édition/suppression
 * restent exclusivement dans les pages /admin existantes
 * (curriculum-actions.ts, curriculum-content-actions.ts,
 * app/admin/schools/content-actions.ts) : ces requêtes ne font QUE
 * lire, ce module ne contient donc aucune Server Action.
 *
 * `schoolId` :
 *   - `undefined` → vue Super Admin : tout le contenu global ET privé
 *     de toutes les écoles (le Super Admin peut tout consulter).
 *   - une valeur → vue School Admin : uniquement les programmes
 *     nationaux ACTIVÉS pour cette école + les programmes PROPRES à
 *     cette école (jamais le contenu privé d'une autre école).
 * Ceci concerne uniquement la LECTURE : la RLS (migrations 0009/0018/
 * 0019) reste la garantie finale, ces fonctions utilisent toutes le
 * client de session, jamais service_role.
 */

export type BrowseCycle = { id: string; code: string; name: string; order: number; levelCount: number };
export type BrowseLevel = { id: string; code: string; name: string; order: number; cycleName: string | null };
export type BrowseSubject = {
  subjectId: string;
  subjectName: string;
  subjectIcon: string | null;
  curriculumCount: number;
};
export type BrowseCurriculum = {
  id: string;
  title: string;
  status: string;
  isSchoolOwned: boolean;
  chapterCount: number;
  domainCount: number;
};
export type BrowseChapter = {
  id: string;
  title: string;
  status: string;
  order: number;
  lessonCount: number;
  exerciseCount: number;
  questionCount: number;
};
export type BrowseLesson = {
  id: string;
  title: string;
  status: string;
  order: number;
  exerciseCount: number;
};
export type BrowseExercise = {
  id: string;
  title: string;
  status: string;
  questionCount: number;
};

export async function getCyclesOverview(): Promise<BrowseCycle[]> {
  const supabase = await createClient();
  const { data: cycles, error } = await supabase
    .from("school_cycles")
    .select("id, code, name, order")
    .order("order");
  if (error) throw error;

  const { data: levels } = await supabase.from("school_levels").select("cycle_id");
  const counts = new Map<string, number>();
  for (const row of levels ?? []) {
    counts.set(row.cycle_id, (counts.get(row.cycle_id) ?? 0) + 1);
  }

  return (cycles ?? []).map((c) => ({ ...c, levelCount: counts.get(c.id) ?? 0 }));
}

export async function getLevelsOverview(cycleId: string): Promise<BrowseLevel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_levels")
    .select("id, code, name, order, school_cycles(name)")
    .eq("cycle_id", cycleId)
    .order("order");
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    order: row.order,
    cycleName: row.school_cycles?.name ?? null,
  }));
}

export async function getSubjectsOverviewForLevel(
  levelId: string,
  schoolId?: string
): Promise<BrowseSubject[]> {
  const supabase = await createClient();

  const { data: levelSubjects, error } = await supabase
    .from("level_subjects")
    .select("subject_id, subjects(id, name, icon)")
    .eq("level_id", levelId);
  if (error) throw error;

  // Une matière peut apparaître plusieurs fois (une ligne par série) :
  // on ne veut qu'une entrée par matière dans la vue "bibliothèque".
  const bySubject = new Map<string, { id: string; name: string; icon: string | null }>();
  for (const row of levelSubjects ?? []) {
    const s = (row as any).subjects;
    if (s && !bySubject.has(s.id)) bySubject.set(s.id, s);
  }

  const results: BrowseSubject[] = [];
  for (const subject of bySubject.values()) {
    const count = await countCurriculumsForLevelSubject(levelId, subject.id, schoolId);
    results.push({
      subjectId: subject.id,
      subjectName: subject.name,
      subjectIcon: subject.icon,
      curriculumCount: count,
    });
  }
  return results;
}

async function countCurriculumsForLevelSubject(
  levelId: string,
  subjectId: string,
  schoolId?: string
): Promise<number> {
  const supabase = await createClient();

  if (schoolId === undefined) {
    // Vue Super Admin : tous les programmes (privés ou globaux, tout
    // statut confondu) pour ce couple niveau/matière.
    const { count } = await supabase
      .from("curriculums")
      .select("id", { count: "exact", head: true })
      .eq("level_id", levelId)
      .eq("subject_id", subjectId);
    return count ?? 0;
  }

  // Vue School Admin : programmes propres à l'école...
  const { count: ownedCount } = await supabase
    .from("curriculums")
    .select("id", { count: "exact", head: true })
    .eq("level_id", levelId)
    .eq("subject_id", subjectId)
    .eq("school_id", schoolId);

  // ...+ programmes nationaux réellement activés pour cette école.
  const { data: globalCurriculums } = await supabase
    .from("curriculums")
    .select("id")
    .eq("level_id", levelId)
    .eq("subject_id", subjectId)
    .is("school_id", null);

  let activatedCount = 0;
  for (const c of globalCurriculums ?? []) {
    if (await isCurriculumAllowedForSchool(schoolId, c.id)) activatedCount += 1;
  }

  return (ownedCount ?? 0) + activatedCount;
}

export async function getCurriculumsForLevelSubject(
  levelId: string,
  subjectId: string,
  schoolId?: string
): Promise<BrowseCurriculum[]> {
  const supabase = await createClient();

  let ownCurriculums: any[] = [];
  let globalCurriculums: any[] = [];

  if (schoolId === undefined) {
    const { data } = await supabase
      .from("curriculums")
      .select("id, title, status, school_id")
      .eq("level_id", levelId)
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false });
    globalCurriculums = data ?? [];
  } else {
    const { data: owned } = await supabase
      .from("curriculums")
      .select("id, title, status, school_id")
      .eq("level_id", levelId)
      .eq("subject_id", subjectId)
      .eq("school_id", schoolId);
    ownCurriculums = owned ?? [];

    const { data: candidates } = await supabase
      .from("curriculums")
      .select("id, title, status, school_id")
      .eq("level_id", levelId)
      .eq("subject_id", subjectId)
      .is("school_id", null);

    for (const c of candidates ?? []) {
      if (await isCurriculumAllowedForSchool(schoolId, c.id)) globalCurriculums.push(c);
    }
  }

  const all = [...ownCurriculums, ...globalCurriculums];

  const results: BrowseCurriculum[] = [];
  for (const c of all) {
    const [{ count: chapterCount }, { count: domainCount }] = await Promise.all([
      supabase.from("chapters").select("id", { count: "exact", head: true }).eq("curriculum_id", c.id),
      supabase.from("domains").select("id", { count: "exact", head: true }).eq("curriculum_id", c.id),
    ]);
    results.push({
      id: c.id,
      title: c.title,
      status: c.status,
      isSchoolOwned: c.school_id !== null,
      chapterCount: chapterCount ?? 0,
      domainCount: domainCount ?? 0,
    });
  }
  return results;
}

export async function getCurriculumMeta(curriculumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculums")
    .select("id, title, status, school_id, level_id, subject_id, subjects(name), school_levels(name)")
    .eq("id", curriculumId)
    .maybeSingle();
  if (error) throw error;
  return data as any;
}

export async function getChaptersForCurriculum(curriculumId: string): Promise<BrowseChapter[]> {
  const supabase = await createClient();
  const { data: chapters, error } = await supabase
    .from("chapters")
    .select("id, title, status, order")
    .eq("curriculum_id", curriculumId)
    .is("deleted_at", null)
    .order("order");
  if (error) throw error;

  const results: BrowseChapter[] = [];
  for (const chapter of chapters ?? []) {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("chapter_id", chapter.id)
      .is("deleted_at", null);
    const lessonIds = (lessons ?? []).map((l) => l.id);

    let exerciseCount = 0;
    let questionCount = 0;
    if (lessonIds.length > 0) {
      const { data: exercises } = await supabase
        .from("exercises")
        .select("id")
        .in("lesson_id", lessonIds)
        .is("deleted_at", null);
      const exerciseIds = (exercises ?? []).map((e) => e.id);
      exerciseCount = exerciseIds.length;

      if (exerciseIds.length > 0) {
        const { count } = await supabase
          .from("questions")
          .select("id", { count: "exact", head: true })
          .in("exercise_id", exerciseIds)
          .is("deleted_at", null);
        questionCount = count ?? 0;
      }
    }

    results.push({
      id: chapter.id,
      title: chapter.title,
      status: chapter.status,
      order: chapter.order,
      lessonCount: lessonIds.length,
      exerciseCount,
      questionCount,
    });
  }
  return results;
}

export async function getChapterMeta(chapterId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("id, title, status, curriculum_id, curriculums(title, subject_id, level_id, subjects(name), school_levels(name))")
    .eq("id", chapterId)
    .maybeSingle();
  if (error) throw error;
  return data as any;
}

export async function getLessonsForChapterBrowse(chapterId: string): Promise<BrowseLesson[]> {
  const supabase = await createClient();
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id, title, status, order")
    .eq("chapter_id", chapterId)
    .is("deleted_at", null)
    .order("order");
  if (error) throw error;

  const results: BrowseLesson[] = [];
  for (const lesson of lessons ?? []) {
    const { count } = await supabase
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .eq("lesson_id", lesson.id)
      .is("deleted_at", null);
    results.push({ ...lesson, exerciseCount: count ?? 0 });
  }
  return results;
}

export async function getLessonMeta(lessonId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, title, status, content_md, summary, objectives, chapter_id, chapters(title, curriculum_id, curriculums(title, subject_id, level_id, subjects(name), school_levels(name)))")
    .eq("id", lessonId)
    .maybeSingle();
  if (error) throw error;
  return data as any;
}

export async function getExercisesForLessonBrowse(lessonId: string): Promise<BrowseExercise[]> {
  const supabase = await createClient();
  const { data: exercises, error } = await supabase
    .from("exercises")
    .select("id, title, status")
    .eq("lesson_id", lessonId)
    .is("deleted_at", null);
  if (error) throw error;

  const results: BrowseExercise[] = [];
  for (const exercise of exercises ?? []) {
    const { count } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("exercise_id", exercise.id)
      .is("deleted_at", null);
    results.push({ ...exercise, questionCount: count ?? 0 });
  }
  return results;
}
