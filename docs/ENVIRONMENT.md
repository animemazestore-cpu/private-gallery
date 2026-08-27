# Environment Variables

Use `.env.local` locally and the hosting provider's secret manager in production. Commit only `.env.example`.

Typical variables may include:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VISITOR_PIN_HASH=
ADMIN_AUTH_SECRET=
```

Exact names depend on implementation.

## Rules

- `NEXT_PUBLIC_*` values are browser-visible; never put secrets there.
- Service-role credentials must remain server-only.
- Never commit `.env.local`.
- If a secret is accidentally committed, rotate it immediately.
