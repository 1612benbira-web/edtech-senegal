"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { markLessonCompletedAction } from "./actions";
import { Button } from "@/components/ui/button";

export function CompleteLessonButton({
  lessonId,
  alreadyCompleted,
}: {
  lessonId: string;
  alreadyCompleted: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (alreadyCompleted) {
    return (
      <div className="flex items-center justify-center gap-1.5 rounded-lg bg-success/10 px-4 py-2.5 text-center text-sm font-medium text-success">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Leçon terminée
      </div>
    );
  }

  return (
    <Button
      isLoading={isPending}
      onClick={() =>
        startTransition(async () => {
          await markLessonCompletedAction(lessonId);
          router.refresh();
        })
      }
    >
      Marquer comme terminé
    </Button>
  );
}
