import clsx from "clsx";
import { TONE_DOT, type Tone } from "@/lib/dashboard/tone";

/** Small glowing status light used for channel health. */
export function StatusDot({ tone }: { tone: Tone }) {
  return <span className={clsx("size-[9px] rounded-full", TONE_DOT[tone])} />;
}
