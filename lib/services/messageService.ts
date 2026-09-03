import { createClient } from "@/lib/supabase/server";
import { getLevels } from "@/lib/queries/curriculum";

/**
 * Compte les élèves actifs d'une école, avec répartition par niveau —
 * utilisé par le formulaire de composition pour afficher combien
 * d'élèves seront réellement touchés par un envoi "toute l'école" ou
 * "un niveau précis", avant même l'envoi.
 *
 * Réutilise `school_levels` (référentiel existant, cf. lib/queries/
 * curriculum.ts) au lieu de créer un deuxième système de niveaux —
 * le niveau d'un élève est déjà stocké dans `profiles.level_id`.
 */
export async function getSchoolLevelsWithStudentCounts(schoolId: string) {
  const supabase = await createClient();
  const [levels, { data: members, error: membersError }] = await Promise.all([
    getLevels(),
    supabase
      .from("school_members")
      .select("profile_id, profiles(level_id)")
      .eq("school_id", schoolId)
      .eq("role", "student")
      .eq("status", "active"),
  ]);
  if (membersError) throw membersError;

  const countByLevel = new Map<string, number>();
  let totalStudents = 0;
  for (const m of members ?? []) {
    totalStudents += 1;
    const levelId = (m as any).profiles?.level_id as string | null | undefined;
    if (levelId) countByLevel.set(levelId, (countByLevel.get(levelId) ?? 0) + 1);
  }

  return {
    totalStudents,
    levels: (levels ?? []).map((level: any) => ({
      id: level.id as string,
      name: level.name as string,
      studentCount: countByLevel.get(level.id) ?? 0,
    })),
  };
}

export interface SchoolMessageListItem {
  id: string;
  title: string;
  targetType: "SCHOOL" | "LEVEL";
  targetLevelName: string | null;
  createdAt: string;
  recipientCount: number;
  readCount: number;
}

/**
 * Historique des messages envoyés par une école (vue admin/school_admin).
 * Le nombre de destinataires et de lus est dérivé des lignes
 * `notifications` (type MESSAGE_RECEIVED, metadata.message_id) créées
 * au moment de l'envoi par `fan_out_message_notifications()` — pas de
 * table de suivi séparée (cf. migration 0021).
 */
export async function getSchoolMessages(schoolId: string): Promise<SchoolMessageListItem[]> {
  const supabase = await createClient();
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, title, target_type, target_level_id, created_at, school_levels(name)")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!messages || messages.length === 0) return [];

  const messageIds = messages.map((m) => m.id);
  const { data: notifs, error: notifsError } = await supabase
    .from("notifications")
    .select("read_at, metadata")
    .eq("type", "MESSAGE_RECEIVED")
    .in("metadata->>message_id", messageIds);
  if (notifsError) throw notifsError;

  const stats = new Map<string, { recipients: number; read: number }>();
  for (const n of notifs ?? []) {
    const messageId = (n.metadata as any)?.message_id as string | undefined;
    if (!messageId) continue;
    const entry = stats.get(messageId) ?? { recipients: 0, read: 0 };
    entry.recipients += 1;
    if (n.read_at) entry.read += 1;
    stats.set(messageId, entry);
  }

  return messages.map((m: any) => ({
    id: m.id,
    title: m.title,
    targetType: m.target_type,
    targetLevelName: m.school_levels?.name ?? null,
    createdAt: m.created_at,
    recipientCount: stats.get(m.id)?.recipients ?? 0,
    readCount: stats.get(m.id)?.read ?? 0,
  }));
}

export interface SchoolMessageDetail {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  targetType: "SCHOOL" | "LEVEL";
  targetLevelName: string | null;
  createdAt: string;
  recipientCount: number;
  readCount: number;
  attachments: { id: string; fileName: string; filePath: string; mimeType: string; fileSize: number }[];
}

export async function getSchoolMessageDetail(messageId: string): Promise<SchoolMessageDetail | null> {
  const supabase = await createClient();
  const { data: message, error } = await supabase
    .from("messages")
    .select("id, school_id, title, content, target_type, target_level_id, created_at, school_levels(name)")
    .eq("id", messageId)
    .maybeSingle();
  if (error) throw error;
  if (!message) return null;

  const [{ data: attachments, error: attachError }, { data: notifs, error: notifsError }] = await Promise.all([
    supabase
      .from("message_attachments")
      .select("id, file_name, file_path, mime_type, file_size")
      .eq("message_id", messageId),
    supabase
      .from("notifications")
      .select("read_at")
      .eq("type", "MESSAGE_RECEIVED")
      .eq("metadata->>message_id", messageId),
  ]);
  if (attachError) throw attachError;
  if (notifsError) throw notifsError;

  const recipientCount = notifs?.length ?? 0;
  const readCount = (notifs ?? []).filter((n) => n.read_at).length;

  return {
    id: message.id,
    schoolId: message.school_id,
    title: message.title,
    content: message.content,
    targetType: message.target_type as "SCHOOL" | "LEVEL",
    targetLevelName: (message as any).school_levels?.name ?? null,
    createdAt: message.created_at,
    recipientCount,
    readCount,
    attachments: (attachments ?? []).map((a) => ({
      id: a.id,
      fileName: a.file_name,
      filePath: a.file_path,
      mimeType: a.mime_type,
      fileSize: a.file_size,
    })),
  };
}

