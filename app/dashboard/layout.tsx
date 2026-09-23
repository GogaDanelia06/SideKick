import type { Metadata } from "next";
import { requireContext } from "@/lib/session";
import { getAccount } from "@/lib/dashboard/queries/account";
import { listOtherAccounts } from "@/lib/auth/otherAccounts";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireContext();
  const [account, otherAccounts] = await Promise.all([
    getAccount(ctx.userId, ctx.businessId),
    listOtherAccounts(ctx.userId),
  ]);

  return <DashboardShell account={{ ...account, otherAccounts }}>{children}</DashboardShell>;
}
