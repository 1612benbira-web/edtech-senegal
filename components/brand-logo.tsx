import Link from "next/link";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="group inline-flex items-center gap-2.5" aria-label="EdTech Sénégal">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#063f2d] shadow-[0_8px_24px_-12px_rgba(4,76,53,.7)]">
        <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
          <path d="M8 35V18l8-5 8 5v17H8Z" fill="#16a56b" />
          <path d="M24 35V12l8-5 8 5v23H24Z" fill="#0b6b48" />
          <path d="M12 32h24M15 25h7M15 20h7M29 25h7M29 19h7" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" />
          <path d="m25 8 2-4 2 4 4 1-4 2-2 4-2-4-4-2 4-1Z" fill="#f5c542" />
          <path d="M5 39c10-5 20-5 38 0" fill="none" stroke="#f5c542" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[15px] font-bold tracking-tight text-foreground">EdTech Sénégal</span>
          <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Apprendre · Progresser · Réussir</span>
        </span>
      )}
    </Link>
  );
}
