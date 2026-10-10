export function field(fd: FormData, name: string): string {
  const value = fd.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function optionalField(fd: FormData, name: string): string | null {
  return field(fd, name) || null;
}

export function numberField(fd: FormData, name: string): number | null {
  const value = fd.get(name);
  return value ? Number(value) : null;
}

export function checkbox(fd: FormData, name: string): boolean {
  return fd.get(name) === "on";
}
