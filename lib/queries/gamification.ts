import { createClient } from "@/lib/supabase/server";

export async function getStreak(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak")
    .eq("profile_id", profileId)
    .maybeSingle();
  return data ?? { current_streak: 0, longest_streak: 0 };
}

export async function getEarnedBadges(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_badges")
    .select("earned_at, badges(code, name, description, icon)")
    .eq("profile_id", profileId)
    .order("earned_at", { ascending: false });
  return data ?? [];
}
