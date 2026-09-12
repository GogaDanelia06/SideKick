import { getContext } from "@/lib/session";
import { can } from "@/lib/auth/permissions";
import { readState } from "./oauthState";
import { log } from "@/lib/logger";

/**
 * Checks shared by the channel OAuth callbacks: a signed-in member allowed to
 * manage channels, and a valid signed `state` issued for that same business.
 */
export type Guarded =
  | { ok: true; businessId: string; code: string }
  | { ok: false; status: "cancelled" | "signed_out" | "bad_state" | "forbidden" };

export async function guardCallback(request: Request): Promise<Guarded> {
  const params = new URL(request.url).searchParams;

  if (params.get("error")) return { ok: false, status: "cancelled" };

  const ctx = await getContext();
  if (!ctx) return { ok: false, status: "signed_out" };

  // Without this, any member could replace the business's channel credentials.
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
    log.warn("channel connect state did not match the signed-in business");
    return { ok: false, status: "bad_state" };
  }

  const code = params.get("code");
  if (!code) return { ok: false, status: "bad_state" };

  return { ok: true, businessId: ctx.businessId, code };
}
