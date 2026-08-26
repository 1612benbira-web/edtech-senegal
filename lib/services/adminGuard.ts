import { createClient } from "@/lib/supabase/server";

export class NotAdminError extends Error {
  constructor() {
    super("Action réservée aux administrateurs.");
    this.name = "NotAdminError";
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
