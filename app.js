/* ========================================
   INDO SEJUK AC - Local App Logic
   ======================================== */

const SUPABASE_URL = 'https://zqjretruylhumkehtcli.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxanJldHJ1eWxodW1rZWh0Y2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzU1NzksImV4cCI6MjA4OTkxMTU3OX0.k12ed42-tTAYfEsz682d1gUb2s7bpnqFnTuCclcEFa8';

const supabaseClient = window.supabase?.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const STORAGE_KEY = 'indoSejukACData';
const LEGACY_STORAGE_KEY = 'sejukac_data';
const SCHEMA_VERSION = 2;
const FALLBACK_IMAGE = 'image/logo.png';
const OCR_CDN_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
const DEFAULT_ADMIN_WHATSAPP = '08970788800';
const PROFILE_STATUS_PENDING = 'Menunggu Verifikasi';
const PROFILE_STATUS_ACTIVE = 'Aktif';
const OPTIONAL_PROFILE_COLUMNS = new Set(['location_text', 'verified_at', 'verified_by']);
const OPTIONAL_ORDER_COLUMNS = new Set(['admin_confirmation_text', 'verified_at', 'verified_by']);

let currentRole = null;
let currentView = null;
let currentUserTab = 'konsumen';
let uploadingOrderId = null;
let uploadProofImage = null;
let appData = null;
let authBootstrapPromise = null;

const remoteState = {
    session: null,
    user: null,
    profile: null,
    currentOrders: [],
    adminProfiles: {
        konsumen: [],
        teknisi: [],
        admin: []
    },
    adminOrders: [],
    authListenerBound: false
};

const draftUploads = {
    regKonUnitImages: [],
    regTekKtpPhoto: '',
    regTekSelfiePhoto: '',
    ocrLastResult: null
};

const ROLE_LABELS = {
    admin: 'Admin',
    konsumen: 'Konsumen',
    teknisi: 'Teknisi'
};

const DEFAULT_IMAGE_CATALOG = [
    { id: 'IMG001', name: 'Logo Indo Sejuk AC', category: 'brand', src: 'image/logo.png', alt: 'Logo Indo Sejuk AC', isActive: true },
    { id: 'IMG002', name: 'Hero Service AC', category: 'hero', src: 'image/hero-ac-service.png', alt: 'Teknisi service AC', isActive: true },
    { id: 'IMG003', name: 'Layanan Cuci AC', category: 'service', src: 'image/service-cuci-ac.png', alt: 'Cuci AC', isActive: true },
    { id: 'IMG004', name: 'Layanan Perbaikan AC', category: 'service', src: 'image/service-perbaikan-ac.png', alt: 'Perbaikan AC', isActive: true },
    { id: 'IMG005', name: 'Layanan Bongkar Pasang', category: 'service', src: 'image/service-bongkar-pasang.png', alt: 'Bongkar pasang AC', isActive: true },
    { id: 'IMG006', name: 'Layanan Isi Freon', category: 'service', src: 'image/service-freon.png', alt: 'Isi freon AC', isActive: true },
    { id: 'IMG007', name: 'Layanan Pasang Baru', category: 'service', src: 'image/service-pasang-baru.png', alt: 'Pemasangan AC baru', isActive: true },
    { id: 'IMG008', name: 'Layanan Diagnosa', category: 'service', src: 'image/service-cek-diagnosa.png', alt: 'Diagnosa AC', isActive: true },
    { id: 'IMG009', name: 'Layanan Berkala', category: 'service', src: 'image/service-berkala.png', alt: 'Service AC berkala', isActive: true },
    { id: 'IMG010', name: 'Foto Teknisi', category: 'teknisi', src: 'image/technician-1.png', alt: 'Teknisi Indo Sejuk AC', isActive: true },
    { id: 'IMG011', name: 'Unit Indoor AC', category: 'unit', src: 'image/ac-indoor-1.png', alt: 'Unit indoor AC', isActive: true },
    { id: 'IMG012', name: 'Unit Outdoor AC', category: 'unit', src: 'image/ac-outdoor-1.png', alt: 'Unit outdoor AC', isActive: true }
];

const DEFAULT_SERVICES = [
    { id: 'SRV001', name: 'Cuci AC', price: 75000, description: 'Pembersihan menyeluruh agar AC tetap dingin dan hemat listrik.', imageCatalogId: 'IMG003', image: 'image/service-cuci-ac.png', active: true },
    { id: 'SRV002', name: 'Bongkar Pasang AC', price: 350000, description: 'Relokasi AC lama atau pemasangan unit baru yang rapi dan aman.', imageCatalogId: 'IMG005', image: 'image/service-bongkar-pasang.png', active: true },
    { id: 'SRV003', name: 'Perbaikan AC', price: 150000, description: 'Diagnosa dan perbaikan masalah AC oleh teknisi berpengalaman.', imageCatalogId: 'IMG004', image: 'image/service-perbaikan-ac.png', active: true },
    { id: 'SRV004', name: 'Isi Freon/Refrigerant', price: 200000, description: 'Pengisian refrigerant sesuai jenis AC agar performa dingin kembali maksimal.', imageCatalogId: 'IMG006', image: 'image/service-freon.png', active: true },
    { id: 'SRV005', name: 'Pasang AC Baru', price: 350000, description: 'Pemasangan unit baru dengan standar instalasi yang presisi.', imageCatalogId: 'IMG007', image: 'image/service-pasang-baru.png', active: true },
    { id: 'SRV006', name: 'Service Berkala', price: 100000, description: 'Maintenance rutin untuk menjaga AC tetap awet, higienis, dan hemat listrik.', imageCatalogId: 'IMG009', image: 'image/service-berkala.png', active: true },
    { id: 'SRV007', name: 'Cek & Diagnosa', price: 50000, description: 'Pengecekan awal untuk menemukan sumber masalah sebelum tindakan teknis.', imageCatalogId: 'IMG008', image: 'image/service-cek-diagnosa.png', active: true }
];

function createDefaultUsers() {
    return {
        admin: [],
        konsumen: [],
        teknisi: []
    };
}

function createDefaultData() {
    return sanitizeData({
        metadata: {
            schemaVersion: SCHEMA_VERSION,
            historyResetAt: new Date().toISOString(),
            migratedFromLegacy: false
        },
        services: DEFAULT_SERVICES,
        users: createDefaultUsers(),
        orders: [],
        currentSession: null,
        uiCache: {
            unitImagesByUser: {},
            teknisiDocsByUser: {}
        },
        imageCatalog: DEFAULT_IMAGE_CATALOG,
        appSettings: {
            appName: 'Indo Sejuk AC',
            storageMode: 'supabase-auth-supabase-data',
            ocrLibrary: 'tesseract-cdn',
            adminWhatsApp: DEFAULT_ADMIN_WHATSAPP
        }
    });
}

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function canUseSupabase() {
    return Boolean(supabaseClient);
}

function shouldFallbackToLocalAuth(error) {
    console.warn('Fallback auth lokal sudah dimatikan.', error);
    return false;
}

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    let digits = raw.replace(/\D/g, '');
    if (!digits) return '';

    if (digits.startsWith('62')) {
        digits = `0${digits.slice(2)}`;
    } else if (digits.startsWith('8')) {
        digits = `0${digits}`;
    }

    return digits;
}

function normalizeWhatsAppNumber(value) {
    const phone = normalizePhone(value);
    if (!phone) return '';
    if (phone.startsWith('0')) return `62${phone.slice(1)}`;
    if (phone.startsWith('62')) return phone;
    return phone;
}

function getAdminWhatsAppNumber() {
    return normalizeWhatsAppNumber(getData()?.appSettings?.adminWhatsApp || DEFAULT_ADMIN_WHATSAPP) || normalizeWhatsAppNumber(DEFAULT_ADMIN_WHATSAPP);
}

function formatDisplayPhone(value) {
    const normalized = normalizePhone(value);
    return normalized || '-';
}

function isProfileApproved(profile) {
    return String(profile?.status || '').trim().toLowerCase() === PROFILE_STATUS_ACTIVE.toLowerCase();
}

function getMapsLink(lat, lng) {
    if (!lat || !lng) return '';
    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;
}

function formatLocationSummary(record = {}) {
    const segments = [];
    if (record.locationText) segments.push(record.locationText);
    if (record.lat && record.lng) segments.push(`${record.lat}, ${record.lng}`);
    if (!segments.length && record.address) segments.push(record.address);
    return segments.join(' | ') || '-';
}

function formatVerificationInfo(record = {}) {
    if (!record.verifiedAt) return 'Belum diverifikasi';
    const adminList = Array.isArray(remoteState.adminProfiles?.admin) ? remoteState.adminProfiles.admin : [];
    const matchedAdmin = adminList.find((item) => item.id === record.verifiedBy);
    const verifier = record.verifiedByName || matchedAdmin?.name || (record.verifiedBy === remoteState.profile?.id ? remoteState.profile?.name : '') || 'Admin';
    return `${formatDateTime(record.verifiedAt)} oleh ${verifier}`;
}

function buildMessageLines(lines = []) {
    return lines.filter(Boolean).join('\n');
}

function prepareWhatsAppPopup() {
    try {
        return window.open('', '_blank');
    } catch (error) {
        return null;
    }
}

function closePreparedPopup(popup) {
    if (popup && !popup.closed) popup.close();
}

