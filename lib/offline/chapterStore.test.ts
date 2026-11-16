import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getChapter,
  isOfflineChapter,
  isOfflineStorageAvailable,
  listChapters,
  removeChapter,
  saveChapter,
  type OfflineChapter,
} from "./chapterStore";

/** Faux stockage « Cache » du navigateur, en mémoire. */
function fakeCaches() {
  const stores = new Map<string, Map<string, string>>();
  return {
    open: async (name: string) => {
      const store = stores.get(name) ?? new Map<string, string>();
      stores.set(name, store);
      return {
        put: async (key: string, response: Response) => void store.set(key, await response.text()),
        match: async (key: string | { url: string }) => {
          const body = store.get(typeof key === "string" ? key : key.url);
          return body === undefined ? undefined : new Response(body);
        },
        keys: async () => Array.from(store.keys()).map((url) => ({ url })),
        delete: async (key: string) => store.delete(key),
      };
    },
    raw: stores,
  };
}

const chapter = (overrides: Partial<OfflineChapter> = {}): OfflineChapter => ({
  id: "ch1",
  title: "Théorème de Thalès",
  subjectId: "maths",
  subjectName: "Mathématiques",
  curriculumTitle: "Maths 3e",
  savedAt: "2026-11-16T07:00:00.000Z",
  lessons: [
    { id: "l1", title: "Énoncé", order: 1, contentMd: "# Thalès\n\n$\\frac{AM}{AB}$", objectives: ["Énoncer"], summary: null },
  ],
  ...overrides,
});

describe("chapterStore", () => {
  let caches: ReturnType<typeof fakeCaches>;

  beforeEach(() => {
    caches = fakeCaches();
    vi.stubGlobal("caches", caches);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("garde un chapitre et le relit à l'identique", async () => {
    await saveChapter(chapter());
    expect(await getChapter("ch1")).toEqual(chapter());
    expect(await getChapter("inconnu")).toBeNull();
  });

  it("remplace un chapitre déjà téléchargé au lieu de le dupliquer", async () => {
    await saveChapter(chapter());
    await saveChapter(chapter({ title: "Thalès (mis à jour)" }));
    const all = await listChapters();
    expect(all).toHaveLength(1);
    expect(all[0]?.title).toBe("Thalès (mis à jour)");
  });

  it("liste les chapitres par matière puis par titre", async () => {
    await saveChapter(chapter({ id: "c", subjectName: "SVT", title: "La cellule" }));
    await saveChapter(chapter({ id: "b", subjectName: "Mathématiques", title: "Racines carrées" }));
    await saveChapter(chapter({ id: "a", subjectName: "Mathématiques", title: "Calcul littéral" }));
    expect((await listChapters()).map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("supprime un chapitre", async () => {
    await saveChapter(chapter());
    await removeChapter("ch1");
    expect(await listChapters()).toEqual([]);
  });

  it("ignore une entrée abîmée ou d'une forme inattendue", async () => {
    await saveChapter(chapter());
    const store = Array.from(caches.raw.values())[0]!;
    store.set("/__hors-ligne/chapitre/casse", "pas du JSON");
    store.set("/__hors-ligne/chapitre/autre", JSON.stringify({ id: "x" }));
    expect((await listChapters()).map((c) => c.id)).toEqual(["ch1"]);
    expect(await getChapter("casse")).toBeNull();
  });

  it("ne plante pas quand le navigateur n'a pas de stockage hors connexion", async () => {
    vi.unstubAllGlobals();
    expect(isOfflineStorageAvailable()).toBe(false);
    expect(await listChapters()).toEqual([]);
    expect(await getChapter("ch1")).toBeNull();
    await expect(removeChapter("ch1")).resolves.toBeUndefined();
  });
});

describe("isOfflineChapter", () => {
  it("accepte un chapitre complet", () => {
    expect(isOfflineChapter(chapter())).toBe(true);
    expect(isOfflineChapter(chapter({ curriculumTitle: null, lessons: [] }))).toBe(true);
  });

  it("refuse les formes incomplètes", () => {
    expect(isOfflineChapter(null)).toBe(false);
    expect(isOfflineChapter({ ...chapter(), lessons: [{ id: "l1" }] })).toBe(false);
    expect(isOfflineChapter({ ...chapter(), savedAt: 123 })).toBe(false);
    const { subjectName: _removed, ...withoutSubject } = chapter();
    expect(isOfflineChapter(withoutSubject)).toBe(false);
  });
});
