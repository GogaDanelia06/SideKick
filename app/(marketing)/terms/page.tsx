import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { TERMS } from "@/lib/content/legal";

export const generateMetadata = legalMetadata(TERMS);

export const revalidate = 3600;

export default function Page() {
  return <LegalPage doc={TERMS} crumb="terms.termsAndConditions" />;
}
