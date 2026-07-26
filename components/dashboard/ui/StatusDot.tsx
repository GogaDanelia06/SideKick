import clsx from "clsx";
import { TONE_DOT, type Tone } from "@/lib/dashboard/tone";

export function StatusDot({ tone }: { tone: Tone }) {
  return <span className={clsx("size-[9px] rounded-full", TONE_DOT[tone])} />;
}
