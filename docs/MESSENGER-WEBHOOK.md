# Messenger webhook — how customer messages reach Sidekick

Facebook **and Instagram** deliver messages to `POST /api/webhooks/messenger`.
Sidekick checks they really came from Meta, files them under the right tenant,
and tells the AI service there is something to answer.

Replies travel back out the same way: an `AI` or `OPERATOR` message posted to
`/api/agent/messages` is delivered to the customer through Meta's Send API, and
the result comes back in that call's `delivery` field. See [Sending
replies](#sending-replies).

- [The five-second rule](#the-five-second-rule)
- [Environment variables](#environment-variables)
- [Setting the app up in Meta](#setting-the-app-up-in-meta)
- [Instagram](#instagram)
- [Connecting a tenant's page](#connecting-a-tenants-page)
- [What the AI service receives](#what-the-ai-service-receives)
- [Who answers](#who-answers)
- [What is dropped, and why](#what-is-dropped-and-why)
- [Sending replies](#sending-replies)
- [What is still missing](#what-is-still-missing)

---

## The five-second rule

Meta wants an HTTP `200` **within five seconds** and re-sends the event when it
does not get one. Every design decision below follows from that.

The webhook therefore does the least it can: check the signature, write the
message down, answer. **The AI is not called inside the request.** Generating a
reply takes longer than the deadline, so waiting for it would guarantee a retry,
and the retry would arrive while the first one was still thinking — the customer
would be answered twice for one question.

Instead everything slow happens *after* the response is sent — including asking
the AI for its reply. See [Who answers](#who-answers).

Every message carries Meta's own `mid`, stored on `Message.externalId`. That is
what makes a re-send land on the same row instead of creating a second copy.

---

## Environment variables

| Variable | Required | What it is |
| --- | --- | --- |
| `META_APP_SECRET` | to receive messages | From the Meta App Dashboard. Proves a delivery really came from Facebook. Without it the endpoint answers `503` rather than trusting unsigned events. |
| `META_VERIFY_TOKEN` | to complete setup | A string **we invent**. It only has to match what is typed into the App Dashboard. 16+ characters. |
| `META_APP_ID` | to connect a Page | Facebook Login's client id, used by the connect button. |
| `INSTAGRAM_APP_ID` | to connect Instagram | The **Instagram** app's client id. A different application; `META_APP_ID` here fails as "invalid client". |
| `INSTAGRAM_APP_SECRET` | to receive Instagram | Signs Instagram's webhook deliveries **and** its token exchange. Without it every Instagram delivery fails its signature check and vanishes. |
| `AI_SERVICE_WEBHOOK_URL` | to notify the AI | Where we `POST` "a customer wrote in". Supplied by the AI team. |
| `AI_SERVICE_WEBHOOK_TOKEN` | to notify the AI | Bearer token we send with that push, so they can tell it is us. 32+ characters. |
| `AI_SERVICE_URL` | **to get replies** | Base URL of the AI service, e.g. `https://si-….on.aws`. Paths are appended to it. |
| `AI_SERVICE_KEY` | **to get replies** | Their `SERVICE_API_KEY`, sent as `Authorization: Bearer`. |
| `AI_SERVICE_TIMEOUT_MS` | no | How long to wait on a reply. Defaults to 45000 — a language model is not fast. |

Until the last two are set, messages are still received and stored — they are
just not announced. The log says so plainly:

```
[info] agent notify skipped — AI_SERVICE_WEBHOOK_URL/TOKEN not set
```

---

## Setting the app up in Meta

1. Meta App Dashboard → **Products → Messenger → Settings**.
2. **Callback URL**: `https://<sidekick-domain>/api/webhooks/messenger`
3. **Verify Token**: the same string as `META_VERIFY_TOKEN`.
4. Subscribe to the `messages` webhook field.
5. Install the app on the Page, and subscribe the Page via `/subscribed_apps`
   with `pages_messaging` and `pages_manage_metadata`.

On save, Meta calls `GET` on the URL with `hub.mode`, `hub.verify_token` and
`hub.challenge`. Sidekick echoes the challenge back as plain text when the token
matches. A `403` at this step means the two tokens differ.

> Do **not** subscribe to `message_echoes` unless you need it. Sidekick ignores
> echoes, but they are pure noise on the wire.

---

## Instagram

**No second endpoint** — Instagram messages arrive at this same URL. Almost
everything else about it is different, and the temptation to treat it as
"Messenger with another `object`" is the single most expensive assumption in
this codebase's history.

| | Messenger | Instagram |
| --- | --- | --- |
| `object` | `"page"` | `"instagram"` |
| `entry[].id` | Page id | Instagram **business account** id (`17841…`) |
| Sender | PSID | IGSID |
| Authorises via | Facebook Login | **Instagram Login**, on instagram.com |
| App credentials | `META_APP_*` | `INSTAGRAM_APP_*` — a separate application |
| Token | Page token (`EAA…`) | Instagram token (`IGA…`) |
| Signs the webhook with | `META_APP_SECRET` | `INSTAGRAM_APP_SECRET` |
| Replies go to | `graph.facebook.com` | `graph.instagram.com` |
| Scopes | `pages_messaging` | `instagram_business_basic`, `instagram_business_manage_messages` |

Every row of that table produced **silence rather than an error** when it was
wrong. A delivery signed with the Instagram secret and checked only against the
Facebook one is rejected with a 403 that Meta never retries; an account id read
from the wrong field matches no tenant and is dropped. Neither looks different
from "Meta is not sending anything".

### The two subscriptions

Both are required and having one does not imply the other:

1. **The app** must subscribe to the `instagram` object, with our callback URL —
   separate from its `page` subscription. Check it with:
   `GET /v23.0/{app-id}/subscriptions?access_token={app-id}|{app-secret}`
2. **The account** must subscribe to the app. `connectInstagramFromCode` does
   this via `POST /me/subscribed_apps?subscribed_fields=messages`, and treats a
   failure as a failed connection — an account that is linked but unsubscribed
   receives nothing at all.

### Ids are large and must stay strings

`17841436214263005` is past `2^53`, so reading it as a JSON number rounds it.
`fetchAccount` takes `user_id` from `/me?fields=user_id,username` and refuses
anything that is not a string, because an id that is off by one matches no
webhook and produces a connection that looks complete and drops every message.

Note the ids are per-surface. A customer who writes on both Instagram and
Messenger has two different ids, so they are two conversations, not one. Merging
them would need Meta's identity APIs and their permission, and guessing at it
would show one customer another's messages.

### Tokens expire, and are renewed for you

Instagram tokens are long-lived for **60 days**. `Channel.tokenExpiresAt`
records the date, and a daily cron — `/api/cron/instagram-refresh`, scheduled in
`vercel.json` — renews anything inside 15 days of expiry.

Two limits shape that job. Meta refuses to renew a token **younger than 24
hours**, and refuses entirely once one has **already lapsed** — after which the
only way back is the **Reconnect** button on the channels page. So it runs well
ahead of the deadline rather than at it, and a failure is logged at `error`
because nobody is watching and the window to fix it by hand closes when the
token does.

The route needs `CRON_SECRET`. With none set it answers 401 to everything,
including Vercel: an unauthenticated job anyone can trigger calls Meta on demand
for every connected account.

---

## Connecting a tenant's page

Meta's delivery names the **Page** or the **Instagram account**, never the
business. The routing key is the pair `(Channel.type, Channel.externalId)`:
`FACEBOOK` + page id, or `INSTAGRAM` + IGID → channel → business.

Merchants connect their own accounts from **Dashboard → Channels**. Each row has
its own button, because the two flows are separate authorisations:
`/api/channels/facebook/start` and `/api/channels/instagram/start`. A row that is
already linked keeps a quieter **Reconnect** — a token can expire or be granted
with the wrong scopes, and in both cases the row looks perfectly connected while
receiving nothing.

Every business is provisioned with a row per channel already, so connecting fills
in `externalId`, `accessToken`, `connected`, `status` and `lastSyncAt` on the row
that is there rather than creating a second one. A channel only accepts messages
when `connected` is true, so switching it off in the dashboard really does stop
the AI answering for that tenant.

`(type, externalId)` is unique across the whole table, so an account already
linked to another business is refused rather than stolen — the callback reports
`already_linked` instead of throwing a 500 at the end of a consent flow.

---

## What the AI service receives

One `POST` per newly stored customer message:

```http
POST <AI_SERVICE_WEBHOOK_URL>
Authorization: Bearer <AI_SERVICE_WEBHOOK_TOKEN>
Content-Type: application/json

{
  "event": "message.received",
  "businessId": "cmr…",
  "conversationId": "cms…",
  "messageId": "cms…",
  "channel": "FACEBOOK"
}
```

`channel` is `"FACEBOOK"` or `"INSTAGRAM"`, taken from the delivery rather than
assumed. It is worth reading: the same customer on the two surfaces is two
conversations, and the reply goes back where the question came from.

Deliberately thin. The message text is **not** duplicated here — read it, and
the rest of the conversation, from `/api/agent/context`. One source of truth
means the two systems cannot drift into disagreeing about what a customer said.

A failure to reach the AI service is logged and dropped, not retried. The
message is already committed on Sidekick's side, so nothing is lost.

---

## Who answers

The AI service is **request/response, not a webhook**, and that is the fact that
shapes this half of the system. We hand it one message and it hands the reply
back in the same call:

```
POST {AI_SERVICE_URL}/businesses/{businessId}/messages
Authorization: Bearer {AI_SERVICE_KEY}

{ "conversation_id": "cms…", "message": "ფასი რა ღირს?" }
   ↓
{ "reply": "…", "handoff_requested": false, "handoff_reason": null }
```

Nothing arrives later and nothing is pushed to us. So whatever that call
returns is the answer, and if it fails there is no reply coming at all — which
is why a failure marks the chat rather than passing silently.

It runs in `after()`, never inside the webhook request. A language model does
not answer in five seconds.

`lib/ai/answer.ts` then does the rest, in this order:

1. **Refuses to speak over a person.** `aiEnabled: false` on the chat, or a
   `botPausedUntil` still in the future, and nothing is sent.
2. **Stores the reply, then delivers it.** Delivered-but-unrecorded would show
   the customer an answer the merchant's inbox has no memory of.
3. **Honours `handoff_requested`.** Sets `botPausedUntil` 24 hours out and
   writes `handoff_reason` onto the message. That pair is what lights the
   orange "waiting for a human" mark in the inbox.

An operator hands it back with `handBackToAi()`, which calls their `release`
endpoint **and** clears the pause. Doing only one leaves the two sides
disagreeing about who is holding the conversation.

The other two endpoints — `build-prompt` and `edit-prompt` — sit behind the
buttons on the AI Assistant page. They generate text and store nothing, so the
result is written to `AiConfig.prompt` on our side, into the same box the
merchant can edit by hand.

---

## Customer names

Meta's delivery carries an id and nothing else — no name, no picture. Left at
that, every chat in the inbox reads `—`, and a merchant cannot tell one customer
from another.

So after the response has gone, Sidekick asks Meta who the id belongs to:

```
GET /{PSID}?fields=first_name,last_name     (Facebook)
GET /{IGSID}?fields=name,username           (Instagram)
```

and writes the answer to `Conversation.customerName`.

- **Outside the request.** It is a second round trip and the webhook has five
  seconds for everything.
- **Once per conversation**, not per message, and only while the name is blank.
- **Never overwrites.** A name set by the merchant or by the AI service through
  `/api/agent/conversations` is a deliberate choice and outranks Facebook's.
- **Failure is silent.** Deleted accounts, undisclosed profiles and a token that
  has lost the permission all come back empty. The chat keeps its dash; the
  message is stored and answerable either way.

Instagram profiles often have no display name, so the handle is used instead —
`lika_ge` in the inbox beats a dash.

> Needs `pages_messaging`, so before App Review this only resolves for people
> who hold a role in the Meta app. Existing conversations fill in by themselves
> the next time that customer writes.

---

## What is dropped, and why

| Event | Response | Why |
| --- | --- | --- |
| Wrong or missing signature | `403` | Anyone can reach this URL. Without the signature check, a stranger could put words in a customer's mouth and have the AI answer them. |
| A page no tenant has connected | `200` | A Meta app receives events for every page subscribed to it. An error would make Meta retry other people's traffic and eventually disable the webhook for everybody. |
| A channel switched off | `200` | The tenant asked for quiet. |
| Message echoes (`is_echo`) | `200`, ignored | An echo stored as a customer message would have the AI read its own reply as a new question and answer itself, forever. |
| Delivery/read receipts, postbacks | `200`, ignored | Not messages. |
| Attachment with no text | `200`, ignored | Nothing for a text model to answer, and inventing a placeholder would put words the customer never wrote into the tenant's inbox. |
| A message we could not store | **`500`** | The one case where a re-send is wanted. Meta only re-sends what it thinks failed, so answering `200` would lose the message for good and leave the customer waiting on an answer nobody ever read. Safe because the `mid` makes the retry idempotent. |

---

## Sending replies

There is no separate endpoint for this. The AI posts its answer to
`POST /api/agent/messages` as it already does, and Sidekick passes it on:

```
AI service → POST /api/agent/messages (sender: "AI")
           → stored
           → POST graph.facebook.com/v25.0/{pageId}/messages
           → { "delivery": { "status": "SENT" } } back to the AI service
```

Doing it here rather than in the AI service is deliberate: the Page Access Token
is a per-tenant credential we hold, and handing a copy to another system would
mean two places to rotate it and two places it can leak from.

**Requires `Channel.accessToken`** — the Page Access Token. A page linked by
hand has an id but no token, so it can receive messages and not answer them. The
`delivery` field returns `null` in that state rather than pretending to fail.

### The 24-hour window

Messenger only allows a business to reply **within 24 hours** of the customer's
last message. After that Meta refuses with code `1545041`, which Sidekick
reports as `WINDOW_CLOSED` rather than `FAILED` — it is policy, not a fault, and
retrying cannot help until the customer writes again.

`Message.deliveryStatus` records the outcome per message, so the merchant's
inbox can show what actually reached the customer.

---

## What is still missing

1. **WhatsApp.** `ChannelType` has it and nothing behind it. Genuinely a
   different integration — a different envelope, a different Send API, and
   message templates instead of a 24-hour window.
2. **App Review.** Until Meta approves `pages_messaging` for the Facebook app
   and `instagram_business_manage_messages` for the Instagram one, both only
   work for people who hold a role in them — and the invitation has to be
   *accepted* by the tester, not just sent. That is enough to test and not enough
   to sell. It is the longest lead time in this project and it belongs to whoever
   owns the Meta app.
4. **`AI_SERVICE_WEBHOOK_URL`.** The push notice is a separate thing from the
   reply, and nothing subscribes to it yet. The replies do not depend on it —
   see [Who answers](#who-answers).
5. **Attachments.** Images and files arrive with no text and are ignored in both
   directions.
