/**
 * الرابط العام المعتمد للمشاركة والإهداء في الويب وتطبيق الهاتف
 */
window.getPublicAppUrl = function(pathAndQuery = "") {
    let base = "https://zadmuslim-zeta.vercel.app/";
    const isNative = (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    if (!isNative && typeof window !== "undefined" && window.location && window.location.hostname && !["localhost", "127.0.0.1", ""].includes(window.location.hostname) && !window.location.hostname.includes("capacitor")) {
        base = window.location.origin + window.location.pathname;
    }
    if (!pathAndQuery) return base;
    if (pathAndQuery.startsWith("?") || pathAndQuery.startsWith("#")) {
        return base.replace(/\/+$/, "") + pathAndQuery;
    }
    return base.replace(/\/+$/, "") + "/" + pathAndQuery.replace(/^\/+/, "");
};

// كشف أجهزة iOS و Android و Capacitor لتأمين الحواف الآمنة للجزيرة التفاعلية وضبط الرأس
(function initSafeAreaDetection() {
    try {
        const ua = navigator.userAgent || '';
        const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroid = /Android/i.test(ua) || (window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android');
        if (isIOS) {
            document.documentElement.classList.add('ios-device');
        } else if (isAndroid) {
            document.documentElement.classList.add('android-device');
        }
        if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
            document.documentElement.classList.add('capacitor-native-app');
        }
    } catch(e) {}
})();

// قياس وتحديث ارتفاع الهيدر الفعلي لدعم الحواف الآمنة والجزيرة التفاعلية (Dynamic Island & Safe Area)
function updateNavbarActualHeight() {
    try {
        const navbar = document.querySelector('.navbar') || document.querySelector('header.top');
        if (navbar) {
            const h = navbar.getBoundingClientRect().height || navbar.offsetHeight;
            if (h > 0) {
                document.documentElement.style.setProperty('--navbar-actual-height', `${Math.round(h)}px`);
            }
        }
    } catch(e) {}
}
window.addEventListener('resize', updateNavbarActualHeight);
window.addEventListener('orientationchange', () => setTimeout(updateNavbarActualHeight, 250));
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavbarActualHeight);
} else {
    updateNavbarActualHeight();
}

/* ==========================================================================
   Smart Scroll Header (إظهار الهيدر عند التمرير لأعلى وإخفاؤه عند التمرير لأسفل)
   ========================================================================== */
function initSmartHeaderScroll() {
    if (window._smartHeaderScrollInitialized) return;
    window._smartHeaderScrollInitialized = true;

    let lastScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
    let ticking = false;
    const scrollThreshold = 8; // عتبة الحركة لتفادي الاهتزاز مع اللمس الدقيق
    const minScrollToShowHide = 45; // لا يتم الإخفاء إذا كان المستخدم قريباً جداً من قمة الصفحة

    function getHeaders() {
        return document.querySelectorAll('.app-native-header, header.top');
    }

    function isAnyModalOpen() {
        return Boolean(
            document.body.classList.contains('modal-open') ||
            document.body.classList.contains('no-scroll') ||
            document.querySelector('.modal.active, .modal.show, .custom-modal.active, .native-overlay.active, .real-mushaf-card.mushaf-fullscreen-mode, .mushaf-fullscreen')
        );
    }

    function updateHeader() {
        const currentScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
        const headers = getHeaders();
        
        if (!headers.length) {
            ticking = false;
            return;
        }

        // إذا كانت نافذة منبثقة أو وضع القراءة بملء الشاشة مفعلاً، نظهر الهيدر ونخرج
        if (isAnyModalOpen()) {
            headers.forEach(h => h.classList.remove('header-hidden'));
            lastScrollY = currentScrollY;
            ticking = false;
            return;
        }

        // عند الوصول إلى أعلى الصفحة (أول 25px)، يظهر الهيدر دائماً
        if (currentScrollY <= 25) {
            headers.forEach(h => h.classList.remove('header-hidden'));
        } 
        // تمرير لأسفل وتجاوز العتبة: إخفاء الهيدر بسلاسة
        else if (currentScrollY > lastScrollY + scrollThreshold && currentScrollY > minScrollToShowHide) {
            headers.forEach(h => h.classList.add('header-hidden'));
        } 
        // تمرير لأعلى وتجاوز العتبة: إظهار الهيدر بسلاسة
        else if (currentScrollY < lastScrollY - scrollThreshold) {
            headers.forEach(h => h.classList.remove('header-hidden'));
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

    // إعادة إظهار الهيدر دائماً عند النقر على أيقونات التنقل أو الشعار أو أزرار التطبيق
    document.addEventListener('click', (e) => {
        if (e.target.closest('.app-nav-tab, .mobilebar-link, .app-icon-btn, .logo, .mobile-toggle')) {
            getHeaders().forEach(h => h.classList.remove('header-hidden'));
        }
    }, { passive: true });

    window.resetHeaderVisibility = function() {
        getHeaders().forEach(h => h.classList.remove('header-hidden'));
        lastScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
    };
}

// تهيئة فورية للهيدر إذا تم تحميل المستند بالفعل
if (document.readyState !== 'loading') {
    initSmartHeaderScroll();
}

document.addEventListener("DOMContentLoaded", () => {
    updateNavbarActualHeight();
    initSmartHeaderScroll();
    // 1. تهيئة اسم الجد والمعلومات الرئيسية والتقويم الهجري
    initDeceasedInfo();
    initHijriDate();
    initOfflineIndicator();

    // 2. تهيئة الأدعية وسلايدر Swiper
    initPrayersSwiper();

    // 3. تهيئة السبحة الإلكترونية والعداد الموحد
    initTasbeeh();

    // 4. تهيئة سكشن المصحف وختمة القرآن الموحد
    initQuranKhatmaTabs();
    initKhatma();

    // 5. تهيئة أذكار اليوم وحصن المسلم التفاعلية
    initSmartAzkar();

    // 6. تهيئة نافذة إضافة دعاء
    initAddPrayerModal();

    // 7. تهيئة أزرار المشاركة والنسخ
    initShareButtons();

    // 8. تهيئة مشغل التلاوة الخاشعة وإذاعة القرآن الكريم
    initAudioPlayer();
    initLiveRadio();

    // 9. تهيئة تطبيق الهاتف التقدمي (PWA) وزر الرجوع الذكي للأندرويد
    initPWA();
    initAndroidBackButton();

    // 10. تهيئة مواقيت الصلاة وساعة الاستجابة ومواسم الصيام وبوصلة القبلة وتحديد الموقع GPS وصوت الأذان
    initPrayerTimes();
    initGPSLocation();
    initFastingTracker();
    initQiblaCompass();
    initAdhanNotifications();
    initMuazzinSelector();
    checkUrlForAdhanAutoPlay();

    // 11. تهيئة جدول الورد والمهام الإيمانية وتتابع الإنجاز (Streak)
    initDailyWird();

    // 12. تهيئة بطاقة قبس اليوم (آية وحديث اليوم ومشاركة الستوري)
    initDailyWisdom();

    // 13. تهيئة موسوعة الأدعية النبوية المبوبة
    initCategorizedDuas();

    // 14. تهيئة صانع بطاقات الأدعية المصورة
    initDuaCardGenerator();

    // 15. تهيئة دليل وآداب زيارة القبور
    initCemeteryGuide();
});

/* ==========================================================================
   1. معلومات المتوفى
   ========================================================================== */
function initDeceasedInfo() {
    const nameElements = document.querySelectorAll(".deceased-name");
    nameElements.forEach(el => {
        el.textContent = DECEASED_INFO.name;
    });

    const bioElement = document.getElementById("deceased-bio");
    if (bioElement) {
        bioElement.textContent = DECEASED_INFO.shortBio;
    }
}

/**
 * حساب وعرض التاريخ الهجري والميلادي واليوم بتنسيق عربي كامل وفاخر
 */
function getFullFormattedDate(date = new Date()) {
    let offsetDays = 0;
    try {
        offsetDays = parseInt(localStorage.getItem('zad_hijri_offset') || '0', 10) || 0;
    } catch (e) {}
    const hijriDate = new Date(date.getTime() + (offsetDays * 86400000));

    // 1. اليوم (اسم يوم الأسبوع بالعربية)
    const WEEKDAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const weekday = WEEKDAYS[date.getDay()] || "";

    // 2. التاريخ الهجري (أم القرى مع الاحتياطي الخوارزمي)
    const HIJRI_MONTHS = [
        "المحرّم", "صفر", "ربيع الأول", "ربيع الآخر",
        "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
        "رمضان", "شوّال", "ذو القعدة", "ذو الحجة"
    ];
    let hijriPart = "";
    try {
        const hFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        hijriPart = hFormatter.format(hijriDate);
        if (!hijriPart.includes("هـ")) hijriPart += " هـ";
    } catch (e) {
        try {
            const hFallback = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            hijriPart = hFallback.format(hijriDate);
            if (!hijriPart.includes("هـ")) hijriPart += " هـ";
        } catch (err) {
            const jd = Math.floor(hijriDate.getTime() / 86400000) + 2440587.5;
            const l = Math.floor(jd - 1948440 + 10632);
            const n = Math.floor((l - 1) / 10631);
            const l2 = l - 10631 * n + 354;
            const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
            const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
            const m = Math.floor((24 * l3) / 709);
            const d = l3 - Math.floor((709 * m) / 24);
            const y = 30 * n + j - 30;
            hijriPart = `${d} ${HIJRI_MONTHS[(m - 1 + 12) % 12]} ${y} هـ`;
        }
    }

    // 3. التاريخ الميلادي (محدد صراحة بتقويم gregory لتفادي فرض التقويم الهجري في بيئات ar-SA)
    const GREGORIAN_MONTHS = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    let gregPart = "";
    try {
        const gFormatter = new Intl.DateTimeFormat('ar-EG-u-ca-gregory', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        gregPart = gFormatter.format(date);
        if (!gregPart.includes("م")) gregPart += " م";
    } catch (e) {
        const d = date.getDate();
        const m = GREGORIAN_MONTHS[date.getMonth()];
        const y = date.getFullYear();
        gregPart = `${d} ${m} ${y} م`;
    }

    // دمج اليوم والتاريخ الهجري والتاريخ الميلادي
    if (weekday && hijriPart && gregPart) {
        return `${weekday}، ${hijriPart} - ${gregPart}`;
    } else if (hijriPart && gregPart) {
        return `${hijriPart} - ${gregPart}`;
    } else if (weekday && gregPart) {
        return `${weekday}، ${gregPart}`;
    }
    return gregPart || weekday || "تاريخ اليوم المبارك";
}
window.getFullFormattedDate = getFullFormattedDate;

/**
 * حساب وعرض التاريخ الهجري والميلادي واليوم في الواجهة
 */
function initHijriDate() {
    const heroHijriEl = document.getElementById("hero-hijri-date-text");
    const prayerHijriEl = document.getElementById("prayer-hijri-text");
    const todayEl = document.getElementById("today");

    const fullDate = getFullFormattedDate();

    if (todayEl) {
        todayEl.innerHTML = `<i class="fa-solid fa-calendar-days" style="margin-left: 2px; opacity: 0.85;"></i>${fullDate}`;
    }

    let formattedDate = ""; 
    try {
        let offsetDays = 0;
        try { offsetDays = parseInt(localStorage.getItem('zad_hijri_offset') || '0', 10) || 0; } catch (e) {}
        const hDate = new Date(Date.now() + (offsetDays * 86400000));
        const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        formattedDate = formatter.format(hDate);
    } catch (e) {
        try {
            let offsetDays = 0;
            try { offsetDays = parseInt(localStorage.getItem('zad_hijri_offset') || '0', 10) || 0; } catch (e) {}
            const hDate = new Date(Date.now() + (offsetDays * 86400000));
            const fallback = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            formattedDate = fallback.format(hDate);
        } catch (err) {
            formattedDate = "التقويم الهجري المبارك";
        }
    }

    if (heroHijriEl && formattedDate) {
        heroHijriEl.textContent = formattedDate;
    }
    if (prayerHijriEl && formattedDate) {
        prayerHijriEl.textContent = formattedDate;
    }
}
window.initHijriDate = initHijriDate;

/* ==========================================================================
   2. سلايدر الأدعية (Swiper.js) والمزامنة السحابية (Firebase Realtime)
   ========================================================================== */
let prayersSwiperInstance = null;
let allPrayers = [];
let firebaseDb = null;
let prayersRef = null;

/**
 * تحويل الطابع الزمني (Timestamp) إلى نص نسبي عربي بليغ ودقيق
 * (الآن، منذ دقيقة، منذ دقيقتين، منذ 5 دقائق، منذ ساعتين، منذ يوم، إلخ)
 */
function formatArabicRelativeTime(timestamp) {
    if (!timestamp || isNaN(timestamp)) return null;
    const now = Date.now();
    const diff = Math.max(0, now - Number(timestamp));

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
        return "الآن";
    } else if (minutes === 1) {
        return "منذ دقيقة";
    } else if (minutes === 2) {
        return "منذ دقيقتين";
    } else if (minutes >= 3 && minutes <= 10) {
        return `منذ ${minutes} دقائق`;
    } else if (minutes < 60) {
        return `منذ ${minutes} دقيقة`;
    } else if (hours === 1) {
        return "منذ ساعة";
    } else if (hours === 2) {
        return "منذ ساعتين";
    } else if (hours >= 3 && hours <= 10) {
        return `منذ ${hours} ساعات`;
    } else if (hours < 24) {
        return `منذ ${hours} ساعة`;
    } else if (days === 1) {
        return "منذ يوم";
    } else if (days === 2) {
        return "منذ يومين";
    } else if (days >= 3 && days <= 10) {
        return `منذ ${days} أيام`;
    } else if (days < 30) {
        return `منذ ${days} يوماً`;
    } else if (months === 1) {
        return "منذ شهر";
    } else if (months === 2) {
        return "منذ شهرين";
    } else if (months >= 3 && months <= 10) {
        return `منذ ${months} أشهر`;
    } else if (months < 12) {
        return `منذ ${months} شهراً`;
    } else if (years === 1) {
        return "منذ عام";
    } else if (years === 2) {
        return "منذ عامين";
    } else {
        return `منذ ${years} أعوام`;
    }
}

/**
 * فك تشفير الطابع الزمني من معرف Firebase Push ID تلقائياً
 */
function decodeFirebasePushIdTimestamp(id) {
    if (!id || typeof id !== 'string' || id.length < 8) return 0;
    const PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
    let time = 0;
    for (let i = 0; i < 8; i++) {
        const c = id.charAt(i);
        const idx = PUSH_CHARS.indexOf(c);
        if (idx === -1) return 0;
        time = (time * 64) + idx;
    }
    return time;
}

/**
 * استخراج الطابع الزمني وتحديد النص المعروض لتاريخ الدعاء
 */
function getPrayerDisplayDate(prayer) {
    let ts = prayer.timestamp;

    // استخراج الطابع الزمني من user_TIMESTAMP للأدعية المحلية السابقة
    if (!ts && typeof prayer.id === "string" && prayer.id.startsWith("user_")) {
        const extracted = parseInt(prayer.id.replace("user_", ""), 10);
        if (!isNaN(extracted) && extracted > 1600000000000) {
            ts = extracted;
            prayer.timestamp = ts;
        }
    }

    // استخراج الطابع الزمني من معرف فيربيز push id إن لم يكن مسجلاً كخاصية
    if (!ts && typeof prayer.id === "string" && prayer.id.startsWith("-")) {
        const decoded = decodeFirebasePushIdTimestamp(prayer.id);
        if (decoded > 1600000000000) {
            ts = decoded;
            prayer.timestamp = ts;
        }
    }

    if (ts) {
        const formatted = formatArabicRelativeTime(ts);
        if (formatted) return formatted;
    }

    // إذا كان محفوظاً كنص "الآن" قديماً ولا يوجد وقت محدد
    if (prayer.date === "الآن") {
        return "منذ قليل";
    }

    return prayer.date || "مؤخراً";
}

/**
 * تحديث تواريخ الأدعية المعروضة تلقائياً كل 30 ثانية لتتحول "الآن" إلى "منذ دقيقة" ثم "منذ 5 دقائق" وهكذا
 */
function updateAllPrayerRelativeDates() {
    const dateElements = document.querySelectorAll(".prayer-date[data-timestamp]");
    dateElements.forEach(el => {
        const ts = Number(el.getAttribute("data-timestamp"));
        if (ts && !isNaN(ts)) {
            const formatted = formatArabicRelativeTime(ts);
            if (formatted && el.textContent !== formatted) {
                el.textContent = formatted;
            }
        }
    });
}

function initPrayersSwiper() {
    const swiperEl = document.querySelector(".swiper-prayers");
    if (!swiperEl) return;

    // 1. تحميل الأدعية المحلية أو الافتراضية أولاً لضمان سرعة الفتح الفوري
    const storedPrayers = localStorage.getItem("user_prayers_list");
    if (storedPrayers) {
        try {
            const parsed = JSON.parse(storedPrayers);
            allPrayers = [...parsed, ...DEFAULT_PRAYERS];
        } catch (e) {
            allPrayers = [...DEFAULT_PRAYERS];
        }
    } else {
        allPrayers = [...DEFAULT_PRAYERS];
    }

    renderPrayerSlides();

    // تهيئة مكتبة Swiper مع دعم كامل لاتجاه اليمين لليسار (RTL)
    if (typeof Swiper === "undefined") {
        console.warn("Swiper library is not available yet, slides rendered statically.");
        return;
    }

    prayersSwiperInstance = new Swiper(".swiper-prayers", {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        autoplay: {
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 28
            }
        }
    });

    // تحديث التواريخ النسبية للأدعية تلقائياً كل 30 ثانية
    setInterval(updateAllPrayerRelativeDates, 30000);

    // 2. إذا تم تفعيل Firebase، ابدأ المزامنة السحابية اللحظية مع جميع الزوار في العالم
    initFirebaseRealtimeSync();
}

function getFirebaseDb() {
    if (firebaseDb) return firebaseDb;
    if (typeof firebase !== "undefined" && typeof isFirebaseConfigured === "function" && isFirebaseConfigured()) {
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            firebaseDb = firebase.database();
            return firebaseDb;
        } catch (e) {
            console.warn("Firebase init error:", e);
        }
    }
    return null;
}

function initFirebaseRealtimeSync() {
    const db = getFirebaseDb();
    if (!db) {
        console.log("Firebase not configured yet; using local storage mode.");
        return;
    }

    try {
        prayersRef = db.ref("prayers");

        // استماع لحظي لأي أدعية جديدة يضيفها أي شخص حول العالم
        prayersRef.limitToLast(60).on("value", (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const cloudPrayers = [];
                Object.keys(data).forEach((key) => {
                    let ts = data[key].timestamp || 0;
                    if (!ts && typeof key === "string" && key.startsWith("-")) {
                        ts = decodeFirebasePushIdTimestamp(key);
                    }
                    cloudPrayers.push({
                        id: key,
                        isCloud: true,
                        author: data[key].author || "فاعل خير",
                        text: data[key].text || "",
                        date: data[key].date || "",
                        amenCount: data[key].amenCount || 0,
                        timestamp: ts
                    });
                });

                // ترتيب الأدعية من الأحدث للأقدم
                cloudPrayers.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                // دمج الأدعية السحابية مع الأدعية المأثورة الافتراضية
                allPrayers = [...cloudPrayers, ...DEFAULT_PRAYERS];
                renderPrayerSlides();

                if (prayersSwiperInstance) {
                    prayersSwiperInstance.update();
                }
            }
        });
        console.log("Firebase Realtime Database connected successfully! 🌍✨");
    } catch (err) {
        console.warn("Firebase sync error:", err);
    }
}

