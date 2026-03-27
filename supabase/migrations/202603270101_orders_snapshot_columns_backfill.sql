begin;

alter table if exists public.orders
    add column if not exists order_number text,
    add column if not exists konsumen_name text,
    add column if not exists service_name text,
    add column if not exists teknisi_id uuid,
    add column if not exists teknisi_name text,
    add column if not exists brand text,
    add column if not exists pk text,
    add column if not exists refrigerant text,
    add column if not exists preferred_date date,
    add column if not exists address text,
    add column if not exists notes text,
    add column if not exists phone text,
    add column if not exists admin_confirmation_text text,
    add column if not exists verified_at timestamptz,
    add column if not exists verified_by uuid,
    add column if not exists verified_by_name text,
    add column if not exists proof_image_data text;

update public.orders o
set konsumen_name = p.name,
    phone = coalesce(nullif(trim(o.phone), ''), p.phone),
    address = coalesce(nullif(trim(o.address), ''), p.address)
from public.profiles p
where p.id = o.konsumen_id
  and (
        nullif(trim(coalesce(o.konsumen_name, '')), '') is null
        or nullif(trim(coalesce(o.phone, '')), '') is null
        or nullif(trim(coalesce(o.address, '')), '') is null
      );

update public.orders o
set teknisi_name = p.name
from public.profiles p
where p.id = o.teknisi_id
  and nullif(trim(coalesce(o.teknisi_name, '')), '') is null;

update public.orders o
set verified_by_name = p.name
from public.profiles p
where p.id = o.verified_by
  and nullif(trim(coalesce(o.verified_by_name, '')), '') is null;

comment on column public.orders.order_number is
'Nomor pesanan yang bisa ditampilkan ke user bila ingin dibedakan dari UUID internal.';

comment on column public.orders.konsumen_name is
'Snapshot nama konsumen saat order dibuat.';

comment on column public.orders.service_name is
'Snapshot nama layanan saat order dibuat.';

comment on column public.orders.teknisi_id is
'Referensi teknisi yang ditugaskan untuk order.';

comment on column public.orders.teknisi_name is
'Snapshot nama teknisi saat admin menugaskan order.';

comment on column public.orders.brand is
'Snapshot merk AC saat order dibuat.';

comment on column public.orders.pk is
'Snapshot kapasitas AC saat order dibuat.';

comment on column public.orders.refrigerant is
'Snapshot refrigerant AC saat order dibuat.';

comment on column public.orders.preferred_date is
'Tanggal preferensi kunjungan yang dipilih konsumen.';

comment on column public.orders.address is
'Alamat kerja order sebagai snapshot pada saat submit.';

comment on column public.orders.notes is
'Catatan tambahan dari konsumen untuk order.';

comment on column public.orders.phone is
'Nomor kontak yang dipakai untuk order.';

comment on column public.orders.admin_confirmation_text is
'Pesan konfirmasi admin yang dikirim ke konsumen saat order diverifikasi/ditugaskan.';

comment on column public.orders.verified_at is
'Waktu order diverifikasi admin.';

comment on column public.orders.verified_by is
'ID admin yang memverifikasi order.';

comment on column public.orders.verified_by_name is
'Snapshot nama admin yang memverifikasi order.';

comment on column public.orders.proof_image_data is
'Fallback legacy untuk data URL bukti pekerjaan sebelum seluruh deployment memakai Storage path/url.';

commit;