function openWhatsAppChat(phone, message, popup = null) {
    const targetPhone = normalizeWhatsAppNumber(phone);
    if (!targetPhone) {
        closePreparedPopup(popup);
        showToast('Nomor WhatsApp tujuan belum tersedia.', 'warning');
        return false;
    }

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(String(message || '').trim())}`;
    if (popup && !popup.closed) {
        popup.location.href = url;
        return true;
    }

    const popupWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!popupWindow) {
        showToast('WhatsApp tidak terbuka otomatis. Izinkan pop-up browser lalu coba lagi.', 'warning');
        return false;
    }
    return true;
}

function buildRegistrationWhatsAppMessage(role, formValues = {}) {
    const roleLabel = ROLE_LABELS[role] || role;
    return buildMessageLines([
        `Pendaftaran ${roleLabel} baru menunggu verifikasi admin.`,
        '',
        `Nama: ${formValues.name || '-'}`,
        `Username: ${formValues.username || '-'}`,
        `Email: ${formValues.email || '-'}`,
        `WhatsApp: ${formatDisplayPhone(formValues.phone)}`,
        role === 'konsumen' ? `Area: ${formValues.district || '-'}` : `Spesialisasi: ${formValues.specialization || '-'}`,
        `Alamat: ${formValues.address || '-'}`,
        `Lokasi teks: ${formValues.locationText || '-'}`,
        formValues.lat && formValues.lng ? `Google Maps: ${getMapsLink(formValues.lat, formValues.lng)}` : '',
        role === 'teknisi' ? `NIK: ${formValues.nik || '-'}` : ''
    ]);
}

function openCustomerServiceWhatsApp() {
    return openWhatsAppChat(
        getAdminWhatsAppNumber(),
        buildMessageLines([
            'Halo Indo Sejuk AC, saya ingin konsultasi dengan CS.',
            '',
            'Mohon info layanan yang tersedia untuk area saya.'
        ])
    );
}

function notifyAdminNewRegistration(role, formValues = {}, popup = null) {
    return openWhatsAppChat(getAdminWhatsAppNumber(), buildRegistrationWhatsAppMessage(role, formValues), popup);
}

function buildOrderWhatsAppMessage(order = {}) {
    return buildMessageLines([
        'Pesanan layanan baru menunggu verifikasi admin.',
        '',
        `No. Pesanan: ${getOrderLabel(order)}`,
        `Konsumen: ${order.konsumenName || '-'}`,
        `Layanan: ${order.serviceName || '-'}`,
        `Tanggal Preferensi: ${formatDate(order.preferredDate || order.createdAt)}`,
        `Telepon: ${formatDisplayPhone(order.phone)}`,
        `Alamat: ${order.address || '-'}`,
        `Merek AC: ${order.brand || '-'}`,
        `PK: ${order.pk || '-'}`,
        `Refrigerant: ${order.refrigerant || '-'}`,
        `Catatan: ${order.notes || '-'}`
    ]);
}

function notifyAdminNewOrder(order = {}, popup = null) {
    return openWhatsAppChat(getAdminWhatsAppNumber(), buildOrderWhatsAppMessage(order), popup);
}

function buildAdminOrderConfirmationMessage(order, teknisi, customMessage = '') {
    if (customMessage) return customMessage.trim();
    return buildMessageLines([
        `Halo ${order.konsumenName || 'Bapak/Ibu'}, pesanan ${getOrderLabel(order)} sudah diverifikasi admin Indo Sejuk AC.`,
        `Layanan: ${order.serviceName || '-'}`,
        `Tanggal preferensi: ${formatDate(order.preferredDate || order.createdAt)}`,
        `Teknisi penugasan: ${teknisi?.name || '-'}`,
        `Kontak teknisi: ${formatDisplayPhone(teknisi?.phone)}`,
        'Tim kami akan menghubungi Anda kembali bila ada penyesuaian jadwal. Terima kasih.'
    ]);
}

function extractMissingColumnName(error) {
    const message = String(error?.message || error || '');
    const patterns = [
        /column ["']?([a-z_]+)["']? of relation/i,
        /column ["']?([a-z_]+)["']? does not exist/i,
        /Could not find the ['"]([a-z_]+)['"] column/i
    ];
    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match?.[1]) return match[1];
    }
    return '';
}

function normalizeLoginIdentifier(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return normalizeEmail(raw);
}

function identifiersMatch(left, right) {
    const leftValue = String(left || '').trim();
    const rightValue = String(right || '').trim();
    if (!leftValue || !rightValue) return false;

    const emailMode = leftValue.includes('@') || rightValue.includes('@');
    return emailMode
        ? normalizeEmail(leftValue) === normalizeEmail(rightValue)
        : normalizePhone(leftValue) === normalizePhone(rightValue);
}

function isLocalhostEnv() {
    return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

function canAccessAdmin() {
    return true;
}

async function getCurrentAuthUser() {
    if (!canUseSupabase()) return null;
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) {
        console.error('Gagal mengambil auth user:', error);
        return null;
    }
    return data.user || null;
}

async function fetchCurrentProfile() {
    const user = await getCurrentAuthUser();
    if (!user) return null;

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Gagal mengambil profile:', error);
        return null;
    }

    return data;
}

function upsertLocalProfile(profile, overrides = {}) {
    const role = overrides.role || profile?.role;
    if (!role || !getData().users?.[role]) return null;

    const data = getData();
    const existingUser = (data.users[role] || []).find((item) => item.id === profile?.id) || null;
    Object.keys(data.users).forEach((key) => {
        if (key !== role) {
            data.users[key] = (data.users[key] || []).filter((item) => item.id !== profile?.id);
        }
    });

    const normalizedUser = normalizeUser({
        ...(existingUser || {}),
        ...(profile || {}),
        ...overrides,
        role,
        password: overrides.password ?? profile?.password ?? existingUser?.password ?? '',
        completedJobs: overrides.completedJobs ?? profile?.completedJobs ?? profile?.completed_jobs ?? 0
    }, role, data.users[role].length);
    const existingIndex = data.users[role].findIndex((item) => item.id === normalizedUser.id);

    if (existingIndex >= 0) {
        data.users[role][existingIndex] = {
            ...data.users[role][existingIndex],
            ...normalizedUser
        };
    } else {
        data.users[role].push(normalizedUser);
    }

    saveData(data);
    return normalizedUser;
}

function applySupabaseSession(profile, overrides = {}) {
    const localUser = upsertLocalProfile(profile, overrides);
    if (!localUser) return null;

    saveSession({
        role: localUser.role,
        userId: localUser.id,
        loginAt: new Date().toISOString(),
        provider: 'supabase'
    });
    currentRole = localUser.role;
    return localUser;
}

function applyLocalSession(profile, overrides = {}) {
    const localUser = upsertLocalProfile(profile, overrides);
    if (!localUser) return null;

    saveSession({
        role: localUser.role,
        userId: localUser.id,
        loginAt: new Date().toISOString(),
        provider: 'local'
    });
    currentRole = localUser.role;
    return localUser;
}

function mapProfileToLocalUser(profile, role, index = 0) {
    const existing = getData().users?.[role]?.find((item) => item.id === profile?.id) || {};
    return normalizeUser({
        ...existing,
        ...(profile || {}),
        role,
        password: existing.password || '',
        joinedAt: profile?.created_at || existing.joinedAt || new Date().toISOString(),
        completedJobs: profile?.completed_jobs ?? profile?.completedJobs ?? existing.completedJobs ?? 0
    }, role, index);
}

function cacheProfilesByRole(role, profiles) {
    const data = getData();
    data.users[role] = (profiles || []).map((profile, index) => mapProfileToLocalUser(profile, role, index));
    saveData(data);
    return data.users[role];
}

async function registerKonsumenSupabase(formValues) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');
    const email = normalizeEmail(formValues.email);
    const password = formValues.password.trim();
    const phone = normalizePhone(formValues.phone);

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) throw error;
    if (!data.user) throw new Error('User auth tidak berhasil dibuat');

    const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
            id: data.user.id,
            role: 'konsumen',
            username: formValues.username.trim(),
            name: formValues.name.trim(),
            email,
            phone: phone || null,
            address: formValues.address?.trim() || null,
            age: formValues.age ? Number(formValues.age) : null,
            status: 'Aktif'
        });

    if (profileError) throw profileError;

    return data.user;
}

async function registerTeknisiSupabase(formValues) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');
    const email = normalizeEmail(formValues.email);
    const password = formValues.password.trim();
    const phone = normalizePhone(formValues.phone);

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) throw error;
    if (!data.user) throw new Error('User auth tidak berhasil dibuat');

    const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
            id: data.user.id,
            role: 'teknisi',
            username: formValues.username.trim(),
            name: formValues.name.trim(),
            email,
            phone: phone || null,
            nik: formValues.nik?.trim() || null,
            specialization: formValues.specialization?.trim() || null,
            status: 'Aktif',
            completed_jobs: 0
        });

    if (profileError) throw profileError;

    return data.user;
}

async function signInSupabase(email, password) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: normalizeEmail(email),
        password: password.trim()
    });

    if (error) throw error;
    return data;
}

function isEmailIdentifier(identifier) {
    return String(identifier || '').includes('@');
}

async function findProfileByIdentifier(role, identifier) {
    const normalized = normalizeLoginIdentifier(identifier);
    if (!normalized) return null;
    if (!canUseSupabase()) return null;

    const profiles = await fetchProfilesByRole(role);
    return (profiles || []).find((profile) => identifiersMatch(profile?.email, normalized)) || null;
}

async function fetchProfilesByRole(role) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

function showAdminDashboard() {
    openAppLayout();
    renderAppShell();
    navigateTo('admin-home');
}

function showKonsumenDashboard() {
    openAppLayout();
    renderAppShell();
    navigateTo('konsumen-home');
}

function showTeknisiDashboard() {
    openAppLayout();
    renderAppShell();
    navigateTo('teknisi-home');
}

function showDashboardForRole(role) {
    if (role === 'admin') {
        showAdminDashboard();
        return;
    }
    if (role === 'konsumen') {
        showKonsumenDashboard();
        return;
    }
    if (role === 'teknisi') {
        showTeknisiDashboard();
    }
}

async function handleSupabaseLogin(email, password) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');
    await signInSupabase(email, password);

    const profile = await fetchCurrentProfile();
    if (!profile) throw new Error('Profile user tidak ditemukan');

    const localOverrides = {
        password: password.trim(),
        email: normalizeEmail(profile.email || email),
        phone: normalizePhone(profile.phone)
    };

    if (profile.role === 'admin') {
        if (!canAccessAdmin()) {
            await supabaseClient.auth.signOut();
            saveSession(null);
            currentRole = null;
            showToast('Akses admin memerlukan profile admin yang valid.', 'warning');
            return null;
        }
        const localUser = applySupabaseSession(profile, localOverrides);
        showDashboardForRole('admin');
        return localUser;
    }

    if (profile.role === 'konsumen') {
        const localUser = applySupabaseSession(profile, localOverrides);
        showDashboardForRole('konsumen');
        return localUser;
    }

    if (profile.role === 'teknisi') {
        const localUser = applySupabaseSession(profile, localOverrides);
        showDashboardForRole('teknisi');
        return localUser;
    }

    throw new Error(`Role user tidak dikenali: ${profile.role}`);
}

async function handleProfileLogin(role, identifier, password) {
    const profile = await handleSupabaseLogin(identifier, password);
    if (!profile) throw new Error('Email tidak cocok.');

    const authenticatedUser = profile;
    if (authenticatedUser && authenticatedUser.role !== role) {
        await logoutSupabase();
        saveSession(null);
        currentRole = null;
        throw new Error(`Akun ini terdaftar sebagai ${authenticatedUser.role}, bukan ${role}.`);
    }

    return authenticatedUser;
}

async function loadAdminMasterData() {
    if (!canUseSupabase()) return false;
    const konsumen = await fetchProfilesByRole('konsumen');
    const teknisi = await fetchProfilesByRole('teknisi');
    const admin = await fetchProfilesByRole('admin');

    cacheProfilesByRole('konsumen', konsumen);
    cacheProfilesByRole('teknisi', teknisi);
    cacheProfilesByRole('admin', admin);

    renderAdminKonsumenTable(konsumen);
    renderAdminTeknisiTable(teknisi);
    renderAdminAdminTable(admin);
    return true;
}

function hideAdminForPublic() {
    syncAdminAccessUI();
}

function isAdminView(viewId = '') {
    return String(viewId || '').startsWith('admin');
}

function syncAdminAccessUI() {
    const roleAdminCard = document.getElementById('roleAdmin');
    const loginAdminTab = document.getElementById('loginRoleTab-admin');
    const roleCards = document.getElementById('roleCards');

    if (roleAdminCard) {
        roleAdminCard.style.display = '';
        roleAdminCard.setAttribute('aria-hidden', 'false');
    }

    if (loginAdminTab) {
        loginAdminTab.style.display = '';
        loginAdminTab.disabled = false;
        loginAdminTab.setAttribute('aria-hidden', 'false');
    }

    if (roleCards) {
        roleCards.classList.remove('role-cards--admin-hidden');
    }
}

async function syncNewUserToRemote(user, role) {
    // Sinkronisasi ke GitHub wajib lewat backend/serverless function yang memegang secret,
    // bukan langsung dari browser/frontend statis.
    const warningMessage = `Sinkronisasi remote untuk ${role} belum dijalankan karena backend aman belum tersedia.`;
    console.warn(warningMessage, { role, userId: user?.id || null });
    return {
        ok: false,
        skipped: true,
        message: 'Data lokal tersimpan. Sinkronisasi repo GitHub menunggu backend/serverless yang aman.'
    };
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function debounce(fn, wait = 400) {
    let timeoutId = null;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), wait);
    };
}

function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatDateTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function calculateAge(birthDate) {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age >= 0 ? age : '';
}

function formatIsoDateToManual(isoDate) {
    const value = String(isoDate || '').trim();
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return '';
    return `${match[3]}/${match[2]}/${match[1]}`;
}

function formatManualDateInput(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseManualDateToIso(value) {
    const match = String(value || '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return '';
    const [, dayString, monthString, yearString] = match;
    const day = Number(dayString);
    const month = Number(monthString);
    const year = Number(yearString);
    const date = new Date(year, month - 1, day);
    if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return '';
    }
    return `${yearString}-${monthString}-${dayString}`;
}

function handleManualBirthDateInput(input) {
    if (!input) return;
    input.value = formatManualDateInput(input.value);
    input.setCustomValidity('');
}

function resolveBirthDateValue(dateInputId, manualInputId) {
    const dateInput = document.getElementById(dateInputId);
    const manualInput = document.getElementById(manualInputId);
    if (!dateInput) return '';
    const manualValue = manualInput?.value.trim() || '';
    if (!manualValue) return dateInput.value || '';
    const isoDate = parseManualDateToIso(manualValue);
    if (!isoDate) {
        if (manualInput) manualInput.setCustomValidity('Format tanggal manual harus dd/mm/yyyy yang valid.');
        return dateInput.value || '';
    }
    dateInput.value = isoDate;
    if (manualInput) {
        manualInput.value = formatIsoDateToManual(isoDate);
        manualInput.setCustomValidity('');
    }
    return isoDate;
}

function applyManualBirthDate(manualInputId, dateInputId, ageInputId) {
    const manualInput = document.getElementById(manualInputId);
    const dateInput = document.getElementById(dateInputId);
    if (!manualInput || !dateInput) return;
    if (!manualInput.value.trim()) {
        manualInput.setCustomValidity('');
        dateInput.value = '';
        syncAgeField(dateInputId, ageInputId);
        return;
    }
    const isoDate = parseManualDateToIso(manualInput.value);
    if (!isoDate) {
        manualInput.setCustomValidity('Format tanggal manual harus dd/mm/yyyy yang valid.');
        manualInput.reportValidity();
        return;
    }
    dateInput.value = isoDate;
    manualInput.value = formatIsoDateToManual(isoDate);
    manualInput.setCustomValidity('');
    syncAgeField(dateInputId, ageInputId);
}

function slugify(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function nextId(items, prefix) {
    const maxId = (items || []).reduce((maxValue, item) => {
        const numeric = Number(String(item.id || '').replace(prefix, ''));
        return Number.isFinite(numeric) ? Math.max(maxValue, numeric) : maxValue;
    }, 0);
    return `${prefix}${String(maxId + 1).padStart(3, '0')}`;
}

function resolveImageSource(src) {
    if (!src) return FALLBACK_IMAGE;
    return src;
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function normalizeImageCatalog(items) {
    const baseMap = new Map(DEFAULT_IMAGE_CATALOG.map((item) => [item.id, deepClone(item)]));
    (items || []).forEach((item) => {
        if (item && item.id) {
            baseMap.set(item.id, {
                id: item.id,
                name: item.name || 'Gambar',
                category: item.category || 'general',
                src: item.src || FALLBACK_IMAGE,
                alt: item.alt || item.name || 'Gambar Indo Sejuk AC',
                isActive: item.isActive !== false
            });
        }
    });
    return Array.from(baseMap.values());
}

function normalizeService(service, index = 0) {
    const fallback = DEFAULT_SERVICES[index] || DEFAULT_SERVICES[0];
    return {
        id: service?.id || fallback.id || nextId([], 'SRV'),
        name: service?.name || fallback.name || 'Layanan',
        price: Number(service?.price ?? fallback.price ?? 0),
        description: service?.description || fallback.description || '',
        imageCatalogId: service?.imageCatalogId || fallback.imageCatalogId || '',
        image: resolveImageSource(service?.image || fallback.image),
        active: service?.active !== false
    };
}

function normalizeUser(user, role, index = 0) {
    const defaults = createDefaultUsers()[role][Math.min(index, createDefaultUsers()[role].length - 1)] || {};
    const normalized = {
        ...defaults,
        ...(user || {}),
        id: user?.id || defaults.id || nextId([], role === 'admin' ? 'A' : role === 'teknisi' ? 'T' : 'K'),
        role,
        name: user?.name || user?.nama || defaults.name || '',
        username: user?.username || slugify(user?.name || defaults.name || `${role}-${index + 1}`),
        password: user?.password ?? defaults.password ?? '',
        email: normalizeEmail(user?.email || defaults.email || ''),
        phone: normalizePhone(user?.phone || user?.telepon || defaults.phone || ''),
        address: user?.address || user?.alamat || '',
        birthDate: user?.birthDate || user?.tanggalLahir || '',
        age: calculateAge(user?.birthDate || user?.tanggalLahir || '') || user?.age || '',
        status: user?.status || 'Aktif',
        joinedAt: user?.joinedAt || user?.joined || defaults.joinedAt || new Date().toISOString()
    };

    if (role === 'konsumen') {
        normalized.unitImages = Array.isArray(user?.unitImages) ? user.unitImages : [];
        normalized.district = user?.district || user?.kecamatan || '';
        normalized.lat = user?.lat || '';
        normalized.lng = user?.lng || '';
    }

    if (role === 'teknisi') {
        normalized.nik = user?.nik || user?.NIK || '';
        normalized.specialization = user?.specialization || user?.spesialisasi || 'Semua Layanan';
        normalized.experience = Number(user?.experience ?? user?.pengalaman ?? 0);
        normalized.ktpPhoto = user?.ktpPhoto || '';
        normalized.selfiePhoto = user?.selfiePhoto || '';
        normalized.lat = user?.lat || '';
        normalized.lng = user?.lng || '';
        normalized.completedJobs = Number(user?.completedJobs || 0);
    }

    return normalized;
}

function recalculateDerivedFields(data) {
    data.users.konsumen = (data.users.konsumen || []).map((user, index) => normalizeUser(user, 'konsumen', index));
    data.users.teknisi = (data.users.teknisi || []).map((user, index) => normalizeUser(user, 'teknisi', index));
    data.users.admin = (data.users.admin || []).map((user, index) => normalizeUser(user, 'admin', index));

    const completedMap = new Map();
    (data.orders || []).forEach((order) => {
        if (order.status === 'Selesai' && order.teknisiId) {
            completedMap.set(order.teknisiId, (completedMap.get(order.teknisiId) || 0) + 1);
        }
    });

    data.users.teknisi = data.users.teknisi.map((user) => ({
        ...user,
        completedJobs: completedMap.get(user.id) || 0,
        age: calculateAge(user.birthDate) || ''
    }));

    data.users.konsumen = data.users.konsumen.map((user) => ({
        ...user,
        age: calculateAge(user.birthDate) || ''
    }));

    return data;
}

function sanitizeData(input) {
    const data = deepClone(input || {});
    data.metadata = {
        schemaVersion: SCHEMA_VERSION,
        historyResetAt: data?.metadata?.historyResetAt || new Date().toISOString(),
        migratedFromLegacy: Boolean(data?.metadata?.migratedFromLegacy),
        lastSavedAt: new Date().toISOString()
    };
    data.imageCatalog = normalizeImageCatalog(data.imageCatalog);
    data.services = (Array.isArray(data.services) && data.services.length ? data.services : DEFAULT_SERVICES).map(normalizeService);
    data.users = data.users || {};
    data.users.admin = Array.isArray(data.users.admin) && data.users.admin.length ? data.users.admin : createDefaultUsers().admin;
    data.users.konsumen = Array.isArray(data.users.konsumen) && data.users.konsumen.length ? data.users.konsumen : createDefaultUsers().konsumen;
    data.users.teknisi = Array.isArray(data.users.teknisi) && data.users.teknisi.length ? data.users.teknisi : createDefaultUsers().teknisi;
    data.orders = Array.isArray(data.orders) ? data.orders : [];
    data.currentSession = data.currentSession || null;
    data.uiCache = data.uiCache || {
        unitImagesByUser: {},
        teknisiDocsByUser: {}
    };
    data.appSettings = {
        appName: 'Indo Sejuk AC',
        storageMode: 'supabase-auth-supabase-data',
        adminWhatsApp: DEFAULT_ADMIN_WHATSAPP,
        ...(data.appSettings || {})
    };
    return recalculateDerivedFields(data);
}

function migrateLegacyData(raw) {
    const defaults = createDefaultData();
    if (!raw || typeof raw !== 'object') return defaults;

    const migrated = {
        ...defaults,
        metadata: {
            ...defaults.metadata,
            migratedFromLegacy: true
        },
        services: Array.isArray(raw.services) && raw.services.length ? raw.services : defaults.services,
        imageCatalog: Array.isArray(raw.imageCatalog) && raw.imageCatalog.length ? raw.imageCatalog : defaults.imageCatalog,
        users: {
            admin: Array.isArray(raw.users?.admin) && raw.users.admin.length ? raw.users.admin : defaults.users.admin,
            konsumen: Array.isArray(raw.users?.konsumen) && raw.users.konsumen.length ? raw.users.konsumen : defaults.users.konsumen,
            teknisi: Array.isArray(raw.users?.teknisi) && raw.users.teknisi.length ? raw.users.teknisi : defaults.users.teknisi
        },
        orders: [],
        currentSession: null,
        appSettings: {
            ...defaults.appSettings,
            ...(raw.appSettings || {})
        }
    };

    return sanitizeData(migrated);
}

function loadStoredData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            return sanitizeData(JSON.parse(raw));
        } catch (error) {
            console.error('Gagal membaca storage baru, gunakan data default.', error);
        }
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
        try {
            return migrateLegacyData(JSON.parse(legacyRaw));
        } catch (error) {
            console.error('Gagal migrasi storage lama, gunakan data default.', error);
        }
    }

    return createDefaultData();
}

function saveData(data) {
    appData = sanitizeData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    return appData;
}

function getData() {
    if (!appData) {
        appData = loadStoredData();
        saveData(appData);
    }
    return appData;
}

function saveSession(session) {
    const data = getData();
    data.currentSession = session || null;
    saveData(data);
}

function getCurrentSession() {
    return getData().currentSession || null;
}

function findUserById(role, userId) {
    return getData().users?.[role]?.find((user) => user.id === userId) || null;
}

function getCurrentUser() {
    const session = getCurrentSession();
    if (!session || !session.role || !session.userId) return null;
    return findUserById(session.role, session.userId);
}

function resetToPublicLanding(message = '') {
    saveSession(null);
    currentRole = null;
    currentView = null;
    uploadingOrderId = null;
    uploadProofImage = null;
    document.getElementById('formLogin')?.reset();
    switchLoginRole('konsumen');
    showLanding();
    if (message) showToast(message, 'warning');
}

function ensureValidSession(showMessage = false) {
    const session = getCurrentSession();
    if (!session) return false;
    if (session.role === 'admin' && !canAccessAdmin(session.role)) {
        resetToPublicLanding(showMessage ? 'Dashboard admin hanya tersedia untuk profile admin yang valid.' : '');
        return false;
    }
    const user = getCurrentUser();
    if (user) return true;
    saveSession(null);
    currentRole = null;
    currentView = null;
    if (showMessage) {
        showToast('Session tidak valid. Silakan login kembali.', 'warning');
    }
    showLanding();
    return false;
}

function isUsernameTaken(role, username, excludeUserId = '') {
    const normalized = String(username || '').trim().toLowerCase();
    if (!normalized) return false;
    return getData().users[role].some((user) => user.id !== excludeUserId && String(user.username || '').trim().toLowerCase() === normalized);
}

function loginUser(role, username, password) {
    return null;
}

async function logoutUser(showMessage = true) {
    await logoutSupabase();
    saveSession(null);
    currentRole = null;
    currentView = null;
    uploadingOrderId = null;
    uploadProofImage = null;
    document.getElementById('formLogin')?.reset();
    switchLoginRole('konsumen');
    showLanding();
    if (showMessage) showToast('Anda berhasil logout.', 'success');
}

function requireRole(role) {
    if (!ensureValidSession(true)) return false;
    const session = getCurrentSession();
    if (session?.role !== role) {
        showToast(`Akses hanya untuk ${ROLE_LABELS[role] || role}.`, 'warning');
        navigateTo(`${session.role}-home`);
        return false;
    }
    return true;
}

function requireAdminAccess() {
    if (!ensureValidSession(true)) return false;
    const session = getCurrentSession();
    if (session?.role !== 'admin') {
        showToast('Akses hanya untuk Admin.', 'warning');
        navigateTo(`${session.role}-home`);
        return false;
    }
    if (!canAccessAdmin(session.role)) {
        resetToPublicLanding('Dashboard admin hanya tersedia untuk profile admin yang valid.');
        return false;
    }
    return true;
}

function getNavItems(role) {
    const sharedHome = { id: `${role}-home`, label: 'Dashboard', icon: navIcon('home') };
    if (role === 'konsumen') {
        return [
            sharedHome,
            { id: 'konsumen-order', label: 'Pesan Layanan', icon: navIcon('plus') },
            { id: 'konsumen-history', label: 'Riwayat', icon: navIcon('clock') },
            { id: 'konsumen-profile', label: 'Profil', icon: navIcon('user') },
            { id: 'konsumen-unit', label: 'Foto Unit', icon: navIcon('camera') }
        ];
    }
    if (role === 'teknisi') {
        return [
            sharedHome,
            { id: 'teknisi-jobs', label: 'Semua Pekerjaan', icon: navIcon('grid') },
            { id: 'teknisi-profile', label: 'Profil', icon: navIcon('user') },
            { id: 'teknisi-docs', label: 'Dokumen', icon: navIcon('file') }
        ];
    }
    return [
        sharedHome,
        { id: 'admin-orders', label: 'Pesanan', icon: navIcon('grid') },
        { id: 'admin-users', label: 'Data Master', icon: navIcon('users') }
    ];
}

function navIcon(type) {
    const icons = {
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
        grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
        file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>'
    };
    return icons[type] || icons.home;
}

function showLanding() {
    document.getElementById('appHeader').style.display = 'none';
    document.getElementById('appMain').style.display = 'none';
    document.getElementById('appFooter').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    syncAdminAccessUI();
    renderDefaultAccountList();
    renderLandingSessionNotice();
}

function openAppLayout() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('appHeader').style.display = 'block';
    document.getElementById('appMain').style.display = 'flex';
    document.getElementById('appFooter').style.display = 'block';
}

function showRegisterPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'flex';
}

function showLoginPage() {
    showLanding();
}

function switchRegisterTab(tab, element) {
    document.querySelectorAll('.reg-tab').forEach((button) => button.classList.remove('active'));
    if (element) element.classList.add('active');
    document.getElementById('regFormKonsumen').style.display = tab === 'konsumen' ? 'block' : 'none';
    document.getElementById('regFormTeknisi').style.display = tab === 'teknisi' ? 'block' : 'none';
}

function switchLoginRole(role, element) {
    if (role === 'admin' && !canAccessAdmin(role)) {
        role = 'konsumen';
        element = null;
    }
    const input = document.getElementById('loginRole');
    if (input) input.value = role;
    document.querySelectorAll('.login-role-tabs .tab').forEach((button) => button.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    } else {
        document.getElementById(`loginRoleTab-${role}`)?.classList.add('active');
    }
}

function renderDefaultAccountList() {
    const container = document.getElementById('defaultAccountList');
    if (!container) return;
    // Landing page publik tidak boleh membocorkan kredensial default role apa pun.
    container.innerHTML = '';
    container.style.display = 'none';
}

function renderLandingSessionNotice() {
    const container = document.getElementById('landingSessionNotice');
    if (!container) return;
    const user = getCurrentUser();
    if (!user) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    container.style.display = 'block';
    container.innerHTML = `
        <p>Session aktif: <strong>${escapeHtml(user.name)}</strong> (${escapeHtml(ROLE_LABELS[user.role])}).</p>
        <div class="btn-action-group">
            <button class="btn btn-primary btn-sm" type="button" onclick="resumeSession()">Kembali ke Dashboard</button>
            <button class="btn btn-outline btn-sm" type="button" onclick="logoutUser()">Keluar</button>
        </div>
    `;
}

function resumeSession() {
    if (!ensureValidSession(true)) return;
    const session = getCurrentSession();
    currentRole = session.role;
    openAppLayout();
    renderAppShell();
    navigateTo(`${session.role}-home`);
}

function goToLanding() {
    showLanding();
}

function renderAppShell() {
    const user = getCurrentUser();
    if (!user) return;
    currentRole = user.role;
    document.getElementById('headerAvatar').textContent = (user.name || 'U').charAt(0).toUpperCase();
    document.getElementById('headerUserName').textContent = user.name || 'User';
    document.getElementById('headerUserRole').textContent = ROLE_LABELS[user.role] || user.role;

    const navHtml = getNavItems(user.role).map((item) => `
        <button class="nav-item ${currentView === item.id ? 'active' : ''}" type="button" onclick="navigateTo('${item.id}')">
            ${item.icon}
            <span>${item.label}</span>
        </button>
    `).join('');
    document.getElementById('sidebarNav').innerHTML = navHtml;
    document.getElementById('mobileNav').innerHTML = navHtml;
}

function navigateTo(viewId, prefill = '') {
    if (!ensureValidSession(true)) return;
    const session = getCurrentSession();
    const role = session.role;
    if (isAdminView(viewId) && role !== 'admin') {
        showToast('Halaman admin hanya tersedia untuk role Admin.', 'warning');
        viewId = `${role}-home`;
    }
    if (isAdminView(viewId) && !canAccessAdmin(role)) {
        resetToPublicLanding('Dashboard admin hanya tersedia untuk profile admin yang valid.');
        return;
    }
    if (!viewId.startsWith(role)) {
        showToast('Anda tidak dapat membuka halaman role lain.', 'warning');
        viewId = `${role}-home`;
    }

    document.querySelectorAll('.view').forEach((view) => {
        view.style.display = 'none';
    });

    const targetId = `view${viewId.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')}`;
    const target = document.getElementById(targetId);
    if (target) target.style.display = 'block';
    currentView = viewId;
    renderAppShell();
    renderCurrentView(prefill);
}

