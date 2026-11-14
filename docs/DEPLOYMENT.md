# NECROS Mail — Local Development and Deployment Plan

**Current status:** Development-only planning. Do not point production MX, install new services or deploy production without explicit approval.

## Confirmed baseline

- package.json: Vite dev/build, tsc project typecheck, ESLint, Vitest, Playwright.
- Node.js requirement declared: >=22.18.
- wrangler.jsonc: a single Worker with DB D1 binding, SPA assets, fetch/email/scheduled handlers, cron entries.
- vite.config.ts uses @cloudflare/vite-plugin. Tests can use mocked external APIs.
- src/worker/env.ts defines types for DB, encryption key, Cloudflare API token and test base overrides. Environment type declarations are **not** a reason to place credentials in TypeScript source.
- The existing first-run setup in src/worker/services/setup.ts expects Cloudflare Worker/token verification and may generate an ENCRYPTION_KEY stored as a Worker secret.

## Local guidance

Run npm ci, npm run dev with an appropriate local mock/testing setup. Use documented test/mock/server.ts and dev:mock for provider-free development as needed, and inspect actual setup flow before creating an admin account. Avoid sending live email from local experiments. Do not paste production tokens in chat or commit them.

- Local secrets: .dev.vars (ignored by Git); safely checked-in .dev.vars.example and .env.example can be added in an implementation batch with placeholders only.
- Public build-time environment configuration can use Vite when appropriate, but never use VITE_* for provider keys or database secrets.
- Remote Cloudflare secrets belong in Worker secret storage; DB is a binding, not a SQL credential in browser code.
- Protect recovery/encryption key material and validate rotation/recovery strategy.
- The broad `docs` ignore entry was removed during Phase 01 to allow new documentation files to be tracked.

## Intended hostnames — proposals

mail.necros.co (Inbox), admin-mail.necros.co (platform Admin), api-mail.necros.co (delivery API), necros.co/mail (marketing), docs.necros.co/mail (documentation). These may be implemented on the same Worker or separated for security/isolation, after auth and routing design. Merely assigning hostnames does not grant role isolation.

## Staging and production gates

- Separate test database and safe test domain; avoid production MX changes.
- Verify D1 migrations, restore, tenant isolation, tenant admin restrictions, quota/idempotency and webhook handling.
- Validate SPF/DKIM/DMARC, incoming Cloudflare routing, send and receipt, attachment retention, bounded retries, alerts, structured logs.
- Rehearse rollback from production deployment and database failure.
- Measure actual quota/cost/storage under expected client traffic; don't assume Cloudflare free-tier suffices.

## Commands to run in a local checkout

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

**Verification at documentation commit:** GitHub source review only. None of these local commands have been run by the GitHub integration in this session. Record actual results before closing work.

## Upstream obligations

Retain MIT LICENSE and original notices. Maintain source attribution where required. Upstream syncing must be intentional and must not overwrite NECROS changes.

## Cloudflare phone preview (prepared, NOT deployed)

A separate manual GitHub Actions workflow is now available in `.github/workflows/cloudflare-preview.yml`. It builds and tests `development`, then deploys a dedicated **necros-mail-preview** Worker and a dedicated **necros-mail-preview** D1 database. It never modifies `main`, production `wrangler.jsonc`, MX/DNS records, routes, providers, accounts or production email. The preview uses its own `wrangler.preview.jsonc` and `scripts/deploy-preview.mjs`; scheduled jobs are disabled.

**This workflow requires the account owner's participation:** the connected GitHub app cannot create Cloudflare resources or GitHub repository secrets. From a mobile browser, open GitHub repository **Settings > Secrets and variables > Actions** and provide `CLOUDFLARE_API_TOKEN` (a scoped Worker + D1 deployment token) and `CLOUDFLARE_ACCOUNT_ID` as secrets. Do not paste either into chat or commit them. If this fork's GitHub Actions are disabled, enable them in the repository Actions tab. Navigate to **Actions > NECROS Mail Cloudflare Preview (manual) > Run workflow > development**. Verify the check job and deploy job succeed. The deploy logs print the actual `workers.dev` preview URL; never guess it in advance.

**Preview limitation:** the real Worker app requires Cloudflare setup/owner claim; visiting an unclaimed Worker shows the setup flow, not a bypassed/authenticated inbox. Don't connect a real email domain just to test the UI. The preview remains public unless protected with Cloudflare Access; use test data only, and do not claim client isolation is production-safe. An eventual Cloudflare Workers Builds connection may instead use isolated Worker Previews, but it needs owner configuration and preview D1 bindings. No staging credentials or production mailboxes were used here.

**Check note (2026-11-14):** the source checkout was not available in the isolated assistant shell (no GitHub network DNS). GitHub Actions reported zero runs after pushing development and opening draft PR #1; these local/CI checks remain unverified. Manual workflows are intended to address this once GitHub Actions is enabled by the repository owner.


### Triggering this preview safely from a phone

GitHub only exposes `workflow_dispatch` for workflows present on a repository's default branch. We do **not** put this preview workflow on `main`; it therefore also listens to **pushes to `development`**, but **all jobs are gated behind** the repository Actions variable `NECROS_MAIL_PREVIEW_ENABLED=true` (absent/false by default). It cannot deploy until this is deliberately enabled by the owner **and** both `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets are available. After configuring them from GitHub Settings → Secrets and variables → Actions, ask the assistant to push an innocuous development-only documentation update to trigger the safe preview pipeline. No merge is required. Keep the variable disabled when previews are not needed.

## Last verified code checks

[GitHub Actions run 43627000830](https://github.com/Necros-x/OpenInbox/actions/runs/43627000830) passed the full tracked CI suite at commit `b69be75`: lint, typecheck, 88 Vitest passed / 1 skipped, build, and Playwright 1 passed / 1 skipped. A previously stale Playwright assertion was updated to the new NECROS Mail setup heading. These CI checks do **not** establish deploy success or production readiness.

**Additional CI smoke test:** `scripts/check-preview-build.mjs` compiles an isolated preview artifact using a synthetic D1 ID and verifies the expected output configuration. This only tests packaging; real deployment still requires credentials and the scoped preview D1 resource.

**Build-path discovery:** the Cloudflare Vite plugin normalizes `necros-mail-preview` to the environment/output directory `dist/necros_mail_preview`, while the Cloudflare Worker name remains `necros-mail-preview`. Both build-check and deploy scripts use the correct underscored directory.
