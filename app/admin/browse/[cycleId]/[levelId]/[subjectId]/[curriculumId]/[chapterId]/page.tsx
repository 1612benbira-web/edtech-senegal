import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Target } from "lucide-react";
import { requireAdmin } from "@/lib/services/adminGuard";
import { getChapterMeta, getLessonsForChapterBrowse } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function BrowseLessonsPage({
  params,
}: {
  params: { cycleId: string; levelId: string; subjectId: string; curriculumId: string; chapterId: string };
}) {
  await requireAdmin();
  const chapter = await getChapterMeta(params.chapterId);
  if (!chapter) notFound();

  const lessons = await getLessonsForChapterBrowse(params.chapterId);
  const totalExercises = lessons.reduce((sum, l) => sum + l.exerciseCount, 0);
  const base = `/admin/browse/${params.cycleId}/${params.levelId}/${params.subjectId}/${params.curriculumId}`;

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[
          { label: "Bibliothèque", href: "/admin/browse" },
          { label: chapter.curriculums?.subjects?.name ?? "Matière", href: base },
          { label: chapter.curriculums?.title ?? "Programme", href: base },
          { label: chapter.title },
        ]}
      />

      <AdminPageHeader
        icon={BookOpen}
        title={chapter.title}
        description={
          <>
            {lessons.length} leçon(s) · {totalExercises} exercice(s) au total.{" "}
            <Link href="/admin/chapters" className="underline hover:text-foreground">
              Modifier ce chapitre
            </Link>
          </>
        }
      />

      {/* 🎯 Résumé quiz : les quiz sont générés à la volée par chapitre
          (voir lib/services/quizGenerationService.ts), il n'y a pas de
          quiz "statique" à lister — on affiche le vivier de questions
          disponibles pour ce chapitre. */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Target className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">🎯 Quiz de ce chapitre</p>
          <p className="text-xs text-muted-foreground">
            Généré automatiquement pour chaque élève à partir des questions publiées de ce chapitre — pas de contenu à éditer ici.
          </p>
        </div>
      </div>

      {lessons.length === 0 ? (
        <BrowseEmptyState message="Aucune leçon dans ce chapitre pour l'instant (voir Leçons dans l'admin pour en créer une)." />
      ) : (
        <BrowseGrid>
          {lessons.map((lesson) => (
            <BrowseCard
              key={lesson.id}
              href={`${base}/${params.chapterId}/${lesson.id}`}
              icon={<BookOpen className="h-5 w-5" />}
              title={lesson.title}
              status={lesson.status}
              counters={[{ label: "exercice(s)", value: lesson.exerciseCount }]}
            />
          ))}
        </BrowseGrid>
      )}
    </div>
  );
}
