import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(1, "AUTH_SECRET is required (generate one with: openssl rand -base64 32)"),
  AUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
});

type Env = z.infer<typeof schema>;
let cached: Env | undefined;

/**
 * Validates required environment variables the first time they're needed — at
 * request time, NOT at import time.
 *
 * This must stay lazy: `next build` collects page data by importing every
 * route, so eager validation would fail the whole build on a machine that has
 * no runtime secrets. The marketing site has no database dependency and must
 * deploy regardless; only the authenticated area needs these values.
 */
export function env(): Env {
  if (cached) return cached;

  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment variables:\n${details}\n` +
        `Set these in your .env file locally, or in your host's environment settings (e.g. Vercel → Settings → Environment Variables).`,
    );
  }

  cached = parsed.data;
  return cached;
}
