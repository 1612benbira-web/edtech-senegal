import { createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { NotTeacherError, requireTeacherAccess } from "@/lib/services/adminGuard";
import { pickCurriculumForSeries } from "@/lib/queries/programme";
import { buildClassOverview, type ClassOverview } from "@/lib/algorithms/classOverview";

/**
 * Suivi de classe pour l'enseignant : pour une de ses affectations
 * (matière + niveau, éventuellement une série), la progression des élèves
 * de SON école à ce niveau.
 *
 * Sécurité. Les règles d'accès (RLS) ne laissent pas un enseignant lire la
 * progression des élèves ; ce service lit donc avec le client service_role.
 * Il ne le fait qu'après avoir vérifié, avec la session de l'utilisateur
 * (requireTeacherAccess), qu'il est enseignant actif de l'école et que
 * l'affectation demandée est bien la sienne. Toutes les lectures sont
 * ensuite bornées par cette école, ce niveau et cette matière : jamais un
 * élève d'une autre école ou d'un autre niveau.
 */

const IN_CHUNK_SIZE = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export interface TeacherAssignmentSummary {
  id: string;
  subjectId: string;
  levelId: string;
  seriesId: string | null;
  subjectName: string;
  levelName: string;
  seriesName: string | null;
}

export interface TeacherClassOverview extends ClassOverview {
  assignment: TeacherAssignmentSummary;
  /** Titre du programme suivi, ou null si aucun programme publié pour cette matière et ce niveau. */
  curriculumTitle: string | null;
  totalLessons: number;
}

type AssignmentRow = {
  id: string;
  subject_id: string;
  level_id: string;
  series_id: string | null;
  subjects: { name: string } | null;
  school_levels: { name: string } | null;
  school_series: { name: string } | null;
};

function toSummary(row: AssignmentRow): TeacherAssignmentSummary {
  return {
    id: row.id,
    subjectId: row.subject_id,
    levelId: row.level_id,
    seriesId: row.series_id,
    subjectName: row.subjects?.name ?? "Matière",
    levelName: row.school_levels?.name ?? "Niveau",
    seriesName: row.school_series?.name ?? null,
  };
}

/** École et affectations de l'enseignant connecté (lève NotTeacherError sinon). */
export async function getMyTeacherAssignments(): Promise<{
  schoolId: string;
  assignments: TeacherAssignmentSummary[];
}> {
  const currentSchool = await getCurrentSchool();
  if (!currentSchool) throw new NotTeacherError();
  const { assignments } = await requireTeacherAccess(currentSchool.schoolId);
  return {
    schoolId: currentSchool.schoolId,
    assignments: (assignments as unknown as AssignmentRow[]).map(toSummary),
  };
}

/**
 * Suivi de la classe d'une affectation de l'enseignant connecté. Renvoie
 * null si l'affectation n'est pas la sienne.
 */
export async function getTeacherClassOverview(assignmentId: string): Promise<TeacherClassOverview | null> {
  const { schoolId, assignments } = await getMyTeacherAssignments();
  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment) return null;

  const admin = createServiceRoleClient();

  // 1. Élèves actifs de l'école, au niveau (et à la série) de l'affectation.
  const { data: members, error: membersError } = await admin
    .from("school_members")
    .select("profile_id")
    .eq("school_id", schoolId)
    .eq("role", "student")
    .eq("status", "active");
  if (membersError) throw membersError;
  const memberIds = (members ?? []).map((m) => m.profile_id);

  const students: { id: string; firstName: string | null; lastName: string | null; lastSeenAt: string | null }[] = [];
  for (const ids of chunk(memberIds, IN_CHUNK_SIZE)) {
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id, first_name, last_name, level_id, series_id, last_seen_at")
      .in("id", ids)
      .eq("level_id", assignment.levelId);
    if (error) throw error;
    for (const profile of profiles ?? []) {
      if (assignment.seriesId && profile.series_id !== assignment.seriesId) continue;
      students.push({
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        lastSeenAt: profile.last_seen_at,
      });
    }
  }
  const studentIds = students.map((s) => s.id);

  // 2. Programme suivi : celui de l'école s'il existe, sinon le programme national.
  const { data: curriculums, error: curriculumsError } = await admin
    .from("curriculums")
    .select("id, title, description, series_id, created_at, school_id")
    .eq("subject_id", assignment.subjectId)
    .eq("level_id", assignment.levelId)
    .eq("status", "published");
  if (curriculumsError) throw curriculumsError;
  const candidates = (curriculums ?? []).filter(
    (c) =>
      (c.school_id === schoolId || c.school_id === null) &&
      (assignment.seriesId === null || c.series_id === null || c.series_id === assignment.seriesId)
  );
  const owned = candidates.filter((c) => c.school_id === schoolId);
  const national = candidates.filter((c) => c.school_id === null);
  const newestFirst = [...owned, ...national].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const picked =
    pickCurriculumForSeries(owned, assignment.seriesId) ??
    pickCurriculumForSeries(national, assignment.seriesId) ??
    newestFirst[0] ??
    null;
  const curriculum = picked ? candidates.find((c) => c.id === picked.id) ?? null : null;

  // 3. Leçons publiées et compétences de ce programme.
  const chapterIds: string[] = [];
  const lessonIds = new Set<string>();
  const competencyNames = new Map<string, string>();
  if (curriculum) {
    const { data: chapters, error: chaptersError } = await admin
      .from("chapters")
      .select("id")
      .eq("curriculum_id", curriculum.id)
      .eq("status", "published")
      .is("deleted_at", null);
    if (chaptersError) throw chaptersError;
    chapterIds.push(...(chapters ?? []).map((c) => c.id));

    for (const ids of chunk(chapterIds, IN_CHUNK_SIZE)) {
      const { data: lessons, error } = await admin
        .from("lessons")
        .select("id")
        .in("chapter_id", ids)
        .eq("status", "published")
        .is("deleted_at", null);
      if (error) throw error;
      for (const lesson of lessons ?? []) lessonIds.add(lesson.id);
    }

    const { data: domains, error: domainsError } = await admin
      .from("domains")
      .select("id")
      .eq("curriculum_id", curriculum.id);
    if (domainsError) throw domainsError;
    for (const ids of chunk((domains ?? []).map((d) => d.id), IN_CHUNK_SIZE)) {
      const { data: competencies, error } = await admin
        .from("competencies")
        .select("id, name")
        .in("domain_id", ids);
      if (error) throw error;
      for (const competency of competencies ?? []) competencyNames.set(competency.id, competency.name);
    }
  }

  // 4. Progression des élèves de la classe, bornée à ce programme.
  const chapterSet = new Set(chapterIds);
  const completedLessons: { profileId: string; lessonId: string }[] = [];
  const quizScores: { profileId: string; score: number }[] = [];
  const mastery: {
    profileId: string;
    competencyId: string;
    competencyName: string;
    masteryScore: number;
    attemptsCount: number;
  }[] = [];

  for (const ids of chunk(studentIds, IN_CHUNK_SIZE)) {
    const [lessonRows, quizRows, masteryRows] = await Promise.all([
      admin.from("lesson_progress").select("profile_id, lesson_id").in("profile_id", ids).eq("status", "completed"),
      admin
        .from("quiz_attempts")
        .select("profile_id, score, subject_id, chapter_id")
        .in("profile_id", ids)
        .not("completed_at", "is", null),
      admin
        .from("competency_progress")
        .select("profile_id, competency_id, mastery_score, attempts_count")
        .in("profile_id", ids),
    ]);
    if (lessonRows.error) throw lessonRows.error;
    if (quizRows.error) throw quizRows.error;
    if (masteryRows.error) throw masteryRows.error;

    for (const row of lessonRows.data ?? []) {
      if (lessonIds.has(row.lesson_id)) completedLessons.push({ profileId: row.profile_id, lessonId: row.lesson_id });
    }
    for (const row of quizRows.data ?? []) {
      // Quiz de la matière, ou quiz d'un chapitre de ce programme. Les quiz
      // du jour et de révision mélangent les matières : ils ne comptent pas ici.
      const inSubject =
        row.subject_id === assignment.subjectId || (row.chapter_id !== null && chapterSet.has(row.chapter_id));
      const score = row.score === null ? NaN : Number(row.score);
      if (inSubject && Number.isFinite(score)) quizScores.push({ profileId: row.profile_id, score });
    }
    for (const row of masteryRows.data ?? []) {
      const name = competencyNames.get(row.competency_id);
      if (!name) continue;
      mastery.push({
        profileId: row.profile_id,
        competencyId: row.competency_id,
        competencyName: name,
        masteryScore: Number(row.mastery_score),
        attemptsCount: row.attempts_count,
      });
    }
  }

  return {
    ...buildClassOverview({ students, totalLessons: lessonIds.size, completedLessons, quizScores, mastery }),
    assignment,
    curriculumTitle: curriculum?.title ?? null,
    totalLessons: lessonIds.size,
  };
}
