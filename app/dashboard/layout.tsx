import type { Metadata } from "next";
import { requireContext } from "@/lib/session";
import { getAccount } from "@/lib/dashboard/queries";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

// Every page in here renders per-signed-in-user data, so none of it may be
// statically prerendered or cached — that would risk serving one tenant's data
// to another, and would force build-time evaluation of runtime-only config.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolved here so the account card shows the real signed-in user on every
  // dashboard page, rather than each page having to pass it down.
  const ctx = await requireContext();
  const account = await getAccount(ctx.userId, ctx.businessId);

  return <DashboardShell account={account}>{children}</DashboardShell>;
}
