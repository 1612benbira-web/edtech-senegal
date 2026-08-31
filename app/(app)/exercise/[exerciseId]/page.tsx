import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublishedQuestionsForExercise } from "@/lib/queries/exercises";
import { getCurrentSchoolId, isCurriculumAllowedForSchool } from "@/lib/services/schoolService";
import { ExerciseRunner } from "./exercise-runner";

export default async function ExercisePage({
  params,
}: {
  params: { exerciseId: string };
}) {
  const supabase = await createClient();
  const { data: exercise } = await supabase
    .from("exercises")
    .select("*, lessons(id, title, chapters(curriculum_id, curriculums(level_id)))")
    .eq("id", params.exerciseId)
    .eq("status", "published")
    .maybeSingle();

  if (!exercise) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("level_id")
    .eq("id", user!.id)
    .single();

  const chapter = (exercise as any).lessons?.chapters;
  const curriculumId = chapter?.curriculum_id as string | undefined;
  const curriculumLevelId = chapter?.curriculums?.level_id as string | undefined;

  // Un exercice publié n'est visible que si son programme correspond
  // au niveau de l'élève ET est activé pour son école (multi-écoles) —
  // cette page n'effectuait auparavant aucune de ces deux vérifications.
  if (!curriculumId || !profile?.level_id || curriculumLevelId !== profile.level_id) {
    notFound();
  }
  const schoolId = await getCurrentSchoolId();

  // Un exercice PRIVÉ (exercise.school_id renseigné — ajouté par une
  // école sur une leçon globale, cf. migration 0019) ne dépend pas de
  // l'activation du programme global via school_curriculums : sa
  // visibilité est déjà entièrement tranchée par la RLS (le SELECT
  // ci-dessus n'aurait renvoyé aucune ligne sinon). On ne applique la
  // vérification school_curriculums qu'aux exercices pleinement globaux.
  if (!(exercise as any).school_id) {
    if (!(await isCurriculumAllowedForSchool(schoolId, curriculumId))) notFound();
  }

  const questions = await getPublishedQuestionsForExercise(params.exerciseId);

  return (
    <div className="mx-auto w-full max-w-3xl min-w-0">
      <h1 className="mb-1 break-words text-xl font-bold text-foreground [overflow-wrap:anywhere] sm:text-2xl">{exercise.title}</h1>
      {exercise.instructions && (
        <p className="mb-6 break-words text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">{exercise.instructions}</p>
      )}

      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune question publiée pour cet exercice.</p>
      ) : (
        <ExerciseRunner exerciseId={params.exerciseId} lessonId={exercise.lesson_id} questions={questions as any} />
      )}
    </div>
  );
}
