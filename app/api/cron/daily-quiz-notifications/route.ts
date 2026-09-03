import { NextResponse, type NextRequest } from "next/server";
import { runDailyQuizNotificationJob } from "@/lib/services/notificationService";

/**
 * Job planifié : notifie les élèves ayant un quiz du jour non terminé.
 *
 * Compatible Vercel Cron (https://vercel.com/docs/cron-jobs) : Vercel
 * appelle cette route selon le planning défini dans vercel.json, en
 * ajoutant automatiquement un en-tête `Authorization: Bearer
 * $CRON_SECRET`. Peut aussi être déclenché manuellement (ex : autre
 * ordonnanceur, appel ponctuel) avec le même secret.
 *
 * Sécurité : CRON_SECRET est une variable d'environnement SERVEUR
 * uniquement (jamais NEXT_PUBLIC_*), jamais exposée au client. Sans ce
 * secret configuré, la route refuse toute exécution — elle ne s'exécute
 * jamais "en clair" par défaut.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET manquant : job de notifications désactivé par sécurité.");
    return NextResponse.json({ error: "Non configuré." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const result = await runDailyQuizNotificationJob();
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("[daily-quiz-notifications] échec du job:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
