-- Track standalone N-Genius checkouts independently of delivery orders.
create table if not exists public.ngenius_special_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkout_code text not null check (checkout_code = 'AZLMNQ2'),
  amount_fils integer not null check (amount_fils = 2000),
  currency text not null default 'AED' check (currency = 'AED'),
  ngenius_order_reference text not null unique,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);
create index if not exists ngenius_special_payments_user_idx
  on public.ngenius_special_payments(user_id, created_at desc);
alter table public.ngenius_special_payments enable row level security;
create policy "special_payments_select_own"
  on public.ngenius_special_payments for select to authenticated
  using ((select auth.uid()) = user_id);
revoke insert, update, delete on public.ngenius_special_payments from anon, authenticated;
grant select on public.ngenius_special_payments to authenticated;
