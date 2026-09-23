import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";
import { listOtherAccounts } from "@/lib/auth/otherAccounts";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await requireAdmin();
  const [user, otherAccounts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    listOtherAccounts(userId),
  ]);

  // Same fallback as the tenant dashboard's account menu.
  const name = user?.name?.trim() || user?.email?.split("@")[0] || "—";

  return (
    <AdminShell name={name} email={user?.email ?? ""} otherAccounts={otherAccounts}>
      {children}
    </AdminShell>
  );
}
