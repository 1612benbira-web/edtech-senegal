import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublishedCurriculum, getPublishedChapters } from "@/lib/queries/curriculums-detail";
import { startSubjectQuizAction, startEvaluationQuizAction } from "@/app/(app)/quiz/actions";
import { StartQuizButton } from "@/components/quiz/start-quiz-button";
import { getSubjectTheme } from "@/lib/constants/subject-theme";

export default async function SubjectProgrammePage({
  params,
}: {
  params: { subject: string };
}) {
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

  const { data: subject } = await supabase
    .from("subjects")
    .select("name, icon")
    .eq("id", params.subject)
    .single();

  const curriculum = await getPublishedCurriculum(params.subject, profile.level_id);
  if (!curriculum) notFound();

  const chapters = await getPublishedChapters(curriculum.id);
  const theme = getSubjectTheme(subject?.name ?? "", subject?.icon);
  const SubjectIcon = theme.Icon;

  return (
    <div className="space-y-6">
      <Link href="/programme" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
        ← Mon programme
      </Link>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${theme.soft} ${theme.icon}`} aria-hidden="true">
            <SubjectIcon className={`h-6 w-6 ${theme.accent}`} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl">{subject?.name ?? "Matière"}</h1>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{curriculum.description ?? "Progresse chapitre après chapitre et suis ta progression."}</p>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {chapters.map((ch) => (
          <Link
            key={ch.id}
            href={`/programme/${params.subject}/${ch.id}`}
            className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <p className="font-medium text-foreground">{ch.title}</p>
          </Link>
        ))}
        {chapters.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun chapitre publié pour l'instant dans cette matière.
          </p>
        )}
      </div>

      {chapters.length > 0 && (
        <div className="mt-6 flex gap-3">
          <StartQuizButton
            action={startSubjectQuizAction}
            arg={params.subject}
            label="Quiz de la matière"
          />
          <StartQuizButton
            action={startEvaluationQuizAction}
            arg={params.subject}
            label="Quiz d'évaluation"
            variant="secondary"
          />
        </div>
      )}
    </div>
  );
}
