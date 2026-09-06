import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { requireAdmin } from "@/lib/services/adminGuard";
import { getLevels } from "@/lib/queries/curriculum";
import { getSubjectsOverviewForLevel } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function BrowseSubjectsPage({
  params,
}: {
  params: { cycleId: string; levelId: string };
}) {
  await requireAdmin();
  const levels = await getLevels(params.cycleId);
  const level = (levels ?? []).find((l: any) => l.id === params.levelId);
  if (!level) notFound();

  const subjects = await getSubjectsOverviewForLevel(params.levelId);

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[
          { label: "Bibliothèque", href: "/admin/browse" },
          { label: level.school_cycles?.name ?? "Cycle", href: `/admin/browse/${params.cycleId}` },
          { label: level.name },
        ]}
      />

      <AdminPageHeader icon={BookOpen} title={level.name} description={`${subjects.length} matière(s) associée(s) à ce niveau.`} />

      {subjects.length === 0 ? (
        <BrowseEmptyState message="Aucune matière associée à ce niveau pour l'instant (voir Matières dans l'admin)." />
      ) : (
        <BrowseGrid>
          {subjects.map((subject) => (
            <BrowseCard
              key={subject.subjectId}
              href={`/admin/browse/${params.cycleId}/${params.levelId}/${subject.subjectId}`}
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
