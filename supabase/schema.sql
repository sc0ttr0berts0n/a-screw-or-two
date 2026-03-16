-- ============================================================
-- A Screw or Two — Community Kit System
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Profiles (extends auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  display_name text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    -- Generate a temporary username from email or random
    coalesce(
      split_part(new.email, '@', 1),
      'user-' || substr(new.id::text, 1, 8)
    ),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. Community Kits
create table public.community_kits (
  id                  uuid primary key default gen_random_uuid(),
  author_id           uuid not null references public.profiles(id) on delete cascade,
  slug                text unique not null,
  title               text not null,
  description         text,
  project_url         text,
  tags                text[] default '{}',
  category            text check (category in ('3d-printer','cnc','robotics','electronics','drone','woodworking','other')),
  status              text not null default 'draft' check (status in ('draft','published','archived')),
  version             integer not null default 1,
  retail_total_cents  integer,
  item_count          integer,
  view_count          integer not null default 0,
  cart_add_count      integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  published_at        timestamptz
);

alter table public.community_kits enable row level security;

-- Anyone can view published kits
create policy "Published kits are viewable by everyone"
  on public.community_kits for select
  using (status = 'published' or auth.uid() = author_id);

-- Authenticated users can create kits
create policy "Authenticated users can create kits"
  on public.community_kits for insert
  with check (auth.uid() = author_id);

-- Authors can update their own kits
create policy "Authors can update their own kits"
  on public.community_kits for update
  using (auth.uid() = author_id);

-- Authors can delete their own kits
create policy "Authors can delete their own kits"
  on public.community_kits for delete
  using (auth.uid() = author_id);

-- Index for slug lookup
create index idx_kits_slug on public.community_kits(slug);
-- Index for browse page (published kits by date)
create index idx_kits_published on public.community_kits(status, published_at desc) where status = 'published';
-- Index for user's kits
create index idx_kits_author on public.community_kits(author_id);
-- Index for tag search
create index idx_kits_tags on public.community_kits using gin(tags);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.community_kits
  for each row execute function public.update_updated_at();


-- 3. Kit Items (BOM line items)
create table public.kit_items (
  id              uuid primary key default gen_random_uuid(),
  kit_id          uuid not null references public.community_kits(id) on delete cascade,
  product_id      text not null,
  product_spec    jsonb not null,
  quantity        integer not null check (quantity > 0),
  note            text,
  sort_order      integer not null default 0,
  unit_price_cents integer not null
);

alter table public.kit_items enable row level security;

-- Kit items inherit visibility from their parent kit
create policy "Kit items are viewable if kit is viewable"
  on public.kit_items for select
  using (
    exists (
      select 1 from public.community_kits
      where id = kit_items.kit_id
      and (status = 'published' or auth.uid() = author_id)
    )
  );

-- Authors can manage items in their own kits
create policy "Authors can insert kit items"
  on public.kit_items for insert
  with check (
    exists (
      select 1 from public.community_kits
      where id = kit_items.kit_id and auth.uid() = author_id
    )
  );

create policy "Authors can update kit items"
  on public.kit_items for update
  using (
    exists (
      select 1 from public.community_kits
      where id = kit_items.kit_id and auth.uid() = author_id
    )
  );

create policy "Authors can delete kit items"
  on public.kit_items for delete
  using (
    exists (
      select 1 from public.community_kits
      where id = kit_items.kit_id and auth.uid() = author_id
    )
  );

create index idx_kit_items_kit on public.kit_items(kit_id);


-- 4. Analytics RPC functions (bypass RLS for anonymous increments)
create or replace function public.increment_kit_view(kit_id uuid)
returns void as $$
begin
  update public.community_kits
  set view_count = view_count + 1
  where id = kit_id and status = 'published';
end;
$$ language plpgsql security definer;

create or replace function public.increment_kit_cart_add(kit_id uuid)
returns void as $$
begin
  update public.community_kits
  set cart_add_count = cart_add_count + 1
  where id = kit_id and status = 'published';
end;
$$ language plpgsql security definer;
