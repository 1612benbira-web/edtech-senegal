"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProgrammeActionState = { error?: string; success?: string } | null;

/**
 * Valide et ajoute une matière au programme d'un élève.
 * La vérification "niveau + série compatibles" est faite ICI, côté
 * serveur, à partir de `level_subjects` — jamais uniquement dans
 * l'interface (section 5 du cahier des charges).
 */
async function addOneSubject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  levelId: string,
  seriesId: string | null,
  subjectId: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  let query = supabase
    .from("level_subjects")
    .select("id")
    .eq("level_id", levelId)
    .eq("subject_id", subjectId);

  query = seriesId
    ? query.or(`series_id.eq.${seriesId},series_id.is.null`)
    : query.is("series_id", null);

  const { data: allowed, error: allowedError } = await query.limit(1).maybeSingle();
  if (allowedError || !allowed) {
    return { ok: false, reason: "non disponible pour ton niveau ou ta série" };
  }

  const { error } = await supabase
    .from("profile_subjects")
    .upsert({ profile_id: userId, subject_id: subjectId }, { onConflict: "profile_id,subject_id" });

  if (error) return { ok: false, reason: "erreur lors de l'ajout" };
  return { ok: true };
}

/** Conservé pour compatibilité — ajoute une seule matière. */
export async function addSubjectToProgrammeAction(
  _prev: ProgrammeActionState,
  formData: FormData
): Promise<ProgrammeActionState> {
  return addSubjectsToProgrammeAction(_prev, formData);
}

/**
 * Ajoute une ou plusieurs matières sélectionnées (cases à cocher) en une
 * seule action. Chaque matière est revalidée individuellement côté serveur.
 */
export async function addSubjectsToProgrammeAction(
  _prev: ProgrammeActionState,
  formData: FormData
): Promise<ProgrammeActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const subjectIds = [
    ...formData.getAll("subjectIds").map(String),
    ...(formData.get("subjectId") ? [String(formData.get("subjectId"))] : []),
  ].filter(Boolean);

  if (subjectIds.length === 0) return { error: "Choisis au moins une matière." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("level_id, series_id")
    .eq("id", user.id)
    .single();
  if (!profile?.level_id) return { error: "Choisis d'abord ton niveau scolaire." };

  const failures: string[] = [];
  for (const subjectId of subjectIds) {
    const result = await addOneSubject(supabase, user.id, profile.level_id, profile.series_id, subjectId);
    if (!result.ok) failures.push(result.reason);
  }

  revalidatePath("/dashboard");
  revalidatePath("/programme");

  if (failures.length === subjectIds.length) {
    return { error: "Aucune matière n'a pu être ajoutée (niveau/série incompatible)." };
  }
  if (failures.length > 0) {
    return { success: `${subjectIds.length - failures.length} matière(s) ajoutée(s), ${failures.length} refusée(s) (niveau/série incompatible).` };
  }
  return {
    success:
      subjectIds.length > 1
        ? "Matières ajoutées à ton programme."
        : "Matière ajoutée à ton programme.",
  };
}
