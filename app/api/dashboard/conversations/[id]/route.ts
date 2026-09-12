import { NextResponse } from "next/server";
import { getContext } from "@/lib/session";
import { getConversation } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

/** One conversation for the inbox, scoped to the caller's business (404 otherwise). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getContext();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const conversation = await getConversation(ctx.businessId, id);
  if (!conversation) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(conversation);
}
