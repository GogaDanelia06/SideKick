import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { PRIVACY } from "@/lib/content/legal";

export const generateMetadata = legalMetadata(PRIVACY);

export const revalidate = 3600;

export default function Page() {
  return <LegalPage doc={PRIVACY} crumb="privacy.privacyPolicy" />;
}
