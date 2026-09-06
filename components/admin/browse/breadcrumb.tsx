import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";

export type Crumb = { label: string; href?: string };

/**
 * Fil d'Ariane + bouton retour, partagés par toutes les pages de
 * navigation pédagogique (points 7-9). `crumbs` va du niveau le plus
 * haut (ex: "Bibliothèque") au niveau courant (sans href, non cliquable).
 */
export function BrowseBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const previous = [...crumbs].reverse().find((c) => c.href);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {previous && (
        <Link
          href={previous.href!}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Retour
        </Link>
      )}
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {crumbs.map((crumb, index) => (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
            {crumb.href ? (
              <Link href={crumb.href} className="font-medium hover:text-foreground hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
