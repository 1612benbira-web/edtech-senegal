import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChapterById } from "@/lib/queries/curriculums-detail";
import type { OfflineChapter } from "@/lib/offline/chapterStore";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Contenu d'un chapitre (ses leçons publiées) pour le téléchargement hors
 * connexion. Mêmes règles que la page du chapitre : élève connecté, chapitre
 * publié et de son niveau. Les lectures passent par la session de l'élève,
 * donc par les règles d'accès de la base (RLS).
 */
export async function GET(_request: Request, context: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await context.params;
  if (!UUID_RE.test(chapterId)) {
    return NextResponse.json({ error: "Chapitre introuvable." }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Connecte-toi pour télécharger un chapitre." }, { status: 401 });
  }

  const [{ data: profile }, chapter] = await Promise.all([
    supabase.from("profiles").select("level_id").eq("id", user.id).single(),
    getChapterById(chapterId),
  ]);
  const curriculum = (
    chapter as unknown as { curriculums: { title: string; subject_id: string; level_id: string } | null } | null
  )?.curriculums;
  if (!chapter || !curriculum || !profile?.level_id || curriculum.level_id !== profile.level_id) {
    return NextResponse.json({ error: "Chapitre introuvable." }, { status: 404 });
  }

  const [{ data: lessons, error }, { data: subject }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, order, content_md, objectives, summary")
      .eq("chapter_id", chapterId)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("order"),
    supabase.from("subjects").select("name").eq("id", curriculum.subject_id).maybeSingle(),
  ]);
  if (error) {
    console.error("[offline] lecture des leçons impossible:", error.message);
    return NextResponse.json({ error: "Le chapitre n'a pas pu être préparé. Réessaie." }, { status: 500 });
  }

  const payload: OfflineChapter = {
    id: chapter.id,
    title: chapter.title,
    subjectId: curriculum.subject_id,
    subjectName: subject?.name ?? "Matière",
    curriculumTitle: curriculum.title ?? null,
    savedAt: new Date().toISOString(),
    lessons: (lessons ?? []).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      order: lesson.order,
      contentMd: lesson.content_md,
      objectives: lesson.objectives ?? [],
      summary: lesson.summary,
    })),
  };

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
