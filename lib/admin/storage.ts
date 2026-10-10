import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

export type StoredMedia = { url: string };
export type StorageResult = StoredMedia | { error: "not_configured" };

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

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
  folder = "admin",
): Promise<StorageResult> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${filename(ext)}`, file, {
      access: "public",
      contentType,
    });
    return { url: blob.url };
  }

  if (process.env.NODE_ENV !== "production") return storeLocally(file, ext);

  return { error: "not_configured" };
}

export async function removeStoredMedia(url: string): Promise<void> {
  try {
    if (url.startsWith("/uploads/")) {
      await unlink(path.join(LOCAL_DIR, path.basename(url)));
    } else if (process.env.BLOB_READ_WRITE_TOKEN && new URL(url).hostname.endsWith(".public.blob.vercel-storage.com")) {
      await del(url);
    }
  } catch {}
}
