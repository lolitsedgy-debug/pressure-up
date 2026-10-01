# CAN PRESSURE UP LEAVE CHATGPT?

Audit date: September 9, 2026. Read-only review of deployed-version source b0128c4300f7586945f65f531091ccf3c497fb6d and the live database's table inventory. No production rows, files, secrets or DNS were changed. No backup was downloaded or restored. No new storage, retention task, authentication, service or migration was implemented.

## Decision

Yes, Pressure Up can be moved with engineering work. It is not presently a tested, one-click, independently runnable migration package. You do not need to recreate the design, re-enter customers or intentionally change business IDs. A safe move today requires complete exports, an independent owner login, hosting adaptation and a successful isolated restore before cutover. Those tasks remain undone.

You control the business content and have owner access to its application, records and source through Sites. You own pressureup.info at Namecheap. Source exists in a Git repository, but it is hosted under Sites control; this audit does not establish that you have a separately saved independent clone. Sites controls the current deployment pipeline, platform-hosted repository access, routing/HTTPS integration, Cloudflare resource credentials, and trusted ChatGPT sign-in context. Physical data region and platform billing entitlement are not exposed.

No verified official policy retrieved in this audit establishes how long this site's hosting, data or sign-in would remain available if a ChatGPT subscription/account stopped. Do not treat continued login or an open browser session as an independence guarantee.

## Where things actually live

| Information | Current location and behavior |
|---|---|
| Customers, jobs, appointments, line items, payments, expenses, trips, messages, content, analytics | Cloudflare D1, SQLite-compatible, logical binding DB, managed through Sites. The native live overview confirms 27 application tables. Customer/job IDs and relationships are stored here. No measured row counts or byte usage were exposed. |
| Customer/job original photos and videos | Cloudflare R2, binding BUCKET, object keys under jobs/{jobId}/…; media rows link each stable media ID to its job and original object key. Originals are not stored as database image blobs. |
| Unsubmitted estimate photos | Original File objects and preview URLs in the customer's browser tab. The estimate endpoint receives selections and a photo-submission flag, not photo binary uploads. Photos reach R2 when the customer submits the appointment request. Closing the page loses this unsubmitted selection. |
| Submitted but unconfirmed requests | Stored as jobs and media. These can persist even when never confirmed. They are the meaningful target for an abandoned-request policy. An anonymous estimate_funnels row is not a durable photo-bearing lead record. |
| Original receipts | R2 receipts/{expenseId}/…; expenses reference the object, original SHA-256, optional similarity hash and reviewed OCR data. The processing copy does not replace the source. |
| Invoice/estimate/report PDFs | Generated on demand with pdf-lib in server memory and streamed. Repeated Save does not store PDFs. Issued invoice revisions preserve job/contact/line-item snapshots in D1, not separate PDF files. Regeneration need not be byte-identical because PDF creation metadata changes. Uploaded PDF receipts are stored original files. |
| Website library | R2 website/{mediaId}, metadata in website_media; website_public_media is the public allowlist. Archived library media remains stored. Draft/version content can continue referencing old media. |
| Owner profile picture | R2 business/owner/{UUID}, current reference in business_settings. Replacing it creates a new key; this path does not delete the old key. Older originals can become unreferenced. |
| Thumbnails | Separate R2 objects referenced by thumbnail_object_key / thumbnail_key, typically JPEG previews no larger than 640 pixels on the long side. They do not replace originals. |
| Temporary OCR/analysis copies | Browser memory/canvas and a local browser worker. Receipt OCR terminates the worker and clears its derived canvas on finish/cancel/timeout; decoder URLs are revoked; Tesseract persistent language-data caching is disabled. Bundled OCR engine/language files are static application assets, not customer evidence. |
| Marketing exports | PNG copies are generated in the owner browser; text/video downloads go to the owner's device. No generated export files are persisted in R2 by Marketing Center. Queue/approval metadata remains in D1. |
| Current full backup | On-demand streamed TAR download containing records.json and referenced files. Not a scheduled independent backup, and not stored automatically somewhere else. |

Application-enforced limits (binary units, although the interface says MB): customer requests allow up to 8 originals, 25 MiB each, 50 MiB combined; the content-length guard is 52 MiB. Owner job uploads allow 25 MiB per file. Website photos allow 25 MiB; profile picture and receipts allow 10 MiB. Submitted thumbnail size is limited to about 500 KiB (512,000 bytes). Receipts accept JPG/PNG/WebP/PDF; profile photo accepts JPG/PNG/WebP. Customer/job intake supports the declared JPEG/PNG/WebP/HEIC/HEIF/AVIF/GIF and MP4/MOV/WebM types. Legacy JSON photo intake has a separate approximately 3 MiB decoded-image ceiling. Infrastructure may impose additional limits not visible in application code.

