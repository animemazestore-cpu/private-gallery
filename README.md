# Private Gallery

A private, PIN-protected photo gallery with a separate admin upload system.
Built with Next.js + TypeScript + Supabase (private storage + Postgres).

**Status:** scaffold only — see `docs/MEMORY.md` for exact current state.
No logic is implemented yet; every file under `app/`, `components/`, and
`lib/` is a stub with a `TODO` and a comment pointing at the doc that
specifies its behavior.

## Start here (for an AI coding agent or a human)

1. Read `docs/PROMPT.md` first — it is the master workflow instruction.
2. Read `docs/MEMORY.md` for the exact current state and the next recommended chunk.
3. Read `docs/TASKS.md` for the full roadmap.
4. Read whichever other `docs/*.md` file is relevant to the current chunk.
5. Work in one small, coherent, testable chunk. Update `docs/MEMORY.md`,
   `docs/TASKS.md`, and `docs/DECISIONS.md` after every chunk.

## Structure

```text
app/                    Next.js App Router
  api/                  Route handlers (server-only privileged operations)
    auth/unlock, auth/logout, gallery, admin/upload, admin/photos, admin/photos/[id]
  admin/                Admin login + dashboard pages
  gallery/              Protected visitor gallery page
components/
  visitor/              PinEntry, GalleryGrid, Lightbox
  admin/                UploadDropzone, PhotoManagerTable, DeleteConfirmDialog
lib/
  supabase/             server.ts (service-role, server-only) / client.ts (anon, browser-safe)
  auth/                 pin.ts, session.ts, rateLimit.ts
  storage/              photos.ts (private bucket upload/delete/signed URLs)
  validation/           upload.ts (server-side file validation)
supabase/migrations/    SQL migrations (photos, settings tables)
types/                  Shared TypeScript types
docs/                   Full project specification (source of truth — read first)
```

## Setup (once dependencies are implemented)

```bash
cp .env.example .env.local   # fill in real values, never commit this file
npm install
npm run dev
```

See `docs/ENVIRONMENT.md` for what each variable does and `docs/DEPLOYMENT.md`
for the production checklist.
