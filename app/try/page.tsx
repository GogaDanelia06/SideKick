import { goByAuth } from "@/lib/auth/entry";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";

// The answer depends on who is asking, so it can never be cached.
export const dynamic = "force-dynamic";

/**
 * Where "სცადე უფასოდ" points.
 *
 * Sending an existing customer to a sign-up form is the small insult this
 * exists to avoid — they already did that. They get their dashboard instead.
 */
export default async function TryEntry() {
  return goByAuth(DASH.home, ROUTES.register);
}
