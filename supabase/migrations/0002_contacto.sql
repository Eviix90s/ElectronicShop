-- ============================================================================
-- ElectronicShop — mensajes del formulario de contacto
--
-- La web solo puede escribir mensajes a través de submit_contact(), que valida
-- cada campo y limita la frecuencia. Nadie puede leerlos por la API: se ven en
-- el panel de Supabase (Table Editor > contact_messages).
-- ============================================================================

create table public.contact_messages (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 2 and 80),
  email      text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject    text not null check (char_length(subject) between 3 and 120),
  message    text not null check (char_length(message) between 10 and 2000),
  created_at timestamptz not null default now()
);

comment on table public.contact_messages is 'Mensajes del formulario de contacto. Solo se leen desde el panel.';

create index contact_messages_email_created_idx on public.contact_messages (email, created_at desc);
create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- RLS sin políticas: anon y authenticated no pueden leer ni escribir directo.
alter table public.contact_messages enable row level security;
revoke all on table public.contact_messages from anon, authenticated;

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

revoke all on function public.submit_contact(text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_contact(text, text, text, text) to anon, authenticated;
