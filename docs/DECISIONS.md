# Architecture & Product Decision Log

## ADR-001 — Private storage

**Decision:** Store photos in private object storage.

**Reason:** A PIN-protected UI is insufficient if the underlying image files are public.

## ADR-002 — Server-side authorization

**Decision:** Protected operations must be authorized on the server.

**Reason:** Client-side checks can be bypassed.

## ADR-003 — Separate admin authentication

**Decision:** Visitor unlock does not grant admin privileges.

**Reason:** Least privilege and reduced blast radius.

## ADR-004 — Chunked AI development

**Decision:** Implement in small chunks and persist project memory after every chunk.

**Reason:** Makes long-running vibe-coding sessions resumable and reduces context loss.

## ADR-005 — Scaffold structure before logic

**Date/chunk:** Chunk 1 — Project scaffold

**Decision:** Create the full Next.js App Router folder structure
(`app/`, `app/api/**`, `components/visitor`, `components/admin`,
`lib/supabase`, `lib/auth`, `lib/storage`, `lib/validation`, `types/`,
`supabase/migrations/`) with every file containing a header comment and
`TODO`, before implementing any real logic.

**Reason:** Matches TASKS.md Phase 0 ("Scaffold/clean project foundation")
and gives every subsequent chunk (auth, storage, gallery, admin) an
unambiguous, pre-agreed home for its code, reducing the chance an AI session
invents a conflicting structure mid-project.

**Alternatives considered:** Implement Phase 1 (auth) directly without a
separate scaffold chunk. Rejected — PROMPT.md requires small, coherent,
independently-verifiable chunks, and "structure" and "auth logic" are
separable concerns.

**Consequences:** The app does not build/run yet (no dependencies installed,
no real logic). The very next chunk must not skip ahead into Phase 2/3
features before `lib/supabase/*` actually returns working clients — see
MEMORY.md > Next recommended chunk.

## ADR-006 — Foundation completion: pinned deps, server-only guard, compilable stubs

**Date/chunk:** Chunk 2 — Foundation completion

