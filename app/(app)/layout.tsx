import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../(auth)/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { ActivityHeartbeat } from "@/components/activity-heartbeat";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { getMyNotifications, getMyUnreadNotificationCount } from "@/lib/services/notificationService";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  const currentSchool = await getCurrentSchool();
  const [initialNotifications, initialUnreadCount] = await Promise.all([
    getMyNotifications(),
    getMyUnreadNotificationCount(),
  ]);

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-clip">
      <ActivityHeartbeat />
      <AppSidebar logoutAction={logoutAction} schoolName={currentSchool?.schoolName} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppTopBar
          firstName={profile?.first_name ?? ""}
          logoutAction={logoutAction}
          initialNotifications={initialNotifications}
          initialUnreadCount={initialUnreadCount}
          isTeacher={currentSchool?.role === "teacher"}
        />
        <main className="mx-auto w-full max-w-[1280px] min-w-0 flex-1 px-3 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-3 sm:px-4 md:px-5 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
