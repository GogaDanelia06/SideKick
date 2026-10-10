import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { googleSignInEnabled } from "@/lib/auth/providers";

export const metadata: Metadata = { title: "რეგისტრაცია" };
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm google={googleSignInEnabled()} />
    </Suspense>
  );
}
