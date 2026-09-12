import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

/** "Get started": billing when signed in, otherwise registration with billing as the destination. */
export default async function StartPage() {
  const session = await auth();

  if (session?.user) redirect(DASH.billing);
  redirect(`${ROUTES.register}?callbackUrl=${encodeURIComponent(DASH.billing)}`);
}
