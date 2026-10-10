# Where the words live

Every word the interface says is in the **`messages/ka/`** and **`messages/en/`** folders,
under a key like `dashboard.profile.fields.profileSaved`. Nothing readable is written into
a component any more, so a translator can work in those folders and never open the code.

Each folder holds one small JSON file per area, so a key is found by its path:
`dashboard.profile.fields.profileSaved` is in `messages/ka/dashboard/profile.json`, under
`fields`, and anything under `site.…` is in `messages/ka/site.json`. No file is longer than
120 lines. The `index.ts` files only gather the pieces back into one catalogue.

```json
// messages/ka/dashboard/profile.json       // messages/en/dashboard/profile.json
"fields": {                                 "fields": {
  "profileSaved": "პროფილი შენახულია"         "profileSaved": "Profile saved"
```

## Using a message

```tsx
const { t } = useLanguage();
t("dashboard.profile.fields.profileSaved");           // → "პროფილი შენახულია"
t("dashboard.products.table.count", { count: 12 }); // → "სულ 12 პროდუქტი"
```

`t` takes a key, and the compiler refuses one that is not in `messages/ka/` — a typo is a
build error, not a blank space on screen. Outside React (a server route, an email, a
reply the bot sends) use `message(locale, key)` or `textIn(locale, value)` from
`lib/i18n/messages.ts`.

## Values inside a message

A message can ask for values, written `{name}`:

```json
"opened": "„{name}“ გაიხსნა"
```

Where the message is built somewhere other than where it is shown, `phrase()` carries
the values along with the key:

```ts
return phrase("dashboard.conversations.chatList.minutes", { min: mins });
```

## Naming a key

`area.screen.thing` — the first parts follow the file the text belongs to, the last is
the text itself in a word or two (`addSection`, `saved`, `count`). A long sentence takes
the name of the slot it fills instead: `title`, `subtitle`, `hint`, `empty`.

## What is *not* in these files

| Kind of text | Where it lives | Why |
| --- | --- | --- |
| Landing, pricing, about, contact, legal pages | The database, edited in the admin panel (`lib/content/*` holds the first draft) | The client rewrites it without a deploy |
| Plan names, business names, product text | The database | Each business writes its own |
| AI character options (`მეგობრული`, `მოკლე`…) | `lib/ai/settings.ts` | The value is stored on the business and read by the AI service, so it is data, not a label |

Those are `Bilingual` values — `{ ka, en }` pairs. `t()` renders them exactly as it
renders a key, so a screen can mix the two without knowing which it has.

## Keys and plain text never share a prop

A key is just a string, so a component that takes "a string or a message" cannot tell a key
from plain text — and prints the key. That is how raw `dashboard.…` text once reached the
screen (a placeholder, a channel name). Keep them apart:

- A prop that holds words takes `Text`, and the component calls `t()` on it.
- Something that is *not* words — a sample address, a brand name, a path from the database — gets
  its own prop (`example`, `path`) or is rendered as it is; it never goes through a `Text` prop.
- A key stored in a plain object field must be read back through `t(field)`, never `{field}`.

To check a change, load the pages and look for anything that looks like `area.screen.thing`: in
the server-rendered HTML it is as easy to spot as a missing translation.

## Adding a language

Copy the `messages/en/` folder to `messages/<code>/`, translate the values, add the
code to `LOCALES` in `lib/i18n/config.ts`, and import the new folder in
`lib/i18n/messages.ts`. Nothing in the components changes.

## The test that keeps them honest

`lib/i18n/messages.test.ts` fails if the two languages drift apart: a key in one and not the
other, an empty message, or a message that asks for `{name}` in one language and
`{title}` in the other.
