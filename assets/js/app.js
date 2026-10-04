/**
 * المنطق البرمجي لموقع صدقة جارية على روح جدي
 */

document.addEventListener("DOMContentLoaded", () => {
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

    // 9. تهيئة تطبيق الهاتف التقدمي (PWA)
    initPWA();

    // 10. تهيئة مواقيت الصلاة وساعة الاستجابة ومواسم الصيام وبوصلة القبلة وتحديد الموقع GPS وصوت الأذان
    initPrayerTimes();
    initGPSLocation();
    initFastingTracker();
    initQiblaCompass();
    initAdhanNotifications();

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
 * حساب وعرض التاريخ الهجري المبارك بتنسيق أم القرى الفاخر
 */
function initHijriDate() {
    const heroHijriEl = document.getElementById("hero-hijri-date-text");
    const prayerHijriEl = document.getElementById("prayer-hijri-text");

    let formattedDate = "";
    try {
        const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        formattedDate = formatter.format(new Date());
    } catch (e) {
        try {
            const fallback = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            formattedDate = fallback.format(new Date());
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

    const pageUrl = window.location.href;
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
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./sw.js").then(reg => {
                console.log("PWA Service Worker registered successfully! Scope:", reg.scope);
            }).catch(err => {
                console.warn("PWA Service Worker registration failed:", err);
            });
        });
    }

    const installBtn = document.getElementById("btn-install-app");
    const banner = document.getElementById("pwa-install-banner");
    const bannerInstallBtn = document.getElementById("btn-pwa-banner-install");
    const bannerDismissBtn = document.getElementById("btn-pwa-banner-dismiss");

    // عناصر نافذة إرشادات الآيفون
    const iosModal = document.getElementById("ios-install-modal");
    const closeIosModalBtn = document.getElementById("btn-close-ios-install-modal");
    const understoodIosBtn = document.getElementById("btn-ios-install-understood");

    // التحقق من تثبيت التطبيق مسبقاً (وضع Standalone)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (isStandalone) {
        if (installBtn) installBtn.style.display = "none";
        if (banner) banner.style.display = "none";
        return;
    }

    // إظهار زر التثبيت دائماً لجميع الأجهزة طالما لم يتم التثبيت بعد (بما في ذلك هواتف الآيفون iOS)
    if (installBtn) {
        installBtn.style.display = "inline-flex";
    }

    // إظهار بنر التثبيت التلقائي بعد قليل إن لم يغلقه الزائر
    const isDismissed = sessionStorage.getItem("pwa_banner_dismissed");
    if (!isDismissed && banner) {
        setTimeout(() => {
            banner.style.display = "flex";
        }, 3000);
    }

    // التقاط حدث التثبيت لمتصفحات أندرويد وكروم
    window.addEventListener("beforeinstallprompt", (e) => {
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
            sessionStorage.setItem("pwa_banner_dismissed", "true");
        });
    }

    if (closeIosModalBtn && iosModal) {
        closeIosModalBtn.addEventListener("click", () => {
            iosModal.classList.remove("open");
        });
    }
    if (understoodIosBtn && iosModal) {
        understoodIosBtn.addEventListener("click", () => {
            iosModal.classList.remove("open");
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
        if (installBtn) installBtn.style.display = "none";
        if (banner) banner.style.display = "none";
        deferredPrompt = null;
    });
}

/* ==========================================================================
   11. مواقيت الصلاة وساعة الاستجابة وتنبيهات يوم الجمعة (Prayer Times)
   ========================================================================== */
let prayerTimings = null;
let prayerTimerInterval = null;

const CITY_CONFIGS = {
    Cairo: { city: "Cairo", country: "Egypt", method: 5 },
    Alexandria: { city: "Alexandria", country: "Egypt", method: 5 },
    Giza: { city: "Giza", country: "Egypt", method: 5 },
    Mansoura: { city: "Mansoura", country: "Egypt", method: 5 },
    Tanta: { city: "Tanta", country: "Egypt", method: 5 },
    Zagazig: { city: "Zagazig", country: "Egypt", method: 5 },
    Assiut: { city: "Assiut", country: "Egypt", method: 5 },
    Makkah: { city: "Makkah", country: "Saudi Arabia", method: 4 },
    Madinah: { city: "Medina", country: "Saudi Arabia", method: 4 },
    Riyadh: { city: "Riyadh", country: "Saudi Arabia", method: 4 }
};

