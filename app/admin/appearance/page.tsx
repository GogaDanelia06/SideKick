import { BG_KEY, DEFAULT_BACKGROUND } from "@/lib/site/backgrounds";
import { getSiteValue } from "@/lib/site/content";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { BackgroundPicker } from "@/components/admin/appearance/BackgroundPicker";

export default async function AdminAppearancePage() {
  const current = (await getSiteValue(BG_KEY)) ?? DEFAULT_BACKGROUND;

  return (
    <>
      <AdminHeading
        title={{ ka: "იერსახე", en: "Appearance" }}
        subtitle={{
          ka: "ფონის ფერი საიტისთვის და დაშბორდისთვის. აირჩიე — მაშინვე დაინახავ, შემდეგ შეინახე.",
          en: "The background colour for the site and the dashboard. Pick one to see it, then save.",
        }}
      />
      <BackgroundPicker current={current} />
    </>
  );
}
