import { z } from "zod";

// User Validation Schemas
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  photo: z.string().optional(),
  birthDate: z.string().optional().or(z.date().optional()),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;

// Collection Validation Schemas
export const createCollectionSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().trim().optional(),
  userId: z.string().min(1, "User ID is required"),
  skills: z.array(z.string()).optional().default([]),
});

export const updateCollectionSchema = z.object({
  title: z.string().min(1, "Title is required").trim().optional(),
  description: z.string().trim().optional(),
  skills: z.array(z.string()).optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

// Skill Validation Schema

export const createSkillSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().trim().optional(),
  category: z.string(),
});

export const updateSkillSchema = z.object({
  title: z.string().min(1, "Title is required").trim().optional(),
  description: z.string().trim().optional(),
  category: z.string().optional(),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;

// Verification Validation Schemas
export const verificationLevels = ["choice", "p2p_interview", "interview"] as const;
export const levelStatuses = ["pending", "completed", "failed"] as const;

const levelDataSchema = z.object({
  level: z.enum(verificationLevels, { message: "Invalid verification level" }),
  status: z.enum(levelStatuses).default("pending"),
  verifiedBy: z.string().optional(),
  verifiedAt: z.date().optional(),
  link: z.string().url({ message: "Invalid URL format" }).optional(),
  choice: z.object({
    questions: z.array(z.object({
      question: z.string().min(1, "Question is required"),
      options: z.array(z.string()).min(2, "At least 2 options required"),
      answer: z.string().min(1, "Answer is required"),
    })),
    userAnswers: z.array(z.string()).optional(),
    score: z.number().min(0).max(100).optional(),
  }).optional(),
});

export const createVerificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  skillId: z.string().min(1, "Skill ID is required"),
  levelData: z.array(levelDataSchema).default([]),
});

export const updateVerificationSchema = z.object({
  levelData: z.array(levelDataSchema).optional(),
});

export type CreateVerificationInput = z.infer<typeof createVerificationSchema>;
export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;

export const submitAnswersSchema = z.object({
  answers: z.array(z.string()).min(1, "Answers are required"),
});

export const completeLevelSchema = z.object({
  verifiedBy: z.string().optional(),
});

export type SubmitAnswersInput = z.infer<typeof submitAnswersSchema>;
export type CompleteLevelInput = z.infer<typeof completeLevelSchema>;

// Utility function to validate data
export function validateData(
  schema: z.ZodSchema,
  data: unknown
): { success: boolean; data?: unknown; error?: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    return { success: false, error: "Validation failed" };
  }
}
