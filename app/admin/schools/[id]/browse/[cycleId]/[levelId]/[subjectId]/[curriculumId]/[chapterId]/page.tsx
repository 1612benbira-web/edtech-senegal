import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Target } from "lucide-react";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { getSchoolById } from "@/lib/queries/school";
import { getChapterMeta, getLessonsForChapterBrowse } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function SchoolBrowseLessonsPage(
  props: {
    params: Promise<{
      id: string;
      cycleId: string;
      levelId: string;
      subjectId: string;
      curriculumId: string;
      chapterId: string;
    }>;
  }
) {
  const params = await props.params;
  await requireSchoolAccess(params.id);
  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const chapter = await getChapterMeta(params.chapterId);
  if (!chapter) notFound();

  const lessons = await getLessonsForChapterBrowse(params.chapterId);
  const totalExercises = lessons.reduce((sum, l) => sum + l.exerciseCount, 0);
  const base = `/admin/schools/${params.id}/browse/${params.cycleId}/${params.levelId}/${params.subjectId}/${params.curriculumId}`;

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[
          { label: "Bibliothèque", href: `/admin/schools/${params.id}/browse` },
          { label: chapter.curriculums?.subjects?.name ?? "Matière", href: base },
          { label: chapter.curriculums?.title ?? "Programme", href: base },
          { label: chapter.title },
        ]}
      />

      <AdminPageHeader
        icon={BookOpen}
        title={chapter.title}
        description={`${lessons.length} leçon(s) · ${totalExercises} exercice(s) au total.`}
      />

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Target className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">🎯 Quiz de ce chapitre</p>
          <p className="text-xs text-muted-foreground">
            Généré automatiquement pour chaque élève à partir des questions publiées de ce chapitre.
          </p>
        </div>
      </div>

      {lessons.length === 0 ? (
        <BrowseEmptyState message="Aucune leçon dans ce chapitre pour l'instant." />
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
