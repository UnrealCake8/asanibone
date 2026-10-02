create extension if not exists pgcrypto;

create type public.order_status as enum (
  'draft','awaiting_payment','paid','finding_courier','courier_assigned',
  'heading_to_store','at_store','purchased','delivering','delivered','cancelled','failed'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.order_status not null default 'awaiting_payment',
  item_description text not null check (char_length(item_description) between 2 and 2000),
  product_url text,
  store_name text not null,
  store_location text not null,
  estimated_item_price numeric(10,2) not null check (estimated_item_price >= 0),
  price_buffer numeric(10,2) not null default 0 check (price_buffer >= 0),
  item_allowance numeric(10,2) not null check (item_allowance >= 0),
  delivery_fee numeric(10,2) not null check (delivery_fee >= 0),
  service_fee numeric(10,2) not null check (service_fee >= 0),
  payment_fee numeric(10,2) not null check (payment_fee >= 0),
  quoted_total numeric(10,2) not null check (quoted_total >= 0),
  final_item_price numeric(10,2),
  delivery_address text not null,
  delivery_notes text,
  phone text not null,
  courier_provider text not null default 'manual',
  courier_reference text,
  receipt_url text,
  ziina_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  created_at timestamptz not null default now()
);

create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index orders_status_created_idx on public.orders(status, created_at desc);
create index order_events_order_created_idx on public.order_events(order_id, created_at);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "orders_select_own" on public.orders for select to authenticated
using ((select auth.uid()) = user_id);

create policy "order_events_select_own" on public.order_events for select to authenticated
using (exists (
  select 1 from public.orders o
  where o.id = order_events.order_id and o.user_id = (select auth.uid())
));

revoke insert, update, delete on public.orders from anon, authenticated;
revoke insert, update, delete on public.order_events from anon, authenticated;
grant select on public.orders, public.order_events to authenticated;
grant select, update on public.profiles to authenticated;
