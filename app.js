/* ========================================
   INDO SEJUK AC - Local App Logic
   ======================================== */

const STORAGE_KEY = 'indoSejukACData';
const LEGACY_STORAGE_KEY = 'sejukac_data';
const SCHEMA_VERSION = 2;
const FALLBACK_IMAGE = 'image/logo.png';
const OCR_CDN_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

let currentRole = null;
let currentView = null;
let currentUserTab = 'konsumen';
let uploadingOrderId = null;
let uploadProofImage = null;
let appData = null;

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

const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

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
    const joinedAt = new Date().toISOString();
    return {
        admin: [
            {
                id: 'A001',
                name: 'Admin Indo Sejuk',
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                status: 'Aktif',
                joinedAt
            }
        ],
        konsumen: [
            {
                id: 'K001',
                name: 'Budi Santoso',
                username: 'budi',
                password: 'konsumen123',
                role: 'konsumen',
                email: 'budi@indosejuk.local',
                phone: '081234567890',
                address: 'Purwokerto, Banyumas',
                district: 'Purwokerto Selatan',
                birthDate: '',
                age: '',
                lat: '',
                lng: '',
                unitImages: [],
                status: 'Aktif',
                joinedAt
            }
        ],
        teknisi: [
            {
                id: 'T001',
                name: 'Rudi Hartono',
                username: 'rudi',
                password: 'teknisi123',
                role: 'teknisi',
                email: 'rudi@indosejuk.local',
                phone: '081298765432',
                nik: '3302010101990001',
                address: 'Banyumas',
                birthDate: '1999-01-01',
                age: 0,
                specialization: 'Semua Layanan',
                experience: 4,
                ktpPhoto: '',
                selfiePhoto: '',
                lat: '',
                lng: '',
                completedJobs: 0,
                status: 'Aktif',
                joinedAt
            }
        ]
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
        imageCatalog: DEFAULT_IMAGE_CATALOG,
        appSettings: {
            appName: 'Indo Sejuk AC',
            storageMode: 'localStorage',
            ocrLibrary: 'tesseract-cdn'
        }
    });
}

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function isLocalhostEnv() {
    // Dashboard admin hanya dibuka di lingkungan lokal agar deploy statis publik tetap aman.
    return LOCALHOST_HOSTNAMES.has(window.location.hostname);
}

function canAccessAdmin(role = getCurrentSession()?.role || currentRole) {
    // Gating admin wajib lolos dua syarat: role memang admin dan host adalah localhost.
    return role === 'admin' && isLocalhostEnv();
}

function isAdminView(viewId = '') {
    return String(viewId || '').startsWith('admin');
}

