import { goByAuth } from "@/lib/auth/entry";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

/** The header's profile button: the dashboard when signed in, otherwise the login page. */
export default async function AccountEntry() {
  return goByAuth(DASH.home, ROUTES.login);
}
