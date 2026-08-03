import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { authenticate, isDenial, readJson, str } from "@/lib/agent/auth";
import { ownedConversation } from "@/lib/agent/conversation";

export const dynamic = "force-dynamic";

/**
 * Records — or fills in — the lead for a conversation.
 *
 * A chat produces one lead, not one per detail the AI manages to extract, so
 * this is keyed on the conversation and updates in place. That is what makes it
 * safe to call again the moment a customer finally gives their phone number
 * twenty messages in.
 *
 * Only supplied fields are written. Sending `{ phone }` will not blank a name a
 * human already corrected in the dashboard.
 */
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

  // Without a conversation there is nothing to key on, so a bare create is the
  // only sensible reading — the AI is reporting a lead from somewhere else.
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
