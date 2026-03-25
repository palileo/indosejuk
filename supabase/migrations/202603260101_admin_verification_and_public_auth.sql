begin;

alter table public.profiles
    alter column status set default 'Menunggu Verifikasi';

alter table public.profiles
    drop constraint if exists profiles_email_required_non_konsumen;

alter table public.profiles
    drop constraint if exists profiles_public_email_optional_non_admin;

alter table public.profiles
    add constraint profiles_public_email_optional_non_admin
    check (
        role <> 'admin'
        or coalesce(nullif(trim(email), ''), nullif(trim(auth_email), '')) is not null
    );

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
    profile_contact_email text := lower(nullif(trim(coalesce(meta->>'contact_email', meta->>'email', '')), ''));
    requested_status text := coalesce(nullif(trim(meta->>'status'), ''), case when profile_role = 'admin' then 'Aktif' else 'Menunggu Verifikasi' end);
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
            when profile_role = 'admin' then coalesce(profile_contact_email, profile_auth_email)
            else profile_contact_email
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
        requested_status,
        case when requested_status = 'Aktif' then now() else null end,
        coalesce(nullif(meta->>'completed_jobs', '')::integer, 0),
        now(),
        now()
    )
    on conflict (id) do update
    set role = excluded.role,
        username = coalesce(nullif(trim(excluded.username), ''), public.profiles.username, split_part(username_source, '@', 1)),
        name = coalesce(nullif(trim(excluded.name), ''), public.profiles.name, 'User Indo Sejuk'),
        email = case
            when excluded.role = 'admin' then coalesce(nullif(trim(excluded.email), ''), public.profiles.email, nullif(trim(excluded.auth_email), ''))
            else coalesce(nullif(trim(excluded.email), ''), public.profiles.email)
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
            else coalesce(nullif(trim(public.profiles.status), ''), nullif(trim(excluded.status), ''), 'Menunggu Verifikasi')
        end,
        verified_at = case
            when excluded.role = 'admin' then public.profiles.verified_at
            when coalesce(nullif(trim(public.profiles.status), ''), nullif(trim(excluded.status), ''), 'Menunggu Verifikasi') = 'Aktif'
                then coalesce(public.profiles.verified_at, excluded.verified_at, now())
            else public.profiles.verified_at
        end,
        completed_jobs = coalesce(public.profiles.completed_jobs, excluded.completed_jobs, 0),
        updated_at = now();

    return new;
end;
$$;

comment on column public.profiles.status is
'Status aktivasi akun berbasis verifikasi admin. Public user baru default Menunggu Verifikasi dan tidak lagi memakai email confirmation untuk aktivasi register.';

commit;