function renderPrayerSlides() {
    const wrapper = document.getElementById("prayers-swiper-wrapper");
    if (!wrapper) return;

    wrapper.innerHTML = "";

    // جلب الأدعية التي أمّن عليها المستخدم سابقاً
    const amenState = JSON.parse(localStorage.getItem("amen_prayers_voted") || "{}");

    allPrayers.forEach(prayer => {
        const slide = document.createElement("div");
        slide.className = "swiper-slide";

        const hasVoted = !!amenState[prayer.id];
        const displayDate = getPrayerDisplayDate(prayer);
        const tsAttr = prayer.timestamp ? ` data-timestamp="${prayer.timestamp}"` : "";

        slide.innerHTML = `
            <div class="prayer-card">
                <div class="prayer-card-header">
                    <div class="prayer-author">
                        <div class="author-avatar">
                            <i class="fa-solid fa-hands-praying"></i>
                        </div>
                        <span class="author-name">${escapeHTML(prayer.author)}</span>
                    </div>
                    <span class="prayer-date"${tsAttr}>${escapeHTML(displayDate)}</span>
                </div>
                <div class="prayer-body">
                    "${escapeHTML(prayer.text)}"
                </div>
                <div class="prayer-card-footer">
                    <button class="btn-amen ${hasVoted ? 'active' : ''}" 
                            data-prayer-id="${prayer.id}" 
                            onclick="handleAmenClick('${prayer.id}')">
                        <i class="fa-solid fa-heart"></i>
                        <span>اللهم آمين</span>
                        (<span class="amen-count" id="amen-count-${prayer.id}">${prayer.amenCount || 0}</span>)
                    </button>
                    <span style="font-size: 0.8rem; color: var(--text-muted)">أثابكم الله</span>
                </div>
            </div>
        `;
        wrapper.appendChild(slide);
    });
}

// التفاعل مع زر التأمين (اللهم آمين)
window.handleAmenClick = function(prayerId) {
    const amenState = JSON.parse(localStorage.getItem("amen_prayers_voted") || "{}");
    const countEl = document.getElementById(`amen-count-${prayerId}`);
    const buttonEl = document.querySelector(`button[data-prayer-id="${prayerId}"]`);

    if (amenState[prayerId]) {
        showToast("لقد أمّنت على هذا الدعاء مسبقاً، تقبل الله منك ✨");
        return;
    }

    // زيادة العداد
    const prayer = allPrayers.find(p => p.id === prayerId);
    if (prayer) {
        prayer.amenCount = (prayer.amenCount || 0) + 1;
        if (countEl) countEl.textContent = prayer.amenCount;
        if (buttonEl) buttonEl.classList.add("active");
        
        amenState[prayerId] = true;
        localStorage.setItem("amen_prayers_voted", JSON.stringify(amenState));

        // إذا كان الدعاء سحابياً في Firebase، حدّث العداد عالمياً ليراه الجميع
        if (prayer.isCloud && firebaseDb) {
            try {
                firebaseDb.ref(`prayers/${prayerId}/amenCount`).transaction(curr => (curr || 0) + 1);
            } catch (e) {
                console.warn("Amen transaction error:", e);
            }
        }

        // تأثير صوتي خفيف
        playBeadSound(650);
        showToast("آمين يا رب العالمين، كُتب لك أجر التأمين 🤲");
    }
};

/* ==========================================================================
   3. السبحة الإلكترونية للتسبيح على روحه والعداد الموحد
   ========================================================================== */
let activeZkrIndex = 0;
let currentZkrCount = 0;
let totalTasbeehSession = 0;
let globalTasbeehCount = 0;
let pendingTasbeehBatch = 0;
let tasbeehBatchTimer = null;
const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function initTasbeeh() {
    renderAzkarList();
    loadActiveZkr(0);

    // استرجاع الإجمالي التاريخي المخزن
    const storedTotal = localStorage.getItem("tasbeeh_lifetime_total") || "0";
    totalTasbeehSession = parseInt(storedTotal, 10);
    updateTotalDisplays();

    // إعداد المزامنة السحابية للعداد العالمي الموحد
    initGlobalTasbeehSync();

    // إعداد دائرة شريط التقدم SVG
    const circle = document.querySelector(".progress-ring__circle");
    if (circle) {
        circle.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
        circle.style.strokeDashoffset = CIRCUMFERENCE;
    }

    // الاستماع لنقر مساحة التسبيح
    const clickArea = document.getElementById("tasbeeh-click-area");
    if (clickArea) {
        clickArea.addEventListener("click", incrementTasbeeh);
    }

    // زر التصفير
    const resetBtn = document.getElementById("btn-reset-tasbeeh");
    if (resetBtn) {
        resetBtn.addEventListener("click", resetCurrentZkr);
    }
}

function initGlobalTasbeehSync() {
    const db = getFirebaseDb();
    if (!db) return;

    try {
        const statsRef = db.ref("stats/globalTasbeehCount");
        statsRef.on("value", snapshot => {
            const val = snapshot.val();
            if (typeof val === "number") {
                globalTasbeehCount = val;
                updateGlobalTasbeehDisplays();
            } else if (val === null) {
                db.ref("stats/globalTasbeehCount").set(24530);
                globalTasbeehCount = 24530;
                updateGlobalTasbeehDisplays();
            }
        });
    } catch (e) {
        console.warn("Global tasbeeh sync error:", e);
    }
}

function updateGlobalTasbeehDisplays() {
    const statEl = document.getElementById("global-tasbeeh-stat");
    const tasbeehEl = document.getElementById("total-global-tasbeeh-count");
    const formatted = (globalTasbeehCount + pendingTasbeehBatch).toLocaleString("ar-EG");

    if (statEl) statEl.textContent = formatted;
    if (tasbeehEl) tasbeehEl.textContent = formatted;
}

function syncTasbeehBatchToCloud() {
    if (pendingTasbeehBatch <= 0) return;
    const db = getFirebaseDb();
    const batchToPush = pendingTasbeehBatch;
    pendingTasbeehBatch = 0;

    if (db) {
        try {
            db.ref("stats/globalTasbeehCount").transaction(curr => (curr || 0) + batchToPush);
        } catch (e) {
            console.warn("Error incrementing global tasbeeh:", e);
        }
    }
}

function renderAzkarList() {
    const listContainer = document.getElementById("azkar-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    TASBEEH_ITEMS.forEach((zkr, idx) => {
        const item = document.createElement("div");
        item.className = `zkr-btn ${idx === activeZkrIndex ? 'active' : ''}`;
        item.onclick = () => selectZkr(idx);
        item.innerHTML = `
            <div class="zkr-text">${zkr.text}</div>
            <div class="zkr-target">${zkr.target} مرة</div>
        `;
        listContainer.appendChild(item);
    });
}

function selectZkr(index) {
    if (index === activeZkrIndex) return;
    activeZkrIndex = index;
    currentZkrCount = 0;
    renderAzkarList();
    loadActiveZkr(index);
    updateCounterDisplay();
}

function loadActiveZkr(index) {
    const zkr = TASBEEH_ITEMS[index];
    const nameEl = document.getElementById("active-zkr-name");
    const virtueEl = document.getElementById("active-zkr-virtue");
    const targetEl = document.getElementById("zkr-target-display");

    if (nameEl) nameEl.textContent = zkr.text;
    if (virtueEl) virtueEl.textContent = zkr.virtue;
    if (targetEl) targetEl.textContent = zkr.target;

    updateCounterDisplay();
}

function incrementTasbeeh() {
    const zkr = TASBEEH_ITEMS[activeZkrIndex];
    currentZkrCount++;
    totalTasbeehSession++;

    // حفظ الإجمالي المحلي
    localStorage.setItem("tasbeeh_lifetime_total", totalTasbeehSession.toString());

    // تحديث العداد السحابي العالمي الموحد بالدفع المجمع
    pendingTasbeehBatch++;
    updateGlobalTasbeehDisplays();

    if (tasbeehBatchTimer) clearTimeout(tasbeehBatchTimer);
    tasbeehBatchTimer = setTimeout(syncTasbeehBatchToCloud, 1200);

    // اهتزاز خفيف للموبايل إن كان مدعوماً
    if ("vibrate" in navigator) {
        navigator.vibrate(30);
    }

    // نغمة صوتية هادئة تمثل خرزة السبحة
    playBeadSound(480 + (currentZkrCount % 10) * 15);

    if (typeof window.addSpiritualGardenDeed === "function") {
        window.addSpiritualGardenDeed("tasbeeh", 1);
    }

    updateCounterDisplay();
    updateTotalDisplays();

    // فحص إتمام الهدف
    if (currentZkrCount >= zkr.target) {
        playCompletionChime();
        showToast(`هنيئاً لك! أتممت ${zkr.target} تسبيحة، وننتقل الآن للذكر التالي 🌿`);
        currentZkrCount = 0;
        
        // الانتقال التلقائي للذكر التالي في القائمة
        const nextIndex = (activeZkrIndex + 1) % TASBEEH_ITEMS.length;
        setTimeout(() => {
            selectZkr(nextIndex);
            // تحريك التمرير ليظهر الذكر النشط الجديد
            const activeBtn = document.querySelectorAll(".zkr-btn")[nextIndex];
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }, 700);
    }
}

function resetCurrentZkr() {
    currentZkrCount = 0;
    updateCounterDisplay();
    showToast("تم تصفير عداد الذكر الحالي.");
}

function updateCounterDisplay() {
    const numberEl = document.getElementById("counter-number");
    if (numberEl) {
        numberEl.textContent = currentZkrCount;
    }

    const zkr = TASBEEH_ITEMS[activeZkrIndex];
    const circle = document.querySelector(".progress-ring__circle");
    if (circle && zkr) {
        const percent = Math.min(currentZkrCount / zkr.target, 1);
        const offset = CIRCUMFERENCE - (percent * CIRCUMFERENCE);
        circle.style.strokeDashoffset = offset;
    }
}

function updateTotalDisplays() {
    const totalEl = document.getElementById("total-tasbeeh-count");
    if (totalEl) {
        totalEl.textContent = totalTasbeehSession.toLocaleString("ar-EG");
    }
}

/* ==========================================================================
   4. نافذة إضافة دعاء (Modal & Form)
   ========================================================================== */
function initAddPrayerModal() {
    const modal = document.getElementById("add-prayer-modal");
    if (!modal) return;

    const openBtns = document.querySelectorAll(".btn-open-prayer-modal");
    const closeBtn = document.getElementById("btn-close-modal");
    const form = document.getElementById("add-prayer-form");
    const quickPillsContainer = document.getElementById("quick-pills-container");
    const textarea = document.getElementById("prayer-input-text");

    // ملء قوالب الأدعية السريعة
    if (quickPillsContainer && textarea) {
        QUICK_PRAYER_TEMPLATES.forEach(template => {
            const pill = document.createElement("button");
            pill.type = "button";
            pill.className = "quick-pill";
            pill.textContent = template;
            pill.onclick = () => {
                textarea.value = template;
                textarea.focus();
            };
            quickPillsContainer.appendChild(pill);
        });
    }

    openBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            modal.classList.add("open");
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("open");
        });
    }

    // إغلاق عند النقر بالخلفية
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("open");
        }
    });

    // إرسال النموذج
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const authorInput = document.getElementById("prayer-input-author");
            const author = authorInput.value.trim() || "فاعل خير";
            const text = textarea.value.trim();

            if (!text) {
                alert("يرجى كتابة نص الدعاء");
                return;
            }

            const now = Date.now();
            const newPrayer = {
                id: "user_" + now,
                author: author,
                text: text,
                timestamp: now,
                amenCount: 1
            };

            // 1. إضافة الدعاء محلياً للأمام فوراً لضمان ظهوره اللحظي
            allPrayers.unshift(newPrayer);
            renderPrayerSlides();
            if (prayersSwiperInstance) {
                prayersSwiperInstance.update();
                prayersSwiperInstance.slideToLoop(0, 600);
            }

            // 2. إذا كان Firebase متصلاً، ارفع الدعاء للسحابة ليظهر فوراً لجميع الزوار حول العالم
            if (prayersRef) {
                try {
                    prayersRef.push({
                        author: author,
                        text: text,
                        timestamp: (typeof firebase !== 'undefined' && firebase.database && firebase.database.ServerValue) ? firebase.database.ServerValue.TIMESTAMP : now,
                        amenCount: 1
                    }).then(() => {
                        console.log("Prayer published to cloud successfully!");
                    }).catch(err => {
                        console.error("Firebase push error:", err);
                    });
                } catch (e) {
                    console.warn("Could not push to Firebase:", e);
                }
            }

            // 3. حفظ محلياً أيضاً لضمان ظهوره الدائم
            const stored = JSON.parse(localStorage.getItem("user_prayers_list") || "[]");
            stored.unshift(newPrayer);
            localStorage.setItem("user_prayers_list", JSON.stringify(stored));

            // 4. إغلاق وتفريغ
            modal.classList.remove("open");
            form.reset();

            playCompletionChime();
            showToast("جزاك الله خيراً! تم نشر دعائك ويظهر الآن في السلايدر 🤲");

            // 5. التوجه الفوري السلس إلى قسم السلايدر والانتقال لأول شريحة وإبرازها
            setTimeout(() => {
                const prayersSection = document.getElementById("prayers");
                if (prayersSection) {
                    prayersSection.scrollIntoView({ behavior: "smooth" });
                }
                if (prayersSwiperInstance) {
                    prayersSwiperInstance.slideToLoop(0, 600);
                }
                const firstCard = document.querySelector("#prayers-swiper-wrapper .swiper-slide-active .prayer-card") || document.querySelector("#prayers-swiper-wrapper .prayer-card");
                if (firstCard) {
                    firstCard.classList.add("prayer-card-newly-added");
                    setTimeout(() => firstCard.classList.remove("prayer-card-newly-added"), 5000);
                }
            }, 350);
        });
    }
}

/* ==========================================================================
   5. أزرار المشاركة والنسخ
   ========================================================================== */
function initShareButtons() {
    const copyBtns = document.querySelectorAll(".btn-copy-link");
    const whatsappBtns = document.querySelectorAll(".btn-share-whatsapp");
    const twitterBtns = document.querySelectorAll(".btn-share-twitter");

    const pageUrl = window.getPublicAppUrl();
    const shareMessage = `تطبيق زاد المسلم | القرآن الكريم كاملاً، مواقيت الصلاة، الأذكار والسبحة (صدقة جارية لوجه الله تعالى):\n${pageUrl}`;

    copyBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            navigator.clipboard.writeText(pageUrl).then(() => {
                showToast("تم نسخ رابط الموقع بنجاح، شاركه لتنال الأجر 🔗");
            }).catch(() => {
                // بديل للمتصفحات القديمة
                const input = document.createElement("input");
                input.value = pageUrl;
                document.body.appendChild(input);
                input.select();
                document.execCommand("copy");
                document.body.removeChild(input);
                showToast("تم نسخ رابط الموقع بنجاح 🔗");
            });
        });
    });

    whatsappBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
            window.open(url, "_blank");
        });
    });

    twitterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
            window.open(url, "_blank");
        });
    });
}

/* ==========================================================================
   6. التلاوة الخاشعة (Audio Player)
   ========================================================================== */
function initAudioPlayer() {
    const audioBtn = document.getElementById("btn-toggle-audio");
    const audioEl = document.getElementById("quran-audio");
    if (!audioBtn || !audioEl) return;

    let isPlaying = false;

    audioBtn.addEventListener("click", () => {
        if (isPlaying) {
            audioEl.pause();
            audioBtn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> <span>تشغيل تلاوة خاشعة</span>`;
            isPlaying = false;
        } else {
            audioEl.play().then(() => {
                audioBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i> <span>إيقاف التلاوة</span>`;
                isPlaying = true;
            }).catch(e => {
                console.log("Audio play error", e);
                showToast("تعذر تشغيل الصوت تلقائياً، يرجى التفاعل مع الصفحة أولاً");
            });
        }
    });
}

/* ==========================================================================
   7. ختمة القرآن الكريم الجماعية (Live Quran Khatma)
   ========================================================================== */
let currentKhatmaData = {
    cycle: 1,
    parts: {}
};
let activeKhatmaFilter = "all";

/* ==========================================================================
   تبويبات سكشن المصحف وختمة القرآن الموحد
   ========================================================================== */
function initQuranKhatmaTabs() {
    const tabBtns = document.querySelectorAll(".quran-tab-btn");
    const mushafBlock = document.getElementById("subpart-mushaf");
    const khatmaBlock = document.getElementById("subpart-khatma");

    if (!tabBtns.length || !mushafBlock || !khatmaBlock) return;

    window.switchQuranKhatmaTab = function(targetTab) {
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === targetTab) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        if (targetTab === "khatma") {
            mushafBlock.classList.add("is-hidden");
            khatmaBlock.classList.remove("is-hidden");
        } else {
            // الافتراضي هو المصحف الشريف
            mushafBlock.classList.remove("is-hidden");
            khatmaBlock.classList.add("is-hidden");
        }
    };

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.dataset.tab || "mushaf";
            window.switchQuranKhatmaTab(targetTab);
        });
    });

    if (window.location.hash === "#khatma") {
        window.switchQuranKhatmaTab("khatma");
    } else {
        window.switchQuranKhatmaTab("mushaf");
    }
}

function initKhatma() {
    initDefaultKhatmaParts();
    renderKhatmaGrid();
    initKhatmaFirebaseSync();
    initKhatmaFilters();
    initKhatmaModal();
}

function initDefaultKhatmaParts() {
    const stored = localStorage.getItem("local_khatma_cache");
    if (stored) {
        try {
            currentKhatmaData = JSON.parse(stored);
        } catch (e) {
            buildDefaultKhatmaObject();
        }
    } else {
        buildDefaultKhatmaObject();
    }
}

function buildDefaultKhatmaObject() {
    currentKhatmaData.cycle = currentKhatmaData.cycle || 1;
    currentKhatmaData.parts = {};
    if (typeof QURAN_PARTS_INFO !== "undefined") {
        QURAN_PARTS_INFO.forEach(p => {
            currentKhatmaData.parts[p.id] = {
                id: p.id,
                status: "available",
                reader: "",
                time: 0
            };
        });
    }
}

function initKhatmaFirebaseSync() {
    const db = getFirebaseDb();
    if (!db) return;

    try {
        const khatmaRef = db.ref("khatma");
        khatmaRef.on("value", snapshot => {
            const data = snapshot.val();
            if (data && data.parts) {
                currentKhatmaData = data;
                localStorage.setItem("local_khatma_cache", JSON.stringify(currentKhatmaData));
                updateKhatmaUI();
            } else if (!data) {
                buildDefaultKhatmaObject();
                khatmaRef.set(currentKhatmaData);
                updateKhatmaUI();
            }
        });
    } catch (e) {
        console.warn("Khatma Firebase error:", e);
    }
}

function updateKhatmaUI() {
    const cycle = currentKhatmaData.cycle || 1;
    let completedCount = 0;

    Object.keys(currentKhatmaData.parts || {}).forEach(k => {
        if (currentKhatmaData.parts[k].status === "completed") {
            completedCount++;
        }
    });

    const percent = Math.round((completedCount / 30) * 100);

    const cycleDisplay = document.getElementById("khatma-cycle-display");
    const completedCountEl = document.getElementById("khatma-completed-count");
    const percentEl = document.getElementById("khatma-percent-display");
    const fillEl = document.getElementById("khatma-progress-fill");
    const globalKhatmaStat = document.getElementById("global-khatma-stat");

    if (cycleDisplay) cycleDisplay.textContent = `رقم ${cycle}`;
    if (completedCountEl) completedCountEl.textContent = completedCount;
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;
    if (globalKhatmaStat) globalKhatmaStat.textContent = cycle;

    renderKhatmaGrid();

    // فحص اكتمال الختمة بالكامل
    if (completedCount === 30) {
        handleKhatmaCompleted(cycle);
    }
}

function handleKhatmaCompleted(currentCycle) {
    const celebrationKey = `khatma_cycle_${currentCycle}_celebrated`;
    if (!sessionStorage.getItem(celebrationKey)) {
        sessionStorage.setItem(celebrationKey, "true");
        playCompletionChime();
        showToast(`مبارك! اكتملت الختمة رقم ${currentCycle} كاملة بحمد الله، ونبدأ الآن ختمة جديدة لروحه 🌿✨`);

        const db = getFirebaseDb();
        if (db) {
            setTimeout(() => {
                const nextCycle = currentCycle + 1;
                buildDefaultKhatmaObject();
                currentKhatmaData.cycle = nextCycle;
                db.ref("khatma").set(currentKhatmaData);
            }, 3000);
        }
    }
}

