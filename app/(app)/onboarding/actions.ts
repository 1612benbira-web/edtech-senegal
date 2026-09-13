"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { studentOnboardingSchema } from "@/lib/validations/curriculum";
import type { ActionState } from "@/app/admin/curriculum-actions";

export async function completeOnboardingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * Récupération des informations saisies
   */
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  /*
   * Validation du niveau, de la série et des matières.
   */
  const parsed = studentOnboardingSchema.safeParse({
    levelId: formData.get("levelId"),
    seriesId: formData.get("seriesId") || null,
    subjectIds: formData.getAll("subjectIds"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;

      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    return { fieldErrors };
  }

  const { levelId, seriesId, subjectIds } = parsed.data;

  /*
   * Défense en profondeur : le filtrage matières ↔ niveau/série se fait
   * côté client (onboarding-form.tsx), mais rien n'empêchait jusqu'ici un
   * formulaire modifié ou un état de formulaire périmé d'envoyer des
   * subjectIds qui n'existent pas pour ce niveau/cette série (ex. une
   * matière de Terminale pour un profil 6e). On revérifie donc ici, comme
   * pour la sélection du curriculum (voir lib/queries/programme.ts).
   */
  const { data: allowedSubjects, error: allowedSubjectsError } = await supabase
    .from("level_subjects")
    .select("subject_id")
    .eq("level_id", levelId)
    .or(seriesId ? `series_id.eq.${seriesId},series_id.is.null` : "series_id.is.null");

  if (allowedSubjectsError) {
    return { error: allowedSubjectsError.message };
  }

  const allowedSubjectIds = new Set((allowedSubjects ?? []).map((s) => s.subject_id));
  const invalidSubjectIds = subjectIds.filter((id) => !allowedSubjectIds.has(id));

  if (invalidSubjectIds.length > 0) {
    return {
      fieldErrors: {
        subjectIds:
          "Une ou plusieurs matières sélectionnées ne correspondent pas à ton niveau/ta série. Réessaie.",
      },
    };
  }

  /*
   * Validation du prénom.
   */
  if (!firstName) {
    return {
      fieldErrors: {
        firstName: "Ton prénom est obligatoire.",
      },
    };
  }

  if (firstName.length < 2) {
    return {
      fieldErrors: {
        firstName: "Ton prénom doit contenir au moins 2 caractères.",
      },
    };
  }

  /*
   * Mise à jour du profil.
   *
   * first_name sera ensuite utilisé dans le Dashboard
   * pour afficher par exemple :
   *
   * Bonjour Ben 👋
   */
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName || null,
      level_id: levelId,
      series_id: seriesId ?? null,
    })
    .eq("id", user.id);

  if (profileError) {
    return {
      error: profileError.message,
    };
  }

  /*
   * Remplace les matières précédemment sélectionnées.
   */
  const { error: deleteSubjectsError } = await supabase
    .from("profile_subjects")
    .delete()
    .eq("profile_id", user.id);

  if (deleteSubjectsError) {
    return {
      error: deleteSubjectsError.message,
    };
  }

  /*
   * Enregistrement des nouvelles matières.
   */
  if (subjectIds.length > 0) {
    const { error: subjectsError } = await supabase
      .from("profile_subjects")
      .insert(
        subjectIds.map((subjectId) => ({
          profile_id: user.id,
          subject_id: subjectId,
        }))
      );

    if (subjectsError) {
      return {
        error: subjectsError.message,
      };
    }
  }

  /*
   * Rafraîchissement des pages qui utilisent le profil.
   */
  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  revalidatePath("/programme");

  /*
   * Redirection vers le Dashboard.
   */
  redirect("/dashboard");
}