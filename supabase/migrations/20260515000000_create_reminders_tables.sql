-- Crear tabla de Recordatorios
create table public.reminders (
  id uuid default gen_random_uuid() primary key,
  society_id uuid references public.societies(id) on delete cascade not null,
  reminder_type text default 'tasa_anual' not null,
  title text not null,
  description text,
  due_date date not null,
  status text check (status in ('pendiente', 'próximo', 'vencido', 'pagado', 'cancelado')) default 'pendiente' not null,
  priority text check (priority in ('baja', 'media', 'alta', 'urgente')) default 'media' not null,
  last_notification_sent timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear tabla de Logs de Recordatorios (para auditoría)
create table public.reminder_logs (
  id uuid default gen_random_uuid() primary key,
  reminder_id uuid references public.reminders(id) on delete cascade not null,
  action text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.reminders enable row level security;
alter table public.reminder_logs enable row level security;

-- Políticas para Recordatorios
create policy "Usuarios autenticados pueden ver recordatorios"
on public.reminders for select
to authenticated
using (true);

create policy "Usuarios autenticados pueden insertar recordatorios"
on public.reminders for insert
to authenticated
with check (true);

create policy "Usuarios autenticados pueden actualizar recordatorios"
on public.reminders for update
to authenticated
using (true)
with check (true);

-- Políticas para Logs
create policy "Usuarios autenticados pueden ver logs de recordatorios"
on public.reminder_logs for select
to authenticated
using (true);

create policy "Usuarios autenticados pueden insertar logs de recordatorios"
on public.reminder_logs for insert
to authenticated
with check (true);

-- Trigger para updated_at en reminders
create trigger on_reminders_updated
  before update on public.reminders
  for each row
  execute procedure public.handle_updated_at();

-- Habilitar Realtime para la tabla de recordatorios
-- Esto asume que la publicación 'supabase_realtime' ya existe (común en Supabase)
begin;
  -- Intentar agregar la tabla a la publicación de realtime
  -- Si falla porque no existe la publicación, se puede ignorar o crear
  alter publication supabase_realtime add table public.reminders;
commit;
