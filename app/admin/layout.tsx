import { redirect } from "next/navigation";
import { requireAnyAdminAccess, NotAdminError } from "@/lib/services/adminGuard";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Filet de sécurité en plus du middleware (qui vérifie déjà le rôle admin).
  // Autorise désormais deux profils : le super_admin (rôle 'admin', accès
  // global) et le school_admin (accès limité à sa propre école — la
  // restriction fine par page/action est faite par requireSchoolAccess()
  // et par la RLS, cf. migration 0018).
  let access;
  try {
    access = await requireAnyAdminAccess();
  } catch (e) {
    if (e instanceof NotAdminError) redirect("/dashboard");
    throw e;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar
        role={access.role}
        schoolId={access.role === "school_admin" ? access.schoolId : undefined}
      />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
