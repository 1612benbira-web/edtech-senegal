/**
 * Formatage de l'affichage niveau/série pour les élèves (ex. "2°S", "1°L",
 * "Tle S", "6e"). Purement cosmétique : ne modifie jamais les valeurs
 * stockées en base (school_levels.name, school_series.name), qui restent
 * les identifiants utilisés partout ailleurs dans le code (filtres,
 * comparaisons, etc.) — uniquement une couche d'affichage.
 */

function seriesLetterFromName(seriesName?: string | null): string | null {
  if (!seriesName) return null;
  const normalized = seriesName.trim().toLowerCase();
  if (normalized.includes("expériment") || normalized.includes("experiment")) return "S";
  if (normalized.includes("sociales")) return "L";
  return null;
}

/**
 * Libellé complet du niveau, avec série si applicable.
 * Collège : "6e", "5e", "4e", "3e" (inchangé, pas de série).
 * Lycée : "2°S", "2°L", "1°S", "1°L", "Tle S", "Tle L" (ou juste "2°"/"1°"/
 * "Tle" si la série n'est pas encore renseignée).
 */
export function formatNiveauLabel(
  levelName: string | null | undefined,
  seriesName?: string | null
): string {
  if (!levelName) return "";
  const normalized = levelName.trim().toLowerCase();

  let prefix: string | null = null;
  if (normalized === "seconde") prefix = "2°";
  else if (normalized === "premiere" || normalized === "première") prefix = "1°";
  else if (normalized === "terminale") prefix = "Tle";

  if (prefix === null) {
    // Collège : pas de série, le nom brut ("6e", "5e"...) convient déjà.
    return levelName;
  }

  const seriesLetter = seriesLetterFromName(seriesName);
  if (!seriesLetter) return prefix;
  return prefix === "Tle" ? `Tle ${seriesLetter}` : `${prefix}${seriesLetter}`;
}

/**
 * Version courte pour un badge compact (ex. le rond "NIVEAU" du dashboard) :
 * juste le chiffre/lettre, sans le "°" ni "Tle" en toutes lettres.
 * "6e" → "6", Seconde S2 → "2S", Terminale L2 → "TL".
 */
export function formatNiveauBadge(
  levelName: string | null | undefined,
  seriesName?: string | null
): string {
  if (!levelName) return "—";

  const digitMatch = levelName.match(/\d+/)?.[0];
  if (digitMatch) return digitMatch; // Collège : 6e, 5e, 4e, 3e

  const normalized = levelName.trim().toLowerCase();
  let prefix: string | null = null;
  if (normalized === "seconde") prefix = "2";
  else if (normalized === "premiere" || normalized === "première") prefix = "1";
  else if (normalized === "terminale") prefix = "T";

  if (!prefix) return "—";
  const seriesLetter = seriesLetterFromName(seriesName);
  return seriesLetter ? `${prefix}${seriesLetter}` : prefix;
}
