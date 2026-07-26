import type { Mail } from "./send";

export function passwordResetEmail(to: string, link: string, name?: string | null): Mail {
  const greeting = name ? `გამარჯობა, ${name}!` : "გამარჯობა!";

  const text = [
    greeting,
    "",
    "მოგვივიდა თქვენი პაროლის აღდგენის მოთხოვნა.",
    "ახალი პაროლის დასაყენებლად გადადით ბმულზე:",
    "",
    link,
    "",
    "ბმული აქტიურია 1 საათის განმავლობაში და მხოლოდ ერთხელ გამოიყენება.",
    "თუ ეს თქვენ არ მოგითხოვიათ — უბრალოდ დააიგნორეთ ეს წერილი,",
    "თქვენი პაროლი უცვლელი დარჩება.",
    "",
    "— Sidekick",
  ].join("\n");

  const html = `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2328;line-height:1.6">
  <div style="font-size:20px;font-weight:600;margin-bottom:16px">Sidekick</div>
  <p>${greeting}</p>
  <p>მოგვივიდა თქვენი პაროლის აღდგენის მოთხოვნა. ახალი პაროლის დასაყენებლად დააჭირეთ ღილაკს:</p>
  <p style="margin:24px 0">
    <a href="${link}" style="background:#1f883d;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:500;display:inline-block">
      პაროლის შეცვლა
    </a>
  </p>
  <p style="font-size:13px;color:#59636e">
    ბმული აქტიურია <b>1 საათის</b> განმავლობაში და მხოლოდ ერთხელ გამოიყენება.
  </p>
  <p style="font-size:13px;color:#59636e">
    თუ ეს თქვენ არ მოგითხოვიათ — უბრალოდ დააიგნორეთ ეს წერილი, თქვენი პაროლი უცვლელი დარჩება.
  </p>
  <hr style="border:0;border-top:1px solid #d0d7de;margin:24px 0">
  <p style="font-size:12px;color:#818b98;word-break:break-all">
    თუ ღილაკი არ მუშაობს, დააკოპირეთ ეს მისამართი:<br>${link}
  </p>
</div>`.trim();

  return { to, subject: "პაროლის აღდგენა — Sidekick", html, text };
}

export function passwordChangedEmail(to: string): Mail {
  const text = [
    "თქვენი Sidekick-ის პაროლი წარმატებით შეიცვალა.",
    "",
    "თუ ეს თქვენ არ გაგიკეთებიათ, დაუყოვნებლივ დაგვიკავშირდით.",
    "",
    "— Sidekick",
  ].join("\n");

  const html = `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2328;line-height:1.6">
  <div style="font-size:20px;font-weight:600;margin-bottom:16px">Sidekick</div>
  <p>თქვენი პაროლი წარმატებით შეიცვალა.</p>
  <p style="font-size:13px;color:#59636e">თუ ეს თქვენ არ გაგიკეთებიათ, დაუყოვნებლივ დაგვიკავშირდით.</p>
</div>`.trim();

  return { to, subject: "პაროლი შეიცვალა — Sidekick", html, text };
}
