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
const APP_BUILD_VERSION = '20260329-5';
const FALLBACK_IMAGE = 'image/logo.png';
const DEFAULT_APP_TAGLINE = 'Solusi AC Sejuk & Terpercaya di Kota Anda';
const OCR_CDN_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
const SERVICE_WORKER_URL = `./sw.js?v=${APP_BUILD_VERSION}`;
const SERVICE_WORKER_UPDATE_INTERVAL_MS = 5 * 60 * 1000;
const LIVE_DATA_SYNC_INTERVAL_MS = 15 * 1000;
const DEFAULT_ADMIN_WHATSAPP = '08970788800';
const PROFILE_STATUS_PENDING = 'Menunggu Verifikasi';
const PROFILE_STATUS_ACTIVE = 'Aktif';
const PROFILE_STATUS_REJECTED = 'Ditolak';
const PROFILE_STATUS_DISABLED = 'Nonaktif';
const PROFILE_SCHEMA_DRIFT_CACHE_PREFIX = 'indoSejukProfileSchemaDrift';
const PROFILE_SCHEMA_DRIFT_CACHE_KEY = `${PROFILE_SCHEMA_DRIFT_CACHE_PREFIX}:${APP_BUILD_VERSION}`;
const PROFILE_SCHEMA_DRIFT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const ORDER_SCHEMA_DRIFT_CACHE_PREFIX = 'indoSejukOrderSchemaDrift';
const ORDER_SCHEMA_DRIFT_CACHE_KEY = `${ORDER_SCHEMA_DRIFT_CACHE_PREFIX}:${APP_BUILD_VERSION}`;
const ORDER_SCHEMA_DRIFT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DEFAULT_AUTH_EMAIL_DOMAIN = 'auth.indosejuk.local';
const SYNTHETIC_AUTH_EMAIL_SUFFIX = '.indosejuk.local';
const DEFAULT_PUBLIC_UPLOAD_BUCKET = 'app-public-uploads';
const DEFAULT_PRIVATE_DOCUMENT_BUCKET = 'app-private-documents';
const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
const IMAGE_MIME_WHITELIST = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const REMOTE_STORAGE_SYNC_FUNCTION_NAME = 'sync-storage-to-github';
const PASSWORD_MIN_LENGTH = 8;
const AUTH_BACKEND_HEALTH_CACHE_TTL_MS = 5 * 60 * 1000;
const AUTH_SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000;
const PUBLIC_AUTH_FUNCTION_NAMES = ['register-public-account', 'profile-password-login', 'request-password-reset'];
const PUBLIC_AUTH_FUNCTION_SET = new Set(PUBLIC_AUTH_FUNCTION_NAMES);
const REQUIRED_PROFILE_COLUMNS = [
    'id',
    'role',
    'username',
    'name',
    'email',
    'phone',
    'address',
    'age',
    'status',
    'created_at',
    'updated_at'
];
const OPTIONAL_PROFILE_COLUMNS = [
    'birth_date',
    'district',
    'location_text',
    'lat',
    'lng',
    'nik',
    'specialization',
    'experience',
    'verified_at',
    'verified_by',
    'completed_jobs',
    'auth_email',
    'referral',
    'ac_units',
    'ktp_photo_path',
    'ktp_photo_url',
    'selfie_photo_path',
    'selfie_photo_url'
];
const OPTIONAL_PROFILE_COLUMN_SET = new Set(OPTIONAL_PROFILE_COLUMNS);
const REQUIRED_ORDER_COLUMNS = [
    'id',
    'konsumen_id',
    'service_id',
    'price',
    'status',
    'created_at'
];
const OPTIONAL_ORDER_COLUMNS = [
    'updated_at',
    'order_number',
    'konsumen_name',
    'service_name',
    'teknisi_id',
    'teknisi_name',
    'brand',
    'ac_type',
    'pk',
    'refrigerant',
    'preferred_date',
    'address',
    'notes',
    'phone',
    'ac_unit_key',
    'admin_confirmation_text',
    'verified_at',
    'verified_by',
    'verified_by_name'
];
const OPTIONAL_ORDER_COLUMN_SET = new Set(OPTIONAL_ORDER_COLUMNS);
const REMOTE_SYNC_FUNCTION_NAME = 'sync-user-to-github';
const PASSWORD_RESET_GENERIC_SUCCESS_MESSAGE = 'Jika akun ditemukan dan memiliki email verifikasi aktif, instruksi reset sudah dikirim.';
const BANYUMAS_DISTRICT_OPTIONS = [
    'Ajibarang, Banyumas',
    'Banyumas, Banyumas',
    'Baturraden, Banyumas',
    'Cilongok, Banyumas',
    'Gumelar, Banyumas',
    'Jatilawang, Banyumas',
    'Kalibagor, Banyumas',
    'Karanglewas, Banyumas',
    'Kebasen, Banyumas',
    'Kedungbanteng, Banyumas',
    'Kembaran, Banyumas',
    'Kemranjen, Banyumas',
    'Lumbir, Banyumas',
    'Patikraja, Banyumas',
    'Pekuncen, Banyumas',
    'Purwojati, Banyumas',
    'Purwokerto Barat, Banyumas',
    'Purwokerto Selatan, Banyumas',
    'Purwokerto Timur, Banyumas',
    'Purwokerto Utara, Banyumas',
    'Rawalo, Banyumas',
    'Sokaraja, Banyumas',
    'Somagede, Banyumas',
    'Sumbang, Banyumas',
    'Sumpiuh, Banyumas',
    'Tambak, Banyumas',
    'Wangon, Banyumas'
];
const AC_SPEC_OPTIONS = {
    brand: [
        'Daikin',
        'Panasonic',
        'LG',
        'Samsung',
        'Sharp',
        'Midea',
        'Gree',
        'Haier',
        'Hitachi',
        'Toshiba',
        'Mitsubishi',
        'Changhong',
        'AUX',
        'TCL',
        'Polytron',
        'Aqua',
        'Hisense',
        'Electrolux',
        'Tidak Tahu',
        'Lainnya'
    ],
    type: [
        'Split Wall',
        'Inverter',
        'Low Watt',
        'Standard',
        'Cassette',
        'Floor Standing',
        'Ceiling Duct',
        'Portable',
        'Window',
        'VRV/VRF',
        'Tidak Tahu',
        'Lainnya'
    ],
    refrigerant: [
        'R22',
        'R32',
        'R410A',
        'R290',
        'R134a',
        'R407C',
        'R404A',
        'R600a',
        'Tidak Tahu',
        'Lainnya'
    ],
    capacity: [
        '0.5 PK',
        '0.75 PK',
        '1 PK',
        '1.5 PK',
        '2 PK',
        '2.5 PK',
        '3 PK',
        '4 PK',
        '5 PK',
        'Tidak Tahu',
        'Lainnya'
    ]
};

const AC_SPEC_FIELD_CONFIG = [
    { suffix: 'Brand', key: 'brand' },
    { suffix: 'Type', key: 'type' },
    { suffix: 'Refrigerant', key: 'refrigerant' },
    { suffix: 'Capacity', key: 'capacity' }
];

const KONSUMEN_PROFILE_FIELD_IDS = [
    'profileKonsumenName',
    'profileKonsumenUsername',
    'profileKonsumenPhone',
    'profileKonsumenBirthDate',
    'profileKonsumenReferral',
    'profileKonsumenAddress'
];

const appRuntimeConfig = (() => {
    const source = window.INDOSEJUK_RUNTIME_CONFIG || {};
    const storage = source.storage || {};
    const auth = source.auth || {};
    return {
        auth: {
            emailDomain: String(auth.emailDomain || DEFAULT_AUTH_EMAIL_DOMAIN).trim().toLowerCase() || DEFAULT_AUTH_EMAIL_DOMAIN
        },
        storage: {
            publicBucket: String(storage.publicBucket || DEFAULT_PUBLIC_UPLOAD_BUCKET).trim() || DEFAULT_PUBLIC_UPLOAD_BUCKET,
            privateBucket: String(storage.privateBucket || DEFAULT_PRIVATE_DOCUMENT_BUCKET).trim() || DEFAULT_PRIVATE_DOCUMENT_BUCKET
        }
    };
})();

let currentRole = null;
let currentView = null;
let currentUserTab = 'konsumen';
let appData = null;
let authBootstrapPromise = null;
let authSignInInProgress = false;
const missingProfileColumnsCache = new Set();
const missingOrderColumnsCache = new Set();
const syncToastCache = new Set();

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
    regKonSavedUnits: [],
    regTekKtpPhoto: '',
    regTekKtpFile: null,
    regTekSelfiePhoto: '',
    regTekSelfieFile: null,
    ocrLastResult: null
};

const runtimeState = {
    domEventsBound: false,
    navHandlersBound: false,
    installHandlersBound: false,
    connectivityHandlersBound: false,
    ocrScanInProgress: false,
    ocrLibraryPromise: null,
    deferredInstallPrompt: null,
    serviceWorkerRegistrationPromise: null,
    serviceWorkerHadController: Boolean(navigator.serviceWorker?.controller),
    serviceWorkerLifecycleBound: false,
    serviceWorkerReloadPending: false,
    serviceWorkerUpdateIntervalId: null,
    liveDataSyncBound: false,
    liveDataSyncIntervalId: null,
    liveDataSyncInFlight: false,
    liveDataSyncSignature: '',
    connectionBannerTimer: null,
    activeViewRenderToken: 0,
    signedImageUrlCache: {},
    uploadLocks: {},
    storageIssues: {},
    registrationSessionActive: false,
    changePasswordMode: 'profile',
    changePasswordSubmitting: false,
    changePasswordCodeSending: false,
    changePasswordCodeSent: false,
    passwordRecoveryActive: false,
    sensitiveEmailSubmitting: false,
    passwordConfirmation: {
        action: null,
        submitting: false
    },
    profileEditor: {
        konsumen: {
            isEditing: false,
            isDirty: false,
            submitting: false,
            snapshot: null
        }
    },
    konsumenUnitDraft: {
        active: false,
        isDirty: false,
        submitting: false,
        editingKey: '',
        initialSnapshot: null,
        previewUrl: '',
        file: null
    },
    orderAutofillToken: 0,
    authBackendHealth: {
        functions: {},
        settings: null,
        publicNoticeMessage: ''
    },
    adminEditor: {
        konsumenMode: 'edit',
        teknisiMode: 'edit',
        orderMode: 'create'
    }
};

const ROLE_LABELS = {
    admin: 'Admin',
    konsumen: 'Konsumen',
    teknisi: 'Teknisi'
};

const APP_BRAND_TITLE_BY_ROLE = {
    admin: 'Indo Sejuk AC Admin',
    konsumen: 'Indo Sejuk AC User',
    teknisi: 'Indo Sejuk AC Teknisi'
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

function createEmptyKonsumenUnitDraftState() {
    return {
        active: false,
        isDirty: false,
        submitting: false,
        editingKey: '',
        initialSnapshot: null
    };
}

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

function getPublicUploadBucket() {
    return appRuntimeConfig.storage.publicBucket;
}

function getPrivateDocumentBucket() {
    return appRuntimeConfig.storage.privateBucket;
}

function getKnownStorageBuckets() {
    return [
        getPublicUploadBucket(),
        getPrivateDocumentBucket(),
        DEFAULT_PUBLIC_UPLOAD_BUCKET,
        DEFAULT_PRIVATE_DOCUMENT_BUCKET
    ].filter(Boolean);
}

function scheduleIdleTask(callback, timeout = 1200) {
    if (typeof callback !== 'function') return;
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => callback(), { timeout });
        return;
    }
    window.setTimeout(callback, Math.min(timeout, 600));
}

function isStandaloneDisplayMode() {
    return Boolean(window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone);
}

function setBodyAppMode(mode) {
    document.body.dataset.appMode = mode;
    document.body.classList.toggle('is-standalone-app', isStandaloneDisplayMode());
}

function isModalOpen() {
    return Array.from(document.querySelectorAll('.modal-overlay')).some((modal) => window.getComputedStyle(modal).display !== 'none');
}

function safeScrollTop(options = {}) {
    if (!options.force && isModalOpen()) return;
    const prefersReducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    const behavior = options.behavior || (prefersReducedMotion ? 'auto' : 'smooth');
    window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior });
    });
}

function setConnectionBanner(message = '', { transient = false } = {}) {
    const banner = document.getElementById('connectionStatusBanner');
    if (!banner) return;
    window.clearTimeout(runtimeState.connectionBannerTimer);
    if (!message) {
        banner.hidden = true;
        banner.textContent = '';
        return;
    }
    banner.hidden = false;
    banner.textContent = message;
    if (transient) {
        runtimeState.connectionBannerTimer = window.setTimeout(() => {
            banner.hidden = true;
            banner.textContent = '';
        }, 2400);
    }
}

function syncConnectionStatusBanner({ transientOnline = false } = {}) {
    if (!navigator.onLine) {
        setConnectionBanner('Anda sedang offline. Login, auth, dan data live Supabase tetap membutuhkan koneksi internet.');
        return;
    }
    if (transientOnline) {
        setConnectionBanner('Koneksi kembali normal.', { transient: true });
        return;
    }
    setConnectionBanner('');
}

function bindConnectivityEvents() {
    if (runtimeState.connectivityHandlersBound) return;
    window.addEventListener('offline', () => syncConnectionStatusBanner());
    window.addEventListener('online', () => syncConnectionStatusBanner({ transientOnline: true }));
    runtimeState.connectivityHandlersBound = true;
}

function canRegisterServiceWorker() {
    return 'serviceWorker' in navigator && (window.location.protocol === 'https:' || isLocalhostEnv());
}

function syncInstallPromptUI() {
    const canInstall = Boolean(runtimeState.deferredInstallPrompt) && !isStandaloneDisplayMode();
    const loginPageVisible = document.getElementById('loginPage')?.style.display !== 'none';
    const headerButton = document.getElementById('btnInstallApp');
    const landingButton = document.getElementById('btnInstallAppLanding');
    const landingCard = document.getElementById('installAppCard');

    [headerButton, landingButton].forEach((button) => {
        if (!button) return;
        button.hidden = !canInstall;
        button.disabled = !canInstall;
    });

    if (landingCard) {
        landingCard.hidden = !canInstall || !loginPageVisible;
    }
}

async function promptInstallApp() {
    if (!runtimeState.deferredInstallPrompt) {
        showToast('Browser ini belum menyediakan prompt instalasi aplikasi.', 'warning');
        syncInstallPromptUI();
        return false;
    }

    const promptEvent = runtimeState.deferredInstallPrompt;
    runtimeState.deferredInstallPrompt = null;
    syncInstallPromptUI();

    try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult?.outcome !== 'accepted' && !isStandaloneDisplayMode()) {
            showToast('Pemasangan aplikasi dibatalkan. App web tetap bisa dipakai seperti biasa.', 'warning');
        }
        return choiceResult?.outcome === 'accepted';
    } catch (error) {
        console.error('Prompt instalasi gagal:', error);
        showToast('Prompt instalasi gagal dijalankan di browser ini.', 'warning');
        return false;
    }
}

function bindInstallPromptEvents() {
    if (runtimeState.installHandlersBound) return;

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        runtimeState.deferredInstallPrompt = event;
        syncInstallPromptUI();
    });

    window.addEventListener('appinstalled', () => {
        runtimeState.deferredInstallPrompt = null;
        syncInstallPromptUI();
        setBodyAppMode(document.body.dataset.appMode || 'public');
        showToast('Aplikasi Indo Sejuk AC berhasil dipasang.', 'success');
    });

    runtimeState.installHandlersBound = true;
}

function renderNavMarkup(role) {
    return getNavItems(role).map((item) => {
        const active = currentView === item.id;
        return `
            <button class="nav-item touch-target ${active ? 'active' : ''}" type="button" data-nav-target="${escapeHtml(item.id)}" aria-current="${active ? 'page' : 'false'}">
                ${item.icon}
                <span>${item.label}</span>
            </button>
        `;
    }).join('');
}

function syncActiveNavState() {
    document.querySelectorAll('#sidebarNav .nav-item, #mobileNav .nav-item').forEach((button) => {
        const active = button.dataset.navTarget === currentView;
        button.classList.toggle('active', active);
        button.setAttribute('aria-current', active ? 'page' : 'false');
    });
}

function bindShellNavEvents() {
    if (runtimeState.navHandlersBound) return;

    ['sidebarNav', 'mobileNav'].forEach((containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.addEventListener('click', (event) => {
            const target = event.target.closest('[data-nav-target]');
            if (!target) return;
            const nextView = target.dataset.navTarget;
            if (!nextView) return;
            if (nextView === currentView) {
                safeScrollTop({ force: true });
                return;
            }
            void navigateTo(nextView).catch((error) => {
                console.error('Navigasi gagal:', error);
                showToast('Navigasi halaman gagal dibuka.', 'error');
            });
        });
    });

    const roleCards = document.getElementById('roleCards');
    if (roleCards) {
        roleCards.querySelectorAll('.role-card[data-role]').forEach((card) => {
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
        });
        roleCards.addEventListener('click', (event) => {
            const card = event.target.closest('.role-card[data-role]');
            if (!card || card.hidden || card.classList.contains('is-hidden')) return;
            switchLoginRole(card.dataset.role);
            document.getElementById('loginIdentifier')?.focus();
            safeScrollTop({ force: true });
        });
        roleCards.addEventListener('keydown', (event) => {
            const card = event.target.closest('.role-card[data-role]');
            if (!card) return;
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            switchLoginRole(card.dataset.role);
            document.getElementById('loginIdentifier')?.focus();
        });
    }

    runtimeState.navHandlersBound = true;
}

function scheduleOcrWarmup() {
    if (runtimeState.ocrLibraryPromise || window.Tesseract) return;
    scheduleIdleTask(() => {
        ensureOcrLibrary().catch(() => {
            /* OCR tetap dicoba ulang saat user menekan scan */
        });
    }, 1800);
}

function queueAppRefreshForServiceWorkerUpdate() {
    if (runtimeState.serviceWorkerReloadPending) return;
    runtimeState.serviceWorkerReloadPending = true;
    showToast('Versi aplikasi terbaru ditemukan. Aplikasi diperbarui otomatis...', 'info');
    window.setTimeout(() => {
        window.location.reload();
    }, 900);
}

function bindServiceWorkerLifecycle(registration) {
    if (!registration || runtimeState.serviceWorkerLifecycleBound) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!runtimeState.serviceWorkerHadController) {
            runtimeState.serviceWorkerHadController = true;
            return;
        }
        queueAppRefreshForServiceWorkerUpdate();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && typeof registration.update === 'function') {
            registration.update().catch(() => {
                /* no-op */
            });
        }
    });

    runtimeState.serviceWorkerLifecycleBound = true;
}

function watchInstallingServiceWorker(worker) {
    if (!worker) return;
    worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
        }
    });
}

function startServiceWorkerAutoUpdate(registration) {
    if (!registration) return;
    bindServiceWorkerLifecycle(registration);

    if (registration.waiting && navigator.serviceWorker.controller) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    if (registration.installing) {
        watchInstallingServiceWorker(registration.installing);
    }

    registration.addEventListener('updatefound', () => {
        watchInstallingServiceWorker(registration.installing);
    });

    if (!runtimeState.serviceWorkerUpdateIntervalId && typeof registration.update === 'function') {
        runtimeState.serviceWorkerUpdateIntervalId = window.setInterval(() => {
            registration.update().catch(() => {
                /* no-op */
            });
        }, SERVICE_WORKER_UPDATE_INTERVAL_MS);
    }
}

function registerServiceWorkerSafe() {
    if (!canRegisterServiceWorker()) return Promise.resolve(null);
    if (runtimeState.serviceWorkerRegistrationPromise) return runtimeState.serviceWorkerRegistrationPromise;

    runtimeState.serviceWorkerRegistrationPromise = navigator.serviceWorker.register(SERVICE_WORKER_URL)
        .then((registration) => {
            startServiceWorkerAutoUpdate(registration);
            if (typeof registration.update === 'function') {
                scheduleIdleTask(() => {
                    registration.update().catch(() => {
                        /* no-op */
                    });
                }, 2600);
            }
            return registration;
        })
        .catch((error) => {
            if (!isLocalhostEnv()) {
                console.error('Registrasi service worker gagal:', error);
            }
            return null;
        });

    return runtimeState.serviceWorkerRegistrationPromise;
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

function getAuthEmailDomain() {
    return appRuntimeConfig.auth.emailDomain || DEFAULT_AUTH_EMAIL_DOMAIN;
}

function buildSyntheticAuthEmail(role, phone) {
    const normalizedRole = String(role || 'user').trim().toLowerCase() || 'user';
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) return '';
    return `${normalizedRole}.${normalizedPhone}@${getAuthEmailDomain()}`;
}

function isSyntheticAuthEmail(value) {
    const normalized = normalizeEmail(value);
    return Boolean(normalized) && (
        normalized.endsWith(SYNTHETIC_AUTH_EMAIL_SUFFIX)
        || normalized.endsWith(`@${getAuthEmailDomain()}`)
    );
}

function normalizeProfileStatus(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return PROFILE_STATUS_PENDING;
    if (normalized === PROFILE_STATUS_ACTIVE.toLowerCase()) return PROFILE_STATUS_ACTIVE;
    if (normalized === PROFILE_STATUS_PENDING.toLowerCase()) return PROFILE_STATUS_PENDING;
    if (normalized === PROFILE_STATUS_REJECTED.toLowerCase()) return PROFILE_STATUS_REJECTED;
    if (normalized === PROFILE_STATUS_DISABLED.toLowerCase()) return PROFILE_STATUS_DISABLED;
    return String(value || '').trim();
}

function isProfileApproved(profile) {
    return normalizeProfileStatus(profile?.status) === PROFILE_STATUS_ACTIVE;
}

function isProfilePending(profile) {
    return normalizeProfileStatus(profile?.status) === PROFILE_STATUS_PENDING;
}

function isProfileRejected(profile) {
    return normalizeProfileStatus(profile?.status) === PROFILE_STATUS_REJECTED;
}

function isProfileDisabled(profile) {
    return [PROFILE_STATUS_DISABLED, PROFILE_STATUS_REJECTED].includes(normalizeProfileStatus(profile?.status));
}

function getUsableVerificationEmail(profile = remoteState.profile, authUser = remoteState.user) {
    const authEmail = normalizeEmail(authUser?.email || profile?.authEmail || profile?.auth_email || '');
    if (authEmail && !isSyntheticAuthEmail(authEmail)) return authEmail;

    const publicEmail = normalizeEmail(profile?.email || authUser?.user_metadata?.contact_email || '');
    if (publicEmail && !isSyntheticAuthEmail(publicEmail)) return publicEmail;

    return '';
}

function getProfileAccessBlockedMessage(profile = {}) {
    if (isProfilePending(profile)) {
        return 'Akun Anda masih Menunggu Verifikasi admin. Silakan tunggu persetujuan sebelum memakai dashboard aktif.';
    }
    if (isProfileRejected(profile)) {
        return 'Akun Anda ditolak oleh admin. Hubungi admin atau CS Indo Sejuk AC untuk informasi lebih lanjut.';
    }
    if (normalizeProfileStatus(profile?.status) === PROFILE_STATUS_DISABLED) {
        return 'Akun Anda sedang Nonaktif. Hubungi admin atau CS Indo Sejuk AC bila membutuhkan bantuan.';
    }
    return '';
}

function getMapsLink(lat, lng) {
    if (!lat || !lng) return '';
    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;
}

function getMapsSearchLink(query) {
    const normalizedQuery = String(query || '').trim();
    if (!normalizedQuery) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalizedQuery)}`;
}

function resolveOrderCustomerMapsLink(order = {}) {
    const customerProfile = findKnownProfileById(order.konsumenId || order.konsumen_id || '');
    if (customerProfile?.lat && customerProfile?.lng) {
        return getMapsLink(customerProfile.lat, customerProfile.lng);
    }

    const locationText = String(customerProfile?.locationText || customerProfile?.location_text || '').trim();
    if (/^https?:\/\/\S+$/i.test(locationText)) {
        return locationText;
    }

    return getMapsSearchLink(order.address || customerProfile?.address || '');
}

function formatLocationSummary(record = {}) {
    const segments = [];
    if (record.locationText) segments.push(record.locationText);
    if (record.lat && record.lng) segments.push(`${record.lat}, ${record.lng}`);
    if (!segments.length && record.address) segments.push(record.address);
    return segments.join(' | ') || '-';
}

function normalizeLocationToken(value) {
    return String(value || '')
        .replace(/https?:\/\/\S+/gi, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^[,.;:/\-\s]+|[,.;:/\-\s]+$/g, '')
        .trim();
}

function cleanCityToken(value) {
    return normalizeLocationToken(value)
        .replace(/\bprovinsi\s+/i, '')
        .replace(/\b(kab\.?|kabupaten|kota)\s+/i, '')
        .replace(/\b(kec\.?|kecamatan)\s+/i, '')
        .replace(/\bindonesia\b/i, '')
        .replace(/\b\d{5,}\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function isBroadRegionToken(value) {
    return /^(aceh|sumatera(?:\s+\w+)?|kepulauan\s+\w+|riau|jambi|bengkulu|lampung|bangka belitung|banten|jawa(?:\s+\w+)?|dki jakarta|jakarta raya|yogyakarta|daerah istimewa yogyakarta|bali|nusa tenggara(?:\s+\w+)?|kalimantan(?:\s+\w+)?|sulawesi(?:\s+\w+)?|gorontalo|sulawesi tenggara|maluku(?:\s+\w+)?|papua(?:\s+\w+)?)$/i.test(cleanCityToken(value));
}

function pickCityTokenFromText(value) {
    const candidates = String(value || '')
        .split(/[\n,;|]+/)
        .map(cleanCityToken)
        .filter((token) => token && /[A-Za-z]/.test(token));

    if (!candidates.length) return '';
    const narrowed = candidates.filter((token, index) => !(index === candidates.length - 1 && candidates.length > 1 && isBroadRegionToken(token)));
    return narrowed[narrowed.length - 1] || candidates[candidates.length - 1];
}

function extractProfileCityName(profile = {}) {
    const districtCity = pickCityTokenFromText(profile.district || profile.kecamatan || '');
    if (districtCity) return districtCity;

    const addressCity = pickCityTokenFromText(profile.address || '');
    if (addressCity) return addressCity;

    return pickCityTokenFromText(profile.locationText || profile.location_text || '') || '-';
}

function getKnownProfilesByRole(role) {
    const merged = new Map();
    const sources = [
        getData().users?.[role] || [],
        remoteState.adminProfiles?.[role] || [],
        remoteState.profile?.role === role ? [remoteState.profile] : []
    ];

    sources.forEach((profiles) => {
        profiles.forEach((profile, index) => {
            if (!profile) return;
            const normalized = sanitizeProfileRecord({
                ...profile,
                role: profile.role || role
            }) || {
                ...profile,
                role
            };
            const key = String(normalized.id || profile.id || `${role}-${index}`).trim();
            if (!key) return;
            const existing = merged.get(key) || {};
            const nextProfile = sanitizeProfileRecord(mergeProfileDraft(existing, normalized, { role })) || mergeProfileDraft(existing, normalized, { role });
            merged.set(key, nextProfile);
        });
    });

    return Array.from(merged.values())
        .filter((profile) => String(profile?.role || role).trim().toLowerCase() === role)
        .sort((left, right) => String(left.username || left.name || '').localeCompare(String(right.username || right.name || ''), 'id', { sensitivity: 'base' }));
}

function getTechnicianDocumentState(profile = {}) {
    const cachedDocs = profile?.id ? getTeknisiDocsForUser(profile.id) : {};
    return {
        hasKtpPhoto: Boolean(String(
            profile.ktpPhotoUrl
            || profile.ktp_photo_url
            || profile.ktpPhotoPath
            || profile.ktp_photo_path
            || profile.ktpPhoto
            || cachedDocs?.ktpPhotoPath
            || cachedDocs?.ktpPhoto
            || ''
        ).trim()),
        hasSelfiePhoto: Boolean(String(
            profile.selfiePhotoUrl
            || profile.selfie_photo_url
            || profile.selfiePhotoPath
            || profile.selfie_photo_path
            || profile.selfiePhoto
            || cachedDocs?.selfiePhotoPath
            || cachedDocs?.selfiePhoto
            || ''
        ).trim())
    };
}

function getTechnicianVerificationState(profile = {}) {
    const documentState = getTechnicianDocumentState(profile);
    const hasNik = Boolean(String(profile.nik || '').trim());
    const approved = isProfileApproved(profile);
    return {
        approved,
        hasNik,
        hasKtpPhoto: documentState.hasKtpPhoto,
        hasSelfiePhoto: documentState.hasSelfiePhoto,
        verified: approved && hasNik && documentState.hasKtpPhoto && documentState.hasSelfiePhoto
    };
}

function isTechnicianVerified(profile = {}) {
    return getTechnicianVerificationState(profile).verified;
}

function renderTechnicianVerificationBadge(profile = {}, options = {}) {
    if (!isTechnicianVerified(profile)) return '';
    const className = options.className ? ` ${options.className}` : '';
    return `<span class="verification-badge${className}"><span class="verification-badge-dot"></span>Terverifikasi</span>`;
}

function getConsumerDirectoryProfiles() {
    return getKnownProfilesByRole('konsumen');
}

function getTechnicianDirectoryProfiles() {
    const profiles = getKnownProfilesByRole('teknisi').filter((profile) => !isProfileDisabled(profile));
    const approvedProfiles = profiles.filter((profile) => isProfileApproved(profile));
    return approvedProfiles.length ? approvedProfiles : profiles.filter((profile) => !isProfileRejected(profile));
}

function renderDirectoryList(containerId, profiles = [], options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!profiles.length) {
        container.innerHTML = `
            <div class="empty-state-box directory-empty-state">
                <p>${escapeHtml(options.emptyText || 'Belum ada data yang bisa ditampilkan.')}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = profiles.map((profile) => `
        <article class="directory-item">
            <div class="directory-item-main">
                <div class="directory-item-title-row">
                    <h4>${escapeHtml(profile.username || profile.name || '-')}</h4>
                    ${options.showVerification ? renderTechnicianVerificationBadge(profile) : ''}
                </div>
            </div>
            <span class="directory-item-city">${escapeHtml(extractProfileCityName(profile))}</span>
        </article>
    `).join('');
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
    const registeredAt = formValues.registeredAt || new Date().toISOString();
    const mapsLink = formValues.lat && formValues.lng ? getMapsLink(formValues.lat, formValues.lng) : '';
    const emailVerificationStatus = formValues.emailVerificationStatus || 'Tidak dipakai untuk aktivasi register';
    const profileStatus = formValues.profileStatus || PROFILE_STATUS_PENDING;

    const commonLines = [
        `Pendaftaran ${roleLabel} baru Indo Sejuk AC.`,
        '',
        `Role: ${roleLabel}`,
        `Nama Lengkap: ${formValues.name || '-'}`,
        `Username: ${formValues.username || '-'}`,
        `Email: ${formValues.email || '-'}`,
        `WhatsApp: ${formatDisplayPhone(formValues.phone)}`,
        `Alamat: ${formValues.address || '-'}`,
        `Lokasi teks: ${formValues.locationText || '-'}`,
        mapsLink ? `Google Maps: ${mapsLink}` : '',
        `Waktu pendaftaran: ${formatDateTime(registeredAt)}`,
        `Status email verifikasi: ${emailVerificationStatus}`,
        `Status profile: ${profileStatus}`
    ];

    const roleSpecificLines = role === 'teknisi'
        ? [
            `NIK: ${formValues.nik || '-'}`,
            `Tanggal Lahir: ${formValues.birthDate ? formatDate(formValues.birthDate) : '-'}`,
            `Usia: ${formValues.age || '-'}`,
            `Spesialisasi: ${formValues.specialization || '-'}`,
            `Pengalaman: ${hasMeaningfulProfileValue(formValues.experience) ? `${formValues.experience} tahun` : '-'}`,
            `Foto KTP: ${formValues.ktpUploaded ? 'Sudah diunggah' : 'Belum diunggah'}`,
            `Foto Diri: ${formValues.selfieUploaded ? 'Sudah diunggah' : 'Belum diunggah'}`
        ]
        : [
            `Area/Kecamatan: ${formValues.district || '-'}`,
            `Tanggal Lahir: ${formValues.birthDate ? formatDate(formValues.birthDate) : '-'}`,
            `Referal: ${formValues.referral || '-'}`,
            `Total data unit AC: ${normalizeAcUnitArray(formValues.ac_units || []).length || 0}`
        ];

    return buildMessageLines([...commonLines, ...roleSpecificLines]);
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
        `Merk AC: ${order.brand || '-'}`,
        `Jenis AC: ${order.acType || '-'}`,
        `Kapasitas AC: ${order.pk || '-'}`,
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
        'Tim kami akan menghubungi Anda kembali bila ada penyesuaian jadwal. Terima kasih.'
    ]);
}

function buildTechnicianAssignmentWhatsAppMessage(order = {}, teknisi = {}) {
    const mapsLink = resolveOrderCustomerMapsLink(order);
    return buildMessageLines([
        `Nama: ${teknisi?.name || '-'}`,
        `Konsumen: ${order.konsumenName || '-'}`,
        `Alamat: ${order.address || '-'}`,
        `Maps: ${mapsLink || '-'}`,
        `Waktu Pekerjaan: ${formatDate(order.preferredDate || order.createdAt)}`,
        `Jenis Pekerjaan: ${order.serviceName || '-'}`
    ]);
}

