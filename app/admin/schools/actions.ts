"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireSchoolAccess } from "@/lib/services/adminGuard";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  schoolSchema,
  schoolStatusSchema,
  schoolCurriculumToggleSchema,
  schoolMemberStatusSchema,
} from "@/lib/validations/school";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  message?: string;
} | null;

function parseOrThrow<T>(schema: { safeParse: (v: unknown) => any }, raw: T) {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { fieldErrors };
  }
  return { data: parsed.data };
}

// ============================================================
// ÉCOLES — création/édition réservées au super_admin
// ============================================================

export async function createSchoolAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(schoolSchema, {
      name: formData.get("name"),
      slug: formData.get("slug"),
      code: formData.get("code"),
      adminEmail: formData.get("adminEmail"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { slugify } = await import("@/lib/validations/school");
    const slug = parsed.data!.slug ?? slugify(parsed.data!.name);
    const adminEmail = parsed.data!.adminEmail;

    // ------------------------------------------------------------
    // Étape 1 — résoudre (ou créer) le compte du futur school_admin,
    // AVANT de créer l'école : si cette étape échoue, aucune école
    // n'est créée (jamais d'établissement orphelin sans administrateur
    // à cause d'un email invalide/service indisponible).
    // ------------------------------------------------------------
    let adminProfileId: string | null = null;
    let adminMode: "existing" | "invited" | null = null;

    if (adminEmail) {
      // Recherche d'un profil existant. `profiles_admin_all` (0009)
      // autorise le super_admin à lire n'importe quel profil — pas
      // besoin de service_role ici.
      const { data: existingProfile, error: lookupError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", adminEmail)
        .maybeSingle();
      if (lookupError) return { error: lookupError.message };

      if (existingProfile) {
        adminProfileId = existingProfile.id;
        adminMode = "existing";
      } else {
        // CAS 2 — l'utilisateur n'existe pas encore : on l'invite via
        // Supabase Auth Admin API (service_role, jamais côté client).
        // Le trigger on_auth_user_created (0003) crée automatiquement
        // sa ligne `profiles` dans la foulée.
        let admin;
        try {
          admin = createServiceRoleClient();
        } catch (e) {
          return { error: (e as Error).message };
        }

        const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(adminEmail);
        if (inviteError || !invited?.user) {
          return {
            error: `L'invitation à ${adminEmail} a échoué : ${inviteError?.message ?? "erreur inconnue"}. L'école n'a pas été créée.`,
          };
        }
        adminProfileId = invited.user.id;
        adminMode = "invited";
      }
    }

    // ------------------------------------------------------------
    // Étape 2 — création atomique de l'école + rattachement school_admin
    // (fonction RPC transactionnelle, migration 0020) : si l'insertion
    // du membership échoue, l'école créée est annulée avec elle.
    // ------------------------------------------------------------
    const { data: rpcResult, error: rpcError } = await supabase.rpc("create_school_with_admin", {
      p_name: parsed.data!.name,
      p_slug: slug,
      p_code: parsed.data!.code,
      p_admin_profile_id: adminProfileId,
    });

    if (rpcError) {
      if (rpcError.code === "23505") {
        return { error: "Ce slug ou ce code établissement est déjà utilisé." };
      }
      return { error: rpcError.message };
    }

    const result = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
    if (!result?.school_id) {
      return { error: "La création de l'école a échoué pour une raison inconnue." };
    }

    revalidatePath("/admin/schools");

    let message = "École créée avec succès.";
    if (adminMode === "existing") {
      message += ` ${adminEmail} a été désigné comme School Admin.`;
      if (result.already_admin_elsewhere) {
        message += " Il administre déjà au moins une autre école — il administre maintenant aussi celle-ci.";
      }
    } else if (adminMode === "invited") {
      message += ` Une invitation a été envoyée à ${adminEmail}.`;
    }

    return { success: true, message };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateSchoolStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Réservé au super_admin (voir trigger protect_school_status_column, 0018).
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(schoolStatusSchema, {
      schoolId: formData.get("schoolId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { data: updated, error } = await supabase
      .from("schools")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.schoolId)
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    if (!updated) {
      return { error: "Cette école n'existe pas ou vous n'avez pas les droits nécessaires." };
    }

    revalidatePath("/admin/schools");
    revalidatePath(`/admin/schools/${parsed.data!.schoolId}`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateSchoolNameAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!schoolId) return { error: "École manquante." };
    if (name.length < 2) return { fieldErrors: { name: "Nom requis (2 caractères minimum)" } };

    const { supabase } = await requireSchoolAccess(schoolId);
    const { data: updated, error } = await supabase
      .from("schools")
      .update({ name })
      .eq("id", schoolId)
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    if (!updated) {
      return { error: "Cette école n'existe pas ou vous n'avez pas les droits nécessaires." };
    }

    revalidatePath(`/admin/schools/${schoolId}`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ============================================================
// PROGRAMMES D'UNE ÉCOLE — super_admin ou school_admin de cette école
// ============================================================

export async function toggleSchoolCurriculumAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsed = parseOrThrow(schoolCurriculumToggleSchema, {
      schoolId: formData.get("schoolId"),
      curriculumId: formData.get("curriculumId"),
      enabled: formData.get("enabled"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const { schoolId, curriculumId, enabled } = parsed.data!;

    const { supabase } = await requireSchoolAccess(schoolId);

    // Ce bouton ne duplique jamais le contenu : il crée/actualise
    // uniquement la relation school_curriculums (le curriculum reste
    // un contenu global partagé — cf. règle architecturale du projet).
    const { data: upserted, error } = await supabase
      .from("school_curriculums")
      .upsert({ school_id: schoolId, curriculum_id: curriculumId, enabled }, { onConflict: "school_id,curriculum_id" })
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    if (!upserted) {
      return { error: "Ce programme n'existe pas ou vous n'avez pas les droits nécessaires." };
    }

    revalidatePath(`/admin/schools/${schoolId}/curriculums`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ============================================================
// MEMBRES D'UNE ÉCOLE
// ============================================================

export async function updateSchoolMemberStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const parsed = parseOrThrow(schoolMemberStatusSchema, {
      schoolMemberId: formData.get("schoolMemberId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    if (!schoolId) return { error: "École manquante." };

    const { supabase, userId } = await requireSchoolAccess(schoolId);

    // Protection anti-verrouillage : un school_admin ne doit jamais
    // pouvoir suspendre SA PROPRE ligne d'appartenance — ça lui
    // couperait instantanément l'accès à l'administration de son
    // école, sans moyen de revenir en arrière depuis l'interface.
    const { data: targetMember } = await supabase
      .from("school_members")
      .select("profile_id")
      .eq("id", parsed.data!.schoolMemberId)
      .eq("school_id", schoolId)
      .maybeSingle();
    if (targetMember?.profile_id === userId) {
      return { error: "Tu ne peux pas modifier ton propre statut d'administrateur — demande à un autre administrateur ou au super administrateur." };
    }

    const { data: updated, error } = await supabase
      .from("school_members")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.schoolMemberId)
      .eq("school_id", schoolId)
      .select("id")
      .maybeSingle();
    if (error) return { error: error.message };
    if (!updated) {
      return { error: "Ce membre n'existe pas ou vous n'avez pas les droits nécessaires (par exemple : impossible de modifier un autre administrateur d'école)." };
    }

    revalidatePath(`/admin/schools/${schoolId}/members`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function removeSchoolMemberAction(schoolMemberId: string, schoolId: string) {
  const { supabase, userId } = await requireSchoolAccess(schoolId);

  // Même protection anti-verrouillage que ci-dessus, appliquée au retrait.
  const { data: targetMember } = await supabase
    .from("school_members")
    .select("profile_id")
    .eq("id", schoolMemberId)
    .eq("school_id", schoolId)
    .maybeSingle();
  if (targetMember?.profile_id === userId) {
    throw new Error("Tu ne peux pas te retirer toi-même de l'école — demande à un autre administrateur ou au super administrateur.");
  }

  const { data: deleted, error } = await supabase
    .from("school_members")
    .delete()
    .eq("id", schoolMemberId)
    .eq("school_id", schoolId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!deleted) {
    throw new Error("Ce membre n'existe pas ou vous n'avez pas les droits nécessaires (par exemple : impossible de retirer un autre administrateur d'école).");
  }
  revalidatePath(`/admin/schools/${schoolId}/members`);
}
