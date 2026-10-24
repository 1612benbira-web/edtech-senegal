"use client";

import { useActionState, useRef } from "react";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  review: "En révision",
  validated: "Validé",
  published: "Publié",
  archived: "Archivé",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-warning/15 text-warning-foreground",
  validated: "bg-info/10 text-info",
  published: "bg-success/10 text-success",
  archived: "bg-muted text-muted-foreground/70",
};

export function StatusSelector({
  action,
  idFieldName,
  id,
  currentStatus,
}: {
  action: (prevState: any, formData: FormData) => Promise<any>;
  idFieldName: string;
  id: string;
  currentStatus: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <form ref={formRef} action={formAction} className="inline-flex items-center gap-2">
        <input type="hidden" name={idFieldName} value={id} />
        <select
          name="status"
          defaultValue={currentStatus}
          onChange={() => formRef.current?.requestSubmit()}
          className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[currentStatus]}`}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </form>
      {state?.error && <p className="mt-1 text-xs text-danger">{state.error}</p>}
    </div>
  );
}
