import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flame, Award, Mail, Phone, Calendar } from "lucide-react";
import { getStudentDetail } from "@/lib/queries/admin-stats";
import { getSubjectsProgress } from "@/lib/queries/progress";
import { getPresence } from "@/lib/utils/presence";
import { PresenceBadge, StudentRowActions } from "@/components/admin/student-row-actions";
import { Card, MetricCard } from "@/components/ui/card";

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = await getStudentDetail(params.id);
  if (!student) notFound();

  const subjectsProgress = student.levelId
    ? await getSubjectsProgress(student.id, student.levelId)
    : [];

  const presence = getPresence(student.lastSeenAt);

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Élèves
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {student.firstName} {student.lastName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {student.levelName ?? "Niveau non défini"}
            {student.seriesName ? ` — ${student.seriesName}` : ""}
          </p>
          <div className="mt-2">
            <PresenceBadge status={presence.status} label={presence.label} />
          </div>
        </div>
        <StudentRowActions studentId={student.id} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="XP" value={`${student.xpTotal}`} icon={<Award className="h-4 w-4" aria-hidden="true" />} />
        <MetricCard label="Série actuelle" value={`${student.currentStreak} j`} icon={<Flame className="h-4 w-4" aria-hidden="true" />} />
        <MetricCard label="Meilleure série" value={`${student.longestStreak} j`} icon={<Flame className="h-4 w-4" aria-hidden="true" />} />
        <MetricCard
          label="Inscrit le"
          value={new Date(student.createdAt).toLocaleDateString("fr-FR")}
          icon={<Calendar className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <Card>
        <h2 className="mb-3 font-display font-semibold text-foreground">Coordonnées</h2>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" aria-hidden="true" /> {student.email}
          </p>
          {student.phone && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" aria-hidden="true" /> {student.phone}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-display font-semibold text-foreground">Programme et progression</h2>
        {subjectsProgress.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune matière ajoutée pour l&apos;instant.</p>
        )}
        <div className="space-y-3">
          {subjectsProgress.map((sp) => (
            <div key={sp.subjectId}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{sp.subjectName}</span>
                <span className="text-muted-foreground">
                  {sp.completedLessons}/{sp.totalLessons} leçons — {sp.percent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${sp.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
