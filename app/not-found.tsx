import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotFoundView } from "@/components/layout/NotFoundView";
import { getContactDetails } from "@/lib/site/content/contactDetails";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const contact = await getContactDetails();
  return (
    <>
      <Header />
      <main>
        <NotFoundView />
      </main>
      <Footer contact={contact} />
    </>
  );
}