// مواقيت افتراضية احتياطية (في حال انقطاع الإنترنت التام)
const FALLBACK_PRAYER_TIMES = {
    Fajr: "04:30",
    Sunrise: "05:52",
    Dhuhr: "11:46",
    Asr: "15:10",
    Maghrib: "17:40",
    Isha: "18:58"
};

function initPrayerTimes() {
    const citySelect = document.getElementById("select-prayer-city");
    const savedCity = localStorage.getItem("selected_prayer_city") || "Cairo";

    if (citySelect) {
        if (savedCity === "gps") {
            let gpsOpt = citySelect.querySelector('option[value="gps"]');
            if (!gpsOpt) {
                gpsOpt = document.createElement("option");
                gpsOpt.value = "gps";
                gpsOpt.textContent = "📍 موقعي الحالي (GPS)";
                citySelect.insertBefore(gpsOpt, citySelect.firstChild);
            }
        }
        citySelect.value = savedCity;
        citySelect.addEventListener("change", (e) => {
            const city = e.target.value;
            localStorage.setItem("selected_prayer_city", city);
            fetchPrayerTimes(city);
        });
    }

    checkSpecialTimesNotice();
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

function fetchPrayerTimes(cityKey) {
    let url;
    let cacheKey;

    if (cityKey === "gps") {
        const savedGps = localStorage.getItem("gps_prayer_coords");
        if (savedGps) {
            try {
                const parsed = JSON.parse(savedGps);
                if (parsed.lat && parsed.lng) {
                    const latNum = Number(parsed.lat);
                    const lngNum = Number(parsed.lng);
                    cacheKey = `prayer_times_gps_${latNum.toFixed(2)}_${lngNum.toFixed(2)}_${new Date().toISOString().slice(0, 10)}`;
                    url = `https://api.aladhan.com/v1/timings?latitude=${latNum}&longitude=${lngNum}&method=5`;
                }
            } catch(e) {}
        }
    }

    if (!url) {
        const config = CITY_CONFIGS[cityKey] || CITY_CONFIGS["Cairo"];
        cacheKey = `prayer_times_${cityKey}_${new Date().toISOString().slice(0, 10)}`;
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(config.city)}&country=${encodeURIComponent(config.country)}&method=${config.method}`;
    }

    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        try {
            prayerTimings = JSON.parse(cached);
            renderPrayerTimesUI(prayerTimings);
            startPrayerCountdown();
            initFastingTracker();
            return;
        } catch(e) {}
    }

    fetch(url)
        .then(res => res.json())
        .then(result => {
            if (result && result.code === 200 && result.data && result.data.timings) {
                prayerTimings = result.data.timings;
                localStorage.setItem(cacheKey, JSON.stringify(prayerTimings));
                renderPrayerTimesUI(prayerTimings);
                startPrayerCountdown();
                initFastingTracker();
            } else {
                useFallbackTimings();
            }
        })
        .catch(() => {
            useFallbackTimings();
        });
}

function useFallbackTimings() {
    prayerTimings = FALLBACK_PRAYER_TIMES;
    renderPrayerTimesUI(prayerTimings);
    startPrayerCountdown();
    initFastingTracker();
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
}

function startPrayerCountdown() {
    if (prayerTimerInterval) clearInterval(prayerTimerInterval);

    const updateCountdown = () => {
        if (!prayerTimings) return;

        const now = new Date();
        const prayersList = [
            { name: "الفجر", key: "fajr", time: prayerTimings.Fajr },
            { name: "الشروق", key: "sunrise", time: prayerTimings.Sunrise },
            { name: "الظهر", key: "dhuhr", time: prayerTimings.Dhuhr },
            { name: "العصر", key: "asr", time: prayerTimings.Asr },
            { name: "المغرب", key: "maghrib", time: prayerTimings.Maghrib },
            { name: "العشاء", key: "isha", time: prayerTimings.Isha }
        ];

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

        // إطلاق الأذان الصوتي وإشعار المتصفح عند حلول وقت الصلاة
        if (totalSecs === 0 && nextPrayer.key !== "sunrise") {
            const prayerMomentKey = `${nextPrayer.key}_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}_${now.getMinutes()}`;
            if (window._lastAdhanTriggeredKey !== prayerMomentKey) {
                window._lastAdhanTriggeredKey = prayerMomentKey;
                triggerPrayerAdhanNotification(nextPrayer.name, nextPrayer.key);
            }
        }
    };

    updateCountdown();
    prayerTimerInterval = setInterval(updateCountdown, 1000);
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
                    text: `دعاء لروح (${recipientName}) • شاركنا بالدعاء وختمة القرآن: ${window.location.href}`
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
    const text = encodeURIComponent(`🌿 صدقة جارية ودعاء لروح (${recipientName}):\n\n"${dua}"\n\nشاركنا الأجر والدعاء وختمات القرآن والتسبيح عبر الرابط:\n${window.location.href}`);
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

    const timings = prayerTimings || (typeof FALLBACK_PRAYER_TIMES !== "undefined" ? FALLBACK_PRAYER_TIMES : null);
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
    const modal = document.getElementById("qibla-modal");
    const openBtn = document.getElementById("btn-open-qibla");
    const closeBtn = document.getElementById("btn-close-qibla-modal");
    const cityNameEl = document.getElementById("qibla-city-name");
    const angleValEl = document.getElementById("qibla-angle-value");
    const pointerEl = document.getElementById("compass-qibla-pointer");
    const dialEl = document.getElementById("compass-dial");
    const calibrateBtn = document.getElementById("btn-calibrate-compass");
    const sensorText = document.getElementById("compass-sensor-text");

    let currentQiblaAngle = 136; // افتراضي للقاهرة

    function calculateBearing(lat, lng) {
        const kaabaLat = 21.4225 * Math.PI / 180;
        const kaabaLng = 39.8262 * Math.PI / 180;
        const phi = lat * Math.PI / 180;
        const lambda = lng * Math.PI / 180;

        const y = Math.sin(kaabaLng - lambda);
        const x = Math.cos(phi) * Math.tan(kaabaLat) - Math.sin(phi) * Math.cos(kaabaLng - lambda);
        let qibla = Math.atan2(y, x) * 180 / Math.PI;
        return Math.round((qibla + 360) % 360);
    }

    function refreshQiblaData() {
        const cityKey = localStorage.getItem("selected_prayer_city") || "Cairo";
        let coords = null;

        if (cityKey === "gps") {
            const savedGps = localStorage.getItem("gps_prayer_coords");
            if (savedGps) {
                try {
                    const parsed = JSON.parse(savedGps);
                    if (parsed.lat && parsed.lng) {
                        coords = { name: "موقعي الحالي (GPS)", lat: Number(parsed.lat), lng: Number(parsed.lng) };
                    }
                } catch(e) {}
            }
        }

        if (!coords) {
            coords = (typeof QIBLA_CITIES_COORDS !== "undefined" && QIBLA_CITIES_COORDS[cityKey])
                ? QIBLA_CITIES_COORDS[cityKey]
                : { name: "القاهرة", lat: 30.0444, lng: 31.2357 };
        }

        currentQiblaAngle = calculateBearing(coords.lat, coords.lng);

        if (cityNameEl) cityNameEl.textContent = coords.name;
        if (angleValEl) angleValEl.textContent = `${currentQiblaAngle}°`;

        if (pointerEl) {
            pointerEl.style.transform = `rotate(${currentQiblaAngle}deg)`;
        }
    }

    function handleOrientation(e) {
        let heading = null;

        // أجهزة iOS Safari
        if (typeof e.webkitCompassHeading !== "undefined") {
            heading = e.webkitCompassHeading;
        } 
        // أجهزة أندرويد
        else if (e.alpha !== null) {
            heading = 360 - e.alpha;
        }

        if (heading !== null && dialEl) {
            dialEl.style.transform = `rotate(${-heading}deg)`;
            if (sensorText) {
                const diffToQibla = Math.abs((heading - currentQiblaAngle + 360) % 360);
                if (diffToQibla < 6 || diffToQibla > 354) {
                    sensorText.innerHTML = '<span style="color: #34d399; font-weight: 700;">✦ أنت باتجاه القبلة الشريفة الآن تماماً ✦</span>';
                    if ("vibrate" in navigator) navigator.vibrate(40);
                } else {
                    sensorText.textContent = "وجّه أعلى الهاتف نحو علامة الكعبة الذهبية";
                }
            }
        }
    }

    function setupSensor() {
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === "granted") {
                        window.addEventListener("deviceorientation", handleOrientation, true);
                        if (sensorText) sensorText.textContent = "حساس الحركة يعمل بنجاح 🧭";
                    } else {
                        if (sensorText) sensorText.textContent = "تم رفض إذن الحساس. استعن بالزاوية المعروضة.";
                    }
                })
                .catch(() => {
                    window.addEventListener("deviceorientation", handleOrientation, true);
                });
        } else if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", handleOrientation, true);
        }
    }

    if (openBtn && modal) {
        openBtn.addEventListener("click", () => {
            refreshQiblaData();
            modal.classList.add("open");
            setupSensor();
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("open");
            window.removeEventListener("deviceorientation", handleOrientation);
        });
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("open");
                window.removeEventListener("deviceorientation", handleOrientation);
            }
        });
    }

    if (calibrateBtn) {
        calibrateBtn.addEventListener("click", () => {
            setupSensor();
            showToast("تم إعادة تفعيل حساس اتجاه القبلة 🧭");
        });
    }
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
    const btnGps = document.getElementById("btn-gps-location");

    function requestGPSPosition(isSilent = false) {
        if (!navigator.geolocation) {
            if (!isSilent) showToast("خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك ⚠️");
            return;
        }

        let originalContent = "";
        if (btnGps && !isSilent) {
            originalContent = btnGps.innerHTML;
            btnGps.disabled = true;
            btnGps.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-gold"></i> <span>جارٍ التحديد...</span>';
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (btnGps && !isSilent) {
                    btnGps.disabled = false;
                    btnGps.innerHTML = originalContent;
                }

                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const gpsData = { name: "موقعي الحالي (GPS)", lat: lat, lng: lng };

                localStorage.setItem("gps_prayer_coords", JSON.stringify(gpsData));
                localStorage.setItem("selected_prayer_city", "gps");

                const citySelect = document.getElementById("select-prayer-city");
                if (citySelect) {
                    let gpsOpt = citySelect.querySelector('option[value="gps"]');
                    if (!gpsOpt) {
                        gpsOpt = document.createElement("option");
                        gpsOpt.value = "gps";
                        gpsOpt.textContent = "📍 موقعي الحالي (GPS)";
                        citySelect.insertBefore(gpsOpt, citySelect.firstChild);
                    }
                    gpsOpt.style.display = "block";
                    citySelect.value = "gps";
                }

                if (!isSilent) {
                    showToast("تم تحديد موقعك بدقة 📍 وحساب مواقيت الصلاة والقبلة بنجاح");
                }
                fetchPrayerTimes("gps");
            },
            (err) => {
                if (btnGps && !isSilent) {
                    btnGps.disabled = false;
                    btnGps.innerHTML = originalContent;
                }
                if (!isSilent) {
                    let msg = "تعذر الحصول على إحداثيات الموقع عبر GPS";
                    if (err.code === 1) msg = "يرجى منح الإذن للوصول إلى الموقع في المتصفح 📍";
                    showToast(msg);
                }
            },
            { timeout: 10000, enableHighAccuracy: false, maximumAge: 600000 }
        );
    }

    if (btnGps) {
        btnGps.addEventListener("click", () => requestGPSPosition(false));
    }

    // الكشف التلقائي التام عن موقع GPS فور فتح التطبيق
    const savedCity = localStorage.getItem("selected_prayer_city");

    // إذا كان المستخدم قد اختار GPS مسبقاً أو كانت أول زيارة له
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: "geolocation" }).then((perm) => {
            if (perm.state === "granted") {
                requestGPSPosition(true); // جلب فوري صامت للموقع الدقيق
            } else if (perm.state === "prompt" && (!savedCity || savedCity === "gps")) {
                requestGPSPosition(true);
            }
            perm.onchange = () => {
                if (perm.state === "granted") {
                    requestGPSPosition(false);
                }
            };
        }).catch(() => {
            if (!savedCity || savedCity === "gps") {
                requestGPSPosition(true);
            }
        });
    } else {
        if (!savedCity || savedCity === "gps") {
            requestGPSPosition(true);
        }
    }
}

/* ==========================================================================
   18. جدول الورد والمهام الإيمانية اليومية (Daily Wird Tracker)
   ========================================================================== */
function initDailyWird() {
    const section = document.getElementById("daily-wird");
    if (!section) return;

    const checkboxes = section.querySelectorAll(".wird-checkbox");
    const progressBadge = document.getElementById("wird-progress-badge");
    const progressFill = document.getElementById("wird-progress-fill");
    const resetBtn = document.getElementById("btn-reset-wird");
    const streakCountEl = document.getElementById("wird-streak-count");
    const weeklyTrackerEl = document.getElementById("wird-weekly-tracker");

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayKey = `daily_wird_${todayStr}`;
    let completedTasks = [];

    try {
        const saved = localStorage.getItem(todayKey);
        if (saved) completedTasks = JSON.parse(saved);
    } catch(e) {
        completedTasks = [];
    }

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
        const checkTodayStr = checkDate.toISOString().slice(0, 10);
        if (history[checkTodayStr]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            // فحص إذا كان الأمس مكتمل
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dateStr = checkDate.toISOString().slice(0, 10);
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
                const dayStr = dayDate.toISOString().slice(0, 10);
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
            if (completedTasks.length === 0) {
                showToast("الجدول فارغ بالفعل لليوم 🌿");
                return;
            }
            if (confirm("هل تريد إعادة ضبط مهام الورد اليومي والبدء من جديد؟")) {
                completedTasks = [];
                try {
                    localStorage.removeItem(todayKey);
                } catch(e) {}
                updateUI();
                showToast("تمت إعادة ضبط جدول الورد لليوم 🌿");
            }
        });
    }

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
   20. صوت الأذان وتنبيهات مواقيت الصلاة (Adhan Audio & Web Notifications)
   ========================================================================== */
let isAdhanAudioEnabled = true;

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

            // طلب إذن الإشعارات عند التفعيل
            if (isAdhanAudioEnabled && ("Notification" in window) && Notification.permission === "default") {
                Notification.requestPermission();
            }

            showToast(isAdhanAudioEnabled ? "تم تفعيل صوت الأذان وتنبيهات الصلوات 🕌" : "تم كتم صوت الأذان 🔇");
        });
    }

    updateAdhanButtonUI();
}

function triggerPrayerAdhanNotification(prayerName, prayerKey) {
    if (prayerKey === "sunrise") return;

    // 1. تشغيل صوت الأذان إذا كان مفعلاً
    if (isAdhanAudioEnabled) {
        playAdhanAudio();
    }

    // 2. إرسال إشعار المتصفح
    if ("Notification" in window && Notification.permission === "granted") {
        try {
            new Notification(`🕌 حان الآن وقت ${prayerName}`, {
                body: `الله أكبر، الله أكبر.. حان الآن موعد ${prayerName} حسب التوقيت المحلي. لا تنسَ صالح الدعاء.`,
                icon: "assets/icon.svg",
                tag: `prayer_${prayerKey}`
            });
        } catch(e) {}
    }

    // 3. عرض Toast داخل التطبيق
    showToast(`🕌 حان الآن موعد ${prayerName}.. حيّ على الصلاة، حيّ على الفلاح`);
}

function playAdhanAudio() {
    const audioEl = document.getElementById("audio-adhan");
    if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {
            // قد تمنع بعض المتصفحات التشغيل التلقائي بدون تفاعل مسبق
        });
    }
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


