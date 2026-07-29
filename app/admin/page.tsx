import Link from "next/link";
import { IconChevronRight, IconExternalLink } from "@tabler/icons-react";
import { ADMIN_PAGES } from "@/lib/admin/pages";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { BiText } from "@/components/admin/ui/BiText";

/** One card per public page, listing the sections it contains — the same
 *  structure as the sidebar, so the two never tell different stories. */
export default function AdminHome() {
  return (
    <>
      <AdminHeading
        title={{ ka: "მართვის პანელი", en: "Control panel" }}
        subtitle={{
          ka: "აირჩიე გვერდი, შემდეგ სექცია. ცვლილება მაშინვე აისახება საიტზე.",
          en: "Pick a page, then a section. Changes appear on the site immediately.",
        }}
      />

      <div className="grid max-w-[1100px] gap-4 sm:grid-cols-2">
        {ADMIN_PAGES.map((p) => (
          <Link
            key={p.slug}
            href={`/admin/page/${p.slug}`}
            className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-ink/40"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-soft text-ink">
                <p.icon size={18} />
              </span>
              <BiText as="h3" className="text-base font-semibold" value={p.label} />
              <IconChevronRight
                size={18}
                className="ml-auto text-faint transition-transform group-hover:translate-x-0.5"
              />
            </div>

            <ul className="flex flex-col gap-1">
              {p.sections.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-[13px] text-muted">
                  <s.icon size={14} className="shrink-0 text-faint" />
                  <BiText value={s.label} />
                </li>
              ))}
            </ul>

            <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-faint">
              <IconExternalLink size={11} />
              {p.route}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
