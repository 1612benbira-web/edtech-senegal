import { BookMarked } from "lucide-react";
import { getSubjects, getLevels, getSeries } from "@/lib/queries/curriculum";
import { createClient } from "@/lib/supabase/server";
import {
  createSubjectAction,
  assignSubjectToLevelAction,
  deleteSubjectAction,
} from "../curriculum-actions";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { getSubjectTheme } from "@/lib/constants/subject-theme";

export default async function SubjectsAdminPage() {
  const [subjects, levels, series] = await Promise.all([
    getSubjects(),
    getLevels(),
    getSeries(),
  ]);

  const supabase = await createClient();
  const { data: levelSubjects } = await supabase
    .from("level_subjects")
    .select("*, subjects(name), school_levels(name), school_series(name)")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-6">
      <AdminPageHeader icon={BookMarked} title="Matières" />

      <AdminSection title="Créer une matière" contentClassName="max-w-md">
        <AdminForm
          action={createSubjectAction}
          submitLabel="Créer la matière"
          fields={[
            { name: "code", label: "Code (ex: mathematiques)" },
            { name: "name", label: "Nom (ex: Mathématiques)" },
            { name: "icon", label: "Icône (optionnel, ex: calculator)" },
          ]}
        />

        <ul className="mt-4 flex flex-wrap gap-2">
          {subjects.map((s) => {
            const theme = getSubjectTheme(s.name, s.icon);
            return (
              <li
                key={s.id}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
              >
                <theme.Icon className={`h-3.5 w-3.5 ${theme.accent}`} aria-hidden="true" />
                {s.name}
                <DeleteButton
                  action={deleteSubjectAction}
                  id={s.id}
                  confirmMessage={`Supprimer la matière "${s.name}" ?`}
                />
              </li>
            );
          })}
        </ul>
      </AdminSection>

      <AdminSection title="Associer une matière à un niveau (± série)" contentClassName="max-w-md">
        <AdminForm
          action={assignSubjectToLevelAction}
          submitLabel="Associer"
          fields={[
            {
              name: "levelId",
              label: "Niveau",
              type: "select",
              options: levels.map((l: any) => ({ value: l.id, label: l.name })),
            },
            {
              name: "seriesId",
              label: "Série (laisser vide si non applicable)",
              type: "select",
              optional: true,
              options: series.map((s: any) => ({ value: s.id, label: s.name })),
            },
            {
              name: "subjectId",
              label: "Matière",
              type: "select",
              options: subjects.map((s) => ({ value: s.id, label: s.name })),
            },
          ]}
        />

        <p className="mt-4 mb-2 text-xs font-medium text-muted-foreground">
          Associations récentes
        </p>
        <ul className="space-y-1">
          {levelSubjects?.map((ls: any) => (
            <li key={ls.id} className="text-sm text-muted-foreground">
              {ls.subjects?.name} → {ls.school_levels?.name}
              {ls.school_series?.name ? ` (${ls.school_series.name})` : ""}
            </li>
          ))}
        </ul>
      </AdminSection>
    </div>
  );
}
