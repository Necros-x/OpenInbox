# Architecture and Tenant-Isolation Audit

**Audit status:** In progress  
**Baseline ref:** `main` (read-only inspection)  
**Working ref:** `development`  
**Date:** 2026-11-13

## Executive finding

The current OpenInbox codebase is structured as a **single installation / single administrative authority**, not as a multi-tenant SaaS with independent organisation administrators. It already supports multiple domains, users, personal/shared mailboxes, and mailbox membership inside one installation. Those capabilities must not be confused with organisation isolation.

The repository is a viable technical foundation for a Cloudflare-hosted mail platform, but it is **not safe to expose as a shared multi-organisation service yet**. Tenant ownership and authorization need to be designed and implemented across the complete data and processing paths before onboarding independent organisations.

## Confirmed baseline architecture

- Frontend: Vite + React application, served as Worker static assets.
- API: Hono routes mounted under `/api`.
- Runtime: one Cloudflare Worker handles HTTP API requests, Email Routing inbound mail, and scheduled jobs.
- Database: one D1 binding named `DB`; migrations live under `src/worker/db/migrations`.
- Attachments/raw messages: D1-backed storage with optional R2 through the storage abstraction.
- Outbound mail: provider adapters include Resend, Brevo, Mailjet, Cloudflare Email Sending, and SMTP.
- Tests: Vitest unit/integration suites and Playwright end-to-end tests are present.
- Toolchain declared in `package.json`: Node >=22.18, TypeScript, Vite, Wrangler, Vitest, Playwright.

## Findings

### 1. Organisation model is absent from the baseline schema

The initial migration defines installation-wide entities including `users`, `domains`, `mailboxes`, `addresses`, `providers`, `provider_domains`, `quota_usage`, `suppressions`, `threads`, `messages`, and related mail tables. The inspected schema has no organisation/tenant table or tenant ownership column.

Existing `mailbox_members` links users to mailboxes and supports a `can_send` flag. This is useful for shared inbox access but does not model an organisation boundary, organisation admin, platform owner, or organisation-scoped domain/provider configuration.

**Risk:** adding an organisation selector to the UI alone would not create isolation. Current global queries and unique constraints may allow one organisation's resources to be visible or mutable by another.

### 2. Authentication and roles are installation-wide

- Login looks up a user by email in the global `users` table.
- Session rows refer directly to global user IDs.
- Session loading joins `sessions` to `users`.
- The current role set is `owner`, `admin`, and `member`.
- `requireAdmin` allows the global `admin` or `owner` role.
- `requireOwner` checks the global `owner` role.

There is no evidence in the inspected auth/session/middleware path of organisation membership resolution or organisation-scoped roles.

**Required direction:** keep a platform-level principal/role separate from organisation membership. A person may belong to one or more organisations, with a different role in each. Do not infer tenant access from a global role string.

### 3. Admin API is global

The admin router is mounted behind `requireUser` and `requireAdmin`. Its inspected routes list and mutate users, mailboxes, domains, providers, settings, and related operational resources without an organisation context in the route structure.

**Risk:** an organisation admin cannot safely be implemented by merely granting the existing `admin` role; that role currently means installation-wide administration.

**Required direction:** define platform-admin and organisation-admin authorization separately, then enforce organisation scope in every service/query. Avoid relying on route naming or frontend navigation for access control.

### 4. Mailbox membership is not sufficient for tenant security

Mailbox-level access checks are present in mail operations, and mail data is associated with `mailbox_id`. Threads and messages carry mailbox references; attachments are associated with messages. This provides a useful ownership chain for some mail operations.

However, mailbox ownership must be rooted in an organisation and checked consistently for every operation. The audit must verify all queries that load threads, messages, drafts, scheduled messages, attachments, contacts, labels, filters, and mailbox settings. Any lookup by a bare message/thread/attachment ID must be followed by a trusted mailbox and organisation authorization check.

### 5. Inbound routing is a critical tenant boundary

The Worker receives Email Routing events through the `email()` handler and passes them to the inbound-mail service. The inbound path resolves recipient addresses to mailboxes and writes threads, messages, bodies, attachments, contacts, statistics, and logs.

