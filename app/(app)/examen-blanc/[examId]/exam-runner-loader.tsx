"use client";

import dynamic from "next/dynamic";
import type { ExamRunnerProps } from "./exam-runner";

/**
 * L'écran d'épreuve n'est rendu que dans le navigateur : il lit dès son
 * premier rendu l'heure de l'appareil (chronomètre) et les réponses
 * sauvegardées sur l'appareil, deux choses que le serveur ne connaît pas.
 */
const ExamRunner = dynamic(() => import("./exam-runner").then((mod) => mod.ExamRunner), {
  ssr: false,
  loading: () => (
    <p className="text-sm text-muted-foreground" role="status">
      Préparation de ton épreuve…
    </p>
  ),
});

export function ExamRunnerLoader(props: ExamRunnerProps) {
  return <ExamRunner {...props} />;
}
