import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { log } from "@/lib/logger";

/**
 * Meta access tokens are sealed before they reach the database, so a leaked
 * row, backup or read-only database role cannot post as a tenant's Page.
 *
 * `TOKEN_ENCRYPTION_KEY` is 32 random bytes in base64 (`openssl rand -base64 32`).
 * Rows written before the key existed are plain text and are read as they are,
 * until `pnpm tokens:encrypt` seals them.
 */
const PREFIX = "enc:v1:";

function key(): Buffer | null {
  const raw = process.env.TOKEN_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  const bytes = Buffer.from(raw, "base64");
  if (bytes.length !== 32) {
    log.error("TOKEN_ENCRYPTION_KEY must be 32 bytes of base64; tokens are stored unencrypted");
    return null;
  }
  return bytes;
}

export function isSealed(stored: string): boolean {
  return stored.startsWith(PREFIX);
}

export function sealToken(plain: string): string {
  const k = key();
  if (!k || isSealed(plain)) return plain;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", k, iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return PREFIX + [iv, cipher.getAuthTag(), body].map((b) => b.toString("base64")).join(":");
}

/** The usable token, or null when it was sealed with a key this deployment does not have. */
export function openToken(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (!isSealed(stored)) return stored;
  const k = key();
  const [iv, tag, body] = stored.slice(PREFIX.length).split(":").map((p) => Buffer.from(p, "base64"));
  if (!k || !iv || !tag || !body) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", k, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
  } catch {
    log.error("a stored access token could not be decrypted; was TOKEN_ENCRYPTION_KEY changed?");
    return null;
  }
}
