export type QuestionOptionForGrading = {
  id: string;
  label: string;
  is_correct: boolean;
  match_key: string | null;
  order: number | null;
};

export type GradableQuestionType =
  | "single_choice"
  | "true_false"
  | "multiple_choice"
  | "numeric"
  | "short_answer"
  | "matching"
  | "ordering";

/**
 * Corrige une réponse pour un type de question donné.
 *
 * IMPORTANT pour "matching" et "ordering" : `options` doit être trié par
 * `order` avant d'appeler cette fonction — voir le commentaire dans
 * lib/queries/exercises.ts sur pourquoi l'ordre doit être garanti côté
 * requête (les deux types associent une réponse à une option par POSITION
 * dans le tableau, pas par id).
 */
export function gradeQuestion(
  type: GradableQuestionType,
  options: QuestionOptionForGrading[],
  studentAnswer: string | string[] | undefined
): boolean {
  const correctOptions = options.filter((o) => o.is_correct);

  switch (type) {
    case "single_choice":
    case "true_false":
      return !!studentAnswer && correctOptions.some((o) => o.id === studentAnswer);

    case "multiple_choice": {
      const submitted = Array.isArray(studentAnswer) ? studentAnswer : [];
      const correctIds = correctOptions.map((o) => o.id).sort();
      const submittedSorted = [...submitted].sort();
      return (
        correctIds.length === submittedSorted.length &&
        correctIds.every((id, i) => id === submittedSorted[i])
      );
    }

    case "numeric": {
      const expected = parseFloat(correctOptions[0]?.label ?? "");
      const given = parseFloat(String(studentAnswer ?? "").replace(",", "."));
      return !isNaN(expected) && !isNaN(given) && Math.abs(expected - given) < 1e-6;
    }

    case "short_answer": {
      const given = String(studentAnswer ?? "").trim().toLowerCase();
      return correctOptions.some((o) => o.label.trim().toLowerCase() === given);
    }

    case "matching": {
      const submitted = Array.isArray(studentAnswer) ? studentAnswer : [];
      const expected = options.map((o) => o.match_key ?? "");
      return (
        expected.length === submitted.length &&
        expected.every(
          (value, index) => value.trim().toLowerCase() === String(submitted[index] ?? "").trim().toLowerCase()
        )
      );
    }

    case "ordering": {
      const submitted = Array.isArray(studentAnswer) ? studentAnswer : [];
      const expected = [...options].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((o) => o.id);
      return expected.length === submitted.length && expected.every((id, index) => id === submitted[index]);
    }

    default:
      return false;
  }
}
