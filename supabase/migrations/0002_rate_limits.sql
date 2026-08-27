-- Rate limiting table for failed login/PIN attempts (docs/SECURITY.md > Rate limiting)
create table if not exists rate_limits (
  key text primary key,
  attempts integer not null default 0,
  last_attempt_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS) so that anonymous clients cannot read/write directly.
-- All checks and updates must happen server-side using the service-role client.
alter table rate_limits enable row level security;
