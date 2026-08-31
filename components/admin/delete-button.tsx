"use client";

import { useState, useTransition } from "react";

type DeleteActionResult = void | null | { error?: string; success?: boolean };

export function DeleteButton({
  action,
  id,
  confirmMessage = "Supprimer cet élément ?",
}: {
  action: (id: string) => Promise<DeleteActionResult>;
  id: string;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (!confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(id);
        // Certaines actions renvoient { error } au lieu de lever une
        // exception (ex: niveaux/programmes avec contenu dépendant) —
        // dans les deux cas, l'erreur doit être visible pour l'admin.
        if (result && typeof result === "object" && result.error) {
          setError(result.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Suppression impossible.");
      }
    });
  };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className="text-xs text-danger hover:underline disabled:opacity-50"
      >
        {isPending ? "Suppression..." : "Supprimer"}
      </button>
      {error && (
        <p className="max-w-[220px] text-right text-[11px] leading-snug text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
