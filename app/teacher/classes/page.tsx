import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { getMyTeacherAssignments, getTeacherClassOverview } from "@/lib/services/teacherDashboardService";
import { INACTIVE_AFTER_DAYS, WEAK_MASTERY_THRESHOLD } from "@/lib/algorithms/classOverview";
import { getPresence } from "@/lib/utils/presence";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Suivi de mes classes" };

function assignmentLabel(a: { subjectName: string; levelName: string; seriesName: string | null }) {
  return `${a.subjectName} — ${a.levelName}${a.seriesName ? ` ${a.seriesName}` : ""}`;
}

export default async function TeacherClassesPage(props: { searchParams: Promise<{ a?: string }> }) {
  const searchParams = await props.searchParams;
  // TeacherLayout a déjà vérifié le rôle ; getMyTeacherAssignments le revérifie
  // avant toute lecture de données d'élèves.
  const { assignments } = await getMyTeacherAssignments();

  const header = (
    <AdminPageHeader
      icon={Users}
      title="Suivi de mes classes"
      description="Pour chaque matière et niveau qui t'est confié : où en sont les élèves de ton école, qui a décroché, et quelles notions retravailler en classe."
    />
  );

  if (assignments.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <p className="text-sm text-muted-foreground">
          Aucune matière ne t&apos;a encore été confiée. Demande à l&apos;administrateur de ton école de
          t&apos;affecter à une matière et un niveau.
        </p>
      </div>
    );
  }

  const selected = assignments.find((a) => a.id === searchParams.a) ?? assignments[0]!;
  const overview = await getTeacherClassOverview(selected.id);

  return (
    <div className="space-y-6">
      {header}

      {assignments.length > 1 && (
        <nav aria-label="Choisir une classe" className="flex flex-wrap gap-2">
          {assignments.map((a) => {
            const active = a.id === selected.id;
            return (
              <Link
                key={a.id}
                href={`/teacher/classes?a=${a.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {assignmentLabel(a)}
              </Link>
            );
          })}
        </nav>
      )}

      {!overview ? (
        <p className="text-sm text-muted-foreground">Cette classe n&apos;est pas disponible.</p>
      ) : (
        <>
          <div>
            <h2 className="text-base font-semibold text-foreground">{assignmentLabel(overview.assignment)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {overview.curriculumTitle
                ? `Programme suivi : ${overview.curriculumTitle} (${overview.totalLessons} leçon${overview.totalLessons > 1 ? "s" : ""} publiée${overview.totalLessons > 1 ? "s" : ""}).`
                : "Aucun programme publié pour cette matière et ce niveau : la progression ne peut pas encore être calculée."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Élèves", value: String(overview.studentCount) },
              { label: `Actifs sur ${INACTIVE_AFTER_DAYS} jours`, value: `${overview.activeCount} / ${overview.studentCount}` },
              { label: "Progression moyenne", value: `${overview.averageProgress} %` },
              {
                label: "Moyenne aux quiz",
                value: overview.averageQuizScore === null ? "—" : `${overview.averageQuizScore} %`,
              },
            ].map((card) => (
              <div key={card.label} className="rounded-lg border border-border bg-background p-4">
                <p className="font-mono text-2xl font-semibold text-foreground">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.label}</p>
              </div>
            ))}
          </div>

          <AdminSection title="Notions à retravailler">
            {overview.weakNotions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune notion sous {WEAK_MASTERY_THRESHOLD} % de maîtrise pour l&apos;instant. Cette liste se
                remplit quand les élèves font des exercices et des quiz.
              </p>
            ) : (
              <ul className="space-y-3">
                {overview.weakNotions.map((notion) => (
                  <li key={notion.competencyId}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate font-medium text-foreground">{notion.name}</span>
                      <span className="shrink-0 font-mono text-muted-foreground">
                        {notion.averageMastery} % · {notion.studentCount} élève{notion.studentCount > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <div className="h-full rounded-full bg-danger" style={{ width: `${notion.averageMastery}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminSection>

          <AdminSection title={`Élèves (${overview.studentCount})`}>
            {overview.studentCount === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun élève de ce niveau n&apos;est rattaché à ton école pour l&apos;instant. Les élèves
                rejoignent l&apos;école en saisissant son code établissement à l&apos;inscription.
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs text-muted-foreground">
                  Les élèves qui ont le moins avancé apparaissent en premier.
                </p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                      <tr>
                        <th scope="col" className="px-3 py-2 font-medium">Élève</th>
                        <th scope="col" className="px-3 py-2 font-medium">Leçons terminées</th>
                        <th scope="col" className="px-3 py-2 font-medium">Quiz</th>
                        <th scope="col" className="px-3 py-2 font-medium">Maîtrise</th>
                        <th scope="col" className="px-3 py-2 font-medium">Dernière connexion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.students.map((student) => (
                        <tr key={student.id} className="border-t border-border">
                          <th scope="row" className="px-3 py-2.5 text-left font-medium text-foreground">
                            {student.name}
                          </th>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${student.progressPercent}%` }} />
                              </div>
                              <span className="font-mono text-xs text-muted-foreground">
                                {student.completedLessons}/{overview.totalLessons} · {student.progressPercent} %
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                            {student.quizAverage === null
                              ? "Aucun"
                              : `${student.quizAverage} % · ${student.quizCount} quiz`}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                            {student.masteryAverage === null ? "—" : `${student.masteryAverage} %`}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {getPresence(student.lastSeenAt).label}
                              {student.inactive && <Badge variant="warning" className="px-2 py-0.5">Inactif</Badge>}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </AdminSection>
        </>
      )}
    </div>
  );
}
