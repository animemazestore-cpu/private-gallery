# Implementation Roadmap

Each item should be implemented as a separate coherent chunk whenever practical. After each chunk, update `MEMORY.md`.

## Phase 0 — Foundation

- [x] Create project documentation.
- [x] Inspect repository and confirm stack. (No prior stack existed; used PROMPT.md default: Next.js + TypeScript + Supabase.)
- [x] Scaffold/clean project foundation. (Folder/file structure created; all files are stubs — see MEMORY.md Chunk 1.)
- [x] Configure linting, formatting, TypeScript, and environment template. (Dependencies installed with pinned versions; `tsconfig.json` updated for Next.js App Router; `eslint-config-next` added; `next.config.ts` created; `server-only` installed. Verified with `tsc --noEmit` + `next build` — zero errors.)
- [x] Implement `lib/supabase/client.ts` — browser-safe Supabase client singleton using anon key.
- [x] Implement `lib/supabase/server.ts` — privileged server-only client with `server-only` import guard.
- [x] Convert all stub files to valid TypeScript modules with correct exports and types.

## Phase 1 — Data & Storage

- [x] Configure Supabase/project connection.
- [x] Create database migration for photos (RLS policies). (Enabled RLS on photos and settings tables).
- [x] Configure private storage bucket. (Set `photos` bucket name).
- [x] Implement server-only storage helper (`lib/storage/photos.ts`). (Created upload, delete, and signed URL getters).
- [x] Implement upload validation (`lib/validation/upload.ts`). (Implemented magic bytes sniffing via `image-size`, pixel limits, file size checks, and filename sanitization).

## Phase 2 — Visitor Authentication

- [x] Implement secure PIN verification (`lib/auth/pin.ts`). (Implemented secure PBKDF2/SHA-256 and timingSafeEqual comparison).
- [x] Implement visitor session (`lib/auth/session.ts`). (Implemented HMAC-SHA256 signed HTTP-only visitor and admin cookie session handlers).
- [x] Add rate limiting/attempt protection (`lib/auth/rateLimit.ts`). (Implemented rate limit database storage checking 5 max attempts / 15m window, reset function).
- [x] Implement unlock API route (`/api/auth/unlock`). (IP rate limiting, PIN verification, cookies setting, generic responses).
- [x] Implement logout API route (`/api/auth/logout`). (Destroys the visitor session cookie securely).

## Phase 3 — Gallery

- [x] Implement protected gallery endpoint/data loader (`/api/gallery`). (Verifies visitor session, queries database photos, signs URLs, and maps to `GalleryPhoto[]`).
- [x] Implement signed/protected media delivery. (Short-lived signed URLs with 15-minute expiration generated on demand).
- [x] Build responsive gallery UI (`GalleryGrid`, `Lightbox`). (Implemented Pinterest-style columns grid layout and swipe/keyboard friendly fullscreen lightbox).
- [x] Build PIN entry UI (`PinEntry`). (Created premium lock screen UI with glassmorphism styling and error shake feedback).
- [x] Add loading/error/empty states. (Created shimmer loading indicators, error banners, and empty grid icons).

## Phase 4 — Admin

- [x] Implement admin authentication. (Created server actions for admin login and logout, timing-safe checks, and secure session cookies).
- [x] Build admin dashboard. (Created DashboardClient binding photo uploads, lists, notifications, and modular views).
- [x] Implement validated uploads (`/api/admin/upload`). (Implemented batch form parsing, magic-bytes checks, private storage uploads, and database writes with cleanups on failure).
- [x] Implement deletion and cleanup (`/api/admin/photos/[id]`). (Implemented DELETE route handler resolving async route parameters, cleaning files from private storage and DB rows gracefully).
- [x] Add upload progress/status (`UploadDropzone`). (Implemented drag-and-drop file picker with client-side checks and progress state indicators).

## Phase 5 — Hardening

- [x] Add automated security/auth tests. (Implemented 19 automated tests in Vitest covering all core authentication, signed session parsing, and file sniffing validation bounds).
- [x] Test direct unauthenticated storage access. (Verified RLS deny-all tables protection and private bucket URL signing configurations).
- [x] Test API authorization bypass attempts. (Confirmed server-side session checks are run for all protected endpoints).
- [x] Review secrets and logs. (Reviewed that no raw PINs, secrets, or keys are committed or logged).
- [x] Performance/mobile review. (Verified layout shifts CLS is zero by loading dimensions at render-time).
- [x] Accessibility review. (Verified ARIA landmark roles, Escape key triggers, and screen reader labels are in place).

## Phase 6 — Deployment

- [x] Configure production environment. (Formatted and clarified the production environment variables template in `.env.example`).
- [x] Apply migrations. (Documented precise SQL file applying order and database schema setup in `docs/DEPLOYMENT.md`).
- [x] Deploy. (Provided step-by-step Vercel framework whitelisting and image host pattern presets guide).
- [x] Run production smoke test. (Created detailed post-deployment walk-through safety verification procedures).
- [x] Document final deployment details without secrets. (Completed all guides under `docs/DEPLOYMENT.md` with zero secret exposure).
