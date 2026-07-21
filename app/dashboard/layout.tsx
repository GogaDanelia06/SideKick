import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

// Every page in here renders per-signed-in-user data, so none of it may be
// statically prerendered or cached — that would risk serving one tenant's data
// to another, and would force build-time evaluation of runtime-only config.
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
