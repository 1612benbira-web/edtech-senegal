"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/services/adminGuard";
import { parseAnswerData } from "@/lib/services/questionOptionsParser";
import {
  exerciseSchema,
  exerciseStatusSchema,
  questionSchema,
  questionStatusSchema,
} from "@/lib/validations/exercise";
import type { ActionState } from "./curriculum-actions";

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

export async function createExerciseAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(exerciseSchema, {
      lessonId: formData.get("lessonId"),
      competencyId: formData.get("competencyId") || null,
      title: formData.get("title"),
      instructions: formData.get("instructions") || undefined,
      difficulty: formData.get("difficulty"),
      difficultyScore: formData.get("difficultyScore"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data;

    const { error } = await supabase.from("exercises").insert({
      lesson_id: d.lessonId,
      competency_id: d.competencyId,
      title: d.title,
      instructions: d.instructions,
      difficulty: d.difficulty,
      difficulty_score: d.difficultyScore,
      status: "draft",
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateExerciseStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(exerciseStatusSchema, {
      exerciseId: formData.get("exerciseId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase
      .from("exercises")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.exerciseId);
    if (error) return { error: error.message };

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteExerciseAction(exerciseId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("exercises")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", exerciseId);
  if (error) throw error;
  revalidatePath("/admin/questions");
}

// ============================================================
// QUESTIONS
// ============================================================

export async function createQuestionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(questionSchema, {
      exerciseId: formData.get("exerciseId"),
      competencyId: formData.get("competencyId") || null,
      type: formData.get("type"),
      prompt: formData.get("prompt"),
      explanation: formData.get("explanation") || undefined,
      points: formData.get("points"),
      difficultyScore: formData.get("difficultyScore"),
      answerData: formData.get("answerData"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data;

    const { data: question, error } = await supabase
      .from("questions")
      .insert({
        exercise_id: d.exerciseId,
        competency_id: d.competencyId,
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

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateQuestionStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(questionStatusSchema, {
      questionId: formData.get("questionId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase
      .from("questions")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.questionId);
    if (error) return { error: error.message };

    revalidatePath("/admin/questions");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteQuestionAction(questionId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("questions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", questionId);
  if (error) throw error;
  revalidatePath("/admin/questions");
}
