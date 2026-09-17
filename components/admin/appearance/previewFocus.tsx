"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import { GROUPS, TOKENS } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";

type Focus = {
  /** The colour pointed at in the list; its parts of the preview light up. */
  active: string | null;
  /** Brings a colour's row into view. */
  pick: (tokenId: string) => void;
};

export const PreviewFocus = createContext<Focus>({ active: null, pick: () => {} });

/**
 * A part of the preview painted with `tokens`. It is outlined while one of them is
 * pointed at, names them on hover, and a click jumps to the first one's row.
 */
export function Spot({
  tokens,
  as: Tag = "span",
  style,
  className,
  children,
}: {
  tokens: string[];
  as?: "span" | "div";
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}) {
  const { active, pick } = useContext(PreviewFocus);
  const { t } = useLanguage();
  const lit = active !== null && tokens.includes(active);

  const names = tokens.flatMap((id) => {
    const token = TOKENS.find((x) => x.id === id);
    const group = GROUPS.find((g) => g.id === token?.group);
    return token && group ? [`${t(token.label)} (${t(group.label)})`] : [];
  });

  return (
    <Tag
      style={style}
      title={names.join(" · ")}
      onClick={(e) => {
        e.stopPropagation();
        pick(tokens[0]);
      }}
      className={clsx(
        className,
        "cursor-pointer",
        lit && "outline-2 outline-[#f59e0b]",
        lit && (Tag === "div" ? "-outline-offset-2" : "outline-offset-2"),
      )}
    >
      {children}
    </Tag>
  );
}
