import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { PromptDiffPanel } from "./PromptDiffPanel";

const saved = "## როლი\nშენ ხარ ასისტენტი.\n---\n## ფაქტები\n* ფაქტები: მხოლოდ ოფიციალური ინფორმაცია.\n* უცნობი დეტალები: თქვი, რომ არ იცი.";
const proposed = saved
  .replace("---\n", "---\n\n")
  .replace("## ფაქტები\n", "## ფაქტები\n\n")
  .replace("* უცნობი", "* ბანაკი 20 წელია მუშაობს.\n* უცნობი");

describe("PromptDiffPanel", () => {
  it("shows only the line the AI really changed when asked for no context", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <PromptDiffPanel saved={saved} current={proposed} context={0} />
      </LanguageProvider>,
    );
    expect(html).toContain("ბანაკი 20 წელია მუშაობს.");
    expect(html).not.toContain("ცარიელი ხაზი");
    expect(html).not.toContain("მხოლოდ ოფიციალური");
    expect(html).not.toContain("შენ ხარ ასისტენტი");
  });
});
