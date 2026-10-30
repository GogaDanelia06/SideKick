import type { Mail } from "./send";

export type TeamInvite = {
  to: string;
  name: string | null;
  business: string;
  inviter: string;
  link: string;
  setPassword: boolean;
  google: boolean;
};

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

export function teamInviteEmail(invite: TeamInvite): Mail {
  const business = oneLine(invite.business);
  const inviter = oneLine(invite.inviter);
  const greeting = invite.name ? `გამარჯობა, ${oneLine(invite.name)}!` : "გამარჯობა!";
  const intro = `${inviter} გიწვევთ ბიზნესის „${business}“ გუნდში Sidekick-ზე`;
  const step = invite.setPassword
    ? "შესასვლელად დააყენეთ პაროლი:"
    : `შედით თქვენი ანგარიშით და ბიზნესების სიიდან აირჩიეთ „${business}“.`;
  const button = invite.setPassword ? "პაროლის დაყენება" : "შესვლა";
  const notes = [
    invite.setPassword ? "ბმული აქტიურია 7 დღის განმავლობაში და მხოლოდ ერთხელ გამოიყენება." : null,
    invite.setPassword && invite.google ? "შეგიძლიათ შეხვიდეთ Google-ითაც, ამავე ელფოსტით." : null,
    "თუ ამ ბიზნესს არ იცნობთ — უბრალოდ დააიგნორეთ ეს წერილი.",
  ].filter((n): n is string => n !== null);

  const text = [greeting, "", `${intro}.`, step, "", invite.link, "", ...notes, "", "— Sidekick"].join("\n");

  const html = `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2328;line-height:1.6">
  <div style="font-size:20px;font-weight:600;margin-bottom:16px">Sidekick</div>
  <p>${escape(greeting)}</p>
  <p>${escape(intro)}.</p>
  <p>${escape(step)}</p>
  <p style="margin:24px 0">
    <a href="${invite.link}" style="background:#1f883d;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:500;display:inline-block">
      ${button}
    </a>
  </p>
  ${notes.map((n) => `<p style="font-size:13px;color:#59636e">${escape(n)}</p>`).join("\n  ")}
  <hr style="border:0;border-top:1px solid #d0d7de;margin:24px 0">
  <p style="font-size:12px;color:#818b98;word-break:break-all">
    თუ ღილაკი არ მუშაობს, დააკოპირეთ ეს მისამართი:<br>${invite.link}
  </p>
</div>`.trim();

  return { to: invite.to, subject: `მოწვევა გუნდში „${business}“ — Sidekick`, html, text };
}
