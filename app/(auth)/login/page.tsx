import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RememberedAccounts } from "@/components/auth/RememberedAccounts";
import { listOtherAccounts } from "@/lib/auth/otherAccounts";
import { googleSignInEnabled } from "@/lib/auth/providers";

export const metadata: Metadata = { title: "შესვლა" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const remembered = await listOtherAccounts();

  return (
    <Suspense>
      <div className="flex w-full max-w-[400px] flex-col gap-5">
        <LoginForm google={googleSignInEnabled()} />
        {remembered.length > 0 ? <RememberedAccounts accounts={remembered} /> : null}
      </div>
    </Suspense>
  );
}
