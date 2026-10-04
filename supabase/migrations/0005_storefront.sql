-- Storefront foundation: merchants and products
create table public.merchants (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), description text, logo_url text, cover_url text,
  active boolean not null default true, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(), merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160), description text, image_url text,
  price numeric(10,2) not null check (price >= 0), compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= price),
  in_stock boolean not null default true, active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index merchants_active_sort_idx on public.merchants(active, sort_order, name);
create index products_merchant_active_sort_idx on public.products(merchant_id, active, sort_order, name);
alter table public.merchants enable row level security; alter table public.products enable row level security;
create policy "active_merchants_public_read" on public.merchants for select to anon, authenticated using (active = true);
create policy "active_products_public_read" on public.products for select to anon, authenticated using (active = true and exists (select 1 from public.merchants m where m.id = products.merchant_id and m.active = true));
grant select on public.merchants, public.products to anon, authenticated;
create trigger merchants_touch_updated_at before update on public.merchants for each row execute procedure private.touch_updated_at();
create trigger products_touch_updated_at before update on public.products for each row execute procedure private.touch_updated_at();
