import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

// ============================================================
// PROGRAMMES PROPRES À UNE ÉCOLE (curriculums.school_id renseigné)
// ============================================================

export async function getOwnedCurriculums(schoolId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculums")
    .select("*, school_levels(name), school_series(name), subjects(name)")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================================
// PROGRAMMES GLOBAUX PUBLIÉS — pour le picker "exercice privé sur
// leçon globale" (on ne montre que le contenu déjà publié : on ne
// peut pas accrocher un exercice à une leçon qui n'existe pas encore
// pour les élèves).
// ============================================================

export async function getPublishedGlobalCurriculums() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculums")
    .select("id, title, status, school_levels(name), subjects(name)")
    .is("school_id", null)
    .eq("status", "published")
    .order("title");
  if (error) throw error;
  return data;
}

// ============================================================
// Vérification de propriété — à quelle école appartient (le cas
// échéant) un exercice donné ? Utilise le client de SESSION (donc la
// RLS s'applique) : si l'exercice n'est pas visible pour l'utilisateur
// courant, la fonction renvoie null comme s'il n'existait pas.
// ============================================================

export async function getExerciseOwnerSchoolId(exerciseId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("school_id, lessons(chapters(curriculums(school_id)))")
    .eq("id", exerciseId)
    .maybeSingle();
  if (error || !data) return null;
  const chainSchoolId = (data as any).lessons?.chapters?.curriculums?.school_id ?? null;
  return (data as any).school_id ?? chainSchoolId;
}

/**
 * Questions + options (avec is_correct) pour un exercice, RÉSERVÉ à la
 * gestion d'un exercice appartenant réellement à `schoolId` (vérifié
 * avant l'appel service_role, qui lui contourne complètement la RLS —
 * voir getQuestionsForExercise dans lib/queries/exercises.ts pour le
 * même besoin côté super_admin). Sans cette vérification, un
 * school_admin pourrait forger l'URL avec l'id d'un exercice d'une
 * AUTRE école et en lire les bonnes réponses.
 */
export async function getQuestionsForExerciseScoped(exerciseId: string, schoolId: string) {
  const ownerSchoolId = await getExerciseOwnerSchoolId(exerciseId);
  if (ownerSchoolId !== schoolId) return [];

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*, question_options(*)")
    .eq("exercise_id", exerciseId)
    .is("deleted_at", null)
    .order("created_at");
  if (error) throw error;
  return data;
}
