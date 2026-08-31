"use client";

import { useFormState } from "react-dom";
import { updateSchoolNameAction } from "@/app/admin/schools/actions";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export function SchoolNameForm({ schoolId, currentName }: { schoolId: string; currentName: string }) {
  const [state, formAction] = useFormState(updateSchoolNameAction, null);

  return (
    <form action={formAction} className="max-w-sm space-y-3 rounded-lg border border-border bg-background p-4">
      <input type="hidden" name="schoolId" value={schoolId} />
      <div>
        <Label htmlFor="name">Nom de l&apos;école</Label>
        <Input id="name" name="name" defaultValue={currentName} error={state?.fieldErrors?.name} />
        <FieldError id="name-error" message={state?.fieldErrors?.name} />
      </div>
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      {state?.success && <p className="text-xs text-success">Nom mis à jour.</p>}
      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
