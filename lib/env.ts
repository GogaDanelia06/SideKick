import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(1, "AUTH_SECRET is required (generate one with: openssl rand -base64 32)"),
  AUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  // Optional on purpose: unset means /api/agent/* is closed, which is the right
  // state for an environment the AI service has not been pointed at. Required
  // here would break every deploy that has no AI integration yet.
  AI_SERVICE_TOKEN: z.string().min(32, "AI_SERVICE_TOKEN must be at least 32 characters").optional(),
  // Where we push "a customer wrote in" so the AI service can answer. Optional
  // for the same reason as the token above — until the AI team hands over an
  // endpoint, messages are still recorded, just not announced.
  AI_SERVICE_WEBHOOK_URL: z.string().url("AI_SERVICE_WEBHOOK_URL must be a full URL").optional(),
  AI_SERVICE_WEBHOOK_TOKEN: z.string().min(32).optional(),
  // Meta's app secret, used to prove an inbound webhook really came from
  // Facebook. Optional so deploys without a connected Meta app still boot —
  // /api/webhooks/messenger answers 503 rather than accepting unsigned events.
  META_APP_SECRET: z.string().min(1).optional(),
  // The string Meta echoes back during the one-time callback handshake. Ours to
  // invent; it only has to match what is typed into the App Dashboard.
  META_VERIFY_TOKEN: z.string().min(16, "META_VERIFY_TOKEN should be at least 16 characters").optional(),
});

type Env = z.infer<typeof schema>;
let cached: Env | undefined;

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
