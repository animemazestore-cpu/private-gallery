# Security Requirements

## Threat model

Assume an attacker can:

- View all client-side JavaScript.
- Inspect network requests.
- Guess URLs.
- Attempt many PINs.
- Call APIs without using the UI.
- Upload malicious or oversized files if an endpoint is exposed.
- Obtain a previously valid URL if its lifetime is excessive.

## Required controls

### Authentication

- Never authenticate solely in React/client state.
- Server verifies credentials.
- Use secure, HttpOnly, SameSite cookies where applicable.
- Expire sessions appropriately.
- Rate-limit repeated failed attempts.
- Do not log secrets.

### Authorization

Every protected gallery read, photo operation, and admin operation must verify authorization server-side.

### Storage

- Bucket must be private.
- Do not expose permanent public URLs.
- Use short-lived signed URLs or protected server delivery.

### Upload security

- Allow only approved image formats.
- Enforce maximum file size.
- Enforce maximum pixel dimensions where practical.
- Do not trust browser-provided MIME type alone.
- Normalize/sanitize filenames.
- Consider re-encoding images server-side to remove dangerous payloads/metadata if the chosen stack supports it safely.

### Secrets

Never commit:

- Visitor PIN.
- Admin password/PIN.
- Session secrets.
- Supabase service-role key.
- Any private API credential.

Use environment variables and production secret management.

## Security acceptance test

Attempt to access a photo's storage object or gallery API without a valid session. It must fail. Attempt admin operations as a visitor. They must fail.
