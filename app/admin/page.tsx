import Link from "next/link";
import {
  IconChartBar,
  IconTag,
  IconHelpCircle,
  IconSearch,
  IconChevronRight,
} from "@tabler/icons-react";
import { prisma } from "@/lib/db";
import { ADMIN } from "@/lib/admin/routes";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { BiText } from "@/components/admin/ui/BiText";
import type { Bilingual } from "@/lib/content/types";

async function cards() {
  const [stats, plans, faq] = await Promise.all([
    prisma.siteStat.count(),
    prisma.plan.count(),
    prisma.siteFaq.count(),
  ]);
  return [
    {
      href: ADMIN.stats,
      icon: IconChartBar,
      title: { ka: "სტატისტიკა", en: "Stats" },
      desc: {
        ka: "მთავარი გვერდის ციფრები. ცარიელი თუ იქნება, სექცია არ გამოჩნდება.",
        en: "Homepage figures. If empty, the section is hidden.",
      },
      count: stats,
      unit: { ka: "მაჩვენებელი", en: "stats" },
    },
    {
      href: ADMIN.plans,
      icon: IconTag,
      title: { ka: "პაკეტები", en: "Plans" },
      desc: {
        ka: "პაკეტების ფასები და ლიმიტები — ერთი წყარო საიტისა და ბილინგისთვის.",
        en: "Plan prices and limits — one source for the site and billing.",
      },
      count: plans,
      unit: { ka: "პაკეტი", en: "plans" },
    },
    {
      href: ADMIN.faq,
      icon: IconHelpCircle,
      title: { ka: "FAQ", en: "FAQ" },
      desc: {
        ka: "კონტაქტის გვერდის ხშირად დასმული კითხვები.",
        en: "The frequently-asked questions on the contact page.",
      },
      count: faq,
      unit: { ka: "კითხვა", en: "questions" },
    },
    {
      href: ADMIN.seo,
      icon: IconSearch,
      title: { ka: "SEO", en: "SEO" },
      desc: {
        ka: "საიტის სათაური და აღწერა საძიებო სისტემებისთვის.",
        en: "Site title and description for search engines.",
      },
      count: null,
      unit: { ka: "", en: "" },
    },
  ] satisfies {
    href: string;
    icon: typeof IconChartBar;
    title: Bilingual;
    desc: Bilingual;
    count: number | null;
    unit: Bilingual;
  }[];
}

export default async function AdminHome() {
  const items = await cards();

  return (
    <>
      <AdminHeading
        title={{ ka: "მართვის პანელი", en: "Control panel" }}
        subtitle={{
          ka: "აქედან იმართება საიტის საჯარო კონტენტი. ცვლილება მაშინვე აისახება საიტზე.",
          en: "Edit the site's public content here. Changes appear on the site immediately.",
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-ink/40"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-soft text-ink">
                <c.icon size={18} />
              </span>
              <BiText as="h3" className="text-base font-semibold" value={c.title} />
              <IconChevronRight
                size={18}
                className="ml-auto text-faint transition-transform group-hover:translate-x-0.5"
              />
            </div>
            <BiText as="p" className="text-sm text-muted" value={c.desc} />
            {c.count !== null ? (
              <div className="mt-3 text-[13px] font-medium text-ink">
                {c.count} <BiText as="span" className="text-muted" value={c.unit} />
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </>
  );
}
