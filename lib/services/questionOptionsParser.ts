export interface ParsedOption {
  label: string;
  is_correct: boolean;
  match_key: string | null;
  order: number | null;
}

/**
 * Convertit le texte libre saisi par l'admin en lignes prêtes pour
 * `question_options`, selon le type de question. Format attendu par type,
 * affiché aussi comme texte d'aide dans le formulaire admin :
 *
 * - single_choice / multiple_choice : une option par ligne, préfixer
 *   d'une étoile (*) les bonnes réponses.
 *     *Une moitié
 *     Un tiers
 *     Un quart
 *
 * - true_false : une seule ligne, "vrai" ou "faux".
 *
 * - numeric : une seule ligne, la valeur numérique correcte (ex: 0.5).
 *
 * - short_answer : une réponse acceptée par ligne (insensible à la casse
 *   à la correction).
 *
 * - matching : une paire par ligne au format "gauche => droite".
 *
 * - ordering : les éléments un par ligne, dans le bon ordre.
 */
export function parseAnswerData(type: string, raw: string): ParsedOption[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  switch (type) {
    case "single_choice":
    case "multiple_choice":
      return lines.map((line) => {
        const isCorrect = line.startsWith("*");
        return {
          label: isCorrect ? line.slice(1).trim() : line,
          is_correct: isCorrect,
          match_key: null,
          order: null,
        };
      });

    case "true_false": {
      const value = lines[0]?.toLowerCase();
      const isTrue = value === "vrai" || value === "true";
      return [
        { label: "Vrai", is_correct: isTrue, match_key: null, order: null },
        { label: "Faux", is_correct: !isTrue, match_key: null, order: null },
      ];
    }

    case "numeric":
      return [{ label: lines[0] ?? "", is_correct: true, match_key: null, order: null }];

    case "short_answer":
      return lines.map((line) => ({
        label: line,
        is_correct: true,
        match_key: null,
        order: null,
      }));

    case "matching":
      return lines.map((line, i) => {
        const [left, right] = line.split("=>").map((s) => s.trim());
        return { label: left ?? "", is_correct: false, match_key: right ?? "", order: i };
      });

    case "ordering":
      return lines.map((line, i) => ({
        label: line,
        is_correct: false,
        match_key: null,
        order: i + 1,
      }));

    default:
      return [];
  }
}
