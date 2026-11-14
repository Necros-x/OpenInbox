# NECROS Mail — Development Notes

> Working project based on the upstream OpenInbox codebase. This document is maintained on the `development` branch. It is not a deployment guide and does not authorize production changes.

## Repository and branch policy

- Repository: `Necros-x/OpenInbox`
- Upstream project: `sums001/OpenInbox`
- Upstream license: MIT; retain the upstream `LICENSE` and applicable copyright/attribution notices in derivative distributions.
- Protected working convention: all implementation and documentation work happens on `development`.
- `main` is the untouched baseline/release branch. Do not commit, merge, or deploy to `main` without explicit approval.
- Every commit must include a documentation update describing the change, rationale, affected areas, validation performed, and any follow-up work. Documentation-only commits must also record themselves in this log.
- Keep credentials, Cloudflare tokens, recovery keys, private keys, and real mailbox data out of Git and chat.

## Product direction

Build a centrally operated, multi-organisation email platform for NECROS HOLDINGS and independent organisations that use the service.

Initial intended organisation model:

- **Platform owner:** NECROS HOLDINGS, with platform-wide administration.
- **Internal organisations:** NECROS divisions such as Studio and Atelier, with organisation-scoped administration and membership.
- **Independent organisations:** for example Nenasala, with their own organisation administrators and complete separation from NECROS business data and other customer organisations.
- **Shared infrastructure:** one application and shared Cloudflare services may host multiple organisations only after server-side tenant isolation is proven.

A central hostname such as `mail.necros.co` is the current direction, not a final DNS/deployment decision. Organisation-specific domains and mailbox domains must remain independently manageable.

## Non-negotiable security requirements

1. Every tenant-owned record must have an explicit, trusted organisation scope (directly or through a rigorously enforced parent relationship).
2. Every API request must derive the caller's organisation memberships and permissions from the authenticated server-side session. Never trust a client-supplied organisation ID as authorization.
3. Reads, writes, searches, exports, attachment access, background jobs, inbound routing, outbound sending, logs, and administrative operations must all enforce the same tenant boundary.
4. Platform-owner privileges must be explicit, auditable, and separate from organisation-admin privileges.
5. Organisation administrators must not be able to inspect or mutate another organisation's users, mailboxes, messages, domains, providers, credentials, settings, or audit records.
6. Tenant isolation must be covered by automated negative tests (cross-tenant read/write attempts), not inferred from UI visibility.
7. High-risk actions require audit events. Secrets must remain encrypted at rest and never be returned to ordinary clients.
8. Do not attach real domains, change DNS, deploy a production Worker, or import real mail until the security and operational gates are signed off.

## Baseline observations (initial repository inspection)

The repository is a Cloudflare Worker + D1 + Vite/React application. The Worker handles HTTP API requests, Cloudflare Email Routing inbound messages, and scheduled jobs. The Wrangler configuration currently describes one Worker and one D1 binding. Optional attachment storage uses R2 through the application's storage adapter.

The current schema and route structure are built around a single installation-wide administration model:

- Authentication queries a global `users` table by email.
- The admin API is mounted behind an admin requirement and exposes installation-wide users, mailboxes, domains, providers, settings, and operational data.
- Mailbox membership exists, but that is not equivalent to organisation/tenant membership or organisation-level administration.
- Mailbox, thread, message, attachment, domain, provider, and settings ownership must be traced through the schema and every query before any tenant model is designed.
- Inbound email is routed by recipient address to a mailbox in the same D1 database; tenant resolution and enforcement must be designed into this path.
- The README describes multiple domains and users, but does not promise isolated organisations or per-organisation admin boundaries.

These are preliminary structural findings, not a completed security audit. No claim of tenant safety is made at this stage.

## Architecture audit worklist

