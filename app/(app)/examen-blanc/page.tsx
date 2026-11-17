import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, Clock, GraduationCap, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMyProgramme } from "@/lib/queries/programme";
import { getLevelInfo, getMyExamAttempts } from "@/lib/services/examService";
import {
  EXAM_HUB_PATH,
  EXAM_QUESTION_COUNT,
  averageNote,
  examAppreciation,
  examDurationSeconds,
  examNote,
  examRemainingSeconds,
  formatNote,
  getExamForLevel,
} from "@/lib/algorithms/mockExam";
import { getSubjectTheme } from "@/lib/constants/subject-theme";
import { StartQuizButton } from "@/components/quiz/start-quiz-button";
import { Card } from "@/components/ui/card";
import { startMockExamAction } from "./actions";

export const metadata: Metadata = { title: "Épreuves blanches" };

const ERROR_MESSAGES: Record<string, string> = {
  no_questions:
    "Il n'y a pas encore assez de questions publiées dans cette matière pour composer une épreuve.",
  unavailable:
    "Les épreuves blanches ne sont pas encore activées sur cette plateforme. Préviens ton établissement ou réessaie plus tard.",
};

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  timeZone: "Africa/Dakar",
});

export default async function ExamHubPage(props: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("level_id, series_id")
    .eq("id", user.id)
    .single();
  if (!profile?.level_id) redirect("/onboarding");

  const level = await getLevelInfo(profile.level_id);
  const exam = getExamForLevel(level);
  if (!exam) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-xl font-bold text-foreground">Épreuves blanches</h1>
        <Card>
          <p className="text-sm leading-6 text-muted-foreground">
            Les épreuves blanches sont réservées aux classes d&apos;examen : le BFEM en 3e et le Bac en
            Terminale. Dans ta classe, tu peux t&apos;entraîner avec les quiz de matière et le quiz du jour.
          </p>
          <Link href="/quiz" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            Aller aux quiz
          </Link>
        </Card>
      </div>
    );
  }

  const [programmes, attempts] = await Promise.all([
    getMyProgramme(user.id, profile.level_id, profile.series_id),
    getMyExamAttempts(user.id),
  ]);
  const subjects = programmes.filter((p) => p.curriculumId && p.totalChapters > 0);
  const subjectNames = new Map(subjects.map((s) => [s.subjectId, s.subjectName]));

  const now = new Date();
  const completed = attempts.filter((a) => a.completedAt && a.correctAnswers !== null);
  const noteOf = (a: (typeof attempts)[number]) => examNote(a.correctAnswers ?? 0, a.totalQuestions);

  // Dernière note par matière (les tentatives sont triées de la plus récente à la plus ancienne).
  const latestNoteBySubject = new Map<string, number>();
  for (const attempt of completed) {
    if (attempt.subjectId && !latestNoteBySubject.has(attempt.subjectId)) {
      latestNoteBySubject.set(attempt.subjectId, noteOf(attempt));
    }
  }
  const average = averageNote(Array.from(latestNoteBySubject.values()));
  const durationMinutes = Math.round(examDurationSeconds(EXAM_QUESTION_COUNT) / 60);
  const errorMessage = searchParams.erreur ? ERROR_MESSAGES[searchParams.erreur] : undefined;

  return (
    <div>
      <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground">
        <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
        {exam.label}
      </h1>
      <p className="mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">
        Entraîne-toi dans les conditions d&apos;un examen : une épreuve par matière, en temps
        limité, notée sur 20, avec le corrigé à la fin. Les questions sont tirées de tout ton
        programme de {exam.levelLabel} sur la plateforme ; ce ne sont pas les sujets officiels du{" "}
        {exam.name}.
      </p>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" aria-hidden="true" />
          {errorMessage}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-muted-foreground">Ta moyenne</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-foreground">
            {average === null ? "—" : `${formatNote(average)}/20`}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {average === null
              ? "Passe une première épreuve pour l'obtenir."
              : `Moyenne simple de ta dernière note dans chaque matière, sans les coefficients du ${exam.name}.`}
          </p>
        </Card>
        <Card className="flex items-start gap-3">
          <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">{EXAM_QUESTION_COUNT} questions</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Réparties sur tous les chapitres de la matière.
            </p>
          </div>
        </Card>
        <Card className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">{durationMinutes} minutes</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Le chronomètre démarre dès que tu commences et ne s&apos;arrête pas.
            </p>
          </div>
        </Card>
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Choisis une épreuve</h2>
      {subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune matière avec du contenu publié pour l&apos;instant.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {subjects.map((subject) => {
            const theme = getSubjectTheme(subject.subjectName, subject.subjectIcon);
            const subjectCompleted = completed.filter((a) => a.subjectId === subject.subjectId);
            const lastNote = latestNoteBySubject.get(subject.subjectId);
            const bestNote =
              subjectCompleted.length > 0 ? Math.max(...subjectCompleted.map(noteOf)) : undefined;
            const inProgress = attempts.find(
              (a) =>
                a.subjectId === subject.subjectId &&
                !a.completedAt &&
                examRemainingSeconds(a.startedAt, a.totalQuestions, now) > 0
            );
            return (
              <Card key={subject.subjectId}>
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ${theme.soft} ${theme.icon}`}
                  >
                    <theme.Icon className={`h-3.5 w-3.5 ${theme.accent}`} aria-hidden="true" />
                  </span>
                  {subject.subjectName}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {lastNote === undefined
                    ? "Pas encore d'épreuve passée."
                    : `Dernière note : ${formatNote(lastNote)}/20 · Meilleure : ${formatNote(bestNote ?? lastNote)}/20 · ${subjectCompleted.length} épreuve${subjectCompleted.length > 1 ? "s" : ""}`}
                </p>
                <div className="mt-3">
                  <StartQuizButton
                    action={startMockExamAction}
                    arg={subject.subjectId}
                    label={inProgress ? "Reprendre l'épreuve en cours" : "Commencer l'épreuve"}
                    variant={inProgress ? "secondary" : "primary"}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {attempts.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-foreground">
            Tes dernières épreuves
          </h2>
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {attempts.slice(0, 10).map((attempt) => {
              const note =
                attempt.completedAt && attempt.correctAnswers !== null ? noteOf(attempt) : null;
              const stillOpen =
                !attempt.completedAt &&
                examRemainingSeconds(attempt.startedAt, attempt.totalQuestions, now) > 0;
              return (
                <li key={attempt.id}>
                  <Link
                    href={`${EXAM_HUB_PATH}/${attempt.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-muted"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">
                        {(attempt.subjectId && subjectNames.get(attempt.subjectId)) ?? "Épreuve"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {DATE_FORMAT.format(new Date(attempt.startedAt))}
                        {note !== null ? ` · ${examAppreciation(note)}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-sm font-semibold text-foreground">
                      {note !== null ? `${formatNote(note)}/20` : stillOpen ? "En cours" : "Non rendue"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
