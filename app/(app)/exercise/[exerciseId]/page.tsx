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
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-bold text-foreground">{exercise.title}</h1>
      {exercise.instructions && (
        <p className="mb-6 text-sm text-muted-foreground">{exercise.instructions}</p>
      )}

      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune question publiée pour cet exercice.</p>
      ) : (
        <ExerciseRunner exerciseId={params.exerciseId} questions={questions as any} />
      )}
    </div>
  );
}
