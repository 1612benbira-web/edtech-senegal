"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeft, BookOpen, ChevronRight, Trash2, WifiOff } from "lucide-react";
import { LessonContent } from "@/components/lesson/lesson-content";
import { listChapters, removeChapter, type OfflineChapter } from "@/lib/offline/chapterStore";

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

function subscribeToConnection(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function useIsOnline() {
  return useSyncExternalStore(
    subscribeToConnection,
    () => navigator.onLine,
    () => true
  );
}

export function OfflineReader() {
  const isOnline = useIsOnline();
  const [chapters, setChapters] = useState<OfflineChapter[] | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listChapters()
      .then((list) => !cancelled && setChapters(list))
      .catch(() => !cancelled && setChapters([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const chapter = chapters?.find((c) => c.id === chapterId) ?? null;
  const lessonIndex = chapter ? chapter.lessons.findIndex((l) => l.id === lessonId) : -1;
  const lesson = chapter && lessonIndex >= 0 ? chapter.lessons[lessonIndex] ?? null : null;

  function open(nextChapterId: string | null, nextLessonId: string | null) {
    setChapterId(nextChapterId);
    setLessonId(nextLessonId);
    setConfirmDelete(null);
    window.scrollTo({ top: 0 });
  }

  async function remove(id: string) {
    await removeChapter(id).catch(() => undefined);
    setChapters((current) => (current ?? []).filter((c) => c.id !== id));
    setConfirmDelete(null);
  }

  return (
    <div>
      <header className="mb-6">
        {!isOnline && (
          <p
            role="status"
            className="mb-4 flex items-start gap-2 rounded-xl bg-warning/15 p-4 text-sm text-foreground"
          >
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Tu n&apos;es pas connecté à Internet. Tu peux lire ici les leçons que tu as téléchargées ; les
            exercices et les quiz reviendront avec la connexion.
          </p>
        )}
        <h1 className="text-xl font-bold text-foreground">Leçons téléchargées</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Les chapitres gardés sur cet appareil, lisibles sans connexion.
        </p>
        {/* Lien classique (rechargement complet) : il fonctionne dès que la connexion revient. */}
        <a href="/dashboard" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
          {isOnline ? "Revenir à l'application" : "Réessayer d'ouvrir l'application"}
        </a>
      </header>

      {chapters === null ? (
        <p className="text-sm text-muted-foreground" role="status">
          Lecture des téléchargements…
        </p>
      ) : lesson && chapter ? (
        <article>
          <button
            type="button"
            onClick={() => open(chapter.id, null)}
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {chapter.title}
          </button>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {chapter.subjectName} · Leçon {lessonIndex + 1} / {chapter.lessons.length}
          </p>
          <h2 className="mb-6 mt-1 text-2xl font-bold text-foreground">{lesson.title}</h2>

          {lesson.objectives.length > 0 && (
            <section className="mb-6 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Objectifs</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {lesson.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </section>
          )}

          <LessonContent contentMd={lesson.contentMd} />

          {lesson.summary && (
            <section className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">À retenir</h3>
              <p className="text-sm leading-6 text-foreground">{lesson.summary}</p>
            </section>
          )}

          <nav aria-label="Leçons du chapitre" className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={lessonIndex === 0}
              onClick={() => open(chapter.id, chapter.lessons[lessonIndex - 1]?.id ?? null)}
              className="min-h-11 rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Leçon précédente
            </button>
            <button
              type="button"
              disabled={lessonIndex === chapter.lessons.length - 1}
              onClick={() => open(chapter.id, chapter.lessons[lessonIndex + 1]?.id ?? null)}
              className="min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Leçon suivante
            </button>
          </nav>
        </article>
      ) : chapter ? (
        <section>
          <button
            type="button"
            onClick={() => open(null, null)}
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Tous les téléchargements
          </button>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{chapter.subjectName}</p>
          <h2 className="mb-4 mt-1 text-2xl font-bold text-foreground">{chapter.title}</h2>
          {chapter.lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ce chapitre ne contient pas encore de leçon.</p>
          ) : (
            <ul className="space-y-2">
              {chapter.lessons.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => open(chapter.id, item.id)}
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition hover:bg-muted"
                  >
                    <span className="min-w-0">
                      <span className="mr-2 font-mono text-xs text-muted-foreground">{index + 1}.</span>
                      <span className="font-medium text-foreground">{item.title}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : chapters.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            Aucun chapitre téléchargé sur cet appareil
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Quand tu es connecté, ouvre un chapitre dans « Mon programme » et choisis « Télécharger pour lire
            sans connexion ». Ses leçons apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {chapters.map((item) => (
            <li key={item.id} className="rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => open(item.id, null)}
                className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-primary">
                    {item.subjectName}
                  </span>
                  <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.lessons.length} leçon{item.lessons.length > 1 ? "s" : ""} · téléchargé le{" "}
                    {DATE_FORMAT.format(new Date(item.savedAt))}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
              <div className="border-t border-border px-4 py-2 text-xs">
                {confirmDelete === item.id ? (
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="text-foreground">Supprimer ce chapitre de l&apos;appareil ?</span>
                    <button type="button" onClick={() => remove(item.id)} className="font-medium text-danger hover:underline">
                      Oui, supprimer
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(null)} className="text-muted-foreground hover:underline">
                      Annuler
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(item.id)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-danger hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Supprimer de cet appareil
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
