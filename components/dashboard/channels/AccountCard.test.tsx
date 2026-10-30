import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import type { AccountProfile } from "@/lib/channels/accountProfile";
import { AccountCard } from "./AccountCard";

const render = (account: AccountProfile | null) =>
  renderToStaticMarkup(
    <LanguageProvider>
      <AccountCard account={account} />
    </LanguageProvider>,
  );

const ACCOUNT: AccountProfile = {
  name: "SideKick",
  username: "sidekickge",
  picture: "https://scontent.cdninstagram.com/p.jpg",
  followers: 1240,
  posts: 1,
  link: "https://www.instagram.com/sidekickge",
};

describe("AccountCard", () => {
  it("shows the picture, name, username and counts, linking to the profile", () => {
    const html = render(ACCOUNT);
    expect(html).toContain('href="https://www.instagram.com/sidekickge"');
    expect(html).toContain('src="https://scontent.cdninstagram.com/p.jpg"');
    expect(html).toContain("SideKick");
    expect(html).toContain("@sidekickge · 1.2K გამომწერი · 1 პოსტი");
  });

  it("falls back to the first letter and plain box when there is no picture or link", () => {
    const html = render({ ...ACCOUNT, picture: null, link: null, username: null, followers: null, posts: null });
    expect(html).not.toContain("<a");
    expect(html).not.toContain("<img");
    expect(html).toContain(">S</span>");
  });

  it("says when Meta would not return the account", () => {
    expect(render(null)).toContain("Meta-დან ანგარიში ვერ ჩაიტვირთა");
  });
});
