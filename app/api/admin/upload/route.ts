import { NextResponse } from "next/server";
import { isPlatformAdmin } from "@/lib/auth/admin";
import { storeMedia } from "@/lib/admin/storage";
import { log } from "@/lib/logger";

/**
 * Media upload for admin content (carousel slides, about photo).
 *
 * Where the bytes land is `lib/admin/storage.ts`'s problem — Vercel Blob in
 * production, the local disk in development. This route's job is deciding what
 * is allowed through: an admin, a format a browser can render, under the size
 * cap. When storage is genuinely unconfigured it says so plainly and the admin
 * UI falls back to pasting a URL, rather than failing in a confusing way.
 */

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Only formats a browser can render inline. Everything else is refused — an
 * upload endpoint that accepts arbitrary files is a liability.
 *
 * SVG is deliberately absent. It is the one image format that is really a
 * document: it can carry `<script>`, and a browser opening it directly runs
 * that script in whatever origin served the file. In development that origin
 * is this app, because uploads land in `public/uploads/` and are served from
 * the same host as the dashboard and its session cookie.
 *
 * The upload would have to come from an admin, so this is not the first line of
 * defence — but an admin who downloads an illustration and uploads it without
 * reading the XML is a likelier story than a hostile one, and no other format
 * on this list can execute anything. An admin who genuinely needs an SVG can
 * still paste a URL to one.
 */
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(req: Request) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
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
    const stored = await storeMedia(file, EXT[file.type] ?? "bin", file.type);

    if ("error" in stored) {
      return NextResponse.json(
        {
          error: "not_configured",
          message:
            "File storage is not configured. Create a Blob store in Vercel (Storage → Blob) and connect it to this project, or paste a URL instead.",
        },
        { status: 501 },
      );
    }

    return NextResponse.json({
      url: stored.url,
      type: file.type.startsWith("video/") ? "video" : "image",
    });
  } catch (err) {
    const errorId = log.error("media upload failed", err);
    return NextResponse.json({ error: "upload_failed", errorId }, { status: 500 });
  }
}
