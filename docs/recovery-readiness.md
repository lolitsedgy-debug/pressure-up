# PRESSURE UP RECOVERY READINESS

September 9, 2026. Result: **PARTIAL**. Real isolated SQLite + local-file restoration passed with synthetic, application-generated test records. No production records were exported, and no independent live deployment or authentication was created. This is a reproducible recovery proof, not a disaster-recovery backup of the business.

## What was proved

`node recovery/prove.mjs` creates synthetic records through existing booking, invoice and marketing handlers, supplements representative bookkeeping/content records, exports an offline database/file snapshot, and restores it into a new SQLite file and separate disk file store. All 27 application tables are populated. IDs and row values are compared exactly except deliberately rotated access/concurrency tokens. SQL foreign keys and additional application relationships are checked. Every referenced file is checked with SHA-256. Original application handlers then read restored jobs/calendar data, original photo bytes, business contact settings, marketing posts and analytics, and generate a parseable invoice PDF. Old customer links are rejected; replacement links serve the correct document.

The proof covers two jobs belonging to one customer, three issued invoice revisions, one recorded cash payment, expense/receipt relationships, mileage/trip edits, website content/version/media, availability, messages, marketing approvals and attribution. Original receipt evidence is copied unchanged. Orphan objects and duplicate byte content are reported, never deleted. Wrong passwords, corrupt file bytes, forged manifests, missing referenced originals, broken customer relationships and target overwrites are rejected. Exact counts/results are in `recovery/proof-result.json`.

No full browser/iPhone visual comparison, video playback test, live credential integration, or independent authentication test was performed. Test-only identity stubs exist only in the existing test harness. No proof endpoint is deployed. Passing handler/PDF checks does not establish full independent production parity.

## Export structure and restore procedure

Offline tooling: `recovery/package.mjs`, `recovery/cli.mjs`, `recovery/prove.mjs`. Node 22.13+ (tested Node 24.19), existing npm lockfile and dependencies. Reproduction from source root: `npm ci`, then `node recovery/prove.mjs`. This does not connect to production. Generated fixtures go into a new temporary directory, whose path is printed at completion; they are synthetic and can be removed after inspection.

An operator export requires an **already-consistent, offline** SQLite copy and corresponding object store. It does not extract live D1/R2. Object directory format: `object-index.json` is an array of original object keys; each object's exact bytes are stored at `SHA256(original-key)`. Hashed filenames avoid collisions when R2 has both `key` and `key/thumbnail`, and avoid path traversal. Do not reconstruct object keys from filenames; use the manifest. The source object listing must be complete to make orphan detection meaningful. Unknown provider objects outside that listing cannot be detected.

Package layout:

- `business-data.json`: documented JSON arrays keyed by all 27 table names, stable IDs retained; access-token fields and matching embedded credentials redacted. Private customer/business information still requires owner-only handling.
- `recovery-records.encrypted.json`: full records, including historical snapshots and sensitive links, encrypted with AES-256-GCM and a scrypt-derived key. Salt/nonce are random. No passphrase is saved.
- `files/`: referenced exact original/thumbnail bytes. These remain private evidence, **not encrypted individually**. Stage the entire directory only on an encrypted, owner-controlled volume; encrypt the complete archive before transporting or backing it up. Whole-archive streaming encryption is not implemented by this prototype.
- `manifest.json`: file keys, sizes, SHA-256, content type where present, record IDs, roles, job/customer associations, schema hashes, counts, diagnostics. Receipt files without stored MIME metadata may be `application/octet-stream`.
- `manifest.authenticated.json`: encrypted/authenticated copy of the manifest. Restore verifies it against the readable manifest before processing schema/files.
- `schema/`: ordered SQL migrations. `COMPLETE`: completion checksum marker.

Estimates, appointments, payment state and invoice status are fields/JSON within jobs in this schema, not invented extra tables. Messages are notification records. Invoice revisions are `invoice_versions`; analytics are funnels plus job/payment links. No actual payment ledger beyond the application's current recorded fields is fabricated. PDFs are generated from restored data and source; no nonexistent stored PDF originals are invented. Website/portfolio/marketing references preserve their existing media relationships. Inactive-lead media follows the existing job/request associations.

Operator commands, **not run against production here**:

```
node recovery/cli.mjs export OFFLINE_SQLITE OBJECT_DIRECTORY NEW_PACKAGE --offline-confirmed
node recovery/cli.mjs restore PACKAGE NEW_EMPTY_TARGET
```

Both read the passphrase from standard input. Use a secure prompt/password manager process to supply it; never place it in shell arguments/history or a backup file. Retain the recovery key separately. Restore refuses an existing target. It validates integrity, applies schema to a new database, restores rows in a deferred-constraint transaction, and writes files under original-key mappings. It does not launch a server, create users, send messages, or connect integrations.

Logical consistency depends on obtaining a quiesced/provider-consistent source first. The tool transactionally reads tables and checks the source database again after copying files, but this is **not a live D1/R2 atomic snapshot mechanism**. Do not use the offline-confirmed flag to bypass that prerequisite. A future live capture must establish a write barrier or immutable generation with complete file inventory and verify it before releasing the barrier. Production is not paused by this work.

For larger stores, adapt this prototype to streamed archive encryption/hashing rather than buffering individual files. Complete video-scale stress testing, provider object metadata export, full inventory checks and encrypted-volume staging are prerequisites for real use. The schema registry fails on unknown application tables so new models cannot silently disappear. Provider migration-ledger metadata is excluded; baseline the new host's migration ledger before any subsequent migrations to avoid replaying schema creation.

## Sensitive links and independent authentication

