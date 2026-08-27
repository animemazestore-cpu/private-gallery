# Testing & Acceptance

## Automated tests

At minimum, cover:

- Correct visitor PIN succeeds.
- Incorrect visitor PIN fails.
- Repeated failed attempts trigger rate limiting.
- Unauthenticated gallery API access fails.
- Visitor cannot call admin endpoints.
- Admin can upload valid image.
- Invalid/oversized/non-image upload fails.
- Admin can delete an owned gallery photo.
- Deleted photo is no longer served.
- Protected storage cannot be accessed anonymously.

## Manual smoke test

1. Open in private/incognito browser.
2. Confirm gallery is locked.
3. Enter wrong PIN.
4. Confirm no gallery access.
5. Enter correct PIN.
6. View several photos on mobile-sized viewport.
7. Open full-screen viewer.
8. Log out and confirm lock returns.
9. Log in as admin.
10. Upload a photo.
11. Confirm it appears in visitor gallery.
12. Delete it.
13. Confirm it disappears and direct object access fails.

## Definition of verified

A feature is not considered verified merely because the UI renders. Exercise the real server/storage path.
