"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Plus, X } from "lucide-react";
import { addSubjectsToProgrammeAction, type ProgrammeActionState } from "@/app/(app)/dashboard/learning-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { getSubjectTheme } from "@/lib/constants/subject-theme";

interface AvailableSubject {
  subject_id: string;
  is_optional: boolean;
  subjects: { id: string; name: string; icon: string | null } | null;
}

export function AddProgramModal({ availableSubjects }: { availableSubjects: AvailableSubject[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<ProgrammeActionState, FormData>(
    addSubjectsToProgrammeAction,
    null
  );

  if (availableSubjects.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Ajouter un programme
      </button>

      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-foreground">Programmes disponibles</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction} className="space-y-3">
              <fieldset className="space-y-2">
                <legend className="sr-only">Matières disponibles pour ton niveau</legend>
                {availableSubjects.map((item) => {
                  const theme = item.subjects
                    ? getSubjectTheme(item.subjects.name, item.subjects.icon)
                    : null;
                  return (
                    <label
                      key={item.subject_id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
                    >
                      <input type="checkbox" name="subjectIds" value={item.subject_id} className="h-4 w-4 accent-primary" />
                      {theme && (
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${theme.soft} ${theme.icon}`}>
                          <theme.Icon className={`h-3.5 w-3.5 ${theme.accent}`} aria-hidden="true" />
                        </span>
                      )}
                      <span>
                        {item.subjects?.name}
                        {item.is_optional ? <span className="text-muted-foreground"> (optionnelle)</span> : null}
                      </span>
                    </label>
                  );
                })}
              </fieldset>

              {state?.error && (
                <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
                  {state.error}
                </p>
              )}
              {state?.success && (
                <p role="status" className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
                  {state.success}
                </p>
              )}

              <SubmitButton>Ajouter les programmes sélectionnés</SubmitButton>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
