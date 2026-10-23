import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { requireAdmin } from "@/lib/services/adminGuard";
import { getLevels, getSubjects } from "@/lib/queries/curriculum";
import { getCurriculumsForLevelSubject } from "@/lib/queries/library";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrowseGrid, BrowseCard, BrowseEmptyState } from "@/components/admin/browse/browse-card";
import { BrowseBreadcrumb } from "@/components/admin/browse/breadcrumb";

export default async function BrowseCurriculumsPage(
  props: {
    params: Promise<{ cycleId: string; levelId: string; subjectId: string }>;
  }
) {
  const params = await props.params;
  await requireAdmin();
  const [levels, subjects] = await Promise.all([getLevels(params.cycleId), getSubjects()]);
  const level = (levels ?? []).find((l: any) => l.id === params.levelId);
  const subject = (subjects ?? []).find((s: any) => s.id === params.subjectId);
  if (!level || !subject) notFound();

  const curriculums = await getCurriculumsForLevelSubject(params.levelId, params.subjectId);

  return (
    <div className="space-y-5">
      <BrowseBreadcrumb
        crumbs={[
          { label: "Bibliothèque", href: "/admin/browse" },
          { label: level.school_cycles?.name ?? "Cycle", href: `/admin/browse/${params.cycleId}` },
          { label: level.name, href: `/admin/browse/${params.cycleId}/${params.levelId}` },
          { label: subject.name },
        ]}
      />

      <AdminPageHeader
        icon={GraduationCap}
        title={`${subject.name} — ${level.name}`}
        description={`${curriculums.length} programme(s) pour cette matière et ce niveau.`}
      />

      {curriculums.length === 0 ? (
        <BrowseEmptyState message="Aucun programme pour cette matière/niveau (voir Programmes dans l'admin pour en créer un)." />
      ) : (
        <BrowseGrid>
          {curriculums.map((curriculum) => (
            <BrowseCard
              key={curriculum.id}
              href={`/admin/browse/${params.cycleId}/${params.levelId}/${params.subjectId}/${curriculum.id}`}
              icon={<GraduationCap className="h-5 w-5" />}
              title={curriculum.title}
              subtitle={curriculum.isSchoolOwned ? "Programme d'établissement" : "Programme national"}
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
