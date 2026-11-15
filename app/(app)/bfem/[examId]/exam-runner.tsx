"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Clock } from "lucide-react";
import { gradeQuizAction } from "@/app/(app)/quiz/actions";
import { formatCountdown } from "@/lib/algorithms/mockExam";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface ExamOption {
  id: string;
  label: string;
  order: number | null;
}

export interface ExamQuestion {
  id: string;
  type: string;
  prompt: string;
  points: number;
  question_options: ExamOption[];
}

export interface ExamRunnerProps {
  examId: string;
  questions: ExamQuestion[];
  /** Temps restant au moment où le serveur a rendu la page. */
  remainingSeconds: number;
  totalSeconds: number;
}

type Answers = Record<string, string | string[]>;

/**
 * Les réponses sont gardées sur l'appareil pendant l'épreuve : si la page
 * est rechargée ou si le réseau tombe, l'élève retrouve sa copie. Elles ne
 * partent au serveur qu'au moment où il rend sa copie (ou à la fin du temps).
 */
function storageKey(examId: string) {
  return `bfem-exam-${examId}`;
}

function loadAnswers(examId: string): Answers {
  try {
    const raw = window.localStorage.getItem(storageKey(examId));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const answers: Answers = {};
    for (const [questionId, value] of Object.entries(parsed)) {
      if (typeof value === "string") answers[questionId] = value;
      else if (Array.isArray(value) && value.every((v) => typeof v === "string")) answers[questionId] = value;
    }
    return answers;
  } catch {
    return {};
  }
}

function saveAnswers(examId: string, answers: Answers) {
  try {
    window.localStorage.setItem(storageKey(examId), JSON.stringify(answers));
  } catch {
    // Stockage indisponible (navigation privée, quota) : l'épreuve continue en mémoire.
  }
}

function clearAnswers(examId: string) {
  try {
    window.localStorage.removeItem(storageKey(examId));
  } catch {
    // Rien à nettoyer.
  }
}

function isAnswered(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" && value.trim() !== "";
}

const OPTION_CLASSES =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-base leading-6 text-foreground transition hover:border-primary/40 hover:bg-muted";

