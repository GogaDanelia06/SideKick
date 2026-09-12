import { NextResponse } from "next/server";
import { isPlatformAdmin } from "@/lib/auth/admin";
import { storeMedia } from "@/lib/admin/storage";
import { log } from "@/lib/logger";

/** Admin media upload (hero slides, about photo). Storage lives in lib/admin/storage.ts. */

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Formats browsers render inline. SVG is excluded: it can carry scripts that run
 * on the serving origin.
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
