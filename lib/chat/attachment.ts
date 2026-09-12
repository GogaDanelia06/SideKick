/** Chat attachment rules; the caps match the admin upload route, and SVG is refused. */

export const MAX_BYTES = 8 * 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

/** For the file input's `accept`, so the picker filters before we have to. */
export const ACCEPT_ATTRIBUTE = [...IMAGE_TYPES, ...VIDEO_TYPES].join(",");

export type AttachmentError = "bad_type" | "too_large";

export type Classified = { kind: "image" | "video" } | { error: AttachmentError };

/** Classifies a picked file; type is checked before size. */
export function classifyAttachment(file: File): Classified {
  const type = file.type;

  const isImage = (IMAGE_TYPES as readonly string[]).includes(type);
  const isVideo = (VIDEO_TYPES as readonly string[]).includes(type);
  if (!isImage && !isVideo) return { error: "bad_type" };

  if (file.size > MAX_BYTES) return { error: "too_large" };

  return { kind: isImage ? "image" : "video" };
}
