-- GetMyCv order storage.
-- Run this once in the Supabase SQL editor for your project.

create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  ref_code     text        not null unique,
  package      text        not null check (package in ('starter', 'professional', 'premium')),
  add_ons      text[]      not null default '{}',
  total_lkr    integer     not null check (total_lkr >= 0),
  name         text        not null,
  email        text        not null,
  phone        text        not null,
  location     text        not null,
  role         text        not null,
  experience   text        not null,
  industry     text        not null,
  notes        text        not null default '',
  file_paths   text[]      not null default '{}',
  consent_at   timestamptz not null,
  status       text        not null default 'New'
               check (status in ('New', 'Paid', 'In progress', 'Review', 'Delivered')),
  created_at   timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- Row-level security: the public anon key may INSERT and nothing else.
-- Reading, updating and deleting happen in the Supabase dashboard, which uses
-- the service role and bypasses these policies.
alter table public.orders enable row level security;

drop policy if exists "anon can place orders" on public.orders;
create policy "anon can place orders"
  on public.orders
  for insert
  to anon
  with check (true);

-- Private bucket for CV and photo uploads.
insert into storage.buckets (id, name, public)
values ('order-uploads', 'order-uploads', false)
on conflict (id) do nothing;

drop policy if exists "anon can upload order files" on storage.objects;
create policy "anon can upload order files"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'order-uploads');

-- Housekeeping: delete uploads older than 90 days, as the privacy notice promises.
-- Schedule with pg_cron, or run it by hand once a month:
--   delete from storage.objects
--   where bucket_id = 'order-uploads' and created_at < now() - interval '90 days';
