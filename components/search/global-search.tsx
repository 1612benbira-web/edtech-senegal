"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, BookText, GraduationCap, Loader2, Search, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Result = {
  id: string;
  type: "programme" | "matiere" | "chapitre" | "lecon";
  title: string;
  subtitle?: string | null;
  href: string;
};

const TYPE_LABELS: Record<Result["type"], string> = {
  programme: "Programmes",
  matiere: "Matières",
  chapitre: "Chapitres",
  lecon: "Leçons",
};

const TYPE_ICONS = {
  programme: GraduationCap,
  matiere: BookOpen,
  chapitre: BookText,
  lecon: BookText,
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("search");
        const data = await response.json();
        setResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([]);
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const grouped = results.reduce<Record<string, Result[]>>((acc, result) => {
    (acc[result.type] ??= []).push(result);
    return acc;
  }, {});

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Rechercher"
        className="group hidden h-10 w-64 items-center gap-2.5 rounded-xl border border-border/80 bg-card/80 px-3 text-left text-sm text-muted-foreground shadow-sm backdrop-blur transition hover:border-primary/30 hover:bg-card hover:text-foreground md:flex"
      >
        <Search className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" aria-hidden="true" />
        <span className="flex-1">Rechercher dans tes cours...</span>
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Rechercher"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-muted-foreground shadow-sm backdrop-blur transition hover:border-primary/30 hover:text-foreground md:hidden"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 p-3 pt-[8vh] backdrop-blur-md sm:p-6"
          onMouseDown={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Recherche globale"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-background shadow-2xl ring-1 ring-black/5"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border bg-card/80 px-4">
              <Search className="h-5 w-5 text-primary" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Matière, chapitre, leçon, programme..."
                className="min-w-0 flex-1 bg-transparent py-4 text-sm font-medium outline-none placeholder:text-muted-foreground"
                aria-label="Rechercher"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Recherche en cours" />}
              <button type="button" onClick={() => { setQuery(""); setOpen(false); }} aria-label="Fermer la recherche" className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto p-2">
              {query.trim().length < 2 ? (
                <div className="px-4 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">Recherche dans ton espace d’apprentissage</p>
                  <p className="mt-1 text-xs text-muted-foreground">Tape au moins 2 caractères pour trouver une matière, un chapitre ou une leçon.</p>
                </div>
              ) : error ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm font-semibold text-foreground">La recherche n’a pas pu aboutir.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Réessaie dans un instant.</p>
                </div>
              ) : !loading && results.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm font-semibold text-foreground">Aucun résultat</p>
                  <p className="mt-1 text-xs text-muted-foreground">Aucun contenu publié ne correspond à « {query.trim()} ».</p>
                </div>
              ) : (
                Object.entries(TYPE_LABELS).map(([type, label]) => {
                  const items = grouped[type] ?? [];
                  if (!items.length) return null;
                  const Icon = TYPE_ICONS[type as Result["type"]];
                  return (
                    <section key={type} className="mb-2 last:mb-0">
                      <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                      {items.map((result) => (
                        <Link
                          key={`${result.type}-${result.id}`}
                          href={result.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10") }>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-foreground">{result.title}</span>
                            {result.subtitle && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{result.subtitle}</span>}
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                        </Link>
                      ))}
                    </section>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
