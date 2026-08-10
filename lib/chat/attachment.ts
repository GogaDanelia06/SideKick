/**
 * What the chat accepts as an attachment.
 *
 * The caps mirror `app/api/admin/upload/route.ts` on purpose: the day these
 * files are actually uploaded, the browser should already be refusing what the
 * server would refuse, so nobody picks a 40MB clip and learns it was pointless
 * only after the upload bar finishes.
 *
 * SVG is the one format allowed there and not here. That endpoint is behind
 * `isPlatformAdmin()`, so its uploads come from someone we trust; this input is
 * open to any visitor, and an SVG is a document that can carry script rather
 * than a picture. Nothing renders it inline today, and that is precisely the
 * kind of assumption that stops being true quietly.
 */

export const MAX_BYTES = 8 * 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

/** For the file input's `accept`, so the picker filters before we have to. */
export const ACCEPT_ATTRIBUTE = [...IMAGE_TYPES, ...VIDEO_TYPES].join(",");

export type AttachmentError = "bad_type" | "too_large";

export type Classified = { kind: "image" | "video" } | { error: AttachmentError };

/**
 * Decides whether a picked file may be shown, and as what.
 *
 * Type is checked before size so a `.zip` is called the wrong sort of file
 * rather than too big, which would send someone off compressing it.
 */
export function classifyAttachment(file: File): Classified {
  const type = file.type;

  const isImage = (IMAGE_TYPES as readonly string[]).includes(type);
  const isVideo = (VIDEO_TYPES as readonly string[]).includes(type);
  if (!isImage && !isVideo) return { error: "bad_type" };

  if (file.size > MAX_BYTES) return { error: "too_large" };

  return { kind: isImage ? "image" : "video" };
}
