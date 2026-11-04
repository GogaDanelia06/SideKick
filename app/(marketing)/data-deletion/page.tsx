import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { DATA_DELETION } from "@/lib/content/legal";

export const generateMetadata = legalMetadata(DATA_DELETION);

export const revalidate = 3600;

export default function Page() {
  return <LegalPage doc={DATA_DELETION} crumb="dataDeletion.dataDeletion" />;
}
