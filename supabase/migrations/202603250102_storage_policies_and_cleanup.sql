begin;

alter table if exists public.profiles
    add column if not exists unit_image_paths jsonb not null default '[]'::jsonb,
    add column if not exists unit_image_urls jsonb not null default '[]'::jsonb,
    add column if not exists ktp_photo_path text,
    add column if not exists ktp_photo_url text,
    add column if not exists selfie_photo_path text,
    add column if not exists selfie_photo_url text;

alter table if exists public.orders
    add column if not exists proof_image_path text,
    add column if not exists proof_image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
    ('app-public-uploads', 'app-public-uploads', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
    ('app-private-documents', 'app-private-documents', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
    begin
        alter table storage.objects enable row level security;
    exception
        when insufficient_privilege then
            -- Pada project tertentu, ownership `storage.objects` dikelola internal Supabase.
            -- RLS storage umumnya sudah aktif; bila tidak bisa di-alter dari role ini,
            -- lanjutkan migration dan hanya terapkan policy yang diizinkan.
            null;
    end;
end
$$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'public_uploads_insert_own_or_admin'
    ) then
        create policy public_uploads_insert_own_or_admin
        on storage.objects
        for insert
        to authenticated
        with check (
            bucket_id = 'app-public-uploads'
            and (
                (storage.foldername(name))[2] = auth.uid()::text
                or exists (
                    select 1
                    from public.profiles p
                    where p.id = auth.uid()
                      and p.role = 'admin'
                )
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'public_uploads_update_own_or_admin'
    ) then
        create policy public_uploads_update_own_or_admin
        on storage.objects
        for update
        to authenticated
        using (
            bucket_id = 'app-public-uploads'
            and (
                (storage.foldername(name))[2] = auth.uid()::text
                or exists (
                    select 1
                    from public.profiles p
                    where p.id = auth.uid()
                      and p.role = 'admin'
                )
            )
        )
        with check (
            bucket_id = 'app-public-uploads'
            and (
                (storage.foldername(name))[2] = auth.uid()::text
                or exists (
                    select 1
                    from public.profiles p
                    where p.id = auth.uid()
                      and p.role = 'admin'
                )
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'public_uploads_delete_own_or_admin'
    ) then
        create policy public_uploads_delete_own_or_admin
        on storage.objects
        for delete
        to authenticated
        using (
            bucket_id = 'app-public-uploads'
            and (
                (storage.foldername(name))[2] = auth.uid()::text
                or exists (
                    select 1
                    from public.profiles p
                    where p.id = auth.uid()
                      and p.role = 'admin'
                )
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'private_docs_select_own_or_admin'
    ) then
        create policy private_docs_select_own_or_admin
        on storage.objects
        for select
        to authenticated
        using (
            bucket_id = 'app-private-documents'
            and (
                (storage.foldername(name))[2] = auth.uid()::text
                or exists (
                    select 1
                    from public.profiles p
                    where p.id = auth.uid()
                      and p.role = 'admin'
                )
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'private_docs_insert_own_or_admin'
    ) then
        create policy private_docs_insert_own_or_admin
        on storage.objects
        for insert
        to authenticated
        with check (
            bucket_id = 'app-private-documents'
            and (
                (storage.foldername(name))[2] = auth.uid()::text
                or exists (
                    select 1
                    from public.profiles p
                    where p.id = auth.uid()
                      and p.role = 'admin'
                )
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'private_docs_update_own_or_admin'
    ) then
        create policy private_docs_update_own_or_admin
        on storage.objects
        for update
        to authenticated
        using (
            bucket_id = 'app-private-documents'
            and (
                (storage.foldername(name))[2] = auth.uid()::text
                or exists (
                    select 1
                    from public.profiles p
                    where p.id = auth.uid()
                      and p.role = 'admin'
                )
            )
        )
        with check (
            bucket_id = 'app-private-documents'
            and (
                (storage.foldername(name))[2] = auth.uid()::text
                or exists (
                    select 1
                    from public.profiles p
                    where p.id = auth.uid()
                      and p.role = 'admin'
                )
            )
        );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'private_docs_delete_own_or_admin'
    ) then
        create policy private_docs_delete_own_or_admin
        on storage.objects
        for delete
        to authenticated
        using (
            bucket_id = 'app-private-documents'
            and (
                (storage.foldername(name))[2] = auth.uid()::text
                or exists (
                    select 1
                    from public.profiles p
                    where p.id = auth.uid()
                      and p.role = 'admin'
                )
            )
        );
    end if;
end
$$;

comment on column public.profiles.unit_image_paths is 'Array path object storage publik untuk foto unit konsumen.';
comment on column public.profiles.unit_image_urls is 'Array URL publik foto unit konsumen.';
comment on column public.profiles.ktp_photo_path is 'Path object storage private untuk foto KTP teknisi.';
comment on column public.profiles.selfie_photo_path is 'Path object storage private untuk foto diri teknisi.';
comment on column public.orders.proof_image_path is 'Path object storage publik untuk bukti pekerjaan.';
comment on column public.orders.proof_image_url is 'URL publik bukti pekerjaan.';

commit;
