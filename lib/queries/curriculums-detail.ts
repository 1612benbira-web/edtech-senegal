import { createClient } from "@/lib/supabase/server";

// ============================================================
// ADMIN — inclut tous les statuts
// ============================================================

export async function getAllCurriculums() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculums")
    .select("*, school_levels(name), school_series(name), subjects(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCurriculumDomains(curriculumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("curriculum_id", curriculumId)
    .order("order");
  if (error) throw error;
  return data;
}

export async function getCurriculumCompetencies(curriculumId: string) {
  const supabase = await createClient();
  const { data: domains, error: domainsError } = await supabase
    .from("domains")
    .select("id")
    .eq("curriculum_id", curriculumId);
  if (domainsError) throw domainsError;
  const domainIds = (domains ?? []).map((d) => d.id);
  if (domainIds.length === 0) return [];

  const { data, error } = await supabase
    .from("competencies")
    .select("id, name, domain_id")
    .in("domain_id", domainIds)
    .order("order");
  if (error) throw error;
  return data;
}

export async function getChaptersForCurriculum(curriculumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*, domains(name)")
    .eq("curriculum_id", curriculumId)
    .is("deleted_at", null)
    .order("order");
  if (error) throw error;
  return data;
}

// ============================================================
// ÉLÈVE — uniquement le contenu publié (la RLS filtre déjà,
// ces requêtes le rendent explicite dans le code)
// ============================================================

export async function getPublishedCurriculum(subjectId: string, levelId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculums")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("level_id", levelId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPublishedChapters(curriculumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("curriculum_id", curriculumId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("order");
  if (error) throw error;
  return data;
}

export async function getChapterById(chapterId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*, curriculums(title, subject_id, level_id)")
    .eq("id", chapterId)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data;
}
