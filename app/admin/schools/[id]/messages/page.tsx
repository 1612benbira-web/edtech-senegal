import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Paperclip } from "lucide-react";
import { getSchoolById } from "@/lib/queries/school";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import { getSchoolLevelsWithStudentCounts, getSchoolMessages } from "@/lib/services/messageService";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SchoolMessageForm } from "@/components/admin/school-message-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteSchoolMessageAction } from "./actions";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso));
}

export default async function SchoolMessagesPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await requireSchoolAccess(params.id);

  const school = await getSchoolById(params.id);
  if (!school) notFound();

  const [{ totalStudents, levels }, messages] = await Promise.all([
    getSchoolLevelsWithStudentCounts(params.id),
    getSchoolMessages(params.id),
  ]);

  const boundDelete = deleteSchoolMessageAction.bind(null, params.id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={MessageSquare}
        title={`Messages — ${school.name}`}
        description="Envoie une communication (texte, photo, vidéo ou PDF) à tous les élèves de l'école, ou à un niveau précis."
      />

      <Link
        href={`/admin/schools/${school.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour à l&apos;école
      </Link>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Nouveau message</h2>
        <SchoolMessageForm schoolId={school.id} levels={levels} totalStudents={totalStudents} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Messages envoyés ({messages.length})</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Titre</th>
                <th className="px-3 py-2 font-medium">Destinataires</th>
                <th className="px-3 py-2 font-medium">Lu / Non lu</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">{m.title}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {m.targetType === "SCHOOL" ? "Toute l'école" : `Niveau ${m.targetLevelName ?? ""}`}
                    {" · "}
                    {m.recipientCount} élève{m.recipientCount > 1 ? "s" : ""}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {m.readCount} lu{m.readCount > 1 ? "s" : ""} / {m.recipientCount - m.readCount} non lu
                    {m.recipientCount - m.readCount > 1 ? "s" : ""}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{formatDate(m.createdAt)}</td>
                  <td className="px-3 py-2">
                    <DeleteButton
                      action={boundDelete}
                      id={m.id}
                      confirmMessage={`Supprimer le message "${m.title}" ? Il ne sera plus visible par les élèves.`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {messages.length === 0 && (
            <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              Aucun message envoyé pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
