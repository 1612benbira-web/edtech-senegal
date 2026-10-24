import { notFound } from "next/navigation";
import { PenSquare, HelpCircle } from "lucide-react";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { getSchoolById } from "@/lib/queries/school";
import { getLessonMeta, getExercisesForLessonBrowse } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function SchoolBrowseLessonDetailPage(
  props: {
    params: Promise<{
      id: string;
      cycleId: string;
      levelId: string;
      subjectId: string;
      curriculumId: string;
      chapterId: string;
      lessonId: string;
    }>;
  }
) {
  const params = await props.params;
  await requireSchoolAccess(params.id);
  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const lesson = await getLessonMeta(params.lessonId);
  if (!lesson) notFound();

  const exercises = await getExercisesForLessonBrowse(params.lessonId);
  const chapterBase = `/admin/schools/${params.id}/browse/${params.cycleId}/${params.levelId}/${params.subjectId}/${params.curriculumId}/${params.chapterId}`;

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[
          { label: "Bibliothèque", href: `/admin/schools/${params.id}/browse` },
          { label: lesson.chapters?.curriculums?.subjects?.name ?? "Matière", href: chapterBase },
          { label: lesson.chapters?.title ?? "Chapitre", href: chapterBase },
          { label: lesson.title },
        ]}
      />

      <AdminPageHeader icon={PenSquare} title={lesson.title} description={<StatusBadge status={lesson.status} />} />

      {lesson.summary && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Résumé</p>
          <p className="mt-1 text-sm text-foreground">{lesson.summary}</p>
        </div>
      )}

      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
          <HelpCircle className="h-4 w-4" /> Exercices ({exercises.length})
        </h2>
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun exercice pour cette leçon pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-2">
            {exercises.map((exercise) => (
              <li
                key={exercise.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{exercise.title}</p>
                  <p className="text-xs text-muted-foreground">{exercise.questionCount} question(s)</p>
                </div>
                <StatusBadge status={exercise.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
