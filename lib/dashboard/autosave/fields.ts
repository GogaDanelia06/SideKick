/** A form's values by field name, in page order; a group of checkboxes keeps every ticked value. */
export type Fields = Record<string, string[]>;

export function fieldsOf(entries: Iterable<[string, FormDataEntryValue]>): Fields {
  const fields: Fields = {};
  for (const [name, value] of entries) {
    if (typeof value === "string") (fields[name] ??= []).push(value);
  }
  return fields;
}

/** Works on a hidden or already removed form too, which is when a section is saved. */
export const readFields = (form: HTMLFormElement): Fields => fieldsOf(new FormData(form));

/** The fields whose values differ, as they are in `after`; null when nothing changed. */
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

/** Sets the value through the element's own prototype, so React sees the change as typing. */
function setValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

/** Puts saved-aside values back into a form; fields not named in `fields` are left alone. */
export function applyFields(form: HTMLFormElement, fields: Fields) {
  for (const el of Array.from(form.elements)) {
    const control = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
    if (!control || !el.name || !Object.hasOwn(fields, el.name)) continue;

    const values = fields[el.name];
    if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
      const on = values.includes(el.value);
      // A click fires the events React listens to; a ticked radio is only unticked by its neighbour.
      if (el.type === "radio" ? on && !el.checked : el.checked !== on) el.click();
    } else {
      setValue(el, values[0] ?? "");
    }
  }
}
