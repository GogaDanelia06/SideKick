"use server";

import type { Product } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isUniqueViolation } from "@/lib/dbErrors";
import { requirePermission } from "@/lib/auth/permissions";
import { checkLimit } from "@/lib/billing/limits";
import { DASH } from "@/lib/dashboard/routes";
import { numberField, optionalField } from "@/lib/forms";
import { log } from "@/lib/logger";

export type ProductResult =
  | { ok: true; product: Product }
  | { ok: false; error: "forbidden" | "missing" | "limit" | "duplicate" | "error" };

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

  try {
    const product = await prisma.product.create({
      data: { ...rest, businessId: ctx.businessId, name, code, price: price ?? 0, quantity: quantity ?? 0 },
    });
    // No revalidatePath: the client inserts the returned row without a re-render.
    return { ok: true, product };
  } catch (err) {
    // `[businessId, code]` is unique.
    if (isUniqueViolation(err)) return { ok: false, error: "duplicate" };
    log.error("could not create a product", err, { businessId: ctx.businessId });
    return { ok: false, error: "error" };
  }
}

export async function updateProduct(id: string, fd: FormData) {
  const ctx = await requirePermission("products:write");
  if (!ctx) return;

  const { name, price, quantity, ...rest } = productFields(fd);
  await prisma.product.updateMany({
    where: { id, businessId: ctx.businessId },
    data: { ...rest, name: name ?? undefined, price: price ?? undefined, quantity: quantity ?? undefined },
  });
  revalidatePath(DASH.products);
}

export async function deleteProduct(id: string) {
  const ctx = await requirePermission("products:write");
  if (!ctx) return;

  await prisma.product.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath(DASH.products);
}
