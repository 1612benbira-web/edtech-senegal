import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getTodayInTimezone } from "@/lib/utils/timezone";
import { getOrCreateDailyQuiz } from "@/lib/services/dailyQuizService";

/**
 * Centre de notifications — réutilise la table `notifications` existante
 * (migration 0008), à laquelle la migration 0021 a ajouté `link` et
 * `metadata`. Sert à la fois pour les rappels de quiz du jour et pour les
 * messages envoyés par un admin/school_admin (cf. messageService.ts).
 */

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function mapRow(row: {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link,
    isRead: row.read_at !== null,
    createdAt: row.created_at,
  };
}

/** Les N dernières notifications de l'utilisateur connecté (non connecté -> []). */
export async function getMyNotifications(limit = 20): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Nombre de notifications non lues de l'utilisateur connecté. */
export async function getMyUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
}

/**
 * Marque une notification comme lue. Scopée à `profile_id = auth.uid()`
 * (RLS `notifications_own`, 0009) : impossible de marquer comme lue une
 * notification d'un autre utilisateur même en falsifiant l'id côté client.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("profile_id", user.id)
    .is("read_at", null);
  if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", user.id)
    .is("read_at", null);
  if (error) throw error;
}

// ============================================================
// JOB PLANIFIÉ — rappels de quiz du jour non terminé
// ============================================================
//
// Appelé uniquement depuis app/api/cron/daily-quiz-notifications (route
// protégée par un secret serveur, jamais exposée côté client). Réutilise
// getOrCreateDailyQuiz() (lib/services/dailyQuizService.ts) — AUCUNE
// nouvelle logique de génération de quiz : on s'appuie entièrement sur
// le système existant, avec un client service_role pour agir sans
// session utilisateur.
//
// Règle anti-spam (idempotence) :
//   - 1 notification "QUIZ_DAILY_AVAILABLE" au plus par élève et par jour
//     (créée au premier passage du job qui le trouve éligible) ;
//   - 1 notification "QUIZ_DAILY_REMINDER" au plus par élève et par jour
//     (créée à un passage ultérieur, seulement si la 1ère a déjà été
//     envoyée) ;
//   - jamais plus de deux notifications au total pour le même
//     élève + même quiz du jour — garanti par l'index unique partiel
//     `uq_notifications_daily_quiz` (migration 0021) sur
//     (profile_id, type, metadata->>daily_quiz_id), combiné à un
//     `.upsert(..., { ignoreDuplicates: true })` ci-dessous.
//   - un élève qui a terminé son quiz n'est simplement plus sélectionné
//     par la requête (quiz_attempts.completed_at IS NOT NULL) : aucune
//     notification supplémentaire n'est générée pour lui après coup.

const STUDENT_BATCH_SIZE = 200;

/** Délai minimum entre la notification initiale et le rappel — évite
 * qu'un rappel parte quelques minutes après la première notification
 * si le job est relancé rapidement (ex : deux exécutions rapprochées
 * en environnement de test). */
const MIN_HOURS_BEFORE_REMINDER = 2;

export type QuizNotificationType = "QUIZ_DAILY_AVAILABLE" | "QUIZ_DAILY_REMINDER";

/**
 * Détermine, à partir des notifications de quiz déjà envoyées pour CE
 * quiz précis, quelle notification (s'il y en a une) doit être créée
 * maintenant. Logique pure (aucun accès réseau/DB) — testée directement
 * par lib/services/notificationService.test.ts.
 *
 * Règles (section 19 du cahier des charges + AC-01 à AC-03) :
 *   - aucune notification encore envoyée -> QUIZ_DAILY_AVAILABLE
 *   - QUIZ_DAILY_AVAILABLE déjà envoyée, depuis au moins
 *     MIN_HOURS_BEFORE_REMINDER heures -> QUIZ_DAILY_REMINDER
 *   - QUIZ_DAILY_AVAILABLE déjà envoyée mais trop récemment -> rien
 *   - les deux déjà envoyées -> rien (plafond de 2 notifications atteint)
 */
