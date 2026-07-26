import Link from "next/link";
import clsx from "clsx";
import { IconBolt } from "@tabler/icons-react";
import { BRAND } from "@/lib/content/common";
import { ROUTES } from "@/lib/routes";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.home}
      className={clsx("inline-flex items-center gap-[9px] text-[17px] font-semibold", className)}
    >
      <span className="grid size-[30px] place-items-center rounded-md bg-primary text-white">
        <IconBolt size={17} />
      </span>
      {BRAND}
    </Link>
  );
}