Ordinary business exports redact `manage_token`, invoice/marketing mutation tokens and matching embedded values inside invoice snapshot JSON and notification text. This is a defensive structured redactor, not a guarantee that arbitrary owner-entered prose contains no secrets. Never add environment values or provider credentials to exports. Existing live export behavior was not modified in this task; treat its raw export as sensitive until replaced with the safer flow.

The protected recovery records retain historical links to preserve issued-document evidence. Default restore regenerates customer manage tokens and invoice/marketing concurrency tokens. Historical sent snapshots/text remain unchanged inside the private restored database. Old external links will stop working; replacement links must be deliberately distributed after verification. No messages are sent by the restore. The low-level `migrateLinks:false` option is for a controlled continuity restore; it preserves current customer access and must not be used for an exposed test deployment. Mutation tokens still rotate. Owner sessions are not exported.

An independent host must replace Sites-injected owner identity headers and ChatGPT sign-in/out with verified server-side sessions. Never trust a client-supplied owner-email header. Keep the Owner View authorization boundary and UI; map a new owner identity to the existing owner role. A maintained authentication implementation should provide email/password or passwordless login, recovery, passkeys/TOTP, session lists/revocation and verified credential changes. Email delivery/recovery and session storage require separate secure configuration. Secrets must be recreated from an owner-controlled password manager; previous host sessions must be invalidated. This authentication replacement is not implemented or tested here.

## Preserving Pressure Up

| Component | Classification | Required work |
|---|---|---|
| Public design, React components, branding, editor, marketing drafts | Portable essentially unchanged | Preserve source/assets and current layouts |
| Pricing, PDF formatting, local OCR, analytics formulas | Portable essentially unchanged | Keep pinned dependencies and bundled OCR assets; regression test |
| Booking, CRM, invoices, calendar, expenses, mileage | Portable with infrastructure adaptation | Preserve SQL/IDs and handler behavior; supply compatible database/storage adapters |
| D1 / R2 bindings and private file delivery | Infrastructure adaptation | SQLite-compatible DB and object-store adapter with existing access controls |
| Vinext/Vite/Worker entry and deployment configuration | Infrastructure adaptation | Closest path is owner-controlled compatible Workers/D1/R2 infrastructure; other Node hosts need runtime adapters |
| Sites owner authentication / identity injection | Requires replacement | Verified independent owner sessions, recovery and 2FA |
| Sites deployment/version control, project bindings and old Sites URLs | Platform-specific | Independent CI/release process, environment configuration and URL handling |

Production remains the reference. The closest migration path keeps the frontend and business logic, substitutes infrastructure behind existing boundaries, and verifies the booking-to-invoice flow in staging before any cutover. An independently controlled Cloudflare account is one compatible option, not activated or chosen here. No claim is made that the exported source is a one-click independent production deployment.

The source archive includes frontend/backend, SQL migrations, lockfile, public assets, tests and these instructions. Dependencies must still be installed; it is not an offline registry mirror. Optional configuration names/purpose: `SITE_URL` public base URL; `BUSINESS_PHONE`, `OWNER_EMAIL`, `BUSINESS_BASE_ADDRESS` business defaults/private base; `GOOGLE_MAPS_API_KEY` optional routing; `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` future SMS; `RESEND_API_KEY`, `EMAIL_FROM` optional email. Values remain absent. No active Stripe implementation is invented. Current worker has no scheduled backup/cleanup handler; no background schedule is hidden in this package. The previous architecture audit remains authoritative for provider limits that are not exposed.

## Disaster recovery design — not activated

Live storage holds current data. Archive storage retains older legitimate business evidence and remains searchable; it is not the only backup. Independent backup must be encrypted and stored outside the primary hosting account, with a second recovery key copy held separately.

Proposed targets: nightly consistent data+file capture (24-hour recovery-point target), seven daily versions, five weekly versions and twelve monthly versions, plus snapshots before risky releases. Longer financial evidence retention is separate from rolling backup retention. Source commits/lockfiles/migrations are backed up on each release. Store only secret names/instructions, not secret values, in the ordinary package. Use a separate encrypted password manager for key material. Incremental immutable file copies may reduce volume, but each snapshot must include a complete restorable manifest and retain all files it references.

Validate checksums/counts/relationships after each backup. Quarterly, restore into a fresh private environment and test original-photo delivery, booking/calendar, invoice/PDF, cash totals and customer history; test after schema or storage changes too. Target recovery time of one business day is only a goal until an operator completes a timed real-data drill. Failed backups must never advance “last successful backup.” A future Settings → Data & Backups screen should show last **verified** backup, restore-test date, exports and storage figures, with details hidden. It was not added here because live backup capability is not yet proved; no misleading green backup status is introduced.

## Exact next steps / blockers

1. Obtain an authorized, consistent **real** database snapshot plus complete referenced original-file inventory/export through a supported owner/provider route. Present tools did not expose a safe full live snapshot; no workaround touched production. Existing raw owner export alone does not prove atomic consistency or secure token handling.
2. On an encrypted owner-controlled staging volume, create the protected package, supply a separately retained recovery key, restore it and compare all actual records/file checksums. Include video playback, original photos, sent invoices, payment totals and browser/iPhone workflows. Resolve all missing objects/relationships; do not delete them.
3. Save an independently controlled encrypted copy and complete a restore from that copy. Until this succeeds, **Pressure Up cannot be claimed fully recoverable if hosting disappears tomorrow**. Source plus synthetic proof does not contain live business history.
4. Before independent hosting, implement the compatible runtime/storage adapters and independent authentication, recreate secrets securely, disable outbound integrations in staging, and compare the actual public/Owner experience and workflow against production. Only a later authorized cutover would change domains/DNS.

No production application code, authentication, live storage, DNS, paid integration, retention deletion or external backup was changed or activated. The UI remains exactly as deployed before this work.
