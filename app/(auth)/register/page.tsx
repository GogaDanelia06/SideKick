import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { googleSignInEnabled } from "@/lib/auth/providers";

export const metadata: Metadata = { title: "რეგისტრაცია" };
// Dynamic: the Google button depends on runtime environment variables.
export const dynamic = "force-dynamic";


export default function RegisterPage() {
  // useSearchParams in the form requires a Suspense boundary.
  return (
    <Suspense>
      <RegisterForm google={googleSignInEnabled()} />
    </Suspense>
  );
}
