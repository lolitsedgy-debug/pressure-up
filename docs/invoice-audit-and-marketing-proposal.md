# Invoice audit and Marketing Center proposal — 2026-09-09

This is an audit/proposal, not an invoice or marketing implementation. The already-authorized smart-assistance batch was deployed separately as version 16. No DNS, paid service, credentials or account permissions were changed.

## Invoice storage and repeated Save
- Database: existing D1 binding DB, `jobs` table. `invoice_json` holds the invoice line items; `price` holds its total. There is no separate invoice table or collection of PDFs. The stable underlying invoice identity is the job UUID; the visible PDF reference uses its first eight characters. Customer linkage is `jobs.customer_id`; payment fields are `paid_at`, `paid_amount`, `payment_method` on that same row.
- First invoice creation copies `estimate_json` into `invoice_json` on that job. Completion also prepares the invoice if empty. Subsequent `document` actions execute UPDATE of that existing row.
- PDFs: owner `/api/owner/documents?id=JOB&type=invoice` and customer token-scoped document route load the job and call `jobDocument` / `printResponse` / `makePdf`. Binary is produced in request memory with application/pdf and .pdf disposition. It is not written to D1 or R2. R2 holds uploaded job media, website media and expense receipts, not generated invoice PDFs. Save itself does not generate a PDF. Separate downloads may create additional copies on the owner's own device.
- Test: 20 repeated invoice saves retained one job and invoice payload/customer link, with no added R2 objects. Five PDF generations retained the same filename and added no persistent files or records. Second copy-to-invoice request correctly returned a conflict instead of duplicating.
- This proves current workflow behavior. Live production customer records were not retrieved. No specific live records have been confirmed to be disposable test duplicates; none were removed.

## Gaps found
- Owner View says "Invoice saved" but retains an always-editable form and Save button; there is no explicit Saved / Edit Invoice / Save Changes state machine.
- Sent invoices are mutable. Test confirmed invoice editing succeeds even when job status is Invoice sent. Customer document URLs render current data rather than the exact sent revision.
- No invoice-only draft deletion action exists. "Delete duplicate" deletes the job and its media/notifications subject to financial-history checks; it is not a safe substitute for deleting only an invoice.
- Paid invoice edits and job deletion return conflict responses during normal sequential use; payment and customer/job records survive. However, the document UPDATE is not guarded with `paid_at IS NULL`, so a concurrent payment/edit race merits a targeted conditional-write fix.
- There is no reliable permanent "test invoice/job" flag. Old test jobs cannot be safely identified merely from low prices, similar names, duplicate-looking descriptions or repeated saves.
- Received income/tax reports use actual paid values; booked/unpaid dashboard cards use job status and job price. Deleting only a draft invoice must not inadvertently erase a legitimate booked job or rewrite a prior payment. Deleting confirmed test data requires explicit identity and review of all relationships.

## Recommended bounded invoice repair (not implemented)
1. Keep job/customer/payment architecture. Add stable full invoice identity/reference and draft state/revision metadata; migrate existing invoice payloads without copying jobs.
2. In-place idempotent draft save with expected revision and paid/sent guards in the actual UPDATE; Saved ✓, Edit Invoice, Save Changes UI and unsaved-edit warning before sending.
3. Freeze a snapshot of the exact invoice, business details and revision when preparing a send. For manual sending, conservatively protect that snapshot when the customer-facing link is prepared, then offer explicit sent/cancelled-draft confirmation. Sent corrections create a numbered revision and preserve the old document/link.
4. Invoice-only deletion only for explicitly identified unsent/unpaid drafts, with confirmation and no customer/job deletion. A distinct test-job cleanup workflow should exclude confirmed test data from booking/analytics totals without touching real work. Paid or financially linked history stays protected.
5. Test repeated save, concurrent edits/payment, sent correction, draft-only deletion and all revenue/report/customer associations before deploying a repair.

## Marketing options audit
Primary sources checked on 2026-09-09:
- https://www.facebook.com/business/tools/meta-business-suite — Meta describes Business Suite as free.
- https://www.facebook.com/business/learn/lessons/introduction-meta-business-suite — Meta describes planning/scheduling/publishing posts, Stories and Reels.
- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login — professional Business/Creator accounts; no Facebook Page linkage required for this API route.
- https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login — alternative Page-linked professional-account route; Stories are restricted to business accounts on this route.
- https://developers.facebook.com/documentation/instagram-platform/overview and /insights — Standard Access for owned/managed accounts versus Advanced Access for other people's accounts; supported professional-account insights.
- https://developers.facebook.com/documentation/instagram-platform/api-reference/instagram-user/insights — insights permissions/data.

