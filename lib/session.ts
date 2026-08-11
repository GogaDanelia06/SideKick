import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { sessionIsStale } from "@/lib/auth/sessionExpiry";

export type Ctx = { userId: string; businessId: string; role: string };

/**
 * Confirms the account behind a signed-in session still exists.
 *
 * Sessions here are JWTs, which means they are believed on their own word for a
 * week. Nothing revokes one. Delete a user, remove someone from a team, and
 * their cookie keeps opening the dashboard until it expires on its own — a
 * removal that does not take effect for seven days is not a removal.
 *
 * One lookup on a primary key, wrapped in `cache()` so the several calls a
 * single page makes cost one query rather than several.
 */
const stillExists = cache(async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  return Boolean(user);
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

  // A cookie naming somebody who is gone is treated as no cookie at all. Left
  // unchecked it is worse than a signed-out visitor: the pages load, then fail
  // one by one on data that cannot be there, and the error looks like a bug in
  // whichever query happened to run first.
  if (!(await stillExists(userId))) return null;

  return { userId, businessId, role: session.user.role ?? "VIEWER" };
}

export async function requireContext(): Promise<Ctx> {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  return ctx;
}
