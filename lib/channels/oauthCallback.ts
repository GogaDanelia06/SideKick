import { getContext } from "@/lib/session";
import { can } from "@/lib/auth/permissions";
import { readState } from "./oauthState";
import { log } from "@/lib/logger";

/**
 * The checks every channel callback has to pass before a credential is stored.
 *
 * Three things have to agree, and the reason is worth stating plainly: whoever
 * controls a callback controls which account a business answers for. Get it
 * wrong and one tenant's customers can be routed into another tenant's inbox.
 *
 *   1. There is a signed-in session — so we know who is asking.
 *   2. The `state` carries our own signature and has not expired.
 *   3. The business inside that state is the business now signed in.
 *
 * Any one of the three alone is bypassable; together they are not. Shared by
 * both flows so that adding a third channel cannot quietly ship with two of
 * them.
 */
export type Guarded =
  | { ok: true; businessId: string; code: string }
  | { ok: false; status: "cancelled" | "signed_out" | "bad_state" | "forbidden" };

export async function guardCallback(request: Request): Promise<Guarded> {
  const params = new URL(request.url).searchParams;

  // The merchant pressed cancel, or Meta refused. Not an error worth alarming
  // anyone about — they simply did not finish.
  if (params.get("error")) return { ok: false, status: "cancelled" };

  const ctx = await getContext();
  if (!ctx) return { ok: false, status: "signed_out" };

  // Being signed in was the whole check, and the channels page renders a
  // "Connect" button for everyone. So a view-only account could consent with a
  // Facebook Page of their own and overwrite the merchant's page id and token:
  // from that moment every real customer message is dropped — inbound routes by
  // the stored account id — while the merchant's AI answers into a stranger's
  // inbox. Placed before the state is read, so a captured callback URL replayed
  // by the wrong role is refused whether or not its state is still valid.
  if (!can(ctx.role, "channels:write")) {
    log.warn("channel connect refused — the signed-in role may not change channels", {
      role: ctx.role,
    });
    return { ok: false, status: "forbidden" };
  }

  const state = readState(params.get("state"));
  if (!state) {
    log.warn("channel connect callback arrived with a bad or expired state");
    return { ok: false, status: "bad_state" };
  }

  if (state.businessId !== ctx.businessId) {
    // The link was started for one business and finished by another. Either a
    // stale tab or somebody being walked into it; refused the same way.
    log.warn("channel connect state did not match the signed-in business");
    return { ok: false, status: "bad_state" };
  }

  const code = params.get("code");
  if (!code) return { ok: false, status: "bad_state" };

  return { ok: true, businessId: ctx.businessId, code };
}
