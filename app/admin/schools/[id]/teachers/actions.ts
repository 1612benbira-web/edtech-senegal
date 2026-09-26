"use server";

import { revalidatePath } from "next/cache";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { teacherAssignmentSchema, teacherAssignmentRemoveSchema } from "@/lib/validations/school";
import type { ActionState } from "../../actions";

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
// AFFECTATION ENSEIGNANT ↔ MATIÈRE ↔ NIVEAU — réservée au school_admin
// de cette école (ou au super_admin). Jamais à l'enseignant lui-même :
// cf. policy school_subject_teachers_admin_manage (migration 0025).
// ============================================================

export async function assignTeacherAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const schoolId = String(formData.get("schoolId") ?? "");
    const { supabase } = await requireSchoolAccess(schoolId);

    const parsed = parseOrThrow(teacherAssignmentSchema, {
      schoolId,
      teacherEmail: formData.get("teacherEmail"),
      subjectId: formData.get("subjectId"),
      levelId: formData.get("levelId"),
      seriesId: formData.get("seriesId") || undefined,
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data!;

    // ------------------------------------------------------------
    // Étape 1 — résoudre (ou inviter) le compte enseignant, AVANT de
    // créer quoi que ce soit : mêmes principes que createSchoolAction
    // (jamais d'affectation orpheline si l'invitation échoue).
    // ------------------------------------------------------------
    const { data: existingProfile, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", d.teacherEmail)
      .maybeSingle();
    if (lookupError) return { error: lookupError.message };

    let teacherProfileId: string;
    let invited = false;

    if (existingProfile) {
      teacherProfileId = existingProfile.id;
    } else {
      let admin;
      try {
        admin = createServiceRoleClient();
      } catch (e) {
        return { error: (e as Error).message };
      }
      const { data: invitedUser, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
        d.teacherEmail
      );
      if (inviteError || !invitedUser?.user) {
        return {
          error: `L'invitation à ${d.teacherEmail} a échoué : ${inviteError?.message ?? "erreur inconnue"}. L'affectation n'a pas été créée.`,
        };
      }
      teacherProfileId = invitedUser.user.id;
      invited = true;
    }

    // ------------------------------------------------------------
    // Étape 2 — rattacher (ou confirmer le rattachement) de ce profil
    // comme 'teacher' actif de l'école. Un profil déjà membre (élève,
    // par exemple) voit son rôle school_members mis à jour vers
    // 'teacher' : un compte n'a qu'UN SEUL rôle par école (unique
    // school_id, profile_id — migration 0017).
    // ------------------------------------------------------------
    const { error: memberError } = await supabase
      .from("school_members")
      .upsert(
        { school_id: schoolId, profile_id: teacherProfileId, role: "teacher", status: "active" },
        { onConflict: "school_id,profile_id" }
      );
    if (memberError) return { error: memberError.message };

    // ------------------------------------------------------------
    // Étape 3 — l'affectation matière/niveau elle-même. onConflict sur
    // (school_id, subject_id, level_id, series_id) : réaffecter la même
    // combinaison à un autre enseignant remplace l'ancien (un seul
    // enseignant par combinaison, décision du porteur de projet).
    // ------------------------------------------------------------
    const { error: assignError } = await supabase.from("school_subject_teachers").upsert(
      {
        school_id: schoolId,
        subject_id: d.subjectId,
        level_id: d.levelId,
        series_id: d.seriesId ?? null,
        teacher_profile_id: teacherProfileId,
      },
      { onConflict: "school_id,subject_id,level_id,series_id" }
    );
    if (assignError) return { error: assignError.message };

    revalidatePath(`/admin/schools/${schoolId}/teachers`);
    revalidatePath(`/admin/schools/${schoolId}/members`);

    return {
      success: true,
      message: invited
        ? `Une invitation a été envoyée à ${d.teacherEmail}. Il sera enseignant dès qu'il aura activé son compte.`
        : `${d.teacherEmail} est désormais enseignant de cette matière/niveau.`,
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function removeTeacherAssignmentAction(assignmentId: string, schoolId: string) {
  const { supabase } = await requireSchoolAccess(schoolId);

  // Ne retire QUE l'affectation matière/niveau — ne touche jamais au
  // rattachement school_members de l'enseignant : il peut couvrir
  // d'autres matières/niveaux dans la même école, à retirer une par
  // une (cf. page /teachers).
  const { data: deleted, error } = await supabase
    .from("school_subject_teachers")
    .delete()
    .eq("id", assignmentId)
    .eq("school_id", schoolId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!deleted) {
    throw new Error("Cette affectation n'existe pas ou vous n'avez pas les droits nécessaires.");
  }
  revalidatePath(`/admin/schools/${schoolId}/teachers`);
}