**Required direction:** recipient resolution must identify exactly one active tenant-owned address and establish the tenant context before processing. Catch-all, aliases, forwarding, filters, and duplicate handling must not cross organisation boundaries. Unknown or ambiguous recipients must fail closed.

### 6. Outbound sending and provider configuration need tenant scope

The current provider selection resolves a sending domain and chooses from installation-wide provider records, including global fallback order/defaults and quota tracking. Domains can have a provider override, but the inspected baseline schema does not attach domains or providers to an organisation.

**Required direction:** provider credentials, domain verification, quotas, fallback policy, suppression lists, and sending authorization must be scoped to an organisation (or deliberately defined platform-level shared provider with explicit opt-in and strict credential visibility rules). Never allow one organisation's admin to retrieve another organisation's provider configuration or secrets.

### 7. Global settings, logs, and suppressions need classification

The baseline contains installation-wide settings, suppressions, usage counters, audit records, and mail-flow logs. Some of these may remain platform-wide; others contain tenant-owned data and must be partitioned or filtered.

**Required direction:** classify every table as platform-global, organisation-owned, or mailbox-owned. Define retention, export, deletion, and platform-operator visibility for each class before schema changes.

### 8. Deployment configuration is single-instance

The checked-in Wrangler configuration declares one Worker and one D1 database. This is consistent with a single-installation deployment. It does not itself provide tenant isolation. A shared Worker/D1 architecture may be possible, but the security model must be implemented in application code and tested; a separate Worker/D1 per organisation remains a fallback if the required isolation cannot be established confidently.

## Preliminary table ownership classification

This is a working classification to validate against every migration and query before implementation.

| Data family | Likely ownership | Audit requirement |
| --- | --- | --- |
| Platform configuration and deployment settings | Platform | Separate platform-only secrets from tenant settings |
| Users and sessions | Platform identity + organisation memberships | Model membership and per-organisation roles |
| Domains and addresses | Organisation | Enforce ownership through mailbox and inbound routing |
| Mailboxes and mailbox memberships | Organisation + mailbox | Verify all membership and admin paths |
| Providers and provider-domain records | Organisation or explicit platform-shared provider | Encrypt and scope credentials |
| Threads, messages, bodies, drafts | Mailbox (within organisation) | Scope every lookup and mutation |
| Attachments and raw message blobs | Message/mailbox (within organisation) | Authorize metadata and bytes independently |
| Contacts, labels, filters, signatures, rules | Mailbox (within organisation) | Verify all queries and background actions |
| Suppressions and sending quotas | Organisation/provider | Prevent cross-tenant disclosure or interference |
| Audit events and mail-flow logs | Platform and/or organisation | Define visibility and tenant attribution |
| Usage counters and analytics | Platform + organisation | Avoid cross-tenant data leakage |

## Security design proposal (not yet implemented)

1. Introduce organisations and organisation memberships with scoped roles.
2. Add explicit ownership for tenant-managed resources, beginning with domains and mailboxes.
3. Resolve the active organisation from authenticated membership on the server; validate any requested organisation context against membership.
4. Centralize authorization helpers and require them in route/service boundaries.
5. Add query helpers or repository methods that require organisation/mailbox scope, reducing accidental unscoped access.
6. Preserve mailbox membership as a second, narrower permission layer for shared inboxes.
7. Make platform-wide access an explicit, audited break-glass capability rather than an accidental consequence of being an organisation admin.
8. Add cross-tenant denial tests before enabling multi-organisation access.
9. Plan safe backfill of existing single-installation data into a default NECROS organisation; test migration and rollback against a copy of the database.

## Required audit completion before schema work

- [ ] Read every migration and classify every table and index.
- [ ] Enumerate all API endpoints and inspect each route/service call chain.
- [ ] Search for every query touching tenant-owned tables; identify bare-ID reads and mutations.
- [ ] Complete inbound, outbound, cron, retry, retention, attachment, and raw-storage tracing.
- [ ] Review setup/owner recovery and platform-wide settings.
- [ ] Run the existing test suite and baseline quality commands locally.
- [ ] Produce a concrete migration design with backfill and rollback steps.