function extractMissingColumnName(error) {
    const message = String(error?.message || error || '');
    const patterns = [
        /column ["']?([a-z_]+)["']? of relation/i,
        /column\s+(?:(?:["']?[a-z_]+["']?\.)+["']?([a-z_]+)["']?)\s+does not exist/i,
        /column ["']?([a-z_]+)["']? does not exist/i,
        /Could not find the ['"]([a-z_]+)['"] column/i
    ];
    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match?.[1]) return match[1];
    }
    return '';
}

function persistMissingProfileColumnsCache() {
    try {
        const payload = {
            columns: [...missingProfileColumnsCache],
            updatedAt: Date.now()
        };
        localStorage.setItem(PROFILE_SCHEMA_DRIFT_CACHE_KEY, JSON.stringify(payload));
    } catch (_) {}
}

function purgeSchemaDriftCache(prefix, activeKey) {
    try {
        const staleKeys = [];
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (key && key.startsWith(prefix) && key !== activeKey) {
                staleKeys.push(key);
            }
        }
        staleKeys.forEach((key) => localStorage.removeItem(key));
    } catch (_) {}
}

function hydrateMissingProfileColumnsCache() {
    try {
        const raw = localStorage.getItem(PROFILE_SCHEMA_DRIFT_CACHE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        const updatedAt = Number(parsed?.updatedAt || 0);
        const columns = Array.isArray(parsed?.columns) ? parsed.columns : [];

        if (!updatedAt || (Date.now() - updatedAt) > PROFILE_SCHEMA_DRIFT_CACHE_TTL_MS) {
            localStorage.removeItem(PROFILE_SCHEMA_DRIFT_CACHE_KEY);
            return;
        }

        columns.forEach((column) => {
            const normalized = String(column || '').trim().toLowerCase();
            if (OPTIONAL_PROFILE_COLUMN_SET.has(normalized)) {
                missingProfileColumnsCache.add(normalized);
            }
        });
    } catch (_) {}
}

function clearMissingProfileColumns(columns = []) {
    let changed = false;
    (Array.isArray(columns) ? columns : [columns]).forEach((column) => {
        const normalized = String(column || '').trim().toLowerCase();
        if (normalized && missingProfileColumnsCache.delete(normalized)) {
            changed = true;
        }
    });
    if (changed) {
        persistMissingProfileColumnsCache();
    }
    return changed;
}

function markMissingProfileColumn(name, error = null) {
    const normalized = String(name || '').trim().toLowerCase();
    if (!normalized || !OPTIONAL_PROFILE_COLUMN_SET.has(normalized)) return false;

    const isNew = !missingProfileColumnsCache.has(normalized);
    missingProfileColumnsCache.add(normalized);
    persistMissingProfileColumnsCache();

    console.warn(`Kolom optional profiles "${normalized}" belum tersedia di schema cache Supabase. Query akan diulang tanpa kolom tersebut sampai migrasi terbaca normal.`, error || '');

    return isNew;
}

function getProfileSelectClause(extraColumns = []) {
    return [...new Set([
        ...REQUIRED_PROFILE_COLUMNS,
        ...OPTIONAL_PROFILE_COLUMNS,
        ...(Array.isArray(extraColumns) ? extraColumns : [])
    ])]
        .filter((column) => column && !missingProfileColumnsCache.has(column))
        .join(', ');
}

function filterProfileWritePayload(payload = {}) {
    const filtered = {};
    Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined) return;
        if (missingProfileColumnsCache.has(key) && OPTIONAL_PROFILE_COLUMN_SET.has(key)) return;
        filtered[key] = value;
    });
    return filtered;
}

async function withProfileColumnFallback(asyncOperation, options = {}) {
    const maxAttempts = OPTIONAL_PROFILE_COLUMNS.length + 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            const result = await asyncOperation({
                attempt,
                selectClause: getProfileSelectClause(options.extraSelectColumns),
                payload: filterProfileWritePayload(options.payload)
            });

            if (!result?.error) return result;

            const missingColumn = extractMissingColumnName(result.error);
            if (missingColumn && markMissingProfileColumn(missingColumn, result.error)) {
                continue;
            }

            throw result.error;
        } catch (error) {
            const missingColumn = extractMissingColumnName(error);
            if (missingColumn && markMissingProfileColumn(missingColumn, error)) {
                continue;
            }
            throw error;
        }
    }

    throw new Error(`Operasi profiles gagal dipulihkan setelah retry schema fallback${options.context ? ` (${options.context})` : ''}.`);
}

function persistMissingOrderColumnsCache() {
    try {
        const payload = {
            columns: [...missingOrderColumnsCache],
            updatedAt: Date.now()
        };
        localStorage.setItem(ORDER_SCHEMA_DRIFT_CACHE_KEY, JSON.stringify(payload));
    } catch (_) {}
}

function hydrateMissingOrderColumnsCache() {
    try {
        const raw = localStorage.getItem(ORDER_SCHEMA_DRIFT_CACHE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        const updatedAt = Number(parsed?.updatedAt || 0);
        const columns = Array.isArray(parsed?.columns) ? parsed.columns : [];

        if (!updatedAt || (Date.now() - updatedAt) > ORDER_SCHEMA_DRIFT_CACHE_TTL_MS) {
            localStorage.removeItem(ORDER_SCHEMA_DRIFT_CACHE_KEY);
            return;
        }

        columns.forEach((column) => {
            const normalized = String(column || '').trim().toLowerCase();
            if (OPTIONAL_ORDER_COLUMN_SET.has(normalized)) {
                missingOrderColumnsCache.add(normalized);
            }
        });
    } catch (_) {}
}

function markMissingOrderColumn(name, error = null) {
    const normalized = String(name || '').trim().toLowerCase();
    if (!normalized || !OPTIONAL_ORDER_COLUMN_SET.has(normalized)) return false;

    const isNew = !missingOrderColumnsCache.has(normalized);
    missingOrderColumnsCache.add(normalized);
    persistMissingOrderColumnsCache();

    console.warn(`Kolom optional orders "${normalized}" belum tersedia di schema cache Supabase. Operasi orders akan diulang tanpa kolom ini sampai migrasi terbaca normal.`, error || '');

    return isNew;
}

function getOrderSelectClause(extraColumns = []) {
    return [...new Set([
        ...REQUIRED_ORDER_COLUMNS,
        ...OPTIONAL_ORDER_COLUMNS,
        ...(Array.isArray(extraColumns) ? extraColumns : [])
    ])]
        .filter((column) => column && !missingOrderColumnsCache.has(column))
        .join(', ');
}

function filterOrderWritePayload(payload = {}) {
    const filtered = {};
    Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined) return;
        if (missingOrderColumnsCache.has(key) && OPTIONAL_ORDER_COLUMN_SET.has(key)) return;
        filtered[key] = value;
    });
    return filtered;
}

async function withOrderColumnFallback(asyncOperation, options = {}) {
    const maxAttempts = OPTIONAL_ORDER_COLUMNS.length + 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            const result = await asyncOperation({
                attempt,
                selectClause: getOrderSelectClause(options.extraSelectColumns),
                payload: filterOrderWritePayload(options.payload)
            });

            if (!result?.error) return result;

            const missingColumn = extractMissingColumnName(result.error);
            if (missingColumn && markMissingOrderColumn(missingColumn, result.error)) {
                continue;
            }

            throw result.error;
        } catch (error) {
            const missingColumn = extractMissingColumnName(error);
            if (missingColumn && markMissingOrderColumn(missingColumn, error)) {
                continue;
            }
            throw error;
        }
    }

    throw new Error(`Operasi orders gagal dipulihkan setelah retry schema fallback${options.context ? ` (${options.context})` : ''}.`);
}

function isEmailIdentifier(value) {
    return String(value || '').includes('@');
}

function looksLikePhoneIdentifier(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (isEmailIdentifier(raw)) return false;
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length < 8) return false;
    return /^[+\d\s().-]+$/.test(raw);
}

function normalizeLoginIdentifier(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (isEmailIdentifier(raw)) return normalizeEmail(raw);
    if (looksLikePhoneIdentifier(raw)) return normalizePhone(raw);
    return raw.toLowerCase();
}

function getLoginUiConfig(role = 'konsumen') {
    return {
        title: role === 'admin'
            ? 'Login Admin'
            : role === 'teknisi'
                ? 'Login Teknisi'
                : 'Login Konsumen',
        label: 'Email, Username, atau No. Telepon',
        placeholder: role === 'admin'
            ? 'Masukkan email, username, atau nomor telepon admin'
            : 'Masukkan email, username, atau nomor telepon Anda',
        inputMode: 'email',
        description: role === 'admin'
            ? 'Gunakan kredensial admin yang valid. Akses admin tetap diverifikasi dari profil Supabase dan hanya aktif di localhost.'
            : role === 'teknisi'
                ? 'Gunakan email, username, atau nomor telepon teknisi beserta sandi akun Anda. Role final akan diverifikasi dari profil Supabase yang sah.'
                : 'Gunakan email, username, atau nomor telepon konsumen beserta sandi akun Anda. Role final akan diverifikasi dari profil Supabase yang sah.',
        help: 'Login menerima email, username, atau nomor telepon yang terdaftar.',
        resetLabel: 'Email, Username, atau No. Telepon',
        resetPlaceholder: 'Masukkan email, username, atau nomor telepon akun',
        resetIntro: 'Masukkan email, username, atau nomor telepon akun Anda untuk meminta reset sandi dengan aman.',
        resetHelp: 'Jika akun ditemukan dan memiliki email verifikasi aktif, instruksi reset akan dikirim tanpa membocorkan status akun.'
    };
}

function syncLoginRoleCopy(role = document.getElementById('loginRole')?.value || 'konsumen') {
    const safeRole = ['konsumen', 'teknisi', 'admin'].includes(role) ? role : 'konsumen';
    const config = getLoginUiConfig(safeRole);
    const title = document.getElementById('loginFormTitle');
    const label = document.getElementById('loginIdentifierLabel');
    const input = document.getElementById('loginIdentifier');
    const help = document.getElementById('loginIdentifierHelp');
    const description = document.getElementById('loginRoleDescription');

    if (title) title.textContent = config.title;
    if (label) {
        label.innerHTML = `${escapeHtml(config.label)} <span class="required">*</span>`;
    }
    if (input) {
        input.placeholder = config.placeholder;
        input.setAttribute('inputmode', config.inputMode);
        input.setAttribute('autocapitalize', 'none');
        input.setAttribute('spellcheck', 'false');
    }
    if (help) help.textContent = config.help;
    if (description) description.textContent = config.description;
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

async function syncNewUserToRemote(profile, options = {}) {
    if (!canUseSupabase()) {
        return {
            ok: false,
            skipped: true,
            message: 'Supabase client belum siap untuk memanggil backend sinkronisasi.'
        };
    }

    if (!profile?.id) {
        return {
            ok: false,
            skipped: true,
            message: 'Profile belum tersedia sehingga sinkron snapshot GitHub dilewati.'
        };
    }

    try {
        const data = await invokeEdgeFunction(REMOTE_SYNC_FUNCTION_NAME, {
            profileId: profile.id,
            role: profile.role,
            reason: options.reason || 'profile-upsert',
            requestedAt: new Date().toISOString(),
            requestedBy: remoteState.user?.id || profile.id
        }, {
            fallbackMessage: 'Pemanggilan backend sinkronisasi profil gagal.'
        });

        return {
            ok: true,
            skipped: false,
            data,
            message: data?.message || 'Sinkron snapshot GitHub dipicu lewat backend aman.'
        };
    } catch (error) {
        const message = String(error?.message || error || '');
        const looksMissingOrDisabled = /404|not found|edge function|failed to send a request|functionshttperror|functionsfetcherror/i.test(message);

        if (looksMissingOrDisabled) {
            console.warn('Sinkron snapshot GitHub belum dikonfigurasi di backend aman. Supabase tetap menjadi source of truth.', error);
            if (!syncToastCache.has('missing-remote-sync')) {
                syncToastCache.add('missing-remote-sync');
                showToast('Sinkron snapshot GitHub belum dikonfigurasi di backend. App utama tetap jalan langsung dari Supabase.', 'warning');
            }
            return {
                ok: false,
                skipped: true,
                message: 'Edge Function sync-user-to-github belum tersedia atau belum dikonfigurasi.'
            };
        }

        console.warn('Sinkron snapshot GitHub gagal dipanggil. Aplikasi utama tetap memakai Supabase langsung.', error);
        if (options.showErrorToast && !syncToastCache.has('remote-sync-error')) {
            syncToastCache.add('remote-sync-error');
            showToast('Sinkron snapshot GitHub gagal, tetapi data utama tetap tersimpan di Supabase.', 'warning');
        }
        return {
            ok: false,
            skipped: true,
            message: 'Pemanggilan backend sinkronisasi gagal. Supabase tetap menjadi source of truth.'
        };
    }
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

function dataUrlToBlob(dataUrl) {
    const [header, content = ''] = String(dataUrl || '').split(',');
    const mimeMatch = header.match(/data:([^;]+);base64/i);
    const mimeType = mimeMatch?.[1] || 'application/octet-stream';
    const binary = atob(content);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: mimeType });
}

function inferFileExtension(fileName = '', mimeType = '') {
    const normalizedName = String(fileName || '').trim();
    const extensionMatch = normalizedName.match(/\.([a-z0-9]+)$/i);
    if (extensionMatch?.[1]) return extensionMatch[1].toLowerCase();

    const mimeMap = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/heic': 'heic',
        'image/heif': 'heif'
    };
    return mimeMap[String(mimeType || '').toLowerCase()] || 'jpg';
}

function sanitizeFilename(fileName = '') {
    const normalized = String(fileName || '').trim().toLowerCase();
    const extension = inferFileExtension(normalized);
    const withoutExtension = normalized.replace(/\.[a-z0-9]+$/i, '');
    const safeBase = withoutExtension
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[-\s]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'upload';
    return `${safeBase}.${extension}`;
}

function slugifyPathSegment(value = '') {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || 'item';
}

function normalizeTextArray(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || '').trim())
            .filter(Boolean);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            return normalizeTextArray(parsed);
        } catch (_) {
            return [trimmed];
        }
    }
    return [];
}

function normalizeWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function tryParseJsonArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
        return [];
    }
}

function findCanonicalAcOption(fieldKey, value) {
    const normalized = normalizeWhitespace(value).toLowerCase();
    if (!normalized) return '';
    const options = Array.isArray(AC_SPEC_OPTIONS[fieldKey]) ? AC_SPEC_OPTIONS[fieldKey] : [];
    const match = options.find((option) => normalizeWhitespace(option).toLowerCase() === normalized);
    return match || '';
}

function normalizeAcCapacityValue(value) {
    const canonical = findCanonicalAcOption('capacity', value);
    if (canonical && canonical !== 'Lainnya') return canonical;

    const normalized = normalizeWhitespace(value).replace(',', '.');
    if (!normalized) return '';
    if (/^tidak tahu$/i.test(normalized)) return 'Tidak Tahu';

    const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(pk)?$/i);
    if (!match) return normalized;
    const numeric = Number(match[1]);
    if (!Number.isFinite(numeric)) return normalized;
    const formatted = Number.isInteger(numeric) ? String(numeric) : String(numeric).replace(/\.0+$/, '');
    return `${formatted} PK`;
}

function normalizeAcSpecValue(fieldKey, value) {
    const canonical = findCanonicalAcOption(fieldKey, value);
    if (canonical && canonical !== 'Lainnya') return canonical;

    const normalized = normalizeWhitespace(value);
    if (!normalized || /^lainnya$/i.test(normalized)) return '';

    if (fieldKey === 'refrigerant') {
        return normalized.toUpperCase();
    }
    if (fieldKey === 'capacity') {
        return normalizeAcCapacityValue(normalized);
    }
    return normalized;
}

function resolveAcSpecValue(fieldKey, selectedValue, manualValue = '') {
    const selected = normalizeWhitespace(selectedValue);
    if (/^lainnya$/i.test(selected)) {
        return normalizeAcSpecValue(fieldKey, manualValue);
    }
    return normalizeAcSpecValue(fieldKey, selected);
}

function buildAcUnitKey(seed = '') {
    const randomPart = Math.random().toString(36).slice(2, 8);
    const base = slugifyPathSegment(seed || `unit-${Date.now()}`);
    return `${base}-${randomPart}`;
}

function normalizeAcUnitRecord(unit, options = {}) {
    if (!unit || typeof unit !== 'object') return null;
    const createdAt = unit.created_at || unit.createdAt || options.createdAt || '';
    const normalized = {
        key: normalizeWhitespace(unit.key || unit.id) || buildAcUnitKey(unit.brand || unit.type || options.seed || 'ac-unit'),
        brand: normalizeAcSpecValue('brand', unit.brand),
        type: normalizeAcSpecValue('type', unit.type || unit.ac_type || unit.acType || unit.jenis_ac),
        refrigerant: normalizeAcSpecValue('refrigerant', unit.refrigerant),
        capacity: normalizeAcSpecValue('capacity', unit.capacity || unit.pk || unit.ac_capacity || unit.acCapacity),
        createdAt,
        updatedAt: unit.updated_at || unit.updatedAt || createdAt || '',
        source: normalizeWhitespace(unit.source || options.source || 'profile'),
        notes: normalizeWhitespace(unit.notes || ''),
        legacyIndex: Number.isInteger(options.legacyIndex) ? options.legacyIndex : null
    };

    return normalized;
}

function normalizeAcUnitArray(value, options = {}) {
    const directArray = Array.isArray(value) ? value : tryParseJsonArray(value);
    return directArray
        .map((unit, index) => normalizeAcUnitRecord(unit, {
            ...options,
            legacyIndex: Number.isInteger(unit?.legacyIndex) ? unit.legacyIndex : index
        }))
        .filter(Boolean);
}

function formatAcUnitLabel(unit = {}, index = 0) {
    const parts = [unit.brand, unit.type, unit.capacity].filter(Boolean);
    return parts.length ? parts.join(' • ') : `Unit AC ${index + 1}`;
}

function buildAcUnitSummary(unit = {}) {
    return [
        unit.brand,
        unit.type,
        unit.refrigerant,
        unit.capacity
    ].filter(Boolean);
}

function hasAcUnitStructuredData(unit = {}) {
    return Boolean(
        unit.brand
        || unit.type
        || unit.refrigerant
        || unit.capacity
    );
}

function findMatchingPersistedAcUnit(units = [], targetUnit = {}, fallbackIndex = -1) {
    if (!Array.isArray(units) || !targetUnit) return null;
    if (targetUnit.key) {
        const byKey = units.find((unit) => unit?.key === targetUnit.key);
        if (byKey) return byKey;
    }
    if (Number.isInteger(fallbackIndex) && fallbackIndex >= 0) {
        return units[fallbackIndex] || null;
    }
    return null;
}

function getProfileAcUnits(profile) {
    return normalizeAcUnitArray(profile?.ac_units || profile?.acUnits);
}

function createFileLikeFromDraft(draft, fallbackName = 'upload.jpg') {
    if (!draft?.dataUrl) return null;
    const blob = dataUrlToBlob(draft.dataUrl);
    const fileName = sanitizeFilename(draft.name || fallbackName);
    try {
        return new File([blob], fileName, {
            type: draft.type || blob.type || 'image/jpeg',
            lastModified: Number(draft.lastModified || Date.now())
        });
    } catch (_) {
        blob.name = fileName;
        blob.lastModified = Number(draft.lastModified || Date.now());
        return blob;
    }
}

async function invokeRemoteAssetSync(functionName, payload = {}, options = {}) {
    if (!canUseSupabase()) {
        return {
            ok: false,
            skipped: true,
            message: 'Supabase client belum siap untuk memanggil backend sinkronisasi asset.'
        };
    }

    try {
        const data = await invokeEdgeFunction(functionName, {
            ...payload,
            requestedAt: new Date().toISOString(),
            requestedBy: remoteState.user?.id || payload.userId || payload.profileId || null
        }, {
            fallbackMessage: `Pemanggilan backend ${functionName} gagal.`
        });
        return {
            ok: true,
            skipped: false,
            data,
            message: data?.message || 'Sinkron backend asset berhasil dipicu.'
        };
    } catch (error) {
        const message = String(error?.message || error || '');
        const looksMissingOrDisabled = /404|not found|edge function|failed to send a request|functionshttperror|functionsfetcherror/i.test(message);

        if (looksMissingOrDisabled) {
            console.warn(`Edge Function ${functionName} belum tersedia atau belum dikonfigurasi. Supabase tetap menjadi source of truth.`, error);
            if (options.toastCacheKey && !syncToastCache.has(options.toastCacheKey)) {
                syncToastCache.add(options.toastCacheKey);
                showToast(options.missingToastMessage || 'Sinkron backend belum aktif. Data utama tetap tersimpan di Supabase.', 'warning');
            }
            return {
                ok: false,
                skipped: true,
                message: `${functionName} belum tersedia atau belum dikonfigurasi.`
            };
        }

        console.warn(`Sinkron backend ${functionName} gagal dipanggil.`, error);
        if (options.showErrorToast && options.errorToastMessage && !syncToastCache.has(`${options.toastCacheKey || functionName}-error`)) {
            syncToastCache.add(`${options.toastCacheKey || functionName}-error`);
            showToast(options.errorToastMessage, 'warning');
        }
        return {
            ok: false,
            skipped: true,
            message: 'Pemanggilan backend sinkronisasi asset gagal.'
        };
    }
}

async function syncUploadedAssetToRemote(payload = {}, options = {}) {
    return invokeRemoteAssetSync(REMOTE_STORAGE_SYNC_FUNCTION_NAME, {
        action: 'upload',
        ...payload
    }, {
        toastCacheKey: 'missing-storage-sync',
        missingToastMessage: 'Sinkron GitHub untuk upload asset belum dikonfigurasi. Upload Supabase tetap berhasil.',
        showErrorToast: Boolean(options.showErrorToast),
        errorToastMessage: 'Sinkron GitHub untuk upload asset gagal, tetapi file utama tetap tersimpan di Supabase.'
    });
}

async function syncDeletionToRemote(payload = {}, options = {}) {
    return invokeRemoteAssetSync(REMOTE_STORAGE_SYNC_FUNCTION_NAME, {
        action: 'delete',
        ...payload
    }, {
        toastCacheKey: 'missing-storage-sync',
        missingToastMessage: 'Sinkron GitHub untuk hapus asset belum dikonfigurasi. Penghapusan Supabase tetap dijalankan.',
        showErrorToast: Boolean(options.showErrorToast),
        errorToastMessage: 'Sinkron GitHub untuk hapus asset gagal, tetapi data utama di Supabase tetap dibersihkan.'
    });
}

function validateImageFile(file, options = {}) {
    const label = options.label || 'File gambar';
    if (!file) throw new Error(`${label} belum dipilih.`);
    const mimeType = String(file.type || '').toLowerCase();
    if (!IMAGE_MIME_WHITELIST.has(mimeType)) {
        throw new Error(`${label} harus berupa JPG, PNG, WEBP, HEIC, atau HEIF.`);
    }
    if (Number(file.size || 0) > MAX_IMAGE_UPLOAD_BYTES) {
        throw new Error(`${label} melebihi batas 8 MB.`);
    }
    return true;
}

function getStorageTargetConfig(target) {
    const targetMap = {
        'teknisi-ktp': { bucket: getPrivateDocumentBucket(), isPrivate: true, folder: 'ktp' },
        'teknisi-selfie': { bucket: getPrivateDocumentBucket(), isPrivate: true, folder: 'selfie' }
    };
    return targetMap[target] || null;
}

function buildStoragePath(options = {}) {
    const userId = slugifyPathSegment(options.userId || remoteState.user?.id || '');
    if (!userId) throw new Error('User auth belum tersedia untuk upload storage.');
    const fileName = sanitizeFilename(options.originalName || 'upload.jpg');
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const target = options.target;

    if (target === 'teknisi-ktp') {
        return `users/${userId}/ktp/${uniqueSuffix}-${fileName}`;
    }
    if (target === 'teknisi-selfie') {
        return `users/${userId}/selfie/${uniqueSuffix}-${fileName}`;
    }

    throw new Error('Target upload storage tidak dikenal.');
}

function getStorageObjectPathFromUrl(url, bucketHint = '') {
    const raw = String(url || '').trim();
    if (!raw) return '';
    try {
        const parsed = new URL(raw);
        const marker = '/storage/v1/object/';
        const markerIndex = parsed.pathname.indexOf(marker);
        if (markerIndex === -1) return '';
        const remainder = parsed.pathname.slice(markerIndex + marker.length).split('/').filter(Boolean);
        if (!remainder.length) return '';
        if (remainder[0] === 'public' || remainder[0] === 'authenticated') {
            remainder.shift();
        } else if (remainder[0] === 'sign') {
            remainder.shift();
            if (remainder[0] === 'public' || remainder[0] === 'authenticated') remainder.shift();
        }
        if (bucketHint) {
            if (remainder[0] === bucketHint) remainder.shift();
        } else if (getKnownStorageBuckets().includes(remainder[0])) {
            remainder.shift();
        }
        return decodeURIComponent(remainder.join('/'));
    } catch (_) {
        return '';
    }
}

function clearInputFileValue(inputId) {
    const input = document.getElementById(inputId);
    if (input) input.value = '';
}

function setElementText(elementId, message = '') {
    const node = document.getElementById(elementId);
    if (node) node.textContent = message;
}

function getSignedUrlCacheKey(bucket, path) {
    return `${bucket}:${path}`;
}

function isBucketNotFoundError(error) {
    const normalized = String(error?.message || error || '').toLowerCase();
    return normalized.includes('bucket not found') || normalized.includes('the resource was not found');
}

function buildStorageConfigError(bucket, fallback = '') {
    const safeBucket = String(bucket || '').trim() || 'bucket-storage';
    return new Error(fallback || `Bucket storage "${safeBucket}" belum tersedia atau tidak cocok dengan konfigurasi aplikasi.`);
}

function setStorageIssue(bucket, message = '') {
    if (!bucket) return;
    if (message) {
        runtimeState.storageIssues[bucket] = message;
        return;
    }
    delete runtimeState.storageIssues[bucket];
}

function getStorageIssue(bucket) {
    return bucket ? runtimeState.storageIssues[bucket] || '' : '';
}

function syncStorageStatusMessage(elementId, bucket, fallbackMessage) {
    setElementText(elementId, getStorageIssue(bucket) || fallbackMessage);
}

async function resolveStorageImageUrl(bucket, path, options = {}) {
    const normalizedPath = String(path || '').trim();
    if (!bucket || !normalizedPath || !canUseSupabase()) return '';

    const cacheKey = getSignedUrlCacheKey(bucket, normalizedPath);
    if (!options.forceRefresh && runtimeState.signedImageUrlCache[cacheKey]) {
        return runtimeState.signedImageUrlCache[cacheKey];
    }

    if (bucket === getPublicUploadBucket()) {
        const { data } = supabaseClient.storage.from(bucket).getPublicUrl(normalizedPath);
        const publicUrl = data?.publicUrl || '';
        if (publicUrl) runtimeState.signedImageUrlCache[cacheKey] = publicUrl;
        return publicUrl;
    }

    const { data, error } = await supabaseClient.storage.from(bucket).createSignedUrl(normalizedPath, 60 * 60);
    if (error) {
        if (isBucketNotFoundError(error)) {
            setStorageIssue(bucket, buildStorageConfigError(bucket).message);
            return '';
        }
        console.warn('Gagal membuat signed URL storage:', error);
        return '';
    }

    setStorageIssue(bucket, '');
    const signedUrl = data?.signedUrl || '';
    if (signedUrl) runtimeState.signedImageUrlCache[cacheKey] = signedUrl;
    return signedUrl;
}

async function uploadImageToSupabaseStorage(options = {}) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap untuk upload storage.');

    const targetConfig = getStorageTargetConfig(options.target);
    if (!targetConfig) throw new Error('Target upload belum didukung.');
    if (!options.userId && !remoteState.user?.id) throw new Error('Session login dibutuhkan untuk upload gambar ke storage.');

    validateImageFile(options.file, { label: options.label || 'Gambar' });
    const path = buildStoragePath({
        target: options.target,
        userId: options.userId || remoteState.user?.id,
        originalName: options.file?.name || options.fileName,
        orderId: options.orderId
    });

    const { data, error } = await supabaseClient.storage
        .from(targetConfig.bucket)
        .upload(path, options.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: options.file?.type || 'image/jpeg'
        });

    if (error) {
        if (isBucketNotFoundError(error)) {
            setStorageIssue(targetConfig.bucket, buildStorageConfigError(targetConfig.bucket).message);
            throw buildStorageConfigError(targetConfig.bucket);
        }
        throw error;
    }

    const finalPath = data?.path || path;
    setStorageIssue(targetConfig.bucket, '');
    const resolvedUrl = await resolveStorageImageUrl(targetConfig.bucket, finalPath, { forceRefresh: true });
    return {
        bucket: targetConfig.bucket,
        path: finalPath,
        url: resolvedUrl
    };
}

