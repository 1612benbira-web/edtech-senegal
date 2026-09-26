import { GlobalSearch } from "@/components/search/global-search";
import { UserMenu } from "@/components/user-menu";
import { BrandLogo } from "@/components/brand-logo";
import { NotificationBell } from "@/components/notification-bell";
import type { NotificationItem } from "@/lib/services/notificationService";

export function AppTopBar({
  firstName,
  logoutAction,
  initialNotifications,
  initialUnreadCount,
  isTeacher,
}: {
  firstName: string;
  logoutAction: () => void;
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
  isTeacher?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl lg:justify-end lg:border-b-0 lg:bg-transparent lg:px-8 lg:pb-2 lg:pt-5">
      <div className="min-w-0 lg:hidden"><BrandLogo compact /></div>
      <div className="flex items-center gap-2.5">
        <GlobalSearch />
        <NotificationBell initialNotifications={initialNotifications} initialUnreadCount={initialUnreadCount} />
        <UserMenu firstName={firstName} logoutAction={logoutAction} isTeacher={isTeacher} />
      </div>
    </header>
  );
}
