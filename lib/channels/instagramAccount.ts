import { log } from "@/lib/logger";

const GRAPH = "https://graph.instagram.com";
const VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const TIMEOUT_MS = 15_000;

export type InstagramAccount = { id: string; username: string };

async function call(
  path: string,
  token: string,
  method: "GET" | "POST",
): Promise<Record<string, unknown> | null> {
  const url = new URL(`${GRAPH}/${VERSION}${path}`);
  url.searchParams.set("access_token", token);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method, signal: controller.signal });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok || !data || data.error) {
      const error = data?.error as { message?: string } | undefined;
      log.error("Instagram Graph call failed", undefined, {
        path,
        detail: error?.message ?? `HTTP ${res.status}`,
      });
      return null;
    }
    return data;
  } catch (err) {
    log.error("Instagram Graph call threw", err, { path });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAccount(token: string): Promise<InstagramAccount | null> {
  const data = await call("/me?fields=user_id,username", token, "GET");
  const id = data?.user_id;

  if (typeof id !== "string" || !id) {
    if (id !== undefined) {
      log.error("Instagram returned a user_id that was not a string", undefined, {
        received: typeof id,
      });
    }
    return null;
  }

  return { id, username: typeof data?.username === "string" ? data.username : "" };
}

export async function subscribeToMessages(token: string): Promise<boolean> {
  const data = await call("/me/subscribed_apps?subscribed_fields=messages", token, "POST");
  return data?.success === true;
}
