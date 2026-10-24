"use client";

import { useState, useActionState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { deleteAccountAction } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";

const CONFIRMATION_WORD = "SUPPRIMER";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [state, formAction] = useActionState(deleteAccountAction, null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-danger-foreground transition-colors hover:bg-danger/90"
      >
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        Supprimer définitivement mon compte
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="delete-account-title" className="font-display text-base font-semibold text-foreground">
                Êtes-vous absolument sûr ?
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Cette action supprimera définitivement votre compte, votre progression et vos
              programmes. Elle est irréversible.
            </p>

            <form action={formAction} className="mt-4 space-y-3">
              <div>
                <label htmlFor="confirmation" className="mb-1.5 block text-sm font-medium text-foreground">
                  Écrivez <span className="font-mono font-semibold">{CONFIRMATION_WORD}</span> pour confirmer
                </label>
                <input
                  id="confirmation"
                  name="confirmation"
                  autoComplete="off"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-danger"
                />
              </div>

              {state?.error && (
                <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
                  {state.error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Annuler
                </button>
                <div className="flex-1">
                  <SubmitButton variant="danger" disabled={confirmation !== CONFIRMATION_WORD}>
                    Supprimer définitivement
                  </SubmitButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
