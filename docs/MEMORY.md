# Persistent Project Memory

> This file is the project's handoff memory. The coding AI MUST update it after every completed implementation chunk.

## Current status

- Project: Private PIN-protected photo gallery
- Phase: Phase 6 — Deployment (complete)
- Current chunk: Integrated client-side compression and secure admin password hashing
- Last completed chunk: Chunk 10 — Implemented client-side image compression in the admin dashboard `UploadDropzone.tsx` (using an HTML Canvas to downscale high-res photos to max 2048px and compress to 85% JPEG in the browser). Refactored `lib/auth/pin.ts` to export a generic `verifyCredential` function, and updated `adminLoginAction` in `app/admin/login/actions.ts` to support secure PBKDF2 hashed admin passwords in `ADMIN_AUTH_SECRET`. Added React `key={photo.id}` in `Lightbox.tsx` to trigger premium entrance and scale animations when navigating through photos.
- Next recommended action: Deploy changes to your repository! Run the final git push.

## Product decisions

- Visitor access is protected by a secret PIN.
- Admin has separate privileged access.
- Photos must be stored privately.
- Gallery is mobile-first.
- Admin can upload and delete photos.
- No public gallery in MVP.
- **One-time session constraint**: Visitor session state is purely in memory. Closing the tab, navigating away, or refreshing the page (F5) immediately resets state and locks the gallery, requiring PIN entry again.
- **Auto Image Optimization**: Admin uploads are compressed in-browser to max 2048px at 85% quality JPEG.

## Technical direction

- Stack: Next.js 15.5 + TypeScript 5.8 + React 19 + Supabase JS v2 + Vercel-compatible deployment.
- Testing: Vitest configuration (runnable via `npm run test` or `npx vitest run`) with modular unit suites under `tests/`.
- Lazy Evaluation: DB/storage connections are evaluated lazily via getters to maintain compiler stability during Next.js builds.

## Security decisions

- Server-side validation of file extension, magic bytes, dimensions, and size.
- PIN verification and admin password check use timing-safe comparisons and PBKDF2 cryptography.
- Rate limiting is durable, backed by database table `rate_limits` to prevent serverless instance bypasses.
- Session tokens are fully signed to prevent client-side forgery.
- Private photos are never exposed as raw storage paths; short-lived signed URLs expire after 15 minutes.
- **No persistent cookies for visitor**: Eliminates any possibility of session leakage or cross-origin forgery (CSRF) for visitor viewing.
- **Hashed admin credentials**: The `ADMIN_AUTH_SECRET` can be configured as a timing-safe PBKDF2 hash, hiding plain secret passwords from deployment console logs.

## Completed verification

- `tsc --noEmit` — passes cleanly with zero errors.
- `npx vitest run` — **19 of 19 tests passed successfully** (100% success rate).
- `next build` — passes cleanly, generating all 12 routes.

## Known issues

- Real Supabase database and storage configurations must be applied in a live environment (e.g. creating the `photos` and `rate_limits` tables and configuring the `photos` private storage bucket).

## Next recommended action

Project is completed!
Refer to [`docs/DEPLOYMENT.md`](file:///c:/Users/yashs/Downloads/private-gallery/private-gallery/docs/DEPLOYMENT.md) for live database setup, bucket configuration, and cloud hosting steps.

## Memory update protocol

After every chunk, replace/update the status sections above. Preserve important historical decisions below if they remain relevant.

### Chunk history

- Chunk 0 — Documentation bootstrap: created the project docs and master workflow prompt.
- Chunk 1 — Project scaffold: created the full Next.js/TS/Supabase folder structure (app/, components/, lib/, supabase/migrations/, types/) with stubbed, doc-referenced files and no implemented logic. Verification: N/A.
- Chunk 2 — Foundation completion: installed dependencies (Next.js 15.5, React 19, Supabase JS v2, TypeScript 5.8, server-only, eslint-config-next), implemented `lib/supabase/client.ts` (browser-safe anon-key singleton) and `lib/supabase/server.ts` (privileged service-role client with `server-only` guard), converted all stubs to valid TypeScript modules. Verification: `tsc --noEmit` ✓, `next build` ✓.
- Chunk 3 — Data & Storage implementation: installed `image-size`, implemented `lib/storage/photos.ts` (real bucket operations), implemented `lib/validation/upload.ts` (magic-bytes type sniffing, dimensions/size checks, filename sanitization), and enabled RLS in `supabase/migrations/0001_init_photos.sql`. Verification: `tsc --noEmit` ✓, `next build` ✓.
- Chunk 4 — Visitor Authentication logic: implemented secure visitor PIN verification (PBKDF2/SHA-256), session tokens (HMAC-signed cookies), database-backed rate limiting (rate_limits table migration), and API endpoints `/api/auth/unlock` and `/api/auth/logout`. Fixed Next.js build-time errors using lazy initializers for Supabase clients. Verification: `tsc --noEmit` ✓, `next build` ✓.
- Chunk 5 — Gallery & Visitor UI: implemented `/api/gallery` GET API, lock screen forms (`PinEntry`, `HomePageClient`, `page.tsx` server-side redirects), gallery wrapper page (`page.tsx`, `GalleryClient`, logout trigger), masonry grid view (`GalleryGrid` with aspect-ratio layout shift protection), lightbox zoom viewer (`Lightbox` with swipe gesture and key detection), and configured next.config remote patterns for Supabase. Verification: `tsc --noEmit` ✓, `next build` ✓.
- Chunk 6 — Admin Dashboard & Actions: implemented admin credentials Server Actions (`adminLoginAction` and `adminLogoutAction`), admin login form layouts, admin GET inventory route with signed URL generation, DELETE route handler with database/storage cleanups, POST upload batch handler with file checks and database register rollbacks, `UploadDropzone` drag-and-drop picker, `PhotoManagerTable` selections manager, and `DeleteConfirmDialog` modal confirmation dialog. Verification: `tsc --noEmit` ✓, `next build` ✓.
- Chunk 7 — Security Hardening: implemented 19 automated unit/integration tests in Vitest covering all core authentication, signed session parsing, and file sniffing validation bounds. Checked unauthenticated API blocks, session boundaries, and RLS tables. Verification: `tsc --noEmit` ✓, `npx vitest run` ✓, `next build` ✓.
- Chunk 8 — Production Deployment Configuration: updated environment variable templates in `.env.example`, documented Supabase config and Vercel hosting guides in [`docs/DEPLOYMENT.md`](file:///c:/Users/yashs/Downloads/private-gallery/private-gallery/docs/DEPLOYMENT.md), and specified smoke testing protocols. Verification: `tsc --noEmit` ✓, `npx vitest run` ✓, `next build` ✓.
- Chunk 9 — Transient Memory Session Architecture: refactored visitor flow to use a 100% transient, in-memory session. PIN entry returns signed URLs immediately, rendering the gallery inline on `/`. Removed visitor cookies. Added strict autocomplete block parameters to input elements. Verification: `tsc --noEmit` ✓, `npx vitest run` ✓, `next build` ✓.
- Chunk 10 — Advanced Optimizations: integrated browser-side HTML Canvas image compression (reducing photo sizes and boosting loading speed), refactored credential checks to support hashed admin passwords in `ADMIN_AUTH_SECRET`, and mapped React element keys in Lightbox to trigger modern scale animations. Verification: `tsc --noEmit` ✓, `npx vitest run` ✓, `next build` ✓.
