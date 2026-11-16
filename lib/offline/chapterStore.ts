/**
 * Chapitres téléchargés pour être lus sans connexion.
 *
 * Le contenu des leçons d'un chapitre est gardé sur l'appareil, dans le
 * stockage « Cache » du navigateur (le même que celui du service worker,
 * mais dans un espace à part que Serwist ne nettoie pas). La page
 * /hors-ligne le relit sans aucun accès au réseau.
 *
 * Seul le cours est gardé : les exercices et les quiz sont corrigés par le
 * serveur (les bonnes réponses ne sont jamais envoyées à l'appareil), ils
 * demandent donc une connexion.
 */

export const OFFLINE_CHAPTERS_CACHE = "edtech-chapitres-hors-ligne-v1";

const KEY_PREFIX = "/__hors-ligne/chapitre/";

export interface OfflineLesson {
  id: string;
  title: string;
  order: number;
  contentMd: string;
  objectives: string[];
  summary: string | null;
}

export interface OfflineChapter {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  curriculumTitle: string | null;
  /** Date du téléchargement (ISO). */
  savedAt: string;
  lessons: OfflineLesson[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOfflineLesson(value: unknown): value is OfflineLesson {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.order === "number" &&
    typeof value.contentMd === "string" &&
    Array.isArray(value.objectives) &&
    value.objectives.every((objective) => typeof objective === "string") &&
    (value.summary === null || typeof value.summary === "string")
  );
}

/** Vérifie la forme d'un chapitre relu du stockage ou reçu du serveur. */
export function isOfflineChapter(value: unknown): value is OfflineChapter {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.subjectId === "string" &&
    typeof value.subjectName === "string" &&
    (value.curriculumTitle === null || typeof value.curriculumTitle === "string") &&
    typeof value.savedAt === "string" &&
    Array.isArray(value.lessons) &&
    value.lessons.every(isOfflineLesson)
  );
}

/** Le navigateur sait-il garder des chapitres ? (Faux sans HTTPS ou sur un très vieux navigateur.) */
export function isOfflineStorageAvailable(): boolean {
  return typeof caches !== "undefined";
}

function keyFor(chapterId: string) {
  return `${KEY_PREFIX}${encodeURIComponent(chapterId)}`;
}

export async function saveChapter(chapter: OfflineChapter): Promise<void> {
  const cache = await caches.open(OFFLINE_CHAPTERS_CACHE);
  await cache.put(
    keyFor(chapter.id),
    new Response(JSON.stringify(chapter), { headers: { "Content-Type": "application/json" } })
  );
}

export async function getChapter(chapterId: string): Promise<OfflineChapter | null> {
  if (!isOfflineStorageAvailable()) return null;
  const cache = await caches.open(OFFLINE_CHAPTERS_CACHE);
  const response = await cache.match(keyFor(chapterId));
  if (!response) return null;
  try {
    const value: unknown = await response.json();
    return isOfflineChapter(value) ? value : null;
  } catch {
    return null;
  }
}

/** Chapitres téléchargés, rangés par matière puis par titre. */
export async function listChapters(): Promise<OfflineChapter[]> {
  if (!isOfflineStorageAvailable()) return [];
  const cache = await caches.open(OFFLINE_CHAPTERS_CACHE);
  const requests = await cache.keys();
  const chapters: OfflineChapter[] = [];
  for (const request of requests) {
    const response = await cache.match(request);
    if (!response) continue;
    try {
      const value: unknown = await response.json();
      if (isOfflineChapter(value)) chapters.push(value);
    } catch {
      // Entrée illisible : on l'ignore.
    }
  }
  return chapters.sort(
    (a, b) => a.subjectName.localeCompare(b.subjectName, "fr") || a.title.localeCompare(b.title, "fr")
  );
}

export async function removeChapter(chapterId: string): Promise<void> {
  if (!isOfflineStorageAvailable()) return;
  const cache = await caches.open(OFFLINE_CHAPTERS_CACHE);
  await cache.delete(keyFor(chapterId));
}
