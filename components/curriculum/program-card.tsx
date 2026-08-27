"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CirclePlay,
  BookOpen,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ProgrammeSubject } from "@/lib/queries/programme";
import { getSubjectTheme } from "@/lib/constants/subject-theme";

const STATUS_LABEL: Record<ProgrammeSubject["status"], string> = {
  not_started: "À commencer",
  in_progress: "En cours",
  completed: "Terminé",
};

const STATUS_VARIANT: Record<
  ProgrammeSubject["status"],
  "muted" | "primary" | "success"
> = {
  not_started: "muted",
  in_progress: "primary",
  completed: "success",
};

export function ProgramCard({
  program,
}: {
  program: ProgrammeSubject;
}) {
  const theme = getSubjectTheme(
    program.subjectName,
    program.subjectIcon
  );

  const hasContent = program.curriculumId !== null;

  /*
   * Si le programme est terminé, nextLessonId doit normalement
   * pointer vers la première leçon du chapitre suivant.
   *
   * Si aucun chapitre suivant n'existe, on renvoie vers
   * la page du programme pour permettre à l'élève de revoir.
   */
  const href = hasContent
    ? program.nextLessonId
      ? `/lesson/${program.nextLessonId}`
      : `/programme/${program.subjectId}`
    : "/programme";

  const isCompleted = program.status === "completed";
  const isInProgress = program.status === "in_progress";

  return (
    <article
      className="
        group relative overflow-hidden
        rounded-[24px]
        border border-slate-700/70
        bg-slate-900/70
        p-5
        shadow-[0_12px_35px_-25px_rgba(0,0,0,.7)]
        backdrop-blur-sm
        transition-all duration-300
        hover:-translate-y-1
        hover:border-slate-600
        hover:bg-slate-900
        hover:shadow-[0_20px_45px_-25px_rgba(0,0,0,.8)]
      "
    >
      {/* Légère lumière supérieure */}
      <div
        className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-gradient-to-r
          from-transparent
          via-emerald-400/50
          to-transparent
          opacity-0
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Icône matière */}
          <span
            className={`
              flex h-12 w-12 shrink-0
              items-center justify-center
              rounded-2xl
              ring-1
              ${theme.soft}
              ${theme.icon}
            `}
          >
            <theme.Icon
              className={`h-6 w-6 ${theme.accent}`}
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </span>

          {/* Informations */}
          <div className="min-w-0">
            <h3
              className="
                truncate
                text-[15px]
                font-bold
                text-white
              "
            >
              {program.subjectName}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {program.totalChapters} chapitre
              {program.totalChapters > 1 ? "s" : ""}
              {" · "}
              {program.totalLessons} leçon
              {program.totalLessons > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* STATUT */}
        <Badge variant={STATUS_VARIANT[program.status]}>
          {STATUS_LABEL[program.status]}
        </Badge>
      </div>

      {/* DESCRIPTION */}
      {program.description && (
        <p
          className="
            mt-4
            line-clamp-2
            text-xs
            leading-5
            text-slate-400
          "
        >
          {program.description}
        </p>
      )}

      {/* CONTENU */}
      {hasContent ? (
        <div className="mt-6">
          {/* PROGRESSION */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Progression
            </span>

            <span
              className={`
                font-bold
                ${
                  program.percent === 100
                    ? "text-emerald-400"
                    : "text-white"
                }
              `}
            >
              {program.percent}%
            </span>
          </div>

          {/* BARRE */}
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`
                h-full rounded-full
                transition-all duration-700
                ${
                  program.percent === 100
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : "bg-gradient-to-r from-blue-500 to-emerald-500"
                }
              `}
              style={{
                width: `${Math.min(
                  Math.max(program.percent, 0),
                  100
                )}%`,
              }}
            />
          </div>

          {/* FOOTER */}
          <div className="mt-4 flex items-center justify-between gap-3">
            {/* Nombre de leçons */}
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2
                className="h-3.5 w-3.5 text-emerald-400"
                aria-hidden="true"
              />

              {program.completedLessons}/{program.totalLessons}{" "}
              terminées
            </span>

            {/* ACTION */}
            <Link
              href={href}
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-xl
                border
                border-emerald-500/40
                bg-emerald-500/5
                px-3
                py-2
                text-xs
                font-bold
                text-emerald-400
                transition-all
                duration-200
                hover:border-emerald-400
                hover:bg-emerald-500/10
                hover:text-emerald-300
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500
                focus-visible:ring-offset-2
                focus-visible:ring-offset-slate-950
              "
            >
              {isCompleted ? "Revoir" : "Continuer"}

              <ArrowRight
                className="
                  h-3.5 w-3.5
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* MESSAGE FIN DE PROGRAMME */}
          {isCompleted && !program.nextLessonId && (
            <div
              className="
                mt-4
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-emerald-500/20
                bg-emerald-500/5
                px-3
                py-2.5
              "
            >
              <BookOpen
                className="h-4 w-4 shrink-0 text-emerald-400"
                aria-hidden="true"
              />

              <p className="text-xs text-emerald-300">
                Programme terminé. Tu peux revoir les chapitres.
              </p>
            </div>
          )}

          {/* MESSAGE EN COURS */}
          {isInProgress && program.nextLessonId && (
            <div className="mt-3 flex items-center gap-1.5">
              <CirclePlay
                className="h-3.5 w-3.5 text-blue-400"
                aria-hidden="true"
              />

              <span className="text-[11px] text-slate-500">
                Reprends là où tu t'es arrêté.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-slate-700
            bg-slate-800/40
            px-3
            py-3
          "
        >
          <p className="text-xs text-slate-400">
            Programme pas encore publié pour ton niveau.
          </p>
        </div>
      )}
    </article>
  );
}