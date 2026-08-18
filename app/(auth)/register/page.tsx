import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { googleSignInEnabled } from "@/lib/auth/providers";

export const metadata: Metadata = { title: "რეგისტრაცია" };
/**
 * Rendered per request, not at build time.
 *
 * The Google button is shown only when the provider is configured, and that is
 * read from the environment. Prerendered, the answer was baked into static HTML
 * at build time: adding AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET afterwards changed
 * nothing at all, and the only cure was a rebuild that nobody would guess was
 * needed. A login page is not hot enough for that trade.
 */
export const dynamic = "force-dynamic";


export default function RegisterPage() {
  // The form reads ?callbackUrl from the query string, which needs a Suspense
  // boundary for the page to still prerender — same as the login page.
  return (
    <Suspense>
      <RegisterForm google={googleSignInEnabled()} />
    </Suspense>
  );
}