function getServices(includeInactive = false) {
    const services = getData().services || [];
    return includeInactive ? services : services.filter((service) => service.active !== false);
}

function getOrdersForCurrentKonsumen() {
    const user = getCurrentUser();
    return (getData().orders || []).filter((order) => order.konsumenId === user?.id);
}

function getOrdersForCurrentTeknisi() {
    const user = getCurrentUser();
    return (getData().orders || []).filter((order) => order.teknisiId === user?.id);
}

function getImageCatalogItem(imageCatalogId) {
    return getData().imageCatalog.find((item) => item.id === imageCatalogId) || null;
}

function serviceImage(service) {
    return service.image || getImageCatalogItem(service.imageCatalogId)?.src || FALLBACK_IMAGE;
}

function summarizeImageSource(src) {
    if (!src) return '-';
    return src.startsWith('data:image/') ? 'Upload localStorage' : src;
}

function renderCurrentView(prefill = '') {
    if (currentView === 'konsumen-home') renderKonsumenHome();
    if (currentView === 'konsumen-order') renderKonsumenOrder(prefill);
    if (currentView === 'konsumen-history') renderKonsumenHistory();
    if (currentView === 'konsumen-profile') renderKonsumenProfile();
    if (currentView === 'konsumen-unit') renderKonsumenUnit();
    if (currentView === 'teknisi-home') renderTeknisiHome();
    if (currentView === 'teknisi-jobs') renderTeknisiJobs();
    if (currentView === 'teknisi-profile') renderTeknisiProfile();
    if (currentView === 'teknisi-docs') renderTeknisiDocs();
    if (currentView === 'teknisi-upload') renderTeknisiUpload();
    if (currentView === 'admin-home') renderAdminHome();
    if (currentView === 'admin-orders') renderAdminOrders();
    if (currentView === 'admin-users') renderAdminUsers();
}

function renderStatusBadge(status) {
    const className = slugify(status || 'menunggu');
    return `<span class="status-badge status-${className}">${escapeHtml(status || 'Menunggu')}</span>`;
}

function renderKonsumenHome() {
    const orders = getOrdersForCurrentKonsumen();
    document.getElementById('konsumenTotalOrders').textContent = orders.length;
    document.getElementById('konsumenPending').textContent = orders.filter((order) => order.status !== 'Selesai').length;
    document.getElementById('konsumenCompleted').textContent = orders.filter((order) => order.status === 'Selesai').length;

    const recentBody = document.getElementById('konsumenRecentBody');
    recentBody.innerHTML = orders.length ? orders.slice().reverse().slice(0, 5).map((order) => `
        <tr>
            <td>${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.serviceName)}</td>
            <td>${escapeHtml(formatDate(order.preferredDate || order.createdAt))}</td>
            <td>${renderStatusBadge(order.status)}</td>
        </tr>
    `).join('') : '<tr><td colspan="4" class="empty-state">Belum ada pesanan</td></tr>';

    const container = document.getElementById('serviceCardsContainer');
    const services = getServices(false);
    container.innerHTML = services.map((service) => `
        <div class="service-card" onclick="navigateTo('konsumen-order', '${escapeHtml(service.name)}')">
            <img src="${escapeHtml(serviceImage(service))}" alt="${escapeHtml(service.name)}">
            <div class="service-card-body">
                <h4>${escapeHtml(service.name)}</h4>
                <p>${escapeHtml(service.description)}</p>
                <span class="service-price">${formatRupiah(service.price)}</span>
            </div>
        </div>
    `).join('');
}

function renderKonsumenOrder(prefill = '') {
    const user = getCurrentUser();
    const serviceSelect = document.getElementById('orderService');
    serviceSelect.innerHTML = '<option value="">Pilih Layanan</option>' + getServices(false).map((service) => `<option value="${escapeHtml(service.id)}">${escapeHtml(service.name)}</option>`).join('');
    if (prefill) {
        const target = getServices(false).find((service) => service.name === prefill);
        if (target) serviceSelect.value = target.id;
    }
    document.getElementById('orderPhone').value = user?.phone || '';
    document.getElementById('orderAddress').value = user?.address || '';
}

function renderKonsumenHistory() {
    const orders = getOrdersForCurrentKonsumen();
    const body = document.getElementById('konsumenHistoryBody');
    body.innerHTML = orders.length ? orders.slice().reverse().map((order) => `
        <tr>
            <td>${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.serviceName)}</td>
            <td>${escapeHtml(order.brand || '-')}</td>
            <td>${escapeHtml(formatDate(order.preferredDate || order.createdAt))}</td>
            <td>${escapeHtml(order.teknisiName || 'Belum ditugaskan')}</td>
            <td>${renderStatusBadge(order.status)}</td>
        </tr>
    `).join('') : '<tr><td colspan="6" class="empty-state">Belum ada pesanan</td></tr>';
}

function renderKonsumenProfile() {
    const user = getCurrentUser();
    if (!user) return;
    document.getElementById('profileKonsumenName').value = user.name || '';
    document.getElementById('profileKonsumenUsername').value = user.username || '';
    document.getElementById('profileKonsumenEmail').value = user.email || '';
    document.getElementById('profileKonsumenPhone').value = user.phone || '';
    document.getElementById('profileKonsumenBirthDate').value = user.birthDate || '';
    document.getElementById('profileKonsumenAge').value = user.age || '';
    document.getElementById('profileKonsumenAddress').value = user.address || '';
    document.getElementById('profileKonsumenLocation').textContent = user.lat && user.lng ? `${user.lat}, ${user.lng}` : 'Belum dibagikan';
    document.getElementById('profileKonsumenJoined').textContent = formatDate(user.joinedAt);
}

function renderKonsumenUnit() {
    const user = getCurrentUser();
    const gallery = document.getElementById('konUnitGallery');
    const images = user?.unitImages || [];
    gallery.innerHTML = images.length ? images.map((image, index) => `
        <div class="image-card">
            <img src="${escapeHtml(image)}" alt="Foto unit ${index + 1}">
        </div>
    `).join('') : '<div class="empty-state-box"><p>Belum ada foto unit.</p></div>';
}

function renderTeknisiHome() {
    const orders = getOrdersForCurrentTeknisi();
    document.getElementById('teknisiTotalJobs').textContent = orders.length;
    document.getElementById('teknisiActiveJobs').textContent = orders.filter((order) => order.status === 'Ditugaskan' || order.status === 'Dikerjakan').length;
    document.getElementById('teknisiCompletedJobs').textContent = orders.filter((order) => order.status === 'Selesai').length;

    const list = document.getElementById('teknisiJobsList');
    const activeOrders = orders.filter((order) => order.status !== 'Selesai');
    list.innerHTML = activeOrders.length ? activeOrders.map((order) => `
        <div class="job-card">
            <div class="job-card-header">
                <h4>${escapeHtml(order.serviceName)}</h4>
                ${renderStatusBadge(order.status)}
            </div>
            <div class="job-card-details">
                <div><strong>No:</strong> ${escapeHtml(order.id)}</div>
                <div><strong>Konsumen:</strong> ${escapeHtml(order.konsumenName)}</div>
                <div><strong>Alamat:</strong> ${escapeHtml(order.address)}</div>
                <div><strong>Tanggal:</strong> ${escapeHtml(formatDate(order.preferredDate))}</div>
            </div>
            <div class="btn-action-group">
                <button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button>
                ${order.status === 'Ditugaskan' ? `<button class="btn btn-info btn-xs" onclick="startJob('${order.id}')">Mulai</button>` : ''}
                <button class="btn btn-primary btn-xs" onclick="openUploadProof('${order.id}')">Upload Bukti</button>
            </div>
        </div>
    `).join('') : '<div class="empty-state-box"><p>Belum ada pekerjaan yang ditugaskan.</p></div>';
}

function renderTeknisiJobs() {
    const orders = getOrdersForCurrentTeknisi();
    const body = document.getElementById('teknisiAllJobsBody');
    body.innerHTML = orders.length ? orders.slice().reverse().map((order) => `
        <tr>
            <td>${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.konsumenName)}</td>
            <td>${escapeHtml(order.serviceName)}</td>
            <td>${escapeHtml(order.address)}</td>
            <td>${escapeHtml(formatDate(order.preferredDate))}</td>
            <td>${renderStatusBadge(order.status)}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button>
                    ${order.status === 'Ditugaskan' ? `<button class="btn btn-info btn-xs" onclick="startJob('${order.id}')">Mulai</button>` : ''}
                    ${order.status !== 'Selesai' ? `<button class="btn btn-primary btn-xs" onclick="openUploadProof('${order.id}')">Upload</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="7" class="empty-state">Belum ada pekerjaan</td></tr>';
}

function populateSpecializationOptions(selectId, selected = '') {
    const select = document.getElementById(selectId);
    if (!select) return;
    const options = ['Semua Layanan', ...getServices(true).map((service) => service.name)];
    select.innerHTML = options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('');
    select.value = selected || 'Semua Layanan';
}

function renderTeknisiProfile() {
    const user = getCurrentUser();
    if (!user) return;
    populateSpecializationOptions('profileTeknisiSpecialization', user.specialization);
    document.getElementById('profileTeknisiName').value = user.name || '';
    document.getElementById('profileTeknisiUsername').value = user.username || '';
    document.getElementById('profileTeknisiEmail').value = user.email || '';
    document.getElementById('profileTeknisiPhone').value = user.phone || '';
    document.getElementById('profileTeknisiNIK').value = user.nik || '';
    document.getElementById('profileTeknisiBirthDate').value = user.birthDate || '';
    document.getElementById('profileTeknisiAge').value = user.age || '';
    document.getElementById('profileTeknisiExperience').value = user.experience || 0;
    document.getElementById('profileTeknisiAddress').value = user.address || '';
    document.getElementById('profileTeknisiLocation').textContent = user.lat && user.lng ? `${user.lat}, ${user.lng}` : 'Belum dibagikan';
    document.getElementById('profileTeknisiStatus').textContent = user.status || 'Aktif';
}

function renderTeknisiDocs() {
    const user = getCurrentUser();
    const ktpGrid = document.getElementById('tekIDPreviewGrid');
    const selfieGrid = document.getElementById('tekSelfiePreviewGrid');
    ktpGrid.innerHTML = user?.ktpPhoto ? `<div class="image-card"><img src="${escapeHtml(user.ktpPhoto)}" alt="Foto KTP"></div>` : '';
    selfieGrid.innerHTML = user?.selfiePhoto ? `<div class="image-card"><img src="${escapeHtml(user.selfiePhoto)}" alt="Foto Diri"></div>` : '';
}

function renderTeknisiUpload() {
    const info = document.getElementById('uploadOrderInfo');
    const order = getData().orders.find((item) => item.id === uploadingOrderId);
    info.innerHTML = order ? `
        <div class="detail-row"><span class="detail-label">Pesanan</span><span class="detail-value">${escapeHtml(order.id)}</span></div>
        <div class="detail-row"><span class="detail-label">Layanan</span><span class="detail-value">${escapeHtml(order.serviceName)}</span></div>
        <div class="detail-row"><span class="detail-label">Konsumen</span><span class="detail-value">${escapeHtml(order.konsumenName)}</span></div>
    ` : '';
}

function renderAdminHome() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const orders = data.orders || [];
    document.getElementById('adminTotalOrders').textContent = orders.length;
    document.getElementById('adminTotalRevenue').textContent = formatRupiah(orders.filter((order) => order.status === 'Selesai').reduce((sum, order) => sum + Number(order.price || 0), 0));
    document.getElementById('adminTotalTeknisi').textContent = data.users.teknisi.filter((user) => user.status === 'Aktif').length;
    document.getElementById('adminPendingOrders').textContent = orders.filter((order) => order.status === 'Menunggu').length;

    const body = document.getElementById('adminRecentOrdersBody');
    body.innerHTML = orders.length ? orders.slice().reverse().slice(0, 5).map((order) => `
        <tr>
            <td>${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.konsumenName)}</td>
            <td>${escapeHtml(order.serviceName)}</td>
            <td>${escapeHtml(formatDate(order.preferredDate || order.createdAt))}</td>
            <td>${renderStatusBadge(order.status)}</td>
            <td><button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button></td>
        </tr>
    `).join('') : '<tr><td colspan="6" class="empty-state">Belum ada pesanan</td></tr>';
}

function renderAdminOrders() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const filter = document.getElementById('adminFilterStatus').value;
    const orders = (data.orders || []).filter((order) => filter === 'all' || order.status === filter);
    const body = document.getElementById('adminAllOrdersBody');
    body.innerHTML = orders.length ? orders.slice().reverse().map((order) => `
        <tr>
            <td>${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.konsumenName)}</td>
            <td>${escapeHtml(order.serviceName)}</td>
            <td>${escapeHtml(order.brand || '-')}</td>
            <td>${escapeHtml(formatDate(order.preferredDate))}</td>
            <td>${escapeHtml(order.address)}</td>
            <td>${escapeHtml(order.teknisiName || '-')}</td>
            <td>${renderStatusBadge(order.status)}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button>
                    <button class="btn btn-primary btn-xs" onclick="openAssignModal('${order.id}')">${order.status === 'Menunggu' ? 'Verifikasi' : 'Assign'}</button>
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="9" class="empty-state">Belum ada pesanan</td></tr>';
}

function renderAdminUsers() {
    if (!requireAdminAccess()) return;
    renderAdminKonsumenTable();
    renderAdminTeknisiTable();
    renderAdminAdminTable();
    renderAdminServicesTable();
    renderAdminImageCatalogTable();
    switchUserTab(currentUserTab);
    loadAdminMasterData().catch((error) => {
        console.error('Gagal memuat data master admin dari Supabase:', error);
        showToast('Data master admin masih memakai cache lokal.', 'warning');
    });
}

function renderAdminKonsumenTable(users = null) {
    if (!requireAdminAccess()) return;
    const data = getData();
    const body = document.getElementById('adminKonsumenListBody');
    const list = (users || data.users.konsumen || []).map((user, index) => users ? mapProfileToLocalUser(user, 'konsumen', index) : user);
    // Tabel Data Master konsumen harus konsisten dengan tabel admin lain, termasuk kolom password.
    body.innerHTML = list.length ? list.map((user) => `
        <tr>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.password)}</td>
            <td>${escapeHtml(user.email || '-')}</td>
            <td>${escapeHtml(user.phone || '-')}</td>
            <td>${escapeHtml(user.age || '-')}</td>
            <td>${escapeHtml(user.address || '-')}</td>
            <td>${data.orders.filter((order) => order.konsumenId === user.id).length}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openEditKonsumen('${user.id}')">Edit</button>
                    <button class="btn btn-danger btn-xs" onclick="deleteUser('konsumen', '${user.id}')">Hapus</button>
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="9" class="empty-state">Tidak ada data</td></tr>';
}

function renderAdminTeknisiTable(users = null) {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminTeknisiListBody');
    const list = (users || getData().users.teknisi || []).map((user, index) => users ? mapProfileToLocalUser(user, 'teknisi', index) : user);
    // Tabel Data Master teknisi juga menampilkan password agar formatnya konsisten dengan admin/konsumen.
    body.innerHTML = list.length ? list.map((user) => `
        <tr>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.password)}</td>
            <td>${escapeHtml(user.nik || '-')}</td>
            <td>${escapeHtml(user.age || '-')}</td>
            <td>${escapeHtml(user.specialization || '-')}</td>
            <td>${escapeHtml(user.phone || '-')}</td>
            <td>${escapeHtml(user.status || '-')}</td>
            <td>${escapeHtml(user.completedJobs || 0)}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openEditTeknisi('${user.id}')">Edit</button>
                    <button class="btn btn-outline btn-xs" onclick="openTeknisiImages('${user.id}')">Foto</button>
                    <button class="btn btn-danger btn-xs" onclick="deleteUser('teknisi', '${user.id}')">Hapus</button>
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="10" class="empty-state">Tidak ada data</td></tr>';
}

function renderAdminAdminTable(users = null) {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminAdminListBody');
    const list = (users || getData().users.admin || []).map((user, index) => users ? mapProfileToLocalUser(user, 'admin', index) : user);
    // Render tabel admin dipertahankan konsisten agar audit data master seragam antar-role.
    body.innerHTML = list.length ? list.map((user) => `
        <tr>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.password)}</td>
            <td>${escapeHtml(user.role)}</td>
            <td>${escapeHtml(user.status || 'Aktif')}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openEditAdmin('${user.id}')">Edit</button>
                    <button class="btn btn-danger btn-xs" onclick="deleteUser('admin', '${user.id}')">Hapus</button>
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="6" class="empty-state">Tidak ada data admin</td></tr>';
}

function renderAdminServicesTable() {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminServicesListBody');
    body.innerHTML = getServices(true).length ? getServices(true).map((service) => `
        <tr>
            <td>${escapeHtml(service.name)}</td>
            <td>${formatRupiah(service.price)}</td>
            <td>${renderStatusBadge(service.active ? 'Aktif' : 'Nonaktif')}</td>
            <td><img src="${escapeHtml(serviceImage(service))}" alt="${escapeHtml(service.name)}" class="table-thumb"></td>
            <td>
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openEditServiceModal('${service.id}')">Edit</button>
                    <button class="btn btn-danger btn-xs" onclick="confirmDeleteService('${service.id}')">Hapus</button>
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="empty-state">Belum ada layanan</td></tr>';
}

function renderAdminImageCatalogTable() {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminImageCatalogBody');
    // Sumber gambar upload disingkat agar tabel admin tetap ringkas walau file disimpan sebagai data URL.
    body.innerHTML = getData().imageCatalog.length ? getData().imageCatalog.map((item) => `
        <tr>
            <td><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || item.name)}" class="table-thumb"></td>
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(summarizeImageSource(item.src))}</td>
            <td>${renderStatusBadge(item.isActive ? 'Aktif' : 'Nonaktif')}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openImageCatalogPreview('${item.id}')">Lihat</button>
                    <button class="btn btn-outline btn-xs" onclick="openEditImageCatalogModal('${item.id}')">Edit</button>
                    <button class="btn btn-outline btn-xs" onclick="toggleImageCatalogItem('${item.id}')">${item.isActive ? 'Nonaktifkan' : 'Aktifkan'}</button>
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="6" class="empty-state">Belum ada katalog gambar</td></tr>';
}

