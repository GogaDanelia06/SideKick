import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotFoundView } from "@/components/layout/NotFoundView";

// Root 404 — catches every unmatched URL. Header/Footer are added here because
// this renders outside the (marketing) layout.
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <NotFoundView />
      </main>
      <Footer />
    </>
  );
}
