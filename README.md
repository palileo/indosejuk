# Indo Sejuk AC

Frontend statis Indo Sejuk AC yang memakai Supabase sebagai source of truth untuk:

- `auth/session`
- `public.profiles`
- `public.orders`

Local storage sekarang hanya dipakai untuk cache UI non-kritis seperti preview upload lokal, katalog gambar lokal, dan cache tampilan admin. Session aktif, profile user, daftar user admin, dan order tetap dibaca ulang dari Supabase.

## Root cause error `birth_date`

Error:

`Could not find the 'birth_date' column of 'profiles' in the schema cache`

akar masalahnya ada dua:

1. Kolom `public.profiles.birth_date` belum benar-benar ada atau belum pernah dimigrasikan konsisten.
2. Supabase schema cache bisa sesaat masih membaca struktur lama walaupun aplikasi frontend sudah meminta kolom baru.

Patch ini menyelesaikannya dengan dua lapis:

- SQL migration resmi menambahkan `birth_date` dan kolom profile lain yang dipakai frontend.
- Frontend `app.js` sekarang punya registry kolom profile, cache kolom hilang, retry otomatis tanpa kolom opsional yang sedang belum terbaca schema cache, dan login tidak lagi gagal total hanya karena `birth_date` belum terbaca.

## File penting

- `app.js`
- `index.html`
- `style.css`
- `supabase/migrations/20260325_fix_profiles_birth_date_and_auth.sql`
- `supabase/functions/sync-user-to-github/index.ts`
- `.github/workflows/sync-profiles-snapshot.yml`
- `scripts/pull-supabase-snapshot.sh`
- `scripts/pull-supabase-snapshot.ps1`
- `.env.example`

## Wajib jalankan migration

Jalankan file berikut di Supabase SQL Editor:

- `supabase/migrations/20260325_fix_profiles_birth_date_and_auth.sql`

Isi migration itu mencakup:

- `birth_date date` di `public.profiles`
- kolom frontend lain seperti `district`, `location_text`, `lat`, `lng`, `nik`, `specialization`, `experience`, `status`, `verified_at`, `verified_by`, `completed_jobs`, `created_at`, `updated_at`
- trigger `set_updated_at`
- function + trigger `handle_new_user()` untuk provisioning row `profiles` dari `auth.users.raw_user_meta_data`
- unique index `username` dan `email`
- RLS/policy aman untuk own profile dan admin

Setelah migration dijalankan, frontend akan membaca schema baru secara normal. Bila schema cache Supabase belum segar pada login pertama, frontend akan fallback aman lalu retry lagi tanpa menjatuhkan session.

## Flow registrasi publik final

### Konsumen / Teknisi

1. Frontend memanggil `supabase.auth.signUp()` dengan:
   - `email`
   - `password`
   - `user_metadata` profile
2. Metadata profile mencakup field penting seperti:
   - `role`
   - `username`
   - `name`
   - `phone`
   - `address`
   - `age`
   - `birth_date`
   - `district`
   - `location_text`
   - `lat`
   - `lng`
   - `nik`
   - `specialization`
   - `experience`
3. Trigger `handle_new_user()` membuat atau meng-upsert row `public.profiles`.
4. Status profile publik dibuat `Aktif`.
5. Jika email confirmation aktif:
   - user belum bisa login sebelum klik link email
   - setelah email confirmed dan session tersedia, `ensureProfileAfterAuth()` memastikan row `profiles` lengkap dan tetap `Aktif`
6. Jika email confirmation nonaktif:
   - session langsung tersedia
   - frontend tetap memanggil `ensureProfileAfterAuth()` lalu profile aktif

Frontend tidak lagi pura-pura meng-insert `profiles` dari browser sebelum session ada. Itu penting supaya flow konfirmasi email tetap aman dan tidak mentok di policy/RLS.

## Login final

Login memakai:

- `supabase.auth.signInWithPassword({ email, password })`

Sesudah login:

1. `fetchCurrentProfileStrict()` membaca `public.profiles` dengan select clause yang tahan schema drift.
2. Bila profile belum ada, `createMissingProfileForAuthenticatedUser()` membuatnya dari metadata auth.
3. Bila profile publik lama masih `Menunggu Verifikasi` atau kosong, `ensureApprovedPublicProfile()` mengaktifkannya otomatis setelah session valid.
4. User diarahkan ke dashboard sesuai `profile.role`.

Tujuan utamanya:

- akun existing yang sebelumnya gagal karena `birth_date` tidak lagi gagal total
- login tetap jalan meskipun schema cache Supabase masih membaca struktur lama untuk beberapa kolom opsional

## OCR KTP final

OCR tetap memakai Tesseract CDN dan sekarang lebih aman:

- OCR hanya mengisi field teknisi yang masih kosong
- input manual tetap dipertahankan
- hasil OCR bisa diterapkan ulang dengan tombol:
  - `Gunakan hasil OCR`
  - `Terapkan ulang OCR`
- tanggal lahir OCR mengisi:
  - `regTekBirthDate`
  - `regTekBirthDateManual`
  - `regTekAge` melalui `syncAgeField()`
