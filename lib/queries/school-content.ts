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

/**
 * Programmes nationaux publiés, restreints aux matières/niveaux que
 * `assignments` désigne (cf. requireTeacherAccess, migration 0025) —
 * utilisé par l'espace enseignant pour qu'un enseignant ne voie jamais
 * de matière qui ne lui a pas été confiée, même dans un simple sélecteur.
 * Le filtrage exact par série (quand series_id est renseigné côté
 * curriculum ET côté affectation) est fait ici en JS : Supabase ne
 * permet pas facilement un "in" sur des paires de colonnes.
 */
export async function getPublishedGlobalCurriculumsForAssignments(
  assignments: { subject_id: string; level_id: string; series_id: string | null }[]
) {
  if (assignments.length === 0) return [];
  const supabase = await createClient();
  const subjectIds = [...new Set(assignments.map((a) => a.subject_id))];
  const levelIds = [...new Set(assignments.map((a) => a.level_id))];

  const { data, error } = await supabase
    .from("curriculums")
    .select("id, title, status, level_id, series_id, subject_id, school_levels(name), subjects(name)")
    .is("school_id", null)
    .eq("status", "published")
    .in("subject_id", subjectIds)
    .in("level_id", levelIds)
    .order("title");
  if (error) throw error;

  return (data ?? []).filter((c) =>
    assignments.some(
      (a) =>
        a.subject_id === c.subject_id &&
        a.level_id === c.level_id &&
        // Affectation sans série (a.series_id null) = couvre toutes les
        // séries de ce niveau ; sinon la série doit correspondre.
        (a.series_id === null || a.series_id === c.series_id)
    )
  );
}

// ============================================================
// Vérification de propriété — curriculum / chapitre / leçon / exercice.
//
// Même principe que getExerciseOwnerSchoolId ci-dessous : utilise le
// client de SESSION (donc la RLS s'applique — cf. migration 0019,
// curriculum_manageable_by_current_user / curriculum_visible_to_current_user).
// Si la ressource n'est pas visible pour l'utilisateur courant (école
// différente, contenu privé d'une autre école), la fonction renvoie
// null comme si elle n'existait pas.
//
// La RLS reste la protection définitive contre l'insertion/modification
// d'un contenu appartenant à une autre école (WITH CHECK, migration
// 0019) : même sans cette vérification applicative, un school_admin ne
// pourrait pas créer un chapitre sous le curriculum_id d'une autre
// école, l'INSERT échouerait au niveau PostgreSQL. Ces helpers ajoutent
// une vérification EXPLICITE avant écriture pour deux raisons : (1) un
// message d'erreur clair plutôt qu'une erreur RLS brute renvoyée à
// l'UI, (2) une défense en profondeur si la policy RLS venait à changer
// par erreur dans une migration future.
// ============================================================

export async function getCurriculumOwnerSchoolId(curriculumId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculums")
    .select("school_id")
    .eq("id", curriculumId)
    .maybeSingle();
  if (error || !data) return null;
  return data.school_id ?? null;
}

export async function getChapterOwnerSchoolId(chapterId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("curriculums(school_id)")
    .eq("id", chapterId)
    .maybeSingle();
  if (error || !data) return null;
  return (data as any).curriculums?.school_id ?? null;
}

export async function getLessonOwnerSchoolId(lessonId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("chapters(curriculums(school_id))")
    .eq("id", lessonId)
    .maybeSingle();
  if (error || !data) return null;
  return (data as any).chapters?.curriculums?.school_id ?? null;
}

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
