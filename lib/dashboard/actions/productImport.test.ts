import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    product: { findMany: vi.fn(), createMany: vi.fn(), update: vi.fn((args) => args) },
    $transaction: vi.fn(async (ops: unknown[]) => ops),
  },
}));
vi.mock("@/lib/auth/permissions", () => ({ requirePermission: vi.fn() }));
vi.mock("@/lib/billing/limits", () => ({ checkLimit: vi.fn() }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), error: vi.fn() } }));

import { importProducts } from "./productImport";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { checkLimit } from "@/lib/billing/limits";
import { revalidatePath } from "next/cache";

const findMany = vi.mocked(prisma.product.findMany);
const createMany = vi.mocked(prisma.product.createMany);
const update = vi.mocked(prisma.product.update);
const limit = vi.mocked(checkLimit);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requirePermission).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" } as never);
  findMany.mockResolvedValue([{ code: "OLD", discountPct: 20 }] as never);
  limit.mockResolvedValue({ allowed: true });
});

describe("importProducts()", () => {
  it("adds new codes and updates known ones, leaving blank cells alone", async () => {
    const result = await importProducts([
      { code: "NEW", name: "Hat", price: 50, quantity: 3 },
      { code: "OLD", name: "Dress", price: 200 },
    ]);

    expect(result).toEqual({ ok: true, created: 1, updated: 1 });
    expect(limit).toHaveBeenCalledWith("b1", "products", 1);
    expect(createMany).toHaveBeenCalledWith({
      data: [
        {
          businessId: "b1", code: "NEW", name: "Hat", price: 50, discountPct: null,
          salePrice: null, quantity: 3, size: null, description: null,
        },
      ],
    });
    // The stored 20% discount follows the new price; quantity, size and description stay.
    expect(update).toHaveBeenCalledWith({
      where: { businessId_code: { businessId: "b1", code: "OLD" } },
      data: { name: "Dress", price: 200, salePrice: 160 },
    });
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("takes the file's own discount over the stored one", async () => {
    await importProducts([{ code: "OLD", name: "Dress", price: 200, discountPct: 50, salePrice: 100, size: "M" }]);

    expect(createMany).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: "Dress", price: 200, discountPct: 50, salePrice: 100, size: "M" } }),
    );
  });

  it("refuses when the plan has no room for the new products, before writing anything", async () => {
    limit.mockResolvedValue({ allowed: false, reason: "limit", limit: 100, used: 99, planName: { ka: "ა", en: "A" } });

    const result = await importProducts([
      { code: "N1", name: "A", price: 1 },
      { code: "N2", name: "B", price: 1 },
    ]);

    expect(result).toEqual({ ok: false, error: "limit", limit: 100, used: 99, adding: 2 });
    expect(createMany).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("checks the rows itself rather than trusting the browser", async () => {
    const twice = [{ code: "A", name: "x", price: 1 }, { code: "A", name: "y", price: 2 }];
    for (const rows of [[], twice, [{ code: "A", name: "x", price: -1 }], "rows"]) {
      expect(await importProducts(rows as never)).toEqual({ ok: false, error: "invalid" });
    }
    expect(findMany).not.toHaveBeenCalled();
  });

  it("refuses a user without product rights", async () => {
    vi.mocked(requirePermission).mockResolvedValue(null);
    expect(await importProducts([{ code: "A", name: "x", price: 1 }])).toEqual({ ok: false, error: "forbidden" });
  });

  it("reports a database failure instead of throwing", async () => {
    createMany.mockRejectedValue(new Error("down"));
    expect(await importProducts([{ code: "NEW", name: "x", price: 1 }])).toEqual({ ok: false, error: "failed" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
