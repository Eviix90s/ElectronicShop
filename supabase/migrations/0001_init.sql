-- ============================================================================
-- ElectronicShop — esquema inicial para Supabase (Postgres 15+)
--
-- Tablas: categories, products, profiles, orders, order_items
-- Seguridad: RLS activado en todas las tablas.
--   - categories / products: lectura pública.
--   - profiles: cada usuario lee y actualiza solo su perfil; se crea
--     automáticamente al registrarse (trigger sobre auth.users).
--   - orders: cualquiera puede insertar (checkout de invitado); solo el
--     dueño (user_id = auth.uid()) puede leer. No se permite leer por correo.
--   - order_items: mismas reglas que orders, vía join.
-- Los pedidos de invitado se crean con la función create_order(), que valida
-- precios y stock en el servidor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Utilidades
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
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
  full_name  text,
  phone      text,
  program    text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos públicos del usuario; se crea automáticamente al registrarse.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, program)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'program'
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
  name       text not null,
  email      text not null,
  phone      text not null,
  delivery   text not null check (delivery in ('campus', 'envio')),
  address    text null,
  payment    text not null check (payment in ('tarjeta', 'paypal', 'efectivo')),
  notes      text null,
  subtotal   numeric(10, 2) not null check (subtotal >= 0),
  shipping   numeric(10, 2) not null default 0 check (shipping >= 0),
  total      numeric(10, 2) not null check (total >= 0),
  status     text not null default 'pendiente'
             check (status in ('pendiente', 'pagado', 'listo', 'entregado', 'cancelado')),
  created_at timestamptz not null default now(),
  constraint orders_address_required_for_envio
    check (delivery <> 'envio' or (address is not null and length(trim(address)) > 0))
);

comment on table public.orders is 'Pedidos. user_id es null en compras de invitado.';

create index orders_user_id_idx on public.orders (user_id) where user_id is not null;
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);
create index orders_email_idx on public.orders (lower(email));

-- Los renglones guardan nombre y precio como "foto" del momento de la compra,
-- por eso product_slug no tiene llave foránea: el historial no debe romperse
-- si un producto se retira del catálogo.
create table public.order_items (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_slug text not null,
  name         text not null,
  unit_price   numeric(10, 2) not null check (unit_price >= 0),
  qty          int not null check (qty > 0)
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
as $$
  select case when p_delivery = 'envio' then 99.00 else 0.00 end;
$$;

-- ----------------------------------------------------------------------------
-- create_order: crea un pedido (invitado o autenticado) de forma atómica.
-- Calcula subtotal y total con los precios del catálogo (no confía en el
-- cliente), valida stock y lo descuenta. Devuelve el id del pedido.
--
-- p_order: {"name","email","phone","delivery","address","payment","notes"}
-- p_items: [{"slug": "...", "qty": 1}, ...]
-- ----------------------------------------------------------------------------
create or replace function public.create_order(p_order jsonb, p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_subtotal numeric(10, 2) := 0;
  v_shipping numeric(10, 2) := 0;
  v_item     jsonb;
  v_product  public.products%rowtype;
  v_qty      int;
  v_delivery text := p_order ->> 'delivery';
  v_payment  text := p_order ->> 'payment';
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no contiene productos';
  end if;
  if coalesce(trim(p_order ->> 'name'), '') = '' then
    raise exception 'Falta el nombre';
  end if;
  if coalesce(trim(p_order ->> 'email'), '') = '' then
    raise exception 'Falta el correo';
  end if;
  if coalesce(trim(p_order ->> 'phone'), '') = '' then
    raise exception 'Falta el teléfono';
  end if;
  if v_delivery not in ('campus', 'envio') then
    raise exception 'Método de entrega inválido';
  end if;
  if v_payment not in ('tarjeta', 'paypal', 'efectivo') then
    raise exception 'Método de pago inválido';
  end if;

  -- Validar renglones y calcular el subtotal con precios del catálogo.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item ->> 'qty')::int, 0);
    if v_qty <= 0 then
      raise exception 'Cantidad inválida para %', v_item ->> 'slug';
    end if;

    select * into v_product
    from public.products
    where slug = v_item ->> 'slug'
    for update;

    if not found then
      raise exception 'Producto no encontrado: %', v_item ->> 'slug';
    end if;
    if v_product.stock < v_qty then
      raise exception 'Sin existencias suficientes de %', v_product.name;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  v_shipping := public.shipping_cost(v_delivery);

  insert into public.orders (
    user_id, name, email, phone, delivery, address, payment, notes,
    subtotal, shipping, total
  )
  values (
    auth.uid(),
    trim(p_order ->> 'name'),
    lower(trim(p_order ->> 'email')),
    trim(p_order ->> 'phone'),
    v_delivery,
    nullif(trim(p_order ->> 'address'), ''),
    v_payment,
    nullif(trim(p_order ->> 'notes'), ''),
    v_subtotal,
    v_shipping,
    v_subtotal + v_shipping
  )
  returning id into v_order_id;

  -- Insertar renglones y descontar stock.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'qty')::int;

    select * into v_product
    from public.products
    where slug = v_item ->> 'slug';

    insert into public.order_items (order_id, product_slug, name, unit_price, qty)
    values (v_order_id, v_product.slug, v_product.name, v_product.price, v_qty);

    update public.products
    set stock = stock - v_qty
    where slug = v_product.slug;
  end loop;

  return v_order_id;
end;
$$;

revoke all on function public.create_order(jsonb, jsonb) from public;
grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.profiles    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Catálogo: lectura pública (escritura solo con service role / dashboard).
create policy "categories_public_read"
  on public.categories for select
  using (true);

create policy "products_public_read"
  on public.products for select
  using (true);

-- Perfiles: solo el dueño.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Pedidos: cualquiera puede insertar (invitado con user_id null, o el propio
-- usuario). Solo el dueño autenticado puede leer; no hay lectura por correo.
create policy "orders_insert_anyone"
  on public.orders for insert
  with check (user_id is null or user_id = auth.uid());

create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() is not null and user_id = auth.uid());

-- Renglones: mismas reglas que el pedido padre, vía join.
-- Los invitados no pueden ver su pedido después de crearlo, así que sus
-- renglones solo se insertan a través de create_order().
create policy "order_items_insert_own_order"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

create policy "order_items_select_own_order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Permisos base para los roles de la API
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.orders, public.order_items to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
