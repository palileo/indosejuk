-- Indo Sejuk AC
-- 2026-03-25
-- Fixes profile provisioning, birth_date support, and safe auth/profile bootstrap.
-- Setelah migration ini dijalankan, Supabase schema cache akan kembali terbaca normal
-- lewat query frontend berikutnya. Frontend tetap punya fallback sementara bila cache
-- belum segar pada saat pertama login.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null check (role in ('admin', 'konsumen', 'teknisi')),
    username text not null,
    name text not null,
    email text not null,
    phone text,
    address text,
    age integer,
    birth_date date,
    district text,
    location_text text,
    lat text,
    lng text,
    nik text,
    specialization text,
    experience integer default 0,
    status text not null default 'Aktif',
    verified_at timestamptz,
    verified_by uuid references public.profiles(id) on delete set null,
    completed_jobs integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists age integer;
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists district text;
alter table public.profiles add column if not exists location_text text;
alter table public.profiles add column if not exists lat text;
alter table public.profiles add column if not exists lng text;
alter table public.profiles add column if not exists nik text;
alter table public.profiles add column if not exists specialization text;
alter table public.profiles add column if not exists experience integer default 0;
alter table public.profiles add column if not exists status text default 'Aktif';
alter table public.profiles add column if not exists verified_at timestamptz;
alter table public.profiles add column if not exists verified_by uuid;
alter table public.profiles add column if not exists completed_jobs integer default 0;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'profiles_verified_by_fkey'
          and conrelid = 'public.profiles'::regclass
    ) then
        alter table public.profiles
            add constraint profiles_verified_by_fkey
            foreign key (verified_by) references public.profiles(id) on delete set null;
    end if;
end
$$;

alter table public.profiles alter column status set default 'Aktif';
alter table public.profiles alter column completed_jobs set default 0;
alter table public.profiles alter column experience set default 0;
alter table public.profiles alter column created_at set default now();
alter table public.profiles alter column updated_at set default now();

update public.profiles
set status = 'Aktif'
where role in ('konsumen', 'teknisi')
  and coalesce(nullif(trim(status), ''), 'Menunggu Verifikasi') = 'Menunggu Verifikasi';

update public.profiles
set status = 'Aktif'
where role in ('konsumen', 'teknisi')
  and coalesce(nullif(trim(status), ''), '') = '';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create unique index if not exists profiles_username_unique_idx
    on public.profiles (lower(username));

create unique index if not exists profiles_email_unique_idx
    on public.profiles (lower(email));

create or replace function public.is_admin_profile(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = p_user_id
          and role = 'admin'
    );
$$;

grant execute on function public.is_admin_profile(uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
    profile_role text := lower(trim(coalesce(meta->>'role', '')));
begin
    if profile_role not in ('admin', 'konsumen', 'teknisi') then
        return new;
    end if;

    insert into public.profiles (
        id,
        role,
        username,
        name,
        email,
        phone,
        address,
        age,
        birth_date,
        district,
        location_text,
        lat,
        lng,
        nik,
        specialization,
        experience,
        status,
        verified_at,
        completed_jobs,
        created_at,
        updated_at
    )
    values (
        new.id,
        profile_role,
        coalesce(nullif(trim(coalesce(meta->>'username', '')), ''), split_part(lower(coalesce(new.email, 'user')), '@', 1)),
        coalesce(nullif(trim(coalesce(meta->>'name', '')), ''), 'User Indo Sejuk'),
        lower(coalesce(new.email, meta->>'email', '')),
        nullif(trim(coalesce(meta->>'phone', '')), ''),
        nullif(trim(coalesce(meta->>'address', '')), ''),
        nullif(meta->>'age', '')::integer,
        nullif(meta->>'birth_date', '')::date,
        nullif(trim(coalesce(meta->>'district', '')), ''),
        nullif(trim(coalesce(meta->>'location_text', meta->>'locationText', '')), ''),
        nullif(trim(coalesce(meta->>'lat', '')), ''),
        nullif(trim(coalesce(meta->>'lng', '')), ''),
        nullif(trim(coalesce(meta->>'nik', '')), ''),
        nullif(trim(coalesce(meta->>'specialization', '')), ''),
        coalesce(nullif(meta->>'experience', '')::integer, 0),
        case
            when profile_role = 'admin' then coalesce(nullif(trim(meta->>'status'), ''), 'Aktif')
            else 'Aktif'
        end,
        case when profile_role = 'admin' then null else now() end,
        coalesce(nullif(meta->>'completed_jobs', '')::integer, 0),
        now(),
        now()
    )
    on conflict (id) do update
    set role = excluded.role,
        username = coalesce(nullif(trim(excluded.username), ''), public.profiles.username, split_part(lower(coalesce(new.email, 'user')), '@', 1)),
        name = coalesce(nullif(trim(excluded.name), ''), public.profiles.name, 'User Indo Sejuk'),
        email = coalesce(nullif(trim(excluded.email), ''), public.profiles.email),
        phone = coalesce(nullif(trim(excluded.phone), ''), public.profiles.phone),
        address = coalesce(nullif(trim(excluded.address), ''), public.profiles.address),
        age = coalesce(excluded.age, public.profiles.age),
        birth_date = coalesce(excluded.birth_date, public.profiles.birth_date),
        district = coalesce(nullif(trim(excluded.district), ''), public.profiles.district),
        location_text = coalesce(nullif(trim(excluded.location_text), ''), public.profiles.location_text),
        lat = coalesce(nullif(trim(excluded.lat), ''), public.profiles.lat),
        lng = coalesce(nullif(trim(excluded.lng), ''), public.profiles.lng),
        nik = coalesce(nullif(trim(excluded.nik), ''), public.profiles.nik),
        specialization = coalesce(nullif(trim(excluded.specialization), ''), public.profiles.specialization),
        experience = coalesce(excluded.experience, public.profiles.experience),
        status = case
            when excluded.role = 'admin' then coalesce(nullif(trim(excluded.status), ''), public.profiles.status, 'Aktif')
            else 'Aktif'
        end,
        verified_at = case
            when excluded.role = 'admin' then public.profiles.verified_at
            else coalesce(public.profiles.verified_at, now())
        end,
        completed_jobs = coalesce(public.profiles.completed_jobs, excluded.completed_jobs, 0),
        updated_at = now();

    return new;
end;
$$;

drop trigger if exists on_auth_user_created_handle_profile on auth.users;
create trigger on_auth_user_created_handle_profile
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
    auth.uid() = id
    or public.is_admin_profile(auth.uid())
);

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
to authenticated
with check (
    auth.uid() = id
    or public.is_admin_profile(auth.uid())
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (
    auth.uid() = id
    or public.is_admin_profile(auth.uid())
)
with check (
    auth.uid() = id
    or public.is_admin_profile(auth.uid())
);

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only"
on public.profiles
for delete
to authenticated
using (public.is_admin_profile(auth.uid()));

comment on column public.profiles.birth_date is
'Tanggal lahir resmi Indo Sejuk AC. Jika frontend sempat membaca schema cache lama, cukup refresh/query ulang setelah migration ini.';