function renderKhatmaGrid() {
    const container = document.getElementById("khatma-grid-container");
    if (!container || typeof QURAN_PARTS_INFO === "undefined") return;

    container.innerHTML = "";
    const myReserved = JSON.parse(localStorage.getItem("my_reserved_parts") || "{}");

    QURAN_PARTS_INFO.forEach(partInfo => {
        const partState = (currentKhatmaData.parts && currentKhatmaData.parts[partInfo.id]) || {
            status: "available",
            reader: ""
        };

        if (activeKhatmaFilter !== "all" && partState.status !== activeKhatmaFilter) {
            return;
        }

        const card = document.createElement("div");
        card.className = `juz-card status-${partState.status}`;

        let statusText = "متاح للقراءة";
        let actionBtnHTML = "";

        if (partState.status === "available") {
            statusText = "متاح للقراءة";
            actionBtnHTML = `
                <button type="button" class="juz-btn juz-btn-reserve" onclick="openReserveModal(${partInfo.id})">
                    <i class="fa-solid fa-bookmark"></i>
                    <span>احجز لقراءته</span>
                </button>
            `;
        } else if (partState.status === "reading") {
            statusText = "قيد القراءة";
            const isMine = !!myReserved[partInfo.id];
            actionBtnHTML = `
                <button type="button" class="juz-btn juz-btn-complete" onclick="markPartCompleted(${partInfo.id})">
                    <i class="fa-solid fa-check"></i>
                    <span>${isMine ? "أتممت القراءة بحمد الله" : "تأكيد إتمام الجزء"}</span>
                </button>
            `;
        } else if (partState.status === "completed") {
            statusText = "تمت القراءة";
            actionBtnHTML = `
                <div class="juz-btn juz-btn-done">
                    <i class="fa-solid fa-circle-check"></i>
                    <span>تمت القراءة بحمد الله</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="juz-header">
                <span class="juz-number-badge">${partInfo.id}</span>
                <span class="juz-badge-tag">${statusText}</span>
            </div>
            <div class="juz-title">${partInfo.name}</div>
            <div class="juz-meta">
                <i class="fa-regular fa-compass text-gold"></i> يبدأ من: ${escapeHTML(partInfo.start)}
                <br>
                <i class="fa-regular fa-file text-muted"></i> الصفحات: ${escapeHTML(partInfo.pages)}
            </div>
            ${partState.reader ? `
                <div class="juz-reader-info">
                    <i class="fa-solid fa-user-check"></i>
                    <span>القارئ: ${escapeHTML(partState.reader)}</span>
                </div>
            ` : ''}
            <div class="juz-actions">
                ${actionBtnHTML}
            </div>
        `;

        container.appendChild(card);
    });
}

function initKhatmaFilters() {
    const filterBtns = document.querySelectorAll(".khatma-filter-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeKhatmaFilter = btn.dataset.filter || "all";
            renderKhatmaGrid();
        });
    });
}

window.openReserveModal = function(partId) {
    if (typeof QURAN_PARTS_INFO === "undefined") return;
    const partInfo = QURAN_PARTS_INFO.find(p => p.id === partId);
    if (!partInfo) return;

    const modal = document.getElementById("reserve-part-modal");
    const idInput = document.getElementById("khatma-selected-part-id");
    const titleEl = document.getElementById("khatma-modal-title");
    const descEl = document.getElementById("khatma-modal-desc");

    if (idInput) idInput.value = partId;
    if (titleEl) titleEl.textContent = `حجز ${partInfo.name} لروحه الطاهرة`;
    if (descEl) descEl.textContent = `يبدأ من ${partInfo.start} (صفحات ${partInfo.pages}). اكتب اسمك لتأكيد الحجز ونيل الأجر بإذن الله.`;

    if (modal) modal.classList.add("open");
};

function initKhatmaModal() {
    const modal = document.getElementById("reserve-part-modal");
    const closeBtn = document.getElementById("btn-close-khatma-modal");
    const form = document.getElementById("reserve-part-form");
    const readNowBtn = document.getElementById("btn-read-now-in-mushaf");

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("open");
        });
    }

    if (readNowBtn) {
        readNowBtn.addEventListener("click", () => {
            const partId = parseInt(document.getElementById("khatma-selected-part-id").value, 10);
            if (typeof window.switchQuranKhatmaTab === "function") {
                const mushafBlock = document.getElementById("subpart-mushaf");
                if (mushafBlock && mushafBlock.classList.contains("is-hidden")) {
                    window.switchQuranKhatmaTab("mushaf");
                }
            }
            if (typeof QURAN_PARTS_INFO !== "undefined") {
                const partInfo = QURAN_PARTS_INFO.find(p => p.id === partId);
                if (partInfo && typeof window.goToQuranPage === "function") {
                    const startPage = parseInt(partInfo.pages.split("-")[0].trim(), 10);
                    if (startPage) {
                        window.goToQuranPage(startPage);
                    }
                }
            }
            if (modal) modal.classList.remove("open");
            const readerSection = document.getElementById("subpart-mushaf") || document.getElementById("quran-reader");
            if (readerSection) readerSection.scrollIntoView({ behavior: "smooth" });
        });
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const partId = parseInt(document.getElementById("khatma-selected-part-id").value, 10);
            const nameInput = document.getElementById("khatma-reader-name");
            const readerName = (nameInput && nameInput.value.trim()) || "فاعل خير";

            reservePart(partId, readerName);
            if (modal) modal.classList.remove("open");
            if (nameInput) nameInput.value = "";
        });
    }
}

function reservePart(partId, readerName) {
    if (!currentKhatmaData.parts) currentKhatmaData.parts = {};
    currentKhatmaData.parts[partId] = {
        id: partId,
        status: "reading",
        reader: readerName,
        time: Date.now()
    };

    const myReserved = JSON.parse(localStorage.getItem("my_reserved_parts") || "{}");
    myReserved[partId] = true;
    localStorage.setItem("my_reserved_parts", JSON.stringify(myReserved));

    const db = getFirebaseDb();
    if (db) {
        db.ref(`khatma/parts/${partId}`).set(currentKhatmaData.parts[partId]);
    } else {
        localStorage.setItem("local_khatma_cache", JSON.stringify(currentKhatmaData));
    }

    updateKhatmaUI();
    playBeadSound(600);
    showToast(`تم حجز الجزء ${partId} باسم (${readerName})، تقبل الله منك ونفع بك 🤲`);
}

window.markPartCompleted = function(partId) {
    if (!currentKhatmaData.parts || !currentKhatmaData.parts[partId]) return;

    const currentReader = currentKhatmaData.parts[partId].reader || "فاعل خير";
    currentKhatmaData.parts[partId].status = "completed";
    currentKhatmaData.parts[partId].time = Date.now();

    const db = getFirebaseDb();
    if (db) {
        db.ref(`khatma/parts/${partId}`).set(currentKhatmaData.parts[partId]);
    } else {
        localStorage.setItem("local_khatma_cache", JSON.stringify(currentKhatmaData));
    }

    updateKhatmaUI();
    playCompletionChime();
    showToast(`هنيئاً لك! كُتبت تلاوة الجزء ${partId} نوراً لروح فقيدنا وفي ميزان حسنات (${currentReader}) 🌿✨`);
};

/* ==========================================================================
   8. أذكار الصباح والمساء التفاعلية (Smart Azkar)
   ========================================================================== */
let currentAzkarMode = "morning";
let azkarProgressMap = {};

const AZKAR_MODE_HINTS = {
    morning: "حان الآن وقت أذكار الصباح وسؤال العافية ☀️",
    evening: "حان الآن وقت أذكار المساء وحفظ الليل 🌙",
    sleep: "أذكار النوم والاضطجاع وسكينة الروح 🛏️",
    post_prayer: "أذكار دبر الصلوات المكتوبة والاستغفار 🕌",
    roqya: "آيات وسور الرقية الشرعية والشفاء والتحصين النبوي 🛡️"
};

function getAzkarListByMode(mode) {
    switch (mode) {
        case "morning":
            return (typeof MORNING_AZKAR !== "undefined") ? MORNING_AZKAR : [];
        case "evening":
            return (typeof EVENING_AZKAR !== "undefined") ? EVENING_AZKAR : [];
        case "sleep":
            return (typeof SLEEP_AZKAR !== "undefined") ? SLEEP_AZKAR : [];
        case "post_prayer":
            return (typeof POST_PRAYER_AZKAR !== "undefined") ? POST_PRAYER_AZKAR : [];
        case "roqya":
            return (typeof ROQYA_AZKAR !== "undefined") ? ROQYA_AZKAR : [];
        default:
            return (typeof MORNING_AZKAR !== "undefined") ? MORNING_AZKAR : [];
    }
}

function initSmartAzkar() {
    const currentHour = new Date().getHours();
    if (currentHour >= 3 && currentHour < 12) {
        currentAzkarMode = "morning";
    } else if (currentHour >= 12 && currentHour < 21) {
        currentAzkarMode = "evening";
    } else {
        currentAzkarMode = "sleep";
    }

    updateAzkarModeUI();

    const azkarTabs = document.querySelectorAll(".azkar-tab-btn");
    azkarTabs.forEach(btn => {
        btn.addEventListener("click", () => {
            const mode = btn.dataset.mode;
            if (mode) {
                currentAzkarMode = mode;
                updateAzkarModeUI();
            }
        });
    });
}

