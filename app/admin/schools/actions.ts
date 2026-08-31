"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireSchoolAccess } from "@/lib/services/adminGuard";
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
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { slugify } = await import("@/lib/validations/school");
    const slug = parsed.data!.slug ?? slugify(parsed.data!.name);

    const { error } = await supabase.from("schools").insert({
      name: parsed.data!.name,
      slug,
      code: parsed.data!.code,
    });

    if (error) {
      if (error.code === "23505") {
        return { error: "Ce slug ou ce code établissement est déjà utilisé." };
      }
      return { error: error.message };
    }

    revalidatePath("/admin/schools");
    return { success: true };
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

    const { error } = await supabase
      .from("schools")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.schoolId);
    if (error) return { error: error.message };

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
    const { error } = await supabase.from("schools").update({ name }).eq("id", schoolId);
    if (error) return { error: error.message };

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
    const { error } = await supabase
      .from("school_curriculums")
      .upsert({ school_id: schoolId, curriculum_id: curriculumId, enabled }, { onConflict: "school_id,curriculum_id" });
    if (error) return { error: error.message };

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

    const { error } = await supabase
      .from("school_members")
      .update({ status: parsed.data!.status })
      .eq("id", parsed.data!.schoolMemberId)
      .eq("school_id", schoolId);
    if (error) return { error: error.message };

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

  const { error } = await supabase
    .from("school_members")
    .delete()
    .eq("id", schoolMemberId)
    .eq("school_id", schoolId);
  if (error) throw error;
  revalidatePath(`/admin/schools/${schoolId}/members`);
}
