import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";

// The answer depends on who is asking, so it can never be cached.
export const dynamic = "force-dynamic";

/**
 * "Get started" — one address that lands everyone in the same place.
 *
 * Already signed in? Straight to billing, where a plan is chosen. Not signed
 * in? Off to register, carrying billing as the destination so the customer
 * arrives there once the account exists.
 *
 * This lives as a route rather than a check inside the button because the CTA
 * is rendered on a page that anyone can see: deciding in the browser would
 * either leak the answer into a cached page or flash the wrong link first.
 */
export default async function StartPage() {
  const session = await auth();

  if (session?.user) redirect(DASH.billing);
  redirect(`${ROUTES.register}?callbackUrl=${encodeURIComponent(DASH.billing)}`);
}
