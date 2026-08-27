# Media Storage

## Requirements

- Use a **private** object-storage bucket.
- Store only generated/internal object paths in the database.
- Never depend on a public bucket for privacy.
- Generate short-lived signed URLs only after authorization, or proxy the file through an authorized server endpoint.

## Recommended upload pipeline

1. Authenticate admin.
2. Validate extension, MIME type, byte size, and dimensions.
3. Generate a safe unique object path.
4. Upload to private storage.
5. Write metadata to database.
6. If database write fails, clean up the uploaded object.

## Recommended read pipeline

1. Authenticate visitor.
2. Query authorized photo metadata.
3. Generate short-lived access URL(s).
4. Return them to the authorized client.

Avoid URLs with unnecessarily long expiration times.