### What is not exposed

Actual D1 bytes, R2 bytes/object count, archive bytes, orphan-file bytes, geographic region, remaining allowance, Sites storage quotas, Sites bandwidth/egress allowance, overage rules, plan thresholds, provider backup retention and retention after account closure are **unknown**. Existing media metadata does not store byte sizes, so it cannot supply a trustworthy storage total. Local source/build size is not live business-data usage. No access to the underlying Cloudflare billing dashboard or complete R2 inventory was supplied.

Cloudflare publishes its own D1/R2 plan limits and rates, but these are not evidence of the allowance or billing terms assigned by Sites. Obtain the site's actual entitlement from Sites support/settings before relying on a storage ceiling. A future owner inventory can sum object HEAD/list sizes and label its timestamp and coverage, but that functionality was not added here.

## Growth model, with explicit assumptions

Planning example, decimal GB: 100–300 **submitted appointment/estimate requests** per month, four 3 MB originals per request; 30% later confirmed; six extra 3 MB before/after photos per booked job; 20% of booked jobs get two 20 MB videos; 20 receipt originals at 2 MB each; 0.1 MB thumbnail per photo. These are planning assumptions, not measurements of your files or conversion rate. If 100–300 means only people starting estimates, current server photo growth will be lower because unsubmitted photos are not stored.

| Scenario | Approximate storage growth |
|---|---:|
| Store every submitted request forever | 2.1–6.2 GB/month; 25–74 GB in year one |
| Keep booked-job originals; delete truly abandoned requests after 60 inactive days | 1.2–3.6 GB/month of durable records/media, plus a rolling roughly 1.7–5.2 GB abandoned-request pool; about 16–48 GB after year one |
| Same request count but each request hits its existing 50 MiB maximum | Request uploads alone: about 5.2–15.7 GB/month, before owner media and receipts |

Website images, unusually many videos, repeated profile replacements, backup versions and unknown existing usage are additional. Original phone video will usually change this forecast more than receipt OCR or database rows. In the no-cleanup baseline, another 10 GB arrives in roughly 2–5 months. This is a **planning milestone, not a verified Sites limit or shutdown date**. Review usage monthly; plan independent recovery now rather than waiting for a quota alert.

## Retention design — not activated

Use 60 days after explicitly established inactivity for an unbooked request, with an owner-visible warning at day 45. Do not infer abandonment merely from an old upload date or Requested status: require last meaningful activity, no future appointment, and a closed/inactive decision. Before deletion, recheck that the request never became legitimate booked work and has no received payment, issued invoice, dispute/documentation hold, linked business expense, deliberately approved portfolio use, or other retention reason.

Conversion keeps the same customer/job/media IDs and object keys; changing request to confirmed already need not duplicate photos. Future pre-booking lead storage should similarly reassign/reuse references, not copy originals. Protect booked-job records/photos, receipt evidence and selected portfolio media from this short lead cleanup. Determine their separate long-term retention policy with the business's documentation requirements; this report does not prescribe a tax/legal retention period.

A later cleanup implementation should first produce a dry-run list with reasons and byte counts; allow Keep and Review; use small idempotent batches; recheck state immediately before deletion; maintain a minimal deletion journal without retaining deleted picture contents. Shared/portfolio references and historical website-version references must prevent accidental deletion. Backups must eventually expire deleted lead media too; restoring an old backup must reapply deletion tombstones before becoming active.

Technical transient artifacts should expire quickly: keep OCR processing in memory, explicitly release all preview URLs and canvases, and investigate uploaded-but-uncommitted object keys only after a grace period and reference checks. Current receipt cleanup is implemented; public restart drops the photo list without explicitly revoking every old preview URL, so memory can linger until page unload. This is browser memory, not ongoing R2 accumulation. Upload failure cleanup is best effort; its existence does not prove there are no orphan objects. Profile replacement is a concrete potential orphan path. No orphan was deleted in this audit.

Archive should initially mean preserved, rarely viewed business media, still at original quality and reachable from the job. There is no separate archival storage tier now. Moving to a cheaper cold tier is unnecessary at the forecast volume until actual savings outweigh retrieval/retention complexity. An archive is part of business history; it is not an independent recovery copy.

