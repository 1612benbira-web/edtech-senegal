"use server";

import { revalidatePath } from "next/cache";
import { requireSchoolAccess } from "@/lib/services/adminGuard";
import {
  createMessageSchema,
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from "@/lib/validations/message";

export type MessageActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  message?: string;
} | null;

function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .slice(-120);
}

export async function createSchoolMessageAction(
  _prev: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  const schoolId = String(formData.get("schoolId") ?? "");
  try {
    const { supabase, userId } = await requireSchoolAccess(schoolId);

    const parsed = createMessageSchema.safeParse({
      schoolId,
      title: formData.get("title"),
      content: formData.get("content"),
      targetType: formData.get("targetType"),
      targetLevelId: formData.get("targetLevelId") || null,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      return { fieldErrors };
    }
    const d = parsed.data;

    // Validation SERVEUR des pièces jointes — ne jamais se fier
    // uniquement au contrôle côté client (type accepté par l'input
    // HTML, taille affichée dans l'UI, etc.).
    const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      return { error: `Maximum ${MAX_ATTACHMENTS_PER_MESSAGE} pièces jointes par message.` };
    }
    for (const file of files) {
      if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type as (typeof ALLOWED_ATTACHMENT_TYPES)[number])) {
        return { error: `Type de fichier non autorisé : ${file.type || file.name}. Formats acceptés : JPG, PNG, WEBP, MP4, WEBM, PDF.` };
      }
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        return { error: `Le fichier "${file.name}" dépasse la taille maximale autorisée (50 Mo).` };
      }
    }

    // 1. Créer le message (sans pièces jointes pour l'instant : on a
    // besoin de son id pour construire le chemin de stockage).
    const { data: created, error: insertError } = await supabase
      .from("messages")
      .insert({
        school_id: schoolId,
        sender_id: userId,
        title: d.title,
        content: d.content,
        target_type: d.targetType,
        target_level_id: d.targetType === "LEVEL" ? d.targetLevelId : null,
      })
      .select("id")
      .single();
    if (insertError || !created) {
      return { error: insertError?.message ?? "La création du message a échoué." };
    }
    const messageId = created.id as string;

    // 2. Upload des pièces jointes vers Storage (bucket privé
    // `school-messages`, migration 0021). En cas d'échec d'un upload,
    // on annule TOUT (message + fichiers déjà envoyés) plutôt que de
    // laisser un message à moitié complet avec un succès mensonger.
    const uploadedPaths: string[] = [];
    for (const file of files) {
      const path = `${schoolId}/${messageId}/${Date.now()}-${sanitizeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("school-messages")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        await supabase.storage.from("school-messages").remove(uploadedPaths);
        await supabase.from("messages").delete().eq("id", messageId);
        return { error: `Échec de l'envoi de la pièce jointe "${file.name}" : ${uploadError.message}. Le message n'a pas été envoyé.` };
      }
      uploadedPaths.push(path);
    }

    if (uploadedPaths.length > 0) {
      const { error: attachError } = await supabase.from("message_attachments").insert(
        files.map((file, i) => ({
          message_id: messageId,
          file_name: file.name,
          file_path: uploadedPaths[i],
          mime_type: file.type,
          file_size: file.size,
        }))
      );
      if (attachError) {
        await supabase.storage.from("school-messages").remove(uploadedPaths);
        await supabase.from("messages").delete().eq("id", messageId);
        return { error: `Échec de l'enregistrement des pièces jointes : ${attachError.message}. Le message n'a pas été envoyé.` };
      }
    }

    // 3. Diffusion — une notification par élève ciblé, en un seul
    // INSERT ... SELECT côté base (cf. fan_out_message_notifications,
    // migration 0021), jamais une boucle élève par élève ici.
    const { data: recipientCount, error: fanOutError } = await supabase.rpc(
      "fan_out_message_notifications",
      { p_message_id: messageId }
    );
    if (fanOutError) {
      // Le message existe déjà à ce stade : on ne le supprime pas (les
      // pièces jointes sont valides), mais on prévient clairement que
      // la diffusion a échoué plutôt que de mentir sur le succès.
      return {
        error: `Le message a été créé, mais la diffusion aux élèves a échoué : ${fanOutError.message}. Réessaie ou contacte le support.`,
      };
    }

    revalidatePath(`/admin/schools/${schoolId}/messages`);

    const count = typeof recipientCount === "number" ? recipientCount : 0;
    return {
      success: true,
      message:
        count > 0
          ? `Message envoyé à ${count} élève${count > 1 ? "s" : ""}.`
          : "Message créé, mais aucun élève actif ne correspond à cette cible pour le moment.",
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteSchoolMessageAction(schoolId: string, messageId: string) {
  const { supabase } = await requireSchoolAccess(schoolId);

  // Les pièces jointes en Storage ne sont pas supprimées automatiquement
  // par la suppression de la ligne `messages` (contrairement à
  // `message_attachments`, en `on delete cascade`) : on les retire
  // explicitement pour ne pas laisser de fichiers orphelins.
  const { data: attachments } = await supabase
    .from("message_attachments")
    .select("file_path")
    .eq("message_id", messageId);
  if (attachments && attachments.length > 0) {
    await supabase.storage.from("school-messages").remove(attachments.map((a) => a.file_path));
  }

  const { data: deleted, error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId)
    .eq("school_id", schoolId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!deleted) {
    throw new Error("Ce message n'existe pas ou vous n'avez pas les droits nécessaires.");
  }
  revalidatePath(`/admin/schools/${schoolId}/messages`);
}
