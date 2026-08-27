# Handoff Prompt — Private Gallery (paste this to the next AI)

You are continuing an existing project, not starting from scratch. A zip
named `private-gallery.zip` is attached/uploaded alongside this prompt.
Unzip it as your project root before doing anything else.

## What's already here

- `docs/` — the full specification: `PROMPT.md` (your master workflow
  instruction), `PROJECT.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DATABASE.md`,
  `UI_UX.md`, `AUTH.md`, `ADMIN.md`, `API.md`, `STORAGE.md`, `TESTING.md`,
  `DEPLOYMENT.md`, `ENVIRONMENT.md`, `CONTRIBUTING.md`, `TASKS.md`,
  `DECISIONS.md`, and `MEMORY.md`.
- A scaffolded Next.js + TypeScript + Supabase folder structure
  (`app/`, `components/`, `lib/`, `supabase/migrations/`, `types/`).
  **Every file in that structure is a stub**: a header comment explaining its
  responsibility and citing the doc that governs it, plus a `TODO`. No auth,
  storage, upload, or UI logic has been written yet.
- `README.md` at the project root with a structure map and setup steps.

## Your instructions

1. **Read `docs/PROMPT.md` first.** It defines a non-negotiable chunked
   workflow: work in one small, coherent, testable chunk at a time; verify
   it; then update `docs/MEMORY.md`, `docs/TASKS.md`, and (if you made an
   architectural choice) `docs/DECISIONS.md` before stopping.
2. **Read `docs/MEMORY.md` next.** It states the exact current status and
   the specific next recommended chunk. Trust it over your own assumptions
   about what's done — it was written by the session that produced this
   scaffold, immediately after producing it.
3. **Read `docs/TASKS.md`** for the full phase-by-phase roadmap so you know
   where the recommended next chunk fits.
4. **Read `docs/DECISIONS.md`**, especially ADR-001 through ADR-005, so you
   don't re-litigate settled architecture (private storage, server-side
   authorization, separate admin auth, chunked development, scaffold-first).
5. Before writing code, actually inspect the repository on disk — don't
   assume file contents from this prompt; the stub comments in each file
   tell you exactly what belongs there and which doc governs it.
6. Implement only the next chunk `docs/MEMORY.md` names (as of this handoff:
   installing real dependencies and implementing
   `lib/supabase/server.ts`/`lib/supabase/client.ts`, then confirming the
   stub tree actually builds/typechecks before adding feature logic).
7. Do not weaken any security requirement in `docs/SECURITY.md` to make
   something "work" — no client-only PIN checks, no public storage bucket,
   no skipping server-side authorization.
8. After your chunk: run the smallest useful verification (build/typecheck/
   lint/tests as applicable), fix anything your change broke, then update
   `docs/MEMORY.md` and `docs/TASKS.md` (and `docs/DECISIONS.md` if relevant)
   exactly as `docs/CONTRIBUTING.md` describes.
9. End your response by stating explicitly: which chunk you completed, what
   verification you ran, that memory/tasks were updated, and the exact next
   chunk — per `docs/PROMPT.md` rule 11.
10. Never put real secrets, PINs, or service-role keys in any Markdown file,
    `.env.example`, or committed code. Use `.env.local` only, per
    `docs/ENVIRONMENT.md`.

Begin by reading `docs/MEMORY.md` and `docs/TASKS.md`, then implement the
next chunk.
