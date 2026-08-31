"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-3 rounded-full bg-danger/10 p-3 text-danger">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="font-display text-lg font-semibold text-foreground">
        Une erreur est survenue
      </h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Quelque chose s&apos;est mal passé de notre côté. Réessaie, et si le problème persiste,
        reviens un peu plus tard.
      </p>
      <div className="mt-4">
        <Button onClick={reset}>Réessayer</Button>
      </div>
    </div>
  );
}
