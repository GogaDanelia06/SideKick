import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { authenticate, isDenial, readJson, str } from "@/lib/agent/auth";
import { ownedConversation } from "@/lib/agent/conversation";

export const dynamic = "force-dynamic";

/** Creates or updates the conversation's lead; only the supplied fields are written. */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (isDenial(body)) return body.response;

  const auth = await authenticate(request, body.businessId);
  if (isDenial(auth)) return auth.response;

  const fields = {
    name: str(body, "name"),
    phone: str(body, "phone"),
    interest: str(body, "interest"),
    source: str(body, "source"),
    comment: str(body, "comment"),
  };
  const supplied = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined),
  );

  const conversationId = str(body, "conversationId");

  if (!conversationId) {
    const lead = await prisma.lead.create({
      data: { businessId: auth.businessId, ...supplied },
      select: { id: true, status: true },
    });
    log.info("agent created a standalone lead", { businessId: auth.businessId, leadId: lead.id });
    return NextResponse.json({ leadId: lead.id, status: lead.status }, { status: 201 });
  }

  const conversation = await ownedConversation(auth.businessId, conversationId);
  if (isDenial(conversation)) return conversation.response;

  const lead = await prisma.lead.upsert({
    where: { conversationId: conversation.id },
    create: { businessId: auth.businessId, conversationId: conversation.id, ...supplied },
    update: supplied,
    select: { id: true, status: true },
  });

  log.info("agent recorded a lead", { businessId: auth.businessId, leadId: lead.id });
  return NextResponse.json({ leadId: lead.id, status: lead.status });
}
