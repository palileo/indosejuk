alter table if exists public.profiles
    add column if not exists profile_photo_path text,
    add column if not exists profile_photo_url text;

comment on column public.profiles.profile_photo_path is 'Path object storage publik untuk foto profil pengguna.';
comment on column public.profiles.profile_photo_url is 'URL publik foto profil pengguna.';