function updateAzkarModeUI() {
    const azkarTabs = document.querySelectorAll(".azkar-tab-btn");
    azkarTabs.forEach(btn => {
        if (btn.dataset.mode === currentAzkarMode) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    const hintText = document.getElementById("azkar-time-hint-text");
    if (hintText && AZKAR_MODE_HINTS[currentAzkarMode]) {
        hintText.textContent = AZKAR_MODE_HINTS[currentAzkarMode];
    }

    renderAzkarCards();
}

function renderAzkarCards() {
    const container = document.getElementById("azkar-cards-container");
    if (!container) return;

    const list = getAzkarListByMode(currentAzkarMode);
    container.innerHTML = "";

    const cacheKey = `azkar_progress_${currentAzkarMode}_${new Date().toDateString()}`;
    azkarProgressMap = JSON.parse(localStorage.getItem(cacheKey) || "{}");

    let completedCount = 0;

    list.forEach((item) => {
        const remaining = (typeof azkarProgressMap[item.id] === "number") ? azkarProgressMap[item.id] : item.count;
        const isFinished = remaining <= 0;
        if (isFinished) completedCount++;

        const card = document.createElement("div");
        card.className = `azkar-card ${isFinished ? 'is-finished' : ''}`;
        card.id = `azkar-card-${item.id}`;

        card.innerHTML = `
            <div class="azkar-text">"${escapeHTML(item.text)}"</div>
            <div class="azkar-virtue">
                <i class="fa-solid fa-award text-gold"></i>
                <span>${escapeHTML(item.virtue)}</span>
            </div>
            <div class="azkar-footer">
                <div class="azkar-count-badge">
                    <span>التكرار المستحب: <strong>${item.count} مرات</strong></span>
                </div>
                <button type="button" class="azkar-tap-btn" onclick="handleAzkarTap('${item.id}', ${item.count})">
                    <i class="fa-solid ${isFinished ? 'fa-check-double' : 'fa-hand-pointer'}"></i>
                    <span>${isFinished ? 'تم الذكر بنجاح' : `تبقى: ${remaining}`}</span>
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    updateAzkarSummary(completedCount, list.length);
}

window.handleAzkarTap = function(itemId, totalCount) {
    const list = getAzkarListByMode(currentAzkarMode);
    const cacheKey = `azkar_progress_${currentAzkarMode}_${new Date().toDateString()}`;

    let remaining = (typeof azkarProgressMap[itemId] === "number") ? azkarProgressMap[itemId] : totalCount;
    if (remaining <= 0) return;

    remaining--;
    azkarProgressMap[itemId] = remaining;
    localStorage.setItem(cacheKey, JSON.stringify(azkarProgressMap));

    if ("vibrate" in navigator) navigator.vibrate(25);
    playBeadSound(520 + (remaining * 20));

    if (typeof window.addSpiritualGardenDeed === "function") {
        window.addSpiritualGardenDeed("azkar", 1);
    }

    const card = document.getElementById(`azkar-card-${itemId}`);
    if (card) {
        const btn = card.querySelector(".azkar-tap-btn span");
        const icon = card.querySelector(".azkar-tap-btn i");
        if (remaining > 0) {
            if (btn) btn.textContent = `تبقى: ${remaining}`;
        } else {
            card.classList.add("is-finished");
            if (btn) btn.textContent = "تم الذكر بنجاح";
            if (icon) icon.className = "fa-solid fa-check-double";
            playCompletionChime();

            if (typeof window.addSpiritualGardenDeed === "function") {
                window.addSpiritualGardenDeed("azkar", 5);
            }

            // انتقال سلس وتلقائي للذكر التالي
            setTimeout(() => {
                const nextCard = card.nextElementSibling;
                if (nextCard && typeof nextCard.scrollIntoView === "function") {
                    nextCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }
            }, 450);
        }
    }

    let completedCount = 0;
    list.forEach(i => {
        if (azkarProgressMap[i.id] === 0) completedCount++;
    });

    updateAzkarSummary(completedCount, list.length);

    if (completedCount === list.length) {
        showToast("هنيئاً لك! أتممت أذكار هذه الباقة كاملة، جعله الله حصناً لك ونوراً لروح فقيدنا 🌿✨");
    }
};

function updateAzkarSummary(completed, total) {
    const completedEl = document.getElementById("azkar-completed-count");
    const totalEl = document.getElementById("azkar-total-count");
    const fillEl = document.getElementById("azkar-progress-fill");

    if (completedEl) completedEl.textContent = completed;
    if (totalEl) totalEl.textContent = total;
    if (fillEl) {
        const pct = total > 0 ? (completed / total) * 100 : 0;
        fillEl.style.width = `${pct}%`;
    }
}

/* ==========================================================================
   9. إذاعة القرآن الكريم المباشرة 24/7 (Live Radio)
   ========================================================================== */
function initLiveRadio() {
    // تم توحيد المنطق البرمجي لإذاعة القرآن الكريم ومؤقت النوم بالكامل في extended-modules.js
}

/* ==========================================================================
   10. تطبيق الهاتف التقدمي (PWA & Offline Support)
   ========================================================================== */
let deferredPrompt = null;

function initPWA() {
    if ("serviceWorker" in navigator) {
        // إذا كنا داخل تطبيق أصلي (Capacitor على Android أو iOS)، نلغي أي Service Worker قديم لتفادي تجميد الكاش
        const isNative = (window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
        if (isNative) {
            navigator.serviceWorker.getRegistrations().then(regs => {
                for (let reg of regs) reg.unregister();
            });
            if (window.caches) {
                caches.keys().then(keys => {
                    for (let key of keys) if (key !== "zad-downloads-v1") caches.delete(key);
                });
            }
        } else {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register("./sw.js").then(reg => {
                    reg.update();
                    console.log("PWA Service Worker registered successfully! Scope:", reg.scope);
                }).catch(err => {
                    console.warn("PWA Service Worker registration failed:", err);
                });
            });
        }
    }

    const installBtn = document.getElementById("btn-install-app");
    const banner = document.getElementById("pwa-install-banner");
    const bannerInstallBtn = document.getElementById("btn-pwa-banner-install");
    const bannerDismissBtn = document.getElementById("btn-pwa-banner-dismiss");

    // عناصر نافذة إرشادات الآيفون
    const iosModal = document.getElementById("ios-install-modal");
    const closeIosModalBtn = document.getElementById("btn-close-ios-install-modal");
    const understoodIosBtn = document.getElementById("btn-ios-install-understood");

    // التحقق الشامل من تثبيت التطبيق مسبقاً (سواء كتطبيق أصلي Native أو وضع PWA Standalone أو تم تثبيته سابقاً)
    const isNative = (typeof window !== "undefined" && window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
    const isStandalone = isNative ||
                         window.matchMedia("(display-mode: standalone)").matches ||
                         window.navigator.standalone === true ||
                         document.referrer.includes("android-app://") ||
                         window.location.search.includes("mode=standalone") ||
                         localStorage.getItem("zad_app_installed") === "true";

    if (isStandalone || isNative) {
        if (installBtn) installBtn.style.display = "none";
        if (banner) banner.style.display = "none";
        return; // الخروج فوراً لعدم إظهار أي بنر أو أزرار تثبيت بعد اكتمال التثبيت
    }

    // إظهار زر التثبيت فقط للمستخدمين الذين يتصفحون عبر الويب ولم يثبتوا التطبيق بعد
    if (installBtn) {
        installBtn.style.display = "inline-flex";
    }

    // إظهار بنر التثبيت التلقائي بعد قليل إن لم يغلقه الزائر نهائياً
    const isDismissed = localStorage.getItem("pwa_banner_dismissed") === "true";
    if (!isDismissed && banner) {
        setTimeout(() => {
            // إعادة الفحص لضمان عدم إظهاره إذا تغيرت الحالة
            const recheckNative = (typeof window !== "undefined" && window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
            if (!recheckNative && localStorage.getItem("zad_app_installed") !== "true") {
                banner.style.display = "flex";
            }
        }, 3000);
    }

    // التقاط حدث التثبيت لمتصفحات أندرويد وكروم
    window.addEventListener("beforeinstallprompt", (e) => {
        if (isNative || localStorage.getItem("zad_app_installed") === "true") return;
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) {
            installBtn.style.display = "inline-flex";
        }
    });

    const openIosGuide = () => {
        if (iosModal) {
            iosModal.classList.add("open");
        } else {
            alert("لتثبيت التطبيق على هاتف الآيفون (iOS):\n\n1. اضغط على زر المشاركة ⎋ أسفل متصفح Safari.\n2. مرر القائمة للأسفل واختر 'إضافة إلى الصفحة الرئيسية ➕'.\n3. اضغط 'إضافة' بالأعلى وسيظهر التطبيق كأيقونة مستقلة على هاتفك.");
        }
    };

    const triggerInstall = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === "accepted") {
                    localStorage.setItem("zad_app_installed", "true");
                    showToast("جزاكم الله خيراً! تم تثبيت تطبيق زاد المسلم بنجاح 🌿📱");
                }
                deferredPrompt = null;
                if (banner) banner.style.display = "none";
                if (installBtn) installBtn.style.display = "none";
            });
        } else {
            // هواتف آيفون (iOS) أو المتصفحات التي لا تدعم قبل التثبيت التلقائي
            openIosGuide();
        }
    };

    if (installBtn) {
        installBtn.addEventListener("click", triggerInstall);
    }
    if (bannerInstallBtn) {
        bannerInstallBtn.addEventListener("click", triggerInstall);
    }
    if (bannerDismissBtn && banner) {
        bannerDismissBtn.addEventListener("click", () => {
            banner.style.display = "none";
            localStorage.setItem("pwa_banner_dismissed", "true");
        });
    }

    if (closeIosModalBtn && iosModal) {
        closeIosModalBtn.addEventListener("click", () => {
            iosModal.classList.remove("open");
            localStorage.setItem("pwa_banner_dismissed", "true");
        });
    }
    if (understoodIosBtn && iosModal) {
        understoodIosBtn.addEventListener("click", () => {
            iosModal.classList.remove("open");
            localStorage.setItem("pwa_banner_dismissed", "true");
        });
    }
    if (iosModal) {
        iosModal.addEventListener("click", (e) => {
            if (e.target === iosModal) {
                iosModal.classList.remove("open");
            }
        });
    }

    window.addEventListener("appinstalled", () => {
        localStorage.setItem("zad_app_installed", "true");
        if (installBtn) installBtn.style.display = "none";
        if (banner) banner.style.display = "none";
        deferredPrompt = null;
    });
}

/* ==========================================================================
   11. مواقيت الصلاة وساعة الاستجابة وتنبيهات يوم الجمعة (Prayer Times)
   ========================================================================== */
let prayerTimings = null;
window.prayerTimings = null;
window.getPrayerTimings = function() {
    return window.zadPrayerVerified ? prayerTimings : null;
};
let prayerTimerInterval = null;

const CITY_CONFIGS = window.ZadPrayerCities;

// كشف المدينة المبدئية بالمنطقة الزمنية لحظياً دون انتظار أي شبكة
function detectInitialDefaultCity() {
    try {
        const tz = (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
        if (tz) {
            const tzLower = tz.toLowerCase();
            if (tzLower.includes("cairo") || tzLower.includes("egypt")) return "Cairo";
            if (tzLower.includes("riyadh") || tzLower.includes("saudi")) return "Riyadh";
            if (tzLower.includes("dubai") || tzLower.includes("uae") || tzLower.includes("muscat")) return "Dubai";
            if (tzLower.includes("kuwait")) return "Kuwait";
            if (tzLower.includes("qatar") || tzLower.includes("doha")) return "Doha";
            if (tzLower.includes("amman") || tzLower.includes("jordan")) return "Amman";
            if (tzLower.includes("jerusalem") || tzLower.includes("gaza") || tzLower.includes("hebron")) return "Jerusalem";
        }
    } catch(e) {}
    // الافتراضي يتطابق تماماً مع المدينة الافتراضية المختارة في واجهة HTML (القاهرة)
    return "Cairo";
}

// مواقيت افتراضية احتياطية واقعية للعرض المؤقت فقط (في حال انقطاع الإنترنت التام)

function initPrayerTimes() {
    const citySelect = document.getElementById("select-prayer-city");
    const isManual = localStorage.getItem("user_manually_selected_city") === "true";
    let savedCity = localStorage.getItem("selected_prayer_city");

    if (!savedCity) {
        savedCity = detectInitialDefaultCity();
        localStorage.setItem("selected_prayer_city", savedCity);
    }

    // Only date- and location-matched timings may start alarms.
    if (citySelect) {
        if (CITY_CONFIGS[savedCity] && ![...citySelect.options].some(o => o.value === savedCity)) {
            citySelect.add(new Option(CITY_CONFIGS[savedCity].label || CITY_CONFIGS[savedCity].city, savedCity));
        }
        citySelect.value = savedCity;
        citySelect.addEventListener("change", (e) => {
            const city = e.target.value;
            localStorage.setItem("selected_prayer_city", city);
            if (city !== "gps") {
                localStorage.setItem("user_manually_selected_city", "true");
                fetchPrayerTimes(city);
            } else {
                localStorage.removeItem("user_manually_selected_city");
                if (typeof window.requestGPSPosition === "function") {
                    window.requestGPSPosition(false);
                } else {
                    fetchPrayerTimes("gps");
                }
            }
        });
    }

    checkSpecialTimesNotice();
    const savedHome = window.readHomePrayerTimings?.();
    if (savedHome) {
        window.prayerTimings = savedHome;
        document.dispatchEvent(new Event('zad:prayer-updated'));
    }
    fetchPrayerTimes(savedCity);


}

function checkSpecialTimesNotice() {
    const banner = document.getElementById("response-hour-banner");
    const titleEl = document.getElementById("response-banner-title");
    const textEl = document.getElementById("response-banner-text");
    if (!banner || !titleEl || !textEl) return;

    const now = new Date();
    const dayOfWeek = now.getDay(); // 5 = الجمعة
    const currentHour = now.getHours();

    // 1. يوم الجمعة
    if (dayOfWeek === 5) {
        banner.style.display = "flex";
        titleEl.textContent = "🕌 فضل يوم الجمعة وساعة الاستجابة";
        textEl.textContent = "خير يوم طلعت عليه الشمس؛ لا تنسَ قراءة سورة الكهف، والإكثار من الصلاة على النبي ﷺ، واغتنام ساعة الاستجابة بالدعاء لفقيدنا الغالي.";
    } 
    // 2. الثلث الأخير من الليل (بين 2:00 صباحاً والفجر)
    else if (currentHour >= 2 && currentHour < 5) {
        banner.style.display = "flex";
        titleEl.textContent = "✨ نسائم السحر والثلث الأخير من الليل";
        textEl.textContent = "ينزل ربنا تبارك وتعالى إلى السماء الدنيا ويقول: 'هل من داعٍ فأستجيب له؟'... اذكروا فقيدنا الحبيب في هذه اللحظات المباركة بدعوة تضيء قبره.";
    } 
    else {
        banner.style.display = "none";
    }
}

let prayerRequestVersion = 0;
async function fetchPrayerTimes(cityKey) {
    const requestVersion = ++prayerRequestVersion;
    window.zadPrayerVerified = false;
    if (prayerTimerInterval) clearInterval(prayerTimerInterval);
    navigator.serviceWorker?.controller?.postMessage({ type: "SCHEDULE_PRAYERS", schedule: [] });
    let previous;
    try { previous=JSON.parse(localStorage.getItem('zad_prayer_verified')||'null'); } catch {}
    let storedSchedule;
    try { storedSchedule=JSON.parse(localStorage.getItem('zad_alarm_days')||'null'); } catch {}
    const scheduleSignature=JSON.stringify([cityKey,localStorage.getItem('zad_prayer_method')||'',localStorage.getItem('zad_prayer_school')||'0',localStorage.getItem('gps_prayer_coords'),Intl.DateTimeFormat().resolvedOptions().timeZone]);
    if ((storedSchedule && storedSchedule.signature!==scheduleSignature) || !previous || previous.city!==cityKey || previous.method!==(localStorage.getItem('zad_prayer_method')||'') || previous.school!==(localStorage.getItem('zad_prayer_school')||'0')) await window.NativeAdhanService?.cancelPrayerAlarms?.();
    if (requestVersion !== prayerRequestVersion) return;
    let url;
    let cacheKey;

    const now = new Date();
    const localDateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`;
    const userTz = (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
    const tzParam = userTz ? `&timezonestring=${encodeURIComponent(userTz)}` : "";

    if (cityKey === "gps") {
        const savedGps = localStorage.getItem("gps_prayer_coords");
        if (savedGps) {
            try {
                const parsed = JSON.parse(savedGps);
                if (Number.isFinite(Number(parsed.lat)) && Number.isFinite(Number(parsed.lng)) && Math.abs(Number(parsed.lat)) <= 90 && Math.abs(Number(parsed.lng)) <= 180) {
                    const latNum = Number(parsed.lat);
                    const lngNum = Number(parsed.lng);
                    // تحديد طريقة الحساب الفقهية تلقائياً: أم القرى (4) للسعودية والخليج، مصر (5)، رابطة العالم الإسلامي (3)
                    let method = 4; // الافتراضي: أم القرى
                    if (latNum >= 21.5 && latNum <= 31.8 && lngNum >= 24.5 && lngNum <= 37) {
                        method = 5; // جمهورية مصر العربية
                    }
                    cacheKey = `prayer_times_gps_${latNum.toFixed(2)}_${lngNum.toFixed(2)}_${localDateStr}`;
                    url = `https://api.aladhan.com/v1/timings?latitude=${latNum}&longitude=${lngNum}&method=${method}${tzParam}`;
                }
            } catch(e) {}
        }
    }

    if (!url && cityKey === "gps") { useFallbackTimings(); return; }
    if (!url) {
        const config = CITY_CONFIGS[cityKey];
        if (!config) { useFallbackTimings(); return; }
        cacheKey = `prayer_times_${cityKey}_${localDateStr}`;
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(config.city)}&country=${encodeURIComponent(config.country)}&method=${config.method}${tzParam}`;
    }

    const methodOverride = localStorage.getItem('zad_prayer_method') || '';
    if (/^(2|3|4|5|7|8|9|10|11|12|13|14|15)$/.test(methodOverride)) url = url.replace(/method=\d+/, 'method=' + methodOverride);
    const school = localStorage.getItem('zad_prayer_school') === '1' ? '1' : '0';
    url += '&school=' + school;
    cacheKey += '_' + methodOverride + '_' + school + '_' + userTz;
    window.zadPrayerApiSource = url;
    const markVerified = () => {
        window.zadPrayerVerified = true;
        localStorage.setItem('zad_prayer_verified', JSON.stringify({ date: new Date().toLocaleDateString('en-CA'), city: cityKey, method: methodOverride, school }));
        document.dispatchEvent(new Event('zad:prayer-updated'));
    };
    const validTimings = value => ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].every(key => /^(?:[01]\d|2[0-3]):[0-5]\d/.test(value?.[key] || ''));
    const apiDate = String(now.getDate()).padStart(2, '0') + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + now.getFullYear();
    url = url.replace('/timings?', '/timings/' + apiDate + '?').replace('/timingsByCity?', '/timingsByCity/' + apiDate + '?');
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        try {
            prayerTimings = JSON.parse(cached);
            if (!validTimings(prayerTimings)) throw new Error("Invalid timings");
            window.prayerTimings = prayerTimings;
            markVerified();
            renderPrayerTimesUI(prayerTimings);
            startPrayerCountdown();
            initFastingTracker();
            if (window.NativeAdhanService && typeof window.NativeAdhanService.schedulePrayers === "function") {
                window.NativeAdhanService.schedulePrayers(prayerTimings);
            }
            return;
        } catch(e) {}
    }

    fetch(url, { cache: "no-store" })
        .then(res => { if (!res.ok) throw new Error("Unavailable"); return res.json(); })
        .then(result => {
            if (requestVersion !== prayerRequestVersion) return;
            if (result && result.code === 200 && validTimings(result.data?.timings)) {
                prayerTimings = result.data.timings;
                window.prayerTimings = prayerTimings;
                markVerified();
                localStorage.setItem(cacheKey, JSON.stringify(prayerTimings));
                localStorage.setItem("last_active_prayer_timings", JSON.stringify(prayerTimings));
                renderPrayerTimesUI(prayerTimings);
                startPrayerCountdown();
                initFastingTracker();
                if (window.NativeAdhanService && typeof window.NativeAdhanService.schedulePrayers === "function") {
                    window.NativeAdhanService.schedulePrayers(prayerTimings);
                }
            } else {
                useFallbackTimings();
            }
        })
        .catch(() => {
            if (requestVersion !== prayerRequestVersion) return;
            useFallbackTimings();
        });
}

function useFallbackTimings() {
    window.zadPrayerVerified = false;
    prayerTimings = null; window.prayerTimings = null;
    if (prayerTimerInterval) clearInterval(prayerTimerInterval);
    const timer = document.getElementById('next-prayer-timer'); if (timer) timer.textContent = '--:--';
    ['fajr','sunrise','dhuhr','asr','maghrib','isha'].forEach(key => {
        const el = document.getElementById('time-' + key); if (el) el.textContent = '--:--';
    });
    const nextPrayerEl = document.getElementById('next-prayer-name');
    if (nextPrayerEl) nextPrayerEl.textContent = 'المواقيت غير متاحة';
    const dailyName = document.getElementById('daily-next-prayer-name');
    const detail = document.getElementById('daily-next-prayer-time');
    const hasOfflineTimings = !!localStorage.getItem('last_active_prayer_timings');
    if (dailyName && !hasOfflineTimings) {
        dailyName.textContent = 'المواقيت غير متاحة';
    }
    if (detail && !hasOfflineTimings) {
        detail.textContent = 'اتصل بالإنترنت لتحديث مواقيت مدينتك؛ لم تُجدول مواعيد بديلة.';
    }
    document.dispatchEvent(new Event('zad:prayer-updated'));
}

function renderPrayerTimesUI(timings) {
    const formatTime = (timeStr) => {
        if (!timeStr) return "--:--";
        const clean = timeStr.split(" ")[0]; // إزالة المنطقة الزمنية إذا وجدت
        const [h, m] = clean.split(":").map(Number);
        const period = h >= 12 ? "م" : "ص";
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${String(m).padStart(2, "0")} ${period}`;
    };

    const setTime = (id, time) => {
        const el = document.getElementById(id);
        if (el) el.textContent = formatTime(time);
    };

    setTime("time-fajr", timings.Fajr);
    setTime("time-sunrise", timings.Sunrise);
    setTime("time-dhuhr", timings.Dhuhr);
    setTime("time-asr", timings.Asr);
    setTime("time-maghrib", timings.Maghrib);
    setTime("time-isha", timings.Isha);

    syncPrayersWithServiceWorker(timings);
    if (window.NativeAdhanService && typeof window.NativeAdhanService.updateWidget === "function") {
        window.NativeAdhanService.updateWidget(timings);
    }
}

function syncPrayersWithServiceWorker(timings) {
    if (!timings || !("serviceWorker" in navigator)) return;
    try {
        const now = new Date();
        const prayersList = [
            { name: "صلاة الفجر", key: "fajr", time: timings.Fajr },
            { name: "الشروق", key: "sunrise", time: timings.Sunrise },
            { name: "صلاة الظهر", key: "dhuhr", time: timings.Dhuhr },
            { name: "صلاة العصر", key: "asr", time: timings.Asr },
            { name: "صلاة المغرب", key: "maghrib", time: timings.Maghrib },
            { name: "صلاة العشاء", key: "isha", time: timings.Isha }
        ];

        const schedule = [];
        for (const p of prayersList) {
            if (!p.time) continue;
            const clean = p.time.split(" ")[0];
            const [h, m] = clean.split(":").map(Number);
            const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
            
            // إضافة اليوم والغد للتأكد من استمرار العمل عند إغلاق التطبيق
            schedule.push({
                name: p.name,
                key: p.key,
                timestamp: pDate.getTime(),
                timeStr: p.time
            });

            const nextDayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m, 0);
            schedule.push({
                name: p.name,
                key: p.key,
                timestamp: nextDayDate.getTime(),
                timeStr: p.time
            });
        }

        localStorage.setItem("zad_cached_prayers_schedule", JSON.stringify(schedule));

        const postToSW = (worker) => {
            if (worker) {
                worker.postMessage({
                    type: "SCHEDULE_PRAYERS",
                    schedule: schedule,
                    muazzin: (typeof getSelectedMuazzinId === "function") ? getSelectedMuazzinId() : (localStorage.getItem("zad_selected_muazzin") || "makkah")
                });
            }
        };

        if (navigator.serviceWorker.controller) {
            postToSW(navigator.serviceWorker.controller);
        } else {
            navigator.serviceWorker.ready.then(reg => {
                postToSW(reg.active);
            }).catch(() => {});
        }
    } catch(e) {
        console.warn("Failed to sync prayers with Service Worker:", e);
    }
}

function startPrayerCountdown() {
    if (!window.zadPrayerVerified || !prayerTimings) return;
    if (prayerTimerInterval) clearInterval(prayerTimerInterval);

    const updateCountdown = () => {
        if (!prayerTimings) return;
        const verified = JSON.parse(localStorage.getItem('zad_prayer_verified') || 'null');
        if (verified?.date !== new Date().toLocaleDateString('en-CA')) {
            clearInterval(prayerTimerInterval);
            fetchPrayerTimes(localStorage.getItem('selected_prayer_city') || 'Cairo');
            return;
        }
        const now = new Date();
        const prayersList = [
            { name: "صلاة الفجر", key: "fajr", time: prayerTimings.Fajr },
            { name: "الشروق", key: "sunrise", time: prayerTimings.Sunrise },
            { name: "صلاة الظهر", key: "dhuhr", time: prayerTimings.Dhuhr },
            { name: "صلاة العصر", key: "asr", time: prayerTimings.Asr },
            { name: "صلاة المغرب", key: "maghrib", time: prayerTimings.Maghrib },
            { name: "صلاة العشاء", key: "isha", time: prayerTimings.Isha }
        ];

        // 1. فحص الصلوات: تنبيه قبل الأذان بـ 5 دقائق + إشعار الأذان عند دخول الوقت
        for (const p of prayersList) {
            if (p.key === "sunrise") continue;
            const [ph, pm] = p.time.split(" ")[0].split(":").map(Number);
            const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ph, pm, 0);
            const diffMs = pDate.getTime() - now.getTime();
            const elapsedMs = now.getTime() - pDate.getTime();
            const dateStr = `${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;

            // أ) تنبيه اقتراب موعد الصلاة قبل 5 دقائق (بين 5 دقائق و 4 دقائق قبل الوقت)
            if (diffMs > 0 && diffMs <= 5 * 60 * 1000) {
                const preKey = `pre_${p.key}_${dateStr}`;
                if (!window._prePrayerAlertTriggered) window._prePrayerAlertTriggered = {};
                if (!window._prePrayerAlertTriggered[preKey] && localStorage.getItem(preKey) !== "1") {
                    window._prePrayerAlertTriggered[preKey] = true;
                    localStorage.setItem(preKey, "1");
                    showToast(`⏳ اقتربت ${p.name} • بقي 5 دقائق على دخول الوقت`);
                    if ("Notification" in window && Notification.permission === "granted") {
                        try {
                            new Notification(`⏳ اقتربت ${p.name}`, {
                                body: `بقي 5 دقائق على دخول وقت ${p.name}. تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿`,
                                icon: "assets/icon-192.png",
                                tag: `pre_${p.key}_${dateStr}`
                            });
                        } catch(e) {}
                    }
                }
            }

            // ب) إذا دخل وقت الصلاة في اللحظة الراهنة بالضبط (أثناء متابعة العداد التنازلي)
            if (elapsedMs >= 0 && elapsedMs <= 15 * 1000) {
                const todayPrayerKey = `${p.key}_${dateStr}`;
                const lastTriggered = localStorage.getItem("zad_last_adhan_date_key");
                if (window._lastAdhanTriggeredKey !== todayPrayerKey && lastTriggered !== todayPrayerKey) {
                    window._lastAdhanTriggeredKey = todayPrayerKey;
                    localStorage.setItem("zad_last_adhan_date_key", todayPrayerKey);
                    // صمام أمان صارم: تشغيل الأذان فقط إذا كان العداد يعمل مسبقاً والتطبيق مفتوح عند حلول الوقت وليس عند الفتح المفاجئ
                    if (window._hasPrayerCountdownStarted) {
                        triggerPrayerAdhanNotification(p.name, p.key);
                    }
                    break;
                }
            }
        }

        // 2. تحديد الصلاة القادمة لحساب العداد التنازلي
        let nextPrayer = null;
        let nextPrayerDate = null;

        for (const p of prayersList) {
            const [h, m] = p.time.split(" ")[0].split(":").map(Number);
            const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);

            if (pDate > now) {
                nextPrayer = p;
                nextPrayerDate = pDate;
                break;
            }
        }

        // إذا انتهت صلوات اليوم كلها، فالصلاة القادمة فجر الغد
        if (!nextPrayer) {
            nextPrayer = prayersList[0];
            const [h, m] = prayersList[0].time.split(" ")[0].split(":").map(Number);
            nextPrayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m, 0);
        }

        // إبراز بطاقة الصلاة القادمة
        document.querySelectorAll(".prayer-time-item").forEach(item => {
            item.classList.remove("is-next");
            const statusLabel = item.querySelector(".prayer-status-label");
            if (statusLabel) statusLabel.textContent = "";
        });

        const activeCard = document.getElementById(`prayer-${nextPrayer.key}`);
        if (activeCard) {
            activeCard.classList.add("is-next");
            const statusLabel = activeCard.querySelector(".prayer-status-label");
            if (statusLabel) statusLabel.textContent = "الصلاة القادمة";
        }

        // تحديث العداد
        const diffMs = nextPrayerDate - now;
        const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;

        const nameEl = document.getElementById("next-prayer-name");
        const timerEl = document.getElementById("next-prayer-timer");

        if (nameEl) nameEl.textContent = nextPrayer.name;
        if (timerEl) {
            timerEl.textContent = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        }
    };

    updateCountdown();
    window._hasPrayerCountdownStarted = true;
    prayerTimerInterval = setInterval(updateCountdown, 1000);

    // إعادة التنشيط والفحص الفوري عند فتح شاشة الهاتف أو العودة للتبويب
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            updateCountdown();
        }
    });
    window.addEventListener("focus", () => {
        updateCountdown();
    });
}

/* ==========================================================================
   12. صانع بطاقات الأدعية المصورة (Dua Card Image Generator)
   ========================================================================== */
let currentDuaTheme = "royal-navy";

function initDuaCardGenerator() {
    const modal = document.getElementById("dua-card-modal");
    const openBtns = [
        document.getElementById("btn-open-dua-card"),
        document.getElementById("btn-open-dua-card-hero")
    ];
    const closeBtn = document.getElementById("btn-close-dua-card-modal");
    const selectTemplate = document.getElementById("dua-template-select");
    const customGroup = document.getElementById("custom-dua-group");
    const customInput = document.getElementById("custom-dua-input");
    const themePills = document.querySelectorAll(".theme-pill");
    const downloadBtn = document.getElementById("btn-download-dua-image");
    const shareBtn = document.getElementById("btn-share-dua-image");

    const recipientInput = document.getElementById("dua-card-recipient-input");
    const recipientPills = document.querySelectorAll(".recipient-pill");

    openBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                if (modal) modal.classList.add("open");
                drawDuaCard();
            });
        }
    });

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("open");
        });
    }

    if (recipientInput) {
        recipientInput.addEventListener("input", () => {
            recipientPills.forEach(p => {
                if (p.dataset.name === recipientInput.value.trim()) {
                    p.classList.add("active");
                } else {
                    p.classList.remove("active");
                }
            });
            drawDuaCard();
        });
    }

    recipientPills.forEach(pill => {
        pill.addEventListener("click", () => {
            recipientPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            if (recipientInput) {
                recipientInput.value = pill.dataset.name;
                drawDuaCard();
            }
        });
    });

    if (selectTemplate) {
        selectTemplate.addEventListener("change", (e) => {
            if (e.target.value === "custom") {
                if (customGroup) customGroup.style.display = "block";
            } else {
                if (customGroup) customGroup.style.display = "none";
            }
            drawDuaCard();
        });
    }

    if (customInput) {
        customInput.addEventListener("input", () => {
            drawDuaCard();
        });
    }

    themePills.forEach(pill => {
        pill.addEventListener("click", () => {
            themePills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentDuaTheme = pill.dataset.theme || "royal-navy";
            drawDuaCard();
        });
    });

    if (downloadBtn) {
        downloadBtn.addEventListener("click", downloadDuaCardImage);
    }

    if (shareBtn) {
        shareBtn.addEventListener("click", shareDuaCardImage);
    }
}

function getSelectedDuaText() {
    const select = document.getElementById("dua-template-select");
    const custom = document.getElementById("custom-dua-input");
    if (select && select.value === "custom" && custom && custom.value.trim()) {
        return custom.value.trim();
    }
    if (select && select.value && select.value !== "custom") {
        return select.value;
    }
    return "اللهم اغفر له وارحمه، وعافه واعف عنه، وأكرم نزله، ووسع مدخله، واغسله بالماء والثلج والبرد، ونقه من الذنوب والخطايا كما ينقى الثوب الأبيض من الدنس.";
}

function drawDuaCard() {
    const canvas = document.getElementById("dua-card-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const duaText = getSelectedDuaText();
    const recipientInput = document.getElementById("dua-card-recipient-input");
    const rawRecipient = (recipientInput && recipientInput.value.trim()) || ((typeof DECEASED_INFO !== "undefined" && DECEASED_INFO.name) ? DECEASED_INFO.name : "عبدالمعبود أمين سعيد");

    // 1. رسم الخلفية
    if (currentDuaTheme === "emerald") {
        const bg = ctx.createRadialGradient(width / 2, height * 0.4, 100, width / 2, height / 2, 850);
        bg.addColorStop(0, "#0a4736");
        bg.addColorStop(0.7, "#04241b");
        bg.addColorStop(1, "#02130e");
        ctx.fillStyle = bg;
    } else if (currentDuaTheme === "parchment") {
        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, "#fbf8ee");
        bg.addColorStop(0.5, "#f3ecd7");
        bg.addColorStop(1, "#e6dac0");
        ctx.fillStyle = bg;
    } else {
        // Royal Navy
        const bg = ctx.createRadialGradient(width / 2, height * 0.35, 120, width / 2, height / 2, 880);
        bg.addColorStop(0, "#12233f");
        bg.addColorStop(0.7, "#071224");
        bg.addColorStop(1, "#030812");
        ctx.fillStyle = bg;
    }
    ctx.fillRect(0, 0, width, height);

    // 2. تدرج الذهب للإطارات والزخارف
    const goldGrad = ctx.createLinearGradient(100, 100, width - 100, height - 100);
    goldGrad.addColorStop(0, "#fce38a");
    goldGrad.addColorStop(0.4, "#d4af37");
    goldGrad.addColorStop(0.8, "#aa820a");
    goldGrad.addColorStop(1, "#f3d179");

    // 3. الإطار الإسلامي الخارجي المزدوج
    ctx.save();
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 6;
    ctx.strokeRect(50, 50, width - 100, height - 100);

    ctx.lineWidth = 2;
    ctx.strokeRect(70, 70, width - 140, height - 140);

    // زوايا مزخرفة
    const cornerSize = 45;
    const corners = [
        [50, 50, 1, 1],
        [width - 50, 50, -1, 1],
        [50, height - 50, 1, -1],
        [width - 50, height - 50, -1, -1]
    ];
    ctx.lineWidth = 4;
    corners.forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(cx + dx * cornerSize, cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + dy * cornerSize);
        ctx.stroke();

        ctx.fillStyle = goldGrad;
        ctx.beginPath();
        ctx.arc(cx + dx * 28, cy + dy * 28, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();

    // 4. البسملة والترويسة العلوية
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = currentDuaTheme === "parchment" ? "#8a6d1a" : "#d4af37";
    ctx.font = "bold 34px 'Amiri', serif";
    ctx.fillText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", width / 2, 140);

    // زخرفة علوية
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.arc(width / 2, 195, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 140, 195);
    ctx.lineTo(width / 2 - 25, 195);
    ctx.moveTo(width / 2 + 25, 195);
    ctx.lineTo(width / 2 + 140, 195);
    ctx.stroke();

    // عبارة الصدقة الجارية
    ctx.fillStyle = currentDuaTheme === "parchment" ? "#6b5413" : "#e2d2a2";
    ctx.font = "26px 'Tajawal', sans-serif";
    if (rawRecipient.includes("المسلمين")) {
        ctx.fillText("صَدَقَةٌ جَارِيَةٌ وَدُعَاءٌ لِمَوْتَى المُسْلِمِينَ جَمِيعاً", width / 2, 245);
    } else {
        ctx.fillText("صَدَقَةٌ جَارِيَةٌ وَدُعَاءٌ لِرُوحِ المَغْفُورِ لَهُ بِإِذْنِ اللَّهِ", width / 2, 245);
    }

    // اسم الفقيد / المهدى له بالفخامة الذهبية
    ctx.fillStyle = currentDuaTheme === "parchment" ? "#2a1f05" : "#ffffff";
    let nameFontSize = 46;
    if (rawRecipient.length > 32) nameFontSize = 34;
    else if (rawRecipient.length > 22) nameFontSize = 38;

    ctx.font = `bold ${nameFontSize}px 'Amiri', serif`;
    ctx.shadowColor = currentDuaTheme === "parchment" ? "rgba(0,0,0,0.1)" : "rgba(212, 175, 55, 0.4)";
    ctx.shadowBlur = 12;
    ctx.fillText(`( ${rawRecipient} )`, width / 2, 305);
    ctx.shadowBlur = 0;

    ctx.fillStyle = currentDuaTheme === "parchment" ? "#855e09" : "#d4af37";
    ctx.font = "italic 24px 'Amiri', serif";
    if (rawRecipient.includes("المسلمين")) {
        ctx.fillText("تغمّدهم الله جميعاً بواسع رحمته ومغفرته وأسكنهم الفردوس الأعلى", width / 2, 360);
    } else {
        ctx.fillText("تغمّده الله بواسع رحمته ومغفرته وأسكنه الفردوس الأعلى", width / 2, 360);
    }
    ctx.restore();

    // خط فاصل علوي مزخرف
    ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, 410);
    ctx.lineTo(width - 180, 410);
    ctx.stroke();

    // 5. نص الدعاء في المنتصف
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let fontSize = 48;
    if (duaText.length > 200) fontSize = 38;
    else if (duaText.length > 130) fontSize = 42;

    ctx.font = `bold ${fontSize}px 'Amiri', serif`;
    ctx.fillStyle = currentDuaTheme === "parchment" ? "#1a1303" : "#fbf0cd";
    ctx.shadowColor = currentDuaTheme === "parchment" ? "rgba(0,0,0,0.05)" : "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 10;

    const maxWidth = width - 260;
    const lineHeight = fontSize * 1.85;
    const lines = wrapArabicText(ctx, `« ${duaText} »`, maxWidth);
    
    const blockHeight = lines.length * lineHeight;
    const startY = 440 + (580 - blockHeight) / 2 + lineHeight / 2;

    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + index * lineHeight);
    });
    ctx.restore();

    // 6. الفاصل السفلي والشعار
    ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, 1070);
    ctx.lineTo(width - 180, 1070);
    ctx.stroke();

    // 7. تذييل البطاقة
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = currentDuaTheme === "parchment" ? "#6b5413" : "#d4af37";
    ctx.font = "bold 26px 'Amiri', serif";
    ctx.fillText("اللَّهُمَّ تَقَبَّلْ هَذَا الدُّعَاءَ وَاجْعَلْهُ نُوراً يَسْعَى بَيْنَ يَدَيْهِ فِي قَبْرِهِ", width / 2, 1130);

    ctx.fillStyle = currentDuaTheme === "parchment" ? "#88703a" : "#94a3b8";
    ctx.font = "22px 'Tajawal', sans-serif";
    ctx.fillText("موقع صدقة جارية • شاركنا بالدعاء وختمة القرآن", width / 2, 1180);

    // وسم ختامي
    ctx.fillStyle = currentDuaTheme === "parchment" ? "#aa820a" : "#fce38a";
    ctx.font = "bold 22px 'Tajawal', sans-serif";
    ctx.fillText("🌿 انشرها ولك الأجر بإذن الله 🌿", width / 2, 1225);
    ctx.restore();
}

function wrapArabicText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function downloadDuaCardImage() {
    const canvas = document.getElementById("dua-card-canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `dua-sadqah-jaddi-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("تم تحميل بطاقة الدعاء بنجاح! شاركها في حالات واتساب ولك الأجر 🌿🖼️");
}

function shareDuaCardImage() {
    const canvas = document.getElementById("dua-card-canvas");
    if (!canvas) return;

    const recipientInput = document.getElementById("dua-card-recipient-input");
    const recipientName = (recipientInput && recipientInput.value.trim()) || "فقيدنا الغالي";

    if (navigator.share && navigator.canShare) {
        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], "dua-card.png", { type: "image/png" });
            if (navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: `صدقة جارية ودعاء لروح: ${recipientName}`,
                    text: `دعاء لروح (${recipientName}) • شاركنا بالدعاء وختمة القرآن: ${window.getPublicAppUrl()}`
                }).catch(() => {});
                return;
            }
            fallbackWhatsAppShare();
        }, "image/png");
    } else {
        fallbackWhatsAppShare();
    }
}

