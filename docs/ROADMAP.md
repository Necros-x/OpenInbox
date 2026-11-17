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

- [x] Preview artifact compiles in GitHub Actions without credentials (run `43627564907` at `b870a44`); full CI including Playwright passed.

- [x] Isolated `development` Cloudflare Worker and D1 created; Cloudflare build successful and preview URL established (2026-11-15).
- [ ] Verify the preview's mobile rendering and login/setup experience in a real phone browser, using test-only data.
- [ ] Implement tenant isolation before onboarding any independent organisations or real production mail.

## Phase 01B continued — 2026-11-16
- [x] Product-branded auth shell/layout and isolated theme switch on unauthenticated setup/login flows implemented; awaiting CI and phone review.
- [x] Inbox browser title no longer resets to OpenInbox.
- [x] Responsive header navigation buttons enlarged and screen-reader labels added; mobile sidebar width guarded against narrow screens.
- [ ] Review the next successful GitHub Actions run and Cloudflare automatic `development` preview deployment.
- [ ] Confirm visual appearance on actual phone and final logo/approved palette; no full Phase 01 completion claim yet.

### Verified Phase 01B/C milestone — 2026-11-16
- [x] New unauthenticated light/dark control, refined auth layout, improved accessible navigation, mobile-safe sidebar and NECROS tab title committed.
- [x] CI green at `00c75c4` (run `43862186929`): lint, typecheck, unit/integration, both builds, Playwright **2 passed / 1 skipped**.
- [x] Isolated Cloudflare preview automatically deployed at https://necros-mail-preview.necros.workers.dev (Cloudflare build `eb8d7a23-57df-4292-b4ff-1d70390eeb8e`).
- [ ] Owner to review newly deployed mobile and desktop screens on actual devices; final logo, icon files and palette pending.
- [ ] Complete remaining Phase 01 accessibility/visual audits before marking foundation complete.

### Phase 01C accessible mobile navigation (2026-11-16)
- [x] Implement focus-managed, Escape-dismissible mobile folder drawer and keyboard-safe hidden state.
- [x] Extend mobile Playwright tests for drawer accessibility; CI and preview deployment remain to be verified.
- [ ] Complete on-device visual testing and final NECROS brand artwork before marking Phase 01 complete.

