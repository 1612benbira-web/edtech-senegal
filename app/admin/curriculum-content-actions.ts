"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/services/adminGuard";
import {
  curriculumSchema,
  curriculumStatusSchema,
  chapterSchema,
  chapterStatusSchema,
  lessonSchema,
  lessonStatusSchema,
  domainSchema,
  competencySchema,
} from "@/lib/validations/curriculum";
import type { ActionState } from "./curriculum-actions";

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

export async function createCurriculumAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(curriculumSchema, {
      levelId: formData.get("levelId"),
      seriesId: formData.get("seriesId") || null,
      subjectId: formData.get("subjectId"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      version: formData.get("version"),
      source: formData.get("source") || undefined,
      sourceUrl: formData.get("sourceUrl") || undefined,
      sourceDocument: formData.get("sourceDocument") || undefined,
      internalNotes: formData.get("internalNotes") || undefined,
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data;

    const { error } = await supabase.from("curriculums").insert({
      level_id: d.levelId,
      series_id: d.seriesId,
      subject_id: d.subjectId,
      title: d.title,
      description: d.description,
      version: d.version,
      source: d.source,
      source_url: d.sourceUrl || null,
      source_document: d.sourceDocument,
      internal_notes: d.internalNotes,
      status: "draft",
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/curriculums");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Fait avancer/reculer le statut d'un programme.
 * Le passage à 'published' est bloqué en base (migration 0004) si aucune
 * source n'est renseignée — l'erreur PostgreSQL remonte telle quelle ici.
 */
export async function updateCurriculumStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase, userId } = await requireAdmin();
    const parsed = parseOrThrow(curriculumStatusSchema, {
      curriculumId: formData.get("curriculumId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const updatePayload: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.status === "validated") {
      updatePayload.validated = true;
      updatePayload.validated_by = userId;
      updatePayload.validated_at = new Date().toISOString();
    }
    if (parsed.data.status === "published") {
      updatePayload.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("curriculums")
      .update(updatePayload)
      .eq("id", parsed.data.curriculumId);

    if (error) {
      // Message plus clair que l'erreur SQL brute pour le garde-fou de publication
      if (error.message.includes("ne peut être publié sans source")) {
        return {
          error:
            "Impossible de publier : renseigne une source_url ou un source_document avant de publier ce programme.",
        };
      }
      return { error: error.message };
    }

    revalidatePath("/admin/curriculums");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Aperçu de l'impact AVANT suppression : utilisé par la boîte de
 * confirmation (CascadeDeleteButton) pour afficher "cette action
 * supprimera également X chapitres, X leçons...". Lecture seule.
 */
export async function getCurriculumDeletionImpactAction(
  curriculumId: string
): Promise<{ data?: Record<string, number>; error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.rpc("get_curriculum_deletion_impact", {
      p_curriculum_id: curriculumId,
    });
    if (error) return { error: error.message };
    return { data: data as Record<string, number> };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Supprime un programme ENTIER et tout ce qui en dépend (domaines,
 * compétences, chapitres, leçons, exercices, questions, options de
 * réponses, associations quiz, tentatives d'élèves) — réservé au
 * super_admin (Phase 22). Contrairement à school_admin, qui ne peut
 * jamais toucher au contenu global, le super_admin peut supprimer même
 * si le programme est activé dans plusieurs écoles ou contient des
 * exercices déjà utilisés par des élèves : ces restrictions ne
 * s'appliquent qu'au school_admin (RLS `curriculums_school_admin_manage`,
 * migration 0019 — school_id doit être non-null, jamais le cas d'un
 * programme global).
 *
 * La suppression réelle est effectuée par la fonction PostgreSQL
 * `delete_curriculum_cascade` (migration 0023), qui vérifie elle-même
 * `is_admin()` et s'exécute comme une seule transaction : si une étape
 * échoue, tout est annulé, aucune suppression partielle ne peut
 * survenir. `requireAdmin()` ici donne un message d'erreur clair côté
 * UI avant même d'atteindre la base si l'appelant n'est pas admin.
 */
export async function deleteCurriculumAction(curriculumId: string): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("delete_curriculum_cascade", {
      p_curriculum_id: curriculumId,
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/curriculums");
    revalidatePath("/admin/levels");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ============================================================
// CHAPITRES
// ============================================================

export async function createChapterAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(chapterSchema, {
      curriculumId: formData.get("curriculumId"),
      domainId: formData.get("domainId") || null,
      title: formData.get("title"),
      order: formData.get("order"),
      source: formData.get("source") || undefined,
      sourceUrl: formData.get("sourceUrl") || undefined,
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data;

    const { error } = await supabase.from("chapters").insert({
      curriculum_id: d.curriculumId,
      domain_id: d.domainId,
      title: d.title,
      order: d.order,
      source: d.source,
      source_url: d.sourceUrl || null,
      status: "draft",
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/chapters");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateChapterStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(chapterStatusSchema, {
      chapterId: formData.get("chapterId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase
      .from("chapters")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.chapterId);
    if (error) {
      if (error.message.includes("ne peut être publié sans source")) {
        return {
          error:
            "Impossible de publier : renseigne une source ou une source_url pour ce chapitre avant de le publier.",
        };
      }
      return { error: error.message };
    }

    revalidatePath("/admin/chapters");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteChapterAction(chapterId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("chapters")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", chapterId);
  if (error) throw error;
  revalidatePath("/admin/chapters");
}

// ============================================================
// LEÇONS
// ============================================================

export async function createLessonAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(lessonSchema, {
      chapterId: formData.get("chapterId"),
      competencyId: formData.get("competencyId") || null,
      title: formData.get("title"),
      contentMd: formData.get("contentMd"),
      objectives: formData.get("objectives") || undefined,
      summary: formData.get("summary") || undefined,
      order: formData.get("order"),
      source: formData.get("source") || undefined,
      sourceUrl: formData.get("sourceUrl") || undefined,
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data;

    const objectivesArray = d.objectives
      ? d.objectives.split("\n").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const { error } = await supabase.from("lessons").insert({
      chapter_id: d.chapterId,
      competency_id: d.competencyId,
      title: d.title,
      content_md: d.contentMd,
      objectives: objectivesArray,
      summary: d.summary,
      order: d.order,
      source: d.source,
      source_url: d.sourceUrl || null,
      status: "draft",
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/lessons");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateLessonStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(lessonStatusSchema, {
      lessonId: formData.get("lessonId"),
      status: formData.get("status"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

    const { error } = await supabase
      .from("lessons")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.lessonId);
    if (error) {
      if (error.message.includes("ne peut être publiée sans source")) {
        return {
          error:
            "Impossible de publier : renseigne une source ou une source_url pour cette leçon avant de la publier.",
        };
      }
      return { error: error.message };
    }

    revalidatePath("/admin/lessons");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteLessonAction(lessonId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("lessons")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", lessonId);
  if (error) throw error;
  revalidatePath("/admin/lessons");
}

// ============================================================
// DOMAINES & COMPÉTENCES
// ============================================================

export async function createDomainAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(domainSchema, {
      curriculumId: formData.get("curriculumId"),
      name: formData.get("name"),
      order: formData.get("order"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data;

    const { error } = await supabase.from("domains").insert({
      curriculum_id: d.curriculumId,
      name: d.name,
      order: d.order,
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/competencies");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function createCompetencyAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = parseOrThrow(competencySchema, {
      domainId: formData.get("domainId"),
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      order: formData.get("order"),
    });
    if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
    const d = parsed.data;

    const { error } = await supabase.from("competencies").insert({
      domain_id: d.domainId,
      name: d.name,
      description: d.description,
      order: d.order,
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/competencies");
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteDomainAction(domainId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("domains").delete().eq("id", domainId);
  if (error) throw error;
  revalidatePath("/admin/competencies");
}

export async function deleteCompetencyAction(competencyId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("competencies").delete().eq("id", competencyId);
  if (error) throw error;
  revalidatePath("/admin/competencies");
}
