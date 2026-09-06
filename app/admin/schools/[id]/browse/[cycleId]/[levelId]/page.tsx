import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { getSchoolById } from "@/lib/queries/school";
import { getLevels } from "@/lib/queries/curriculum";
import { getSubjectsOverviewForLevel } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function SchoolBrowseSubjectsPage({
  params,
}: {
  params: { id: string; cycleId: string; levelId: string };
}) {
  await requireSchoolAccess(params.id);
  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const levels = await getLevels(params.cycleId);
  const level = (levels ?? []).find((l: any) => l.id === params.levelId);
  if (!level) notFound();

  // Le paramètre schoolId ici est ce qui scope réellement la vue : seuls
  // les programmes activés pour CETTE école + ses propres programmes
  // sont comptés (voir lib/queries/library.ts).
  const subjects = await getSubjectsOverviewForLevel(params.levelId, params.id);

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[
          { label: "Bibliothèque", href: `/admin/schools/${params.id}/browse` },
          { label: level.school_cycles?.name ?? "Cycle", href: `/admin/schools/${params.id}/browse/${params.cycleId}` },
          { label: level.name },
        ]}
      />

      <AdminPageHeader
        icon={BookOpen}
        title={level.name}
        description="Uniquement les programmes activés pour ton école et tes propres contenus."
      />

      {subjects.filter((s) => s.curriculumCount > 0).length === 0 ? (
        <BrowseEmptyState message="Aucun programme activé ou propre à ton école pour ce niveau. Active un programme national ou crée ton propre contenu." />
      ) : (
        <BrowseGrid>
          {subjects
            .filter((s) => s.curriculumCount > 0)
            .map((subject) => (
              <BrowseCard
                key={subject.subjectId}
                href={`/admin/schools/${params.id}/browse/${params.cycleId}/${params.levelId}/${subject.subjectId}`}
                icon={<span className="text-lg">{subject.subjectIcon ?? "📘"}</span>}
                title={subject.subjectName}
                counters={[{ label: "programme(s)", value: subject.curriculumCount }]}
              />
            ))}
        </BrowseGrid>
      )}
    </div>
  );
}
