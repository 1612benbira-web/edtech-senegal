import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, GraduationCap, ClipboardList } from "lucide-react";
import { getSchools } from "@/lib/queries/school";
import { requireAnyAdminAccess } from "@/lib/services/adminGuard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminForm } from "@/components/admin/admin-form";
import { createSchoolAction } from "./actions";
import { Badge } from "@/components/ui/badge";

export default async function SchoolsAdminPage() {
  const access = await requireAnyAdminAccess();
  if (access.role === "school_admin") {
    redirect(`/admin/schools/${access.schoolId}`);
  }

  const schools = await getSchools();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Building2}
        title={`Établissements (${schools.length})`}
        description="Chaque école active les programmes globaux qu'elle souhaite proposer à ses élèves — le contenu pédagogique reste partagé entre toutes les écoles, il n'est jamais dupliqué."
      />

      <AdminForm
        action={createSchoolAction}
        submitLabel="Ajouter une école"
        fields={[
          { name: "name", label: "Nom de l'école", placeholder: "École Moderne Dakar" },
          {
            name: "code",
            label: "Code établissement",
            placeholder: "EMD2026",
            helpText: "Ce code sera communiqué aux élèves pour se rattacher à l'école à l'inscription.",
          },
          {
            name: "slug",
            label: "Identifiant (slug)",
            optional: true,
            placeholder: "ecole-moderne-dakar",
            helpText: "Laisser vide pour le générer automatiquement à partir du nom.",
          },
        ]}
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Nom</th>
              <th className="px-3 py-2 font-medium">Code</th>
              <th className="px-3 py-2 font-medium">Élèves</th>
              <th className="px-3 py-2 font-medium">Enseignants</th>
              <th className="px-3 py-2 font-medium">Programmes</th>
              <th className="px-3 py-2 font-medium">Statut</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id} className="border-t border-border">
                <td className="px-3 py-2 text-foreground">
                  <Link href={`/admin/schools/${school.id}`} className="font-medium hover:underline">
                    {school.name}
                  </Link>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{school.code}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                    {school.studentCount}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    {school.teacherCount}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
                    {school.curriculumCount}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Badge variant={school.status === "active" ? "success" : "muted"}>
                    {school.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-3 text-xs">
                    <Link href={`/admin/schools/${school.id}`} className="text-primary hover:underline">
                      Voir
                    </Link>
                    <Link href={`/admin/schools/${school.id}/curriculums`} className="text-primary hover:underline">
                      Programmes
                    </Link>
                    <Link href={`/admin/schools/${school.id}/members`} className="text-primary hover:underline">
                      Membres
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {schools.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Aucune école pour le moment.</p>
        )}
      </div>
    </div>
  );
}
