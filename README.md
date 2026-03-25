# Indo Sejuk AC

Website statis Indo Sejuk AC yang berjalan di GitHub Pages dan memakai Supabase sebagai source of truth untuk:

- `auth/session`
- `public.profiles`
- `public.orders`

Local storage hanya dipakai untuk cache UI non-kritis seperti katalog gambar lokal, foto unit lokal, dan preview dokumen teknisi. Auth, profile, order, dan dashboard admin tidak lagi memakai local cache sebagai sumber utama.

## Mode akses aplikasi

- Public URL GitHub Pages `https://palileo.github.io/indosejuk/` dipakai untuk `konsumen` dan `teknisi`.
- Dashboard `admin` hanya tersedia saat frontend dibuka dari `localhost`, `127.0.0.1`, atau `::1`.
- Supabase tetap menjadi source of truth untuk auth, profile, dan order di semua host.
- Frontend hanya memakai `anon key`, tidak memakai `service_role`.

## Konfigurasi frontend

Konfigurasi Supabase saat ini ada di [app.js](/c:/Users/justdoit/Documents/GitHub/indosejuk/app.js):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `DEFAULT_ADMIN_WHATSAPP`

Karena project ini adalah static site GitHub Pages, jangan pernah menaruh `service_role` key di frontend.

## Catatan WhatsApp

Project ini tidak memakai backend pengirim WhatsApp. Karena itu frontend menyiapkan pesan otomatis lalu membuka `wa.me` ke:

- admin saat ada pendaftaran baru
- admin saat ada pesanan baru
- konsumen saat admin selesai verifikasi dan menugaskan teknisi

Ini adalah pendekatan paling aman untuk static site tanpa secret API WhatsApp.

## Arsitektur auth final

- Login memakai `supabase.auth.signInWithPassword({ email, password })`
- Logout memakai `supabase.auth.signOut()`
- Session utama memakai `supabase.auth.getSession()` + `onAuthStateChange`
- Redirect dashboard ditentukan dari row `public.profiles.role`
- Session admin di public host akan langsung ditolak, logout otomatis, lalu kembali ke landing
- Admin hanya boleh login dan membuka dashboard dari localhost
- Admin tidak dibuat dari form publik

## Menjalankan lokal

Pilih salah satu cara berikut:

- `python -m http.server 5500`
- VS Code Live Server
- Static server lain yang membuka project ini sebagai `http://localhost:<port>`

Sesuaikan `Additional Redirect URLs` Supabase dengan port lokal yang Anda pakai.

## Flow registrasi publik

Frontend mengirim `signUp()` dengan `email`, `password`, dan `user_metadata` berisi draft profile non-sensitif seperti:

- `role`
- `username`
- `name`
- `phone`
- `address`
- `birth_date`
- `district`
- `location_text`
- `nik`
- `specialization`

Password tidak pernah disimpan di `profiles`.
Semua pendaftaran publik baru (`konsumen` dan `teknisi`) masuk dengan status `Menunggu Verifikasi` dan baru bisa login setelah admin mengubah status menjadi `Aktif`.

### Confirm sign up OFF

Saat email confirmation dimatikan:

1. `signUp()` membuat auth user dan langsung memberi session.
2. Frontend memanggil `ensureProfileAfterAuth()` untuk `upsert` row `profiles`.
3. User langsung diarahkan ke dashboard sesuai role.

### Confirm sign up ON

Saat email confirmation dinyalakan:

1. `signUp()` membuat auth user tetapi belum ada session aktif di browser.
2. Trigger database `handle_new_user()` membuat row `profiles` awal dari `auth.users.raw_user_meta_data`.
3. Frontend tidak lagi memaksa `insert profiles` dari anon browser client.
4. User diminta cek email.
5. Setelah link konfirmasi dibuka dan user login, `bootstrapAuthState()` memanggil `fetchCurrentProfileStrict()` lalu melengkapi profile bila masih kurang.

Ini yang menghilangkan error:

`new row violates row-level security policy for table profiles`

