import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import { getSchoolById } from "@/lib/queries/school";
import { getSchoolMembers } from "@/lib/services/schoolService";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { SchoolMemberActions } from "@/components/admin/school-member-actions";

const ROLE_LABELS: Record<string, string> = {
  student: "Élève",
  teacher: "Enseignant",
  school_admin: "Administrateur d'école",
};

export default async function SchoolMembersPage({ params }: { params: { id: string } }) {
  await requireSchoolAccess(params.id);

  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const members = await getSchoolMembers(params.id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Users}
        title={`Membres — ${school.name}`}
        description="Élèves, enseignants et administrateurs rattachés à cette école."
      />

      <Link
        href={`/admin/schools/${school.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour à l&apos;école
      </Link>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Nom</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Rôle</th>
              <th className="px-3 py-2 font-medium">Statut</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member: any) => (
              <tr key={member.id} className="border-t border-border">
                <td className="px-3 py-2 text-foreground">
                  {member.profiles?.first_name} {member.profiles?.last_name}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{member.profiles?.email}</td>
                <td className="px-3 py-2 text-muted-foreground">{ROLE_LABELS[member.role] ?? member.role}</td>
                <td className="px-3 py-2">
                  <Badge variant={member.status === "active" ? "success" : "muted"}>
                    {member.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <SchoolMemberActions
                    schoolId={school.id}
                    schoolMemberId={member.id}
                    currentStatus={member.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Aucun membre pour le moment. Les élèves rejoignent cette école en indiquant son code
            établissement (<span className="font-mono">{school.code}</span>) à l&apos;inscription.
          </p>
        )}
      </div>
    </div>
  );
}
