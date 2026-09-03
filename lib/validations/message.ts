import { z } from "zod";

export const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "application/pdf",
] as const;

export const MAX_ATTACHMENT_SIZE_BYTES = 50 * 1024 * 1024; // 50 Mo — aligné sur le bucket Storage (migration 0021)
export const MAX_ATTACHMENTS_PER_MESSAGE = 5;

export const createMessageSchema = z.object({
  schoolId: z.string().uuid("École requise."),
  title: z.string().min(2, "Titre requis (2 caractères minimum).").max(200, "Titre trop long (200 caractères maximum)."),
  content: z.string().min(2, "Message requis (2 caractères minimum)."),
  targetType: z.enum(["SCHOOL", "LEVEL"]),
  targetLevelId: z.string().uuid().optional().nullable(),
}).refine((v) => v.targetType === "SCHOOL" || Boolean(v.targetLevelId), {
  message: "Sélectionne un niveau.",
  path: ["targetLevelId"],
});
