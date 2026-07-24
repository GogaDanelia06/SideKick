import { z } from "zod";

/**
 * One password rule, used by registration AND reset, so they can't drift apart.
 * 8 characters with a letter and a digit — enough to stop "123456" without
 * pushing people into writing passwords on sticky notes.
 */
export const passwordSchema = z
  .string()
  .min(8, "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო")
  .regex(/[a-zA-Zა-ჰ]/, "პაროლი უნდა შეიცავდეს ასო-ნიშანს")
  .regex(/[0-9]/, "პაროლი უნდა შეიცავდეს ციფრს");

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "სახელი სავალდებულოა"),
  lastName: z.string().trim().optional().default(""),
  email: z.string().email("არასწორი მეილი"),
  password: passwordSchema,
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  field: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotSchema = z.object({
  email: z.string().email("არასწორი მეილი"),
});

export const resetSchema = z
  .object({
    token: z.string().min(32, "ბმული არასწორია"),
    password: passwordSchema,
    repeatPassword: z.string(),
  })
  .refine((d) => d.password === d.repeatPassword, {
    message: "პაროლები არ ემთხვევა",
    path: ["repeatPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
