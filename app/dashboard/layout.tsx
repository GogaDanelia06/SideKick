import type { Metadata } from "next";
import { requireContext } from "@/lib/session";
import { getAccount } from "@/lib/dashboard/queries";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireContext();
  const account = await getAccount(ctx.userId, ctx.businessId);

  return <DashboardShell account={account}>{children}</DashboardShell>;
}
