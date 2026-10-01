# Pressure Up V20 build fix
Date: 2026-09-27

## Problem confirmed from first Vercel deployment
Next.js/Turbopack rejected a browser-only dynamic import that attempted to import `/assist/receipt-ocr.mjs` using a runtime string. Turbopack interpreted the server-relative module URL as a build-time module request and failed the build.

## Fix
- Moved the browser assistance modules into `lib/client-assist/` so Next.js can treat them as real source modules.
- Replaced the runtime server-relative receipt OCR import with a statically analyzable dynamic import.
- Moved the photo-quality source import out of `public/` for the same reason.
- Public OCR runtime assets under `/public/assist/ocr/` remain public URLs, because Tesseract loads those in the browser at runtime.

## Safety
- No production domain changes.
- No Supabase schema changes in this checkpoint.
- Existing V19 Supabase backend remains intact.
