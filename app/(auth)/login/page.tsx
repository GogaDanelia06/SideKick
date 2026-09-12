import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { googleSignInEnabled } from "@/lib/auth/providers";

export const metadata: Metadata = { title: "შესვლა" };
// Dynamic: the Google button depends on runtime environment variables.
export const dynamic = "force-dynamic";


export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm google={googleSignInEnabled()} />
    </Suspense>
  );
}
