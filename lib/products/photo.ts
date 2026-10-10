import { removeStoredMedia, storeMedia } from "@/lib/admin/storage";

export const MAX_PHOTO_BYTES = 900 * 1024;

export type PhotoError = "photo_type" | "photo_size" | "photo_storage";

const ascii = (bytes: Uint8Array, from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));

const KINDS = [
  { type: "image/jpeg", ext: "jpg", is: (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: "image/png", ext: "png", is: (b: Uint8Array) => ascii(b, 1, 4) === "PNG" && b[0] === 0x89 },
  { type: "image/webp", ext: "webp", is: (b: Uint8Array) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP" },
];

export async function storeProductPhoto(fd: FormData): Promise<{ url: string } | { error: PhotoError } | null> {
  const file = fd.get("photo");
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_PHOTO_BYTES) return { error: "photo_size" };

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const kind = KINDS.find((k) => k.is(head));
  if (!kind) return { error: "photo_type" };

  const stored = await storeMedia(file, kind.ext, kind.type, "products");
  return "error" in stored ? { error: "photo_storage" } : { url: stored.url };
}

export function nextPhotos(current: string[], added: string | null, remove: boolean) {
  const [first, ...rest] = current;
  if (added) return { photos: [added, ...rest], dropped: first ? [first] : [] };
  if (remove && first) return { photos: rest, dropped: [first] };
  return { photos: current, dropped: [] };
}

export async function dropPhotos(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => removeStoredMedia(url)));
}
