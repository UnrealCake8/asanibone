create or replace function public.admin_list_orders()
returns setof public.orders
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'Forbidden';
  end if;
  return query select * from public.orders order by created_at desc limit 200;
end;
$$;

revoke all on function public.admin_list_orders() from public, anon;
grant execute on function public.admin_list_orders() to authenticated;

create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status public.order_status,
  p_note text default null
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'Forbidden';
  end if;

  update public.orders set status = p_status where id = p_order_id returning * into v_order;
  if v_order.id is null then raise exception 'Order not found'; end if;

  insert into public.order_events(order_id,status,note)
  values (v_order.id,p_status,nullif(left(trim(coalesce(p_note,'')),1000),''));

  return v_order;
end;
$$;

revoke all on function public.admin_update_order_status(uuid,public.order_status,text) from public, anon;
grant execute on function public.admin_update_order_status(uuid,public.order_status,text) to authenticated;
