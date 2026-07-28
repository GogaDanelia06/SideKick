import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isPlatformAdmin } from "@/lib/auth/admin";
import { log } from "@/lib/logger";

/**
 * Media upload for admin content (carousel slides, about photo).
 *
 * Stored in Vercel Blob. When no token is configured the endpoint says so
 * plainly and the admin UI falls back to pasting a URL — the panel stays usable
 * before storage is set up rather than failing in a confusing way.
 */

const MAX_BYTES = 8 * 1024 * 1024;

/** Only formats a browser can render inline. Everything else is refused — an
 *  upload endpoint that accepts arbitrary files is a liability. */
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(req: Request) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "File storage is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel (Storage → Blob), or paste a URL instead.",
      },
      { status: 501 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "bad_type" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  try {
    // `addRandomSuffix` keeps uploads from overwriting each other and makes the
    // final URL unguessable from the original filename.
    const blob = await put(`admin/${Date.now()}.${EXT[file.type] ?? "bin"}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return NextResponse.json({
      url: blob.url,
      type: file.type.startsWith("video/") ? "video" : "image",
    });
  } catch (err) {
    const errorId = log.error("blob upload failed", err);
    return NextResponse.json({ error: "upload_failed", errorId }, { status: 500 });
  }
}
