# NECROS Mail — Brand and Interface Specification

**Approved identity:** NECROS Mail · NECROS Inbox · NECROS HOLDINGS · “Email, refined.”  
**Implementation status:** Not yet applied to application code. Logo artwork and final gold palette values remain to be supplied/approved.

## Experience

Design a premium, Apple-inspired application rather than a generic SaaS admin template: minimal, refined, professional, clearly legible and fast. Use off-white light surfaces, soft-black dark surfaces, restrained NECROS gold accents and secondary silver/neutral greys. Avoid gratuitous gradients, heavy glassmorphism, transparency, animated decoration and dashboard clutter. Rounded corners, consistent iconography, careful spacing and subtle purposeful transitions.

Typography: prefer SF Pro Display / SF Pro Text only when legally/technically available; otherwise use a high-quality system sans-serif stack. Do not copy or commit proprietary font binaries merely to match the brief.

## Product navigation

- **NECROS Inbox:** stable sidebar, account/mailbox switcher, folders/labels, searchable message list, reading pane, compose window and profile/settings.
- **Desktop:** responsive three-column arrangement when space allows.
- **Mobile:** accessible drawer/navigation, touch-friendly controls and focused reading/composition.
- **NECROS Admin:** separate protected platform-owner experience. Client administration must be scoped to a verified organisation.

## Behavior and quality

Avoid full-page reloads during folder/thread navigation; preserve list position where sensible. Use the existing React Query and router patterns. Provide clear loading skeletons, unobtrusive refresh status, cached data when appropriate, empty/error states, keyboard access, reduced-motion handling, sufficient contrast, accessible focus rings and consistent light/dark behavior.

## Confirmed rebrand touchpoints

- `src/shared/constants.ts`: `APP_NAME` currently “OpenInbox”.
- `src/web/components/Logo.tsx` and `src/web/public/*`: current logo/icons and manifest.
- `src/web/index.css`: currently Geist font imports and indigo primary color design tokens.
- `src/web/App.tsx` and `src/web/pages/auth/*`: current session/setup/login flows.
- `src/web/components/layout/AppShell.tsx` and `src/web/pages/mail/*`: shell, sidebar, mail UI.
- `src/web/pages/admin/*`: existing global administrator UI.
- `index.html` and `package.json`: metadata and product naming.
- `src/worker/auth/session.ts`, `src/web/lib/api.ts` and `src/web/pages/mail/MailSidebar.tsx`: `oi_*` cookie/local-state identifiers; any rename requires a deliberate backwards-compatibility strategy.

## Phase 01 acceptance

Create brand tokens and approved icon assets; implement consistent shell/auth screens, accessible light/dark and responsive flows without disabling existing setup, authentication or mail features. Check all end-user OpenInbox text and stale meta/manifest assets. Preserve the upstream attribution/license in legal/project files. Run tests and visual checks before moving past Phase 01.

**No branding assets or UI changes were made during this documentation audit.**

## Phase 01A implementation — 2026-11-14

- Added official shared product constants and defaults for fresh instances; existing stored instance settings are not overwritten.
- Replaced the former upstream icon with a **temporary NECROS N monogram**, pending the actual NECROS Mail logo. The monogram is explicitly not final artwork.
- Applied initial off-white, charcoal and restrained bronze/gold system tokens and native-system typography in the existing Tailwind design layer. Actual NECROS brand color hex values still need approval.
- Updated browser/PWA metadata to use NECROS Mail, and removed old OpenInbox PNG icon references from the manifest and apple-touch link; new installable PNG assets still need to be supplied when the real logo is approved.
- Kept upstream LICENSE and source attribution, existing worker name, cookie identifiers and database migrations untouched.
- Code change validation: source-level transformation checks only; awaiting CI/test confirmation.

## Phase 01B initial shell/auth implementation — 2026-11-14

- Updated visible NECROS Mail/Inbox naming in the application shell, sign-in, setup flow, mobile mail sidebar and admin UI. The service's existing authentication, Cloudflare token verification, user roles and mailbox navigation logic were not changed.
- Added the official tagline to authentication layout where no explanatory subtitle is given, and reduced-motion CSS support.
- Enabled the existing GitHub CI workflow to run on `development` push events as well as main/master. CI run status must be reviewed independently.
- Kept application product naming separate from the stored instance label for now; any plan to repurpose `instanceName` must avoid migrations that overwrite user data.
- Retained original README guidance and added a prominent NECROS fork notice with pointers to active documentation.
- Note: final logo, full Apple-inspired UI polishing and PWA raster icons are pending approval and visual testing.

