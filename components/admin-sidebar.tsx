"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  GitBranch,
  BookMarked,
  ClipboardList,
  FileText,
  HelpCircle,
  Target,
  Users,
  BarChart3,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/app/(auth)/actions";

const NAV_SECTIONS = [
  {
    label: "Vue d'ensemble",
    items: [{ href: "/admin", label: "Tableau de bord", icon: LayoutDashboard }],
  },
  {
    label: "Contenu pédagogique",
    items: [
      { href: "/admin/levels", label: "Cycles & niveaux", icon: Layers },
      { href: "/admin/series", label: "Séries", icon: GitBranch },
      { href: "/admin/subjects", label: "Matières", icon: BookMarked },
      { href: "/admin/curriculums", label: "Programmes", icon: ClipboardList },
      { href: "/admin/competencies", label: "Domaines & compétences", icon: Target },
      { href: "/admin/chapters", label: "Chapitres", icon: FileText },
      { href: "/admin/lessons", label: "Leçons", icon: FileText },
      { href: "/admin/questions", label: "Questions", icon: HelpCircle },
    ],
  },
  {
    label: "Élèves & statistiques",
    items: [
      { href: "/admin/students", label: "Élèves", icon: Users },
      { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
    ],
  },
  {
    label: "Configuration",
    items: [{ href: "/admin/daily-quiz-config", label: "Config. quiz du jour", icon: Target }],
  },
];

function NavContent({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <>
      <p className="mb-4 px-2 font-display text-sm font-semibold text-foreground">Administration</p>
      <nav className="space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <Link
        href="/dashboard"
        className="mt-6 flex items-center gap-1.5 px-2 text-xs text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour à l'application
      </Link>
      <form action={logoutAction} className="mt-1">
        <button
          type="submit"
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-danger hover:underline"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          Déconnexion
        </button>
      </form>
    </>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <p className="font-display text-sm font-semibold text-foreground">Administration</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-b border-border bg-muted/40 p-4 md:hidden">
          <NavContent pathname={pathname} onNavigate={() => setOpen(false)} />
        </div>
      )}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-muted/40 p-4 md:block">
        <NavContent pathname={pathname} />
      </aside>
    </>
  );
}
