import Link from "next/link";
import { Dumbbell, HelpCircle, ArrowLeft } from "lucide-react";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { getSchoolById } from "@/lib/queries/school";
import { getPublishedGlobalCurriculums, getQuestionsForExerciseScoped } from "@/lib/queries/school-content";
import { getPublishedChapters } from "@/lib/queries/curriculums-detail";
import { getPublishedLessonsForChapter } from "@/lib/queries/lessons";
import { getExercisesForLesson } from "@/lib/queries/exercises";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminItemRow } from "@/components/admin/admin-item-row";
import { AdminForm } from "@/components/admin/admin-form";
import { StatusSelector } from "@/components/admin/status-selector";
import { DeleteButton } from "@/components/admin/delete-button";
import { CurriculumSelector } from "@/components/admin/curriculum-selector";
import { ChapterSelector } from "@/components/admin/chapter-selector";
import { LessonSelector } from "@/components/admin/lesson-selector";
import {
  createSchoolExerciseAction,
  updateSchoolExerciseStatusAction,
  deleteSchoolExerciseAction,
  createSchoolQuestionAction,
  updateSchoolQuestionStatusAction,
  deleteSchoolQuestionAction,
} from "../../../content-actions";

const ANSWER_FORMAT_HELP = `Format selon le type choisi :
• Choix unique / Choix multiple : une option par ligne, préfixer les bonnes réponses par *
    *Une moitié
    Un tiers
• Vrai/Faux : une seule ligne, "vrai" ou "faux"
• Numérique : une seule ligne avec la valeur correcte, ex: 0.5
• Réponse courte : une réponse acceptée par ligne
• Association : une paire par ligne, "gauche => droite"
• Ordonnancement : les éléments un par ligne, dans le bon ordre`;

