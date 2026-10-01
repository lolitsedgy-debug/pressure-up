# V23 build fix

Vercel V22 compiled successfully, then TypeScript failed in `app/owner/bookings/client.tsx` because the estimate-only JSX branch still compared `tab` to `invoice`, an impossible comparison after TypeScript control-flow narrowing.

Fix:
- Removed the unreachable invoice conditional from the estimate-only branch.
- Preserved the separate InvoiceEditor path already used for `tab === invoice`.
- Re-scanned app/lib for remaining Cloudflare runtime and Drizzle runtime imports; none found.

Validation limitation:
- Local `npm ci` timed out in this environment, so the exact Next.js production build could not be executed here. Vercel remains the authoritative build validation.
