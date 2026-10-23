import { BookOpen, Lock, Pencil } from "lucide-react";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { requireTeacherAccess } from "@/lib/services/adminGuard";
import { getTeacherCurricula } from "@/lib/queries/teacher-courses";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminItemRow } from "@/components/admin/admin-item-row";

const label = (c: any) => `${c.subjects?.name ?? ""} — ${c.school_levels?.name ?? ""}${c.school_series?.name ? ` (${c.school_series.name})` : ""}`;

export default async function TeacherCoursesPage() {
  const school = await getCurrentSchool();
  const { assignments } = await requireTeacherAccess(school!.schoolId);
  const { owned, national } = await getTeacherCurricula(
    school!.schoolId,
    assignments.map((a: any) => ({ subject_id: a.subject_id, level_id: a.level_id, series_id: a.series_id }))
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={BookOpen}
        title="Mes cours"
        description="Modifie les chapitres et leçons des programmes propres à ton école, pour les matières qui t'ont été confiées. Le programme national reste en lecture seule."
      />

      <AdminSection title={`Programmes de mon école — modifiables (${owned.length})`}>
        <div className="space-y-2">
          {owned.map((c) => (
            <AdminItemRow key={c.id} icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
              title={c.title} subtitle={`${label(c)} · ${c.status === "published" ? "Publié" : "Non publié"}`}
              href={`/teacher/courses/${c.id}`} />
          ))}
          {owned.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun programme propre à ton école ne correspond à tes matières. L&apos;administrateur de l&apos;école peut en créer un.
            </p>
          )}
        </div>
      </AdminSection>

      <AdminSection title={`Programme national — lecture seule (${national.length})`}>
        <div className="space-y-2">
          {national.map((c) => (
            <AdminItemRow key={c.id} icon={<Lock className="h-3.5 w-3.5" aria-hidden="true" />}
              title={c.title} subtitle={label(c)} href={`/teacher/courses/${c.id}`} />
          ))}
          {national.length === 0 && <p className="text-sm text-muted-foreground">Aucun programme national activé pour tes matières.</p>}
        </div>
      </AdminSection>
    </div>
  );
}
