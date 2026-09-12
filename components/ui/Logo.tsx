import Link from "next/link";
import clsx from "clsx";
import { ROUTES } from "@/lib/routes";
import { Wordmark } from "./Wordmark";

/** The logo linking home; sized by height to keep its proportions. */
export function Logo({ className, tagline = true }: { className?: string; tagline?: boolean }) {
  return (
    <Link href={ROUTES.home} className={clsx("inline-flex items-center", className)}>
      <Wordmark tagline={tagline} className={tagline ? "h-[34px]" : "h-[22px]"} />
    </Link>
  );
}
