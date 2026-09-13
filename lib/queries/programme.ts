import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId, isCurriculumAllowedForSchool } from "@/lib/services/schoolService";

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface ProgrammeLesson {
  id: string;
  title: string;
  order: number;
  status: LessonStatus;
}

export interface ProgrammeChapter {
  id: string;
  title: string;
  order: number;
  totalLessons: number;
  completedLessons: number;
  percent: number;
  completed: boolean;
  lessons: ProgrammeLesson[];
}

export interface ProgrammeSubject {
  subjectId: string;
  subjectName: string;
  subjectIcon: string | null;
  curriculumId: string | null;
  description: string | null;
  totalChapters: number;
  totalLessons: number;
  completedLessons: number;
  percent: number;
  status: "not_started" | "in_progress" | "completed";
  /** Première leçon à reprendre selon l'activité réelle de l'élève. */
  nextLessonId: string | null;
  /** Exercice à reprendre lorsqu'un chapitre a toutes ses leçons terminées mais qu'un exercice obligatoire manque. */
  nextExerciseId: string | null;
  /** Chapitre utilisé par la page de reprise. */
  resumeChapterId: string | null;
  resumeChapterTitle: string | null;
  /**
   * Date de la dernière activité réelle de l'élève sur cette matière
   * (started_at d'une leçon en cours, ou completed_at d'une leçon
   * terminée) — permet de déterminer, TOUTES MATIÈRES CONFONDUES, celle
   * que l'élève a travaillée en dernier (cf. bouton "Continuer
   * l'apprentissage" du dashboard). `null` si la matière n'a encore
   * aucune activité enregistrée.
   */
  lastActivityAt: string | null;
  chapters: ProgrammeChapter[];
}

type ProgressRow = {
  lesson_id: string;
  status: LessonStatus;
  started_at: string | null;
  completed_at: string | null;
};

type CurriculumCandidate = {
  id: string;
  description: string | null;
  series_id: string | null;
  created_at: string;
};

/**
 * Sélectionne, parmi plusieurs curriculums candidats pour une matière/un
 * niveau donnés, celui qui correspond réellement à la série de l'élève.
 *
 * Un curriculum avec `series_id = null` est un programme commun à toutes
 * les séries du niveau (ex. Français en Seconde) : il reste valable pour
 * tout élève de ce niveau. Un curriculum avec `series_id` renseigné est
 * spécifique à une série (ex. Mathématiques Seconde S2 vs L2) et ne doit
 * JAMAIS être proposé à un élève d'une autre série.
 *
 * Priorité : curriculum spécifique à la série de l'élève > curriculum
 * commun (series_id null). À égalité, le plus récent (created_at) gagne.
 */
export function pickCurriculumForSeries(
  candidates: CurriculumCandidate[],
  seriesId: string | null
): CurriculumCandidate | null {
  const bySeries = candidates.filter((c) => c.series_id === seriesId);
  const common = candidates.filter((c) => c.series_id === null);

  const sortByRecency = (a: CurriculumCandidate, b: CurriculumCandidate) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

  if (seriesId && bySeries.length > 0) {
    return [...bySeries].sort(sortByRecency)[0] ?? null;
  }

  if (!seriesId) {
    // Élève sans série (classe qui n'en a pas) : seuls les curriculums
    // communs le concernent — jamais un curriculum d'une série qu'il n'a
    // pas.
    return common.length > 0 ? [...common].sort(sortByRecency)[0] ?? null : null;
  }

  return common.length > 0 ? [...common].sort(sortByRecency)[0] ?? null : null;
}

/**
 * Construit le programme réel de l'élève : matière → chapitres → leçons.
 * La progression est relue depuis lesson_progress et les exercices depuis
 * exercise_attempts. Aucune donnée de progression n'est inventée.
 *
 * `seriesId` doit être la série réelle de l'élève (profiles.series_id),
 * ou `null` pour un niveau/une classe sans série. Elle est indispensable
 * pour choisir le bon curriculum quand plusieurs versions existent pour
 * la même matière/le même niveau (ex. Maths Seconde S2 vs L2) — voir
 * pickCurriculumForSeries ci-dessus.
 */
