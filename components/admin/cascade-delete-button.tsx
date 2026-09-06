"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, X } from "lucide-react";

const IMPACT_LABELS: Record<string, string> = {
  domains: "domaine(s)",
  competencies: "compétence(s)",
  chapters: "chapitre(s)",
  lessons: "leçon(s)",
  exercises: "exercice(s)",
  questions: "question(s)",
  questionOptions: "option(s) de réponse",
  schoolsUsingIt: "école(s) l'ont activé",
  curriculums: "programme(s)",
  series: "série(s)",
  levelSubjects: "matière(s) associée(s)",
  studentsAffected: "élève(s) devront resélectionner leur niveau",
};

/**
 * Bouton de suppression destructive avec aperçu de l'impact réel avant
 * confirmation (Phase 22 — "supprimer un programme/niveau complet").
 * Contrairement à DeleteButton (confirm() du navigateur, sans détail),
 * celui-ci appelle d'abord une Server Action de LECTURE SEULE pour
 * afficher les compteurs exacts ("Cette action supprimera également :
 * X chapitres, X leçons..."), puis n'exécute la suppression réelle
 * qu'après une confirmation explicite en tapant le mot de passage.
 */
export function CascadeDeleteButton({
  getImpactAction,
  deleteAction,
  id,
  label,
  itemName,
}: {
  getImpactAction: (id: string) => Promise<{ data?: Record<string, number>; error?: string }>;
  deleteAction: (id: string) => Promise<{ error?: string; success?: boolean } | void | null>;
  id: string;
  label: string;
  itemName: string;
}) {
  const [step, setStep] = useState<"closed" | "loading" | "confirm" | "deleting">("closed");
  const [impact, setImpact] = useState<Record<string, number> | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const CONFIRMATION_WORD = "SUPPRIMER";

  function open() {
    setError(null);
    setStep("loading");
    startTransition(async () => {
      const result = await getImpactAction(id);
      if (result.error) {
        setError(result.error);
        setStep("closed");
        return;
      }
      setImpact(result.data ?? {});
      setStep("confirm");
    });
  }

  function close() {
    setStep("closed");
    setConfirmation("");
    setImpact(null);
  }

  function confirmDelete() {
    setStep("deleting");
    startTransition(async () => {
      const result = await deleteAction(id);
      if (result && typeof result === "object" && result.error) {
        setError(result.error);
        setStep("confirm");
        return;
      }
      close();
    });
  }

  const impactEntries = Object.entries(impact ?? {}).filter(([, count]) => count > 0);

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={step === "loading"}
        onClick={open}
        className="text-xs text-danger hover:underline disabled:opacity-50"
      >
        {step === "loading" ? "Analyse..." : label}
      </button>
      {error && step === "closed" && (
        <p className="max-w-[220px] text-right text-[11px] leading-snug text-danger">{error}</p>
      )}

      {(step === "confirm" || step === "deleting") && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cascade-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="cascade-delete-title" className="flex items-center gap-2 font-display text-base font-semibold text-danger">
                <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                Suppression définitive
              </h2>
              <button type="button" onClick={close} aria-label="Fermer" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm text-foreground">
              Vous êtes sur le point de supprimer : <span className="font-semibold">{itemName}</span>
            </p>

            {impactEntries.length > 0 ? (
              <div className="mt-3 rounded-lg bg-muted p-3">
                <p className="text-xs font-semibold text-muted-foreground">Cette action supprimera également :</p>
                <ul className="mt-1.5 space-y-0.5 text-sm text-foreground">
                  {impactEntries.map(([key, count]) => (
                    <li key={key}>
                      • {count} {IMPACT_LABELS[key] ?? key}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Aucun contenu dépendant trouvé.</p>
            )}

            <p className="mt-3 text-sm font-semibold text-danger">Cette action est irréversible.</p>

            <div className="mt-4">
              <label htmlFor="cascade-confirmation" className="mb-1.5 block text-sm font-medium text-foreground">
                Écrivez <span className="font-mono font-semibold">{CONFIRMATION_WORD}</span> pour confirmer
              </label>
              <input
                id="cascade-confirmation"
                autoComplete="off"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-danger"
              />
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button type="button" onClick={close} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
                Annuler
              </button>
              <button
                type="button"
                disabled={confirmation !== CONFIRMATION_WORD || step === "deleting"}
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-danger-foreground transition-colors hover:bg-danger/90 disabled:opacity-50"
              >
                {step === "deleting" ? "Suppression..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
