# NECROS Mail — Email Infrastructure and Delivery Gateway

**Source state:** The existing OpenInbox Worker is both a webmail backend and a Cloudflare Email Routing receiver. NECROS Delivery is a proposed NEW application-facing API, not a shipped endpoint.

## Receiving: already implemented

`src/worker/index.ts` exports an `email()` event handler; `src/worker/services/inbound.ts` resolves an exact address, then a plus-address base, then a domain catch-all to a mailbox. Messages are parsed, threaded and stored with D1 metadata. Optional raw/attachment storage uses the D1/R2 adapters. Webmail routes check mailbox membership for ordinary access. Cloudflare Email Routing is NOT the same thing as running an IMAP or SMTP mailbox server.

**Not established in this source:** a general IMAP server, IMAP sync connector or SMTP receiving server. `src/worker/providers/smtp.ts` is an OUTBOUND provider adapter. If standard mail-client protocols are required, audit that need separately; do not install Stalwart or other services prematurely.

## Sending: already implemented for webmail

`src/worker/services/send.ts` saves drafts, authorizes mailbox send permission, verifies From address ownership, checks suppression records, picks sending providers, calls their adapters, records sent mail and schedules retries. `src/worker/providers/types.ts` defines adapter methods including validation, sending, domain registration/check and optional webhooks. Implementations exist for Resend, Brevo, Mailjet, Cloudflare Email Sending and SMTP.

`src/worker/services/quota.ts` currently tracks counts by **provider per UTC day**; this is not a per-client/per-project allowance. Provider limit defaults in `src/shared/constants.ts` are informational/current-code defaults, NOT NECROS product plan limits.

## Delivery events: already implemented

`src/worker/routes/webhooks.ts` accepts Resend, Brevo and Mailjet delivery webhooks. The service maps provider events to message outcomes and may add a bounced/complaining recipient to the current installation-wide suppression table. Future tenants require strict provider credential association, tenant-specific event attribution, signature verification and suppression isolation.

## Critical duplicate-send hazard

Current `deliver()` catches retryable provider failures and attempts next candidates; cron `processQueue()` reclassifies stale `sending` rows as failed and can resend them. The current provider adapter response/error model does NOT distinguish provider-rejected from provider-accepted-but-response-lost. Therefore **do not reuse this retry loop as the external gateway's exactly-once promise**. Treat timeouts and ambiguous transport outcomes as UNKNOWN, not safe-to-resend. Where supported, use provider-specific idempotency and message reconciliation; otherwise require review before retry.

## Proposed gateway pipeline (not implemented)

1. Authenticate project credential by its hash (never store plaintext keys); resolve organisation/project and scopes.
2. Enforce client/project status, verified From domain, authorized sender, attachments/size/recipient limits, suppression and abuse policies.
3. Rate-limit and reserve both daily and monthly quota atomically; define UTC/month-boundary semantics.
4. Require or accept a caller idempotency key; persist an immutable request hash and unique (project, key) record. Same key + different payload must reject.
5. Persist delivery request, attempt number, provider selection and state before external I/O.
6. Route to Resend by default, Brevo when safe; store provider IDs, returned IDs, response categories, timestamps, cost/usage and owner.
7. Normalize webhook/terminal outcomes; deduplicate provider events; reconcile ambiguous states instead of resending blindly.
8. Return a stable gateway delivery identifier; let clients query status without learning provider secrets.
9. Maintain tenant-scoped audit logs and operational metrics; support later adapter extensions without changing client contracts.

Suggested endpoint family: `POST /api/v1/send`, `GET /api/v1/deliveries/:id` and credential management under privileged tenant/admin routes. **Names are proposals, subject to API design review.** Public gateway API keys must use bearer authentication or another explicitly specified method, not the browser session/CSRF flow without analysis.

## Acceptance and testing

- Same idempotency key does not issue multiple sends, even under concurrent requests.
- Provider accept-then-timeout does not cause immediate fallback duplicate.
- Definitively rejected sends can fail over by documented policy; retriable server errors are NOT automatically proof of rejection.
- Webhook duplicates/out-of-order events cannot rewind a terminal state or cross tenants.
- Credentials, domains, limits, logs and suppression records remain organisation/project-scoped.
- All existing mailbox compose, reply, scheduled send, import/export and webhook tests continue to pass.
