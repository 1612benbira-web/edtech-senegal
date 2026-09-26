import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Service central pour toute la logique multi-écoles.
 *
 * Hypothèse de conception : un profil (élève/enseignant) appartient à
 * AU PLUS UNE école active à la fois (school_members permet
 * techniquement plusieurs lignes, mais l'application n'en utilise
 * qu'une seule — la plus récente active). Un élève sans école
 * (compte créé avant cette fonctionnalité, ou non rattaché) continue
 * de fonctionner : `getCurrentSchoolId()` renvoie alors `null`, et le
 * reste du code (lib/queries/programme.ts notamment) doit interpréter
 * `null` comme "pas de restriction d'école" pour ne pas casser les
 * comptes existants (voir CORRECTIONS-26-08-2026.md pour le même
 * principe de compatibilité appliqué ailleurs dans ce projet).
 */

export type SchoolMembershipRole = "student" | "teacher" | "school_admin";

export interface CurrentSchoolMembership {
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  role: SchoolMembershipRole;
}

/**
 * Retourne l'école active courante de l'utilisateur connecté (ou null
 * s'il n'est rattaché à aucune école, ou n'est pas connecté).
 */
export async function getCurrentSchool(): Promise<CurrentSchoolMembership | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("school_members")
    .select("role, schools(id, name, code, status)")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const school = (data as any)?.schools;
  if (!data || !school || school.status !== "active") return null;

  return {
    schoolId: school.id,
    schoolName: school.name,
    schoolCode: school.code,
    role: data.role,
  };
}

/** Raccourci pratique quand seul l'id est nécessaire. */
export async function getCurrentSchoolId(): Promise<string | null> {
  const school = await getCurrentSchool();
  return school?.schoolId ?? null;
}

/** Toutes les écoles (actives ou non) auxquelles un profil est rattaché. */
export async function getUserSchools(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_members")
    .select("id, role, status, schools(id, name, code, status)")
    .eq("profile_id", profileId);
  if (error) throw error;
  return data ?? [];
}

export async function getSchoolMembers(schoolId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_members")
    .select("id, role, status, created_at, profiles(id, first_name, last_name, email)")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Affectations enseignant ↔ matière ↔ niveau d'une école (migration 0025). */
export async function getSchoolSubjectTeachers(schoolId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_subject_teachers")
    .select(
      "id, created_at, subjects(id, name), school_levels(id, name), school_series(id, name), profiles(id, first_name, last_name, email)"
    )
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Les matières/niveaux confiés à l'enseignant connecté pour une école donnée. */
export async function getMyTeachingAssignments(schoolId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("school_subject_teachers")
    .select("id, subjects(id, name), school_levels(id, name), school_series(id, name)")
    .eq("school_id", schoolId)
    .eq("teacher_profile_id", user.id);
  if (error) throw error;
  return data ?? [];
}

export async function getSchoolCurriculums(schoolId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_curriculums")
    .select("id, enabled, curriculum_id, curriculums(id, title, version, status)")
    .eq("school_id", schoolId);
  if (error) throw error;
  return data ?? [];
}

/** L'utilisateur connecté est-il membre actif (tout rôle) de cette école ? */
export async function isSchoolMember(schoolId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("school_members")
    .select("id")
    .eq("school_id", schoolId)
    .eq("profile_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  return Boolean(data);
}

/** L'utilisateur connecté est-il school_admin actif de cette école ? */
export async function isSchoolAdmin(schoolId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("school_members")
    .select("id")
    .eq("school_id", schoolId)
    .eq("profile_id", user.id)
    .eq("role", "school_admin")
    .eq("status", "active")
    .maybeSingle();

  return Boolean(data);
}

/**
 * Un programme (curriculum) est-il accessible à l'école donnée ?
 * `schoolId === null` signifie "élève non rattaché à une école" :
 * on préserve alors le comportement historique (accès à tout
 * programme publié, sans restriction d'école) plutôt que de bloquer
 * des comptes existants créés avant le multi-écoles.
 */
export async function isCurriculumAllowedForSchool(
  schoolId: string | null,
  curriculumId: string
): Promise<boolean> {
  if (!schoolId) return true;

  const supabase = await createClient();
  const { data } = await supabase
    .from("school_curriculums")
    .select("enabled")
    .eq("school_id", schoolId)
    .eq("curriculum_id", curriculumId)
    .maybeSingle();

  // Historique : si l'école n'a pas encore été explicitement configurée
  // pour un programme, celui-ci n'est PAS considéré comme activé — une
  // école doit activer explicitement ses programmes (cf. mission).
  return Boolean(data?.enabled);
}

/**
 * Trouve une école par son code d'établissement (utilisé à l'inscription).
 *
 * Utilise le client service_role : un visiteur qui s'inscrit n'est pas
 * encore membre de l'école (RLS `schools_select_admin_or_member`
 * l'interdirait sinon), et le code d'établissement fonctionne comme un
 * "code d'invitation" qui ne doit pas exposer l'annuaire complet des
 * écoles — seule la validation d'un code précis est nécessaire ici,
 * jamais appelée depuis le client.
 */
export async function getSchoolByCode(code: string) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("schools")
    .select("id, name, code, status")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}
