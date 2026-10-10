"use client";

import { Fragment } from "react";
import clsx from "clsx";
import type { DiffRow, Edit } from "@/lib/diff";
import { useLanguage } from "@/lib/i18n/useLanguage";

const ROW = "flex gap-2 px-3.5 py-[3px] text-[13px] leading-[1.55]";
const TEXT = "min-w-0 flex-1 whitespace-pre-wrap [overflow-wrap:anywhere]";
const SIGN = "w-3 shrink-0 select-none text-center font-semibold";

// Colour is never the only sign: a removed word is struck through, and a line starts with −, + or ±.
const MARK = {
  removed: "rounded-[3px] bg-red/25 px-px decoration-red decoration-[1.5px]",
  added: "rounded-[3px] bg-green/25 px-px no-underline",
};

function Mark({ kind, children }: { kind: "removed" | "added"; children: string }) {
  const Tag = kind === "removed" ? "del" : "ins";
  return <Tag className={MARK[kind]}>{children}</Tag>;
}

/** An edited line: its words as they were, each old word struck through with the new one after it. */
function Edited({ pieces }: { pieces: Edit[] }) {
  return (
    <>
      {pieces.map((piece, i) =>
        piece.kind === "same" ? (
          <Fragment key={i}>{piece.text}</Fragment>
        ) : (
          <Fragment key={i}>
            {/* An old word and the one that replaced it would touch; a space keeps them apart. */}
            {piece.kind === "added" && pieces[i - 1]?.kind === "removed" ? " " : null}
            <Mark kind={piece.kind}>{piece.text}</Mark>
          </Fragment>
        ),
      )}
    </>
  );
}

/** One line of the comparison: unchanged, removed (red), added (green), edited, or a fold of unchanged lines. */
export function DiffLine({ row }: { row: DiffRow }) {
  const { t } = useLanguage();

  if (row.kind === "gap") {
    return (
      <div className="my-1 border-y border-dashed border-border2 px-3.5 py-0.5 text-center text-[11px] text-faint">
        {t("dashboard.ai.promptChanges.unchanged", { count: row.count })}
      </div>
    );
  }

  if (row.kind === "same") {
    return (
      <div className={clsx(ROW, "text-muted")}>
        <span aria-hidden className={SIGN} />
        <p className={TEXT}>{row.text || " "}</p>
      </div>
    );
  }

  if (row.kind === "edited") {
    return (
      <div className={ROW}>
        <span aria-hidden className={clsx(SIGN, "text-amber")}>
          ±
        </span>
        <p className={TEXT}>
          <span className="sr-only">{t("dashboard.ai.promptChanges.edited")} </span>
          <Edited pieces={row.pieces} />
        </p>
      </div>
    );
  }

  const removed = row.kind === "removed";
  return (
    <div className={clsx(ROW, removed ? "bg-red-surface" : "bg-green-surface")}>
      <span aria-hidden className={clsx(SIGN, removed ? "text-red" : "text-green")}>
        {removed ? "−" : "+"}
      </span>
      <p className={TEXT}>
        <span className="sr-only">{t(removed ? "dashboard.ai.promptChanges.removed" : "dashboard.ai.promptChanges.added")} </span>
        {row.text ? <Mark kind={row.kind}>{row.text}</Mark> : <span className="text-faint">{t("dashboard.ai.promptChanges.emptyLine")}</span>}
      </p>
    </div>
  );
}
