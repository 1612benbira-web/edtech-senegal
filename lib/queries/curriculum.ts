import { createClient } from "@/lib/supabase/server";

export async function getCycles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_cycles")
    .select("*")
    .order("order");
  if (error) throw error;
  return data;
}

export async function getLevels(cycleId?: string) {
  const supabase = await createClient();
  let query = supabase.from("school_levels").select("*, school_cycles(name)").order("order");
  if (cycleId) query = query.eq("cycle_id", cycleId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getSeries(levelId?: string) {
  const supabase = await createClient();
  let query = supabase.from("school_series").select("*, school_levels(name)").order("code");
  if (levelId) query = query.eq("level_id", levelId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getSubjects() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subjects").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getLevelSubjects(levelId: string, seriesId?: string | null) {
  const supabase = await createClient();
  let query = supabase
    .from("level_subjects")
    .select("*, subjects(*)")
    .eq("level_id", levelId);
  if (seriesId) {
    query = query.or(`series_id.eq.${seriesId},series_id.is.null`);
  } else {
    query = query.is("series_id", null);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
