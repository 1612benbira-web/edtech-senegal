import Link from "next/link";
import { GraduationCap, Dumbbell, MessageSquare } from "lucide-react";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { requireTeacherAccess } from "@/lib/services/adminGuard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminItemRow } from "@/components/admin/admin-item-row";

export default async function TeacherOverviewPage() {
  // TeacherLayout a déjà vérifié le rôle ; currentSchool est donc non
  // nul et de rôle 'teacher' à ce stade.
  const currentSchool = await getCurrentSchool();
  const { assignments } = await requireTeacherAccess(currentSchool!.schoolId);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={GraduationCap}
        title="Tes matières"
        description="Pour chaque matière/niveau qui t'est confié, tu peux consulter le cours national (lecture seule), modifier les cours propres à ton école, ajouter tes propres exercices, et écrire aux élèves de ce niveau."
      />

      <AdminSection title={`Affectations (${assignments.length})`}>
        <div className="space-y-2">
          {assignments.map((a: any) => (
            <AdminItemRow
              key={a.id}
              icon={<GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />}
              title={`${a.subjects?.name} — ${a.school_levels?.name}`}
              subtitle={a.school_series?.name ? `Série ${a.school_series.name}` : "Toutes séries"}
              href="/teacher/exercises"
              actions={
                <Link href={`/teacher/messages?levelId=${a.level_id}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <MessageSquare className="h-3 w-3" aria-hidden="true" />
                  Écrire au niveau
                </Link>
              }
            />
          ))}
          {assignments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune matière ne t&apos;a encore été confiée. Demande à l&apos;administrateur de ton école de
              t&apos;affecter à une matière et un niveau.
            </p>
          )}
        </div>
      </AdminSection>

      {assignments.length > 0 && (
        <Link
          href="/teacher/exercises"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Dumbbell className="h-3.5 w-3.5" aria-hidden="true" />
          Voir tous mes exercices
        </Link>
      )}
    </div>
  );
}
