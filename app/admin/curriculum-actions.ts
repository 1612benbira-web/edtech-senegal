"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/services/adminGuard";
import {
  cycleSchema,
  levelSchema,
  seriesSchema,
  subjectSchema,
  levelSubjectSchema,
} from "@/lib/validations/curriculum";

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

export async function createCycleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(cycleSchema, {
      code: formData.get("code"),
      name: formData.get("name"),
      order: formData.get("order"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase.from("school_cycles").insert(parsed.data);
    if (error) return { error: error.message };

    revalidatePath("/admin/levels");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function createLevelAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(levelSchema, {
      cycleId: formData.get("cycleId"),
      code: formData.get("code"),
      name: formData.get("name"),
      order: formData.get("order"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase.from("school_levels").insert({
      cycle_id: parsed.data.cycleId,
      code: parsed.data.code,
      name: parsed.data.name,
      order: parsed.data.order,
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/levels");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function createSeriesAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(seriesSchema, {
      levelId: formData.get("levelId"),
      code: formData.get("code"),
      name: formData.get("name"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase.from("school_series").insert({
      level_id: parsed.data.levelId,
      code: parsed.data.code,
      name: parsed.data.name,
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/series");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function createSubjectAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(subjectSchema, {
      code: formData.get("code"),
      name: formData.get("name"),
      icon: formData.get("icon") || undefined,
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase.from("subjects").insert(parsed.data);
    if (error) return { error: error.message };

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function assignSubjectToLevelAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(levelSubjectSchema, {
      levelId: formData.get("levelId"),
      seriesId: formData.get("seriesId") || null,
      subjectId: formData.get("subjectId"),
      isOptional: formData.get("isOptional"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase.from("level_subjects").insert({
      level_id: parsed.data.levelId,
      series_id: parsed.data.seriesId,
      subject_id: parsed.data.subjectId,
      is_optional: parsed.data.isOptional,
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteCycleAction(cycleId: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();

    const { count, error: countError } = await supabase
      .from("school_levels")
      .select("id", { count: "exact", head: true })
      .eq("cycle_id", cycleId);
    if (countError) return { error: countError.message };
    if ((count ?? 0) > 0) {
      return {
        error: `Impossible de supprimer ce cycle : ${count} niveau(x) y sont encore rattaché(s). Supprime d'abord ces niveaux.`,
      };
    }

    const { error } = await supabase.from("school_cycles").delete().eq("id", cycleId);
    if (error) return { error: error.message };

    revalidatePath("/admin/levels");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteLevelAction(levelId: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();

    // Un niveau peut avoir des programmes (curriculums), des séries et des
    // associations niveau/matière (level_subjects) rattachés. Aucune de ces
    // tables n'a de suppression en cascade ni de soft-delete : une
    // suppression directe échouerait sur une contrainte de clé étrangère et
    // ce message le remplace par une explication claire pour l'admin,
    // plutôt que de forcer un CASCADE qui effacerait du contenu pédagogique
    // sans confirmation explicite.
    const [{ count: curriculumsCount, error: curErr }, { count: seriesCount, error: seriesErr }, { count: levelSubjectsCount, error: lsErr }] =
      await Promise.all([
        supabase.from("curriculums").select("id", { count: "exact", head: true }).eq("level_id", levelId),
        supabase.from("school_series").select("id", { count: "exact", head: true }).eq("level_id", levelId),
        supabase.from("level_subjects").select("id", { count: "exact", head: true }).eq("level_id", levelId),
      ]);
    if (curErr) return { error: curErr.message };
    if (seriesErr) return { error: seriesErr.message };
    if (lsErr) return { error: lsErr.message };

    const blockers: string[] = [];
    if ((curriculumsCount ?? 0) > 0) blockers.push(`${curriculumsCount} programme(s)`);
    if ((seriesCount ?? 0) > 0) blockers.push(`${seriesCount} série(s)`);
    if ((levelSubjectsCount ?? 0) > 0) blockers.push(`${levelSubjectsCount} matière(s) associée(s)`);

    if (blockers.length > 0) {
      return {
        error: `Impossible de supprimer ce niveau : ${blockers.join(", ")} y sont encore rattaché(s). Supprime d'abord ces éléments.`,
      };
    }

    const { error } = await supabase.from("school_levels").delete().eq("id", levelId);
    if (error) return { error: error.message };

    revalidatePath("/admin/levels");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteSeriesAction(seriesId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("school_series").delete().eq("id", seriesId);
  if (error) throw error;
  revalidatePath("/admin/series");
}

export async function deleteSubjectAction(subjectId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
  if (error) throw error;
  revalidatePath("/admin/subjects");
}
