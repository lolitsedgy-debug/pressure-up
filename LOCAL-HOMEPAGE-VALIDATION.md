# Local homepage update

The customer homepage keeps its existing Next.js iframe and legacy customer workflow. Only `public/legacy/index.html`, `homepage.css`, and `homepage.js` were changed or added. No backend, API, environment, pricing, database, storage, or authentication implementation was changed.

## Final media delivery

- `public/media/pressure-up-hero.mp4`: real 7–10 second silent loop showing the owner using a wand, surface cleaner, and residential wall rinse. Use subtle cuts, no baked-in text, and an MP4 compatible with mobile Safari. The hero uses autoplay, muted, loop, playsinline, no controls, and preload none. Reduced motion removes the source and displays the poster.
- `public/media/pressure-up-hero-poster.webp`: lightweight still from that footage, with room for text and action visible in a mobile crop. Existing hero artwork is cropped temporarily; it is mockup artwork, not verified job photography.
- `public/media/owner-edgar-pressure-up.webp`: real owner portrait with equipment in a residential work setting. The homepage stays text-only until supplied. Portrait space and responsive crop are prepared, with lazy loading and alt text.
- Replace the existing driveway comparison artwork with authentic matching before/after photographs before public launch. The supplied images contain mockup framing and are not verified project proof; the display crops reduce those artifacts.

## Validation results

- npm ci completed. Node 24.19.0 is installed; package.json requires Node 22.x. Repeat final release checks under Node 22.
- npm run typecheck: passed.
- npm run build: passed; all existing API and owner routes generated.
- npm run lint: failed with 398 errors and 2,186 warnings in existing files, including explicit-any backend types and vendored OCR bundles. Configuration was not weakened. New homepage.js separately passes ESLint and JavaScript syntax validation.
- npm run test:migration: 13/14 passed. Existing availability test expects enabled=1; the implementation uses enabled=true. Neither SQL nor security behavior was changed for this visual task.
- Local production browser: verified the real `/` route and its embedded homepage at 390, 430, 768, and 1440px. Document scroll width equals viewport width; CTA stays within viewport; four service controls have usable widths; map height is 360px on mobile and 380px on larger viewports; no broken image references or browser exceptions detected.
- English and Spanish CTA both open the existing estimate wizard. Comparison range input updates split to 72%. No live customer booking or record writes were performed.
- Actual video playback, footage cropping, and portrait cropping need final assets; real-device touch and Core Web Vitals measurement remain release checks.

## Later connection

After media delivery and baseline validation cleanup, inspect the existing Git state and repository `lolitsedgy-debug/pressure-up`, review exclusions for secrets and generated files, and then connect/push this source with explicit authorization. Later connect that repository to the existing Vercel project `pressure-up`, preserving its environment settings. No repository connection or deployment was performed here.