async function deleteImageFromSupabaseStorage(options = {}) {
    if (!canUseSupabase()) {
        return {
            ok: false,
            skipped: true,
            message: 'Supabase client belum siap untuk menghapus file storage.'
        };
    }

    const bucket = String(options.bucket || '').trim();
    const path = String(options.path || getStorageObjectPathFromUrl(options.url, bucket)).trim();
    if (!bucket || !path) {
        return {
            ok: true,
            skipped: true,
            message: 'Path storage kosong, hanya referensi database/UI yang akan dibersihkan.'
        };
    }

    const { error } = await supabaseClient.storage.from(bucket).remove([path]);
    if (error) {
        if (isBucketNotFoundError(error)) {
            setStorageIssue(bucket, buildStorageConfigError(bucket).message);
            return {
                ok: false,
                skipped: true,
                message: buildStorageConfigError(bucket).message
            };
        }
        const message = String(error?.message || error || '').toLowerCase();
        if (message.includes('not found') || message.includes('no object found')) {
            return {
                ok: true,
                skipped: true,
                message: 'File storage sudah tidak ada; referensi tetap dibersihkan.'
            };
        }
        throw error;
    }

    setStorageIssue(bucket, '');
    delete runtimeState.signedImageUrlCache[getSignedUrlCacheKey(bucket, path)];
    return {
        ok: true,
        skipped: false,
        message: 'File storage berhasil dihapus.'
    };
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
        image: hasMeaningfulProfileValue(service?.image)
            ? resolveImageSource(service.image)
            : (service?.imageCatalogId ? '' : resolveImageSource(fallback.image)),
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
        authEmail: normalizeEmail(user?.authEmail || user?.auth_email || user?.email || defaults.email || ''),
        phone: normalizePhone(user?.phone || user?.telepon || defaults.phone || ''),
        address: user?.address || user?.alamat || '',
        birthDate: user?.birthDate || user?.tanggalLahir || '',
        age: calculateAge(user?.birthDate || user?.tanggalLahir || '') || user?.age || '',
        status: normalizeProfileStatus(user?.status || PROFILE_STATUS_ACTIVE),
        joinedAt: user?.joinedAt || user?.joined || defaults.joinedAt || new Date().toISOString()
    };

    if (role === 'konsumen') {
        normalized.district = user?.district || user?.kecamatan || '';
        normalized.locationText = user?.locationText || user?.location_text || '';
        normalized.lat = user?.lat || '';
        normalized.lng = user?.lng || '';
    }

    if (role === 'teknisi') {
        normalized.nik = user?.nik || user?.NIK || '';
        normalized.specialization = user?.specialization || user?.spesialisasi || 'Semua Layanan';
        normalized.experience = Number(user?.experience ?? user?.pengalaman ?? 0);
        normalized.ktpPhoto = user?.ktpPhoto || '';
        normalized.selfiePhoto = user?.selfiePhoto || '';
        normalized.district = user?.district || user?.kecamatan || '';
        normalized.locationText = user?.locationText || user?.location_text || '';
        normalized.ktpPhotoUrl = user?.ktpPhotoUrl || user?.ktp_photo_url || '';
        normalized.ktpPhotoPath = user?.ktpPhotoPath || user?.ktp_photo_path || '';
        normalized.selfiePhotoUrl = user?.selfiePhotoUrl || user?.selfie_photo_url || '';
        normalized.selfiePhotoPath = user?.selfiePhotoPath || user?.selfie_photo_path || '';
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
    data.uiCache = data.uiCache || { teknisiDocsByUser: {} };
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

function isUsernameTaken(role, username, excludeUserId = '') {
    const normalized = String(username || '').trim().toLowerCase();
    if (!normalized) return false;
    return getData().users[role].some((user) => user.id !== excludeUserId && String(user.username || '').trim().toLowerCase() === normalized);
}

function getNavItems(role) {
    const sharedHome = { id: `${role}-home`, label: 'Dashboard', icon: navIcon('home') };
    if (role === 'konsumen') {
        return [
            sharedHome,
            { id: 'konsumen-order', label: 'Pesan Layanan', icon: navIcon('plus') },
            { id: 'konsumen-history', label: 'Riwayat', icon: navIcon('clock') },
            { id: 'konsumen-profile', label: 'Profil', icon: navIcon('user') },
            { id: 'konsumen-unit', label: 'Data Unit', icon: navIcon('grid') }
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
        { id: 'admin-history', label: 'Riwayat', icon: navIcon('clock') },
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
    setBodyAppMode('public');
    syncAdminAccessUI();
    switchLoginRole(document.getElementById('loginRole')?.value || 'konsumen');
    syncAppBranding(null);
    syncInstallPromptUI();
    syncConnectionStatusBanner();
    renderDefaultAccountList();
    renderLandingSessionNotice();
}

function openAppLayout() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('appHeader').style.display = 'block';
    document.getElementById('appMain').style.display = 'flex';
    document.getElementById('appFooter').style.display = 'block';
    setBodyAppMode('app');
    syncInstallPromptUI();
    syncConnectionStatusBanner();
}

function showRegisterPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'flex';
    setBodyAppMode('register');
    syncInstallPromptUI();
    syncConnectionStatusBanner();
    safeScrollTop({ force: true, behavior: 'auto' });
}

function showLoginPage() {
    showLanding();
}

function switchRegisterTab(tab, element) {
    document.querySelectorAll('.reg-tab').forEach((button) => button.classList.remove('active'));
    if (element) element.classList.add('active');
    document.getElementById('regFormKonsumen').style.display = tab === 'konsumen' ? 'block' : 'none';
    document.getElementById('regFormTeknisi').style.display = tab === 'teknisi' ? 'block' : 'none';
    if (tab === 'teknisi') scheduleOcrWarmup();
}


function renderDefaultAccountList() {
    const container = document.getElementById('defaultAccountList');
    if (!container) return;
    // Landing page publik tidak boleh membocorkan kredensial default role apa pun.
    container.innerHTML = '';
    container.style.display = 'none';
}


function goToLanding() {
    showLanding();
}


function getServices(includeInactive = false) {
    const services = getData().services || [];
    return includeInactive ? services : services.filter((service) => service.active !== false);
}

function getImageCatalogItem(imageCatalogId) {
    return getData().imageCatalog.find((item) => item.id === imageCatalogId) || null;
}

function serviceImage(service) {
    return getImageCatalogItem(service?.imageCatalogId)?.src || service?.image || FALLBACK_IMAGE;
}

function summarizeImageSource(src) {
    if (!src) return '-';
    return src.startsWith('data:image/') ? 'Upload localStorage' : src;
}

function renderStatusBadge(status) {
    const className = slugify(status || 'menunggu');
    return `<span class="status-badge status-${className}">${escapeHtml(status || 'Menunggu')}</span>`;
}

function populateSpecializationOptions(selectId, selected = '') {
    const select = document.getElementById(selectId);
    if (!select) return;
    const options = ['Semua Layanan', ...getServices(true).map((service) => service.name)];
    select.innerHTML = options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('');
    select.value = selected || 'Semua Layanan';
}

function populateAcSpecOptions(selectId, fieldKey, selected = '', options = {}) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const placeholder = options.placeholder || {
        brand: 'Pilih Merk AC',
        type: 'Pilih Jenis AC',
        refrigerant: 'Pilih Refrigerant',
        capacity: 'Pilih Kapasitas AC'
    }[fieldKey] || 'Pilih Opsi';

    const values = Array.isArray(AC_SPEC_OPTIONS[fieldKey]) ? AC_SPEC_OPTIONS[fieldKey] : [];
    select.innerHTML = [`<option value="">${escapeHtml(placeholder)}</option>`]
        .concat(values.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`))
        .join('');

    setAcSpecFieldValue(selectId, fieldKey, selected);
}

function handleAcOptionSelectChange(selectId, wrapperId, options = {}) {
    const select = document.getElementById(selectId);
    const wrapper = document.getElementById(wrapperId);
    const manualInput = document.getElementById(options.manualInputId || `${selectId}Other`);
    const isOther = String(select?.value || '').trim() === 'Lainnya';

    if (wrapper) wrapper.style.display = isOther ? 'block' : 'none';
    if (manualInput && !isOther && options.clearManual !== false) {
        manualInput.value = '';
    }
}

function setAcSpecFieldValue(selectId, fieldKey, value) {
    const select = document.getElementById(selectId);
    const wrapperId = `${selectId}OtherWrap`;
    const manualInput = document.getElementById(`${selectId}Other`);
    if (!select) return;

    const canonical = normalizeAcSpecValue(fieldKey, value);
    const matchedOption = findCanonicalAcOption(fieldKey, canonical);
    if (matchedOption && matchedOption !== 'Lainnya') {
        select.value = matchedOption;
        if (manualInput) manualInput.value = '';
        handleAcOptionSelectChange(selectId, wrapperId);
        return;
    }

    if (canonical) {
        select.value = 'Lainnya';
        if (manualInput) manualInput.value = canonical;
        handleAcOptionSelectChange(selectId, wrapperId, { clearManual: false });
        return;
    }

    select.value = '';
    if (manualInput) manualInput.value = '';
    handleAcOptionSelectChange(selectId, wrapperId);
}

function getAcSpecFieldValue(selectId, fieldKey) {
    const select = document.getElementById(selectId);
    const manualInput = document.getElementById(`${selectId}Other`);
    return resolveAcSpecValue(fieldKey, select?.value || '', manualInput?.value || '');
}

function populateAcSpecFormFields(prefix, unit = {}) {
    AC_SPEC_FIELD_CONFIG.forEach(({ suffix, key }) => {
        setAcSpecFieldValue(`${prefix}${suffix}`, key, unit[key] || '');
    });
}

function resetAcSpecFormFields(prefix) {
    AC_SPEC_FIELD_CONFIG.forEach(({ suffix }) => {
        const selectId = `${prefix}${suffix}`;
        const select = document.getElementById(selectId);
        if (select) select.value = '';
        const input = document.getElementById(`${selectId}Other`);
        if (input) input.value = '';
        handleAcOptionSelectChange(selectId, `${selectId}OtherWrap`);
    });
}

function collectAcSpecFormValues(prefix) {
    return AC_SPEC_FIELD_CONFIG.reduce((accumulator, { suffix, key }) => {
        accumulator[key] = getAcSpecFieldValue(`${prefix}${suffix}`, key);
        return accumulator;
    }, {});
}

function populateConsumerDistrictOptions() {
    const select = document.getElementById('regKonKecamatan');
    if (!select) return;
    const banyumasGroup = select.querySelector('optgroup[label="Banyumas"]');
    if (!banyumasGroup) return;
    banyumasGroup.innerHTML = BANYUMAS_DISTRICT_OPTIONS
        .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
        .join('');
}

function renderAdminServicesTable() {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminServicesListBody');
    body.innerHTML = getServices(true).length ? getServices(true).map((service) => `
        <tr>
            ${tableCell('Nama Layanan', escapeHtml(service.name))}
            ${tableCell('Harga Dasar', formatRupiah(service.price))}
            ${tableCell('Status', renderStatusBadge(service.active ? 'Aktif' : 'Nonaktif'))}
            ${tableCell('Gambar', `<img src="${escapeHtml(serviceImage(service))}" alt="${escapeHtml(service.name)}" class="table-thumb">`)}
            ${tableCell('Aksi', `
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openEditServiceModal('${service.id}')">Edit</button>
                    <button class="btn btn-danger btn-xs" onclick="confirmDeleteService('${service.id}')">Hapus</button>
                </div>
            `)}
        </tr>
    `).join('') : '<tr><td colspan="5" class="empty-state">Belum ada layanan</td></tr>';
}

function renderAdminImageCatalogTable() {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminImageCatalogBody');
    // Sumber gambar upload disingkat agar tabel admin tetap ringkas walau file disimpan sebagai data URL.
    body.innerHTML = getData().imageCatalog.length ? getData().imageCatalog.map((item) => `
        <tr>
            ${tableCell('Preview', `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || item.name)}" class="table-thumb">`)}
            ${tableCell('Nama', escapeHtml(item.name))}
            ${tableCell('Kategori', escapeHtml(item.category))}
            ${tableCell('Sumber', escapeHtml(summarizeImageSource(item.src)))}
            ${tableCell('Status', renderStatusBadge(item.isActive ? 'Aktif' : 'Nonaktif'))}
            ${tableCell('Aksi', `
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openImageCatalogPreview('${item.id}')">Lihat</button>
                    <button class="btn btn-outline btn-xs" onclick="openEditImageCatalogModal('${item.id}')">Edit</button>
                    <button class="btn btn-outline btn-xs" onclick="toggleImageCatalogItem('${item.id}')">${item.isActive ? 'Nonaktifkan' : 'Aktifkan'}</button>
                </div>
            `)}
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

function resetPasswordConfirmModal() {
    runtimeState.passwordConfirmation.submitting = false;
    runtimeState.passwordConfirmation.action = null;
    const input = document.getElementById('passwordConfirmInput');
    const account = document.getElementById('passwordConfirmAccount');
    const title = document.getElementById('passwordConfirmTitle');
    const intro = document.getElementById('passwordConfirmIntro');
    const status = document.getElementById('passwordConfirmStatus');
    const submitButton = document.getElementById('btnSubmitPasswordConfirm');

    if (input) input.value = '';
    if (account) account.value = '';
    if (title) title.textContent = 'Konfirmasi Password';
    if (intro) intro.textContent = 'Masukkan password akun aktif untuk melanjutkan perubahan sensitif ini.';
    if (status) status.textContent = 'Perubahan hanya akan diproses setelah password berhasil diverifikasi.';
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Verifikasi & Lanjutkan';
    }
}

function closePasswordConfirmModal(force = false) {
    if (runtimeState.passwordConfirmation.submitting && !force) return false;
    resetPasswordConfirmModal();
    closeModal('modalPasswordConfirm');
    return false;
}

function openPasswordConfirmModal(options = {}) {
    const profile = getCurrentUser();
    if (!profile) return false;

    resetPasswordConfirmModal();
    runtimeState.passwordConfirmation.action = {
        title: options.title || 'Konfirmasi Password',
        intro: options.intro || 'Masukkan password akun aktif untuk melanjutkan perubahan sensitif ini.',
        confirmLabel: options.confirmLabel || 'Verifikasi & Lanjutkan',
        onConfirm: typeof options.onConfirm === 'function' ? options.onConfirm : async () => {}
    };

    const accountField = document.getElementById('passwordConfirmAccount');
    const title = document.getElementById('passwordConfirmTitle');
    const intro = document.getElementById('passwordConfirmIntro');
    const submitButton = document.getElementById('btnSubmitPasswordConfirm');
    const modal = document.getElementById('modalPasswordConfirm');
    if (accountField) {
        accountField.value = profile.username || profile.phone || profile.email || profile.authEmail || profile.id;
    }
    if (title) title.textContent = runtimeState.passwordConfirmation.action.title;
    if (intro) intro.textContent = runtimeState.passwordConfirmation.action.intro;
    if (submitButton) submitButton.textContent = runtimeState.passwordConfirmation.action.confirmLabel;
    if (modal) modal.style.display = 'flex';
    document.getElementById('passwordConfirmInput')?.focus();
    return false;
}

async function verifyCurrentPassword(password, options = {}) {
    if (!canUseSupabase()) {
        throw new Error('Supabase client belum siap.');
    }

    const profile = options.profile || await requireAuthenticatedProfile(false);
    if (!profile) {
        throw new Error('Session login dibutuhkan.');
    }

    const authEmail = normalizeEmail(remoteState.user?.email || profile.authEmail || profile.auth_email || '');
    if (!authEmail) {
        throw new Error('Email auth akun tidak ditemukan untuk verifikasi password.');
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: authEmail,
        password: String(password || '')
    });
    if (error) {
        const message = String(error.message || '').toLowerCase();
        if (message.includes('invalid login credentials')) {
            throw new Error('Password konfirmasi tidak sesuai. Periksa lalu coba lagi.');
        }
        throw error;
    }

    return true;
}

async function handlePasswordConfirmSubmit(event) {
    event.preventDefault();
    const action = runtimeState.passwordConfirmation.action;
    if (!action || runtimeState.passwordConfirmation.submitting) return false;

    const passwordInput = document.getElementById('passwordConfirmInput');
    const status = document.getElementById('passwordConfirmStatus');
    const submitButton = document.getElementById('btnSubmitPasswordConfirm');
    const password = passwordInput?.value || '';

    if (!String(password).trim()) {
        if (status) status.textContent = 'Masukkan password akun Anda terlebih dahulu.';
        showToast('Masukkan password akun Anda terlebih dahulu.', 'warning');
        return false;
    }

    runtimeState.passwordConfirmation.submitting = true;
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Memverifikasi...';
    }
    if (status) status.textContent = 'Memverifikasi password akun...';

    try {
        await verifyCurrentPassword(password);
        if (status) status.textContent = 'Password valid. Menyimpan perubahan...';
        await action.onConfirm();
        runtimeState.passwordConfirmation.submitting = false;
        closePasswordConfirmModal(true);
    } catch (error) {
        console.error('Konfirmasi password gagal:', error);
        if (status) status.textContent = toUserFacingError(error, 'Konfirmasi password gagal.');
        showToast(toUserFacingError(error, 'Konfirmasi password gagal.'), 'error');
    } finally {
        runtimeState.passwordConfirmation.submitting = false;
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = action.confirmLabel || 'Verifikasi & Lanjutkan';
        }
    }

    return false;
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

function setMetricLoading(ids = []) {
    ids.forEach((id) => {
        const node = document.getElementById(id);
        if (!node) return;
        node.textContent = '0000';
        node.classList.add('loading-metric', 'is-loading');
    });
}

function setMetricValue(id, value) {
    const node = document.getElementById(id);
    if (!node) return;
    node.classList.remove('loading-metric', 'is-loading');
    node.textContent = value;
}

function renderTableLoading(bodyId, columnCount, rowCount = 3) {
    const body = document.getElementById(bodyId);
    if (!body) return;
    body.innerHTML = Array.from({ length: rowCount }, (_, rowIndex) => `
        <tr class="loading-row">
            ${Array.from({ length: columnCount }, (_, colIndex) => `
                <td>
                    <span class="loading-line skeleton ${rowIndex === 0 && colIndex === 0 ? 'short' : colIndex % 2 === 0 ? 'medium' : 'long'}"></span>
                </td>
            `).join('')}
        </tr>
    `).join('');
}

function tableCell(label, content) {
    return `<td data-label="${escapeHtml(label)}">${content}</td>`;
}

function renderServiceCardsLoading(containerId, count = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
        <div class="service-card is-loading">
            <div class="skeleton" style="width:100%;aspect-ratio:4 / 3;"></div>
            <div class="service-card-body">
                <span class="loading-line skeleton medium"></span>
                <span class="loading-line skeleton long"></span>
                <span class="loading-line skeleton short"></span>
            </div>
        </div>
    `).join('');
}

function renderJobCardsLoading(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
        <div class="job-card is-loading">
            <div class="job-card-header">
                <span class="loading-line skeleton medium"></span>
                <span class="loading-line skeleton short"></span>
            </div>
            <div class="job-card-details">
                <span class="loading-line skeleton long"></span>
                <span class="loading-line skeleton medium"></span>
                <span class="loading-line skeleton long"></span>
                <span class="loading-line skeleton short"></span>
            </div>
            <div class="btn-action-group">
                <span class="loading-line skeleton short"></span>
                <span class="loading-line skeleton short"></span>
            </div>
        </div>
    `).join('');
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

function getRegisterUnitDraftPayload() {
    const specValues = collectAcSpecFormValues('regKonUnit');
    return normalizeAcUnitRecord({
        key: buildAcUnitKey('register-unit'),
        ...specValues,
        created_at: new Date().toISOString(),
        source: 'register-draft'
    });
}

function hasRegisterAcUnitDraftValues() {
    const draftUnit = getRegisterUnitDraftPayload();
    return Boolean(
        draftUnit.brand
        || draftUnit.type
        || draftUnit.refrigerant
        || draftUnit.capacity
    );
}

function renderRegisterAcUnitSavedList() {
    const container = document.getElementById('regKonUnitSavedList');
    if (!container) return;

    const units = draftUploads.regKonSavedUnits;
    container.innerHTML = units.length ? `
        <div class="saved-unit-list-header">
            <h5>Data Unit AC Tersimpan</h5>
            <span>${units.length} unit</span>
        </div>
        <div class="saved-unit-card-grid">
            ${units.map((unit, index) => `
                <div class="saved-unit-card">
                    <div class="saved-unit-card-body">
                        <strong>${escapeHtml(formatAcUnitLabel(unit, index))}</strong>
                        <p>${escapeHtml(buildAcUnitSummary(unit).join(' • ') || 'Spesifikasi dasar belum diisi')}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<div class="empty-state-box"><p>Belum ada data unit AC yang disimpan di draft register.</p></div>';
}

function buildOrderUnitSelectionPreviewMarkup(unit = null, index = 0) {
    if (!unit) {
        return '<p class="text-muted text-sm">Belum ada unit yang dipilih. Anda bisa isi spesifikasi secara manual atau pilih salah satu unit tersimpan.</p>';
    }

    return `
        <div class="order-unit-selection-preview__content">
            <div class="order-unit-selection-preview__body">
                <strong>${escapeHtml(formatAcUnitLabel(unit, index))}</strong>
                <div class="unit-spec-list">
                    <span class="unit-spec-pill">${escapeHtml(`Merk: ${unit.brand || '-'}`)}</span>
                    <span class="unit-spec-pill">${escapeHtml(`Jenis: ${unit.type || '-'}`)}</span>
                    <span class="unit-spec-pill">${escapeHtml(`Refrigerant: ${unit.refrigerant || '-'}`)}</span>
                    <span class="unit-spec-pill">${escapeHtml(`Kapasitas: ${unit.capacity || '-'}`)}</span>
                </div>
                <p class="text-muted text-sm">Unit tersimpan ini dipakai sebagai referensi awal order, tetapi setiap field tetap bisa Anda ubah manual sebelum submit.</p>
            </div>
        </div>
    `;
}

function renderOrderUnitSelectionPreview(units = [], selectedUnit = null) {
    const preview = document.getElementById('orderUnitSelectionPreview');
    if (!preview) return;

    preview.hidden = false;

    if (!units.length) {
        preview.innerHTML = '<p class="text-muted text-sm">Belum ada unit AC tersimpan. Isi spesifikasi order secara manual seperti biasa.</p>';
        return;
    }

    if (!selectedUnit) {
        preview.innerHTML = '<p class="text-muted text-sm">Pilih salah satu unit tersimpan untuk autofill spesifikasi order, atau biarkan kosong bila Anda ingin isi manual.</p>';
        return;
    }

    const selectedIndex = units.findIndex((unit) => unit.key === selectedUnit.key);
    preview.innerHTML = buildOrderUnitSelectionPreviewMarkup(selectedUnit, selectedIndex >= 0 ? selectedIndex : 0);
}

function resetRegisterAcUnitDraft(options = {}) {
    resetAcSpecFormFields('regKonUnit');
    if (!options.silent) {
        showToast('Draft unit AC aktif berhasil dikosongkan.', 'success');
    }
}

function saveRegisterAcUnit() {
    const draftUnit = getRegisterUnitDraftPayload();
    if (!hasRegisterAcUnitDraftValues()) {
        showToast('Isi minimal satu data spesifikasi unit AC sebelum disimpan.', 'warning');
        return;
    }

    if (!draftUnit.brand && !draftUnit.type && !draftUnit.refrigerant && !draftUnit.capacity) {
        showToast('Data unit AC masih kosong.', 'warning');
        return;
    }

    draftUploads.regKonSavedUnits.push(draftUnit);
    renderRegisterAcUnitSavedList();
    resetRegisterAcUnitDraft({ silent: true });
    showToast('Data unit AC berhasil disimpan ke draft register.', 'success');
}

function prepareNextRegisterAcUnit() {
    resetRegisterAcUnitDraft({ silent: true });
    showToast('Form unit AC siap dipakai untuk unit berikutnya. Data yang sudah di-save tetap aman.', 'info');
}

function getKonsumenProfileSnapshot(profile = getCurrentUser()) {
    return {
        name: String(profile?.name || '').trim(),
        username: String(profile?.username || '').trim(),
        phone: normalizePhone(profile?.phone),
        birthDate: profile?.birthDate || profile?.birth_date || '',
        referral: String(profile?.referral || '').trim(),
        address: String(profile?.address || '').trim()
    };
}

function getKonsumenProfileFormSnapshot() {
    return {
        name: String(document.getElementById('profileKonsumenName')?.value || '').trim(),
        username: String(document.getElementById('profileKonsumenUsername')?.value || '').trim(),
        phone: normalizePhone(document.getElementById('profileKonsumenPhone')?.value || ''),
        birthDate: document.getElementById('profileKonsumenBirthDate')?.value || '',
        referral: String(document.getElementById('profileKonsumenReferral')?.value || '').trim(),
        address: String(document.getElementById('profileKonsumenAddress')?.value || '').trim()
    };
}

function applyKonsumenProfileSnapshotToForm(snapshot = {}) {
    const normalized = {
        name: snapshot.name || '',
        username: snapshot.username || '',
        phone: snapshot.phone || '',
        birthDate: snapshot.birthDate || '',
        referral: snapshot.referral || '',
        address: snapshot.address || ''
    };
    document.getElementById('profileKonsumenName').value = normalized.name;
    document.getElementById('profileKonsumenUsername').value = normalized.username;
    document.getElementById('profileKonsumenPhone').value = normalized.phone;
    document.getElementById('profileKonsumenBirthDate').value = normalized.birthDate;
    syncAgeField('profileKonsumenBirthDate', 'profileKonsumenAge');
    document.getElementById('profileKonsumenReferral').value = normalized.referral;
    document.getElementById('profileKonsumenAddress').value = normalized.address;
}

function syncKonsumenProfileEditorUi() {
    const state = runtimeState.profileEditor.konsumen;
    const isEditing = Boolean(state.isEditing);
    KONSUMEN_PROFILE_FIELD_IDS.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) field.disabled = !isEditing || state.submitting;
    });

    const emailField = document.getElementById('profileKonsumenEmail');
    if (emailField) {
        emailField.readOnly = true;
        emailField.disabled = true;
    }
    const ageField = document.getElementById('profileKonsumenAge');
    if (ageField) ageField.disabled = true;

    const editButton = document.getElementById('btnEditKonsumenProfile');
    const cancelButton = document.getElementById('btnCancelKonsumenProfileEdit');
    const saveButton = document.getElementById('btnSaveKonsumenProfile');
    const status = document.getElementById('profileKonsumenEditStatus');

    if (editButton) {
        editButton.hidden = isEditing;
        editButton.disabled = state.submitting;
    }
    if (cancelButton) {
        cancelButton.hidden = !isEditing;
        cancelButton.disabled = state.submitting;
    }
    if (saveButton) {
        saveButton.hidden = !isEditing;
        saveButton.disabled = state.submitting || !state.isDirty;
        saveButton.textContent = state.submitting ? 'Menyimpan...' : 'Save';
    }
    if (status) {
        if (state.submitting) {
            status.textContent = 'Menyimpan perubahan profil ke Supabase...';
        } else if (isEditing && state.isDirty) {
            status.textContent = 'Perubahan profil belum tersimpan. Klik Save lalu konfirmasi password untuk melanjutkan.';
        } else if (isEditing) {
            status.textContent = 'Mode edit aktif. Ubah field yang diperlukan lalu klik Save.';
        } else {
            status.textContent = 'Profil terkunci untuk mencegah perubahan tidak sengaja.';
        }
    }
}

function syncKonsumenProfileDirtyState() {
    const state = runtimeState.profileEditor.konsumen;
    const snapshot = state.snapshot || getKonsumenProfileSnapshot();
    const current = getKonsumenProfileFormSnapshot();
    state.isDirty = ['name', 'username', 'phone', 'birthDate', 'referral', 'address']
        .some((key) => String(current[key] || '') !== String(snapshot[key] || ''));
    syncKonsumenProfileEditorUi();
    return state.isDirty;
}

function startKonsumenProfileEdit() {
    const profile = getCurrentUser();
    if (!profile || runtimeState.profileEditor.konsumen.submitting) return false;
    clearTimeout(profileAutosaveTimeouts.konsumen);
    runtimeState.profileEditor.konsumen.snapshot = getKonsumenProfileSnapshot(profile);
    applyKonsumenProfileSnapshotToForm(runtimeState.profileEditor.konsumen.snapshot);
    runtimeState.profileEditor.konsumen.isEditing = true;
    runtimeState.profileEditor.konsumen.isDirty = false;
    syncKonsumenProfileEditorUi();
    return false;
}

function cancelKonsumenProfileEdit(options = {}) {
    const state = runtimeState.profileEditor.konsumen;
    if (state.submitting) return false;
    clearTimeout(profileAutosaveTimeouts.konsumen);
    const snapshot = state.snapshot || getKonsumenProfileSnapshot(getCurrentUser());
    applyKonsumenProfileSnapshotToForm(snapshot);
    state.isEditing = false;
    state.isDirty = false;
    state.snapshot = getKonsumenProfileSnapshot(getCurrentUser());
    syncKonsumenProfileEditorUi();
    if (!options.silent) {
        showToast('Perubahan profil dibatalkan.', 'info');
    }
    return false;
}

function getKonsumenUnitDraftState() {
    return runtimeState.konsumenUnitDraft;
}

function resetKonsumenUnitDraftState() {
    const state = getKonsumenUnitDraftState();
    const nextState = createEmptyKonsumenUnitDraftState();
    nextState.submitting = state.submitting;
    runtimeState.konsumenUnitDraft = nextState;
    return runtimeState.konsumenUnitDraft;
}

function getKonsumenUnitDraftPayload() {
    const state = getKonsumenUnitDraftState();
    const snapshot = state.initialSnapshot || {};
    const specValues = collectAcSpecFormValues('konUnit');
    return normalizeAcUnitRecord({
        key: snapshot.key || buildAcUnitKey('dashboard-unit'),
        ...specValues,
        created_at: snapshot.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source: snapshot.key ? 'dashboard-edit' : 'dashboard-draft'
    });
}

function hasKonsumenUnitDraftValues() {
    const state = getKonsumenUnitDraftState();
    const draft = getKonsumenUnitDraftPayload();
    return Boolean(
        draft.brand
        || draft.type
        || draft.refrigerant
        || draft.capacity
        || state.initialSnapshot
    );
}

function syncKonsumenUnitDraftDirtyState() {
    const state = getKonsumenUnitDraftState();
    const draft = getKonsumenUnitDraftPayload();
    const snapshot = state.initialSnapshot ? normalizeAcUnitRecord(state.initialSnapshot) : null;

    if (!snapshot) {
        state.isDirty = Boolean(
            draft.brand
            || draft.type
            || draft.refrigerant
            || draft.capacity
        );
        state.active = state.active || state.isDirty;
        return state.isDirty;
    }

    state.active = true;
    state.isDirty = draft.brand !== snapshot.brand
        || draft.type !== snapshot.type
        || draft.refrigerant !== snapshot.refrigerant
        || draft.capacity !== snapshot.capacity;
    return state.isDirty;
}

function renderKonsumenUnitDraftUi() {
    const state = getKonsumenUnitDraftState();
    const saveButton = document.getElementById('btnSaveKonUnitDraft');
    const cancelButton = document.getElementById('btnCancelKonUnitDraft');
    const newButton = document.getElementById('btnNewKonUnitDraft');
    const status = document.getElementById('konUnitDraftStatus');

    if (saveButton) {
        saveButton.disabled = state.submitting || !state.isDirty;
        saveButton.textContent = state.submitting ? 'Menyimpan...' : 'Save';
    }
    if (cancelButton) {
        cancelButton.disabled = state.submitting || (!state.active && !state.isDirty && !state.initialSnapshot);
    }
    if (newButton) {
        newButton.disabled = state.submitting;
    }
    if (status) {
        if (state.submitting) {
            status.textContent = 'Menyimpan draft unit AC ke Supabase...';
        } else if (state.editingKey && state.isDirty) {
            status.textContent = 'Anda sedang mengedit unit AC yang sudah tersimpan. Perubahan baru akan diproses saat Save.';
        } else if (state.editingKey) {
            status.textContent = 'Mode edit unit aktif. Ubah metadata lalu klik Save.';
        } else if (state.isDirty) {
            status.textContent = 'Draft unit AC baru siap disimpan. Klik Save lalu konfirmasi password.';
        } else {
            status.textContent = 'Belum ada draft unit AC yang aktif.';
        }
    }
}

function startNewKonsumenUnitDraft(options = {}) {
    if (getKonsumenUnitDraftState().submitting) return false;
    resetKonsumenUnitDraftState();
    resetAcSpecFormFields('konUnit');
    renderKonsumenUnitDraftUi();
    if (!options.silent) {
        setElementText('konUnitUploadStatus', 'Draft unit AC baru siap diisi. Belum ada perubahan yang dikirim ke Supabase.');
    }
    return false;
}

function cancelKonsumenUnitDraft(options = {}) {
    if (getKonsumenUnitDraftState().submitting) return false;
    startNewKonsumenUnitDraft({ silent: true });
    if (!options.silent) {
        setElementText('konUnitUploadStatus', 'Draft unit AC dibatalkan. Tidak ada perubahan yang disimpan.');
        showToast('Draft unit AC dibatalkan.', 'info');
    }
    return false;
}

function handleKonsumenUnitDraftInput(event) {
    const targetId = event?.target?.id || '';
    if (!/^konUnit(Brand|Type|Refrigerant|Capacity)(Other)?$/.test(targetId)) return;
    const state = getKonsumenUnitDraftState();
    state.active = true;
    syncKonsumenUnitDraftDirtyState();
    renderKonsumenUnitDraftUi();
}

async function editKonsumenUnit(index) {
    const profile = getCurrentUser();
    if (!profile || getKonsumenUnitDraftState().submitting) return false;

    const units = getProfileAcUnits(profile);
    const targetUnit = normalizeAcUnitRecord(units[index]);
    if (!targetUnit) {
        showToast('Data unit AC tidak ditemukan.', 'warning');
        return false;
    }

    const state = getKonsumenUnitDraftState();
    state.active = true;
    state.editingKey = targetUnit.key;
    state.initialSnapshot = targetUnit;
    populateAcSpecFormFields('konUnit', targetUnit);
    syncKonsumenUnitDraftDirtyState();
    renderKonsumenUnitDraftUi();
    setElementText('konUnitUploadStatus', `Mode edit aktif untuk ${formatAcUnitLabel(targetUnit, index)}. Perubahan baru diproses saat Save.`);
    return false;
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
        referral: document.getElementById('regKonReferral').value.trim(),
        address: document.getElementById('regKonAddress').value.trim(),
        locationText: document.getElementById('regKonLocationText')?.value.trim() || '',
        lat: document.getElementById('regKonLat').value,
        lng: document.getElementById('regKonLng').value,
        ac_units: draftUploads.regKonSavedUnits.map((unit) => ({ ...unit }))
    };
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

