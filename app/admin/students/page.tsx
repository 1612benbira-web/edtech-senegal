import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Award, Users } from "lucide-react";
import { getStudents } from "@/lib/queries/admin-stats";
import { getPresence } from "@/lib/utils/presence";
import { PresenceBadge, StudentRowActions } from "@/components/admin/student-row-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAnyAdminAccess } from "@/lib/services/adminGuard";

const PAGE_SIZE = 25;

export default async function StudentsAdminPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  // Cette page liste les élèves de TOUTES les écoles : réservée au
  // super_admin. Un school_admin dispose de sa propre page dédiée
  // (/admin/schools/[id]/members), scopée à sa seule école par la RLS.
  const access = await requireAnyAdminAccess();
  if (access.role === "school_admin") {
    redirect(`/admin/schools/${access.schoolId}/members`);
  }

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const { students, totalCount } = await getStudents(searchParams.q, page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <AdminPageHeader icon={Users} title={`Élèves (${totalCount})`} />

      <form method="get" className="max-w-sm">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Rechercher par nom ou email..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Nom</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Niveau / Série</th>
              <th className="px-3 py-2 font-medium">XP</th>
              <th className="px-3 py-2 font-medium">Série (jours)</th>
              <th className="px-3 py-2 font-medium">Badges</th>
              <th className="px-3 py-2 font-medium">Activité</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const presence = getPresence(s.lastSeenAt);
              return (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">
                    <Link href={`/admin/students/${s.id}`} className="hover:underline">
                      {s.firstName} {s.lastName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{s.email}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {s.levelName ?? "—"}
                    {s.seriesName ? ` (${s.seriesName})` : ""}
                  </td>
                  <td className="px-3 py-2 text-foreground">{s.xpTotal}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                      {s.currentStreak}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" aria-hidden="true" />
                      {s.badgeCount}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <PresenceBadge status={presence.status} label={presence.label} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/students/${s.id}`}
                        className="rounded-md px-2 py-1 text-xs text-primary hover:bg-primary/10"
                      >
                        Voir le profil
                      </Link>
                      <StudentRowActions studentId={s.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {students.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Aucun élève trouvé.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?q=${searchParams.q ?? ""}&page=${page - 1}`}
                className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted"
              >
                ← Précédent
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?q=${searchParams.q ?? ""}&page=${page + 1}`}
                className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted"
              >
                Suivant →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
