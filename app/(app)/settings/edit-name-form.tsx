"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { Pencil, Check, X } from "lucide-react";
import { updateNameAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export function EditNameForm({
  firstName,
  lastName,
}: {
  firstName: string | null;
  lastName: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useFormState(updateNameAction, null);

  // Referme le formulaire automatiquement après un enregistrement réussi.
  useEffect(() => {
    if (state?.success) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <div>
        <dt className="text-xs text-muted-foreground">Nom</dt>
        <dd className="flex items-center gap-2 text-foreground">
          {firstName || lastName ? `${firstName ?? ""} ${lastName ?? ""}`.trim() : "Non renseigné"}
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Modifier mon nom"
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </dd>
      </div>
    );
  }

  return (
    <div className="sm:col-span-2">
      <dt className="mb-1.5 text-xs text-muted-foreground">Nom</dt>
      <form action={formAction} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" name="firstName" defaultValue={firstName ?? ""} autoFocus />
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" name="lastName" defaultValue={lastName ?? ""} />
          </div>
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        )}

        <div className="flex gap-2">
          <SubmitButton variant="primary" className="w-auto px-4">
            <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Enregistrer
          </SubmitButton>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}