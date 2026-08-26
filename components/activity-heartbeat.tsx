"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 60_000;

/**
 * Envoie un signal d'activité toutes les 60s tant que l'onglet est visible,
 * plus un signal immédiat au montage. N'affiche rien — composant invisible
 * monté une fois dans le layout élève.
 */
export function ActivityHeartbeat() {
  useEffect(() => {
    const send = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/heartbeat", { method: "POST", keepalive: true }).catch(() => {
        // Silencieux : un heartbeat manqué n'est pas critique.
      });
    };

    send();
    const interval = setInterval(send, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", send);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", send);
    };
  }, []);

  return null;
}
