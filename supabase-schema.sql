create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  updated_at timestamptz default now()
);

create table if not exists public.availability (
  id uuid primary key,
  restaurant_id text not null,
  restaurant_name text not null,
  guest text not null,
  date date not null,
  time time not null,
  party_size integer not null default 1,
  note text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.availability enable row level security;

drop policy if exists "Users can manage their profile" on public.profiles;
create policy "Users can manage their profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Signed-in users can read availability" on public.availability;
create policy "Signed-in users can read availability"
on public.availability
for select
using (auth.role() = 'authenticated');

drop policy if exists "Signed-in users can create availability" on public.availability;
create policy "Signed-in users can create availability"
on public.availability
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Signed-in users can update availability" on public.availability;
create policy "Signed-in users can update availability"
on public.availability
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
