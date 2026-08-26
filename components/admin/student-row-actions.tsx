"use client";

import { useFormState } from "react-dom";
import { LogOut } from "lucide-react";
import { forceLogoutStudentAction } from "@/app/admin/students/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import type { PresenceStatus } from "@/lib/utils/presence";

export function PresenceBadge({ status, label }: { status: PresenceStatus; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={`h-2 w-2 rounded-full ${status === "online" ? "bg-success" : "bg-muted-foreground/40"}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

export function StudentRowActions({ studentId }: { studentId: string }) {
  const [state, formAction] = useFormState(forceLogoutStudentAction, null);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <input type="hidden" name="studentId" value={studentId} />
        <SubmitButton variant="ghost" className="!w-auto px-2 py-1 text-xs text-danger hover:bg-danger/10">
          <LogOut className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Déconnecter
        </SubmitButton>
      </form>
      {state?.error && <Badge variant="danger">{state.error}</Badge>}
      {state?.success && <Badge variant="success">{state.success}</Badge>}
    </div>
  );
}
