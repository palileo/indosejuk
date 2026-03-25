# Indo Sejuk AC

Frontend statis Indo Sejuk AC dengan source of truth utama di Supabase untuk:

- `auth/session`
- `public.profiles`
- `public.orders`
- Supabase Storage untuk upload gambar penting

## Flow auth terbaru

### 1. Register publik tidak lagi memakai email verification

- Register konsumen dan teknisi tidak menunggu konfirmasi email.
- Email kini opsional untuk konsumen dan teknisi.
- Akun auth dibuat server-side lewat Edge Function dan langsung `email_confirm = true` agar tidak ada error `email not confirmed` pada flow register normal.
- Setelah register, status profile default adalah `Menunggu Verifikasi`.

### 2. Aktivasi akun register sekarang berbasis verifikasi admin

- User publik baru belum boleh memakai dashboard aktif sampai admin approve.
- Admin dapat melihat user pending di dashboard admin localhost, membuka detail, lalu:
  - `Approve` -> status `Aktif`
  - `Tolak` -> status `Ditolak`
  - `Nonaktifkan` -> status `Nonaktif`
- Metadata verifikasi admin tetap dipakai lewat `verified_at` dan `verified_by` bila kolom tersedia.

### 3. Login multi-identifier

- Login menerima:
  - email
  - username
  - nomor telepon
- Role akhir diverifikasi dari `public.profiles`, bukan dari tab UI semata.
- Bila identifier bentrok lintas role, resolver backend hanya melanjutkan bila hasilnya tetap deterministik dan aman.

### 4. Email verification hanya untuk perubahan data sensitif

- Ubah sandi sekarang memakai verifikasi email Supabase yang aktif.
- Jika akun belum punya email verifikasi yang valid, UI akan meminta user menambahkan email terlebih dahulu.
- Register approval admin dan email verification untuk data sensitif dipisahkan tegas.

## Flow password/reset terbaru

- Modal `Lupa Sandi` menerima email, username, atau nomor telepon.
- Edge Function `request-password-reset` mencari akun secara aman tanpa membocorkan apakah identifier terdaftar.
- Reset email hanya dipicu jika akun memiliki email verifikasi yang benar-benar aktif.
- Akun dengan email auth sintetis tidak akan mendapat reset self-service ke alamat sintetis.

## Edge Function yang sekarang dipakai

- `supabase/functions/register-public-account`
- `supabase/functions/profile-password-login`
- `supabase/functions/request-password-reset`
- `supabase/functions/sync-user-to-github`
- `supabase/functions/sync-storage-to-github`

Function lama berikut sudah tidak relevan untuk flow baru dan dihapus dari source:

- `register-consumer-account`
- `consumer-password-login`
- `resend-signup-verification`

## Migration Supabase yang wajib dijalankan

Jalankan migration berikut:

- `supabase/migrations/20260325_fix_profiles_birth_date_and_auth.sql`
- `supabase/migrations/20260325_storage_policies_and_cleanup.sql`
- `supabase/migrations/20260325_consumer_auth_phone_and_security.sql`
- `supabase/migrations/20260326_admin_verification_and_public_auth.sql`

Migration terbaru melakukan hal penting berikut:

- status default `public.profiles` menjadi `Menunggu Verifikasi`
- email publik teknisi ikut menjadi opsional
- trigger provisioning profile tidak lagi mengaktifkan user publik otomatis
- existing user aktif tetap dipertahankan aktif
- verifikasi register dipisahkan dari email verification

## Catatan implementasi penting

- Admin tetap localhost-only.
- Upload Storage, OCR, PWA, WhatsApp, dan dashboard existing tetap dipertahankan.
- Register tetap bisa mengunggah draft file penting karena frontend membuka sesi sementara yang langsung ditutup lagi setelah upload selesai.
- Perubahan email verifikasi pertama untuk akun dengan email auth sintetis mungkin masih membutuhkan dukungan backend/auth setting tambahan jika project Supabase mengharuskan konfirmasi ke email lama sintetis yang tidak bisa diakses user.

## Menjalankan lokal

Contoh:

- `python -m http.server 5500`
- VS Code Live Server
- static server lokal lain

## Deploy backend yang berubah

Setelah update ini, deploy ulang:

- migration SQL terbaru
- Edge Function `register-public-account`
- Edge Function `profile-password-login`
- Edge Function `request-password-reset`

Contoh CLI:

- `supabase functions deploy register-public-account --project-ref zqjretruylhumkehtcli`
- `supabase functions deploy profile-password-login --project-ref zqjretruylhumkehtcli`
- `supabase functions deploy request-password-reset --project-ref zqjretruylhumkehtcli`

Jika browser menampilkan error seperti `Requested function was not found` atau `Failed to send a request to the Edge Function`, itu berarti frontend sudah berjalan tetapi function live di project Supabase belum tersedia / belum bisa dijangkau.

Opsional env backend:

- `AUTH_EMAIL_DOMAIN=auth.indosejuk.local`
