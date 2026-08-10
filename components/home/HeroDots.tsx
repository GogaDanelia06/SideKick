"use client";

import clsx from "clsx";

export function HeroDots({
  count,
  index,
  onSelect,
}: {
  count: number;
  index: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex justify-center gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Slide ${i + 1}`}
          aria-current={i === index}
          onClick={() => onSelect(i)}
          className={clsx(
            "h-2.5 rounded-full transition-all",
            i === index ? "w-7 bg-primary" : "w-2.5 bg-muted opacity-50",
          )}
        />
      ))}
    </div>
  );
}
