# Smart assistance batch — 2026-09-08

## Resumed state
Uncommitted local photo-quality checks, coverage prompts, Tesseract 7 browser assets/English data, migration 0010 and receipt matching helper were present. Existing published application was the Owner Control Center batch. Continued those changes; no schema replacement or record reset.

## Finished
- Local browser receipt extraction with field-level review flags from recognized line/word confidence, editable vendor/date/total/category and optional subtotal/tax/items. Explicit owner review required for receipt-backed expenses.
- Receipt originals stored byte-for-byte with SHA256; dHash plus vendor/date/amount matching; duplicate acknowledgment and submission idempotency. Original file retained when OCR fails. Temporary canvas copies are memory-only, object URLs revoked and worker terminated; OCR cache writes disabled. Nothing is sent to a paid service.
- Background first-party estimate starts, submitted/generated stages, confirmed/completed/paid job events and manually confirmed estimate dispatch. Job linkage retains lead source and campaign. Draft communication does not count as sent. Source is optional, including translated Spanish labels.
- Owner Books > Leads & advertising: simple totals with optional funnel/source detail; ad-spend entry/edit; date allocation; ROAS and recorded-cost ROI. ROI excludes unallocated overhead and unrecorded costs and is clearly labeled. Totals use actual paid amounts. Spend entries are marketing records, not duplicate bookkeeping expenses.
- Existing backup includes new records; receipt evidence stays in existing private receipt storage.

## Verification performed
- `node tests/smart-assistance.mjs`: isolated SQLite/R2 test double; conservative image warnings; nonblocking upload logic; parsing; field-specific uncertainty; category; explicit review; manual financial correction; duplicate/acknowledgment/similarity; idempotent saving; exact original receipt bytes; first-party events; source/campaign persistence; scheduled/completed/paid job linkage; ad-spend entry and retries; ROI/ROAS arithmetic; date filters; owner API access controls.
- `node tests/ocr-local.mjs`: actual installed Tesseract.js 7 using bundled English model read the synthetic receipt fixture. Vendor/date/subtotal/tax/total and two line items matched; source SHA256 unchanged. No external OCR service.
- `node tests/control-center.mjs`: existing customer matching/history, booking/calendar, originals, cash, documents, editor, tax exports, and 3,024 unchanged pricing combinations passed against isolated data.
- Eight availability/recordkeeping tests passed.
- Cloud browser public flow: dark PNG produced friendly warning; close-up selection requested a wide view; Continue remained usable; public intake reached a $120 driveway estimate. Development hot reload reset the page before the final reservation-button check. No live customer records created.
- Production build passed. Standalone tsc still reports existing missing Cloudflare environment type declarations and related implicit-any errors; it is not a clean independent type-check gate.

## Performance findings
Production static import closure: shared entry/runtime/framework 274,116 bytes (~84,627 gzip). Shared global CSS ~157,730 bytes (~23,704 gzip). These remain the largest common assets, rather than OCR. No earlier iPhone timing baseline was available, so a historical loading regression cannot be attributed conclusively.

The public legacy booking script fell from 66,256 to 33,206 bytes by moving obsolete owner-prototype code into source documentation; current authenticated Owner View is intact. Homepage no longer requests availability before the booking screen needs it. First-party tracking does not wait on the critical estimate path. OCR assets are approximately 27 MB on disk across six alternative cores, but only the selected core and English data are requested when a receipt is read. Heavy owner UI is split by route; the expense form and OCR loader are lazy. Tesseract assets are excluded from Tailwind scanning.

## Manual checks still needed
- Owner receipt upload, local worker startup, cancellation/retry, correction/checkbox/duplicate confirmation, and saving on a real iPhone, especially slow/low-memory devices.
- Review the new owner reporting screen at iPhone widths. Browser Owner View authentication was blocked in the prior QA environment; no authentication bypass was introduced for this pass.
- Faded, angled, crumpled or unfamiliar receipts can require manual entry. PDF receipts attach normally but are not OCR-read. Framing/coverage guidance uses conservative pixel checks and owner/customer labeling, not semantic AI scene recognition.
- Real mobile network timing was not measured; bundle findings are static production output plus a public browser smoke test, not a Lighthouse/Core Web Vitals certification.

DNS, paid services, secrets, authentication infrastructure, Stripe, Twilio credentials, Maps and external backup providers were not configured or changed.
