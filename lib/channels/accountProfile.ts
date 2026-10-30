import type { ChannelType } from "@prisma/client";
import { log } from "@/lib/logger";
import { GRAPH_INSTAGRAM, graphHostFor } from "./graphHost";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const TIMEOUT_MS = 5_000;

export type AccountProfile = {
  name: string;
  username: string | null;
  picture: string | null;
  link: string | null;
};

type Raw = {
  name?: string;
  username?: string;
  link?: string;
  profile_picture_url?: string;
  picture?: { data?: { url?: string } };
  error?: { message?: string; code?: number };
};

const FIELDS: Partial<Record<ChannelType, string>> = {
  INSTAGRAM: "username,name,profile_picture_url",
  FACEBOOK: "name,link,picture.width(96).height(96){url}",
};

export async function fetchAccountProfile(
  type: ChannelType,
  externalId: string,
  token: string,
): Promise<AccountProfile | null> {
  const fields = FIELDS[type];
  if (!fields) return null;

  const host = graphHostFor(type, token);
  const raw = await read(host, host === GRAPH_INSTAGRAM ? "me" : externalId, fields, token);
  return raw ? toProfile(type, externalId, raw) : null;
}

const https = (url: string | undefined) => (url?.startsWith("https://") ? url : null);

function toProfile(type: ChannelType, id: string, raw: Raw): AccountProfile | null {
  const username = raw.username?.trim() || null;
  const name = raw.name?.trim() || username;
  if (!name) return null;

  return {
    name,
    username,
    picture: https(raw.profile_picture_url ?? raw.picture?.data?.url),
    link:
      type === "INSTAGRAM"
        ? username && `https://www.instagram.com/${encodeURIComponent(username)}`
        : (https(raw.link) ?? `https://www.facebook.com/${encodeURIComponent(id)}`),
  };
}

async function read(host: string, node: string, fields: string, token: string): Promise<Raw | null> {
  const where = { host: new URL(host).host, fields };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `${host}/${GRAPH_VERSION}/${node}` +
        `?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`,
      { signal: controller.signal, cache: "no-store" },
    );
    const body = (await res.json().catch(() => ({}))) as Raw;

    if (!res.ok || body.error) {
      log.warn("could not read the connected account from Meta", {
        ...where,
        code: body.error?.code,
        detail: body.error?.message ?? `HTTP ${res.status}`,
      });
      return null;
    }
    return body;
  } catch (err) {
    log.warn("connected account lookup failed", {
      ...where,
      detail: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    clearTimeout(timer);
  }
}
