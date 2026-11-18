# NECROS Mail — Architecture: Existing and Target

**Audit baseline:** `development`, source inspected 2026-11-14. This is not a production-readiness or penetration-test certificate.

## Verified current implementation

The repository is a Vite/React/TypeScript single-page application and a Hono API hosted by a single Cloudflare Worker. The same Worker exports `fetch` (API), `email` (Cloudflare Email Routing ingestion), and `scheduled` (background work): see `src/worker/index.ts` and `src/worker/app.ts`. Wrangler defines `DB` (D1), static assets and two cron triggers. Optional R2/S3-style blob storage is configured by encrypted settings, not a required Wrangler R2 binding.

Source map:

- Web: `src/web/App.tsx`, `src/web/pages/mail/*`, `src/web/pages/admin/*`, `src/web/pages/settings/*`.
- HTTP: `src/worker/routes/*`, auth middleware and mailbox membership assertions.
- Data: `src/worker/db/migrations/*`, `src/worker/db/settings.ts`, service queries.
- Email: `src/worker/services/inbound.ts`, `src/worker/services/send.ts`, `src/worker/providers/*`, `src/worker/services/webhooks.ts`.
- Storage/background: `src/worker/storage/*` and `src/worker/cron.ts`.
- Tests: `test/unit`, `test/integration` and `test/e2e`.

## Product architecture proposed

    NECROS applications and client projects
                     |
            authenticated Gateway API
              project + organisation
                     |
      authorization → quota → sender check
                     |
         durable send / idempotency ledger
                     |
         provider routing and status events
                     |
           Resend (primary) / Brevo
                     |
                  recipients

    Cloudflare Email Routing → inbound Worker
                     |
          organisation/domain resolution
                     |
             mailbox and mail storage
                     |
               NECROS Inbox UI

    NECROS Admin (platform-wide privilege)
    Client Admin (organisation-scoped privilege)
    Regular User (mailbox membership-scoped)

**The gateway, organisation model and durable send ledger are not implemented yet.** Source code currently exposes session-cookie routes and installation-wide admin operations, not an external API-key-authenticated application gateway.

## Preserve / rebrand / improve / build

| Category | Parts | Rationale |
| --- | --- | --- |
| Preserve | Vite, React, Hono Worker, D1, inbound parser, mailbox/threads, compose, R2 storage adapter, provider adapters, webhooks and tests | Functional baseline |
| Rebrand | Logos, text, metadata, icons, design tokens, login, shell, admin visual hierarchy | Approved identity |
| Improve | Send failure classification, webhook robustness, telemetry, responsive UI, environment examples, accessible states | Reliability and quality |
| Extend | Domain/provider ownership, user membership and scopes, storage access, audit trails | Tenant-safe reuse |
| Build | External send API, project API keys, organisation/project quotas, idempotency ledger, delivery attempts, tenant admin | Not found in source as complete features |

## Integration sequence

Do NOT redirect existing Nenasala or completed Swara Ranjana traffic yet. Swara Ranjana is complete and remains untouched. POS and ARC remain unchanged. NECROS Holdings, Studio and Atelier have their own separately tracked Cloudflare moves. Nenasala's general Cloudflare migration is already complete; only its eventual NECROS Mail integration remains. Gateway integrations are future opt-in changes, not an automatic authorization to modify those repositories.

See `MAIL-INFRASTRUCTURE.md` for send/receive mechanics and `MULTI-TENANCY.md` for tenant boundaries.