Some direct documentation opens were blocked or login-gated; findings above rely on indexed official documentation snippets. Current detailed permission review, format/rate limits and all-in operating costs must be verified in the real Meta developer account before connecting. No exact API fee schedule was verified; do not promise a guaranteed zero-cost direct automation service.

| Approach | Cost established | Fit |
|---|---|---|
| Pressure Up drafts/approved export + Meta Business Suite | Business Suite $0; local templates need no paid AI API; existing hosting/storage still apply | Practical free-first initial workflow; owner does final upload/schedule in Meta |
| Direct official Instagram API with Instagram Login | No per-post fee identified in accessible official material; no verified all-in quote | In-dashboard approved posting and insights; requires owner-authorized OAuth, developer app, permissions and reliable scheduling support |
| Official Facebook Login route | Same unquoted hosting/processing costs; not activated | Useful if managing a linked Facebook Page and Instagram Business account together |

Paid advertisements are separate, optional budget decisions. An AI-caption provider, rendering service or social scheduling vendor is not necessary for the initial draft/export phase and would require a separate priced approval. No passwords should be stored; future authorization must use Meta OAuth with tokens kept server-side.

## Concrete first Marketing Center slice for approval
Five simple owner screens: Ideas, Approved media, Content queue, Preview & approve, Results. Advanced controls collapsed. All chunks owner-only/lazy.

- Per-asset "Approved for Marketing" records with approval/revocation time, owner and job/media relation. Customer/job originals stay private. Approval is not inferred from completion, upload or prior website use. A publish checks current approval again; changing content/media invalidates post approval.
- Exported marketing copies remove embedded location metadata; captions omit names, addresses, phone numbers and other customer identifiers. Owner checks identifying details visible inside images before approval.
- Use existing job before/after groups and local quality scores to suggest technically strong candidates; do not promise semantic scene understanding. All media choices remain reviewable.
- Free template-based caption variations use confirmed service, owner-selected public city/area, Pressure Up wording, approved business facts and a booking call to action. Hashtags vary by service and area. No invented reviews, results, guarantees, discounts or prices.
- Include all requested content categories, especially Owner Content: Edgar in uniform, arrival, equipment setup, short explanations and finished-property walkthroughs. Rotate these with before/after, satisfying cleaning, tips, commercial/residential, reviews, equipment/process and promotions. Promotions/prices/reviews always need explicit approval of the exact wording.
- Branded still-image layouts/cover exports use approved logo/emblem, colors and owner-confirmed tagline. Preserve originals. Distinguish actual videos from still covers; do not label a still graphic as an automatically produced Reel. Video rendering/assembly needs a separate feasibility check for the current constrained hosting/mobile environment.
- Draft → Review → Approved → Export / manually scheduled. Until an official connection exists, Schedule means a content-calendar plan, not a promise a post will automatically publish. Store actual publication link/ID when confirmed. Never show failed/draft material as published.
- Per-post public tracking token in UTM links; extend the current funnel with post ID and website-visit stage, retain campaign/source on jobs, and count actual payments. No private customer/job IDs in marketing URLs. Website-only tracking misses unclicked views, changed devices and some Instagram journeys; do not claim all post-to-sale attribution.
- Simple results: actual published posts, tracked visits/estimate starts/booked jobs, booked value versus received money, manually recorded ad spend. CAC = spend / attributable new paying customers (deduplicated customers); ROAS = attributable receipts / ad spend; ROI explicitly identifies which recorded costs are included. Show unavailable Meta metrics as unavailable, never zero placeholders.
- Later direct API connection: encrypted server-side tokens, account ID, explicitly approved permissions, documented token refresh/revocation, media derivatives accessible to Meta only as needed, scheduled publish job with idempotency, retries and publication status reconciliation. Reach/engagement remain dependent on API/account support.
- Autoposting remains off. Any later permission is per content category, revocable, with an emergency stop; discounts, prices, reviews, customer details, sensitive subjects and unusual claims stay owner-approved.

No Marketing Center application changes or integrations have been built or activated. This proposal is ready for owner approval. Live invoice duplicate identification needs the actual selected test records before any deletion.
