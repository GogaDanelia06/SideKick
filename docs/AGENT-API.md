# Agent API — for the AI service

The AI service reaches Sidekick over HTTP. It does **not** connect to the
database to write.

This is not a restriction for its own sake. Every table the AI touches carries a
`businessId`, and a raw SQL connection has nothing in it that keeps one tenant's
data out of another's. These endpoints do. They also compute order totals from
our own product rows, so the price a customer is quoted is the price the
merchant sees, and there is no second pricing implementation to drift.

A **read-only** database connection alongside this is fine, and useful for
analytics or bulk reads.

- [Authentication](#authentication)
- [The usual sequence](#the-usual-sequence)
- [Endpoints](#endpoints)
- [Errors](#errors)
- [Still open](#still-open)

---

## Authentication

Every request carries a bearer token and names the business it is acting for.

```
Authorization: Bearer <AI_SERVICE_TOKEN>
Content-Type: application/json
```

`businessId` goes in the JSON body (or the query string, for `GET`). It is
checked against a real business on every call; an unknown one is a `403`, never
a silent write to the wrong place.

The token is one shared secret held in Sidekick's environment. To rotate it we
change one environment variable — tell us before you deploy a change that
depends on it.

Base URL: `https://<sidekick-domain>/api/agent`

---

## The usual sequence

A customer writes on Facebook. The service has their platform id and a message.

1. `POST /conversations` with that platform id → get back a `conversationId`
2. `POST /messages` with the customer's text
3. Answer them, then `POST /messages` again with the AI's reply
4. If details come out of the chat: `POST /leads`
5. If it turns into a purchase: `POST /orders`

Step 1 is the answer to *"does a conversation_id get created automatically?"* —
it does, here, and calling it again for the same customer returns the same id
rather than a second conversation. Retry it freely.

---

## Endpoints

### `POST /conversations`

Gets the conversation for one customer, creating it if this is the first
message. **Idempotent on `customerRef`.**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `businessId` | string | yes | |
| `customerRef` | string | yes | The customer's id on their platform — a Facebook PSID, a phone number. This is the key we deduplicate on. |
| `customerName` | string | no | Only fills a blank; never overwrites a name a human typed |
| `channelType` | string | no | `FACEBOOK` · `INSTAGRAM` · `WHATSAPP` · `WEBSITE` |

```json
{ "conversationId": "cmsd9…", "status": "NEW", "aiEnabled": true }
```

**`aiEnabled` is a instruction to you.** It is `false` when the merchant has
taken the chat over themselves or paused the bot. When it is `false`, do not
reply — record the customer's message and stop.

---

### `POST /messages`

Appends one message. Send both directions: the merchant's inbox is meant to show
the whole exchange.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `businessId` | string | yes | |
| `conversationId` | string | yes | Must belong to this business |
| `sender` | string | yes | `CUSTOMER` · `AI` · `OPERATOR` |
| `text` | string | yes | |

```json
{
  "messageId": "cmsd9…",
  "createdAt": "2026-08-03T13:22:55.155Z",
  "delivery": { "status": "SENT" }
}
```

A conversation moves from `NEW` to `ACTIVE` on its first message. One a human
has closed stays closed.

#### `delivery` — did the customer actually get it?

An `AI` or `OPERATOR` message is not just recorded, it is **sent on to the
customer** through Messenger. This field is what happened.

| `status` | Meaning | What to do |
| --- | --- | --- |
| `SENT` | Delivered to Meta | Nothing |
| `WINDOW_CLOSED` | Messenger only allows a reply within 24 hours of the customer's last message, and that has passed | Stop composing for this chat. It is policy, not a fault — retrying cannot help until the customer writes again |
| `FAILED` | Meta refused, or was unreachable. `detail` carries their wording | Worth one retry; tell us if it persists |
| `null` | Nowhere to send to — a conversation started in the dashboard, or a page whose owner has not finished connecting it | Nothing. Not a failure |

`CUSTOMER` messages always return `null` here: they are a record of what the
person already said, and sending it back would be repeating their own words to
them.

A delivery problem never fails the request. The message is stored either way —
losing the merchant's history over a Messenger outage would help nobody.

---

### `POST /leads`

Records or tops up the lead for a conversation. **One lead per conversation**,
updated in place — so call it again the moment the customer finally gives their
phone number twenty messages in.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `businessId` | string | yes | |
| `conversationId` | string | no | Omit only for a lead from outside a chat |
| `name` · `phone` · `interest` · `source` · `comment` | string | no | |

Only fields you send are written. `{ "phone": "…" }` will not blank a name the
merchant corrected by hand.

```json
{ "leadId": "cmsd9…", "status": "NEW" }
```

---

### `POST /orders`

Books an order. **Do not send prices.** Send product codes and quantities; we
price them from the merchant's own catalogue and return the totals.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `businessId` | string | yes | |
| `items` | array | yes | At least one `{ "code": string, "qty": integer ≥ 1 }` |
| `conversationId` | string | no | Links the order to the chat it came from |
| `customerName` · `phone` · `email` · `address` · `note` | string | no | |

```json
{
  "orderId": "cmsd9…",
  "total": 967,
  "status": "NEW",
  "items": [
    { "code": "DR-014", "name": "თეთრი კაბა", "qty": 2, "price": 159, "lineTotal": 318 },
    { "code": "AP-045", "name": "AirPods Pro", "qty": 1, "price": 649, "lineTotal": 649 }
  ]
}
```

Quote the customer the `total` we return, not one you worked out — a `price`
field in your request is ignored, and sale prices are applied on our side.

Orders arrive as `NEW`, which is what the merchant's dashboard treats as "needs
looking at". **There is no delete.** Cancelling a customer's order is a decision
a person makes in the dashboard, with the history that implies.

---

### `GET /context?businessId=…`

Everything needed to answer this merchant's customer: their tone settings, their
own prompt, and their catalogue with prices already resolved.

```json
{
  "business": { "name": "დემო ბიზნესი", "field": "ელ-კომერცია" },
  "config": {
    "languages": ["ქართული"],
    "style": "პროფესიონალური",
    "roles": ["info", "sales", "leads", "orders", "support"],
    "leadEnabled": false,
    "orderEnabled": false,
    "prompt": null
  },
  "products": [
    { "code": "AP-045", "name": "AirPods Pro", "price": 649, "listPrice": 649, "inStock": true, "quantity": 13 }
  ]
}
```

`config: null` means the merchant has not set their assistant up yet — use your
own defaults, it is not an error. `price` is what to quote; `listPrice` is the
pre-discount figure, useful if you want to mention a saving. Capped at 500
products per response.

---

## Errors

| Status | Meaning |
| --- | --- |
| `400` | Something in the body is wrong. The message names the field. |
| `401` | Token missing or wrong |
| `403` | `businessId` is not a real business |
| `404` | The conversation exists but not for this business — or not at all |
| `503` | The integration is not switched on in this environment |

Errors are always `{ "error": "…" }` and the text is meant to be actionable
rather than pretty. A `4xx` will not succeed on retry without a change; a `5xx`
is worth retrying with backoff.

---

## Still open

Two things are agreed in principle but not built, and they need a decision from
you before we can:

1. **Handoff.** You mentioned an `awaiting_human` / `release` contract. Sidekick
   has `Conversation.aiEnabled` and `botPausedUntil` but no explicit handoff
   state or reason. Tell us the exact states and transitions you want and we
   will add them.
2. **Per-merchant prompts.** Each business has one `prompt` field today, edited
   in their dashboard. If you need versioning or an approval step before a
   prompt goes live, say so — that is a schema change, not a config one.
