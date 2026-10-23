import Link from "next/link";
import { notFound } from "next/navigation";
import { BookText } from "lucide-react";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { getSchoolById } from "@/lib/queries/school";
import { getCurriculumMeta, getChaptersForCurriculum } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function SchoolBrowseChaptersPage(
  props: {
    params: Promise<{ id: string; cycleId: string; levelId: string; subjectId: string; curriculumId: string }>;
  }
) {
  const params = await props.params;
  await requireSchoolAccess(params.id);
  const school = await getSchoolById(params.id);
  if (!school) notFound();

  // getCurriculumMeta utilise le client de session : la RLS
  // (curriculums_select_published, migration 0019/0020) renvoie null si
  // ce programme n'est ni national activé ni propre à cette école — la
  // page fait alors un 404 plutôt que d'exposer le contenu d'une autre
  // école, même si l'admin modifie l'URL directement.
  const curriculum = await getCurriculumMeta(params.curriculumId);
  if (!curriculum) notFound();

  const chapters = await getChaptersForCurriculum(params.curriculumId);
  const base = `/admin/schools/${params.id}/browse/${params.cycleId}/${params.levelId}/${params.subjectId}`;

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[
          { label: "Bibliothèque", href: `/admin/schools/${params.id}/browse` },
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
            {curriculum.school_id === params.id && (
              <Link href={`/admin/schools/${params.id}/content`} className="underline hover:text-foreground">
                Modifier ce programme
              </Link>
            )}
          </>
        }
      />

      {chapters.length === 0 ? (
        <BrowseEmptyState message="Aucun chapitre dans ce programme pour l'instant." />
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
