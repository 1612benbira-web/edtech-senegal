import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  phone: z.string().optional(),
  schoolCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  levelId: z.string().uuid().optional(),
  seriesId: z.string().uuid().nullable().optional(),
  dailyGoal: z.number().int().min(1).max(50).optional(),
});
// Remarque : 'role' et 'xp_total' ne figurent volontairement pas dans ce schéma —
// ils ne doivent jamais être modifiables par l'élève lui-même.

export const exerciseAttemptSchema = z.object({
  questionId: z.string().uuid(),
  answerPayload: z.unknown(),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ExerciseAttemptInput = z.infer<typeof exerciseAttemptSchema>;
