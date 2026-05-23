-- Crear tabla de Sociedades
create table public.societies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  ruc text unique,
  dv text,
  constitution_date date,
  legal_person_type text,
  status text check (status in ('activa', 'suspendida', 'en trámite', 'disuelta')) default 'en trámite',
  
  -- Contacto
  legal_representative text,
  email text,
  phone text,
  contact_name text,
  address text,
  
  -- Control Interno
  expedient_number text,
  last_payment_date date,
  next_payment_date date,
  observations text,
  
  -- Auditoría
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- Crear tabla de Documentos de Sociedades
create table public.society_documents (
  id uuid default gen_random_uuid() primary key,
  society_id uuid references public.societies(id) on delete cascade not null,
  name text not null,
  file_path text not null,
  file_type text,
  file_size integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear tabla de Historial de Sociedades
create table public.society_history (
  id uuid default gen_random_uuid() primary key,
  society_id uuid references public.societies(id) on delete cascade not null,
  user_id uuid references auth.users(id),
  action text not null,
  changes jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.societies enable row level security;
alter table public.society_documents enable row level security;
alter table public.society_history enable row level security;

-- Políticas básicas (asumiendo que los usuarios autenticados pueden ver y editar)
-- En un entorno real, esto se limitaría por roles.

create policy "Usuarios autenticados pueden ver sociedades"
on public.societies for select
to authenticated
using (deleted_at is null);

create policy "Usuarios autenticados pueden insertar sociedades"
on public.societies for insert
to authenticated
with check (true);

create policy "Usuarios autenticados pueden actualizar sociedades"
on public.societies for update
to authenticated
using (true)
with check (true);

-- Políticas para Documentos
create policy "Usuarios autenticados pueden ver documentos"
on public.society_documents for select
to authenticated
using (true);

create policy "Usuarios autenticados pueden insertar documentos"
on public.society_documents for insert
to authenticated
with check (true);

-- Políticas para Historial
create policy "Usuarios autenticados pueden ver historial"
on public.society_history for select
to authenticated
using (true);

create policy "Usuarios autenticados pueden insertar historial"
on public.society_history for insert
to authenticated
with check (true);

-- Función para actualizar el updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para societies
create trigger on_societies_updated
  before update on public.societies
  for each row
  execute procedure public.handle_updated_at();
