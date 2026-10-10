import type { PageSeo } from "@prisma/client";
import type { Text } from "@/lib/i18n/messages";

export const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2.5 text-sm outline-none placeholder:text-faint focus:border-blue";

export const LIMITS = { title: 60, description: 160 };

export const ERRORS: Record<string, Text> = {
  bad_canonical: "admin.seo.editor.canonicalMustBeA",
  unknown_page: "admin.seo.editor.unknownPage",
};

export type SeoValues = Pick<
  PageSeo,
  "title" | "description" | "canonical" | "indexable" | "ogTitle" | "ogDescription" | "ogImageUrl"
>;
