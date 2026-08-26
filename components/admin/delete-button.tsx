"use client";

import { useTransition } from "react";

export function DeleteButton({
  action,
  id,
  confirmMessage = "Supprimer cet élément ?",
}: {
  action: (id: string) => Promise<void>;
  id: string;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => action(id));
        }
      }}
      className="text-xs text-danger hover:underline disabled:opacity-50"
    >
      {isPending ? "..." : "Supprimer"}
    </button>
  );
}
