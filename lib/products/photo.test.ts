import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/admin/storage", () => ({ storeMedia: vi.fn(), removeStoredMedia: vi.fn() }));

import { MAX_PHOTO_BYTES, nextPhotos, storeProductPhoto } from "./photo";
import { storeMedia } from "@/lib/admin/storage";

const store = vi.mocked(storeMedia);

const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP = [..."RIFF"].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [..."WEBP"].map((c) => c.charCodeAt(0)));

function form(bytes: number[] | string, type = "image/jpeg") {
  const fd = new FormData();
  const body = typeof bytes === "string" ? bytes : new Uint8Array([...bytes, ...new Array(64).fill(0)]);
  fd.append("photo", new File([body], "photo", { type }));
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  store.mockResolvedValue({ url: "https://x.public.blob.vercel-storage.com/products/p.webp" });
});

describe("storeProductPhoto()", () => {
  it.each([
    ["JPEG", JPEG, "jpg", "image/jpeg"],
    ["PNG", PNG, "png", "image/png"],
    ["WebP", WEBP, "webp", "image/webp"],
  ])("stores a %s under products/, typed by its bytes", async (_, bytes, ext, type) => {
    // The claimed type is wrong on purpose: only the bytes count.
    expect(await storeProductPhoto(form(bytes, "application/octet-stream"))).toEqual({ url: expect.any(String) });
    expect(store).toHaveBeenCalledWith(expect.any(File), ext, type, "products");
  });

  it("refuses a file that only claims to be an image", async () => {
    expect(await storeProductPhoto(form("<html><script>alert(1)</script>", "image/jpeg"))).toEqual({ error: "photo_type" });
    expect(store).not.toHaveBeenCalled();
  });

  it("refuses a photo over the size the browser shrinks to", async () => {
    const fd = new FormData();
    fd.append("photo", new File([new Uint8Array(MAX_PHOTO_BYTES + 1).fill(0xff)], "big.jpg"));
    expect(await storeProductPhoto(fd)).toEqual({ error: "photo_size" });
  });

  it("is null when the form has no photo, and says so when storage is not set up", async () => {
    expect(await storeProductPhoto(new FormData())).toBeNull();
    expect(await storeProductPhoto(form([]))).toEqual({ error: "photo_type" });
    store.mockResolvedValue({ error: "not_configured" });
    expect(await storeProductPhoto(form(JPEG))).toEqual({ error: "photo_storage" });
  });
});

describe("nextPhotos()", () => {
  it("puts a new photo first and lets the old first one go", () => {
    expect(nextPhotos(["a", "b"], "new", false)).toEqual({ photos: ["new", "b"], dropped: ["a"] });
    expect(nextPhotos([], "new", false)).toEqual({ photos: ["new"], dropped: [] });
  });

  it("removes the first photo only when asked, and otherwise changes nothing", () => {
    expect(nextPhotos(["a", "b"], null, true)).toEqual({ photos: ["b"], dropped: ["a"] });
    expect(nextPhotos(["a"], null, false)).toEqual({ photos: ["a"], dropped: [] });
    expect(nextPhotos([], null, true)).toEqual({ photos: [], dropped: [] });
  });
});
