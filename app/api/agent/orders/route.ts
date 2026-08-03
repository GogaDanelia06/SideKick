import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { authenticate, badRequest, isDenial, readJson, str } from "@/lib/agent/auth";
import { ownedConversation } from "@/lib/agent/conversation";
import { priceLines, type AgentOrderLine } from "@/lib/agent/pricing";

export const dynamic = "force-dynamic";

/** Reads the `items` array without trusting its shape. */
function readLines(value: unknown): AgentOrderLine[] | { error: string } {
  if (!Array.isArray(value)) return { error: "items must be an array" };

  const lines: AgentOrderLine[] = [];
  for (const raw of value) {
    if (typeof raw !== "object" || raw === null) return { error: "each item must be an object" };
    const item = raw as Record<string, unknown>;
    const code = typeof item.code === "string" ? item.code.trim() : "";
    const qty = typeof item.qty === "number" ? item.qty : NaN;
    if (!code) return { error: "each item needs a product code" };
    lines.push({ code, qty });
  }
  return lines;
}

/**
 * Records an order the AI took during a chat.
 *
 * The caller names products by code and quantity; totals are computed here from
 * this tenant's own product rows. An order arrives as NEW, which is the state
 * the tenant's dashboard treats as "needs looking at" — the AI books it, a
 * human confirms it.
 *
 * There is deliberately no delete. Removing a customer's order is a decision
 * made by a person in the dashboard, with the history that implies.
 */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (isDenial(body)) return body.response;

  const auth = await authenticate(request, body.businessId);
  if (isDenial(auth)) return auth.response;

  const lines = readLines(body.items);
  if ("error" in lines) return badRequest(lines.error).response;

  // An order may stand alone, but when a conversation is named it must be one
  // of this tenant's.
  const conversationId = str(body, "conversationId");
  if (conversationId) {
    const conversation = await ownedConversation(auth.businessId, conversationId);
    if (isDenial(conversation)) return conversation.response;
  }

  const catalogue = await prisma.product.findMany({
    where: { businessId: auth.businessId, code: { in: lines.map((l) => l.code) } },
    select: { id: true, code: true, name: true, price: true, salePrice: true },
  });

  const priced = priceLines(lines, catalogue);
  if ("error" in priced) return badRequest(priced.error).response;

  const order = await prisma.order.create({
    data: {
      businessId: auth.businessId,
      conversationId,
      customerName: str(body, "customerName"),
      phone: str(body, "phone"),
      email: str(body, "email"),
      address: str(body, "address"),
      note: str(body, "note"),
      total: priced.total,
      items: { create: priced.items },
    },
    select: { id: true, total: true, status: true, createdAt: true },
  });

  log.info("agent created an order", {
    businessId: auth.businessId,
    orderId: order.id,
    total: order.total,
    lines: priced.items.length,
  });

  return NextResponse.json(
    {
      orderId: order.id,
      // Echoed back so the AI can tell the customer a figure that matches what
      // the tenant will see, rather than one it worked out itself.
      total: order.total,
      status: order.status,
      items: priced.items.map((i) => ({
        code: i.codeSnapshot,
        name: i.nameSnapshot,
        qty: i.qty,
        price: i.price,
        lineTotal: i.lineTotal,
      })),
    },
    { status: 201 },
  );
}
