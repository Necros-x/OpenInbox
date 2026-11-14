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
