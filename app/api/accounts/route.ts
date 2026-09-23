import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";
import {
  LABEL_DAYS,
  activeToken,
  cookieOptions,
  encodeLabel,
  labelOf,
  personOf,
  readSession,
  readVault,
  sessionCookieName,
  slotFor,
} from "@/lib/auth/accountVault";
import { SESSION_COOKIE, VAULT_PREFIX, expiredCookie } from "@/lib/auth/sessionCookie";

/** Browsers drop a cookie over 4 KB, so a token that large cannot be parked in one. */
const MAX_TOKEN_CHARS = 3800;

const refuse = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });
const facts = (session: JWT) => ({ isAdmin: session.isAdmin === true, hasBusiness: Boolean(session.businessId) });

/**
 * The account switcher (lib/auth/accountVault.ts). `add` parks the open account and signs
 * the browser out before the login page: an open session would make Auth.js link a new
 * Google login to it. `switch` swaps a parked account in, `remove` forgets one, `leave`
 * signs the open one out and opens the next, and `clear` forgets them all, on logout.
 */
export async function POST(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  if ((site && site !== "same-origin") || !request.headers.get("content-type")?.startsWith("application/json")) {
    return refuse("invalid", 400);
  }
  const body: { action?: unknown; uid?: unknown } | null = await request.json().catch(() => null);

  const jar = await cookies();
  const all = jar.getAll();
  const secure = request.nextUrl.protocol === "https:";
  const name = sessionCookieName(all, secure);
  const token = activeToken(all, name);
  const active = token ? await readSession(token, name) : null;
  const entries = await readVault(all, name);

  const drop = (slot: string) => [slot, labelOf(slot)].forEach((n) => jar.set(expiredCookie(n, secure)));
  const endActive = () => all.filter((c) => SESSION_COOKIE.test(c.name)).forEach((c) => jar.set(expiredCookie(c.name, secure)));
  const open = (session: JWT, value: string) => jar.set(name, value, cookieOptions(session, secure));
  /** Parks a session in the person's own slot (else a free one), dropping any other slot of theirs. */
  function park(session: JWT, value: string, among = entries): boolean {
    const slot = slotFor(among, session.uid!);
    if (!slot || value.length > MAX_TOKEN_CHARS) return false;
    among.filter((e) => e.uid === session.uid && e.slot !== slot).forEach((e) => drop(e.slot));
    jar.set(slot, value, cookieOptions(session, secure));
    jar.set(labelOf(slot), encodeLabel(personOf(session)), { ...cookieOptions(session, secure), expires: new Date(Date.now() + LABEL_DAYS * 864e5) });
    return true;
  }

  switch (body?.action) {
    case "clear":
      all.filter((c) => c.name.startsWith(VAULT_PREFIX)).forEach((c) => jar.set(expiredCookie(c.name, secure)));
      return NextResponse.json({ ok: true });

    case "add":
      if (!token || !active) return refuse("signed_out", 401);
      if (!park(active, token)) return refuse("full", 409);
      endActive();
      return NextResponse.json({ ok: true });

    case "remove":
      entries.filter((e) => e.uid === body.uid && e.uid !== active?.uid).forEach((e) => drop(e.slot));
      return NextResponse.json({ ok: true });

    case "switch": {
      const target = entries.find((e) => e.uid === body.uid && !e.expired);
      if (!target?.session || !target.token) return refuse("gone", 404);
      drop(target.slot);
      endActive();
      // The open account stays one click away: its slot is reused, or the target's, now free.
      if (token && active && active.uid !== target.uid) park(active, token, entries.filter((e) => e !== target));
      open(target.session, target.token);
      return NextResponse.json({ ok: true, ...facts(target.session) });
    }

    case "leave": {
      endActive();
      if (active) entries.filter((e) => e.uid === active.uid).forEach((e) => drop(e.slot));
      const next = entries.find((e) => !e.expired && e.uid !== active?.uid);
      if (!next?.session || !next.token) return NextResponse.json({ ok: true, next: null });
      drop(next.slot);
      open(next.session, next.token);
      return NextResponse.json({ ok: true, next: facts(next.session) });
    }
  }
  return refuse("invalid", 400);
}
