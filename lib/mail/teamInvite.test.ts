import { describe, it, expect } from "vitest";
import { teamInviteEmail, type TeamInvite } from "./teamInvite";

const INVITE: TeamInvite = {
  to: "nino@example.com",
  name: "Nino",
  business: "Cafe",
  inviter: "Goga",
  link: "https://sidekick.ge/reset?token=abc",
  setPassword: true,
  google: true,
};

describe("teamInviteEmail()", () => {
  it("names the business and links to setting a password", () => {
    const mail = teamInviteEmail(INVITE);
    expect(mail.subject).toBe("მოწვევა გუნდში „Cafe“ — Sidekick");
    expect(mail.html).toContain('href="https://sidekick.ge/reset?token=abc"');
    expect(mail.html).toContain("პაროლის დაყენება");
    expect(mail.text).toContain("7 დღის");
    expect(mail.text).toContain("Google-ითაც");
  });

  it("asks someone with an account to sign in instead", () => {
    const mail = teamInviteEmail({ ...INVITE, setPassword: false, link: "https://sidekick.ge/login" });
    expect(mail.html).toContain(">\n      შესვლა\n");
    expect(mail.text).not.toContain("7 დღის");
    expect(mail.text).not.toContain("Google");
  });

  it("escapes names typed by other people", () => {
    const mail = teamInviteEmail({ ...INVITE, business: '<img src=x onerror="hack()">', inviter: "<b>Boss</b>" });
    expect(mail.html).not.toContain("<img src=x");
    expect(mail.html).not.toContain("<b>Boss</b>");
    expect(mail.html).toContain("&#60;b&#62;Boss&#60;/b&#62;");
  });
});
