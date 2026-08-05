import { log } from "@/lib/logger";

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const MAIL_FROM = process.env.MAIL_FROM ?? "Sidekick <noreply@sidekick.ge>";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** How long we wait on the provider before giving up on one message. */
const TIMEOUT_MS = 10_000;

/**
 * Whether mail can actually leave the building.
 *
 * Callers use this to decide policy, not just wording — registration keeps
 * auto-verifying new accounts while this is false, because handing someone an
 * account they can never confirm is worse than not verifying at all.
 */
export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Hands one message to Resend.
 *
 * Written against their HTTP API with plain `fetch` rather than the SDK: it is
 * one request, it adds no dependency to install or keep current, and swapping
 * providers later means editing this function instead of unpicking an import
 * that has spread through the codebase.
 */
async function viaResend(mail: Mail): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Resend answers with a JSON body explaining the refusal — usually an
      // unverified sending domain, which is the mistake everyone makes first.
      const detail = await res.text().catch(() => "");
      throw new Error(`Resend refused the message (${res.status}): ${detail.slice(0, 300)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

/** Prints the message instead of sending it, so local work needs no account. */
function toConsole(mail: Mail): void {
  console.warn(
    `\n─── EMAIL (not sent — no provider configured) ───\n` +
      `from:    ${MAIL_FROM}\n` +
      `to:      ${mail.to}\n` +
      `subject: ${mail.subject}\n\n` +
      `${mail.text}\n` +
      `────────────────────────────────────────────────\n`,
  );
}

/**
 * Sends one message, or reports honestly that it could not.
 *
 * Returns `sent` rather than throwing because every caller has something
 * sensible to do with a failure — a password reset says "try again", and
 * registration falls back to activating the account directly. A thrown error
 * would turn a mail outage into a broken sign-up form.
 */
export async function sendMail(mail: Mail): Promise<{ sent: boolean }> {
  if (!mailConfigured()) {
    toConsole(mail);
    return { sent: false };
  }

  try {
    await viaResend(mail);
    log.info("mail sent", { to: mail.to, subject: mail.subject });
    return { sent: true };
  } catch (err) {
    log.error("mail delivery failed", err, { to: mail.to, subject: mail.subject });
    return { sent: false };
  }
}
