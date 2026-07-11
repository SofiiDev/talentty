-- ============================================================
-- Esquema completo de Talentty para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================
-- Modelo multi-tenant:
--   auth.users (Supabase Auth) → workspace_members → workspaces
--   Cada workspace tiene su estado (talento, cursos, seminarios, planes,
--   evaluaciones, locaciones, etc.) en workspace_state.data (JSONB).
--   Solo los miembros del workspace pueden leerlo y escribirlo.

-- ---------- Tablas ----------

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mi organización',
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.workspace_state (
  workspace_id uuid primary key references public.workspaces (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- Trigger: quien crea un workspace queda como owner ----------

create or replace function public.handle_new_workspace()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_workspace_created on public.workspaces;
create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();

-- ---------- Función auxiliar para las políticas ----------

create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

-- ---------- Row Level Security ----------

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_state enable row level security;

-- workspaces: crear el propio, ver/editar los que integrás
drop policy if exists "ws_insert" on public.workspaces;
drop policy if exists "ws_select" on public.workspaces;
drop policy if exists "ws_update" on public.workspaces;
create policy "ws_insert" on public.workspaces
  for insert to authenticated with check (created_by = auth.uid());
create policy "ws_select" on public.workspaces
  for select to authenticated using (public.is_workspace_member(id));
create policy "ws_update" on public.workspaces
  for update to authenticated using (public.is_workspace_member(id));

-- workspace_members: ver tus membresías
drop policy if exists "wm_select" on public.workspace_members;
create policy "wm_select" on public.workspace_members
  for select to authenticated using (user_id = auth.uid());

-- workspace_state: solo miembros del workspace
drop policy if exists "st_select" on public.workspace_state;
drop policy if exists "st_insert" on public.workspace_state;
drop policy if exists "st_update" on public.workspace_state;
create policy "st_select" on public.workspace_state
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "st_insert" on public.workspace_state
  for insert to authenticated with check (public.is_workspace_member(workspace_id));
create policy "st_update" on public.workspace_state
  for update to authenticated using (public.is_workspace_member(workspace_id));

-- ---------- Storage: bucket público para materiales (PDFs, imágenes, videos) ----------

insert into storage.buckets (id, name, public)
values ('archivos', 'archivos', true)
on conflict (id) do nothing;

drop policy if exists "archivos_upload" on storage.objects;
drop policy if exists "archivos_read" on storage.objects;
create policy "archivos_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'archivos');
create policy "archivos_read" on storage.objects
  for select using (bucket_id = 'archivos');
