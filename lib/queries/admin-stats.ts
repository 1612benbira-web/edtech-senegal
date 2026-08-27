import { createClient } from "@/lib/supabase/server";

export interface StudentRow {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  levelName: string | null;
  seriesName: string | null;
  xpTotal: number;
  currentStreak: number;
  badgeCount: number;
  createdAt: string;
  lastSeenAt: string | null;
}

export async function getStudents(
  searchQuery?: string,
  page: number = 1,
  pageSize: number = 25
): Promise<{ students: StudentRow[]; totalCount: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, xp_total, created_at, last_seen_at, school_levels(name), school_series(name), streaks(current_streak)",
      { count: "exact" }
    )
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const profileIds = (data ?? []).map((p) => p.id);
  const { data: badgeCounts } = profileIds.length
    ? await supabase.from("user_badges").select("profile_id").in("profile_id", profileIds)
    : { data: [] };
  const badgeCountByProfile = new Map<string, number>();
  for (const b of badgeCounts ?? []) {
    badgeCountByProfile.set(b.profile_id, (badgeCountByProfile.get(b.profile_id) ?? 0) + 1);
  }

  const students = (data ?? []).map((p: any) => ({
    id: p.id,
    firstName: p.first_name,
    lastName: p.last_name,
    email: p.email,
    levelName: p.school_levels?.name ?? null,
    seriesName: p.school_series?.name ?? null,
    xpTotal: p.xp_total,
    currentStreak: p.streaks?.[0]?.current_streak ?? p.streaks?.current_streak ?? 0,
    badgeCount: badgeCountByProfile.get(p.id) ?? 0,
    createdAt: p.created_at,
    lastSeenAt: p.last_seen_at ?? null,
  }));

  return { students, totalCount: count ?? 0 };
}

export interface StudentDetail {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  levelId: string | null;
  levelName: string | null;
  seriesName: string | null;
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  lastSeenAt: string | null;
}

export async function getStudentDetail(studentId: string): Promise<StudentDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, phone, level_id, created_at, last_seen_at, school_levels(name), school_series(name), streaks(current_streak, longest_streak), xp_total"
    )
    .eq("id", studentId)
    .eq("role", "student")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const p = data as any;
  return {
    id: p.id,
    firstName: p.first_name,
    lastName: p.last_name,
    email: p.email,
    phone: p.phone,
    levelId: p.level_id,
    levelName: p.school_levels?.name ?? null,
    seriesName: p.school_series?.name ?? null,
    xpTotal: p.xp_total,
    currentStreak: p.streaks?.[0]?.current_streak ?? p.streaks?.current_streak ?? 0,
    longestStreak: p.streaks?.[0]?.longest_streak ?? p.streaks?.longest_streak ?? 0,
    createdAt: p.created_at,
    lastSeenAt: p.last_seen_at ?? null,
  };
}

export interface GlobalStats {
  totalStudents: number;
  activeStudents7d: number;
  totalQuizzesCompleted: number;
  averageQuizScore: number;
  totalLessonsCompleted: number;
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const supabase = await createClient();

  const [studentsCount, quizzes, lessonsCompleted] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("quiz_attempts").select("score").not("completed_at", "is", null),
    supabase
      .from("lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: activeCount } = await supabase
    .from("streaks")
    .select("*", { count: "exact", head: true })
    .gte("last_activity_date", sevenDaysAgo.toISOString().slice(0, 10));

  const scores = (quizzes.data ?? []).map((q) => q.score).filter((s): s is number => s !== null);
  const averageQuizScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return {
    totalStudents: studentsCount.count ?? 0,
    activeStudents7d: activeCount ?? 0,
    totalQuizzesCompleted: scores.length,
    averageQuizScore,
    totalLessonsCompleted: lessonsCompleted.count ?? 0,
  };
}

export interface CompetencyStat {
  competencyName: string;
  subjectName: string | null;
  averageMastery: number;
  studentCount: number;
}

/**
 * Compétences les plus faibles en moyenne sur l'ensemble des élèves —
 * utile pour qu'un admin identifie où le contenu pédagogique mériterait
 * d'être renforcé (leçons/exercices supplémentaires).
 */
export async function getWeakestCompetencies(limit = 10): Promise<CompetencyStat[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("competency_progress")
    .select("mastery_score, competencies(name, domains(curriculums(subjects(name))))");

  const grouped = new Map<string, { name: string; subject: string | null; scores: number[] }>();
  for (const row of data ?? []) {
    const comp = (row as any).competencies;
    if (!comp) continue;
    const key = comp.name;
    const subject = comp.domains?.curriculums?.subjects?.name ?? null;
    if (!grouped.has(key)) grouped.set(key, { name: comp.name, subject, scores: [] });
    grouped.get(key)!.scores.push(row.mastery_score);
  }

  return Array.from(grouped.values())
    .map((g) => ({
      competencyName: g.name,
      subjectName: g.subject,
      averageMastery: Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length),
      studentCount: g.scores.length,
    }))
    .sort((a, b) => a.averageMastery - b.averageMastery)
    .slice(0, limit);
}
