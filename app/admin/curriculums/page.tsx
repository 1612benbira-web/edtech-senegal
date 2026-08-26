import Link from "next/link";
import { FileText, BookOpen } from "lucide-react";
import { getAllCurriculums } from "@/lib/queries/curriculums-detail";
import { getLevels, getSeries, getSubjects } from "@/lib/queries/curriculum";
import {
  createCurriculumAction,
  updateCurriculumStatusAction,
  deleteCurriculumAction,
} from "../curriculum-content-actions";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusSelector } from "@/components/admin/status-selector";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { Badge } from "@/components/ui/badge";

export default async function CurriculumsAdminPage() {
  const [curriculums, levels, series, subjects] = await Promise.all([
    getAllCurriculums(),
    getLevels(),
    getSeries(),
    getSubjects(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={FileText}
        title="Programmes"
        description={
          <>
            Un programme ne peut être publié sans <code>source_url</code> ou{" "}
            <code>source_document</code> — c'est bloqué en base, pas seulement côté
            interface. Tant qu'il n'est pas au statut "Publié", aucun élève ne peut
            le voir.
          </>
        }
      />

      <AdminSection title="Créer un programme" contentClassName="max-w-md">
        <AdminForm
          action={createCurriculumAction}
          submitLabel="Créer le programme (en brouillon)"
          fields={[
            {
              name: "levelId",
              label: "Niveau",
              type: "select",
              options: levels.map((l: any) => ({ value: l.id, label: l.name })),
            },
            {
              name: "seriesId",
              label: "Série (optionnel)",
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
            { name: "title", label: "Titre" },
            { name: "version", label: "Version (ex: 2026)" },
            { name: "sourceUrl", label: "Source URL (requis avant publication)" },
          ]}
        />
      </AdminSection>

      <AdminSection title="Programmes existants">
        <div className="space-y-2">
          {curriculums.map((c: any) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                    {c.title}
                    {c.is_demo && <Badge variant="warning">DEMO</Badge>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.subjects?.name} — {c.school_levels?.name}
                    {c.school_series?.name ? ` (${c.school_series.name})` : ""} — v{c.version}
                  </p>
                  <Link
                    href={`/admin/chapters?curriculumId=${c.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Voir les chapitres →
                  </Link>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusSelector
                  action={updateCurriculumStatusAction}
                  idFieldName="curriculumId"
                  id={c.id}
                  currentStatus={c.status}
                />
                <DeleteButton
                  action={deleteCurriculumAction}
                  id={c.id}
                  confirmMessage={`Supprimer le programme "${c.title}" ? Cela échouera si des chapitres y sont rattachés.`}
                />
              </div>
            </div>
          ))}
          {curriculums.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun programme pour l'instant.</p>
          )}
        </div>
      </AdminSection>
    </div>
  );
}