function fallbackWhatsAppShare() {
    const dua = getSelectedDuaText();
    const recipientInput = document.getElementById("dua-card-recipient-input");
    const recipientName = (recipientInput && recipientInput.value.trim()) || "فقيدنا الغالي";
    const text = encodeURIComponent(`🌿 صدقة جارية ودعاء لروح (${recipientName}):\n\n"${dua}"\n\nشاركنا الأجر والدعاء وختمات القرآن والتسبيح عبر الرابط:\n${window.getPublicAppUrl()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
}

/* ==========================================================================
   13. دليل وآداب زيارة القبور (Cemetery Guide)
   ========================================================================== */
function initCemeteryGuide() {
    const copyBtn = document.getElementById("btn-copy-cemetery-dua");
    if (!copyBtn) return;

    copyBtn.addEventListener("click", () => {
        const text = "السَّلامُ عَلَيْكُمْ دَارَ قَوْمٍ مُؤْمِنِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ، يَرْحَمُ اللَّهُ الْمُسْتَقْدِمِينَ مِنَّا وَالْمُسْتَأْخِرِينَ";
        navigator.clipboard.writeText(text).then(() => {
            showToast("تم نسخ دعاء دخول المقابر بنجاح 📋🌿");
        }).catch(() => {
            showToast("تعذر النسخ تلقائياً");
        });
    });
}


/* ==========================================================================
   أدوات مساعدة: الصوت التخليقي والإشعارات (Web Audio Synth & Toast)
   ========================================================================== */
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

// صوت خرزة السبحة اللطيف
function playBeadSound(frequency = 500) {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
        // تجاهل في حالة حظر الصوت
    }
}

// نغمة اكتمال الورد
function playCompletionChime() {
    try {
        const ctx = getAudioContext();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // نغمات مريحة C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = ctx.currentTime + idx * 0.1;

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.45);
        });
    } catch (e) {
        // تجاهل
    }
}

// إشعار التوست المنبثق
function showToast(message) {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid fa-moon text-gold"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.4s ease";
        setTimeout(() => toast.remove(), 400);
    }, 3800);
}

// حماية من حقن النصوص (XSS)
function escapeHTML(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// تمرير شبكة أجزاء الختمة أفقياً في شاشات الجوال
window.scrollKhatmaGrid = function(direction) {
    const grid = document.getElementById("khatma-grid-container");
    if (!grid) return;
    const scrollAmount = 270;
    const delta = direction === "left" ? -scrollAmount : scrollAmount;
    grid.scrollBy({ left: delta, behavior: "smooth" });
};

// تمرير بطاقات الأذكار أفقياً في شاشات الجوال
window.scrollAzkarContainer = function(direction) {
    const container = document.getElementById("azkar-cards-container");
    if (!container) return;
    const card = container.querySelector(".azkar-card");
    const scrollAmount = card ? (card.offsetWidth + 20) : 320;
    const delta = direction === "left" ? -scrollAmount : scrollAmount;
    container.scrollBy({ left: delta, behavior: "smooth" });
};

/* ==========================================================================
   13. شريط وحالة الاتصال بالإنترنت (Offline Mode & PWA Status)
   ========================================================================== */
function initOfflineIndicator() {
    const banner = document.getElementById("offline-status-banner");
    const updateStatus = () => {
        if (!navigator.onLine) {
            if (banner) banner.style.display = "flex";
            showToast("أنت الآن في وضع عدم الاتصال • جميع الميزات الأساسية والقرآن تعمل بدون إنترنت 📴");
        } else {
            if (banner) banner.style.display = "none";
        }
    };

    window.addEventListener("online", () => {
        if (banner) banner.style.display = "none";
        showToast("عادت شبكة الإنترنت! تم تحديث الاتصال بنجاح 🌐✨");
    });
    window.addEventListener("offline", updateStatus);

    if (!navigator.onLine && banner) {
        banner.style.display = "flex";
    }
}

/* ==========================================================================
   14. مواسم الصيام المستحب والعد التنازلي للإفطار (Fasting Tracker & Duas)
   ========================================================================== */
let fastingCountdownInterval = null;

function getFastingInfo() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0: الأحد, 1: الاثنين, 2: الثلاثاء, 3: الأربعاء, 4: الخميس, 5: الجمعة, 6: السبت
    let hijriDay = null;
    let hijriMonth = null;

    try {
        const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'numeric'
        }).formatToParts(now);

        parts.forEach(p => {
            if (p.type === 'day') hijriDay = parseInt(p.value, 10);
            if (p.type === 'month') hijriMonth = parseInt(p.value, 10);
        });
    } catch (e) {}

    const timings = window.zadPrayerVerified ? prayerTimings : null;
    if (!timings) return { isFasting: false };

    const maghribStr = timings.Maghrib ? timings.Maghrib.split(" ")[0] : "18:00";
    const fajrStr = timings.Fajr ? timings.Fajr.split(" ")[0] : "04:30";

    const [mH, mM] = maghribStr.split(":").map(Number);
    const [fH, fM] = fajrStr.split(":").map(Number);

    const maghribDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), mH, mM, 0);
    const fajrDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), fH, fM, 0);

    const isBeforeFajr = now < fajrDate;
    const isDuringFast = (now >= fajrDate && now < maghribDate);
    const isAfterMaghrib = (now >= maghribDate);

    // 1. شهر رمضان المبارك (كاملاً)
    if (hijriMonth === 9) {
        return {
            isFasting: true,
            isRamadan: true,
            isBeforeFajr,
            isDuringFast,
            isAfterMaghrib,
            fajrDate,
            maghribDate,
            tag: "شهر رمضان المبارك 🌙",
            title: isDuringFast ? "صيام فريضة شهر رمضان" : "ليالي شهر رمضان المبارك",
            desc: "أيام النفحات والبركات والقرآن، نسأل الله أن يرحم فقيدنا ويجعل صيامه وقيامه نوراً في قبره."
        };
    }

    // 2. فحص هل اليوم هو أحد أيام الصيام الشرعية فقط:
    let isTodayFastingDay = false;
    let tag = "";
    let title = "";
    let desc = "";

    // الأيام البيض (13، 14، 15 من أي شهر هجري)
    if (hijriDay === 13 || hijriDay === 14 || hijriDay === 15) {
        isTodayFastingDay = true;
        tag = "صيام الأيام البيض المباركة 🌕";
        title = `اليوم ${hijriDay} من الشهر الهجري (الأيام البيض)`;
        desc = "صيام ثلاثة أيام من كل شهر تعدل صيام الدهر كله كما أخبر النبي ﷺ.";
    } 
    // يوم عرفة (9 ذو الحجة)
    else if (hijriMonth === 12 && hijriDay === 9) {
        isTodayFastingDay = true;
        tag = "يوم عرفة المبارك 🕋";
        title = "صيام يوم عرفة";
        desc = "يكفر السنة الماضية والباقية، وأعظم أيام الدعاء والرجاء.";
    } 
    // عاشوراء وتاسوعاء (9 و 10 محرم)
    else if (hijriMonth === 1 && (hijriDay === 9 || hijriDay === 10)) {
        isTodayFastingDay = true;
        tag = "عاشوراء المبارك 🌊";
        title = `صيام يوم ${hijriDay === 10 ? 'عاشوراء' : 'تاسوعاء'}`;
        desc = "صيام يوم عاشوراء يكفر ذنوب سنة ماضية، نسأل الله القبول لفقيدنا ولكم.";
    } 
    // سنة يوم الاثنين
    else if (dayOfWeek === 1) {
        isTodayFastingDay = true;
        tag = "سنة صيام يوم الاثنين 🌿";
        title = "صيام يوم الاثنين المبارك";
        desc = "قال ﷺ: 'تُعرض الأعمال يوم الاثنين والخميس، فأحب أن يُعرض عملي وأنا صائم'.";
    } 
    // سنة يوم الخميس
    else if (dayOfWeek === 4) {
        isTodayFastingDay = true;
        tag = "سنة صيام يوم الخميس 🌿";
        title = "صيام يوم الخميس المبارك";
        desc = "قال ﷺ: 'تُعرض الأعمال يوم الاثنين والخميس، فأحب أن يُعرض عملي وأنا صائم'.";
    }

    // إذا لم يكن اليوم يوم صيام شرعي، لا يُعرض السكشن نهائياً
    if (!isTodayFastingDay) {
        return { isFasting: false };
    }

    // إذا انتهى نهار يوم الصيام بحلول أذان المغرب، ينتهي وقت الصيام ولا يظهر بالليل
    if (isAfterMaghrib) {
        return { isFasting: false };
    }

    // نحن الآن في وقت يوم الصيام (إما سحراً قبل الفجر أو نهاراً أثناء الصيام حتى المغرب)
    return {
        isFasting: true,
        isRamadan: false,
        isBeforeFajr,
        isDuringFast,
        isAfterMaghrib,
        fajrDate,
        maghribDate,
        tag,
        title,
        desc
    };
}

function initFastingTracker() {
    const banner = document.getElementById("fasting-tracker-banner");
    const tagEl = document.getElementById("fasting-season-tag");
    const titleEl = document.getElementById("fasting-banner-title");
    const descEl = document.getElementById("fasting-banner-desc");
    const showDuaBtn = document.getElementById("btn-show-fasting-dua");
    const fastingModal = document.getElementById("fasting-dua-modal");
    const closeFastingModalBtn = document.getElementById("btn-close-fasting-modal");
    const duasListEl = document.getElementById("fasting-duas-list");

    if (!banner) return;

    const info = getFastingInfo();

    if (info.isFasting) {
        banner.style.display = "flex";
        if (tagEl) tagEl.textContent = info.tag;
        if (titleEl) titleEl.textContent = info.title;
        if (descEl) descEl.textContent = info.desc;

        startFastingCountdown();
    } else {
        banner.style.display = "none";
        if (fastingCountdownInterval) {
            clearInterval(fastingCountdownInterval);
            fastingCountdownInterval = null;
        }
    }

    // إعداد قائمة أدعية الصائم في النافذة المنبثقة
    if (duasListEl && typeof FASTING_DUAS !== "undefined" && duasListEl.children.length === 0) {
        duasListEl.innerHTML = "";
        FASTING_DUAS.forEach(d => {
            const card = document.createElement("div");
            card.className = "fasting-dua-card";
            card.innerHTML = `
                <div class="fasting-dua-title"><i class="fa-solid fa-moon text-gold"></i> ${escapeHTML(d.title)}</div>
                <div class="fasting-dua-text">"${escapeHTML(d.text)}"</div>
                <div class="fasting-dua-footer">
                    <span>${escapeHTML(d.source)}</span>
                    <button type="button" class="btn-copy-dua" onclick="copyTextToClipboard('${escapeHTML(d.text)}')">
                        <i class="fa-solid fa-copy"></i>
                        <span>نسخ</span>
                    </button>
                </div>
            `;
            duasListEl.appendChild(card);
        });
    }

    if (showDuaBtn && fastingModal) {
        showDuaBtn.onclick = () => fastingModal.classList.add("open");
    }
    if (closeFastingModalBtn && fastingModal) {
        closeFastingModalBtn.onclick = () => fastingModal.classList.remove("open");
    }
    if (fastingModal) {
        fastingModal.onclick = (e) => {
            if (e.target === fastingModal) fastingModal.classList.remove("open");
        };
    }
}

function startFastingCountdown() {
    if (fastingCountdownInterval) clearInterval(fastingCountdownInterval);

    const update = () => {
        const banner = document.getElementById("fasting-tracker-banner");
        const timerLabel = document.getElementById("fasting-timer-label");
        const timerVal = document.getElementById("fasting-timer-value");
        if (!banner || !timerVal) return;

        const info = getFastingInfo();
        if (!info.isFasting) {
            banner.style.display = "none";
            clearInterval(fastingCountdownInterval);
            fastingCountdownInterval = null;
            return;
        }

        const now = new Date();
        if (info.isDuringFast) {
            // وقت الصيام نهاراً -> العد التنازلي للمغرب (الإفطار)
            if (timerLabel) timerLabel.textContent = "المتبقي على أذان المغرب والإفطار 🌅:";
            const diff = info.maghribDate - now;
            timerVal.textContent = formatDuration(diff);
        } else if (info.isBeforeFajr) {
            // سحراً قبل الفجر -> العد التنازلي لأذان الفجر والإمساك
            if (timerLabel) timerLabel.textContent = "المتبقي على أذان الفجر والإمساك 🌙:";
            const diff = info.fajrDate - now;
            timerVal.textContent = formatDuration(diff);
        } else if (info.isRamadan && info.isAfterMaghrib) {
            // في ليالي رمضان -> العد التنازلي لفجر الغد
            if (timerLabel) timerLabel.textContent = "المتبقي على أذان الفجر والإمساك 🌙:";
            const nextFajr = new Date(info.fajrDate.getTime() + 24 * 60 * 60 * 1000);
            const diff = nextFajr - now;
            timerVal.textContent = formatDuration(diff);
        }
    };

    update();
    fastingCountdownInterval = setInterval(update, 1000);
}

function formatDuration(ms) {
    if (ms <= 0) return "00:00:00";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ==========================================================================
   16. بوصلة القبلة التفاعلية الذكية (Interactive Qibla Compass)
   ========================================================================== */
function initQiblaCompass() {
 const $=id=>document.getElementById(id),modal=$('qibla-modal'),open=$('btn-open-qibla');
 if(!modal||!open||modal.dataset.initialized)return;modal.dataset.initialized='true';
 const text=$('compass-sensor-text'),dial=$('compass-dial'),pointer=$('compass-qibla-pointer');
 let bearing=null,filtered=null,active=false,epoch=0,timer=null,aligned=false,gpsBusy=false;
 const normalize=n=>(n%360+360)%360;
 const valid=(lat,lng)=>typeof lat==='number'&&typeof lng==='number'&&Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
 const reset=()=>{filtered=null;aligned=false;dial.style.transform='rotate(0deg)';dial.style.borderColor='';dial.style.boxShadow='';};
 function refresh(){
  let coords=null,city;try{city=localStorage.getItem('selected_prayer_city');if(city==='gps'){const p=JSON.parse(localStorage.getItem('gps_prayer_coords')||'null');if(p&&valid(p.lat,p.lng))coords={...p,name:'الموقع المحفوظ — حدّثه إذا انتقلت'};}else if(typeof QIBLA_CITIES_COORDS!=='undefined')coords=QIBLA_CITIES_COORDS[city];}catch{}
  reset();bearing=null;
  if(coords&&valid(coords.lat,coords.lng)){
   const rad=Math.PI/180,phi=coords.lat*rad,delta=(39.8262-coords.lng)*rad;
   const y=Math.sin(delta),x=Math.cos(phi)*Math.tan(21.4225*rad)-Math.sin(phi)*Math.cos(delta);
   if(Math.hypot(x,y)>1e-9)bearing=normalize(Math.atan2(y,x)/rad);
  }
  $('qibla-city-name').textContent=coords?.name||'لم يتم تحديد موقع موثوق';
  $('qibla-angle-value').textContent=bearing===null?'—':Math.round(bearing)+'° من الشمال';
  pointer.hidden=bearing===null;
  if(bearing!==null)pointer.style.transform='rotate('+bearing+'deg)';
  text.textContent=bearing===null?'حدّد موقعك الحالي لحساب القبلة، خصوصًا إذا كنت داخل مكة.':'زاوية القبلة محسوبة للموقع الموضّح. فعّل البوصلة ثم ضع الهاتف مسطحًا وبالوضع الطولي، بعيدًا عن المعادن.';
 }
 function removeSensor(){epoch++;clearTimeout(timer);active=false;window.removeEventListener('deviceorientation',handle,true);window.removeEventListener('deviceorientationabsolute',handle,true);reset();}
 function invalid(message){reset();text.textContent=message;}
 function handle(e){
  if(!active||!modal.classList.contains('open')||bearing===null)return;
  if(!Number.isFinite(e.webkitCompassHeading)&&e.absolute!==true&&e.type!=='deviceorientationabsolute'){if(filtered===null)invalid('الحساس لم يوفّر اتجاه الشمال. الزاوية المعروضة للموقع فقط؛ استخدم بوصلة موثوقة لتوجيهها.');return;}
  const screenAngle=normalize(Number(window.screen?.orientation?.angle??window.orientation??0));
  if(screenAngle!==0){invalid('اجعل الشاشة في الوضع الطولي وضع الهاتف مسطحًا لقراءة الاتجاه.');return;}
  if(!Number.isFinite(e.beta)||!Number.isFinite(e.gamma)||Math.abs(e.beta)>25||Math.abs(e.gamma)>25){invalid('ضع الهاتف مسطحًا، والشاشة لأعلى؛ لا تعتمد على اتجاه السهم أثناء إمالته.');return;}
  let heading=null;
  if(Number.isFinite(e.webkitCompassHeading)){
   if(Number.isFinite(e.webkitCompassAccuracy)&&(e.webkitCompassAccuracy<0||e.webkitCompassAccuracy>20)){invalid('دقة البوصلة ضعيفة. ابتعد عن المعادن وحرّك الهاتف على شكل 8 ثم أعد وضعه مسطحًا.');return;}
   heading=normalize(e.webkitCompassHeading);
  }else if((e.absolute===true||e.type==='deviceorientationabsolute')&&Number.isFinite(e.alpha))heading=normalize(360-e.alpha);
  if(heading===null){invalid('الحساس لم يوفّر اتجاه الشمال. الزاوية المعروضة للموقع فقط؛ استخدم بوصلة موثوقة لتوجيهها.');return;}
  clearTimeout(timer);timer=setTimeout(()=>{if(active)invalid('توقفت قراءة الحساس. اضغط تفعيل الحساس لإعادة المحاولة.');},6000);
  filtered=filtered===null?heading:normalize(filtered+(normalize(heading-filtered+180)-180)*.35);
  dial.style.transform='rotate('+(-filtered)+'deg)';
  const near=Math.abs(normalize(filtered-bearing+180)-180)<=6;
  if(near&&!aligned&&navigator.vibrate)navigator.vibrate(40);aligned=near;
  dial.style.borderColor=near?'#34d399':'';
  text.textContent=near?'أنت قريب من اتجاه القبلة حسب قراءة الحساس. أبقِ الهاتف مسطحًا وبعيدًا عن المعادن.':'وجّه أعلى الهاتف نحو علامة الكعبة. قراءة الحساس تقريبية وقد تتأثر بالمجالات المغناطيسية.';
 }
 async function setup(){
  removeSensor();const ticket=epoch;
  if(bearing===null)return;
  text.textContent='في انتظار قراءة اتجاه موثوقة من الحساس…';
  try{
   if(typeof DeviceOrientationEvent==='undefined'){text.textContent='حساس البوصلة غير متاح هنا. الزاوية المعروضة للموقع فقط.';return;}
   if(typeof DeviceOrientationEvent.requestPermission==='function'){
    const permission=await DeviceOrientationEvent.requestPermission(true);
    if(ticket!==epoch||!modal.classList.contains('open'))return;
    if(permission!=='granted'){text.textContent='إذن حساس الاتجاه غير مسموح. اسمح به من إعدادات المتصفح ثم أعد المحاولة.';return;}
   }
   if(ticket!==epoch||!modal.classList.contains('open'))return;
   active=true;window.addEventListener('deviceorientation',handle,true);window.addEventListener('deviceorientationabsolute',handle,true);
   timer=setTimeout(()=>{if(active)invalid('لم تصل قراءة موثوقة للبوصلة. فعّل الحساس أو استخدم زاوية الشمال المعروضة مع بوصلة أخرى.');},6000);
  }catch{text.textContent='تعذّر تفعيل حساس الاتجاه. افتح الصفحة في المتصفح أو راجع أذونات الحركة.';}
 }
 open.addEventListener('click',()=>{refresh();modal.classList.add('open');setup();});
 const close=()=>{modal.classList.remove('open');removeSensor();};
 $('btn-close-qibla-modal')?.addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close();});
 $('btn-calibrate-compass')?.addEventListener('click',setup);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)removeSensor();else if(modal.classList.contains('open'))text.textContent='اضغط تفعيل الحساس لاستئناف قراءة الاتجاه.';});
 $('btn-qibla-gps')?.addEventListener('click',async()=>{
  if(gpsBusy)return;gpsBusy=true;const button=$('btn-qibla-gps');button.disabled=true;removeSensor();
  try{if(typeof window.requestGPSPosition!=='function')throw Error('Location unavailable');const coords=await window.requestGPSPosition(false);if(!coords||!valid(coords.lat,coords.lng))throw Error("Location not updated");refresh();}
  catch{text.textContent='تعذّر تحديد الموقع. اسمح بالموقع أو اختر مدينتك من الإعدادات.';}
  finally{gpsBusy=false;button.disabled=false;}
 });
}

// دالة مساعدة لنسخ النصوص للحافظة
window.copyTextToClipboard = function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast("تم نسخ الدعاء بنجاح للحافظة 📋");
        });
    } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        showToast("تم نسخ الدعاء بنجاح للحافظة 📋");
    }
};

/* ==========================================================================
   17. تحديد الموقع الجغرافي التلقائي لمواقيت الصلاة والقبلة (GPS Location)
   ========================================================================== */
function initGPSLocation() {
    const btnGps = document.getElementById('btn-gps-location');
    let busy = false;
    window.requestGPSPosition = async function(isSilent = false) {
        if (busy) return;
        if (isSilent) return window.ZadLocation?.saved();
        busy = true;
        const original = btnGps?.innerHTML;
        if (btnGps) { btnGps.disabled = true; btnGps.textContent = 'جارٍ تحديد الموقع...'; }
        try {
            const coords = await window.ZadLocation.get({ refresh: true });
            localStorage.setItem('selected_prayer_city', 'gps');
            localStorage.setItem('user_manually_selected_city', 'true');
            const select = document.getElementById('select-prayer-city');
            if (select) {
                let option = select.querySelector('option[value="gps"]');
                if (!option) { option = new Option('موقعي المحفوظ (GPS)', 'gps'); select.add(option); }
                option.style.display = 'block'; select.value = 'gps';
            }
            showToast('تم حفظ موقعك. يجري تحديث المواقيت حسب الاتصال المتاح.');
            await fetchPrayerTimes('gps');
            return coords;
        } catch (error) { showToast(window.ZadLocation.errorMessage(error)); }
        finally { busy = false; if (btnGps) { btnGps.disabled = false; btnGps.innerHTML = original; } }
    };
    if (btnGps) btnGps.addEventListener('click', () => window.requestGPSPosition(false));
}

/* ==========================================================================
   18. جدول الورد والمهام الإيمانية اليومية (Daily Wird Tracker)
   ========================================================================== */
function initDailyWird() {
    const section = document.getElementById("daily-wird");
    if (!section || section.dataset.wirdReady) return;
    section.dataset.wirdReady = "true";

    const checkboxes = section.querySelectorAll(".wird-checkbox");
    const progressBadge = document.getElementById("wird-progress-badge");
    const progressFill = document.getElementById("wird-progress-fill");
    const resetBtn = document.getElementById("btn-reset-wird");
    const streakCountEl = document.getElementById("wird-streak-count");
    const weeklyTrackerEl = document.getElementById("wird-weekly-tracker");

    const dateKey = date => [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
    let todayStr = dateKey(new Date());
    let todayKey = 'daily_wird_' + todayStr;
    const validTasks = new Set([...checkboxes].map(cb => cb.dataset.task));
    let completedTasks = [];

    function loadTasks() {
        completedTasks = [];
        try {
            const stored = localStorage.getItem(todayKey);
            const parsed = stored === null ? [] : JSON.parse(stored);
            completedTasks = Array.isArray(parsed) ? [...new Set(parsed)].filter(id => validTasks.has(id)) : [];
            const importKey = 'daily_wird_home_import_' + todayStr;
            if (!localStorage.getItem(importKey)) {
                const old = JSON.parse(localStorage.getItem('zadTasks') || '{}');
                if (old.date === todayStr && old.tasks) {
                    const aliases = {morning:'morning_azkar', evening:'evening_azkar', quran:'quran'};
                    for (const [from,to] of Object.entries(aliases)) if (old.tasks[from] && !completedTasks.includes(to)) completedTasks.push(to);
                }
                localStorage.setItem(todayKey, JSON.stringify(completedTasks));
                localStorage.setItem(importKey, 'true');
            }
        } catch {}
    }
    function refreshDay() {
        todayStr = dateKey(new Date());
        todayKey = 'daily_wird_' + todayStr;
        loadTasks();
    }
    loadTasks();

    function updateStreakAndWeekly() {
        // تحديث سجل الأيام في localStorage
        let history = {};
        try {
            const h = localStorage.getItem("wird_streak_history");
            if (h) history = JSON.parse(h);
        } catch(e) {
            history = {};
        }

        const isTodayDone = completedTasks.length >= 4; // يُعتبر اليوم منجزاً عند إتمام 4 مهام فأكثر
        if (isTodayDone) {
            history[todayStr] = true;
        } else {
            delete history[todayStr];
        }

        try {
            localStorage.setItem("wird_streak_history", JSON.stringify(history));
        } catch(e) {}

        // 1. حساب الـ Streak المتتالي
        let streak = 0;
        let checkDate = new Date();
        
        // فحص اليوم الحالي أولاً
        const checkTodayStr = dateKey(checkDate);
        if (history[checkTodayStr]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // فحص إذا كان الأمس مكتمل
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dateStr = dateKey(checkDate);
            if (history[dateStr]) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // إذا لم يكن هناك أيام سابقة، ضع 1 كبداية تشجيعية إذا كان هناك أي مهمة منجزة اليوم
        const displayStreak = Math.max(streak, completedTasks.length > 0 ? 1 : 0);
        if (streakCountEl) {
            streakCountEl.textContent = displayStreak;
        }

        // 2. رسم شريط الإنجاز الأسبوعي (السبت إلى الجمعة)
        if (weeklyTrackerEl) {
            weeklyTrackerEl.innerHTML = "";
            const daysNames = ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];
            const currDate = new Date();
            const currDayIndex = currDate.getDay(); // 0 = Sunday, 6 = Saturday
            // في التقويم الإسلامي/العربي: السبت = 0
            const arabicOffset = (currDayIndex + 1) % 7;

            // حساب تاريخ بداية الأسبوع (السبت)
            const weekStart = new Date(currDate);
            weekStart.setDate(currDate.getDate() - arabicOffset);

            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + i);
                const dayStr = dateKey(dayDate);
                const isDayDone = !!history[dayStr];
                const isToday = dayStr === todayStr;

                const dayPill = document.createElement("div");
                dayPill.className = "weekly-day-pill";
                dayPill.innerHTML = `
                    <span class="weekly-day-label">${daysNames[i]}</span>
                    <div class="weekly-day-dot ${isDayDone ? 'done' : ''} ${isToday ? 'today' : ''}" title="${isDayDone ? 'تم إتمام الورد بفضل الله' : (isToday ? 'اليوم' : '')}">
                        ${isDayDone ? '<i class="fa-solid fa-check"></i>' : ''}
                    </div>
                `;
                weeklyTrackerEl.appendChild(dayPill);
            }
        }
    }

    function updateUI() {
        const total = checkboxes.length || 8;
        const count = completedTasks.length;
        const pct = Math.round((count / total) * 100);

        checkboxes.forEach(cb => {
            const taskId = cb.dataset.task;
            const item = cb.closest(".wird-task-item");
            const isDone = completedTasks.includes(taskId);
            cb.checked = isDone;
            if (item) {
                item.classList.toggle("is-completed", isDone);
            }
        });

        if (progressBadge) {
            progressBadge.textContent = `${count} من ${total} مهام (${pct}%)`;
            progressBadge.classList.toggle("all-done", count === total && total > 0);
        }

        if (progressFill) {
            progressFill.style.width = `${pct}%`;
            progressFill.classList.toggle("all-done", count === total && total > 0);
        }

        updateStreakAndWeekly();
    }

    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            refreshDay();
            const taskId = cb.dataset.task;
            if (cb.checked) {
                if (!completedTasks.includes(taskId)) {
                    completedTasks.push(taskId);
                }
                const isAllDone = completedTasks.length === checkboxes.length;
                playWirdAudio(isAllDone);
                if (isAllDone) {
                    showToast("ما شاء الله تبارك الله! أتممت جميع مهام وردك اليومي 🌟 تقبل الله طاعاتكم");
                }
            } else {
                completedTasks = completedTasks.filter(id => id !== taskId);
            }

            try {
                localStorage.setItem(todayKey, JSON.stringify(completedTasks));
            } catch(e) {}

            updateUI();
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            refreshDay();
            if (completedTasks.length === 0) {
                showToast("الجدول فارغ بالفعل لليوم 🌿");
                return;
            }
            if (confirm("هل تريد إعادة ضبط مهام الورد اليومي والبدء من جديد؟")) {
                completedTasks = [];
                try {
                    localStorage.setItem(todayKey, "[]");
                } catch(e) {}
                updateUI();
                showToast("تمت إعادة ضبط جدول الورد لليوم 🌿");
            }
        });
    }

    const syncTasks = () => { refreshDay(); updateUI(); };
    window.addEventListener('storage', event => {
        if (event.key === null || event.key?.startsWith('daily_wird_')) syncTasks();
    });
    window.addEventListener('pageshow', syncTasks);
    window.addEventListener('focus', syncTasks);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) syncTasks(); });
    setInterval(() => { if (dateKey(new Date()) !== todayStr) syncTasks(); }, 60000);

    function playWirdAudio(isFull) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            if (isFull) {
                const freqs = [523.25, 659.25, 783.99, 1046.50];
                freqs.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "sine";
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.55);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + idx * 0.12);
                    osc.stop(ctx.currentTime + idx * 0.12 + 0.65);
                });
            } else {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(659.25, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.09);
                gain.gain.setValueAtTime(0.001, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.45);
            }
        } catch(e) {}
    }

    // التهيئة الأولى
    updateUI();
}

/* ==========================================================================
   19. بطاقة آية وحديث اليوم ومشاركة الستوري (Daily Wisdom & Story Share)
   ========================================================================== */
function initDailyWisdom() {
    const card = document.getElementById("daily-wisdom-card");
    if (!card || typeof DAILY_WISDOM_LIST === "undefined" || DAILY_WISDOM_LIST.length === 0) return;

    // حساب العنصر اليومي بناءً على يوم السنة ليتغير تلقائياً كل 24 ساعة
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const wisdomIndex = dayOfYear % DAILY_WISDOM_LIST.length;
    const item = DAILY_WISDOM_LIST[wisdomIndex] || DAILY_WISDOM_LIST[0];

    const ayahSurahEl = document.getElementById("wisdom-ayah-surah");
    const ayahTextEl = document.getElementById("wisdom-ayah-text");
    const ayahTadabburEl = document.getElementById("wisdom-ayah-tadabbur");
    const hadithSourceEl = document.getElementById("wisdom-hadith-source");
    const hadithTextEl = document.getElementById("wisdom-hadith-text");
    const hadithLessonEl = document.getElementById("wisdom-hadith-lesson");
    const dateTagEl = document.getElementById("wisdom-date-tag");
    const shareStoryBtn = document.getElementById("btn-share-wisdom-story");

    if (ayahSurahEl) ayahSurahEl.textContent = item.ayahSurah;
    if (ayahTextEl) ayahTextEl.textContent = `"${item.ayah}"`;
    if (ayahTadabburEl) ayahTadabburEl.textContent = item.ayahTadabbur;

    if (hadithSourceEl) hadithSourceEl.textContent = item.hadithSource;
    if (hadithTextEl) hadithTextEl.textContent = item.hadith;
    if (hadithLessonEl) hadithLessonEl.textContent = item.hadithLesson;

    if (dateTagEl) {
        try {
            const arDate = new Intl.DateTimeFormat("ar-EG", { weekday: "long", day: "numeric", month: "long" }).format(now);
            dateTagEl.textContent = `قبس يوم ${arDate} ☀️`;
        } catch(e) {}
    }

    if (shareStoryBtn) {
        shareStoryBtn.addEventListener("click", () => {
            const storyText = 
`✨ *قَبَسُ اليَوْمِ الإِيمَانِيّ* 🌿
━━━━━━━━━━━━━━
📖 *آيَةٌ وَتَدَبُّر*:
"${item.ayah}"
📍 ${item.ayahSurah}
💡 *وقفة تدبرية*: ${item.ayahTadabbur}

━━━━━━━━━━━━━━
📜 *حَدِيثٌ نَبَوِيٌّ شَرِيف*:
${item.hadith}
📍 [${item.hadithSource}]
💡 *فائدة*: ${item.hadithLesson}

━━━━━━━━━━━━━━
🌸 *تطبيق زاد المسلم (صدقة جارية لوجه الله تعالى)*
📲 تابع أذكارك ووردك اليومي: https://zadmuslim-zeta.vercel.app/`;

            if (navigator.share) {
                navigator.share({
                    title: "قبس اليوم الإيماني - زاد المسلم",
                    text: storyText
                }).then(() => {
                    showToast("تم فتح نافذة المشاركة بنجاح 🌟");
                }).catch(() => {
                    copyTextToClipboard(storyText);
                });
            } else {
                copyTextToClipboard(storyText);
            }
        });
    }
}

