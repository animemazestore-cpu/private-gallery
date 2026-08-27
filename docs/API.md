# API Contracts

Adapt names to the chosen implementation.

## Visitor

### `POST /api/auth/unlock`

Input:

```json
{ "pin": "<secret>" }
```

Success: creates visitor session.

Failure: generic unauthorized response with rate-limit behavior.

### `POST /api/auth/logout`

Destroys visitor session.

### `GET /api/gallery`

Requires visitor session. Returns photo metadata and access mechanism for protected media.

## Admin

### `POST /api/admin/upload`

Requires admin session. Accepts validated image file(s).

### `DELETE /api/admin/photos/:id`

Requires admin session. Deletes the photo and its protected object.

### `GET /api/admin/photos`

Requires admin session.

## API rules

- Validate all inputs server-side.
- Return consistent error shapes.
- Do not leak sensitive implementation details.
- Use correct HTTP status codes.
- Apply authentication and authorization before protected operations.
