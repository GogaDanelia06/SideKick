import { auth } from "@/auth";

export type Ctx = { userId: string; businessId: string; role: string };

export async function getContext(): Promise<Ctx | null> {
  const session = await auth();
  const userId = session?.user?.id;
  const businessId = session?.user?.businessId;
  if (!userId || !businessId) return null;
  return { userId, businessId, role: session.user.role ?? "VIEWER" };
}
