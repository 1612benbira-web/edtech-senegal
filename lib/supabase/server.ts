import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types/database";

/**
 * Client Supabase pour Server Components / Route Handlers / Server Actions.
 * Utilise la session de l'utilisateur (cookies) — RLS s'applique normalement.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignoré si appelé depuis un Server Component (géré par le middleware)
          }
        },
      },
    }
  );
}

/**
 * Client "admin" avec la clé service_role.
 * À utiliser UNIQUEMENT dans des Server Actions / Route Handlers de confiance
 * (attribution d'XP, validation de contenu, calcul de mastery_score...).
 * Ne JAMAIS importer ce fichier depuis un composant client.
 */
export function createServiceRoleClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local — nécessaire pour les écritures serveur (progression, XP)."
    );
  }
  return createSupabaseJsClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
