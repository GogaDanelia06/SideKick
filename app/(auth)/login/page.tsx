import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { googleSignInEnabled } from "@/lib/auth/providers";

export const metadata: Metadata = { title: "შესვლა" };
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


export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm google={googleSignInEnabled()} />
    </Suspense>
  );
}
