alter table public.orders
  add column if not exists ngenius_order_reference text unique;

comment on column public.orders.ngenius_order_reference is
  'Network International N-Genius order reference for hosted checkout verification.';
