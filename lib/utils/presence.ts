const ONLINE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes sans heartbeat = plus "en ligne"

export type PresenceStatus = "online" | "offline";

export interface Presence {
  status: PresenceStatus;
  label: string;
}

/**
 * Calcule un statut de présence honnête à partir de `last_seen_at`
 * (alimenté par le heartbeat client, voir /api/heartbeat), plutôt qu'un
 * simple booléen `is_online` qui ne serait jamais remis à jour à la
 * fermeture de l'onglet.
 */
export function getPresence(lastSeenAt: string | null): Presence {
  if (!lastSeenAt) {
    return { status: "offline", label: "Jamais connecté" };
  }

  const lastSeen = new Date(lastSeenAt).getTime();
  const diffMs = Date.now() - lastSeen;

  if (diffMs <= ONLINE_THRESHOLD_MS) {
    return { status: "online", label: "En ligne" };
  }

  return { status: "offline", label: `Actif ${formatRelative(diffMs)}` };
}

function formatRelative(diffMs: number): string {
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} j`;
  const months = Math.round(days / 30);
  return `il y a ${months} mois`;
}
