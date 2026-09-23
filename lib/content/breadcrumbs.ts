import type { Text } from "@/lib/i18n/messages";

export type Crumb = { label: Text; href: string };

export const HOME_CRUMB: Crumb = { label: "breadcrumbs.home", href: "/" };
