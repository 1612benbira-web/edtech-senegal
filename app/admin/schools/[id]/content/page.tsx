import Link from "next/link";
import { BookOpen, Layers, FileText, Dumbbell, HelpCircle, ArrowLeft } from "lucide-react";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { getSchoolById } from "@/lib/queries/school";
import { getOwnedCurriculums, getQuestionsForExerciseScoped } from "@/lib/queries/school-content";
import { getChaptersForCurriculum, getCurriculumCompetencies } from "@/lib/queries/curriculums-detail";
import { getLessonsForChapter } from "@/lib/queries/lessons";
import { getExercisesForLesson } from "@/lib/queries/exercises";
import { getLevels, getSeries, getSubjects } from "@/lib/queries/curriculum";
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
  createSchoolCurriculumAction,
  updateSchoolCurriculumStatusAction,
  deleteSchoolCurriculumAction,
  createSchoolChapterAction,
  updateSchoolChapterStatusAction,
  deleteSchoolChapterAction,
  createSchoolLessonAction,
  updateSchoolLessonStatusAction,
  deleteSchoolLessonAction,
  createSchoolExerciseAction,
  updateSchoolExerciseStatusAction,
  deleteSchoolExerciseAction,
  createSchoolQuestionAction,
  updateSchoolQuestionStatusAction,
  deleteSchoolQuestionAction,
} from "../../content-actions";

const ANSWER_FORMAT_HELP = `Format selon le type choisi :
• Choix unique / Choix multiple : une option par ligne, préfixer les bonnes réponses par *
    *Une moitié
    Un tiers
• Vrai/Faux : une seule ligne, "vrai" ou "faux"
• Numérique : une seule ligne avec la valeur correcte, ex: 0.5
• Réponse courte : une réponse acceptée par ligne
• Association : une paire par ligne, "gauche => droite"
• Ordonnancement : les éléments un par ligne, dans le bon ordre`;

