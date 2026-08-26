import { GitFork } from "lucide-react";
import { getLevels, getSeries } from "@/lib/queries/curriculum";
import { createSeriesAction, deleteSeriesAction } from "../curriculum-actions";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminItemRow } from "@/components/admin/admin-item-row";

export default async function SeriesAdminPage() {
  const levels = await getLevels();
  const series = await getSeries();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={GitFork}
        title="Séries"
        description="Les séries (S1, S2, L, G...) ne sont pas prédéfinies par l'application — crée ici uniquement celles correspondant au référentiel officiel vérifié pour chaque niveau du secondaire."
      />

      <AdminSection title="Ajouter une série" contentClassName="max-w-md">
        <AdminForm
          action={createSeriesAction}
          submitLabel="Ajouter la série"
          fields={[
            {
              name: "levelId",
              label: "Niveau",
              type: "select",
              options: levels.map((l: any) => ({ value: l.id, label: l.name })),
            },
            { name: "code", label: "Code (ex: S2)" },
            { name: "name", label: "Nom (ex: Sciences expérimentales)" },
          ]}
        />

        <ul className="mt-4 space-y-2">
          {series.map((s: any) => (
            <li key={s.id}>
              <AdminItemRow
                icon={<GitFork className="h-3.5 w-3.5" aria-hidden="true" />}
                title={s.name}
                subtitle={`${s.code} — ${s.school_levels?.name}`}
                actions={
                  <DeleteButton
                    action={deleteSeriesAction}
                    id={s.id}
                    confirmMessage={`Supprimer la série "${s.name}" ?`}
                  />
                }
              />
            </li>
          ))}
          {series.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune série pour l'instant.</p>
          )}
        </ul>
      </AdminSection>
    </div>
  );
}
