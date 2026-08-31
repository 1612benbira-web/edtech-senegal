import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMyProgramme } from "@/lib/queries/programme";

export const metadata = { title: "Continuer mes cours" };

export default async function ContinuePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("level_id")
    .eq("id", user.id)
    .single();

  if (!profile?.level_id) redirect("/onboarding");

  const programmes = await getMyProgramme(user.id, profile.level_id);
  const resumable = programmes.filter((program) => program.resumeChapterId || program.status === "completed");

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div>
        <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
          ← Tableau de bord
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Continuer mes cours</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reprends chaque matière exactement là où ta progression réelle s&apos;est arrêtée.
            </p>
          </div>
        </div>
      </div>

      {resumable.length === 0 ? (
        <section className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <h2 className="mt-3 text-lg font-bold text-foreground">Tous tes cours sont à jour 🎉</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tu peux revoir tes programmes depuis la page Mon programme.</p>
          <Link href="/programme" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
            Voir mon programme <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {resumable.map((program) => {
            const chapter = program.chapters.find((item) => item.id === program.resumeChapterId);

            if (program.status === "completed" && !chapter) {
              return (
                <section key={program.subjectId} className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{program.subjectName}</p>
                      <h2 className="mt-1 text-xl font-bold text-foreground">Cours terminé 🎉</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Toutes les leçons et tous les exercices obligatoires sont terminés.</p>
                    </div>
                    <Link href={`/programme/${program.subjectId}`} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground hover:border-primary/40 hover:bg-muted">
                      Revoir <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-full rounded-full bg-success" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-success">100 % terminé</p>
                </section>
              );
            }

            if (!chapter) return null;

            return (
              <section key={program.subjectId} className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{program.subjectName}</p>
                    <h2 className="mt-1 truncate text-xl font-bold text-foreground">{chapter.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {chapter.completedLessons}/{chapter.totalLessons} leçons terminées · {chapter.percent}%
                    </p>
                  </div>
                  {(program.nextLessonId || program.nextExerciseId) && (
                    <Link
                      href={program.nextExerciseId ? `/exercise/${program.nextExerciseId}` : `/lesson/${program.nextLessonId}`}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
                    >
                      {program.nextExerciseId ? "Continuer l'exercice" : "Reprendre"} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${chapter.percent}%` }} />
                </div>

                <div className="mt-5 space-y-2">
                  {program.nextExerciseId && (
                    <Link
                      href={`/exercise/${program.nextExerciseId}`}
                      className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 transition hover:border-primary/50 hover:bg-primary/10"
                    >
                      <Circle className="h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">Exercice obligatoire à terminer</span>
                      <span className="shrink-0 text-xs font-bold text-primary">Continuer</span>
                    </Link>
                  )}

                  {chapter.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/lesson/${lesson.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition hover:border-primary/40 hover:bg-muted"
                    >
                      {lesson.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      ) : lesson.status === "in_progress" ? (
                        <span className="h-4 w-4 shrink-0 rounded-full border-2 border-primary bg-primary/15" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{lesson.title}</span>
                      {!program.nextExerciseId && lesson.id === program.nextLessonId && (
                        <span className="shrink-0 text-xs font-bold text-primary">À reprendre</span>
                      )}
                    </Link>
                  ))}
                </div>

                <Link href={`/programme/${program.subjectId}/${chapter.id}`} className="mt-4 inline-flex text-xs font-semibold text-primary hover:underline">
                  Ouvrir le chapitre →
                </Link>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
