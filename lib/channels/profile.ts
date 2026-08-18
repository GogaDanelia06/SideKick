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
  // Everything needed to place a failure, without the token or the customer's
  // name: which host was tried, which fields were asked for, and which kind of
  // credential was used. A refusal that does not say which of the two Instagram
  // roads it took costs a round trip to find out.
  const attempt = {
    host: new URL(host).host,
    fields,
    credential: accessToken.startsWith("IGA") ? "instagram-login" : "page-token",
  };
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
        ...attempt,
        code: body.error?.code,
        detail: body.error?.message ?? `HTTP ${res.status}`,
      });
      return null;
    }

    const name = nameFrom(body);
    if (!name) {
      // The one outcome that used to leave no trace at all: Meta answers 200 and
      // simply does not include a name. It is not an error, so the branch above
      // never fires, and `nameCustomer` then returns quietly — a chat stuck on a
      // dash with nothing anywhere to explain it.
      //
      // The keys are logged, never the values: which fields Meta was willing to
      // disclose is the whole diagnosis, and the customer's name is not ours to
      // copy into a second system's logs.
      log.warn("Meta returned a profile with no name", {
        ...attempt,
        keys: Object.keys(body).join(",") || "(empty response)",
      });
    }
    return name;
  } catch (err) {
    log.warn("customer profile lookup failed", {
      ...attempt,
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

  // Facebook and Instagram describe a person with different fields, and asking
  // for the wrong ones is an error rather than an empty answer.
  const fields =
    channel?.type === "INSTAGRAM"
      ? "name,username"
      : channel?.type === "FACEBOOK"
        ? "first_name,last_name"
        : null;

  /**
   * Why each of these is said out loud.
   *
   * Every one used to be a bare `return`, and the result was a chat showing a
   * dash with *nothing whatsoever* in the logs — indistinguishable from Meta
   * refusing the lookup, which is a completely different problem in a completely
   * different place. `customerName` is not among them: already having a name is
   * the ordinary case, not a fault.
   */
  const blocked =
    !conversation ? "conversation not found"
    : !conversation.customerRef ? "conversation has no customer id"
    : !channel ? "conversation is not attached to a channel"
    : !channel.accessToken ? "channel holds no access token"
    : !fields ? `no profile fields for a ${channel.type} channel`
    : null;

  if (blocked) {
    log.info(`skipped naming a customer — ${blocked}`, {
      conversationId,
      channelType: channel?.type ?? null,
    });
    return;
  }
  // Narrowing for the compiler; `blocked` above already proved all three.
  if (!conversation?.customerRef || !channel?.accessToken || !fields) return;

  // The ordinary case, and deliberately not logged: a chat that already has a
  // name is not a failure, and saying so on every message would bury the ones
  // above.
  if (conversation.customerName) return;

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
