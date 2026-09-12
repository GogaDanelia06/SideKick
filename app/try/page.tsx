import { goByAuth } from "@/lib/auth/entry";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

/** "Try free": the dashboard for existing customers, otherwise registration. */
export default async function TryEntry() {
  return goByAuth(DASH.home, ROUTES.register);
}