function switchUserTab(tab, element) {
    if (!requireAdminAccess()) return;
    currentUserTab = tab;
    if (element) {
        document.querySelectorAll('#viewAdminUsers .tab').forEach((button) => button.classList.remove('active'));
        element.classList.add('active');
    }
    const ids = {
        konsumen: 'adminUserKonsumenCard',
        teknisi: 'adminUserTeknisiCard',
        admin: 'adminUserAdminCard',
        layanan: 'adminUserServicesCard',
        gambar: 'adminUserImageCard'
    };
    Object.values(ids).forEach((id) => {
        const elementRef = document.getElementById(id);
        if (elementRef) elementRef.style.display = 'none';
    });
    document.getElementById(ids[tab]).style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function openImageViewer(title, images) {
    document.getElementById('imageViewerTitle').textContent = title;
    document.getElementById('imageViewerGallery').innerHTML = images.length ? images.map((src) => `<div class="image-card"><img src="${escapeHtml(src)}" alt="${escapeHtml(title)}"></div>`).join('') : '<div class="empty-state-box"><p>Tidak ada gambar.</p></div>';
    document.getElementById('modalImageViewer').style.display = 'flex';
}

function openImageCatalogPreview(imageId) {
    if (!requireAdminAccess()) return;
    const item = getData().imageCatalog.find((image) => image.id === imageId);
    if (!item) return;
    openImageViewer(`Katalog Gambar - ${item.name}`, [item.src].filter(Boolean));
}

function updateImageCatalogPreview(image) {
    const wrapper = document.getElementById('imageCatalogPreview');
    const imageEl = document.getElementById('imageCatalogPreviewImg');
    const sourceInput = document.getElementById('imageCatalogFormSrc');
    if (!wrapper || !imageEl || !sourceInput) return;
    sourceInput.value = image || '';
    if (!image) {
        wrapper.style.display = 'none';
        imageEl.src = '';
        return;
    }
    wrapper.style.display = 'flex';
    imageEl.src = image;
}

function clearImageCatalogImage() {
    const fileInput = document.getElementById('imageCatalogFormFile');
    if (fileInput) fileInput.value = '';
    updateImageCatalogPreview('');
}

function resetImageCatalogForm() {
    document.getElementById('imageCatalogModalTitle').textContent = 'Upload Gambar Katalog';
    document.getElementById('imageCatalogFormId').value = '';
    document.getElementById('imageCatalogFormName').value = '';
    document.getElementById('imageCatalogFormCategory').value = '';
    document.getElementById('imageCatalogFormAlt').value = '';
    document.getElementById('imageCatalogFormActive').value = 'true';
    clearImageCatalogImage();
}

function openAddImageCatalogModal() {
    if (!requireAdminAccess()) return;
    resetImageCatalogForm();
    document.getElementById('modalImageCatalogForm').style.display = 'flex';
}

function openEditImageCatalogModal(imageId) {
    if (!requireAdminAccess()) return;
    const item = getData().imageCatalog.find((image) => image.id === imageId);
    if (!item) return;
    document.getElementById('imageCatalogModalTitle').textContent = 'Edit Gambar Katalog';
    document.getElementById('imageCatalogFormId').value = item.id;
    document.getElementById('imageCatalogFormName').value = item.name || '';
    document.getElementById('imageCatalogFormCategory').value = item.category || '';
    document.getElementById('imageCatalogFormAlt').value = item.alt || '';
    document.getElementById('imageCatalogFormActive').value = String(item.isActive !== false);
    document.getElementById('imageCatalogFormFile').value = '';
    updateImageCatalogPreview(item.src || '');
    document.getElementById('modalImageCatalogForm').style.display = 'flex';
}

async function handleImageCatalogUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateImageCatalogPreview(dataUrl);
}

function saveImageCatalogItem() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const imageId = document.getElementById('imageCatalogFormId').value;
    const imageData = {
        id: imageId || nextId(data.imageCatalog, 'IMG'),
        name: document.getElementById('imageCatalogFormName').value.trim(),
        category: document.getElementById('imageCatalogFormCategory').value.trim() || 'general',
        alt: document.getElementById('imageCatalogFormAlt').value.trim(),
        src: document.getElementById('imageCatalogFormSrc').value,
        isActive: document.getElementById('imageCatalogFormActive').value === 'true'
    };

    if (!imageData.name || !imageData.src) {
        showToast('Nama gambar dan file gambar wajib diisi.', 'error');
        return;
    }

    if (!imageData.alt) {
        imageData.alt = imageData.name;
    }

    const existingIndex = data.imageCatalog.findIndex((item) => item.id === imageId);
    if (existingIndex >= 0) data.imageCatalog[existingIndex] = imageData;
    else data.imageCatalog.push(imageData);

    saveData(data);
    closeModal('modalImageCatalogForm');
    renderAdminUsers();
    showToast(`Gambar katalog ${imageData.name} disimpan.`, 'success');
}

function openTeknisiImages(userId) {
    if (!requireAdminAccess()) return;
    const user = getData().users.teknisi.find((item) => item.id === userId);
    if (!user) return;
    openImageViewer(`Dokumen Teknisi - ${user.name}`, [user.ktpPhoto, user.selfiePhoto].filter(Boolean));
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 280);
    }, 2600);
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const role = document.getElementById('loginRole').value;
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!identifier || !password) {
        showToast('Email dan password wajib diisi.', 'error');
        return false;
    }

    try {
        const user = await handleProfileLogin(role, identifier, password);
        if (user) {
            showToast(`Login berhasil. Selamat datang, ${user.name}.`, 'success');
        }
    } catch (error) {
        console.error('Login identifier/password gagal:', error);
        showToast(error?.message || 'Login gagal. Periksa email dan password Anda.', 'error');
    }

    return false;
}

function syncAgeField(dateInputId, ageInputId) {
    const dateInput = document.getElementById(dateInputId);
    const dateValue = dateInput?.value || '';
    const manualTargetId = dateInput?.dataset?.manualTarget || '';
    if (manualTargetId) {
        const manualInput = document.getElementById(manualTargetId);
        if (manualInput && document.activeElement !== manualInput) {
            manualInput.value = formatIsoDateToManual(dateValue);
            manualInput.setCustomValidity('');
        }
    }
    const age = calculateAge(dateValue);
    const ageInput = document.getElementById(ageInputId);
    if (ageInput) ageInput.value = age;
}

function collectRegisterKonsumenForm() {
    const birthDate = resolveBirthDateValue('regKonBirthDate', 'regKonBirthDateManual');
    syncAgeField('regKonBirthDate', 'regKonAge');
    return {
        name: document.getElementById('regKonName').value.trim(),
        username: document.getElementById('regKonUsername').value.trim(),
        password: document.getElementById('regKonPassword').value,
        email: normalizeEmail(document.getElementById('regKonEmail').value),
        phone: normalizePhone(document.getElementById('regKonPhone').value),
        district: document.getElementById('regKonKecamatan').value,
        birthDate,
        age: document.getElementById('regKonAge').value,
        address: document.getElementById('regKonAddress').value.trim(),
        locationText: document.getElementById('regKonLocationText')?.value.trim() || '',
        lat: document.getElementById('regKonLat').value,
        lng: document.getElementById('regKonLng').value
    };
}

async function handleRegisterKonsumen(event) {
    event.preventDefault();
    const form = collectRegisterKonsumenForm();
    const manualBirthDateInput = document.getElementById('regKonBirthDateManual');
    if (manualBirthDateInput && !manualBirthDateInput.checkValidity()) {
        manualBirthDateInput.reportValidity();
        return false;
    }
    if (!form.name || !form.username || !form.password || !form.email || !form.phone || !form.address) {
        showToast('Lengkapi data wajib konsumen.', 'error');
        return false;
    }
    if (isUsernameTaken('konsumen', form.username)) {
        showToast('Username konsumen sudah digunakan.', 'error');
        return false;
    }

    const localPayload = {
        id: nextId(getData().users.konsumen, 'K'),
        role: 'konsumen',
        username: form.username,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        age: form.age ? Number(form.age) : null,
        status: 'Aktif',
        birthDate: form.birthDate,
        district: form.district,
        lat: form.lat,
        lng: form.lng,
        unitImages: deepClone(draftUploads.regKonUnitImages),
        joinedAt: new Date().toISOString(),
        password: form.password
    };

    try {
        const authUser = await registerKonsumenSupabase(form);
        const user = applySupabaseSession({
            ...localPayload,
            id: authUser.id
        });

        document.getElementById('formRegKonsumen').reset();
        draftUploads.regKonUnitImages = [];
        document.getElementById('regKonUnitPreview').innerHTML = '';
        showKonsumenDashboard();
        showToast(`Akun konsumen ${user?.name || form.name} berhasil dibuat.`, 'success');
    } catch (error) {
        console.error('Registrasi konsumen Supabase gagal:', error);
        if (!shouldFallbackToLocalAuth(error)) {
            showToast(error?.message || 'Registrasi konsumen gagal.', 'error');
            return false;
        }

        const user = applyLocalSession(localPayload);
        document.getElementById('formRegKonsumen').reset();
        draftUploads.regKonUnitImages = [];
        document.getElementById('regKonUnitPreview').innerHTML = '';
        showKonsumenDashboard();
        showToast(`Akun konsumen ${user?.name || form.name} tersimpan lokal. Sinkronisasi cloud akan aktif saat Supabase siap.`, 'warning');
    }

    return false;
}

function collectRegisterTeknisiForm() {
    const birthDate = resolveBirthDateValue('regTekBirthDate', 'regTekBirthDateManual');
    syncAgeField('regTekBirthDate', 'regTekAge');
    return {
        name: document.getElementById('regTekName').value.trim(),
        username: document.getElementById('regTekUsername').value.trim(),
        password: document.getElementById('regTekPassword').value,
        email: normalizeEmail(document.getElementById('regTekEmail').value),
        phone: normalizePhone(document.getElementById('regTekPhone').value),
        nik: document.getElementById('regTekNIK').value.trim(),
        birthDate,
        age: document.getElementById('regTekAge').value,
        specialization: document.getElementById('regTekSpecialization').value,
        experience: Number(document.getElementById('regTekExperience').value || 0),
        address: document.getElementById('regTekAddress').value.trim(),
        locationText: document.getElementById('regTekLocationText')?.value.trim() || '',
        lat: document.getElementById('regTekLat').value,
        lng: document.getElementById('regTekLng').value
    };
}

async function handleRegisterTeknisi(event) {
    event.preventDefault();
    const form = collectRegisterTeknisiForm();
    if (!form.name || !form.username || !form.password || !form.email || !form.phone || !form.nik || !form.birthDate || !form.specialization || !form.address) {
        showToast('Lengkapi data wajib teknisi.', 'error');
        return false;
    }
    if (!draftUploads.regTekKtpPhoto || !draftUploads.regTekSelfiePhoto) {
        showToast('Foto KTP dan foto diri teknisi wajib diunggah.', 'error');
        return false;
    }
    if (isUsernameTaken('teknisi', form.username)) {
        showToast('Username teknisi sudah digunakan.', 'error');
        return false;
    }

    const localPayload = {
        id: nextId(getData().users.teknisi, 'T'),
        role: 'teknisi',
        username: form.username,
        name: form.name,
        email: form.email,
        phone: form.phone,
        nik: form.nik,
        specialization: form.specialization,
        status: 'Aktif',
        completedJobs: 0,
        birthDate: form.birthDate,
        age: form.age ? Number(form.age) : null,
        experience: form.experience,
        address: form.address,
        lat: form.lat,
        lng: form.lng,
        ktpPhoto: draftUploads.regTekKtpPhoto,
        selfiePhoto: draftUploads.regTekSelfiePhoto,
        joinedAt: new Date().toISOString(),
        password: form.password
    };

    try {
        const authUser = await registerTeknisiSupabase(form);
        const user = applySupabaseSession({
            ...localPayload,
            id: authUser.id
        });

        document.getElementById('formRegTeknisi').reset();
        draftUploads.regTekKtpPhoto = '';
        draftUploads.regTekSelfiePhoto = '';
        draftUploads.ocrLastResult = null;
        document.getElementById('regTekIDPreview').innerHTML = '';
        document.getElementById('regTekSelfiePreview').innerHTML = '';
        showTeknisiDashboard();
        showToast(`Akun teknisi ${user?.name || form.name} berhasil dibuat.`, 'success');
    } catch (error) {
        console.error('Registrasi teknisi Supabase gagal:', error);
        if (!shouldFallbackToLocalAuth(error)) {
            showToast(error?.message || 'Registrasi teknisi gagal.', 'error');
            return false;
        }

        const user = applyLocalSession(localPayload);
        document.getElementById('formRegTeknisi').reset();
        draftUploads.regTekKtpPhoto = '';
        draftUploads.regTekSelfiePhoto = '';
        draftUploads.ocrLastResult = null;
        document.getElementById('regTekIDPreview').innerHTML = '';
        document.getElementById('regTekSelfiePreview').innerHTML = '';
        showTeknisiDashboard();
        showToast(`Akun teknisi ${user?.name || form.name} tersimpan lokal. Sinkronisasi cloud akan aktif saat Supabase siap.`, 'warning');
    }

    return false;
}

async function createOrderSupabase(orderValues) {
    const user = getCurrentUser();
    if (!user) throw new Error('User belum login');
    if (!canUseSupabase()) {
        return {
            synced: false,
            reason: 'Supabase client belum siap.'
        };
    }

    const { error } = await supabaseClient
        .from('orders')
        .insert({
            konsumen_id: user.id,
            service_id: orderValues.service_id,
            service_name: orderValues.service_name,
            price: Number(orderValues.price),
            brand: orderValues.brand || null,
            pk: orderValues.pk || null,
            refrigerant: orderValues.refrigerant || null,
            preferred_date: orderValues.preferred_date || null,
            address: orderValues.address || null,
            notes: orderValues.notes || null,
            phone: orderValues.phone || null,
            status: 'Menunggu'
        });

    if (error) {
        return {
            synced: false,
            reason: error.message || 'Gagal sinkron ke Supabase.'
        };
    }

    return {
        synced: true
    };
}

