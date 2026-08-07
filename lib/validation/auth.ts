import { z } from "zod";

const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿა-ჰ' -]+$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;
const PASSWORD_NUMBER_OR_SYMBOL_PATTERN =
  /[0-9]|[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

export const passwordSchema = z
  .string()
  .min(8, "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო")
  .regex(/[a-z]/, "პაროლი უნდა შეიცავდეს მინიმუმ ერთ პატარა ასოს")
  .regex(/[A-Z]/, "პაროლი უნდა შეიცავდეს მინიმუმ ერთ დიდ ასოს")
  .regex(
    PASSWORD_NUMBER_OR_SYMBOL_PATTERN,
    "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს ან სპეციალურ სიმბოლოს",
  );

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "სახელი სავალდებულოა")
    .regex(NAME_PATTERN, "სახელი შეიცავს დაუშვებელ სიმბოლოებს"),
  lastName: z
    .string()
    .trim()
    .refine((value) => !value || NAME_PATTERN.test(value), {
      message: "გვარი შეიცავს დაუშვებელ სიმბოლოებს",
    })
    .optional()
    .default(""),
  email: z.string().trim().email("არასწორი ელფოსტა"),
  password: passwordSchema,
  phone: z
    .string()
    .trim()
    .refine((value) => !value || PHONE_PATTERN.test(value), {
      message: "არასწორი ტელეფონის ნომერი",
    })
    .optional()
    .default(""),
  company: z.string().trim().max(120, "კომპანიის სახელი ძალიან გრძელია").optional().default(""),
  field: z.string().trim().max(120, "საქმიანობის სფერო ძალიან გრძელია").optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "ელფოსტა სავალდებულოა").email("არასწორი ელფოსტა"),
  password: z.string().min(1, "პაროლი სავალდებულოა"),
});

export const forgotSchema = z.object({
  email: z.string().trim().email("არასწორი ელფოსტა"),
});

export const resetSchema = z
  .object({
    token: z.string().min(32, "ბმული არასწორია"),
    password: passwordSchema,
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "პაროლები არ ემთხვევა",
    path: ["repeatPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