export function decideNextQuizNotificationType(
  existing: { type: string; created_at: string }[],
  now: Date
): QuizNotificationType | null {
  const available = existing.find((n) => n.type === "QUIZ_DAILY_AVAILABLE");
  const reminder = existing.find((n) => n.type === "QUIZ_DAILY_REMINDER");

  if (!available) return "QUIZ_DAILY_AVAILABLE";
  if (reminder) return null; // plafond de 2 notifications déjà atteint

  const hoursSinceAvailable = (now.getTime() - new Date(available.created_at).getTime()) / (1000 * 60 * 60);
  if (hoursSinceAvailable < MIN_HOURS_BEFORE_REMINDER) return null;

  return "QUIZ_DAILY_REMINDER";
}

export interface DailyQuizNotificationJobResult {
  studentsChecked: number;
  notificationsCreated: number;
  errors: number;
}

export async function runDailyQuizNotificationJob(): Promise<DailyQuizNotificationJobResult> {
  const admin = createServiceRoleClient();
  let studentsChecked = 0;
  let notificationsCreated = 0;
  let errors = 0;

  let from = 0;
  // Pagination par lots pour rester raisonnable même avec un grand
  // nombre d'élèves (évite de charger toute la table `profiles` d'un
  // coup, et laisse le job continuer même si un lot échoue).
  for (;;) {
    const { data: students, error } = await admin
      .from("profiles")
      .select("id, level_id, timezone")
      .eq("role", "student")
      .not("level_id", "is", null)
      .order("id")
      .range(from, from + STUDENT_BATCH_SIZE - 1);
    if (error) throw error;
    if (!students || students.length === 0) break;

    for (const student of students) {
      studentsChecked += 1;
      try {
        // Réutilise le système EXISTANT de quiz du jour (génère la
        // sélection de questions si elle n'existe pas encore pour
        // aujourd'hui, sinon renvoie le quiz déjà généré).
        const quizAttemptId = await getOrCreateDailyQuiz(student.id, admin);

        const { data: attempt } = await admin
          .from("quiz_attempts")
          .select("completed_at")
          .eq("id", quizAttemptId)
          .maybeSingle();
        if (attempt?.completed_at) continue; // déjà terminé : rien à faire

        const { data: dailyQuiz } = await admin
          .from("daily_quizzes")
          .select("id")
          .eq("profile_id", student.id)
          .eq("date", getTodayInTimezone(student.timezone ?? "Africa/Dakar"))
          .maybeSingle();
        if (!dailyQuiz) continue;

        const { data: existingForQuiz } = await admin
          .from("notifications")
          .select("type, created_at")
          .eq("profile_id", student.id)
          .in("type", ["QUIZ_DAILY_AVAILABLE", "QUIZ_DAILY_REMINDER"])
          .contains("metadata", { daily_quiz_id: dailyQuiz.id });

        const nextType = decideNextQuizNotificationType(existingForQuiz ?? [], new Date());
        if (!nextType) continue;

        const { error: insertError } = await admin.from("notifications").insert({
          profile_id: student.id,
          type: nextType,
          title:
            nextType === "QUIZ_DAILY_AVAILABLE"
              ? "Quiz du jour disponible"
              : "Quiz du jour non terminé",
          body:
            nextType === "QUIZ_DAILY_AVAILABLE"
              ? "Tu as un quiz du jour à faire."
              : "Tu n'as pas encore terminé ton quiz du jour. Il te reste un quiz à faire aujourd'hui.",
          link: `/quiz/${quizAttemptId}`,
          metadata: { daily_quiz_id: dailyQuiz.id },
        });
        if (insertError) {
          // 23505 = violation de l'index unique partiel -> une autre
          // exécution concurrente du job a déjà créé cette notification
          // exacte : ce n'est pas une erreur, l'idempotence a fonctionné.
          if (insertError.code !== "23505") throw insertError;
        } else {
          notificationsCreated += 1;
        }
      } catch (e) {
        errors += 1;
        console.error(`[daily-quiz-notifications] échec pour l'élève ${student.id}:`, e);
      }
    }

    if (students.length < STUDENT_BATCH_SIZE) break;
    from += STUDENT_BATCH_SIZE;
  }

  return { studentsChecked, notificationsCreated, errors };
}