async function handleOrderSubmit(event) {
    event.preventDefault();
    const user = getCurrentUser();
    if (!user) {
        showToast('Session Anda sudah berakhir. Silakan login kembali.', 'warning');
        return false;
    }
    const service = getServices(false).find((item) => item.id === document.getElementById('orderService').value);
    if (!service) {
        showToast('Pilih layanan terlebih dahulu.', 'error');
        return false;
    }
    const data = getData();
    const order = {
        id: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(data.orders.length + 1).padStart(3, '0')}`,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        brand: document.getElementById('orderBrand').value.trim(),
        pk: document.getElementById('orderPK').value.trim(),
        refrigerant: document.getElementById('orderRefrigerant').value.trim(),
        preferredDate: document.getElementById('orderDate').value,
        address: document.getElementById('orderAddress').value.trim(),
        notes: document.getElementById('orderNotes').value.trim(),
        phone: normalizePhone(document.getElementById('orderPhone').value),
        konsumenId: user.id,
        konsumenName: user.name,
        teknisiId: null,
        teknisiName: null,
        proofImage: '',
        status: 'Menunggu',
        createdAt: new Date().toISOString()
    };
    const remoteResult = await createOrderSupabase({
        service_id: service.id,
        service_name: service.name,
        price: service.price,
        brand: order.brand,
        pk: order.pk,
        refrigerant: order.refrigerant,
        preferred_date: order.preferredDate,
        address: order.address,
        notes: order.notes,
        phone: order.phone
    }).catch((error) => {
        console.error('Gagal menyimpan order ke Supabase:', error);
        return {
            synced: false,
            reason: error?.message || 'Sinkronisasi cloud gagal.'
        };
    });

    data.orders.push({
        ...order,
        syncStatus: remoteResult?.synced ? 'synced' : 'local-only'
    });
    saveData(data);
    document.getElementById('formOrder').reset();
    navigateTo('konsumen-home');
    showToast(`Pesanan ${order.id} berhasil dibuat.`, 'success');
    if (remoteResult && !remoteResult.synced) {
        showToast(`Pesanan disimpan lokal. Sinkronisasi cloud tertunda: ${remoteResult.reason}`, 'warning');
    }

    return false;
}

const persistProfileKonsumen = debounce(() => saveProfile('konsumen'), 500);
const persistProfileTeknisi = debounce(() => saveProfile('teknisi'), 500);

function handleProfileFormInput(role) {
    if (role === 'konsumen') persistProfileKonsumen();
    if (role === 'teknisi') persistProfileTeknisi();
}

function saveProfile(role) {
    const session = getCurrentSession();
    if (!session || session.role !== role) return;
    const data = getData();
    const user = data.users[role].find((item) => item.id === session.userId);
    if (!user) return;

    if (role === 'konsumen') {
        const username = document.getElementById('profileKonsumenUsername').value.trim();
        if (isUsernameTaken('konsumen', username, user.id)) {
            document.getElementById('konsumenProfileAutosave').textContent = 'Username sudah dipakai akun lain.';
            return;
        }
        Object.assign(user, {
            name: document.getElementById('profileKonsumenName').value.trim(),
            username,
            email: normalizeEmail(document.getElementById('profileKonsumenEmail').value),
            phone: normalizePhone(document.getElementById('profileKonsumenPhone').value),
            birthDate: document.getElementById('profileKonsumenBirthDate').value,
            address: document.getElementById('profileKonsumenAddress').value.trim()
        });
        document.getElementById('konsumenProfileAutosave').textContent = `Tersimpan otomatis ${formatDateTime(new Date())}`;
    }

    if (role === 'teknisi') {
        const username = document.getElementById('profileTeknisiUsername').value.trim();
        if (isUsernameTaken('teknisi', username, user.id)) {
            document.getElementById('teknisiProfileAutosave').textContent = 'Username sudah dipakai akun lain.';
            return;
        }
        Object.assign(user, {
            name: document.getElementById('profileTeknisiName').value.trim(),
            username,
            email: normalizeEmail(document.getElementById('profileTeknisiEmail').value),
            phone: normalizePhone(document.getElementById('profileTeknisiPhone').value),
            nik: document.getElementById('profileTeknisiNIK').value.trim(),
            birthDate: document.getElementById('profileTeknisiBirthDate').value,
            specialization: document.getElementById('profileTeknisiSpecialization').value,
            experience: Number(document.getElementById('profileTeknisiExperience').value || 0),
            address: document.getElementById('profileTeknisiAddress').value.trim()
        });
        document.getElementById('teknisiProfileAutosave').textContent = `Tersimpan otomatis ${formatDateTime(new Date())}`;
    }

    saveData(data);
    renderAppShell();
}

async function previewRegUpload(event, previewId) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    const preview = document.getElementById(previewId);
    preview.innerHTML = `<div class="image-card"><img src="${escapeHtml(dataUrl)}" alt="Preview upload"></div>`;
    if (previewId === 'regKonUnitPreview') draftUploads.regKonUnitImages = [dataUrl];
    if (previewId === 'regTekIDPreview') draftUploads.regTekKtpPhoto = dataUrl;
    if (previewId === 'regTekSelfiePreview') draftUploads.regTekSelfiePhoto = dataUrl;
}

async function handleKonUnitUpload(event) {
    const file = event.target.files?.[0];
    const profile = getCurrentUser();
    if (!file || !profile) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateLocalUiCache((cache) => {
        cache.unitImagesByUser[profile.id] = cache.unitImagesByUser[profile.id] || [];
        cache.unitImagesByUser[profile.id].push(dataUrl);
    });
    renderKonsumenUnit();
    showToast('Foto unit disimpan sebagai cache UI lokal.', 'success');
}

async function handleTekDocUpload(event, type) {
    const file = event.target.files?.[0];
    const profile = getCurrentUser();
    if (!file || !profile) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateLocalUiCache((cache) => {
        cache.teknisiDocsByUser[profile.id] = cache.teknisiDocsByUser[profile.id] || { ktpPhoto: '', selfiePhoto: '' };
        if (type === 'ktp') cache.teknisiDocsByUser[profile.id].ktpPhoto = dataUrl;
        if (type === 'selfie') cache.teknisiDocsByUser[profile.id].selfiePhoto = dataUrl;
    });
    renderTeknisiDocs();
    document.getElementById('teknisiDocStatus').textContent = `Dokumen ${type === 'ktp' ? 'KTP' : 'foto diri'} tersimpan sebagai cache UI lokal.`;
}

function getShareLocation(prefix) {
    if (!navigator.geolocation) {
        showToast('Browser tidak mendukung geolocation.', 'error');
        return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = getMapsLink(latitude, longitude);
        document.getElementById(`${prefix}Lat`).value = latitude;
        document.getElementById(`${prefix}Lng`).value = longitude;
        document.getElementById(`${prefix}LocationResult`).style.display = 'flex';
        document.getElementById(`${prefix}Coords`).textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        const link = document.getElementById(`${prefix}MapLink`);
        link.href = mapsLink;
        const locationTextField = document.getElementById(`${prefix}LocationText`);
        if (locationTextField && !locationTextField.value.trim()) {
            locationTextField.value = mapsLink;
        }
    }, () => showToast('Gagal mengambil lokasi.', 'error'));
}

function openEditKonsumen(userId) {
    if (!requireAdminAccess()) return;
    const user = getData().users.konsumen.find((item) => item.id === userId);
    if (!user) return;
    document.getElementById('editKonsumenId').value = user.id;
    document.getElementById('editKonsumenName').value = user.name || '';
    document.getElementById('editKonsumenUsername').value = user.username || '';
    document.getElementById('editKonsumenPassword').value = user.password || '';
    document.getElementById('editKonsumenEmail').value = user.email || '';
    document.getElementById('editKonsumenPhone').value = user.phone || '';
    document.getElementById('editKonsumenBirthDate').value = user.birthDate || '';
    document.getElementById('editKonsumenAge').value = user.age || '';
    document.getElementById('editKonsumenAddress').value = user.address || '';
    document.getElementById('modalEditKonsumen').style.display = 'flex';
}

function saveEditKonsumen() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const user = data.users.konsumen.find((item) => item.id === document.getElementById('editKonsumenId').value);
    if (!user) return;
    const username = document.getElementById('editKonsumenUsername').value.trim();
    if (isUsernameTaken('konsumen', username, user.id)) {
        showToast('Username konsumen sudah dipakai.', 'error');
        return;
    }
    Object.assign(user, {
        name: document.getElementById('editKonsumenName').value.trim(),
        username,
        password: document.getElementById('editKonsumenPassword').value,
        email: normalizeEmail(document.getElementById('editKonsumenEmail').value),
        phone: normalizePhone(document.getElementById('editKonsumenPhone').value),
        birthDate: document.getElementById('editKonsumenBirthDate').value,
        address: document.getElementById('editKonsumenAddress').value.trim()
    });
    data.orders.forEach((order) => {
        if (order.konsumenId === user.id) {
            order.konsumenName = user.name;
            order.phone = user.phone;
            order.address = user.address;
        }
    });
    saveData(data);
    closeModal('modalEditKonsumen');
    renderAdminUsers();
    showToast('Data konsumen diperbarui.', 'success');
}

function openEditTeknisi(userId) {
    if (!requireAdminAccess()) return;
    const user = getData().users.teknisi.find((item) => item.id === userId);
    if (!user) return;
    populateSpecializationOptions('editTeknisiSpecialization', user.specialization);
    document.getElementById('editTeknisiId').value = user.id;
    document.getElementById('editTeknisiName').value = user.name || '';
    document.getElementById('editTeknisiUsername').value = user.username || '';
    document.getElementById('editTeknisiPassword').value = user.password || '';
    document.getElementById('editTeknisiEmail').value = user.email || '';
    document.getElementById('editTeknisiPhone').value = user.phone || '';
    document.getElementById('editTeknisiNIK').value = user.nik || '';
    document.getElementById('editTeknisiBirthDate').value = user.birthDate || '';
    document.getElementById('editTeknisiAge').value = user.age || '';
    document.getElementById('editTeknisiExperience').value = user.experience || 0;
    document.getElementById('editTeknisiStatus').value = user.status || 'Aktif';
    document.getElementById('editTeknisiAddress').value = user.address || '';
    document.getElementById('modalEditTeknisi').style.display = 'flex';
}

function saveEditTeknisi() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const user = data.users.teknisi.find((item) => item.id === document.getElementById('editTeknisiId').value);
    if (!user) return;
    const username = document.getElementById('editTeknisiUsername').value.trim();
    if (isUsernameTaken('teknisi', username, user.id)) {
        showToast('Username teknisi sudah dipakai.', 'error');
        return;
    }
    Object.assign(user, {
        name: document.getElementById('editTeknisiName').value.trim(),
        username,
        password: document.getElementById('editTeknisiPassword').value,
        email: normalizeEmail(document.getElementById('editTeknisiEmail').value),
        phone: normalizePhone(document.getElementById('editTeknisiPhone').value),
        nik: document.getElementById('editTeknisiNIK').value.trim(),
        birthDate: document.getElementById('editTeknisiBirthDate').value,
        specialization: document.getElementById('editTeknisiSpecialization').value,
        experience: Number(document.getElementById('editTeknisiExperience').value || 0),
        status: document.getElementById('editTeknisiStatus').value,
        address: document.getElementById('editTeknisiAddress').value.trim()
    });
    data.orders.forEach((order) => {
        if (order.teknisiId === user.id) {
            order.teknisiName = user.name;
        }
    });
    saveData(data);
    closeModal('modalEditTeknisi');
    renderAdminUsers();
    showToast('Data teknisi diperbarui.', 'success');
}

function openAddAdminModal() {
    if (!requireAdminAccess()) return;
    document.getElementById('adminModalTitle').textContent = 'Tambah Data Admin';
    document.getElementById('editAdminId').value = '';
    document.getElementById('editAdminName').value = '';
    document.getElementById('editAdminUsername').value = '';
    document.getElementById('editAdminPassword').value = '';
    document.getElementById('editAdminRole').value = 'admin';
    document.getElementById('editAdminStatus').value = 'Aktif';
    document.getElementById('modalEditAdmin').style.display = 'flex';
}

function openEditAdmin(userId) {
    if (!requireAdminAccess()) return;
    const user = getData().users.admin.find((item) => item.id === userId);
    if (!user) return;
    document.getElementById('adminModalTitle').textContent = 'Edit Data Admin';
    document.getElementById('editAdminId').value = user.id;
    document.getElementById('editAdminName').value = user.name || '';
    document.getElementById('editAdminUsername').value = user.username || '';
    document.getElementById('editAdminPassword').value = user.password || '';
    document.getElementById('editAdminRole').value = user.role || 'admin';
    document.getElementById('editAdminStatus').value = user.status || 'Aktif';
    document.getElementById('modalEditAdmin').style.display = 'flex';
}

function saveEditAdmin() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const editId = document.getElementById('editAdminId').value;
    const username = document.getElementById('editAdminUsername').value.trim();
    const name = document.getElementById('editAdminName').value.trim();
    const password = document.getElementById('editAdminPassword').value;
    if (!name || !username || !password) {
        showToast('Nama, username, dan password admin wajib diisi.', 'error');
        return;
    }
    if (isUsernameTaken('admin', username, editId)) {
        showToast('Username admin sudah dipakai.', 'error');
        return;
    }
    if (editId) {
        const user = data.users.admin.find((item) => item.id === editId);
        Object.assign(user, {
            name,
            username,
            password,
            role: 'admin',
            status: document.getElementById('editAdminStatus').value
        });
    } else {
        data.users.admin.push({
            id: nextId(data.users.admin, 'A'),
            name,
            username,
            password,
            role: 'admin',
            status: document.getElementById('editAdminStatus').value,
            joinedAt: new Date().toISOString()
        });
    }
    saveData(data);
    closeModal('modalEditAdmin');
    renderAdminUsers();
    showToast('Data admin disimpan.', 'success');
}

function deleteUser(role, userId) {
    if (!requireAdminAccess()) return;
    const data = getData();
    if (role === 'admin' && data.users.admin.length <= 1) {
        showToast('Minimal harus ada satu admin aktif.', 'warning');
        return;
    }
    const collection = data.users[role];
    const user = collection.find((item) => item.id === userId);
    if (!user) return;
    if (!window.confirm(`Hapus ${ROLE_LABELS[role]} ${user.name}?`)) return;

    data.users[role] = collection.filter((item) => item.id !== userId);

    if (role === 'teknisi') {
        data.orders = data.orders.map((order) => order.teknisiId === userId ? { ...order, teknisiId: null, teknisiName: null, status: order.status === 'Selesai' ? 'Selesai' : 'Menunggu' } : order);
    }
    if (role === 'konsumen') {
        data.orders = data.orders.map((order) => order.konsumenId === userId ? { ...order, konsumenId: null, konsumenName: `${user.name} (dihapus)` } : order);
    }

    saveData(data);
    if (getCurrentSession()?.userId === userId) {
        logoutUser(false);
        showToast('Akun yang sedang login telah dihapus. Session ditutup aman.', 'warning');
        return;
    }
    renderAdminUsers();
    renderAdminOrders();
    showToast(`Data ${ROLE_LABELS[role]} berhasil dihapus.`, 'success');
}

function openAddServiceModal() {
    if (!requireAdminAccess()) return;
    document.getElementById('serviceModalTitle').textContent = 'Tambah Layanan';
    document.getElementById('serviceFormId').value = '';
    document.getElementById('serviceFormName').value = '';
    document.getElementById('serviceFormPrice').value = '';
    document.getElementById('serviceFormDescription').value = '';
    document.getElementById('serviceFormActive').value = 'true';
    document.getElementById('serviceFormImage').value = '';
    populateServiceImageCatalogSelect('');
    clearServiceImage();
    document.getElementById('modalServiceForm').style.display = 'flex';
}

function openEditServiceModal(serviceId) {
    if (!requireAdminAccess()) return;
    const service = getData().services.find((item) => item.id === serviceId);
    if (!service) return;
    document.getElementById('serviceModalTitle').textContent = 'Edit Layanan';
    document.getElementById('serviceFormId').value = service.id;
    document.getElementById('serviceFormName').value = service.name;
    document.getElementById('serviceFormPrice').value = service.price;
    document.getElementById('serviceFormDescription').value = service.description;
    document.getElementById('serviceFormActive').value = String(service.active !== false);
    document.getElementById('serviceFormImage').value = service.image || '';
    populateServiceImageCatalogSelect(service.imageCatalogId || '');
    updateServiceImagePreview(service.image || serviceImage(service));
    document.getElementById('modalServiceForm').style.display = 'flex';
}

function populateServiceImageCatalogSelect(selectedId) {
    const select = document.getElementById('serviceFormImageCatalogId');
    select.innerHTML = '<option value="">Pilih Gambar</option>' + getData().imageCatalog.filter((item) => item.isActive).map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
    select.value = selectedId || '';
}

function updateServiceImagePreview(image) {
    const wrapper = document.getElementById('serviceImagePreview');
    const imageEl = document.getElementById('serviceImagePreviewImg');
    if (!image) {
        wrapper.style.display = 'none';
        imageEl.src = '';
        return;
    }
    wrapper.style.display = 'flex';
    imageEl.src = image;
}

function handleServiceCatalogSelection() {
    const selected = document.getElementById('serviceFormImageCatalogId').value;
    const image = getImageCatalogItem(selected)?.src || '';
    document.getElementById('serviceFormImage').value = image;
    updateServiceImagePreview(image);
}

function clearServiceImage() {
    document.getElementById('serviceFormImage').value = '';
    document.getElementById('serviceFormImageFile').value = '';
    updateServiceImagePreview('');
}

async function handleServiceImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    document.getElementById('serviceFormImage').value = dataUrl;
    updateServiceImagePreview(dataUrl);
}

function saveService() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const serviceId = document.getElementById('serviceFormId').value;
    const serviceData = {
        id: serviceId || nextId(data.services, 'SRV'),
        name: document.getElementById('serviceFormName').value.trim(),
        price: Number(document.getElementById('serviceFormPrice').value || 0),
        description: document.getElementById('serviceFormDescription').value.trim(),
        active: document.getElementById('serviceFormActive').value === 'true',
        imageCatalogId: document.getElementById('serviceFormImageCatalogId').value,
        image: document.getElementById('serviceFormImage').value || getImageCatalogItem(document.getElementById('serviceFormImageCatalogId').value)?.src || FALLBACK_IMAGE
    };
    if (!serviceData.name) {
        showToast('Nama layanan wajib diisi.', 'error');
        return;
    }
    const existingIndex = data.services.findIndex((item) => item.id === serviceId);
    if (existingIndex >= 0) data.services[existingIndex] = serviceData;
    else data.services.push(serviceData);
    saveData(data);
    closeModal('modalServiceForm');
    renderAdminUsers();
    renderKonsumenHome();
    showToast('Layanan disimpan.', 'success');
}

function confirmDeleteService(serviceId) {
    if (!requireAdminAccess()) return;
    const service = getData().services.find((item) => item.id === serviceId);
    if (!service) return;
    document.getElementById('deleteServiceId').value = serviceId;
    document.getElementById('deleteServiceText').textContent = `Yakin ingin menghapus layanan ${service.name}?`;
    document.getElementById('modalDeleteService').style.display = 'flex';
}

function deleteService() {
    if (!requireAdminAccess()) return;
    const serviceId = document.getElementById('deleteServiceId').value;
    const data = getData();
    data.services = data.services.filter((item) => item.id !== serviceId);
    saveData(data);
    closeModal('modalDeleteService');
    renderAdminUsers();
    renderKonsumenHome();
    showToast('Layanan dihapus.', 'success');
}

function toggleImageCatalogItem(imageId) {
    if (!requireAdminAccess()) return;
    const data = getData();
    const image = data.imageCatalog.find((item) => item.id === imageId);
    if (!image) return;
    image.isActive = !image.isActive;
    saveData(data);
    renderAdminUsers();
}

async function updateOrderByAdmin(orderId, payload = {}) {
    const workingPayload = { ...payload };

    while (true) {
        const { data, error } = await supabaseClient
            .from('orders')
            .update(workingPayload)
            .eq('id', orderId)
            .select('*')
            .single();

        if (!error) return mapOrderRecord(data);

        const missingColumn = extractMissingColumnName(error);
        if (missingColumn && OPTIONAL_ORDER_COLUMNS.has(missingColumn) && missingColumn in workingPayload) {
            delete workingPayload[missingColumn];
            continue;
        }

        throw error;
    }
}

async function openAssignModal(orderId) {
    if (!requireAdminAccess()) return;
    await loadAdminMasterData();
    const order = remoteState.adminOrders.find((item) => item.id === orderId);
    document.getElementById('assignOrderId').textContent = orderId;
    const select = document.getElementById('assignTeknisi');
    select.innerHTML = '<option value="">Pilih Teknisi</option>' + remoteState.adminProfiles.teknisi
        .filter((user) => isProfileApproved(user))
        .map((user) => `<option value="${escapeHtml(user.id)}">${escapeHtml(user.name)} - ${escapeHtml(user.specialization || 'Semua Layanan')}</option>`)
        .join('');
    if (order?.teknisiId) select.value = order.teknisiId;
    document.getElementById('assignConfirmMessage').value = order?.adminConfirmationText || '';
    document.getElementById('assignOrderSummary').innerHTML = order ? `
        <div class="detail-row"><span class="detail-label">Konsumen</span><span class="detail-value">${escapeHtml(order.konsumenName)}</span></div>
        <div class="detail-row"><span class="detail-label">Layanan</span><span class="detail-value">${escapeHtml(order.serviceName)}</span></div>
        <div class="detail-row"><span class="detail-label">Telepon</span><span class="detail-value">${escapeHtml(formatDisplayPhone(order.phone))}</span></div>
        <div class="detail-row"><span class="detail-label">Alamat</span><span class="detail-value">${escapeHtml(order.address || '-')}</span></div>
    ` : '';
    document.getElementById('modalAssign').style.display = 'flex';
}

async function assignTeknisi() {
    if (!requireAdminAccess()) return;
    const orderId = document.getElementById('assignOrderId').textContent;
    const teknisiId = document.getElementById('assignTeknisi').value;
    const customMessage = document.getElementById('assignConfirmMessage').value.trim();
    const teknisi = remoteState.adminProfiles.teknisi.find((item) => item.id === teknisiId);
    const order = remoteState.adminOrders.find((item) => item.id === orderId);
    const waPopup = prepareWhatsAppPopup();

    if (!orderId || !teknisi || !order) {
        closePreparedPopup(waPopup);
        showToast('Pilih teknisi terlebih dahulu.', 'error');
        return;
    }

    try {
        const confirmationMessage = buildAdminOrderConfirmationMessage(order, teknisi, customMessage);
        await updateOrderByAdmin(orderId, {
            teknisi_id: teknisi.id,
            teknisi_name: teknisi.name,
            status: 'Ditugaskan',
            admin_confirmation_text: confirmationMessage,
            verified_at: new Date().toISOString(),
            verified_by: remoteState.profile?.id || null
        });

        closeModal('modalAssign');
        await loadAdminMasterData();
        await renderAdminOrders();
        await renderAdminHome();
        if (order.phone) {
            openWhatsAppChat(order.phone, confirmationMessage, waPopup);
        } else {
            closePreparedPopup(waPopup);
        }
        showToast(`Pesanan ${orderId} ditugaskan ke ${teknisi.name}.`, 'success');
    } catch (error) {
        closePreparedPopup(waPopup);
        console.error('Gagal assign teknisi:', error);
        showToast(toUserFacingError(error, 'Gagal menugaskan teknisi.'), 'error');
    }
}

function findVisibleOrderById(orderId) {
    return [...remoteState.currentOrders, ...remoteState.adminOrders].find((item) => item.id === orderId) || null;
}

function openOrderDetail(orderId) {
    const order = findVisibleOrderById(orderId);
    if (!order) {
        showToast('Detail pesanan tidak ditemukan.', 'warning');
        return;
    }

    const proof = order.proofImage
        ? `<div class="image-card"><img src="${escapeHtml(order.proofImage)}" alt="Bukti pekerjaan"></div>`
        : '<p class="text-muted">Belum ada bukti pekerjaan.</p>';

    document.getElementById('modalDetailBody').innerHTML = `
        <dl class="detail-list">
            <dt>No. Pesanan</dt><dd>${escapeHtml(getOrderLabel(order))}</dd>
            <dt>Layanan</dt><dd>${escapeHtml(order.serviceName)}</dd>
            <dt>Konsumen</dt><dd>${escapeHtml(order.konsumenName)}</dd>
            <dt>Telepon</dt><dd>${escapeHtml(formatDisplayPhone(order.phone))}</dd>
            <dt>Teknisi</dt><dd>${escapeHtml(order.teknisiName || 'Belum ditugaskan')}</dd>
            <dt>Tanggal</dt><dd>${escapeHtml(formatDate(order.preferredDate))}</dd>
            <dt>Alamat</dt><dd>${escapeHtml(order.address || '-')}</dd>
            <dt>Status</dt><dd>${escapeHtml(order.status)}</dd>
            <dt>Verifikasi Admin</dt><dd>${escapeHtml(formatVerificationInfo(order))}</dd>
            <dt>Konfirmasi Admin</dt><dd>${escapeHtml(order.adminConfirmationText || '-')}</dd>
            <dt>Catatan</dt><dd>${escapeHtml(order.notes || '-')}</dd>
        </dl>
        <div class="detail-proof">${proof}</div>
    `;
    document.getElementById('modalDetail').style.display = 'flex';
}

async function startJob(orderId) {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'teknisi') return;

    try {
        const { error } = await supabaseClient
            .from('orders')
            .update({ status: 'Dikerjakan' })
            .eq('id', orderId)
            .eq('teknisi_id', profile.id);

        if (error) throw error;

        await loadCurrentOrdersForProfile();
        await renderTeknisiHome();
        await renderTeknisiJobs();
        showToast('Status pekerjaan diperbarui menjadi Dikerjakan.', 'success');
    } catch (error) {
        console.error('Gagal memulai pekerjaan:', error);
        showToast(toUserFacingError(error, 'Gagal memperbarui status pekerjaan.'), 'error');
    }
}

function openUploadProof(orderId) {
    if (!requireRole('teknisi')) return;
    uploadingOrderId = orderId;
    uploadProofImage = null;
    document.getElementById('uploadPreview').style.display = 'none';
    navigateTo('teknisi-upload');
}

async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadProofImage = await readFileAsDataUrl(file);
    document.getElementById('uploadPreviewImg').src = uploadProofImage;
    document.getElementById('uploadFileName').textContent = file.name;
    document.getElementById('uploadPreview').style.display = 'block';
}

async function submitUploadProof() {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'teknisi') return;

    if (!uploadingOrderId || !uploadProofImage) {
        showToast('Pilih foto bukti pekerjaan terlebih dahulu.', 'error');
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('orders')
            .update({
                proof_image_data: uploadProofImage,
                status: 'Selesai'
            })
            .eq('id', uploadingOrderId)
            .eq('teknisi_id', profile.id);

        if (error) throw error;

        uploadProofImage = null;
        uploadingOrderId = null;
        await loadCurrentOrdersForProfile();
        await navigateTo('teknisi-home');
        showToast('Bukti pekerjaan berhasil dikirim ke Supabase.', 'success');
    } catch (error) {
        console.error('Gagal upload bukti pekerjaan:', error);
        showToast(toUserFacingError(error, 'Gagal mengirim bukti pekerjaan.'), 'error');
    }
}

function extractKtpFields(rawText) {
    const lines = String(rawText || '')
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    const joined = lines.join('\n').toUpperCase();
    const nik = joined.match(/NIK[:\s]*([0-9]{16})/);
    const nameLine = lines.find((line) => /NAMA/i.test(line));
    const addressIndex = lines.findIndex((line) => /ALAMAT/i.test(line));
    const ttlLine = lines.find((line) => /(TEMPAT|TMPT).*LAHIR|TEMPAT\/TGL LAHIR|TEMPAT,TGL LAHIR/i.test(line));

    let birthDate = '';
    const dateMatch = (ttlLine || joined).match(/([0-3]?\d)[-\/.]([01]?\d)[-\/.](19|20)\d{2}/);
    if (dateMatch) {
        const [day, month, yearPrefix] = [dateMatch[1], dateMatch[2], dateMatch[3]];
        const yearFull = dateMatch[0].slice(-4);
        birthDate = `${yearFull}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    let address = '';
    if (addressIndex >= 0) {
        const buffer = [];
        for (let index = addressIndex; index < lines.length; index += 1) {
            const line = lines[index];
            if (index !== addressIndex && /^[A-Z ]{3,}$/.test(line) && /RT|RW|KEL|DESA|KEC|AGAMA|STATUS|PEKERJAAN/.test(line)) break;
            buffer.push(line.replace(/^ALAMAT[:\s]*/i, ''));
            if (buffer.length >= 2) break;
        }
        address = buffer.join(', ').trim();
    }

    const name = nameLine ? nameLine.replace(/^NAMA[:\s]*/i, '').trim() : '';
    return {
        nik: nik ? nik[1] : '',
        name,
        address,
        birthDate,
        age: calculateAge(birthDate) || ''
    };
}

