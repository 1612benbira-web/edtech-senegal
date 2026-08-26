import { describe, it, expect, vi, afterEach } from "vitest";
import { getPresence } from "./presence";

describe("getPresence", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("considère l'élève hors ligne s'il ne s'est jamais connecté", () => {
    expect(getPresence(null)).toEqual({ status: "offline", label: "Jamais connecté" });
  });

  it("considère l'élève en ligne si le dernier heartbeat date de moins de 2 minutes", () => {
    const now = new Date("2026-08-24T10:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const oneMinuteAgo = new Date(now.getTime() - 60_000).toISOString();
    const presence = getPresence(oneMinuteAgo);
    expect(presence.status).toBe("online");
    expect(presence.label).toBe("En ligne");
  });

  it("considère l'élève hors ligne au-delà du seuil, avec un délai relatif", () => {
    const now = new Date("2026-08-24T10:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const tenMinutesAgo = new Date(now.getTime() - 10 * 60_000).toISOString();
    const presence = getPresence(tenMinutesAgo);
    expect(presence.status).toBe("offline");
    expect(presence.label).toBe("Actif il y a 10 min");
  });

  it("formate correctement un délai en heures", () => {
    const now = new Date("2026-08-24T10:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60_000).toISOString();
    expect(getPresence(threeHoursAgo).label).toBe("Actif il y a 3 h");
  });

  it("indique 'hier' pour un jour d'écart", () => {
    const now = new Date("2026-08-24T10:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const yesterday = new Date(now.getTime() - 25 * 60 * 60_000).toISOString();
    expect(getPresence(yesterday).label).toBe("Actif hier");
  });
});