function createPreviewCardHtml(src, options = {}) {
    const deleteTarget = String(options.deleteTarget || '').trim();
    const deleteLabel = options.deleteLabel || 'Hapus Gambar';
    const deleteArgs = Array.isArray(options.deleteArgs) ? options.deleteArgs.map((item) => JSON.stringify(item)).join(', ') : '';
    const downloadUrl = String(options.downloadUrl || src || '').trim();
    const downloadLabel = options.downloadLabel || 'Buka / Unduh';
    return `
        <div class="image-card image-card--with-actions">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(options.alt || 'Preview upload')}" loading="lazy" decoding="async">
            ${options.caption ? `<p class="image-card-caption">${escapeHtml(options.caption)}</p>` : ''}
            ${(deleteTarget || downloadUrl) ? `
                <div class="image-card-actions">
                    ${downloadUrl ? `<a class="btn btn-outline btn-xs full-width-mobile" href="${escapeHtml(downloadUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(downloadLabel)}</a>` : ''}
                    ${deleteTarget ? `<button type="button" class="btn btn-danger btn-xs full-width-mobile" onclick="${deleteTarget}(${deleteArgs})">${escapeHtml(deleteLabel)}</button>` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

async function previewRegUpload(event, previewId) {
    const file = event.target.files?.[0];
    if (!file) return;
    validateImageFile(file, { label: 'Gambar pendaftaran' });
    const dataUrl = await readFileAsDataUrl(file);
    const preview = document.getElementById(previewId);
    if (!preview) return;
    preview.innerHTML = createPreviewCardHtml(dataUrl, {
        alt: 'Preview upload',
        deleteTarget: 'clearImagePreviewState',
        deleteArgs: [
            previewId === 'regTekIDPreview'
                ? 'register-teknisi-ktp'
                : 'register-teknisi-selfie'
        ],
        deleteLabel: 'Hapus Gambar'
    });
    if (previewId === 'regTekIDPreview') {
        draftUploads.regTekKtpPhoto = dataUrl;
        draftUploads.regTekKtpFile = {
            dataUrl,
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
        };
        scheduleOcrWarmup();
    }
    if (previewId === 'regTekSelfiePreview') {
        draftUploads.regTekSelfiePhoto = dataUrl;
        draftUploads.regTekSelfieFile = {
            dataUrl,
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
        };
    }
}

async function persistKonsumenUnitDraft() {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'konsumen') throw new Error('Session konsumen dibutuhkan untuk menyimpan unit AC.');

    const state = getKonsumenUnitDraftState();
    if (state.submitting) return null;
    if (!syncKonsumenUnitDraftDirtyState()) {
        throw new Error('Belum ada perubahan unit AC yang perlu disimpan.');
    }
    if (!hasKonsumenUnitDraftValues()) {
        throw new Error('Isi minimal satu metadata unit AC sebelum menyimpan.');
    }

    const currentUnits = getProfileAcUnits(profile);
    const existingIndex = state.editingKey ? currentUnits.findIndex((unit) => unit.key === state.editingKey) : -1;
    const existingUnit = existingIndex >= 0 ? normalizeAcUnitRecord(currentUnits[existingIndex]) : null;
    const baseDraft = getKonsumenUnitDraftPayload();
    const draftRecord = normalizeAcUnitRecord({
        ...baseDraft,
        key: existingUnit?.key || baseDraft.key || buildAcUnitKey('dashboard-unit'),
        created_at: existingUnit?.createdAt || baseDraft.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source: existingUnit ? 'dashboard-edit' : 'dashboard-entry'
    });

    state.submitting = true;
    renderKonsumenUnitDraftUi();
    setElementText('konUnitUploadStatus', 'Menyimpan data unit AC ke Supabase...');

    try {
        const nextUnits = [...currentUnits];
        if (existingIndex >= 0) {
            nextUnits[existingIndex] = draftRecord;
        } else {
            nextUnits.push(draftRecord);
        }

        const updatedProfile = await upsertOwnProfile(validateProfilePayloadForRole('konsumen', {
            ...profile,
            ac_units: nextUnits
        }));

        resetKonsumenUnitDraftState();
        resetAcSpecFormFields('konUnit');
        applySupabaseSession(updatedProfile);
        void syncNewUserToRemote(updatedProfile, { reason: 'konsumen-unit-metadata-update' });
        renderAppShell();
        await renderKonsumenUnit();
        setElementText('konUnitUploadStatus', 'Metadata unit AC berhasil tersimpan ke Supabase.');
        showToast(existingUnit ? 'Data unit AC berhasil diperbarui.' : 'Data unit AC berhasil disimpan.', 'success');
        return updatedProfile;
    } catch (error) {
        setElementText('konUnitUploadStatus', toUserFacingError(error, 'Penyimpanan data unit AC gagal.'));
        throw error;
    } finally {
        state.submitting = false;
        renderKonsumenUnitDraftUi();
    }
}

function saveKonsumenUnitDraft() {
    const state = getKonsumenUnitDraftState();
    if (state.submitting) return false;
    if (!syncKonsumenUnitDraftDirtyState()) {
        showToast('Belum ada perubahan unit AC yang perlu disimpan.', 'info');
        return false;
    }

    openPasswordConfirmModal({
        title: state.editingKey ? 'Konfirmasi Simpan Edit Unit AC' : 'Konfirmasi Simpan Unit AC',
        intro: state.editingKey
            ? 'Masukkan password akun Anda untuk menyimpan perubahan metadata unit AC ke Supabase.'
            : 'Masukkan password akun Anda untuk menyimpan draft unit AC baru ke Supabase.',
        confirmLabel: state.editingKey ? 'Verifikasi & Simpan Edit' : 'Verifikasi & Simpan Unit',
        onConfirm: async () => {
            await persistKonsumenUnitDraft();
        }
    });
    return false;
}

async function handleTekDocUpload(event, type) {
    const file = event.target.files?.[0];
    const profile = getCurrentUser();
    if (!file || !profile) return;
    const target = type === 'ktp' ? 'teknisi-ktp' : 'teknisi-selfie';
    const label = type === 'ktp' ? 'Foto KTP' : 'Foto diri';
    const lockKey = `upload:${target}:${profile.id}`;
    if (runtimeState.uploadLocks[lockKey]) return;
    runtimeState.uploadLocks[lockKey] = true;
    setElementText('teknisiDocStatus', `Mengunggah ${label.toLowerCase()} ke Supabase Storage...`);

    try {
        const uploaded = await uploadImageToSupabaseStorage({
            file,
            target,
            userId: profile.id,
            label
        });
        await persistUploadedImageReference({
            target,
            path: uploaded.path,
            url: uploaded.url
        });
        await syncUploadedAssetToRemote({
            target,
            profileId: profile.id,
            bucket: uploaded.bucket,
            path: uploaded.path
        });
        clearInputFileValue(event.target.id);
        await renderTeknisiDocs();
        setElementText('teknisiDocStatus', `${label} berhasil tersimpan di Supabase Storage.`);
        showToast(`${label} berhasil diunggah.`, 'success');
    } catch (error) {
        console.error(`Gagal upload dokumen teknisi (${type}):`, error);
        setElementText('teknisiDocStatus', toUserFacingError(error, `Upload ${label.toLowerCase()} gagal.`));
        showToast(toUserFacingError(error, `Upload ${label.toLowerCase()} gagal.`), 'error');
    } finally {
        runtimeState.uploadLocks[lockKey] = false;
    }
}

async function finalizeSignupUploadsAfterSession(role) {
    const profile = runtimeState.registrationSessionActive
        ? (remoteState.profile || await fetchCurrentProfileStrict().catch(() => null))
        : await requireAuthenticatedProfile(false);
    if (!profile) return null;

    if (role === 'konsumen' && draftUploads.regKonSavedUnits.length) {
        return persistUploadedImageReference({
            target: 'konsumen-unit',
            units: draftUploads.regKonSavedUnits.map((unit) => ({ ...unit }))
        });
    }

    if (role === 'teknisi') {
        let updatedProfile = profile;

        if (draftUploads.regTekKtpFile) {
            const ktpUpload = await uploadImageToSupabaseStorage({
                file: createFileLikeFromDraft(draftUploads.regTekKtpFile, draftUploads.regTekKtpFile.name || 'ktp.jpg'),
                target: 'teknisi-ktp',
                userId: profile.id,
                label: 'Foto KTP'
            });
            updatedProfile = await persistUploadedImageReference({
                target: 'teknisi-ktp',
                path: ktpUpload.path,
                url: ktpUpload.url
            });
            await syncUploadedAssetToRemote({
                target: 'teknisi-ktp',
                profileId: profile.id,
                bucket: getPrivateDocumentBucket(),
                path: ktpUpload.path
            });
        }

        if (draftUploads.regTekSelfieFile) {
            const selfieUpload = await uploadImageToSupabaseStorage({
                file: createFileLikeFromDraft(draftUploads.regTekSelfieFile, draftUploads.regTekSelfieFile.name || 'selfie.jpg'),
                target: 'teknisi-selfie',
                userId: profile.id,
                label: 'Foto diri'
            });
            updatedProfile = await persistUploadedImageReference({
                target: 'teknisi-selfie',
                path: selfieUpload.path,
                url: selfieUpload.url
            });
            await syncUploadedAssetToRemote({
                target: 'teknisi-selfie',
                profileId: profile.id,
                bucket: getPrivateDocumentBucket(),
                path: selfieUpload.path
            });
        }

        return updatedProfile;
    }

    return profile;
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

async function fetchProfileByIdForAdmin(userId) {
    if (!requireAdminAccess()) return null;
    const { data } = await withProfileColumnFallback(
        ({ selectClause }) => supabaseClient
            .from('profiles')
            .select(selectClause)
            .eq('id', userId)
            .maybeSingle(),
        { context: `fetchProfileByIdForAdmin:${userId}` }
    );
    return sanitizeProfileRecord(data);
}

async function waitForProfileByIdForAdmin(userId, options = {}) {
    const timeoutMs = options.timeoutMs || 7000;
    const intervalMs = options.intervalMs || 350;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const profile = await fetchProfileByIdForAdmin(userId).catch(() => null);
        if (profile) return profile;
        await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
    }
    throw new Error('Profil user baru belum muncul di Supabase. Coba refresh beberapa detik lagi.');
}

function findAdminManagedUser(role, userId) {
    return remoteState.adminProfiles?.[role]?.find((item) => item.id === userId)
        || getData().users?.[role]?.find((item) => item.id === userId)
        || null;
}

function configureManagedUserModal(role, mode) {
    const isKonsumen = role === 'konsumen';
    const prefix = isKonsumen ? 'Konsumen' : 'Teknisi';
    const isCreate = mode === 'create';
    const title = document.getElementById(`edit${prefix}ModalTitle`);
    const intro = document.getElementById(`edit${prefix}ModalIntro`);
    const passwordInput = document.getElementById(`edit${prefix}Password`);
    const emailInput = document.getElementById(`edit${prefix}Email`);
    const saveButton = document.getElementById(`btnSave${prefix}Modal`);

    if (title) title.textContent = `${isCreate ? 'Tambah' : 'Edit'} Data ${prefix}`;
    if (intro) {
        intro.textContent = isCreate
            ? `Admin dapat menambahkan akun ${role} manual langsung dari dashboard ini.`
            : `Admin dapat memperbarui data ${role} yang sudah ada tanpa masuk ke dashboard user tersebut.`;
    }
    if (passwordInput) {
        passwordInput.readOnly = !isCreate;
        passwordInput.type = isCreate ? 'password' : 'text';
        passwordInput.placeholder = isCreate ? 'Minimal 8 karakter' : 'Dikelola di Supabase Auth';
        if (!isCreate) passwordInput.value = 'Dikelola di Supabase Auth';
    }
    if (emailInput) {
        emailInput.readOnly = !isCreate;
        emailInput.placeholder = isCreate ? 'Opsional. Kosongkan bila tidak dipakai' : '';
    }
    if (saveButton) saveButton.textContent = isCreate ? `Tambah ${prefix}` : 'Simpan';
}

function fillAdminKonsumenModal(user = {}) {
    document.getElementById('editKonsumenId').value = user.id || '';
    document.getElementById('editKonsumenName').value = user.name || '';
    document.getElementById('editKonsumenUsername').value = user.username || '';
    document.getElementById('editKonsumenPassword').value = user.id ? 'Dikelola di Supabase Auth' : '';
    document.getElementById('editKonsumenEmail').value = user.id ? (user.authEmail || user.email || '') : (user.email || '');
    document.getElementById('editKonsumenPhone').value = user.phone || '';
    document.getElementById('editKonsumenBirthDate').value = user.birthDate || '';
    document.getElementById('editKonsumenAge').value = user.age || '';
    document.getElementById('editKonsumenReferral').value = user.referral || '';
    document.getElementById('editKonsumenDistrict').value = user.district || '';
    document.getElementById('editKonsumenStatus').value = user.status || PROFILE_STATUS_PENDING;
    document.getElementById('editKonsumenAddress').value = user.address || '';
    document.getElementById('editKonsumenLocationText').value = user.locationText || '';
}

function collectAdminKonsumenForm() {
    return {
        id: document.getElementById('editKonsumenId').value,
        name: document.getElementById('editKonsumenName').value.trim(),
        username: document.getElementById('editKonsumenUsername').value.trim(),
        password: document.getElementById('editKonsumenPassword').value,
        email: normalizeEmail(document.getElementById('editKonsumenEmail').value),
        phone: normalizePhone(document.getElementById('editKonsumenPhone').value),
        birthDate: document.getElementById('editKonsumenBirthDate').value,
        age: document.getElementById('editKonsumenAge').value,
        referral: document.getElementById('editKonsumenReferral').value.trim(),
        district: document.getElementById('editKonsumenDistrict').value.trim(),
        status: normalizeProfileStatus(document.getElementById('editKonsumenStatus').value),
        address: document.getElementById('editKonsumenAddress').value.trim(),
        locationText: document.getElementById('editKonsumenLocationText').value.trim()
    };
}

function openAddKonsumenModal() {
    if (!requireAdminAccess()) return;
    runtimeState.adminEditor.konsumenMode = 'create';
    configureManagedUserModal('konsumen', 'create');
    fillAdminKonsumenModal({ status: PROFILE_STATUS_PENDING });
    document.getElementById('modalEditKonsumen').style.display = 'flex';
}

function openEditKonsumen(userId) {
    if (!requireAdminAccess()) return;
    const user = findAdminManagedUser('konsumen', userId);
    if (!user) return;
    runtimeState.adminEditor.konsumenMode = 'edit';
    configureManagedUserModal('konsumen', 'edit');
    fillAdminKonsumenModal(user);
    document.getElementById('modalEditKonsumen').style.display = 'flex';
}

async function createPublicAccountByAdmin(role, formValues) {
    if (!requireAdminAccess()) return null;
    const registerFunctionStatus = await probeEdgeFunctionAvailability('register-public-account');
    if (!registerFunctionStatus.ok) {
        throw new Error('Backend register publik untuk input manual admin belum aktif. Deploy Edge Function `register-public-account` terlebih dahulu.');
    }

    const authResult = await invokeEdgeFunction('register-public-account', {
        role,
        username: formValues.username,
        name: formValues.name,
        password: formValues.password,
        email: formValues.email,
        phone: formValues.phone,
        address: formValues.address,
        age: formValues.age,
        birth_date: formValues.birthDate,
        district: formValues.district || '',
        referral: formValues.referral || '',
        ac_units: [],
        location_text: formValues.locationText || '',
        lat: '',
        lng: '',
        nik: formValues.nik || '',
        specialization: formValues.specialization || '',
        experience: formValues.experience ?? '',
        status: PROFILE_STATUS_PENDING
    }, {
        fallbackMessage: 'Tambah akun publik manual gagal diproses oleh backend register.'
    });
    const userId = authResult?.user?.id;
    const authEmail = normalizeEmail(authResult?.auth_email || authResult?.user?.email);
    if (!userId) throw new Error('Auth user baru tidak mengembalikan ID yang valid.');

    const createdProfile = await waitForProfileByIdForAdmin(userId);
    return updateProfileByAdmin(userId, validateProfilePayloadForRole(role, {
        ...createdProfile,
        id: userId,
        role,
        username: formValues.username,
        name: formValues.name,
        email: formValues.email,
        auth_email: authEmail,
        phone: formValues.phone,
        birth_date: formValues.birthDate,
        age: formValues.age,
        referral: formValues.referral || '',
        district: formValues.district || '',
        address: formValues.address || '',
        location_text: formValues.locationText || '',
        status: formValues.status || PROFILE_STATUS_PENDING,
        verified_at: formValues.status === PROFILE_STATUS_ACTIVE ? new Date().toISOString() : '',
        verified_by: formValues.status === PROFILE_STATUS_ACTIVE ? (remoteState.profile?.id || '') : '',
        ac_units: [],
        nik: formValues.nik || '',
        specialization: formValues.specialization || '',
        experience: formValues.experience ?? '',
        ktp_photo_path: createdProfile.ktpPhotoPath,
        ktp_photo_url: createdProfile.ktpPhotoUrl,
        selfie_photo_path: createdProfile.selfiePhotoPath,
        selfie_photo_url: createdProfile.selfiePhotoUrl
    }));
}

async function saveEditKonsumen() {
    if (!requireAdminAccess()) return;
    const form = collectAdminKonsumenForm();
    const isCreate = runtimeState.adminEditor.konsumenMode === 'create' || !form.id;
    if (!form.name || !form.username || !form.phone || !form.address) {
        showToast('Lengkapi data wajib konsumen terlebih dahulu.', 'error');
        return;
    }
    if (isCreate && !String(form.password || '').trim()) {
        showToast('Password wajib diisi saat menambah konsumen baru.', 'error');
        return;
    }

    const existingUser = isCreate ? null : findAdminManagedUser('konsumen', form.id);
    if (await isUsernameTakenRemote(form.username, existingUser?.id || '')) {
        showToast('Username konsumen sudah dipakai.', 'error');
        return;
    }

    try {
        if (isCreate) {
            await createPublicAccountByAdmin('konsumen', form);
        } else if (existingUser) {
            await updateProfileByAdmin(existingUser.id, validateProfilePayloadForRole('konsumen', {
                id: existingUser.id,
                role: 'konsumen',
                username: form.username,
                name: form.name,
                email: existingUser.email,
                auth_email: existingUser.authEmail || existingUser.email,
                phone: form.phone,
                birth_date: form.birthDate,
                age: form.age,
                referral: form.referral,
                address: form.address,
                district: form.district,
                location_text: form.locationText,
                lat: existingUser.lat,
                lng: existingUser.lng,
                status: form.status,
                ac_units: getProfileAcUnits(existingUser),
                verified_at: form.status === PROFILE_STATUS_ACTIVE ? (existingUser.verifiedAt || new Date().toISOString()) : existingUser.verifiedAt,
                verified_by: form.status === PROFILE_STATUS_ACTIVE ? (existingUser.verifiedBy || remoteState.profile?.id || '') : existingUser.verifiedBy
            }));
        }

        await loadAdminMasterData();
        closeModal('modalEditKonsumen');
        await renderAdminUsers();
        await renderAdminHome();
        showToast(isCreate ? 'Konsumen baru berhasil dibuat.' : 'Data konsumen diperbarui di Supabase.', 'success');
    } catch (error) {
        if (isEdgeFunctionDependencyError(error, 'register-public-account')) {
            void refreshPublicAuthBackendNotice({ force: true });
        }
        console.error('Gagal menyimpan konsumen dari admin:', error);
        showToast(toUserFacingError(error, isCreate ? 'Tambah konsumen gagal.' : 'Update konsumen gagal.'), 'error');
    }
}

function fillAdminTeknisiModal(user = {}) {
    populateSpecializationOptions('editTeknisiSpecialization', user.specialization || 'Semua Layanan');
    document.getElementById('editTeknisiId').value = user.id || '';
    document.getElementById('editTeknisiName').value = user.name || '';
    document.getElementById('editTeknisiUsername').value = user.username || '';
    document.getElementById('editTeknisiPassword').value = user.id ? 'Dikelola di Supabase Auth' : '';
    document.getElementById('editTeknisiEmail').value = user.id ? (user.authEmail || user.email || '') : (user.email || '');
    document.getElementById('editTeknisiPhone').value = user.phone || '';
    document.getElementById('editTeknisiNIK').value = user.nik || '';
    document.getElementById('editTeknisiBirthDate').value = user.birthDate || '';
    document.getElementById('editTeknisiAge').value = user.age || '';
    document.getElementById('editTeknisiExperience').value = user.experience || 0;
    document.getElementById('editTeknisiStatus').value = user.status || PROFILE_STATUS_PENDING;
    document.getElementById('editTeknisiDistrict').value = user.district || '';
    document.getElementById('editTeknisiAddress').value = user.address || '';
    document.getElementById('editTeknisiLocationText').value = user.locationText || '';
}

function collectAdminTeknisiForm() {
    return {
        id: document.getElementById('editTeknisiId').value,
        name: document.getElementById('editTeknisiName').value.trim(),
        username: document.getElementById('editTeknisiUsername').value.trim(),
        password: document.getElementById('editTeknisiPassword').value,
        email: normalizeEmail(document.getElementById('editTeknisiEmail').value),
        phone: normalizePhone(document.getElementById('editTeknisiPhone').value),
        nik: document.getElementById('editTeknisiNIK').value.trim(),
        birthDate: document.getElementById('editTeknisiBirthDate').value,
        age: document.getElementById('editTeknisiAge').value,
        specialization: document.getElementById('editTeknisiSpecialization').value,
        experience: Number(document.getElementById('editTeknisiExperience').value || 0),
        district: document.getElementById('editTeknisiDistrict').value.trim(),
        status: normalizeProfileStatus(document.getElementById('editTeknisiStatus').value),
        address: document.getElementById('editTeknisiAddress').value.trim(),
        locationText: document.getElementById('editTeknisiLocationText').value.trim()
    };
}

function openAddTeknisiModal() {
    if (!requireAdminAccess()) return;
    runtimeState.adminEditor.teknisiMode = 'create';
    configureManagedUserModal('teknisi', 'create');
    fillAdminTeknisiModal({ status: PROFILE_STATUS_PENDING, specialization: 'Semua Layanan' });
    document.getElementById('modalEditTeknisi').style.display = 'flex';
}

function openEditTeknisi(userId) {
    if (!requireAdminAccess()) return;
    const user = findAdminManagedUser('teknisi', userId);
    if (!user) return;
    runtimeState.adminEditor.teknisiMode = 'edit';
    configureManagedUserModal('teknisi', 'edit');
    fillAdminTeknisiModal(user);
    document.getElementById('modalEditTeknisi').style.display = 'flex';
}

async function saveEditTeknisi() {
    if (!requireAdminAccess()) return;
    const form = collectAdminTeknisiForm();
    const isCreate = runtimeState.adminEditor.teknisiMode === 'create' || !form.id;
    if (!form.name || !form.username || !form.phone || !form.birthDate || !form.specialization || !form.address) {
        showToast('Lengkapi data wajib teknisi terlebih dahulu.', 'error');
        return;
    }
    if (isCreate && !String(form.password || '').trim()) {
        showToast('Password wajib diisi saat menambah teknisi baru.', 'error');
        return;
    }

    const existingUser = isCreate ? null : findAdminManagedUser('teknisi', form.id);
    if (await isUsernameTakenRemote(form.username, existingUser?.id || '')) {
        showToast('Username teknisi sudah dipakai.', 'error');
        return;
    }

    try {
        if (isCreate) {
            await createPublicAccountByAdmin('teknisi', form);
        } else if (existingUser) {
            await updateProfileByAdmin(existingUser.id, validateProfilePayloadForRole('teknisi', {
                id: existingUser.id,
                role: 'teknisi',
                username: form.username,
                name: form.name,
                email: existingUser.email,
                auth_email: existingUser.authEmail || existingUser.email,
                phone: form.phone,
                nik: form.nik,
                birth_date: form.birthDate,
                age: form.age,
                specialization: form.specialization,
                experience: form.experience,
                district: form.district,
                address: form.address,
                location_text: form.locationText,
                lat: existingUser.lat,
                lng: existingUser.lng,
                status: form.status,
                verified_at: form.status === PROFILE_STATUS_ACTIVE ? (existingUser.verifiedAt || new Date().toISOString()) : existingUser.verifiedAt,
                verified_by: form.status === PROFILE_STATUS_ACTIVE ? (existingUser.verifiedBy || remoteState.profile?.id || '') : existingUser.verifiedBy,
                ktp_photo_path: existingUser.ktpPhotoPath,
                ktp_photo_url: existingUser.ktpPhotoUrl,
                selfie_photo_path: existingUser.selfiePhotoPath,
                selfie_photo_url: existingUser.selfiePhotoUrl
            }));
        }

        await loadAdminMasterData();
        closeModal('modalEditTeknisi');
        await renderAdminUsers();
        await renderAdminHome();
        showToast(isCreate ? 'Teknisi baru berhasil dibuat.' : 'Data teknisi diperbarui di Supabase.', 'success');
    } catch (error) {
        if (isEdgeFunctionDependencyError(error, 'register-public-account')) {
            void refreshPublicAuthBackendNotice({ force: true });
        }
        console.error('Gagal menyimpan teknisi dari admin:', error);
        showToast(toUserFacingError(error, isCreate ? 'Tambah teknisi gagal.' : 'Update teknisi gagal.'), 'error');
    }
}

function openAddAdminModal() {
    if (!requireAdminAccess()) return;
    document.getElementById('adminModalTitle').textContent = 'Tambah Data Admin';
    document.getElementById('editAdminId').value = '';
    document.getElementById('editAdminName').value = '';
    document.getElementById('editAdminUsername').value = '';
    document.getElementById('editAdminPassword').value = 'Kelola langsung di Supabase Auth';
    document.getElementById('editAdminRole').value = 'admin';
    document.getElementById('editAdminStatus').value = 'Aktif';
    document.getElementById('modalEditAdmin').style.display = 'flex';
}

function openEditAdmin(userId) {
    if (!requireAdminAccess()) return;
    const user = remoteState.adminProfiles.admin.find((item) => item.id === userId)
        || getData().users.admin.find((item) => item.id === userId);
    if (!user) return;
    document.getElementById('adminModalTitle').textContent = 'Edit Data Admin';
    document.getElementById('editAdminId').value = user.id;
    document.getElementById('editAdminName').value = user.name || '';
    document.getElementById('editAdminUsername').value = user.username || '';
    document.getElementById('editAdminPassword').value = 'Kelola langsung di Supabase Auth';
    document.getElementById('editAdminRole').value = user.role || 'admin';
    document.getElementById('editAdminStatus').value = user.status || 'Aktif';
    document.getElementById('modalEditAdmin').style.display = 'flex';
}

function saveEditAdmin() {
    if (!requireAdminAccess()) return;
    showToast('Admin dan password auth harus dikelola langsung di Supabase Auth/SQL, bukan disimpan lokal di frontend.', 'warning');
}

async function deletePublicAccountByAdmin(role, userId) {
    return invokeEdgeFunction('admin-manage-account', {
        action: 'delete_public_account',
        role,
        userId
    }, {
        fallbackMessage: 'Penghapusan akun publik gagal diproses oleh backend admin.'
    });
}

async function deleteUser(role, userId) {
    if (!requireAdminAccess()) return;
    const user = findAdminManagedUser(role, userId);
    if (!user) return;
    const warningText = role === 'konsumen'
        ? `Hapus akun ${user.name}? Akun auth akan dihapus permanen dan pesanan milik konsumen ini juga akan dibersihkan.`
        : `Hapus akun ${user.name}? Akun auth akan dihapus permanen dan pesanan aktif teknisi ini akan dilepas dari penugasan.`;
    if (!window.confirm(warningText)) return;

    try {
        await deletePublicAccountByAdmin(role, userId);
        await loadAdminMasterData();
        await renderAdminUsers();
        await renderAdminOrders();
        await renderAdminHome();
        showToast(`Akun ${ROLE_LABELS[role] || role} berhasil dihapus permanen.`, 'success');
    } catch (error) {
        if (isEdgeFunctionDependencyError(error, 'admin-manage-account')) {
            showToast('Backend hapus akun publik admin belum aktif. Deploy Edge Function `admin-manage-account` terlebih dahulu.', 'error');
            return;
        }
        console.error('Gagal menghapus akun publik:', error);
        showToast(toUserFacingError(error, 'Hapus akun publik gagal.'), 'error');
    }
}

function populateAdminOrderFormOptions(selected = {}) {
    const customerSelect = document.getElementById('adminOrderKonsumen');
    const serviceSelect = document.getElementById('adminOrderService');
    const technicianSelect = document.getElementById('adminOrderTeknisi');
    if (!customerSelect || !serviceSelect || !technicianSelect) return;

    customerSelect.innerHTML = '<option value="">Pilih Konsumen</option>' + remoteState.adminProfiles.konsumen
        .map((user) => `<option value="${escapeHtml(user.id)}">${escapeHtml(user.name)} - ${escapeHtml(user.username || '-')}</option>`)
        .join('');
    serviceSelect.innerHTML = '<option value="">Pilih Layanan</option>' + getServices(false)
        .map((service) => `<option value="${escapeHtml(service.id)}">${escapeHtml(service.name)}</option>`)
        .join('');
    technicianSelect.innerHTML = '<option value="">Belum Ditugaskan</option>' + remoteState.adminProfiles.teknisi
        .filter((user) => !isProfileDisabled(user))
        .map((user) => `<option value="${escapeHtml(user.id)}">${escapeHtml(user.name)} - ${escapeHtml(user.specialization || 'Semua Layanan')}</option>`)
        .join('');

    customerSelect.value = selected.konsumenId || '';
    serviceSelect.value = selected.serviceId || '';
    technicianSelect.value = selected.teknisiId || '';

    populateAcSpecOptions('adminOrderBrand', 'brand');
    populateAcSpecOptions('adminOrderType', 'type');
    populateAcSpecOptions('adminOrderRefrigerant', 'refrigerant');
    populateAcSpecOptions('adminOrderCapacity', 'capacity');
}

function handleAdminOrderKonsumenChange(options = {}) {
    const userId = document.getElementById('adminOrderKonsumen')?.value || '';
    const user = findAdminManagedUser('konsumen', userId);
    if (!user) return;
    const phoneInput = document.getElementById('adminOrderPhone');
    const addressInput = document.getElementById('adminOrderAddress');
    if (phoneInput && (options.force || !phoneInput.value.trim())) {
        phoneInput.value = user.phone || '';
    }
    if (addressInput && (options.force || !addressInput.value.trim())) {
        addressInput.value = user.address || '';
    }
}

function handleAdminOrderServiceChange() {
    return true;
}

async function openAddOrderModal() {
    if (!requireAdminAccess()) return;
    await loadAdminMasterData();
    runtimeState.adminEditor.orderMode = 'create';
    document.getElementById('adminOrderModalTitle').textContent = 'Input Pesanan Manual';
    document.getElementById('adminOrderModalIntro').textContent = 'Admin dapat membuat pesanan manual untuk konsumen yang sudah terdaftar.';
    document.getElementById('btnSaveAdminOrderModal').textContent = 'Simpan Pesanan';
    document.getElementById('adminOrderId').value = '';
    populateAdminOrderFormOptions();
    document.getElementById('adminOrderStatus').value = 'Menunggu';
    document.getElementById('adminOrderDate').value = '';
    document.getElementById('adminOrderPhone').value = '';
    document.getElementById('adminOrderAddress').value = '';
    document.getElementById('adminOrderNotes').value = '';
    document.getElementById('adminOrderConfirmationText').value = '';
    setAcSpecFieldValue('adminOrderBrand', 'brand', '');
    setAcSpecFieldValue('adminOrderType', 'type', '');
    setAcSpecFieldValue('adminOrderRefrigerant', 'refrigerant', '');
    setAcSpecFieldValue('adminOrderCapacity', 'capacity', '');
    document.getElementById('modalOrderForm').style.display = 'flex';
}

async function openEditOrderModal(orderId) {
    if (!requireAdminAccess()) return;
    await loadAdminMasterData();
    const order = remoteState.adminOrders.find((item) => item.id === orderId);
    if (!order) return;

    runtimeState.adminEditor.orderMode = 'edit';
    document.getElementById('adminOrderModalTitle').textContent = `Edit Pesanan ${getOrderLabel(order)}`;
    document.getElementById('adminOrderModalIntro').textContent = 'Perbarui data pesanan, status pengerjaan, dan penugasan teknisi langsung dari dashboard admin.';
    document.getElementById('btnSaveAdminOrderModal').textContent = 'Simpan Perubahan';
    document.getElementById('adminOrderId').value = order.id;
    populateAdminOrderFormOptions(order);
    document.getElementById('adminOrderStatus').value = order.status || 'Menunggu';
    document.getElementById('adminOrderDate').value = order.preferredDate || '';
    document.getElementById('adminOrderPhone').value = order.phone || '';
    document.getElementById('adminOrderAddress').value = order.address || '';
    document.getElementById('adminOrderNotes').value = order.notes || '';
    document.getElementById('adminOrderConfirmationText').value = order.adminConfirmationText || '';
    setAcSpecFieldValue('adminOrderBrand', 'brand', order.brand || '');
    setAcSpecFieldValue('adminOrderType', 'type', order.acType || '');
    setAcSpecFieldValue('adminOrderRefrigerant', 'refrigerant', order.refrigerant || '');
    setAcSpecFieldValue('adminOrderCapacity', 'capacity', order.pk || '');
    document.getElementById('modalOrderForm').style.display = 'flex';
}

function collectAdminOrderFormValues() {
    return {
        id: document.getElementById('adminOrderId').value.trim(),
        konsumenId: document.getElementById('adminOrderKonsumen').value,
        serviceId: document.getElementById('adminOrderService').value,
        teknisiId: document.getElementById('adminOrderTeknisi').value,
        status: document.getElementById('adminOrderStatus').value,
        preferredDate: document.getElementById('adminOrderDate').value,
        phone: normalizePhone(document.getElementById('adminOrderPhone').value),
        address: document.getElementById('adminOrderAddress').value.trim(),
        notes: document.getElementById('adminOrderNotes').value.trim(),
        confirmationText: document.getElementById('adminOrderConfirmationText').value.trim(),
        brand: getAcSpecFieldValue('adminOrderBrand', 'brand'),
        acType: getAcSpecFieldValue('adminOrderType', 'type'),
        refrigerant: getAcSpecFieldValue('adminOrderRefrigerant', 'refrigerant'),
        capacity: getAcSpecFieldValue('adminOrderCapacity', 'capacity')
    };
}

function buildAdminOrderMutationPayload(formValues = {}, existingOrder = null) {
    const konsumen = findAdminManagedUser('konsumen', formValues.konsumenId);
    const service = getServices(false).find((item) => item.id === formValues.serviceId);
    const status = String(formValues.status || 'Menunggu').trim();
    const teknisi = status === 'Menunggu'
        ? null
        : (formValues.teknisiId ? findAdminManagedUser('teknisi', formValues.teknisiId) : null);

    if (!konsumen) throw new Error('Pilih konsumen terlebih dahulu.');
    if (!service) throw new Error('Pilih layanan terlebih dahulu.');
    if (status !== 'Menunggu' && !teknisi) {
        throw new Error('Status selain Menunggu membutuhkan teknisi yang dipilih.');
    }

    const snapshotOrder = {
        ...(existingOrder || {}),
        konsumenName: konsumen.name,
        serviceName: service.name,
        preferredDate: formValues.preferredDate || existingOrder?.preferredDate || '',
        createdAt: existingOrder?.createdAt || new Date().toISOString()
    };

    return {
        konsumen_id: konsumen.id,
        konsumen_name: konsumen.name,
        service_id: service.id,
        service_name: service.name,
        price: Number(service.price || 0),
        teknisi_id: teknisi?.id || null,
        teknisi_name: teknisi?.name || null,
        brand: toNullableText(formValues.brand),
        ac_type: toNullableText(formValues.acType),
        pk: toNullableText(formValues.capacity),
        refrigerant: toNullableText(formValues.refrigerant),
        preferred_date: toNullableText(formValues.preferredDate),
        address: toNullableText(formValues.address || konsumen.address),
        notes: toNullableText(formValues.notes),
        phone: toNullableText(formValues.phone || konsumen.phone),
        status,
        admin_confirmation_text: toNullableText(
            formValues.confirmationText
            || (status === 'Ditugaskan' && teknisi ? buildAdminOrderConfirmationMessage(snapshotOrder, teknisi, '') : existingOrder?.adminConfirmationText || '')
        ),
        verified_at: status === 'Ditugaskan'
            ? (existingOrder?.verifiedAt || new Date().toISOString())
            : toNullableText(existingOrder?.verifiedAt),
        verified_by: status === 'Ditugaskan'
            ? (existingOrder?.verifiedBy || remoteState.profile?.id || null)
            : toNullableText(existingOrder?.verifiedBy)
    };
}

async function createOrderByAdmin(payload = {}) {
    const { data } = await withOrderColumnFallback(
        ({ selectClause, payload: safePayload }) => supabaseClient
            .from('orders')
            .insert(safePayload)
            .select(selectClause)
            .single(),
        {
            context: 'createOrderByAdmin',
            payload
        }
    );
    return mapOrderRecord(data, { fallbackSnapshot: payload });
}

async function saveAdminOrder() {
    if (!requireAdminAccess()) return;
    const formValues = collectAdminOrderFormValues();
    const isCreate = runtimeState.adminEditor.orderMode === 'create' || !formValues.id;
    const existingOrder = isCreate ? null : remoteState.adminOrders.find((item) => item.id === formValues.id);

    if (!formValues.konsumenId || !formValues.serviceId || !formValues.preferredDate || !formValues.phone || !formValues.address) {
        showToast('Lengkapi konsumen, layanan, tanggal, telepon, dan alamat pesanan terlebih dahulu.', 'error');
        return;
    }

    try {
        const payload = buildAdminOrderMutationPayload(formValues, existingOrder);
        if (isCreate) {
            await createOrderByAdmin(payload);
        } else if (existingOrder) {
            await updateOrderByAdmin(existingOrder.id, payload);
        }

        closeModal('modalOrderForm');
        await loadAdminMasterData();
        await renderAdminOrders();
        await renderAdminHistory();
        await renderAdminHome();
        showToast(isCreate ? 'Pesanan manual berhasil dibuat.' : 'Pesanan berhasil diperbarui.', 'success');
    } catch (error) {
        console.error('Gagal menyimpan pesanan admin:', error);
        showToast(toUserFacingError(error, isCreate ? 'Tambah pesanan manual gagal.' : 'Update pesanan gagal.'), 'error');
    }
}

async function deleteOrderByAdmin(orderId) {
    if (!requireAdminAccess()) return;
    const order = remoteState.adminOrders.find((item) => item.id === orderId);
    if (!order) return;
    if (!window.confirm(`Hapus pesanan ${getOrderLabel(order)} secara permanen?`)) return;

    try {
        const { error } = await supabaseClient
            .from('orders')
            .delete()
            .eq('id', orderId);
        if (error) throw error;

        await loadAdminMasterData();
        await renderAdminOrders();
        await renderAdminHistory();
        await renderAdminHome();
        showToast(`Pesanan ${getOrderLabel(order)} berhasil dihapus.`, 'success');
    } catch (error) {
        console.error('Gagal menghapus pesanan:', error);
        showToast(toUserFacingError(error, 'Hapus pesanan gagal.'), 'error');
    }
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
    updateServiceImagePreview(serviceImage(service));
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
    updateServiceImagePreview(image || document.getElementById('serviceFormImage').value || '');
}

function clearServiceImage() {
    document.getElementById('serviceFormImageCatalogId').value = '';
    document.getElementById('serviceFormImage').value = '';
    document.getElementById('serviceFormImageFile').value = '';
    updateServiceImagePreview('');
}

async function handleServiceImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    document.getElementById('serviceFormImageCatalogId').value = '';
    document.getElementById('serviceFormImage').value = dataUrl;
    updateServiceImagePreview(dataUrl);
}

function saveService() {
    if (!requireAdminAccess()) return;
    const data = getData();
    const serviceId = document.getElementById('serviceFormId').value;
    const existingService = data.services.find((item) => item.id === serviceId) || null;
    const imageCatalogId = document.getElementById('serviceFormImageCatalogId').value;
    const manualImage = document.getElementById('serviceFormImage').value;
    const serviceData = {
        id: serviceId || nextId(data.services, 'SRV'),
        name: document.getElementById('serviceFormName').value.trim(),
        price: Number(document.getElementById('serviceFormPrice').value || 0),
        description: document.getElementById('serviceFormDescription').value.trim(),
        active: document.getElementById('serviceFormActive').value === 'true',
        imageCatalogId,
        image: imageCatalogId ? '' : (manualImage || existingService?.image || FALLBACK_IMAGE)
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
    const { data } = await withOrderColumnFallback(
        ({ selectClause, payload: safePayload }) => supabaseClient
            .from('orders')
            .update(safePayload)
            .eq('id', orderId)
            .select(selectClause)
            .single(),
        {
            context: `updateOrderByAdmin:${orderId}`,
            payload
        }
    );

    return mapOrderRecord(data, { fallbackSnapshot: payload });
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
        <div class="detail-row"><span class="detail-label">Tanggal Preferensi</span><span class="detail-value">${escapeHtml(formatDate(order.preferredDate || order.createdAt))}</span></div>
        <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${escapeHtml(order.status || '-')}</span></div>
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

    if (!orderId || !teknisi || !order) {
        showToast('Pilih teknisi terlebih dahulu.', 'error');
        return;
    }

    const customerWaPopup = order.phone ? prepareWhatsAppPopup() : null;
    const technicianWaPopup = teknisi.phone ? prepareWhatsAppPopup() : null;

    try {
        const confirmationMessage = buildAdminOrderConfirmationMessage(order, teknisi, customMessage);
        const technicianMessage = buildTechnicianAssignmentWhatsAppMessage(order, teknisi);
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
            openWhatsAppChat(order.phone, confirmationMessage, customerWaPopup);
        } else {
            closePreparedPopup(customerWaPopup);
        }
        if (teknisi.phone) {
            openWhatsAppChat(teknisi.phone, technicianMessage, technicianWaPopup);
        } else {
            closePreparedPopup(technicianWaPopup);
        }
        showToast(`Pesanan ${orderId} ditugaskan ke ${teknisi.name}.`, 'success');
    } catch (error) {
        closePreparedPopup(customerWaPopup);
        closePreparedPopup(technicianWaPopup);
        console.error('Gagal assign teknisi:', error);
        showToast(toUserFacingError(error, 'Gagal menugaskan teknisi.'), 'error');
    }
}

function findVisibleOrderById(orderId) {
    return [...remoteState.currentOrders, ...remoteState.adminOrders].find((item) => item.id === orderId) || null;
}

