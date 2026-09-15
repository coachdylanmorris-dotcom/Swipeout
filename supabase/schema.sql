-- Swipeout database schema
--
-- How to use this file: open your Supabase project -> SQL Editor -> New
-- query, paste this whole file in, and click "Run". It's safe to re-run
-- (everything uses "if not exists" / "or replace" / "drop ... if exists"
-- where it matters), so if something changes later you can just re-paste
-- an updated version.
--
-- What this sets up:
--   1. Tables for people (profiles, buyer_profiles, agent_profiles),
--      listings, and swipes (the buyer's "not interested" / "watchlist" /
--      "contact me" decision on each listing).
--   2. A trigger that automatically creates a `profiles` row whenever
--      someone signs up, using the role/name they gave the signup form.
--   3. Row Level Security (RLS) policies -- rules the database enforces
--      no matter what the app code does. These are what make it safe to
--      call Supabase directly from the browser: e.g. an agent can only
--      ever see a buyer's contact details once that buyer has swiped
--      "Contact me" on one of their listings.
--   4. A storage bucket for listing photos.

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------

-- One row per signed-up user (buyer or agent), on top of Supabase's
-- built-in auth.users table.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('buyer', 'agent')),
  full_name text,
  created_at timestamptz not null default now()
);

-- Extra fields for buyers only.
create table if not exists public.buyer_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  budget_min integer,
  budget_max integer,
  preferred_location text,
  pre_approved boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Extra fields for agents only.
create table if not exists public.agent_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  agency_name text,
  updated_at timestamptz not null default now()
);

-- Listings added by agents.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.profiles (id) on delete cascade,
  address text not null,
  region text not null,
  price integer not null,
  bedrooms integer not null,
  bathrooms integer not null,
  description text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- A buyer's decision on a listing. One row per (buyer, listing) pair --
-- swiping again on the same listing updates the row instead of adding a
-- new one.
create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  action text not null check (action in ('not_interested', 'watchlist', 'contact')),
  created_at timestamptz not null default now(),
  unique (buyer_id, listing_id)
);

create index if not exists swipes_listing_id_idx on public.swipes (listing_id);
create index if not exists listings_agent_id_idx on public.listings (agent_id);

-- ---------------------------------------------------------------------
-- 2. Auto-create a profile row on signup
-- ---------------------------------------------------------------------
-- The signup form passes `role` and `full_name` as auth "user metadata".
-- This trigger copies them into public.profiles as soon as the account
-- is created, so the rest of the app can rely on a profile always
-- existing for a logged-in user.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'buyer'),
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.agent_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.swipes enable row level security;

-- profiles: you can always see/edit your own profile. An agent can also
-- see a buyer's profile once that buyer has swiped "Contact me" on one
-- of the agent's listings -- and not before.
drop policy if exists "profiles select" on public.profiles;
create policy "profiles select" on public.profiles
  for select using (
    auth.uid() = id
    or exists (
      select 1 from public.swipes s
      join public.listings l on l.id = s.listing_id
      where s.buyer_id = profiles.id
        and s.action = 'contact'
        and l.agent_id = auth.uid()
    )
  );

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

-- buyer_profiles: same "self, or the agent they contacted" rule.
drop policy if exists "buyer_profiles select" on public.buyer_profiles;
create policy "buyer_profiles select" on public.buyer_profiles
  for select using (
    auth.uid() = id
    or exists (
      select 1 from public.swipes s
      join public.listings l on l.id = s.listing_id
      where s.buyer_id = buyer_profiles.id
        and s.action = 'contact'
        and l.agent_id = auth.uid()
    )
  );

drop policy if exists "buyer_profiles upsert own" on public.buyer_profiles;
create policy "buyer_profiles upsert own" on public.buyer_profiles
  for insert with check (auth.uid() = id);

drop policy if exists "buyer_profiles update own" on public.buyer_profiles;
create policy "buyer_profiles update own" on public.buyer_profiles
  for update using (auth.uid() = id);

-- agent_profiles: agency name is shown to buyers alongside listings, so
-- any signed-in user can read it; only the agent can edit their own.
drop policy if exists "agent_profiles select" on public.agent_profiles;
create policy "agent_profiles select" on public.agent_profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "agent_profiles upsert own" on public.agent_profiles;
create policy "agent_profiles upsert own" on public.agent_profiles
  for insert with check (auth.uid() = id);

drop policy if exists "agent_profiles update own" on public.agent_profiles;
create policy "agent_profiles update own" on public.agent_profiles
  for update using (auth.uid() = id);

-- listings: any signed-in buyer or agent can browse listings; only the
-- owning agent can add/edit/remove their own.
drop policy if exists "listings select" on public.listings;
create policy "listings select" on public.listings
  for select using (auth.role() = 'authenticated');

drop policy if exists "listings insert own" on public.listings;
create policy "listings insert own" on public.listings
  for insert with check (auth.uid() = agent_id);

drop policy if exists "listings update own" on public.listings;
create policy "listings update own" on public.listings
  for update using (auth.uid() = agent_id);

drop policy if exists "listings delete own" on public.listings;
create policy "listings delete own" on public.listings
  for delete using (auth.uid() = agent_id);

-- swipes: a buyer manages their own swipes. An agent can read swipes
-- ("contact me" leads) on listings they own.
drop policy if exists "swipes select" on public.swipes;
create policy "swipes select" on public.swipes
  for select using (
    auth.uid() = buyer_id
    or exists (
      select 1 from public.listings l
      where l.id = swipes.listing_id and l.agent_id = auth.uid()
    )
  );

drop policy if exists "swipes insert own" on public.swipes;
create policy "swipes insert own" on public.swipes
  for insert with check (auth.uid() = buyer_id);

drop policy if exists "swipes update own" on public.swipes;
create policy "swipes update own" on public.swipes
  for update using (auth.uid() = buyer_id);

-- ---------------------------------------------------------------------
-- 4. Storage bucket for listing photos
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

drop policy if exists "listing-photos public read" on storage.objects;
create policy "listing-photos public read" on storage.objects
  for select using (bucket_id = 'listing-photos');

drop policy if exists "listing-photos authenticated upload" on storage.objects;
create policy "listing-photos authenticated upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'listing-photos');

drop policy if exists "listing-photos owner update" on storage.objects;
create policy "listing-photos owner update" on storage.objects
  for update to authenticated using (bucket_id = 'listing-photos' and owner = auth.uid());

drop policy if exists "listing-photos owner delete" on storage.objects;
create policy "listing-photos owner delete" on storage.objects
  for delete to authenticated using (bucket_id = 'listing-photos' and owner = auth.uid());
