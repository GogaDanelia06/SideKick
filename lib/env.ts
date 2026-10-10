import { z } from "zod";

const blankIsMissing = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const required = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(1, "AUTH_SECRET is required (generate one with: openssl rand -base64 32)"),
});

const optional = z.object({
  AUTH_URL: blankIsMissing(z.string().url()),
  AUTH_GOOGLE_ID: blankIsMissing(z.string()),
  AUTH_GOOGLE_SECRET: blankIsMissing(z.string()),
  AI_SERVICE_TOKEN: blankIsMissing(
    z.string().min(32, "AI_SERVICE_TOKEN must be at least 32 characters"),
  ),
  AI_SERVICE_WEBHOOK_URL: blankIsMissing(
    z.string().url("AI_SERVICE_WEBHOOK_URL must be a full URL"),
  ),
  AI_SERVICE_WEBHOOK_TOKEN: blankIsMissing(z.string().min(32)),
  META_APP_SECRET: blankIsMissing(z.string().min(1)),
  META_VERIFY_TOKEN: blankIsMissing(
    z.string().min(16, "META_VERIFY_TOKEN should be at least 16 characters"),
  ),
  INSTAGRAM_APP_ID: blankIsMissing(z.string().min(1)),
  INSTAGRAM_APP_SECRET: blankIsMissing(z.string().min(1)),
});

type Env = z.infer<typeof required> & Partial<z.infer<typeof optional>>;
let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;

  const core = required.safeParse(process.env);
  if (!core.success) {
    const details = core.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment variables:\n${details}\n` +
        `Set these in your .env file locally, or in your host's environment settings (e.g. Vercel → Settings → Environment Variables).`,
    );
  }

  const extras = optional.safeParse(process.env);
  if (!extras.success) {
    for (const issue of extras.error.issues) {
      console.error(
        `[env] ignoring ${issue.path.join(".")}: ${issue.message}. ` +
          `The feature that uses it stays off until this is corrected.`,
      );
    }
  }

  const accepted: Record<string, unknown> = {};
  if (extras.success) {
    Object.assign(accepted, extras.data);
  } else {
    for (const [key, value] of Object.entries(optional.shape)) {
      const one = value.safeParse(process.env[key as keyof NodeJS.ProcessEnv]);
      if (one.success && one.data !== undefined) accepted[key] = one.data;
    }
  }

  cached = { ...core.data, ...accepted } as Env;
  return cached;
}

export function resetEnvCache() {
  cached = undefined;
}
