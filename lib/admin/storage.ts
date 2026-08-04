import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

/**
 * Where uploaded admin media goes.
 *
 * Production uses Vercel Blob. Development writes into `public/uploads/`, so
 * the panel is fully usable on a laptop without anyone having to create a blob
 * store first — which was the difference between "the upload button is broken"
 * and "the upload button works".
 *
 * The local path is deliberately never taken in production: a serverless
 * filesystem is read-only, and anything written to one instance would not exist
 * on the next. A production deploy with no token is genuinely unconfigured, and
 * says so.
 */

export type StoredMedia = { url: string };
export type StorageResult = StoredMedia | { error: "not_configured" };

/** Whether an upload can succeed at all right now. */
export function storageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || process.env.NODE_ENV !== "production";
}

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

/** Random rather than derived from the filename, so URLs are not guessable. */
function filename(ext: string): string {
  return `${randomUUID()}.${ext}`;
}

async function storeLocally(file: File, ext: string): Promise<StoredMedia> {
  await mkdir(LOCAL_DIR, { recursive: true });
  const name = filename(ext);
  await writeFile(path.join(LOCAL_DIR, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}` };
}

export async function storeMedia(
  file: File,
  ext: string,
  contentType: string,
): Promise<StorageResult> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`admin/${filename(ext)}`, file, {
      access: "public",
      contentType,
    });
    return { url: blob.url };
  }

  if (process.env.NODE_ENV !== "production") return storeLocally(file, ext);

  return { error: "not_configured" };
}
