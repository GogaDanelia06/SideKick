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
  it("keeps a business that is not activated on the billing page only", () => {
    for (const path of ["/dashboard", "/dashboard/ai", "/dashboard/conversations", "/dashboard/team", "/dashboard/profile"]) {
      expect(lockedOut(false, path)).toBe(true);
    }
    for (const path of ["/dashboard/billing", "/dashboard/billing/return"]) {
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
  it("asks the owner to activate a plan", () => {
    const html = render(true);
    expect(html).toContain("ანგარიში ჯერ არ არის გააქტიურებული");
    expect(html).toContain("აირჩიე პაკეტი");
  });

  it("tells a team member to ask the owner", () => {
    expect(render(false)).toContain("სთხოვე მფლობელს");
  });
});
