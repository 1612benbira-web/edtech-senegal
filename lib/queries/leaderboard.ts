import { createClient } from "@/lib/supabase/server";

export interface LeaderboardEntry {
  profileId: string;
  firstName: string;
  lastNameInitial: string | null;
  xpTotal: number;
  rank: number;
}

export async function getLevelLeaderboard(levelId: string, limit = 10): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_level_leaderboard", {
    p_level_id: levelId,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    profileId: row.profile_id,
    firstName: row.first_name,
    lastNameInitial: row.last_name_initial,
    xpTotal: row.xp_total,
    rank: Number(row.rank),
  }));
}

export async function getMyLevelRank(levelId: string): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_level_rank", { p_level_id: levelId });
  if (error) throw error;
  return data == null ? null : Number(data);
}
