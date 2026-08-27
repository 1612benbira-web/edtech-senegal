"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/services/adminGuard";
import { z } from "zod";
import type { ActionState } from "./curriculum-actions";

const configSchema = z.object({
  questionsCount: z.coerce.number().int().min(1).max(30),
  ratioRecent: z.coerce.number().int().min(0),
  ratioReview: z.coerce.number().int().min(0),
  ratioChallenge: z.coerce.number().int().min(0),
  excludeRecentDays: z.coerce.number().int().min(0).max(90),
});

export async function updateDailyQuizConfigAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = configSchema.safeParse({
      questionsCount: formData.get("questionsCount"),
      ratioRecent: formData.get("ratioRecent"),
      ratioReview: formData.get("ratioReview"),
      ratioChallenge: formData.get("ratioChallenge"),
      excludeRecentDays: formData.get("excludeRecentDays"),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      return { fieldErrors };
    }

    const { error } = await supabase
      .from("daily_quiz_config")
      .update({
        questions_count: parsed.data.questionsCount,
        ratio_recent: parsed.data.ratioRecent,
        ratio_review: parsed.data.ratioReview,
        ratio_challenge: parsed.data.ratioChallenge,
        exclude_recent_days: parsed.data.excludeRecentDays,
      })
      .eq("id", 1);
    if (error) return { error: error.message };

    revalidatePath("/admin/daily-quiz-config");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
