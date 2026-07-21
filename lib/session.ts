import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { env } from "@/lib/env";

export type Ctx = { userId: string; businessId: string; role: string };

export async function getContext(): Promise<Ctx | null> {
  // Request-time config check: surfaces a clear "you forgot to set X" error
  // instead of a confusing auth/database failure further down. Cached after
  // the first call, and never runs during `next build`.
  env();

  const session = await auth();
  const userId = session?.user?.id;
  const businessId = session?.user?.businessId;
  if (!userId || !businessId) return null;
  return { userId, businessId, role: session.user.role ?? "VIEWER" };
}

/**
 * Server-component guard for the dashboard: returns the auth context, or
 * redirects to /login when there's no valid session. Middleware already blocks
 * unauthenticated access to /dashboard; this is the defense-in-depth check that
 * also gives pages the tenant-scoped businessId to query with.
 */
export async function requireContext(): Promise<Ctx> {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  return ctx;
}
