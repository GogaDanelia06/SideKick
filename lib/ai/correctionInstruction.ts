export type ThreadMessage = { id: string; sender: string; text: string };

const CONTEXT_BEFORE = 2;
const MAX_CHARS = 600;

const SPEAKER: Record<string, string> = {
  CUSTOMER: "კლიენტი",
  AI: "ასისტენტი",
  OPERATOR: "ოპერატორი",
};

const clip = (text: string) => (text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}…` : text);

function excerpt(thread: ThreadMessage[], picked: Set<string>): string[] {
  const shown = new Set<number>();
  thread.forEach((message, i) => {
    if (!picked.has(message.id)) return;
    for (let j = Math.max(0, i - CONTEXT_BEFORE); j <= i; j++) shown.add(j);
  });

  const lines: string[] = [];
  let last = -1;
  for (const i of [...shown].sort((a, b) => a - b)) {
    if (last >= 0 && i > last + 1) lines.push("…");
    const message = thread[i];
    const speaker = SPEAKER[message.sender] ?? message.sender;
    const mark = picked.has(message.id) ? " [არასწორი პასუხი]" : "";
    lines.push(`${speaker}${mark}: ${clip(message.text.trim())}`);
    last = i;
  }
  return lines;
}

export function correctionInstruction(thread: ThreadMessage[], selectedIds: string[], note: string): string | null {
  const picked = new Set(selectedIds);
  const clean = note.trim();
  if (!clean || !thread.some((message) => picked.has(message.id))) return null;

  return [
    "მიმოწერაში ასისტენტმა არასწორად უპასუხა. შეასწორე პრომპტი ისე, რომ მსგავს სიტუაციაში ასე აღარ უპასუხოს.",
    "",
    "მიმოწერის ნაწყვეტი:",
    ...excerpt(thread, picked),
    "",
    "რა იყო არასწორი და როგორ უნდა იყოს:",
    clean,
  ].join("\n");
}
