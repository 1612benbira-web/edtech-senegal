import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { getChapterById } from "@/lib/queries/curriculums-detail";
import { getPublishedLessonsForChapter } from "@/lib/queries/lessons";
import { getMyProgramme } from "@/lib/queries/programme";
import { createClient } from "@/lib/supabase/server";
import { startChapterQuizAction } from "@/app/(app)/quiz/actions";
import { StartQuizButton } from "@/components/quiz/start-quiz-button";

export default async function ChapterPage({
  params,
}: {
  params: { subject: string; chapter: string };
}) {
  const chapter = await getChapterById(params.chapter);
  if (!chapter) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("level_id, series_id").eq("id", user!.id).single();
  if (!profile?.level_id || (chapter as any).curriculums?.level_id !== profile.level_id) notFound();

  const lessons = await getPublishedLessonsForChapter(params.chapter);
  const programmes = await getMyProgramme(user!.id, profile.level_id, profile.series_id);
  const subjectProgramme = programmes.find((program) => program.subjectId === (chapter as any).curriculums?.subject_id);
  const chapterProgress = subjectProgramme?.chapters.find((item) => item.id === params.chapter);

  const { data: siblingChapters } = await supabase
    .from("chapters")
    .select("id, title, order")
    .eq("curriculum_id", (chapter as any).curriculum_id)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("order");
  const chapterIndex = (siblingChapters ?? []).findIndex((c) => c.id === chapter.id);
  const previousChapter = chapterIndex > 0 ? siblingChapters![chapterIndex - 1] : null;
  const nextChapter = chapterIndex >= 0 && chapterIndex < (siblingChapters ?? []).length - 1 ? siblingChapters![chapterIndex + 1] : null;

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("profile_id", user!.id)
    .in("lesson_id", lessons.map((l) => l.id));

  const progressByLesson = new Map(
    (progressRows ?? []).map((p) => [p.lesson_id, p.status])
  );

  return (
    <div className="space-y-6">
      <Link
        href={`/programme/${params.subject}`}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour aux chapitres
      </Link>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Chapitre</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">{chapter.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{(chapter as any).curriculums?.title}</p>
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Progression du chapitre</span><span className="font-semibold text-foreground">{chapterProgress?.percent ?? 0}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${chapterProgress?.percent ?? 0}%` }} /></div>
          {chapterProgress?.completed && (
            <p className="mt-2 text-xs font-semibold text-success">✓ Chapitre terminé</p>
          )}
        </div>
      </section>

      <div className="space-y-2">
        {lessons.map((lesson) => {
          const status = progressByLesson.get(lesson.id);
          return (
            <Link
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <span className="font-medium text-foreground">{lesson.title}</span>
              {status === "completed" ? (
                <span className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Terminé
                </span>
              ) : status === "in_progress" ? (
                <span className="text-xs text-warning-foreground">En cours</span>
              ) : (
                <span className="text-xs text-muted-foreground">À découvrir</span>
              )}
            </Link>
          );
        })}
        {lessons.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aucune leçon publiée pour l&apos;instant dans ce chapitre.
          </div>
        )}
      </div>

      {lessons.length > 0 && (
        <div className="mt-6">
          <StartQuizButton
            action={startChapterQuizAction}
            arg={params.chapter}
            label="Faire le quiz de ce chapitre"
          />
        </div>
      )}
      {(previousChapter || (nextChapter && chapterProgress?.completed)) && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {previousChapter ? (
            <Link href={`/programme/${params.subject}/${previousChapter.id}`} className="rounded-2xl border border-border bg-card p-4 text-sm font-semibold text-foreground hover:border-primary/40">
              <span className="flex items-center gap-2 text-xs text-muted-foreground"><ArrowLeft className="h-3.5 w-3.5" />Chapitre précédent</span>
              <span className="mt-1 block truncate">{previousChapter.title}</span>
            </Link>
          ) : <div />}
          {nextChapter && chapterProgress?.completed ? (
            <Link href={`/programme/${params.subject}/${nextChapter.id}`} className="rounded-2xl bg-primary p-4 text-right text-sm font-semibold text-primary-foreground hover:opacity-90">
              <span className="flex items-center justify-end gap-2 text-xs opacity-80">Chapitre suivant<ArrowRight className="h-3.5 w-3.5" /></span>
              <span className="mt-1 block truncate">{nextChapter.title}</span>
            </Link>
          ) : <div />}
        </div>
      )}
    </div>
  );
}