async function openOrderDetail(orderId) {
    const order = findVisibleOrderById(orderId);
    if (!order) {
        showToast('Detail pesanan tidak ditemukan.', 'warning');
        return;
    }

    const mapsLink = resolveOrderCustomerMapsLink(order);

    document.getElementById('modalDetailBody').innerHTML = `
        <div class="order-detail-layout">
            <section class="detail-section-card">
                <h4>Ringkasan Pesanan</h4>
                <div class="profile-details order-overview-grid">
                    <div class="detail-row"><span class="detail-label">No. Pesanan</span><span class="detail-value">${escapeHtml(getOrderLabel(order))}</span></div>
                    <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${escapeHtml(order.status || '-')}</span></div>
                    <div class="detail-row"><span class="detail-label">Konsumen</span><span class="detail-value">${escapeHtml(order.konsumenName)}</span></div>
                    <div class="detail-row"><span class="detail-label">Teknisi</span><span class="detail-value">${escapeHtml(order.teknisiName || 'Belum ditugaskan')}</span></div>
                    <div class="detail-row"><span class="detail-label">Layanan</span><span class="detail-value">${escapeHtml(order.serviceName)}</span></div>
                    <div class="detail-row"><span class="detail-label">Telepon</span><span class="detail-value">${escapeHtml(formatDisplayPhone(order.phone))}</span></div>
                </div>
            </section>

            <section class="detail-section-card">
                <h4>Spesifikasi AC</h4>
                <dl class="order-detail-list">
                    <dt>Merk AC</dt><dd>${escapeHtml(order.brand || '-')}</dd>
                    <dt>Jenis AC</dt><dd>${escapeHtml(order.acType || '-')}</dd>
                    <dt>Kapasitas AC</dt><dd>${escapeHtml(order.pk || '-')}</dd>
                    <dt>Refrigerant</dt><dd>${escapeHtml(order.refrigerant || '-')}</dd>
                </dl>
            </section>

            <section class="detail-section-card">
                <h4>Lokasi & Jadwal</h4>
                <dl class="order-detail-list">
                    <dt>Tanggal Preferensi</dt><dd>${escapeHtml(formatDate(order.preferredDate || order.createdAt))}</dd>
                    <dt>Alamat</dt><dd>${escapeHtml(order.address || '-')}</dd>
                    <dt>Google Maps</dt><dd>${mapsLink ? `<a class="order-map-link" href="${escapeHtml(mapsLink)}" target="_blank" rel="noopener noreferrer">Buka lokasi</a>` : '-'}</dd>
                </dl>
            </section>

            <section class="detail-section-card">
                <h4>Operasional</h4>
                <dl class="order-detail-list">
                    <dt>Verifikasi Admin</dt><dd>${escapeHtml(formatVerificationInfo(order))}</dd>
                    <dt>Dibuat</dt><dd>${escapeHtml(formatDateTime(order.createdAt))}</dd>
                </dl>
            </section>

            <section class="detail-section-card detail-section-card--full">
                <h4>Konfirmasi Admin</h4>
                <p class="order-detail-message">${escapeHtml(order.adminConfirmationText || 'Belum ada konfirmasi admin.')}</p>
            </section>

            <section class="detail-section-card detail-section-card--full">
                <h4>Catatan Konsumen</h4>
                <p class="order-detail-message">${escapeHtml(order.notes || 'Tidak ada catatan tambahan.')}</p>
            </section>
        </div>
    `;
    document.getElementById('modalDetail').style.display = 'flex';
}

async function confirmRemoveKonsumenUnitImage(index) {
    if (!window.confirm('Hapus data unit AC ini dari Supabase Storage dan profil Anda?')) return;
    const targetKey = getProfileAcUnits(getCurrentUser())[index]?.key || '';
    try {
        await removeUploadedImage({ target: 'konsumen-unit', index });
        if (targetKey && getKonsumenUnitDraftState().editingKey === targetKey) {
            cancelKonsumenUnitDraft({ silent: true });
        }
        await renderKonsumenUnit();
        setElementText('konUnitUploadStatus', 'Data unit AC berhasil dihapus.');
        showToast('Data unit AC berhasil dihapus.', 'success');
    } catch (error) {
        console.error('Gagal menghapus gambar unit:', error);
        showToast(toUserFacingError(error, 'Gagal menghapus data unit AC.'), 'error');
    }
}

async function confirmRemoveTeknisiDocument(type) {
    const target = type === 'ktp' ? 'teknisi-ktp' : 'teknisi-selfie';
    const label = type === 'ktp' ? 'foto KTP' : 'foto diri';
    if (!window.confirm(`Hapus ${label} ini dari Storage dan profil teknisi?`)) return;
    try {
        await removeUploadedImage({ target });
        await renderTeknisiDocs();
        setElementText('teknisiDocStatus', `${label} berhasil dihapus.`);
        showToast(`${label.charAt(0).toUpperCase()}${label.slice(1)} berhasil dihapus.`, 'success');
    } catch (error) {
        console.error('Gagal menghapus dokumen teknisi:', error);
        showToast(toUserFacingError(error, `Gagal menghapus ${label}.`), 'error');
    }
}

async function startJob(orderId) {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'teknisi') return;

    try {
        await withOrderColumnFallback(
            ({ payload: safePayload }) => supabaseClient
                .from('orders')
                .update(safePayload)
                .eq('id', orderId)
                .eq('teknisi_id', profile.id),
            {
                context: `startJob:${orderId}`,
                payload: { status: 'Dikerjakan' }
            }
        );

        await loadCurrentOrdersForProfile();
        await renderTeknisiHome();
        await renderTeknisiJobs();
        showToast('Status pekerjaan diperbarui menjadi Dikerjakan.', 'success');
    } catch (error) {
        console.error('Gagal memulai pekerjaan:', error);
        showToast(toUserFacingError(error, 'Gagal memperbarui status pekerjaan.'), 'error');
    }
}

async function completeJob(orderId) {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'teknisi') return;
    const lockKey = `complete:order:${orderId}`;
    if (runtimeState.uploadLocks[lockKey]) return;
    runtimeState.uploadLocks[lockKey] = true;

    try {
        await updateOrderForCurrentTeknisi(orderId, { status: 'Selesai' });
        await loadCurrentOrdersForProfile();
        await renderTeknisiHome();
        await renderTeknisiJobs();
        showToast('Pekerjaan berhasil ditandai selesai.', 'success');
    } catch (error) {
        console.error('Gagal menyelesaikan pekerjaan:', error);
        showToast(toUserFacingError(error, 'Gagal menandai pekerjaan selesai.'), 'error');
    } finally {
        runtimeState.uploadLocks[lockKey] = false;
    }
}

function extractKtpFields(rawText) {
    const lines = String(rawText || '')
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    const joined = lines.join('\n').toUpperCase();
    const normalizedLabelPattern = /^(PROVINSI|KABUPATEN|KOTA|KECAMATAN|KEL\/DESA|KELURAHAN|DESA|AGAMA|STATUS|PEKERJAAN|KEWARGANEGARAAN|BERLAKU|GOL\.? DARAH|RT\/RW|RTRW|JENIS KELAMIN)/i;
    const normalizeDigitCluster = (value) => String(value || '')
        .toUpperCase()
        .replace(/[ODQ]/g, '0')
        .replace(/[IL|!]/g, '1')
        .replace(/S/g, '5')
        .replace(/B/g, '8')
        .replace(/Z/g, '2')
        .replace(/\D/g, '');

    const nikCandidates = [
        ...String(joined).match(/[0-9ODQILSBZ|!]{16,24}/g) || [],
        ...lines.filter((line) => /NIK/i.test(line))
    ];
    const nik = nikCandidates
        .map((candidate) => normalizeDigitCluster(candidate))
        .find((candidate) => candidate.length >= 16);

    const nameLineIndex = lines.findIndex((line) => /^NAMA\b/i.test(line) || /^N A M A\b/i.test(line));
    const nameLine = nameLineIndex >= 0 ? lines[nameLineIndex] : '';
    const addressIndex = lines.findIndex((line) => /ALAMAT/i.test(line));
    const ttlLineIndex = lines.findIndex((line) => /(TEMPAT|TMPT).*LAHIR|TEMPAT\/TGL LAHIR|TEMPAT,TGL LAHIR|TGL LAHIR/i.test(line));
    const ttlLine = ttlLineIndex >= 0 ? `${lines[ttlLineIndex]} ${lines[ttlLineIndex + 1] || ''}`.trim() : joined;

    let birthDate = '';
    const dateMatch = String(ttlLine || joined).match(/([0-3]?\d)[-\/. ]([01]?\d)[-\/. ]((?:19|20)\d{2})/);
    if (dateMatch) {
        const day = dateMatch[1];
        const month = dateMatch[2];
        const yearFull = dateMatch[3];
        birthDate = `${yearFull}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    let address = '';
    if (addressIndex >= 0) {
        const buffer = [];
        for (let index = addressIndex; index < lines.length; index += 1) {
            const line = lines[index];
            if (index !== addressIndex && normalizedLabelPattern.test(line.toUpperCase())) break;
            buffer.push(line.replace(/^ALAMAT[:\s]*/i, ''));
            if (buffer.length >= 3) break;
        }
        address = buffer.join(', ').trim();
    }

    let name = nameLine ? nameLine.replace(/^NAMA[:\s]*/i, '').trim() : '';
    if (!name && nameLineIndex >= 0) {
        const nextLine = String(lines[nameLineIndex + 1] || '').trim();
        if (nextLine && !normalizedLabelPattern.test(nextLine.toUpperCase())) {
            name = nextLine;
        }
    }

    return {
        nik: nik ? nik.slice(0, 16) : '',
        name,
        address,
        birthDate,
        age: calculateAge(birthDate) || '',
        rawText: String(rawText || '').trim()
    };
}

function renderTechnicianOcrPreview(extracted = {}) {
    const preview = document.getElementById('ocrPreviewCard');
    const resultList = document.getElementById('ocrResultList');
    if (!preview || !resultList) return;

    resultList.innerHTML = `
        <div><strong>Nama:</strong> ${escapeHtml(extracted.name || '-')}</div>
        <div><strong>NIK:</strong> ${escapeHtml(extracted.nik || '-')}</div>
        <div><strong>Alamat:</strong> ${escapeHtml(extracted.address || '-')}</div>
        <div><strong>Tanggal Lahir:</strong> ${escapeHtml(extracted.birthDate || '-')}</div>
        <div><strong>Usia:</strong> ${escapeHtml(extracted.age || '-')}</div>
    `;
    preview.style.display = 'block';
}

function applyOcrResultToTechnicianForm(extracted, options = {}) {
    const force = Boolean(options.force);
    if (!extracted) return false;

    let changed = false;
    const applyValue = (elementId, value, config = {}) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        const normalizedValue = String(value || '').trim();
        const currentValue = String(element.value || '').trim();
        if (!normalizedValue) return;
        if (!force && currentValue) return;
        element.value = normalizedValue;
        if (typeof config.afterApply === 'function') config.afterApply(normalizedValue, element);
        changed = true;
    };

    applyValue('regTekName', extracted.name);
    applyValue('regTekNIK', extracted.nik);
    applyValue('regTekAddress', extracted.address);
    applyValue('regTekBirthDate', extracted.birthDate, {
        afterApply: (value) => {
            const manualInput = document.getElementById('regTekBirthDateManual');
            if (manualInput && (force || !String(manualInput.value || '').trim())) {
                manualInput.value = formatIsoDateToManual(value);
                manualInput.setCustomValidity('');
            }
            syncAgeField('regTekBirthDate', 'regTekAge');
        }
    });

    return changed;
}

function applyLatestTechnicianOcrResult(force = false) {
    if (!draftUploads.ocrLastResult) {
        showToast('Belum ada hasil OCR yang bisa diterapkan.', 'warning');
        return false;
    }

    const changed = applyOcrResultToTechnicianForm(draftUploads.ocrLastResult, { force });
    showToast(
        changed
            ? (force ? 'Hasil OCR diterapkan ulang ke form teknisi.' : 'Hasil OCR diterapkan ke field teknisi yang masih kosong.')
            : 'Tidak ada field yang diubah karena form sudah berisi data manual.',
        changed ? 'success' : 'warning'
    );
    return changed;
}

function ensureOcrLibrary() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (runtimeState.ocrLibraryPromise) return runtimeState.ocrLibraryPromise;

    runtimeState.ocrLibraryPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-ocr-lib="tesseract"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(window.Tesseract), { once: true });
            existing.addEventListener('error', reject, { once: true });
            return;
        }
        const script = document.createElement('script');
        script.src = OCR_CDN_URL;
        script.async = true;
        script.dataset.ocrLib = 'tesseract';
        script.onload = () => resolve(window.Tesseract);
        script.onerror = reject;
        document.head.appendChild(script);
    }).catch((error) => {
        runtimeState.ocrLibraryPromise = null;
        throw error;
    });

    return runtimeState.ocrLibraryPromise;
}

async function runTechnicianKtpOcr() {
    if (!draftUploads.regTekKtpPhoto) {
        showToast('Upload foto KTP terlebih dahulu.', 'warning');
        return;
    }
    if (runtimeState.ocrScanInProgress) return;
    const status = document.getElementById('ocrStatus');
    const progress = document.getElementById('ocrProgress');
    const preview = document.getElementById('ocrPreviewCard');
    const triggerButton = document.getElementById('btnScanKtp');
    runtimeState.ocrScanInProgress = true;
    if (triggerButton) {
        triggerButton.disabled = true;
        triggerButton.classList.add('is-loading');
        triggerButton.setAttribute('aria-busy', 'true');
    }
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
        renderTechnicianOcrPreview(extracted);
        applyOcrResultToTechnicianForm(extracted, { force: false });
        preview.style.display = 'block';
        status.textContent = 'OCR selesai. Field kosong sudah diisi otomatis; Anda tetap bisa edit manual atau terapkan ulang hasil OCR.';
        showToast('OCR KTP selesai diproses.', 'success');
    } catch (error) {
        console.error(error);
        status.textContent = 'OCR gagal dijalankan. Anda tetap bisa isi manual.';
        showToast('OCR gagal. Isi data KTP secara manual.', 'warning');
    } finally {
        runtimeState.ocrScanInProgress = false;
        if (triggerButton) {
            triggerButton.disabled = false;
            triggerButton.classList.remove('is-loading');
            triggerButton.removeAttribute('aria-busy');
        }
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
    const url = new URL(window.location.href);
    url.hash = '';
    url.search = '';
    return url.toString();
}

function getEdgeFunctionUrl(functionName) {
    return `${SUPABASE_URL}/functions/v1/${functionName}`;
}

function getAuthSettingsUrl() {
    return `${SUPABASE_URL}/auth/v1/settings`;
}

function createFunctionInvokeError(message, originalError, functionName) {
    const error = new Error(message);
    error.originalError = originalError || null;
    error.functionName = functionName || '';
    error.status = Number(originalError?.context?.status || originalError?.status || 0) || null;
    return error;
}

function extractFunctionPayloadMessage(payload) {
    if (!payload) return '';
    if (typeof payload === 'string') return payload.trim();
    const candidates = [payload.message, payload.error, payload.msg, payload.details];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim();
        }
    }
    return '';
}

async function extractEdgeFunctionErrorMessage(error) {
    const context = error?.context;
    if (!context) return '';

    try {
        const response = typeof context.clone === 'function' ? context.clone() : context;
        const contentType = String(response.headers?.get?.('content-type') || '').toLowerCase();

        if (contentType.includes('application/json')) {
            const jsonPayload = await response.json().catch(() => null);
            const jsonMessage = extractFunctionPayloadMessage(jsonPayload);
            if (jsonMessage) return jsonMessage;
        }

        const rawText = await response.text().catch(() => '');
        const text = String(rawText || '').trim();
        if (!text) return '';

        try {
            const parsed = JSON.parse(text);
            const parsedMessage = extractFunctionPayloadMessage(parsed);
            if (parsedMessage) return parsedMessage;
        } catch (_) {
            // Biarkan fallback ke raw text.
        }

        return text;
    } catch (_) {
        return '';
    }
}

function getMissingEdgeFunctionMessage(functionName) {
    const knownMessages = {
        'register-public-account': 'Backend register publik belum aktif. Deploy Edge Function `register-public-account` ke Supabase terlebih dahulu.',
        'profile-password-login': 'Backend login multi-identifier belum aktif. Deploy Edge Function `profile-password-login` ke Supabase terlebih dahulu.',
        'request-password-reset': 'Backend reset password belum aktif. Deploy Edge Function `request-password-reset` ke Supabase terlebih dahulu.'
    };
    return knownMessages[functionName] || `Edge Function \`${functionName}\` belum tersedia atau belum dideploy di project Supabase.`;
}

function looksLikeMissingEdgeFunction(error) {
    const status = Number(error?.context?.status || error?.status || 0);
    const combined = [
        error?.functionName,
        error?.name,
        error?.message,
        error?.context?.statusText
    ].filter(Boolean).join(' ').toLowerCase();

    return status === 404
        || combined.includes('functionsfetcherror')
        || combined.includes('failed to send a request')
        || combined.includes('edge function not found')
        || combined.includes('not found');
}

function isEdgeFunctionDependencyError(error, functionName = '') {
    if (!error) return false;
    if (functionName && error?.functionName === functionName && looksLikeMissingEdgeFunction(error)) {
        return true;
    }

    const combined = [
        error?.functionName,
        error?.name,
        error?.message
    ].filter(Boolean).join(' ').toLowerCase();

    return looksLikeMissingEdgeFunction(error)
        || (Boolean(functionName) && combined.includes(functionName.toLowerCase()))
        || combined.includes('backend register publik belum aktif')
        || combined.includes('backend login multi-identifier belum aktif')
        || combined.includes('backend reset password belum aktif');
}

async function fetchSupabaseAuthSettings(options = {}) {
    const cached = runtimeState.authBackendHealth.settings;
    if (!options.force && cached?.checkedAt && (Date.now() - cached.checkedAt) < AUTH_SETTINGS_CACHE_TTL_MS) {
        return cached;
    }

    const headers = { apikey: SUPABASE_ANON_KEY };

    try {
        const response = await fetch(getAuthSettingsUrl(), {
            method: 'GET',
            headers,
            cache: 'no-store'
        });
        if (!response.ok) {
            throw new Error(`Supabase Auth settings merespons ${response.status}.`);
        }

        const payload = await response.json();
        const summary = {
            checkedAt: Date.now(),
            ok: true,
            mailerAutoconfirm: Boolean(payload?.mailer_autoconfirm),
            phoneAutoconfirm: Boolean(payload?.phone_autoconfirm),
            disableSignup: Boolean(payload?.disable_signup)
        };
        runtimeState.authBackendHealth.settings = summary;
        return summary;
    } catch (error) {
        const summary = {
            checkedAt: Date.now(),
            ok: false,
            mailerAutoconfirm: false,
            phoneAutoconfirm: false,
            disableSignup: false,
            message: String(error?.message || error || 'Gagal membaca auth settings Supabase.')
        };
        runtimeState.authBackendHealth.settings = summary;
        return summary;
    }
}

async function probeEdgeFunctionAvailability(functionName, options = {}) {
    const cached = runtimeState.authBackendHealth.functions[functionName];
    if (!options.force && cached?.checkedAt && (Date.now() - cached.checkedAt) < AUTH_BACKEND_HEALTH_CACHE_TTL_MS) {
        return cached;
    }

    const headers = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    };

    let timeoutId = null;
    const controller = typeof AbortController === 'function' ? new AbortController() : null;

    try {
        if (controller) {
            timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs || 6000);
        }

        const response = await fetch(getEdgeFunctionUrl(functionName), {
            method: 'POST',
            headers,
            body: JSON.stringify({}),
            cache: 'no-store',
            signal: controller?.signal
        });

        const result = {
            checkedAt: Date.now(),
            ok: response.status !== 404,
            status: response.status,
            message: response.status === 404 ? getMissingEdgeFunctionMessage(functionName) : ''
        };
        runtimeState.authBackendHealth.functions[functionName] = result;
        return result;
    } catch (error) {
        const result = {
            checkedAt: Date.now(),
            ok: false,
            status: 0,
            message: `Endpoint Edge Function \`${functionName}\` tidak bisa dijangkau dari browser ini.`
        };
        runtimeState.authBackendHealth.functions[functionName] = result;
        return result;
    } finally {
        if (timeoutId) window.clearTimeout(timeoutId);
    }
}

async function getPublicAuthBackendStatus(options = {}) {
    const [functionChecks, authSettings] = await Promise.all([
        Promise.all(PUBLIC_AUTH_FUNCTION_NAMES.map((functionName) => probeEdgeFunctionAvailability(functionName, options))),
        fetchSupabaseAuthSettings(options)
    ]);

    const missingFunctions = PUBLIC_AUTH_FUNCTION_NAMES.filter((_, index) => !functionChecks[index]?.ok);
    const missingFunctionLabels = missingFunctions.map((name) => `\`${name}\``).join(', ');
    const registerFallbackReady = Boolean(authSettings?.ok && authSettings.mailerAutoconfirm && !authSettings.disableSignup);
    const message = missingFunctions.length
        ? (registerFallbackReady
            ? `Backend auth publik belum lengkap. Function yang belum aktif: ${missingFunctionLabels}. Login username/telepon masih butuh backend, tetapi register fallback client-side aman dipakai karena email confirmation Supabase sudah dimatikan.`
            : `Backend auth publik belum lengkap di project Supabase ini. Function yang belum aktif: ${missingFunctionLabels}. Supabase Auth masih mewajibkan konfirmasi email untuk signup biasa, jadi register publik tetap butuh backend register yang aktif.`)
        : '';

    const summary = {
        checkedAt: Date.now(),
        ok: missingFunctions.length === 0,
        missingFunctions,
        registerFallbackReady,
        authSettings,
        message
    };
    runtimeState.authBackendHealth.publicNoticeMessage = message;
    return summary;
}

function getMissingPublicAuthFunctionsLabel() {
    const functionsMap = runtimeState.authBackendHealth?.functions || {};
    const missing = PUBLIC_AUTH_FUNCTION_NAMES.filter((name) => functionsMap[name] && functionsMap[name].ok === false);
    return missing.length ? missing.map((name) => `\`${name}\``).join(', ') : '';
}

function renderPublicAuthBackendNotice(message = '') {
    ['authBackendNoticeLogin', 'authBackendNoticeRegister'].forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        if (!message) {
            element.hidden = true;
            element.textContent = '';
            return;
        }
        element.hidden = false;
        element.textContent = message;
    });
}

async function refreshPublicAuthBackendNotice(options = {}) {
    const user = getCurrentUser();
    if (user) {
        renderPublicAuthBackendNotice('');
        return;
    }

    const status = await getPublicAuthBackendStatus(options);
    renderPublicAuthBackendNotice(status.message || '');
}

async function resolveEdgeFunctionError(error, functionName, fallback = '') {
    const bodyMessage = await extractEdgeFunctionErrorMessage(error);
    if (bodyMessage) {
        return createFunctionInvokeError(bodyMessage, error, functionName);
    }

    if (looksLikeMissingEdgeFunction(error)) {
        return createFunctionInvokeError(getMissingEdgeFunctionMessage(functionName), error, functionName);
    }

    const directMessage = String(error?.message || '').trim();
    if (directMessage && !/edge function returned a non-2xx status code/i.test(directMessage)) {
        return createFunctionInvokeError(directMessage, error, functionName);
    }

    return createFunctionInvokeError(
        fallback || `Pemanggilan backend ${functionName} gagal.`,
        error,
        functionName
    );
}

function shouldBypassEdgeFunctionJwt(functionName) {
    return PUBLIC_AUTH_FUNCTION_SET.has(functionName)
        || functionName === 'admin-manage-account'
        || functionName === REMOTE_SYNC_FUNCTION_NAME
        || functionName === REMOTE_STORAGE_SYNC_FUNCTION_NAME;
}

async function getCurrentAccessToken() {
    const cachedSession = remoteState.session;
    const cachedToken = cachedSession?.access_token || cachedSession?.accessToken;
    if (cachedToken) return cachedToken;

    const session = await getSupabaseSession();
    return session?.access_token || session?.accessToken || '';
}

async function invokeDirectEdgeFunction(functionName, body = {}, options = {}) {
    const headers = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    };

    if (options.includeUserSession) {
        const accessToken = await getCurrentAccessToken();
        if (!accessToken) {
            throw new Error('Session pengguna tidak ditemukan untuk memanggil backend aman.');
        }
        headers['X-User-Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(getEdgeFunctionUrl(functionName), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        cache: 'no-store'
    });

    if (!response.ok) {
        const error = new Error(`Edge Function ${functionName} merespons ${response.status}.`);
        error.context = response;
        error.status = response.status;
        throw error;
    }

    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
        return {};
    }

    return await response.json().catch(() => ({}));
}

async function invokeEdgeFunction(functionName, body = {}, options = {}) {
    if (!canUseSupabase()) {
        throw new Error('Supabase client belum siap.');
    }

    try {
        if (shouldBypassEdgeFunctionJwt(functionName)) {
            return await invokeDirectEdgeFunction(functionName, body, {
                includeUserSession: !PUBLIC_AUTH_FUNCTION_SET.has(functionName)
            });
        }

        const { data, error } = await supabaseClient.functions.invoke(functionName, { body });
        if (error) throw error;
        return data || {};
    } catch (error) {
        throw await resolveEdgeFunctionError(error, functionName, options.fallbackMessage);
    }
}

function toUserFacingError(error, fallback = 'Terjadi kesalahan.') {
    const message = String(error?.message || error || fallback);
    const normalized = message.toLowerCase();
    const missingColumn = extractMissingColumnName(error);

    if (normalized.includes('invalid login credentials')) return 'Login gagal. Periksa identifier dan password Anda.';
    if (normalized.includes('email, username, atau no. telepon')) return 'Masukkan email, username, atau nomor telepon yang valid.';
    if (normalized.includes('failed to send a request to the edge function') || normalized.includes('functionsfetcherror')) {
        return 'Browser gagal menjangkau Edge Function Supabase. Biasanya karena function belum dideploy, env function belum lengkap, atau koneksi ke endpoint Functions sedang gagal.';
    }
    if (normalized.includes('backend auth publik belum lengkap')) {
        const missingLabel = getMissingPublicAuthFunctionsLabel();
        if (missingLabel) {
            return `Backend auth publik di Supabase belum lengkap. Function yang belum aktif: ${missingLabel}.`;
        }
        return 'Backend auth publik di Supabase belum lengkap. Beberapa function auth publik belum aktif.';
    }
    if (normalized.includes('masih mewajibkan konfirmasi email untuk signup biasa')) {
        return 'Register publik belum bisa dijalankan karena project Supabase masih mewajibkan konfirmasi email dan backend register belum aktif.';
    }
    if (normalized.includes('email not confirmed')) return 'Alur register tidak lagi memakai konfirmasi email. Jika ini muncul, cek deployment auth/backend terbaru.';
    if (normalized.includes('user already registered')) return 'Email sudah terdaftar. Silakan login langsung.';
    if (normalized.includes('email rate limit exceeded') || normalized.includes('over_email_send_rate_limit')) return 'Tunggu sebentar sebelum meminta email verifikasi lagi.';
    if (normalized.includes('429')) return 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.';
    if (normalized.includes('duplicate key') && normalized.includes('username')) return 'Username sudah digunakan akun lain.';
    if (normalized.includes('duplicate key') && normalized.includes('phone')) return 'Nomor telepon sudah digunakan akun lain pada role yang sama.';
    if (normalized.includes('violates row-level security')) return 'Policy Supabase untuk profile/order belum sesuai. Jalankan SQL final di README lalu coba lagi.';
    if (normalized.includes('mime') || normalized.includes('content type')) return 'Format file belum sesuai. Gunakan JPG, PNG, WEBP, HEIC, atau HEIF.';
    if (normalized.includes('payload too large') || normalized.includes('file too large')) return 'Ukuran file terlalu besar. Maksimal 8 MB per gambar.';
    if (normalized.includes('bucket storage "') || normalized.includes('bucket not found')) return 'Konfigurasi bucket storage belum cocok. Jalankan migrasi storage Supabase atau sesuaikan `window.INDOSEJUK_RUNTIME_CONFIG.storage` agar nama bucket sinkron.';
    if (normalized.includes('password should be at least')) return `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`;
    if (normalized.includes('same password')) return 'Sandi baru harus berbeda dari sandi sebelumnya.';
    if (normalized.includes('reauthentication') || normalized.includes('nonce')) return 'Kode verifikasi perubahan sandi tidak valid atau sudah kedaluwarsa. Kirim ulang kode lalu coba lagi.';
    if (normalized.includes('metadata unit ac belum bisa dikonfirmasi')) return 'Data unit AC belum berhasil diverifikasi sesaat setelah disimpan. Coba tekan Save sekali lagi dalam beberapa detik.';
    if (normalized.includes('menunggu verifikasi')) return 'Akun Anda masih Menunggu Verifikasi admin.';
    if (normalized.includes('nonaktif')) return 'Akun Anda sedang Nonaktif.';
    if (normalized.includes('ditolak')) return 'Akun Anda ditolak oleh admin.';
    if (missingColumn && OPTIONAL_PROFILE_COLUMN_SET.has(missingColumn)) {
        return 'Struktur profile Supabase sedang menyesuaikan schema. Aplikasi akan lanjut memakai fallback aman dan data inti tetap bisa dipakai.';
    }
    if (missingColumn && OPTIONAL_ORDER_COLUMN_SET.has(missingColumn)) {
        return 'Struktur orders Supabase sedang menyesuaikan schema. Aplikasi akan retry dengan fallback aman sampai cache schema sinkron.';
    }

    return message || fallback;
}

function getPasswordResetRedirectUrl() {
    return getAppBaseUrl();
}

function resetPasswordResetModalState() {
    document.getElementById('formPasswordReset')?.reset();
    const role = document.getElementById('loginRole')?.value || 'konsumen';
    const config = getLoginUiConfig(role);
    const identifierInput = document.getElementById('passwordResetIdentifier');
    const identifierLabel = document.getElementById('passwordResetIdentifierLabel');
    const intro = document.getElementById('passwordResetIntro');
    const help = document.getElementById('passwordResetHelp');
    if (identifierInput) {
        identifierInput.value = normalizeLoginIdentifier(document.getElementById('loginIdentifier')?.value || '', role);
        identifierInput.placeholder = config.resetPlaceholder;
    }
    if (identifierLabel) identifierLabel.textContent = config.resetLabel;
    if (intro) intro.textContent = config.resetIntro;
    if (help) help.textContent = config.resetHelp;
}

function openPasswordResetModal() {
    resetPasswordResetModalState();
    const modal = document.getElementById('modalPasswordReset');
    if (modal) modal.style.display = 'flex';
}

async function requestPasswordReset(identifier, role = 'konsumen') {
    const normalizedIdentifier = normalizeLoginIdentifier(identifier);
    if (!normalizedIdentifier) {
        throw new Error('Masukkan email, username, atau nomor telepon terlebih dahulu.');
    }

    const resetFunctionStatus = await probeEdgeFunctionAvailability('request-password-reset');
    if (!resetFunctionStatus.ok) {
        if (isEmailIdentifier(normalizedIdentifier) && !isSyntheticAuthEmail(normalizedIdentifier)) {
            const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(normalizedIdentifier, {
                redirectTo: getPasswordResetRedirectUrl()
            });
            if (resetError) throw resetError;
            return {
                ok: true,
                fallbackMode: 'direct-email-reset'
            };
        }

        throw new Error('Reset sandi via username atau nomor telepon belum aktif karena backend `request-password-reset` belum tersedia. Gunakan email verifikasi aktif atau deploy function tersebut.');
    }

    try {
        return await invokeEdgeFunction('request-password-reset', {
            role,
            identifier: normalizedIdentifier,
            redirectTo: getPasswordResetRedirectUrl()
        }, {
            fallbackMessage: 'Permintaan reset password gagal diproses oleh backend.'
        });
    } catch (error) {
        if (isEdgeFunctionDependencyError(error, 'request-password-reset') && isEmailIdentifier(normalizedIdentifier) && !isSyntheticAuthEmail(normalizedIdentifier)) {
            const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(normalizedIdentifier, {
                redirectTo: getPasswordResetRedirectUrl()
            });
            if (resetError) throw resetError;
            return {
                ok: true,
                fallbackMode: 'direct-email-reset'
            };
        }
        throw error;
    }
}

async function handlePasswordResetRequest(event) {
    event.preventDefault();
    const role = document.getElementById('loginRole')?.value || 'konsumen';
    const identifier = document.getElementById('passwordResetIdentifier')?.value || '';

    try {
        await requestPasswordReset(identifier, role);
        closeModal('modalPasswordReset');
        showToast(PASSWORD_RESET_GENERIC_SUCCESS_MESSAGE, 'success');
    } catch (error) {
        if (isEdgeFunctionDependencyError(error, 'request-password-reset')) {
            void refreshPublicAuthBackendNotice({ force: true });
        }
        console.error('Permintaan lupa sandi gagal:', error);
        showToast(toUserFacingError(error, 'Permintaan reset password gagal.'), 'error');
    }

    return false;
}

function resetChangePasswordForm(options = {}) {
    document.getElementById('formChangePassword')?.reset();
    runtimeState.changePasswordCodeSent = false;
    runtimeState.changePasswordCodeSending = false;
    runtimeState.changePasswordSubmitting = false;
    runtimeState.changePasswordMode = options.mode || runtimeState.changePasswordMode || 'profile';

    const isRecoveryMode = runtimeState.changePasswordMode === 'recovery';
    const title = document.getElementById('changePasswordTitle');
    const intro = document.getElementById('changePasswordIntro');
    const verificationCard = document.getElementById('changePasswordVerificationCard');
    const verificationHelp = document.getElementById('changePasswordVerificationHelp');
    const nonceGroup = document.getElementById('changePasswordNonceGroup');
    const status = document.getElementById('changePasswordStatus');
    const submitButton = document.getElementById('btnSubmitChangePassword');
    const sendButton = document.getElementById('btnSendPasswordChangeCode');

    if (title) title.textContent = isRecoveryMode ? 'Atur Sandi Baru' : 'Ubah Sandi';
    if (intro) {
        intro.textContent = isRecoveryMode
            ? 'Tautan reset sudah tervalidasi. Masukkan sandi baru Anda untuk menyelesaikan pemulihan akun.'
            : 'Untuk keamanan, kirim kode verifikasi terlebih dahulu lalu masukkan sandi baru Anda.';
    }
    if (verificationCard) verificationCard.hidden = isRecoveryMode;
    if (nonceGroup) nonceGroup.hidden = isRecoveryMode;
    if (verificationHelp) {
        verificationHelp.textContent = 'Klik tombol di bawah untuk mengirim kode verifikasi ganti sandi lewat Supabase Auth ke email verifikasi akun yang aktif.';
    }
    if (status) {
        status.textContent = isRecoveryMode
            ? 'Session recovery aktif. Sandi baru akan langsung diterapkan setelah disimpan.'
            : 'Belum ada kode verifikasi yang dikirim.';
    }
    if (submitButton) submitButton.textContent = isRecoveryMode ? 'Simpan Sandi Baru' : 'Perbarui Sandi';
    if (sendButton) {
        sendButton.disabled = false;
        sendButton.textContent = 'Kirim Kode Verifikasi';
    }
}

