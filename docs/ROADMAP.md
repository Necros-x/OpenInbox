# NECROS Mail — Development Roadmap and Phase 01 Scope

**Date:** 2026-11-14  
**Status:** Audit-based plan. Nothing on this list should be marked completed until implemented and verified.  
**Source of product decisions:** NECROS Mail handoff (official name, four product areas, six phases).

## Current baseline status

- [x] Existing `development` branch verified and linked to `main` baseline.
- [x] Source-level inspection of major frontend/backend/Workers/D1/mail/provider paths completed.
- [x] Current global administrator + mailbox membership model identified as insufficient for client isolation.
- [x] Current provider-level quota and interrupted-send risk identified.
- [x] Product handoff recorded and design/architecture documentation established.
- [ ] Complete exhaustive endpoint-to-query permission and schema constraints matrix.
- [ ] Run local lint, typecheck, tests and production build; inspect failures before implementation.
- [ ] Inspect external email/Cloudflare constraints and finish release threat model.

## Phase 01 — Rebrand and foundation

**Goal:** NECROS Mail identity and NECROS Inbox shell, preserving existing mail function, with technical planning that does not prematurely claim secure multi-tenancy.

### Batch 01A — Prep and design tokens (planned)

- [ ] Source-led baseline quality checks.
- [ ] Confirm final wordmark/icon and gold/neutral palette; protect MIT attribution.
- [x] Establish brand constants, preserve legal notices and introduce provisional theme tokens in a small reversible change (Phase 01A).
- [x] Establish .dev.vars.example / .env.example (placeholders only); local Cloudflare setup still requires end-to-end verification.
- [ ] Capture existing visual states to compare screenshots/regressions.

### Batch 01B — Authentication and shell (planned)

- [ ] Finish auth screen redesign; initial NECROS brand labels on login and setup completed (no logic changes).
- [ ] Update title, manifest, favicon and public assets once final logo approved.
- [ ] Finish accessible responsive shell; initial branding, light/dark tokens and reduced-motion handling added.
- [ ] Preserve mailbox list, account switching, message navigation, modal/compose and keyboard shortcuts.
- [ ] Avoid changing session cookie/local storage identifiers until a compatibility migration is designed.

### Batch 01C — Foundations and acceptance (planned)

- [ ] Visual accessibility and mobile checks.
- [ ] Preserve existing inbound, outbound, scheduled send and data behavior.
- [ ] Run npm run lint, npm run typecheck, npm test, npm run build and relevant Playwright flows.
- [ ] Document changed files and validation per commit.
- [ ] Hold Phase 01 release pending the tenant/security plan where real independent clients are concerned.

**Not in Phase 01:** new IMAP mail server; production domain changes; production client migration; gateway/API-key implementation; full organisation database migration.

## Phase 02 — Mailbox experience

- [ ] Audit existing inbox/sent/drafts/star/archive/spam/trash, search, labels/folders, contacts, signatures, attachments, reply/reply-all/forward.
- [ ] Close real feature gaps and fix UX regressions, not rewrite working features.
- [ ] Build refined responsive three-column experience where space permits, improved cache/refetch, skeleton/empty/error states, mobile navigation.
- [ ] Verify D1/R2 storage choices and mailbox access for every attachment/export.

## Phase 03 — NECROS Delivery Gateway

- [ ] Specify normalized versioned API and SDK contract.
- [ ] Implement hashed, scope-bound project API keys and rotation/revocation.
- [ ] Add authenticated send request validation, sender/domain verification and abuse/rate limits.
- [ ] Build delivery request/attempt ledger, idempotency and UNKNOWN outcome reconciliation.
- [ ] Reuse Resend and Brevo adapters; implement safe failover and future adapter contract.
- [ ] Add org/project daily and monthly quotas, reservations and usage analytics.
- [ ] Persist delivery status, normalize replay-safe provider events and webhook authentication.
- [ ] Test acceptance timeout, duplicate caller requests, concurrency and out-of-order events.
- [ ] Gate application integrations on a reliable contract; do not modify Swara Ranjana or other repositories automatically.

## Phase 04 — Client management and multi-tenancy

- [ ] Add organisations, roles, memberships, projects and scoped resources.
- [ ] Scope domains, mailboxes, provider credentials, message/attachment paths and quotas.
- [ ] Create safe onboarding, invitations, per-client administration and suspensions.
- [ ] Implement default-NECROS backfill, ownership constraints and negative tenant tests.
- [ ] Review independent client administration before activation.

**Ordering dependency:** Although product phases are numbered 01–06, the *minimum organisation/project ownership and authorization foundation* must be in place **before exposing the Phase 03 gateway to client projects**. No public multi-client gateway is allowed before Phase 04's isolation controls are implemented and tested. Build these foundational pieces in a security-first subphase before live gateway rollout.

## Phase 05 — NECROS Admin

- [ ] Separate platform-wide admin and client admin experiences.
- [ ] Provider credentials/health, routing, security events and suspension.
- [ ] Tenant/project quota controls, usage, delivery logs, failures and analytics.
- [ ] Audit privileged administrative actions.

## Phase 06 — Testing and production

- [ ] Automated tenant denial tests; authentication/authorization review.
- [ ] Idempotency, provider failover, spam/deliverability and bounce/complaint flows.
- [ ] Staging D1 migration and restore, R2 retention, webhook replay tests.
- [ ] Responsive/mobile and accessibility regression suite.
- [ ] Deploy test domains and observe; production cutover only with explicit approval.
- [ ] Operational runbooks, monitoring, recovery and rollback.

## Adjacent projects — context, not automatic code work

- **Nenasala:** current general Cloudflare migration complete; NECROS Mail integration is future gateway work. Existing transactional Resend stays live until gateway ready.
- **Swara Ranjana:** completed; do not touch unless separately instructed.
- **POS / ARC:** remain untouched.
- **NECROS Holdings, Studio and Atelier:** separate Cloudflare migration plans outside this repository.

## Commit rule

Every implementation commit updates the appropriate focused documentation plus docs/DEVELOPMENT-NOTES.md (why, changed files, validation, outstanding tasks). Prefer small focused commits; never alter main without authorization.

## Phase 01 implementation status — 2026-11-14

- Initial branded base and visible auth/shell text committed as separate reviewable batches. These changes **do not** implement multi-tenancy, delivery gateway API keys, or production readiness.
- Existing PNG PWA icons are no longer referenced while final artwork is pending; installable raster icons, visual testing and full authentication polish remain.
- Development push CI now runs the pre-existing lint/typecheck/unit/build/e2e pipeline; results must be independently confirmed. The user reported a passing baseline typecheck before these commits, not a passing modified-tree typecheck.

## Phone-accessible staging preview — 2026-11-14
- [x] Prepared manual GitHub Action with lint/typecheck/unit/build gate, isolated preview Worker and D1 config.
- [ ] Owner enables GitHub Actions and configures scoped Cloudflare GitHub Actions secrets.
- [ ] Verify CI quality gates and public test-only `workers.dev` URL.
- [ ] Test setup and mobile layout; no production domains, providers or tenant data.

- [x] Preview deploy gating hardened: `NECROS_MAIL_PREVIEW_ENABLED` repository variable defaults off; push to development only after explicit owner opt-in.

- [x] CI verified on the branded application code (Actions run `43627000830`): lint, typecheck, 88 unit/integration tests, production build, Playwright 1 passed; each suite also had one skipped test.
- [ ] Run and inspect the opt-in preview workflow against the new isolated Cloudflare staging Worker and D1; Cloudflare account access not yet provided.
