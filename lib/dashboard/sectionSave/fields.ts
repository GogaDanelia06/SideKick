export type Fields = Record<string, string[]>;

export function fieldsOf(entries: Iterable<[string, FormDataEntryValue]>): Fields {
  const fields: Fields = {};
  for (const [name, value] of entries) {
    if (typeof value === "string") (fields[name] ??= []).push(value);
  }
  return fields;
}

export const readFields = (form: HTMLFormElement): Fields => fieldsOf(new FormData(form));

export function changedFields(before: Fields, after: Fields): Fields | null {
  const changed: Fields = {};
  for (const name of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const was = before[name] ?? [];
    const now = after[name] ?? [];
    if (was.length !== now.length || was.some((value, i) => value !== now[i])) changed[name] = now;
  }
  return Object.keys(changed).length > 0 ? changed : null;
}

export const toEntries = (fields: Fields): [string, string][] =>
  Object.entries(fields).flatMap(([name, values]) => values.map((value): [string, string] => [name, value]));

function setValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

export function applyFields(form: HTMLFormElement, fields: Fields) {
  for (const el of Array.from(form.elements)) {
    const control = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
    if (!control || !el.name || !Object.hasOwn(fields, el.name)) continue;

    const values = fields[el.name];
    if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
      const on = values.includes(el.value);
      if (el.type === "radio" ? on && !el.checked : el.checked !== on) el.click();
    } else {
      setValue(el, values[0] ?? "");
    }
  }
}
