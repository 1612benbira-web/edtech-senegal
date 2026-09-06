import { notFound } from "next/navigation";
import { Library, GraduationCap } from "lucide-react";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { getSchoolById } from "@/lib/queries/school";
import { getCyclesOverview } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";

/**
 * Navigation pédagogique School Admin (points 7-9), scopée à son école :
 * mêmes cycles/niveaux (taxonomie globale), mais à partir des Matières
 * seuls les programmes NATIONAUX ACTIVÉS pour cette école + les
 * programmes PROPRES à cette école sont visibles — jamais le contenu
 * privé d'une autre école (cf. getSubjectsOverviewForLevel(levelId,
 * schoolId) dans lib/queries/library.ts, et la RLS en dernier rempart).
 */
export default async function SchoolBrowseCyclesPage({ params }: { params: { id: string } }) {
  await requireSchoolAccess(params.id);
  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const cycles = await getCyclesOverview();

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon={Library}
        title={`Bibliothèque pédagogique — ${school.name}`}
        description="Parcours les programmes activés pour ton école et tes propres contenus, comme dans une bibliothèque."
      />

      {cycles.length === 0 ? (
        <BrowseEmptyState message="Aucun cycle n'a encore été créé." />
      ) : (
        <BrowseGrid>
          {cycles.map((cycle) => (
            <BrowseCard
              key={cycle.id}
              href={`/admin/schools/${params.id}/browse/${cycle.id}`}
              icon={<GraduationCap className="h-5 w-5" />}
              title={cycle.name}
              subtitle={cycle.code}
              counters={[{ label: "niveau(x)", value: cycle.levelCount }]}
            />
          ))}
        </BrowseGrid>
      )}
    </div>
  );
}
