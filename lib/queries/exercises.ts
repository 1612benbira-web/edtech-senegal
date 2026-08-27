import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

// ============================================================
// ADMIN
// ============================================================

export async function getExercisesForLesson(lessonId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("lesson_id", lessonId)
    .is("deleted_at", null)
    .order("created_at");
  if (error) throw error;
  return data;
}

/**
 * Lecture admin uniquement — utilise service_role car `is_correct` n'est
 * plus lisible via le client de session depuis la migration 0011
 * (durcissement colonne). Cette fonction ne doit jamais être appelée
 * depuis un contexte élève ; le rôle admin est déjà vérifié par le layout
 * `/admin` avant que cette page ne soit atteinte.
 */
export async function getQuestionsForExercise(exerciseId: string) {
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

// ============================================================
// ÉLÈVE
// ============================================================

export async function getPublishedExercisesForLesson(lessonId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("lesson_id", lessonId)
    .eq("status", "published")
    .is("deleted_at", null);
  if (error) throw error;
  return data;
}

/**
 * Questions + options pour l'élève, SANS le champ is_correct.
 *
 * Note de sécurité : la policy RLS `question_options_select` (migration 0009)
 * autorise la lecture de toutes les colonnes des options d'une question
 * publiée, y compris `is_correct`, dès lors que la ligne est visible.
 * Cette fonction ne sélectionne délibérément pas cette colonne pour éviter
 * de l'exposer côté client. Un utilisateur techniquement averti pourrait
 * néanmoins interroger l'API Supabase directement avec la clé anonyme et
 * récupérer `is_correct` — un durcissement (colonne cachée via une vue
 * dédiée, ou RPC de correction côté serveur uniquement) est recommandé
 * avant une mise en production réelle. La correction elle-même (fonction
 * `gradeExerciseAction`) s'effectue côté serveur avec une requête séparée
 * qui, elle, lit `is_correct`.
 */
export async function getPublishedQuestionsForExercise(exerciseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, type, prompt, points, question_options(id, label, order, match_key)")
    .eq("exercise_id", exerciseId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at");
  if (error) throw error;
  return data;
}