/* ==========================================================================
   20. صوت الأذان واختيار المؤذن وتنبيهات مواقيت الصلاة (Adhan Audio & Web Notifications)
   ========================================================================== */
let isAdhanAudioEnabled = true;

const MUAZZIN_LIST = [
    {
        id: "qatami",
        name: "الشيخ ناصر القطامي",
        title: "أذان عذب وهادئ ومؤثر (الافتراضي)",
        city: "المملكة العربية السعودية",
        file: "assets/audio/adhan/qatami.mp3",
        icon: "fa-volume-high"
    },
    {
        id: "abdulbasit",
        name: "الشيخ عبد الباسط عبد الصمد",
        title: "الأذان بتطريب خاشع ومجود",
        city: "جمهورية مصر العربية",
        file: "assets/audio/adhan/abdulbasit.mp3",
        icon: "fa-microphone"
    },
    {
        id: "refaat",
        name: "الشيخ محمد رفعت",
        title: "قيثارة السماء وعملاق الإذاعة",
        city: "جمهورية مصر العربية",
        file: "assets/audio/adhan/refaat.mp3",
        icon: "fa-radio"
    },
    {
        id: "makkah",
        name: "أذان الحرم المكي الشريف",
        title: "أذان بيت الله الحرام بمكة المكرمة",
        city: "مكة المكرمة",
        file: "assets/audio/adhan/makkah.mp3",
        icon: "fa-kaaba"
    },
    {
        id: "madinah",
        name: "أذان الحرم المدني الشريف",
        title: "أذان المسجد النبوي الشريف",
        city: "المدينة المنورة",
        file: "assets/audio/adhan/madinah.mp3",
        icon: "fa-mosque"
    },
    {
        id: "aqsa",
        name: "أذان المسجد الأقصى المبارك",
        title: "أذان القدس الشريف والمسجد الأقصى",
        city: "القدس الشريف",
        file: "assets/audio/adhan/aqsa.mp3",
        icon: "fa-place-of-worship"
    }
];

