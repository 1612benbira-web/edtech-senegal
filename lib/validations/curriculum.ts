import { z } from "zod";

export const cycleSchema = z.object({
  code: z.string().min(1, "Code requis").regex(/^[a-z0-9_]+$/, "Minuscules, chiffres, underscores uniquement"),
  name: z.string().min(1, "Nom requis"),
  order: z.coerce.number().int().min(0),
});

export const levelSchema = z.object({
  cycleId: z.string().uuid("Cycle requis"),
  code: z.string().min(1, "Code requis").regex(/^[a-z0-9_]+$/, "Minuscules, chiffres, underscores uniquement"),
  name: z.string().min(1, "Nom requis"),
  order: z.coerce.number().int().min(0),
});

export const seriesSchema = z.object({
  levelId: z.string().uuid("Niveau requis"),
  code: z.string().min(1, "Code requis"),
  name: z.string().min(1, "Nom requis"),
});

export const subjectSchema = z.object({
  code: z.string().min(1, "Code requis").regex(/^[a-z0-9_]+$/, "Minuscules, chiffres, underscores uniquement"),
  name: z.string().min(1, "Nom requis"),
  icon: z.string().optional(),
});

export const levelSubjectSchema = z.object({
  levelId: z.string().uuid(),
  seriesId: z.string().uuid().nullable().optional(),
  subjectId: z.string().uuid(),
  isOptional: z.coerce.boolean().optional().default(false),
});

export const studentOnboardingSchema = z.object({
  levelId: z.string().uuid("Niveau requis"),
  seriesId: z.string().uuid().nullable().optional(),
  subjectIds: z.array(z.string().uuid()).min(1, "Choisis au moins une matière"),
});

const CONTENT_STATUSES = ["draft", "review", "validated", "published", "archived"] as const;

export const curriculumSchema = z.object({
  levelId: z.string().uuid("Niveau requis"),
  seriesId: z.string().uuid().nullable().optional(),
  subjectId: z.string().uuid("Matière requise"),
  title: z.string().min(1, "Titre requis"),
  description: z.string().optional(),
  version: z.string().min(1, "Version requise (ex: 2026)"),
  source: z.string().optional(),
  sourceUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  sourceDocument: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const curriculumStatusSchema = z.object({
  curriculumId: z.string().uuid(),
  status: z.enum(CONTENT_STATUSES),
});

export const chapterSchema = z.object({
  curriculumId: z.string().uuid("Programme requis"),
  domainId: z.string().uuid().nullable().optional(),
  title: z.string().min(1, "Titre requis"),
  order: z.coerce.number().int().min(0),
  source: z.string().optional(),
  sourceUrl: z.string().url("URL invalide").optional().or(z.literal("")),
});

export const chapterStatusSchema = z.object({
  chapterId: z.string().uuid(),
  status: z.enum(CONTENT_STATUSES),
});

export const competencySchema = z.object({
  domainId: z.string().uuid("Domaine requis"),
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0),
});

export const domainSchema = z.object({
  curriculumId: z.string().uuid("Programme requis"),
  name: z.string().min(1, "Nom requis"),
  order: z.coerce.number().int().min(0),
});

export const lessonSchema = z.object({
  chapterId: z.string().uuid("Chapitre requis"),
  competencyId: z.string().uuid().nullable().optional(),
  title: z.string().min(1, "Titre requis"),
  contentMd: z.string().min(1, "Contenu requis"),
  objectives: z.string().optional(), // une ligne par objectif, converti en tableau
  summary: z.string().optional(),
  order: z.coerce.number().int().min(0),
  source: z.string().optional(),
  sourceUrl: z.string().url("URL invalide").optional().or(z.literal("")),
});

export const lessonStatusSchema = z.object({
  lessonId: z.string().uuid(),
  status: z.enum(CONTENT_STATUSES),
});