function resetSensitiveEmailModalState() {
    document.getElementById('formSensitiveEmail')?.reset();
    runtimeState.sensitiveEmailSubmitting = false;
    const profile = remoteState.profile;
    const currentEmail = getUsableVerificationEmail(profile, remoteState.user);
    const title = document.getElementById('sensitiveEmailTitle');
    const intro = document.getElementById('sensitiveEmailIntro');
    const currentInput = document.getElementById('sensitiveEmailCurrent');
    const nextInput = document.getElementById('sensitiveEmailNext');
    const help = document.getElementById('sensitiveEmailHelp');
    const status = document.getElementById('sensitiveEmailStatus');
    const submitButton = document.getElementById('btnSubmitSensitiveEmail');

    if (title) title.textContent = currentEmail ? 'Ubah Email Verifikasi' : 'Tambahkan Email Verifikasi';
    if (intro) {
        intro.textContent = currentEmail
            ? 'Masukkan email verifikasi baru. Perubahan data sensitif tetap dipisahkan dari verifikasi admin akun.'
            : 'Akun ini belum punya email verifikasi yang valid. Tambahkan email terlebih dahulu sebelum mengubah sandi atau data akun sensitif.';
    }
    if (currentInput) currentInput.value = currentEmail;
    if (nextInput) nextInput.value = '';
    if (help) {
        help.textContent = currentEmail
            ? 'Supabase akan mengirim verifikasi perubahan email sesuai konfigurasi keamanan project.'
            : 'Jika project masih mengharuskan konfirmasi ke email lama sintetis yang tidak bisa diakses user, admin perlu membantu aktivasi email pertama lewat backend atau pengaturan auth.';
    }
    if (status) status.textContent = currentEmail
        ? 'Belum ada permintaan perubahan email.'
        : 'Belum ada email verifikasi aktif pada akun ini.';
    if (submitButton) submitButton.disabled = false;
}

function openSensitiveEmailModal() {
    resetSensitiveEmailModalState();
    const modal = document.getElementById('modalSensitiveEmail');
    if (modal) modal.style.display = 'flex';
}

async function handleSensitiveEmailSubmit(event) {
    event.preventDefault();
    if (runtimeState.sensitiveEmailSubmitting) return false;
    if (!canUseSupabase()) {
        showToast('Supabase client belum siap.', 'error');
        return false;
    }

    const nextEmail = normalizeEmail(document.getElementById('sensitiveEmailNext')?.value || '');
    const status = document.getElementById('sensitiveEmailStatus');
    const submitButton = document.getElementById('btnSubmitSensitiveEmail');
    const hadUsableEmail = Boolean(getUsableVerificationEmail(remoteState.profile, remoteState.user));

    if (!nextEmail) {
        showToast('Masukkan email verifikasi yang valid.', 'warning');
        return false;
    }

    runtimeState.sensitiveEmailSubmitting = true;
    if (submitButton) submitButton.disabled = true;
    if (status) status.textContent = 'Mengirim permintaan verifikasi email...';

    try {
        const { error } = await supabaseClient.auth.updateUser(
            { email: nextEmail },
            { emailRedirectTo: getAppBaseUrl() }
        );
        if (error) throw error;

        if (status) {
            status.textContent = hadUsableEmail
                ? `Konfirmasi perubahan email dikirim ke ${nextEmail}. Selesaikan verifikasi dari email tersebut.`
                : `Permintaan aktivasi email verifikasi dikirim ke ${nextEmail}. Jika project masih meminta konfirmasi ke email lama sintetis, admin perlu membantu aktivasi email pertama.`;
        }
        showToast(
            hadUsableEmail
                ? `Verifikasi perubahan email dikirim ke ${nextEmail}.`
                : `Permintaan aktivasi email verifikasi dikirim ke ${nextEmail}.`,
            'success'
        );
        closeModal('modalSensitiveEmail');
    } catch (error) {
        console.error('Gagal memulai perubahan email verifikasi:', error);
        if (status) status.textContent = toUserFacingError(error, 'Gagal memulai perubahan email verifikasi.');
        showToast(toUserFacingError(error, 'Gagal memulai perubahan email verifikasi.'), 'error');
    } finally {
        runtimeState.sensitiveEmailSubmitting = false;
        if (submitButton) submitButton.disabled = false;
    }

    return false;
}

function openChangePasswordModal(mode = 'profile') {
    if (mode !== 'recovery' && !getUsableVerificationEmail(remoteState.profile, remoteState.user)) {
        openSensitiveEmailModal();
        showToast('Tambahkan email verifikasi yang valid terlebih dahulu sebelum mengubah sandi.', 'warning');
        return;
    }
    resetChangePasswordForm({ mode });
    const modal = document.getElementById('modalChangePassword');
    if (modal) modal.style.display = 'flex';
}

function closeChangePasswordModal() {
    if (runtimeState.passwordRecoveryActive) {
        runtimeState.passwordRecoveryActive = false;
        window.history.replaceState({}, document.title, getAppBaseUrl());
        void logoutSupabase().catch(() => {});
        resetChangePasswordForm({ mode: 'profile' });
        closeModal('modalChangePassword');
        showLoginPage();
        showToast('Pemulihan sandi dibatalkan. Anda bisa meminta tautan reset baru kapan saja.', 'warning');
        return;
    }
    resetChangePasswordForm({ mode: runtimeState.passwordRecoveryActive ? 'recovery' : 'profile' });
    closeModal('modalChangePassword');
}

async function sendPasswordChangeVerificationCode() {
    if (runtimeState.changePasswordCodeSending) return false;
    if (!canUseSupabase()) {
        showToast('Supabase client belum siap.', 'error');
        return false;
    }

    const profile = await requireAuthenticatedProfile(false);
    if (!profile) return false;
    const verificationEmail = getUsableVerificationEmail(profile, remoteState.user);
    if (!verificationEmail) {
        openSensitiveEmailModal();
        showToast('Akun ini belum punya email verifikasi yang aktif. Tambahkan email valid terlebih dahulu.', 'warning');
        return false;
    }

    const sendButton = document.getElementById('btnSendPasswordChangeCode');
    const status = document.getElementById('changePasswordStatus');
    runtimeState.changePasswordCodeSending = true;
    if (sendButton) {
        sendButton.disabled = true;
        sendButton.textContent = 'Mengirim...';
    }
    if (status) status.textContent = 'Mengirim kode verifikasi ganti sandi...';

    try {
        if (typeof supabaseClient.auth.reauthenticate !== 'function') {
            throw new Error('Fitur reauthentication Supabase belum tersedia di client ini.');
        }
        const { error } = await supabaseClient.auth.reauthenticate();
        if (error) throw error;
        runtimeState.changePasswordCodeSent = true;
        if (status) status.textContent = `Kode verifikasi sudah dikirim ke ${verificationEmail}. Cek inbox email tersebut lalu masukkan kode di kolom verifikasi.`;
        showToast(`Kode verifikasi ganti sandi dikirim ke ${verificationEmail}.`, 'success');
    } catch (error) {
        console.error('Gagal mengirim kode verifikasi ganti sandi:', error);
        if (status) status.textContent = toUserFacingError(error, 'Gagal mengirim kode verifikasi ganti sandi.');
        showToast(toUserFacingError(error, 'Gagal mengirim kode verifikasi ganti sandi.'), 'error');
    } finally {
        runtimeState.changePasswordCodeSending = false;
        if (sendButton) {
            sendButton.disabled = false;
            sendButton.textContent = runtimeState.changePasswordCodeSent ? 'Kirim Ulang Kode' : 'Kirim Kode Verifikasi';
        }
    }

    return false;
}

async function finalizePasswordChangeSuccess(message = 'Sandi berhasil diperbarui.') {
    showToast(message, 'success');
    const modal = document.getElementById('modalChangePassword');
    if (modal) modal.style.display = 'none';

    if (runtimeState.passwordRecoveryActive) {
        runtimeState.passwordRecoveryActive = false;
        window.history.replaceState({}, document.title, getAppBaseUrl());
        const profile = await bootstrapSessionFromSupabase({ redirect: false, silentGuard: true }).catch(() => null);
        if (profile) {
            await redirectUserByRole(profile);
            return;
        }
        showLoginPage();
        return;
    }

    const profile = await requireAuthenticatedProfile(false);
    if (profile) await renderCurrentView();
}

async function handleChangePasswordSubmit(event) {
    event.preventDefault();
    if (runtimeState.changePasswordSubmitting) return false;

    const isRecoveryMode = runtimeState.changePasswordMode === 'recovery';
    const nonce = String(document.getElementById('changePasswordNonce')?.value || '').trim();
    const newPassword = String(document.getElementById('changePasswordNew')?.value || '');
    const confirmPassword = String(document.getElementById('changePasswordConfirm')?.value || '');
    const status = document.getElementById('changePasswordStatus');

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
        showToast(`Password minimal ${PASSWORD_MIN_LENGTH} karakter.`, 'warning');
        return false;
    }
    if (newPassword !== confirmPassword) {
        showToast('Konfirmasi sandi baru belum sama.', 'warning');
        return false;
    }
    if (!isRecoveryMode && !nonce) {
        showToast('Masukkan kode verifikasi ganti sandi terlebih dahulu.', 'warning');
        return false;
    }

    runtimeState.changePasswordSubmitting = true;
    if (status) status.textContent = 'Menyimpan sandi baru...';

    try {
        const updatePayload = {
            password: newPassword
        };
        if (!isRecoveryMode) updatePayload.nonce = nonce;
        const { error } = await supabaseClient.auth.updateUser(updatePayload);
        if (error) throw error;
        if (status) {
            status.textContent = isRecoveryMode
                ? 'Sandi baru berhasil disimpan. Session recovery akan ditutup ke flow login normal.'
                : 'Sandi berhasil diperbarui dan sesi akun tetap aman.';
        }
        await finalizePasswordChangeSuccess(isRecoveryMode
            ? 'Sandi baru berhasil disimpan. Anda bisa melanjutkan login dengan sandi tersebut.'
            : 'Sandi berhasil diperbarui.');
    } catch (error) {
        console.error('Gagal memperbarui sandi:', error);
        if (status) status.textContent = toUserFacingError(error, 'Gagal memperbarui sandi.');
        showToast(toUserFacingError(error, 'Gagal memperbarui sandi.'), 'error');
    } finally {
        runtimeState.changePasswordSubmitting = false;
    }

    return false;
}

function hasPasswordRecoveryContext() {
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams((url.hash || '').replace(/^#/, ''));
    const queryParams = url.searchParams;
    const type = String(hashParams.get('type') || queryParams.get('type') || '').trim().toLowerCase();
    return type === 'recovery';
}

function activatePasswordRecoveryMode() {
    runtimeState.passwordRecoveryActive = true;
    openChangePasswordModal('recovery');
}

function getLocalUiCache() {
    const data = getData();
    data.uiCache = data.uiCache || { teknisiDocsByUser: {} };
    return data.uiCache;
}

function updateLocalUiCache(mutator) {
    const data = getData();
    data.uiCache = data.uiCache || { teknisiDocsByUser: {} };
    mutator(data.uiCache);
    saveData(data);
    return data.uiCache;
}

function getTeknisiDocsForUser(userId) {
    const cache = getLocalUiCache();
    const localDocs = cache.teknisiDocsByUser?.[userId] || { ktpPhoto: '', selfiePhoto: '' };
    if (remoteState.profile?.id !== userId) return localDocs;
    return {
        ktpPhoto: remoteState.profile.ktpPhotoUrl || localDocs.ktpPhoto || '',
        selfiePhoto: remoteState.profile.selfiePhotoUrl || localDocs.selfiePhoto || '',
        ktpPhotoPath: remoteState.profile.ktpPhotoPath || '',
        selfiePhotoPath: remoteState.profile.selfiePhotoPath || ''
    };
}


function clearImagePreviewState(target, options = {}) {
    switch (target) {
    case 'register-teknisi-ktp':
        draftUploads.regTekKtpPhoto = '';
        draftUploads.regTekKtpFile = null;
        draftUploads.ocrLastResult = null;
        const regKtpPreview = document.getElementById('regTekIDPreview');
        const ocrPreviewCard = document.getElementById('ocrPreviewCard');
        if (regKtpPreview) regKtpPreview.innerHTML = '';
        clearInputFileValue('regTekIDCamera');
        clearInputFileValue('regTekIDDevice');
        setElementText('ocrStatus', 'OCR siap digunakan setelah foto KTP diunggah. Form tetap bisa dikirim tanpa upload KTP.');
        setElementText('ocrProgress', '');
        if (ocrPreviewCard) ocrPreviewCard.style.display = 'none';
        break;
    case 'register-teknisi-selfie':
        draftUploads.regTekSelfiePhoto = '';
        draftUploads.regTekSelfieFile = null;
        const regSelfiePreview = document.getElementById('regTekSelfiePreview');
        if (regSelfiePreview) regSelfiePreview.innerHTML = '';
        clearInputFileValue('regTekSelfieCamera');
        clearInputFileValue('regTekSelfieDevice');
        break;
    default:
        break;
    }
}

async function updateOrderForCurrentTeknisi(orderId, payload = {}) {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'teknisi') throw new Error('Session teknisi dibutuhkan.');

    const { data } = await withOrderColumnFallback(
        ({ selectClause, payload: safePayload }) => supabaseClient
            .from('orders')
            .update(safePayload)
            .eq('id', orderId)
            .eq('teknisi_id', profile.id)
            .select(selectClause)
            .single(),
        {
            context: `updateOrderForCurrentTeknisi:${orderId}`,
            payload
        }
    );

    return mapOrderRecord(data, { fallbackSnapshot: payload });
}

async function persistUploadedImageReference(options = {}) {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile) throw new Error('Session login dibutuhkan untuk menyimpan referensi gambar.');

    if (options.target === 'konsumen-unit') {
        clearMissingProfileColumns(['ac_units']);
        const nextUnits = normalizeAcUnitArray(options.units);
        const updatedProfile = await upsertOwnProfile(validateProfilePayloadForRole('konsumen', {
            ...profile,
            referral: options.referral ?? profile.referral,
            ac_units: nextUnits
        }));
        const persistedUnits = getProfileAcUnits(updatedProfile);
        const metadataRequired = nextUnits.some(hasAcUnitStructuredData);
        const metadataLost = metadataRequired && nextUnits.some((unit, index) => {
            const persisted = findMatchingPersistedAcUnit(persistedUnits, unit, index);
            return !persisted
                || persisted.brand !== unit.brand
                || persisted.type !== unit.type
                || persisted.refrigerant !== unit.refrigerant
                || persisted.capacity !== unit.capacity;
        });
        if (metadataLost) {
            throw new Error('Metadata unit AC belum bisa dikonfirmasi dari profile setelah penyimpanan. Coba simpan ulang sebentar lagi.');
        }
        applySupabaseSession(updatedProfile);
        return updatedProfile;
    }

    if (options.target === 'teknisi-ktp' || options.target === 'teknisi-selfie') {
        const updatedProfile = await upsertOwnProfile(validateProfilePayloadForRole('teknisi', {
            ...profile,
            ktp_photo_path: options.target === 'teknisi-ktp' ? options.path : profile.ktpPhotoPath,
            ktp_photo_url: options.target === 'teknisi-ktp' ? options.url : profile.ktpPhotoUrl,
            selfie_photo_path: options.target === 'teknisi-selfie' ? options.path : profile.selfiePhotoPath,
            selfie_photo_url: options.target === 'teknisi-selfie' ? options.url : profile.selfiePhotoUrl
        }));
        if (options.target === 'teknisi-ktp' && options.path && updatedProfile.ktpPhotoPath !== options.path) {
            await deleteImageFromSupabaseStorage({ bucket: getPrivateDocumentBucket(), path: options.path, url: options.url });
            throw new Error('Kolom storage foto KTP belum siap di schema profiles. Jalankan migration storage terlebih dahulu.');
        }
        if (options.target === 'teknisi-selfie' && options.path && updatedProfile.selfiePhotoPath !== options.path) {
            await deleteImageFromSupabaseStorage({ bucket: getPrivateDocumentBucket(), path: options.path, url: options.url });
            throw new Error('Kolom storage foto diri belum siap di schema profiles. Jalankan migration storage terlebih dahulu.');
        }
        applySupabaseSession(updatedProfile);
        updateLocalUiCache((cache) => {
            cache.teknisiDocsByUser[profile.id] = cache.teknisiDocsByUser[profile.id] || { ktpPhoto: '', selfiePhoto: '' };
            if (options.target === 'teknisi-ktp') cache.teknisiDocsByUser[profile.id].ktpPhoto = options.url || '';
            if (options.target === 'teknisi-selfie') cache.teknisiDocsByUser[profile.id].selfiePhoto = options.url || '';
        });
        return updatedProfile;
    }

    throw new Error('Persist referensi gambar belum didukung untuk target ini.');
}

async function removeUploadedImage(options = {}) {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile) throw new Error('Session login dibutuhkan untuk menghapus gambar.');

    if (options.target === 'konsumen-unit') {
        const currentUnits = getProfileAcUnits(profile);
        const targetIndex = Number(options.index);
        if (!Number.isInteger(targetIndex) || targetIndex < 0) throw new Error('Index gambar unit tidak valid.');
        const nextUnits = currentUnits.filter((_, index) => index !== targetIndex);
        return persistUploadedImageReference({
            target: 'konsumen-unit',
            units: nextUnits
        });
    }

    if (options.target === 'teknisi-ktp' || options.target === 'teknisi-selfie') {
        const isKtp = options.target === 'teknisi-ktp';
        const path = isKtp ? profile.ktpPhotoPath : profile.selfiePhotoPath;
        const url = isKtp ? profile.ktpPhotoUrl : profile.selfiePhotoUrl;
        await deleteImageFromSupabaseStorage({
            bucket: getPrivateDocumentBucket(),
            path,
            url
        });
        const updatedProfile = await persistUploadedImageReference({
            target: options.target,
            path: '',
            url: ''
        });
        await syncDeletionToRemote({
            target: options.target,
            profileId: profile.id,
            path,
            bucket: getPrivateDocumentBucket()
        });
        return updatedProfile;
    }

    throw new Error('Target hapus gambar belum didukung.');
}

function clearRemoteSessionState(options = {}) {
    remoteState.session = null;
    remoteState.user = null;
    remoteState.profile = null;
    remoteState.currentOrders = [];
    remoteState.adminProfiles = { konsumen: [], teknisi: [], admin: [] };
    remoteState.adminOrders = [];
    currentRole = null;
    runtimeState.profileEditor.konsumen = {
        isEditing: false,
        isDirty: false,
        submitting: false,
        snapshot: null
    };
    runtimeState.konsumenUnitDraft = createEmptyKonsumenUnitDraftState();
    resetPasswordConfirmModal();
    closeModal('modalPasswordConfirm');
    if (!options.preserveView) currentView = null;
}

function sanitizeProfileRecord(profile) {
    if (!profile) return null;
    const normalizedUnits = normalizeAcUnitArray(profile.ac_units || profile.acUnits);
    return {
        ...profile,
        role: String(profile.role || '').trim().toLowerCase(),
        username: String(profile.username || '').trim(),
        name: String(profile.name || '').trim(),
        email: normalizeEmail(profile.email),
        authEmail: normalizeEmail(profile.auth_email || profile.authEmail || profile.email),
        phone: normalizePhone(profile.phone),
        address: String(profile.address || '').trim(),
        status: normalizeProfileStatus(profile.status || PROFILE_STATUS_PENDING),
        age: profile.age ?? (calculateAge(profile.birth_date || profile.birthDate) || ''),
        birth_date: profile.birth_date || profile.birthDate || '',
        birthDate: profile.birth_date || profile.birthDate || '',
        joinedAt: profile.created_at || profile.joinedAt || '',
        completed_jobs: Number(profile.completed_jobs || 0),
        completedJobs: Number(profile.completed_jobs || profile.completedJobs || 0),
        experience: Number(profile.experience || 0),
        district: String(profile.district || '').trim(),
        locationText: String(profile.location_text || profile.locationText || '').trim(),
        lat: profile.lat || '',
        lng: profile.lng || '',
        referral: String(profile.referral || '').trim(),
        nik: String(profile.nik || '').trim(),
        specialization: String(profile.specialization || '').trim(),
        verifiedAt: profile.verified_at || profile.verifiedAt || '',
        verifiedBy: profile.verified_by || profile.verifiedBy || '',
        verifiedByName: profile.verified_by_name || profile.verifiedByName || '',
        acUnits: normalizedUnits,
        ktpPhotoPath: String(profile.ktp_photo_path || profile.ktpPhotoPath || '').trim(),
        ktpPhotoUrl: String(profile.ktp_photo_url || profile.ktpPhotoUrl || '').trim(),
        selfiePhotoPath: String(profile.selfie_photo_path || profile.selfiePhotoPath || '').trim(),
        selfiePhotoUrl: String(profile.selfie_photo_url || profile.selfiePhotoUrl || '').trim(),
        ktpPhoto: String(profile.ktp_photo_url || profile.ktpPhotoUrl || profile.ktpPhoto || '').trim(),
        selfiePhoto: String(profile.selfie_photo_url || profile.selfiePhotoUrl || profile.selfiePhoto || '').trim()
    };
}

function findKnownProfileById(userId = '') {
    const normalizedId = String(userId || '').trim();
    if (!normalizedId) return null;

    if (remoteState.profile?.id === normalizedId) return remoteState.profile;

    for (const role of ['konsumen', 'teknisi', 'admin']) {
        const remoteMatch = (remoteState.adminProfiles?.[role] || []).find((profile) => profile.id === normalizedId);
        if (remoteMatch) return remoteMatch;
    }

    const localUsers = getData()?.users || {};
    for (const role of ['konsumen', 'teknisi', 'admin']) {
        const localMatch = (localUsers[role] || []).find((profile) => profile.id === normalizedId);
        if (localMatch) return localMatch;
    }

    return null;
}

function resolveKnownProfileName(userId = '', fallback = '') {
    return findKnownProfileById(userId)?.name || fallback || '';
}

function resolveKnownServiceName(serviceId = '', fallback = '') {
    const normalizedId = String(serviceId || '').trim();
    if (!normalizedId) return fallback || '';
    const service = getServices(false).find((item) => item.id === normalizedId);
    return service?.name || fallback || '';
}

function findKnownAcUnitForOrder(order = {}, fallbackSnapshot = {}) {
    const konsumenId = order.konsumen_id || order.konsumenId || fallbackSnapshot.konsumen_id || fallbackSnapshot.konsumenId || '';
    const acUnitKey = order.ac_unit_key || order.acUnitKey || fallbackSnapshot.ac_unit_key || fallbackSnapshot.acUnitKey || '';
    if (!konsumenId || !acUnitKey) return null;

    const profile = findKnownProfileById(konsumenId);
    return getProfileAcUnits(profile).find((unit) => unit.key === acUnitKey) || null;
}

function mapOrderRecord(order, options = {}) {
    if (!order) return null;
    const fallbackSnapshot = options.fallbackSnapshot || {};
    const serviceId = order.service_id || order.serviceId || fallbackSnapshot.service_id || fallbackSnapshot.serviceId || '';
    const konsumenId = order.konsumen_id || order.konsumenId || fallbackSnapshot.konsumen_id || fallbackSnapshot.konsumenId || null;
    const teknisiId = order.teknisi_id || order.teknisiId || fallbackSnapshot.teknisi_id || fallbackSnapshot.teknisiId || null;
    const selectedUnit = findKnownAcUnitForOrder(order, fallbackSnapshot);

    return {
        ...order,
        displayId: order.order_number || order.orderNumber || fallbackSnapshot.order_number || fallbackSnapshot.orderNumber || order.id,
        serviceId,
        serviceName: resolveKnownServiceName(
            serviceId,
            order.service_name || order.serviceName || fallbackSnapshot.service_name || fallbackSnapshot.serviceName || ''
        ) || '-',
        preferredDate: order.preferred_date || order.preferredDate || fallbackSnapshot.preferred_date || fallbackSnapshot.preferredDate || '',
        konsumenId,
        konsumenName: resolveKnownProfileName(
            konsumenId,
            order.konsumen_name || order.konsumenName || fallbackSnapshot.konsumen_name || fallbackSnapshot.konsumenName || ''
        ) || '-',
        teknisiId,
        teknisiName: resolveKnownProfileName(
            teknisiId,
            order.teknisi_name || order.teknisiName || fallbackSnapshot.teknisi_name || fallbackSnapshot.teknisiName || ''
        ) || null,
        brand: normalizeAcSpecValue('brand', order.brand || fallbackSnapshot.brand || selectedUnit?.brand),
        acType: normalizeAcSpecValue(
            'type',
            order.ac_type || order.acType || order.jenis_ac || fallbackSnapshot.ac_type || fallbackSnapshot.acType || selectedUnit?.type
        ),
        pk: normalizeAcSpecValue(
            'capacity',
            order.pk || order.ac_capacity || order.acCapacity || fallbackSnapshot.pk || selectedUnit?.capacity
        ),
        refrigerant: normalizeAcSpecValue('refrigerant', order.refrigerant || fallbackSnapshot.refrigerant || selectedUnit?.refrigerant),
        phone: normalizePhone(order.phone || fallbackSnapshot.phone || ''),
        address: normalizeWhitespace(order.address || fallbackSnapshot.address || ''),
        notes: normalizeWhitespace(order.notes || fallbackSnapshot.notes || ''),
        acUnitKey: order.ac_unit_key || order.acUnitKey || fallbackSnapshot.ac_unit_key || fallbackSnapshot.acUnitKey || '',
        createdAt: order.created_at || order.createdAt || '',
        adminConfirmationText: order.admin_confirmation_text || order.adminConfirmationText || fallbackSnapshot.admin_confirmation_text || fallbackSnapshot.adminConfirmationText || '',
        verifiedAt: order.verified_at || order.verifiedAt || fallbackSnapshot.verified_at || fallbackSnapshot.verifiedAt || '',
        verifiedBy: order.verified_by || order.verifiedBy || fallbackSnapshot.verified_by || fallbackSnapshot.verifiedBy || '',
        verifiedByName: order.verified_by_name || order.verifiedByName || fallbackSnapshot.verified_by_name || fallbackSnapshot.verifiedByName || ''
    };
}

function getOrderLabel(order) {
    return order?.displayId || order?.id || '-';
}

function isAdminProfile(profileOrRole) {
    if (!profileOrRole) return false;
    if (typeof profileOrRole === 'string') return profileOrRole === 'admin';
    return profileOrRole.role === 'admin';
}

function getAdminAccessDeniedMessage() {
    return 'Dashboard admin hanya tersedia di localhost.';
}

function canAccessAdmin(profileOrRole = null) {
    if (!isLocalhostEnv()) return false;
    if (profileOrRole == null) return true;
    return isAdminProfile(profileOrRole);
}

function isAdminRoute(routeName = '') {
    return typeof routeName === 'string' && routeName.startsWith('admin-');
}

function clearAdminViewState() {
    if (isAdminRoute(currentView)) currentView = null;
    currentUserTab = 'konsumen';
    const adminFilter = document.getElementById('adminFilterStatus');
    if (adminFilter) adminFilter.value = 'all';
}

function resetLoginRoleToConsumer() {
    const loginRoleInput = document.getElementById('loginRole');
    const consumerTab = document.getElementById('loginRoleTab-konsumen');
    const adminTab = document.getElementById('loginRoleTab-admin');

    if (loginRoleInput) loginRoleInput.value = 'konsumen';
    document.querySelectorAll('.login-role-tabs .tab').forEach((button) => {
        button.classList.toggle('active', button === consumerTab);
        button.setAttribute('aria-selected', String(button === consumerTab));
    });

    if (consumerTab) {
        consumerTab.classList.add('active');
        consumerTab.setAttribute('aria-selected', 'true');
    }

    if (adminTab) {
        adminTab.classList.remove('active');
        adminTab.setAttribute('aria-selected', 'false');
    }

    document.querySelectorAll('#roleCards .role-card[data-role]').forEach((card) => {
        const active = card.dataset.role === 'konsumen';
        card.classList.toggle('active', active);
        card.setAttribute('aria-pressed', String(active));
    });

    syncLoginRoleCopy('konsumen');
}

async function forceExitAdminOnPublicHost(options = {}) {
    if (isLocalhostEnv()) return false;

    const message = options.message || getAdminAccessDeniedMessage();

    try {
        clearAdminViewState();
    } catch (_) {}

    try {
        resetLoginRoleToConsumer();
    } catch (_) {}

    try {
        if (supabaseClient?.auth) {
            await supabaseClient.auth.signOut();
        }
    } catch (_) {}

    try {
        clearRemoteSessionState({ preserveView: false });
    } catch (_) {}

    try {
        document.getElementById('formLogin')?.reset();
    } catch (_) {}

    try {
        syncAdminAccessUI();
    } catch (_) {}

    try {
        if (typeof showLanding === 'function') {
            showLanding();
        }
    } catch (_) {}

    if (!options.silent) {
        try {
            if (typeof showToast === 'function') {
                showToast(message, 'warning');
            } else if (typeof showAlert === 'function') {
                showAlert(message);
            }
        } catch (_) {}
    }

    return true;
}

function hideAdminForPublic() {
    syncAdminAccessUI();
}

function syncAdminAccessUI() {
    const allowAdmin = isLocalhostEnv();
    const adminCard = document.getElementById('roleAdmin');
    const adminTab = document.getElementById('loginRoleTab-admin');
    const consumerTab = document.getElementById('loginRoleTab-konsumen');
    const loginRoleInput = document.getElementById('loginRole');
    const roleCards = document.getElementById('roleCards') || document.querySelector('.role-cards');
    const localhostHint = document.getElementById('adminLocalhostHint');
    const adminSelected = loginRoleInput?.value === 'admin' || adminTab?.classList.contains('active');

    if (adminCard) {
        adminCard.hidden = !allowAdmin;
        adminCard.classList.toggle('is-hidden', !allowAdmin);
        adminCard.setAttribute('aria-hidden', String(!allowAdmin));
    }

    if (adminTab) {
        adminTab.hidden = !allowAdmin;
        adminTab.disabled = !allowAdmin;
        adminTab.setAttribute('aria-hidden', String(!allowAdmin));
        adminTab.tabIndex = allowAdmin ? 0 : -1;
        adminTab.classList.toggle('is-hidden', !allowAdmin);
    }

    if (roleCards) {
        roleCards.classList.toggle('role-cards--admin-visible', allowAdmin);
        roleCards.classList.toggle('role-cards--admin-hidden', !allowAdmin);
    }

    if (localhostHint) {
        localhostHint.hidden = allowAdmin;
    }

    if (!allowAdmin) {
        if (loginRoleInput?.value === 'admin') {
            loginRoleInput.value = 'konsumen';
        }

        if (adminTab) {
            adminTab.classList.remove('active');
            adminTab.setAttribute('aria-selected', 'false');
        }

        if (adminSelected && consumerTab) {
            consumerTab.classList.add('active');
            consumerTab.setAttribute('aria-selected', 'true');
        }

        if (adminSelected) {
            resetLoginRoleToConsumer();
        }
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

function syncAppBranding(profile = remoteState.profile) {
    const titleEl = document.getElementById('appBrandTitle');
    const taglineEl = document.getElementById('appBrandTagline');
    const activeRole = profile?.role || '';
    const brandTitle = APP_BRAND_TITLE_BY_ROLE[activeRole] || 'Indo Sejuk AC';
    const brandTagline = DEFAULT_APP_TAGLINE;
    const pageTitle = activeRole
        ? brandTitle
        : `${brandTitle} - ${brandTagline}`;

    if (titleEl) titleEl.textContent = brandTitle;
    if (taglineEl) taglineEl.textContent = brandTagline;
    document.title = pageTitle;

    const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleTitleMeta) appleTitleMeta.setAttribute('content', brandTitle);
}

async function syncHeaderUserAvatar(user = getCurrentUser(), options = {}) {
    const avatarEl = document.getElementById('headerAvatar');
    const imageEl = avatarEl?.querySelector('.user-avatar__image');
    if (!avatarEl || !imageEl) return;
    imageEl.hidden = false;
    imageEl.src = FALLBACK_IMAGE;
    imageEl.alt = '';
    avatarEl.classList.remove('user-avatar--fallback', 'user-avatar--photo');
    avatarEl.setAttribute('aria-label', 'Logo Indo Sejuk AC');
}

function buildProfileSyncSignature(profile = {}) {
    return [
        profile.id || '',
        profile.role || '',
        profile.status || '',
        profile.name || '',
        profile.username || '',
        profile.phone || '',
        profile.address || '',
        profile.updatedAt || '',
        profile.verifiedAt || ''
    ].join('|');
}

function buildOrderSyncSignature(orders = []) {
    return orders.map((order) => [
        order.id || '',
        order.status || '',
        order.konsumenId || '',
        order.teknisiId || '',
        order.serviceId || '',
        order.preferredDate || '',
        order.updatedAt || order.createdAt || '',
        order.adminConfirmationText || ''
    ].join('|')).join('||');
}

function buildManagedProfileSyncSignature(profiles = []) {
    return profiles.map((profile) => [
        profile.id || '',
        profile.role || '',
        profile.status || '',
        profile.name || '',
        profile.username || '',
        profile.updatedAt || profile.joinedAt || '',
        profile.verifiedAt || ''
    ].join('|')).join('||');
}

function getCurrentLiveDataSyncSignature() {
    const profile = remoteState.profile || {};
    if (isAdminProfile(profile)) {
        return [
            buildProfileSyncSignature(profile),
            buildOrderSyncSignature(remoteState.adminOrders),
            buildManagedProfileSyncSignature(remoteState.adminProfiles.konsumen),
            buildManagedProfileSyncSignature(remoteState.adminProfiles.teknisi),
            buildManagedProfileSyncSignature(remoteState.adminProfiles.admin)
        ].join('###');
    }

    return [
        buildProfileSyncSignature(profile),
        buildOrderSyncSignature(remoteState.currentOrders)
    ].join('###');
}

function hasOpenModalOverlay() {
    return Array.from(document.querySelectorAll('.modal-overlay')).some((element) => element instanceof HTMLElement && element.style.display === 'flex');
}

function shouldDeferLiveDataRender() {
    return hasOpenModalOverlay()
        || Boolean(runtimeState.profileEditor.konsumen?.isEditing)
        || Boolean(runtimeState.konsumenUnitDraft?.active);
}

async function syncLiveRoleData(options = {}) {
    if (!remoteState.profile || !canUseSupabase()) return false;
    if (runtimeState.liveDataSyncInFlight) return false;

    runtimeState.liveDataSyncInFlight = true;
    const previousSignature = runtimeState.liveDataSyncSignature || getCurrentLiveDataSyncSignature();

    try {
        await loadAccessibleProfileFromSession({ silent: true });
        syncAppBranding(remoteState.profile);
        const nextSignature = getCurrentLiveDataSyncSignature();
        const changed = nextSignature !== previousSignature;
        runtimeState.liveDataSyncSignature = nextSignature;

        if (!currentView) return changed;
        if (!options.forceRender && !changed) return changed;
        if (shouldDeferLiveDataRender()) return changed;

        renderAppShell();
        await renderCurrentView('', { skipRemoteLoad: true });
        return changed;
    } catch (error) {
        console.error('Sinkronisasi data live gagal:', error);
        return false;
    } finally {
        runtimeState.liveDataSyncInFlight = false;
    }
}

function startLiveDataSync() {
    if (runtimeState.liveDataSyncBound) return;

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && remoteState.profile) {
            void syncLiveRoleData({ forceRender: true });
        }
    });

    runtimeState.liveDataSyncIntervalId = window.setInterval(() => {
        if (document.visibilityState !== 'visible' || !remoteState.profile) return;
        void syncLiveRoleData();
    }, LIVE_DATA_SYNC_INTERVAL_MS);

    runtimeState.liveDataSyncBound = true;
}

