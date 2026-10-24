import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LIMITS, rateLimit } from "@/lib/security/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

const LIMIT = 6;

type SearchResult = {
  id: string;
  type: "programme" | "matiere" | "chapitre" | "lecon" | "exercice";
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

  const limited = await rateLimit("search:user", user.id, LIMITS.searchUser);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Trop de recherches, réessaie dans un instant." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("level_id, series_id")
    .eq("id", user.id)
    .single();

  if (!profile?.level_id) return NextResponse.json({ results: [] });

  const pattern = `%${query.replace(/[%_]/g, "\\$&")}%`;
  // L'identifiant de série est interpolé dans un filtre PostgREST (.or) : on
  // n'accepte qu'un vrai UUID, jamais une chaîne arbitraire.
  const seriesId = profile.series_id && UUID_RE.test(profile.series_id) ? profile.series_id : null;
  const seriesFilter = seriesId
    ? `series_id.is.null,series_id.eq.${seriesId}`
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

  // Chapitres à considérer pour chercher des LEÇONS / EXERCICES : TOUS les
  // chapitres publiés des curriculums trouvés, pas seulement ceux dont le
  // TITRE correspond à la requête (chapterRows ci-dessus).
  //
  // Bug corrigé : la version précédente restreignait la recherche de
  // leçons aux seuls `chapterIds` (chapitres dont le titre matchait), et
  // ne retombait sur une recherche large que si AUCUN chapitre ne
  // matchait. Résultat : si la requête matchait à la fois un chapitre ET
  // une leçon d'un AUTRE chapitre, cette dernière n'était jamais trouvée
  // — par exemple chercher "Fractions" avec un chapitre nommé "Fractions"
  // masquait toute leçon "Introduction aux fractions" située dans un
  // chapitre au nom différent.
  let allChapterIds: string[] = [];
  if (curriculumIds.length > 0) {
    const { data: chapters } = await supabase
      .from("chapters")
      .select("id, curriculum_id")
      .in("curriculum_id", curriculumIds)
      .eq("status", "published")
      .is("deleted_at", null)
      .limit(500);
    allChapterIds = (chapters ?? []).map((row: any) => row.id);
  }

  let lessonRows: any[] = [];
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

  // Exercices — recherchés sur le même périmètre de chapitres (leurs
  // leçons), avec le même filtrage RLS que le reste (exercises_select_published,
  // migration 0019) : un exercice privé d'une AUTRE école n'apparaîtra
  // jamais ici, ce n'est pas nécessaire de le refiltrer manuellement.
  let exerciseRows: any[] = [];
  if (allChapterIds.length > 0) {
    const { data: lessonsForExercises } = await supabase
      .from("lessons")
      .select("id")
      .in("chapter_id", allChapterIds)
      .eq("status", "published")
      .is("deleted_at", null)
      .limit(2000);
    const lessonIdsForExercises = (lessonsForExercises ?? []).map((row: any) => row.id);

    if (lessonIdsForExercises.length > 0) {
      const { data } = await supabase
        .from("exercises")
        .select("id, lesson_id, title, lessons(title, chapters(title, curriculum_id, curriculums(subject_id, subjects(name))))")
        .in("lesson_id", lessonIdsForExercises)
        .eq("status", "published")
        .is("deleted_at", null)
        .ilike("title", pattern)
        .limit(LIMIT);
      exerciseRows = data ?? [];
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
    ...exerciseRows.map((row) => ({
      id: row.id,
      type: "exercice" as const,
      title: row.title,
      subtitle: row.lessons?.title ?? null,
      href: `/exercise/${row.id}`,
    })),
  ];

  return NextResponse.json({ results: results.slice(0, 24) });
}
