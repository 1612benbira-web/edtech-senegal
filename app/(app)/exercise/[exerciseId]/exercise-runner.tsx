"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  gradeExerciseAction,
  type GradeExerciseResult,
} from "../actions";
import { Button } from "@/components/ui/button";

interface Option {
  id: string;
  label: string;
  order: number | null;
  match_key?: string | null;
}

interface Question {
  id: string;
  type: string;
  prompt: string;
  points: number;
  question_options: Option[];
}

export function ExerciseRunner({
  exerciseId,
  lessonId,
  questions,
}: {
  exerciseId: string;
  lessonId: string;
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<
    Record<string, string | string[]>
  >({});

  const [result, setResult] =
    useState<GradeExerciseResult | null>(null);

  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const supportedQuestions = questions;

  /**
   * Réponse à choix unique.
   */
  function setSingleAnswer(
    questionId: string,
    optionId: string
  ) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  }

  /**
   * Réponses à choix multiples.
   */
  function toggleMultipleAnswer(
    questionId: string,
    optionId: string
  ) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId])
        ? [...(prev[questionId] as string[])]
        : [];

      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];

      return {
        ...prev,
        [questionId]: next,
      };
    });
  }

  /**
   * Réponse texte / numérique.
   */
  function setTextAnswer(
    questionId: string,
    value: string
  ) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  /**
   * Réponse pour les exercices de correspondance.
   */
  function setMatchingAnswer(
    questionId: string,
    index: number,
    value: string
  ) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId])
        ? [...(prev[questionId] as string[])]
        : [];

      current[index] = value;

      return {
        ...prev,
        [questionId]: current,
      };
    });
  }

  /**
   * Déplace une option vers le haut ou vers le bas.
   *
   * Les ! indiquent à TypeScript que les indices
   * sont garantis par les vérifications précédentes.
   */
  function moveOrderingOption(
    questionId: string,
    index: number,
    direction: -1 | 1
  ) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId])
        ? [...(prev[questionId] as string[])]
        : [];

      if (current.length === 0) {
        return prev;
      }

      const target = index + direction;

      if (
        index < 0 ||
        index >= current.length ||
        target < 0 ||
        target >= current.length
      ) {
        return prev;
      }

      const currentValue = current[index];
      const targetValue = current[target];

      if (
        currentValue === undefined ||
        targetValue === undefined
      ) {
        return prev;
      }

      current[index] = targetValue;
      current[target] = currentValue;

      return {
        ...prev,
        [questionId]: current,
      };
    });
  }

  /**
   * Initialise les réponses d'un exercice d'ordre
   * avec les options mélangées.
   */
  function initializeOrdering(
    questionId: string,
    options: Option[]
  ) {
    setAnswers((prev) => {
      if (prev[questionId]) {
        return prev;
      }

      const shuffled = options.map(
        (option) => option.id
      );

      for (
        let i = shuffled.length - 1;
        i > 0;
        i--
      ) {
        const j = Math.floor(
          Math.random() * (i + 1)
        );

        const currentValue = shuffled[i];
        const targetValue = shuffled[j];

        if (
          currentValue === undefined ||
          targetValue === undefined
        ) {
          continue;
        }

        shuffled[i] = targetValue;
        shuffled[j] = currentValue;
      }

      return {
        ...prev,
        [questionId]: shuffled,
      };
    });
  }

  /**
   * Envoie les réponses au serveur.
   */
  function handleSubmit() {
    startTransition(async () => {
      const res = await gradeExerciseAction(
        exerciseId,
        answers
      );

      setResult(res);
    });
  }

  /**
   * Affichage des résultats.
   */
  if (result) {
    return (
      <div>
        <div
          className={`mb-6 rounded-xl p-4 text-center ${
            result.score >= 70
              ? "bg-success/10"
              : "bg-warning/15"
          }`}
        >
          <p className="font-mono text-2xl font-semibold text-foreground">
            {result.score}%
          </p>

          <p className="text-sm text-muted-foreground">
            {result.correctCount} / {result.totalCount}{" "}
            bonnes réponses
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-base font-bold text-foreground">
            Prends le temps de revoir tes erreurs 👀
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ton score et les corrections restent affichés avant de continuer.
          </p>
        </div>

        <div className="space-y-4">
          {supportedQuestions.map((q) => {
            const r = result.results.find(
              (res) => res.questionId === q.id
            );

            if (!r) {
              return null;
            }

            return (
              <div
                key={q.id}
                className={`rounded-xl border p-4 ${
                  r.isCorrect
                    ? "border-success/30 bg-success/5"
                    : "border-danger/30 bg-danger/5"
                }`}
              >
                <p className="flex min-w-0 items-start gap-2 break-words text-base font-semibold leading-7 text-foreground [overflow-wrap:anywhere] sm:text-lg">
                  {r.isCorrect ? (
                    <Check
                      className="h-4 w-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                  ) : (
                    <X
                      className="h-4 w-4 shrink-0 text-danger"
                      aria-hidden="true"
                    />
                  )}

                  {q.prompt}
                </p>

                {!r.isCorrect && (
                  <p className="mt-2 break-words text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
                    Bonne réponse :{" "}
                    {r.correctLabels.join(", ")}
                  </p>
                )}

                {r.explanation && (
                  <p className="mt-2 break-words text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
                    {r.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/lesson/${lessonId}`)}
              className="w-full border border-border bg-muted/30 px-4 py-3 text-sm font-semibold hover:bg-muted"
            >
              Revoir la leçon
            </Button>

            {result.nextLessonUrl ? (
              <Button
                type="button"
                onClick={() => router.push(result.nextLessonUrl!)}
                className="w-full min-w-0 gap-2 whitespace-nowrap px-4 py-3 sm:w-full"
              >
                Leçon suivante
                <span aria-hidden="true">→</span>
              </Button>
            ) : result.nextChapterUrl ? (
              <Button
                type="button"
                onClick={() => router.push(result.nextChapterUrl!)}
                className="w-full min-w-0 gap-2 whitespace-nowrap px-4 py-3 sm:w-full"
              >
                Chapitre suivant
                <span aria-hidden="true">→</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => router.push("/programme")}
                className="w-full min-w-0 gap-2 whitespace-nowrap px-4 py-3 sm:w-full"
              >
                Retour au programme
                <span aria-hidden="true">→</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Affichage des questions.
   */
  return (
    <div className="space-y-6">
      {supportedQuestions.map((q, i) => (
        <div
          key={q.id}
          ref={(node) => {
            if (
              node &&
              q.type === "ordering"
            ) {
              initializeOrdering(
                q.id,
                q.question_options
              );
            }
          }}
          className="rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-6"
        >
          <p className="mb-4 break-words text-base font-semibold leading-7 text-foreground [overflow-wrap:anywhere] sm:text-xl">
            {i + 1}. {q.prompt}
          </p>

          {/* CHOIX UNIQUE / VRAI-FAUX */}
          {(q.type === "single_choice" ||
            q.type === "true_false") && (
            <div className="space-y-3">
              {q.question_options.map((opt) => (
                <label
                  key={opt.id}
                  className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-base leading-6 text-foreground transition hover:border-primary/40 hover:bg-muted"
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={
                      answers[q.id] === opt.id
                    }
                    onChange={() =>
                      setSingleAnswer(
                        q.id,
                        opt.id
                      )
                    }
                  />

                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {/* CHOIX MULTIPLES */}
          {q.type === "multiple_choice" && (
            <div className="space-y-3">
              {q.question_options.map((opt) => (
                <label
                  key={opt.id}
                  className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-base leading-6 text-foreground transition hover:border-primary/40 hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(
                        answers[q.id]
                      ) &&
                      (
                        answers[q.id] as string[]
                      ).includes(opt.id)
                    }
                    onChange={() =>
                      toggleMultipleAnswer(
                        q.id,
                        opt.id
                      )
                    }
                  />

                  {opt.label}
                </label>
              ))}
            </div>
          )}

          {/* CORRESPONDANCE */}
          {q.type === "matching" && (
            <div className="space-y-3">
              {(q.question_options ?? []).map(
                (opt, index) => {
                  const matchingAnswers =
                    Array.isArray(
                      answers[q.id]
                    )
                      ? (answers[
                          q.id
                        ] as string[])
                      : [];

                  const rightChoices = (
                    q.question_options ?? []
                  )
                    .map(
                      (item) => item.match_key
                    )
                    .filter(
                      (
                        value
                      ): value is string =>
                        Boolean(value)
                    );

                  return (
                    <div
                      key={opt.id}
                      className="grid min-w-0 gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center"
                    >
                      <span className="min-w-0 break-words text-base font-medium leading-6 text-foreground [overflow-wrap:anywhere]">
                        {opt.label}
                      </span>

                      <select
                        value={
                          matchingAnswers[
                            index
                          ] ?? ""
                        }
                        onChange={(e) =>
                          setMatchingAnswer(
                            q.id,
                            index,
                            e.target.value
                          )
                        }
                        className="min-h-11 rounded-xl border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">
                          Choisir une correspondance…
                        </option>

                        {rightChoices.map(
                          (choice) => (
                            <option
                              key={choice}
                              value={choice}
                            >
                              {choice}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* ORDRE */}
          {q.type === "ordering" && (
            <div className="space-y-3">
              {(() => {
                const orderAnswers =
                  Array.isArray(
                    answers[q.id]
                  )
                    ? (answers[
                        q.id
                      ] as string[])
                    : q.question_options.map(
                        (option) =>
                          option.id
                      );

                const optionById =
                  new Map(
                    q.question_options.map(
                      (option) => [
                        option.id,
                        option,
                      ]
                    )
                  );

                return orderAnswers.map(
                  (optionId, index) => {
                    const option =
                      optionById.get(
                        optionId
                      );

                    if (!option) {
                      return null;
                    }

                    return (
                      <div
                        key={option.id}
                        className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card p-3 sm:gap-3"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                          {index + 1}
                        </span>

                        <span className="min-w-0 flex-1 break-words text-base leading-6 text-foreground [overflow-wrap:anywhere]">
                          {option.label}
                        </span>

                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            aria-label="Monter"
                            disabled={
                              index === 0
                            }
                            onClick={() =>
                              moveOrderingOption(
                                q.id,
                                index,
                                -1
                              )
                            }
                            className="rounded-lg border border-border p-2 text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            aria-label="Descendre"
                            disabled={
                              index ===
                              orderAnswers.length -
                                1
                            }
                            onClick={() =>
                              moveOrderingOption(
                                q.id,
                                index,
                                1
                              )
                            }
                            className="rounded-lg border border-border p-2 text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                );
              })()}
            </div>
          )}

          {/* NUMÉRIQUE / RÉPONSE COURTE */}
          {(q.type === "numeric" ||
            q.type === "short_answer") && (
            <input
              type="text"
              inputMode={
                q.type === "numeric"
                  ? "decimal"
                  : "text"
              }
              value={
                (answers[q.id] as string) ?? ""
              }
              onChange={(e) =>
                setTextAnswer(
                  q.id,
                  e.target.value
                )
              }
              className="min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={
                q.type === "numeric"
                  ? "Ta réponse (nombre)"
                  : "Ta réponse"
              }
            />
          )}
        </div>
      ))}

      <Button
        isLoading={isPending}
        onClick={handleSubmit}
      >
        Corriger
      </Button>
    </div>
  );
}