- [ ] Map all D1 tables, foreign keys, indexes, and migration ordering.
- [ ] Trace authentication, session creation, role checks, password recovery, and 2FA.
- [ ] Trace every API route and service query for authorization and resource ownership.
- [ ] Trace mailbox membership and shared inbox permissions.
- [ ] Trace inbound email recipient resolution, aliases, catch-all, forwarding, and filters.
- [ ] Trace outbound sending, provider credentials, sending-domain setup, and quotas.
- [ ] Trace attachment/raw-message storage and download authorization across D1/R2.
- [ ] Trace cron jobs, retries, retention, usage counters, logs, and audit events.
- [ ] Review frontend route guards and organisation-context handling (UI checks are not security controls).
- [ ] Review existing unit, integration, and end-to-end coverage; identify missing cross-tenant tests.
- [ ] Run baseline lint, typecheck, unit/integration tests, and build in a local environment when available.

## Planned delivery phases

### Phase 0 — Baseline and threat model
Complete the audit worklist, document the current single-installation assumptions, identify migration hazards, and define tenant isolation invariants. No product behavior changes.

### Phase 1 — Tenant data model and authorization foundation
Design organisations, memberships, scoped roles, platform roles, invitations, and ownership constraints. Add migrations and server-side authorization helpers only after the audit establishes a safe migration path.

### Phase 2 — Tenant-scoped core resources
Migrate users, domains, mailboxes, aliases, mailbox memberships, provider configuration, and settings to explicit organisation ownership. Preserve platform-level operations separately.

### Phase 3 — Mail and storage isolation
Enforce tenant scope for threads, messages, bodies, attachments, raw content, search, exports, inbound routing, outbound sending, scheduled tasks, and retries.

### Phase 4 — Administration and onboarding
Add platform owner controls, organisation admin workspaces, invitations, organisation lifecycle controls, audit visibility, and safe onboarding flows.

### Phase 5 — Security verification
Add cross-tenant denial tests for every resource family and operational path; test privilege escalation, identifier tampering, attachment URL access, background processing, and tenant deletion/retention behavior.

### Phase 6 — Staging and operational readiness
Use a spare/test domain and non-production Cloudflare resources. Validate Email Routing, provider delivery, DNS setup, quotas, backups/export, recovery, monitoring, and rollback before any production decision.

## Engineering and verification rules

- Prefer additive, reversible D1 migrations; never rewrite applied migration history.
- Keep changes small enough to review, but group tightly related changes into coherent phases.
- For every code commit, update this log or a linked focused document in the same commit.
- Record exact commands and outcomes. Do not mark a check as passed unless it was actually run.
- Before a phase is considered complete, run the relevant tests plus `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` where the local environment permits.
- Review the diff for accidental secrets, generated files, unrelated formatting, and upstream license/attribution changes.
- No automatic merge to `main`.

## Commit record

### 2026-11-13 — Development branch and project baseline
- Created `development` from the repository's existing `main` branch.
- Confirmed the authenticated GitHub connection has push/admin permission on `Necros-x/OpenInbox`.
- Confirmed the repository default branch remains `main`; no changes were made to it.
- Inspected repository metadata, root structure, package scripts, Wrangler configuration, README, Worker entry point, authentication route, admin route, inbound-mail service, and migration directory listing.
- Initial finding: current configuration is one Worker + one D1 installation; the code exposes installation-wide administration and is not yet verified for organisation-level tenant isolation.
- Validation: repository inspection only. Local lint, typecheck, tests, and build have not yet been run.
- Next: complete the schema/query/auth/inbound/outbound/storage audit before proposing tenant migrations.

### 2026-11-13 — Initial architecture audit document
- Added `docs/ARCHITECTURE-AUDIT.md` in commit `6eec525ce269ee59b7e3036d6c7f634e9e980f79`.
- Recorded the confirmed single-installation architecture, current global role/admin model, mailbox membership limits, and the critical inbound/outbound/storage tenant boundaries.
- Added a preliminary ownership classification and a security-first audit checklist.
- No application code or production resources changed.
- Validation: source inspection only; audit remains in progress.

