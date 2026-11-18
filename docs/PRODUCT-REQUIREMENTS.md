# NECROS Mail — Product Requirements and Decision Register

**Owner:** NECROS HOLDINGS  
**Product:** NECROS Mail  
**Client webmail:** NECROS Inbox  
**Tagline:** Email, refined.  
**Status:** Approved direction, not a claim of implemented features  
**Source:** NECROS project handoff, 2026-11-14

## Purpose and audience

Build the official NECROS email platform by extending the existing MIT-licensed OpenInbox repository. Serve NECROS clients initially. Maintain the original application's useful mail functionality; this is an evolution, not a rewrite. A client-facing mailbox experience and an application-facing delivery gateway are separate products sharing an operational foundation. NECROS controls onboarding, tenant access, quotas, provider routing and monitoring.

## Four product areas

1. **NECROS Inbox**: inbox, sent, drafts, starred, archive, spam, trash, composition, reply/reply-all/forward, attachments, search, folders/labels, contacts, signatures, read state, multiple mailboxes, settings, responsive light/dark UI. A three-column desktop arrangement is preferred where practical.
2. **NECROS Delivery**: stable and authenticated application API, provider-independent send contract, Resend primary, Brevo secondary, future adapters, delivery logs, verified sender domains, provider events, explicit failure classification and idempotency.
3. **NECROS Limits**: daily/monthly quotas for organisation and project, rate limits, API keys, usage attribution, delivery counts and failure analytics. Illustrative INTERNAL monthly plans: Starter 1,000; Business 5,000; Professional 15,000; Enterprise custom. These are not provider allowances or launched pricing.
4. **NECROS Admin**: NECROS-owned platform dashboard for organisations, domains, mailboxes, credentials, providers, primary/fallback policy, logs, health, usage, quotas, security and suspension. Client administrators see only their own organisation.

## Gateway principle

Future app flow: client application → NECROS Mail API → routing/limits → Resend, Brevo or another provider → recipient. Applications must not depend on provider-specific delivery code. API credentials identify and authorize a single organisation/project. Client project credentials cannot administer other projects or organisations.

Illustrative API semantics (not yet implemented): authenticated call to send a message containing sender, recipients, subject, HTML/text and an idempotency key. A library method like `necrosMail.send(...)` is a proposed SDK convenience, not a shipped function.

**Safety:** Never blindly retry an ambiguous provider response. A timeout or interrupted Worker after acceptance may mean the recipient was already sent mail. Introduce durable send IDs, idempotency, accepted/unknown/failure states, reconciliations and replay-safe webhooks before automatic cross-provider fallback.

## Mailbox hosting is a separate capability

Resend and Brevo provide outbound delivery; they do not themselves create complete Gmail-like mailbox accounts. Preserve the existing Cloudflare Email Routing inbound processing and mailbox storage. Evaluate incoming mail, IMAP/SMTP client access, synchronization and attachment constraints by actual feature and code audit. Do not introduce a new mail server (e.g. Stalwart) unless a separately approved requirements review establishes a need.

## Tenant and role model

- NECROS Super Admin: auditable cross-platform administration.
- Client Admin: own organisation's authorized users, domains and mailboxes only.
- Regular User: own permitted mailboxes and settings only.
- Organisation, domain, mailbox, API key, delivery record and usage must be correctly owned, including background jobs and storage bytes.
- Trust server-derived memberships, not UI hides or user-submitted organisation IDs.
- A user may have different permitted roles in multiple organisations if designed and approved.

## Proposed hostnames (not DNS changes)

- `mail.necros.co` — client webmail
- `admin-mail.necros.co` — NECROS administration
- `api-mail.necros.co` — gateway API
- `necros.co/mail` — product information
- `docs.necros.co/mail` — documentation

Client sending/receiving identities continue to use their own verified domains. Hostname separation alone does not create tenant/security isolation. Do not buy services, connect production DNS or deploy merely because these names are documented.

## Engineering constraints

Keep Vite + React + TypeScript + Tailwind and the existing Hono/Workers/D1 architecture unless an audit proves a targeted change necessary. Use server-side Cloudflare secret bindings and safe local variable files; never embed API keys in browser-delivered TypeScript or commit actual credentials. Preserve the upstream MIT license and attribution. Work on `development`; `main` remains untouched without approval. Implement in manageable batches and log each commit's reason, affected areas, validation and remaining work.

## Decisions versus proposals

**Approved:** names, tagline, parent brand, audience, four products, Vite preservation, primary Resend/fallback Brevo preference, organisation isolation, Apple-inspired visual direction, six-phase outline, development-branch-only workflow.

**Proposed, not approved deployment choices:** actual API endpoints/SDK shape, provider-specific tenancy, precise database migration design, internal quota tiers as customer plans, separate hostnames, SMTP/IMAP server addition, and operational rollout dates.

See `BRANDING.md`, `ARCHITECTURE.md`, `MAIL-INFRASTRUCTURE.md`, `MULTI-TENANCY.md`, `SECURITY.md`, `DATABASE.md`, `DEPLOYMENT.md` and `ROADMAP.md`.
