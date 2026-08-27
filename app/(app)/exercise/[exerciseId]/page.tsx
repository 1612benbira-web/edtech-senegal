import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublishedQuestionsForExercise } from "@/lib/queries/exercises";
import { ExerciseRunner } from "./exercise-runner";

export default async function ExercisePage({
  params,
}: {
  params: { exerciseId: string };
}) {
  const supabase = await createClient();
  const { data: exercise } = await supabase
    .from("exercises")
    .select("*, lessons(id, title)")
    .eq("id", params.exerciseId)
    .eq("status", "published")
    .maybeSingle();

  if (!exercise) notFound();

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
