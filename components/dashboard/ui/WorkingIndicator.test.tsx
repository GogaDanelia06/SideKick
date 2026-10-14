import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { WorkingIndicator } from "./WorkingIndicator";

describe("WorkingIndicator", () => {
  it("says the AI is working, starts the count at zero and shows the hint", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <WorkingIndicator hint="dashboard.conversations.correction.working" />
      </LanguageProvider>,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain("AI მუშაობს… 0 წმ");
    expect(html).toContain("30–60");
  });
});
