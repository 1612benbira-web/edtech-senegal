import { z } from "zod";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const schoolSchema = z.object({
  name: z.string().min(2, "Nom requis (2 caractères minimum)"),
  slug: z
    .string()
    .optional()
    .transform((value, ctx) => {
      const raw = value?.trim();
      return raw ? slugify(raw) : undefined;
    }),
  code: z
    .string()
    .min(3, "Code requis (3 caractères minimum)")
    .regex(/^[A-Za-z0-9-]+$/, "Lettres, chiffres et tirets uniquement")
    .transform((value) => value.toUpperCase()),
  // Optionnel : si renseigné, cette personne est désignée school_admin de
  // la nouvelle école (utilisateur existant rattaché immédiatement, ou
  // invitation envoyée si le compte n'existe pas encore — cf.
  // createSchoolAction). Validation stricte côté serveur : ne JAMAIS se
  // fier uniquement à la validation HTML côté client.
  adminEmail: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Adresse email invalide.",
    }),
});

export const schoolStatusSchema = z.object({
  schoolId: z.string().uuid(),
  status: z.enum(["active", "inactive"]),
});

export const schoolCurriculumToggleSchema = z.object({
  schoolId: z.string().uuid(),
  curriculumId: z.string().uuid(),
  // BUG CORRIGÉ : z.coerce.boolean() transformait "false" (chaîne) en `true`
  // (Boolean("false") === true en JS, car c'est une chaîne non vide) — il
  // était donc impossible de désactiver un programme une fois activé.
  enabled: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export const schoolMemberSchema = z.object({
  schoolId: z.string().uuid("École requise"),
  profileId: z.string().uuid("Profil requis"),
  role: z.enum(["student", "teacher", "school_admin"]),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const teacherAssignmentSchema = z.object({
  schoolId: z.string().uuid("École requise"),
  // Optionnel : si renseigné, cette personne est désignée enseignant
  // (utilisateur existant rattaché immédiatement, ou invitation envoyée
  // si le compte n'existe pas encore — même logique que adminEmail sur
  // schoolSchema, cf. assignTeacherAction).
  teacherEmail: z.string().email("Adresse email invalide."),
  subjectId: z.string().uuid("Matière requise"),
  levelId: z.string().uuid("Niveau requis"),
  seriesId: z
    .string()
    .optional()
    .transform((v) => v?.trim() || undefined)
    .refine((v) => !v || z.string().uuid().safeParse(v).success, { message: "Série invalide." }),
});

export const teacherAssignmentRemoveSchema = z.object({
  schoolId: z.string().uuid(),
  assignmentId: z.string().uuid(),
});

export const schoolMemberStatusSchema = z.object({
  schoolMemberId: z.string().uuid(),
  status: z.enum(["active", "inactive"]),
});

export { slugify };
