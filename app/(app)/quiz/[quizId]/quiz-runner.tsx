"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { gradeQuizAction, type GradeQuizResult } from "../actions";
import { Button } from "@/components/ui/button";

interface Option {
  id: string;
  label: string;
  order: number | null;
}
interface Question {
  id: string;
  type: string;
  prompt: string;
  points: number;
  question_options: Option[];
}

export function QuizRunner({ quizId, questions }: { quizId: string; questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<GradeQuizResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const supportedQuestions = questions.filter(
    (q) => q.type !== "matching" && q.type !== "ordering"
  );

  function setSingleAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }
  function toggleMultipleAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  }
  function setTextAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleSubmit() {
    startTransition(async () => {
      const res = await gradeQuizAction(quizId, answers);
      setResult(res);
    });
  }

  if (result) {
    return (
      <div>
        <div
          className={`mb-6 rounded-xl p-4 text-center ${
            result.score >= 70 ? "bg-success/10" : "bg-warning/15"
          }`}
        >
          <p className="font-mono text-2xl font-semibold text-foreground">{result.score}%</p>
          <p className="text-sm text-muted-foreground">
            {result.correctCount} / {result.totalCount} bonnes réponses
          </p>
        </div>

        <div className="space-y-4">
          {supportedQuestions.map((q) => {
            const r = result.results.find((res) => res.questionId === q.id);
            if (!r) return null;
            return (
              <div
                key={q.id}
                className={`rounded-xl border p-4 ${
                  r.isCorrect ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
                }`}
              >
                <p className="flex items-start gap-2 text-base font-semibold leading-7 text-foreground sm:text-lg">
                  {r.isCorrect ? (
                    <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                  )}
                  {q.prompt}
                </p>
                {!r.isCorrect && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Bonne réponse : {r.correctLabels.join(", ")}
                  </p>
                )}
                {r.explanation && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{r.explanation}</p>
                )}
              </div>
            );
          })}
        </div>

        <Link href="/dashboard" className="mt-6 block text-center text-sm text-primary hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  if (supportedQuestions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune question disponible pour ce quiz pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {supportedQuestions.map((q, i) => (
        <div key={q.id} className="rounded-2xl border border-border bg-background p-5 sm:p-6">
          <p className="mb-4 text-lg font-semibold leading-7 text-foreground sm:text-xl">
            {i + 1}. {q.prompt}
          </p>

          {(q.type === "single_choice" || q.type === "true_false") && (
            <div className="space-y-3">
              {q.question_options.map((opt) => (
                <label key={opt.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-base leading-6 text-foreground transition hover:border-primary/40 hover:bg-muted">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => setSingleAnswer(q.id, opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {q.type === "multiple_choice" && (
            <div className="space-y-3">
              {q.question_options.map((opt) => (
                <label key={opt.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-base leading-6 text-foreground transition hover:border-primary/40 hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt.id)
                    }
                    onChange={() => toggleMultipleAnswer(q.id, opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {(q.type === "numeric" || q.type === "short_answer") && (
            <input
              type="text"
              inputMode={q.type === "numeric" ? "decimal" : "text"}
              value={(answers[q.id] as string) ?? ""}
              onChange={(e) => setTextAnswer(q.id, e.target.value)}
              className="min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={q.type === "numeric" ? "Ta réponse (nombre)" : "Ta réponse"}
            />
          )}
        </div>
      ))}

      <Button isLoading={isPending} onClick={handleSubmit}>
        Corriger le quiz
      </Button>
    </div>
  );
}
