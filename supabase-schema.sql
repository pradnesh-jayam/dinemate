-- DineMate Database Schema for Supabase
-- 
-- This schema sets up:
-- 1. Profiles table (user account data)
-- 2. Availability table (dining slots)
-- 3. Row Level Security (RLS) policies
-- 4. Indexes for performance

-- ===== Create Tables =====

-- Profiles: Stores user information
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  occupation text,
  photo_url text,
  rating float default 5.0,
  bio text,
  updated_at timestamptz default now()
);

-- Availability: Stores dining availability slots (legacy - keep for compatibility)
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  restaurant_id text not null,
  restaurant_name text not null,
  guest text not null,
  date date not null,
  time time not null,
  party_size integer not null default 1,
  note text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Dining Slots: Time slots at restaurants
create table if not exists public.dining_slots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id text not null,
  restaurant_name text not null,
  location text not null,
  slot_date date not null,
  slot_time time not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  capacity integer default 6,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Slot Members: Users who joined a dining slot
create table if not exists public.slot_members (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.dining_slots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  party_size integer default 1,
  joined_at timestamptz default now(),
  unique(slot_id, user_id)
);

-- Dining Requests: User requests to connect
create table if not exists public.dining_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  slot_id uuid references public.dining_slots(id) on delete set null,
  status text default 'pending', -- pending, accepted, declined
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reviews & Ratings: User reviews for dining experiences
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewee_id uuid not null references auth.users(id) on delete cascade,
  slot_id uuid references public.dining_slots(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(reviewer_id, reviewee_id, slot_id)
);

-- Messages: Real-time chat between slot members
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.dining_slots(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Locations: User-created locations/cities
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  latitude float,
  longitude float,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- User Restaurants: Restaurants added by users
create table if not exists public.user_restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  cuisine text,
  rating float default 4.5,
  distance_km float default 1.0,
  emoji text default '🍽️',
  created_by uuid references auth.users(id) on delete set null,
  is_real boolean default false,
  created_at timestamptz default now()
);

-- ===== Create Indexes =====

create index if not exists idx_availability_date_time 
  on public.availability(date, time);

create index if not exists idx_availability_restaurant 
  on public.availability(restaurant_id);

create index if not exists idx_availability_created_by 
  on public.availability(created_by);

create index if not exists idx_dining_slots_date_time
  on public.dining_slots(slot_date, slot_time);

create index if not exists idx_dining_slots_location
  on public.dining_slots(location);

create index if not exists idx_dining_slots_created_by
  on public.dining_slots(created_by);

create index if not exists idx_slot_members_slot_id
  on public.slot_members(slot_id);

create index if not exists idx_slot_members_user_id
  on public.slot_members(user_id);

create index if not exists idx_dining_requests_from_user
  on public.dining_requests(from_user_id);

create index if not exists idx_dining_requests_to_user
  on public.dining_requests(to_user_id);

create index if not exists idx_dining_requests_status
  on public.dining_requests(status);

create index if not exists idx_reviews_reviewer
  on public.reviews(reviewer_id);

create index if not exists idx_reviews_reviewee
  on public.reviews(reviewee_id);

create index if not exists idx_reviews_slot
  on public.reviews(slot_id);

create index if not exists idx_messages_slot
  on public.messages(slot_id);

create index if not exists idx_messages_sender
  on public.messages(sender_id);

create index if not exists idx_messages_created
  on public.messages(created_at);

-- ===== Enable Row Level Security =====

alter table public.profiles enable row level security;
alter table public.availability enable row level security;
alter table public.dining_slots enable row level security;
alter table public.slot_members enable row level security;
alter table public.dining_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

-- ===== RLS Policies for Profiles =====

-- Users can view their own profile
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

-- Users can update their own profile
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Users can insert their own profile
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- ===== RLS Policies for Availability =====

-- Anyone can view all availability (no restriction)
drop policy if exists "Anyone can view availability" on public.availability;
create policy "Anyone can view availability"
on public.availability
for select
using (true);

