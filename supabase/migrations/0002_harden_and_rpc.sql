create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure private.handle_new_user();

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.touch_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute procedure private.touch_updated_at();

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
before update on public.orders
for each row execute procedure private.touch_updated_at();

create or replace function public.create_order(
  p_item_description text,
  p_product_url text,
  p_store_name text,
  p_store_location text,
  p_estimate numeric,
  p_buffer numeric,
  p_delivery_address text,
  p_delivery_notes text,
  p_phone text
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_allowance numeric(10,2);
  v_delivery numeric(10,2) := 20.00;
  v_service numeric(10,2) := 10.00;
  v_net numeric(10,2);
  v_payment numeric(10,2);
  v_total numeric(10,2);
  v_order public.orders;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_estimate is null or p_estimate < 0 or p_buffer is null or p_buffer < 0 then
    raise exception 'Invalid pricing input';
  end if;

  if char_length(trim(coalesce(p_item_description, ''))) < 2
     or char_length(trim(coalesce(p_store_name, ''))) < 1
     or char_length(trim(coalesce(p_store_location, ''))) < 1
     or char_length(trim(coalesce(p_delivery_address, ''))) < 1
     or char_length(trim(coalesce(p_phone, ''))) < 1 then
    raise exception 'Missing required fields';
  end if;

  v_allowance := round(p_estimate + p_buffer, 2);
  v_net := v_allowance + v_delivery + v_service;
  v_payment := ceil((((v_net + 1.00) / (1.00 - 0.026)) - v_net) * 100.00) / 100.00;
  v_total := v_net + v_payment;

  insert into public.orders (
    user_id, status, item_description, product_url, store_name, store_location,
    estimated_item_price, price_buffer, item_allowance, delivery_fee, service_fee,
    payment_fee, quoted_total, delivery_address, delivery_notes, phone
  )
  values (
    v_user_id, 'awaiting_payment', left(trim(p_item_description), 2000),
    nullif(left(trim(coalesce(p_product_url, '')), 2000), ''),
    left(trim(p_store_name), 200), left(trim(p_store_location), 500),
    p_estimate, p_buffer, v_allowance, v_delivery, v_service, v_payment, v_total,
    left(trim(p_delivery_address), 1000),
    nullif(left(trim(coalesce(p_delivery_notes, '')), 1000), ''),
    left(trim(p_phone), 50)
  )
  returning * into v_order;

  insert into public.order_events(order_id, status, note)
  values (v_order.id, 'awaiting_payment', 'Order created');

  return v_order;
end;
$$;

revoke all on function public.create_order(text,text,text,text,numeric,numeric,text,text,text) from public, anon;
grant execute on function public.create_order(text,text,text,text,numeric,numeric,text,text,text) to authenticated;
