import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublishedLessonById, getLessonNavigation } from "@/lib/queries/lessons";
import { getPublishedExercisesForLesson } from "@/lib/queries/exercises";
import { markLessonStartedAction } from "../actions";
import { LessonContent } from "@/components/lesson/lesson-content";
import { CompleteLessonButton } from "../complete-lesson-button";
import { getMyProgramme } from "@/lib/queries/programme";
import { getCurrentSchoolId, isCurriculumAllowedForSchool } from "@/lib/services/schoolService";

export default async function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const lesson = await getPublishedLessonById(params.lessonId);
  if (!lesson) notFound();

  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  const { data: profile } = await authClient.from("profiles").select("level_id, series_id").eq("id", user!.id).single();
  if (!profile?.level_id || (lesson as any).chapters?.curriculums?.level_id !== profile.level_id) notFound();

  // Le programme peut être publié sans être activé pour l'école de
  // l'élève (multi-écoles) : on bloque l'accès direct par URL en plus
  // du filtrage déjà fait par getMyProgramme() côté dashboard/programme.
  const curriculumId = (lesson as any).chapters?.curriculum_id as string | undefined;
  const schoolId = await getCurrentSchoolId();
  if (!curriculumId || !(await isCurriculumAllowedForSchool(schoolId, curriculumId))) notFound();

  // Marque la leçon comme démarrée dès l'ouverture (sans bloquer le rendu).
  await markLessonStartedAction(params.lessonId);

  const { data: progress } = await authClient
    .from("lesson_progress")
    .select("status")
    .eq("profile_id", user!.id)
    .eq("lesson_id", params.lessonId)
    .maybeSingle();

  const [exercises, navigation, programmes] = await Promise.all([
    getPublishedExercisesForLesson(params.lessonId),
    getLessonNavigation(params.lessonId),
    getMyProgramme(user!.id, profile.level_id, profile.series_id),
  ]);

  const subjectProgramme = programmes.find(
    (program) => program.subjectId === (lesson as any).chapters?.curriculums?.subject_id
  );
  const chapterProgress = subjectProgramme?.chapters.find(
    (chapter) => chapter.id === lesson.chapter_id
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 text-[18px] leading-8 sm:text-[19px] sm:leading-9">
      <Link
        href={`/programme/${(lesson as any).chapters?.curriculums?.subject_id}/${lesson.chapter_id}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {(lesson as any).chapters?.title}
      </Link>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Leçon</p>
        <h1 className="mt-1 text-3xl font-bold leading-tight text-foreground sm:text-4xl">{lesson.title}</h1>
      </div>

      {lesson.objectives && lesson.objectives.length > 0 && (
        <div className="mb-6 rounded-lg bg-muted/50 p-4">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            Objectifs de cette leçon
          </p>
          <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-foreground sm:text-lg">
            {lesson.objectives.map((obj: string, i: number) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      <LessonContent contentMd={lesson.content_md} />

      {lesson.summary && (
        <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">Résumé</p>
          <p className="text-base leading-7 text-foreground sm:text-lg">{lesson.summary}</p>
        </div>
      )}

      <div className="mt-8">
        <CompleteLessonButton
          lessonId={params.lessonId}
          alreadyCompleted={progress?.status === "completed"}
        />
      </div>

      {navigation && (
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {navigation.previousLesson ? (
            <Link href={`/lesson/${navigation.previousLesson.id}`} className="rounded-2xl border border-border bg-card p-5 text-base font-semibold text-foreground transition hover:border-primary/40 hover:bg-muted">
              <span className="block text-xs font-medium text-muted-foreground">← Leçon précédente</span>
              <span className="mt-1 block truncate">{navigation.previousLesson.title}</span>
            </Link>
          ) : <div />}
          {navigation.nextLesson ? (
            <Link href={`/lesson/${navigation.nextLesson.id}`} className="rounded-2xl bg-primary p-5 text-right text-base font-semibold text-primary-foreground transition hover:opacity-90">
              <span className="block text-xs font-medium opacity-80">Leçon suivante →</span>
              <span className="mt-1 block truncate">{navigation.nextLesson.title}</span>
            </Link>
          ) : navigation.nextChapterLesson && progress?.status === "completed" && chapterProgress?.completed ? (
            <Link href={`/lesson/${navigation.nextChapterLesson.id}`} className="rounded-2xl bg-primary p-5 text-right text-base font-semibold text-primary-foreground transition hover:opacity-90">
              <span className="flex items-center justify-end gap-2 text-xs opacity-80">Chapitre suivant <span aria-hidden="true">→</span></span>
              <span className="mt-1 block truncate">{navigation.nextChapter?.title}</span>
            </Link>
          ) : <div />}
        </div>
      )}

      {exercises.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">Exercices</p>
          <div className="space-y-2">
            {exercises.map((ex) => (
              <Link
                key={ex.id}
                href={`/exercise/${ex.id}`}
                className="block rounded-2xl border border-border bg-background p-5 transition hover:border-primary/50 hover:bg-muted"
              >
                <p className="text-base font-semibold text-foreground sm:text-lg">{ex.title}</p>
                <p className="text-sm text-muted-foreground">Difficulté : {ex.difficulty}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
