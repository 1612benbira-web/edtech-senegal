import { createClient } from "@/lib/supabase/server";

export async function getLessonsForChapter(chapterId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("*, competencies(name)")
    .eq("chapter_id", chapterId)
    .is("deleted_at", null)
    .order("order");

  if (error) throw error;

  return data;
}

export async function getPublishedLessonsForChapter(
  chapterId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("id, title, order")
    .eq("chapter_id", chapterId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("order");

  if (error) throw error;

  return data;
}

export async function getPublishedLessonById(
  lessonId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lessons")
    .select(
      "*, chapters(title, curriculum_id, curriculums(subject_id, level_id))"
    )
    .eq("id", lessonId)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getLessonProgress(
  profileId: string,
  lessonId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("profile_id", profileId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getLessonNavigation(
  lessonId: string
) {
  const supabase = await createClient();

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(
      "id, title, order, chapter_id, chapters(id, title, order, curriculum_id)"
    )
    .eq("id", lessonId)
    .maybeSingle();

  if (error) throw error;

  if (!lesson) {
    return null;
  }

  const chapter = (lesson as any).chapters;

  if (!chapter) {
    return null;
  }

  /*
   * =========================================================
   * LEÇONS DU CHAPITRE ACTUEL
   * =========================================================
   */

  const { data: chapterLessons } = await supabase
    .from("lessons")
    .select("id, title, order")
    .eq("chapter_id", chapter.id)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("order");

  const orderedLessons = chapterLessons ?? [];

  const index = orderedLessons.findIndex(
    (l) => l.id === lessonId
  );

  let previousLesson =
    index > 0
      ? orderedLessons[index - 1] ?? null
      : null;

  let nextLesson =
    index >= 0 &&
    index < orderedLessons.length - 1
      ? orderedLessons[index + 1] ?? null
      : null;

  /*
   * =========================================================
   * CHAPITRES DU CURRICULUM
   * =========================================================
   */

  let previousChapter: any = null;
  let nextChapter: any = null;

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, order")
    .eq("curriculum_id", chapter.curriculum_id)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("order");

  const orderedChapters = chapters ?? [];

  /*
   * =========================================================
   * PREMIÈRE LEÇON D'UN CHAPITRE
   * =========================================================
   */

  async function firstLessonOfChapter(
    chapterId: string
  ) {
    const { data } = await supabase
      .from("lessons")
      .select("id, title, order")
      .eq("chapter_id", chapterId)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("order")
      .limit(1);

    return data?.[0] ?? null;
  }

  /*
   * =========================================================
   * CHAPITRE SUIVANT
   *
   * On ignore les chapitres vides.
   * =========================================================
   */

  const chapterIndex = orderedChapters.findIndex(
    (c) => c.id === chapter.id
  );

  let nextChapterIndex = chapterIndex + 1;

  while (
    nextChapterIndex < orderedChapters.length
  ) {
    const candidate =
      orderedChapters[nextChapterIndex];

    /*
     * Protection TypeScript :
     * même si l'index est dans les limites,
     * TypeScript considère l'élément comme potentiellement
     * undefined.
     */
    if (!candidate) {
      nextChapterIndex += 1;
      continue;
    }

    const first = await firstLessonOfChapter(
      candidate.id
    );

    if (first) {
      nextChapter = candidate;
      break;
    }

    nextChapterIndex += 1;
  }

  /*
   * =========================================================
   * CHAPITRE PRÉCÉDENT
   *
   * On ignore également les chapitres vides.
   * =========================================================
   */

  let previousChapterIndex =
    chapterIndex - 1;

  while (
    previousChapterIndex >= 0
  ) {
    const candidate =
      orderedChapters[previousChapterIndex];

    if (!candidate) {
      previousChapterIndex -= 1;
      continue;
    }

    const first = await firstLessonOfChapter(
      candidate.id
    );

    if (first) {
      previousChapter = candidate;
      break;
    }

    previousChapterIndex -= 1;
  }

  /*
   * =========================================================
   * PREMIÈRE LEÇON DU CHAPITRE SUIVANT
   * =========================================================
   */

  const nextChapterLesson = nextChapter
    ? await firstLessonOfChapter(
        nextChapter.id
      )
    : null;

  /*
   * =========================================================
   * SI ON EST AU DÉBUT DU CHAPITRE :
   * prendre la dernière leçon du chapitre précédent
   * =========================================================
   */

  if (!previousLesson && previousChapter) {
    const { data } = await supabase
      .from("lessons")
      .select("id, title, order")
      .eq(
        "chapter_id",
        previousChapter.id
      )
      .eq("status", "published")
      .is("deleted_at", null)
      .order("order", {
        ascending: false,
      })
      .limit(1);

    previousLesson =
      data?.[0] ?? null;
  }

  /*
   * =========================================================
   * RETOUR
   * =========================================================
   */

  return {
    lesson,
    chapter,
    previousLesson,
    nextLesson,
    previousChapter,
    nextChapter,
    nextChapterLesson,
  };
}