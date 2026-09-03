import { createClient } from "@/lib/supabase/server";

export class NotAdminError extends Error {
  constructor() {
    super("Action réservée aux administrateurs.");
    this.name = "NotAdminError";
  }
}

export class NotSchoolAdminError extends Error {
  constructor() {
    super("Action réservée à l'administrateur de cette école.");
    this.name = "NotSchoolAdminError";
  }
}

/**
 * Vérifie que l'utilisateur courant est admin, sinon lève une erreur.
 * La RLS (migration 0009) protège déjà la base en dernier recours,
 * mais ce contrôle explicite donne un message d'erreur clair côté UI.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new NotAdminError();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new NotAdminError();

  return { supabase, userId: user.id };
}

/**
 * Vérifie que l'utilisateur courant est soit super_admin (rôle 'admin',
 * accès global), soit school_admin de l'école `schoolId` précise
 * (accès scopé à cette seule école — cf. migration 0018,
 * is_school_admin()). La RLS reste le dernier rempart ; ce contrôle
 * explicite permet de renvoyer un message clair et de choisir la bonne
 * redirection côté page (ex: notFound() plutôt qu'une erreur RLS brute).
 */
export async function requireSchoolAccess(schoolId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new NotSchoolAdminError();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    return { supabase, userId: user.id, isSuperAdmin: true as const };
  }

  const { data: membership } = await supabase
    .from("school_members")
    .select("id")
    .eq("school_id", schoolId)
    .eq("profile_id", user.id)
    .eq("role", "school_admin")
    .eq("status", "active")
    .maybeSingle();

  if (!membership) throw new NotSchoolAdminError();

  return { supabase, userId: user.id, isSuperAdmin: false as const };
}

/**
 * Vérifie que l'utilisateur courant a accès à l'administration (super_admin
 * OU school_admin d'AU MOINS une école) — utilisé par le layout /admin
 * pour décider qui peut entrer dans la zone d'administration.
 */
export async function requireAnyAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new NotAdminError();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    return { supabase, userId: user.id, role: "admin" as const };
  }

  // BUG CORRIGÉ : l'ancienne version exigeait profiles.role === "school_admin"
  // AVANT même de regarder school_members, ce qui empêchait un utilisateur
  // d'accéder à /admin quand son appartenance à une école (school_members)
  // portait déjà role = 'school_admin' mais que son profiles.role global
  // était resté 'student' ou 'teacher' (cas normal : school_members est la
  // source de vérité pour ce rattachement, cf. migration 0017/0018 —
  // profiles.role = 'school_admin' n'est qu'une commodité, pas une condition
  // requise). On interroge donc directement school_members, sans condition
  // préalable sur profiles.role.
  const { data: membership } = await supabase
    .from("school_members")
    .select("school_id")
    .eq("profile_id", user.id)
    .eq("role", "school_admin")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (membership) {
    return { supabase, userId: user.id, role: "school_admin" as const, schoolId: membership.school_id as string };
  }

  throw new NotAdminError();
}
