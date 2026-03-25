# Indo Sejuk AC

Frontend statis Indo Sejuk AC dengan source of truth utama di Supabase untuk:

- `auth/session`
- `public.profiles`
- `public.orders`
- Supabase Storage untuk upload gambar penting

Patch ini mempertahankan flow existing dan menambahkan hardening mobile, PWA-friendly shell, upload image yang benar ke Supabase Storage, hapus gambar, resend verifikasi email, serta jalur sinkron GitHub yang aman via backend/server-side.

## Kontak aplikasi

Semua kontak email aplikasi sekarang memakai:

- `becooloption@gmail.com`

## Fitur yang tetap dijaga

- landing / login
- register konsumen
- register teknisi
- dashboard semua role
- OCR KTP teknisi
- WhatsApp actions
- Supabase auth / profiles / orders
- admin localhost-only
- mobile nav dasar, sekarang diperkuat

## Fitur baru yang sekarang aktif

### 1. Upload image ke Supabase Storage

Upload penting sekarang diarahkan ke Supabase Storage:

- foto unit konsumen
- foto KTP teknisi
- foto diri teknisi
- bukti pekerjaan teknisi

Struktur bucket:

- bucket publik: `app-public-uploads`
- bucket private: `app-private-documents`

Struktur path utama:

- `users/{userId}/units/...`
- `users/{userId}/orders/{orderId}/proofs/...`
- `users/{userId}/ktp/...`
- `users/{userId}/selfie/...`

Catatan:

- foto unit dan bukti pekerjaan memakai bucket publik agar preview/order detail tetap bisa dibuka dengan URL stabil
- KTP dan selfie teknisi memakai bucket private; frontend membuat signed URL saat diperlukan
- frontend tidak menyimpan `service_role` atau GitHub token

### 2. Hapus gambar

Sekarang tersedia tombol `Hapus Gambar` untuk area relevan:

- draft upload pada form register
- gallery foto unit konsumen
- dokumen teknisi
- bukti pekerjaan teknisi

Perilaku hapus:

- selalu minta konfirmasi dulu
- mencoba hapus file di Supabase Storage
- tetap membersihkan referensi DB/UI bila file storage sudah tidak ada
- preview hilang tanpa refresh manual
- toast sukses/gagal tampil jelas

### 3. Kirim ulang email verifikasi

Saat signup belum confirmed atau link verifikasi kedaluwarsa:

- login akan menampilkan CTA `Kirim Ulang Email Verifikasi`
- frontend memakai jalur resmi Supabase Auth `auth.resend(...)` bila tersedia
- ada cooldown sederhana agar tidak spam klik
- jika fallback Edge Function belum di-deploy, flow utama tetap aman

### 4. Sinkron GitHub yang aman

Sinkron repo **tidak pernah dilakukan langsung dari browser**.

Jalur aman yang disiapkan:

- `supabase/functions/sync-user-to-github`
- `supabase/functions/sync-storage-to-github`
- `supabase/functions/resend-signup-verification`

Fungsi ini dipanggil dari frontend hanya bila backend sudah dikonfigurasi. Secret tetap server-side:

- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`

Jika backend sync belum dikonfigurasi:

- aplikasi utama tetap berjalan normal
- upload/delete tetap sukses di Supabase
- frontend hanya menampilkan warning jujur satu kali

## Mobile optimization yang sekarang aktif

Target viewport utama:

- `390x844`
- `375x667`
- `360x800`
- `412x915`
- `768x1024`
- portrait + landscape

Peningkatan utama:

- app shell lebih rapat dan aman di layar kecil
- sidebar desktop otomatis hilang pada `<= 992px`
- bottom mobile nav fixed, touch-friendly, dan sinkron dengan view aktif
- `content-area` diberi safe bottom padding agar konten tidak tertutup nav
- form grid, register grid, upload, OCR, share location, dan action group turun ke 1 kolom saat perlu
- wrapper tabel aman untuk horizontal scroll terkontrol, dan tabel utama berubah ke card-stack di layar kecil
- card, button, tab, dan upload target dipaksa minimal `44px`
- overflow horizontal liar ditekan di level `html`, `body`, media, dan kontainer utama
- safe area iPhone (`env(safe-area-inset-*)`) dihormati oleh header, konten, dan mobile nav

## PWA support

File baru:

- `manifest.webmanifest`
- `sw.js`
- `offline.html`
- `icons/icon-192.png`
- `icons/icon-512.png`
- `icons/apple-touch-icon.png`

Yang tersedia:

- manifest valid dengan `display: standalone`
- meta mobile app Android dan iOS
- tombol install app berbasis `beforeinstallprompt`
- service worker minimal untuk shell dasar dan aset lokal
- offline fallback jujur

Strategi service worker:

- `network-first` untuk dokumen / HTML shell
- `stale-while-revalidate` untuk aset lokal statis
- request non-GET tidak disentuh
- request lintas origin tidak di-cache
- auth, data live Supabase, dan OCR CDN tetap lewat network biasa

## Performance improvements

Perubahan nyata yang diterapkan:

- script utama `defer`
- image render diberi `loading="lazy"` dan `decoding="async"` di area aman
- OCR Tesseract tetap lazy-loaded dengan promise cache
- render shell tetap muncul dulu, data dashboard menyusul
- mobile nav memakai delegation tunggal agar tidak listener ganda
- helper `safeScrollTop()` dipakai saat perpindahan layar utama
- skeleton loading dipakai di dashboard dan tabel utama

## Supabase, auth, dan admin safety

Non-negotiable yang tetap berlaku:

- admin tetap localhost-only
- public host tidak boleh membuka admin UI
- service worker tidak dipakai untuk membuka akses admin
- Supabase tetap source of truth untuk session, profile, order, dan upload reference
- browser frontend tidak menyimpan secret backend
- WhatsApp tetap memakai aksi `wa.me`
- OCR tetap punya fallback manual penuh

## Migration Supabase yang perlu dijalankan

Pastikan migration berikut dijalankan:

- `supabase/migrations/20260325_fix_profiles_birth_date_and_auth.sql`
- `supabase/migrations/20260325_storage_policies_and_cleanup.sql`

Migration storage menambahkan:

- kolom path/url upload di `public.profiles`
- kolom proof image di `public.orders`
- bucket `app-public-uploads`
- bucket `app-private-documents`
- policy insert/update/delete/select yang mengikuti folder user dan tetap mengizinkan admin server-side/localhost flow

## Menjalankan lokal

Contoh:

- `python -m http.server 5500`
- VS Code Live Server
- static server lokal lain

Redirect URL Supabase Auth minimal:

- `https://palileo.github.io/indosejuk/`
- `http://localhost:5500/`
- `http://127.0.0.1:5500/`

## Env/config backend yang relevan

Lihat `.env.example`.

Variabel penting:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `GITHUB_SNAPSHOT_PATH`
- `GITHUB_UPLOADS_SNAPSHOT_PATH`

## Keterbatasan jujur

- offline mode hanya untuk shell dasar dan aset lokal, bukan dashboard realtime penuh
- data live Supabase tetap membutuhkan koneksi internet
- OCR membutuhkan CDN Tesseract saat library belum pernah termuat
- install prompt hanya muncul di browser yang memang mendukung `beforeinstallprompt`
- jika signup tidak langsung menghasilkan session karena email confirmation aktif, draft upload pada form daftar belum bisa dikirim ke Storage pada saat itu juga; user harus melanjutkan setelah email confirmed/login terverifikasi
- jika backend sync GitHub belum dikonfigurasi, aplikasi utama tetap berjalan normal tetapi snapshot repo hanya memberi warning dan tidak mengklaim sukses palsu

## Checklist pengujian final yang disarankan

- iPhone kecil `375x667`
- iPhone modern `390x844`
- Android small `360x800`
- Android medium/large `412x915`
- tablet portrait `768x1024`
- landscape mobile/tablet
- install PWA dari browser yang support
- login/logout tetap normal
- register konsumen tetap normal
- register teknisi + OCR + fallback manual tetap normal
- resend email verifikasi tampil saat relevan
- upload foto unit tersimpan ke Supabase Storage
- upload dokumen teknisi tersimpan ke Supabase Storage
- hapus gambar membersihkan storage + referensi DB/UI
- upload bukti pekerjaan tersimpan ke Supabase Storage
- WhatsApp action tetap terbuka
- admin tetap hanya di localhost
- tidak ada desktop regression
- tidak ada horizontal overflow liar
- tidak ada JS runtime error baru
