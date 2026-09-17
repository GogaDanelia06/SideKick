import { z } from "zod";
import type { AuthMessageKey } from "@/lib/auth/messages";
import { NAME_PATTERN, PASSWORD_NUMBER_OR_SYMBOL_PATTERN, PHONE_PATTERN } from "./patterns";

/** Messages are AUTH_MESSAGES keys; the route answers with the text in both languages. */
const code = (key: AuthMessageKey) => key;

export const passwordSchema = z
  .string()
  .min(8, code("passwordLength"))
  .regex(/[a-z]/, code("passwordLowercase"))
  .regex(/[A-Z]/, code("passwordUppercase"))
  .regex(PASSWORD_NUMBER_OR_SYMBOL_PATTERN, code("passwordNumberOrSymbol"));

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, code("firstNameRequired"))
    .regex(NAME_PATTERN, code("nameInvalid")),
  lastName: z
    .string()
    .trim()
    .refine((value) => !value || NAME_PATTERN.test(value), { message: code("nameInvalid") })
    .optional()
    .default(""),
  email: z.string().trim().email(code("emailInvalid")),
  password: passwordSchema,
  phone: z
    .string()
    .trim()
    .refine((value) => !value || PHONE_PATTERN.test(value), { message: code("phoneInvalid") })
    .optional()
    .default(""),
  company: z.string().trim().max(120, code("companyTooLong")).optional().default(""),
  field: z.string().trim().max(120, code("fieldTooLong")).optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, code("emailRequired")).email(code("emailInvalid")),
  password: z.string().min(1, code("passwordRequired")),
});

export const forgotSchema = z.object({
  email: z.string().trim().email(code("emailInvalid")),
});

export const resetSchema = z
  .object({
    token: z.string().min(32, code("linkInvalid")),
    password: passwordSchema,
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: code("passwordsMismatch"),
    path: ["repeatPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
