"use client";

import { useState, useTransition } from "react";
import { removeTeacherAssignmentAction } from "@/app/admin/schools/[id]/teachers/actions";

export function TeacherAssignmentActions({
  schoolId,
  assignmentId,
}: {
  schoolId: string;
  assignmentId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Retirer cette affectation ? L'enseignant ne verra plus cette matière/niveau.")) return;
          setError(null);
          startTransition(async () => {
            try {
              await removeTeacherAssignmentAction(assignmentId, schoolId);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Suppression impossible.");
            }
          });
        }}
        className="text-xs text-danger hover:underline disabled:opacity-50"
      >
        {isPending ? "..." : "Retirer"}
      </button>
      {error && <p className="max-w-[220px] text-right text-[11px] leading-snug text-danger">{error}</p>}
    </div>
  );
}
