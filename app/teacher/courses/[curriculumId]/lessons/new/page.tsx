import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { requireTeacherAccess } from "@/lib/services/adminGuard";
import { getTeacherCurriculum, getChaptersWithLessons } from "@/lib/queries/teacher-courses";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminForm } from "@/components/admin/admin-form";
import { createTeacherLessonAction } from "../../../actions";

export default async function NewTeacherLessonPage(props: {
  params: Promise<{ curriculumId: string }>;
  searchParams: Promise<{ chapterId?: string }>;
}) {
  const { curriculumId } = await props.params;
  const { chapterId } = await props.searchParams;
  const schoolId = (await getCurrentSchool())!.schoolId;
  const { assignments } = await requireTeacherAccess(schoolId);
  const found = await getTeacherCurriculum(curriculumId, schoolId,
    assignments.map((a: any) => ({ subject_id: a.subject_id, level_id: a.level_id, series_id: a.series_id })));
  if (!found || found.access !== "edit") notFound();
  const chapters = await getChaptersWithLessons(curriculumId, true);
  const chapter = chapters.find((c: any) => c.id === chapterId);
  if (!chapter) notFound();

  return (
    <div className="space-y-6">
      <Link href={`/teacher/courses/${curriculumId}`} className="text-xs text-primary hover:underline">← {found.curriculum.title}</Link>
      <AdminPageHeader icon={FileText} title={`Nouvelle leçon — ${chapter.title}`} description="La leçon est créée en brouillon." />
      <AdminForm
        action={async (prev: any, fd: FormData) => { "use server"; fd.set("schoolId", schoolId); return createTeacherLessonAction(prev, fd); }}
        submitLabel="Créer la leçon"
        fields={[
          { name: "chapterId", label: "", type: "hidden", defaultValue: chapter.id },
          { name: "title", label: "Titre" },
          { name: "order", label: "Ordre", type: "number", defaultValue: String(chapter.lessons.length + 1) },
          { name: "summary", label: "Résumé", optional: true },
          { name: "objectives", label: "Objectifs (un par ligne)", type: "textarea", rows: 3, optional: true },
          { name: "contentMd", label: "Contenu (Markdown, formules LaTeX avec $…$)", type: "textarea", rows: 16 },
        ]} />
    </div>
  );
}
