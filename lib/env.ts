import { z } from "zod";

/**
 * Treats a blank value as "not set".
 *
 * Hosting panels make this the normal case rather than the exception: adding a
 * variable and leaving the value box empty stores an empty string, and so does
 * clearing one out later. Without this, `""` is a *present* value that then
 * fails every rule below, so a placeholder somebody meant to fill in later
 * reads as a broken configuration.
 */
const blankIsMissing = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

/**
 * Without these the application cannot serve a single signed-in request, so
 * failing loudly is the honest outcome — there is nothing to degrade to.
 */
const required = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(1, "AUTH_SECRET is required (generate one with: openssl rand -base64 32)"),
});

/**
 * Everything a feature needs but the application can live without.
 *
 * Each of these switches one integration on. None of them has anything to do
 * with whether a merchant can open their dashboard, and the schema must not
 * pretend otherwise — see `env()` for what happens when one is malformed.
 */
const optional = z.object({
  AUTH_URL: blankIsMissing(z.string().url()),
  AUTH_GOOGLE_ID: blankIsMissing(z.string()),
  AUTH_GOOGLE_SECRET: blankIsMissing(z.string()),
  // Unset means /api/agent/* is closed, which is the right state for an
  // environment the AI service has not been pointed at.
  AI_SERVICE_TOKEN: blankIsMissing(
    z.string().min(32, "AI_SERVICE_TOKEN must be at least 32 characters"),
  ),
  // Where we push "a customer wrote in" so the AI service can answer. Until the
  // AI team hands over an endpoint, messages are still recorded, just not
  // announced.
  AI_SERVICE_WEBHOOK_URL: blankIsMissing(
    z.string().url("AI_SERVICE_WEBHOOK_URL must be a full URL"),
  ),
  AI_SERVICE_WEBHOOK_TOKEN: blankIsMissing(z.string().min(32)),
  // Meta's app secret, used to prove an inbound webhook really came from
  // Facebook. Without it /api/webhooks/messenger answers 503 rather than
  // accepting unsigned events.
  META_APP_SECRET: blankIsMissing(z.string().min(1)),
  // The string Meta echoes back during the one-time callback handshake. Ours to
  // invent; it only has to match what is typed into the App Dashboard.
  META_VERIFY_TOKEN: blankIsMissing(
    z.string().min(16, "META_VERIFY_TOKEN should be at least 16 characters"),
  ),
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

  // A malformed optional variable disables its own feature and nothing else.
  //
  // This used to throw alongside the required ones, and the cost of that was
  // out of all proportion: `env()` runs on every signed-in request, so one
  // mistyped integration setting — a webhook URL with no scheme, a token pasted
  // short — took the entire dashboard down with a blank error page, while the
  // marketing site carried on and made the cause look like anything but
  // configuration. A tenant losing their orders screen over a Facebook setting
  // they never asked for is the wrong trade in every direction.
  const extras = optional.safeParse(process.env);
  if (!extras.success) {
    for (const issue of extras.error.issues) {
      console.error(
        `[env] ignoring ${issue.path.join(".")}: ${issue.message}. ` +
          `The feature that uses it stays off until this is corrected.`,
      );
    }
  }

  // Keep whatever did parse. `safeParse` gives nothing back on failure, so the
  // good values are recovered one at a time rather than lost with the bad one.
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

/** Test-only: forget the parsed values so the next call reads `process.env` again. */
export function resetEnvCache() {
  cached = undefined;
}
