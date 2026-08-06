# Messenger webhook — how customer messages reach Sidekick

Facebook delivers messages to `POST /api/webhooks/messenger`. Sidekick checks
they really came from Meta, files them under the right tenant, and tells the AI
service there is something to answer.

This is the inbound half. The outbound half — sending the AI's reply back to the
customer through Meta's Send API — is **not built yet**; see [What is still
missing](#what-is-still-missing).

- [The five-second rule](#the-five-second-rule)
- [Environment variables](#environment-variables)
- [Setting the app up in Meta](#setting-the-app-up-in-meta)
- [Connecting a tenant's page](#connecting-a-tenants-page)
- [What the AI service receives](#what-the-ai-service-receives)
- [What is dropped, and why](#what-is-dropped-and-why)
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

Instead the AI service is notified *after* the response is sent, and it fetches
what it needs through the existing [Agent API](./AGENT-API.md).

Every message carries Meta's own `mid`, stored on `Message.externalId`. That is
what makes a re-send land on the same row instead of creating a second copy.

---

## Environment variables

| Variable | Required | What it is |
| --- | --- | --- |
| `META_APP_SECRET` | to receive messages | From the Meta App Dashboard. Proves a delivery really came from Facebook. Without it the endpoint answers `503` rather than trusting unsigned events. |
| `META_VERIFY_TOKEN` | to complete setup | A string **we invent**. It only has to match what is typed into the App Dashboard. 16+ characters. |
| `AI_SERVICE_WEBHOOK_URL` | to notify the AI | Where we `POST` "a customer wrote in". Supplied by the AI team. |
| `AI_SERVICE_WEBHOOK_TOKEN` | to notify the AI | Bearer token we send with that push, so they can tell it is us. 32+ characters. |

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

## Connecting a tenant's page

Meta's delivery names the **Page**, never the business. The routing key is
`Channel.externalId`: page id → channel → business.

Today that column has to be filled in directly — there is no screen for it yet,
which is the main gap listed below. A channel only accepts messages when
`connected` is true, so switching a channel off in the dashboard really does
stop the AI answering for that tenant.

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

Deliberately thin. The message text is **not** duplicated here — read it, and
the rest of the conversation, from `/api/agent/context`. One source of truth
means the two systems cannot drift into disagreeing about what a customer said.

A failure to reach the AI service is logged and dropped, not retried. The
message is already committed on Sidekick's side, so nothing is lost.

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

## What is still missing

1. **Sending replies back.** Meta's Send API needs a Page access token per page.
   Nothing here stores or uses one yet, so the AI can read a conversation but
   cannot answer it through Facebook.
2. **A connection screen.** Tenants cannot link their own page — the dashboard's
   channel toggle sets `connected` but collects no page id. Doing it properly
   means Facebook Login for Business, then storing the page id and its token.
3. **Instagram and WhatsApp.** `ChannelType` has both. Instagram sends a
   different `object` and a different event shape, so it needs its own route
   rather than a flag on this one.
4. **The AI team's endpoint.** `AI_SERVICE_WEBHOOK_URL` and its token are not
   set anywhere yet.
