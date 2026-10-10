import { log } from "@/lib/logger";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const TIMEOUT_MS = 15_000;

export type Page = {
  id: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: { id?: string };
};

export const graph = <T>(path: string) => call<T>(path, "GET");
export const graphPost = <T>(path: string) => call<T>(path, "POST");

async function call<T>(path: string, method: "GET" | "POST"): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}${path}`, {
      method,
      signal: controller.signal,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || body.error) {
      log.error("Meta refused a Graph call during connect", undefined, {
        detail: body?.error?.message ?? `HTTP ${res.status}`,
      });
      return null;
    }
    return body as T;
  } catch (err) {
    log.error("Graph call failed during connect", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