/** URL signée temporaire (bucket privé) pour afficher/télécharger une pièce jointe. */
export async function getAttachmentSignedUrl(filePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("school-messages")
    .createSignedUrl(filePath, 60 * 10); // 10 minutes
  if (error) return null;
  return data?.signedUrl ?? null;
}

// ============================================================
// ESPACE ÉLÈVE
// ============================================================

export interface StudentMessageListItem {
  id: string;
  title: string;
  schoolName: string;
  createdAt: string;
  isRead: boolean;
  attachmentCount: number;
}

/**
 * Messages visibles par l'élève connecté — la RLS `messages_select`
 * (0021) restreint déjà ce qui est réellement accessible (uniquement
 * les messages pour lesquels une notification MESSAGE_RECEIVED lui a
 * été envoyée). On y superpose juste le statut lu/non-lu et le nombre
 * de pièces jointes pour l'affichage de la liste.
 */
export async function getMyMessages(): Promise<StudentMessageListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: notifs, error: notifsError } = await supabase
    .from("notifications")
    .select("read_at, metadata")
    .eq("profile_id", user.id)
    .eq("type", "MESSAGE_RECEIVED")
    .order("created_at", { ascending: false });
  if (notifsError) throw notifsError;

  const messageIds = (notifs ?? [])
    .map((n) => (n.metadata as any)?.message_id as string | undefined)
    .filter((id): id is string => Boolean(id));
  if (messageIds.length === 0) return [];

  const readByMessageId = new Map<string, boolean>();
  for (const n of notifs ?? []) {
    const id = (n.metadata as any)?.message_id as string | undefined;
    if (id) readByMessageId.set(id, Boolean(n.read_at));
  }

  const [{ data: messages, error }, { data: attachments, error: attachError }] = await Promise.all([
    supabase
      .from("messages")
      .select("id, title, created_at, schools(name)")
      .in("id", messageIds),
    supabase.from("message_attachments").select("message_id").in("message_id", messageIds),
  ]);
  if (error) throw error;
  if (attachError) throw attachError;

  const attachmentCountByMessage = new Map<string, number>();
  for (const a of attachments ?? []) {
    attachmentCountByMessage.set(a.message_id, (attachmentCountByMessage.get(a.message_id) ?? 0) + 1);
  }

  return (messages ?? [])
    .map((m: any) => ({
      id: m.id,
      title: m.title,
      schoolName: m.schools?.name ?? "",
      createdAt: m.created_at,
      isRead: readByMessageId.get(m.id) ?? false,
      attachmentCount: attachmentCountByMessage.get(m.id) ?? 0,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export interface StudentMessageDetail {
  id: string;
  title: string;
  content: string;
  schoolName: string;
  createdAt: string;
  attachments: { id: string; fileName: string; filePath: string; mimeType: string; fileSize: number }[];
}

/**
 * Détail d'un message pour l'élève. La RLS revalide l'accès (impossible
 * de lire un message qui n'était pas destiné à cet élève, même en
 * devinant un id) : `.maybeSingle()` renverra simplement `null` si
 * l'élève n'a pas le droit d'y accéder.
 */
export async function getMyMessageDetail(messageId: string): Promise<StudentMessageDetail | null> {
  const supabase = await createClient();
  const { data: message, error } = await supabase
    .from("messages")
    .select("id, title, content, created_at, schools(name)")
    .eq("id", messageId)
    .maybeSingle();
  if (error) throw error;
  if (!message) return null;

  const { data: attachments, error: attachError } = await supabase
    .from("message_attachments")
    .select("id, file_name, file_path, mime_type, file_size")
    .eq("message_id", messageId);
  if (attachError) throw attachError;

  return {
    id: message.id,
    title: message.title,
    content: message.content,
    schoolName: (message as any).schools?.name ?? "",
    createdAt: message.created_at,
    attachments: (attachments ?? []).map((a) => ({
      id: a.id,
      fileName: a.file_name,
      filePath: a.file_path,
      mimeType: a.mime_type,
      fileSize: a.file_size,
    })),
  };
}

/** Marque comme lue la notification MESSAGE_RECEIVED correspondant à ce message pour l'élève connecté. */
export async function markMessageRead(messageId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", user.id)
    .eq("type", "MESSAGE_RECEIVED")
    .eq("metadata->>message_id", messageId)
    .is("read_at", null);
}
