import { createClient } from "@/lib/supabase/server";

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalLessons: number;
  completedLessons: number;
  percent: number;
}

/**
 * Progression de complétion des leçons par matière, pour les matières
 * choisies par l'élève. Calculée à la demande (pas stockée en continu),
 * conformément à l'architecture validée en amont — seul
 * `competency_progress.mastery_score` est persisté.
 */
export async function getSubjectsProgress(
  profileId: string,
  levelId: string
): Promise<SubjectProgress[]> {
  const supabase = await createClient();

  const { data: profileSubjects } = await supabase
    .from("profile_subjects")
    .select("subjects(id, name)")
    .eq("profile_id", profileId);

  const results: SubjectProgress[] = [];

  for (const ps of profileSubjects ?? []) {
    const subject = (ps as any).subjects;
    if (!subject) continue;

    const { data: curriculums } = await supabase
      .from("curriculums")
      .select("id")
      .eq("subject_id", subject.id)
      .eq("level_id", levelId)
      .eq("status", "published");
    const curriculumIds = (curriculums ?? []).map((c) => c.id);

    let totalLessons = 0;
    let completedLessons = 0;

    if (curriculumIds.length > 0) {
      const { data: chapters } = await supabase
        .from("chapters")
        .select("id")
        .in("curriculum_id", curriculumIds)
        .eq("status", "published");
      const chapterIds = (chapters ?? []).map((c) => c.id);

      if (chapterIds.length > 0) {
        const { data: lessons } = await supabase
          .from("lessons")
          .select("id")
          .in("chapter_id", chapterIds)
          .eq("status", "published");
        const lessonIds = (lessons ?? []).map((l) => l.id);
        totalLessons = lessonIds.length;

        if (lessonIds.length > 0) {
          const { count } = await supabase
            .from("lesson_progress")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", profileId)
            .eq("status", "completed")
            .in("lesson_id", lessonIds);
          completedLessons = count ?? 0;
        }
      }
    }

    results.push({
      subjectId: subject.id,
      subjectName: subject.name,
      totalLessons,
      completedLessons,
      percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    });
  }

  return results;
}

export interface CompetencyMastery {
  competencyId: string;
  competencyName: string;
  subjectName: string | null;
  masteryScore: number;
  attemptsCount: number;
}

export async function getCompetencyMasteryList(profileId: string): Promise<CompetencyMastery[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("competency_progress")
    .select(
      "competency_id, mastery_score, attempts_count, competencies(name, domains(curriculums(subjects(name))))"
    )
    .eq("profile_id", profileId)
    .order("mastery_score", { ascending: true });

  return (data ?? []).map((row: any) => ({
    competencyId: row.competency_id,
    competencyName: row.competencies?.name ?? "?",
    subjectName: row.competencies?.domains?.curriculums?.subjects?.name ?? null,
    masteryScore: row.mastery_score,
    attemptsCount: row.attempts_count,
  }));
}

export interface QuizStats {
  totalCompleted: number;
  averageScore: number;
}

export async function getQuizStats(profileId: string): Promise<QuizStats> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select("score")
    .eq("profile_id", profileId)
    .not("completed_at", "is", null);

  const scores = (data ?? []).map((q) => q.score).filter((s): s is number => s !== null);
  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return { totalCompleted: scores.length, averageScore };
}
