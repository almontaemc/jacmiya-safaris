-- Shared admin data. Apply with `npm run db:migrate` — every statement is
-- idempotent, so it is safe to run again after adding new tables.

create table if not exists users (
  id            text primary key,
  name          text not null,
  email         text not null unique,          -- stored lower-cased
  password_hash text not null,
  role          text not null,
  job_title     text,
  access        text[],                        -- null = full access
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  last_login    timestamptz
);

create table if not exists sessions (
  token_hash text primary key,                 -- sha256 of the cookie value
  user_id    text not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_idx on sessions (user_id);

create table if not exists vouchers (
  id               text primary key,
  voucher_number   integer not null unique,
  sale_id          text,
  status           text not null,
  issue_date       date not null,
  supplier_name    text not null,
  client_names     text not null,
  adults           integer not null default 0,
  children         integer not null default 0,
  arrival_date     date not null,
  arrival_time     text not null default '',
  arrival_method   text not null default '',
  departure_date   date not null,
  departure_time   text not null default '',
  departure_method text not null default '',
  nights           integer not null default 0,
  rooms            jsonb not null default '{}'::jsonb,
  special_notes    text not null default '',
  created_by       text references users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Running counters that must never go backwards, e.g. the voucher book number.
create table if not exists counters (
  name  text primary key,
  value integer not null
);