function ensureOcrLibrary() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-ocr-lib="tesseract"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(window.Tesseract));
            existing.addEventListener('error', reject);
            return;
        }
        const script = document.createElement('script');
        script.src = OCR_CDN_URL;
        script.async = true;
        script.dataset.ocrLib = 'tesseract';
        script.onload = () => resolve(window.Tesseract);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function runTechnicianKtpOcr() {
    if (!draftUploads.regTekKtpPhoto) {
        showToast('Upload foto KTP terlebih dahulu.', 'warning');
        return;
    }
    const status = document.getElementById('ocrStatus');
    const progress = document.getElementById('ocrProgress');
    const preview = document.getElementById('ocrPreviewCard');
    const resultList = document.getElementById('ocrResultList');
    status.textContent = 'Memuat library OCR...';
    progress.textContent = '';
    try {
        const Tesseract = await ensureOcrLibrary();
        status.textContent = 'Membaca teks KTP...';
        const result = await Tesseract.recognize(draftUploads.regTekKtpPhoto, 'ind', {
            logger: (message) => {
                if (message.status) status.textContent = message.status;
                if (typeof message.progress === 'number') progress.textContent = `${Math.round(message.progress * 100)}%`;
            }
        });
        const extracted = extractKtpFields(result.data.text);
        draftUploads.ocrLastResult = extracted;
        if (extracted.name && !document.getElementById('regTekName').value.trim()) document.getElementById('regTekName').value = extracted.name;
        if (extracted.nik && !document.getElementById('regTekNIK').value.trim()) document.getElementById('regTekNIK').value = extracted.nik;
        if (extracted.address && !document.getElementById('regTekAddress').value.trim()) document.getElementById('regTekAddress').value = extracted.address;
        if (extracted.birthDate && !document.getElementById('regTekBirthDate').value) {
            document.getElementById('regTekBirthDate').value = extracted.birthDate;
            syncAgeField('regTekBirthDate', 'regTekAge');
        }
        resultList.innerHTML = `
            <div><strong>Nama:</strong> ${escapeHtml(extracted.name || '-')}</div>
            <div><strong>NIK:</strong> ${escapeHtml(extracted.nik || '-')}</div>
            <div><strong>Alamat:</strong> ${escapeHtml(extracted.address || '-')}</div>
            <div><strong>Tanggal Lahir:</strong> ${escapeHtml(extracted.birthDate || '-')}</div>
            <div><strong>Usia:</strong> ${escapeHtml(extracted.age || '-')}</div>
        `;
        preview.style.display = 'block';
        status.textContent = 'OCR selesai. Silakan cek dan koreksi manual bila perlu.';
        showToast('OCR KTP selesai diproses.', 'success');
    } catch (error) {
        console.error(error);
        status.textContent = 'OCR gagal dijalankan. Anda tetap bisa isi manual.';
        showToast('OCR gagal. Isi data KTP secara manual.', 'warning');
    }
}

function logApp(scope, message, detail = null) {
    const payload = detail ? ` ${JSON.stringify(detail)}` : '';
    console.info(`[${scope}] ${message}${payload}`);
}

function toNullableText(value) {
    const normalized = String(value ?? '').trim();
    return normalized || null;
}

function toNullableNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
}

function getAppBaseUrl() {
    return `${window.location.origin}${window.location.pathname}`;
}

function toUserFacingError(error, fallback = 'Terjadi kesalahan.') {
    const message = String(error?.message || error || fallback);
    const normalized = message.toLowerCase();

    if (normalized.includes('invalid login credentials')) return 'Email atau password salah.';
    if (normalized.includes('email not confirmed')) return 'Email belum dikonfirmasi. Cek inbox Anda lalu login kembali.';
    if (normalized.includes('user already registered')) return 'Email sudah terdaftar. Silakan login langsung.';
    if (normalized.includes('duplicate key') && normalized.includes('username')) return 'Username sudah digunakan akun lain.';
    if (normalized.includes('violates row-level security')) return 'Policy Supabase untuk profile/order belum sesuai. Jalankan SQL final di README lalu coba lagi.';
    if (normalized.includes('menunggu verifikasi admin')) return 'Akun Anda masih menunggu verifikasi admin.';

    return message || fallback;
}

function getLocalUiCache() {
    const data = getData();
    data.uiCache = data.uiCache || { unitImagesByUser: {}, teknisiDocsByUser: {} };
    return data.uiCache;
}

function updateLocalUiCache(mutator) {
    const data = getData();
    data.uiCache = data.uiCache || { unitImagesByUser: {}, teknisiDocsByUser: {} };
    mutator(data.uiCache);
    saveData(data);
    return data.uiCache;
}

function getUnitImagesForUser(userId) {
    const cache = getLocalUiCache();
    return Array.isArray(cache.unitImagesByUser?.[userId]) ? cache.unitImagesByUser[userId] : [];
}

function getTeknisiDocsForUser(userId) {
    const cache = getLocalUiCache();
    return cache.teknisiDocsByUser?.[userId] || { ktpPhoto: '', selfiePhoto: '' };
}

function clearRemoteSessionState(options = {}) {
    remoteState.session = null;
    remoteState.user = null;
    remoteState.profile = null;
    remoteState.currentOrders = [];
    remoteState.adminProfiles = { konsumen: [], teknisi: [], admin: [] };
    remoteState.adminOrders = [];
    currentRole = null;
    uploadingOrderId = null;
    uploadProofImage = null;
    if (!options.preserveView) currentView = null;
}

function sanitizeProfileRecord(profile) {
    if (!profile) return null;
    return {
        ...profile,
        role: String(profile.role || '').trim().toLowerCase(),
        username: String(profile.username || '').trim(),
        name: String(profile.name || '').trim(),
        email: normalizeEmail(profile.email),
        phone: normalizePhone(profile.phone),
        address: String(profile.address || '').trim(),
        status: String(profile.status || 'Aktif').trim(),
        age: profile.age ?? (calculateAge(profile.birth_date || profile.birthDate) || ''),
        birthDate: profile.birth_date || profile.birthDate || '',
        joinedAt: profile.created_at || profile.joinedAt || '',
        completed_jobs: Number(profile.completed_jobs || 0),
        completedJobs: Number(profile.completed_jobs || profile.completedJobs || 0),
        experience: Number(profile.experience || 0),
        district: String(profile.district || '').trim(),
        locationText: String(profile.location_text || profile.locationText || '').trim(),
        lat: profile.lat || '',
        lng: profile.lng || '',
        verifiedAt: profile.verified_at || profile.verifiedAt || '',
        verifiedBy: profile.verified_by || profile.verifiedBy || '',
        verifiedByName: profile.verified_by_name || profile.verifiedByName || ''
    };
}

function mapOrderRecord(order) {
    if (!order) return null;
    return {
        ...order,
        displayId: order.order_number || order.id,
        serviceId: order.service_id || order.serviceId || '',
        serviceName: order.service_name || order.serviceName || '-',
        preferredDate: order.preferred_date || order.preferredDate || '',
        konsumenId: order.konsumen_id || order.konsumenId || null,
        konsumenName: order.konsumen_name || order.konsumenName || '-',
        teknisiId: order.teknisi_id || order.teknisiId || null,
        teknisiName: order.teknisi_name || order.teknisiName || null,
        proofImage: order.proof_image_data || order.proof_image_url || order.proofImage || '',
        createdAt: order.created_at || order.createdAt || '',
        adminConfirmationText: order.admin_confirmation_text || order.adminConfirmationText || '',
        verifiedAt: order.verified_at || order.verifiedAt || '',
        verifiedBy: order.verified_by || order.verifiedBy || '',
        verifiedByName: order.verified_by_name || order.verifiedByName || ''
    };
}

function getOrderLabel(order) {
    return order?.displayId || order?.id || '-';
}

function canAccessAdmin() {
    return true;
}

function hideAdminForPublic() {
    syncAdminAccessUI();
}

function syncAdminAccessUI() {
    const roleAdminCard = document.getElementById('roleAdmin');
    const loginAdminTab = document.getElementById('loginRoleTab-admin');
    const roleCards = document.getElementById('roleCards');

    if (roleAdminCard) {
        roleAdminCard.style.display = '';
        roleAdminCard.setAttribute('aria-hidden', 'false');
    }
    if (loginAdminTab) {
        loginAdminTab.style.display = '';
        loginAdminTab.disabled = false;
        loginAdminTab.setAttribute('aria-hidden', 'false');
    }
    if (roleCards) {
        roleCards.classList.remove('role-cards--admin-hidden');
    }
}

function saveSession(session) {
    if (!session) clearRemoteSessionState({ preserveView: false });
}

function getCurrentSession() {
    if (!remoteState.profile) return null;
    return {
        role: remoteState.profile.role,
        userId: remoteState.profile.id,
        provider: 'supabase'
    };
}

function getCurrentUser() {
    return remoteState.profile;
}

function applySupabaseSession(profile) {
    remoteState.profile = sanitizeProfileRecord(profile);
    currentRole = remoteState.profile?.role || null;
    return remoteState.profile;
}

function applyLocalSession() {
    console.warn('Fallback auth lokal sudah dinonaktifkan.');
    return null;
}

function loginUser() {
    return null;
}

function switchLoginRole(role, element) {
    const safeRole = ['konsumen', 'teknisi', 'admin'].includes(role) ? role : 'konsumen';
    const input = document.getElementById('loginRole');
    if (input) input.value = safeRole;
    document.querySelectorAll('.login-role-tabs .tab').forEach((button) => button.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    } else {
        document.getElementById(`loginRoleTab-${safeRole}`)?.classList.add('active');
    }
}

async function getSupabaseSession() {
    if (!canUseSupabase()) return null;
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    remoteState.session = data.session || null;
    remoteState.user = data.session?.user || null;
    return remoteState.session;
}

async function getSupabaseUser() {
    const session = await getSupabaseSession();
    return session?.user || null;
}

function extractPendingProfileSeed(user) {
    const metadata = user?.user_metadata || {};
    return {
        role: String(metadata.role || '').trim().toLowerCase(),
        username: String(metadata.username || '').trim(),
        name: String(metadata.name || '').trim(),
        phone: normalizePhone(metadata.phone),
        address: String(metadata.address || '').trim(),
        age: metadata.age || '',
        birth_date: metadata.birth_date || metadata.birthDate || '',
        district: String(metadata.district || '').trim(),
        location_text: String(metadata.location_text || metadata.locationText || '').trim(),
        lat: metadata.lat || '',
        lng: metadata.lng || '',
        nik: String(metadata.nik || '').trim(),
        specialization: String(metadata.specialization || '').trim(),
        experience: metadata.experience || '',
        status: String(metadata.status || PROFILE_STATUS_PENDING).trim()
    };
}

function validateProfilePayloadForRole(role, payload = {}, options = {}) {
    const normalizedRole = String(role || payload.role || '').trim().toLowerCase();
    if (!['konsumen', 'teknisi', 'admin'].includes(normalizedRole)) {
        throw new Error('Role profile tidak valid.');
    }
    if (normalizedRole === 'admin' && !options.allowAdmin) {
        throw new Error('Role admin harus dibuat manual di Supabase, bukan dari form publik.');
    }

    const cleanPayload = {
        id: payload.id || remoteState.user?.id,
        role: normalizedRole,
        username: String(payload.username || '').trim(),
        name: String(payload.name || '').trim(),
        email: normalizeEmail(payload.email || remoteState.user?.email || ''),
        phone: normalizePhone(payload.phone),
        address: String(payload.address || '').trim(),
        age: payload.age,
        birth_date: payload.birth_date || payload.birthDate || '',
        district: String(payload.district || '').trim(),
        location_text: String(payload.location_text || payload.locationText || '').trim(),
        lat: payload.lat || '',
        lng: payload.lng || '',
        status: String(payload.status || (normalizedRole === 'admin' ? PROFILE_STATUS_ACTIVE : PROFILE_STATUS_PENDING)).trim()
    };

    if (!cleanPayload.id) throw new Error('User auth belum tersedia untuk profile.');
    if (!cleanPayload.username) throw new Error('Username wajib diisi.');
    if (!cleanPayload.name) throw new Error('Nama wajib diisi.');
    if (!cleanPayload.email) throw new Error('Email wajib diisi.');

    const result = {
        id: cleanPayload.id,
        role: cleanPayload.role,
        username: cleanPayload.username,
        name: cleanPayload.name,
        email: cleanPayload.email,
        phone: toNullableText(cleanPayload.phone),
        address: toNullableText(cleanPayload.address),
        age: toNullableNumber(cleanPayload.age),
        birth_date: toNullableText(cleanPayload.birth_date),
        district: toNullableText(cleanPayload.district),
        location_text: toNullableText(cleanPayload.location_text),
        lat: toNullableText(cleanPayload.lat),
        lng: toNullableText(cleanPayload.lng),
        status: cleanPayload.status
    };

    if (normalizedRole === 'teknisi') {
        result.nik = toNullableText(payload.nik);
        result.specialization = toNullableText(payload.specialization || 'Semua Layanan');
        result.experience = toNullableNumber(payload.experience);
    }

    return result;
}

async function isUsernameTakenRemote(username, excludeUserId = '') {
    const normalized = String(username || '').trim();
    if (!normalized || !canUseSupabase()) return false;

    try {
        const { data, error } = await supabaseClient.rpc('is_username_available', {
            p_username: normalized,
            p_exclude_user_id: excludeUserId || null
        });

        if (!error && typeof data === 'boolean') {
            return !data;
        }

        if (error && !/function .*is_username_available/i.test(String(error.message || ''))) {
            throw error;
        }
    } catch (error) {
        console.warn('RPC is_username_available tidak tersedia atau gagal dipakai.', error);
    }

    return false;
}

async function fetchCurrentProfileStrict(options = {}) {
    const user = await getSupabaseUser();
    if (!user) throw new Error('Session Supabase tidak ditemukan.');

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (error) throw error;
    if (data) return sanitizeProfileRecord(data);
    if (options.allowCreate === false) throw new Error('Profile user belum tersedia di Supabase.');
    return createMissingProfileForAuthenticatedUser(user);
}

async function upsertOwnProfile(payload) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');
    const workingPayload = { ...payload };

    while (true) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .upsert(workingPayload, { onConflict: 'id' })
            .select('*')
            .single();

        if (!error) return sanitizeProfileRecord(data);

        const missingColumn = extractMissingColumnName(error);
        if (missingColumn && OPTIONAL_PROFILE_COLUMNS.has(missingColumn) && missingColumn in workingPayload) {
            delete workingPayload[missingColumn];
            continue;
        }

        throw error;
    }
}

async function createMissingProfileForAuthenticatedUser(userInput = null) {
    const user = userInput || await getSupabaseUser();
    if (!user) throw new Error('Auth user belum tersedia.');

    const metadataSeed = extractPendingProfileSeed(user);
    if (!metadataSeed.role) {
        throw new Error('Profile belum ada dan metadata role tidak tersedia. Jalankan SQL trigger provisioning profile lalu login kembali.');
    }

    const payload = validateProfilePayloadForRole(metadataSeed.role, {
        ...metadataSeed,
        id: user.id,
        email: user.email
    });

    logApp('auth', 'Membuat profile yang belum tersedia dari metadata auth', {
        userId: user.id,
        role: metadataSeed.role
    });

    return upsertOwnProfile(payload);
}

async function ensureProfileAfterAuth(role, formPayload) {
    const user = await getSupabaseUser();
    if (!user) throw new Error('Session belum aktif setelah sign up.');

    const payload = validateProfilePayloadForRole(role, {
        ...formPayload,
        id: user.id,
        email: user.email || formPayload.email
    });

    const profile = await upsertOwnProfile(payload);
    applySupabaseSession(profile);
    return profile;
}

async function ensureApprovedPublicProfile(profile) {
    if (!profile || profile.role === 'admin' || isProfileApproved(profile)) return profile;
    await logoutSupabase();
    throw new Error(`Akun ${ROLE_LABELS[profile.role] || profile.role} masih menunggu verifikasi admin.`);
}

async function requireAuthenticatedProfile(showMessage = true) {
    if (remoteState.profile) return remoteState.profile;
    if (!canUseSupabase()) {
        if (showMessage) showToast('Supabase client belum siap.', 'error');
        return null;
    }

    try {
        const profile = await fetchCurrentProfileStrict();
        applySupabaseSession(profile);
        return profile;
    } catch (error) {
        console.error('Gagal memuat profile terautentikasi:', error);
        if (showMessage) showToast(toUserFacingError(error, 'Profile user tidak dapat dimuat.'), 'error');
        return null;
    }
}

function ensureValidSession(showMessage = false) {
    const valid = Boolean(remoteState.profile);
    if (!valid && showMessage) showToast('Session tidak valid. Silakan login kembali.', 'warning');
    return valid;
}

function requireRole(role) {
    if (!ensureValidSession(true)) return false;
    if (remoteState.profile?.role !== role) {
        showToast(`Akses hanya untuk ${ROLE_LABELS[role] || role}.`, 'warning');
        navigateTo(`${remoteState.profile.role}-home`);
        return false;
    }
    return true;
}

