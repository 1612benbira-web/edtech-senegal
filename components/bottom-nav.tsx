"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Target, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/programme", label: "Programme", icon: BookOpen },
  { href: "/quiz", label: "Quiz", icon: Target },
  { href: "/progress", label: "Progrès", icon: TrendingUp },
  { href: "/settings", label: "Réglages", icon: Settings },
];

/**
 * Remplace la sidebar sur mobile (section 11 du cahier des charges) par
 * une barre de navigation fixe en bas d'écran, pattern standard sur les
 * apps mobiles et bien plus accessible au pouce qu'un menu latéral.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center gap-0.5 px-1 py-2 text-[10px] sm:text-[11px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
