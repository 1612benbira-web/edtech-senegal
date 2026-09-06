import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { requireAdmin } from "@/lib/services/adminGuard";
import { getCyclesOverview, getLevelsOverview } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function BrowseLevelsPage({ params }: { params: { cycleId: string } }) {
  await requireAdmin();
  const cycles = await getCyclesOverview();
  const cycle = cycles.find((c) => c.id === params.cycleId);
  if (!cycle) notFound();

  const levels = await getLevelsOverview(params.cycleId);

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb crumbs={[{ label: "Bibliothèque", href: "/admin/browse" }, { label: cycle.name }]} />

      <AdminPageHeader icon={Layers} title={cycle.name} description={`${levels.length} niveau(x) dans ce cycle.`} />

      {levels.length === 0 ? (
        <BrowseEmptyState message="Aucun niveau dans ce cycle pour l'instant." />
      ) : (
        <BrowseGrid>
          {levels.map((level) => (
            <BrowseCard
              key={level.id}
              href={`/admin/browse/${params.cycleId}/${level.id}`}
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
