import { Layers, GitBranch } from "lucide-react";
import { getCycles, getLevels } from "@/lib/queries/curriculum";
import { createCycleAction, createLevelAction, deleteCycleAction, deleteLevelAction } from "../curriculum-actions";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminItemRow } from "@/components/admin/admin-item-row";

export default async function LevelsAdminPage() {
  const cycles = await getCycles();
  const levels = await getLevels();

  return (
    <div className="space-y-6">
      <AdminPageHeader icon={Layers} title="Cycles & Niveaux" />

      <AdminSection title="Ajouter un cycle" contentClassName="max-w-md">
        <AdminForm
          action={createCycleAction}
          submitLabel="Ajouter le cycle"
          fields={[
            { name: "code", label: "Code (ex: elementaire)" },
            { name: "name", label: "Nom (ex: Enseignement élémentaire)" },
            { name: "order", label: "Ordre d'affichage", type: "number" },
          ]}
        />

        <ul className="mt-4 space-y-2">
          {cycles.map((cycle) => (
            <li key={cycle.id}>
              <AdminItemRow
                icon={<Layers className="h-3.5 w-3.5" aria-hidden="true" />}
                title={cycle.name}
                subtitle={cycle.code}
                actions={
                  <DeleteButton
                    action={deleteCycleAction}
                    id={cycle.id}
                    confirmMessage={`Supprimer le cycle "${cycle.name}" ? Cela échouera si des niveaux y sont encore rattachés.`}
                  />
                }
              />
            </li>
          ))}
          {cycles.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun cycle pour l&apos;instant.</p>
          )}
        </ul>
      </AdminSection>

      <AdminSection title="Ajouter un niveau (classe)" contentClassName="max-w-md">
        <AdminForm
          action={createLevelAction}
          submitLabel="Ajouter le niveau"
          fields={[
            {
              name: "cycleId",
              label: "Cycle",
              type: "select",
              options: cycles.map((c) => ({ value: c.id, label: c.name })),
            },
            { name: "code", label: "Code (ex: 6e)" },
            { name: "name", label: "Nom (ex: 6e)" },
            { name: "order", label: "Ordre d'affichage", type: "number" },
          ]}
        />

        <ul className="mt-4 space-y-2">
          {levels.map((level: any) => (
            <li key={level.id}>
              <AdminItemRow
                icon={<GitBranch className="h-3.5 w-3.5" aria-hidden="true" />}
                title={level.name}
                subtitle={`${level.code} — ${level.school_cycles?.name}`}
                actions={
                  <DeleteButton
                    action={deleteLevelAction}
                    id={level.id}
                    confirmMessage={`Supprimer le niveau "${level.name}" ? Cela échouera si des programmes, séries ou matières y sont encore rattachés.`}
                  />
                }
              />
            </li>
          ))}
          {levels.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun niveau pour l&apos;instant.</p>
          )}
        </ul>
      </AdminSection>
    </div>
  );
}
