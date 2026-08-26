import { z } from "zod";

const CONTENT_STATUSES = ["draft", "review", "validated", "published", "archived"] as const;
const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
const QUESTION_TYPES = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "numeric",
  "short_answer",
  "matching",
  "ordering",
] as const;

export const exerciseSchema = z.object({
  lessonId: z.string().uuid("Leçon requise"),
  competencyId: z.string().uuid().nullable().optional(),
  title: z.string().min(1, "Titre requis"),
  instructions: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES),
  difficultyScore: z.coerce.number().int().min(0).max(100),
});

export const exerciseStatusSchema = z.object({
  exerciseId: z.string().uuid(),
  status: z.enum(CONTENT_STATUSES),
});

export const questionSchema = z.object({
  exerciseId: z.string().uuid("Exercice requis"),
  competencyId: z.string().uuid().nullable().optional(),
  type: z.enum(QUESTION_TYPES),
  prompt: z.string().min(1, "Énoncé requis"),
  explanation: z.string().optional(),
  points: z.coerce.number().int().min(0).default(10),
  difficultyScore: z.coerce.number().int().min(0).max(100).default(50),
  answerData: z.string().min(1, "Réponses requises — voir le format attendu ci-dessous"),
});

export const questionStatusSchema = z.object({
  questionId: z.string().uuid(),
  status: z.enum(CONTENT_STATUSES),
});
