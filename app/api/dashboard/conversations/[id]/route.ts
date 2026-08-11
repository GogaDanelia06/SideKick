import { NextResponse } from "next/server";
import { getContext } from "@/lib/session";
import { getConversation } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

/**
 * One conversation, for the inbox to fetch when a merchant picks a chat.
 *
 * Selecting a chat used to change the URL, which re-ran the whole page on the
 * server: the list of a hundred conversations was queried again, the shell was
 * re-rendered, and the messages travelled back as part of a full navigation.
 * The wait was long enough to feel like the click had not registered.
 *
 * Fetching just this leaves the list alone and lets the browser hold on to what
 * it has already seen, so going back to a chat is instant.
 *
 * `getConversation` filters by business as well as id, so an id belonging to
 * another merchant comes back as a 404 rather than their customer's messages.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getContext();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const conversation = await getConversation(ctx.businessId, id);
  if (!conversation) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(conversation);
}