## Phase 01B / C enhancement — 2026-11-16
- Added a standalone, accessible light/dark switch on account/setup screens, retaining existing `oi.theme` system-mode persistence and avoiding authentication or session changes.
- Refined auth visual hierarchy: brand owner and platform identity, centered setup/login card, system font stack and restrained bronze/gold styles (provisional palette; official logo not yet supplied).
- Improved application shell tap targets, navigation accessibility and selected-state styling, and changed mobile Inbox drawer to a soft surface background with a phone-width-safe bound.
- Updated unread-count browser title so Inbox tabs consistently identify NECROS Mail instead of the old OpenInbox name.
- Extended Playwright setup, navigation, tab-title, mobile menu and normal-member authorization smoke checks; CI results must be recorded separately.

### Validation of 2026-11-16 UI batch
The changes above passed GitHub Actions [run 43862186929](https://github.com/Necros-x/OpenInbox/actions/runs/43862186929), including typecheck, lint, Vitest, Vite preview build and both non-skipped Playwright scenarios. The Cloudflare `development` preview build also succeeded. User visual sign-off on the new screens is still pending; temporary logo and provisional gold palette remain in use.

## Phase 01C — Keyboard-safe mobile folder drawer (2026-11-16)
- Hidden phone-width drawer links are no longer keyboard-reachable when the drawer is closed. The desktop sidebar stays visible and interactive.
- Opening the folder menu now announces a modal, focuses its close control, traps Tab navigation, and locks background scrolling. Escape, backdrop or Close dismisses the menu and returns focus to the trigger.
- Screen readers receive the menu's expanded state and a named folder-navigation landmark. A phone-sized browser test verifies modal state, focus trapping, Escape and focus restoration. Final logo, palette and visual sign-off remain pending.

### Verification — 2026-11-16 mobile drawer batch
GitHub Actions [43864284959](https://github.com/Necros-x/OpenInbox/actions/runs/43864284959) passed lint, typecheck, unit/integration, both builds and browser tests (2 passed / 1 optional screenshot skipped). Cloudflare Builds `c379e3ef-b916-48dc-9553-39c6e02ca646` deployed the same code to the isolated preview. Device-level screen-reader review remains unverified.

## Phase 01C — Shared dialogs and composer accessibility (2026-11-16)
- Dialogs now associate visible headings and optional descriptions with their modal semantics, keep keyboard focus within the topmost modal and restore focus on dismissal. They also prevent background page scrolling and remain vertically scrollable on short mobile screens.
- Floating composer now uses dynamic viewport height, respects mobile safe-area spacing around the Send toolbar, and enlarges header controls on touch screens. The schedule-send dialog stacks date/time fields vertically on narrow phones, with proper accessible labels.
- Updated the stale OpenInbox wording in the schedule-send helper text. Changes do not affect backend mail delivery or scheduling semantics.
- Playwright extends the existing admin add-user flow to verify a named dialog, its description, Tab wrap and Escape focus restoration. Validation is not complete until CI and staging deployment pass.

### Validation of Phase 01C shared dialogs and composer — 2026-11-16
After correcting a native-autofocus ordering issue in the Add User form, [GitHub Actions 43868645604](https://github.com/Necros-x/OpenInbox/actions/runs/43868645604) passed all required jobs: lint, typecheck, unit/integration, both build variants and two non-skipped browser scenarios. Cloudflare successfully deployed the isolated `development` Worker. Actual device screen-reader and keyboard behavior remain subject to manual acceptance.

### Phase 01C user phone acceptance (2026-11-16)
Owner reported six successful phone checks (Compose layout, Send toolbar, schedule date/time flow and fit, admin dialog close, light/dark readability). This closes the requested manual checks without substituting for screen-reader coverage, final logo artwork or an approved gold palette. Subsequent folder-resilience changes are Phase 02A, not a retroactive Phase 01 redesign.

## Owner-selected NECROS slate palette — 2026-11-17

The user provided an image of five reference swatches and requested **replacing gold** with these exact colors:

| Swatch | HEX | Use |
| --- | --- | --- |
| Carbon Black | `#212529` | dark canvas, monogram backdrop, primary text |
| Gunmetal | `#343A40` | main controls, dark raised surface |
| Iron Grey | `#495057` | muted light text, dark borders |
| Slate Grey | `#6C757D` | subtle light text, monogram outline |
| Pale Slate | `#ADB5BD` | dark mode accent, soft outlines |

Both light/dark themes use these base swatches with neutral near-white/grey mixtures to maintain reading contrast. Status/error/success colors and user-defined label colors remain distinguishable for functional reasons. The temporary `N` monogram and favicon are now slate-toned, not gold; a final official logo is still pending. Core styles inherit theme variables from `src/web/index.css`. Production service logic, secrets, session IDs, D1 and mail transport are unchanged.

### Palette implementation validation — 2026-11-17
The final slate theme code at `09a26bd` passed [CI 44039479377](https://github.com/Necros-x/OpenInbox/actions/runs/44039479377); its browser test asserts `#212529` for dark background, `#adb5bd` for dark primary, and `#343a40` for light primary. Cloudflare Builds `4abe689a-b5f4-4852-9cd9-c58fd14d4b9e` reported successful staging deployment. Real-device visual acceptance of this new palette is pending.
