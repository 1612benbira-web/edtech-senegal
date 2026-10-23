import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, FileText } from "lucide-react";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { requireTeacherAccess } from "@/lib/services/adminGuard";
import { getTeacherCurriculum, getChaptersWithLessons } from "@/lib/queries/teacher-courses";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminForm } from "@/components/admin/admin-form";
import { StatusSelector } from "@/components/admin/status-selector";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  createTeacherChapterAction, updateTeacherChapterAction, updateTeacherChapterStatusAction,
  deleteTeacherChapterAction, updateTeacherLessonStatusAction, deleteTeacherLessonAction,
} from "../actions";

export default async function TeacherCurriculumPage(props: { params: Promise<{ curriculumId: string }> }) {
  const { curriculumId } = await props.params;
  const school = await getCurrentSchool();
  const schoolId = school!.schoolId;
  const { assignments } = await requireTeacherAccess(schoolId);
  const found = await getTeacherCurriculum(
    curriculumId, schoolId,
    assignments.map((a: any) => ({ subject_id: a.subject_id, level_id: a.level_id, series_id: a.series_id }))
  );
  if (!found) notFound();
  const editable = found.access === "edit";
  const chapters = await getChaptersWithLessons(curriculumId, editable);

  return (
    <div className="space-y-6">
      <Link href="/teacher/courses" className="text-xs text-primary hover:underline">← Mes cours</Link>
      <AdminPageHeader icon={BookOpen} title={found.curriculum.title}
        description={editable ? "Tu peux modifier ce programme de ton école." : "Programme national : lecture seule."} />

      {chapters.map((ch: any) => (
        <AdminSection key={ch.id} title={`${ch.order}. ${ch.title}`}>
          <div className="space-y-2">
            {editable && (
              <div className="flex flex-wrap items-center gap-3">
                <StatusSelector
                  action={async (prev: any, fd: FormData) => { "use server"; fd.set("schoolId", schoolId); return updateTeacherChapterStatusAction(prev, fd); }}
                  idFieldName="chapterId" id={ch.id} currentStatus={ch.status} />
                <DeleteButton action={async (id: string) => { "use server"; return deleteTeacherChapterAction(id, schoolId); }}
                  id={ch.id} confirmMessage={`Supprimer le chapitre "${ch.title}" ?`} />
              </div>
            )}
            {ch.lessons.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
                <Link href={`/teacher/courses/${curriculumId}/lessons/${l.id}`} className="flex min-w-0 items-center gap-2 text-sm font-medium hover:underline">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="truncate">{l.title}</span>
                </Link>
                {editable && (
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusSelector
                      action={async (prev: any, fd: FormData) => { "use server"; fd.set("schoolId", schoolId); return updateTeacherLessonStatusAction(prev, fd); }}
                      idFieldName="lessonId" id={l.id} currentStatus={l.status} />
                    <DeleteButton action={async (id: string) => { "use server"; return deleteTeacherLessonAction(id, schoolId); }}
                      id={l.id} confirmMessage={`Supprimer la leçon "${l.title}" ?`} />
                  </div>
                )}
              </div>
            ))}
            {ch.lessons.length === 0 && <p className="text-sm text-muted-foreground">Aucune leçon.</p>}
            {editable && (
              <details className="rounded-lg border border-border p-3">
                <summary className="cursor-pointer text-sm font-medium">Renommer / réordonner ce chapitre</summary>
                <div className="mt-3 max-w-md">
                  <AdminForm
                    action={async (prev: any, fd: FormData) => { "use server"; fd.set("schoolId", schoolId); return updateTeacherChapterAction(prev, fd); }}
                    submitLabel="Enregistrer"
                    fields={[
                      { name: "chapterId", label: "", type: "hidden", defaultValue: ch.id },
                      { name: "title", label: "Titre", defaultValue: ch.title },
                      { name: "order", label: "Ordre", type: "number", defaultValue: String(ch.order) },
                    ]} />
                </div>
              </details>
            )}
          </div>
        </AdminSection>
      ))}
      {chapters.length === 0 && <p className="text-sm text-muted-foreground">Aucun chapitre pour le moment.</p>}

      {editable && (
        <>
          <AdminSection title="Ajouter un chapitre (brouillon)">
            <div className="max-w-md">
              <AdminForm
                action={async (prev: any, fd: FormData) => { "use server"; fd.set("schoolId", schoolId); return createTeacherChapterAction(prev, fd); }}
                submitLabel="Ajouter le chapitre"
                fields={[
                  { name: "curriculumId", label: "", type: "hidden", defaultValue: curriculumId },
                  { name: "title", label: "Titre" },
                  { name: "order", label: "Ordre", type: "number", defaultValue: String(chapters.length + 1) },
                ]} />
            </div>
          </AdminSection>
          {chapters.length > 0 && (
            <p className="text-xs text-muted-foreground">Pour ajouter une leçon, ouvre une leçon existante ou utilise le lien « Nouvelle leçon » ci-dessous.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {chapters.map((ch: any) => (
              <Link key={ch.id} href={`/teacher/courses/${curriculumId}/lessons/new?chapterId=${ch.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                + Nouvelle leçon dans « {ch.title} »
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
