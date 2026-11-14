# NECROS Mail — Database Inventory and Migration Proposal

**Verified source:** src/worker/db/migrations (0001_init through subsequent migrations), src/worker/db/migrate.ts; 2026-11-14. **No schema changes made.**

## Current platform

Cloudflare D1 (SQLite). The Worker ensures migrations automatically, using a d1_migrations bookkeeping table. Existing migrations must remain immutable; add new sequenced migration files after review. The initial schema has a single-installation users table and global role enum (owner/admin/member).

## Baseline table families from 0001_init.sql

| Family | Tables / storage | Intended ownership |
| --- | --- | --- |
| Identity/config | settings, users, sessions, auth_attempts | platform identities + tenant memberships |
| Domains/mailboxes | domains, mailboxes, addresses, mailbox_members | organisation / mailbox |
| Delivery | providers, provider_domains, quota_usage, suppressions | platform-shared or tenant-assigned provider and scoped quota |
| Messages | threads, messages, message_bodies, messages_fts, attachments, raw_messages | organisation via authorised mailbox |
| Mail UX | labels, thread_labels, thread_notes, filters, contacts, blocked_senders, trusted_senders | mailbox / organisation |
| Automation/logging | autoreply_log, forward_destinations, uploads, inbound_log, audit_log, daily_stats, counters, cache | explicitly classified per service |

Additional migrations introduce Cloudflare provider support, login/2FA support, body reparsing and sender-logo caching. Inspect all schema snapshots and indexes before writing a forward migration; the inventory above is not a claim that later migrations were executed against any deployed D1 database.

## Proposed new schema concepts (not yet implemented)

- organisations(id, slug, status, plan_id, ...); organisation_memberships(user_id, organisation_id, role, status).
- projects(id, organisation_id, name, status); project_api_keys(project_id, key_hash, scopes, expires_at, revoked_at).
- tenant-owned domain/mailbox attribution, and explicit provider allocations.
- quota_policies, quota_reservations / usage ledgers keyed by organisation/project/period; avoid simple read-then-write race conditions.
- delivery_requests(id, organisation_id, project_id, idempotency_key, request_hash, state, ...), delivery_attempts, delivery_events, delivery_status history.
- security_events and necessary access indexes/foreign keys.

These are design candidates, not final SQL. Model mailbox membership as an additional permission layer. Ensure globally unique DNS domain names and email addresses remain globally unique. Decide tenant scope of global suppressions and aliases intentionally.

## Migration protocol

1. Map every route/service query and existing foreign key.
2. Back up D1 and attachment storage and test restore on staging.
3. Add organisations and scoped memberships; create default NECROS organisation.
4. Backfill existing single-installation records deterministically; reject orphan/conflicting owners.
5. Introduce ownership constraints and indexes; route reads/writes through scoped access helpers.
6. Add delivery/key/quota tables after design of idempotency and concurrency behavior.
7. Validate migration from a copy of existing data and seeded two-tenant test fixtures.
8. Rehearse rollback and key recovery; only then plan production migration.

## Open concerns

Cross-domain aliases, provider shared credentials, catch-all destinations, user membership across tenants, data retention, D1 transactional guarantees for quota reservation and unique idempotency key constraints all need dedicated decisions.
