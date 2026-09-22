import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: { product: { create: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() } },
}));
vi.mock("@/lib/auth/permissions", () => ({ requirePermission: vi.fn() }));
vi.mock("@/lib/billing/limits", () => ({ checkLimit: vi.fn() }));
vi.mock("@/lib/logger", () => ({ log: { error: vi.fn() } }));
vi.mock("@/lib/admin/storage", () => ({ storeMedia: vi.fn(), removeStoredMedia: vi.fn() }));

import { Prisma } from "@prisma/client";
import { createProduct, deleteProduct, updateProduct } from "./products";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { checkLimit } from "@/lib/billing/limits";
import { removeStoredMedia, storeMedia } from "@/lib/admin/storage";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const NEW_URL = "/uploads/new.jpg";

function form(fields: Record<string, string>, photo = false) {
  const fd = new FormData();
  for (const [name, value] of Object.entries(fields)) fd.append(name, value);
  if (photo) fd.append("photo", new File([JPEG], "p.jpg", { type: "image/jpeg" }));
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requirePermission).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" } as never);
  vi.mocked(checkLimit).mockResolvedValue({ allowed: true });
  vi.mocked(storeMedia).mockResolvedValue({ url: NEW_URL });
  vi.mocked(prisma.product.create).mockImplementation((async (args: { data: object }) => ({ id: "p1", ...args.data })) as never);
  vi.mocked(prisma.product.findFirst).mockResolvedValue({ photos: ["/uploads/old.jpg"] } as never);
});

describe("createProduct()", () => {
  it("stores the photo and saves it with the product", async () => {
    const res = await createProduct(form({ name: "Hat", code: "H-1", price: "50" }, true));
    expect(res).toMatchObject({ ok: true, product: { photos: [NEW_URL], name: "Hat", price: 50 } });
  });

  it("creates no product when the photo is refused", async () => {
    const fd = form({ name: "Hat", code: "H-1" });
    fd.append("photo", new File(["not an image"], "p.jpg", { type: "image/jpeg" }));
    expect(await createProduct(fd)).toEqual({ ok: false, error: "photo_type" });
    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it("deletes the stored photo again when the code is already taken", async () => {
    vi.mocked(prisma.product.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("unique", { code: "P2002", clientVersion: "6" }),
    );
    expect(await createProduct(form({ name: "Hat", code: "H-1" }, true))).toEqual({ ok: false, error: "duplicate" });
    expect(removeStoredMedia).toHaveBeenCalledWith(NEW_URL);
  });
});

describe("updateProduct()", () => {
  it("leaves fields the form did not send alone, so the description survives an edit", async () => {
    expect(await updateProduct("p1", form({ name: "Hat", size: "", price: "60" }))).toEqual({ ok: true });
    const { data } = vi.mocked(prisma.product.updateMany).mock.calls[0]![0]!;
    expect(data).not.toHaveProperty("description");
    expect(data).toMatchObject({ name: "Hat", price: 60, size: null, photos: ["/uploads/old.jpg"] });
  });

  it("replaces the photo and deletes the old file, or removes it when asked", async () => {
    await updateProduct("p1", form({ name: "Hat" }, true));
    expect(vi.mocked(prisma.product.updateMany).mock.calls[0]![0]!.data).toMatchObject({ photos: [NEW_URL] });
    expect(removeStoredMedia).toHaveBeenCalledWith("/uploads/old.jpg");

    await updateProduct("p1", form({ name: "Hat", removePhoto: "on" }));
    expect(vi.mocked(prisma.product.updateMany).mock.calls[1]![0]!.data).toMatchObject({ photos: [] });
  });

  it("refuses another business's product and users without product rights", async () => {
    vi.mocked(prisma.product.findFirst).mockResolvedValueOnce(null);
    expect(await updateProduct("p9", form({ name: "Hat" }))).toEqual({ ok: false, error: "error" });
    vi.mocked(requirePermission).mockResolvedValueOnce(null);
    expect(await updateProduct("p1", form({ name: "Hat" }))).toEqual({ ok: false, error: "forbidden" });
    expect(prisma.product.updateMany).not.toHaveBeenCalled();
  });
});

describe("deleteProduct()", () => {
  it("deletes the product's photos from storage too", async () => {
    await deleteProduct("p1");
    expect(prisma.product.deleteMany).toHaveBeenCalledWith({ where: { id: "p1", businessId: "b1" } });
    expect(removeStoredMedia).toHaveBeenCalledWith("/uploads/old.jpg");
  });
});
