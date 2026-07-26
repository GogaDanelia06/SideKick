import { prisma } from "@/lib/db";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { FaqEditor } from "@/components/admin/faq/FaqEditor";

export default async function AdminFaqPage() {
  const faqs = await prisma.siteFaq.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminHeading
        title={{ ka: "ხშირად დასმული კითხვები", en: "Marketing FAQ" }}
        subtitle={{
          ka: "კონტაქტის გვერდის კითხვები. გამოქვეყნებული კითხვები საძიებო სისტემებისთვისაც ჩანს (FAQ Rich Results).",
          en: "The questions on the contact page. Published questions also feed search engines (FAQ rich results).",
        }}
      />
      <FaqEditor faqs={faqs} />
    </>
  );
}
