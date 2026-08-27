"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXp, updateStreak, evaluateBadges } from "@/lib/services/gamificationService";

/**
 * Marque une leçon comme démarrée (si ce n'est pas déjà fait) ou terminée.
 * L'attribution d'XP pour une leçon terminée sera ajoutée en Phase 11
 * (gamificationService.awardXp), une fois le système XP en place —
 * volontairement pas fait ici pour respecter le découpage par phases.
 */
export async function markLessonStartedAction(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("id")
    .eq("profile_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("lesson_progress").insert({
      profile_id: user.id,
      lesson_id: lessonId,
      status: "in_progress",
      started_at: new Date().toISOString(),
    });
  }
}

export async function markLessonCompletedAction(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("started_at")
    .eq("profile_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const now = new Date().toISOString();

  await supabase.from("lesson_progress").upsert(
    {
      profile_id: user.id,
      lesson_id: lessonId,
      status: "completed",
      started_at: existing?.started_at ?? now,
      completed_at: now,
    },
    { onConflict: "profile_id,lesson_id" }
  );

  await awardXp(user.id, 20, "lesson_completed", lessonId);
  await updateStreak(user.id);
  await evaluateBadges(user.id);

  revalidatePath(`/lesson/${lessonId}`);
  revalidatePath("/dashboard");
  revalidatePath("/continue");
  revalidatePath("/programme");
}
