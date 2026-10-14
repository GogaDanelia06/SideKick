export type Inline = { kind: "text" | "strong" | "em" | "code"; text: string };

const TOKEN = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\s][^*\n]*\*)/g;

export function parseInline(text: string): Inline[] {
  return text
    .split(TOKEN)
    .filter(Boolean)
    .map((part): Inline => {
      if (/^(\*\*|__).+(\*\*|__)$/.test(part)) return { kind: "strong", text: part.slice(2, -2) };
      if (/^`.+`$/.test(part)) return { kind: "code", text: part.slice(1, -1) };
      if (/^\*.+\*$/.test(part)) return { kind: "em", text: part.slice(1, -1) };
      return { kind: "text", text: part };
    });
}
