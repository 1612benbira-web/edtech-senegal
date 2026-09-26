import { Dumbbell, HelpCircle } from "lucide-react";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { requireTeacherAccess } from "@/lib/services/adminGuard";
import { getPublishedGlobalCurriculumsForAssignments, getQuestionsForExerciseScoped } from "@/lib/queries/school-content";
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
  createTeacherExerciseAction,
  updateTeacherExerciseStatusAction,
  deleteTeacherExerciseAction,
  createTeacherQuestionAction,
  updateTeacherQuestionStatusAction,
  deleteTeacherQuestionAction,
} from "../actions";

const ANSWER_FORMAT_HELP = `Format selon le type choisi :
• Choix unique / Choix multiple : une option par ligne, préfixer les bonnes réponses par *
    *Une moitié
    Un tiers
• Vrai/Faux : une seule ligne, "vrai" ou "faux"
• Numérique : une seule ligne avec la valeur correcte, ex: 0.5
• Réponse courte : une réponse acceptée par ligne
• Association : une paire par ligne, "gauche => droite"
• Ordonnancement : les éléments un par ligne, dans le bon ordre`;

export default async function TeacherExercisesPage({
  searchParams,
}: {
  searchParams: { curriculumId?: string; chapterId?: string; lessonId?: string; exerciseId?: string };
}) {
  const currentSchool = await getCurrentSchool();
  const schoolId = currentSchool!.schoolId;
  const { assignments } = await requireTeacherAccess(schoolId);

  // Ne montre QUE les programmes correspondant à une matière/niveau
  // confiée à cet enseignant — jamais l'intégralité du catalogue
  // national (cf. getPublishedGlobalCurriculumsForAssignments, qui
  // filtre déjà par assignments ; la RLS sur exercises/questions reste
  // de toute façon le vrai rempart si cette page laissait passer autre
  // chose).
  const curriculums = await getPublishedGlobalCurriculumsForAssignments(
    assignments.map((a: any) => ({ subject_id: a.subject_id, level_id: a.level_id, series_id: a.series_id }))
  );

  const selectedCurriculumId = searchParams.curriculumId ?? (curriculums as any[])[0]?.id;
  const chapters = selectedCurriculumId ? await getPublishedChapters(selectedCurriculumId) : [];
  const selectedChapterId = searchParams.chapterId ?? (chapters as any[])[0]?.id;

  const lessons = selectedChapterId ? await getPublishedLessonsForChapter(selectedChapterId) : [];
  const selectedLessonId = searchParams.lessonId ?? (lessons as any[])[0]?.id;

  const lesson = (lessons as any[]).find((l) => l.id === selectedLessonId);

  // Comme pour /admin/.../private-exercise : on ne montre que MES
  // exercices privés sur cette leçon (school_id = mon école) — jamais
  // les exercices globaux ni ceux d'une autre école.
  const allExercisesOnLesson = selectedLessonId ? await getExercisesForLesson(selectedLessonId) : [];
  const myExercises = (allExercisesOnLesson as any[]).filter((ex) => ex.school_id === schoolId);
  const selectedExerciseId = searchParams.exerciseId ?? myExercises[0]?.id;
  const selectedExercise = myExercises.find((e) => e.id === selectedExerciseId);

  const questions = selectedExerciseId ? await getQuestionsForExerciseScoped(selectedExerciseId, schoolId) : [];

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
        title="Mes exercices"
        description="Ajoute tes propres exercices et quiz sur les leçons du programme national, visibles uniquement par les élèves de ton école. Tu ne peux jamais modifier la leçon elle-même."
      />

      {curriculums.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune matière ne t&apos;a encore été confiée, ou le programme national correspondant n&apos;est pas
          encore publié.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-4">
            <div className="w-64">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Matière / niveau</label>
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
            <AdminSection title={`Mes exercices sur "${lesson.title}"`}>
              <div className="max-w-md">
                <AdminForm
                  action={createTeacherExerciseAction}
                  submitLabel="Ajouter l'exercice (en brouillon)"
                  fields={[
                    { name: "schoolId", label: "École", type: "hidden", defaultValue: schoolId },
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
                {myExercises.map((ex) => (
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
                            return updateTeacherExerciseStatusAction(prev, fd);
                          }}
                          idFieldName="exerciseId"
                          id={ex.id}
                          currentStatus={ex.status}
                        />
                        <DeleteButton
                          action={(id) => deleteTeacherExerciseAction(id, schoolId)}
                          id={ex.id}
                          confirmMessage={`Supprimer l'exercice "${ex.title}" ?`}
                        />
                      </>
                    }
                  />
                ))}
                {myExercises.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun exercice sur cette leçon pour l&apos;instant.</p>
                )}
              </div>
            </AdminSection>
          )}

          {selectedExercise && (
            <AdminSection title={`Ajouter une question à "${selectedExercise.title}"`}>
              <div className="max-w-2xl">
                <AdminForm
                  action={createTeacherQuestionAction}
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
                            return updateTeacherQuestionStatusAction(prev, fd);
                          }}
                          idFieldName="questionId"
                          id={q.id}
                          currentStatus={q.status}
                        />
                        <DeleteButton
                          action={(id) => deleteTeacherQuestionAction(id, schoolId)}
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
        </>
      )}
    </div>
  );
}
