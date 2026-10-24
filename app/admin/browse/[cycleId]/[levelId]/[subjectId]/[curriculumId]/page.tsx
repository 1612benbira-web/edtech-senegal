import Link from "next/link";
import { notFound } from "next/navigation";
import { BookText } from "lucide-react";
import { requireAdmin } from "@/lib/services/adminGuard";
import { getCurriculumMeta, getChaptersForCurriculum } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function BrowseChaptersPage(
  props: {
    params: Promise<{ cycleId: string; levelId: string; subjectId: string; curriculumId: string }>;
  }
) {
  const params = await props.params;
  await requireAdmin();
  const curriculum = await getCurriculumMeta(params.curriculumId);
  if (!curriculum) notFound();

  const chapters = await getChaptersForCurriculum(params.curriculumId);
  const base = `/admin/browse/${params.cycleId}/${params.levelId}/${params.subjectId}`;

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[
          { label: "Bibliothèque", href: "/admin/browse" },
          { label: "Niveau", href: `/admin/browse/${params.cycleId}` },
          { label: curriculum.subjects?.name ?? "Matière", href: base },
          { label: curriculum.title },
        ]}
      />

      <AdminPageHeader
        icon={BookText}
        title={curriculum.title}
        description={
          <>
            {curriculum.school_levels?.name} · {curriculum.subjects?.name} · {chapters.length} chapitre(s).{" "}
            <Link href="/admin/curriculums" className="underline hover:text-foreground">
              Modifier ce programme
            </Link>
          </>
        }
      />

      {chapters.length === 0 ? (
        <BrowseEmptyState message="Aucun chapitre dans ce programme pour l'instant (voir Chapitres dans l'admin pour en créer un)." />
      ) : (
        <BrowseGrid>
          {chapters.map((chapter) => (
            <BrowseCard
              key={chapter.id}
              href={`${base}/${params.curriculumId}/${chapter.id}`}
              icon={<BookText className="h-5 w-5" />}
              title={chapter.title}
              status={chapter.status}
              counters={[
                { label: "leçon(s)", value: chapter.lessonCount },
                { label: "exercice(s)", value: chapter.exerciseCount },
                { label: "question(s)", value: chapter.questionCount },
              ]}
            />
          ))}
        </BrowseGrid>
      )}
    </div>
  );
}
