"use server";

import { revalidatePath } from "next/cache";
import { requireTeacherAccess } from "@/lib/services/adminGuard";
import { parseAnswerData } from "@/lib/services/questionOptionsParser";
import { getLessonOwnerSchoolId, getExerciseOwnerSchoolId } from "@/lib/queries/school-content";
import { exerciseSchema, exerciseStatusSchema, questionSchema, questionStatusSchema } from "@/lib/validations/exercise";
import { createMessageSchema } from "@/lib/validations/message";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  message?: string;
} | null;

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

function basePath() {
  return `/teacher/exercises`;
}

// ============================================================
// EXERCICES PRIVÉS — un enseignant ne crée QUE des exercices sur des
// leçons du programme national (school_id = null), jamais sur un
// programme déjà propre à une école (cf. décision du porteur de
// projet). La RLS (exercises_teacher_manage, migration 0025) est le
// vrai rempart : elle vérifie que la leçon appartient bien à la
// matière/niveau affectés à CET enseignant. Les contrôles ci-dessous
// ne servent qu'à renvoyer un message clair avant d'aller jusque-là.
// ============================================================

export async function createTeacherExerciseAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireTeacherAccess(schoolId);

    const parsed = parseOrThrow(exerciseSchema, {
      lessonId: formData.get("lessonId"),
      title: formData.get("title"),
      instructions: formData.get("instructions") || undefined,
      difficulty: formData.get("difficulty") || "medium",
      difficultyScore: formData.get("difficultyScore") || "50",
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data!;

    const lessonOwnerSchoolId = await getLessonOwnerSchoolId(d.lessonId);
    if (lessonOwnerSchoolId !== null) {
      return { error: "Tu ne peux ajouter un exercice que sur une leçon du programme national." };
    }

    const { error } = await supabase.from("exercises").insert({
      lesson_id: d.lessonId,
      title: d.title,
      instructions: d.instructions,
      difficulty: d.difficulty,
      difficulty_score: d.difficultyScore,
      school_id: schoolId,
      status: "draft",
    });
    if (error) {
      if (error.code === "42501") {
        return { error: "Cette leçon ne fait pas partie d'une matière qui t'est confiée." };
      }
      return { error: error.message };
    }

    revalidatePath(basePath());
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateTeacherExerciseStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireTeacherAccess(schoolId);
    const parsed = parseOrThrow(exerciseStatusSchema, {
      exerciseId: formData.get("exerciseId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { data: updated, error } = await supabase
      .from("exercises")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.exerciseId)
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    if (!updated) {
      return { error: "Cet exercice n'existe pas ou ne t'appartient pas." };
    }

    revalidatePath(basePath());
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteTeacherExerciseAction(exerciseId: string, schoolId: string) {
  const { supabase } = await requireTeacherAccess(schoolId);
  const { data: updated, error } = await supabase
    .from("exercises")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", exerciseId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!updated) {
    throw new Error("Cet exercice n'existe pas ou ne t'appartient pas.");
  }
  revalidatePath(basePath());
}

// ============================================================
// QUESTIONS — même principe : l'exercice ciblé doit être un exercice
// privé de CETTE école (school_id = schoolId), la RLS vérifie en plus
// qu'il est bien rattaché à une matière confiée à cet enseignant.
// ============================================================

export async function createTeacherQuestionAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireTeacherAccess(schoolId);
    const exerciseId = String(formData.get("exerciseId") ?? "");

    const ownerSchoolId = await getExerciseOwnerSchoolId(exerciseId);
    if (ownerSchoolId !== schoolId) {
      return { error: "Cet exercice ne t'appartient pas." };
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

    revalidatePath(basePath());
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateTeacherQuestionStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireTeacherAccess(schoolId);
    const parsed = parseOrThrow(questionStatusSchema, {
      questionId: formData.get("questionId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { data: updated, error } = await supabase
      .from("questions")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.questionId)
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    if (!updated) {
      return { error: "Cette question n'existe pas ou ne t'appartient pas." };
    }

    revalidatePath(basePath());
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteTeacherQuestionAction(questionId: string, schoolId: string) {
  const { supabase } = await requireTeacherAccess(schoolId);
  const { data: updated, error } = await supabase
    .from("questions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", questionId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!updated) {
    throw new Error("Cette question n'existe pas ou ne t'appartient pas.");
  }
  revalidatePath(basePath());
}

// ============================================================
// MESSAGES — un enseignant ne peut écrire qu'à SON niveau affecté
// (jamais à toute l'école, cf. policy messages_insert_teacher, 0025).
// Volontairement plus simple que createSchoolMessageAction : pas de
// pièces jointes ici pour la V1 de l'espace enseignant.
// ============================================================

export async function createTeacherMessageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const schoolId = String(formData.get("schoolId") ?? "");
  try {
    const { supabase, userId, assignments } = await requireTeacherAccess(schoolId);

    const targetLevelId = String(formData.get("targetLevelId") ?? "");
    const isAssignedToLevel = assignments.some((a: any) => a.level_id === targetLevelId);
    if (!isAssignedToLevel) {
      return { error: "Tu ne peux écrire qu'au niveau d'une matière qui t'est confiée." };
    }

    const parsed = createMessageSchema.safeParse({
      schoolId,
      title: formData.get("title"),
      content: formData.get("content"),
      targetType: "LEVEL",
      targetLevelId,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      return { fieldErrors };
    }
    const d = parsed.data;

    const { data: created, error: insertError } = await supabase
      .from("messages")
      .insert({
        school_id: schoolId,
        sender_id: userId,
        title: d.title,
        content: d.content,
        target_type: "LEVEL",
        target_level_id: targetLevelId,
      })
      .select("id")
      .single();
    if (insertError || !created) {
      return { error: insertError?.message ?? "L'envoi du message a échoué." };
    }

    const { data: recipientCount, error: fanOutError } = await supabase.rpc(
      "fan_out_message_notifications",
      { p_message_id: created.id }
    );
    if (fanOutError) {
      return { error: `Le message a été créé, mais la diffusion aux élèves a échoué : ${fanOutError.message}.` };
    }

    revalidatePath("/teacher/messages");
    const count = typeof recipientCount === "number" ? recipientCount : 0;
    return {
      success: true,
      message: count > 0 ? `Message envoyé à ${count} élève${count > 1 ? "s" : ""}.` : "Message créé, mais aucun élève actif ne correspond à ce niveau pour le moment.",
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteTeacherMessageAction(messageId: string, schoolId: string) {
  const { supabase } = await requireTeacherAccess(schoolId);
  const { data: deleted, error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId)
    .eq("school_id", schoolId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!deleted) {
    throw new Error("Ce message n'existe pas ou ne t'appartient pas.");
  }
  revalidatePath("/teacher/messages");
}
