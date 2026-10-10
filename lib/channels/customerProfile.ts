import { log } from "@/lib/logger";
import { GRAPH_FACEBOOK } from "./graphHost";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";

const TIMEOUT_MS = 5_000;

type Profile = {
  first_name?: string;
  last_name?: string;
  name?: string;
  username?: string;
  error?: { message?: string; code?: number };
};

function nameFrom(profile: Profile): string | null {
  const full = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return full || profile.name?.trim() || profile.username?.trim() || null;
}

export async function fetchCustomerName(
  customerId: string,
  accessToken: string,
  fields: string,
  host: string = GRAPH_FACEBOOK,
): Promise<string | null> {
  const attempt = {
    host: new URL(host).host,
    fields,
    credential: accessToken.startsWith("IGA") ? "instagram-login" : "page-token",
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `${host}/${GRAPH_VERSION}/${customerId}` +
        `?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`,
      { signal: controller.signal },
    );
    const body = (await res.json().catch(() => ({}))) as Profile;

    if (!res.ok || body.error) {
      log.warn("could not read a customer profile from Meta", {
        ...attempt,
        code: body.error?.code,
        detail: body.error?.message ?? `HTTP ${res.status}`,
      });
      return null;
    }

    const name = nameFrom(body);
    if (!name) {
      log.warn("Meta returned a profile with no name", {
        ...attempt,
        keys: Object.keys(body).join(",") || "(empty response)",
      });
    }
    return name;
  } catch (err) {
    log.warn("customer profile lookup failed", {
      ...attempt,
      detail: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    clearTimeout(timer);
  }
}