## Portability map

| Portable with little/no business-level change | Needs replacement/adaptation |
|---|---|
| React UI, public HTML/CSS/JavaScript, images, text, estimator/pricing rules | vinext/Vite Cloudflare Worker build and Sites deployment wiring must be deployed independently or adapted for a different runtime |
| Stable UUIDs, SQLite-oriented schemas/migrations, JSON snapshots, CSV exports | D1 binding/API and Drizzle D1 adapter need newly owned resources or a SQLite/Postgres adapter; D1-specific batch/changes() behavior requires tests |
| Original media bytes and reference manifest | Sites-controlled BUCKET binding, object access routing and file inventory must point to owned storage; maintain private access checks |
| Local Tesseract assets, licenses, receipt parser and photo-quality code | Runtime environment configuration and provider secrets must be installed securely on the target |
| PDF generator and business rules | Existing owner checks trust Sites-injected headers and ChatGPT sign-in routes; they cannot be exposed unchanged on an untrusted internet server |
| Domain ownership at Namecheap | DNS routing/HTTPS provisioning and generated .chatgpt.site URLs are platform-managed; old hosting URLs cannot simply be taken with you |
| First-party analytics data and marketing queue | Background scheduling/retries/retention/independent backups need a real scheduler if enabled; current Worker exposes fetch, not a scheduled cleanup/backup handler |

No separate pressure-washing owner password/passkey/session database exists today. Owner sign-in relies on trusted Sites email headers and a hard-coded owner email checked in several routes/pages. On a new deployment, implement a verified session layer, strip/reject spoofed identity headers, and authorize a stable owner account ID. Support verified business email, passwordless or securely hashed passwords, account recovery, passkeys/TOTP, recovery codes stored hashed, a session/device list and revocation. Email-change verification must preserve the same owner ID. Existing ChatGPT sessions cannot be migrated; enroll and test the new owner account before cutover. This is a design, not authentication work performed now.

Future development should keep business rules independent of hosting helpers, document object references, use standard exports and adapters at new integration boundaries, and never use an owner email as a customer/job primary key. No broad refactor is required simply to prepare this plan.

## Backup assessment and blockers

The existing owner-only backup is useful: all 27 current application tables are listed, and the manifest maps file paths to original object keys. Records then supply job/customer/expense relationships. It includes originals and separately referenced thumbnails. It does **not** include source, dependency lockfile, schema/migration files, deployment configuration or restore tooling. A separate source export is required. Unreferenced R2 files, including possible replaced owner pictures, are not included.

**Sensitive-token gap:** raw job records contain manage_token customer-access capabilities. Issued snapshots and notification message links can also contain those tokens. Although environment API keys/passwords are not deliberately exported by this endpoint, the ordinary TAR is therefore not free of private tokens and is not encrypted. Do not treat it as a nonsensitive archive or share it. No such backup was generated in this audit. A redesigned ordinary export should redact capabilities recursively, including embedded URLs. A separately encrypted, access-controlled migration secret bundle could preserve only genuinely necessary capabilities, or new tokens can be issued with a plan for replacing old customer links. Existing historical PDFs/snapshots must not be silently rewritten to conceal changes; keep evidence in the protected recovery package.

Other gaps: there is no demonstrated restore into a fresh deployment; no whole-file checksum manifest (receipt hashes alone are insufficient); no single consistent snapshot across the sequential table reads; all record JSON is constructed in memory; a large backup can be interrupted or exceed runtime limits; no independently verified last-backup time or completeness marker; no independently scheduled destination. A download that finishes or starts is not proof of restorability.

## Proposed Settings → Data & Backups

Four obvious choices: Export Business Data; Export Files; Create Full Migration Package; Backup Status. Add a collapsed Storage details area showing measured active bytes, archived bytes, temporary candidates and next proposed cleanup, with last-inventory time. Show Unknown where measurement is absent; never show a reassuring zero. Cleanup stays off until reviewed and approved.

Ordinary business export: documented JSON plus useful CSV, stable IDs and redacted access capabilities. Files export: originals, optional rebuildable thumbnails, relationships.csv/json, byte lengths and SHA-256 checksums. Full migration package: source commit and source archive/Git bundle, dependency lockfile/licenses, complete schema/migrations, a consistent records snapshot, original files/manifest, sanitized configuration template, platform-adaptation and restoration instructions. Secrets are separate, encrypted and under owner control. No plaintext API/auth/backup secrets in the ordinary package. Backup Status distinguishes last download, last independently stored backup and last verified restore.

