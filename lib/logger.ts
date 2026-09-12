type Level = "debug" | "info" | "warn" | "error";

const REDACT = [
  "password",
  "passwordhash",
  "token",
  "tokenhash",
  "secret",
  "apikey",
  "authorization",
  "cookie",
  "creditcard",
  "cardnumber",
  // URLs can carry secrets in their query string (Meta token exchanges).
  "url",
  "href",
  "uri",
];

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value !== "object") return value;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = REDACT.includes(k.toLowerCase().replace(/[_-]/g, "")) ? "[redacted]" : redact(v, depth + 1);
  }
  return out;
}

function emit(level: Level, message: string, context?: Record<string, unknown>) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...(context ? { context: redact(context) } : {}),
  };

  const line =
    process.env.NODE_ENV === "production"
      ? JSON.stringify(entry)
      : `[${level}] ${message}${context ? " " + JSON.stringify(redact(context)) : ""}`;

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  debug: (m: string, c?: Record<string, unknown>) =>
    process.env.NODE_ENV !== "production" && emit("debug", m, c),
  info: (m: string, c?: Record<string, unknown>) => emit("info", m, c),
  warn: (m: string, c?: Record<string, unknown>) => emit("warn", m, c),

  error(message: string, err?: unknown, context?: Record<string, unknown>): string {
    const errorId = Math.random().toString(16).slice(2, 8);
    emit("error", message, {
      errorId,
      ...(err instanceof Error
        ? { name: err.name, error: err.message, stack: err.stack }
        : err !== undefined
          ? { error: String(err) }
          : {}),
      ...context,
    });
    return errorId;
  },
};
