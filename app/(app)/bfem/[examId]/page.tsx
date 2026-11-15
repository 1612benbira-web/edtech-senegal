import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getQuizAttempt, getQuizQuestions } from "@/lib/queries/quiz";
import { getExamCorrection } from "@/lib/services/examService";
import { examDurationSeconds, examRemainingSeconds, isExamQuestionType } from "@/lib/algorithms/mockExam";
import { ExamRunnerLoader } from "./exam-runner-loader";
import { ExamResult } from "./exam-result";
import type { ExamQuestion } from "./exam-runner";

export const metadata: Metadata = { title: "Épreuve blanche" };

export default async function ExamPage(props: { params: Promise<{ examId: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const exam = await getQuizAttempt(params.examId, user.id);
  if (!exam) notFound();
  if (exam.type !== "exam") redirect(`/quiz/${params.examId}`);

  const { data: subject } = exam.subject_id
    ? await supabase.from("subjects").select("id, name").eq("id", exam.subject_id).maybeSingle()
    : { data: null };
  const subjectName = subject?.name ?? "Épreuve";
  const totalQuestions = exam.total_questions ?? 0;

  const header = (
    <>
      <Link
        href="/bfem"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        BFEM blanc
      </Link>
      <h1 className="mb-1 text-xl font-bold text-foreground">Épreuve blanche · {subjectName}</h1>
    </>
  );

  if (exam.completed_at) {
    const correction = await getExamCorrection(params.examId, user.id);
    return (
      <div className="mx-auto max-w-2xl">
        {header}
        <ExamResult
          subjectId={exam.subject_id}
          correctAnswers={exam.correct_answers ?? 0}
          totalQuestions={totalQuestions}
          startedAt={exam.started_at}
          completedAt={exam.completed_at}
          correction={correction ?? []}
        />
      </div>
    );
  }

  const quizQuestions = await getQuizQuestions(params.examId);
  const questions = quizQuestions
    .map((qq) => (qq as unknown as { questions: ExamQuestion | null }).questions)
    .filter((q): q is ExamQuestion => q !== null && isExamQuestionType(q.type))
    .map((q) => ({
      ...q,
      question_options: [...q.question_options].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }));

  return (
    <div className="mx-auto max-w-2xl">
      {header}
      <p className="mb-4 text-sm text-muted-foreground">
        {questions.length} question{questions.length > 1 ? "s" : ""} · {Math.round(examDurationSeconds(totalQuestions) / 60)} minutes
      </p>
      <ExamRunnerLoader
        examId={params.examId}
        questions={questions}
        remainingSeconds={examRemainingSeconds(exam.started_at, totalQuestions)}
        totalSeconds={examDurationSeconds(totalQuestions)}
      />
    </div>
  );
}