export default async function SchoolContentPage(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ curriculumId?: string; chapterId?: string; lessonId?: string; exerciseId?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  await requireSchoolAccess(params.id);
  const schoolId = params.id;

  const [school, curriculums, levels, series, subjects] = await Promise.all([
    getSchoolById(schoolId),
    getOwnedCurriculums(schoolId),
    getLevels(),
    getSeries(),
    getSubjects(),
  ]);

  const selectedCurriculumId = searchParams.curriculumId ?? (curriculums as any[])[0]?.id;
  const chapters = selectedCurriculumId ? await getChaptersForCurriculum(selectedCurriculumId) : [];
  const selectedChapterId = searchParams.chapterId ?? (chapters as any[])[0]?.id;

  const lessons = selectedChapterId ? await getLessonsForChapter(selectedChapterId) : [];
  const selectedLessonId = searchParams.lessonId ?? (lessons as any[])[0]?.id;

  const [exercises, competencies] = selectedLessonId
    ? await Promise.all([
        getExercisesForLesson(selectedLessonId),
        selectedCurriculumId ? getCurriculumCompetencies(selectedCurriculumId) : Promise.resolve([]),
      ])
    : [[], []];
  const selectedExerciseId = searchParams.exerciseId ?? (exercises as any[])[0]?.id;

  const questions = selectedExerciseId
    ? await getQuestionsForExerciseScoped(selectedExerciseId, schoolId)
    : [];

  const selectedLesson = (lessons as any[]).find((l) => l.id === selectedLessonId);
  const selectedExercise = (exercises as any[]).find((e) => e.id === selectedExerciseId);

  const qs = (extra: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (selectedCurriculumId) params.set("curriculumId", selectedCurriculumId);
    if (selectedChapterId) params.set("chapterId", selectedChapterId);
    if (selectedLessonId) params.set("lessonId", selectedLessonId);
    if (selectedExerciseId) params.set("exerciseId", selectedExerciseId);
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={BookOpen}
        title={`Contenu propre — ${school?.name ?? ""}`}
        description="Crée un programme entier réservé à ton établissement (matière, chapitres, leçons, exercices, questions). Ce contenu n'est visible que par les élèves de ton école, jamais par les autres établissements."
      />

      <Link
        href={`/admin/schools/${schoolId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour à l&apos;école
      </Link>

      <AdminSection title="Créer un nouveau programme propre à l'école">
        <div className="max-w-md">
          <AdminForm
            action={createSchoolCurriculumAction}
            submitLabel="Créer le programme (en brouillon)"
            fields={[
              { name: "schoolId", label: "École", type: "hidden", defaultValue: schoolId },
              {
                name: "levelId",
                label: "Niveau",
                type: "select",
                options: (levels as any[]).map((l) => ({ value: l.id, label: l.name })),
              },
              {
                name: "seriesId",
                label: "Série (optionnel)",
                type: "select",
                optional: true,
                options: (series as any[]).map((s) => ({ value: s.id, label: s.name })),
              },
              {
                name: "subjectId",
                label: "Matière",
                type: "select",
                options: (subjects as any[]).map((s) => ({ value: s.id, label: s.name })),
              },
              { name: "title", label: "Titre du programme", placeholder: "Ex : Maths 6e — approfondissement" },
              { name: "version", label: "Version", defaultValue: "2026" },
              { name: "description", label: "Description (optionnel)", type: "textarea", optional: true, rows: 2 },
            ]}
          />
        </div>
      </AdminSection>

      {curriculums.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <div className="w-64">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Mon programme</label>
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
                lessons={(lessons as any[]).map((l) => ({ id: l.id, title: l.title, status: l.status }))}
                selectedId={selectedLessonId}
                curriculumId={selectedCurriculumId}
                chapterId={selectedChapterId}
              />
            </div>
          )}
        </div>
      )}

      {selectedCurriculumId && (
        <AdminSection title="Ce programme">
          {(curriculums as any[])
            .filter((c) => c.id === selectedCurriculumId)
            .map((c) => (
              <AdminItemRow
                key={c.id}
                icon={<BookOpen className="h-3.5 w-3.5" aria-hidden="true" />}
                title={c.title}
                subtitle={`${c.subjects?.name ?? ""} · ${c.school_levels?.name ?? ""} · v${c.version}`}
                actions={
                  <>
                    <StatusSelector
                      action={async (prev: any, fd: FormData) => {
                        "use server";
                        fd.set("schoolId", schoolId);
                        return updateSchoolCurriculumStatusAction(prev, fd);
                      }}
                      idFieldName="curriculumId"
                      id={c.id}
                      currentStatus={c.status}
                    />
                    <DeleteButton
                      action={(id) => deleteSchoolCurriculumAction(id, schoolId)}
                      id={c.id}
                      confirmMessage={`Supprimer le programme "${c.title}" et tout son contenu (chapitres, leçons, exercices) ?`}
                    />
                  </>
                }
              />
            ))}
          <p className="mt-2 text-xs text-muted-foreground">
            Un programme doit passer par <span className="font-medium">publié</span> pour devenir visible par les
            élèves de l&apos;école — comme pour le contenu global, un brouillon reste invisible.
          </p>
        </AdminSection>
      )}

      {selectedCurriculumId && (
        <AdminSection title={`Ajouter un chapitre`}>
          <div className="max-w-md">
            <AdminForm
              action={createSchoolChapterAction}
              submitLabel="Ajouter le chapitre (en brouillon)"
              fields={[
                { name: "schoolId", label: "École", type: "hidden", defaultValue: schoolId },
                { name: "curriculumId", label: "Programme", type: "hidden", defaultValue: selectedCurriculumId },
                { name: "title", label: "Titre du chapitre" },
                { name: "order", label: "Ordre", type: "number", defaultValue: "0" },
              ]}
            />
          </div>
          <div className="mt-4 space-y-2">
            {(chapters as any[]).map((ch) => (
              <AdminItemRow
                key={ch.id}
                icon={<Layers className="h-3.5 w-3.5" aria-hidden="true" />}
                title={ch.title}
                href={qs({ chapterId: ch.id, lessonId: undefined, exerciseId: undefined })}
                highlighted={ch.id === selectedChapterId}
                actions={
                  <>
                    <StatusSelector
                      action={async (prev: any, fd: FormData) => {
                        "use server";
                        fd.set("schoolId", schoolId);
                        return updateSchoolChapterStatusAction(prev, fd);
                      }}
                      idFieldName="chapterId"
                      id={ch.id}
                      currentStatus={ch.status}
                    />
                    <DeleteButton
                      action={(id) => deleteSchoolChapterAction(id, schoolId)}
                      id={ch.id}
                      confirmMessage={`Supprimer le chapitre "${ch.title}" ?`}
                    />
                  </>
                }
              />
            ))}
            {chapters.length === 0 && <p className="text-sm text-muted-foreground">Aucun chapitre pour l&apos;instant.</p>}
          </div>
        </AdminSection>
      )}

      {selectedChapterId && (
        <AdminSection title="Ajouter une leçon">
          <div className="max-w-2xl">
            <AdminForm
              action={createSchoolLessonAction}
              submitLabel="Ajouter la leçon (en brouillon)"
              fields={[
                { name: "schoolId", label: "École", type: "hidden", defaultValue: schoolId },
                { name: "chapterId", label: "Chapitre", type: "hidden", defaultValue: selectedChapterId },
                { name: "title", label: "Titre de la leçon" },
                { name: "contentMd", label: "Contenu (markdown)", type: "textarea", rows: 8 },
                {
                  name: "objectives",
                  label: "Objectifs (un par ligne, optionnel)",
                  type: "textarea",
                  optional: true,
                  rows: 3,
                },
                { name: "summary", label: "Résumé (optionnel)", type: "textarea", optional: true, rows: 2 },
                { name: "order", label: "Ordre", type: "number", defaultValue: "0" },
              ]}
            />
          </div>
          <div className="mt-4 space-y-2">
            {(lessons as any[]).map((l) => (
              <AdminItemRow
                key={l.id}
                icon={<FileText className="h-3.5 w-3.5" aria-hidden="true" />}
                title={l.title}
                href={qs({ lessonId: l.id, exerciseId: undefined })}
                highlighted={l.id === selectedLessonId}
                actions={
                  <>
                    <StatusSelector
                      action={async (prev: any, fd: FormData) => {
                        "use server";
                        fd.set("schoolId", schoolId);
                        return updateSchoolLessonStatusAction(prev, fd);
                      }}
                      idFieldName="lessonId"
                      id={l.id}
                      currentStatus={l.status}
                    />
                    <DeleteButton
                      action={(id) => deleteSchoolLessonAction(id, schoolId)}
                      id={l.id}
                      confirmMessage={`Supprimer la leçon "${l.title}" ?`}
                    />
                  </>
                }
              />
            ))}
            {lessons.length === 0 && <p className="text-sm text-muted-foreground">Aucune leçon pour l&apos;instant.</p>}
          </div>
        </AdminSection>
      )}

      {selectedLesson && (
        <AdminSection title={`Ajouter un exercice à "${selectedLesson.title}"`}>
          <div className="max-w-md">
            <AdminForm
              action={createSchoolExerciseAction}
              submitLabel="Ajouter l'exercice (en brouillon)"
              fields={[
                { name: "schoolId", label: "École", type: "hidden", defaultValue: schoolId },
                { name: "lessonId", label: "Leçon", type: "hidden", defaultValue: selectedLessonId },
                { name: "privateOnGlobalLesson", label: "", type: "hidden", defaultValue: "false" },
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
                      confirmMessage={`Supprimer l'exercice "${ex.title}" ?`}
                    />
                  </>
                }
              />
            ))}
            {exercises.length === 0 && <p className="text-sm text-muted-foreground">Aucun exercice pour l&apos;instant.</p>}
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
