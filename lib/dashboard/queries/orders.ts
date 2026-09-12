import { prisma } from "@/lib/db";
import { fmtDate, fmtTime } from "@/lib/dashboard/time";

const ORDER_LIMIT = 200;

export async function getOrders(businessId: string) {
  const [rows, grouped] = await Promise.all([
    prisma.order.findMany({
      where: { businessId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: ORDER_LIMIT,
    }),
    prisma.order.groupBy({ by: ["status"], where: { businessId }, _count: { _all: true } }),
  ]);

  return {
    counts: Object.fromEntries(grouped.map((g) => [g.status, g._count._all])) as Record<string, number>,
    orders: rows.map((o) => ({
      id: o.id,
      ref: `#${o.id.slice(-6).toUpperCase()}`,
      customerName: o.customerName,
      phone: o.phone,
      address: o.address,
      note: o.note,
      total: o.total,
      status: o.status,
      dateLabel: fmtDate.format(o.createdAt),
      timeLabel: fmtTime.format(o.createdAt),
      items: o.items.map((i) => ({
        id: i.id,
        name: i.nameSnapshot,
        code: i.codeSnapshot,
        qty: i.qty,
        lineTotal: i.lineTotal,
      })),
    })),
  };
}

export type OrdersData = Awaited<ReturnType<typeof getOrders>>;
export type OrderRowData = OrdersData["orders"][number];
