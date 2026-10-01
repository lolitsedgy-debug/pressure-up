# V24 — strict TypeScript / Vercel build milestone

Date: 2026-09-27. Package: `24.0.0-migration.5`.
Baseline: the attached `Pressure_Up_WEBSITE_v23_BOOKINGS_TYPE_FIX_2026-09-27(1).zip`.
Baseline SHA-256: `ec6c1ee1aa45e8667cda223673de7f61994486805ec7eaa02b9421955260c8e2`.

## PASS

- Clean `npm ci` completed using the synchronized lockfile, with lifecycle scripts enabled.
- Node **22.23.3**, Next.js **16.2.6**, TypeScript **5.9.3**.
- `npm run typecheck`: generated Next route types plus non-incremental strict TypeScript check, exit 0.
- `npm run build`: Turbopack compile, TypeScript, page-data collection, 39/39 static-generation tasks, and final optimization, exit 0.
- `node --test tests/migration-build.test.mjs tests/availability.test.mjs`: **19 passed**, 0 failed/skipped.
- Focused AST import checks cover production app/lib plus db/index; no legacy Cloudflare/Vinext/Drizzle runtime imports or unresolved relative imports. Client dependency graphs do not reach privileged server modules.
- Tests cover strict configuration, dependency/lockfile alignment, legal route exports, return-path safety, private storage size/bytes/MIME, typed-array offsets and SharedArrayBuffer conversion, no-overwrite uploads, fail-closed missing configuration, shared availability queries, real PDF generation, and OCR numeric progress/cancellation/cleanup with local fixtures.
- No live database/storage access, schema/RLS changes, deployment, DNS changes, outbound messages or paid calls were performed.

Evidence: `validation/npm-ci.log`, `validation/typecheck.log`, `validation/build.log`, `validation/targeted-tests.log`. Environment-level npm proxy/UNDICI warnings and inherited drizzle-kit dependency deprecation notices are retained, not hidden. Application compilation/type checking completed successfully.

## FIXED / IMPLEMENTED

1. **OCR callback typing:** JSDoc now describes `(percent: number) => void`; React's progress state setter is accepted without a cast or disabling checking. Runtime progress, cancellation and original-file handling remain unchanged.
2. **Strictness restored:** removed V22/V23's `noImplicitAny: false`. `strict: true` remains, with no `ignoreBuildErrors`, new blanket casts, or suppression comments. Existing legacy exclusions and skipLibCheck were not broadened.
3. **Next route export contract:** moved `availabilityRows` into server-only `lib/availability-data.ts`; public availability, booking and owner rescheduling share it without importing a route module. Queries are unchanged; row interfaces added.
4. **Reproducible install:** replaced the stale V18 lockfile with one matching this migration. Pinned Supabase SSR 0.7.0, Supabase JS 2.57.4 and Postgres 3.4.7 (versions named by the baseline), added server-only 0.0.1, kept Next 16.2.6, and constrained the deployment Node major to 22.x.
5. **Server/client boundaries:** explicit `server-only` guards on database, Supabase server-auth, privileged storage and availability data. Supabase admin membership checks, owner-email checks, private bucket and upsert=false policy preserved.
6. **Typed storage metadata:** replaced the untyped runtime environment surface with a named environment interface; restored downloaded Blob `size` required by TAR backup headers. Existing byte-copying for Blob/ArrayBuffer compatibility is retained and tested.
7. **PDF response bytes:** replaced `as BodyInit` with an actual ArrayBuffer-backed byte copy; generated PDF and response headers tested.
8. **Authentication return paths:** login, signout and auth links now share same-origin validation, rejecting protocol-relative/external/backslash/control-character targets. This closes an observed open-redirect gap without changing who may sign in or access data.
9. **Visible diagnostics/configuration:** added `npm run typecheck` and `npm run test:migration`; documented the existing `PRESSURE_UP_OWNER_EMAIL` setting and corrected the outdated Vinext body-limit comment.

`CHANGED_FILES.json` lists exact changes against V23. No UI redesign, database architecture change or unrelated runtime rewrite.

## NOT VERIFIED LOCALLY

- Vercel's hosted production deployment, environment scope, DNS and platform-specific packaging.
- Real Supabase credentials, SQL/RLS enforcement, private bucket access and authenticated end-to-end business workflows. The owner reports production setup is already complete; it was not reapplied or altered.
- Real-browser OCR/photo performance and live booking/invoice/media/backup flows. Unit tests use local fixtures; compile success is not live acceptance.

## KNOWN ISSUES

- **No remaining local compile/TypeScript blocker.**
- **Large uploads remain a runtime migration blocker:** the inherited routes accept multipart originals up to 10/25 MB (booking up to 50 MB total), while Vercel Functions enforce a 4.5 MB request-body limit. Raising Next's Server Action bodySizeLimit does not raise that platform limit. Keep current source limits intact; a later bounded milestone must implement an authorized direct-to-private-storage upload flow with server-side validation/finalization. Do not weaken bucket privacy or compress away original evidence as a workaround.
- The source still contains historical Cloudflare/SQLite tooling and old recovery proof, excluded from production execution/type checking. Those historical tools are not a Supabase production backup or restore proof.

## NEXT STEP

Upload/import **V24**, not the rollback V23 archive, into the existing Pressure Up Vercel project. Use the archive root containing package.json; Framework **Next.js**, Node **22.x**, Install **npm ci**, Build **npm run build**, Output **default**. Keep the existing Pressure Up Supabase environment values; never use Literature Desk credentials. The environment template contains names, not secrets.

Do not rerun historical SQLite migrations or recreate the already-configured Supabase project. First confirm the hosted build is green, then test owner login and a small-file booking against the existing Supabase setup. Complete the large-upload milestone and business workflow acceptance before final domain cutover. No hosted success is claimed by this archive alone.

Rollback: the separately supplied V23 ZIP is byte-for-byte identical to the attached baseline. No schema changes mean this checkpoint requires no database rollback; restoring V23 also restores its original build blockers. For operational rollback, retain the last working Vercel deployment/environment configuration, not merely an unbuilt source ZIP.

Efficiency: reused the V23 migration and existing security model; no architecture research, historical checkpoint audit, full app regression suite, or live-data scan was repeated. Only affected tests, a compiler/import audit and final clean-install/build checks were run.

## References used for compatibility checks

- https://nextjs.org/docs/app/api-reference/file-conventions/route
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://vercel.com/docs/functions/limitations
- https://vercel.com/docs/errors/function_payload_too_large

## Package integrity

All packaged files except the integrity list itself are covered by `INTEGRITY_SHA256.txt`. Build outputs, dependencies, npm cache, stale tsconfig.tsbuildinfo and private environment files are excluded. External `Pressure_Up_WEBSITE_V24_SHA256.txt` contains hashes for both ZIPs. Historical notes remain for provenance; this document supersedes their build/readiness claims.
