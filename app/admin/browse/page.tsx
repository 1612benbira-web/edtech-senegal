import Link from "next/link";
import { Library, GraduationCap } from "lucide-react";
import { requireAdmin } from "@/lib/services/adminGuard";
import { getCyclesOverview } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";

export const metadata = { title: "Bibliothèque pédagogique" };

/**
 * Point d'entrée de la navigation pédagogique Super Admin (points 7-9) :
 * Cycles → Niveaux → Matières → Programmes → Chapitres → Leçons →
 * Exercices → Questions. Purement une navigation en LECTURE : la
 * création/édition/suppression reste dans les pages /admin existantes
 * (voir ≠ modifier, point 10).
 */
export default async function BrowseCyclesPage() {
  await requireAdmin();
  const cycles = await getCyclesOverview();

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon={Library}
        title="Bibliothèque pédagogique"
        description="Parcours le contenu comme dans une bibliothèque : cycle → niveau → matière → programme → chapitre → leçon → exercice."
      />

      {cycles.length === 0 ? (
        <BrowseEmptyState message="Aucun cycle n'a encore été créé." />
      ) : (
        <BrowseGrid>
          {cycles.map((cycle) => (
            <BrowseCard
              key={cycle.id}
              href={`/admin/browse/${cycle.id}`}
              icon={<GraduationCap className="h-5 w-5" />}
              title={cycle.name}
              subtitle={cycle.code}
              counters={[{ label: "niveau(x)", value: cycle.levelCount }]}
            />
          ))}
        </BrowseGrid>
      )}

      <p className="text-xs text-muted-foreground">
        Pour créer ou modifier un cycle, un niveau, une série ou une matière, utilise les pages{" "}
        <Link href="/admin/levels" className="underline hover:text-foreground">
          Cycles &amp; niveaux
        </Link>{" "}
        et <Link href="/admin/subjects" className="underline hover:text-foreground">Matières</Link>.
      </p>
    </div>
  );
}
