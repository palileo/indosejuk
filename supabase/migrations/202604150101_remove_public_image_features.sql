update public.profiles
set ac_units = (
    select coalesce(
        jsonb_agg(
            jsonb_strip_nulls(
                jsonb_build_object(
                    'key', nullif(item->>'key', ''),
                    'brand', nullif(item->>'brand', ''),
                    'type', nullif(coalesce(item->>'type', item->>'ac_type', item->>'acType'), ''),
                    'refrigerant', nullif(item->>'refrigerant', ''),
                    'capacity', nullif(coalesce(item->>'capacity', item->>'pk', item->>'ac_capacity', item->>'acCapacity'), ''),
                    'created_at', nullif(coalesce(item->>'created_at', item->>'createdAt'), '')
                )
            )
        ),
        '[]'::jsonb
    )
    from jsonb_array_elements(coalesce(public.profiles.ac_units, '[]'::jsonb)) as item
)
where jsonb_typeof(coalesce(public.profiles.ac_units, '[]'::jsonb)) = 'array';

alter table public.profiles
    drop column if exists unit_image_paths,
    drop column if exists unit_image_urls,
    drop column if exists profile_photo_path,
    drop column if exists profile_photo_url;

alter table public.orders
    drop column if exists proof_image_path,
    drop column if exists proof_image_url,
    drop column if exists proof_image_data;

comment on column public.profiles.ac_units is
'Daftar unit AC konsumen dalam format JSON terstruktur tanpa referensi gambar, dipakai untuk autofill spesifikasi order.';