karena browser tidak lagi melakukan `signUp() -> insert profiles` pada saat session belum aktif.

## Admin manual

Admin dibuat manual di Supabase:

1. Buat auth user di `Authentication > Users`.
2. Ambil UUID user tersebut.
3. Insert atau update row `public.profiles` dengan `role = 'admin'`.

Contoh:

```sql
insert into public.profiles (id, role, username, name, email, status)
values (
  'AUTH_USER_UUID_DI_SINI',
  'admin',
  'admin.indosejuk',
  'Admin Indo Sejuk',
  'admin@contoh.com',
  'Aktif'
)
on conflict (id) do update
set role = excluded.role,
    username = excluded.username,
    name = excluded.name,
    email = excluded.email,
    status = excluded.status,
    updated_at = now();
```

## Redirect URL Supabase Auth

Di Supabase Dashboard, set:

- Site URL: `https://palileo.github.io/indosejuk/`
- Additional Redirect URLs:
  - `https://palileo.github.io/indosejuk/`
  - `http://localhost:5500/`
  - `http://127.0.0.1:5500/`

Sesuaikan localhost port dengan cara Anda menjalankan preview lokal.

## Matriks akses final

Public URL:

- konsumen `OK`
- teknisi `OK`
- admin `Ditolak`

Localhost:

- konsumen `OK`
- teknisi `OK`
- admin `OK`

## Checklist test final

- Public host: card admin tidak tampil
- Public host: tab admin tidak tampil
- Public host: route admin diblok dan kembali ke landing
- Public host: session admin yang ter-restore akan auto logout
- Localhost: seluruh dashboard dan aksi admin tetap berjalan
- Konsumen dan teknisi tetap normal di public host maupun localhost
- Tidak ada `service_role` key di frontend

## SQL final

Jalankan SQL berikut di Supabase SQL Editor. Script ini mengasumsikan tabel belum lengkap dan aman untuk dijalankan ulang.

