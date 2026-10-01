# Pressure Up homepage preview — continuation checkpoint

## Source of truth and safety

- Repository: `lolitsedgy-debug/pressure-up`.
- Continue only branch `preview/reference-rebuild-2026-09-30`.
- Base: `3a150b4938f04e3f93a8802f9afc1815b6d6a794` (`main` and `pressure-up-v25-checkpoint` when inspected).
- Do not merge, promote, deploy to production, change DNS, or change Supabase without explicit authorization. The owner requires the literal approval PUBLISH before production release.
- Homepage only. Estimate and owner/admin redesign are deferred.

## Work preserved

Compact navy homepage, approximately 350px mobile hero, right-side owner poster, left-side requested copy, pale blue emphasis, muted slate CTA, real house comparison, four-service strip, compact local card, and smaller About Me below Local.

The original `homepage.css`, `styles.css`, estimate markup, app.js, business logic, owner routes, API routes, Supabase code, schema and security settings are unchanged. `homepage-reference.css` is enabled only on the active landing screen and disabled when leaving it, preserving original estimate styles.

## Exact media

| Public asset | Supplied source |
| --- | --- |
| `/legacy/assets/logo-dark.png` | Existing real Pressure Up logo from main |
| `/media/owner-edgar.jpg` | Owner portrait embedded in supplied Preview V4 HTML; used as media only, not a layout target |
| `/media/house-before.jpg` | `IMG_0707.jpg` |
| `/media/house-after.jpg` | `IMG_0708.jpg` |
| `/media/hero-1.mp4` | `d11cec0ed8bb61256c5234c8e5f6c7bf2a864d7e7b2530dafe33377b42e36d62.mp4` |
| `/media/hero-2.mp4` | `ba779bdacf05f014b48bb58330834be7f5af0ed0946884aa51b484d1150c01cf.mp4` |
| `/media/hero-3.mp4` | `a031abf4fada34ef64c9a0e25b5659dcabca88661de8afb9bca1ba7e0ac96094.mp4` |
| `/media/hero-4.mp4` | `3dfd2cd863148b0b3e6d61d7f7dc38f27bc53d5060158c9937da0ff677530f2f(1).mp4` |

All four MP4s verified H.264 Main, yuv420p, one video stream/no audio, moov before mdat (fast-start). No reconversion needed. Durations: 3.63, 5.03, 7.00, 10.03 seconds. Existing JS waits two seconds after the poster loads, starts video, crossfades two video elements, and cycles four clips. Reduced-motion preference keeps the poster; denied autoplay retains it and retries after interaction.

## Validation status and remaining work

Fresh Next build and TypeScript passed. Syntax and media metadata checks passed. Migration checks: 13/14 passed. The existing availability test expects `enabled=1`, but `lib/availability-data.ts` uses `enabled=true`; both files are byte-for-byte unchanged from main. Do not alter backend code for this homepage task. Repeat build/typecheck after further edits.

NOT visually approved or complete: actual rendered-reference comparison, portrait/video crop, perspective alignment of the two house photos, touch dragging, EN/ES/menu/estimate-navigation browser checks, horizontal overflow and desktop validation still require a working browser. The local browser failed because the workspace denied its socket operation. Codec validation is not a claim of actual iPhone/Safari playback.

Known visual difference: the local card currently uses simplified map linework, not the rich coastline treatment of the reference. Do not claim an exact match before rendering and comparing.

## Vercel blocker

Existing project `pressure-up`, ID `prj_dUZ5xMDGajiAoUC8GBafsdear71S`, team `team_aHcaniokWpUHMzCJrOwvZTJa` / scope `pressure-up`, linked account `pressureup.info@gmail.com`.

Project inspection returns 403: `Not authorized: Trying to access resource under scope "pressure-up". You must re-authenticate to this scope or use a token with access to this scope.`

No Git connection or project settings were changed. Git-to-Vercel automation is NOT yet confirmed. No new production project was created and no deployment or promotion was requested.

After access is restored, first inspect the existing Git connection, production branch, current production deployment, environment targeting and automatic deployment behavior. Do not connect the repository if that action could deploy or replace production without a safe, verified control. Only create a Preview Deployment for this branch. Verify a branch-alias URL and future branch pushes before claiming automatic preview updates.

## Next step

Reconnect Vercel with access to the `pressure-up` team. Then finish rendered browser comparison and homepage acceptance checks, preserving the current source and media. Do not proceed into estimate/admin redesign.
