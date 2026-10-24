import { notFound } from "next/navigation";
import Link from "next/link";
import { ClipboardList, ArrowLeft } from "lucide-react";
import { getSchoolById, getAvailableCurriculumsForSchool } from "@/lib/queries/school";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CurriculumToggleRow } from "@/components/admin/curriculum-toggle-row";

export default async function SchoolCurriculumsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await requireSchoolAccess(params.id);

  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const curriculums = await getAvailableCurriculumsForSchool(params.id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ClipboardList}
        title={`Programmes — ${school.name}`}
        description="Active les programmes globaux que cette école souhaite proposer à ses élèves. Aucun contenu n'est jamais dupliqué : cette action crée uniquement un lien entre l'école et le programme."
      />

      <Link
        href={`/admin/schools/${school.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour à l&apos;école
      </Link>

      <div className="space-y-2">
        {curriculums.map((curriculum) => (
          <CurriculumToggleRow
            key={curriculum.id}
            schoolId={school.id}
            curriculumId={curriculum.id}
            title={curriculum.title}
            subtitle={`${(curriculum as any).subjects?.name ?? ""} · ${(curriculum as any).school_levels?.name ?? ""} · v${curriculum.version}`}
            enabled={curriculum.enabled}
          />
        ))}
        {curriculums.length === 0 && (
          <p className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
            Aucun programme publié n&apos;est disponible pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