function requireAdminAccess() {
    if (!ensureValidSession(true)) return false;
    if (remoteState.profile?.role !== 'admin') {
        showToast('Akses hanya untuk Admin.', 'warning');
        navigateTo(`${remoteState.profile.role}-home`);
        return false;
    }
    return true;
}

function renderLandingSessionNotice() {
    const container = document.getElementById('landingSessionNotice');
    if (!container) return;
    const user = getCurrentUser();
    if (!user) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `
        <p>Session Supabase aktif: <strong>${escapeHtml(user.name)}</strong> (${escapeHtml(ROLE_LABELS[user.role] || user.role)}).</p>
        <div class="btn-action-group">
            <button class="btn btn-primary btn-sm" type="button" onclick="resumeSession()">Kembali ke Dashboard</button>
            <button class="btn btn-outline btn-sm" type="button" onclick="logoutUser()">Keluar</button>
        </div>
    `;
}

async function resumeSession() {
    const profile = await requireAuthenticatedProfile(true);
    if (!profile) return;
    await redirectUserByRole(profile);
}

function renderAppShell() {
    const user = getCurrentUser();
    if (!user) return;
    currentRole = user.role;
    document.getElementById('headerAvatar').textContent = (user.name || 'U').charAt(0).toUpperCase();
    document.getElementById('headerUserName').textContent = user.name || 'User';
    document.getElementById('headerUserRole').textContent = ROLE_LABELS[user.role] || user.role;

    const navHtml = getNavItems(user.role).map((item) => `
        <button class="nav-item ${currentView === item.id ? 'active' : ''}" type="button" onclick="navigateTo('${item.id}')">
            ${item.icon}
            <span>${item.label}</span>
        </button>
    `).join('');
    document.getElementById('sidebarNav').innerHTML = navHtml;
    document.getElementById('mobileNav').innerHTML = navHtml;
}

async function fetchOrdersForRole(profile) {
    if (!profile) return [];

    let query = supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (profile.role === 'konsumen') {
        query = query.eq('konsumen_id', profile.id);
    } else if (profile.role === 'teknisi') {
        query = query.eq('teknisi_id', profile.id);
    } else if (profile.role !== 'admin') {
        throw new Error(`Role ${profile.role} tidak didukung untuk query orders.`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapOrderRecord);
}

function getOrdersForCurrentKonsumen() {
    return remoteState.profile?.role === 'konsumen' ? remoteState.currentOrders : [];
}

function getOrdersForCurrentTeknisi() {
    return remoteState.profile?.role === 'teknisi' ? remoteState.currentOrders : [];
}

async function fetchProfilesByRole(role) {
    if (!requireAdminAccess()) throw new Error('Akses admin dibutuhkan untuk memuat profiles.');
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(sanitizeProfileRecord);
}

async function loadAdminMasterData() {
    if (!requireAdminAccess()) return false;

    const [konsumen, teknisi, admin, orders] = await Promise.all([
        fetchProfilesByRole('konsumen'),
        fetchProfilesByRole('teknisi'),
        fetchProfilesByRole('admin'),
        fetchOrdersForRole(remoteState.profile)
    ]);

    remoteState.adminProfiles = { konsumen, teknisi, admin };
    remoteState.adminOrders = orders;
    return true;
}

async function bootstrapSessionFromSupabase(options = {}) {
    const session = await getSupabaseSession();
    if (!session?.user) {
        clearRemoteSessionState({ preserveView: false });
        renderLandingSessionNotice();
        return null;
    }

    const profile = await fetchCurrentProfileStrict();
    await ensureApprovedPublicProfile(profile);
    applySupabaseSession(profile);

    if (profile.role === 'admin') {
        try {
            await loadAdminMasterData();
        } catch (error) {
            console.error('Gagal memuat master data admin saat bootstrap:', error);
        }
    } else {
        try {
            remoteState.currentOrders = await fetchOrdersForRole(profile);
        } catch (error) {
            console.error('Gagal memuat orders saat bootstrap session:', error);
            remoteState.currentOrders = [];
        }
    }

    renderLandingSessionNotice();

    if (options.redirect) {
        await redirectUserByRole(profile);
    }

    return profile;
}

async function bootstrapAuthState() {
    if (!canUseSupabase()) return null;

    if (!remoteState.authListenerBound) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            remoteState.session = session || null;
            remoteState.user = session?.user || null;
            logApp('auth', `onAuthStateChange: ${event}`, { hasSession: Boolean(session) });

            Promise.resolve().then(async () => {
                if (!session) {
                    clearRemoteSessionState({ preserveView: false });
                    showLanding();
                    return;
                }

                try {
                    const profile = await bootstrapSessionFromSupabase({ redirect: false });
                    if (!profile) {
                        showLanding();
                        return;
                    }

                    if (currentView && currentView.startsWith(profile.role)) {
                        renderAppShell();
                        await renderCurrentView();
                    } else if (!currentView || !currentView.startsWith(profile.role)) {
                        await redirectUserByRole(profile);
                    }
                } catch (error) {
                    console.error('Bootstrap onAuthStateChange gagal:', error);
                    showToast(toUserFacingError(error, 'Gagal memuat session Supabase.'), 'error');
                }
            });
        });

        remoteState.authListenerBound = true;
    }

    if (!authBootstrapPromise) {
        authBootstrapPromise = bootstrapSessionFromSupabase({ redirect: false })
            .catch((error) => {
                console.error('Bootstrap awal auth gagal:', error);
                return null;
            })
            .finally(() => {
                authBootstrapPromise = null;
            });
    }

    return authBootstrapPromise;
}

async function redirectUserByRole(profile = remoteState.profile) {
    if (!profile) return;
    openAppLayout();
    renderAppShell();
    await navigateTo(`${profile.role}-home`);
}

function resetToPublicLanding(message = '') {
    clearRemoteSessionState({ preserveView: false });
    document.getElementById('formLogin')?.reset();
    switchLoginRole('konsumen');
    showLanding();
    if (message) showToast(message, 'warning');
}

async function logoutSupabase() {
    if (!canUseSupabase()) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Gagal logout Supabase:', error);
        throw error;
    }
}

async function logoutUser(showMessage = true) {
    try {
        await logoutSupabase();
    } catch (error) {
        showToast(toUserFacingError(error, 'Logout gagal.'), 'error');
    }

    resetToPublicLanding(showMessage ? 'Anda berhasil logout.' : '');
}

async function handleSupabaseLogin(email, password) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: normalizeEmail(email),
        password: String(password || '').trim()
    });

    if (error) throw error;

    const profile = await fetchCurrentProfileStrict();
    await ensureApprovedPublicProfile(profile);
    applySupabaseSession(profile);

    if (profile.role === 'admin') {
        await loadAdminMasterData();
    } else {
        remoteState.currentOrders = await fetchOrdersForRole(profile);
    }

    await redirectUserByRole(profile);
    return profile;
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    const selectedRole = document.getElementById('loginRole').value;
    const email = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Email dan password wajib diisi.', 'error');
        return false;
    }

    try {
        const profile = await handleSupabaseLogin(email, password);
        if (selectedRole && selectedRole !== profile.role) {
            showToast(`Akun Anda terdaftar sebagai ${ROLE_LABELS[profile.role] || profile.role}. Dashboard disesuaikan otomatis.`, 'warning');
        } else {
            showToast(`Login berhasil. Selamat datang, ${profile.name}.`, 'success');
        }
    } catch (error) {
        console.error('Login Supabase gagal:', error);
        showToast(toUserFacingError(error, 'Login gagal. Periksa email dan password Anda.'), 'error');
    }

    return false;
}

async function registerKonsumenSupabase(formValues) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');

    const email = normalizeEmail(formValues.email);
    const password = String(formValues.password || '').trim();
    if (!password) throw new Error('Password wajib diisi.');

    const usernameTaken = await isUsernameTakenRemote(formValues.username);
    if (usernameTaken) throw new Error('Username konsumen sudah digunakan.');

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: getAppBaseUrl(),
            data: {
                role: 'konsumen',
                username: formValues.username,
                name: formValues.name,
                phone: formValues.phone,
                address: formValues.address,
                age: formValues.age,
                birth_date: formValues.birthDate,
                district: formValues.district,
                location_text: formValues.locationText,
                lat: formValues.lat,
                lng: formValues.lng,
                status: PROFILE_STATUS_PENDING
            }
        }
    });

    if (error) throw error;
    if (!data.user) throw new Error('User auth tidak berhasil dibuat.');

    return data;
}

async function registerTeknisiSupabase(formValues) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');

    const email = normalizeEmail(formValues.email);
    const password = String(formValues.password || '').trim();
    if (!password) throw new Error('Password wajib diisi.');

    const usernameTaken = await isUsernameTakenRemote(formValues.username);
    if (usernameTaken) throw new Error('Username teknisi sudah digunakan.');

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: getAppBaseUrl(),
            data: {
                role: 'teknisi',
                username: formValues.username,
                name: formValues.name,
                phone: formValues.phone,
                address: formValues.address,
                age: formValues.age,
                birth_date: formValues.birthDate,
                nik: formValues.nik,
                specialization: formValues.specialization,
                experience: formValues.experience,
                location_text: formValues.locationText,
                lat: formValues.lat,
                lng: formValues.lng,
                status: PROFILE_STATUS_PENDING
            }
        }
    });

    if (error) throw error;
    if (!data.user) throw new Error('User auth tidak berhasil dibuat.');

    return data;
}

async function handleRegisterKonsumen(event) {
    event.preventDefault();

    const form = collectRegisterKonsumenForm();
    const manualBirthDateInput = document.getElementById('regKonBirthDateManual');
    if (manualBirthDateInput && !manualBirthDateInput.checkValidity()) {
        manualBirthDateInput.reportValidity();
        return false;
    }
    const waPopup = prepareWhatsAppPopup();
    if (!form.name || !form.username || !form.password || !form.email || !form.phone || !form.address || !form.district) {
        closePreparedPopup(waPopup);
        showToast('Lengkapi data wajib konsumen.', 'error');
        return false;
    }

    try {
        const authResult = await registerKonsumenSupabase(form);
        const hasSession = Boolean(authResult.session);
        notifyAdminNewRegistration('konsumen', form, waPopup);

        if (hasSession) {
            await ensureProfileAfterAuth('konsumen', form);
            await logoutSupabase();
            document.getElementById('formRegKonsumen').reset();
            draftUploads.regKonUnitImages = [];
            document.getElementById('regKonUnitPreview').innerHTML = '';
            document.getElementById('regKonLocationResult').style.display = 'none';
            resetToPublicLanding(`Pendaftaran konsumen ${form.name} berhasil dikirim dan menunggu verifikasi admin.`);
            document.getElementById('loginIdentifier').value = form.email;
            return false;
        }

        document.getElementById('formRegKonsumen').reset();
        draftUploads.regKonUnitImages = [];
        document.getElementById('regKonUnitPreview').innerHTML = '';
        document.getElementById('regKonLocationResult').style.display = 'none';
        document.getElementById('loginIdentifier').value = form.email;
        showLoginPage();
        showToast('Pendaftaran konsumen berhasil dikirim. Cek email bila perlu, lalu tunggu verifikasi admin sebelum login.', 'success');
    } catch (error) {
        closePreparedPopup(waPopup);
        console.error('Registrasi konsumen gagal:', error);
        showToast(toUserFacingError(error, 'Registrasi konsumen gagal.'), 'error');
    }

    return false;
}

async function handleRegisterTeknisi(event) {
    event.preventDefault();

    const form = collectRegisterTeknisiForm();
    const manualBirthDateInput = document.getElementById('regTekBirthDateManual');
    if (manualBirthDateInput && !manualBirthDateInput.checkValidity()) {
        manualBirthDateInput.reportValidity();
        return false;
    }
    const waPopup = prepareWhatsAppPopup();
    if (!form.name || !form.username || !form.password || !form.email || !form.phone || !form.nik || !form.birthDate || !form.specialization || !form.address) {
        closePreparedPopup(waPopup);
        showToast('Lengkapi data wajib teknisi.', 'error');
        return false;
    }
    if (!draftUploads.regTekKtpPhoto || !draftUploads.regTekSelfiePhoto) {
        closePreparedPopup(waPopup);
        showToast('Foto KTP dan foto diri teknisi wajib diunggah.', 'error');
        return false;
    }

    try {
        const authResult = await registerTeknisiSupabase(form);
        const hasSession = Boolean(authResult.session);
        notifyAdminNewRegistration('teknisi', form, waPopup);

        if (hasSession) {
            await ensureProfileAfterAuth('teknisi', form);
            await logoutSupabase();
            document.getElementById('formRegTeknisi').reset();
            draftUploads.regTekKtpPhoto = '';
            draftUploads.regTekSelfiePhoto = '';
            draftUploads.ocrLastResult = null;
            document.getElementById('regTekIDPreview').innerHTML = '';
            document.getElementById('regTekSelfiePreview').innerHTML = '';
            document.getElementById('regTekLocationResult').style.display = 'none';
            resetToPublicLanding(`Pendaftaran teknisi ${form.name} berhasil dikirim dan menunggu verifikasi admin.`);
            document.getElementById('loginIdentifier').value = form.email;
            return false;
        }

        document.getElementById('formRegTeknisi').reset();
        draftUploads.regTekKtpPhoto = '';
        draftUploads.regTekSelfiePhoto = '';
        draftUploads.ocrLastResult = null;
        document.getElementById('regTekIDPreview').innerHTML = '';
        document.getElementById('regTekSelfiePreview').innerHTML = '';
        document.getElementById('regTekLocationResult').style.display = 'none';
        document.getElementById('loginIdentifier').value = form.email;
        showLoginPage();
        showToast('Pendaftaran teknisi berhasil dikirim. Cek email bila perlu, lalu tunggu verifikasi admin sebelum login.', 'success');
    } catch (error) {
        closePreparedPopup(waPopup);
        console.error('Registrasi teknisi gagal:', error);
        showToast(toUserFacingError(error, 'Registrasi teknisi gagal.'), 'error');
    }

    return false;
}

async function navigateTo(viewId, prefill = '') {
    if (!ensureValidSession(true)) return;
    const profile = getCurrentUser();
    if (!profile) return;

    if (!String(viewId || '').startsWith(profile.role)) {
        showToast('Anda tidak dapat membuka halaman role lain.', 'warning');
        viewId = `${profile.role}-home`;
    }

    document.querySelectorAll('.view').forEach((view) => {
        view.style.display = 'none';
    });

    const targetId = `view${viewId.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')}`;
    const target = document.getElementById(targetId);
    if (target) target.style.display = 'block';
    currentView = viewId;
    renderAppShell();
    await renderCurrentView(prefill);
}

async function loadCurrentOrdersForProfile() {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role === 'admin') return [];
    remoteState.currentOrders = await fetchOrdersForRole(profile);
    return remoteState.currentOrders;
}

async function renderKonsumenHome() {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'konsumen') return;

    const orders = await loadCurrentOrdersForProfile();
    document.getElementById('konsumenTotalOrders').textContent = orders.length;
    document.getElementById('konsumenPending').textContent = orders.filter((order) => order.status !== 'Selesai').length;
    document.getElementById('konsumenCompleted').textContent = orders.filter((order) => order.status === 'Selesai').length;

    const recentBody = document.getElementById('konsumenRecentBody');
    recentBody.innerHTML = orders.length ? orders.slice(0, 5).map((order) => `
        <tr>
            <td>${escapeHtml(getOrderLabel(order))}</td>
            <td>${escapeHtml(order.serviceName)}</td>
            <td>${escapeHtml(formatDate(order.preferredDate || order.createdAt))}</td>
            <td>${renderStatusBadge(order.status)}</td>
        </tr>
    `).join('') : '<tr><td colspan="4" class="empty-state">Belum ada pesanan</td></tr>';

    const container = document.getElementById('serviceCardsContainer');
    const services = getServices(false);
    container.innerHTML = services.map((service) => `
        <div class="service-card" onclick="navigateTo('konsumen-order', '${escapeHtml(service.name)}')">
            <img src="${escapeHtml(serviceImage(service))}" alt="${escapeHtml(service.name)}">
            <div class="service-card-body">
                <h4>${escapeHtml(service.name)}</h4>
                <p>${escapeHtml(service.description)}</p>
                <span class="service-price">${formatRupiah(service.price)}</span>
            </div>
        </div>
    `).join('');
}

function renderKonsumenOrder(prefill = '') {
    const user = getCurrentUser();
    const serviceSelect = document.getElementById('orderService');
    serviceSelect.innerHTML = '<option value="">Pilih Layanan</option>' + getServices(false).map((service) => `<option value="${escapeHtml(service.id)}">${escapeHtml(service.name)}</option>`).join('');
    if (prefill) {
        const target = getServices(false).find((service) => service.name === prefill);
        if (target) serviceSelect.value = target.id;
    }
    document.getElementById('orderPhone').value = user?.phone || '';
    document.getElementById('orderAddress').value = user?.address || '';
}

async function renderKonsumenHistory() {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'konsumen') return;

    const orders = await loadCurrentOrdersForProfile();
    const body = document.getElementById('konsumenHistoryBody');
    body.innerHTML = orders.length ? orders.map((order) => `
        <tr>
            <td>${escapeHtml(getOrderLabel(order))}</td>
            <td>${escapeHtml(order.serviceName)}</td>
            <td>${escapeHtml(order.brand || '-')}</td>
            <td>${escapeHtml(formatDate(order.preferredDate || order.createdAt))}</td>
            <td>${escapeHtml(order.teknisiName || 'Belum ditugaskan')}</td>
            <td>${renderStatusBadge(order.status)}</td>
        </tr>
    `).join('') : '<tr><td colspan="6" class="empty-state">Belum ada pesanan</td></tr>';
}

function renderKonsumenProfile() {
    const user = getCurrentUser();
    if (!user || user.role !== 'konsumen') return;

    document.getElementById('profileKonsumenName').value = user.name || '';
    document.getElementById('profileKonsumenUsername').value = user.username || '';
    document.getElementById('profileKonsumenEmail').value = user.email || '';
    document.getElementById('profileKonsumenEmail').readOnly = true;
    document.getElementById('profileKonsumenPhone').value = user.phone || '';
    document.getElementById('profileKonsumenBirthDate').value = user.birthDate || '';
    document.getElementById('profileKonsumenAge').value = user.age || '';
    document.getElementById('profileKonsumenAddress').value = user.address || '';
    document.getElementById('profileKonsumenLocation').textContent = formatLocationSummary(user);
    document.getElementById('profileKonsumenJoined').textContent = formatDate(user.joinedAt);
    document.getElementById('konsumenProfileAutosave').textContent = 'Profil akan sinkron otomatis ke Supabase.';
}

function renderKonsumenUnit() {
    const user = getCurrentUser();
    const gallery = document.getElementById('konUnitGallery');
    const images = user ? getUnitImagesForUser(user.id) : [];
    gallery.innerHTML = images.length ? images.map((image, index) => `
        <div class="image-card">
            <img src="${escapeHtml(image)}" alt="Foto unit ${index + 1}">
        </div>
    `).join('') : '<div class="empty-state-box"><p>Belum ada foto unit.</p></div>';
}