function switchLoginRole(role, element) {
    const safeRole = ['konsumen', 'teknisi', 'admin'].includes(role) ? role : 'konsumen';

    if (safeRole === 'admin' && !canAccessAdmin('admin')) {
        syncAdminAccessUI();
        resetLoginRoleToConsumer();
        showToast(getAdminAccessDeniedMessage(), 'warning');
        return 'konsumen';
    }

    const input = document.getElementById('loginRole');
    if (input) input.value = safeRole;
    document.querySelectorAll('.login-role-tabs .tab').forEach((button) => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
    });

    const targetButton = element || document.getElementById(`loginRoleTab-${safeRole}`);
    if (targetButton) {
        targetButton.classList.add('active');
        targetButton.setAttribute('aria-selected', 'true');
    }

    document.querySelectorAll('#roleCards .role-card[data-role]').forEach((card) => {
        const active = card.dataset.role === safeRole;
        card.classList.toggle('active', active);
        card.setAttribute('aria-pressed', String(active));
    });

    syncLoginRoleCopy(safeRole);
    if (document.getElementById('modalPasswordReset')?.style.display === 'flex') {
        resetPasswordResetModalState();
    }

    return safeRole;
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
        email: normalizeEmail(metadata.contact_email || metadata.email),
        auth_email: normalizeEmail(metadata.auth_email || user?.email),
        phone: normalizePhone(metadata.phone),
        address: String(metadata.address || '').trim(),
        age: metadata.age || '',
        birth_date: metadata.birth_date || metadata.birthDate || '',
        district: String(metadata.district || '').trim(),
        location_text: String(metadata.location_text || metadata.locationText || '').trim(),
        lat: metadata.lat || '',
        lng: metadata.lng || '',
        referral: String(metadata.referral || '').trim(),
        ac_units: normalizeAcUnitArray(metadata.ac_units || metadata.acUnits || []),
        nik: String(metadata.nik || '').trim(),
        specialization: String(metadata.specialization || '').trim(),
        experience: metadata.experience || '',
        status: normalizeProfileStatus(metadata.status || PROFILE_STATUS_PENDING),
        verified_at: metadata.verified_at || metadata.verifiedAt || '',
        verified_by: metadata.verified_by || metadata.verifiedBy || ''
    };
}

function hasMeaningfulProfileValue(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
}

function mergeProfileDraft(...sources) {
    const merged = {};
    sources.forEach((source) => {
        Object.entries(source || {}).forEach(([key, value]) => {
            if (hasMeaningfulProfileValue(value)) {
                merged[key] = value;
            }
        });
    });
    return merged;
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
        email: normalizeEmail(payload.email),
        auth_email: normalizeEmail(payload.auth_email || payload.authEmail || remoteState.user?.email || ''),
        phone: normalizePhone(payload.phone),
        address: String(payload.address || '').trim(),
        age: payload.age,
        birth_date: payload.birth_date || payload.birthDate || '',
        district: String(payload.district || '').trim(),
        location_text: String(payload.location_text || payload.locationText || '').trim(),
        lat: payload.lat || '',
        lng: payload.lng || '',
        referral: String(payload.referral || '').trim(),
        status: normalizeProfileStatus(payload.status || (normalizedRole === 'admin' ? PROFILE_STATUS_ACTIVE : PROFILE_STATUS_PENDING)),
        verified_at: payload.verified_at || payload.verifiedAt || '',
        verified_by: payload.verified_by || payload.verifiedBy || '',
        completed_jobs: payload.completed_jobs ?? payload.completedJobs,
        ac_units: normalizeAcUnitArray(payload.ac_units ?? payload.acUnits),
        ktp_photo_path: payload.ktp_photo_path || payload.ktpPhotoPath || '',
        ktp_photo_url: payload.ktp_photo_url || payload.ktpPhotoUrl || '',
        selfie_photo_path: payload.selfie_photo_path || payload.selfiePhotoPath || '',
        selfie_photo_url: payload.selfie_photo_url || payload.selfiePhotoUrl || ''
    };

    if (!cleanPayload.id) throw new Error('User auth belum tersedia untuk profile.');
    if (!cleanPayload.username) throw new Error('Username wajib diisi.');
    if (!cleanPayload.name) throw new Error('Nama wajib diisi.');
    if (!cleanPayload.auth_email) throw new Error('Email auth wajib tersedia untuk profile.');
    if (normalizedRole === 'admin' && !cleanPayload.email) throw new Error('Email admin wajib diisi.');

    const result = {
        id: cleanPayload.id,
        role: cleanPayload.role,
        username: cleanPayload.username,
        name: cleanPayload.name,
        email: toNullableText(cleanPayload.email),
        auth_email: cleanPayload.auth_email,
        phone: toNullableText(cleanPayload.phone),
        address: toNullableText(cleanPayload.address),
        age: toNullableNumber(cleanPayload.age),
        birth_date: toNullableText(cleanPayload.birth_date),
        district: toNullableText(cleanPayload.district),
        location_text: toNullableText(cleanPayload.location_text),
        lat: toNullableText(cleanPayload.lat),
        lng: toNullableText(cleanPayload.lng),
        referral: toNullableText(cleanPayload.referral),
        status: cleanPayload.status,
        verified_at: toNullableText(cleanPayload.verified_at),
        verified_by: toNullableText(cleanPayload.verified_by),
        completed_jobs: toNullableNumber(cleanPayload.completed_jobs),
        ac_units: cleanPayload.ac_units
    };

    if (normalizedRole === 'teknisi') {
        result.nik = toNullableText(payload.nik);
        result.specialization = toNullableText(payload.specialization || 'Semua Layanan');
        result.experience = toNullableNumber(payload.experience);
        result.ktp_photo_path = toNullableText(cleanPayload.ktp_photo_path);
        result.ktp_photo_url = toNullableText(cleanPayload.ktp_photo_url);
        result.selfie_photo_path = toNullableText(cleanPayload.selfie_photo_path);
        result.selfie_photo_url = toNullableText(cleanPayload.selfie_photo_url);
    }

    return result;
}

function buildAuthenticatedProfilePayload(role, options = {}) {
    const authUser = options.authUser || remoteState.user;
    const metadataSeed = extractPendingProfileSeed(authUser);
    const normalizedExisting = sanitizeProfileRecord(options.existingProfile || null) || {};
    const normalizedRole = String(
        role ||
        normalizedExisting.role ||
        metadataSeed.role ||
        options.formPayload?.role ||
        ''
    ).trim().toLowerCase();

    if (!normalizedRole) {
        throw new Error('Role profile tidak ditemukan di metadata auth. Jalankan migrasi SQL provisioning profile lalu login kembali.');
    }

    const mergedDraft = mergeProfileDraft(
        normalizedExisting,
        metadataSeed,
        options.formPayload
    );
    const nextStatus = normalizeProfileStatus(
        mergedDraft.status
        || options.formPayload?.status
        || normalizedExisting.status
        || metadataSeed.status
        || (normalizedRole === 'admin' ? PROFILE_STATUS_ACTIVE : PROFILE_STATUS_PENDING)
    );

    return validateProfilePayloadForRole(normalizedRole, {
        ...mergedDraft,
        id: authUser?.id || mergedDraft.id,
        email: mergedDraft.email || options.formPayload?.email,
        auth_email: authUser?.email || mergedDraft.auth_email || mergedDraft.authEmail || options.formPayload?.auth_email || options.formPayload?.authEmail,
        role: normalizedRole,
        status: nextStatus,
        verified_at: nextStatus === PROFILE_STATUS_ACTIVE
            ? (normalizedExisting.verifiedAt || mergedDraft.verified_at || mergedDraft.verifiedAt || '')
            : (mergedDraft.verified_at || mergedDraft.verifiedAt || ''),
        verified_by: normalizedExisting.verifiedBy || mergedDraft.verified_by || mergedDraft.verifiedBy || '',
        completed_jobs: normalizedExisting.completed_jobs ?? normalizedExisting.completedJobs ?? mergedDraft.completed_jobs ?? mergedDraft.completedJobs
    }, {
        allowAdmin: Boolean(options.allowAdmin)
    });
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

    const { data } = await withProfileColumnFallback(
        ({ selectClause }) => supabaseClient
            .from('profiles')
            .select(selectClause)
            .eq('id', user.id)
            .maybeSingle(),
        { context: 'fetchCurrentProfileStrict' }
    );

    if (data) return sanitizeProfileRecord(data);
    if (options.allowCreate === false) throw new Error('Profile user belum tersedia di Supabase.');
    return createMissingProfileForAuthenticatedUser(user);
}

async function upsertOwnProfile(payload) {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');

    const { data } = await withProfileColumnFallback(
        ({ selectClause, payload: safePayload }) => supabaseClient
            .from('profiles')
            .upsert(safePayload, { onConflict: 'id' })
            .select(selectClause)
            .single(),
        {
            context: 'upsertOwnProfile',
            payload
        }
    );

    return sanitizeProfileRecord(data);
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
        email: metadataSeed.email,
        auth_email: metadataSeed.auth_email || user.email,
        status: metadataSeed.status || (metadataSeed.role === 'admin' ? PROFILE_STATUS_ACTIVE : PROFILE_STATUS_PENDING),
        verified_at: metadataSeed.verified_at || '',
        verified_by: metadataSeed.verified_by || ''
    });

    logApp('auth', 'Membuat profile yang belum tersedia dari metadata auth', {
        userId: user.id,
        role: metadataSeed.role
    });

    return upsertOwnProfile(payload);
}

async function ensureProfileAfterAuth(role, formPayload = {}, options = {}) {
    const user = options.authUser || await getSupabaseUser();
    if (!user) throw new Error('Session belum aktif setelah sign up.');

    let existingProfile = options.existingProfile || null;
    if (!existingProfile) {
        try {
            existingProfile = await fetchCurrentProfileStrict({ allowCreate: false });
        } catch (error) {
            if (!String(error?.message || '').includes('Profile user belum tersedia')) {
                throw error;
            }
        }
    }

    const payload = buildAuthenticatedProfilePayload(role, {
        authUser: user,
        existingProfile,
        formPayload
    });

    const profile = await upsertOwnProfile(payload);
    applySupabaseSession(profile);
    void syncNewUserToRemote(profile, {
        reason: options.reason || 'ensure-profile-after-auth'
    });
    return profile;
}

async function syncProfileAuthSnapshot(profile, options = {}) {
    if (!profile) return null;

    const authUser = options.authUser || remoteState.user || await getSupabaseUser();
    if (!authUser) return profile;

    const nextAuthEmail = normalizeEmail(authUser.email || profile.authEmail || profile.auth_email || '');
    const nextPublicEmail = isSyntheticAuthEmail(nextAuthEmail)
        ? normalizeEmail(profile.email || authUser.user_metadata?.contact_email || '')
        : normalizeEmail(nextAuthEmail || authUser.user_metadata?.contact_email || profile.email);

    const currentAuthEmail = normalizeEmail(profile.authEmail || profile.auth_email || '');
    const currentPublicEmail = normalizeEmail(profile.email || '');
    if (nextAuthEmail === currentAuthEmail && nextPublicEmail === currentPublicEmail) {
        return profile;
    }

    const payload = validateProfilePayloadForRole(profile.role, {
        ...profile,
        email: nextPublicEmail,
        auth_email: nextAuthEmail,
        status: profile.status,
        verified_at: profile.verifiedAt,
        verified_by: profile.verifiedBy
    }, {
        allowAdmin: isAdminProfile(profile)
    });

    return upsertOwnProfile(payload);
}

async function assertProfileAccess(profile, options = {}) {
    if (!profile || profile.role === 'admin' || isProfileApproved(profile)) return profile;

    const message = getProfileAccessBlockedMessage(profile) || 'Akun Anda belum dapat mengakses dashboard aktif.';

    if (options.signOut !== false && canUseSupabase()) {
        try {
            await supabaseClient.auth.signOut();
        } catch (_) {}
    }

    clearRemoteSessionState({ preserveView: false });

    if (!options.silent) {
        showToast(message, 'warning');
    }
    if (options.redirectToLanding !== false) {
        showLanding();
    }

    throw new Error(message);
}

async function requireAuthenticatedProfile(showMessage = true) {
    if (remoteState.profile) {
        if (isAdminProfile(remoteState.profile) && !canAccessAdmin(remoteState.profile)) {
            await forceExitAdminOnPublicHost({
                message: getAdminAccessDeniedMessage(),
                silent: !showMessage
            });
            return null;
        }
        return remoteState.profile;
    }

    if (!canUseSupabase()) {
        if (showMessage) showToast('Supabase client belum siap.', 'error');
        return null;
    }

    try {
        const rawProfile = await fetchCurrentProfileStrict();
        const syncedProfile = await syncProfileAuthSnapshot(rawProfile).catch(() => rawProfile);
        const profile = await assertProfileAccess(syncedProfile, {
            silent: !showMessage,
            redirectToLanding: false
        });
        if (isAdminProfile(profile) && !canAccessAdmin(profile)) {
            await forceExitAdminOnPublicHost({
                message: getAdminAccessDeniedMessage(),
                silent: !showMessage
            });
            return null;
        }
        applySupabaseSession(profile);
        return profile;
    } catch (error) {
        console.error('Gagal memuat profile terautentikasi:', error);
        if (showMessage) showToast(toUserFacingError(error, 'Profile user tidak dapat dimuat.'), 'error');
        return null;
    }
}

function ensureValidSession(showMessage = false) {
    if (isAdminProfile(remoteState.profile) && !canAccessAdmin(remoteState.profile)) {
        void forceExitAdminOnPublicHost({
            message: getAdminAccessDeniedMessage(),
            silent: !showMessage
        });
        return false;
    }

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
    if (!isAdminProfile(remoteState.profile)) {
        showToast('Akses hanya untuk Admin.', 'warning');
        navigateTo(`${remoteState.profile.role}-home`);
        return false;
    }
    if (!canAccessAdmin(remoteState.profile)) {
        void forceExitAdminOnPublicHost({ message: getAdminAccessDeniedMessage() });
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
    if (isAdminProfile(profile) && !canAccessAdmin(profile)) {
        await forceExitAdminOnPublicHost({ message: getAdminAccessDeniedMessage() });
        return;
    }
    await redirectUserByRole(profile);
}

function renderAppShell() {
    const user = getCurrentUser();
    if (!user) return;
    currentRole = user.role;
    setBodyAppMode('app');
    syncAppBranding(user);
    const headerUserNameEl = document.getElementById('headerUserName');
    const headerUserRoleEl = document.getElementById('headerUserRole');
    if (headerUserNameEl) headerUserNameEl.textContent = user.name || 'User';
    if (headerUserRoleEl) {
        headerUserRoleEl.textContent = user.role === 'admin'
            ? 'Indo Sejuk AC Admin'
            : (ROLE_LABELS[user.role] || user.role);
    }
    void syncHeaderUserAvatar(user);

    const navHtml = renderNavMarkup(user.role);
    document.getElementById('sidebarNav').innerHTML = navHtml;
    document.getElementById('mobileNav').innerHTML = navHtml;
    document.getElementById('contentArea')?.setAttribute('data-current-view', currentView || `${user.role}-home`);
    syncActiveNavState();
    syncInstallPromptUI();
}

async function fetchOrdersForRole(profile) {
    if (!profile) return [];

    if (profile.role !== 'konsumen' && profile.role !== 'teknisi' && profile.role !== 'admin') {
        throw new Error(`Role ${profile.role} tidak didukung untuk query orders.`);
    }

    const { data } = await withOrderColumnFallback(({ selectClause }) => {
        let query = supabaseClient
            .from('orders')
            .select(selectClause)
            .order('created_at', { ascending: false });

        if (profile.role === 'konsumen') {
            query = query.eq('konsumen_id', profile.id);
        } else if (profile.role === 'teknisi') {
            query = query.eq('teknisi_id', profile.id);
        }

        return query;
    }, {
        context: `fetchOrdersForRole:${profile.role}`
    });

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

    const { data } = await withProfileColumnFallback(
        ({ selectClause }) => supabaseClient
            .from('profiles')
            .select(selectClause)
            .eq('role', role)
            .order('created_at', { ascending: false }),
        { context: `fetchProfilesByRole:${role}` }
    );

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

    cacheProfilesByRole('konsumen', konsumen);
    cacheProfilesByRole('teknisi', teknisi);
    cacheProfilesByRole('admin', admin);
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

    const rawProfile = await fetchCurrentProfileStrict();
    const syncedProfile = await syncProfileAuthSnapshot(rawProfile).catch(() => rawProfile);
    const profile = await assertProfileAccess(syncedProfile, {
        silent: Boolean(options.silentGuard),
        redirectToLanding: false
    });
    if (isAdminProfile(profile) && !canAccessAdmin(profile)) {
        await forceExitAdminOnPublicHost({
            message: getAdminAccessDeniedMessage(),
            silent: Boolean(options.silentGuard)
        });
        return null;
    }
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
                if (event === 'PASSWORD_RECOVERY') {
                    runtimeState.passwordRecoveryActive = true;
                    showLoginPage();
                    activatePasswordRecoveryMode();
                    return;
                }

                if (event === 'SIGNED_IN' && (authSignInInProgress || runtimeState.registrationSessionActive)) {
                    return;
                }

                if (!session) {
                    clearRemoteSessionState({ preserveView: false });
                    showLanding();
                    return;
                }

                try {
                    const profile = await bootstrapSessionFromSupabase({ redirect: false, silentGuard: true });
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
    if (isAdminProfile(profile) && !canAccessAdmin(profile)) {
        await forceExitAdminOnPublicHost({ message: getAdminAccessDeniedMessage() });
        return;
    }
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
    syncAppBranding(null);
}

async function applyResolvedAuthSession(session) {
    const accessToken = session?.access_token || session?.accessToken;
    const refreshToken = session?.refresh_token || session?.refreshToken;
    if (!accessToken || !refreshToken) {
        throw new Error('Session login tidak valid.');
    }

    const { error: sessionError } = await supabaseClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
    });
    if (sessionError) throw sessionError;
}

async function signInWithResolvedIdentifier(identifier, password, requestedRole = 'konsumen') {
    const normalizedIdentifier = normalizeLoginIdentifier(identifier);
    const normalizedPassword = String(password || '').trim();
    if (!normalizedIdentifier || !normalizedPassword) {
        throw new Error('Login gagal. Periksa identifier dan password Anda.');
    }

    const loginFunctionStatus = await probeEdgeFunctionAvailability('profile-password-login');
    if (!loginFunctionStatus.ok) {
        if (isEmailIdentifier(normalizedIdentifier)) {
            const { error: directError } = await supabaseClient.auth.signInWithPassword({
                email: normalizedIdentifier,
                password: normalizedPassword
            });
            if (directError) throw directError;
            return {
                ok: true,
                fallbackMode: 'direct-email-login'
            };
        }

        throw new Error('Login dengan username atau nomor telepon belum aktif karena backend `profile-password-login` belum tersedia. Gunakan email login atau deploy function tersebut.');
    }

    let data;
    try {
        data = await invokeEdgeFunction('profile-password-login', {
                identifier: normalizedIdentifier,
                password: normalizedPassword,
                requestedRole
            }, {
                fallbackMessage: 'Login multi-identifier gagal diproses oleh backend.'
        });
    } catch (error) {
        if (isEdgeFunctionDependencyError(error, 'profile-password-login') && isEmailIdentifier(normalizedIdentifier)) {
            const { error: directError } = await supabaseClient.auth.signInWithPassword({
                email: normalizedIdentifier,
                password: normalizedPassword
            });
            if (directError) throw directError;
            return {
                ok: true,
                fallbackMode: 'direct-email-login'
            };
        }
        throw error;
    }
    await applyResolvedAuthSession(data?.session);
    return data || { ok: true };
}

async function loadAccessibleProfileFromSession(options = {}) {
    const rawProfile = await fetchCurrentProfileStrict();
    const syncedProfile = await syncProfileAuthSnapshot(rawProfile).catch(() => rawProfile);
    const profile = await assertProfileAccess(syncedProfile, {
        silent: Boolean(options.silent),
        redirectToLanding: false
    });
    if (isAdminProfile(profile) && !canAccessAdmin(profile)) {
        await forceExitAdminOnPublicHost({ message: getAdminAccessDeniedMessage() });
        return null;
    }

    applySupabaseSession(profile);
    if (profile.role === 'admin') {
        await loadAdminMasterData();
    } else {
        remoteState.currentOrders = await fetchOrdersForRole(profile);
    }
    return profile;
}

async function handleSupabaseLogin(identifier, password, role = 'konsumen') {
    if (!canUseSupabase()) throw new Error('Supabase client belum siap.');

    authSignInInProgress = true;

    try {
        await signInWithResolvedIdentifier(identifier, password, role);
        const profile = await loadAccessibleProfileFromSession({ silent: true });
        if (!profile) return null;
        await redirectUserByRole(profile);
        return profile;
    } finally {
        authSignInInProgress = false;
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    const selectedRole = document.getElementById('loginRole').value;
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!identifier || !password) {
        showToast('Email, username, atau nomor telepon beserta password wajib diisi.', 'error');
        return false;
    }

    try {
        const profile = await handleSupabaseLogin(identifier, password, selectedRole);
        if (!profile) return false;
        if (selectedRole && selectedRole !== profile.role) {
            showToast(`Akun Anda terdaftar sebagai ${ROLE_LABELS[profile.role] || profile.role}. Dashboard disesuaikan otomatis.`, 'warning');
        } else {
            showToast(`Login berhasil. Selamat datang, ${profile.name}.`, 'success');
        }
    } catch (error) {
        if (isEdgeFunctionDependencyError(error, 'profile-password-login')) {
            void refreshPublicAuthBackendNotice({ force: true });
        }
        console.error('Login Supabase gagal:', error);
        showToast(toUserFacingError(error, 'Login gagal. Periksa identifier dan password Anda.'), 'error');
    }

    return false;
}

async function registerPublicAccountSupabase(role, formValues) {
    const password = String(formValues.password || '').trim();
    if (!password) throw new Error('Password wajib diisi.');
    if (!formValues.phone) throw new Error('Nomor telepon wajib diisi.');

    const usernameTaken = await isUsernameTakenRemote(formValues.username);
    if (usernameTaken) throw new Error(`Username ${ROLE_LABELS[role] || role} sudah digunakan.`);

    const registerFunctionStatus = await probeEdgeFunctionAvailability('register-public-account');
    if (registerFunctionStatus.ok) {
        return invokeEdgeFunction('register-public-account', {
                role,
                username: formValues.username,
                name: formValues.name,
                password,
                email: formValues.email,
                phone: formValues.phone,
                address: formValues.address,
                age: formValues.age,
                birth_date: formValues.birthDate,
                district: formValues.district || '',
                referral: formValues.referral || '',
                ac_units: normalizeAcUnitArray(formValues.ac_units || []),
                location_text: formValues.locationText,
                lat: formValues.lat,
                lng: formValues.lng,
                nik: formValues.nik || '',
                specialization: formValues.specialization || '',
                experience: formValues.experience ?? '',
                status: PROFILE_STATUS_PENDING
            }, {
                fallbackMessage: 'Registrasi akun publik gagal diproses oleh backend.'
        });
    }

    const authSettings = await fetchSupabaseAuthSettings();
    if (!authSettings.ok || authSettings.disableSignup || !authSettings.mailerAutoconfirm) {
        const missingFunctionsLabel = getMissingPublicAuthFunctionsLabel() || '`register-public-account`';
        throw new Error(`Backend auth publik belum lengkap di project Supabase ini. Function yang belum aktif: ${missingFunctionsLabel}. Supabase Auth masih mewajibkan konfirmasi email untuk signup biasa, jadi register publik belum bisa dijalankan tanpa backend register yang aktif.`);
    }

    const authEmail = buildSyntheticAuthEmail(role, formValues.phone);
    if (!authEmail) {
        throw new Error('Email auth sintetis tidak dapat dibuat karena nomor telepon belum valid.');
    }

    const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email: authEmail,
        password,
        options: {
            data: {
                role,
                username: formValues.username,
                name: formValues.name,
                contact_email: formValues.email || '',
                auth_email: authEmail,
                phone: normalizePhone(formValues.phone),
                address: formValues.address || '',
                age: formValues.age ?? null,
                birth_date: formValues.birthDate || '',
                district: formValues.district || '',
                referral: formValues.referral || '',
                ac_units: normalizeAcUnitArray(formValues.ac_units || []),
                location_text: formValues.locationText || '',
                lat: formValues.lat || '',
                lng: formValues.lng || '',
                nik: formValues.nik || '',
                specialization: formValues.specialization || '',
                experience: formValues.experience ?? null,
                status: PROFILE_STATUS_PENDING
            }
        }
    });

    if (signUpError) throw signUpError;
    return {
        ok: true,
        user: data?.user || null,
        session: data?.session || null,
        auth_email: authEmail,
        fallbackMode: 'client-signup'
    };
}

async function finalizePendingRegistration(role, formValues, authResult) {
    const authEmail = normalizeEmail(authResult?.auth_email || authResult?.user?.email);
    const password = String(formValues.password || '').trim();
    if (!authEmail || !password) {
        throw new Error('Data auth hasil register belum lengkap.');
    }

    runtimeState.registrationSessionActive = true;
    authSignInInProgress = true;
    let sessionOpened = false;

    try {
        const { error } = await supabaseClient.auth.signInWithPassword({
            email: authEmail,
            password
        });
        if (error) throw error;

        sessionOpened = true;
        authSignInInProgress = false;

        await ensureProfileAfterAuth(role, {
            ...formValues,
            auth_email: authEmail,
            status: PROFILE_STATUS_PENDING,
            verified_at: '',
            verified_by: ''
        });

        try {
            await finalizeSignupUploadsAfterSession(role);
        } catch (uploadError) {
            console.warn(`Upload draft ${role} setelah register belum berhasil:`, uploadError);
            showToast('Akun berhasil dibuat, tetapi ada dokumen/foto yang belum sempat tersimpan. Anda bisa melengkapinya lagi setelah akun aktif.', 'warning');
        }
    } finally {
        authSignInInProgress = false;
        if (sessionOpened) {
            await logoutSupabase().catch(() => {});
        }
        runtimeState.registrationSessionActive = false;
        clearRemoteSessionState({ preserveView: false });
    }
}

function resetRegisterKonsumenUi() {
    document.getElementById('formRegKonsumen')?.reset();
    draftUploads.regKonSavedUnits = [];
    resetRegisterAcUnitDraft({ silent: true });
    renderRegisterAcUnitSavedList();
    document.getElementById('regKonLocationResult').style.display = 'none';
}

function resetRegisterTeknisiUi() {
    document.getElementById('formRegTeknisi')?.reset();
    clearImagePreviewState('register-teknisi-ktp');
    clearImagePreviewState('register-teknisi-selfie');
    document.getElementById('regTekLocationResult').style.display = 'none';
}

function primeLoginAfterRegistration(role, formValues = {}) {
    showLoginPage();
    switchLoginRole(role);
    const loginIdentifier = document.getElementById('loginIdentifier');
    if (loginIdentifier) {
        loginIdentifier.value = formValues.email || formValues.username || formValues.phone || '';
    }
}

async function handleRegisterKonsumen(event) {
    event.preventDefault();

    if (hasRegisterAcUnitDraftValues()) {
        saveRegisterAcUnit();
    }
    const form = collectRegisterKonsumenForm();
    const manualBirthDateInput = document.getElementById('regKonBirthDateManual');
    if (manualBirthDateInput && !manualBirthDateInput.checkValidity()) {
        manualBirthDateInput.reportValidity();
        return false;
    }
    const waPopup = prepareWhatsAppPopup();
    if (!form.name || !form.username || !form.password || !form.phone || !form.address || !form.district) {
        closePreparedPopup(waPopup);
        showToast('Lengkapi data wajib konsumen.', 'error');
        return false;
    }

    try {
        const authResult = await registerPublicAccountSupabase('konsumen', form);
        await finalizePendingRegistration('konsumen', form, authResult);

        notifyAdminNewRegistration('konsumen', {
            ...form,
            registeredAt: new Date().toISOString(),
            emailVerificationStatus: 'Tidak dipakai untuk aktivasi register',
            profileStatus: PROFILE_STATUS_PENDING
        }, waPopup);

        resetRegisterKonsumenUi();
        primeLoginAfterRegistration('konsumen', form);
        showToast('Pendaftaran konsumen berhasil dibuat. Status akun sekarang Menunggu Verifikasi admin.', 'success');
    } catch (error) {
        closePreparedPopup(waPopup);
        if (isEdgeFunctionDependencyError(error, 'register-public-account')) {
            void refreshPublicAuthBackendNotice({ force: true });
        }
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
    if (!form.name || !form.username || !form.password || !form.phone || !form.birthDate || !form.specialization || !form.address) {
        closePreparedPopup(waPopup);
        showToast('Lengkapi data wajib teknisi.', 'error');
        return false;
    }

    try {
        const authResult = await registerPublicAccountSupabase('teknisi', form);
        await finalizePendingRegistration('teknisi', form, authResult);

        notifyAdminNewRegistration('teknisi', {
            ...form,
            registeredAt: new Date().toISOString(),
            emailVerificationStatus: 'Tidak dipakai untuk aktivasi register',
            profileStatus: PROFILE_STATUS_PENDING,
            ktpUploaded: Boolean(draftUploads.regTekKtpPhoto),
            selfieUploaded: Boolean(draftUploads.regTekSelfiePhoto)
        }, waPopup);

        resetRegisterTeknisiUi();
        primeLoginAfterRegistration('teknisi', form);
        showToast('Pendaftaran teknisi berhasil dibuat. Status akun sekarang Menunggu Verifikasi admin.', 'success');
    } catch (error) {
        closePreparedPopup(waPopup);
        if (isEdgeFunctionDependencyError(error, 'register-public-account')) {
            void refreshPublicAuthBackendNotice({ force: true });
        }
        console.error('Registrasi teknisi gagal:', error);
        showToast(toUserFacingError(error, 'Registrasi teknisi gagal.'), 'error');
    }

    return false;
}

async function navigateTo(viewId, prefill = '') {
    if (!ensureValidSession(true)) return;
    const profile = getCurrentUser();
    if (!profile) return;

    if (isAdminRoute(viewId) && !canAccessAdmin(profile)) {
        await forceExitAdminOnPublicHost({ message: getAdminAccessDeniedMessage() });
        return;
    }

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
    const renderToken = ++runtimeState.activeViewRenderToken;
    await renderCurrentView(prefill);
    if (renderToken !== runtimeState.activeViewRenderToken) return;
    syncActiveNavState();
    safeScrollTop({ force: true, behavior: window.innerWidth <= 992 ? 'smooth' : 'auto' });
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

    setMetricLoading(['konsumenTotalOrders', 'konsumenPending', 'konsumenCompleted']);
    renderTableLoading('konsumenRecentBody', 4, 3);
    renderServiceCardsLoading('serviceCardsContainer', 4);
    const orders = await loadCurrentOrdersForProfile();
    setMetricValue('konsumenTotalOrders', orders.length);
    setMetricValue('konsumenPending', orders.filter((order) => order.status !== 'Selesai').length);
    setMetricValue('konsumenCompleted', orders.filter((order) => order.status === 'Selesai').length);

    const recentBody = document.getElementById('konsumenRecentBody');
    recentBody.innerHTML = orders.length ? orders.slice(0, 5).map((order) => `
        <tr>
            ${tableCell('No. Pesanan', escapeHtml(getOrderLabel(order)))}
            ${tableCell('Layanan', escapeHtml(order.serviceName))}
            ${tableCell('Tanggal', escapeHtml(formatDate(order.preferredDate || order.createdAt)))}
            ${tableCell('Status', renderStatusBadge(order.status))}
        </tr>
    `).join('') : '<tr><td colspan="4" class="empty-state">Belum ada pesanan</td></tr>';

    renderDirectoryList('konsumenTeknisiDirectory', getTechnicianDirectoryProfiles(), {
        emptyText: 'Belum ada data teknisi yang bisa ditampilkan.',
        showVerification: true
    });

    const container = document.getElementById('serviceCardsContainer');
    const services = getServices(false);
    container.innerHTML = services.map((service) => `
        <div class="service-card" onclick="navigateTo('konsumen-order', '${escapeHtml(service.name)}')">
            <img src="${escapeHtml(serviceImage(service))}" alt="${escapeHtml(service.name)}" loading="lazy" decoding="async">
            <div class="service-card-body">
                <h4>${escapeHtml(service.name)}</h4>
                <p>${escapeHtml(service.description)}</p>
                <span class="service-price">${formatRupiah(service.price)}</span>
            </div>
        </div>
    `).join('');
}

function applyOrderUnitToForm(unit = null) {
    const token = ++runtimeState.orderAutofillToken;
    const selectedUnit = unit ? normalizeAcUnitRecord(unit) : null;
    if (token !== runtimeState.orderAutofillToken) return;

    if (!selectedUnit) return;
    setAcSpecFieldValue('orderBrand', 'brand', selectedUnit.brand);
    setAcSpecFieldValue('orderType', 'type', selectedUnit.type);
    setAcSpecFieldValue('orderRefrigerant', 'refrigerant', selectedUnit.refrigerant);
    setAcSpecFieldValue('orderCapacity', 'capacity', selectedUnit.capacity);
}

function handleOrderUnitSelectionChange() {
    const profile = getCurrentUser();
    const select = document.getElementById('orderUnitSelector');
    const hint = document.getElementById('orderUnitSelectionHint');
    const units = getProfileAcUnits(profile);
    const selectedUnit = units.find((unit) => unit.key === select?.value) || null;
    if (selectedUnit) {
        applyOrderUnitToForm(selectedUnit);
        renderOrderUnitSelectionPreview(units, selectedUnit);
        if (hint) hint.textContent = `Spesifikasi mengikuti ${formatAcUnitLabel(selectedUnit)}. Anda masih bisa override manual sebelum submit.`;
        return;
    }
    renderOrderUnitSelectionPreview(units, null);
    if (hint) hint.textContent = units.length
        ? units.length === 1
            ? 'Unit tersimpan tersedia. Pilih unit tersebut bila ingin autofill spesifikasi, atau biarkan kosong untuk isi manual.'
            : 'Isi manual / belum pilih unit. Pilih salah satu unit tersimpan untuk autofill spesifikasi order.'
        : 'Belum ada unit AC tersimpan. Isi spesifikasi secara manual.';
}

function getSelectedOrderUnit() {
    const profile = getCurrentUser();
    const select = document.getElementById('orderUnitSelector');
    const units = getProfileAcUnits(profile);
    return units.find((unit) => unit.key === select?.value) || null;
}

function collectOrderAcSpecValues() {
    const selectedUnit = getSelectedOrderUnit();
    return {
        brand: getAcSpecFieldValue('orderBrand', 'brand'),
        ac_type: getAcSpecFieldValue('orderType', 'type'),
        pk: getAcSpecFieldValue('orderCapacity', 'capacity'),
        refrigerant: getAcSpecFieldValue('orderRefrigerant', 'refrigerant'),
        ac_unit_key: selectedUnit?.key || ''
    };
}

function renderKonsumenOrder(prefill = '') {
    const user = getCurrentUser();
    const serviceSelect = document.getElementById('orderService');
    serviceSelect.innerHTML = '<option value="">Pilih Layanan</option>' + getServices(false).map((service) => `<option value="${escapeHtml(service.id)}">${escapeHtml(service.name)}</option>`).join('');
    if (prefill) {
        const target = getServices(false).find((service) => service.name === prefill);
        if (target) serviceSelect.value = target.id;
    }
    populateAcSpecOptions('orderBrand', 'brand');
    populateAcSpecOptions('orderType', 'type');
    populateAcSpecOptions('orderRefrigerant', 'refrigerant');
    populateAcSpecOptions('orderCapacity', 'capacity');

    const unitSelect = document.getElementById('orderUnitSelector');
    const units = getProfileAcUnits(user);
    if (!units.length) {
        getUnitImagesForUser(user.id).forEach((image, index) => {
            units.push(normalizeAcUnitRecord({
                key: `local-unit-${index + 1}`,
                image_url: image,
                created_at: user.joinedAt || ''
            }, {
                source: 'local-cache'
            }));
        });
    }
    if (unitSelect) {
        unitSelect.innerHTML = '<option value="">Isi manual / belum pilih unit</option>' + units
            .map((unit, index) => `<option value="${escapeHtml(unit.key)}">${escapeHtml(formatAcUnitLabel(unit, index))}</option>`)
            .join('');
        if (units.length === 1) {
            unitSelect.value = units[0].key;
        }
    }
    document.getElementById('orderPhone').value = user?.phone || '';
    document.getElementById('orderAddress').value = user?.address || '';
    renderOrderUnitSelectionPreview(units, units.length === 1 ? units[0] : null);
    handleOrderUnitSelectionChange();
}

async function renderKonsumenHistory() {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'konsumen') return;

    renderTableLoading('konsumenHistoryBody', 6, 4);
    const orders = await loadCurrentOrdersForProfile();
    const body = document.getElementById('konsumenHistoryBody');
    body.innerHTML = orders.length ? orders.map((order) => `
        <tr>
            ${tableCell('No. Pesanan', escapeHtml(getOrderLabel(order)))}
            ${tableCell('Layanan', escapeHtml(order.serviceName))}
            ${tableCell('Merk AC', escapeHtml(order.brand || '-'))}
            ${tableCell('Tanggal', escapeHtml(formatDate(order.preferredDate || order.createdAt)))}
            ${tableCell('Teknisi', escapeHtml(order.teknisiName || 'Belum ditugaskan'))}
            ${tableCell('Status', renderStatusBadge(order.status))}
        </tr>
    `).join('') : '<tr><td colspan="6" class="empty-state">Belum ada pesanan</td></tr>';
}

