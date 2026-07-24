/**
 * Outbound email.
 *
 * No provider is configured yet, so this logs the message (including the reset
 * link) to the server console instead of sending. That keeps the whole reset
 * flow testable today.
 *
 * TO GO LIVE: pick a provider, add its key to .env, and implement `deliver()`.
 * Nothing else in the app needs to change — every caller goes through here.
 *
 * Example with Resend (https://resend.com):
 *   const res = await fetch("https://api.resend.com/emails", {
 *     method: "POST",
 *     headers: {
 *       Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
 *       "Content-Type": "application/json",
 *     },
 *     body: JSON.stringify({ from: MAIL_FROM, to, subject, html }),
 *   });
 *   if (!res.ok) throw new Error(await res.text());
 */

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const MAIL_FROM = process.env.MAIL_FROM ?? "Sidekick <noreply@sidekick.ge>";

/** True once a real provider is configured. */
export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

async function deliver(mail: Mail) {
  // Placeholder: no provider wired yet. See the note above.
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
 * Send an email. Never throws — a failing mailer must not break the request
 * that triggered it (e.g. a password-reset request should still return 200,
 * so the response can't be used to probe which addresses exist).
 */
export async function sendMail(mail: Mail): Promise<{ sent: boolean }> {
  try {
    await deliver(mail);
    return { sent: true };
  } catch (err) {
    console.error("[mail] delivery failed:", err);
    return { sent: false };
  }
}