## Safety boundary

No tenant schema migrations, production deployments, DNS changes, live domain connections, real mailbox imports, or credential changes have been made as part of this audit. Findings are based on source inspection and remain subject to full call-chain verification and executable tests.


## Additional route and service tracing (2026-11-13)

The following call-chain details were confirmed after the initial audit draft:

- The Hono app applies CSRF protection, runs database migrations, loads global settings, and loads a session before mounting application routes. The `/admin/*` subtree is protected by `requireUser` and the global `requireAdmin` middleware.
- The mail API's `mailboxScope`, `assertThread`, and `assertMessage` helpers use `mailbox_members` to authorize ordinary mailbox users. This is a useful existing access-control layer and should be retained as a narrower permission layer beneath organisation membership.
- Thread list queries are generally constrained by the mailbox IDs supplied from accessible mailbox membership. Thread detail and message access rely on route-level assertions before service reads.
- Some service functions intentionally accept bare resource IDs because they are called after route authorization. During tenant work, preserve this call-chain contract explicitly or strengthen the service interface so callers cannot accidentally skip authorization.
- Inbound recipient resolution currently checks exact addresses, plus-address bases, then domain catch-all. The selected mailbox ID is used to create thread/message/body/attachment records. This flow needs a verified mailbox-to-organisation ownership check and a fail-closed tenant context.
- The inbound path also consults blocked-sender rules, including rules with a null mailbox ID (installation-wide). These rules need explicit platform-vs-organisation semantics.
- Outbound provider selection resolves a domain and uses provider/default/fallback records and quotas. This must become tenant-aware, including provider-domain verification and secret access.
- The baseline includes installation-wide forwarding destinations, suppressions, usage counters, settings, and operational logs. These require explicit ownership classification rather than blindly assigning every row to a tenant.
- User-uploaded draft attachments are tied to a user ID, while persisted mail attachments are tied to messages. Both paths need organisation/mailbox authorization and lifecycle handling.
- Scheduled send/retry and retention/reparse jobs operate without an interactive user session. Each job must carry or derive tenant ownership from its database rows and must never trust a tenant identifier supplied by an external payload.

### Newly identified high-priority audit targets

1. Verify every route uses `assertMailbox`, `assertThread`, or `assertMessage` where appropriate, especially attachments, notes, labels, filters, drafts, scheduled messages, and sender-block rules.
2. Review global admin operations and destructive actions (delete user/mailbox/domain, retry message, provider changes) for how they will be scoped by organisation.
3. Define whether platform-wide suppressions and block rules are shared policy or organisation-owned policy; do not let one organisation silently affect another.
4. Ensure every asynchronous job can identify the owning organisation through a trusted row relationship.
5. Review foreign-key consistency between `messages.mailbox_id` and `threads.mailbox_id`; tenant migration should prevent mismatched mailbox/thread references.
6. Define organisation deletion/export/retention behavior for D1 records and R2 objects.

These are source-level findings. The full migration set, every route, and all query call chains still need exhaustive review and automated verification.


## Handoff reconciliation — 2026-11-14

The project is now officially **NECROS Mail**, with two distinct deliverables: **NECROS Inbox** webmail and an **application-facing NECROS Delivery gateway**. Existing mailbox send/provider functionality is not a substitute for a project API-key-authenticated gateway. `src/worker/services/quota.ts` currently applies quotas by provider, not by client/project.

The existing `src/worker/services/send.ts` queue can retry a failed or interrupted delivery. For a new external gateway, ambiguous provider-acceptance outcomes are a **release-blocking duplicate-send risk** until a durable idempotency and reconciliation model is designed and tested. Mailbox UI, receiving through Cloudflare Email Routing, and outbound SMTP adapter are distinct; an IMAP server or inbound SMTP service was not found in the inspected Worker source.

New source-aligned specifications: `PRODUCT-REQUIREMENTS.md`, `BRANDING.md`, `ARCHITECTURE.md`, `MAIL-INFRASTRUCTURE.md` and `MULTI-TENANCY.md`. Remaining source/security verification tasks and executable tests are not treated as complete.
