"use client";

import { BoxesEditor } from "./boxes/BoxesEditor";
import { TextGroupEditor } from "./content/TextGroupEditor";
import { FaqEditor } from "./faq/FaqEditor";
import { HeroEditor } from "./hero/HeroEditor";
import { LegalEditor } from "./legal/LegalEditor";
import { PlansEditor } from "./plans/PlansEditor";
import { SeoEditor } from "./seo/SeoEditor";
import { StatsEditor } from "./stats/StatsEditor";
import type { SectionData } from "./sectionData";

export function SectionEditor({ data }: { data: SectionData }) {
  switch (data.kind) {
    case "carousel":
      return <HeroEditor slides={data.slides} intervalSeconds={data.intervalSeconds} sources={data.sources} />;
    case "stats":
      return <StatsEditor stats={data.stats} sources={data.sources} />;
    case "text":
      return <TextGroupEditor group={data.group} values={data.values} />;
    case "boxes":
      return <BoxesEditor kind={data.boxKind} items={data.items} />;
    case "plans":
      return <PlansEditor plans={data.plans} />;
    case "faq":
      return <FaqEditor faqs={data.faqs} />;
    case "legal":
      return (
        <LegalEditor
          doc={data.doc}
          sections={data.sections}
          title={data.title}
          defaultTitle={data.defaultTitle}
        />
      );
    case "seo":
      return <SeoEditor path={data.path} values={data.values} defaults={data.defaults} />;
  }
}
