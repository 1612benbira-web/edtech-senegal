"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Trash2 } from "lucide-react";
import {
  getChapter,
  isOfflineChapter,
  isOfflineStorageAvailable,
  removeChapter,
  saveChapter,
} from "@/lib/offline/chapterStore";

type Status = "checking" | "absent" | "downloading" | "saved" | "unsupported";

/**
 * Télécharge les leçons d'un chapitre sur l'appareil pour les lire sans
 * connexion (page /hors-ligne). Les exercices et les quiz restent en ligne.
 */
export function DownloadChapterButton({ chapterId }: { chapterId: string }) {
  const [status, setStatus] = useState<Status>(() => (isOfflineStorageAvailable() ? "checking" : "unsupported"));
  const [lessonCount, setLessonCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOfflineStorageAvailable()) return;
    let cancelled = false;
    getChapter(chapterId)
      .then((saved) => {
        if (cancelled) return;
        setLessonCount(saved?.lessons.length ?? 0);
        setStatus(saved ? "saved" : "absent");
      })
      .catch(() => !cancelled && setStatus("absent"));
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  async function download() {
    setError(null);
    setStatus("downloading");
    try {
      const response = await fetch(`/api/offline/chapter/${chapterId}`, { cache: "no-store" });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok || !isOfflineChapter(data)) {
        const message =
          data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : "Le téléchargement a échoué. Réessaie.";
        throw new Error(message);
      }
      await saveChapter(data);
      setLessonCount(data.lessons.length);
      setStatus("saved");
    } catch (e) {
      setStatus("absent");
      setError(
        e instanceof TypeError
          ? "Pas de connexion : le téléchargement demande Internet."
          : e instanceof Error
            ? e.message
            : "Le téléchargement a échoué. Réessaie."
      );
    }
  }

  async function remove() {
    setError(null);
    try {
      await removeChapter(chapterId);
      setStatus("absent");
    } catch {
      setError("Le chapitre n'a pas pu être supprimé de cet appareil.");
    }
  }

  if (status === "checking" || status === "unsupported") {
    // Rien à proposer tant qu'on ne sait pas, ou si le navigateur ne le permet pas.
    return null;
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      {status === "saved" ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5 font-medium text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {lessonCount} leçon{lessonCount > 1 ? "s" : ""} disponible{lessonCount > 1 ? "s" : ""} sans connexion
          </span>
          <Link href="/hors-ligne" className="font-medium text-primary hover:underline">
            Voir mes téléchargements
          </Link>
          <button
            type="button"
            onClick={download}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            Mettre à jour
          </button>
          <button
            type="button"
            onClick={remove}
            className="flex items-center gap-1 text-muted-foreground hover:text-danger hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Supprimer de cet appareil
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={download}
            disabled={status === "downloading"}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {status === "downloading" ? "Téléchargement…" : "Télécharger pour lire sans connexion"}
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Les leçons de ce chapitre seront gardées sur cet appareil. Les exercices et les quiz demandent
            une connexion.
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
