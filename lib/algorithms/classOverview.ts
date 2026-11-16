/**
 * Suivi d'une classe par son enseignant : calculs purs (sans accès à la
 * base) à partir des lignes brutes lues par teacherDashboardService.
 */

/** Un élève sans connexion depuis ce nombre de jours est signalé « inactif ». */
export const INACTIVE_AFTER_DAYS = 7;

/** Sous cette maîtrise moyenne (sur 100), une notion est signalée « à retravailler ». */
export const WEAK_MASTERY_THRESHOLD = 60;

/** Nombre maximum de notions à retravailler affichées. */
export const WEAK_NOTIONS_LIMIT = 5;

export interface ClassStudentInput {
  id: string;
  firstName: string | null;
  lastName: string | null;
  lastSeenAt: string | null;
}

export interface ClassOverviewInput {
  students: ClassStudentInput[];
  /** Nombre de leçons publiées du programme suivi par la classe. */
  totalLessons: number;
  /** Une ligne par leçon du programme terminée par un élève. */
  completedLessons: { profileId: string; lessonId: string }[];
  /** Quiz terminés dans la matière (score en pourcentage). */
  quizScores: { profileId: string; score: number }[];
  /** Maîtrise par compétence du programme (0 à 100). */
  mastery: {
    profileId: string;
    competencyId: string;
    competencyName: string;
    masteryScore: number;
    attemptsCount: number;
  }[];
  now?: Date;
}

export interface ClassStudentRow {
  id: string;
  name: string;
  completedLessons: number;
  progressPercent: number;
  quizCount: number;
  /** Moyenne des quiz en pourcentage, ou null si aucun quiz terminé. */
  quizAverage: number | null;
  /** Maîtrise moyenne des notions travaillées, ou null si aucune. */
  masteryAverage: number | null;
  lastSeenAt: string | null;
  /** Jours depuis la dernière connexion, ou null si l'élève ne s'est jamais connecté. */
  daysSinceSeen: number | null;
  inactive: boolean;
}

export interface WeakNotion {
  competencyId: string;
  name: string;
  averageMastery: number;
  /** Nombre d'élèves de la classe ayant travaillé cette notion. */
  studentCount: number;
}

export interface ClassOverview {
  studentCount: number;
  activeCount: number;
  inactiveCount: number;
  /** Progression moyenne de la classe dans le programme (pourcentage). */
  averageProgress: number;
  /** Moyenne des quiz de la classe, ou null si aucun quiz terminé. */
  averageQuizScore: number | null;
  /** Élèves, ceux qui ont le moins avancé en premier. */
  students: ClassStudentRow[];
  /** Notions les moins bien maîtrisées par la classe, la plus faible en premier. */
  weakNotions: WeakNotion[];
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function daysSince(dateIso: string | null, now: Date): number | null {
  if (!dateIso) return null;
  const time = new Date(dateIso).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((now.getTime() - time) / 86_400_000));
}

export function studentDisplayName(firstName: string | null, lastName: string | null): string {
  const name = [firstName, lastName].map((part) => part?.trim()).filter(Boolean).join(" ");
  return name || "Élève sans nom";
}

export function buildClassOverview(input: ClassOverviewInput): ClassOverview {
  const now = input.now ?? new Date();
  const studentIds = new Set(input.students.map((student) => student.id));

  // Une leçon terminée ne compte qu'une fois par élève, même si la ligne est dupliquée.
  const lessonsByStudent = new Map<string, Set<string>>();
  for (const row of input.completedLessons) {
    if (!studentIds.has(row.profileId)) continue;
    const lessons = lessonsByStudent.get(row.profileId) ?? new Set<string>();
    lessons.add(row.lessonId);
    lessonsByStudent.set(row.profileId, lessons);
  }

  const scoresByStudent = new Map<string, number[]>();
  for (const row of input.quizScores) {
    if (!studentIds.has(row.profileId)) continue;
    const scores = scoresByStudent.get(row.profileId) ?? [];
    scores.push(row.score);
    scoresByStudent.set(row.profileId, scores);
  }

  // Seules les notions réellement travaillées (au moins une tentative) comptent.
  const workedMastery = input.mastery.filter(
    (row) => studentIds.has(row.profileId) && row.attemptsCount > 0
  );
  const masteryByStudent = new Map<string, number[]>();
  for (const row of workedMastery) {
    const scores = masteryByStudent.get(row.profileId) ?? [];
    scores.push(row.masteryScore);
    masteryByStudent.set(row.profileId, scores);
  }

  const students: ClassStudentRow[] = input.students.map((student) => {
    const completed = Math.min(lessonsByStudent.get(student.id)?.size ?? 0, Math.max(0, input.totalLessons));
    const scores = scoresByStudent.get(student.id) ?? [];
    const quizAverage = average(scores);
    const masteryAverage = average(masteryByStudent.get(student.id) ?? []);
    const days = daysSince(student.lastSeenAt, now);
    return {
      id: student.id,
      name: studentDisplayName(student.firstName, student.lastName),
      completedLessons: completed,
      progressPercent: input.totalLessons > 0 ? Math.round((completed / input.totalLessons) * 100) : 0,
      quizCount: scores.length,
      quizAverage: quizAverage === null ? null : Math.round(quizAverage),
      masteryAverage: masteryAverage === null ? null : Math.round(masteryAverage),
      lastSeenAt: student.lastSeenAt,
      daysSinceSeen: days,
      inactive: days === null || days >= INACTIVE_AFTER_DAYS,
    };
  });

  students.sort(
    (a, b) => a.progressPercent - b.progressPercent || a.name.localeCompare(b.name, "fr")
  );

  const notions = new Map<string, { name: string; scores: number[] }>();
  for (const row of workedMastery) {
    const notion = notions.get(row.competencyId) ?? { name: row.competencyName, scores: [] };
    notion.scores.push(row.masteryScore);
    notions.set(row.competencyId, notion);
  }
  const weakNotions: WeakNotion[] = Array.from(notions.entries())
    .map(([competencyId, notion]) => ({
      competencyId,
      name: notion.name,
      averageMastery: Math.round(average(notion.scores) ?? 0),
      studentCount: notion.scores.length,
    }))
    .filter((notion) => notion.averageMastery < WEAK_MASTERY_THRESHOLD)
    .sort((a, b) => a.averageMastery - b.averageMastery || b.studentCount - a.studentCount)
    .slice(0, WEAK_NOTIONS_LIMIT);

  const inactiveCount = students.filter((student) => student.inactive).length;
  const allScores = Array.from(scoresByStudent.values()).flat();
  const classQuizAverage = average(allScores);

  return {
    studentCount: students.length,
    activeCount: students.length - inactiveCount,
    inactiveCount,
    averageProgress: Math.round(average(students.map((student) => student.progressPercent)) ?? 0),
    averageQuizScore: classQuizAverage === null ? null : Math.round(classQuizAverage),
    students,
    weakNotions,
  };
}
