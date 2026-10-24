export interface TeacherAssignment {
  subject_id: string;
  level_id: string;
  series_id: string | null;
}

export interface CurriculumScope {
  subject_id: string;
  level_id: string;
  series_id: string | null;
}

/**
 * Une affectation couvre-t-elle ce programme ? Miroir exact de la règle SQL
 * is_assigned_teacher_for_curriculum (migration 0026) : même matière, même
 * niveau, et série compatible (l'un des deux côtés sans série = toutes séries).
 */
export function assignmentCoversCurriculum(
  assignments: TeacherAssignment[],
  curriculum: CurriculumScope
): boolean {
  return assignments.some(
    (a) =>
      a.subject_id === curriculum.subject_id &&
      a.level_id === curriculum.level_id &&
      (curriculum.series_id === null || a.series_id === null || a.series_id === curriculum.series_id)
  );
}

export type CurriculumAccess = "edit" | "read" | "none";

/** Niveau d'accès d'un enseignant (école `schoolId`) à un programme. */
export function teacherCurriculumAccess(
  schoolId: string,
  assignments: TeacherAssignment[],
  curriculum: CurriculumScope & { school_id: string | null; status: string }
): CurriculumAccess {
  if (!assignmentCoversCurriculum(assignments, curriculum)) return "none";
  if (curriculum.school_id === schoolId) return "edit";
  if (curriculum.school_id === null && curriculum.status === "published") return "read";
  return "none";
}

/**
 * Statuts qu'un enseignant peut donner à ses chapitres/leçons. « published »
 * (et « validated ») sont réservés au responsable d'établissement : voir le
 * trigger restrict_teacher_publication (migration 0029), qui est le vrai rempart.
 */
export const TEACHER_ALLOWED_STATUSES = ["draft", "review", "archived"] as const;

export function canTeacherSetStatus(status: string): boolean {
  return (TEACHER_ALLOWED_STATUSES as readonly string[]).includes(status);
}

export const PUBLICATION_RESERVED_MESSAGE =
  "Seul le responsable de l'établissement peut publier un contenu. Passe-le en « révision » pour en demander la publication.";
