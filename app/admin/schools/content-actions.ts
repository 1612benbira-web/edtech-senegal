"use server";

import { revalidatePath } from "next/cache";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { parseAnswerData } from "@/lib/services/questionOptionsParser";
import {
  curriculumSchema,
  curriculumStatusSchema,
  chapterSchema,
  chapterStatusSchema,
  lessonSchema,
  lessonStatusSchema,
} from "@/lib/validations/curriculum";
import {
  exerciseSchema,
  exerciseStatusSchema,
  questionSchema,
  questionStatusSchema,
} from "@/lib/validations/exercise";
import { getExerciseOwnerSchoolId } from "@/lib/queries/school-content";
import type { ActionState } from "./actions";

function parseOrThrow<T>(schema: { safeParse: (v: unknown) => any }, raw: T) {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { fieldErrors };
  }
  return { data: parsed.data };
}

function basePath(schoolId: string) {
  return `/admin/schools/${schoolId}/content`;
}

// ============================================================
// PROGRAMME PROPRE À L'ÉCOLE
// ============================================================

export async function createSchoolCurriculumAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);
    const parsed = parseOrThrow(curriculumSchema, {
      levelId: formData.get("levelId"),
      seriesId: formData.get("seriesId") || null,
      subjectId: formData.get("subjectId"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      version: formData.get("version") || "2026",
      source: formData.get("source") || undefined,
      sourceUrl: formData.get("sourceUrl") || undefined,
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data!;

    // school_id est forcé côté serveur (jamais pris du formulaire) : un
    // school_admin ne peut créer un programme que pour SA propre école,
    // celle validée par requireSchoolAccess() juste au-dessus.
    const { error } = await supabase.from("curriculums").insert({
      level_id: d.levelId,
      series_id: d.seriesId,
      subject_id: d.subjectId,
      title: d.title,
      description: d.description,
      version: d.version,
      source: d.source || "Contenu propre à l'établissement",
      source_url: d.sourceUrl || null,
      school_id: schoolId,
      status: "draft",
    });
    if (error) return { error: error.message };

    revalidatePath(basePath(schoolId));
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateSchoolCurriculumStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);
    const parsed = parseOrThrow(curriculumStatusSchema, {
      curriculumId: formData.get("curriculumId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    // La RLS (curriculums_school_admin_manage, migration 0019) empêche
    // de toute façon de toucher un curriculum qui n'appartient pas à
    // cette école — cette requête échouera silencieusement (0 ligne
    // affectée) si ce n'est pas le cas.
    const { error } = await supabase
      .from("curriculums")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.curriculumId)
      .eq("school_id", schoolId);
    if (error) return { error: error.message };

    revalidatePath(basePath(schoolId));
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteSchoolCurriculumAction(curriculumId: string, schoolId: string) {
  const { supabase } = await requireSchoolAccess(schoolId);
  const { error } = await supabase.from("curriculums").delete().eq("id", curriculumId).eq("school_id", schoolId);
  if (error) throw error;
  revalidatePath(basePath(schoolId));
}

// ============================================================
// CHAPITRES
// ============================================================

export async function createSchoolChapterAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);
    const parsed = parseOrThrow(chapterSchema, {
      curriculumId: formData.get("curriculumId"),
      title: formData.get("title"),
      order: formData.get("order") || "0",
      source: formData.get("source") || "Contenu propre à l'établissement",
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data!;

    const { error } = await supabase.from("chapters").insert({
      curriculum_id: d.curriculumId,
      title: d.title,
      order: d.order,
      source: d.source,
      status: "draft",
    });
    if (error) return { error: error.message };

    revalidatePath(basePath(schoolId));
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateSchoolChapterStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);
    const parsed = parseOrThrow(chapterStatusSchema, {
      chapterId: formData.get("chapterId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase
      .from("chapters")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.chapterId);
    if (error) return { error: error.message };

    revalidatePath(basePath(schoolId));
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteSchoolChapterAction(chapterId: string, schoolId: string) {
  const { supabase } = await requireSchoolAccess(schoolId);
  const { error } = await supabase.from("chapters").update({ deleted_at: new Date().toISOString() }).eq("id", chapterId);
  if (error) throw error;
  revalidatePath(basePath(schoolId));
}

// ============================================================
// LEÇONS
// ============================================================

export async function createSchoolLessonAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);
    const parsed = parseOrThrow(lessonSchema, {
      chapterId: formData.get("chapterId"),
      title: formData.get("title"),
      contentMd: formData.get("contentMd"),
      objectives: formData.get("objectives") || undefined,
      summary: formData.get("summary") || undefined,
      order: formData.get("order") || "0",
      source: formData.get("source") || "Contenu propre à l'établissement",
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data!;

    const { error } = await supabase.from("lessons").insert({
      chapter_id: d.chapterId,
      title: d.title,
      content_md: d.contentMd,
      objectives: d.objectives ? d.objectives.split("\n").map((s: string) => s.trim()).filter(Boolean) : null,
      summary: d.summary,
      order: d.order,
      source: d.source,
      status: "draft",
    });
    if (error) return { error: error.message };

    revalidatePath(basePath(schoolId));
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateSchoolLessonStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);
    const parsed = parseOrThrow(lessonStatusSchema, {
      lessonId: formData.get("lessonId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase
      .from("lessons")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.lessonId);
    if (error) return { error: error.message };

    revalidatePath(basePath(schoolId));
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteSchoolLessonAction(lessonId: string, schoolId: string) {
  const { supabase } = await requireSchoolAccess(schoolId);
  const { error } = await supabase.from("lessons").update({ deleted_at: new Date().toISOString() }).eq("id", lessonId);
  if (error) throw error;
  revalidatePath(basePath(schoolId));
}

// ============================================================
// EXERCICES — deux cas : (1) exercice d'un programme propre à l'école
// (lessonId pointe vers une leçon déjà scopée par son curriculum, pas
// besoin de school_id sur la ligne), (2) exercice PRIVÉ accroché à une
// leçon GLOBALE (school_id renseigné explicitement).
// ============================================================

export async function createSchoolExerciseAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);
    const isPrivateOnGlobalLesson = formData.get("privateOnGlobalLesson") === "true";

    const parsed = parseOrThrow(exerciseSchema, {
      lessonId: formData.get("lessonId"),
      title: formData.get("title"),
      instructions: formData.get("instructions") || undefined,
      difficulty: formData.get("difficulty") || "medium",
      difficultyScore: formData.get("difficultyScore") || "50",
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data!;

    const { error } = await supabase.from("exercises").insert({
      lesson_id: d.lessonId,
      title: d.title,
      instructions: d.instructions,
      difficulty: d.difficulty,
      difficulty_score: d.difficultyScore,
      // school_id n'est renseigné QUE pour un exercice privé sur leçon
      // globale — pour un exercice d'un programme déjà propre à
      // l'école, la RLS le reconnaît via la chaîne lesson->chapter->
      // curriculum, inutile (et incorrect) de le dupliquer ici.
      school_id: isPrivateOnGlobalLesson ? schoolId : null,
      status: "draft",
    });
    if (error) return { error: error.message };

    revalidatePath(basePath(schoolId));
    revalidatePath(`/admin/schools/${schoolId}/content/private-exercise`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateSchoolExerciseStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);
    const parsed = parseOrThrow(exerciseStatusSchema, {
      exerciseId: formData.get("exerciseId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase
      .from("exercises")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.exerciseId);
    if (error) return { error: error.message };

    revalidatePath(basePath(schoolId));
    revalidatePath(`/admin/schools/${schoolId}/content/private-exercise`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteSchoolExerciseAction(exerciseId: string, schoolId: string) {
  const { supabase } = await requireSchoolAccess(schoolId);
  const { error } = await supabase.from("exercises").update({ deleted_at: new Date().toISOString() }).eq("id", exerciseId);
  if (error) throw error;
  revalidatePath(basePath(schoolId));
  revalidatePath(`/admin/schools/${schoolId}/content/private-exercise`);
}

// ============================================================
// QUESTIONS
// ============================================================

export async function createSchoolQuestionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);
    const exerciseId = String(formData.get("exerciseId") ?? "");

    // Vérification explicite de propriété avant écriture : la RLS
    // (questions_school_admin_manage, 0019) protège déjà la base, mais
    // on veut un message d'erreur clair plutôt qu'un échec RLS brut.
    const ownerSchoolId = await getExerciseOwnerSchoolId(exerciseId);
    if (ownerSchoolId !== schoolId) {
      return { error: "Cet exercice n'appartient pas à ton établissement." };
    }

    const parsed = parseOrThrow(questionSchema, {
      exerciseId,
      type: formData.get("type"),
      prompt: formData.get("prompt"),
      explanation: formData.get("explanation") || undefined,
      points: formData.get("points") || "10",
      difficultyScore: formData.get("difficultyScore") || "50",
      answerData: formData.get("answerData"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data!;

    const { data: question, error } = await supabase
      .from("questions")
      .insert({
        exercise_id: d.exerciseId,
        type: d.type,
        prompt: d.prompt,
        explanation: d.explanation,
        points: d.points,
        difficulty_score: d.difficultyScore,
        status: "draft",
      })
      .select("id")
      .single();
    if (error) return { error: error.message };

    const options = parseAnswerData(d.type, d.answerData);
    if (options.length > 0) {
      const { error: optionsError } = await supabase.from("question_options").insert(
        options.map((opt) => ({
          question_id: question.id,
          label: opt.label,
          is_correct: opt.is_correct,
          match_key: opt.match_key,
          order: opt.order,
        }))
      );
      if (optionsError) return { error: optionsError.message };
    }

    revalidatePath(basePath(schoolId));
    revalidatePath(`/admin/schools/${schoolId}/content/private-exercise`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateSchoolQuestionStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);
    const parsed = parseOrThrow(questionStatusSchema, {
      questionId: formData.get("questionId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase
      .from("questions")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.questionId);
    if (error) return { error: error.message };

    revalidatePath(basePath(schoolId));
    revalidatePath(`/admin/schools/${schoolId}/content/private-exercise`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteSchoolQuestionAction(questionId: string, schoolId: string) {
  const { supabase } = await requireSchoolAccess(schoolId);
  const { error } = await supabase.from("questions").update({ deleted_at: new Date().toISOString() }).eq("id", questionId);
  if (error) throw error;
  revalidatePath(basePath(schoolId));
  revalidatePath(`/admin/schools/${schoolId}/content/private-exercise`);
}
