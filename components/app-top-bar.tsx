import { Bell } from "lucide-react";
import { GlobalSearch } from "@/components/search/global-search";
import { UserMenu } from "@/components/user-menu";
import { BrandLogo } from "@/components/brand-logo";

export function AppTopBar({ firstName, logoutAction }: { firstName: string; logoutAction: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl md:justify-end md:border-b-0 md:bg-transparent md:px-8 md:pb-2 md:pt-5">
      <div className="md:hidden"><BrandLogo compact /></div>
      <div className="flex items-center gap-2.5">
        <GlobalSearch />
        <button type="button" aria-label="Notifications" className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-[#064c35] sm:flex">
          <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <UserMenu firstName={firstName} logoutAction={logoutAction} />
      </div>
    </header>
  );
}
