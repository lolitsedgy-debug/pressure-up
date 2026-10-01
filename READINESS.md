# V24 readiness — local build verified

`npm ci`, strict `npm run typecheck`, full `npm run build` and 19 affected tests pass. Upload V24 to the existing Vercel project with Node 22.x. Current details: **V24_MIGRATION_STATUS.md**.

Do not recreate the existing Supabase project or rerun old database migrations. Live workflow acceptance and large-upload adaptation remain necessary before final cutover.

## Historical V22/V23 readiness (superseded)

Status: migration candidate for Vercel preview only.

Next proof required:
1. Import/upload this V22 source to the existing `pressure-up` Vercel project.
2. Framework: Next.js; default install/build/output commands.
3. Run deployment build.
4. If build passes, configure Supabase/Vercel environment variables before runtime testing.
5. Test public estimator, lead capture, owner login, booking, media upload, and owner dashboard on preview URL.
6. Only then connect pressureup.info.


## V23
- Fixes V22 TypeScript impossible-comparison failure in owner bookings estimate branch.
- Awaiting Vercel build proof.
