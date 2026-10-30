import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { ActivatePlan, lockedOut } from "./ActivatePlan";

const render = (owner: boolean) =>
  renderToStaticMarkup(
    <LanguageProvider>
      <ActivatePlan owner={owner} />
    </LanguageProvider>,
  );

describe("lockedOut()", () => {
  it("keeps a business that is not activated out of every page but billing and profile", () => {
    for (const path of ["/dashboard", "/dashboard/ai", "/dashboard/conversations", "/dashboard/channels", "/dashboard/team"]) {
      expect(lockedOut(false, path)).toBe(true);
    }
    for (const path of ["/dashboard/billing", "/dashboard/billing/return", "/dashboard/profile"]) {
      expect(lockedOut(false, path)).toBe(false);
    }
  });

  it("does not let a look-alike path through", () => {
    expect(lockedOut(false, "/dashboard/billingx")).toBe(true);
  });

  it("locks nothing once the business is activated", () => {
    expect(lockedOut(true, "/dashboard/ai")).toBe(false);
  });
});

describe("ActivatePlan", () => {
  it("sends the owner to billing", () => {
    const html = render(true);
    expect(html).toContain('href="/dashboard/billing"');
    expect(html).toContain("ანგარიში ჯერ არ არის გააქტიურებული");
  });

  it("tells a team member to ask the owner, with no billing link", () => {
    const html = render(false);
    expect(html).not.toContain("/dashboard/billing");
    expect(html).toContain("სთხოვე მფლობელს");
  });
});
