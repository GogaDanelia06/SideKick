"use server";

import type { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { DASH } from "@/lib/dashboard/routes";

export async function setOrderStatus(orderId: string, status: OrderStatus) {
  const ctx = await requirePermission("orders:write");
  if (!ctx) return;

  await prisma.order.updateMany({ where: { id: orderId, businessId: ctx.businessId }, data: { status } });
  revalidatePath(DASH.orders);
}
