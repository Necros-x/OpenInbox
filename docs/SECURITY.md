# NECROS Mail — Security Model and Release Gates

**Status:** Source-informed risk review; not a completed penetration test. Last reviewed 2026-11-14.

## Current protections to preserve

- D1-backed hashed session tokens; HTTP-only session cookies and separate CSRF double-submit protection (src/worker/auth/session.ts, auth/middleware.ts).
- Account login, forced password changes, optional TOTP/recovery codes, auth rate limiting.
- Ordinary mailbox reads/sends checked by mailbox membership (src/worker/auth/access.ts).
- Webhooks use provider-specific signature or secret URL verification (src/worker/routes/webhooks.ts).
- Provider credentials are stored as encrypted application settings; optional Cloudflare Worker ENCRYPTION_KEY protects encryption.
- Message HTML sanitation and constrained inline attachment responses need regression testing, not assumption of universal safety.

## Release-blocking gaps

1. **Tenant isolation:** global admin middleware and tables are installation-wide. Cannot give independent client admins existing global admin privileges.
2. **API keys:** no tenant/project-bound public application delivery key model in inspected source. Store hashed key secrets; scope, rotate, revoke, audit, and rate-limit.
3. **Idempotent delivery:** interrupted or ambiguous sends must not trigger unverified automatic resend/failover; record request/attempt/state and reconcile events.
4. **Tenant data surfaces:** full authorization matrix for admin routes, mail, attachments, uploads, forwarding, aliases, cron, webhook processing, search, logs and exports.
5. **Secrets:** only server-side Cloudflare Worker secrets and local ignored .dev.vars; never VITE_* secrets, checked-in credentials or public TypeScript literals.
6. **Webhooks:** per-provider verification, replay/idempotency, tenant attribution and out-of-order terminal status handling.
7. **Abuse controls:** verified From domains, per-project limits, account suspensions, bounce/complaint handling, rate limiting and attachment restrictions.
8. **Backups:** encrypted provider settings and attachments need tested restoration; plan key rotation, recovery and retention per tenant.

## Security test matrix

- Cross-organisation guessed IDs for every resource and every HTTP method must be denied without leaking existence.
- Client admin must never reach platform providers/keys/global analytics.
- Revoked project key, suspended organisation or unverified sender must not send.
- Concurrent duplicate delivery requests and accept-then-timeout conditions must not duplicate mail.
- Provider webhooks must reject bad signatures and duplicate events.
- Scheduled/background and inbound processing must enforce the same tenant ownership checks.
- Accessing an attachment or raw message without a valid mailbox membership must fail.
- Test destructive actions, escalation, recovered sessions and multi-org user switching.

## Deployment security gates

No production DNS changes, credentials, actual client mail or cross-organisation onboarding until migration backfill, tests, backups, monitoring, rollback and access-control review are complete. Main remains untouched until explicit owner authorization.

## Operational rule

Never claim a security property is verified simply because source has a check; run negative integration tests against seeded independent organisations. Document scope and results per commit.
