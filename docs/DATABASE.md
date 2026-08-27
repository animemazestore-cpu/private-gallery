# Database Design

Use PostgreSQL/Supabase or the repository's equivalent.

## `photos`

Suggested fields:

- `id` — UUID primary key
- `storage_path` — private storage object path
- `original_filename` — sanitized display/reference name
- `mime_type` — validated MIME type
- `size_bytes` — validated size
- `width` — image width
- `height` — image height
- `caption` — nullable text
- `sort_order` — integer
- `created_at` — timestamp
- `updated_at` — timestamp

## Optional `settings`

For non-secret gallery settings such as title, description, and visual preferences.

## Authentication data

Do not store a raw visitor PIN in the database. Prefer a password-hash/KDF representation or an identity provider/session mechanism appropriate to the chosen implementation.

Do not store admin credentials in the `photos` table.

## Row-level security

If Supabase RLS is used, design policies so that browser clients cannot bypass application authorization to read/write protected media metadata.
