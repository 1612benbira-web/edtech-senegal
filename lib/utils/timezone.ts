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
