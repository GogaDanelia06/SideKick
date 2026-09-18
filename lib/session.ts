import { cache } from "react";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { sessionIsStale } from "@/lib/auth/sessionExpiry";
import { log } from "@/lib/logger";

export type Ctx = { userId: string; businessId: string; role: string };

/**
 * The caller's current role, read from the membership row on every request. JWTs
 * cannot be revoked, so the token is trusted for who is asking, never for what
 * they may do. Cached per request.
 */
const currentRole = cache(async (userId: string, businessId: string): Promise<Role | null> => {
  const membership = await prisma.membership.findUnique({
    where: { userId_businessId: { userId, businessId } },
    select: { role: true },
  });
  return membership?.role ?? null;
});

export async function getContext(): Promise<Ctx | null> {
  env();

  const session = await auth();
  const userId = session?.user?.id;
  const businessId = session?.user?.businessId;
  if (!userId || !businessId) return null;

  // Server actions do not pass through the proxy, so staleness is checked here too.
  if (sessionIsStale(session.user)) {
    log.info("session refused — too old to honour", { userId });
    return null;
  }

  const role = await currentRole(userId, businessId);
  if (!role) {
    // Usually a removed membership or a half-finished registration (scripts/find-orphan-users.ts).
    log.warn("session refused — no membership for this user and business", {
      userId,
      businessId,
    });
    return null;
  }

  return { userId, businessId, role };
}

/**
 * Changes with every sign-in and every business switch, so what one login kept in the
 * browser is never shown to the next, nor in another business.
 */
export async function currentLoginId(): Promise<string> {
  const session = await auth();
  const user = session?.user;
  return `${user?.id ?? "anonymous"}.${user?.startedAt ?? 0}.${user?.businessId ?? "none"}`;
}

export async function requireContext(): Promise<Ctx> {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  return ctx;
}
