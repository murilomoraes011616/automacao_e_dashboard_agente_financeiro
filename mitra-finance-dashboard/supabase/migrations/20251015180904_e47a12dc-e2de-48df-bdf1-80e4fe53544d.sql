-- ========================================
-- MIGRATION: Sistema de Autenticação
-- Adiciona suporte para login com dashboards individuais
-- ========================================

-- 1. Criar tabela de perfis de usuário
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Habilitar RLS na tabela profiles
alter table public.profiles enable row level security;

-- Políticas RLS para profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger para criar perfil automaticamente quando usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger para atualizar updated_at em profiles
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

-- 2. Adicionar user_id às tabelas existentes
alter table public.entradas
  add column user_id uuid references auth.users(id) on delete cascade;

alter table public.saidas
  add column user_id uuid references auth.users(id) on delete cascade;

alter table public.metas
  add column user_id uuid references auth.users(id) on delete cascade;

alter table public.categories
  add column user_id uuid references auth.users(id) on delete cascade;

-- 3. Atualizar políticas RLS para ENTRADAS
drop policy if exists "Allow all operations on entradas" on public.entradas;

create policy "Users can view own entradas"
  on public.entradas for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own entradas"
  on public.entradas for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own entradas"
  on public.entradas for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own entradas"
  on public.entradas for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4. Atualizar políticas RLS para SAIDAS
drop policy if exists "Allow all operations on saidas" on public.saidas;

create policy "Users can view own saidas"
  on public.saidas for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own saidas"
  on public.saidas for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own saidas"
  on public.saidas for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own saidas"
  on public.saidas for delete
  to authenticated
  using (auth.uid() = user_id);

-- 5. Atualizar políticas RLS para METAS
drop policy if exists "Allow all operations on metas" on public.metas;

create policy "Users can view own metas"
  on public.metas for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own metas"
  on public.metas for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own metas"
  on public.metas for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own metas"
  on public.metas for delete
  to authenticated
  using (auth.uid() = user_id);

-- 6. Atualizar políticas RLS para CATEGORIES (compartilhadas entre usuários autenticados)
drop policy if exists "Allow all operations on categories" on public.categories;

create policy "Authenticated users can view all categories"
  on public.categories for select
  to authenticated
  using (true);

create policy "Authenticated users can insert categories"
  on public.categories for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update categories"
  on public.categories for update
  to authenticated
  using (true);

create policy "Authenticated users can delete categories"
  on public.categories for delete
  to authenticated
  using (true);