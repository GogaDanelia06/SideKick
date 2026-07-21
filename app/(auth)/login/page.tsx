import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "შესვლა" };

export default function LoginPage() {
  // LoginForm reads ?callbackUrl via useSearchParams, which needs a Suspense
  // boundary so the rest of the page can still be prerendered.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
