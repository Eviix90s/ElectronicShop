-- ============================================================================
-- ElectronicShop — esquema inicial para Supabase (Postgres 15+)
--
-- Tablas: categories, products, profiles, orders, order_items
--
-- Seguridad, en capas:
--   - RLS activado en todas las tablas. Además se revoca todo a anon y
--     authenticated y se concede solo lo mínimo (Supabase concede todo por
--     defecto a las tablas nuevas de public).
--   - categories / products: solo lectura pública.
--   - profiles: cada usuario lee y edita solo su perfil (nombre, teléfono,
--     carrera). Lo crea un trigger al registrarse; nadie lo inserta por la API.
--   - orders / order_items: nadie inserta, edita ni borra por la API. Los
--     pedidos solo entran por create_order(), que valida cada campo, recalcula
--     precios con el catálogo, limita la frecuencia y no confía en el cliente.
--     Solo el dueño autenticado lee sus pedidos.
--   - El stock se descuenta cuando el pedido pasa a pagado (desde el panel),
--     no al crearlo: así nadie agota el inventario con pedidos falsos.
--   - Funciones con search_path vacío y nombres calificados. Sin SQL dinámico:
--     todo valor llega como parámetro, así que no hay inyección SQL.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Utilidades
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Catálogo
-- ----------------------------------------------------------------------------
create table public.categories (
  slug        text primary key,
  name        text not null,
  short_name  text not null,
  description text not null default '',
  icon        text not null default 'package',
  sort_order  int  not null default 0
);

comment on table public.categories is 'Categorías del catálogo. El slug coincide con CategorySlug en lib/data/types.ts.';

create table public.products (
  id                text primary key,
  slug              text not null unique,
  sku               text not null unique,
  name              text not null,
  category          text not null references public.categories (slug) on update cascade,
  price             numeric(10, 2) not null check (price >= 0),
  compare_at_price  numeric(10, 2) null check (compare_at_price is null or compare_at_price >= 0),
  stock             int not null default 0 check (stock >= 0),
  short_description text not null default '',
  description       text not null default '',
  specs             jsonb not null default '[]'::jsonb,
  image             text not null,
  model3d           text null check (model3d is null or model3d in ('board', 'resistor', 'capacitor', 'pir')),
  featured          boolean not null default false,
  tags              text[] not null default '{}',
  related_slugs     text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.products is 'Productos del catálogo. specs es un arreglo JSON de {label, value}.';
comment on column public.products.price is 'Precio en MXN con dos decimales.';

create index products_category_idx on public.products (category);
create index products_featured_idx on public.products (featured) where featured;
create index products_tags_gin_idx on public.products using gin (tags);
create index products_name_lower_idx on public.products (lower(name));

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '' check (char_length(full_name) <= 80),
  phone      text null check (phone is null or char_length(phone) <= 20),
  program    text null check (program is null or char_length(program) <= 80),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos del usuario; se crea automáticamente al registrarse.';

-- Los metadatos del registro los escribe el usuario, así que se recortan.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, program)
  values (
    new.id,
    left(coalesce(trim(new.raw_user_meta_data ->> 'full_name'), ''), 80),
    nullif(left(trim(new.raw_user_meta_data ->> 'phone'), 20), ''),
    nullif(left(trim(new.raw_user_meta_data ->> 'program'), 80), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Pedidos
-- ----------------------------------------------------------------------------
create table public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid null references auth.users (id) on delete set null,
  name       text not null check (char_length(name) between 2 and 80),
  email      text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone      text not null check (phone ~ '^[0-9+() -]{8,20}$'),
  delivery   text not null check (delivery in ('campus', 'envio')),
  address    text null check (address is null or char_length(address) <= 200),
  payment    text not null check (payment in ('tarjeta', 'paypal', 'efectivo')),
  notes      text null check (notes is null or char_length(notes) <= 500),
  subtotal   numeric(10, 2) not null check (subtotal >= 0),
  shipping   numeric(10, 2) not null default 0 check (shipping >= 0),
  total      numeric(10, 2) not null check (total >= 0),
  status     text not null default 'pendiente'
             check (status in ('pendiente', 'pagado', 'listo', 'entregado', 'cancelado')),
  created_at timestamptz not null default now(),
  constraint orders_address_required_for_envio
    check (delivery <> 'envio' or (address is not null and char_length(trim(address)) >= 8))
);

comment on table public.orders is 'Pedidos. user_id es null en compras de invitado. El estado se cambia desde el panel de Supabase.';

create index orders_user_id_idx on public.orders (user_id) where user_id is not null;
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);
create index orders_email_created_idx on public.orders (email, created_at desc);

