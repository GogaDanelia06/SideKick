import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { DATA_PROTECTION } from "@/lib/content/legal";

export const generateMetadata = legalMetadata(DATA_PROTECTION);

export const revalidate = 3600;

export default function Page() {
  return <LegalPage doc={DATA_PROTECTION} crumb="dataProtection.personalDataProtection" />;
}
