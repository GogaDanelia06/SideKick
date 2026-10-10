import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import { getContactDetails } from "@/lib/site/content/contactDetails";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contact = await getContactDetails();
  return (
    <>
      <JsonLd data={organizationSchema(contact)} />
      <JsonLd data={websiteSchema()} />
      <Header />
      <main>{children}</main>
      <Footer contact={contact} />
      <ChatWidget />
    </>
  );
}
