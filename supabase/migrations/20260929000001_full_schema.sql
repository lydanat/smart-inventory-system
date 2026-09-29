-- ==============================================================================
-- Smart Inventory AI: Complete Schema, Extensions, RLS, Functions, and Triggers
-- ==============================================================================

-- 1. Extensions
create extension if not exists "pg_trgm" with schema extensions;
create extension if not exists "pg_net" with schema extensions;

-- Note: pg_cron is usually enabled by Supabase Dashboard in extension schema.
-- We safely try to create it if available.
do $$
begin
  create extension if not exists "pg_cron" with schema extensions;
exception when others then
  null; -- Ignore if restricted on hosted Supabase
end $$;

-- 2. Tenants & Roles
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  telegram_chat_id bigint unique,
  telegram_linked_at timestamptz,
  alerts_enabled boolean not null default true,
  timezone text not null default 'Asia/Phnom_Penh',
  currency text not null default 'USD' check (char_length(currency) = 3),
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','manager','staff')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);
create index on public.business_members (user_id);

-- Membership helper used by every RLS policy.
create or replace function public.is_member(
  _business_id uuid,
  _roles text[] default array['owner','manager','staff']
) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.business_members m
    where m.business_id = _business_id
      and m.user_id = (select auth.uid())
      and m.role = any (_roles)
  );
$$;
revoke all on function public.is_member(uuid, text[]) from public, anon;
grant execute on function public.is_member(uuid, text[]) to authenticated;

-- 3. Suppliers & Items (Catalogue)
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  contact_name text check (char_length(contact_name) <= 120),
  phone text check (char_length(phone) <= 40),
  email text check (char_length(email) <= 200),
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);
create index on public.suppliers (business_id);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  sku text check (sku is null or char_length(sku) <= 64),
  category text not null default 'Uncategorized' check (char_length(category) between 1 and 80),
  unit text not null default 'pcs' check (char_length(unit) between 1 and 20),
  quantity integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  cost_price numeric(12,2) check (cost_price is null or cost_price >= 0),
  price numeric(12,2) not null default 0 check (price >= 0),
  expiry_date date,
  notes text check (char_length(notes) <= 1000),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index items_sku_uniq on public.items (business_id, lower(sku))
  where sku is not null and archived_at is null;
create index items_business_idx on public.items (business_id) where archived_at is null;
create index items_low_idx on public.items (business_id)
  where archived_at is null and quantity <= low_stock_threshold;
create index items_expiry_idx on public.items (business_id, expiry_date)
  where archived_at is null and expiry_date is not null;
create index items_name_trgm on public.items using gin (name extensions.gin_trgm_ops);

