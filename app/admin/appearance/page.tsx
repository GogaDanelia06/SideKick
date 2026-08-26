import { readTheme } from "@/lib/site/theme/read";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { ThemeEditor } from "@/components/admin/appearance/ThemeEditor";

export default async function AdminAppearancePage() {
  const theme = await readTheme();

  return (
    <>
      <AdminHeading
        title={{ ka: "იერსახე", en: "Appearance" }}
        subtitle={{
          ka: "საიტისა და დაშბორდის ფერები. აირჩიე — მაშინვე დაინახავ ეკრანზე, შემდეგ შეინახე.",
          en: "The colours of the site and the dashboard. Change one and you see it immediately, then save.",
        }}
      />
      {/* Opens on the dark palette. The tab switches the page's own theme too, so
          whichever one is being edited is the one on screen. */}
      <ThemeEditor initial={theme} shade="dark" />
    </>
  );
}