export default async function SchoolPrivateExercisePage(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ curriculumId?: string; chapterId?: string; lessonId?: string; exerciseId?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  await requireSchoolAccess(params.id);
  const schoolId = params.id;

  const [school, curriculums] = await Promise.all([getSchoolById(schoolId), getPublishedGlobalCurriculums()]);

  const selectedCurriculumId = searchParams.curriculumId ?? (curriculums as any[])[0]?.id;
  const chapters = selectedCurriculumId ? await getPublishedChapters(selectedCurriculumId) : [];
  const selectedChapterId = searchParams.chapterId ?? (chapters as any[])[0]?.id;

  const lessons = selectedChapterId ? await getPublishedLessonsForChapter(selectedChapterId) : [];
  const selectedLessonId = searchParams.lessonId ?? (lessons as any[])[0]?.id;

  const lesson = (lessons as any[]).find((l) => l.id === selectedLessonId);

  // Seuls LES exercices PRIVÉS de cette école sur cette leçon (school_id
  // = cette école) — jamais les exercices globaux d'autres établissements
  // ou d'un autre contexte ; getExercisesForLesson renvoie tout ce que la
  // RLS autorise à voir, on filtre donc explicitement ici en plus.
  const allExercisesOnLesson = selectedLessonId ? await getExercisesForLesson(selectedLessonId) : [];
  const privateExercises = (allExercisesOnLesson as any[]).filter((ex) => ex.school_id === schoolId);
  const selectedExerciseId = searchParams.exerciseId ?? privateExercises[0]?.id;
  const selectedExercise = privateExercises.find((e) => e.id === selectedExerciseId);

  const questions = selectedExerciseId
    ? await getQuestionsForExerciseScoped(selectedExerciseId, schoolId)
    : [];

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (selectedCurriculumId) p.set("curriculumId", selectedCurriculumId);
    if (selectedChapterId) p.set("chapterId", selectedChapterId);
    if (selectedLessonId) p.set("lessonId", selectedLessonId);
    if (selectedExerciseId) p.set("exerciseId", selectedExerciseId);
    for (const [k, v] of Object.entries(extra)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    return `?${p.toString()}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Dumbbell}
        title={`Exercices privés — ${school?.name ?? ""}`}
        description="Ajoute tes propres exercices et quiz sur les leçons du programme national partagé, visibles UNIQUEMENT par les élèves de ton école. La leçon elle-même n'est jamais modifiée ni dupliquée."
      />

      <Link
        href={`/admin/schools/${schoolId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour à l&apos;école
      </Link>

      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Programme national</label>
          <CurriculumSelector
            curriculums={(curriculums as any[]).map((c) => ({ id: c.id, title: c.title, status: c.status }))}
            selectedId={selectedCurriculumId}
            paramName="curriculumId"
          />
        </div>
        {chapters.length > 0 && (
          <div className="w-64">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Chapitre</label>
            <ChapterSelector
              chapters={(chapters as any[]).map((c) => ({ id: c.id, title: c.title, status: c.status }))}
              selectedId={selectedChapterId}
              curriculumId={selectedCurriculumId}
            />
          </div>
        )}
        {lessons.length > 0 && (
          <div className="w-64">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Leçon</label>
            <LessonSelector
              lessons={(lessons as any[]).map((l) => ({ id: l.id, title: l.title, status: l.status ?? "published" }))}
              selectedId={selectedLessonId}
              curriculumId={selectedCurriculumId}
              chapterId={selectedChapterId}
            />
          </div>
        )}
      </div>

      {lesson && (
        <AdminSection title={`Mes exercices privés sur "${lesson.title}"`}>
          <div className="max-w-md">
            <AdminForm
              action={createSchoolExerciseAction}
              submitLabel="Ajouter l'exercice privé (en brouillon)"
              fields={[
                { name: "schoolId", label: "École", type: "hidden", defaultValue: schoolId },
                { name: "lessonId", label: "Leçon", type: "hidden", defaultValue: selectedLessonId },
                { name: "privateOnGlobalLesson", label: "", type: "hidden", defaultValue: "true" },
                { name: "title", label: "Titre de l'exercice" },
                { name: "instructions", label: "Consignes (optionnel)", type: "textarea", optional: true, rows: 2 },
                {
                  name: "difficulty",
                  label: "Difficulté",
                  type: "select",
                  options: [
                    { value: "easy", label: "Facile" },
                    { value: "medium", label: "Moyen" },
                    { value: "hard", label: "Difficile" },
                    { value: "expert", label: "Expert" },
                  ],
                },
                { name: "difficultyScore", label: "Score de difficulté (0-100)", type: "number", defaultValue: "50" },
              ]}
            />
          </div>
          <div className="mt-4 space-y-2">
            {privateExercises.map((ex) => (
              <AdminItemRow
                key={ex.id}
                icon={<Dumbbell className="h-3.5 w-3.5" aria-hidden="true" />}
                title={ex.title}
                href={qs({ exerciseId: ex.id })}
                highlighted={ex.id === selectedExerciseId}
                actions={
                  <>
                    <StatusSelector
                      action={async (prev: any, fd: FormData) => {
                        "use server";
                        fd.set("schoolId", schoolId);
                        return updateSchoolExerciseStatusAction(prev, fd);
                      }}
                      idFieldName="exerciseId"
                      id={ex.id}
                      currentStatus={ex.status}
                    />
                    <DeleteButton
                      action={(id) => deleteSchoolExerciseAction(id, schoolId)}
                      id={ex.id}
                      confirmMessage={`Supprimer l'exercice privé "${ex.title}" ?`}
                    />
                  </>
                }
              />
            ))}
            {privateExercises.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun exercice privé sur cette leçon pour l&apos;instant.</p>
            )}
          </div>
        </AdminSection>
      )}

      {selectedExercise && (
        <AdminSection title={`Ajouter une question à "${selectedExercise.title}"`}>
          <div className="max-w-2xl">
            <AdminForm
              action={createSchoolQuestionAction}
              submitLabel="Ajouter la question (en brouillon)"
              fields={[
                { name: "schoolId", label: "École", type: "hidden", defaultValue: schoolId },
                { name: "exerciseId", label: "Exercice", type: "hidden", defaultValue: selectedExerciseId },
                {
                  name: "type",
                  label: "Type de question",
                  type: "select",
                  options: [
                    { value: "single_choice", label: "Choix unique" },
                    { value: "multiple_choice", label: "Choix multiple" },
                    { value: "true_false", label: "Vrai / Faux" },
                    { value: "numeric", label: "Numérique" },
                    { value: "short_answer", label: "Réponse courte" },
                    { value: "matching", label: "Association" },
                    { value: "ordering", label: "Ordonnancement" },
                  ],
                },
                { name: "prompt", label: "Énoncé", type: "textarea", rows: 2 },
                {
                  name: "answerData",
                  label: "Réponses (voir format ci-dessous)",
                  type: "textarea",
                  rows: 5,
                  placeholder: "*Une moitié\nUn tiers\nUn quart",
                  helpText: ANSWER_FORMAT_HELP,
                },
                { name: "explanation", label: "Explication (optionnel)", type: "textarea", optional: true, rows: 2 },
                { name: "points", label: "Points", type: "number", defaultValue: "10" },
              ]}
            />
          </div>
          <div className="mt-4 space-y-2">
            {(questions as any[]).map((q) => (
              <AdminItemRow
                key={q.id}
                icon={<HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />}
                title={q.prompt}
                subtitle={`${q.type} — ${
                  q.question_options?.map((o: any) => (o.is_correct ? `✓${o.label}` : o.label)).join(", ") ?? ""
                }`}
                actions={
                  <>
                    <StatusSelector
                      action={async (prev: any, fd: FormData) => {
                        "use server";
                        fd.set("schoolId", schoolId);
                        return updateSchoolQuestionStatusAction(prev, fd);
                      }}
                      idFieldName="questionId"
                      id={q.id}
                      currentStatus={q.status}
                    />
                    <DeleteButton
                      action={(id) => deleteSchoolQuestionAction(id, schoolId)}
                      id={q.id}
                      confirmMessage="Supprimer cette question ?"
                    />
                  </>
                }
              />
            ))}
            {questions.length === 0 && <p className="text-sm text-muted-foreground">Aucune question pour l&apos;instant.</p>}
          </div>
        </AdminSection>
      )}
    </div>
  );
}
