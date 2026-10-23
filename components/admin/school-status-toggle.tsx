"use client";

import { useActionState, useRef } from "react";
import { updateSchoolStatusAction } from "@/app/admin/schools/actions";

export function SchoolStatusToggle({
  schoolId,
  currentStatus,
}: {
  schoolId: string;
  currentStatus: "active" | "inactive";
}) {
  const [state, formAction] = useActionState(updateSchoolStatusAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const nextStatus = currentStatus === "active" ? "inactive" : "active";

  return (
    <div>
      <form ref={formRef} action={formAction} className="inline-flex">
        <input type="hidden" name="schoolId" value={schoolId} />
        <input type="hidden" name="status" value={nextStatus} />
        <button
          type="submit"
          onClick={(e) => {
            const message =
              nextStatus === "inactive"
                ? "Désactiver cette école ? Ses élèves n'auront plus accès à leurs programmes."
                : "Réactiver cette école ?";
            if (!confirm(message)) e.preventDefault();
          }}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          {nextStatus === "inactive" ? "Désactiver l'école" : "Réactiver l'école"}
        </button>
      </form>
      {state?.error && <p className="mt-1 text-xs text-danger">{state.error}</p>}
    </div>
  );
}