function syncAdminAccessUI() {
    const adminAllowed = canAccessAdmin('admin');
    const roleAdminCard = document.getElementById('roleAdmin');
    const loginAdminTab = document.getElementById('loginRoleTab-admin');
    const roleCards = document.getElementById('roleCards');

    if (roleAdminCard) {
        roleAdminCard.style.display = adminAllowed ? '' : 'none';
        roleAdminCard.setAttribute('aria-hidden', String(!adminAllowed));
    }

    if (loginAdminTab) {
        loginAdminTab.style.display = adminAllowed ? '' : 'none';
        loginAdminTab.disabled = !adminAllowed;
        loginAdminTab.setAttribute('aria-hidden', String(!adminAllowed));
    }

    if (roleCards) {
        roleCards.classList.toggle('role-cards--admin-hidden', !adminAllowed);
    }

    if (!adminAllowed && document.getElementById('loginRole')?.value === 'admin') {
        switchLoginRole('konsumen');
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
        password: user?.password || defaults.password || `${role}123`,
        email: user?.email || '',
        phone: user?.phone || user?.telepon || '',
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
    data.appSettings = data.appSettings || { appName: 'Indo Sejuk AC', storageMode: 'localStorage' };
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
        resetToPublicLanding(showMessage ? 'Dashboard admin hanya tersedia di localhost.' : '');
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
    if (role === 'admin' && !canAccessAdmin(role)) return null;
    const user = getData().users?.[role]?.find((item) => item.username === username && item.password === password);
    if (!user) return null;
    saveSession({ role, userId: user.id, loginAt: new Date().toISOString() });
    currentRole = role;
    return user;
}

function logoutUser(showMessage = true) {
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
        resetToPublicLanding('Dashboard admin hanya tersedia di localhost.');
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
        showToast('Halaman admin hanya tersedia untuk role Admin di localhost.', 'warning');
        viewId = `${role}-home`;
    }
    if (isAdminView(viewId) && !canAccessAdmin(role)) {
        resetToPublicLanding('Dashboard admin hanya tersedia di localhost.');
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
    document.getElementById('profileKonsumenPassword').value = user.password || '';
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
    document.getElementById('profileTeknisiPassword').value = user.password || '';
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
                    <button class="btn btn-primary btn-xs" onclick="openAssignModal('${order.id}')">Assign</button>
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
}

function renderAdminKonsumenTable() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const body = document.getElementById('adminKonsumenListBody');
    // Tabel Data Master konsumen harus konsisten dengan tabel admin lain, termasuk kolom password.
    body.innerHTML = data.users.konsumen.length ? data.users.konsumen.map((user) => `
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

function renderAdminTeknisiTable() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const body = document.getElementById('adminTeknisiListBody');
    // Tabel Data Master teknisi juga menampilkan password agar formatnya konsisten dengan admin/konsumen.
    body.innerHTML = data.users.teknisi.length ? data.users.teknisi.map((user) => `
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

function renderAdminAdminTable() {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminAdminListBody');
    // Render tabel admin dipertahankan konsisten agar audit data master seragam antar-role.
    body.innerHTML = getData().users.admin.length ? getData().users.admin.map((user) => `
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

function handleLoginSubmit(event) {
    event.preventDefault();
    const role = document.getElementById('loginRole').value;
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (role === 'admin' && !canAccessAdmin(role)) {
        switchLoginRole('konsumen');
        showToast('Login admin hanya tersedia saat aplikasi dijalankan di localhost.', 'warning');
        return false;
    }
    const user = loginUser(role, username, password);
    if (!user) {
        showToast('Username atau password tidak cocok untuk role ini.', 'error');
        return false;
    }
    openAppLayout();
    renderAppShell();
    navigateTo(`${role}-home`);
    showToast(`Login berhasil. Selamat datang, ${user.name}.`, 'success');
    return false;
}

function syncAgeField(dateInputId, ageInputId) {
    const dateValue = document.getElementById(dateInputId)?.value || '';
    const age = calculateAge(dateValue);
    const ageInput = document.getElementById(ageInputId);
    if (ageInput) ageInput.value = age;
}

function collectRegisterKonsumenForm() {
    return {
        name: document.getElementById('regKonName').value.trim(),
        username: document.getElementById('regKonUsername').value.trim(),
        password: document.getElementById('regKonPassword').value,
        email: document.getElementById('regKonEmail').value.trim(),
        phone: document.getElementById('regKonPhone').value.trim(),
        district: document.getElementById('regKonKecamatan').value,
        birthDate: document.getElementById('regKonBirthDate').value,
        age: document.getElementById('regKonAge').value,
        address: document.getElementById('regKonAddress').value.trim(),
        lat: document.getElementById('regKonLat').value,
        lng: document.getElementById('regKonLng').value
    };
}

async function handleRegisterKonsumen(event) {
    event.preventDefault();
    const form = collectRegisterKonsumenForm();
    if (!form.name || !form.username || !form.password || !form.email || !form.phone || !form.address) {
        showToast('Lengkapi data wajib konsumen.', 'error');
        return false;
    }
    if (isUsernameTaken('konsumen', form.username)) {
        showToast('Username konsumen sudah digunakan.', 'error');
        return false;
    }
    const data = getData();
    const user = {
        id: nextId(data.users.konsumen, 'K'),
        role: 'konsumen',
        status: 'Aktif',
        joinedAt: new Date().toISOString(),
        unitImages: deepClone(draftUploads.regKonUnitImages),
        ...form
    };
    data.users.konsumen.push(user);
    saveData(data);
    // Hook sinkronisasi remote ini sengaja non-fatal agar registrasi lokal tetap sukses tanpa backend.
    const syncResult = await syncNewUserToRemote(user, 'konsumen').catch((error) => {
        console.warn('Sinkronisasi remote konsumen gagal dijalankan.', error);
        return {
            ok: false,
            message: 'Data lokal tersimpan, tetapi sinkronisasi remote belum berhasil dijalankan.'
        };
    });
    loginUser('konsumen', user.username, user.password);
    openAppLayout();
    renderAppShell();
    navigateTo('konsumen-home');
    document.getElementById('formRegKonsumen').reset();
    draftUploads.regKonUnitImages = [];
    document.getElementById('regKonUnitPreview').innerHTML = '';
    showToast(`Akun konsumen ${user.name} berhasil dibuat.`, 'success');
    if (syncResult?.ok === false && syncResult.message) showToast(syncResult.message, 'warning');
    return false;
}

function collectRegisterTeknisiForm() {
    return {
        name: document.getElementById('regTekName').value.trim(),
        username: document.getElementById('regTekUsername').value.trim(),
        password: document.getElementById('regTekPassword').value,
        email: document.getElementById('regTekEmail').value.trim(),
        phone: document.getElementById('regTekPhone').value.trim(),
        nik: document.getElementById('regTekNIK').value.trim(),
        birthDate: document.getElementById('regTekBirthDate').value,
        age: document.getElementById('regTekAge').value,
        specialization: document.getElementById('regTekSpecialization').value,
        experience: Number(document.getElementById('regTekExperience').value || 0),
        address: document.getElementById('regTekAddress').value.trim(),
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
    const data = getData();
    const user = {
        id: nextId(data.users.teknisi, 'T'),
        role: 'teknisi',
        status: 'Aktif',
        joinedAt: new Date().toISOString(),
        ktpPhoto: draftUploads.regTekKtpPhoto,
        selfiePhoto: draftUploads.regTekSelfiePhoto,
        completedJobs: 0,
        ...form
    };
    data.users.teknisi.push(user);
    saveData(data);
    // Hook sinkronisasi remote ini sengaja non-fatal agar registrasi lokal tetap sukses tanpa backend.
    const syncResult = await syncNewUserToRemote(user, 'teknisi').catch((error) => {
        console.warn('Sinkronisasi remote teknisi gagal dijalankan.', error);
        return {
            ok: false,
            message: 'Data lokal tersimpan, tetapi sinkronisasi remote belum berhasil dijalankan.'
        };
    });
    loginUser('teknisi', user.username, user.password);
    openAppLayout();
    renderAppShell();
    navigateTo('teknisi-home');
    document.getElementById('formRegTeknisi').reset();
    draftUploads.regTekKtpPhoto = '';
    draftUploads.regTekSelfiePhoto = '';
    draftUploads.ocrLastResult = null;
    document.getElementById('regTekIDPreview').innerHTML = '';
    document.getElementById('regTekSelfiePreview').innerHTML = '';
    showToast(`Akun teknisi ${user.name} berhasil dibuat.`, 'success');
    if (syncResult?.ok === false && syncResult.message) showToast(syncResult.message, 'warning');
    return false;
}

function handleOrderSubmit(event) {
    event.preventDefault();
    const user = getCurrentUser();
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
        phone: document.getElementById('orderPhone').value.trim(),
        konsumenId: user.id,
        konsumenName: user.name,
        teknisiId: null,
        teknisiName: null,
        proofImage: '',
        status: 'Menunggu',
        createdAt: new Date().toISOString()
    };
    data.orders.push(order);
    saveData(data);
    document.getElementById('formOrder').reset();
    navigateTo('konsumen-home');
    showToast(`Pesanan ${order.id} berhasil dibuat.`, 'success');
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
            password: document.getElementById('profileKonsumenPassword').value,
            email: document.getElementById('profileKonsumenEmail').value.trim(),
            phone: document.getElementById('profileKonsumenPhone').value.trim(),
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
            password: document.getElementById('profileTeknisiPassword').value,
            email: document.getElementById('profileTeknisiEmail').value.trim(),
            phone: document.getElementById('profileTeknisiPhone').value.trim(),
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
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    const data = getData();
    const user = getCurrentUser();
    const current = data.users.konsumen.find((item) => item.id === user.id);
    current.unitImages = Array.isArray(current.unitImages) ? current.unitImages : [];
    current.unitImages.push(dataUrl);
    saveData(data);
    renderKonsumenUnit();
    showToast('Foto unit berhasil disimpan.', 'success');
}

async function handleTekDocUpload(event, type) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    const data = getData();
    const user = data.users.teknisi.find((item) => item.id === getCurrentSession().userId);
    if (!user) return;
    if (type === 'ktp') user.ktpPhoto = dataUrl;
    if (type === 'selfie') user.selfiePhoto = dataUrl;
    saveData(data);
    renderTeknisiDocs();
    document.getElementById('teknisiDocStatus').textContent = `Dokumen ${type === 'ktp' ? 'KTP' : 'foto diri'} tersimpan otomatis.`;
}

function getShareLocation(prefix) {
    if (!navigator.geolocation) {
        showToast('Browser tidak mendukung geolocation.', 'error');
        return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        document.getElementById(`${prefix}Lat`).value = latitude;
        document.getElementById(`${prefix}Lng`).value = longitude;
        document.getElementById(`${prefix}LocationResult`).style.display = 'flex';
        document.getElementById(`${prefix}Coords`).textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        const link = document.getElementById(`${prefix}MapLink`);
        link.href = `https://www.google.com/maps?q=${latitude},${longitude}`;
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
        email: document.getElementById('editKonsumenEmail').value.trim(),
        phone: document.getElementById('editKonsumenPhone').value.trim(),
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
        email: document.getElementById('editTeknisiEmail').value.trim(),
        phone: document.getElementById('editTeknisiPhone').value.trim(),
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

function openAssignModal(orderId) {
    if (!requireAdminAccess()) return;
    const data = getData();
    document.getElementById('assignOrderId').textContent = orderId;
    const select = document.getElementById('assignTeknisi');
    select.innerHTML = '<option value="">Pilih Teknisi</option>' + data.users.teknisi.filter((item) => item.status === 'Aktif').map((user) => `<option value="${escapeHtml(user.id)}">${escapeHtml(user.name)} - ${escapeHtml(user.specialization)}</option>`).join('');
    document.getElementById('modalAssign').style.display = 'flex';
}

function assignTeknisi() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const order = data.orders.find((item) => item.id === document.getElementById('assignOrderId').textContent);
    const teknisiId = document.getElementById('assignTeknisi').value;
    const teknisi = data.users.teknisi.find((item) => item.id === teknisiId);
    if (!order || !teknisi) {
        showToast('Pilih teknisi terlebih dahulu.', 'error');
        return;
    }
    order.teknisiId = teknisi.id;
    order.teknisiName = teknisi.name;
    order.status = 'Ditugaskan';
    saveData(data);
    closeModal('modalAssign');
    renderAdminOrders();
    renderAdminHome();
    showToast(`Pesanan ${order.id} ditugaskan ke ${teknisi.name}.`, 'success');
}

function openOrderDetail(orderId) {
    if (!requireAdminAccess()) return;
    const order = getData().orders.find((item) => item.id === orderId);
    if (!order) return;
    const proof = order.proofImage ? `<div class="image-card"><img src="${escapeHtml(order.proofImage)}" alt="Bukti pekerjaan"></div>` : '<p class="text-muted">Belum ada bukti pekerjaan.</p>';
    document.getElementById('modalDetailBody').innerHTML = `
        <dl class="detail-list">
            <dt>No. Pesanan</dt><dd>${escapeHtml(order.id)}</dd>
            <dt>Layanan</dt><dd>${escapeHtml(order.serviceName)}</dd>
            <dt>Konsumen</dt><dd>${escapeHtml(order.konsumenName)}</dd>
            <dt>Teknisi</dt><dd>${escapeHtml(order.teknisiName || 'Belum ditugaskan')}</dd>
            <dt>Tanggal</dt><dd>${escapeHtml(formatDate(order.preferredDate))}</dd>
            <dt>Alamat</dt><dd>${escapeHtml(order.address)}</dd>
            <dt>Status</dt><dd>${escapeHtml(order.status)}</dd>
            <dt>Catatan</dt><dd>${escapeHtml(order.notes || '-')}</dd>
        </dl>
        <div class="detail-proof">${proof}</div>
    `;
    document.getElementById('modalDetail').style.display = 'flex';
}

function startJob(orderId) {
    const data = getData();
    const order = data.orders.find((item) => item.id === orderId);
    if (!order) return;
    order.status = 'Dikerjakan';
    saveData(data);
    renderTeknisiHome();
    renderTeknisiJobs();
}

function openUploadProof(orderId) {
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

function submitUploadProof() {
    if (!uploadingOrderId || !uploadProofImage) {
        showToast('Pilih foto bukti pekerjaan terlebih dahulu.', 'error');
        return;
    }
    const data = getData();
    const order = data.orders.find((item) => item.id === uploadingOrderId);
    if (!order) return;
    order.proofImage = uploadProofImage;
    order.status = 'Selesai';
    saveData(data);
    uploadProofImage = null;
    uploadingOrderId = null;
    navigateTo('teknisi-home');
    showToast('Bukti pekerjaan berhasil dikirim.', 'success');
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

function initDomEvents() {
    document.getElementById('btnLogout').addEventListener('click', () => logoutUser());
    document.getElementById('serviceFormImageFile').addEventListener('change', handleServiceImageUpload);
    document.getElementById('imageCatalogFormFile').addEventListener('change', handleImageCatalogUpload);
    document.getElementById('formKonsumenProfile').addEventListener('input', () => handleProfileFormInput('konsumen'));
    document.getElementById('formTeknisiProfile').addEventListener('input', () => handleProfileFormInput('teknisi'));
}

function handleStorageSync(event) {
    if (event.key !== STORAGE_KEY && event.key !== LEGACY_STORAGE_KEY) return;
    appData = loadStoredData();
    if (ensureValidSession(false)) {
        renderAppShell();
        if (currentView) renderCurrentView();
    } else {
        showLanding();
    }
}

function initApp() {
    appData = loadStoredData();
    saveData(appData);
    populateSpecializationOptions('regTekSpecialization', 'Semua Layanan');
    initDomEvents();
    if (ensureValidSession(false)) {
        resumeSession();
    } else {
        showLanding();
    }
}

window.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('storage', handleStorageSync);
