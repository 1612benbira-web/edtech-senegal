import Link from "next/link";
import { Check, X } from "lucide-react";
import {
  examAppreciation,
  examNote,
  formatNote,
  summarizeByChapter,
} from "@/lib/algorithms/mockExam";
import type { ExamCorrectionItem } from "@/lib/services/examService";
import { StartQuizButton } from "@/components/quiz/start-quiz-button";
import { startMockExamAction } from "../actions";

function minutesBetween(startedAt: string, completedAt: string): number | null {
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (Number.isNaN(ms) || ms < 0) return null;
  return Math.max(1, Math.round(ms / 60000));
}

export function ExamResult({
  subjectId,
  correctAnswers,
  totalQuestions,
  startedAt,
  completedAt,
  correction,
}: {
  subjectId: string | null;
  correctAnswers: number;
  totalQuestions: number;
  startedAt: string;
  completedAt: string;
  correction: ExamCorrectionItem[];
}) {
  const note = examNote(correctAnswers, totalQuestions);
  const passed = note >= 10;
  const minutes = minutesBetween(startedAt, completedAt);
  const chapters = summarizeByChapter(correction);
  const toReview = chapters.filter((chapter) => chapter.percent < 50);

  return (
    <div>
      <div className={`mb-6 mt-4 rounded-2xl p-6 text-center ${passed ? "bg-success/10" : "bg-warning/15"}`}>
        <p className="font-mono text-4xl font-semibold text-foreground">
          {formatNote(note)}
          <span className="text-xl text-muted-foreground">/20</span>
        </p>
        <p className="mt-1 text-base font-semibold text-foreground">{examAppreciation(note)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {correctAnswers} bonne{correctAnswers > 1 ? "s" : ""} réponse{correctAnswers > 1 ? "s" : ""} sur{" "}
          {totalQuestions}
          {minutes !== null ? ` · copie rendue en ${minutes} min` : ""}
        </p>
      </div>

      {chapters.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Résultats par chapitre</h2>
          {toReview.length > 0 && (
            <p className="mb-3 text-sm leading-6 text-muted-foreground">
              À revoir en priorité : {toReview.map((chapter) => chapter.chapterTitle).join(", ")}.
            </p>
          )}
          <ul className="space-y-3">
            {chapters.map((chapter) => {
              const title = (
                <span className="min-w-0 truncate text-sm font-medium text-foreground">{chapter.chapterTitle}</span>
              );
              return (
                <li key={chapter.chapterId ?? "autres"} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-3">
                    {chapter.chapterId && subjectId ? (
                      <Link
                        href={`/programme/${subjectId}/${chapter.chapterId}`}
                        className="min-w-0 truncate hover:underline"
                      >
                        {title}
                      </Link>
                    ) : (
                      title
                    )}
                    <span className="shrink-0 font-mono text-sm text-muted-foreground">
                      {chapter.correct}/{chapter.total}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div
                      className={`h-full rounded-full ${chapter.percent >= 50 ? "bg-success" : "bg-danger"}`}
                      style={{ width: `${chapter.percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {correction.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Corrigé</h2>
          <ol className="space-y-4">
            {correction.map((item, index) => (
              <li
                key={item.questionId}
                className={`rounded-xl border p-4 ${
                  item.isCorrect ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
                }`}
              >
                <p className="flex items-start gap-2 text-base font-semibold leading-7 text-foreground">
                  {item.isCorrect ? (
                    <Check className="mt-1.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <X className="mt-1.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                  )}
                  <span>
                    <span className="sr-only">{item.isCorrect ? "Réponse juste. " : "Réponse fausse. "}</span>
                    {index + 1}. {item.prompt}
                  </span>
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Ta réponse : {item.givenAnswer ?? "aucune réponse"}
                </p>
                {!item.isCorrect && item.correctLabels.length > 0 && (
                  <p className="text-sm leading-6 text-foreground">
                    Bonne réponse : {item.correctLabels.join(", ")}
                  </p>
                )}
                {item.explanation && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.explanation}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {subjectId && (
          <StartQuizButton action={startMockExamAction} arg={subjectId} label="Passer une nouvelle épreuve" />
        )}
        <Link href="/bfem" className="text-sm font-medium text-primary hover:underline">
          Retour au BFEM blanc
        </Link>
      </div>
    </div>
  );
}
