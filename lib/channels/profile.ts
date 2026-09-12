import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { GRAPH_FACEBOOK, graphHostFor } from "./graphHost";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v25.0";

const TIMEOUT_MS = 5_000;

type Profile = {
  first_name?: string;
  last_name?: string;
  name?: string;
  username?: string;
  error?: { message?: string; code?: number };
};

/** Facebook returns first/last name; Instagram a display name, falling back to @handle. */
function nameFrom(profile: Profile): string | null {
  const full = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return full || profile.name?.trim() || profile.username?.trim() || null;
}

/** The customer's display name from Meta, or null on any failure. */
export async function fetchCustomerName(
  customerId: string,
  accessToken: string,
  fields: string,
  host: string = GRAPH_FACEBOOK,
): Promise<string | null> {
  // Enough to diagnose a failure without logging the token or the name.
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
      // Only the keys are logged; the customer's name stays out of the logs.
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

/** Fills in a missing customer name from Meta. Never overwrites an existing one. */
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

  const fields =
    channel?.type === "INSTAGRAM"
      ? "name,username"
      : channel?.type === "FACEBOOK"
        ? "first_name,last_name"
        : null;

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
  // Type narrowing only; `blocked` has already checked these.
  if (!conversation?.customerRef || !channel?.accessToken || !fields) return;

  if (conversation.customerName) return;

  const name = await fetchCustomerName(
    conversation.customerRef,
    channel.accessToken,
    fields,
    graphHostFor(channel.type, channel.accessToken),
  );
  if (!name) return;

  // An operator may have set a name while the lookup was in flight.
  await prisma.conversation.updateMany({
    where: { id: conversationId, customerName: null },
    data: { customerName: name },
  });
}
