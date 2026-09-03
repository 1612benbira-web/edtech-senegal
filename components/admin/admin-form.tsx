"use client";

import { useFormState } from "react-dom";
import type { ActionState } from "@/app/admin/curriculum-actions";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

interface Field {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "select" | "checkbox" | "hidden" | "textarea";
  options?: { value: string; label: string }[];
  placeholder?: string;
  optional?: boolean;
  defaultValue?: string;
  rows?: number;
  helpText?: string;
}

export function AdminForm({
  action,
  fields,
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Field[];
  submitLabel: string;
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border bg-background p-4">
      {state?.error && (
        <div role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {state.message || "Ajouté avec succès."}
        </div>
      )}

      {fields.map((field) =>
        field.type === "hidden" ? (
          <input
            key={field.name}
            type="hidden"
            name={field.name}
            value={field.defaultValue}
          />
        ) : (
        <div key={field.name}>
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.type === "select" ? (
            <select
              id={field.name}
              name={field.name}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              required={!field.optional}
            >
              <option value="">Sélectionner...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              id={field.name}
              name={field.name}
              rows={field.rows ?? 8}
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              required={!field.optional}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <Input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              error={state?.fieldErrors?.[field.name]}
              required={field.type !== "checkbox" && !field.optional}
            />
          )}
          {field.helpText && (
            <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{field.helpText}</p>
          )}
          <FieldError id={`${field.name}-error`} message={state?.fieldErrors?.[field.name]} />
        </div>
        )
      )}

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
