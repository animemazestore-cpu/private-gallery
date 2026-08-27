# Master Vibe-Coding Prompt — Private Gallery

You are the primary software engineer for this project. Build a production-quality, mobile-first private photo gallery website from the project documentation in this folder.

## Non-negotiable workflow

1. **Work in chunks.** Never attempt the entire project in one giant change.
2. Before each chunk, inspect the repository and read the relevant `.md` files, especially `MEMORY.md`, `TASKS.md`, `DECISIONS.md`, and the docs relevant to the current chunk.
3. Choose one coherent, testable chunk with a clear start and finish.
4. Implement only that chunk unless a small dependency is strictly required.
5. Run appropriate tests, type checks, linting, and/or build checks after the chunk.
6. Fix issues caused by the chunk before moving on.
7. **After every completed chunk, update `MEMORY.md` immediately.** Record what was completed, important files changed, current state, decisions made, tests run, known issues, and the exact next recommended chunk.
8. Also update `TASKS.md` to mark completed work and define the next chunk.
9. If a new architectural decision is made, append it to `DECISIONS.md`.
10. Do not claim work is complete unless it is actually implemented and verified.
11. At the end of each response, briefly state: chunk completed, verification performed, memory updated, and next chunk.
12. If context is getting large, stop after the current safe chunk, persist memory, and continue from the repository docs in the next turn.

## Product goal

Create a private gallery where a visitor must enter a secret PIN before accessing photos. An administrator can securely authenticate and upload/delete/manage photos. The gallery must work beautifully on phones without requiring the visitor to store photos in their device gallery.

## Security principles

- Treat the visitor PIN as a secret credential, not as a frontend-only UI gate.
- Never hard-code secrets in client code.
- Never expose database service-role credentials to the browser.
- Enforce authorization server-side for every protected operation.
- Protect original photo files from unauthenticated public access.
- Use secure, expiring/signed media URLs or an equivalent protected delivery mechanism.
- Rate-limit PIN/authentication attempts and avoid revealing whether a credential is correct through overly detailed errors.
- Validate file type, file size, image dimensions, and upload content server-side.
- Sanitize metadata and filenames.
- Use secure cookies/session handling where applicable.
- Do not store secrets in Git or Markdown files.

## Preferred stack

Use the stack already present in the repository when one exists. If starting from scratch, use:

- Next.js + TypeScript
- Modern React
- Supabase for PostgreSQL/database and private object storage
- Vercel-compatible deployment
- Server-side/API routes or server actions for privileged operations

Do not introduce unnecessary libraries. Prefer simple, well-supported primitives.

## UX requirements

- Mobile-first and responsive.
- Fast initial gallery load.
- Elegant, private, minimal visual style.
- Clear locked state and PIN entry screen.
- Gallery with responsive image grid and full-screen/lightbox viewing.
- Loading, empty, error, and unauthorized states.
- Admin UI must be visually separate from visitor UI.
- Keyboard accessible and screen-reader friendly.
- Touch targets must be comfortable on phones.

## Admin requirements

Admin can:

- Authenticate securely.
- View gallery/media inventory.
- Upload one or multiple images.
- See upload progress and validation errors.
- Delete selected photos.
- Optionally edit captions/ordering if supported by the implementation.
- Log out.

Destructive operations require confirmation.

## Engineering rules

- Keep components small and maintainable.
- Use TypeScript strictly.
- Avoid duplicated business logic.
- Keep secrets and privileged SDK clients server-only.
- Validate all external input at trust boundaries.
- Handle failures explicitly.
- Add tests for authentication, authorization, uploads, deletion, and protected media access.
- Use migrations for database changes.
- Keep the app deployable after each meaningful chunk.

## Definition of done

The project is done only when:

- Visitor PIN flow works end-to-end.
- Protected gallery works after authentication.
- Unauthorized users cannot access protected photos through the API/storage.
- Admin authentication works.
- Admin upload works with server-side validation.
- Admin delete works with authorization.
- Mobile UI is polished.
- Production environment variables are documented.
- Tests/build/type checks pass.
- Security-sensitive behavior has been manually reviewed.
- `MEMORY.md`, `TASKS.md`, and `DECISIONS.md` accurately describe the final state.
