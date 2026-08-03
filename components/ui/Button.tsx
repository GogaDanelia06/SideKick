import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";

const BASE =
  "inline-flex h-10 items-center justify-center gap-2 rounded-sm px-[18px] text-sm font-medium transition-colors";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  outline: "border border-input text-ink hover:border-blue",
  ghost: "text-ink hover:text-blue",
};

type CommonProps = { variant?: Variant; className?: string; children: ReactNode };

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: CommonProps &
  // The link variant accepts onClick too — a button that navigates still
  // sometimes needs to report the click before the page changes.
  (({ href: string; onClick?: () => void }) | (ComponentProps<"button"> & { href?: undefined }))) {
  const cls = clsx(BASE, VARIANTS[variant], className);
  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} onClick={rest.onClick} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...(rest as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
