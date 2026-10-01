# Invoice protections and draft-first Marketing Center

## Implemented
- Existing job ID and invoice line-item storage retained. Metadata and issued snapshots supplement that relationship; no duplicate invoice files on Save.
- Save Invoice / Saved / Edit Invoice / Save Changes controls. Paid edits blocked server-side. Optimistic tokens reject stale owner saves; job updates also compare payment, price, status and invoice state in a transaction.
- Invoice-only deletion requires DELETE DRAFT confirmation and a never-issued unpaid draft. It clears invoice items and restores the job's estimate value, retaining the real job/customer. No historical live data was deleted.
- Issued snapshots preserve line items, amount, customer/job data and public business contact at issue time. Preparing an invoice link conservatively protects that revision before manual sending. It does not send a message. Correction drafts increment revision; prior links resolve their original revision. Legacy issued invoices remain readable; pre-upgrade versions already overwritten cannot be reconstructed.
- Unpaid sent invoices may be voided with confirmation. Paid/issued history is protected from job-level deletion. Invoice-only deletion cannot erase legitimate booked work: remaining job/estimate values are not an invoice balance. Tax revenue still uses received payments.
- Owner Marketing menu: explicit per-file approval/revocation, business and CRM media selection, requested categories including Owner / Behind the Scenes, local caption/CTA templates, editable public location/service wording, queue, review and approval.
- Branded PNG preview/export: 1080x1350 post or 1080x1920 Story/Reel cover, existing Pressure Up P/green branding, up to the first two approved selected photos. Separate generated copies strip original photo metadata. Video exports retain approved original bytes and require owner privacy review; no video editing engine was added.
- Draft → Review → Approve → Export. Content edits reset Draft; unapproved/revoked or missing media blocks export. Export is not publication. Caption TXT and PNG/video files download separately for manual Meta Business Suite upload.
- Public campaign tokens in exported UTM links reuse existing first-party funnel attribution for estimate starts/bookings/booked value. Visits/reach/engagement remain explicitly unavailable, not zero or invented.
- Four bounded additive tables and their generated migration support only these features. Existing tables/data remain unchanged. Existing downloadable backup includes the added records. No new storage provider or infrastructure.

## Verified
- Production build passed.
- Isolated invoice tests: 20 saves on one record; stale update rejection; required delete confirmation; draft removal and no remaining PDF; estimate restored; customer/job preserved; unchanged cash/tax income; two sent revisions; customer invoice PDF remains issued version; paid edit/delete guards; void/payment guards; simulated delayed unpaid snapshot cannot overwrite a paid job.
- Isolated Marketing API tests: owner authorization, explicit media permission, workflow transition guards, editing resets approval, stale post guards, revocation blocks export, originals unchanged, campaign links without customer identity, owner caption template, unavailable metrics.
- Existing control-center regression suite: booking/calendar/customer consolidation/photos/cash/PDFs/editor/tax, 3,024 pricing combinations.
- Existing smart-assistance regression suite: photos, receipts/OCR review, duplicate expenses, funnel and cost calculations.
- Static production public dependency graph excludes Marketing/editor/OCR/reporting code. Framework entry closure 274,336 bytes (84,676 gzip); no public booking-script changes in this batch.

## Manual iPhone verification still required
- New invoice → save → reopen/edit → delete only an intentionally disposable unsent draft. Check issued revision PDFs and their native Share/Files behavior.
- Approve one safe photo, create draft, preview, review/approve, download TXT and branded PNG; select approved video and test video download/upload separately.
- Check photo format decoding (especially HEIC), iPhone download behavior and canvas layout. Browser/device visual QA was not performed in this batch; backend and build checks do not establish it.
- Meta scheduling/posting, video assembly, final caption/privacy checks and external analytics remain manual. No Meta OAuth, automatic social publishing, passwords, paid API, Stripe/Twilio/Maps configuration or DNS changes.
