import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { requireTeacherAccess } from "@/lib/services/adminGuard";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminForm } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { createTeacherMessageAction, deleteTeacherMessageAction } from "../actions";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso));
}

export default async function TeacherMessagesPage(
  props: {
    searchParams: Promise<{ levelId?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const currentSchool = await getCurrentSchool();
  const schoolId = currentSchool!.schoolId;
  const { assignments } = await requireTeacherAccess(schoolId);

  // Un enseignant peut couvrir plusieurs niveaux (plusieurs
  // affectations) : on ne montre dans le sélecteur QUE ses niveaux
  // affectés, jamais tous les niveaux de l'école (cf. policy
  // messages_insert_teacher, migration 0025, qui refuserait de toute
  // façon un envoi vers un niveau non affecté).
  const levelOptions = Array.from(
    new Map(assignments.map((a: any) => [a.level_id, a.school_levels?.name ?? a.level_id])).entries()
  ).map(([value, label]) => ({ value, label: label as string }));

  // deleteTeacherMessageAction attend (messageId, schoolId) : on lie
  // schoolId ici, DeleteButton n'appellera l'action qu'avec l'id.
  const deleteAction = (messageId: string) => deleteTeacherMessageAction(messageId, schoolId);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: myMessages } = await supabase
    .from("messages")
    .select("id, title, content, created_at, target_level_id, school_levels(name)")
    .eq("school_id", schoolId)
    .eq("sender_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={MessageSquare}
        title="Messages à mes élèves"
        description="Tu ne peux écrire qu'aux élèves d'un niveau qui t'est confié — jamais à toute l'école."
      />

      <Link href="/teacher" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour à l&apos;aperçu
      </Link>

      {levelOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune matière ne t&apos;a encore été confiée.</p>
      ) : (
        <>
          <AdminSection title="Nouveau message" contentClassName="max-w-md">
            <AdminForm
              action={createTeacherMessageAction}
              submitLabel="Envoyer"
              fields={[
                { name: "schoolId", label: "", type: "hidden", defaultValue: schoolId },
                {
                  name: "targetLevelId",
                  label: "Niveau destinataire",
                  type: "select",
                  options: levelOptions,
                  defaultValue: searchParams.levelId ?? levelOptions[0]?.value,
                },
                { name: "title", label: "Titre" },
                { name: "content", label: "Message", type: "textarea", rows: 4 },
              ]}
            />
          </AdminSection>

          <AdminSection title={`Messages envoyés (${myMessages?.length ?? 0})`}>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Titre</th>
                    <th className="px-3 py-2 font-medium">Niveau</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(myMessages ?? []).map((m: any) => (
                    <tr key={m.id} className="border-t border-border">
                      <td className="px-3 py-2 text-foreground">{m.title}</td>
                      <td className="px-3 py-2 text-muted-foreground">{m.school_levels?.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{formatDate(m.created_at)}</td>
                      <td className="px-3 py-2">
                        <DeleteButton
                          action={deleteAction}
                          id={m.id}
                          confirmMessage={`Supprimer le message "${m.title}" ?`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(myMessages ?? []).length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">Aucun message envoyé pour le moment.</p>
              )}
            </div>
          </AdminSection>
        </>
      )}
    </div>
  );
}
