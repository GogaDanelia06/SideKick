import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { googleSignInEnabled } from "@/lib/auth/providers";

export const metadata: Metadata = { title: "რეგისტრაცია" };

export default function RegisterPage() {
  // The form reads ?callbackUrl from the query string, which needs a Suspense
  // boundary for the page to still prerender — same as the login page.
  return (
    <Suspense>
      <RegisterForm google={googleSignInEnabled()} />
    </Suspense>
  );
}
