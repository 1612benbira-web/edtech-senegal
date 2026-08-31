import { createClient } from "@/lib/supabase/server";

// ============================================================
// SUPER ADMIN — annuaire complet des écoles
// ============================================================

export interface SchoolListItem {
  id: string;
  name: string;
  slug: string;
  code: string;
  status: "active" | "inactive";
  studentCount: number;
  teacherCount: number;
  curriculumCount: number;
}

export async function getSchools(): Promise<SchoolListItem[]> {
  const supabase = await createClient();
  const { data: schools, error } = await supabase
    .from("schools")
    .select("id, name, slug, code, status")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!schools || schools.length === 0) return [];

  const schoolIds = schools.map((s) => s.id);

  const [{ data: members }, { data: curriculums }] = await Promise.all([
    supabase
      .from("school_members")
      .select("school_id, role, status")
      .in("school_id", schoolIds),
    supabase
      .from("school_curriculums")
      .select("school_id, enabled")
      .in("school_id", schoolIds),
  ]);

  return schools.map((school) => {
    const schoolMembers = (members ?? []).filter(
      (m) => m.school_id === school.id && m.status === "active"
    );
    return {
      ...school,
      studentCount: schoolMembers.filter((m) => m.role === "student").length,
      teacherCount: schoolMembers.filter((m) => m.role === "teacher").length,
      curriculumCount: (curriculums ?? []).filter(
        (c) => c.school_id === school.id && c.enabled
      ).length,
    };
  });
}

export async function getSchoolById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** L'école active de l'utilisateur connecté (via school_members). */
export async function getMySchool() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("school_members")
    .select("role, status, schools(id, name, slug, code, status)")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Tous les curriculums publiés, avec leur état d'activation pour une école donnée. */
export async function getAvailableCurriculumsForSchool(schoolId: string) {
  const supabase = await createClient();
  const [{ data: curriculums, error: curriculumsError }, { data: links, error: linksError }] =
    await Promise.all([
      supabase
        .from("curriculums")
        .select("id, title, version, status, subjects(name), school_levels(name)")
        .eq("status", "published")
        .order("title"),
      supabase
        .from("school_curriculums")
        .select("curriculum_id, enabled")
        .eq("school_id", schoolId),
    ]);
  if (curriculumsError) throw curriculumsError;
  if (linksError) throw linksError;

  const enabledMap = new Map((links ?? []).map((l) => [l.curriculum_id, l.enabled]));

  return (curriculums ?? []).map((curriculum) => ({
    ...curriculum,
    enabled: enabledMap.get(curriculum.id) ?? false,
  }));
}
