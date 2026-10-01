# Pressure Up Website V21 Build Fix

Date: 2026-09-27

## Fixed
Vercel V20 compiled successfully, then failed TypeScript checking because three API routes still imported the Cloudflare Workers runtime:

- `app/api/contact/photo/route.ts`
- `app/api/owner/uploads/route.ts`
- `app/api/owner/settings/photo/route.ts`

All three now use the existing Vercel/Supabase-compatible `lib/runtime-env.ts` adapter instead of `cloudflare:workers`.

## Validation
- Searched `app/` and `lib/` for remaining `cloudflare:workers` imports: none remain.
- Full Next.js production build still requires Vercel validation because dependencies are not installed in this sandbox.

## Next
Upload this V21 package to Vercel and deploy with Framework Preset = Next.js. Do not connect the custom domain yet.
