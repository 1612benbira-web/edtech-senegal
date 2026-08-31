import { GraduationCap, FileText } from "lucide-react";
import { getAllCurriculums, getChaptersForCurriculum, getCurriculumCompetencies } from "@/lib/queries/curriculums-detail";
import { getLessonsForChapter } from "@/lib/queries/lessons";
import { createLessonAction, updateLessonStatusAction, deleteLessonAction } from "../curriculum-content-actions";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusSelector } from "@/components/admin/status-selector";
import { CurriculumSelector } from "@/components/admin/curriculum-selector";
import { ChapterSelector } from "@/components/admin/chapter-selector";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminItemRow } from "@/components/admin/admin-item-row";

export default async function LessonsAdminPage({
  searchParams,
}: {
  searchParams: { curriculumId?: string; chapterId?: string };
}) {
  const curriculums = await getAllCurriculums();
  const selectedCurriculumId = searchParams.curriculumId ?? curriculums[0]?.id;

  const chapters = selectedCurriculumId
    ? await getChaptersForCurriculum(selectedCurriculumId)
    : [];
  const selectedChapterId = searchParams.chapterId ?? chapters[0]?.id;

  const [lessons, competencies] = selectedChapterId
    ? await Promise.all([
        getLessonsForChapter(selectedChapterId),
        selectedCurriculumId ? getCurriculumCompetencies(selectedCurriculumId) : Promise.resolve([]),
      ])
    : [[], []];

  const selectedChapter = chapters.find((c: any) => c.id === selectedChapterId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={GraduationCap}
        title="Leçons"
        description="Le contenu pédagogique (texte, formules, objectifs) que les élèves suivent chapitre par chapitre."
      />

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Programme
          </label>
          <CurriculumSelector
            curriculums={curriculums.map((c: any) => ({ id: c.id, title: c.title, status: c.status }))}
            selectedId={selectedCurriculumId}
            paramName="curriculumId"
          />
        </div>
        {chapters.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Chapitre
            </label>
            <ChapterSelector
              chapters={chapters.map((c: any) => ({ id: c.id, title: c.title, status: c.status }))}
              selectedId={selectedChapterId}
              curriculumId={selectedCurriculumId}
            />
          </div>
        )}
      </div>

      {selectedChapter && (
        <>
          <AdminSection title={`Ajouter une leçon à "${selectedChapter.title}"`} contentClassName="max-w-2xl">
            <AdminForm
              action={createLessonAction}
              submitLabel="Ajouter la leçon (en brouillon)"
              fields={[
                { name: "chapterId", label: "Chapitre", type: "hidden", defaultValue: selectedChapterId },
                { name: "title", label: "Titre de la leçon" },
                { name: "order", label: "Ordre", type: "number" },
                {
                  name: "competencyId",
                  label: "Compétence (optionnel)",
                  type: "select",
                  optional: true,
                  options: competencies.map((c: any) => ({ value: c.id, label: c.name })),
                },
                {
                  name: "objectives",
                  label: "Objectifs pédagogiques (un par ligne)",
                  type: "textarea",
                  optional: true,
                  rows: 3,
                },
                {
                  name: "contentMd",
                  label: "Contenu (Markdown, formules entre $...$)",
                  type: "textarea",
                  rows: 12,
                  placeholder: "## Introduction\n\nUne fraction représente $\\frac{1}{2}$...",
                },
                { name: "summary", label: "Résumé (optionnel)", type: "textarea", optional: true, rows: 3 },
                { name: "sourceUrl", label: "Source URL (optionnel)", optional: true },
              ]}
            />
          </AdminSection>

          <AdminSection title="Leçons de ce chapitre">
            <div className="space-y-2">
              {lessons.map((l: any) => (
                <AdminItemRow
                  key={l.id}
                  icon={<FileText className="h-3.5 w-3.5" aria-hidden="true" />}
                  title={`${l.order}. ${l.title}`}
                  subtitle={l.competencies?.name}
                  actions={
                    <>
                      <StatusSelector
                        action={updateLessonStatusAction}
                        idFieldName="lessonId"
                        id={l.id}
                        currentStatus={l.status}
                      />
                      <DeleteButton
                        action={deleteLessonAction}
                        id={l.id}
                        confirmMessage={`Supprimer la leçon "${l.title}" ?`}
                      />
                    </>
                  }
                />
              ))}
              {lessons.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune leçon pour l&apos;instant.</p>
              )}
            </div>
          </AdminSection>
        </>
      )}
    </div>
  );
}
