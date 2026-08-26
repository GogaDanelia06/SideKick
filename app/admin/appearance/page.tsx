import { readTheme } from "@/lib/site/theme/read";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { ThemeEditor } from "@/components/admin/appearance/ThemeEditor";
import { ThemeGuide } from "@/components/admin/appearance/ThemeGuide";

export default async function AdminAppearancePage() {
  const theme = await readTheme();

  return (
    <>
      <AdminHeading
        title={{ ka: "იერსახე", en: "Appearance" }}
        subtitle={{
          ka: "საიტისა და დაშბორდის ფერები — ერთ ადგილას.",
          en: "The colours of the site and the dashboard, in one place.",
        }}
      />
      <ThemeGuide />
      {/* Opens on the dark palette. The tab switches the page's own theme too, so
          whichever one is being edited is the one on screen. */}
      <ThemeEditor initial={theme} shade="dark" />
    </>
  );
}
