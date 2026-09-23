import { readTheme } from "@/lib/site/theme/read";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { ThemeEditor } from "@/components/admin/appearance/ThemeEditor";

export default async function AdminAppearancePage() {
  const theme = await readTheme();

  return (
    <>
      <AdminHeading
        title={"admin.appearance.appearance"}
        subtitle={"admin.appearance.subtitle"}
      />
      <ThemeEditor initial={theme} />
    </>
  );
}
