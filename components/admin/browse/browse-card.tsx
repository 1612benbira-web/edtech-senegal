import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, { label: string; variant: "success" | "warning" | "muted" }> = {
  published: { label: "Publié", variant: "success" },
  validated: { label: "Validé", variant: "success" },
  review: { label: "En relecture", variant: "warning" },
  draft: { label: "Brouillon", variant: "warning" },
  archived: { label: "Archivé", variant: "muted" },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_LABELS[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

/**
 * Carte de navigation générique (Cycle/Niveau/Matière/Programme/
 * Chapitre/Leçon/Exercice) : icône, titre, sous-titre optionnel,
 * compteurs, badge de statut optionnel. Purement cliquable vers `href`
 * — aucune action de modification ici (point 10 : voir ≠ modifier).
 */
export function BrowseCard({
  href,
  icon,
  title,
  subtitle,
  status,
  counters,
}: {
  href: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string | null;
  status?: string;
  counters?: { label: string; value: number }[];
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:bg-muted"
    >
      {icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-foreground">{title}</p>
          {status && <StatusBadge status={status} />}
        </div>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        {counters && counters.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-muted-foreground">
            {counters.map((c) => (
              <span key={c.label}>
                {c.value} {c.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
    </Link>
  );
}

export function BrowseGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function BrowseEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
