import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const LIMIT = 6;

type SearchResult = {
  id: string;
  type: "programme" | "matiere" | "chapitre" | "lecon";
  title: string;
  subtitle?: string | null;
  href: string;
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("level_id, series_id")
    .eq("id", user.id)
    .single();

  if (!profile?.level_id) return NextResponse.json({ results: [] });

  const pattern = `%${query.replace(/[%_]/g, "\\$&")}%`;
  const seriesFilter = profile.series_id
    ? `series_id.is.null,series_id.eq.${profile.series_id}`
    : "series_id.is.null";

  // We deliberately filter related records in JavaScript instead of relying on
  // PostgREST nested ilike filters. This keeps search reliable across Supabase
  // relationship configurations and RLS policies.
  const [{ data: levelSubjects }, { data: curriculums }] = await Promise.all([
    supabase
      .from("level_subjects")
      .select("subject_id, series_id, subjects(id, name, icon)")
      .eq("level_id", profile.level_id),
    supabase
      .from("curriculums")
      .select("id, subject_id, title, description, series_id, subjects(name)")
      .eq("level_id", profile.level_id)
      .eq("status", "published")
      .or(seriesFilter)
      .limit(100),
  ]);

  const subjectRows = (levelSubjects ?? [])
    .filter((row: any) => row.series_id === null || row.series_id === profile.series_id)
    .map((row: any) => row.subjects)
    .filter(Boolean)
    .filter((subject: any) => subject.name?.toLowerCase().includes(query.toLowerCase()));

  const curriculumRows = (curriculums ?? []).filter((row: any) =>
    row.title?.toLowerCase().includes(query.toLowerCase())
  ) as any[];

  const curriculumIds = (curriculums ?? []).map((row: any) => row.id);
  let chapterRows: any[] = [];
  if (curriculumIds.length > 0) {
    const { data } = await supabase
      .from("chapters")
      .select("id, curriculum_id, title, curriculums(subject_id, subjects(name))")
      .in("curriculum_id", curriculumIds)
      .eq("status", "published")
      .is("deleted_at", null)
      .ilike("title", pattern)
      .limit(LIMIT);
    chapterRows = data ?? [];
  }

  const chapterIds = chapterRows.map((row) => row.id);
  let lessonRows: any[] = [];
  if (chapterIds.length > 0) {
    const { data } = await supabase
      .from("lessons")
      .select("id, chapter_id, title, chapters(title, curriculum_id, curriculums(subject_id, subjects(name)))")
      .in("chapter_id", chapterIds)
      .eq("status", "published")
      .is("deleted_at", null)
      .ilike("title", pattern)
      .limit(LIMIT);
    lessonRows = data ?? [];
  } else if (curriculumIds.length > 0) {
    const { data: chapters } = await supabase
      .from("chapters")
      .select("id, curriculum_id")
      .in("curriculum_id", curriculumIds)
      .eq("status", "published")
      .is("deleted_at", null)
      .limit(500);
    const allChapterIds = (chapters ?? []).map((row: any) => row.id);
    if (allChapterIds.length > 0) {
      const { data } = await supabase
        .from("lessons")
        .select("id, chapter_id, title, chapters(title, curriculum_id, curriculums(subject_id, subjects(name)))")
        .in("chapter_id", allChapterIds)
        .eq("status", "published")
        .is("deleted_at", null)
        .ilike("title", pattern)
        .limit(LIMIT);
      lessonRows = data ?? [];
    }
  }

  const results: SearchResult[] = [
    ...curriculumRows.slice(0, LIMIT).map((row) => ({
      id: row.id,
      type: "programme" as const,
      title: row.title,
      subtitle: row.subjects?.name ?? null,
      href: `/programme/${row.subject_id}`,
    })),
    ...subjectRows.slice(0, LIMIT).map((subject: any) => ({
      id: subject.id,
      type: "matiere" as const,
      title: subject.name,
      subtitle: "Matière",
      href: `/programme/${subject.id}`,
    })),
    ...chapterRows.map((row) => ({
      id: row.id,
      type: "chapitre" as const,
      title: row.title,
      subtitle: row.curriculums?.subjects?.name ?? null,
      href: `/programme/${row.curriculums?.subject_id ?? ""}/${row.id}`,
    })),
    ...lessonRows.map((row) => ({
      id: row.id,
      type: "lecon" as const,
      title: row.title,
      subtitle: row.chapters?.title ?? null,
      href: `/lesson/${row.id}`,
    })),
  ];

  return NextResponse.json({ results: results.slice(0, 24) });
}
