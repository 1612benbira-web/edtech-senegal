import type { Metadata } from "next";
import { OfflineReader } from "./offline-reader";

export const metadata: Metadata = { title: "Leçons téléchargées" };

/**
 * Lecteur hors connexion. Cette page ne lit rien sur le serveur : tout son
 * contenu vient des chapitres téléchargés sur l'appareil. Elle est donc
 * publique (voir lib/supabase/middleware.ts) et mise en cache à l'avance par
 * le service worker, qui l'affiche quand une page ne peut pas être chargée
 * faute de connexion (voir app/sw.ts).
 */
export default function OfflinePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
      <OfflineReader />
    </main>
  );
}
