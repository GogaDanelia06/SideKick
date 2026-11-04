import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { log } from "@/lib/logger";

const PREFIX = "enc:v1:";
const KEY_BYTES = 32;
const IV_BYTES = 12;

function key(): Buffer | null {
  const raw = process.env.TOKEN_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  const bytes = Buffer.from(raw, "base64");
  if (bytes.length !== KEY_BYTES) {
    log.error("TOKEN_ENCRYPTION_KEY must be 32 bytes of base64; tokens are stored unencrypted");
    return null;
  }
  return bytes;
}

export function isSealed(stored: string): boolean {
  return stored.startsWith(PREFIX);
}

export function sealToken(plain: string): string {
  const secret = key();
  if (!secret || isSealed(plain)) return plain;
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", secret, iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return PREFIX + [iv, cipher.getAuthTag(), body].map((b) => b.toString("base64")).join(":");
}

export function openToken(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (!isSealed(stored)) return stored;
  const secret = key();
  const parts = stored.slice(PREFIX.length).split(":");
  const [iv, tag, body] = parts.map((part) => Buffer.from(part, "base64"));
  if (!secret || !iv || !tag || !body) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", secret, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
  } catch {
    log.error("a stored access token could not be decrypted; was TOKEN_ENCRYPTION_KEY changed?");
    return null;
  }
}
