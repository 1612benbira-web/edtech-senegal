import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSubjectsProgress, getCompetencyMasteryList, getQuizStats } from "@/lib/queries/progress";
import { Card, MetricCard } from "@/components/ui/card";

export const metadata: Metadata = { title: "Ma progression" };

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("level_id")
    .eq("id", user!.id)
    .single();
  if (!profile?.level_id) redirect("/onboarding");

  const [subjectsProgress, competencies, quizStats] = await Promise.all([
    getSubjectsProgress(user!.id, profile.level_id),
    getCompetencyMasteryList(user!.id),
    getQuizStats(user!.id),
  ]);

  const globalPercent =
    subjectsProgress.length > 0
      ? Math.round(
          subjectsProgress.reduce((sum, s) => sum + s.percent, 0) / subjectsProgress.length
        )
      : 0;

  const weakCompetencies = competencies.filter((c) => c.masteryScore < 60).slice(0, 5);
  const strongCompetencies = competencies.filter((c) => c.masteryScore >= 80).slice(0, 5);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-foreground">Ma progression</h1>

      <Card className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Progression globale</p>
          <p className="font-mono text-sm font-semibold text-foreground">{globalPercent}%</p>
        </div>
        <ProgressBar percent={globalPercent} />
      </Card>

      <div className="mb-8 grid grid-cols-2 gap-3">
        <MetricCard label="Quiz complétés" value={`${quizStats.totalCompleted}`} />
        <MetricCard label="Score moyen" value={`${quizStats.averageScore}%`} />
      </div>

      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold text-muted-foreground">Par matière</p>
        <div className="space-y-3">
          {subjectsProgress.map((s) => (
            <div key={s.subjectId}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-foreground">{s.subjectName}</span>
                <span className="text-muted-foreground">
                  {s.completedLessons}/{s.totalLessons} leçons — {s.percent}%
                </span>
              </div>
              <ProgressBar percent={s.percent} />
            </div>
          ))}
          {subjectsProgress.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune matière choisie pour l'instant.</p>
          )}
        </div>
      </div>

      {weakCompetencies.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">
            Notions à retravailler
          </p>
          <div className="space-y-2">
            {weakCompetencies.map((c) => (
              <div
                key={c.competencyId}
                className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-1.5 text-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning-foreground" aria-hidden="true" />
                  {c.competencyName}
                  {c.subjectName && (
                    <span className="text-muted-foreground"> — {c.subjectName}</span>
                  )}
                </span>
                <span className="font-mono font-medium text-warning-foreground">{c.masteryScore}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {strongCompetencies.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-muted-foreground">Notions maîtrisées</p>
          <div className="space-y-2">
            {strongCompetencies.map((c) => (
              <div
                key={c.competencyId}
                className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-1.5 text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                  {c.competencyName}
                  {c.subjectName && (
                    <span className="text-muted-foreground"> — {c.subjectName}</span>
                  )}
                </span>
                <span className="font-mono font-medium text-success">{c.masteryScore}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {competencies.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Fais quelques exercices ou quiz sur des questions liées à une compétence pour voir
          apparaître ton niveau de maîtrise ici.
        </p>
      )}
    </div>
  );
}
