import type { Metadata } from "next";
import { Services } from "@/components/pricing/Services";
import { Packages } from "@/components/pricing/Packages";

export const metadata: Metadata = { title: "ფასები" };

export default function PricingPage() {
  return (
    <>
      <Services />
      <Packages />
    </>
  );
}
