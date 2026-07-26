import { log } from "@/lib/logger";

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const MAIL_FROM = process.env.MAIL_FROM ?? "Sidekick <noreply@sidekick.ge>";

export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

async function deliver(mail: Mail) {
  console.warn(
    `\n─── EMAIL (not sent — no provider configured) ───\n` +
      `from:    ${MAIL_FROM}\n` +
      `to:      ${mail.to}\n` +
      `subject: ${mail.subject}\n\n` +
      `${mail.text}\n` +
      `────────────────────────────────────────────────\n`,
  );
}

export async function sendMail(mail: Mail): Promise<{ sent: boolean }> {
  try {
    await deliver(mail);
    return { sent: true };
  } catch (err) {
    log.error("mail delivery failed", err, { to: mail.to, subject: mail.subject });
    return { sent: false };
  }
}
