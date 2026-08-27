# Coding Workflow

## Before coding

Read:

1. `PROMPT.md`
2. `MEMORY.md`
3. `TASKS.md`
4. Relevant technical docs

Inspect the actual repository before assuming file names or architecture.

## During coding

- Make one focused chunk at a time.
- Keep diffs understandable.
- Reuse existing patterns.
- Avoid speculative abstractions.
- Never weaken authentication/security to make a demo work.

## After coding each chunk

- Run the smallest useful verification suite.
- Fix failures caused by your changes.
- Update `MEMORY.md`.
- Update `TASKS.md`.
- Record architectural decisions in `DECISIONS.md`.
- State the exact next chunk.

## Git hygiene

Do not commit:

- `.env.local`
- production credentials
- PINs/passwords
- private signed URLs
- personal/private photos unless explicitly intended for the repository
