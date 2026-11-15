/**
 * Règles de l'épreuve blanche (mode BFEM). Fonctions pures, sans accès à la
 * base, pour pouvoir être testées et réutilisées côté serveur comme côté
 * client (le chronomètre utilise les mêmes calculs que le serveur).
 */

/** Nombre de questions d'une épreuve : avec 20 questions, 1 question = 1 point sur 20. */
export const EXAM_QUESTION_COUNT = 20;

/** Temps accordé par question (90 s), soit 30 minutes pour 20 questions. */
export const EXAM_SECONDS_PER_QUESTION = 90;

/**
 * Types de questions proposés en épreuve : ceux que l'écran d'épreuve sait
 * afficher. "matching" et "ordering" en sont exclus dès le tirage, sinon ils
 * compteraient dans la note sans que l'élève puisse y répondre.
 */
export const EXAM_QUESTION_TYPES = [
  "single_choice",
  "true_false",
  "multiple_choice",
  "numeric",
  "short_answer",
] as const;

export function isExamQuestionType(type: string): boolean {
  return (EXAM_QUESTION_TYPES as readonly string[]).includes(type);
}

/**
 * Le mode BFEM s'adresse à la classe de 3e (classe d'examen du cycle moyen).
 * On accepte le code ou le nom du niveau ("3e", "3ème", "3eme", "3 e").
 */
export function isBfemLevel(
  level: { code?: string | null; name?: string | null } | null | undefined
): boolean {
  if (!level) return false;
  return [level.code, level.name].some((value) => {
    if (!value) return false;
    const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
    return /^3(e|è|eme|ème)$/.test(normalized);
  });
}

export interface ExamCandidate {
  id: string;
  chapterId: string | null;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const current = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = current;
  }
  return copy;
}

/**
 * Tire `count` questions en couvrant le programme : on prend une question
 * par chapitre à tour de rôle (chapitres et questions mélangés), plutôt
 * qu'un tirage simple qui pourrait concentrer l'épreuve sur les chapitres
 * qui ont le plus de questions.
 */
export function pickBalancedQuestions(
  candidates: ExamCandidate[],
  count: number,
  random: () => number = Math.random
): string[] {
  const byChapter = new Map<string, string[]>();
  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    const key = candidate.chapterId ?? "";
    const group = byChapter.get(key);
    if (group) group.push(candidate.id);
    else byChapter.set(key, [candidate.id]);
  }

  const groups = shuffle(
    Array.from(byChapter.values()).map((ids) => shuffle(ids, random)),
    random
  );

  const selected: string[] = [];
  let round = 0;
  while (selected.length < count) {
    let addedThisRound = false;
    for (const group of groups) {
      const id = group[round];
      if (id === undefined) continue;
      selected.push(id);
      addedThisRound = true;
      if (selected.length === count) break;
    }
    if (!addedThisRound) break;
    round += 1;
  }
  return selected;
}

export function examDurationSeconds(totalQuestions: number): number {
  return Math.max(0, totalQuestions) * EXAM_SECONDS_PER_QUESTION;
}

/** Secondes restantes avant la fin de l'épreuve (0 si le temps est écoulé). */
export function examRemainingSeconds(
  startedAt: string | Date,
  totalQuestions: number,
  now: Date = new Date()
): number {
  const startMs = new Date(startedAt).getTime();
  if (Number.isNaN(startMs)) return 0;
  const endMs = startMs + examDurationSeconds(totalQuestions) * 1000;
  return Math.max(0, Math.ceil((endMs - now.getTime()) / 1000));
}

/** Note sur 20, arrondie au demi-point. */
export function examNote(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, correctAnswers / totalQuestions));
  return Math.round(ratio * 40) / 2;
}

/** "12,5" plutôt que "12.5" : écriture française de la note. */
export function formatNote(note: number): string {
  return Number.isInteger(note) ? String(note) : note.toFixed(1).replace(".", ",");
}

export function examAppreciation(note: number): string {
  if (note >= 16) return "Très bien";
  if (note >= 14) return "Bien";
  if (note >= 12) return "Assez bien";
  if (note >= 10) return "Passable";
  return "À renforcer";
}

/** Moyenne simple de plusieurs notes, arrondie au demi-point (null si aucune note). */
export function averageNote(notes: number[]): number | null {
  if (notes.length === 0) return null;
  const sum = notes.reduce((total, note) => total + note, 0);
  return Math.round((sum / notes.length) * 2) / 2;
}

export interface ChapterResult {
  chapterId: string | null;
  chapterTitle: string;
  correct: number;
  total: number;
  percent: number;
}

/** Résultats regroupés par chapitre, du moins réussi au mieux réussi. */
export function summarizeByChapter(
  items: { chapterId: string | null; chapterTitle: string; isCorrect: boolean }[]
): ChapterResult[] {
  const byChapter = new Map<string, ChapterResult>();
  for (const item of items) {
    const key = item.chapterId ?? "";
    const entry = byChapter.get(key) ?? {
      chapterId: item.chapterId,
      chapterTitle: item.chapterTitle,
      correct: 0,
      total: 0,
      percent: 0,
    };
    entry.total += 1;
    if (item.isCorrect) entry.correct += 1;
    byChapter.set(key, entry);
  }
  return Array.from(byChapter.values())
    .map((entry) => ({ ...entry, percent: Math.round((entry.correct / entry.total) * 100) }))
    .sort((a, b) => a.percent - b.percent || b.total - a.total);
}

/** "29:05" pour le chronomètre. */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
