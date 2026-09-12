import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type AdminResult = { ok: true } | { ok: false; error: string };

export type Direction = "up" | "down";

export function fail(error: string): AdminResult {
  return { ok: false, error };
}

/** The order for a row appended after the current maximum. */
export function nextOrder(max: number | null): number {
  return (max ?? -1) + 1;
}

export const ORDER_ASC = { order: "asc" } as const;

export const ORDER_SELECT = { id: true, order: true } as const;

type Ordered = { id: string; order: number };

/** Swaps a row's order with its neighbour in `rows`, which must be sorted by order. */
export async function moveRow(
  rows: Ordered[],
  id: string,
  dir: Direction,
  setOrder: (id: string, order: number) => Prisma.PrismaPromise<unknown>,
): Promise<"moved" | "edge" | "not_found"> {
  const i = rows.findIndex((row) => row.id === id);
  if (i === -1) return "not_found";
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= rows.length) return "edge";

  const [a, b] = [rows[i], rows[j]];
  await prisma.$transaction([setOrder(a.id, b.order), setOrder(b.id, a.order)]);
  return "moved";
}
