import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, GraduationCap, Users, ClipboardList } from "lucide-react";
import { getSchoolById } from "@/lib/queries/school";
import { getSchoolMembers, getSchoolCurriculums } from "@/lib/services/schoolService";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SchoolStatusToggle } from "@/components/admin/school-status-toggle";
import { SchoolNameForm } from "@/components/admin/school-name-form";

export default async function SchoolDetailPage({ params }: { params: { id: string } }) {
  const { isSuperAdmin } = await requireSchoolAccess(params.id);

  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const [members, curriculums] = await Promise.all([
    getSchoolMembers(params.id),
    getSchoolCurriculums(params.id),
  ]);

  const activeMembers = members.filter((m) => m.status === "active");
  const studentCount = activeMembers.filter((m) => m.role === "student").length;
  const teacherCount = activeMembers.filter((m) => m.role === "teacher").length;
  const enabledCurriculumCount = curriculums.filter((c) => c.enabled).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader icon={Building2} title={school.name} />

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={school.status === "active" ? "success" : "muted"}>
          {school.status === "active" ? "École active" : "École inactive"}
        </Badge>
        <span className="font-mono text-xs text-muted-foreground">Code : {school.code}</span>
        {isSuperAdmin && <SchoolStatusToggle schoolId={school.id} currentStatus={school.status} />}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <MetricCard label="Élèves" value={String(studentCount)} icon={<GraduationCap className="h-4 w-4" />} />
        <MetricCard label="Enseignants" value={String(teacherCount)} icon={<Users className="h-4 w-4" />} />
        <MetricCard
          label="Programmes activés"
          value={String(enabledCurriculumCount)}
          icon={<ClipboardList className="h-4 w-4" />}
        />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href={`/admin/schools/${school.id}/browse`}
          className="rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
        >
          Bibliothèque (naviguer)
        </Link>
        <Link
          href={`/admin/schools/${school.id}/members`}
          className="rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
        >
          Élèves & enseignants
        </Link>
        <Link
          href={`/admin/schools/${school.id}/teachers`}
          className="rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
        >
          Enseignants & matières
        </Link>
        <Link
          href={`/admin/schools/${school.id}/curriculums`}
          className="rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
        >
          Programmes nationaux
        </Link>
        <Link
          href={`/admin/schools/${school.id}/content`}
          className="rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
        >
          Programme propre à l&apos;école
        </Link>
        <Link
          href={`/admin/schools/${school.id}/content/private-exercise`}
          className="rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
        >
          Exercices privés
        </Link>
        <Link
          href={`/admin/schools/${school.id}/messages`}
          className="rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
        >
          Messages
        </Link>
        {isSuperAdmin && (
          <Link href="/admin/schools" className="rounded-lg border border-border px-4 py-2 font-medium text-foreground hover:bg-muted">
            ← Toutes les écoles
          </Link>
        )}
      </div>

      <SchoolNameForm schoolId={school.id} currentName={school.name} />
    </div>
  );
}
