import clsx from "clsx";

/** Pill toggle used for theme, AI on/off, role and handoff switches. */
export function Switch({
  on,
  onToggle,
  ariaLabel,
  tone = "primary",
}: {
  on: boolean;
  onToggle: () => void;
  ariaLabel?: string;
  tone?: "primary" | "ai";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={clsx(
        "relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors",
        on ? (tone === "ai" ? "bg-ai" : "bg-primary") : "bg-border",
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 size-[18px] rounded-full bg-white shadow transition-[left]",
          on ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}
