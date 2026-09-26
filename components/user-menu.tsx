"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, BookOpen, Settings, LogOut, ChevronDown, GraduationCap } from "lucide-react";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

export function UserMenu({
  firstName,
  logoutAction,
  isTeacher,
}: {
  firstName: string;
  logoutAction: () => void;
  // Phase 25 : un compte enseignant reste par ailleurs un compte élève
  // normal (profiles.role ne change pas) — seul son rattachement
  // school_members porte role='teacher'. On ajoute juste un accès
  // supplémentaire vers /teacher, sans transformer le menu existant.
  isTeacher?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClickOutside(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 rounded-full pl-1 pr-1.5 transition hover:bg-slate-100">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#064c35] text-xs font-bold text-white shadow-sm">{initials(firstName) || "?"}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-[13px] font-bold text-slate-900">{firstName || "Élève"}</span>
          <span className="block text-[11px] text-slate-500">Élève</span>
        </span>
        <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition sm:block ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <div className="border-b border-slate-100 px-3 py-2.5"><p className="truncate text-sm font-bold text-slate-900">{firstName || "Élève"}</p><p className="text-xs text-slate-500">Compte élève</p></div>
          <Link href="/profile" onClick={() => setOpen(false)} role="menuitem" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><User className="h-4 w-4" />Mon profil</Link>
          <Link href="/programme" onClick={() => setOpen(false)} role="menuitem" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><BookOpen className="h-4 w-4" />Mon programme</Link>
          <Link href="/settings" onClick={() => setOpen(false)} role="menuitem" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Settings className="h-4 w-4" />Paramètres</Link>
          {isTeacher && (
            <Link href="/teacher" onClick={() => setOpen(false)} role="menuitem" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><GraduationCap className="h-4 w-4" />Espace enseignant</Link>
          )}
          <div className="my-1 border-t border-slate-100" />
          <form action={logoutAction}><button type="submit" role="menuitem" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"><LogOut className="h-4 w-4" />Se déconnecter</button></form>
        </div>
      )}
    </div>
  );
}
