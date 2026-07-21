import { z } from "zod";

/**
 * Validates required environment variables once, at server startup, with a
 * clear error listing anything missing/invalid — so misconfiguration fails
 * loudly on boot instead of surfacing as a confusing runtime error later.
 *
 * Server-only: import from Node code (e.g. lib/db.ts). Do NOT import from edge
 * middleware — DATABASE_URL isn't needed there and Prisma can't run in it.
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(1, "AUTH_SECRET is required (generate one with: openssl rand -base64 32)"),
  AUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${details}`);
}

export const env = parsed.data;