## Independent recovery recommendation and costs

Start with encrypted copies on an owner-controlled computer plus an encrypted off-site repository under an independently recoverable account. An existing drive with enough capacity has no incremental subscription cost; a copy kept only on the same phone or hosting account is insufficient. For eventual automation, a computer/independent runner pulls a consistent export through a dedicated scoped backup identity and backs up files individually, with encrypted deduplication, to an external provider. No such identity or service was added now.

Suggested first external provider: Backblaze B2 in your own account, outside the primary Cloudflare/Sites environment. Published base storage is $6.95/TB/month with the first 10 GB free. Approximate storage-only examples: 50 GB $0.28/month; 100 GB $0.63; 500 GB $3.41. Egress beyond the included 3× average stored amount costs $0.01/GB, subject to provider terms; applicable operations/taxes may add cost. These are backup-storage examples, not a quote for migration labor, a managed backup service or hosting. [Backblaze pricing](https://www.backblaze.com/cloud-storage/pricing)

An owner-controlled R2 account is an alternative with independent account control but less provider diversity: 10 GB-month Standard allowance, then $0.015/GB-month; storage-only 100 GB about $1.35, 500 GB about $7.35, before operation charges beyond free allowances. R2 direct egress is free. These are direct-provider prices, **not current Sites entitlements**. [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)

Restic is a free/open-source candidate for encrypted incremental backups and restore checks on a computer/runner, not an iPhone-only automatic solution. [Restic](https://restic.net/) [Documentation](https://restic.readthedocs.io/en/stable/010_introduction.html)

Planning policy: daily incrementals, 7 daily and 4 weekly recovery points, plus 12 monthly business-record snapshots; exclude short-lived abandoned media from long-term snapshots after its deletion window. Deduplication avoids keeping 30 full identical media archives, but does not guarantee a particular multiplier. Budget roughly 1.5–2 times current retained media initially and measure actual version growth. A 50–100 GB independent store is a reasonable first planning envelope; video and retention choices can exceed it. Keep encryption recovery material separately. Proposed recovery objectives: at most one day's lost changes, recover within one business day, subject to a timed restore rehearsal. Neither objective is met by a verified mechanism today.

## Restore procedure to implement and rehearse later

1. Select a known-complete encrypted recovery point. Verify archive integrity, every file checksum/size, table row counts, schema/source versions and exclusions. Reject incomplete downloads. Protect the old production site throughout.
2. Create a fresh isolated target under owner control. Restore the pinned source/lockfile and licenses; adapt hosting/auth/storage configuration without exposing secrets. Use the matching schema migrations exactly once.
3. Import customers and parent tables, then jobs and dependent records in foreign-key order or a verified deferred transaction. Preserve UUIDs, timestamps, invoice revisions, merge relationships, trip links, expense links and analytics campaign IDs. Do not regenerate business identities.
4. Restore file bytes under the same keys, or apply a documented old-key → new-key map to every relevant reference, including website versions and owner photos. Verify referenced files exist and private/public access rules still hold.
5. Recreate secrets securely. Needed where used: owner-session signing/encryption secrets, storage/DB credentials, email delivery credentials, backup encryption material, optional Maps key, Twilio credentials/webhook configuration, and any future Stripe/Meta credentials. Do not extract or migrate ChatGPT session credentials. Handle private customer links through the protected migration-token plan.
6. Verify owner recovery/2FA/sign-out, inaccessible private media, customer-scoped links, booking/calendar, PDFs and issued versions, cash totals, expenses/receipts/mileage, analytics and file hashes. Compare counts and monetary totals to the snapshot. Restore deleted-lead tombstones so expired material does not reappear.
7. Only after the independent rehearsal succeeds, plan a short write pause/final incremental export, final validation, HTTPS and a separately authorized DNS cutover. Account for old .chatgpt.site links in messages: ownership of pressureup.info does not grant control of that old hostname. Keep rollback viable without accepting divergent bookings in both systems.

## Next decision

No migration is needed now. The next bounded implementation, if authorized later, should be a secure consistent export plus a demonstrable isolated restore, followed by independent encrypted backups. Storage inventory and dry-run retention can follow. Until these are complete, the missing verified recovery path—not proven storage exhaustion—is the most meaningful business-continuity concern.
