import { goByAuth } from "@/lib/auth/entry";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";

// The answer depends on who is asking, so it can never be cached.
export const dynamic = "force-dynamic";

/**
 * Where the header's "პროფილი" button points.
 *
 * Signed in, you wanted your dashboard. Signed out, you wanted to sign in.
 * Both are the same button to the person pressing it.
 */
export default async function AccountEntry() {
  return goByAuth(DASH.home, ROUTES.login);
}
