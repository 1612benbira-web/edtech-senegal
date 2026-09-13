import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMyProgramme } from "@/lib/queries/programme";
import {
  startDailyQuizAction,
  startReviewQuizAction,
  startSubjectQuizAction,
  startEvaluationQuizAction,
} from "./actions";
import { StartQuizButton } from "@/components/quiz/start-quiz-button";
import { Card } from "@/components/ui/card";
import { getSubjectTheme } from "@/lib/constants/subject-theme";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("level_id, series_id")
    .eq("id", user!.id)
    .single();
  if (!profile?.level_id) redirect("/onboarding");

  const programmes = await getMyProgramme(user!.id, profile.level_id, profile.series_id);
  const subjectsWithContent = programmes.filter((p) => p.curriculumId && p.totalChapters > 0);

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-foreground">Quiz</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Teste tes connaissances, matière par matière, ou laisse-toi guider par le quiz du jour.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 text-primary" aria-hidden="true" />
            Quiz du jour
          </p>
          <p className="mb-3 text-xs text-muted-foreground">
            Un quiz personnalisé basé sur ce que tu as appris récemment.
          </p>
          <StartQuizButton action={startDailyQuizAction} arg="" label="Faire le quiz du jour" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-1 text-sm font-semibold text-foreground">Quiz de révision</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Reviens sur les notions à consolider.
          </p>
          <StartQuizButton action={startReviewQuizAction} arg="" label="Faire un quiz de révision" variant="secondary" />
        </div>
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-foreground">Par matière</h2>
      {subjectsWithContent.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune matière avec du contenu publié pour l&apos;instant.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {subjectsWithContent.map((subject) => {
            const theme = getSubjectTheme(subject.subjectName, subject.subjectIcon);
            return (
              <Card key={subject.subjectId}>
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ${theme.soft} ${theme.icon}`}>
                    <theme.Icon className={`h-3.5 w-3.5 ${theme.accent}`} aria-hidden="true" />
                  </span>
                  {subject.subjectName}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StartQuizButton action={startSubjectQuizAction} arg={subject.subjectId} label="Quiz de la matière" />
                  <StartQuizButton
                    action={startEvaluationQuizAction}
                    arg={subject.subjectId}
                    label="Quiz d'évaluation"
                    variant="secondary"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
