import { Target, Sparkles } from "lucide-react";
import { getAllCurriculums, getCurriculumDomains, getCurriculumCompetencies } from "@/lib/queries/curriculums-detail";
import {
  createDomainAction,
  createCompetencyAction,
  deleteDomainAction,
  deleteCompetencyAction,
} from "../curriculum-content-actions";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { CurriculumSelector } from "@/components/admin/curriculum-selector";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";

export default async function CompetenciesAdminPage({
  searchParams,
}: {
  searchParams: { curriculumId?: string };
}) {
  const curriculums = await getAllCurriculums();
  const selectedCurriculumId = searchParams.curriculumId ?? curriculums[0]?.id;

  const [domains, competencies] = selectedCurriculumId
    ? await Promise.all([
        getCurriculumDomains(selectedCurriculumId),
        getCurriculumCompetencies(selectedCurriculumId),
      ])
    : [[], []];

  const competenciesByDomain = new Map<string, any[]>();
  for (const c of competencies as any[]) {
    const list = competenciesByDomain.get(c.domain_id) ?? [];
    list.push(c);
    competenciesByDomain.set(c.domain_id, list);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Target}
        title="Domaines & Compétences"
        description={
          <>
            Un domaine regroupe plusieurs compétences au sein d&apos;un programme (ex. domaine
            &quot;Nombres et calculs&quot; → compétence &quot;Fractions simples&quot;). Les compétences sont
            ensuite associées aux leçons et questions pour permettre le suivi de maîtrise
            (voir la page &quot;Ma progression&quot; côté élève).
          </>
        }
      />

      <div className="w-64">
        <label className="mb-1.5 block text-sm font-medium text-foreground">Programme</label>
        <CurriculumSelector
          curriculums={curriculums.map((c: any) => ({ id: c.id, title: c.title, status: c.status }))}
          selectedId={selectedCurriculumId}
          paramName="curriculumId"
        />
      </div>

      {selectedCurriculumId && (
        <>
          <AdminSection title="Ajouter un domaine" contentClassName="max-w-md">
            <AdminForm
              action={createDomainAction}
              submitLabel="Ajouter le domaine"
              fields={[
                {
                  name: "curriculumId",
                  label: "Programme",
                  type: "hidden",
                  defaultValue: selectedCurriculumId,
                },
                { name: "name", label: "Nom du domaine (ex: Nombres et calculs)" },
                { name: "order", label: "Ordre", type: "number", defaultValue: "0" },
              ]}
            />
          </AdminSection>

          <AdminSection title="Ajouter une compétence">
            {domains.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Crée d&apos;abord un domaine ci-dessus.
              </p>
            ) : (
              <div className="max-w-md">
                <AdminForm
                  action={createCompetencyAction}
                  submitLabel="Ajouter la compétence"
                  fields={[
                    {
                      name: "domainId",
                      label: "Domaine",
                      type: "select",
                      options: domains.map((d: any) => ({ value: d.id, label: d.name })),
                    },
                    { name: "name", label: "Nom de la compétence (ex: Fractions simples)" },
                    {
                      name: "description",
                      label: "Description (optionnel)",
                      type: "textarea",
                      optional: true,
                      rows: 2,
                    },
                    { name: "order", label: "Ordre", type: "number", defaultValue: "0" },
                  ]}
                />
              </div>
            )}
          </AdminSection>

          <AdminSection title="Structure actuelle">
            <div className="space-y-4">
              {domains.map((d: any) => (
                <div key={d.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <Target className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {d.name}
                    </p>
                    <DeleteButton
                      action={deleteDomainAction}
                      id={d.id}
                      confirmMessage={`Supprimer le domaine "${d.name}" ? Cela échouera si des compétences y sont rattachées.`}
                    />
                  </div>
                  <ul className="space-y-1 pl-4">
                    {(competenciesByDomain.get(d.id) ?? []).map((c: any) => (
                      <li key={c.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          {c.name}
                        </span>
                        <DeleteButton
                          action={deleteCompetencyAction}
                          id={c.id}
                          confirmMessage={`Supprimer la compétence "${c.name}" ?`}
                        />
                      </li>
                    ))}
                    {(competenciesByDomain.get(d.id) ?? []).length === 0 && (
                      <li className="text-sm text-muted-foreground">Aucune compétence.</li>
                    )}
                  </ul>
                </div>
              ))}
              {domains.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun domaine pour l&apos;instant.</p>
              )}
            </div>
          </AdminSection>
        </>
      )}
    </div>
  );
}
