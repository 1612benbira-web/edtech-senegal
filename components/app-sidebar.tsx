"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Target, TrendingUp, Settings, User, LogOut, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "@/components/brand-logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/programme", label: "Mon programme", icon: BookOpen },
  { href: "/quiz", label: "Quiz", icon: Target },
  { href: "/progress", label: "Ma progression", icon: TrendingUp },
];

const SECONDARY_ITEMS = [
  { href: "/programme", label: "Révision", icon: RefreshCcw },
  { href: "/settings", label: "Paramètres", icon: Settings },
  { href: "/profile", label: "Profil", icon: User },
];

export function AppSidebar({ logoutAction }: { logoutAction: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex">
      <div className="px-6 pb-5 pt-7">
        <BrandLogo />
      </div>

      <nav className="flex-1 space-y-1.5 px-4 pt-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium transition-all duration-200",
                active
                  ? "bg-[#064c35] text-white shadow-[0_10px_25px_-14px_rgba(4,76,53,.9)]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-slate-500 group-hover:text-slate-800")} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-6 my-4 border-t border-slate-200" />

      <div className="space-y-1.5 px-4 pb-5">
        {SECONDARY_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium transition",
                active ? "bg-emerald-50 text-[#064c35]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
        <form action={logoutAction}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[14px] font-medium text-red-500 transition hover:bg-red-50">
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            Déconnexion
          </button>
        </form>
      </div>

      <div className="mx-5 mb-5 rounded-3xl bg-[#063f2d] p-5 text-white shadow-[0_18px_45px_-25px_rgba(4,76,53,.9)]">
        <div className="mb-3 text-2xl">🎓</div>
        <p className="font-display text-sm font-bold">Reste régulier !</p>
        <p className="mt-1 text-xs leading-5 text-white/70">Chaque jour compte. Tu es plus proche de tes objectifs que tu ne le penses.</p>
      </div>
    </aside>
  );
}
