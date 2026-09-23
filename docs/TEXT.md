# Where the words live

Every word the interface says is in **`messages/ka.json`** and **`messages/en.json`**,
under a key like `dashboard.profile.saved`. Nothing readable is written into a component
any more, so a translator can work in one file and never open the code.

```json
// messages/ka.json                     // messages/en.json
"dashboard": {                          "dashboard": {
  "profile": {                            "profile": {
    "saved": "პროფილი შენახულია"            "saved": "Profile saved"
```

## Using a message

```tsx
const { t } = useLanguage();
t("dashboard.profile.saved");                       // → "პროფილი შენახულია"
t("dashboard.products.table.count", { count: 12 }); // → "სულ 12 პროდუქტი"
```

`t` takes a key, and the compiler refuses one that is not in `ka.json` — a typo is a
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

## Adding a language

Copy `messages/en.json` to `messages/<code>.json`, translate the values, and add the
code to `LOCALES` in `lib/i18n/config.ts`. Nothing in the components changes.

## The test that keeps them honest

`lib/i18n/messages.test.ts` fails if the two files drift apart: a key in one and not the
other, an empty message, or a message that asks for `{name}` in one language and
`{title}` in the other.