### Mobile drawer accessibility validation — 2026-11-16
- [x] CI verified at `fbed186` via [43864284959](https://github.com/Necros-x/OpenInbox/actions/runs/43864284959): lint, typecheck, unit/integration, two builds, browser scenarios 2 passed / 1 optional skipped.
- [x] Cloudflare staging preview automatically deployed (Builds `c379e3ef-b916-48dc-9553-39c6e02ca646`).
- [ ] Manual Android TalkBack / iOS VoiceOver check and actual device sizing/contrast review.
- [ ] Continue navigation/composer accessibility audit and Phase 02 mailbox polish; do not onboard real multi-tenant clients yet.

### Phase 01C dialog / compose accessibility batch — 2026-11-16
- [x] Implement named shared dialogs, modal focus loop, Escape/focus restoration and background scroll lock.
- [x] Refine phone-sized composer, safe-area padding and date/time scheduling form layout and labels.
- [x] Extend end-to-end dialog keyboard regression coverage; CI and preview deployment still require verification.
- [ ] Review real-phone compose/scheduling UI and finish final branding; tenant security work remains a separate prerequisite before clients.

### Verified Phase 01C dialogs and composer — 2026-11-16
- [x] GitHub CI passed at code `a5b11d9` ([43868645604](https://github.com/Necros-x/OpenInbox/actions/runs/43868645604)): lint, typecheck, Vitest, production/preview builds, Playwright **2 passed, 1 skipped**.
- [x] Development preview deployed via Cloudflare Builds `49ab01e9-e731-4b4d-8f3e-9c0254512774` (latest verified `77544b2` documentation commit).
- [ ] Review composer behavior with small on-screen keyboard, safe-area padding and modal focus with iOS VoiceOver/Android TalkBack.
- [ ] Complete branding final icons/palette and Phase 01 mobile visual sign-off; then start Phase 02 targeted mailbox experience work.

### Acceptance of Phase 01C mobile tests — 2026-11-16
- [x] Owner reported **6/6 PASS** from a phone: Compose layout, unclipped Send toolbar, Send later → Pick date/time, narrow-screen date/time layout, admin dialog closing and light/dark readability.
- [ ] Final official logo/colors and dedicated VoiceOver/TalkBack testing are still open; phone acceptance does not establish tenant security or production readiness.

### Phase 02A — Inbox reliability and navigation (2026-11-16)
- [x] Keep existing query-key-scoped cached folder lists and skeleton loading states; reset list scroll to top on mailbox/folder/search navigation.
- [x] Add explicit load-failure/Retry state instead of incorrectly displaying “Inbox zero” or “Nothing here” during a network outage; distinguish failed background refresh when cached messages still exist.
- [x] Expose the existing Refresh action on phones and show an unobtrusive desktop background-update indicator.
- [x] Extend Playwright with failed folder fetch/retry recovery and mobile Refresh visibility; CI and Cloudflare preview verification still pending.
- [ ] Test folder switching with data and offline/online recovery on real phones. Final logo/brand sign-off remains open.

### Phase 02A verification (2026-11-16)
- [x] CI [43920273842](https://github.com/Necros-x/OpenInbox/actions/runs/43920273842) passed lint, typecheck, unit/integration, both builds and Playwright 2 passed / 1 optional skipped, including simulated folder-request failure + Retry recovery and mobile Refresh visibility.
- [x] Isolated Cloudflare preview deployed from `development` (Builds `b6f826e9-9d1f-4ae6-8539-58bdf4b2ea00`).
- [ ] Owner to verify Refresh, folder position and responsiveness on phone. To test the offline state safely, briefly disable connectivity only in this staging preview while loading an uncached folder, then reconnect and retry; do not use production accounts.
- [ ] Phase 02B: reading-pane and list usability improvements, scoped prefetch; preserve tenant-bound query caches and existing authorization.

### NECROS slate branding (2026-11-17)
- [x] User supplied exact five-swatch charcoal/slate palette; global light/dark CSS, temporary logo/favicon and star indicators updated; browser/PWA metadata changed to neutral slate-compatible paper.
- [ ] Validate updated UI on phone in both modes; new official logo remains pending and functional label/status colors remain meaningful exceptions.

### Phase 02B — Conversation reader and keyboard accessibility (2026-11-17)
- [x] Replace reader-wide spinner with a recognizable conversation skeleton and usable Back control while loading.
- [x] Add failed conversation load / Try again state and preserve the previous messages if a background refresh fails.
- [x] Expose a native keyboard-focusable Open conversation button within each row without changing the separate Star or Select controls.
- [x] Extend Playwright with true slate light/dark token assertions and read-failure/retry + keyboard opening; CI and Cloudflare staging verification pending.
- [ ] Evaluate scoped, permission-aware prefetch after phone acceptance, without displaying prior-mailbox cached content across account switches.

### Phase 02B and slate branding verification — 2026-11-17
- [x] Owner-supplied five-tone carbon/slate palette applied across tokens, monogram, browser/PWA and star indicators in `development`.
- [x] Conversation loading skeleton, error/retry, cached-refresh warning and keyboard-openable message rows implemented and tested.
- [x] CI green for code `09a26bd` ([44039479377](https://github.com/Necros-x/OpenInbox/actions/runs/44039479377)): lint, typecheck, unit/integration, both builds, Playwright **2 passed, 1 skipped**.
- [x] Isolated Cloudflare preview deployment successful (Builds `4abe689a-b5f4-4852-9cd9-c58fd14d4b9e`).
- [ ] Owner to sign off phone visual slate theme and opening/closing/loading conversations. Final logo and full screen-reader audit remain pending.
- [ ] Phase 02C candidate: bounded same-mailbox read prefetch and reading-pane interaction polish, only after verifying server-side access guards; do not cross-tenant prepopulate mail.

### Phase 02C — Thinking Orbs notifications (2026-11-17)
- [x] Inspected Thinking Orbs official source, verified MIT license, added local upstream React orb/core and LICENSE with no external runtime dependency.
- [ ] Integrate accessible stateful toast system and compact in-app notification history, preserve Undo semantics, run CI and phone tests.

### Phase 02C — Thinking Orbs notifications (2026-11-17)
- [x] Integrate vendored Thinking Orbs `working/retrying/waiting` animations into the existing toast provider, preserving Undo semantics.
- [x] Add ephemeral authenticated header notifications with unread count, recent updates and clear action; clear history on logout.
- [x] Show actual query-status toast for manual Refresh and retry in Inbox and conversation reader.
- [x] Extend E2E for notification popover and Thinking Orb in a held-open refresh, plus successful completed event.
- [ ] Verify CI/Cloudflare, check visual placement and accessibility on phone, then expand to other true asynchronous workflows.

### Verified Phase 02C quick notifications — 2026-11-17
- [x] Official MIT Thinking Orbs React source integrated; no additional NPM runtime dependency.
- [x] Shared toast provider supports success/error/info, duration-aware Undo, and real loading/retrying states with bounded recent-activity panel.
- [x] App notification history cleared on sign-out and user change; new foreground inbox mail events surfaced when unread count actually increases.
- [x] GitHub CI [44043236616](https://github.com/Necros-x/OpenInbox/actions/runs/44043236616) passed lint/typecheck/unit/integration/both builds and Playwright **2 passed / 1 skipped**.
- [x] Cloudflare development preview deployment succeeded for commit `6bd9a11` (Builds `27d58aea-ee25-4766-8a9e-063e0f4c3dcb`).
- [ ] User phone acceptance: toast placement, orb motion/reduced-motion, bell history and Undo behavior.
- [ ] Next: Phase 02C scoped prefetch/read navigation and additional truthful state notices where users need them; do not replace the real authorization model with client notifications.

### Phase 02C — Bottom, content-sized status toasts (2026-11-17)
- [x] Owner requested bottom placement and content-fit for every toast; applied to shared toast layer and retained mobile safe-area constraint.
- [x] Extended phone Playwright to assert bottom anchored, non-full-width, in-viewport toast geometry.
- [ ] Confirm mobile visual placement with real devices and open Compose toolbar; CI and isolated preview verification pending.

### Compact bottom toasts verified — 2026-11-17
- [x] CI [44045418853](https://github.com/Necros-x/OpenInbox/actions/runs/44045418853): lint, typecheck, unit tests, both builds, Playwright 2 passed / 1 skipped including mobile toast width and placement.
- [x] Cloudflare development preview deployed commit `a16d10c` (Builds `7ead686f-8ccc-4df9-9aea-db8b3e00b6a6`).
- [ ] Real-phone review when Compose and Undo Send are active; adjust vertical clearance if necessary without restoring full-width toast sizing.

### Phase 02C conversation navigation — 2026-11-18
- [x] Implement short 180ms desktop-hover and keyboard-focus prefetch of existing authorized non-draft thread rows; reuse 15-second `useThread` cache and invalidate on updates.
- [x] No touch-scroll prefetch, no cross-mailbox placeholders, no unbounded background loading; verify API read guard still enforces mailbox membership.
- [x] Extend member visibility test to cover Open conversation control; CI and preview result pending.
- [ ] Verify behavior on desktop with DevTools network and phone without unnecessary mobile downloads; continue reading-pane UX after acceptance.

### Phase 02C verified — 2026-11-18
- [x] Controlled desktop-hover/keyboard-focus prefetch with 15-second freshness guard, no touch-scroll preloading. Server `assertThread` mailbox-membership enforcement retained.
- [x] Two CI runs passed ([44173671517](https://github.com/Necros-x/OpenInbox/actions/runs/44173671517), [44173682340](https://github.com/Necros-x/OpenInbox/actions/runs/44173682340)), including Playwright.
- [x] Cloudflare isolated preview build succeeded for `09c55f3` (Builds `81c68f98-5311-4f5e-9064-25b65e357368`).
- [x] Confirmed no matching `mail.necros.co` custom-domain mapping, DNS record, or Worker route exists in the connected Cloudflare account; no destructive operation necessary.
- [ ] Owner to review performance on desktop, normal folder flow on phone and verify `mail.necros.co` remains disconnected before production planning.

### Phase 02C manual acceptance — 2026-11-18
- [x] Owner reported 5/5 PASS: desktop hover/responsiveness, phone folder/list UX, Refresh and compact bottom Thinking Orbs, staging-only hostname.

### Phase 02D — Mobile conversation navigator (2026-11-18)
- [x] Add 44px phone previous/next controls, accessible labels and loaded position counter with correct first/last disabled states.
- [x] Clarify loaded-only counts for paginated mailboxes in mobile and desktop views.
- [x] Extend full-flow and mobile E2E with two mock conversations and previous/next navigation.
- [ ] Verify CI / Cloudflare preview and seek real-phone acceptance. Review reading pane focus and scroll behavior next.

### Verified Phase 02D — 2026-11-18
- [x] GitHub CI passed for `fe74659` ([44175726336](https://github.com/Necros-x/OpenInbox/actions/runs/44175726336) and [44175714640](https://github.com/Necros-x/OpenInbox/actions/runs/44175714640)); Playwright 2 passed and one optional screenshot test skipped.
- [x] Cloudflare isolated preview deployed code `fe74659` successfully (Builds `fbe5a475-bbcc-4175-8a61-034ab1c17708`).
- [ ] Owner phone acceptance: previous/next buttons and boundaries, loaded position counter, mobile Back and long-subject layout, light/dark readability.
- [ ] Phase 02E: reading pane focus/scroll restoration, accessible long message controls; maintain strict server-side mailbox authorization and avoid unnecessary mail API changes.
