import { ClipboardList, Dumbbell, HelpCircle } from "lucide-react";
import { getAllCurriculums, getChaptersForCurriculum, getCurriculumCompetencies } from "@/lib/queries/curriculums-detail";
import { getLessonsForChapter } from "@/lib/queries/lessons";
import { getExercisesForLesson, getQuestionsForExercise } from "@/lib/queries/exercises";
import {
  createExerciseAction,
  updateExerciseStatusAction,
  deleteExerciseAction,
  createQuestionAction,
  updateQuestionStatusAction,
  deleteQuestionAction,
} from "../exercise-actions";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusSelector } from "@/components/admin/status-selector";
import { CurriculumSelector } from "@/components/admin/curriculum-selector";
import { ChapterSelector } from "@/components/admin/chapter-selector";
import { LessonSelector } from "@/components/admin/lesson-selector";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminItemRow } from "@/components/admin/admin-item-row";

const ANSWER_FORMAT_HELP = `Format selon le type choisi :
• Choix unique / Choix multiple : une option par ligne, préfixer les bonnes réponses par *
    *Une moitié
    Un tiers
• Vrai/Faux : une seule ligne, "vrai" ou "faux"
• Numérique : une seule ligne avec la valeur correcte, ex: 0.5
• Réponse courte : une réponse acceptée par ligne
• Association : une paire par ligne, "gauche => droite"
• Ordonnancement : les éléments un par ligne, dans le bon ordre`;

export default async function QuestionsAdminPage(
  props: {
    searchParams: Promise<{ curriculumId?: string; chapterId?: string; lessonId?: string; exerciseId?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const curriculums = await getAllCurriculums();
  const selectedCurriculumId = searchParams.curriculumId ?? curriculums[0]?.id;

  const chapters = selectedCurriculumId ? await getChaptersForCurriculum(selectedCurriculumId) : [];
  const selectedChapterId = searchParams.chapterId ?? chapters[0]?.id;

  const lessons = selectedChapterId ? await getLessonsForChapter(selectedChapterId) : [];
  const selectedLessonId = searchParams.lessonId ?? lessons[0]?.id;

  const [exercises, competencies] = selectedLessonId
    ? await Promise.all([
        getExercisesForLesson(selectedLessonId),
        selectedCurriculumId ? getCurriculumCompetencies(selectedCurriculumId) : Promise.resolve([]),
      ])
    : [[], []];
  const selectedExerciseId = searchParams.exerciseId ?? (exercises[0] as any)?.id;

  const questions = selectedExerciseId ? await getQuestionsForExercise(selectedExerciseId) : [];

  const selectedLesson = lessons.find((l: any) => l.id === selectedLessonId);
  const selectedExercise = (exercises as any[]).find((e) => e.id === selectedExerciseId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ClipboardList}
        title="Exercices & Questions"
        description="Chaque leçon peut contenir plusieurs exercices, et chaque exercice plusieurs questions notées."
      />

      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Programme</label>
          <CurriculumSelector
            curriculums={curriculums.map((c: any) => ({ id: c.id, title: c.title, status: c.status }))}
            selectedId={selectedCurriculumId}
            paramName="curriculumId"
          />
        </div>
        {chapters.length > 0 && (
          <div className="w-64">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Chapitre</label>
            <ChapterSelector
              chapters={chapters.map((c: any) => ({ id: c.id, title: c.title, status: c.status }))}
              selectedId={selectedChapterId}
              curriculumId={selectedCurriculumId}
            />
          </div>
        )}
        {lessons.length > 0 && (
          <div className="w-64">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Leçon</label>
            <LessonSelector
              lessons={lessons.map((l: any) => ({ id: l.id, title: l.title, status: l.status }))}
              selectedId={selectedLessonId}
              curriculumId={selectedCurriculumId}
              chapterId={selectedChapterId}
            />
          </div>
        )}
      </div>

      {selectedLesson && (
        <AdminSection title={`Ajouter un exercice à "${selectedLesson.title}"`}>
          <div className="max-w-md">
            <AdminForm
              action={createExerciseAction}
              submitLabel="Ajouter l'exercice (en brouillon)"
              fields={[
                { name: "lessonId", label: "Leçon", type: "hidden", defaultValue: selectedLessonId },
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
            {(exercises as any[]).map((ex) => (
              <AdminItemRow
                key={ex.id}
                icon={<Dumbbell className="h-3.5 w-3.5" aria-hidden="true" />}
                title={ex.title}
                href={`?curriculumId=${selectedCurriculumId}&chapterId=${selectedChapterId}&lessonId=${selectedLessonId}&exerciseId=${ex.id}`}
                highlighted={ex.id === selectedExerciseId}
                actions={
                  <>
                    <StatusSelector
                      action={updateExerciseStatusAction}
                      idFieldName="exerciseId"
                      id={ex.id}
                      currentStatus={ex.status}
                    />
                    <DeleteButton
                      action={deleteExerciseAction}
                      id={ex.id}
                      confirmMessage={`Supprimer l'exercice "${ex.title}" ?`}
                    />
                  </>
                }
              />
            ))}
            {exercises.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun exercice pour l&apos;instant.</p>
            )}
          </div>
        </AdminSection>
      )}

      {selectedExercise && (
        <AdminSection title={`Ajouter une question à "${selectedExercise.title}"`}>
          <div className="max-w-2xl">
            <AdminForm
              action={createQuestionAction}
              submitLabel="Ajouter la question (en brouillon)"
              fields={[
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
                {
                  name: "competencyId",
                  label: "Compétence (optionnel)",
                  type: "select",
                  optional: true,
                  options: competencies.map((c: any) => ({ value: c.id, label: c.name })),
                },
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
                  q.question_options
                    ?.map((o: any) => (o.is_correct ? `✓${o.label}` : o.label))
                    .join(", ") ?? ""
                }`}
                actions={
                  <>
                    <StatusSelector
                      action={updateQuestionStatusAction}
                      idFieldName="questionId"
                      id={q.id}
                      currentStatus={q.status}
                    />
                    <DeleteButton
                      action={deleteQuestionAction}
                      id={q.id}
                      confirmMessage="Supprimer cette question ?"
                    />
                  </>
                }
              />
            ))}
            {questions.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune question pour l&apos;instant.</p>
            )}
          </div>
        </AdminSection>
      )}
    </div>
  );
}
