"use server";

import type { Product } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isUniqueViolation } from "@/lib/dbErrors";
import { requirePermission } from "@/lib/auth/permissions";
import { checkLimit } from "@/lib/billing/limits";
import { DASH } from "@/lib/dashboard/routes";
import { checkbox, numberField, optionalField } from "@/lib/forms";
import { log } from "@/lib/logger";
import { dropPhotos, nextPhotos, storeProductPhoto, type PhotoError } from "@/lib/products/photo";

type ProductError = "forbidden" | "missing" | "limit" | "duplicate" | "error" | PhotoError;

export type ProductResult = { ok: true; product: Product } | { ok: false; error: ProductError };
export type UpdateResult = { ok: true } | { ok: false; error: ProductError };

function productFields(fd: FormData) {
  return {
    name: optionalField(fd, "name"),
    price: numberField(fd, "price"),
    discountPct: numberField(fd, "discountPct"),
    salePrice: numberField(fd, "salePrice"),
    size: optionalField(fd, "size"),
    description: optionalField(fd, "description"),
    quantity: numberField(fd, "quantity"),
  };
}

export async function createProduct(fd: FormData): Promise<ProductResult> {
  const ctx = await requirePermission("products:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  const { name, price, quantity, ...rest } = productFields(fd);
  const code = optionalField(fd, "code");
  if (!name || !code) return { ok: false, error: "missing" };

  const verdict = await checkLimit(ctx.businessId, "products");
  if (!verdict.allowed) return { ok: false, error: "limit" };

  const photo = await storeProductPhoto(fd);
  if (photo && "error" in photo) return { ok: false, error: photo.error };
  const photos = photo ? [photo.url] : [];

  try {
    const product = await prisma.product.create({
      data: { ...rest, businessId: ctx.businessId, name, code, photos, price: price ?? 0, quantity: quantity ?? 0 },
    });
    // No revalidatePath: the client inserts the returned row without a re-render.
    return { ok: true, product };
  } catch (err) {
    await dropPhotos(photos);
    // `[businessId, code]` is unique.
    if (isUniqueViolation(err)) return { ok: false, error: "duplicate" };
    log.error("could not create a product", err, { businessId: ctx.businessId });
    return { ok: false, error: "error" };
  }
}

export async function updateProduct(id: string, fd: FormData): Promise<UpdateResult> {
  const ctx = await requirePermission("products:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  const current = await prisma.product.findFirst({ where: { id, businessId: ctx.businessId }, select: { photos: true } });
  if (!current) return { ok: false, error: "error" };

  const photo = await storeProductPhoto(fd);
  if (photo && "error" in photo) return { ok: false, error: photo.error };
  const { photos, dropped } = nextPhotos(current.photos, photo?.url ?? null, checkbox(fd, "removePhoto"));

  const { name, price, quantity, ...rest } = productFields(fd);
  // A field the form did not send keeps its value, rather than being cleared.
  const sent = Object.fromEntries(Object.entries(rest).filter(([field]) => fd.has(field)));
  await prisma.product.updateMany({
    where: { id, businessId: ctx.businessId },
    data: { ...sent, photos, name: name ?? undefined, price: price ?? undefined, quantity: quantity ?? undefined },
  });
  await dropPhotos(dropped);
  revalidatePath(DASH.products);
  return { ok: true };
}

export async function deleteProduct(id: string) {
  const ctx = await requirePermission("products:write");
  if (!ctx) return;

  const product = await prisma.product.findFirst({ where: { id, businessId: ctx.businessId }, select: { photos: true } });
  await prisma.product.deleteMany({ where: { id, businessId: ctx.businessId } });
  await dropPhotos(product?.photos ?? []);
  revalidatePath(DASH.products);
}
