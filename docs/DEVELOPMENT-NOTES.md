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

### 2026-11-14 — Validate Cloudflare preview bundle without account access
- Added `scripts/check-preview-build.mjs` and CI check after the main production build.
- Runs a second Vite build with the preview Wrangler configuration and a synthetic D1 UUID solely to confirm `dist/necros-mail-preview/wrangler.json` is emitted; no Cloudflare token, D1 creation, DNS, provider or actual deployment is involved.
- No change to production `wrangler.jsonc`. CI result pending following this commit.

### 2026-11-14 — Fix preview output path discovered by CI
- Preview smoke check in GitHub Actions `43627403130` successfully produced a separate Vite Worker bundle at `dist/necros_mail_preview/wrangler.json`, then failed on the script's incorrect assumption that Vite uses a hyphenated output directory.
- Corrected both the non-deploy smoke check and actual isolated preview deployment script to use Vite's underscored environment directory. No Cloudflare resources accessed; production build and unit tests had passed before this extra check.
- This fix requires a fresh CI run to confirm.

### 2026-11-14 — Preview compilation and regression suite confirmed green
- Verified GitHub Actions run [43627564907](https://github.com/Necros-x/OpenInbox/actions/runs/43627564907) at commit `b870a44c50a248669bd520ac3b1d8b8281038337` completed successfully: CI lint, typecheck, Vitest, build, isolated preview bundle compile and Playwright E2E.
- The preview bundle now compiles to `dist/necros_mail_preview/wrangler.json`; this packaging step uses a synthetic D1 binding ID and does not call Cloudflare APIs or deploy.
- Real Cloudflare deployment is **not performed**. The opt-in preview workflow correctly skipped while `NECROS_MAIL_PREVIEW_ENABLED` remains unset/false. No DNS/mailboxes/provider settings changed. Await explicit owner-set repository secrets and preview variable before any development push attempts an actual preview.

### 2026-11-15 — Verify newly connected Cloudflare account and preview authorization
- Confirmed Cloudflare application connection with read access to the NECROS Cloudflare account.
- Cloudflare preview Worker `necros-mail-preview` and D1 `necros-mail-preview` did not exist during the account inspection. Existing Nenasala Worker/database resources were untouched.
- The previous full CI run succeeded; the separate GitHub Actions preview deployment remains opt-in, and this documentation commit triggers a permissions/enablement check on `development`.
- Do not treat access in the ChatGPT Cloudflare connector as a GitHub Actions secret. Do not connect DNS, provider credentials or live email during preview creation.

### 2026-11-15 — Prepare Cloudflare Builds preview deployment
- Verified authenticated Cloudflare account access. Connected `Necros-x/OpenInbox` to Cloudflare Builds; created only an isolated `necros-mail-preview` D1 database and an isolated `necros-mail-preview` placeholder Worker, leaving Nenasala resources untouched.
- Adapted `scripts/deploy-preview.mjs` to accept a validated `NECROS_MAIL_PREVIEW_D1_ID` for Workers Builds as an alternative to GitHub Actions scoped credentials; it still only accepts the named preview Worker and DB.
- Configuration is intended to use `development` as the deployment branch for the isolated preview Worker, not production `main`. No DNS, MX, Email Routing, or sender provider changes.
- Validation: CI and Cloudflare execution to follow. No claims of live full-app deployment until the build and Worker response are verified.

### 2026-11-15 — Isolated Cloudflare Worker preview deployed
- User connected their Cloudflare account through the Cloudflare integration; verified the account had Nenasala resources but no existing NECROS Mail Worker or preview D1 database.
- Connected `Necros-x/OpenInbox` to Cloudflare Builds. Created a new, dedicated `necros-mail-preview` D1 database and `necros-mail-preview` Worker. Existing `nenasala-peradeniya` Worker and all Nenasala databases remained unchanged.
- Configured Cloudflare Builds for the **`development`** branch only, using `scripts/deploy-preview.mjs`, isolated `wrangler.preview.jsonc`, and `NECROS_MAIL_PREVIEW_D1_ID`. Previews (additional branch previews) are disabled for this staging worker; it is itself a preview-only deployment.
- Manually triggered Cloudflare build `a98515f6-052f-499c-a6d6-66801eda7363`; Cloudflare reported **success** on 2026-11-15 with uploaded Worker, preview D1 binding and zero scheduled triggers.
- Deployment URL reported by Wrangler: **https://necros-mail-preview.necros.workers.dev**. Build output reported Worker version `065d190d-bbea-424e-9740-50ba9f1a772f`.
- The external web browsing tool could not retrieve the preview URL, so browser-level rendering and owner setup are NOT marked verified here; Cloudflare deployment status and resource listing were confirmed through authenticated APIs.
- **No production DNS, email routing, MX, providers, client accounts, main branch or Nenasala resources were changed.** Do not connect real domains to the test instance. Next: review initial setup/UI on phone, test mobile design with fake data, then prepare controlled production setup after tenant isolation and gateway design are ready.

### 2026-11-16 — Phase 01B/C: auth presentation, accessible theme control and mobile navigation
- Reason: continue the approved product rebrand after the owner reviewed the phone preview, preserving existing Cloudflare/mail/auth behavior.
- Changed: `src/web/components/ThemeToggle.tsx` (new), `src/web/pages/auth/AuthLayout.tsx`, `src/web/pages/setup/SetupPage.tsx`, `src/web/components/layout/AppShell.tsx`, `src/web/pages/mail/MailPage.tsx`, `test/e2e/app.spec.ts`, BRANDING.md and ROADMAP.md.
- Fixed legacy `OpenInbox` tab title in the active Inbox, polished authentication presentation, improved mobile navigation touch/accessibility and tested the unauthenticated theme switch.
- Compatibility: no new API routes, Worker secrets, schema changes, email provider changes, tenant controls, session-cookie renames, or production DNS changes. Final branding assets remain outstanding.
- Validation pending GitHub Actions after the commit. Do not claim a passing check before inspecting workflow result.

### 2026-11-16 — Isolate mobile navigation browser check after CI timeout
- GitHub Actions run `43860941575` passed lint, TypeScript, unit/integration suite, normal build and isolated preview bundle compilation. The combined Playwright flow exceeded its 90-second test timeout after the new mobile smoke checks were appended.
- Moved the mobile-only validation to its own named test with an independent browser context, explicit login, shorter per-step timeouts and try/finally context closure. The original comprehensive mail/send/authorization flow is returned to its original scope.
- This is a test-harness refinement, not a production UI/mail/backend behavior change. The cause of the prior mobile click timeout is still to be confirmed from the next run.

### 2026-11-16 — Fix mobile E2E locator ambiguity
- GitHub Actions `43861661291`: original full mail-flow test passed after moving mobile checks to a separate test. Mobile test failed because the non-exact Playwright button name `Menu` also matched `Account menu` and `Close menu`.
- Fixed only the mobile test locator by requesting an exact accessible name. No application runtime changes. CI needs rerun to confirm all browser tests.

### 2026-11-16 — Phase 01B/C verified and deployed to preview
- Last code commit in this batch: `00c75c49cccb68456826a0502ac0ae5eeb00f4e6`. CI run [43862186929](https://github.com/Necros-x/OpenInbox/actions/runs/43862186929) completed **successfully**: dependency install, lint, typecheck, unit/integration, production build, isolated preview bundle and Playwright browser tests.
- Browser result: **2 passed, 1 skipped** (optional screenshot coverage). Existing full setup/mail/send/search/member-access flow passed, and the newly isolated mobile Inbox navigation flow passed. Separate browser assertions also check unauthenticated light/dark switch and NECROS Mail tab title.
- Cloudflare Builds run `eb8d7a23-57df-4292-b4ff-1d70390eeb8e` successfully deployed the same development commit to the isolated `necros-mail-preview` Worker + D1 environment. Preview URL: https://necros-mail-preview.necros.workers.dev
- Fixed only E2E selectors/test structure after inspecting GitHub failures, not mail/auth/runtime behavior. No production domain routing, API providers, Nenasala resources, or main branch modified.
- Next: actual device visual acceptance, final logo/icon and palette approval, full Phase 01 accessibility polish and any remaining user-visible upstream branding; Phase 02 mailbox work starts after current foundation acceptance. Platform tenant isolation and gateway remain separately gated.

### 2026-11-16 — Mobile folders keyboard accessibility
- **Reason:** Off-canvas mobile folder controls could be keyboard-reachable when closed. Opening lacked modal focus handling and Escape dismissal.
- **Changed:** MailPage, MailSidebar, ThreadList, mobile E2E test, BRANDING.md and ROADMAP.md.
- **Behavior:** focus moves into the open drawer, Tab stays inside, Escape/close/backdrop dismiss, focus returns to Menu, and closed drawer is hidden from navigation without hiding desktop.
- **Validation:** pending CI (lint/typecheck/unit/Playwright/build) and Cloudflare preview. No changes to Worker routes, mail delivery, D1, production DNS or main.

### 2026-11-16 — Mobile drawer accessibility: CI and preview verification
- Source commit: `fbed18639ffc7b71af551d00e448599a149b530b` (focused accessibility change with implementation and documentation in one commit).
- GitHub Actions [CI 43864284959](https://github.com/Necros-x/OpenInbox/actions/runs/43864284959) finished **successfully**: `npm ci`, lint, TypeScript, unit/integration tests, production build, isolated preview bundle build, and Playwright browser tests (**2 passed, 1 optional screenshot test skipped**).
- Cloudflare Builds deployment `c379e3ef-b916-48dc-9553-39c6e02ca646` finished **successfully**, tracking `development` commit `fbed186` to https://necros-mail-preview.necros.workers.dev. No production email/DNS, Nenasala Worker or main changes.
- Follow-up: real-phone keyboard/VoiceOver/TalkBack manual review, visual palette/logo approval, wider accessibility audit of mail compose/dialogs, then Phase 02 Inbox refinements. Test success is not an independent WCAG audit or tenant-isolation verification.

### 2026-11-16 — Phase 01C: shared modal/dialog and composer polish
- **Reason:** Dialogs provided focus entry and Escape but lacked a focus loop and accessible title/description associations; short mobile viewports had composer and date/time layout constraints.
- **Files:** shared `ui/overlay.tsx`, `mail/Composer.tsx`, `mail/PickTimeDialog.tsx`, `test/e2e/app.spec.ts`, BRANDING/ROADMAP and this commit record.
- **Behavior:** topmost modal gets titled/description semantics, Tab wrap and background-scroll lock. Composer adjusts to dynamic viewport/safe-area and usable phone header controls. Schedule-send date/time fields become stacked and labeled on phones. Existing provider, drafts, auth, D1 and mail routes untouched.
- **Validation:** code and regression test commit only; CI and isolated Cloudflare staging deploy require verification. No production DNS, routing or main changes.

### 2026-11-16 — Follow-up: correct dialog focus restoration timing
- GitHub CI run `43867528548` passed lint, typecheck, Vitest and both builds, but Playwright reported **1 failed, 1 passed, 1 skipped**: Escape closed the Add a user dialog without reliably returning focus to its original trigger.
- Focus return in `Dialog` previously happened in a passive `useEffect` cleanup, after the focused portal content could already be detached. Changed the modal lifecycle to `useLayoutEffect` for cleanup before React removes portal nodes in commit `a4637ad24fc761b0e174683d5a374cda019632c2`.
- Scope: shared component behavior only; no email, database, provider or infrastructure logic. CI rerun and the actual browser assertion remain **pending** at this documentation commit.

### 2026-11-16 — Fix dialog opener lost to native input autofocus
- GitHub Actions runs `43867528548` and `43868080945` reproduced failed return-focus assertion after Escape. The Add User dialog's `autoFocus` input receives focus before modal mount lifecycle effects run, so capturing `document.activeElement` inside the shared dialog did not identify the button that opened it.
- Commit `a5b11d9b8f8340d8227e81797ef77eb670e62425` removes this native `autoFocus` from the Add User form. The shared Dialog already programmatically focuses its first enabled field after recording the opener; it therefore retains the intended initial field focus and can restore the opener.
- This is a focused frontend accessibility correction. No mail/D1/Cloudflare resource changes. Recheck the full CI and Playwright suite before marking resolved.

### 2026-11-16 — Phase 01C modal and compose batch verified
- **Code milestone:** `ee3ffc0` introduced labeled, keyboard-trapped shared dialogs, accessible scheduling fields and improved phone composer geometry. Subsequent fixes `a4637ad` (layout cleanup), `a5b11d9` (remove premature native autofocus in Add User) and documentation commits preserved separate revision history.
- **Verification:** GitHub Actions [run 43868645604](https://github.com/Necros-x/OpenInbox/actions/runs/43868645604) passed lint, TypeScript, unit/integration, production Vite build, isolated Cloudflare preview build and Playwright (**2 passed, 1 skipped**). The E2E regression now confirms named Add User dialog, focus trapping, Escape and opener-focus restoration without changing the user creation flow.
- **Deployment:** Cloudflare Builds `49ab01e9-e731-4b4d-8f3e-9c0254512774` completed successfully against `development` at `77544b2` to https://necros-mail-preview.necros.workers.dev. Worker and D1 are preview-only; no production routing, provider credentials, DNS or main changes.
- **Remaining:** final brand artwork/color approval, real-device keyboard/mobile visual review, other dialog/compose accessibility audits and Phase 02 mail experience improvements. Tests cover checked flows, not an exhaustive accessibility certification.

### 2026-11-16 — Phase 01C phone acceptance and Phase 02A Inbox resilience
- **User acceptance:** 6/6 phone tests reported PASS: Compose layout, no Send toolbar clipping, Send later and Pick date/time flow, date/time controls fit phone, admin dialog closes, light/dark readable. This is user-reported real-device visual/functional testing, not an automated WCAG or screen-reader audit.
- **Phase 02A source finding:** `ThreadList` previously rendered “Inbox zero” / “Nothing here” when its query failed, because it checked only `isLoading` and `list.length`, not `isError`. On phones its manual Refresh action was hidden; switching folders could retain the previous list's scroll position.
- **Changes:** `src/web/pages/mail/ThreadList.tsx` adds separate error/retry, background-refresh warning with retained cache, mobile Refresh, accessible small update status, empty-search guidance, scroll reset keyed by mailbox/view/query; `test/e2e/app.spec.ts` simulates a 503 and validates retry, plus mobile Refresh visibility; documentation updated.
- **Security boundary:** Query keys remain scoped by mailbox/view/query. Did NOT add `placeholderData` across mailbox keys (which could show another mailbox's messages). No Worker, provider, database, auth or DNS changes. Main untouched.
- **Validation:** awaits GitHub lint, typecheck, tests/build and Cloudflare isolated preview confirmation after commit. Continue only after inspecting failures.

### 2026-11-16 — Phase 02A verified CI and staging deployment
- **Code commit:** `18e1c081e97dc78867e4d0d5df0a65aff51862c0`, recording Phase 01C's six user-reported phone PASS results and implementing the first Phase 02 Inbox failure/retry/mobile refresh behavior.
- **GitHub Actions:** [43920273842](https://github.com/Necros-x/OpenInbox/actions/runs/43920273842) finished **successfully**: lint, typecheck, Vitest, production build, isolated preview bundle and Playwright (**2 passed / 1 skipped**, optional screenshot test). The end-to-end mail flow now includes a simulated 503 folder request and successful Retry recovery; mobile test checks that Refresh is visible.
- **Cloudflare:** Builds run `b6f826e9-9d1f-4ae6-8539-58bdf4b2ea00` reported **success** for `development` source `18e1c081`. Staging remains https://necros-mail-preview.necros.workers.dev using its isolated Worker and D1.
- **Security/design:** No cross-mailbox stale placeholder data, no API schema/auth/provider changes, no mail routing/DNS production activity and no changes to `main`. This validates the tested flows but does not imply every offline or mobile network condition was manually tested.
- **Next:** user phone acceptance of folder switching/Refresh/offline failure handling; Phase 02B message-list/read-pane UX, scoped prefetch and accessibility review; final approved NECROS brand assets remain pending.

### 2026-11-17 — Approved slate palette, batch A (base theme and monogram)
- Changed `src/web/index.css` design tokens in both themes and the temporary logo + favicon to the owner's exact five-swatch Carbon Black / Gunmetal / Iron Grey / Slate Grey / Pale Slate reference. Updated `src/web/lib/theme.ts` dark/light browser theme value.
- Explained roles and accessible neutral surfaces in `docs/BRANDING.md`. No providers, routes, database, auth, production mail/DNS or main changes. Do not claim CI/phone verification until checked.
