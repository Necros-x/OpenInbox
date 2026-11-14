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
- **Caution:** .gitignore currently contains a broad docs ignore entry, even though documentation files are tracked. Preserve tracked docs and inspect ignore behavior before relying on new local docs being automatically detected by Git.

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
