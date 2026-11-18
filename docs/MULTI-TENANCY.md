# NECROS Mail — Multi-Tenancy Design Requirements

**Current state:** Installation-wide `users`, `domains`, `providers`, `settings` and `admin`; mailbox-level memberships only. No tenant/organisation ownership model appears in current migrations. This file is a target design, not a shipped feature.

## Identities and roles

- **NECROS Super Admin:** a separately guarded and audited platform role; global provider policy, onboarding, quota override, security monitoring.
- **Client Admin:** a role on a verified organisation membership; manage only that organisation's permitted domains, mailboxes and people.
- **Regular User:** authorised organisation membership and narrower mailbox access, including read/send flags.
- A person may hold roles in multiple organisations, but the current request's selected organisation must be validated against the server-side session and membership.

Never assign a client admin the current global `admin` role: `src/worker/auth/middleware.ts` makes it installation-wide. Existing `mailbox_members` read/send checks are useful second-layer controls and should be preserved.

## Ownership model to design (no migrations yet)

Propose `organisations`, `organisation_memberships`, `projects`, `project_api_keys`, `organisation_plans`, `quota_policies`, `delivery_requests`, `delivery_attempts`, `delivery_events`, `quota_reservations` and `security_events`. Existing tenant-managed domains, addresses, mailboxes, user uploads, providers (or deliberately shared provider allocations), messages, labels, contacts, filters and logs must acquire enforceable organisation attribution through explicit IDs or mandatory checked parent keys.

Preserve global uniqueness where necessary for actual email address/domain ownership; do not blindly scope DNS/domain uniqueness by tenant. Migration design must resolve cross-domain aliases, cross-domain catch-all, existing memberships, encrypted provider credentials and pre-existing owner accounts.

## Server-side invariants

1. Request identifies actor, permitted organisations, selected organisation and authorized project scope.
2. No endpoint reads or mutates a tenant resource without a trusted ownership check. Direct-object-ID requests must fail closed.
3. Joining a mailbox requires both tenant membership and mailbox authorization.
4. Client admins cannot see platform settings, another client's keys/domains/providers, or hidden operational records.
5. Inbound recipient routing resolves one tenant-owned destination; aliases and catch-alls cannot silently cross tenant boundaries.
6. Outbound From identity, provider selection, quota and webhook reconciliation all use the same owner.
7. R2 raw-message, attachment and uploaded-byte access must check ownership before every read, signed URL or delete.
8. Cron, retry, logs, search, exports, imports, retention and auto-reply carry tenant context.
9. Operations such as suspension, ownership transfer and deletion require explicit audit, recovery and retention rules.
10. Platform-level emergency access is intentionally separate, logged and restricted.

## Negative tests required

Client A cannot list, read, search, send-as, assign, upload to, export, delete, or modify Client B's domain/mailbox/thread/message/attachment/API key, even when guessing B's IDs. Repeat for organisation admin, normal user, suspended user, revoked key, background job, webhook and provider credentials. Confirm neither response body nor error metadata leaks other-tenant existence.

## Migration and sequencing

Design first: map all D1 tables and services, decide platform vs tenant ownership, plan default-NECROS backfill, foreign keys and reversibility. Add schema and centralized authorization only after Phase 01 planning and review. Run seeded two-organisation tests before onboarding any independent client. Having one `mail.necros.co` hostname is a hosting choice, not an isolation guarantee.
