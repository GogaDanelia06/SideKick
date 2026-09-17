"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { checkLimit } from "@/lib/billing/limits";
import { DASH } from "@/lib/dashboard/routes";
import { log } from "@/lib/logger";
import { isImportRow, type ImportRow } from "@/lib/products/importRow";
import { MAX_IMPORT_ROWS } from "@/lib/products/importRows";

export type ImportResult =
  | { ok: true; created: number; updated: number }
  | { ok: false; error: "forbidden" | "invalid" | "failed" }
  | { ok: false; error: "limit"; limit: number; used: number; adding: number };

/** Updates run in transactions of this size, so a long file never holds one open for long. */
const BATCH = 100;

/** Every row checked, and each code only once. */
function validRows(rows: unknown): rows is ImportRow[] {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_IMPORT_ROWS) return false;
  const codes = new Set<string>();
  return rows.every((row) => isImportRow(row) && !codes.has(row.code) && Boolean(codes.add(row.code)));
}

/**
 * Adds the products whose codes are new and updates the rest. Nothing is deleted, and a
 * blank optional cell leaves the current value alone.
 */
export async function importProducts(rows: ImportRow[]): Promise<ImportResult> {
  const ctx = await requirePermission("products:write");
  if (!ctx) return { ok: false, error: "forbidden" };
  if (!validRows(rows)) return { ok: false, error: "invalid" };
  const { businessId } = ctx;

  const existing = await prisma.product.findMany({
    where: { businessId, code: { in: rows.map((r) => r.code) } },
    select: { code: true, discountPct: true },
  });
  const known = new Map(existing.map((p) => [p.code, p.discountPct]));
  const fresh = rows.filter((r) => !known.has(r.code));
  const stale = rows.filter((r) => known.has(r.code));

  if (fresh.length > 0) {
    const verdict = await checkLimit(businessId, "products", fresh.length);
    if (!verdict.allowed) {
      return { ok: false, error: "limit", limit: verdict.limit, used: verdict.used, adding: fresh.length };
    }
  }

  try {
    if (fresh.length > 0) {
      await prisma.product.createMany({
        data: fresh.map((r) => ({
          businessId,
          code: r.code,
          name: r.name,
          price: r.price,
          discountPct: r.discountPct ?? null,
          salePrice: r.salePrice ?? null,
          quantity: r.quantity ?? 0,
          size: r.size ?? null,
          description: r.description ?? null,
        })),
      });
    }
    for (let i = 0; i < stale.length; i += BATCH) {
      await prisma.$transaction(
        stale.slice(i, i + BATCH).map((r) => {
          // A new price without discount cells keeps the stored percentage, as the form does.
          const pct = known.get(r.code);
          const discount =
            r.discountPct !== undefined
              ? { discountPct: r.discountPct, salePrice: r.salePrice }
              : pct != null
                ? { salePrice: Math.round(r.price * (1 - pct / 100)) }
                : {};
          return prisma.product.update({
            where: { businessId_code: { businessId, code: r.code } },
            data: {
              name: r.name,
              price: r.price,
              ...discount,
              ...(r.quantity !== undefined && { quantity: r.quantity }),
              ...(r.size !== undefined && { size: r.size }),
              ...(r.description !== undefined && { description: r.description }),
            },
          });
        }),
      );
    }
  } catch (err) {
    log.error("product import failed", err, { businessId, rows: rows.length });
    return { ok: false, error: "failed" };
  }

  log.info("products imported", { businessId, created: fresh.length, updated: stale.length });
  revalidatePath(DASH.products);
  return { ok: true, created: fresh.length, updated: stale.length };
}
