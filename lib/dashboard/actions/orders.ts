"use server";

import type { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { DASH } from "@/lib/dashboard/routes";
import type { ActionResult } from "./result";

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult> {
  const ctx = await requirePermission("orders:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  await prisma.order.updateMany({ where: { id: orderId, businessId: ctx.businessId }, data: { status } });
  revalidatePath(DASH.orders);
  return { ok: true };
}
