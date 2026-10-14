import type { AiFailure } from "@/lib/ai/call";

export function promptFailure({ kind, status, waitedMs }: AiFailure) {
  return { ok: false as const, error: "failed" as const, reason: kind, status, seconds: Math.round(waitedMs / 1000) };
}