function getSelectedMuazzinId() {
    const saved = localStorage.getItem("zad_selected_muazzin");
    const valid = ["qatami", "abdulbasit", "refaat", "makkah", "madinah", "aqsa"];
    if (saved && valid.includes(saved)) {
        return saved;
    }
    // إذا لم تكن هناك قيمة محفوظة أو كانت غير صالحة، اعتمد الشيخ ناصر القطامي كافتراضي
    if (!saved) {
        localStorage.setItem("zad_selected_muazzin", "qatami");
    }
    return saved && valid.includes(saved) ? saved : "qatami";
}
if (typeof window !== "undefined") {
    window.getSelectedMuazzinId = getSelectedMuazzinId;
}

function getSelectedMuazzin() {
    const id = getSelectedMuazzinId();
    return MUAZZIN_LIST.find(m => m.id === id) || MUAZZIN_LIST[0];
}

function setSelectedMuazzin(id) {
    const found = MUAZZIN_LIST.find(m => m.id === id);
    if (!found) return;

    localStorage.setItem("zad_selected_muazzin", id);
    updateMuazzinButtonUI();

    // تحديث مصدر مشغل الأذان الرئيسي
    const audioEl = document.getElementById("audio-adhan");
    if (audioEl) {
        audioEl.src = found.file;
        audioEl.load();
    }

    // إشعار الـ Service Worker لتحديث إشعارات الخلفية
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: "SET_MUAZZIN",
            muazzin: id
        });
    }

    // إعادة جدولة إشعارات ومنبهات الأذان الأصلية في النظام بالصوت الجديد
    if (window.NativeAdhanService && typeof window.NativeAdhanService.schedulePrayers === "function" && prayerTimings) {
        window.NativeAdhanService.schedulePrayers(prayerTimings);
    }

    showToast(`تم اختيار صوت ${found.title} (${found.name}) مؤذناً معتمداً 🕌`);
}

function updateMuazzinButtonUI() {
    const label = document.getElementById("selected-muazzin-label");
    if (!label) return;
    const current = getSelectedMuazzin();
    label.textContent = `المؤذن: ${current.name}`;
}

function initAdhanNotifications() {
    const toggleBtn = document.getElementById("btn-toggle-adhan");
    const label = document.getElementById("adhan-status-label");

    // استعادة حالة الأذان المحفوظة
    const saved = localStorage.getItem("adhan_sound_enabled");
    if (saved !== null) {
        isAdhanAudioEnabled = saved === "1";
    }

    function updateAdhanButtonUI() {
        if (!toggleBtn) return;
        toggleBtn.classList.toggle("is-muted", !isAdhanAudioEnabled);
        if (label) {
            label.textContent = isAdhanAudioEnabled ? "الأذان: مفعّل" : "الأذان: صامت";
        }
        const icon = toggleBtn.querySelector("i");
        if (icon) {
            icon.className = isAdhanAudioEnabled ? "fa-solid fa-volume-high text-gold" : "fa-solid fa-volume-xmark";
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            isAdhanAudioEnabled = !isAdhanAudioEnabled;
            localStorage.setItem("adhan_sound_enabled", isAdhanAudioEnabled ? "1" : "0");
            updateAdhanButtonUI();

            // طلب إذن الإشعارات والجدولة عند التفعيل / الإلغاء
            if (isAdhanAudioEnabled) {
                if (window.NativeAdhanService && typeof window.NativeAdhanService.requestPermissions === "function") {
                    window.NativeAdhanService.requestPermissions();
                    if (prayerTimings) {
                        window.NativeAdhanService.schedulePrayers(prayerTimings);
                    }
                } else if (("Notification" in window) && Notification.permission === "default") {
                    Notification.requestPermission();
                }
            } else {
                if (window.NativeAdhanService && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
                    window.Capacitor.Plugins.LocalNotifications.getPending().then(p => {
                        if (p && p.notifications && p.notifications.length) {
                            window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: p.notifications });
                        }
                    }).catch(() => {});
                }
            }

            showToast(isAdhanAudioEnabled ? "تم تفعيل صوت الأذان وتنبيهات الصلوات 🕌" : "تم كتم صوت الأذان 🔇");
        });
    }

    // زر تفعيل إشعار شريط الحالة الدائم (Sticky Notification)
    const stickyBtn = document.getElementById("btn-toggle-sticky-notification");
    const stickyLabel = document.getElementById("sticky-notif-label");

    let isStickyEnabled = localStorage.getItem("zad_sticky_prayer_notification") === "true";

    function updateStickyUI() {
        if (!stickyBtn) return;
        stickyBtn.classList.toggle("active", isStickyEnabled);
        if (stickyLabel) {
            stickyLabel.textContent = isStickyEnabled ? "شريط الحالة: مفعّل ✓" : "شريط الحالة: معطّل";
        }
    }
    updateStickyUI();

    if (stickyBtn) {
        stickyBtn.addEventListener("click", () => {
            isStickyEnabled = !isStickyEnabled;
            localStorage.setItem("zad_sticky_prayer_notification", isStickyEnabled ? "true" : "false");
            updateStickyUI();

            if (window.NativeAdhanService && typeof window.NativeAdhanService.toggleStickyNotification === "function") {
                window.NativeAdhanService.toggleStickyNotification(isStickyEnabled);
            }
            if (isStickyEnabled) {
                showToast("تم تفعيل إشعار الصلاة والذكر الدائم في شريط الحالة 🌿");
            } else {
                showToast("تم إيقاف إشعار شريط الحالة");
            }
        });
    }

    const btnTestPre = document.getElementById("btn-test-pre-prayer-sound");
    if (btnTestPre) {
        btnTestPre.addEventListener("click", () => {
            const pKey = (typeof currentNextPrayerKey !== "undefined" && currentNextPrayerKey) ? currentNextPrayerKey : "dhuhr";
            playPrePrayerAudio(pKey);
            showToast("جاري تشغيل صوت: اقتربت الصلاة 🔊");
        });
    }

    updateAdhanButtonUI();
    updateMuazzinButtonUI();
    initAdhanAudioUnlock();
}

window.showWidgetInfoModal = function() {
    let existing = document.getElementById("zad-widget-guide-modal");
    if (existing) existing.remove();

    const modalHtml = `
        <div class="modal-overlay active" id="zad-widget-guide-modal" onclick="if(event.target===this)this.remove();" style="z-index: 100000;">
            <div class="modal-card modal-box widget-guide-modal-box">
                <div class="modal-head">
                    <div class="modal-head-title">
                        <i class="fa-solid fa-mobile-screen text-gold"></i>
                        <span>ويدجت زاد المسلم لشاشة هاتفك 📱</span>
                    </div>
                    <button type="button" class="btn-close-modal" aria-label="إغلاق" onclick="document.getElementById('zad-widget-guide-modal').remove();">&times;</button>
                </div>
                <div class="modal-body-content">
                    <p class="widget-guide-lead">يمكنك وضع مواقيت الصلاة، العد التنازلي، والذكر اليومي مباشرة على شاشة هاتفك الرئيسية كـ <strong>ودجت (Widget)</strong> دون الحاجة لفتح التطبيق!</p>
                    <ol class="widget-guide-steps">
                        <li>اخرج للشاشة الرئيسية لهاتفك واضغط مطولاً على أي مساحة فارغة.</li>
                        <li>اختر <strong>التطبيقات المصغرة (Widgets)</strong>.</li>
                        <li>ابحث عن <strong>زاد المسلم</strong> ثم اسحب الويدجت وضعه في شاشتك المفضلة.</li>
                    </ol>
                    <div class="widget-guide-actions">
                        <button type="button" class="btn btn-gold" onclick="if(window.NativeAdhanService) window.NativeAdhanService.updatePrayerWidget(); if(typeof window.showToast==='function') window.showToast('تم تحديث بيانات الويدجت بنجاح 🔄'); document.getElementById('zad-widget-guide-modal').remove();">
                            تحديث الويدجت الآن 🔄
                        </button>
                        <button type="button" class="btn btn-outline" onclick="document.getElementById('zad-widget-guide-modal').remove();">
                            حسناً فهمت
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
};

function initAdhanAudioUnlock() {
    const unlock = () => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                const ctx = new AudioCtx();
                if (ctx.state === "suspended") {
                    ctx.resume();
                }
            }
        } catch(e) {}
        document.removeEventListener("touchstart", unlock);
        document.removeEventListener("click", unlock);
    };
    document.addEventListener("touchstart", unlock, { once: true, passive: true });
    document.addEventListener("click", unlock, { once: true, passive: true });
}

function triggerPrayerAdhanNotification(prayerName, prayerKey) {
    if (prayerKey === "sunrise") return;

    const isNative = typeof window !== "undefined" && window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform();

    // 1. تشغيل صوت الأذان في المتصفح / PWA فقط (في تطبيق الموبايل الأصلي تتولى خدمة النظام AdhanNative تشغيل الصوت بدقة)
    if (isAdhanAudioEnabled && !isNative) {
        playAdhanAudio(prayerKey, null, prayerName);
    }

    // 2. إرسال إشعار المتصفح والنظام (في وضع الويب فقط لتجنب ازدواجية الإشعارات مع منبه الهاتف)
    if (!isNative && "Notification" in window && Notification.permission === "granted") {
        const notifTitle = `🕌 حان الآن موعد ${prayerName}`;
        const notifBody = `الله أكبر، الله أكبر.. حان الآن موعد ${prayerName} حسب التوقيت المحلي. حيّ على الصلاة، حيّ على الفلاح 🌿`;
        const currentMuazzin = getSelectedMuazzinId();
        const playUrl = `./#prayer-times?playAdhan=1&prayer=${prayerKey}&muazzin=${currentMuazzin}&t=${Date.now()}`;
        
        const showImages = localStorage.getItem('zad_show_prayer_images') === '1';
        const prayerImg = showImages ? `assets/images/prayers/pre_${prayerKey}.jpg` : null;

        const notifOptions = {
            body: notifBody,
            icon: "assets/icon-192.png",
            badge: "assets/icon-192.png",
            ...(prayerImg ? { image: prayerImg } : {}),
            vibrate: [500, 200, 500, 200, 500, 200, 800, 400, 800, 400, 1200],
            tag: `prayer_${prayerKey}_${new Date().toISOString().slice(0, 10)}`,
            renotify: true,
            requireInteraction: true,
            data: { url: playUrl, prayer: prayerKey, muazzin: currentMuazzin },
            actions: [
                { action: "play_adhan", title: "🔊 سماع الأذان كاملاً" },
                { action: "open", title: "🕌 مواقيت الصلاة" }
            ]
        };

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(notifTitle, notifOptions);
            }).catch(() => {
                try {
                    new Notification(notifTitle, notifOptions);
                } catch(e) {}
            });
        } else {
            try {
                new Notification(notifTitle, notifOptions);
            } catch(e) {}
        }
    }

    // 3. عرض Toast داخل التطبيق
    showToast(`🕌 حان الآن موعد ${prayerName}.. حيّ على الصلاة، حيّ على الفلاح`);
}

function playAdhanAudio(prayerKey, specificMuazzinId, prayerName) {
    const audioEl = document.getElementById("audio-adhan");
    if (!audioEl) return;

    const isFajr = prayerKey === "fajr";
    const muazzin = specificMuazzinId ? (MUAZZIN_LIST.find(m => m.id === specificMuazzinId) || getSelectedMuazzin()) : getSelectedMuazzin();
    const sourceFile = isFajr ? "assets/audio/adhan/fajr.mp3" : muazzin.file;

    // تحديث مسار الصوت إذا اختلف
    if (!audioEl.src.endsWith(sourceFile)) {
        audioEl.src = sourceFile;
        audioEl.load();
    }

    audioEl.currentTime = 0;
    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            hideAdhanAutoplayBanner();
        }).catch(err => {
            console.warn("Autoplay audio blocked or pending user gesture on iOS:", err);
            // إظهار بنر تفاعلي مباشر لسماع الأذان فوراً عند النقر أو لمس الشاشة
            showAdhanAutoplayBanner(prayerName || "الصلاة", prayerKey, muazzin);
        });
    }
}

function playPrePrayerAudio(prayerKey) {
    let audioEl = document.getElementById("audio-pre-prayer");
    if (!audioEl) {
        audioEl = document.createElement("audio");
        audioEl.id = "audio-pre-prayer";
        document.body.appendChild(audioEl);
    }
    const key = (prayerKey || "prayer").toLowerCase();
    const sourceFile = `assets/audio/pre/pre_${key}.mp3?v=${Date.now()}`;
    audioEl.src = sourceFile;
    audioEl.currentTime = 0;
    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
        playPromise.catch(err => {
            console.warn("Pre-prayer voice playback notice:", err);
        });
    }
}

function showAdhanAutoplayBanner(prayerName, prayerKey, muazzin) {
    let banner = document.getElementById("adhan-autoplay-banner");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "adhan-autoplay-banner";
        banner.className = "adhan-autoplay-banner";
        document.body.appendChild(banner);
    }

    const showImages = localStorage.getItem('zad_show_prayer_images') === '1';
    const prayerImg = (showImages && prayerKey && prayerKey !== "prayer") ? `assets/images/prayers/pre_${prayerKey}.jpg` : null;

    banner.innerHTML = `
        <div class="adhan-banner-inner">
            ${prayerImg ? `
            <div class="adhan-banner-media">
                <img src="${prayerImg}" alt="${prayerName}" class="adhan-banner-img" />
            </div>` : `
            <div class="adhan-banner-icon">
                <i class="fa-solid fa-mosque fa-bounce text-gold"></i>
            </div>`}
            <div class="adhan-banner-text">
                <strong class="adhan-banner-title">🕌 حَانَ الآنَ مَوْعِدُ ${prayerName}</strong>
                <span class="adhan-banner-sub">اضغط هنا لسماع الأذان المبارك بصوت ${muazzin.name || 'المؤذن'} 🔊</span>
            </div>
            <button type="button" class="btn btn-gold btn-sm adhan-banner-btn">
                <i class="fa-solid fa-volume-high"></i>
                <span>سماع الأذان</span>
            </button>
        </div>
    `;

    banner.classList.add("active");

    const triggerPlayNow = (e) => {
        if (e) e.stopPropagation();
        const audioEl = document.getElementById("audio-adhan");
        if (audioEl) {
            audioEl.play().then(() => {
                hideAdhanAutoplayBanner();
            }).catch(() => {});
        }
    };

    banner.onclick = triggerPlayNow;
}

function hideAdhanAutoplayBanner() {
    const banner = document.getElementById("adhan-autoplay-banner");
    if (banner) {
        banner.classList.remove("active");
        setTimeout(() => {
            if (banner.parentNode) banner.remove();
        }, 400);
    }
}

// دالة فحص وتفعيل الأذان التلقائي عند فتح الإشعار
function checkUrlForAdhanAutoPlay() {
    // في تطبيق الهاتف الأصلي (Capacitor) يتولى نظام أندرويد عبر AdhanNative تشغيل الأذان
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
        return;
    }

    const currentHash = window.location.hash || "";
    const currentSearch = window.location.search || "";
    const fullQuery = currentSearch + (currentHash.includes("?") ? ("?" + currentHash.split("?")[1]) : "");

    if (!fullQuery.includes("playAdhan=1")) return;

    // تنظيف عنوان الـ URL فوراً لمنع تكرار التشغيل عند التحديث أو استعادة الجلسة
    try {
        const cleanHash = currentHash.split("?")[0] || "#prayer-times";
        window.history.replaceState(null, "", window.location.pathname + cleanHash);
    } catch(e) {}

    const urlParams = new URLSearchParams(fullQuery.replace(/^\?/, ""));
    const prayerKey = urlParams.get("prayer") || "";
    const muazzinKey = urlParams.get("muazzin") || getSelectedMuazzinId();
    const notifTimestamp = parseInt(urlParams.get("t") || "0", 10);

    // صمام أمان صارم: إذا لم يكن هناك timestamp صالح أو مر أكثر من 30 ثانية على النقر، لا تشغل الأذان
    if (!notifTimestamp || Math.abs(Date.now() - notifTimestamp) > 30 * 1000) {
        return;
    }

    // صمام أمان إضافي: التحقق من عدم تشغيل هذا التنبيه مسبقاً في هذه الجلسة
    const sessionTokenKey = `adhan_played_token_${notifTimestamp}`;
    if (sessionStorage.getItem(sessionTokenKey)) {
        return;
    }
    sessionStorage.setItem(sessionTokenKey, "1");

    // لا تشغل في الويب إذا كان تطبيق أصلي (لأن نظام أندرويد/iOS يتولى صوت الأذان)
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
        return;
    }

    // تشغيل صوت الأذان
    setTimeout(() => {
        playAdhanAudio(prayerKey, muazzinKey, "الصلاة");
        showToast("🕌 الله أكبر، الله أكبر.. نداء الأذان المبارك");
    }, 300);
}

