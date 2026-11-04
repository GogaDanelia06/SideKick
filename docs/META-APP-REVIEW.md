# Meta App Review — what to submit

Everything here is in English because the review form is.

## 1. App settings → Basic

| Field | Value |
| --- | --- |
| Privacy Policy URL | `https://sidekick.ge/privacy` |
| Terms of Service URL | `https://sidekick.ge/terms` |
| User data deletion | **Data deletion instructions URL**: `https://sidekick.ge/data-deletion` |
| Contact email | `info@sidekick.ge` |
| App icon | 1024 × 1024 |

The legal pages open in Georgian; the reviewer can switch with the **ENG**
button in the header. Say so in the reviewer notes.

## 2. A reviewer account — do this first

New businesses are locked to the Billing page until a founder activates them,
so a fresh account cannot reach Channels and the review fails.

1. Register a reviewer account on `https://sidekick.ge/register`.
2. Activate its business in `/admin/businesses` (or set its `Subscription`
   to `ACTIVE`).
3. Put the email and password in the review form only. Never in this repo.

## 3. Reviewer instructions (paste into the form)

> 1. Go to https://sidekick.ge/login and sign in with the credentials above.
>    Use the ENG button in the header for English.
> 2. Open Dashboard → Channels → Facebook → Connect.
> 3. Log in with Facebook, select **one** Page and approve the permissions.
>    Sidekick connects one Page per channel.
> 4. The Facebook card now shows the Page's name and picture.
> 5. From a different Facebook account, message that Page in Messenger.
>    Sidekick's AI assistant replies, usually within a minute.
> 6. Open Dashboard → Conversations: the conversation is there, and you can
>    take over and reply as a person.
> 7. Instagram works the same way: Channels → Instagram → Connect, then send a
>    Direct message to the connected professional account.

## 4. Why we need each permission

Facebook Login (Page connection):

- **pages_show_list** — after login we list the Pages the person manages so
  the one they chose can be connected to their Sidekick business.
- **pages_messaging** — Sidekick's AI assistant and the business's staff reply
  to customers who message the Page in Messenger. Replies are sent only as
  responses (`messaging_type: RESPONSE`) inside the 24-hour window.
- **pages_manage_metadata** — subscribes the connected Page to our webhook so
  new Messenger messages reach Sidekick.
- **pages_read_engagement** — reads the connected Page's name and picture to
  show which Page is connected in the dashboard.
- **instagram_basic** — reads the Instagram professional account linked to
  the Page, so it can be connected as a channel.
- **instagram_manage_messages** — receives and answers Instagram Direct
  messages sent to that linked account.
- **business_management** — most businesses manage their Page through a
  Business Portfolio (Meta Business Suite), and such Pages are not returned
  to us without it. We use it only to find the Page the person chose. We do
  not create, change or share business assets or access.

Instagram Login (Instagram-only connection):

- **instagram_business_basic** — reads the account's ID, username and picture
  to connect it and show it in the dashboard.
- **instagram_business_manage_messages** — receives and answers Direct
  messages sent to the connected account.

## 5. Screencasts

One per permission, recorded on the live site with English selected:
login → Channels → Connect → Meta dialog with the permissions → connected card
→ a message arriving and the AI reply → the conversation in the dashboard.
Show the disconnect button too.

## 6. Data processors (Data Use Checkup)

| Processor | Service | Countries |
| --- | --- | --- |
| Vercel Inc. | hosting, webhooks | Germany, United States, Georgia |
| Neon (Databricks) | database | Germany, Georgia |
| Amazon Web Services | AI service | the AWS region it runs in, Georgia |
| Google LLC (Gemini API) | AI model, paid tier | United States, Georgia |

Category for all four: *IT solutions and services, including cloud storage and
processing.*