function renderKonsumenProfile() {
    const user = getCurrentUser();
    if (!user || user.role !== 'konsumen') return;

    const profileState = runtimeState.profileEditor.konsumen;
    profileState.snapshot = getKonsumenProfileSnapshot(user);
    if (!profileState.isEditing) {
        applyKonsumenProfileSnapshotToForm(profileState.snapshot);
    }
    document.getElementById('profileKonsumenEmail').value = user.email || '';
    document.getElementById('profileKonsumenAge').value = calculateAge(getKonsumenProfileFormSnapshot().birthDate || user.birthDate || '') || user.age || '';
    document.getElementById('profileKonsumenLocation').textContent = formatLocationSummary(user);
    document.getElementById('profileKonsumenJoined').textContent = formatDate(user.joinedAt);
    if (!profileState.isEditing) {
        profileState.isDirty = false;
    }
    syncKonsumenProfileEditorUi();
}

async function renderKonsumenUnit() {
    const user = getCurrentUser();
    const gallery = document.getElementById('konUnitGallery');
    if (!gallery) return;
    if (!user) {
        startNewKonsumenUnitDraft({ silent: true });
        gallery.innerHTML = '<div class="empty-state-box"><p>Belum ada data unit AC.</p></div>';
        return;
    }

    setElementText('konUnitUploadStatus', 'Draft unit yang di-save akan tersimpan ke profile `ac_units` tanpa foto.');
    const units = getProfileAcUnits(user);

    gallery.innerHTML = units.length ? `
        <div class="saved-unit-list-header">
            <h4>Daftar Unit AC Tersimpan</h4>
            <span>${units.length} unit</span>
        </div>
        <div class="saved-unit-card-grid">
            ${units.map((unit, index) => `
                <article class="unit-card">
                    <div class="unit-card-body">
                        <div class="unit-card-header">
                            <h4>${escapeHtml(formatAcUnitLabel(unit, index))}</h4>
                        </div>
                        <div class="unit-spec-list">
                            <span class="unit-spec-pill">${escapeHtml(`Merk: ${unit.brand || '-'}`)}</span>
                            <span class="unit-spec-pill">${escapeHtml(`Jenis: ${unit.type || '-'}`)}</span>
                            <span class="unit-spec-pill">${escapeHtml(`Refrigerant: ${unit.refrigerant || '-'}`)}</span>
                            <span class="unit-spec-pill">${escapeHtml(`Kapasitas: ${unit.capacity || '-'}`)}</span>
                        </div>
                        <p class="text-muted text-sm">Tanggal input: ${escapeHtml(formatDateTime(unit.createdAt || user.joinedAt) || '-')}</p>
                        <div class="btn-action-group unit-card-actions">
                            <button type="button" class="btn btn-outline btn-xs" onclick="editKonsumenUnit(${index})">Edit</button>
                            <button type="button" class="btn btn-danger btn-xs" onclick="confirmRemoveKonsumenUnitImage(${index})">Hapus Unit</button>
                        </div>
                    </div>
                </article>
            `).join('')}
        </div>
    ` : '<div class="empty-state-box"><p>Belum ada data unit AC.</p></div>';
    renderKonsumenUnitDraftUi();
}

async function renderTeknisiHome() {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'teknisi') return;

    setMetricLoading(['teknisiTotalJobs', 'teknisiActiveJobs', 'teknisiCompletedJobs']);
    renderJobCardsLoading('teknisiJobsList', 3);
    const orders = await loadCurrentOrdersForProfile();
    setMetricValue('teknisiTotalJobs', orders.length);
    setMetricValue('teknisiActiveJobs', orders.filter((order) => order.status === 'Ditugaskan' || order.status === 'Dikerjakan').length);
    setMetricValue('teknisiCompletedJobs', orders.filter((order) => order.status === 'Selesai').length);

    const badgeContainer = document.getElementById('teknisiVerificationBadge');
    if (badgeContainer) {
        badgeContainer.innerHTML = renderTechnicianVerificationBadge(profile, { className: 'verification-badge--headline' });
    }

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
                ${order.status === 'Dikerjakan' ? `<button class="btn btn-primary btn-xs" onclick="completeJob('${order.id}')">Selesaikan</button>` : ''}
            </div>
        </div>
    `).join('') : '<div class="empty-state-box"><p>Belum ada pekerjaan yang ditugaskan.</p></div>';
}

async function renderTeknisiJobs() {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== 'teknisi') return;

    renderTableLoading('teknisiAllJobsBody', 7, 4);
    const orders = await loadCurrentOrdersForProfile();
    const body = document.getElementById('teknisiAllJobsBody');
    body.innerHTML = orders.length ? orders.map((order) => `
        <tr>
            ${tableCell('No. Pesanan', escapeHtml(getOrderLabel(order)))}
            ${tableCell('Konsumen', escapeHtml(order.konsumenName))}
            ${tableCell('Layanan', escapeHtml(order.serviceName))}
            ${tableCell('Alamat', escapeHtml(order.address || '-'))}
            ${tableCell('Tanggal', escapeHtml(formatDate(order.preferredDate)))}
            ${tableCell('Status', renderStatusBadge(order.status))}
            ${tableCell('Aksi', `
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button>
                    ${order.status === 'Ditugaskan' ? `<button class="btn btn-info btn-xs" onclick="startJob('${order.id}')">Mulai</button>` : ''}
                    ${order.status === 'Dikerjakan' ? `<button class="btn btn-primary btn-xs" onclick="completeJob('${order.id}')">Selesaikan</button>` : ''}
                </div>
            `)}
        </tr>
    `).join('') : '<tr><td colspan="7" class="empty-state">Belum ada pekerjaan</td></tr>';

    renderDirectoryList('teknisiKonsumenDirectory', getConsumerDirectoryProfiles(), {
        emptyText: 'Belum ada data konsumen yang bisa ditampilkan.'
    });
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
}

async function renderTeknisiDocs() {
    const user = getCurrentUser();
    const cachedDocs = user ? getTeknisiDocsForUser(user.id) : { ktpPhoto: '', selfiePhoto: '' };
    const ktpGrid = document.getElementById('tekIDPreviewGrid');
    const selfieGrid = document.getElementById('tekSelfiePreviewGrid');
    if (!ktpGrid || !selfieGrid) return;
    if (!user) {
        ktpGrid.innerHTML = '';
        selfieGrid.innerHTML = '';
        return;
    }

    syncStorageStatusMessage('teknisiDocStatus', getPrivateDocumentBucket(), 'Dokumen tersimpan otomatis saat file dipilih.');

    const privateBucket = getPrivateDocumentBucket();
    const ktpUrl = user.ktpPhotoUrl || (user.ktpPhotoPath ? await resolveStorageImageUrl(privateBucket, user.ktpPhotoPath, { forceRefresh: true }) : '') || cachedDocs.ktpPhoto || '';
    const selfieUrl = user.selfiePhotoUrl || (user.selfiePhotoPath ? await resolveStorageImageUrl(privateBucket, user.selfiePhotoPath, { forceRefresh: true }) : '') || cachedDocs.selfiePhoto || '';

    if (ktpUrl && ktpUrl !== user.ktpPhotoUrl) {
        user.ktpPhotoUrl = ktpUrl;
    }
    if (selfieUrl && selfieUrl !== user.selfiePhotoUrl) {
        user.selfiePhotoUrl = selfieUrl;
    }

    ktpGrid.innerHTML = ktpUrl ? createPreviewCardHtml(ktpUrl, {
        alt: 'Foto KTP',
        deleteTarget: 'confirmRemoveTeknisiDocument',
        deleteArgs: ['ktp'],
        deleteLabel: 'Hapus Gambar'
    }) : '<div class="empty-state-box"><p>Belum ada foto KTP.</p></div>';
    selfieGrid.innerHTML = selfieUrl ? createPreviewCardHtml(selfieUrl, {
        alt: 'Foto Diri',
        deleteTarget: 'confirmRemoveTeknisiDocument',
        deleteArgs: ['selfie'],
        deleteLabel: 'Hapus Gambar'
    }) : '<div class="empty-state-box"><p>Belum ada foto diri.</p></div>';
}

async function renderCurrentView(prefill = '', options = {}) {
    if (currentView === 'konsumen-home') await renderKonsumenHome();
    if (currentView === 'konsumen-order') renderKonsumenOrder(prefill);
    if (currentView === 'konsumen-history') await renderKonsumenHistory();
    if (currentView === 'konsumen-profile') renderKonsumenProfile();
    if (currentView === 'konsumen-unit') await renderKonsumenUnit();
    if (currentView === 'teknisi-home') await renderTeknisiHome();
    if (currentView === 'teknisi-jobs') await renderTeknisiJobs();
    if (currentView === 'teknisi-profile') renderTeknisiProfile();
    if (currentView === 'teknisi-docs') await renderTeknisiDocs();
    if (currentView === 'admin-home') await renderAdminHome(options);
    if (currentView === 'admin-orders') await renderAdminOrders(options);
    if (currentView === 'admin-history') await renderAdminHistory(options);
    if (currentView === 'admin-users') await renderAdminUsers(options);
}

async function renderAdminHome(options = {}) {
    if (!requireAdminAccess()) return;
    setMetricLoading(['adminTotalOrders', 'adminTotalRevenue', 'adminTotalTeknisi', 'adminPendingOrders']);
    renderTableLoading('adminRecentOrdersBody', 6, 4);
    if (!options.skipRemoteLoad) await loadAdminMasterData();
    const orders = remoteState.adminOrders;
    const teknisi = remoteState.adminProfiles.teknisi;

    setMetricValue('adminTotalOrders', orders.length);
    setMetricValue('adminTotalRevenue', formatRupiah(orders.filter((order) => order.status === 'Selesai').reduce((sum, order) => sum + Number(order.price || 0), 0)));
    setMetricValue('adminTotalTeknisi', teknisi.filter((user) => user.status === 'Aktif').length);
    setMetricValue('adminPendingOrders', orders.filter((order) => order.status === 'Menunggu').length);

    const body = document.getElementById('adminRecentOrdersBody');
    body.innerHTML = orders.length ? orders.slice(0, 5).map((order) => `
        <tr>
            ${tableCell('No.', escapeHtml(getOrderLabel(order)))}
            ${tableCell('Konsumen', escapeHtml(order.konsumenName))}
            ${tableCell('Layanan', escapeHtml(order.serviceName))}
            ${tableCell('Tanggal', escapeHtml(formatDate(order.preferredDate || order.createdAt)))}
            ${tableCell('Status', renderStatusBadge(order.status))}
            ${tableCell('Aksi', `<button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button>`)}
        </tr>
    `).join('') : '<tr><td colspan="6" class="empty-state">Belum ada pesanan</td></tr>';
}

async function renderAdminOrders(options = {}) {
    if (!requireAdminAccess()) return;
    renderTableLoading('adminAllOrdersBody', 9, 4);
    if (!options.skipRemoteLoad) await loadAdminMasterData();
    const filter = document.getElementById('adminFilterStatus').value;
    const orders = remoteState.adminOrders.filter((order) => filter === 'all' || order.status === filter);
    const body = document.getElementById('adminAllOrdersBody');

    body.innerHTML = orders.length ? orders.map((order) => `
        <tr>
            ${tableCell('No. Pesanan', escapeHtml(getOrderLabel(order)))}
            ${tableCell('Konsumen', escapeHtml(order.konsumenName))}
            ${tableCell('Layanan', escapeHtml(order.serviceName))}
            ${tableCell('Merk AC', escapeHtml(order.brand || '-'))}
            ${tableCell('Tanggal', escapeHtml(formatDate(order.preferredDate)))}
            ${tableCell('Alamat', escapeHtml(order.address || '-'))}
            ${tableCell('Teknisi', escapeHtml(order.teknisiName || '-'))}
            ${tableCell('Status', renderStatusBadge(order.status))}
            ${tableCell('Aksi', `
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button>
                    <button class="btn btn-outline btn-xs" onclick="openEditOrderModal('${order.id}')">Edit</button>
                    <button class="btn btn-primary btn-xs" onclick="openAssignModal('${order.id}')">Assign</button>
                    <button class="btn btn-danger btn-xs" onclick="deleteOrderByAdmin('${order.id}')">Hapus</button>
                </div>
            `)}
        </tr>
    `).join('') : '<tr><td colspan="9" class="empty-state">Belum ada pesanan</td></tr>';
}

async function renderAdminHistory(options = {}) {
    if (!requireAdminAccess()) return;
    renderTableLoading('adminHistoryOrdersBody', 8, 4);
    if (!options.skipRemoteLoad) await loadAdminMasterData();
    const body = document.getElementById('adminHistoryOrdersBody');
    if (!body) return;

    const orders = remoteState.adminOrders
        .filter((order) => order.status === 'Selesai')
        .sort((left, right) => String(right.preferredDate || right.createdAt || '').localeCompare(String(left.preferredDate || left.createdAt || '')));

    body.innerHTML = orders.length ? orders.map((order) => `
        <tr>
            ${tableCell('No. Pesanan', escapeHtml(getOrderLabel(order)))}
            ${tableCell('Konsumen', escapeHtml(order.konsumenName))}
            ${tableCell('Layanan', escapeHtml(order.serviceName))}
            ${tableCell('Tanggal', escapeHtml(formatDate(order.preferredDate || order.createdAt)))}
            ${tableCell('Alamat', escapeHtml(order.address || '-'))}
            ${tableCell('Teknisi', escapeHtml(order.teknisiName || '-'))}
            ${tableCell('Status', renderStatusBadge(order.status))}
            ${tableCell('Aksi', `
                <div class="btn-action-group">
                    <button class="btn btn-outline btn-xs" onclick="openOrderDetail('${order.id}')">Detail</button>
                    <button class="btn btn-outline btn-xs" onclick="openEditOrderModal('${order.id}')">Edit</button>
                    <button class="btn btn-danger btn-xs" onclick="deleteOrderByAdmin('${order.id}')">Hapus</button>
                </div>
            `)}
        </tr>
    `).join('') : '<tr><td colspan="8" class="empty-state">Belum ada riwayat pesanan selesai</td></tr>';
}

async function renderAdminUsers(options = {}) {
    if (!requireAdminAccess()) return;
    renderAdminServicesTable();
    renderAdminImageCatalogTable();
    renderTableLoading('adminKonsumenListBody', 10, 4);
    renderTableLoading('adminTeknisiListBody', 10, 4);
    renderTableLoading('adminAdminListBody', 5, 3);

    try {
        if (!options.skipRemoteLoad) await loadAdminMasterData();
        await renderAdminKonsumenTable(remoteState.adminProfiles.konsumen);
        await renderAdminTeknisiTable(remoteState.adminProfiles.teknisi);
        renderAdminAdminTable(remoteState.adminProfiles.admin);
    } catch (error) {
        console.error('Gagal memuat data master admin dari Supabase:', error);
        showToast(toUserFacingError(error, 'Data master admin gagal dimuat dari Supabase.'), 'error');
    }

    switchUserTab(currentUserTab);
}

async function updateProfileByAdmin(userId, payload = {}) {
    const { data } = await withProfileColumnFallback(
        ({ selectClause, payload: safePayload }) => supabaseClient
            .from('profiles')
            .update(safePayload)
            .eq('id', userId)
            .select(selectClause)
            .single(),
        {
            context: `updateProfileByAdmin:${userId}`,
            payload
        }
    );

    return sanitizeProfileRecord(data);
}

async function setPublicUserStatus(role, userId, status) {
    if (!requireAdminAccess()) return;

    const normalizedStatus = normalizeProfileStatus(status);
    const payload = {
        status: normalizedStatus
    };
    if (normalizedStatus === PROFILE_STATUS_ACTIVE) {
        payload.verified_at = new Date().toISOString();
        payload.verified_by = remoteState.profile?.id || null;
    }

    try {
        await updateProfileByAdmin(userId, payload);
        await loadAdminMasterData();
        await renderAdminKonsumenTable(remoteState.adminProfiles.konsumen);
        await renderAdminTeknisiTable(remoteState.adminProfiles.teknisi);
        await renderAdminHome();
        showToast(`Status akun ${ROLE_LABELS[role] || role} diperbarui menjadi ${normalizedStatus}.`, 'success');
    } catch (error) {
        console.error('Gagal memperbarui status user:', error);
        showToast(toUserFacingError(error, 'Perubahan status user gagal.'), 'error');
    }
}

async function verifyPublicUser(role, userId) {
    return setPublicUserStatus(role, userId, PROFILE_STATUS_ACTIVE);
}

function renderAdminUserActions(user, role) {
    if (role === 'admin') return '-';
    const editTarget = role === 'konsumen' ? 'openEditKonsumen' : 'openEditTeknisi';
    const approveButton = `<button class="btn btn-primary btn-xs" onclick="verifyPublicUser('${role}', '${user.id}')">Approve</button>`;
    const rejectButton = `<button class="btn btn-outline btn-xs" onclick="setPublicUserStatus('${role}', '${user.id}', '${PROFILE_STATUS_REJECTED}')">Tolak</button>`;
    const disableButton = `<button class="btn btn-outline btn-xs" onclick="setPublicUserStatus('${role}', '${user.id}', '${PROFILE_STATUS_DISABLED}')">Nonaktifkan</button>`;
    const editButton = `<button class="btn btn-outline btn-xs" onclick="${editTarget}('${user.id}')">Edit</button>`;
    const deleteButton = `<button class="btn btn-danger btn-xs" onclick="deleteUser('${role}', '${user.id}')">Hapus</button>`;

    if (isProfilePending(user)) return `${approveButton} ${rejectButton} ${editButton} ${deleteButton}`;
    if (isProfileApproved(user)) return `${disableButton} ${editButton} ${deleteButton}`;
    return `${approveButton} ${editButton} ${deleteButton}`;
}

async function renderAdminKonsumenTable(users = []) {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminKonsumenListBody');
    const orders = remoteState.adminOrders;

    const sortedUsers = [...users].sort((left, right) => {
        const leftPending = isProfilePending(left) ? 0 : 1;
        const rightPending = isProfilePending(right) ? 0 : 1;
        if (leftPending !== rightPending) return leftPending - rightPending;
        return String(right.joinedAt || '').localeCompare(String(left.joinedAt || ''));
    });

    body.innerHTML = sortedUsers.length ? sortedUsers.map((user) => `
        <tr>
            ${tableCell('Nama', escapeHtml(user.name))}
            ${tableCell('Username', escapeHtml(user.username || '-'))}
            ${tableCell('Email', escapeHtml(user.email || '-'))}
            ${tableCell('Telepon', escapeHtml(user.phone || '-'))}
            ${tableCell('Usia', escapeHtml(user.age || '-'))}
            ${tableCell('Alamat', `
                <div>${escapeHtml(user.address || '-')}</div>
                <div class="text-muted text-sm">Referal: ${escapeHtml(user.referral || '-')}</div>
            `)}
            ${tableCell('Status', renderStatusBadge(user.status || PROFILE_STATUS_PENDING))}
            ${tableCell('Verifikasi Admin', escapeHtml(formatVerificationInfo(user)))}
            ${tableCell('Total Pesanan', String(orders.filter((order) => order.konsumenId === user.id).length))}
            ${tableCell('Aksi', renderAdminUserActions(user, 'konsumen'))}
        </tr>
    `).join('') : '<tr><td colspan="10" class="empty-state">Tidak ada data</td></tr>';
}

async function renderAdminTeknisiTable(users = []) {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminTeknisiListBody');
    const orders = remoteState.adminOrders;

    const sortedUsers = [...users].sort((left, right) => {
        const leftPending = isProfilePending(left) ? 0 : 1;
        const rightPending = isProfilePending(right) ? 0 : 1;
        if (leftPending !== rightPending) return leftPending - rightPending;
        return String(right.joinedAt || '').localeCompare(String(left.joinedAt || ''));
    });

    body.innerHTML = sortedUsers.length ? sortedUsers.map((user) => `
        <tr>
            ${tableCell('Nama', escapeHtml(user.name))}
            ${tableCell('Username', `
                <div class="directory-table-user">
                    <span>${escapeHtml(user.username || '-')}</span>
                    ${renderTechnicianVerificationBadge(user)}
                </div>
            `)}
            ${tableCell('Email', escapeHtml(user.email || '-'))}
            ${tableCell('Telepon', escapeHtml(user.phone || '-'))}
            ${tableCell('NIK', escapeHtml(user.nik || '-'))}
            ${tableCell('Spesialisasi', escapeHtml(user.specialization || '-'))}
            ${tableCell('Status', renderStatusBadge(user.status || PROFILE_STATUS_PENDING))}
            ${tableCell('Verifikasi Admin', escapeHtml(formatVerificationInfo(user)))}
            ${tableCell('Tugas Selesai', String(orders.filter((order) => order.teknisiId === user.id && order.status === 'Selesai').length))}
            ${tableCell('Aksi', renderAdminUserActions(user, 'teknisi'))}
        </tr>
    `).join('') : '<tr><td colspan="10" class="empty-state">Tidak ada data</td></tr>';
}

function renderAdminAdminTable(users = []) {
    if (!requireAdminAccess()) return;
    const body = document.getElementById('adminAdminListBody');

    body.innerHTML = users.length ? users.map((user) => `
        <tr>
            ${tableCell('Nama', escapeHtml(user.name))}
            ${tableCell('Username', escapeHtml(user.username || '-'))}
            ${tableCell('Email', escapeHtml(user.email || '-'))}
            ${tableCell('Status', escapeHtml(user.status || 'Aktif'))}
            ${tableCell('Role', escapeHtml(user.role || 'admin'))}
        </tr>
    `).join('') : '<tr><td colspan="5" class="empty-state">Tidak ada data admin</td></tr>';
}

const profileAutosaveTimeouts = { konsumen: null, teknisi: null };

function handleProfileFormInput(role) {
    if (!['konsumen', 'teknisi'].includes(role)) return;

    if (role === 'konsumen') {
        if (!runtimeState.profileEditor.konsumen.isEditing) return;
        syncKonsumenProfileDirtyState();
        return;
    }

    clearTimeout(profileAutosaveTimeouts[role]);
    profileAutosaveTimeouts[role] = setTimeout(() => {
        saveProfile(role).catch((error) => {
            console.error(`Autosave profile ${role} gagal:`, error);
        });
    }, 600);
}

function buildOwnProfilePayload(role, profile) {
    if (!profile || profile.role !== role) return null;

    if (role === 'konsumen') {
        return validateProfilePayloadForRole('konsumen', {
            id: profile.id,
            role: 'konsumen',
            username: document.getElementById('profileKonsumenUsername').value.trim(),
            name: document.getElementById('profileKonsumenName').value.trim(),
            email: profile.email,
            phone: document.getElementById('profileKonsumenPhone').value,
            birth_date: document.getElementById('profileKonsumenBirthDate').value,
            age: document.getElementById('profileKonsumenAge').value,
            referral: document.getElementById('profileKonsumenReferral').value.trim(),
            address: document.getElementById('profileKonsumenAddress').value.trim(),
            district: profile.district,
            location_text: profile.locationText,
            lat: profile.lat,
            lng: profile.lng,
            status: profile.status,
            ac_units: getProfileAcUnits(profile)
        });
    }

    if (role === 'teknisi') {
        return validateProfilePayloadForRole('teknisi', {
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

    return null;
}

async function persistOwnProfileUpdate(role, options = {}) {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== role) return null;

    const payload = buildOwnProfilePayload(role, profile);
    if (!payload) return null;

    const usernameTaken = await isUsernameTakenRemote(payload.username, profile.id);
    if (usernameTaken) {
        throw new Error('Username sudah dipakai akun lain.');
    }

    const updatedProfile = await upsertOwnProfile(payload);
    applySupabaseSession(updatedProfile);
    void syncNewUserToRemote(updatedProfile, { reason: options.reason || `profile-update-${role}` });
    return updatedProfile;
}

async function saveProfile(role) {
    const profile = await requireAuthenticatedProfile(false);
    if (!profile || profile.role !== role) return false;

    if (role === 'konsumen') {
        const editorState = runtimeState.profileEditor.konsumen;
        if (!editorState.isEditing) return false;
        if (editorState.submitting) return false;
        if (!syncKonsumenProfileDirtyState()) {
            showToast('Belum ada perubahan profil yang perlu disimpan.', 'info');
            return false;
        }

        openPasswordConfirmModal({
            title: 'Konfirmasi Simpan Profil',
            intro: 'Masukkan password akun Anda untuk menyimpan perubahan profil konsumen ke Supabase.',
            confirmLabel: 'Verifikasi & Simpan Profil',
            onConfirm: async () => {
                editorState.submitting = true;
                syncKonsumenProfileEditorUi();
                try {
                    const updatedProfile = await persistOwnProfileUpdate('konsumen', {
                        reason: 'profile-manual-save-konsumen'
                    });
                    editorState.isEditing = false;
                    editorState.isDirty = false;
                    editorState.snapshot = getKonsumenProfileSnapshot(updatedProfile);
                    renderAppShell();
                    renderKonsumenProfile();
                    showToast('Profil konsumen berhasil diperbarui.', 'success');
                } finally {
                    editorState.submitting = false;
                    syncKonsumenProfileEditorUi();
                }
            }
        });
        return false;
    }

    try {
        const updatedProfile = await persistOwnProfileUpdate(role, {
            reason: `profile-autosave-${role}`
        });
        if (!updatedProfile) return false;
        renderAppShell();
    } catch (error) {
        console.error(`Gagal menyimpan profile ${role}:`, error);
        showToast(toUserFacingError(error, 'Gagal menyimpan profile.'), 'error');
    }

    return false;
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
        ac_type: toNullableText(orderValues.ac_type),
        pk: toNullableText(orderValues.pk),
        refrigerant: toNullableText(orderValues.refrigerant),
        preferred_date: toNullableText(orderValues.preferred_date),
        address: toNullableText(orderValues.address),
        notes: toNullableText(orderValues.notes),
        phone: toNullableText(orderValues.phone),
        ac_unit_key: toNullableText(orderValues.ac_unit_key),
        status: 'Menunggu'
    };

    const { data } = await withOrderColumnFallback(
        ({ selectClause, payload: safePayload }) => supabaseClient
            .from('orders')
            .insert(safePayload)
            .select(selectClause)
            .single(),
        {
            context: 'createOrderSupabase',
            payload: insertPayload
        }
    );

    return mapOrderRecord(data, {
        fallbackSnapshot: {
            ...insertPayload,
            konsumen_name: profile.name
        }
    });
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
        const acSpecValues = collectOrderAcSpecValues();
        const order = await createOrderSupabase({
            service_id: service.id,
            service_name: service.name,
            price: service.price,
            ...acSpecValues,
            preferred_date: document.getElementById('orderDate').value,
            address: document.getElementById('orderAddress').value.trim(),
            notes: document.getElementById('orderNotes').value.trim(),
            phone: normalizePhone(document.getElementById('orderPhone').value)
        });

        notifyAdminNewOrder(order, waPopup);
        await loadCurrentOrdersForProfile();
        document.getElementById('formOrder').reset();
        renderKonsumenOrder();
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
    if (runtimeState.domEventsBound) return;
    document.getElementById('btnLogout')?.addEventListener('click', () => logoutUser());
    document.getElementById('serviceFormImageFile')?.addEventListener('change', handleServiceImageUpload);
    document.getElementById('imageCatalogFormFile')?.addEventListener('change', handleImageCatalogUpload);
    document.getElementById('formKonsumenProfile')?.addEventListener('input', () => handleProfileFormInput('konsumen'));
    document.getElementById('formTeknisiProfile')?.addEventListener('input', () => handleProfileFormInput('teknisi'));
    document.getElementById('viewKonsumenUnit')?.addEventListener('input', handleKonsumenUnitDraftInput);
    document.getElementById('viewKonsumenUnit')?.addEventListener('change', handleKonsumenUnitDraftInput);
    document.getElementById('btnSendPasswordChangeCode')?.addEventListener('click', () => {
        void sendPasswordChangeVerificationCode();
    });
    document.getElementById('btnInstallApp')?.addEventListener('click', () => {
        void promptInstallApp();
    });
    document.getElementById('btnInstallAppLanding')?.addEventListener('click', () => {
        void promptInstallApp();
    });
    bindShellNavEvents();
    bindInstallPromptEvents();
    bindConnectivityEvents();
    runtimeState.domEventsBound = true;
}

function handleStorageSync(event) {
    if (event.key !== STORAGE_KEY && event.key !== LEGACY_STORAGE_KEY) return;
    appData = loadStoredData();
    if (remoteState.profile && currentView) {
        renderAppShell();
        syncActiveNavState();
        renderCurrentView().catch((error) => {
            console.error('Gagal render ulang setelah storage sync:', error);
        });
    } else {
        syncInstallPromptUI();
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

async function restoreSession() {
    const profile = await bootstrapAuthState();
    return Boolean(profile);
}

async function initApp() {
    setBodyAppMode('public');
    appData = loadStoredData();
    saveData(appData);
    purgeLegacyKonsumenTeknisiCache();
    purgeSchemaDriftCache(PROFILE_SCHEMA_DRIFT_CACHE_PREFIX, PROFILE_SCHEMA_DRIFT_CACHE_KEY);
    purgeSchemaDriftCache(ORDER_SCHEMA_DRIFT_CACHE_PREFIX, ORDER_SCHEMA_DRIFT_CACHE_KEY);
    hydrateMissingProfileColumnsCache();
    hydrateMissingOrderColumnsCache();
    runtimeState.passwordRecoveryActive = hasPasswordRecoveryContext();
    populateConsumerDistrictOptions();
    populateAcSpecOptions('regKonUnitBrand', 'brand');
    populateAcSpecOptions('regKonUnitType', 'type');
    populateAcSpecOptions('regKonUnitRefrigerant', 'refrigerant');
    populateAcSpecOptions('regKonUnitCapacity', 'capacity');
    populateAcSpecOptions('konUnitBrand', 'brand');
    populateAcSpecOptions('konUnitType', 'type');
    populateAcSpecOptions('konUnitRefrigerant', 'refrigerant');
    populateAcSpecOptions('konUnitCapacity', 'capacity');
    renderRegisterAcUnitSavedList();
    renderKonsumenUnitDraftUi();
    populateSpecializationOptions('regTekSpecialization', 'Semua Layanan');
    syncAdminAccessUI();
    syncLoginRoleCopy('konsumen');
    initDomEvents();
    startLiveDataSync();
    syncConnectionStatusBanner();
    syncInstallPromptUI();
    void refreshPublicAuthBackendNotice();
    scheduleIdleTask(() => {
        void registerServiceWorkerSafe();
    }, 1800);
 
    if (!canUseSupabase()) {
        showLanding();
        showToast('Supabase client belum siap di browser ini.', 'error');
        return;
    }

    try {
        const hasSession = await restoreSession();
        if (runtimeState.passwordRecoveryActive) {
            showLoginPage();
            activatePasswordRecoveryMode();
            return;
        }
        if (hasSession && remoteState.profile) {
            await redirectUserByRole(remoteState.profile);
            return;
        }
    } catch (error) {
        console.error('Gagal restore session Supabase:', error);
        showToast(toUserFacingError(error, 'Gagal memulihkan session Supabase.'), 'warning');
    }

    showLanding();
    if (runtimeState.passwordRecoveryActive) {
        showLoginPage();
        activatePasswordRecoveryMode();
    }
}

window.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('storage', handleStorageSync);
