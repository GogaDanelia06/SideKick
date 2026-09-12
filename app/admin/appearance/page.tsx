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
      <ThemeEditor initial={theme} shade="dark" />
    </>
  );
}
