-- Esquema de Talentty para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → pegar y Run
--
-- La app sincroniza el estado del workspace (talento, cursos, seminarios,
-- planes, evaluaciones, locaciones, etc.) como un documento JSONB por
-- workspace. Cada cambio se guarda con un debounce de ~1 segundo.

create table if not exists public.workspace_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workspace_state enable row level security;

-- ⚠️ Políticas de DEMO: permiten leer y escribir con la clave anónima.
-- Para producción con múltiples clientes, reemplazar por políticas basadas
-- en auth.uid() (Supabase Auth) y una columna owner/tenant.
drop policy if exists "demo_select" on public.workspace_state;
drop policy if exists "demo_insert" on public.workspace_state;
drop policy if exists "demo_update" on public.workspace_state;

create policy "demo_select" on public.workspace_state for select using (true);
create policy "demo_insert" on public.workspace_state for insert with check (true);
create policy "demo_update" on public.workspace_state for update using (true);
