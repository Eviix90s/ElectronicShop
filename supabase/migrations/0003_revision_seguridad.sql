-- ============================================================================
-- ElectronicShop — ajustes tras la revisión de seguridad
--
-- 1. Envío: la base cobraba $99 siempre; la tienda promete envío gratis desde
--    $1,500 (lib/cart/totals.ts). shipping_cost ahora recibe el subtotal.
-- 2. Límites de frecuencia: con peticiones en paralelo todas veían el conteo
--    antes de insertar. Un candado por transacción serializa create_order y
--    submit_contact, así el conteo siempre ve los pedidos previos.
-- ============================================================================

drop function public.shipping_cost(text);

create function public.shipping_cost(p_delivery text, p_subtotal numeric)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case when p_delivery = 'envio' and p_subtotal < 1500 then 99.00 else 0.00 end;
$$;

revoke all on function public.shipping_cost(text, numeric) from public, anon, authenticated;

create or replace function public.create_order(p_order jsonb, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_subtotal numeric(10, 2) := 0;
  v_shipping numeric(10, 2);
  v_name     text;
  v_email    text;
  v_phone    text;
  v_delivery text;
  v_payment  text;
  v_address  text;
  v_notes    text;
  v_line     record;
  v_product  record;
begin
  if jsonb_typeof(p_order) is distinct from 'object' then
    raise exception 'Pedido inválido';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no contiene productos';
  end if;
  if jsonb_array_length(p_items) > 30 then
    raise exception 'Demasiados productos en un pedido';
  end if;

  v_name     := trim(coalesce(p_order ->> 'name', ''));
  v_email    := lower(trim(coalesce(p_order ->> 'email', '')));
  v_phone    := trim(coalesce(p_order ->> 'phone', ''));
  v_delivery := p_order ->> 'delivery';
  v_payment  := p_order ->> 'payment';
  v_address  := nullif(trim(coalesce(p_order ->> 'address', '')), '');
  v_notes    := nullif(trim(coalesce(p_order ->> 'notes', '')), '');

  if char_length(v_name) not between 2 and 80 then
    raise exception 'Nombre inválido';
  end if;
  if char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Correo inválido';
  end if;
  if v_phone !~ '^[0-9+() -]{8,20}$' then
    raise exception 'Teléfono inválido';
  end if;
  if v_delivery is null or v_delivery not in ('campus', 'envio') then
    raise exception 'Método de entrega inválido';
  end if;
  if v_payment is null or v_payment not in ('tarjeta', 'paypal', 'efectivo') then
    raise exception 'Método de pago inválido';
  end if;
  if v_delivery = 'envio' and (v_address is null or char_length(v_address) < 8) then
    raise exception 'Falta la dirección de envío';
  end if;
  if char_length(coalesce(v_address, '')) > 200 or char_length(coalesce(v_notes, '')) > 500 then
    raise exception 'Texto demasiado largo';
  end if;

  -- Cada renglón debe ser {"slug": texto, "qty": entero de 1 a 3 cifras}.
  if exists (
    select 1
    from jsonb_array_elements(p_items) as e
    where jsonb_typeof(e) <> 'object'
       or jsonb_typeof(e -> 'slug') is distinct from 'string'
       or char_length(e ->> 'slug') > 80
       or jsonb_typeof(e -> 'qty') is distinct from 'number'
       or (e ->> 'qty') !~ '^[0-9]{1,3}$'
  ) then
    raise exception 'Productos inválidos';
  end if;

  -- Candado hasta el fin de la transacción: los pedidos se crean de uno en uno
  -- y el límite de frecuencia no se puede saltar con peticiones en paralelo.
  perform pg_advisory_xact_lock(hashtext('create_order'));

  if (select count(*) from public.orders o
      where o.email = v_email and o.created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.orders o
         where o.created_at > now() - interval '1 minute') >= 20 then
    raise exception 'Demasiados pedidos seguidos. Intenta más tarde.';
  end if;

  -- Validar renglones agrupados y calcular el subtotal con precios del catálogo.
  for v_line in
    select e ->> 'slug' as slug, sum((e ->> 'qty')::int) as qty
    from jsonb_array_elements(p_items) as e
    group by e ->> 'slug'
  loop
    if v_line.qty not between 1 and 99 then
      raise exception 'Cantidad inválida para %', v_line.slug;
    end if;

    select p.slug, p.name, p.price, p.stock into v_product
    from public.products p
    where p.slug = v_line.slug;

    if not found then
      raise exception 'Producto no encontrado: %', v_line.slug;
    end if;
    if v_product.stock < v_line.qty then
      raise exception 'Sin existencias suficientes de %', v_product.name;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_line.qty;
  end loop;

  v_shipping := public.shipping_cost(v_delivery, v_subtotal);

  insert into public.orders (
    user_id, name, email, phone, delivery, address, payment, notes,
    subtotal, shipping, total
  )
  values (
    auth.uid(), v_name, v_email, v_phone, v_delivery, v_address, v_payment, v_notes,
    v_subtotal, v_shipping, v_subtotal + v_shipping
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_slug, name, unit_price, qty)
  select v_order_id, p.slug, p.name, p.price, l.qty
  from (
    select e ->> 'slug' as slug, sum((e ->> 'qty')::int) as qty
    from jsonb_array_elements(p_items) as e
    group by e ->> 'slug'
  ) as l
  join public.products p on p.slug = l.slug;

  return v_order_id;
end;
$$;

create or replace function public.submit_contact(
  p_name text,
  p_email text,
  p_subject text,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name    text := trim(coalesce(p_name, ''));
  v_email   text := lower(trim(coalesce(p_email, '')));
  v_subject text := trim(coalesce(p_subject, ''));
  v_message text := trim(coalesce(p_message, ''));
begin
  if char_length(v_name) not between 2 and 80 then
    raise exception 'Nombre inválido';
  end if;
  if char_length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Correo inválido';
  end if;
  if char_length(v_subject) not between 3 and 120 then
    raise exception 'Asunto inválido';
  end if;
  if char_length(v_message) not between 10 and 2000 then
    raise exception 'Mensaje inválido';
  end if;

  -- Mismo candado que create_order: el conteo no se salta en paralelo.
  perform pg_advisory_xact_lock(hashtext('submit_contact'));

  -- Límite de frecuencia: 3 mensajes por correo por hora y 30 en total cada 10 minutos.
  if (select count(*) from public.contact_messages m
      where m.email = v_email and m.created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.contact_messages m
         where m.created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'Demasiados mensajes seguidos. Intenta más tarde.';
  end if;

  insert into public.contact_messages (name, email, subject, message)
  values (v_name, v_email, v_subject, v_message);
end;
$$;

-- create or replace conserva los permisos; se repiten para que el archivo se lea solo.
revoke all on function public.create_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;
revoke all on function public.submit_contact(text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_contact(text, text, text, text) to anon, authenticated;
