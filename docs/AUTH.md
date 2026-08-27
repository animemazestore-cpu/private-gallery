# Authentication & Sessions

## Visitor

1. Show PIN entry page.
2. Submit PIN over HTTPS.
3. Server verifies the credential.
4. On success, create a secure session.
5. Redirect/render the gallery.
6. On failure, show a generic error and apply rate limiting.

## Admin

Use a separate admin authentication path. Admin access must not be inferred merely from the visitor's successful PIN.

Preferred approach: an established authentication provider or server-side admin credential/session system. Never implement admin authorization using a client-side flag.

## Logout

Both visitor and admin sessions should have explicit logout behavior.

## Session protection

- Secure cookie in production.
- HttpOnly.
- SameSite appropriate to deployment.
- Reasonable expiry.
- Server-side authorization checks.