### 2026-11-13 — Extended mail-flow and authorization audit
- Extended `docs/ARCHITECTURE-AUDIT.md` in commit `23112bd88b313a5629bf673edc486c36b876b883`.
- Traced mailbox membership helpers, thread/message access assertions, inbound exact/plus/catch-all resolution, installation-wide blocked-sender rules, provider selection, user upload ownership, and asynchronous jobs.
- Confirmed that mailbox membership is a useful existing authorization layer, but there is no organisation membership or tenant boundary in the inspected auth model.
- Added high-priority targets for route assertions, destructive admin actions, global suppressions, background jobs, foreign-key consistency, and tenant deletion/export/retention.
- No application code, D1 migrations, DNS, or Cloudflare resources changed.
- Validation: source inspection only; local quality commands remain unrun.


### 2026-11-14 — NECROS Mail product handoff and source-led planning
- Confirmed official identity: NECROS Mail / NECROS Inbox, NECROS HOLDINGS, tagline “Email, refined.” This supersedes earlier provisional naming while preserving upstream license/attribution.
- Read product handoff and inspected the `development` branch source structure, package, Wrangler, Vite config, Worker entry points, session and authorization middleware, D1 migrations, webmail/admin API inventory, provider adapters, sending/inbound/storage/webhook/cron services, frontend shell, style tokens and existing tests.
- Added product requirements, branding, architecture, infrastructure and multi-tenancy documents. These distinguish verified existing functionality from proposed gateway/tenant functionality.
- Source finding: current sending limits are per-provider, not per-organisation/project. Sending retries need idempotency and ambiguous-acceptance handling before becoming a client API.
- Source finding: receiving is through Cloudflare Email Routing, not a built-in IMAP or incoming SMTP server. The SMTP adapter is an outbound sender.
- Retained the six-phase security-first legacy plan above as historical baseline; the authoritative product-driven phases and Phase 01 scope are in `docs/ROADMAP.md`.
- No application code, credentials, live infrastructure, or production mail was changed. Audit remains source-based; tests/build/lint/typecheck have not been executed by this GitHub-connected environment.
- Follow-up: finish service-level permission matrix and baseline tests before changing database/tenant or delivery code.


### 2026-11-14 — Security, data and deployment planning (commit fd16351)
- Added `docs/SECURITY.md`, `docs/DATABASE.md`, `docs/DEPLOYMENT.md` and `docs/ROADMAP.md` in commit `fd16351ed00ab2fe212b95c7e18999b50e1cf36a`.
- Established source-derived security gates, existing D1 table-family inventory, additive migration plan, environment/deployment rules, and six-phase delivery plan including Phase 01 batches.
- Reconciled the user-specified phase order with the security dependency: organisation/project ownership and authorization must exist before any external multi-client gateway is enabled.
- Audit remains based on source inspection; no lint/typecheck/test/build or deployed system checks have been executed in this environment.
- No code, database, DNS, secrets, mail delivery or main branch changed.

### 2026-11-14 — Documentation commit-log follow-up
- This commit records the previous focused documentation commit separately and keeps the per-commit change history current.
- Validation: GitHub source read and branch write only; no executable validation.

### 2026-11-14 — Phase 01A: brand foundation and safe environment examples
- Reason: start approved NECROS Mail rebrand without changing authentication, mail routing, tenant scope or production infrastructure.
- Files: shared product constants, new-installation name default, visual LogoMark placeholder, design tokens, favicon/manifest/index metadata, theme meta colour, Git ignore configuration, placeholder-only environment examples, and BRANDING.md/ROADMAP.md.
- Preserved: Worker/D1 config, actual mail code, session cookie keys, raw R2/email workflows, MIT LICENSE and upstream reference.
- Validation: user reported baseline typecheck passed. This commit has not been locally linted, typechecked, unit-tested, or built in the assistant environment; CI must verify the changed tree.
- Next: authenticate/shell visible naming, confirm UI appearance and final assets; run tests and fix any failures.

