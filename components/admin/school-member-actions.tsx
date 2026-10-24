"use client";

import { useTransition, useActionState } from "react";
import { updateSchoolMemberStatusAction, removeSchoolMemberAction } from "@/app/admin/schools/actions";

export function SchoolMemberActions({
  schoolId,
  schoolMemberId,
  currentStatus,
}: {
  schoolId: string;
  schoolMemberId: string;
  currentStatus: "active" | "inactive";
}) {
  const [state, formAction] = useActionState(updateSchoolMemberStatusAction, null);
  const [isPending, startTransition] = useTransition();
  const nextStatus = currentStatus === "active" ? "inactive" : "active";

  return (
    <div className="flex items-center gap-3 text-xs">
      <form action={formAction}>
        <input type="hidden" name="schoolId" value={schoolId} />
        <input type="hidden" name="schoolMemberId" value={schoolMemberId} />
        <input type="hidden" name="status" value={nextStatus} />
        <button type="submit" className="text-primary hover:underline">
          {nextStatus === "inactive" ? "Suspendre" : "Réactiver"}
        </button>
      </form>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Retirer ce membre de l'école ? Son compte n'est pas supprimé.")) {
            startTransition(() => removeSchoolMemberAction(schoolMemberId, schoolId));
          }
        }}
        className="text-danger hover:underline disabled:opacity-50"
      >
        {isPending ? "..." : "Retirer"}
      </button>
      {state?.error && <p className="text-danger">{state.error}</p>}
    </div>
  );
}
