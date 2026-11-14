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