### 2026-11-14 — Phase 01B: branded auth/shell and development CI
- Reason: make NECROS Mail visible in the existing application flow and run automatic checks on development without altering APIs or mail processing.
- Changed: AuthLayout/LoginPage, AppShell, mobile MailSidebar, SetupPage text, App fallback, admin labels/settings, reduced-motion CSS, README fork header, and GitHub workflow development push trigger.
- Documented in BRANDING.md/ROADMAP.md. All current package scripts, backend routes, encryption/session identities, database schema and Cloudflare secrets remain unchanged.
- Validation: user-reported baseline typecheck passing; changed commit still requires CI lint/typecheck/test/build/e2e review. No local automated checks were run here.
- Follow-up: review GitHub Actions result, fix defects on development and inspect visual states before starting deeper authentication redesign.

### 2026-11-14 — Prepare test-only Cloudflare preview and mobile validation (not deployed)
- Motivation: owner temporarily lacks PC and requested an accessible phone preview and independently executed checks.
- Added manual `cloudflare-preview.yml`, standalone Wrangler preview config, deployment script which creates/uses `necros-mail-preview` D1 only, GitHub Actions `workflow_dispatch` for CI and generated config ignore.
- Safety: preview deploy requires secrets supplied independently by repository owner; no mail routing/DNS changes; no re-use of production Worker/D1; only `development` is eligible. Background crons disabled on preview.
- GitHub Actions initially showed zero runs despite development pushes and draft PR #1. Local clone of public repo was unavailable due no network in the assistant shell; **lint, typecheck, test, build and deployment remain unverified** at time of commit.
- Next: owner enables Actions/adds GitHub Secrets through phone, runs CI/preview workflow, inspect logs, fix any failures, share actual Cloudflare preview URL after success.

### 2026-11-14 — Playwright branding-regression fix (commit b69be75)
- CI for development passed lint, typecheck, unit/integration tests (88 passed, one skipped), and production build.
- E2E failure was a stale expectation in `test/e2e/app.spec.ts`: the test looked for “Welcome to OpenInbox” after the setup screen was intentionally renamed “Welcome to NECROS Mail”.
- Commit `b69be755f5d836788ece2cea8f886fa4a8cc7c87` updated the browser test to locate the new welcome heading by accessible role/name; no production behavior or code was modified.
- Validation: failure diagnosed from GitHub Actions run `43626697554`; revised E2E result awaits a subsequent run.

### 2026-11-14 — Preview trigger compatibility and opt-in gate
- Reason: workflows added solely on development cannot be assumed to expose a GitHub `workflow_dispatch` button because dispatch requires the file on the default branch.
- Added a development-push trigger with job-level `NECROS_MAIL_PREVIEW_ENABLED == 'true'` opt-in. No auto preview deployment when variable is missing/false. Owner must configure scoped secrets and enable the repo variable before asking for a new development commit.
- Documentation updated accordingly; this does not connect Cloudflare or run a deploy.

### 2026-11-14 — CI verification on rebranded code
- Run: [GitHub Actions 43627000830](https://github.com/Necros-x/OpenInbox/actions/runs/43627000830), at `b69be755f5d836788ece2cea8f886fa4a8cc7c87`.
- `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, Playwright browser installation and `npm run test:e2e` all succeeded on GitHub-hosted Node 24.
- Vitest result: **88 passed / 1 skipped**. Playwright: **1 passed / 1 skipped**. Skipped tests were not silently counted as passes. Prior E2E failure was the renamed setup heading assertion and was corrected in commit `b69be75`.
- This verifies code on that SHA; later workflow/documentation changes still need their own CI status review, and **no Cloudflare deployment occurred**.
- Remaining deployment blocker: owner must authorize Cloudflare Workers + D1 through the repository's scoped Actions credentials and explicit preview enable flag.
