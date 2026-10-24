import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { getSchoolById } from "@/lib/queries/school";
import { getCyclesOverview, getLevelsOverview } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function SchoolBrowseLevelsPage(
  props: {
    params: Promise<{ id: string; cycleId: string }>;
  }
) {
  const params = await props.params;
  await requireSchoolAccess(params.id);
  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const cycles = await getCyclesOverview();
  const cycle = cycles.find((c) => c.id === params.cycleId);
  if (!cycle) notFound();

  const levels = await getLevelsOverview(params.cycleId);

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[{ label: "Bibliothèque", href: `/admin/schools/${params.id}/browse` }, { label: cycle.name }]}
      />

      <AdminPageHeader icon={Layers} title={cycle.name} description={`${levels.length} niveau(x) dans ce cycle.`} />

      {levels.length === 0 ? (
        <BrowseEmptyState message="Aucun niveau dans ce cycle pour l'instant." />
      ) : (
        <BrowseGrid>
          {levels.map((level) => (
            <BrowseCard
              key={level.id}
              href={`/admin/schools/${params.id}/browse/${params.cycleId}/${level.id}`}
              icon={<Layers className="h-5 w-5" />}
              title={level.name}
              subtitle={level.code}
            />
          ))}
        </BrowseGrid>
      )}
    </div>
  );
}