-- Authenticated users can create availability
drop policy if exists "Users can create availability" on public.availability;
create policy "Users can create availability"
on public.availability
for insert
with check (true);

-- Users can delete their own availability
drop policy if exists "Users can delete their own availability" on public.availability;
create policy "Users can delete their own availability"
on public.availability
for delete
using (auth.uid() = created_by or created_by is null);

-- ===== RLS Policies for Dining Slots =====

-- Anyone can view all slots (discovery)
drop policy if exists "Anyone can view slots" on public.dining_slots;
create policy "Anyone can view slots"
on public.dining_slots
for select
using (true);

-- Users can create slots
drop policy if exists "Users can create slots" on public.dining_slots;
create policy "Users can create slots"
on public.dining_slots
for insert
with check (auth.uid() = created_by);

-- Users can delete their own slots
drop policy if exists "Users can delete own slots" on public.dining_slots;
create policy "Users can delete own slots"
on public.dining_slots
for delete
using (auth.uid() = created_by);

-- ===== RLS Policies for Slot Members =====

-- Anyone can view slot members
drop policy if exists "Anyone can view slot members" on public.slot_members;
create policy "Anyone can view slot members"
on public.slot_members
for select
using (true);

-- Users can join slots
drop policy if exists "Users can join slots" on public.slot_members;
create policy "Users can join slots"
on public.slot_members
for insert
with check (auth.uid() = user_id);

-- Users can leave slots
drop policy if exists "Users can leave slots" on public.slot_members;
create policy "Users can leave slots"
on public.slot_members
for delete
using (auth.uid() = user_id);

-- ===== RLS Policies for Dining Requests =====

-- Users can view their requests
drop policy if exists "Users can view their requests" on public.dining_requests;
create policy "Users can view their requests"
on public.dining_requests
for select
using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Users can send requests
drop policy if exists "Users can send requests" on public.dining_requests;
create policy "Users can send requests"
on public.dining_requests
for insert
with check (auth.uid() = from_user_id);

-- Users can update requests
drop policy if exists "Users can update requests" on public.dining_requests;
create policy "Users can update requests"
on public.dining_requests
for update
using (auth.uid() = to_user_id)
with check (auth.uid() = to_user_id);

-- ===== RLS Policies for Reviews =====

-- Users can view reviews about them and reviews they wrote
drop policy if exists "Users can view reviews" on public.reviews;
create policy "Users can view reviews"
on public.reviews
for select
using (auth.uid() = reviewer_id or auth.uid() = reviewee_id);

-- Users can create reviews
drop policy if exists "Users can create reviews" on public.reviews;
create policy "Users can create reviews"
on public.reviews
for insert
with check (auth.uid() = reviewer_id);

-- Users can update their own reviews
drop policy if exists "Users can update own reviews" on public.reviews;
create policy "Users can update own reviews"
on public.reviews
for update
using (auth.uid() = reviewer_id)
with check (auth.uid() = reviewer_id);

-- ===== RLS Policies for Messages =====

-- Users in a slot can view messages
drop policy if exists "Slot members can view messages" on public.messages;
create policy "Slot members can view messages"
on public.messages
for select
using (
  exists (
    select 1 from public.slot_members
    where slot_members.slot_id = messages.slot_id
    and slot_members.user_id = auth.uid()
  )
);

-- Users can send messages to slots they're in
drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages"
on public.messages
for insert
with check (
  auth.uid() = sender_id and
  exists (
    select 1 from public.slot_members
    where slot_members.slot_id = messages.slot_id
    and slot_members.user_id = auth.uid()
  )
);

-- ===== Schema Comments =====

comment on table public.profiles is 'User profiles linked to Supabase auth.users';
comment on table public.availability is 'Dining availability slots that users post';
comment on column public.profiles.id is 'User ID from auth.users';
comment on column public.availability.created_by is 'User who created this slot, nullable for backward compatibility';
