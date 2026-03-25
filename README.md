# Indo Sejuk AC

Frontend statis Indo Sejuk AC dengan source of truth utama di Supabase untuk:

- `auth/session`
- `public.profiles`
- `public.orders`

Patch ini mempertahankan flow existing dan menambahkan hardening mobile, PWA-friendly shell, serta optimasi performa nyata tanpa mengganti framework, schema, atau flow bisnis inti.

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
- bottom mobile nav sekarang fixed, touch-friendly, dan sinkron dengan view aktif
- `content-area` diberi safe bottom padding agar konten tidak tertutup nav
- form grid, register grid, upload, OCR, share location, dan action group turun ke 1 kolom saat perlu
- wrapper tabel kini lebih aman untuk horizontal scroll terkontrol, dan tabel utama berubah ke card-stack di layar kecil
- card, button, tab, dan upload target dipaksa minimal `44px` agar nyaman disentuh
- overflow horizontal liar ditekan di level `html`, `body`, media, dan kontainer utama
- safe area iPhone (`env(safe-area-inset-*)`) sekarang dihormati oleh header, konten, dan mobile nav

## PWA support

File baru:

- `manifest.webmanifest`
- `sw.js`
- `offline.html`
- `icons/icon-192.png`
- `icons/icon-512.png`
- `icons/apple-touch-icon.png`

Yang sekarang tersedia:

- manifest valid dengan `display: standalone`
- meta mobile app untuk Android dan iOS
- tombol install app berbasis `beforeinstallprompt`
- service worker minimal yang hanya meng-cache shell dasar dan aset lokal
- offline fallback jujur untuk shell

Strategi service worker:

- `network-first` untuk dokumen / HTML shell
- `stale-while-revalidate` untuk aset lokal statis seperti CSS, JS, gambar lokal, dan manifest
- request non-GET tidak disentuh
- request lintas origin tidak di-cache oleh service worker ini
- data live Supabase, auth, OCR CDN, dan request sensitif tetap mengandalkan network biasa

Catatan penting:

- offline shell bukan berarti dashboard realtime tersedia offline
- auth/login/logout tetap butuh koneksi
- data Supabase tidak dipalsukan dari cache service worker

## Performance improvements

Perubahan yang benar-benar diterapkan:

- script utama sekarang `defer`
- dimensi/aspect ratio visual penting ditambahkan untuk menekan layout shift
- gambar render diberi `loading="lazy"` dan `decoding="async"` di area yang aman
- OCR Tesseract tetap lazy-loaded dan sekarang memakai promise cache supaya tidak inject library berulang
- warm-up OCR hanya dijadwalkan saat user benar-benar masuk alur teknisi, bukan saat first paint landing
- render shell tetap muncul dulu, sedangkan data dashboard tetap diambil belakangan dari Supabase
- mobile nav sekarang pakai event delegation tunggal agar tidak membuat listener ganda saat render ulang
- helper `safeScrollTop()` dipakai saat perpindahan layar utama agar pengalaman mobile lebih rapi

## Supabase, auth, dan admin safety

Non-negotiable yang tetap berlaku:

- admin tetap localhost-only
- public host tidak boleh membuka admin UI
- service worker tidak dipakai untuk membuka akses admin
- Supabase tetap source of truth untuk session, profile, dan order
- browser frontend tidak menyimpan secret backend
- WhatsApp tetap memakai aksi `wa.me`, bukan secret API di frontend
- OCR tetap boleh gagal dengan fallback manual penuh

## Catatan migration Supabase

Migration yang masih wajib dipastikan sudah jalan:

- `supabase/migrations/20260325_fix_profiles_birth_date_and_auth.sql`

Tujuannya tetap sama:

- memastikan kolom seperti `birth_date` dan field profile lain tersedia konsisten
- menjaga provisioning profile dari `auth.users`
- menjaga login/register tidak rusak karena schema drift

## Menjalankan lokal

Contoh:

- `python -m http.server 5500`
- VS Code Live Server
- static server lokal lain

Redirect URL Supabase Auth minimal:

- `https://palileo.github.io/indosejuk/`
- `http://localhost:5500/`
- `http://127.0.0.1:5500/`

## Keterbatasan jujur

- offline mode hanya untuk shell dasar dan aset lokal, bukan dashboard realtime penuh
- data live Supabase tetap membutuhkan koneksi internet
- OCR membutuhkan CDN Tesseract saat library belum pernah termuat
- install prompt hanya muncul di browser yang memang mendukung `beforeinstallprompt`
- service worker sengaja tidak meng-cache respons sensitif Supabase secara agresif

## Checklist test yang disarankan

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
- WhatsApp action tetap terbuka
- admin tetap hanya di localhost
- tidak ada desktop regression
- tidak ada horizontal overflow liar
- tabel utama tetap terbaca di HP kecil
- tidak ada JS runtime error baru