export async function getMyProgramme(
  profileId: string,
  levelId: string,
  seriesId: string | null = null
): Promise<ProgrammeSubject[]> {
  const supabase = await createClient();

  const { data: profileSubjects } = await supabase
    .from("profile_subjects")
    .select("subjects(id, name, icon)")
    .eq("profile_id", profileId);

  const subjects = (profileSubjects ?? [])
    .map((row: any) => row.subjects)
    .filter(Boolean);

  const results: ProgrammeSubject[] = [];

  // Résolu une seule fois pour tout le programme (évite un aller-retour
  // Supabase par matière) : école active de l'élève, ou `null` si non
  // rattaché (comptes créés avant le multi-écoles — voir schoolService.ts).
  const schoolId = await getCurrentSchoolId();

  for (const subject of subjects) {
    // Priorité 1 : un programme propre à l'école de l'élève (créé via
    // /admin/schools/[id]/content) pour cette matière/ce niveau — il n'a
    // pas besoin d'une ligne school_curriculums, son appartenance est
    // directe (curriculums.school_id).
    //
    // On récupère TOUS les curriculums candidats (série de l'élève OU
    // communs à toutes les séries) puis on choisit le bon en JS : filtrer
    // uniquement par level_id+subject_id (comme avant) mélangeait des
    // curriculums de séries différentes (ex. Maths Seconde S2 et L2) et
    // ne gardait que le plus récent, sans tenir compte de la série réelle
    // de l'élève — c'était la cause du Bug 1 (contenu non différencié par
    // série).
    let rawCurriculum: CurriculumCandidate | null = null;

    if (schoolId) {
      const { data: owned } = await supabase
        .from("curriculums")
        .select("id, description, series_id, created_at")
        .eq("subject_id", subject.id)
        .eq("level_id", levelId)
        .eq("status", "published")
        .eq("school_id", schoolId)
        .or(seriesId ? `series_id.eq.${seriesId},series_id.is.null` : "series_id.is.null");
      rawCurriculum = pickCurriculumForSeries((owned ?? []) as CurriculumCandidate[], seriesId);
    }

    // Priorité 2 : le programme national partagé, à condition d'être
    // activé pour l'école de l'élève (ou pas de restriction d'école pour
    // un compte non rattaché — voir isCurriculumAllowedForSchool).
    let curriculum: CurriculumCandidate | null = rawCurriculum;
    if (!curriculum) {
      const { data: globalCandidates } = await supabase
        .from("curriculums")
        .select("id, description, series_id, created_at")
        .eq("subject_id", subject.id)
        .eq("level_id", levelId)
        .eq("status", "published")
        .is("school_id", null)
        .or(seriesId ? `series_id.eq.${seriesId},series_id.is.null` : "series_id.is.null");

      const globalCurriculum = pickCurriculumForSeries(
        (globalCandidates ?? []) as CurriculumCandidate[],
        seriesId
      );

      curriculum =
        globalCurriculum && (await isCurriculumAllowedForSchool(schoolId, globalCurriculum.id))
          ? globalCurriculum
          : null;
    }

    if (!curriculum) {
      results.push({
        subjectId: subject.id,
        subjectName: subject.name,
        subjectIcon: subject.icon,
        curriculumId: null,
        description: null,
        totalChapters: 0,
        totalLessons: 0,
        completedLessons: 0,
        percent: 0,
        status: "not_started",
        nextLessonId: null,
        nextExerciseId: null,
        resumeChapterId: null,
        resumeChapterTitle: null,
        lastActivityAt: null,
        chapters: [],
      });
      continue;
    }

    const { data: chapters } = await supabase
      .from("chapters")
      .select("id, title, order")
      .eq("curriculum_id", curriculum.id)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("order", { ascending: true });

    const chapterList = chapters ?? [];
    const chapterIds = chapterList.map((c) => c.id);

    let lessons: {
      id: string;
      title: string;
      order: number;
      chapter_id: string;
    }[] = [];

    if (chapterIds.length > 0) {
      const { data: lessonRows } = await supabase
        .from("lessons")
        .select("id, title, order, chapter_id")
        .in("chapter_id", chapterIds)
        .eq("status", "published")
        .is("deleted_at", null)
        .order("order", { ascending: true });

      lessons = lessonRows ?? [];
    }

    const lessonIds = lessons.map((l) => l.id);

    // Progression réelle des leçons.
    let progressRows: ProgressRow[] = [];
    if (lessonIds.length > 0) {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status, started_at, completed_at")
        .eq("profile_id", profileId)
        .in("lesson_id", lessonIds);
      progressRows = (data ?? []) as ProgressRow[];
    }

    const progressByLesson = new Map<string, LessonStatus>();
    for (const row of progressRows) {
      progressByLesson.set(row.lesson_id, row.status);
    }

    // Un exercice publié est considéré comme obligatoire lorsqu'il existe.
    // Il est considéré réalisé lorsque toutes ses questions publiées ont au
    // moins une tentative enregistrée pour cet élève.
    const exercisesByLesson = new Map<string, string[]>();
    const questionIdsByExercise = new Map<string, string[]>();
    const questionIds: string[] = [];

    if (lessonIds.length > 0) {
      let exerciseQuery = supabase
        .from("exercises")
        .select("id, lesson_id")
        .in("lesson_id", lessonIds)
        .eq("status", "published")
        .is("deleted_at", null);

      // Un exercice privé (school_id renseigné) créé par une AUTRE école
      // sur une leçon globale partagée ne doit jamais compter comme
      // obligatoire pour cet élève — seuls les exercices globaux et ceux
      // de sa propre école sont pris en compte.
      exerciseQuery = schoolId
        ? exerciseQuery.or(`school_id.is.null,school_id.eq.${schoolId}`)
        : exerciseQuery.is("school_id", null);

      const { data: exerciseRows } = await exerciseQuery;

      for (const exercise of exerciseRows ?? []) {
        const list = exercisesByLesson.get(exercise.lesson_id) ?? [];
        list.push(exercise.id);
        exercisesByLesson.set(exercise.lesson_id, list);
      }

      const exerciseIds = (exerciseRows ?? []).map((e) => e.id);
      if (exerciseIds.length > 0) {
        const { data: questionRows } = await supabase
          .from("questions")
          .select("id, exercise_id")
          .in("exercise_id", exerciseIds)
          .eq("status", "published")
          .is("deleted_at", null);

        for (const question of questionRows ?? []) {
          const list = questionIdsByExercise.get(question.exercise_id) ?? [];
          list.push(question.id);
          questionIdsByExercise.set(question.exercise_id, list);
          questionIds.push(question.id);
        }
      }
    }

    const attemptedQuestionIds = new Set<string>();
    if (questionIds.length > 0) {
      const { data: attempts } = await supabase
        .from("exercise_attempts")
        .select("question_id")
        .eq("profile_id", profileId)
        .in("question_id", questionIds);

      for (const attempt of attempts ?? []) {
        attemptedQuestionIds.add(attempt.question_id);
      }
    }

    const exerciseCompleted = (exerciseId: string) => {
      const ids = questionIdsByExercise.get(exerciseId) ?? [];
      return ids.length === 0 || ids.every((id) => attemptedQuestionIds.has(id));
    };

    const lessonExercisesCompleted = (lessonId: string) => {
      const exerciseIds = exercisesByLesson.get(lessonId) ?? [];
      return exerciseIds.every(exerciseCompleted);
    };

    const firstIncompleteExerciseInChapter = (chapterId: string) => {
      const chapterLessonIds = lessons
        .filter((lesson) => lesson.chapter_id === chapterId)
        .sort((a, b) => a.order - b.order)
        .map((lesson) => lesson.id);

      for (const lessonId of chapterLessonIds) {
        const exerciseIds = exercisesByLesson.get(lessonId) ?? [];
        const pendingExercise = exerciseIds.find((exerciseId) => !exerciseCompleted(exerciseId));
        if (pendingExercise) return pendingExercise;
      }

      return null;
    };

    const chaptersOut: ProgrammeChapter[] = chapterList.map((chapter) => {
      const chapterLessons = lessons
        .filter((lesson) => lesson.chapter_id === chapter.id)
        .sort((a, b) => a.order - b.order)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          status: progressByLesson.get(lesson.id) ?? "not_started",
        }));

      const completedLessons = chapterLessons.filter(
        (lesson) => lesson.status === "completed"
      ).length;

      // Un chapitre sans leçons publiées n'est pas marqué "terminé" :
      // il est simplement ignoré pour la navigation et la progression réelle.
      const hasContent = chapterLessons.length > 0;

      const lessonsAndExercisesCompleted =
        hasContent &&
        chapterLessons.every(
          (lesson) =>
            lesson.status === "completed" && lessonExercisesCompleted(lesson.id)
        );

      return {
        id: chapter.id,
        title: chapter.title,
        order: chapter.order,
        totalLessons: chapterLessons.length,
        completedLessons,
        percent: lessonsAndExercisesCompleted
          ? 100
          : hasContent
            ? Math.min(99, Math.round((completedLessons / chapterLessons.length) * 100))
            : 0,
        completed: lessonsAndExercisesCompleted,
        lessons: chapterLessons,
      };
    });

    const contentChapters = chaptersOut.filter(
      (chapter) => chapter.totalLessons > 0
    );

    const totalLessons = lessons.length;
    const completedLessons = progressRows.filter(
      (row) => row.status === "completed"
    ).length;

    const anyStarted = progressRows.some(
      (row) => row.status === "in_progress" || row.status === "completed"
    );

    const allChaptersCompleted =
      contentChapters.length > 0 &&
      contentChapters.every((chapter) => chapter.completed);

    // Si toutes les leçons sont terminées mais qu'un exercice obligatoire
    // manque encore, on reste à 99 % jusqu'à sa réalisation réelle.
    const coursePercent = allChaptersCompleted
      ? 100
      : totalLessons > 0
        ? Math.min(99, Math.round((completedLessons / totalLessons) * 100))
        : 0;

    // L'activité la plus récente détermine le dernier endroit où l'élève
    // s'est arrêté. On prend started_at pour une leçon en cours et
    // completed_at pour une leçon terminée.
    const latestActivity =
      [...progressRows].sort((a, b) => {
        const aDate = new Date(
          a.status === "completed"
            ? a.completed_at ?? a.started_at ?? 0
            : a.started_at ?? a.completed_at ?? 0
        ).getTime();
        const bDate = new Date(
          b.status === "completed"
            ? b.completed_at ?? b.started_at ?? 0
            : b.started_at ?? b.completed_at ?? 0
        ).getTime();
        return bDate - aDate;
      })[0] ?? null;

    const latestLesson = latestActivity
      ? lessons.find((lesson) => lesson.id === latestActivity.lesson_id) ?? null
      : null;

    const latestChapter = latestLesson
      ? chaptersOut.find((chapter) => chapter.id === latestLesson.chapter_id) ?? null
      : null;

    let resumeChapter: ProgrammeChapter | null = null;
    let nextLesson: ProgrammeLesson | null = null;
    let nextExerciseId: string | null = null;

    if (!latestActivity || !latestLesson || !latestChapter) {
      // Aucune progression : première leçon du premier chapitre contenant du contenu.
      resumeChapter = contentChapters[0] ?? null;
      nextLesson = resumeChapter?.lessons[0] ?? null;
    } else if (latestActivity.status === "in_progress") {
      // L'élève était au milieu d'une leçon : on reprend exactement celle-ci.
      resumeChapter = latestChapter;
      nextLesson = latestChapter.lessons.find(
        (lesson) => lesson.id === latestLesson.id
      ) ?? null;
    } else if (!latestChapter.completed) {
      // La dernière leçon est terminée mais le chapitre n'est pas encore
      // complètement validé : leçons restantes d'abord, puis exercices obligatoires.
      resumeChapter = latestChapter;
      nextLesson = latestChapter.lessons.find(
        (lesson) => lesson.status !== "completed"
      ) ?? null;

      if (!nextLesson) {
        nextExerciseId = firstIncompleteExerciseInChapter(latestChapter.id);
      }
    } else {
      // Le chapitre est réellement terminé (leçons + exercices).
      // On cherche le prochain chapitre AVEC du contenu, en respectant l'ordre réel.
      const chapterIndex = chaptersOut.findIndex(
        (chapter) => chapter.id === latestChapter.id
      );

      const nextContentChapter =
        chapterIndex >= 0
          ? chaptersOut
              .slice(chapterIndex + 1)
              .find((chapter) => chapter.totalLessons > 0) ?? null
          : null;

      resumeChapter = nextContentChapter;
      nextLesson = nextContentChapter?.lessons[0] ?? null;
    }

    // Si aucune reprise n'a été trouvée, on cherche le premier chapitre
    // contenant encore du travail, sans jamais sauter de contenu.
    if (!nextLesson && !nextExerciseId) {
      const firstIncompleteChapter = contentChapters.find(
        (chapter) => !chapter.completed
      );

      if (firstIncompleteChapter) {
        resumeChapter = firstIncompleteChapter;
        nextLesson = firstIncompleteChapter.lessons.find(
          (lesson) => lesson.status !== "completed"
        ) ?? null;

        if (!nextLesson) {
          nextExerciseId = firstIncompleteExerciseInChapter(firstIncompleteChapter.id);
        }
      }
    }

    results.push({
      subjectId: subject.id,
      subjectName: subject.name,
      subjectIcon: subject.icon,
      curriculumId: curriculum.id,
      description: (curriculum as any).description ?? null,
      totalChapters: chapterList.length,
      totalLessons,
      completedLessons,
      percent: coursePercent,
      status:
        allChaptersCompleted
          ? "completed"
          : anyStarted
            ? "in_progress"
            : "not_started",
      nextLessonId: nextLesson?.id ?? null,
      nextExerciseId,
      resumeChapterId: resumeChapter?.id ?? null,
      resumeChapterTitle: resumeChapter?.title ?? null,
      lastActivityAt: latestActivity
        ? latestActivity.status === "completed"
          ? latestActivity.completed_at ?? latestActivity.started_at
          : latestActivity.started_at ?? latestActivity.completed_at
        : null,
      chapters: chaptersOut,
    });
  }

  return results;
}
