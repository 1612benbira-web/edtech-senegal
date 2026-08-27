/**
 * Retourne la date du jour au format YYYY-MM-DD dans le fuseau horaire
 * donné. Utilisé pour que le quiz quotidien se génère selon le fuseau de
 * l'élève (Africa/Dakar par défaut), pas selon UTC brut.
 */
export function getTodayInTimezone(timezone: string = "Africa/Dakar"): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // en-CA produit directement YYYY-MM-DD
}
/**
 * Renvoie "Bonjour" ou "Bonsoir" selon l'heure actuelle dans le fuseau
 * donné (Africa/Dakar par défaut) — pas selon l'heure locale de l'appareil
 * du visiteur, pour rester cohérent quel que soit l'endroit depuis lequel
 * le site est consulté. Bascule à 18h : avant, "Bonjour" ; à partir de
 * 18h (et jusqu'à 4h inclus), "Bonsoir".
 */
export function getTimeBasedGreeting(timezone: string = "Africa/Dakar"): "Bonjour" | "Bonsoir" {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
  return hour >= 5 && hour < 18 ? "Bonjour" : "Bonsoir";
}