- preview hasil OCR tetap ditampilkan agar user bisa koreksi manual
- bila OCR gagal, form manual tetap 100% bisa dipakai

Field yang diparsing:

- nama lengkap
- NIK 16 digit
- tanggal lahir
- alamat

## WhatsApp notification

Pendaftaran baru tetap memakai `wa.me` ke admin, tanpa secret WhatsApp API di browser.

Pesan sekarang lebih lengkap:

- role
- nama
- username
- email
- WhatsApp
- alamat
- lokasi teks
- Google Maps jika ada `lat/lng`
- waktu pendaftaran
- status email
- status profile

Tambahan teknisi:

- NIK
- tanggal lahir
- usia
- spesialisasi
- pengalaman
- status upload foto KTP dan selfie

Jika pop-up diblok browser, frontend memberi toast yang jujur dan aplikasi utama tetap jalan.

## Localhost dan source of truth

Aturan final:

- localhost tetap membaca data user langsung dari Supabase
- admin dashboard reload daftar user dari Supabase lewat `loadAdminMasterData()`
- cache lokal hanya fallback UI, bukan sumber master

Artinya user baru yang sudah confirmed dan aktif akan langsung terlihat di localhost setelah dashboard admin memuat ulang data dari Supabase.

## Arsitektur sinkron GitHub yang aman

Sinkron snapshot ke GitHub **tidak** dilakukan dari browser.

Patch ini memakai jalur aman:

- frontend hanya memanggil Supabase Edge Function `sync-user-to-github`
- Edge Function memegang secret server-side:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GITHUB_TOKEN`
- Edge Function membaca `public.profiles` dari server-side
- Edge Function menulis snapshot ke repo GitHub, default:
  - `data/profiles-snapshot.json`

File implementasi:

- `supabase/functions/sync-user-to-github/index.ts`

Jika Edge Function belum dideploy atau env GitHub belum diisi:

- frontend menampilkan warning yang jujur
- data utama tetap aman di Supabase
- aplikasi inti tetap berjalan normal

Tidak ada:

- `service_role` di frontend
- GitHub token di `app.js`
- klaim palsu bahwa browser bisa push ke repo dengan aman

## GitHub Actions opsional

Workflow opsional tersedia di:

- `.github/workflows/sync-profiles-snapshot.yml`

Workflow ini bisa menarik snapshot dari endpoint aman bila GitHub Secrets berikut diisi:

- `SNAPSHOT_PULL_URL`
- `SNAPSHOT_PULL_BEARER`

Snapshot GitHub ini bersifat:

- audit
- backup
- inspeksi perubahan

Snapshot GitHub **bukan** source of truth utama aplikasi.

## Script helper lokal

Tersedia:

- `scripts/pull-supabase-snapshot.sh`
- `scripts/pull-supabase-snapshot.ps1`

Fungsi script:

1. `git pull --ff-only`
2. opsional menarik snapshot dari endpoint aman jika env lokal diisi

Dokumentasi ini sengaja jujur:

- VS Code / localhost tidak otomatis update snapshot GitHub tanpa `git pull` atau fetch endpoint
- aplikasi lokal tetap lebih cepat dan akurat bila membaca langsung dari Supabase

## Konfigurasi env server-side

Contoh variabel ada di:

- `.env.example`

Variabel itu untuk:

- Edge Function
- backend/serverless
- local tooling aman

Bukan untuk frontend browser statis.

## Menjalankan lokal

Pilih salah satu:

- `python -m http.server 5500`
- VS Code Live Server
- static server lokal lain

Pastikan Supabase Auth redirect URL mencakup host lokal yang Anda pakai, misalnya:

- `http://localhost:5500/`
- `http://127.0.0.1:5500/`

## Redirect URL Supabase Auth

Set minimal:

- Site URL: `https://palileo.github.io/indosejuk/`
- Additional Redirect URLs:
  - `https://palileo.github.io/indosejuk/`
  - `http://localhost:5500/`
  - `http://127.0.0.1:5500/`

Sesuaikan port lokal jika perlu.

## Checklist test final

- Migration SQL berhasil dijalankan tanpa merusak data existing
- `birth_date` benar-benar ada di `public.profiles`
- login user existing yang tadinya gagal karena `birth_date` tidak lagi gagal total
- fallback schema cache jalan bila Supabase belum memuat kolom opsional tertentu
- registrasi konsumen mengirim metadata lengkap ke `signUp`
- registrasi teknisi mengirim metadata lengkap ke `signUp`
- setelah email confirmed, row `public.profiles` ada dan status publik `Aktif`
- login sesudah confirm email langsung bisa
- OCR mengisi nama, NIK, tanggal lahir, dan alamat bila field kosong
- manual override OCR tetap bisa
- WhatsApp pendaftaran baru mengirim teks lengkap
- localhost admin membaca data user terbaru dari Supabase
- frontend tidak menyimpan secret GitHub atau `service_role`
- sinkron GitHub hanya lewat backend/Edge Function yang memegang secret
- tidak ada blank page, reference error, infinite redirect, atau fake sync promise
