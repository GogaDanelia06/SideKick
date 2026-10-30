import type { ChannelType } from "@prisma/client";
import { log } from "@/lib/logger";
import { GRAPH_INSTAGRAM, graphHostFor } from "./graphHost";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";
const TIMEOUT_MS = 5_000;

export type AccountProfile = {
  name: string;
  username: string | null;
  picture: string | null;
  followers: number | null;
  posts: number | null;
  link: string | null;
};

type Raw = {
  name?: string;
  username?: string;
  link?: string;
  profile_picture_url?: string;
  picture?: { data?: { url?: string } };
  followers_count?: number;
  media_count?: number;
  error?: { message?: string; code?: number };
};

type Reply = { ok: true; body: Raw } | { ok: false; answered: boolean };

const PICTURE = "picture.width(96).height(96){url}";

const FIELDS: Partial<Record<ChannelType, string[]>> = {
  INSTAGRAM: ["username,name,profile_picture_url,followers_count,media_count", "username,name,profile_picture_url"],
  FACEBOOK: [`name,link,followers_count,${PICTURE}`, `name,link,${PICTURE}`],
};

export async function fetchAccountProfile(
  type: ChannelType,
  externalId: string,
  token: string,
): Promise<AccountProfile | null> {
  const host = graphHostFor(type, token);
  const node = host === GRAPH_INSTAGRAM ? "me" : externalId;

  for (const fields of FIELDS[type] ?? []) {
    const reply = await read(host, node, fields, token);
    if (reply.ok) return toProfile(type, externalId, reply.body);
    if (!reply.answered) return null;
  }
  return null;
}

const https = (url: string | undefined) => (url?.startsWith("https://") ? url : null);
const count = (n: number | undefined) => (typeof n === "number" ? n : null);

function toProfile(type: ChannelType, id: string, raw: Raw): AccountProfile | null {
  const username = raw.username?.trim() || null;
  const name = raw.name?.trim() || username;
  if (!name) return null;

  return {
    name,
    username,
    picture: https(raw.profile_picture_url ?? raw.picture?.data?.url),
    followers: count(raw.followers_count),
    posts: count(raw.media_count),
    link:
      type === "INSTAGRAM"
        ? username && `https://www.instagram.com/${encodeURIComponent(username)}`
        : (https(raw.link) ?? `https://www.facebook.com/${encodeURIComponent(id)}`),
  };
}

async function read(host: string, node: string, fields: string, token: string): Promise<Reply> {
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
      return { ok: false, answered: true };
    }
    return { ok: true, body };
  } catch (err) {
    log.warn("connected account lookup failed", {
      ...where,
      detail: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, answered: false };
  } finally {
    clearTimeout(timer);
  }
}
