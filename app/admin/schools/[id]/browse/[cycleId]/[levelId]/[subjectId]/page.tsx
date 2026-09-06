import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { getSchoolById } from "@/lib/queries/school";
import { getLevels, getSubjects } from "@/lib/queries/curriculum";
import { getCurriculumsForLevelSubject } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function SchoolBrowseCurriculumsPage({
  params,
}: {
  params: { id: string; cycleId: string; levelId: string; subjectId: string };
}) {
  await requireSchoolAccess(params.id);
  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const [levels, subjects] = await Promise.all([getLevels(params.cycleId), getSubjects()]);
  const level = (levels ?? []).find((l: any) => l.id === params.levelId);
  const subject = (subjects ?? []).find((s: any) => s.id === params.subjectId);
  if (!level || !subject) notFound();

  const curriculums = await getCurriculumsForLevelSubject(params.levelId, params.subjectId, params.id);
  const base = `/admin/schools/${params.id}/browse`;

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[
          { label: "Bibliothèque", href: base },
          { label: level.school_cycles?.name ?? "Cycle", href: `${base}/${params.cycleId}` },
          { label: level.name, href: `${base}/${params.cycleId}/${params.levelId}` },
          { label: subject.name },
        ]}
      />

      <AdminPageHeader
        icon={GraduationCap}
        title={`${subject.name} — ${level.name}`}
        description={`${curriculums.length} programme(s) accessible(s) pour ton école.`}
      />

      {curriculums.length === 0 ? (
        <BrowseEmptyState message="Aucun programme accessible pour cette matière/niveau." />
      ) : (
        <BrowseGrid>
          {curriculums.map((curriculum) => (
            <BrowseCard
              key={curriculum.id}
              href={`${base}/${params.cycleId}/${params.levelId}/${params.subjectId}/${curriculum.id}`}
              icon={<GraduationCap className="h-5 w-5" />}
              title={curriculum.title}
              subtitle={curriculum.isSchoolOwned ? "Programme de ton établissement" : "Programme national activé"}
              status={curriculum.status}
              counters={[
                { label: "domaine(s)", value: curriculum.domainCount },
                { label: "chapitre(s)", value: curriculum.chapterCount },
              ]}
            />
          ))}
        </BrowseGrid>
      )}
    </div>
  );
}
