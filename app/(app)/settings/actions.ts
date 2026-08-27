"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validations/schemas";

export type UpdateNameState = { error?: string; success?: boolean } | null;

/**
 * Permet à l'élève de corriger son prénom/nom lui-même, sans passer par
 * une modification manuelle en base (SQL). Réutilise `profileUpdateSchema`
 * (lib/validations/schemas.ts), déjà prévu pour ça mais pas encore branché
 * ailleurs. Seuls first_name/last_name sont modifiables ici — jamais
 * role, xp_total, level_id, etc. (voir la remarque dans schemas.ts).
 */
export async function updateNameAction(
  _prev: UpdateNameState,
  formData: FormData
): Promise<UpdateNameState> {
  const parsed = profileUpdateSchema
    .pick({ firstName: true, lastName: true })
    .safeParse({
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
    });

  if (!parsed.success) {
    return { error: "Merci de renseigner un prénom et un nom valides." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ first_name: parsed.data.firstName, last_name: parsed.data.lastName })
    .eq("id", user.id);

  if (error) {
    return { error: "Impossible d'enregistrer ces informations pour le moment. Réessaie plus tard." };
  }

  // Le prénom/nom apparaît aussi sur le dashboard (salutation) et dans la
  // barre du haut (menu utilisateur) — on invalide le cache de tout le
  // groupe (app) pour que ces pages affichent la nouvelle valeur sans
  // attendre une expiration naturelle du cache.
  revalidatePath("/", "layout");

  return { success: true };
}

export type DeleteAccountState = { error?: string } | null;

const CONFIRMATION_WORD = "SUPPRIMER";

/**
 * Suppression définitive du compte élève.
 *
 * Sécurité :
 * - Confirmation explicite ("SUPPRIMER") revalidée côté serveur (jamais
 *   uniquement côté UI).
 * - Utilise `auth.admin.deleteUser()` via le client service_role — jamais
 *   de clé secrète exposée au navigateur, cette Server Action tourne
 *   uniquement côté serveur.
 * - `profiles.id` référence `auth.users(id) on delete cascade` (migration
 *   0003), et toutes les tables de progression/programmes de l'élève
 *   référencent `profiles(id) on delete cascade` (lesson_progress,
 *   profile_subjects, quiz_attempts, exercise_attempts, xp_transactions,
 *   streaks, user_badges, notifications, competency_progress — migrations
 *   0003, 0006, 0007, 0008). Supprimer l'utilisateur Auth supprime donc en
 *   cascade TOUTES ses données personnelles, sans toucher au contenu
 *   pédagogique global (curriculums/chapitres/leçons appartiennent à la
 *   plateforme, aucune de ces tables ne référence `profiles`).
 */
export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const confirmation = String(formData.get("confirmation") || "").trim();
  if (confirmation !== CONFIRMATION_WORD) {
    return { error: `Merci d'écrire exactement "${CONFIRMATION_WORD}" pour confirmer.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return {
      error:
        "La suppression de compte nécessite SUPABASE_SERVICE_ROLE_KEY côté serveur. Contacte un administrateur.",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return { error: "Impossible de supprimer le compte pour le moment. Réessaie plus tard." };
  }

  // La session locale n'est plus valide (l'utilisateur n'existe plus) ;
  // on nettoie les cookies côté client en redirigeant vers /login.
  await supabase.auth.signOut().catch(() => {});
  redirect("/login?deleted=success");
}