async function renderTeknisiHome() {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'teknisi') return;

    const orders = await loadCurrentOrdersForProfile();
    document.getElementById('teknisiTotalJobs').textContent = orders.length;
    document.getElementById('teknisiActiveJobs').textContent = orders.filter((order) => order.status === 'Ditugaskan' || order.status === 'Dikerjakan').length;
    document.getElementById('teknisiCompletedJobs').textContent = orders.filter((order) => order.status === 'Selesai').length;

    const list = document.getElementById('teknisiJobsList');
    const activeOrders = orders.filter((order) => order.status !== 'Selesai');
    list.innerHTML = activeOrders.length ? activeOrders.map((order) => `
        <div class="job-card">
            <div class="job-card-header">
                <h4>${escapeHtml(order.serviceName)}</h4>
                ${renderStatusBadge(order.status)}
            </div>
            <div class="job-card-details">
                <div><strong>No:</strong> ${escapeHtml(getOrderLabel(order))}</div>
                <div><strong>Konsumen:</strong> ${escapeHtml(order.konsumenName)}</div>
                <div><strong>Alamat:</strong> ${escapeHtml(order.address || '-')}</div>
                <div><strong>Tanggal:</strong> ${escapeHtml(formatDate(order.preferredDate))}</div>
            </div>
            <div class="btn-action-group">
                <button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button>
                ${order.status === 'Ditugaskan' ? `<button class="btn btn-info btn-xs" onclick="startJob('${order.id}')">Mulai</button>` : ''}
                ${order.status !== 'Selesai' ? `<button class="btn btn-primary btn-xs" onclick="openUploadProof('${order.id}')">Upload Bukti</button>` : ''}
            </div>
        </div>
    `).join('') : '<div class="empty-state-box"><p>Belum ada pekerjaan yang ditugaskan.</p></div>';
}

async function renderTeknisiJobs() {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'teknisi') return;

    const orders = await loadCurrentOrdersForProfile();
    const body = document.getElementById('teknisiAllJobsBody');
    body.innerHTML = orders.length ? orders.map((order) => `
        <tr>
            <td>${escapeHtml(getOrderLabel(order))}</td>
            <td>${escapeHtml(order.konsumenName)}</td>
            <td>${escapeHtml(order.serviceName)}</td>
            <td>${escapeHtml(order.address || '-')}</td>
            <td>${escapeHtml(formatDate(order.preferredDate))}</td>
            <td>${renderStatusBadge(order.status)}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button>
                    ${order.status === 'Ditugaskan' ? `<button class="btn btn-info btn-xs" onclick="startJob('${order.id}')">Mulai</button>` : ''}
                    ${order.status !== 'Selesai' ? `<button class="btn btn-primary btn-xs" onclick="openUploadProof('${order.id}')">Upload</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="7" class="empty-state">Belum ada pekerjaan</td></tr>';
}

function renderTeknisiProfile() {
    const user = getCurrentUser();
    if (!user || user.role !== 'teknisi') return;

    populateSpecializationOptions('profileTeknisiSpecialization', user.specialization);
    document.getElementById('profileTeknisiName').value = user.name || '';
    document.getElementById('profileTeknisiUsername').value = user.username || '';
    document.getElementById('profileTeknisiEmail').value = user.email || '';
    document.getElementById('profileTeknisiEmail').readOnly = true;
    document.getElementById('profileTeknisiPhone').value = user.phone || '';
    document.getElementById('profileTeknisiNIK').value = user.nik || '';
    document.getElementById('profileTeknisiBirthDate').value = user.birthDate || '';
    document.getElementById('profileTeknisiAge').value = user.age || '';
    document.getElementById('profileTeknisiExperience').value = user.experience || 0;
    document.getElementById('profileTeknisiAddress').value = user.address || '';
    document.getElementById('profileTeknisiLocation').textContent = formatLocationSummary(user);
    document.getElementById('profileTeknisiStatus').textContent = user.status || 'Aktif';
    document.getElementById('teknisiProfileAutosave').textContent = 'Profil akan sinkron otomatis ke Supabase.';
}

function renderTeknisiDocs() {
    const user = getCurrentUser();
    const docs = user ? getTeknisiDocsForUser(user.id) : { ktpPhoto: '', selfiePhoto: '' };
    const ktpGrid = document.getElementById('tekIDPreviewGrid');
    const selfieGrid = document.getElementById('tekSelfiePreviewGrid');
    ktpGrid.innerHTML = docs.ktpPhoto ? `<div class="image-card"><img src="${escapeHtml(docs.ktpPhoto)}" alt="Foto KTP"></div>` : '';
    selfieGrid.innerHTML = docs.selfiePhoto ? `<div class="image-card"><img src="${escapeHtml(docs.selfiePhoto)}" alt="Foto Diri"></div>` : '';
}

function renderTeknisiUpload() {
    const info = document.getElementById('uploadOrderInfo');
    const order = remoteState.currentOrders.find((item) => item.id === uploadingOrderId);
    info.innerHTML = order ? `
        <div class="detail-row"><span class="detail-label">Pesanan</span><span class="detail-value">${escapeHtml(getOrderLabel(order))}</span></div>
        <div class="detail-row"><span class="detail-label">Layanan</span><span class="detail-value">${escapeHtml(order.serviceName)}</span></div>
        <div class="detail-row"><span class="detail-label">Konsumen</span><span class="detail-value">${escapeHtml(order.konsumenName)}</span></div>
    ` : '';
}

async function renderCurrentView(prefill = '') {
    if (currentView === 'konsumen-home') await renderKonsumenHome();
    if (currentView === 'konsumen-order') renderKonsumenOrder(prefill);
    if (currentView === 'konsumen-history') await renderKonsumenHistory();
    if (currentView === 'konsumen-profile') renderKonsumenProfile();
    if (currentView === 'konsumen-unit') renderKonsumenUnit();
    if (currentView === 'teknisi-home') await renderTeknisiHome();
    if (currentView === 'teknisi-jobs') await renderTeknisiJobs();
    if (currentView === 'teknisi-profile') renderTeknisiProfile();
    if (currentView === 'teknisi-docs') renderTeknisiDocs();
    if (currentView === 'teknisi-upload') renderTeknisiUpload();
    if (currentView === 'admin-home') await renderAdminHome();
    if (currentView === 'admin-orders') await renderAdminOrders();
    if (currentView === 'admin-users') await renderAdminUsers();
}

async function renderAdminHome() {
    if (!requireAdminAccess()) return;
    await loadAdminMasterData();
    const orders = remoteState.adminOrders;
    const teknisi = remoteState.adminProfiles.teknisi;

    document.getElementById('adminTotalOrders').textContent = orders.length;
    document.getElementById('adminTotalRevenue').textContent = formatRupiah(orders.filter((order) => order.status === 'Selesai').reduce((sum, order) => sum + Number(order.price || 0), 0));
    document.getElementById('adminTotalTeknisi').textContent = teknisi.filter((user) => user.status === 'Aktif').length;
    document.getElementById('adminPendingOrders').textContent = orders.filter((order) => order.status === 'Menunggu').length;

    const body = document.getElementById('adminRecentOrdersBody');
    body.innerHTML = orders.length ? orders.slice(0, 5).map((order) => `
        <tr>
            <td>${escapeHtml(getOrderLabel(order))}</td>
            <td>${escapeHtml(order.konsumenName)}</td>
            <td>${escapeHtml(order.serviceName)}</td>
            <td>${escapeHtml(formatDate(order.preferredDate || order.createdAt))}</td>
            <td>${renderStatusBadge(order.status)}</td>
            <td><button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button></td>
        </tr>
    `).join('') : '<tr><td colspan="6" class="empty-state">Belum ada pesanan</td></tr>';
}

async function renderAdminOrders() {
    if (!requireAdminAccess()) return;
    await loadAdminMasterData();
    const filter = document.getElementById('adminFilterStatus').value;
    const orders = remoteState.adminOrders.filter((order) => filter === 'all' || order.status === filter);
    const body = document.getElementById('adminAllOrdersBody');

    body.innerHTML = orders.length ? orders.map((order) => `
        <tr>
            <td>${escapeHtml(getOrderLabel(order))}</td>
            <td>${escapeHtml(order.konsumenName)}</td>
            <td>${escapeHtml(order.serviceName)}</td>
            <td>${escapeHtml(order.brand || '-')}</td>
            <td>${escapeHtml(formatDate(order.preferredDate))}</td>
            <td>${escapeHtml(order.address || '-')}</td>
            <td>${escapeHtml(order.teknisiName || '-')}</td>
            <td>${renderStatusBadge(order.status)}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button>
                    <button class="btn btn-primary btn-xs" onclick="openAssignModal('${order.id}')">Assign</button>
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="9" class="empty-state">Belum ada pesanan</td></tr>';
}

async function renderAdminUsers() {
    if (!requireAdminAccess()) return;
    renderAdminServicesTable();
    renderAdminImageCatalogTable();

    try {
        await loadAdminMasterData();
        renderAdminKonsumenTable(remoteState.adminProfiles.konsumen);
        renderAdminTeknisiTable(remoteState.adminProfiles.teknisi);
        renderAdminAdminTable(remoteState.adminProfiles.admin);
    } catch (error) {
        console.error('Gagal memuat data master admin dari Supabase:', error);
        showToast(toUserFacingError(error, 'Data master admin gagal dimuat dari Supabase.'), 'error');
    }

    switchUserTab(currentUserTab);
}

async function updateProfileByAdmin(userId, payload = {}) {
    const workingPayload = { ...payload };

    while (true) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .update(workingPayload)
            .eq('id', userId)
            .select('*')
            .single();

        if (!error) return sanitizeProfileRecord(data);

        const missingColumn = extractMissingColumnName(error);
        if (missingColumn && OPTIONAL_PROFILE_COLUMNS.has(missingColumn) && missingColumn in workingPayload) {
            delete workingPayload[missingColumn];
            continue;
        }

        throw error;
    }
}

async function verifyPublicUser(role, userId) {
    if (!requireAdminAccess()) return;
    try {
        await updateProfileByAdmin(userId, {
            status: PROFILE_STATUS_ACTIVE,
            verified_at: new Date().toISOString(),
            verified_by: remoteState.profile?.id || null
        });
        await loadAdminMasterData();
        renderAdminKonsumenTable(remoteState.adminProfiles.konsumen);
        renderAdminTeknisiTable(remoteState.adminProfiles.teknisi);
        await renderAdminHome();
        showToast(`Akun ${ROLE_LABELS[role] || role} berhasil diverifikasi.`, 'success');
    } catch (error) {
        console.error('Gagal verifikasi user:', error);
        showToast(toUserFacingError(error, 'Verifikasi user gagal.'), 'error');
    }
}

function renderAdminUserActions(user, role) {
    if (role === 'admin') return '-';
    if (isProfileApproved(user)) return '<span class="text-muted">Terverifikasi</span>';
    return `<button class="btn btn-primary btn-xs" onclick="verifyPublicUser('${role}', '${user.id}')">Verifikasi</button>`;
}

function renderAdminKonsumenTable(users = []) {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminKonsumenListBody');
    const orders = remoteState.adminOrders;

    body.innerHTML = users.length ? users.map((user) => `
        <tr>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.username || '-')}</td>
            <td>${escapeHtml(user.email || '-')}</td>
            <td>${escapeHtml(user.phone || '-')}</td>
            <td>${escapeHtml(user.age || '-')}</td>
            <td>${escapeHtml(user.address || '-')}</td>
            <td>${renderStatusBadge(user.status || PROFILE_STATUS_PENDING)}</td>
            <td>${orders.filter((order) => order.konsumenId === user.id).length}</td>
            <td>${renderAdminUserActions(user, 'konsumen')}</td>
        </tr>
    `).join('') : '<tr><td colspan="9" class="empty-state">Tidak ada data</td></tr>';
}

function renderAdminTeknisiTable(users = []) {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminTeknisiListBody');
    const orders = remoteState.adminOrders;

    body.innerHTML = users.length ? users.map((user) => `
        <tr>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.username || '-')}</td>
            <td>${escapeHtml(user.email || '-')}</td>
            <td>${escapeHtml(user.phone || '-')}</td>
            <td>${escapeHtml(user.nik || '-')}</td>
            <td>${escapeHtml(user.specialization || '-')}</td>
            <td>${renderStatusBadge(user.status || PROFILE_STATUS_PENDING)}</td>
            <td>${orders.filter((order) => order.teknisiId === user.id && order.status === 'Selesai').length}</td>
            <td>${renderAdminUserActions(user, 'teknisi')}</td>
        </tr>
    `).join('') : '<tr><td colspan="9" class="empty-state">Tidak ada data</td></tr>';
}

function renderAdminAdminTable(users = []) {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminAdminListBody');

    body.innerHTML = users.length ? users.map((user) => `
        <tr>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.username || '-')}</td>
            <td>${escapeHtml(user.email || '-')}</td>
            <td>${escapeHtml(user.status || 'Aktif')}</td>
            <td>${escapeHtml(user.role || 'admin')}</td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="empty-state">Tidak ada data admin</td></tr>';
}

const profileAutosaveTimeouts = { konsumen: null, teknisi: null };

function handleProfileFormInput(role) {
    if (!['konsumen', 'teknisi'].includes(role)) return;
    clearTimeout(profileAutosaveTimeouts[role]);
    profileAutosaveTimeouts[role] = setTimeout(() => {
        saveProfile(role).catch((error) => {
            console.error(`Autosave profile ${role} gagal:`, error);
        });
    }, 600);
}

async function saveProfile(role) {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== role) return;

    const statusNode = document.getElementById(role === 'konsumen' ? 'konsumenProfileAutosave' : 'teknisiProfileAutosave');
    if (statusNode) statusNode.textContent = 'Menyinkronkan ke Supabase...';

    try {
        let payload = null;

        if (role === 'konsumen') {
            payload = validateProfilePayloadForRole('konsumen', {
                id: profile.id,
                role: 'konsumen',
                username: document.getElementById('profileKonsumenUsername').value.trim(),
                name: document.getElementById('profileKonsumenName').value.trim(),
                email: profile.email,
                phone: document.getElementById('profileKonsumenPhone').value,
                birth_date: document.getElementById('profileKonsumenBirthDate').value,
                age: document.getElementById('profileKonsumenAge').value,
                address: document.getElementById('profileKonsumenAddress').value.trim(),
                district: profile.district,
                location_text: profile.locationText,
                lat: profile.lat,
                lng: profile.lng,
                status: profile.status
            });
        }

        if (role === 'teknisi') {
            payload = validateProfilePayloadForRole('teknisi', {
                id: profile.id,
                role: 'teknisi',
                username: document.getElementById('profileTeknisiUsername').value.trim(),
                name: document.getElementById('profileTeknisiName').value.trim(),
                email: profile.email,
                phone: document.getElementById('profileTeknisiPhone').value,
                nik: document.getElementById('profileTeknisiNIK').value.trim(),
                birth_date: document.getElementById('profileTeknisiBirthDate').value,
                age: document.getElementById('profileTeknisiAge').value,
                specialization: document.getElementById('profileTeknisiSpecialization').value,
                experience: document.getElementById('profileTeknisiExperience').value,
                address: document.getElementById('profileTeknisiAddress').value.trim(),
                location_text: profile.locationText,
                lat: profile.lat,
                lng: profile.lng,
                status: profile.status
            });
        }

        if (!payload) return;

        const usernameTaken = await isUsernameTakenRemote(payload.username, profile.id);
        if (usernameTaken) {
            if (statusNode) statusNode.textContent = 'Username sudah dipakai akun lain.';
            return;
        }

        const updatedProfile = await upsertOwnProfile(payload);
        applySupabaseSession(updatedProfile);
        renderAppShell();
        if (statusNode) statusNode.textContent = `Tersinkron ke Supabase ${formatDateTime(new Date())}`;
    } catch (error) {
        console.error(`Gagal menyimpan profile ${role}:`, error);
        if (statusNode) statusNode.textContent = 'Gagal sinkron ke Supabase.';
        showToast(toUserFacingError(error, 'Gagal menyimpan profile.'), 'error');
    }
}

async function createOrderSupabase(orderValues) {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'konsumen') throw new Error('Konsumen harus login untuk membuat order.');

    const insertPayload = {
        konsumen_id: profile.id,
        konsumen_name: profile.name,
        service_id: orderValues.service_id,
        service_name: orderValues.service_name,
        price: Number(orderValues.price || 0),
        brand: toNullableText(orderValues.brand),
        pk: toNullableText(orderValues.pk),
        refrigerant: toNullableText(orderValues.refrigerant),
        preferred_date: toNullableText(orderValues.preferred_date),
        address: toNullableText(orderValues.address),
        notes: toNullableText(orderValues.notes),
        phone: toNullableText(orderValues.phone),
        status: 'Menunggu'
    };

    const { data, error } = await supabaseClient
        .from('orders')
        .insert(insertPayload)
        .select('*')
        .single();

    if (error) throw error;
    return mapOrderRecord(data);
}

async function handleOrderSubmit(event) {
    event.preventDefault();

    const profile = await requireAuthenticatedProfile(true);
    if (!profile || profile.role !== 'konsumen') return false;
    const waPopup = prepareWhatsAppPopup();

    const service = getServices(false).find((item) => item.id === document.getElementById('orderService').value);
    if (!service) {
        closePreparedPopup(waPopup);
        showToast('Pilih layanan terlebih dahulu.', 'error');
        return false;
    }

    try {
        const order = await createOrderSupabase({
            service_id: service.id,
            service_name: service.name,
            price: service.price,
            brand: document.getElementById('orderBrand').value.trim(),
            pk: document.getElementById('orderPK').value.trim(),
            refrigerant: document.getElementById('orderRefrigerant').value.trim(),
            preferred_date: document.getElementById('orderDate').value,
            address: document.getElementById('orderAddress').value.trim(),
            notes: document.getElementById('orderNotes').value.trim(),
            phone: normalizePhone(document.getElementById('orderPhone').value)
        });

        notifyAdminNewOrder(order, waPopup);
        await loadCurrentOrdersForProfile();
        document.getElementById('formOrder').reset();
        await navigateTo('konsumen-home');
        showToast(`Pesanan ${getOrderLabel(order)} berhasil dibuat dan menunggu verifikasi admin.`, 'success');
    } catch (error) {
        closePreparedPopup(waPopup);
        console.error('Gagal membuat order di Supabase:', error);
        showToast(toUserFacingError(error, 'Pesanan gagal dibuat.'), 'error');
    }

    return false;
}

function initDomEvents() {
    document.getElementById('btnLogout')?.addEventListener('click', () => logoutUser());
    document.getElementById('serviceFormImageFile')?.addEventListener('change', handleServiceImageUpload);
    document.getElementById('imageCatalogFormFile')?.addEventListener('change', handleImageCatalogUpload);
    document.getElementById('formKonsumenProfile')?.addEventListener('input', () => handleProfileFormInput('konsumen'));
    document.getElementById('formTeknisiProfile')?.addEventListener('input', () => handleProfileFormInput('teknisi'));
}

function handleStorageSync(event) {
    if (event.key !== STORAGE_KEY && event.key !== LEGACY_STORAGE_KEY) return;
    appData = loadStoredData();
    if (remoteState.profile && currentView) {
        renderAppShell();
        renderCurrentView().catch((error) => {
            console.error('Gagal render ulang setelah storage sync:', error);
        });
    } else {
        renderLandingSessionNotice();
    }
}

function purgeLegacyKonsumenTeknisiCache() {
    const data = getData();
    data.users = { admin: [], konsumen: [], teknisi: [] };
    data.orders = [];
    data.currentSession = null;
    data.appSettings = {
        ...(data.appSettings || {}),
        criticalCachePurgedAt: new Date().toISOString()
    };
    saveData(data);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
}

async function logoutSupabase() {
    if (!canUseSupabase()) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Gagal logout Supabase:', error);
        throw error;
    }
}

async function restoreSession() {
    const profile = await bootstrapAuthState();
    return Boolean(profile);
}

async function initApp() {
    appData = loadStoredData();
    saveData(appData);
    purgeLegacyKonsumenTeknisiCache();
    populateSpecializationOptions('regTekSpecialization', 'Semua Layanan');
    syncAdminAccessUI();
    initDomEvents();
 
    if (!canUseSupabase()) {
        showLanding();
        showToast('Supabase client belum siap di browser ini.', 'error');
        return;
    }

    try {
        const hasSession = await restoreSession();
        if (hasSession && remoteState.profile) {
            await redirectUserByRole(remoteState.profile);
            return;
        }
    } catch (error) {
        console.error('Gagal restore session Supabase:', error);
        showToast(toUserFacingError(error, 'Gagal memulihkan session Supabase.'), 'warning');
    }

    showLanding();
}

window.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('storage', handleStorageSync);