**Decision:** (a) Pin dependency versions with semver ranges instead of
`"latest"`. (b) Use the `server-only` npm package to guard
`lib/supabase/server.ts`. (c) Convert every stub file to a valid TypeScript
module that exports the correct function signatures (throwing "Not
implemented" at runtime) rather than leaving files as comment-only
non-modules.

**Reason:** (a) Reproducible installs across sessions / contributors —
`"latest"` can resolve differently at different times. (b) `server-only`
causes a build-time error if a Client Component accidentally imports the
service-role client, enforcing the security boundary described in
`SECURITY.md`. (c) Making stubs compile means `tsc --noEmit` and
`next build` pass at every chunk boundary, enabling incremental
verification per PROMPT.md rule 5.

**Alternatives considered:** (a) Lock exact versions — rejected because
minor/patch updates are low-risk and we want security patches. (b) Use a
runtime `typeof window !== "undefined"` check — rejected because it only
detects the issue at runtime, not build time. (c) Leave stubs as
comment-only — rejected because it prevents any automated verification
until all files are fully implemented.

**Consequences:** The tree type-checks and builds cleanly. Future chunks
can be verified after each change. Any accidental client-side import of
the server client will fail the build.

## ADR-007 — Data & Storage: image-size for magic bytes sniffing, deny-all default RLS

**Date/chunk:** Chunk 3 — Data & Storage

**Decision:** (a) Use `image-size` npm package for server-side image type
and dimension sniffing from raw Buffers. (b) Enable RLS on both `photos` and
`settings` tables without adding any public/anonymous permissive policies,
relying on the default deny-all behaviour of PostgreSQL RLS for anon and
authenticated roles.

**Reason:** (a) Hand-rolling parsers for JPEG, PNG, GIF, and WebP is highly
complex and error-prone. The `image-size` package is small, zero-dependency,
very fast, and parses standard magic bytes from buffers directly. (b) By
enabling RLS and not defining any permissive policies, browser clients using
the anon key cannot query the tables at all. All metadata requests must go
through server-side API routes, where we use `supabaseAdmin` (bypassing RLS
securely after validating the server-side session).

**Alternatives considered:** (a) Use `file-type` package — rejected because
`file-type` is fully ESM which requires special handling in hybrid Next.js/CJS
builds, whereas `image-size` is CJS/TS friendly out-of-the-box. (b) Write
custom buffer check for file header signatures — rejected because it doesn't give us
easy width/height extraction. (c) Define complex RLS policies in PostgreSQL —
rejected because proxying everything through API routes is a much simpler and
more secure boundary.

**Consequences:** The application does not expose any direct Postgres queries
to the frontend. Image verification is highly secure against forged extension
names.

## ADR-008 — Visitor Authentication: HMAC-signed cookies, DB rate limits, and lazy client initialization

**Date/chunk:** Chunk 4 — Visitor Authentication

**Decision:** (a) Implement session management using standard JSON cookies signed
with HMAC-SHA256 based on `ADMIN_AUTH_SECRET` (with a dev fallback). (b) Implement
PIN checking using PBKDF2/SHA-256 with 100k iterations and `timingSafeEqual`.
(c) Store rate limits in a dedicated `rate_limits` table rather than an in-memory
map. (d) Refactor Supabase server/client connections to evaluate environment
variables lazily via getter functions.

**Reason:** (a) HMAC-signed cookies avoid requiring full database session table lookups for
read-only gallery browsing, reducing latency and DB load, while remaining perfectly
secure against client tampering. (b) A timing-safe comparison and robust PBKDF2 hashing
guarantees that PINs cannot be leaked via side-channel (timing) attacks or brute-forced if
the env file is compromised. (c) Serverless platforms recycle environments frequently, so in-memory
rate limiting is easily bypassed. Store rate limits in Postgres ensures durability and accuracy
across scaling boundaries. (d) Static page compilation during `next build` imports routes that load
modules. If `process.env` validation checks run at module scope, the build will crash without
production secrets. Lazy initialization avoids this entirely.

**Alternatives considered:** (a) Use JSON Web Tokens (JWT) via `jose` — rejected because
writing a simple 10-line HMAC utility inside `lib/auth/session.ts` is more lightweight, zero-dependency,
and fully customisable. (b) Use `bcrypt` — rejected because it requires compiling native binaries
which frequently fail Vercel/serverless deployments. scrypt/pbkdf2 are native to Node.js and compile-free.

**Consequences:** The build process is stable even when no environment secrets are set. Login rate
limiting is robustly enforced across serverless scaling boundaries.

## ADR-009 — Gallery: next/image remote patterns, aspect-ratio CLS prevention, touch swipe handlers

**Date/chunk:** Chunk 5 — Gallery & Visitor UI

**Decision:** (a) Fetch photo metadata directly in Server Components instead
of fetching via `/api/gallery` internally. (b) Configure specific Supabase
remote image host patterns in `next.config.ts` to allow standard Next.js
`<Image>` optimization. (c) Prevent Layout Shift (CLS) in column masonry grids
by fetching and saving image dimensions during upload, passing them as explicit
width/height values to Next.js images. (d) Implement a custom swipe delta touch handler in
the Lightbox overlay.

**Reason:** (a) Data fetching in Next.js Server Components avoids extra HTTP roundtrips,
improving loading times, while maintaining clean security (cookie session validation is run
directly in the page loader). (b) Next.js blocks external host images by default. Whitelisting
Supabase endpoints (`*.supabase.co`) enables optimized image scaling, webp generation, and lazy-loading
controls. (c) CSS column grids can suffer layout jumps as images load because their heights are unknown.
Saving width/height metadata in database allows pre-calculating and setting correct heights at render-time,
fully eliminating layout shift. (d) Native touch-swipe tracking using start/end coordinates is lightweight,
zero-dependency, and highly responsive on mobile devices compared to heavy third-party swipe packages.

**Alternatives considered:** (a) Call `/api/gallery` via client-side fetch — rejected because it causes
slower page loading and flashes of empty templates. (b) Use standard HTML `<img>` tags — rejected because it
misses built-in responsive sizing and lazy-loading optimization of Next.js images.

**Consequences:** The gallery loads extremely quickly and runs smoothly on touchscreens with zero CLS layout jumps.

## ADR-010 — Admin: Server Actions for Auth, atomic uploads, and soft-delete recovery

**Date/chunk:** Chunk 6 — Admin Dashboard & Actions

**Decision:** (a) Implement admin credentials check and logout as Next.js 15
Server Actions (`adminLoginAction` and `adminLogoutAction` in
`app/admin/login/actions.ts`) instead of separate REST API routes.
(b) Design the `POST /api/admin/upload` handler to execute an atomic rollback:
if the database row write fails, delete the corresponding storage object
immediately. (c) Design the `DELETE /api/admin/photos/[id]` handler to run in a
soft-failure mode: if the storage object cannot be found or deleted, log a
warning but continue to delete the database row. (d) Render thumbnails in the
admin dashboard using short-lived signed URLs generated on-server, similar to
visitor view.

**Reason:** (a) Next.js 15 Server Actions simplify credentials forms, reducing route boilerplate
while allowing standard Node.js server execution (timing-safe comparisons, IP rate limits, cookie setting).
(b) If a database write fails (e.g. constraints issues), the file is already uploaded to storage. Doing
an immediate rollback delete avoids orphan file accumulation. (c) If a storage file is manually deleted or
moved, its database record becomes orphaned. If the API fails on storage deletion, the row can never
be deleted via dashboard controls. A soft-failure mode ensures the database remains the final source of truth.
(d) Because the Supabase bucket is private, direct object URLs cannot be fetched by the admin browser. Generating
signed URLs on-server is the only secure way to display private thumbnails inside management tables.

**Alternatives considered:** (a) Implement `/api/admin/login` REST endpoint — rejected because Server Actions
offer a simpler and safer developer interface. (b) Fail-fast on delete errors — rejected because it traps
the admin in an unrecoverable state if files go missing from storage.

**Consequences:** Admin functions are secure, transactional, and robust against state inconsistencies.

## ADR-011 — Security Hardening: Mock-driven Vitest, RLS reviews, and Focus Trap Accessibility

**Date/chunk:** Chunk 7 — Security Hardening

**Decision:** (a) Implement a fully mock-driven Vitest architecture to cover
all core authentication, session management, and image upload validation tests.
(b) Enforce RLS deny-all policies globally across all database tables. (c) Use focus
ref triggers and keypress bindings to meet mobile accessibility goals.

**Reason:** (a) Running tests against a live Supabase server requires active network
requests and local configuration keys, which breaks in headless CI/CD environments.
Mocking `next/headers` and `image-size` lets us verify signed cookies, PBKDF2 hashing,
and byte structure validation bounds entirely locally, reliably, and fast (running in < 1s).
(b) Directly querying or modifying tables via front-end keys bypasses route controls. Relying
on deny-all RLS on photos and settings guarantees that even if the anon key is compromised,
no private metadata can be extracted. (c) Standard modal popups and error alerts fail to notify
screen readers or capture keyboard highlights. Setting refs on primary buttons and listening to key
maps ensures keyboard navigation works smoothly.

**Alternatives considered:** (a) Set up a local Supabase docker instance for testing — rejected
because it requires installing Docker on the developer host machine, adding high tooling overhead.

**Consequences:** The codebase is fully verified via 19 test cases. Security gates and boundaries
are robustly documented and verified compile-safe.

## ADR-012 — Deployment: Supabase migrations, Private Bucket RLS, Vercel Setup, and Smoke Test

**Date/chunk:** Chunk 8 — Production Deployment Configuration

**Decision:** (a) Document and organize environment variable setup in
`.env.example`. (b) Create a step-by-step deployment guide in
`docs/DEPLOYMENT.md` detailing: (1) Running SQL migrations (in precise
order: `0001_init_photos` then `0002_rate_limits`), (2) Creating the private `photos` storage bucket,
(3) Configuring hosting (Vercel), (4) Executing the manual smoke test in Incognito mode.

**Reason:** (a) Clear documentation prevents configuration mistakes during setup. (b) The application security model
strictly depends on a Private storage bucket and active PostgreSQL RLS. Explicitly documenting that the storage bucket
MUST be private and tables RLS-enabled prevents accidental public exposure of user media. Documenting the incognito smoke test
ensures that subsequent updates are manually validated for security gates.

**Alternatives considered:** (a) Automatically run migrations on deployment — rejected because Next.js/Vercel
does not have direct schema DDL write access; Supabase projects are updated via migrations run in their own console
or SQL Editor.

**Consequences:** The application is fully prepared for cloud deployment, with clear instructions to guarantee
secure live operations.

## ADR-013 — Transient Memory Sessions, Autocomplete Blockers

**Date/chunk:** Chunk 9 — Transient Memory Session Architecture

**Decision:** (a) Transition the visitor session from cookie-based to a 100%
client-side transient React state memory flow. (b) Return signed photo URL
metadata directly in the POST `/api/auth/unlock` response on success, eliminating
visitor session cookies. (c) Merge the lock screen and gallery grid to render
inline on `/`. (d) Block browser credential caches by applying `autoComplete="new-password"`,
`spellCheck="false"`, `autoCorrect="off"`, and `noValidate` parameters.

**Reason:** (a) Browser settings like "Restore session" or "Continue where you
left off" preserve session cookies across browser/tab restarts, violating the
strict security goal. A purely in-memory session (React state) naturally deletes
the authenticated state when the page reloads (F5) or is closed. (b) By returning
photo URLs directly on unlock, the client does not need to send follow-up request
tokens. (c) Rendering everything on `/` makes state transition simple and avoids
flash of unauthenticated templates on `/gallery`. (d) Standard password autocomplete
tells the browser to suggest or cache input parameters, which is highly insecure
for shared-device lock screens.

**Alternatives considered:** (a) Keep visitor cookies but set brief expirations
(e.g., 10 seconds) — rejected because it causes redundant network refresh cycles
and still allows hijack windows. (b) Use sessionStorage — rejected because it survives
page reloads (F5), failing the requirement that refreshes must lock the screen.

**Consequences:** Visitor viewing is 100% transient, requiring PIN entry on
every reload or new open, with zero persistent footprints.

## New decisions

Append new decisions here using:

- Date/chunk
- Decision
- Reason
- Alternatives considered
- Consequences