export function ExamRunner({ examId, questions, remainingSeconds, totalSeconds }: ExamRunnerProps) {
  const router = useRouter();
  // L'échéance est fixée une fois, à partir du temps restant calculé par le
  // serveur : l'horloge de l'appareil ne sert qu'à mesurer le temps qui passe.
  const [deadline] = useState(() => Date.now() + remainingSeconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const [answers, setAnswers] = useState<Answers>(() => loadAnswers(examId));
  const [current, setCurrent] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const answersRef = useRef<Answers>(answers);
  const submittingRef = useRef(false);
  const autoSubmitDoneRef = useRef(false);

  const submit = useCallback(() => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    startTransition(async () => {
      try {
        await gradeQuizAction(examId, answersRef.current);
        clearAnswers(examId);
      } catch {
        // Réseau coupé, ou copie déjà rendue depuis un autre onglet. Dans
        // les deux cas on recharge l'état serveur : si la copie est rendue,
        // la page affiche le résultat ; sinon l'élève peut renvoyer.
        submittingRef.current = false;
        setError("Ta copie n'a pas pu être envoyée. Vérifie ta connexion puis réessaie : tes réponses sont gardées sur cet appareil.");
      }
      router.refresh();
    });
  }, [examId, router]);

  useEffect(() => {
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (time >= deadline && !autoSubmitDoneRef.current) {
        autoSubmitDoneRef.current = true;
        submit();
      }
    };
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [deadline, submit]);

  function updateAnswer(questionId: string, value: string | string[]) {
    const next = { ...answersRef.current, [questionId]: value };
    answersRef.current = next;
    setAnswers(next);
    saveAnswers(examId, next);
  }

  function toggleOption(questionId: string, optionId: string) {
    const previous = answersRef.current[questionId];
    const selected = Array.isArray(previous) ? previous : [];
    updateAnswer(
      questionId,
      selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId]
    );
  }

  if (questions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune question disponible pour cette épreuve pour le moment.
      </p>
    );
  }

  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  const timeUp = remaining === 0;
  const locked = timeUp || isPending;
  const answeredCount = questions.filter((q) => isAnswered(answers[q.id])).length;
  const unansweredCount = questions.length - answeredCount;
  const elapsedPercent =
    totalSeconds > 0 ? Math.min(100, Math.max(0, ((totalSeconds - remaining) / totalSeconds) * 100)) : 100;
  const lowTime = remaining <= 300;
  const index = Math.min(current, questions.length - 1);
  const question = questions[index] as ExamQuestion;
  const answer = answers[question.id];
  const isLast = index === questions.length - 1;

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-1 mb-5 rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <p
            role="timer"
            aria-label={`Temps restant : ${formatCountdown(remaining)}`}
            className={cn(
              "flex items-center gap-2 font-mono text-xl font-semibold",
              lowTime ? "text-danger" : "text-foreground"
            )}
          >
            <Clock className="h-5 w-5" aria-hidden="true" />
            {formatCountdown(remaining)}
          </p>
          <p className="text-sm text-muted-foreground">
            {answeredCount} / {questions.length} répondues
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div
            className={cn("h-full rounded-full", lowTime ? "bg-danger" : "bg-primary")}
            style={{ width: `${elapsedPercent}%` }}
          />
        </div>
      </div>

      {timeUp && !error && (
        <p role="status" className="mb-4 rounded-xl bg-warning/15 p-4 text-sm text-foreground">
          Le temps est écoulé : ta copie est envoyée automatiquement…
        </p>
      )}

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/5 p-4">
          <p className="flex items-start gap-2 text-sm text-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
            {error}
          </p>
          <Button className="mt-3 w-auto" isLoading={isPending} onClick={submit}>
            Renvoyer ma copie
          </Button>
        </div>
      )}

      <fieldset disabled={locked} className="rounded-2xl border border-border bg-background p-5 sm:p-6">
        <legend className="sr-only">
          Question {index + 1} sur {questions.length}
        </legend>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground" aria-hidden="true">
          Question {index + 1} / {questions.length}
        </p>
        <p className="mb-4 text-lg font-semibold leading-7 text-foreground sm:text-xl">{question.prompt}</p>

        {(question.type === "single_choice" || question.type === "true_false") && (
          <div className="space-y-3">
            {question.question_options.map((option) => (
              <label key={option.id} className={OPTION_CLASSES}>
                <input
                  type="radio"
                  name={question.id}
                  checked={answer === option.id}
                  onChange={() => updateAnswer(question.id, option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        )}

        {question.type === "multiple_choice" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Plusieurs réponses sont possibles.</p>
            {question.question_options.map((option) => (
              <label key={option.id} className={OPTION_CLASSES}>
                <input
                  type="checkbox"
                  checked={Array.isArray(answer) && answer.includes(option.id)}
                  onChange={() => toggleOption(question.id, option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        )}

        {(question.type === "numeric" || question.type === "short_answer") && (
          <input
            type="text"
            inputMode={question.type === "numeric" ? "decimal" : "text"}
            aria-label="Ta réponse"
            value={typeof answer === "string" ? answer : ""}
            onChange={(event) => updateAnswer(question.id, event.target.value)}
            className="min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder={question.type === "numeric" ? "Ta réponse (nombre)" : "Ta réponse"}
          />
        )}
      </fieldset>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          className="w-auto"
          disabled={index === 0 || locked}
          onClick={() => setCurrent(index - 1)}
        >
          Précédente
        </Button>
        {isLast ? (
          <Button className="w-auto" disabled={locked} onClick={() => setConfirming(true)}>
            Rendre ma copie
          </Button>
        ) : (
          <Button className="w-auto" disabled={locked} onClick={() => setCurrent(index + 1)}>
            Suivante
          </Button>
        )}
      </div>

      <nav aria-label="Aller à une question" className="mt-6">
        <ul className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {questions.map((q, i) => {
            const answered = isAnswered(answers[q.id]);
            return (
              <li key={q.id}>
                <button
                  type="button"
                  disabled={locked}
                  aria-current={i === index ? "true" : undefined}
                  aria-label={`Question ${i + 1}${answered ? ", répondue" : ", sans réponse"}`}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-center rounded-lg border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
                    answered
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground",
                    i === index && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {!isLast && !confirming && (
        <button
          type="button"
          disabled={locked}
          onClick={() => setConfirming(true)}
          className="mt-6 text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          Rendre ma copie maintenant
        </button>
      )}

      {confirming && !timeUp && (
        <div role="alertdialog" aria-labelledby="exam-confirm-title" className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p id="exam-confirm-title" className="text-base font-semibold text-foreground">
            Rendre ta copie ?
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {unansweredCount === 0
              ? "Tu as répondu à toutes les questions. Une fois la copie rendue, tu ne peux plus la modifier."
              : `Il reste ${unansweredCount} question${unansweredCount > 1 ? "s" : ""} sans réponse : elle${unansweredCount > 1 ? "s" : ""} compter${unansweredCount > 1 ? "ont" : "a"} comme fausse${unansweredCount > 1 ? "s" : ""}. Une fois la copie rendue, tu ne peux plus la modifier.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="w-auto" isLoading={isPending} onClick={submit}>
              Oui, rendre ma copie
            </Button>
            <Button variant="ghost" className="w-auto" disabled={isPending} onClick={() => setConfirming(false)}>
              Continuer l&apos;épreuve
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
