-- ==============================================================================
-- Migration: Add Dedicated Categories Table
-- ==============================================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (business_id, name)
);

create index if not exists categories_business_idx on public.categories (business_id);

-- Enable Row Level Security
alter table public.categories enable row level security;

-- Policies for Multi-Tenant Access
create policy "categories_select"
  on public.categories
  for select
  using (public.is_member(business_id));

create policy "categories_insert"
  on public.categories
  for insert
  with check (public.is_member(business_id));

create policy "categories_update"
  on public.categories
  for update
  using (public.is_member(business_id));

create policy "categories_delete"
  on public.categories
  for delete
  using (public.is_member(business_id, array['owner','manager']));
