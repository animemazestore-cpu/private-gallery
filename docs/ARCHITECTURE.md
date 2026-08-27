# Architecture

## Logical components

```text
Browser
  |
  v
Next.js UI
  |
  +--> Visitor authentication/session
  |
  +--> Gallery API/server actions ---> Database
  |
  +--> Admin API/server actions -----> Database
  |                                      |
  |                                      v
  +-------------------------------> Private object storage
```

## Rules

- Browser code may use only public/client-safe configuration.
- Privileged database/storage operations execute server-side.
- Authentication state is represented by a secure session/cookie.
- Gallery queries return metadata, not permanent public object URLs.
- Server generates short-lived access URLs or streams protected content after authorization.
- Admin operations check admin authorization on every request.

## Recommended deployment

- Web app: Vercel-compatible Next.js deployment.
- Database: Supabase PostgreSQL.
- Media: Supabase private Storage bucket.

The implementation may differ if the repository already has an established stack; document any deviation in `DECISIONS.md`.
