import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RememberedAccounts } from "@/components/auth/RememberedAccounts";
import { listOtherAccounts } from "@/lib/auth/otherAccounts";
import { googleSignInEnabled } from "@/lib/auth/providers";

export const metadata: Metadata = { title: "შესვლა" };
// Dynamic: the Google button depends on runtime environment variables.
export const dynamic = "force-dynamic";


export default async function LoginPage() {
  // Accounts still signed in on this browser, e.g. after "Sign in with another account".
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
