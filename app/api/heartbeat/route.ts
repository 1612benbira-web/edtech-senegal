import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Signal d'activité léger envoyé périodiquement par le client pendant
 * qu'un élève utilise l'application. Alimente `profiles.last_seen_at`,
 * utilisé par l'administration pour afficher un statut "En ligne" /
 * "Actif il y a X minutes" fiable (voir section 9 du cahier des charges),
 * plutôt qu'un simple booléen `is_online` qui ne refléterait pas la
 * réalité de la session.
 *
 * Écrit uniquement sur SA PROPRE ligne (RLS "profiles_update_own"),
 * aucun droit élevé nécessaire.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
