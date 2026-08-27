-- Per docs/DATABASE.md
create extension if not exists "pgcrypto";

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes integer not null,
  width integer not null,
  height integer not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional, non-secret gallery settings (docs/DATABASE.md > Optional `settings`)
create table if not exists settings (
  key text primary key,
  value text
);

-- Enable Row Level Security (RLS) so that anonymous/browser clients
-- (anon key) cannot read or write `photos` or `settings` directly.
-- All access must go through server-side API routes using the service-role client,
-- which bypasses RLS policies.
alter table photos enable row level security;
alter table settings enable row level security;
