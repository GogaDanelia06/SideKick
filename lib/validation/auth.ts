import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "სახელი სავალდებულოა"),
  lastName: z.string().trim().optional().default(""),
  email: z.string().email("არასწორი მეილი"),
  password: z.string().min(6, "მინიმუმ 6 სიმბოლო"),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  field: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