-- Stock movements: real signal for velocity and overstock
create table public.stock_movements (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason text not null check (reason in ('sale','restock','adjustment','expired','damaged','initial')),
  note text check (char_length(note) <= 300),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index on public.stock_movements (item_id, created_at desc);
create index on public.stock_movements (business_id, created_at desc);

-- Atomic stock change RPC
create or replace function public.adjust_stock(
  _item_id uuid, _delta integer, _reason text, _note text default null
) returns public.items
language plpgsql security invoker set search_path = ''
as $$
declare _item public.items;
begin
  update public.items
     set quantity = quantity + _delta, updated_at = now()
   where id = _item_id and archived_at is null
   returning * into _item;
  if not found then
    raise exception 'item_not_found' using errcode = 'P0002';
  end if;
  insert into public.stock_movements (business_id, item_id, delta, reason, note, created_by)
  values (_item.business_id, _item.id, _delta, _reason, _note, (select auth.uid()));
  return _item;
end $$;

-- 4. Alerts, AI, Links, Rate Limits, Audit
create table public.alert_events (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  kind text not null check (kind in ('low_stock','expiring','expired')),
  dedupe_day date not null default current_date,
  status text not null default 'sent' check (status in ('pending','sent','failed')),
  detail text,
  created_at timestamptz not null default now()
);
create unique index alert_events_dedupe on public.alert_events (item_id, kind, dedupe_day);
create index on public.alert_events (business_id, created_at desc);

create table public.ai_recommendations (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  input_hash text not null,
  payload jsonb not null,
  source text not null default 'gemini' check (source in ('gemini','rules_only')),
  generated_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index on public.ai_recommendations (business_id, generated_at desc);

create table public.telegram_link_codes (
  code_hash text primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count integer not null
);

create or replace function public.check_rate_limit(_key text, _max integer, _window interval)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare _count integer;
begin
  insert into public.rate_limits (key, window_start, count)
  values (_key, now(), 1)
  on conflict (key) do update set
    window_start = case when public.rate_limits.window_start < now() - _window
                        then now() else public.rate_limits.window_start end,
    count = case when public.rate_limits.window_start < now() - _window
                 then 1 else public.rate_limits.count + 1 end
  returning count into _count;
  return _count <= _max;
end $$;
revoke all on function public.check_rate_limit(text, integer, interval) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, interval) to service_role;

create table public.ai_feedback (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  recommendation_id bigint not null references public.ai_recommendations(id) on delete cascade,
  section text not null check (section in ('marketing','restock','suppliers')),
  item_index integer not null check (item_index >= 0),
  rating text not null check (rating in ('up','down')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create unique index ai_feedback_uniq on public.ai_feedback (recommendation_id, section, item_index, created_by);

create table public.audit_log (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index on public.audit_log (business_id, created_at desc);

-- 5. Triggers
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  _raw_name text;
  _business_name text;
  _business_id uuid;
begin
  _raw_name := coalesce(new.raw_user_meta_data->>'business_name', 'My Store');
  _business_name := substring(btrim(_raw_name) from 1 for 120);
  if char_length(_business_name) < 1 then
    _business_name := 'My Store';
  end if;

  insert into public.businesses (name)
  values (_business_name)
  returning id into _business_id;

  insert into public.business_members (business_id, user_id, role)
  values (_business_id, new.id, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_items_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

create or replace function public.audit_items()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  _action text;
  _meta jsonb;
begin
  if TG_OP = 'INSERT' then
    _action := 'item.create';
    _meta := jsonb_build_object('name', new.name, 'sku', new.sku);
    insert into public.audit_log (business_id, actor_id, action, entity_id, metadata)
    values (new.business_id, (select auth.uid()), _action, new.id, _meta);
  elsif TG_OP = 'UPDATE' then
    if old.archived_at is null and new.archived_at is not null then
      _action := 'item.archive';
    elsif old.archived_at is not null and new.archived_at is null then
      _action := 'item.restore';
    else
      _action := 'item.update';
    end if;
    _meta := jsonb_build_object(
      'quantity_old', old.quantity,
      'quantity_new', new.quantity,
      'price_old', old.price,
      'price_new', new.price
    );
    insert into public.audit_log (business_id, actor_id, action, entity_id, metadata)
    values (new.business_id, (select auth.uid()), _action, new.id, _meta);
  end if;
  return coalesce(new, old);
end;
$$;

create trigger items_audit_trg
  after insert or update on public.items
  for each row execute function public.audit_items();

-- 6. Dashboard Aggregates Function
create or replace function public.dashboard_summary(_business_id uuid)
returns jsonb
language sql stable security invoker set search_path = ''
as $$
  select jsonb_build_object(
    'total_items', coalesce(count(*), 0),
    'low_stock_count', coalesce(count(*) filter (where quantity > 0 and quantity <= low_stock_threshold), 0),
    'out_of_stock_count', coalesce(count(*) filter (where quantity = 0), 0),
    'expiring_soon_count', coalesce(count(*) filter (where expiry_date is not null and expiry_date between current_date and current_date + 7 and quantity > 0), 0),
    'expired_count', coalesce(count(*) filter (where expiry_date is not null and expiry_date < current_date and quantity > 0), 0),
    'total_stock_value', coalesce(sum(quantity * price), 0)
  )
  from public.items
  where business_id = _business_id
    and archived_at is null;
$$;

-- 7. Enable RLS on EVERY table
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.suppliers enable row level security;
alter table public.items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.alert_events enable row level security;
alter table public.ai_recommendations enable row level security;
alter table public.telegram_link_codes enable row level security;
alter table public.rate_limits enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.audit_log enable row level security;

-- 8. RLS Policies
-- businesses: members select, owners update
create policy businesses_select on public.businesses for select to authenticated
  using (public.is_member(id));
create policy businesses_update on public.businesses for update to authenticated
  using (public.is_member(id, array['owner'])) with check (public.is_member(id, array['owner']));

-- business_members: a user can only see their own memberships
create policy members_select on public.business_members for select to authenticated
  using (user_id = (select auth.uid()));

-- suppliers: members select, insert, update; owner/manager delete
create policy suppliers_select on public.suppliers for select to authenticated
  using (public.is_member(business_id));
create policy suppliers_insert on public.suppliers for insert to authenticated
  with check (public.is_member(business_id));
create policy suppliers_update on public.suppliers for update to authenticated
  using (public.is_member(business_id)) with check (public.is_member(business_id));
create policy suppliers_delete on public.suppliers for delete to authenticated
  using (public.is_member(business_id, array['owner','manager']));

-- items: members select, insert, update; owner/manager delete
create policy items_select on public.items for select to authenticated
  using (public.is_member(business_id));
create policy items_insert on public.items for insert to authenticated
  with check (public.is_member(business_id));
create policy items_update on public.items for update to authenticated
  using (public.is_member(business_id)) with check (public.is_member(business_id));
create policy items_delete on public.items for delete to authenticated
  using (public.is_member(business_id, array['owner','manager']));

-- stock_movements: members select only; inserts are performed via adjust_stock RPC
create policy stock_movements_select on public.stock_movements for select to authenticated
  using (public.is_member(business_id));
create policy stock_movements_insert on public.stock_movements for insert to authenticated
  with check (public.is_member(business_id));

-- alert_events: members select only; inserts handled by server cron
create policy alert_events_select on public.alert_events for select to authenticated
  using (public.is_member(business_id));

-- ai_recommendations: members select only; inserts handled by server AI service
create policy ai_recommendations_select on public.ai_recommendations for select to authenticated
  using (public.is_member(business_id));

-- ai_feedback: members select; authenticated users insert feedback for their business
create policy ai_feedback_select on public.ai_feedback for select to authenticated
  using (public.is_member(business_id));
create policy ai_feedback_insert on public.ai_feedback for insert to authenticated
  with check (public.is_member(business_id) and created_by = (select auth.uid()));

-- audit_log: owner/manager select only; written via security definer trigger
create policy audit_log_select on public.audit_log for select to authenticated
  using (public.is_member(business_id, array['owner','manager']));

-- rate_limits and telegram_link_codes: RLS ON, NO policies -> access denied to all clients, service_role only.
