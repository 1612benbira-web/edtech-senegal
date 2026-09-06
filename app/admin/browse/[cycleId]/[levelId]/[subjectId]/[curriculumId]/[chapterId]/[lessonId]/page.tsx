import Link from "next/link";
import { notFound } from "next/navigation";
import { PenSquare, HelpCircle } from "lucide-react";
import { requireAdmin } from "@/lib/services/adminGuard";
import { getLessonMeta, getExercisesForLessonBrowse } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function BrowseLessonDetailPage({
  params,
}: {
  params: {
    cycleId: string;
    levelId: string;
    subjectId: string;
    curriculumId: string;
    chapterId: string;
    lessonId: string;
  };
}) {
  await requireAdmin();
  const lesson = await getLessonMeta(params.lessonId);
  if (!lesson) notFound();

  const exercises = await getExercisesForLessonBrowse(params.lessonId);
  const chapterBase = `/admin/browse/${params.cycleId}/${params.levelId}/${params.subjectId}/${params.curriculumId}/${params.chapterId}`;

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[
          { label: "Bibliothèque", href: "/admin/browse" },
          { label: lesson.chapters?.curriculums?.subjects?.name ?? "Matière", href: chapterBase },
          { label: lesson.chapters?.title ?? "Chapitre", href: chapterBase },
          { label: lesson.title },
        ]}
      />

      <AdminPageHeader
        icon={PenSquare}
        title={lesson.title}
        description={
          <>
            <StatusBadge status={lesson.status} />{" "}
            <Link href="/admin/lessons" className="ml-2 underline hover:text-foreground">
              Modifier cette leçon
            </Link>
          </>
        }
      />

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
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={exercise.status} />
                  <Link href="/admin/questions" className="text-xs font-semibold text-primary hover:underline">
                    Voir les questions
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
