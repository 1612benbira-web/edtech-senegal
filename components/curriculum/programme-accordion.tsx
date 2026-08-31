"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProgrammeSubject, LessonStatus } from "@/lib/queries/programme";
import { getSubjectTheme } from "@/lib/constants/subject-theme";

const LESSON_BUTTON_LABEL: Record<LessonStatus, string> = {
  not_started: "Commencer",
  in_progress: "Continuer",
  completed: "Revoir",
};

function LessonStatusIcon({ status }: { status: LessonStatus }) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />;
  if (status === "in_progress") return <PlayCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />;
  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />;
}

function ChapterAccordion({ chapter }: { chapter: ProgrammeSubject["chapters"][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border first:border-t-0">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">{chapter.title}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{chapter.completedLessons}/{chapter.totalLessons} leçons terminées · {chapter.percent}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={chapter.percent === 100 && chapter.totalLessons > 0 ? "success" : chapter.percent > 0 ? "primary" : "muted"}>{chapter.percent}%</Badge>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </div>
      </button>
      {open && (
        <ul className="space-y-1 px-4 pb-4">
          {chapter.lessons.map((lesson) => (
            <li key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-sm hover:bg-muted/40">
              <span className="flex min-w-0 items-center gap-2.5">
                <LessonStatusIcon status={lesson.status} />
                <span className={lesson.status === "completed" ? "truncate text-muted-foreground line-through" : "truncate text-foreground"}>{lesson.title}</span>
              </span>
              <Link href={`/lesson/${lesson.id}`} className="shrink-0 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {LESSON_BUTTON_LABEL[lesson.status]} →
              </Link>
            </li>
          ))}
          {chapter.lessons.length === 0 && <li className="px-2 py-2 text-xs text-muted-foreground">Aucune leçon publiée pour ce chapitre.</li>}
        </ul>
      )}
    </div>
  );
}

export function ProgrammeAccordion({ programmes }: { programmes: ProgrammeSubject[] }) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(programmes.find((p) => p.curriculumId)?.subjectId ?? null);

  return (
    <div className="space-y-4">
      {programmes.map((subject) => {
        const isOpen = expandedSubject === subject.subjectId;
        const theme = getSubjectTheme(subject.subjectName, subject.subjectIcon);
        return (
          <div key={subject.subjectId} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <button type="button" onClick={() => setExpandedSubject(isOpen ? null : subject.subjectId)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${theme.soft} ${theme.icon}`} aria-hidden="true">
                  <theme.Icon className={`h-5 w-5 ${theme.accent}`} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold text-foreground">{subject.subjectName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{subject.totalChapters} chapitre{subject.totalChapters > 1 ? "s" : ""} · {subject.totalLessons} leçon{subject.totalLessons > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge variant={subject.percent === 100 && subject.totalLessons > 0 ? "success" : subject.percent > 0 ? "primary" : "muted"}>{subject.percent}%</Badge>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-border">
                {subject.chapters.length === 0 ? <p className="p-5 text-sm text-muted-foreground">Aucun chapitre publié pour l&apos;instant dans cette matière.</p> : subject.chapters.map((chapter) => <ChapterAccordion key={chapter.id} chapter={chapter} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
