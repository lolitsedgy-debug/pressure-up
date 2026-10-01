# Pressure Up V25 — Homepage Redesign
Date: 2026-09-27

## Implemented
- Rebuilt the public mobile homepage around the approved photo-first design direction.
- Pressure Up blue/navy brand system and supplied logo assets are used in the public header.
- Hero copy is now concise and lead-first: “A cleaner property starts with a photo.”
- Primary `Get My Estimate` CTA has no calendar icon or arrow and uses restrained glassmorphism with a tactile press animation.
- `EN | ES` glass language control now visibly highlights the active language.
- Language control cross-fades between monochrome U.S. and Spain flag treatments when language changes.
- Hamburger menu is functional and includes estimate / before-after / local-work navigation.
- Before/after comparison and service controls are merged into one glassmorphism module.
- Before/after slider is interactive.
- Driveway / Patio / Siding / Roofs / Commercial controls are tappable and launch the existing estimate flow with the corresponding service preselected.
- Removed the separate “Driveway restoration” homepage block to reduce clutter.
- Added a compact local-work section with tappable job pins.
- Added automatic light/day and dark/night visual modes using the browser’s local time.
- Public CMS data still populates the estimate/service engine, while the approved public hero design is protected from being overwritten by older CMS hero content.

## Runtime fix included
- Updated `availability_rules.enabled=1` to PostgreSQL boolean syntax `enabled=true`.
- Updated the local TypeScript rule shape from numeric to boolean `enabled`.

## Validation
PASS:
- `public/legacy/app.js` syntax check with Node 22.
- `public/legacy/website-content.js` syntax check with Node 22.
- Landing HTML structure check: estimate CTA, language control, 5 service controls, and before/after slider all present.
- Production code sweep confirms no remaining `enabled=1` availability query.

NOT VERIFIED LOCALLY:
- Full Next.js production build. `npm ci` did not finish in the container before the execution timeout, leaving an incomplete dependency install, so the exact Vercel build still needs to be the production proof.
- Final browser visual QA should be done on the Vercel preview on the user’s iPhone.

## Important
- Existing Supabase / auth / booking / estimate architecture was not replaced.
- No TypeScript checks were disabled.
- No security settings were weakened.
