import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { env } from "@/lib/env";

export type Ctx = { userId: string; businessId: string; role: string };

export async function getContext(): Promise<Ctx | null> {
  env();

  const session = await auth();
  const userId = session?.user?.id;
  const businessId = session?.user?.businessId;
  if (!userId || !businessId) return null;
  return { userId, businessId, role: session.user.role ?? "VIEWER" };
}

export async function requireContext(): Promise<Ctx> {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  return ctx;
}
