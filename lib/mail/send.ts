import { log } from "@/lib/logger";

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/** Must use the verified `send.` subdomain; Resend refuses the root domain. */
const MAIL_FROM = process.env.MAIL_FROM ?? "Sidekick <noreply@send.sidekick.ge>";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const TIMEOUT_MS = 10_000;

/** Whether mail can be sent; registration skips email verification when it cannot. */
export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Sends one message through Resend's HTTP API. */
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

/** Sends one message. Returns `sent` instead of throwing, so callers choose a fallback. */
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
