/** A trimmed text field; "" when missing. */
export function field(fd: FormData, name: string): string {
  const value = fd.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** A trimmed text field, or null when empty. */
export function optionalField(fd: FormData, name: string): string | null {
  return field(fd, name) || null;
}

/** A number field, or null when empty. */
export function numberField(fd: FormData, name: string): number | null {
  const value = fd.get(name);
  return value ? Number(value) : null;
}

/** A number field, or `fallback` when it is not a finite number. */
export function num(fd: FormData, name: string, fallback: number): number {
  const n = Number(field(fd, name));
  return Number.isFinite(n) ? n : fallback;
}

export function checkbox(fd: FormData, name: string): boolean {
  return fd.get(name) === "on";
}