// الاستماع لتغيرات الهاش عند النقر على إشعار والتطبيق كان مفتوحاً مسبقاً
window.addEventListener("hashchange", () => {
    checkUrlForAdhanAutoPlay();
});

// تهيئة نافذة اختيار المؤذن وبطاقاتها التفاعلية
function initMuazzinSelector() {
    const openBtn = document.getElementById("btn-select-muazzin");
    const modal = document.getElementById("muazzin-selector-modal");
    const closeBtn = document.getElementById("btn-close-muazzin-modal");
    const container = document.getElementById("muazzin-cards-list");
    const previewAudio = document.getElementById("audio-adhan-preview");

    if (!openBtn || !modal || !container) return;

    let currentlyPlayingPreviewId = null;

    function stopPreview() {
        if (previewAudio) {
            previewAudio.pause();
            previewAudio.currentTime = 0;
        }
        currentlyPlayingPreviewId = null;
        updatePreviewButtonsUI();
    }

    function updatePreviewButtonsUI() {
        const playBtns = container.querySelectorAll(".btn-preview-muazzin");
        playBtns.forEach(btn => {
            const id = btn.getAttribute("data-muazzin-id");
            const icon = btn.querySelector("i");
            const text = btn.querySelector("span");
            if (id === currentlyPlayingPreviewId) {
                btn.classList.add("is-playing");
                if (icon) icon.className = "fa-solid fa-pause";
                if (text) text.textContent = "إيقاف";
            } else {
                btn.classList.remove("is-playing");
                if (icon) icon.className = "fa-solid fa-play";
                if (text) text.textContent = "استماع";
            }
        });
    }

    function renderMuazzinCards() {
        const selectedId = getSelectedMuazzinId();
        container.innerHTML = "";

        MUAZZIN_LIST.forEach(muazzin => {
            const isSelected = muazzin.id === selectedId;
            const card = document.createElement("div");
            card.className = `muazzin-card ${isSelected ? "is-selected" : ""}`;
            card.setAttribute("data-muazzin-id", muazzin.id);

            card.innerHTML = `
                <div class="muazzin-card-header">
                    <div class="muazzin-icon-circle">
                        <i class="fa-solid ${muazzin.icon || 'fa-mosque'} text-gold"></i>
                    </div>
                    <div class="muazzin-info">
                        <div class="muazzin-title-row">
                            <h4 class="muazzin-name">${muazzin.name}</h4>
                            ${isSelected ? '<span class="muazzin-badge-active"><i class="fa-solid fa-check"></i> المعتمد حالياً</span>' : ''}
                        </div>
                        <p class="muazzin-desc">${muazzin.title} • <span class="text-gold-light">${muazzin.city}</span></p>
                    </div>
                </div>
                <div class="muazzin-card-actions">
                    <button type="button" class="btn btn-outline btn-sm btn-preview-muazzin" data-muazzin-id="${muazzin.id}">
                        <i class="fa-solid fa-play"></i>
                        <span>استماع</span>
                    </button>
                    <button type="button" class="btn ${isSelected ? 'btn-primary is-current' : 'btn-gold'} btn-sm btn-choose-muazzin" data-muazzin-id="${muazzin.id}">
                        <i class="fa-solid ${isSelected ? 'fa-check' : 'fa-circle-check'}"></i>
                        <span>${isSelected ? 'المؤذن المختار' : 'اختيار وتفعيل'}</span>
                    </button>
                </div>
            `;

            // حدث الاستماع التجريبي (Preview)
            const previewBtn = card.querySelector(".btn-preview-muazzin");
            previewBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (currentlyPlayingPreviewId === muazzin.id) {
                    stopPreview();
                } else {
                    if (previewAudio) {
                        previewAudio.src = muazzin.file;
                        previewAudio.currentTime = 0;
                        previewAudio.play().then(() => {
                            currentlyPlayingPreviewId = muazzin.id;
                            updatePreviewButtonsUI();
                        }).catch(err => {
                            console.warn("Preview playback failed:", err);
                        });
                    }
                }
            });

            // حدث الاختيار والاعتماد
            const chooseBtn = card.querySelector(".btn-choose-muazzin");
            chooseBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                stopPreview();
                setSelectedMuazzin(muazzin.id);
                renderMuazzinCards();
                setTimeout(() => {
                    modal.classList.remove("active");
                }, 400);
            });

            container.appendChild(card);
        });

        updatePreviewButtonsUI();
    }

    if (previewAudio) {
        previewAudio.addEventListener("ended", () => {
            stopPreview();
        });
    }

    // فتح النافذة
    openBtn.addEventListener("click", () => {
        stopPreview();
        renderMuazzinCards();
        modal.classList.add("active");
    });

    // إغلاق النافذة
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            stopPreview();
            modal.classList.remove("active");
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            stopPreview();
            modal.classList.remove("active");
        }
    });

    updateMuazzinButtonUI();
}

/* ==========================================================================
   21. موسوعة الأدعية النبوية المبوبة (Categorized Duas Collection)
   ========================================================================== */
let currentDuaCategory = "karb_debt";

function initCategorizedDuas() {
    const tabContainer = document.getElementById("duas-categories-tabs");
    const gridContainer = document.getElementById("categorized-duas-grid");
    const searchInput = document.getElementById("duas-search-input");
    const clearSearchBtn = document.getElementById("btn-clear-duas-search");

    if (!tabContainer || !gridContainer || typeof CATEGORIZED_DUAS === "undefined") return;

    // التبديل بين التبويبات
    const tabs = tabContainer.querySelectorAll(".duas-tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentDuaCategory = tab.dataset.cat;
            if (searchInput) searchInput.value = "";
            if (clearSearchBtn) clearSearchBtn.style.display = "none";
            renderCategorizedDuasCards(currentDuaCategory);
        });
    });

    // البحث اللحظي داخل الأدعية
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = query ? "inline-flex" : "none";
            }
            if (query.length >= 1) {
                searchAllCategorizedDuas(query);
            } else {
                renderCategorizedDuasCards(currentDuaCategory);
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            if (searchInput) {
                searchInput.value = "";
                clearSearchBtn.style.display = "none";
                renderCategorizedDuasCards(currentDuaCategory);
            }
        });
    }

    renderCategorizedDuasCards(currentDuaCategory);
}

function renderCategorizedDuasCards(catKey) {
    const gridContainer = document.getElementById("categorized-duas-grid");
    if (!gridContainer || !CATEGORIZED_DUAS[catKey]) return;

    const catData = CATEGORIZED_DUAS[catKey];
    const duasList = catData.duas || [];

    renderDuasCardsList(duasList);
}

function searchAllCategorizedDuas(query) {
    const gridContainer = document.getElementById("categorized-duas-grid");
    if (!gridContainer || typeof CATEGORIZED_DUAS === "undefined") return;

    const cleanQ = query.toLowerCase().trim();
    let matches = [];

    Object.keys(CATEGORIZED_DUAS).forEach(k => {
        const list = CATEGORIZED_DUAS[k].duas || [];
        list.forEach(d => {
            const textMatch = d.text.toLowerCase().includes(cleanQ);
            const titleMatch = d.title.toLowerCase().includes(cleanQ);
            const sourceMatch = (d.source || "").toLowerCase().includes(cleanQ);
            if (textMatch || titleMatch || sourceMatch) {
                matches.push(d);
            }
        });
    });

    if (matches.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <i class="fa-solid fa-magnifying-glass fa-2x text-gold" style="margin-bottom: 0.8rem; opacity: 0.7;"></i>
                <p style="color: var(--text-primary); font-weight: 700; font-size: 1.1rem; margin-bottom: 0.4rem;">لم نجد دعاءً مطابقاً لكلمة "${escapeHtml(query)}"</p>
                <p style="font-size: 0.88rem;">جرب البحث بكلمة أخرى مثل (الكرب، الشفاء، الرزق، الأبناء، الاستغفار)</p>
            </div>
        `;
        return;
    }

    renderDuasCardsList(matches);
}

function renderDuasCardsList(duasList) {
    const gridContainer = document.getElementById("categorized-duas-grid");
    if (!gridContainer) return;

    gridContainer.innerHTML = "";

    duasList.forEach((dua, idx) => {
        const card = document.createElement("div");
        const duaId = dua.id || `dua_${idx}`;
        card.className = "cat-dua-card";
        card.setAttribute("data-dua-id", duaId);

        const targetRepeat = dua.repeat || 1;

        card.innerHTML = `
            <div>
                <div class="cat-dua-header">
                    <h3 class="cat-dua-title">${dua.title}</h3>
                    <span class="cat-dua-repeat-badge">التكرار: <strong class="repeat-counter-val">${targetRepeat}</strong> مرات</span>
                </div>
                <div class="cat-dua-body">" ${dua.text} "</div>
            </div>
            <div>
                <div class="cat-dua-meta-row">
                    <div class="cat-dua-source">
                        <i class="fa-solid fa-check text-gold"></i>
                        <span>${dua.source}</span>
                    </div>
                </div>
                <div class="cat-dua-actions">
                    <button type="button" class="btn btn-outline btn-sm btn-repeat-dua" data-remaining="${targetRepeat}" title="انقر لتكرار الدعاء ونيل الأجر">
                        <i class="fa-solid fa-hand-pointer text-gold"></i>
                        <span class="btn-repeat-text">تكرار (<span class="rem-count">${targetRepeat}</span>)</span>
                    </button>
                    <button type="button" class="btn btn-outline btn-sm btn-copy-cat-dua" title="نسخ الدعاء">
                        <i class="fa-solid fa-copy"></i>
                        <span>نسخ</span>
                    </button>
                    <button type="button" class="btn btn-outline btn-sm btn-share-cat-dua" title="مشاركة الدعاء لواتساب">
                        <i class="fa-brands fa-whatsapp" style="color: #25D366;"></i>
                    </button>
                </div>
            </div>
        `;

        // 1. زر النسخ
        const copyBtn = card.querySelector(".btn-copy-cat-dua");
        if (copyBtn) {
            copyBtn.addEventListener("click", () => {
                const textToCopy = `🤲 *${dua.title}*\n"${dua.text}"\n📍 [${dua.source}]\n\n🕊️ صدقة جارية: https://zadmuslim-zeta.vercel.app/`;
                copyTextToClipboard(textToCopy);
            });
        }

        // 2. زر المشاركة لواتساب
        const shareBtn = card.querySelector(".btn-share-cat-dua");
        if (shareBtn) {
            shareBtn.addEventListener("click", () => {
                const msg = `🤲 *${dua.title}*\n"${dua.text}"\n📍 [${dua.source}]\n\n🌸 من تطبيق زاد المسلم (صدقة جارية لوجه الله تعالى)\n📲 رابط التطبيق: https://zadmuslim-zeta.vercel.app/`;
                const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                window.open(url, "_blank");
            });
        }

        // 3. زر التكرار التفاعلي
        const repeatBtn = card.querySelector(".btn-repeat-dua");
        const remCountEl = card.querySelector(".rem-count");
        if (repeatBtn && remCountEl) {
            repeatBtn.addEventListener("click", () => {
                let rem = parseInt(repeatBtn.getAttribute("data-remaining"), 10);
                if (rem > 1) {
                    rem--;
                    repeatBtn.setAttribute("data-remaining", rem);
                    remCountEl.textContent = rem;
                    playTasbeehClickTone();
                } else if (rem === 1) {
                    rem = 0;
                    repeatBtn.setAttribute("data-remaining", 0);
                    remCountEl.textContent = "0";
                    repeatBtn.classList.add("all-done");
                    repeatBtn.innerHTML = '<i class="fa-solid fa-check text-emerald"></i> <span>تمت القراءة</span>';
                    playCompletionChime();
                    showToast(`تقبل الله دعاءك وذكرك، وجعله في ميزان حسناتك 🌿🤲`);
                } else {
                    // إعادة التعيين
                    repeatBtn.setAttribute("data-remaining", targetRepeat);
                    repeatBtn.classList.remove("all-done");
                    repeatBtn.innerHTML = `<i class="fa-solid fa-hand-pointer text-gold"></i> <span class="btn-repeat-text">تكرار (<span class="rem-count">${targetRepeat}</span>)</span>`;
                }
            });
        }

        gridContainer.appendChild(card);
    });
}

function playTasbeehClickTone() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
}

/* ==========================================================================
   التعامل الذكي مع زر الرجوع لنظام الأندرويد (Android Hardware Back Button)
/* ==========================================================================
   التعامل الذكي مع زر وإيماءات الرجوع لنظام الأندرويد والآيفون (Native App Back Navigation)
   ========================================================================== */
function initAndroidBackButton() {
    function handleBackNavigation() {
        // 1. هل هناك مشغل مرئيات أو فيديو مفتوح؟
        const mediaModal = document.getElementById("media-player-modal");
        if (mediaModal && (mediaModal.classList.contains("open") || mediaModal.classList.contains("active"))) {
            const closeBtn = document.getElementById("btn-close-media-modal");
            if (closeBtn) closeBtn.click();
            else {
                mediaModal.classList.remove("open", "active");
                const iframe = document.getElementById("media-player-iframe");
                if (iframe) iframe.src = "";
            }
            return true;
        }

        // 2. هل القائمة الجانبية للهاتف مفتوحة؟
        const drawer = document.getElementById("mobile-nav-drawer");
        if (drawer && (drawer.classList.contains("open") || drawer.classList.contains("active"))) {
            const closeNavBtn = document.getElementById("btn-close-mobile-nav");
            if (closeNavBtn) closeNavBtn.click();
            else drawer.classList.remove("open", "active");
            return true;
        }

        // 3. نوافذ المصحف الذهبي (فهرس السور، نافذة التكرار والحفظ، تفسير الآية)
        const goldenModals = document.querySelectorAll(".golden-index-modal.active, .golden-memorize-modal.active, .golden-ayah-modal.active");
        if (goldenModals.length > 0) {
            goldenModals.forEach(m => m.classList.remove("active"));
            return true;
        }

        // 4. النافذة العامة المنبثقة (overlay.show في services.html و index.html)
        const overlay = document.getElementById("overlay");
        if (overlay && overlay.classList.contains("show")) {
            if (typeof closeModal === "function") closeModal();
            else overlay.classList.remove("show");
            return true;
        }

        // 5. هل هناك أي نافذة منبثقة (Modal) مفتوحة؟
        const openModals = document.querySelectorAll(".modal-overlay.open, .modal-overlay.active, .modal-overlay.show, .modal-wall-dua-overlay.active");
        if (openModals.length > 0) {
            openModals.forEach(m => {
                const closeBtn = m.querySelector(".modal-close-btn, .modal-close-circle-btn, .close-btn");
                if (closeBtn) closeBtn.click();
                else m.classList.remove("open", "active", "show");
            });
            return true;
        }

        // 6. هل المصحف في وضع الشاشة الكاملة؟
        const mushafCard = document.querySelector(".real-mushaf-card.mushaf-fullscreen-mode");
        if (mushafCard) {
            const exitFullscreenBtn = document.getElementById("btn-exit-mushaf-fullscreen");
            if (exitFullscreenBtn) exitFullscreenBtn.click();
            else mushafCard.classList.remove("mushaf-fullscreen-mode");
            return true;
        }

        // 7. إذا كان المستخدم في صفحة الخدمات (services.html) أو الإعدادات (settings.html)، الرجوع للصفحة الرئيسية
        const pathname = (window.location.pathname || "").toLowerCase();
        const isServicesPage = pathname.includes("services.html");
        const isSettingsPage = pathname.includes("settings.html");
        if (isServicesPage || isSettingsPage) {
            try {
                if (window.history.length > 1 && document.referrer && new URL(document.referrer, window.location.href).origin === window.location.origin) {
                    window.history.back();
                    return true;
                }
            } catch (_) {}
            (window.zadNavigate || location.assign.bind(location))("index.html#home");
            return true;
        }

        return false;
    }

    // إتاحة الدالة للنظام الأصلي في أندرويد عبر WebView
    window.__zadHandleBack = handleBackNavigation;

    // دعم تطبيق Capacitor على أجهزة الأندرويد
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.addListener('backButton', () => {
            const handled = handleBackNavigation();
            if (!handled) {
                if (!window._lastBackPressTime || Date.now() - window._lastBackPressTime > 2000) {
                    window._lastBackPressTime = Date.now();
                    if (typeof showToast === "function") {
                        showToast("اضغط مرة أخرى للخروج من التطبيق 🚪");
                    }
                } else {
                    window.Capacitor.Plugins.App.exitApp();
                }
            }
        });
    }

    // دعم إيماءة الرجوع في المتصفحات والشاشات التفاعلية
    window.addEventListener("popstate", () => {
        handleBackNavigation();
    });

    // تفعيل إيماءة السحب السلس من الحافة لأجهزة الآيفون والأندرويد (Edge Swipe Back)
    initNativeEdgeSwipeBack();
}

/**
 * دعم إيماءة السحب من حافة الشاشة (Edge Swipe Gesture) في الآيفون والأندرويد
 */
function initNativeEdgeSwipeBack() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let tracking = false;

    window.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const screenWidth = window.innerWidth;
        const isRTL = document.documentElement.dir === 'rtl' || document.dir === 'rtl';

        // في الواجهة العربية (RTL): يبدأ السحب من الحافة اليمنى للشاشة (ضمن مسافة 35px من اليمين)
        // في الواجهة غير العربية (LTR): يبدأ السحب من الحافة اليسرى (ضمن مسافة 35px من اليسار)
        const isNearEdge = isRTL 
            ? (touch.clientX >= screenWidth - 35) 
            : (touch.clientX <= 35);

        if (isNearEdge) {
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
            tracking = true;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!tracking || !e.touches || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const deltaY = Math.abs(touch.clientY - startY);
        // إلغاء التتبع إذا كان المستخدم يقوم بالتمرير الرأسي الطبيعي
        if (deltaY > 40 && Math.abs(touch.clientX - startX) < deltaY) {
            tracking = false;
        }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (!tracking || !e.changedTouches || e.changedTouches.length === 0) return;
        tracking = false;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = Math.abs(touch.clientY - startY);
        const elapsed = Date.now() - startTime;
        const isRTL = document.documentElement.dir === 'rtl' || document.dir === 'rtl';

        // في العربية (RTL): السحب من اليمين باتجاه اليسار deltaX < -65px
        // في LTR: السحب من اليسار باتجاه اليمين deltaX > 65px
        const isBackSwipe = isRTL ? (deltaX < -65) : (deltaX > 65);

        if (isBackSwipe && deltaY < 60 && elapsed < 650) {
            try {
                if (navigator.vibrate) navigator.vibrate(15);
            } catch (_) {}
            if (typeof window.__zadHandleBack === 'function') {
                window.__zadHandleBack();
            }
        }
    }, { passive: true });
}

function syncPrayerImagesClass() {
    try {
        const show = localStorage.getItem('zad_show_prayer_images') === '1';
        if (document.body) {
            document.body.classList.toggle('show-prayer-images', show);
        }
    } catch (_) {}
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncPrayerImagesClass);
} else {
    syncPrayerImagesClass();
}
window.addEventListener('storage', (e) => {
    if (e.key === 'zad_show_prayer_images') syncPrayerImagesClass();
});

// منع تصغير أو تكبير واجهة التطبيق بالإيماءات على الهواتف مع استثناء قارئ المصحف
document.addEventListener('gesturestart', function (e) {
    if (!e.target || !e.target.closest || !e.target.closest('#golden-mushaf-viewport')) {
        e.preventDefault();
    }
}, { passive: false });



