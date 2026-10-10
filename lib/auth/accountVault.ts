import { decode, type JWT } from "next-auth/jwt";
import { MAX_OTHER_ACCOUNTS, SESSION_COOKIE, VAULT_PREFIX } from "./sessionCookie";
import { sessionIsStale } from "./sessionExpiry";

export const VAULT_SLOTS = Array.from({ length: MAX_OTHER_ACCOUNTS }, (_, i) => `${VAULT_PREFIX}${i + 1}`);
export const labelOf = (slot: string) => `${slot}.who`;
export const LABEL_DAYS = 30;

type CookieLike = { name: string; value: string };
type Person = { uid: string; name: string; email: string };
export type OtherAccount = Person & { expired: boolean };
export type VaultEntry = OtherAccount & { slot: string; token?: string; session?: JWT };

export function sessionCookieName(cookies: CookieLike[], secure: boolean): string {
  const present = cookies.find((c) => SESSION_COOKIE.test(c.name));
  return present ? present.name.replace(/\.\d+$/, "") : `${secure ? "__Secure-" : ""}authjs.session-token`;
}

export function activeToken(cookies: CookieLike[], name: string): string | null {
  const whole = cookies.find((c) => c.name === name);
  if (whole) return whole.value;
  const part = (c: CookieLike) => Number(c.name.slice(name.length + 1));
  const chunks = cookies.filter((c) => /^\d+$/.test(c.name.slice(name.length + 1)) && c.name.startsWith(`${name}.`));
  return chunks.length > 0 ? chunks.sort((a, b) => part(a) - part(b)).map((c) => c.value).join("") : null;
}

export async function readSession(token: string, salt: string): Promise<JWT | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !token) return null;
  try {
    const session = await decode({ token, secret, salt });
    return session?.uid && !sessionIsStale(session) ? session : null;
  } catch {
    return null;
  }
}

export const personOf = (session: JWT): Person => {
  const email = session.email ?? "";
  return { uid: session.uid!, email, name: session.name?.trim() || email.split("@")[0] || "—" };
};

export const encodeLabel = (person: Person) => Buffer.from(JSON.stringify(person)).toString("base64url");

function readLabel(value: string | undefined): Person | null {
  try {
    const p = value ? JSON.parse(Buffer.from(value, "base64url").toString()) : null;
    return typeof p?.uid === "string" && typeof p.name === "string" && typeof p.email === "string" ? p : null;
  } catch {
    return null;
  }
}

export async function readVault(cookies: CookieLike[], salt: string): Promise<VaultEntry[]> {
  const value = (name: string) => cookies.find((c) => c.name === name)?.value;
  const entries = await Promise.all(
    VAULT_SLOTS.map(async (slot): Promise<VaultEntry | null> => {
      const token = value(slot);
      const session = token ? await readSession(token, salt) : null;
      if (token && session) return { ...personOf(session), slot, token, session, expired: false };
      const label = readLabel(value(labelOf(slot)));
      return label ? { ...label, slot, expired: true } : null;
    }),
  );
  return entries.filter((entry) => entry !== null);
}

export function otherAccounts(entries: VaultEntry[], activeUid?: string): OtherAccount[] {
  const byUid = new Map<string, OtherAccount>();
  for (const { uid, name, email, expired } of entries) {
    const seen = byUid.get(uid);
    if (uid === activeUid || (seen && !(seen.expired && !expired))) continue;
    byUid.set(uid, { uid, name, email, expired });
  }
  return [...byUid.values()];
}

export function slotFor(entries: VaultEntry[], uid: string): string | undefined {
  return (
    entries.find((e) => e.uid === uid)?.slot ??
    VAULT_SLOTS.find((slot) => !entries.some((e) => e.slot === slot)) ??
    entries.find((e) => e.expired)?.slot
  );
}

export function cookieOptions(session: JWT, secure: boolean) {
  const expires = session.remember && typeof session.exp === "number" ? new Date(session.exp * 1000) : undefined;
  return { httpOnly: true, sameSite: "lax" as const, path: "/", secure, ...(expires ? { expires } : {}) };
}
