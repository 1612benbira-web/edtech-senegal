import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../(auth)/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { ActivityHeartbeat } from "@/components/activity-heartbeat";

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

  return (
    <div className="flex min-h-screen">
      <ActivityHeartbeat />
      <AppSidebar logoutAction={logoutAction} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppTopBar firstName={profile?.first_name ?? ""} logoutAction={logoutAction} />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-20 pt-3 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
