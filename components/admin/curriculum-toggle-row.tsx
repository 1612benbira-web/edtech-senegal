"use client";

import { useActionState, useRef, useTransition } from "react";
import { toggleSchoolCurriculumAction } from "@/app/admin/schools/actions";
import { AdminItemRow } from "@/components/admin/admin-item-row";

export function CurriculumToggleRow({
  schoolId,
  curriculumId,
  title,
  subtitle,
  enabled,
}: {
  schoolId: string;
  curriculumId: string;
  title: string;
  subtitle: string;
  enabled: boolean;
}) {
  const [state, formAction] = useActionState(toggleSchoolCurriculumAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <form ref={formRef} action={(fd) => startTransition(() => formAction(fd))}>
        <input type="hidden" name="schoolId" value={schoolId} />
        <input type="hidden" name="curriculumId" value={curriculumId} />
        <input type="hidden" name="enabled" value={(!enabled).toString()} />
        <AdminItemRow
          title={title}
          subtitle={subtitle}
          highlighted={enabled}
          actions={
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
              <input
                type="checkbox"
                checked={enabled}
                disabled={isPending}
                onChange={() => formRef.current?.requestSubmit()}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              {enabled ? "Activé" : "Désactivé"}
            </label>
          }
        />
      </form>
      {state?.error && <p className="mt-1 text-xs text-danger">{state.error}</p>}
    </div>
  );
}
