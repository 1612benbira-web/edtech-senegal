import { notFound } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { getSchoolById } from "@/lib/queries/school";
import { getSchoolSubjectTeachers } from "@/lib/services/schoolService";
import { getLevels, getSeries, getSubjects } from "@/lib/queries/curriculum";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminForm } from "@/components/admin/admin-form";
import { TeacherAssignmentActions } from "@/components/admin/teacher-assignment-actions";
import { assignTeacherAction } from "./actions";

export default async function SchoolTeachersPage({ params }: { params: { id: string } }) {
  await requireSchoolAccess(params.id);

  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const [assignments, levels, series, subjects] = await Promise.all([
    getSchoolSubjectTeachers(params.id),
    getLevels(),
    getSeries(),
    getSubjects(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={GraduationCap}
        title={`Enseignants — ${school.name}`}
        description="Affecte un enseignant à une matière et un niveau précis. L'enseignant ne pourra créer/modifier que ses propres exercices sur cette matière — jamais le cours national."
      />

      <Link
        href={`/admin/schools/${school.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour à l&apos;école
      </Link>

      <AdminSection title="Affecter un enseignant" contentClassName="max-w-md">
        <AdminForm
          action={assignTeacherAction}
          submitLabel="Affecter"
          fields={[
            { name: "schoolId", label: "", type: "hidden", defaultValue: school.id },
            {
              name: "teacherEmail",
              label: "Email de l'enseignant",
              type: "email",
              placeholder: "prof@ecole.com",
              helpText:
                "Si un compte existe déjà avec cet email, il devient enseignant immédiatement (son rôle dans cette école remplace tout autre rôle qu'il y avait). Sinon, une invitation lui est envoyée.",
            },
            {
              name: "subjectId",
              label: "Matière",
              type: "select",
              options: subjects.map((s: any) => ({ value: s.id, label: s.name })),
            },
            {
              name: "levelId",
              label: "Niveau",
              type: "select",
              options: levels.map((l: any) => ({ value: l.id, label: l.name })),
            },
            {
              name: "seriesId",
              label: "Série (optionnel, lycée uniquement)",
              type: "select",
              optional: true,
              options: series.map((s: any) => ({ value: s.id, label: s.name })),
              helpText: "Laisser vide : l'enseignant couvre toutes les séries de ce niveau.",
            },
          ]}
        />
      </AdminSection>

      <AdminSection title={`Affectations actuelles (${assignments.length})`}>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Enseignant</th>
                <th className="px-3 py-2 font-medium">Matière</th>
                <th className="px-3 py-2 font-medium">Niveau</th>
                <th className="px-3 py-2 font-medium">Série</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a: any) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">
                    {a.profiles?.first_name} {a.profiles?.last_name}
                    <div className="text-xs text-muted-foreground">{a.profiles?.email}</div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{a.subjects?.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.school_levels?.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.school_series?.name ?? "Toutes"}</td>
                  <td className="px-3 py-2">
                    <TeacherAssignmentActions schoolId={school.id} assignmentId={a.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assignments.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Aucun enseignant affecté pour le moment.</p>
          )}
        </div>
      </AdminSection>
    </div>
  );
}