```sql
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
alter table public.profiles add column if not exists verified_by uuid references public.profiles(id) on delete set null;
alter table public.profiles add column if not exists completed_jobs integer default 0;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

create unique index if not exists profiles_username_unique on public.profiles (lower(username));
create unique index if not exists profiles_email_unique on public.profiles (lower(email));

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique default ('ORD-' || to_char(now() at time zone 'Asia/Jakarta', 'YYYYMMDD-HH24MISS') || '-' || substr(gen_random_uuid()::text, 1, 6)),
  konsumen_id uuid not null references public.profiles(id) on delete restrict,
  konsumen_name text not null,
  teknisi_id uuid references public.profiles(id) on delete set null,
  teknisi_name text,
  service_id text not null,
  service_name text not null,
  price numeric(12,2) not null default 0,
  brand text,
  pk text,
  refrigerant text,
  preferred_date date,
  address text,
  notes text,
  phone text,
  status text not null default 'Menunggu' check (status in ('Menunggu', 'Ditugaskan', 'Dikerjakan', 'Selesai', 'Dibatalkan')),
  admin_confirmation_text text,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  proof_image_data text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists order_number text;
alter table public.orders add column if not exists konsumen_name text;
alter table public.orders add column if not exists teknisi_name text;
alter table public.orders add column if not exists admin_confirmation_text text;
alter table public.orders add column if not exists verified_at timestamptz;
alter table public.orders add column if not exists verified_by uuid references public.profiles(id) on delete set null;
alter table public.orders add column if not exists proof_image_data text;
alter table public.orders add column if not exists created_at timestamptz default now();
alter table public.orders add column if not exists updated_at timestamptz default now();

create unique index if not exists orders_order_number_unique on public.orders (order_number);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

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
    from public.profiles p
    where lower(p.username) = lower(p_username)
      and (p_exclude_user_id is null or p.id <> p_exclude_user_id)
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
  requested_role text := lower(coalesce(meta->>'role', 'konsumen'));
begin
  if requested_role not in ('konsumen', 'teknisi') then
    requested_role := 'konsumen';
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
    lat,
    lng,
    nik,
    specialization,
    experience,
    status
  )
  values (
    new.id,
    requested_role,
    nullif(meta->>'username', ''),
    coalesce(nullif(meta->>'name', ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(meta->>'phone', ''),
    nullif(meta->>'address', ''),
    nullif(meta->>'age', '')::integer,
    nullif(meta->>'birth_date', '')::date,
    nullif(meta->>'district', ''),
    nullif(meta->>'lat', ''),
    nullif(meta->>'lng', ''),
    nullif(meta->>'nik', ''),
    nullif(meta->>'specialization', ''),
    coalesce(nullif(meta->>'experience', '')::integer, 0),
    coalesce(nullif(meta->>'status', ''), 'Aktif')
  )
  on conflict (id) do update
  set username = coalesce(public.profiles.username, excluded.username),
      name = coalesce(public.profiles.name, excluded.name),
      email = excluded.email,
      phone = coalesce(public.profiles.phone, excluded.phone),
      address = coalesce(public.profiles.address, excluded.address),
      age = coalesce(public.profiles.age, excluded.age),
      birth_date = coalesce(public.profiles.birth_date, excluded.birth_date),
      district = coalesce(public.profiles.district, excluded.district),
      lat = coalesce(public.profiles.lat, excluded.lat),
      lng = coalesce(public.profiles.lng, excluded.lng),
      nik = coalesce(public.profiles.nik, excluded.nik),
      specialization = coalesce(public.profiles.specialization, excluded.specialization),
      experience = coalesce(public.profiles.experience, excluded.experience),
      status = coalesce(public.profiles.status, excluded.status),
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.orders enable row level security;

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

drop policy if exists profiles_insert_own_public_roles on public.profiles;
create policy profiles_insert_own_public_roles
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role in ('konsumen', 'teknisi')
);

drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
)
with check (
  public.is_admin()
  or (
    id = auth.uid()
    and role = (
      select p.role
      from public.profiles p
      where p.id = auth.uid()
    )
  )
);

drop policy if exists orders_insert_own_konsumen on public.orders;
create policy orders_insert_own_konsumen
on public.orders
for insert
to authenticated
with check (
  auth.uid() = konsumen_id
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'konsumen'
  )
);

drop policy if exists orders_select_owner_teknisi_admin on public.orders;
create policy orders_select_owner_teknisi_admin
on public.orders
for select
to authenticated
using (
  konsumen_id = auth.uid()
  or teknisi_id = auth.uid()
  or public.is_admin()
);

drop policy if exists orders_update_assigned_teknisi on public.orders;
create policy orders_update_assigned_teknisi
on public.orders
for update
to authenticated
using (
  teknisi_id = auth.uid()
)
with check (
  teknisi_id = auth.uid()
);

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
```

## Cara tes lokal

1. Jalankan static server, misalnya `npx serve .` atau extension Live Server.
2. Pastikan redirect URL localhost sudah didaftarkan di Supabase.
3. Tes registrasi konsumen.
4. Tes login konsumen.
5. Tes buat order.
6. Login admin manual.
7. Assign order ke teknisi.
8. Login teknisi dan update status order.

## Cara tes di GitHub Pages

1. Push perubahan ke branch yang dipakai GitHub Pages.
2. Buka `https://palileo.github.io/indosejuk/`.
3. Tes registrasi konsumen dan teknisi dari domain publik.
4. Tes login admin dari domain publik.
5. Tes dashboard admin membaca `profiles` dan `orders` langsung dari Supabase.

## Catatan implementasi

- Jika email confirmation ON, profile bootstrap bergantung pada trigger `handle_new_user()`.
- Jika trigger belum dipasang, login bisa sukses tetapi `profiles` tidak ditemukan.
- Jika `is_username_available()` belum dipasang, validasi username pre-check akan melewati RPC dan tetap mengandalkan unique index di database.
- `proof_image_data` menyimpan data URL. Untuk produksi jangka panjang, lebih baik pindah ke Supabase Storage.
