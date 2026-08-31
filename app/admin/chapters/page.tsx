import { BookMarked, Layers } from "lucide-react";
import { getAllCurriculums, getChaptersForCurriculum, getCurriculumDomains } from "@/lib/queries/curriculums-detail";
import {
  createChapterAction,
  updateChapterStatusAction,
  deleteChapterAction,
} from "../curriculum-content-actions";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusSelector } from "@/components/admin/status-selector";
import { CurriculumSelector } from "@/components/admin/curriculum-selector";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminItemRow } from "@/components/admin/admin-item-row";

export default async function ChaptersAdminPage({
  searchParams,
}: {
  searchParams: { curriculumId?: string };
}) {
  const curriculums = await getAllCurriculums();
  const selectedCurriculumId = searchParams.curriculumId ?? curriculums[0]?.id;

  const [chapters, domains] = selectedCurriculumId
    ? await Promise.all([
        getChaptersForCurriculum(selectedCurriculumId),
        getCurriculumDomains(selectedCurriculumId),
      ])
    : [[], []];

  const selectedCurriculum = curriculums.find((c: any) => c.id === selectedCurriculumId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={BookMarked}
        title="Chapitres"
        description="Organise chaque programme en chapitres ordonnés. Un chapitre doit être publié pour que ses leçons soient visibles par les élèves."
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Programme
        </label>
        <CurriculumSelector
          curriculums={curriculums.map((c: any) => ({ id: c.id, title: c.title, status: c.status }))}
          selectedId={selectedCurriculumId}
        />
      </div>

      {selectedCurriculum && (
        <>
          <AdminSection title={`Ajouter un chapitre à "${selectedCurriculum.title}"`} contentClassName="max-w-md">
            <AdminForm
              action={createChapterAction}
              submitLabel="Ajouter le chapitre (en brouillon)"
              fields={[
                { name: "curriculumId", label: "Programme", type: "hidden", defaultValue: selectedCurriculumId },
                {
                  name: "domainId",
                  label: "Domaine (optionnel)",
                  type: "select",
                  optional: true,
                  options: domains.map((d) => ({ value: d.id, label: d.name })),
                },
                { name: "title", label: "Titre du chapitre" },
                { name: "order", label: "Ordre", type: "number" },
                { name: "sourceUrl", label: "Source URL (optionnel)" },
              ]}
            />
          </AdminSection>

          <AdminSection title="Chapitres de ce programme">
            <div className="space-y-2">
              {chapters.map((ch: any) => (
                <AdminItemRow
                  key={ch.id}
                  icon={<Layers className="h-3.5 w-3.5" aria-hidden="true" />}
                  title={`${ch.order}. ${ch.title}`}
                  subtitle={ch.domains?.name}
                  actions={
                    <>
                      <StatusSelector
                        action={updateChapterStatusAction}
                        idFieldName="chapterId"
                        id={ch.id}
                        currentStatus={ch.status}
                      />
                      <DeleteButton
                        action={deleteChapterAction}
                        id={ch.id}
                        confirmMessage={`Supprimer le chapitre "${ch.title}" ?`}
                      />
                    </>
                  }
                />
              ))}
              {chapters.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun chapitre pour l&apos;instant.</p>
              )}
            </div>
          </AdminSection>
        </>
      )}
    </div>
  );
}
