/**
 * Shrinks a product photo in the browser before it is sent: at most MAX_SIDE pixels on
 * the long side, re-encoded as WebP (JPEG where the browser cannot write WebP). Phone
 * photos drop from several MB to a few hundred KB, and re-encoding strips their
 * metadata, including where they were taken.
 */
const MAX_SIDE = 1280;
/** Under the server's MAX_PHOTO_BYTES (lib/products/photo.ts), with room for the other fields. */
const TARGET_BYTES = 800 * 1024;
const QUALITIES = [0.85, 0.72, 0.6, 0.45];

export type ResizeError = "unreadable" | "too_large";

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

export async function resizePhoto(file: File): Promise<File | ResizeError> {
  let bitmap: ImageBitmap;
  try {
    // Applies the photo's own orientation, so a portrait phone shot stays upright.
    bitmap = await createImageBitmap(file);
  } catch {
    return "unreadable"; // e.g. HEIC outside Safari, or not an image at all
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return "unreadable";

  try {
    for (const [type, ext] of [["image/webp", "webp"], ["image/jpeg", "jpg"]] as const) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (type === "image/jpeg") {
        // JPEG has no transparency: white rather than black behind a see-through PNG.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITIES) {
        const blob = await toBlob(canvas, type, quality);
        // A browser that cannot write this type quietly writes PNG instead.
        if (!blob || blob.type !== type) break;
        if (blob.size <= TARGET_BYTES) return new File([blob], `photo.${ext}`, { type });
      }
    }
    return "too_large";
  } finally {
    bitmap.close();
  }
}
