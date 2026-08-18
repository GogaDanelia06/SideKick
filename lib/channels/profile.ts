import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { GRAPH_FACEBOOK, graphHostFor } from "./graphHost";

/** Pinned for the same reason as the Send API's — see `send.ts`. */
const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";

/** Short: a name is a nicety, and nothing should wait long for one. */
const TIMEOUT_MS = 5_000;

type Profile = {
  first_name?: string;
  last_name?: string;
  name?: string;
  username?: string;
  error?: { message?: string; code?: number };
};

/**
 * Reads a display name out of whichever fields the surface returned.
 *
 * Facebook answers with the two halves of a name, Instagram with a display name
 * and a handle. Instagram profiles often have no display name at all, so the
 * handle is the fallback rather than an error — `@lika_ge` in the inbox is far
 * more use to a merchant than a dash.
 */
function nameFrom(profile: Profile): string | null {
  const full = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return full || profile.name?.trim() || profile.username?.trim() || null;
}

/**
 * Asks Meta who a customer id belongs to.
 *
 * Returns null on every failure rather than throwing. A name is decoration:
 * the message is already stored, the merchant can already read and answer it,
 * and there are ordinary reasons this call comes back empty — a deleted
 * account, a profile Meta will not disclose, a token that has lost the
 * permission. None of them should colour the delivery that triggered it.
 */
export async function fetchCustomerName(
  customerId: string,
  accessToken: string,
  fields: string,
  // Which host depends on the token, not the channel — see graphHost.ts.
  host: string = GRAPH_FACEBOOK,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `${host}/${GRAPH_VERSION}/${customerId}` +
        `?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`,
      { signal: controller.signal },
    );
    const body = (await res.json().catch(() => ({}))) as Profile;

    if (!res.ok || body.error) {
      log.warn("could not read a customer profile from Meta", {
        detail: body.error?.message ?? `HTTP ${res.status}`,
      });
      return null;
    }

    return nameFrom(body);
  } catch (err) {
    log.warn("customer profile lookup failed", {
      detail: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Puts a name on a conversation that has none.
 *
 * Never called inside the webhook request. It is a second round trip to Meta,
 * and the webhook has five seconds for everything — this runs after the
 * response has gone, where being slow costs nothing.
 *
 * Only fills a blank. A name typed by the merchant, or set by the AI service
 * through the agent API, is a deliberate choice about their own customer and
 * outranks whatever Facebook has on file.
 */
export async function nameCustomer(conversationId: string): Promise<void> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      customerRef: true,
      customerName: true,
      channel: { select: { type: true, accessToken: true } },
    },
  });

  const channel = conversation?.channel;
  if (!conversation?.customerRef || conversation.customerName || !channel?.accessToken) return;

  // Facebook and Instagram describe a person with different fields, and asking
  // for the wrong ones is an error rather than an empty answer.
  const fields =
    channel.type === "INSTAGRAM" ? "name,username" : channel.type === "FACEBOOK" ? "first_name,last_name" : null;
  if (!fields) return;

  // By the token, not by the channel type. Deciding by type sent a Page token —
  // which is what an Instagram account linked through a Facebook Page holds — to
  // graph.instagram.com, where it is refused. Facebook chats got their names and
  // every Instagram chat stayed a dash.
  const name = await fetchCustomerName(
    conversation.customerRef,
    channel.accessToken,
    fields,
    graphHostFor(channel.type, channel.accessToken),
  );
  if (!name) return;

  // Guarded on still being empty: an operator may have typed one in the seconds
  // this call was in flight, and theirs should not be overwritten by ours.
  await prisma.conversation.updateMany({
    where: { id: conversationId, customerName: null },
    data: { customerName: name },
  });
}
