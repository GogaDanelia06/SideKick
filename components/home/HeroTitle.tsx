export function HeroTitle({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);

  return (
    <h1 className="my-[18px] text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[46px]">
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={i} className="not-italic text-green">
            {part.slice(1, -1)}
          </em>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </h1>
  );
}
