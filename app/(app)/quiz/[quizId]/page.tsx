import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQuizAttempt, getQuizQuestions } from "@/lib/queries/quiz";
import { QuizRunner } from "./quiz-runner";

const TYPE_LABELS: Record<string, string> = {
  chapter: "Quiz de chapitre",
  subject: "Quiz de matière",
  review: "Quiz de révision",
  evaluation: "Quiz d'évaluation",
  daily: "Quiz du jour",
};

export default async function QuizPage(props: { params: Promise<{ quizId: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const quiz = await getQuizAttempt(params.quizId, user!.id);
  if (!quiz) notFound();

  const quizQuestions = await getQuizQuestions(params.quizId);
  const questions = quizQuestions.map((qq: any) => qq.questions).filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-bold text-foreground">
        {TYPE_LABELS[quiz.type] ?? "Quiz"}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {questions.length} question{questions.length > 1 ? "s" : ""}
      </p>

      {quiz.completed_at ? (
        <p className="text-sm text-muted-foreground">
          Ce quiz a déjà été complété avec un score de {quiz.score}%.
        </p>
      ) : (
        <QuizRunner quizId={params.quizId} questions={questions} />
      )}
    </div>
  );
}
