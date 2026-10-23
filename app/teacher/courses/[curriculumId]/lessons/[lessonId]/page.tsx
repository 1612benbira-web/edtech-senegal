import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { requireTeacherAccess } from "@/lib/services/adminGuard";
import { getTeacherCurriculum, getLessonWithCurriculum } from "@/lib/queries/teacher-courses";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminForm } from "@/components/admin/admin-form";
import { LessonContent } from "@/components/lesson/lesson-content";
import { updateTeacherLessonAction } from "../../../actions";

export default async function TeacherLessonPage(props: { params: Promise<{ curriculumId: string; lessonId: string }> }) {
  const { curriculumId, lessonId } = await props.params;
  const schoolId = (await getCurrentSchool())!.schoolId;
  const { assignments } = await requireTeacherAccess(schoolId);
  const found = await getTeacherCurriculum(curriculumId, schoolId,
    assignments.map((a: any) => ({ subject_id: a.subject_id, level_id: a.level_id, series_id: a.series_id })));
  if (!found) notFound();

  const lesson = await getLessonWithCurriculum(lessonId);
  // La leçon doit réellement appartenir au programme de l'URL (anti id forgé).
  if (!lesson || lesson.chapters?.curriculum_id !== curriculumId) notFound();
  const editable = found.access === "edit";

  return (
    <div className="space-y-6">
      <Link href={`/teacher/courses/${curriculumId}`} className="text-xs text-primary hover:underline">← {found.curriculum.title}</Link>
      <AdminPageHeader icon={FileText} title={lesson.title}
        description={editable ? `Chapitre « ${lesson.chapters?.title} » — modifiable` : "Lecture seule"} />

      {editable && (
        <AdminSection title="Modifier la leçon">
          <AdminForm
            action={async (prev: any, fd: FormData) => { "use server"; fd.set("schoolId", schoolId); return updateTeacherLessonAction(prev, fd); }}
            submitLabel="Enregistrer"
            fields={[
              { name: "lessonId", label: "", type: "hidden", defaultValue: lesson.id },
              { name: "title", label: "Titre", defaultValue: lesson.title },
              { name: "order", label: "Ordre", type: "number", defaultValue: String(lesson.order) },
              { name: "summary", label: "Résumé", optional: true, defaultValue: lesson.summary ?? "" },
              { name: "objectives", label: "Objectifs (un par ligne)", type: "textarea", rows: 3, optional: true, defaultValue: (lesson.objectives ?? []).join("\n") },
              { name: "contentMd", label: "Contenu (Markdown)", type: "textarea", rows: 18, defaultValue: lesson.content_md },
            ]} />
        </AdminSection>
      )}

      <AdminSection title="Aperçu">
        <LessonContent contentMd={lesson.content_md} />
      </AdminSection>
    </div>
  );
}
