import { cache } from "react";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { sessionIsStale } from "@/lib/auth/sessionExpiry";

export type Ctx = { userId: string; businessId: string; role: string };

/**
 * Reads the caller's *current* role in the business their session names.
 *
 * Sessions here are JWTs, which means they are believed on their own word.
 * Nothing revokes one, and `remember me` stops the expiry from bounding it. So
 * the token's `businessId` and `role` are a snapshot of the moment somebody
 * signed in, and everything downstream — every `requirePermission`, every
 * `can()` — trusts them.
 *
 * Checking only that the *user* row still existed was not enough, and the gap
 * was the dangerous kind. Remove someone from the team and their cookie kept
 * opening the merchant's whole inbox: reading customer conversations, exporting
 * leads, answering real customers as the business. Demote an owner and they
 * kept billing rights, including cancelling the paying client's subscription.
 * A removal that does not take effect is not a removal.
 *
 * So the membership is read instead, and its role is what the request runs as —
 * the token is only believed about *who* is asking, never about what they may
 * do. One indexed lookup on a compound unique key, wrapped in `cache()` so the
 * several calls a single page makes cost one query rather than several.
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

  // Middleware checks this too, but it cannot be the only place: it runs on the
  // edge for page navigations, and a Server Action reaching straight for the
  // context never passes through it.
  if (sessionIsStale(session.user)) return null;

  // A cookie naming somebody who no longer belongs here is treated as no cookie
  // at all. Left unchecked it is worse than a signed-out visitor: the pages
  // load, then fail one by one on data that cannot be there, and the error
  // looks like a bug in whichever query happened to run first.
  //
  // The role comes from this row, not from `session.user.role`. That is the
  // whole point — see the comment above.
  const role = await currentRole(userId, businessId);
  if (!role) return null;

  return { userId, businessId, role };
}

export async function requireContext(): Promise<Ctx> {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  return ctx;
}
