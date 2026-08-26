"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/services/adminGuard";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type ForceLogoutState = { error?: string; success?: string } | null;

/**
 * Déconnexion forcée d'un élève par un administrateur.
 *
 * N'invente pas de statut (pas de `is_online = false`, cf. section 8 du
 * cahier des charges) : invalide réellement la session en supprimant les
 * lignes `auth.sessions` de cet utilisateur via la fonction SQL
 * `admin_force_logout_user` (migration 0015), restreinte au rôle
 * `service_role`. À sa prochaine requête, `supabase.auth.getUser()`
 * (appelé dans le middleware à chaque navigation) échouera pour ce
 * cookie de session et l'élève sera renvoyé vers /login.
 */
export async function forceLogoutStudentAction(
  _prev: ForceLogoutState,
  formData: FormData
): Promise<ForceLogoutState> {
  const { userId: adminId } = await requireAdmin();

  const targetUserId = String(formData.get("studentId") || "");
  if (!targetUserId) return { error: "Élève introuvable." };
  if (targetUserId === adminId) {
    return { error: "Tu ne peux pas te déconnecter toi-même depuis cet écran." };
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.rpc("admin_force_logout_user", {
    target_user_id: targetUserId,
  });

  if (error) {
    return { error: "Impossible de déconnecter cet élève pour le moment." };
  }

  revalidatePath("/admin/students");
  return { success: "Élève déconnecté." };
}
