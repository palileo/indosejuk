begin;

create or replace function public.normalize_indonesian_phone(p_value text)
returns text
language plpgsql
immutable
as $$
declare
    digits text;
begin
    if p_value is null then
        return null;
    end if;

    digits := regexp_replace(trim(p_value), '\D', '', 'g');
    if digits = '' then
        return null;
    end if;

    if digits like '62%' then
        digits := '0' || substr(digits, 3);
    elsif digits like '8%' then
        digits := '0' || digits;
    end if;

    return digits;
end;
$$;

alter table public.profiles
    add column if not exists auth_email text;

update public.profiles
set phone = public.normalize_indonesian_phone(phone)
where phone is not null;

update public.profiles
set auth_email = lower(coalesce(nullif(trim(auth_email), ''), nullif(trim(email), '')))
where coalesce(nullif(trim(auth_email), ''), '') = '';

alter table public.profiles alter column email drop not null;

drop index if exists profiles_email_unique_idx;

create unique index if not exists profiles_email_unique_idx
    on public.profiles (lower(email))
    where email is not null;

create unique index if not exists profiles_auth_email_unique_idx
    on public.profiles (lower(auth_email))
    where auth_email is not null;

do $$
begin
    if not exists (
        select 1
        from pg_indexes
        where schemaname = 'public'
          and indexname = 'profiles_konsumen_phone_unique_idx'
    ) then
        if exists (
            select 1
            from public.profiles
            where role = 'konsumen'
              and phone is not null
            group by phone
            having count(*) > 1
        ) then
            raise notice 'Index unik phone konsumen dilewati karena masih ada data duplikat legacy.';
        else
            create unique index profiles_konsumen_phone_unique_idx
                on public.profiles (phone)
                where role = 'konsumen' and phone is not null;
        end if;
    end if;
end
$$;

alter table public.profiles
    drop constraint if exists profiles_email_required_non_konsumen;

alter table public.profiles
    add constraint profiles_email_required_non_konsumen
    check (
        role = 'konsumen'
        or coalesce(nullif(trim(email), ''), nullif(trim(auth_email), '')) is not null
    );

create or replace function public.is_username_available(
    p_username text,
    p_exclude_user_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select not exists (
        select 1
        from public.profiles
        where lower(username) = lower(trim(coalesce(p_username, '')))
          and (p_exclude_user_id is null or id <> p_exclude_user_id)
    );
$$;

grant execute on function public.is_username_available(text, uuid) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
    profile_role text := lower(trim(coalesce(meta->>'role', '')));
    profile_phone text := public.normalize_indonesian_phone(meta->>'phone');
    profile_auth_email text := lower(nullif(trim(coalesce(new.email, meta->>'auth_email', meta->>'email', '')), ''));
    profile_contact_email text := lower(nullif(trim(coalesce(
        meta->>'contact_email',
        case
            when profile_role = 'konsumen' then ''
            else coalesce(meta->>'email', new.email, '')
        end
    )), ''));
    username_source text := coalesce(profile_contact_email, profile_auth_email, profile_phone, 'user');
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
        auth_email,
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
        coalesce(nullif(trim(coalesce(meta->>'username', '')), ''), split_part(username_source, '@', 1)),
        coalesce(nullif(trim(coalesce(meta->>'name', '')), ''), 'User Indo Sejuk'),
        case
            when profile_role = 'konsumen' then profile_contact_email
            else coalesce(profile_contact_email, profile_auth_email)
        end,
        profile_auth_email,
        profile_phone,
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
        username = coalesce(nullif(trim(excluded.username), ''), public.profiles.username, split_part(username_source, '@', 1)),
        name = coalesce(nullif(trim(excluded.name), ''), public.profiles.name, 'User Indo Sejuk'),
        email = case
            when excluded.role = 'konsumen' then coalesce(nullif(trim(excluded.email), ''), public.profiles.email)
            else coalesce(nullif(trim(excluded.email), ''), public.profiles.email, nullif(trim(excluded.auth_email), ''))
        end,
        auth_email = coalesce(nullif(trim(excluded.auth_email), ''), public.profiles.auth_email, nullif(trim(excluded.email), '')),
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

comment on column public.profiles.auth_email is
'Email login internal Supabase Auth. Untuk konsumen tanpa email publik, kolom ini dapat berisi alamat sintetis yang hanya dipakai untuk auth.';

commit;