-- Los renglones guardan nombre y precio como "foto" del momento de la compra,
-- por eso product_slug no tiene llave foránea: el historial no debe romperse
-- si un producto se retira del catálogo.
create table public.order_items (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_slug text not null,
  name         text not null,
  unit_price   numeric(10, 2) not null check (unit_price >= 0),
  qty          int not null check (qty between 1 and 99)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_slug_idx on public.order_items (product_slug);

-- ----------------------------------------------------------------------------
-- Costo de envío (un solo lugar para ajustarlo)
-- ----------------------------------------------------------------------------
create or replace function public.shipping_cost(p_delivery text)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case when p_delivery = 'envio' then 99.00 else 0.00 end;
$$;

-- ----------------------------------------------------------------------------
-- create_order: única puerta de entrada de los pedidos (invitado o con cuenta).
-- Valida cada campo, agrupa los renglones por producto, toma precios y stock
-- del catálogo y limita la frecuencia. Devuelve el id del pedido.
--
-- p_order: {"name","email","phone","delivery","address","payment","notes"}
-- p_items: [{"slug": "...", "qty": 1}, ...]
-- ----------------------------------------------------------------------------
create or replace function public.create_order(p_order jsonb, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_subtotal numeric(10, 2) := 0;
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

  -- Límite de frecuencia: frena pedidos falsos en masa.
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

  insert into public.orders (
    user_id, name, email, phone, delivery, address, payment, notes,
    subtotal, shipping, total
  )
  values (
    auth.uid(), v_name, v_email, v_phone, v_delivery, v_address, v_payment, v_notes,
    v_subtotal, public.shipping_cost(v_delivery), v_subtotal + public.shipping_cost(v_delivery)
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

-- ----------------------------------------------------------------------------
-- Stock: se descuenta al pasar a pagado y se devuelve si el pedido deja de
-- estarlo (por ejemplo, cancelado). Solo el panel o el service role cambian
-- el estado.
-- ----------------------------------------------------------------------------
create or replace function public.apply_order_stock()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_was_paid boolean := old.status in ('pagado', 'listo', 'entregado');
  v_is_paid  boolean := new.status in ('pagado', 'listo', 'entregado');
  v_item     record;
begin
  if v_is_paid and not v_was_paid then
    for v_item in select i.product_slug, i.qty from public.order_items i where i.order_id = new.id loop
      update public.products p
      set stock = p.stock - v_item.qty
      where p.slug = v_item.product_slug and p.stock >= v_item.qty;
      if not found then
        raise exception 'Sin existencias suficientes de % para marcar el pedido como pagado', v_item.product_slug;
      end if;
    end loop;
  elsif v_was_paid and not v_is_paid then
    for v_item in select i.product_slug, i.qty from public.order_items i where i.order_id = new.id loop
      update public.products p
      set stock = p.stock + v_item.qty
      where p.slug = v_item.product_slug;
    end loop;
  end if;
  return new;
end;
$$;

create trigger orders_apply_stock
  after update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.apply_order_stock();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.profiles    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Catálogo: lectura pública. Se escribe solo desde el panel o el service role.
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (true);

-- Perfiles: solo el dueño.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Pedidos y renglones: solo lectura del dueño. Sin políticas de escritura:
-- todo entra por create_order().
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "order_items_select_own_order"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = (select auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- Permisos mínimos por rol
-- ----------------------------------------------------------------------------
revoke all on table public.categories, public.products, public.profiles,
  public.orders, public.order_items from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on table public.categories, public.products to anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, phone, program) on table public.profiles to authenticated;
grant select on table public.orders, public.order_items to authenticated;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.apply_order_stock() from public, anon, authenticated;
revoke all on function public.shipping_cost(text) from public, anon, authenticated;
revoke all on function public.create_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;
