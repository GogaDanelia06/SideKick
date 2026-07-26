import { getSeoSettings } from "@/lib/site/content";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { SeoEditor } from "@/components/admin/seo/SeoEditor";

export default async function AdminSeoPage() {
  const seo = await getSeoSettings();

  return (
    <>
      <AdminHeading
        title={{ ka: "SEO", en: "SEO" }}
        subtitle={{
          ka: "მთავარი გვერდის სათაური და აღწერა, რომელსაც Google აჩვენებს ძიების შედეგებში. ცარიელი ველი უბრუნდება ნაგულისხმევ მნიშვნელობას.",
          en: "The homepage title and description Google shows in search results. An empty field falls back to the site default.",
        }}
      />
      <SeoEditor title={seo.title} description={seo.description} />
    </>
  );
}
