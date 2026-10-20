let downloadedAudioObjectUrl = null;
async function getDownloadedAudioUrl(url) {
    if (downloadedAudioObjectUrl) { URL.revokeObjectURL(downloadedAudioObjectUrl); downloadedAudioObjectUrl = null; }
    try {
        const saved = await (await caches.open('zad-downloads-v1')).match(url);
        if (saved) { downloadedAudioObjectUrl = URL.createObjectURL(await saved.blob()); return downloadedAudioObjectUrl; }
    } catch {}
    return url;
}
async function fetchQuranReference(url) {
    try { const saved = await (await caches.open('zad-downloads-v1')).match(url); if (saved) return saved; } catch {}
    return fetch(url);
}
/**
 * زاد المسلم - المصحف الذهبي الشريف المدمج محلياً 100% بدون إنترنت
 * طبعة مجمع الملك فهد لطباعة المصحف الشريف بالمدينة المنورة برواية حفص عن عاصم
 * جميع الصفحات الـ 604 مدمجة محلياً داخل التطبيق في assets/quran-pages/
 */

// خريطة سور القرآن الكريم الـ 114
const SURAHS_INDEX = [
    { id: 1, name: "الفاتحة", page: 1, ayahs: 7, type: "مكية" },
    { id: 2, name: "البقرة", page: 2, ayahs: 286, type: "مدنية" },
    { id: 3, name: "آل عمران", page: 50, ayahs: 200, type: "مدنية" },
    { id: 4, name: "النساء", page: 77, ayahs: 176, type: "مدنية" },
    { id: 5, name: "المائدة", page: 106, ayahs: 120, type: "مدنية" },
    { id: 6, name: "الأنعام", page: 128, ayahs: 165, type: "مكية" },
    { id: 7, name: "الأعراف", page: 151, ayahs: 206, type: "مكية" },
    { id: 8, name: "الأنفال", page: 177, ayahs: 75, type: "مدنية" },
    { id: 9, name: "التوبة", page: 187, ayahs: 129, type: "مدنية" },
    { id: 10, name: "يونس", page: 208, ayahs: 109, type: "مكية" },
    { id: 11, name: "هود", page: 221, ayahs: 123, type: "مكية" },
    { id: 12, name: "يوسف", page: 235, ayahs: 111, type: "مكية" },
    { id: 13, name: "الرعد", page: 249, ayahs: 43, type: "مدنية" },
    { id: 14, name: "إبراهيم", page: 255, ayahs: 52, type: "مكية" },
    { id: 15, name: "الحجر", page: 262, ayahs: 99, type: "مكية" },
    { id: 16, name: "النحل", page: 267, ayahs: 128, type: "مكية" },
    { id: 17, name: "الإسراء", page: 282, ayahs: 111, type: "مكية" },
    { id: 18, name: "الكهف", page: 293, ayahs: 110, type: "مكية" },
    { id: 19, name: "مريم", page: 305, ayahs: 98, type: "مكية" },
    { id: 20, name: "طه", page: 312, ayahs: 135, type: "مكية" },
    { id: 21, name: "الأنبياء", page: 322, ayahs: 112, type: "مكية" },
    { id: 22, name: "الحج", page: 332, ayahs: 78, type: "مدنية" },
    { id: 23, name: "المؤمنون", page: 342, ayahs: 118, type: "مكية" },
    { id: 24, name: "النور", page: 350, ayahs: 64, type: "مدنية" },
    { id: 25, name: "الفرقان", page: 359, ayahs: 77, type: "مكية" },
    { id: 26, name: "الشعراء", page: 367, ayahs: 227, type: "مكية" },
    { id: 27, name: "النمل", page: 377, ayahs: 93, type: "مكية" },
    { id: 28, name: "القصص", page: 385, ayahs: 88, type: "مكية" },
    { id: 29, name: "العنكبوت", page: 396, ayahs: 69, type: "مكية" },
    { id: 30, name: "الروم", page: 404, ayahs: 60, type: "مكية" },
    { id: 31, name: "لقمان", page: 411, ayahs: 34, type: "مكية" },
    { id: 32, name: "السجدة", page: 415, ayahs: 30, type: "مكية" },
    { id: 33, name: "الأحزاب", page: 418, ayahs: 73, type: "مدنية" },
    { id: 34, name: "سبأ", page: 428, ayahs: 54, type: "مكية" },
    { id: 35, name: "فاطر", page: 434, ayahs: 45, type: "مكية" },
    { id: 36, name: "يس", page: 440, ayahs: 83, type: "مكية" },
    { id: 37, name: "الصافات", page: 446, ayahs: 182, type: "مكية" },
    { id: 38, name: "ص", page: 453, ayahs: 88, type: "مكية" },
    { id: 39, name: "الزمر", page: 458, ayahs: 75, type: "مكية" },
    { id: 40, name: "غافر", page: 467, ayahs: 85, type: "مكية" },
    { id: 41, name: "فصلت", page: 477, ayahs: 54, type: "مكية" },
    { id: 42, name: "الشورى", page: 483, ayahs: 53, type: "مكية" },
    { id: 43, name: "الزخرف", page: 489, ayahs: 89, type: "مكية" },
    { id: 44, name: "الدخان", page: 496, ayahs: 59, type: "مكية" },
    { id: 45, name: "الجاثية", page: 499, ayahs: 37, type: "مكية" },
    { id: 46, name: "الأحقاف", page: 502, ayahs: 35, type: "مكية" },
    { id: 47, name: "محمد", page: 507, ayahs: 38, type: "مدنية" },
    { id: 48, name: "الفتح", page: 511, ayahs: 29, type: "مدنية" },
    { id: 49, name: "الحجرات", page: 515, ayahs: 18, type: "مدنية" },
    { id: 50, name: "ق", page: 518, ayahs: 45, type: "مكية" },
    { id: 51, name: "الذاريات", page: 520, ayahs: 60, type: "مكية" },
    { id: 52, name: "الطور", page: 523, ayahs: 49, type: "مكية" },
    { id: 53, name: "النجم", page: 526, ayahs: 62, type: "مكية" },
    { id: 54, name: "القمر", page: 528, ayahs: 55, type: "مكية" },
    { id: 55, name: "الرحمن", page: 531, ayahs: 78, type: "مدنية" },
    { id: 56, name: "الواقعة", page: 534, ayahs: 96, type: "مكية" },
    { id: 57, name: "الحديد", page: 537, ayahs: 29, type: "مدنية" },
    { id: 58, name: "المجادلة", page: 542, ayahs: 22, type: "مدنية" },
    { id: 59, name: "الحشر", page: 545, ayahs: 24, type: "مدنية" },
    { id: 60, name: "الممتحنة", page: 549, ayahs: 13, type: "مدنية" },
    { id: 61, name: "الصف", page: 551, ayahs: 14, type: "مدنية" },
    { id: 62, name: "الجمعة", page: 553, ayahs: 11, type: "مدنية" },
    { id: 63, name: "المنافقون", page: 554, ayahs: 11, type: "مدنية" },
    { id: 64, name: "التغابن", page: 556, ayahs: 18, type: "مدنية" },
    { id: 65, name: "الطلاق", page: 558, ayahs: 12, type: "مدنية" },
    { id: 66, name: "التحريم", page: 560, ayahs: 12, type: "مدنية" },
    { id: 67, name: "الملك", page: 562, ayahs: 30, type: "مكية" },
    { id: 68, name: "القلم", page: 564, ayahs: 52, type: "مكية" },
    { id: 69, name: "الحاقة", page: 566, ayahs: 52, type: "مكية" },
    { id: 70, name: "المعارج", page: 568, ayahs: 44, type: "مكية" },
    { id: 71, name: "نوح", page: 570, ayahs: 28, type: "مكية" },
    { id: 72, name: "الجن", page: 572, ayahs: 28, type: "مكية" },
    { id: 73, name: "المزمل", page: 574, ayahs: 20, type: "مكية" },
    { id: 74, name: "المدثر", page: 575, ayahs: 56, type: "مكية" },
    { id: 75, name: "القيامة", page: 577, ayahs: 40, type: "مكية" },
    { id: 76, name: "الإنسان", page: 578, ayahs: 31, type: "مدنية" },
    { id: 77, name: "المرسلات", page: 580, ayahs: 50, type: "مكية" },
    { id: 78, name: "النبأ", page: 582, ayahs: 40, type: "مكية" },
    { id: 79, name: "النازعات", page: 583, ayahs: 46, type: "مكية" },
    { id: 80, name: "عبس", page: 585, ayahs: 42, type: "مكية" },
    { id: 81, name: "التكوير", page: 586, ayahs: 29, type: "مكية" },
    { id: 82, name: "الانفطار", page: 587, ayahs: 19, type: "مكية" },
    { id: 83, name: "المطففين", page: 587, ayahs: 36, type: "مكية" },
    { id: 84, name: "الانشقاق", page: 589, ayahs: 25, type: "مكية" },
    { id: 85, name: "البروج", page: 590, ayahs: 22, type: "مكية" },
    { id: 86, name: "الطارق", page: 591, ayahs: 17, type: "مكية" },
    { id: 87, name: "الأعلى", page: 591, ayahs: 19, type: "مكية" },
    { id: 88, name: "الغاشية", page: 592, ayahs: 26, type: "مكية" },
    { id: 89, name: "الفجر", page: 593, ayahs: 30, type: "مكية" },
    { id: 90, name: "البلد", page: 594, ayahs: 20, type: "مكية" },
    { id: 91, name: "الشمس", page: 595, ayahs: 15, type: "مكية" },
    { id: 92, name: "الليل", page: 595, ayahs: 21, type: "مكية" },
    { id: 93, name: "الضحى", page: 596, ayahs: 11, type: "مكية" },
    { id: 94, name: "الشرح", page: 596, ayahs: 8, type: "مكية" },
    { id: 95, name: "التين", page: 597, ayahs: 8, type: "مكية" },
    { id: 96, name: "العلق", page: 597, ayahs: 19, type: "مكية" },
    { id: 97, name: "القدر", page: 598, ayahs: 5, type: "مكية" },
    { id: 98, name: "البينة", page: 598, ayahs: 8, type: "مدنية" },
    { id: 99, name: "الزلزلة", page: 599, ayahs: 8, type: "مدنية" },
    { id: 100, name: "العاديات", page: 599, ayahs: 11, type: "مكية" },
    { id: 101, name: "القارعة", page: 600, ayahs: 11, type: "مكية" },
    { id: 102, name: "التكاثر", page: 600, ayahs: 8, type: "مكية" },
    { id: 103, name: "العصر", page: 601, ayahs: 3, type: "مكية" },
    { id: 104, name: "الهمزة", page: 601, ayahs: 9, type: "مكية" },
    { id: 105, name: "الفيل", page: 601, ayahs: 5, type: "مكية" },
    { id: 106, name: "قريش", page: 602, ayahs: 4, type: "مكية" },
    { id: 107, name: "الماعون", page: 602, ayahs: 7, type: "مكية" },
    { id: 108, name: "الكوثر", page: 602, ayahs: 3, type: "مكية" },
    { id: 109, name: "الكافرون", page: 603, ayahs: 6, type: "مكية" },
    { id: 110, name: "النصر", page: 603, ayahs: 3, type: "مدنية" },
    { id: 111, name: "المسد", page: 603, ayahs: 5, type: "مكية" },
    { id: 112, name: "الإخلاص", page: 604, ayahs: 4, type: "مكية" },
    { id: 113, name: "الفلق", page: 604, ayahs: 5, type: "مكية" },
    { id: 114, name: "الناس", page: 604, ayahs: 6, type: "مكية" }
];

// أجزاء القرآن الكريم الـ 30
const JUZ_INDEX = [
    { juz: 1, name: "الجزء الأول", page: 1 },
    { juz: 2, name: "الجزء الثاني", page: 22 },
    { juz: 3, name: "الجزء الثالث", page: 42 },
    { juz: 4, name: "الجزء الرابع", page: 62 },
    { juz: 5, name: "الجزء الخامس", page: 82 },
    { juz: 6, name: "الجزء السادس", page: 102 },
    { juz: 7, name: "الجزء السابع", page: 121 },
    { juz: 8, name: "الجزء الثامن", page: 142 },
    { juz: 9, name: "الجزء التاسع", page: 162 },
    { juz: 10, name: "الجزء العاشر", page: 182 },
    { juz: 11, name: "الجزء الحادي عشر", page: 201 },
    { juz: 12, name: "الجزء الثاني عشر", page: 222 },
    { juz: 13, name: "الجزء الثالث عشر", page: 242 },
    { juz: 14, name: "الجزء الرابع عشر", page: 262 },
    { juz: 15, name: "الجزء الخامس عشر", page: 282 },
    { juz: 16, name: "الجزء السادس عشر", page: 302 },
    { juz: 17, name: "الجزء السابع عشر", page: 322 },
    { juz: 18, name: "الجزء الثامن عشر", page: 342 },
    { juz: 19, name: "الجزء التاسع عشر", page: 362 },
    { juz: 20, name: "الجزء العشرون", page: 382 },
    { juz: 21, name: "الجزء الحادي والعشرون", page: 402 },
    { juz: 22, name: "الجزء الثاني والعشرون", page: 422 },
    { juz: 23, name: "الجزء الثالث والعشرون", page: 442 },
    { juz: 24, name: "الجزء الرابع والعشرون", page: 462 },
    { juz: 25, name: "الجزء الخامس والعشرون", page: 482 },
    { juz: 26, name: "الجزء السادس والعشرون", page: 502 },
    { juz: 27, name: "الجزء السابع والعشرون", page: 522 },
    { juz: 28, name: "الجزء الثامن والعشرون", page: 542 },
    { juz: 29, name: "الجزء التاسع والعشرون", page: 562 },
    { juz: 30, name: "الجزء الثلاثون", page: 582 }
];

// أحزاب القرآن الكريم الـ 60 وبداية صفحة كل حزب
const HIZB_STARTS = [
    1, 11, 22, 32, 42, 51, 62, 72, 82, 92,
    102, 111, 121, 132, 142, 151, 162, 173, 182, 192,
    201, 212, 222, 231, 242, 252, 262, 272, 282, 292,
    302, 312, 322, 332, 342, 352, 362, 371, 382, 392,
    402, 413, 422, 431, 442, 451, 462, 472, 482, 491,
    502, 513, 522, 531, 542, 553, 562, 573, 582, 591
];

const TOTAL_MUSHAF_PAGES = 604;
let currentPageNumber = 562; // البداية الافتراضية
let quranAudio = new Audio();
let isQuranAudioPlaying = false;

// تحويل الأرقام الإنجليزية لأرقام عربية مشرقية (مثل: ٤٤٢)
function toArabicDigits(num) {
    if (num === null || num === undefined) return "";
    const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, d => arabicNums[+d]);
}

// معرفة الحزب الحالي من رقم الصفحة
function getHizbForPage(page) {
    for (let i = HIZB_STARTS.length - 1; i >= 0; i--) {
        if (page >= HIZB_STARTS[i]) {
            return i + 1;
        }
    }
    return 1;
}

// معرفة الجزء الحالي من رقم الصفحة
function getJuzForPage(page) {
    for (let i = JUZ_INDEX.length - 1; i >= 0; i--) {
        if (page >= JUZ_INDEX[i].page) {
            return JUZ_INDEX[i];
        }
    }
    return JUZ_INDEX[0];
}

// معرفة السورة الحالية لصفحة معينة
function getSurahForPage(page) {
    for (let i = SURAHS_INDEX.length - 1; i >= 0; i--) {
        if (page >= SURAHS_INDEX[i].page) {
            return SURAHS_INDEX[i];
        }
    }
    return SURAHS_INDEX[0];
}

document.addEventListener("DOMContentLoaded", () => {
    initGoldenQuran();
});

function initGoldenQuran() {
        setupGoldenNavigation();
    setupGoldenBookmarks();
    setupGoldenTheme();
    setupGoldenIndexModal();
    setupGoldenFullScreen();
    setupGoldenImmersiveMode();
    setupGoldenAyahSheet();
    setupGoldenMiniPlayer();
    setupGoldenMemorizeStudio();
    setupTouchSwipe();
    setupKeyboardNavigation();
    initTafsirModal();
    initKhatmaTabs();

    // فحص ما إذا كان هناك طلب انتقال مسبق لصفحة معينة (مثل سورة الكهف أو سورة الملك)
    const targetReq = sessionStorage.getItem("target_mushaf_page");
    if (targetReq) {
        try {
            const parsedTarget = JSON.parse(targetReq);
            if (parsedTarget && parsedTarget.page >= 1 && parsedTarget.page <= TOTAL_MUSHAF_PAGES) {
                currentPageNumber = parsedTarget.page;
            }
            sessionStorage.removeItem("target_mushaf_page");
        } catch (e) {}
    } else {
        // استعادة آخر موضع قراءة محفوظ
        const savedLast = localStorage.getItem("zad_quran_last_read");
        if (savedLast) {
            try {
                const parsed = JSON.parse(savedLast);
                if (parsed && parsed.pageNumber >= 1 && parsed.pageNumber <= TOTAL_MUSHAF_PAGES) {
                    currentPageNumber = parsed.pageNumber;
                }
            } catch (e) {}
        } else {
            const legacyLast = localStorage.getItem("mushaf_last_page");
            if (legacyLast) {
                const p = parseInt(legacyLast, 10);
                if (!isNaN(p) && p >= 1 && p <= TOTAL_MUSHAF_PAGES) currentPageNumber = p;
            }
        }
    }

    // استعادة مظهر القراءة المفضل (ليلي دافئ أو ورقي)
    const savedTheme = localStorage.getItem("golden_quran_theme") || "theme-golden-night";
    const wrapper = document.getElementById("golden-quran-wrapper");
    if (wrapper) {
        wrapper.className = `golden-quran-wrapper ${savedTheme}`;
    }

    // فتح صفحة المصحف مباشرة من الملفات المدمجة
    goToMushafPage(currentPageNumber);
}

// تسجيل قراءة الصفحة في حديقة الحسنات والمهام الإيمانية اليومية
function recordMushafPageRead(pageNumber) {
    if (!pageNumber || pageNumber < 1 || pageNumber > TOTAL_MUSHAF_PAGES) return;
    try {
        const todayKey = `zad_quran_pages_read_${new Date().toISOString().slice(0, 10)}`;
        let readPages = [];
        try {
            readPages = JSON.parse(localStorage.getItem(todayKey) || "[]");
        } catch (_) {}
        if (!readPages.includes(pageNumber)) {
            readPages.push(pageNumber);
            localStorage.setItem(todayKey, JSON.stringify(readPages));
            if (typeof window.addSpiritualGardenDeed === "function") {
                window.addSpiritualGardenDeed("quran", 5, 1);
            }
        }
    } catch (e) {
        console.error("Error recording Quran page deed:", e);
    }
}
window.recordMushafPageRead = recordMushafPageRead;

// الانتقال إلى صفحة معينة في المصحف الشريف

function isDualPageMode() {
    return window.innerWidth >= 992;
}

function goToMushafPage(pageNumber) {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > TOTAL_MUSHAF_PAGES) pageNumber = TOTAL_MUSHAF_PAGES;
    currentPageNumber = pageNumber;

    const surah = getSurahForPage(pageNumber);
    const juz = getJuzForPage(pageNumber);
    const hizb = getHizbForPage(pageNumber);
    const padded = String(pageNumber).padStart(3, "0");

    // فحص وضع العرض (صفحتان متقابلتان للشاشات الكبيرة أم صفحة واحدة للهاتف)
    const dual = isDualPageMode();
    const rightPage = dual ? ((pageNumber % 2 === 1) ? pageNumber : pageNumber - 1) : pageNumber;
    const leftPage = dual ? (rightPage + 1 <= TOTAL_MUSHAF_PAGES ? rightPage + 1 : null) : null;

    // 1. تحديث صور المصحف محلياً
    const imgLeft = document.getElementById("mushaf-real-page-img");
    const imgRight = document.getElementById("mushaf-real-page-img-right");

    if (dual && leftPage) {
        if (imgRight) imgRight.src = `assets/quran-pages/${String(rightPage).padStart(3, "0")}.svg`;
        if (imgLeft) imgLeft.src = `assets/quran-pages/${String(leftPage).padStart(3, "0")}.svg`;
    } else {
        if (imgLeft) imgLeft.src = `assets/quran-pages/${padded}.svg`;
    }

    // 2. تحديث نصوص الترويسة العلوية
    const surahTitleEl = document.getElementById("golden-surah-title");
    if (surahTitleEl) {
        if (dual && leftPage) {
            const sRight = getSurahForPage(rightPage);
            const sLeft = getSurahForPage(leftPage);
            surahTitleEl.textContent = (sRight.id === sLeft.id) ? sRight.name : `${sRight.name} - ${sLeft.name}`;
        } else {
            surahTitleEl.textContent = surah.name;
        }
    }

    const juzTitleEl = document.getElementById("golden-juz-title");
    if (juzTitleEl) {
        if (dual && leftPage) {
            const jRight = getJuzForPage(rightPage);
            const jLeft = getJuzForPage(leftPage);
            juzTitleEl.textContent = (jRight.juz === jLeft.juz)
                ? `الجزء ${toArabicDigits(jRight.juz)}`
                : `الجزء ${toArabicDigits(jRight.juz)} - ${toArabicDigits(jLeft.juz)}`;
        } else {
            juzTitleEl.textContent = `الجزء ${toArabicDigits(juz.juz)}`;
        }
    }

    // 3. تحديث كبسولة رقم الصفحة والحزب أسفل الصفحة
    const pageNumEl = document.getElementById("golden-page-num");
    if (pageNumEl) {
        if (dual && leftPage) {
            pageNumEl.textContent = `${toArabicDigits(rightPage)} - ${toArabicDigits(leftPage)}`;
        } else {
            pageNumEl.textContent = toArabicDigits(pageNumber);
        }
    }

    const hizbNumEl = document.getElementById("golden-hizb-num");
    if (hizbNumEl) {
        if (dual && leftPage) {
            const hRight = getHizbForPage(rightPage);
            const hLeft = getHizbForPage(leftPage);
            hizbNumEl.textContent = (hRight === hLeft)
                ? `الحزب ${toArabicDigits(hRight)}`
                : `الحزب ${toArabicDigits(hRight)} - ${toArabicDigits(hLeft)}`;
        } else {
            hizbNumEl.textContent = `الحزب ${toArabicDigits(hizb)}`;
        }
    }

    // 4. تحديث علامة الوقوف (الفاصل والشريط الذهبي)
    updateBookmarkStateUI(pageNumber);

    // 5. حفظ الموضع كآخر قراءة تلقائياً
    const lastReadData = {
        pageNumber: pageNumber,
        surahId: surah.id,
        surahName: surah.name,
        juzName: juz.name,
        timestamp: Date.now()
    };
    localStorage.setItem("zad_quran_last_read", JSON.stringify(lastReadData));
    localStorage.setItem("mushaf_last_page", String(pageNumber));

    // 6. تحديث بطاقة "أكمل من حيث توقفت"
    updateResumeCardUI(pageNumber, surah);

    // 7. تسجيل قراءة الصفحة في حديقة الحسنات والمهام اليومية
    if (window._mushafPageReadTimer) clearTimeout(window._mushafPageReadTimer);
    window._mushafPageReadTimer = setTimeout(() => {
        recordMushafPageRead(pageNumber);
        if (dual && leftPage) {
            recordMushafPageRead(leftPage);
        }
    }, 800);
}

// تحديث حالة الفاصل وشريط موضع الوقوف
function updateBookmarkStateUI(pageNumber) {
    const ribbonEl = document.getElementById("golden-page-ribbon");
    const bookmarkIconEl = document.getElementById("golden-bookmark-icon");

    const savedBookmarkPage = parseInt(localStorage.getItem("mushaf_saved_bookmark") || "0", 10);
    const isBookmarked = (savedBookmarkPage === pageNumber) || isPageInBookmarksList(pageNumber);

    if (ribbonEl) {
        ribbonEl.style.display = isBookmarked ? "flex" : "none";
    }

    if (bookmarkIconEl) {
        if (isBookmarked) {
            bookmarkIconEl.className = "fa-solid fa-bookmark golden-bookmark-icon is-active";
        } else {
            bookmarkIconEl.className = "fa-regular fa-bookmark golden-bookmark-icon";
        }
    }
}

function isPageInBookmarksList(page) {
    try {
        const list = JSON.parse(localStorage.getItem("zad_quran_bookmarks") || "[]");
        return list.some(b => b.page === page);
    } catch (e) {
        return false;
    }
}

// إعداد أزرار التنقل الأساسية
function setupGoldenNavigation() {
    const btnPrev = document.getElementById("btn-mushaf-prev");
    const btnNext = document.getElementById("btn-mushaf-next");
    const tapPrev = document.getElementById("golden-tap-prev");
    const tapNext = document.getElementById("golden-tap-next");
    const pagePill = document.getElementById("golden-page-pill");
    const btnAudio = document.getElementById("btn-surah-audio");

    // التنقل بالصفحات (في اتجاه القراءة العربي: التالي يتقدم يساراً)
    const goNext = () => {
        if (isDualPageMode()) {
            const rightPage = (currentPageNumber % 2 === 1) ? currentPageNumber : currentPageNumber - 1;
            const target = rightPage + 2;
            if (target <= TOTAL_MUSHAF_PAGES) {
                goToMushafPage(target);
            } else if (rightPage < TOTAL_MUSHAF_PAGES) {
                goToMushafPage(TOTAL_MUSHAF_PAGES);
            } else if (typeof showToast === "function") {
                showToast("أنت الآن في الصفحة الأخيرة من المصحف الشريف 🌿");
            }
        } else {
            if (currentPageNumber < TOTAL_MUSHAF_PAGES) {
                goToMushafPage(currentPageNumber + 1);
            } else if (typeof showToast === "function") {
                showToast("أنت الآن في الصفحة الأخيرة من المصحف الشريف 🌿");
            }
        }
    };

    const goPrev = () => {
        if (isDualPageMode()) {
            const rightPage = (currentPageNumber % 2 === 1) ? currentPageNumber : currentPageNumber - 1;
            const target = rightPage - 2;
            if (target >= 1) {
                goToMushafPage(target);
            } else if (typeof showToast === "function") {
                showToast("أنت الآن في أول صفحة من المصحف الشريف (سورة الفاتحة) 🌿");
            }
        } else {
            if (currentPageNumber > 1) {
                goToMushafPage(currentPageNumber - 1);
            } else if (typeof showToast === "function") {
                showToast("أنت الآن في أول صفحة من المصحف الشريف (سورة الفاتحة) 🌿");
            }
        }
    };

    if (btnNext) btnNext.addEventListener("click", goNext);
    if (btnPrev) btnPrev.addEventListener("click", goPrev);
    // التقليب باللمس (اليمين للتالي واليسار للسابق - عكس الوضع السابق)
    if (tapNext) tapNext.addEventListener("click", goNext);
    if (tapPrev) tapPrev.addEventListener("click", goPrev);

    // أزرار الأسهم المخصصة للشاشات الكبيرة (< >)
    const desktopBtnNext = document.getElementById("golden-desktop-btn-next");
    const desktopBtnPrev = document.getElementById("golden-desktop-btn-prev");
    if (desktopBtnNext) desktopBtnNext.addEventListener("click", goNext);
    if (desktopBtnPrev) desktopBtnPrev.addEventListener("click", goPrev);

    // النقر على كبسولة الصفحة للانتقال السريع وفتح لوحة التفسير والتلاوة
    if (pagePill) {
        pagePill.addEventListener("click", () => {
            openGoldenAyahSheet(currentPageNumber);
        });
    }

    // زر التفسير والتلاوة المباشر في الترويسة العلوية
    const btnTafsirSheet = document.getElementById("golden-btn-tafsir-sheet");
    if (btnTafsirSheet) {
        btnTafsirSheet.addEventListener("click", () => {
            openGoldenAyahSheet(currentPageNumber);
        });
    }

    // تلاوة السورة الحالية
    if (btnAudio) {
        btnAudio.addEventListener("click", toggleSurahRecitation);
    }
}

async function toggleSurahRecitation() {
    const surah = getSurahForPage(currentPageNumber);
    const paddedSurah = String(surah.id).padStart(3, "0");
    const btnAudio = document.getElementById("btn-surah-audio");
    const textSpan = btnAudio ? btnAudio.querySelector(".btn-audio-text") : null;
    const icon = btnAudio ? btnAudio.querySelector("i") : null;

    if (isQuranAudioPlaying) {
        quranAudio.pause();
        isQuranAudioPlaying = false;
        if (textSpan) textSpan.textContent = "تلاوة";
        if (icon) icon.className = "fa-solid fa-volume-high";
        if (typeof showToast === "function") showToast("تم إيقاف التلاوة ⏸️");
    } else {
        quranAudio.src = await getDownloadedAudioUrl(`https://server8.mp3quran.net/afs/${paddedSurah}.mp3`);
        quranAudio.play().then(() => {
            isQuranAudioPlaying = true;
            if (textSpan) textSpan.textContent = "إيقاف";
            if (icon) icon.className = "fa-solid fa-pause";
            if (typeof showToast === "function") showToast(`جاري تشغيل تلاوة سورة ${surah.name} 🎙️`);
        }).catch(() => {
            if (typeof showToast === "function") showToast("تعذر تشغيل التلاوة بدون اتصال بالإنترنت");
        });
    }

    quranAudio.onended = () => {
        isQuranAudioPlaying = false;
        if (textSpan) textSpan.textContent = "تلاوة";
        if (icon) icon.className = "fa-solid fa-volume-high";
    };
}

// حفظ وحذف الفواصل المرجعية
function setupGoldenBookmarks() {
    const btnBookmark = document.getElementById("golden-btn-bookmark");
    if (!btnBookmark) return;

    btnBookmark.addEventListener("click", () => {
        const page = currentPageNumber;
        const surah = getSurahForPage(page);
        let bookmarks = [];
        try {
            bookmarks = JSON.parse(localStorage.getItem("zad_quran_bookmarks") || "[]");
        } catch (e) {}

        const existingIdx = bookmarks.findIndex(b => b.page === page);

        if (existingIdx !== -1) {
            // حذف العلامة
            bookmarks.splice(existingIdx, 1);
            localStorage.setItem("zad_quran_bookmarks", JSON.stringify(bookmarks));
            if (parseInt(localStorage.getItem("mushaf_saved_bookmark"), 10) === page) {
                localStorage.removeItem("mushaf_saved_bookmark");
            }
            updateBookmarkStateUI(page);
            if (typeof showToast === "function") {
                showToast(`تمت إزالة علامة صفحة ${page} 🗑️`);
            }
        } else {
            // إضافة العلامة
            bookmarks.push({
                page: page,
                surahName: surah.name,
                surahId: surah.id,
                date: new Date().toLocaleDateString("ar-EG")
            });
            localStorage.setItem("zad_quran_bookmarks", JSON.stringify(bookmarks));
            localStorage.setItem("mushaf_saved_bookmark", String(page));
            updateBookmarkStateUI(page);
            if (typeof showToast === "function") {
                showToast(`تم حفظ صفحة ${page} (سورة ${surah.name}) كعلامة وقوف 🔖`);
            }
        }
        renderBookmarksInIndex();
    });
}

// تبديل أوضاع راحة العين (ليلي دافئ أو ورقي هادئ)
function setupGoldenTheme() {
    const btnTheme = document.getElementById("golden-btn-theme");
    const wrapper = document.getElementById("golden-quran-wrapper");
    if (!btnTheme || !wrapper) return;

    btnTheme.addEventListener("click", () => {
        const isNight = wrapper.classList.contains("theme-golden-night");
        if (isNight) {
            wrapper.classList.remove("theme-golden-night");
            wrapper.classList.add("theme-golden-cream");
            localStorage.setItem("golden_quran_theme", "theme-golden-cream");
            if (typeof showToast === "function") showToast("تم تفعيل وضع الورق الكريمي الهادئ 📜");
        } else {
            wrapper.classList.remove("theme-golden-cream");
            wrapper.classList.add("theme-golden-night");
            localStorage.setItem("golden_quran_theme", "theme-golden-night");
            if (typeof showToast === "function") showToast("تم تفعيل الوضع الليلي الدافئ 🌙");
        }
    });
}

// إيماءات اللمس والسحب لتقليب الصفحات على الهاتف
function setupTouchSwipe() {
    const viewport = document.getElementById("golden-mushaf-viewport");
    if (!viewport) return;

    let touchStartX = 0;
    let touchStartY = 0;

    viewport.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    viewport.addEventListener("touchend", (e) => {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;

        // تجاهل التمرير العمودي
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
            if (diffX > 0) {
                // سحب لليمين -> تقدم بالصفحة (التالي)
                if (currentPageNumber < TOTAL_MUSHAF_PAGES) {
                    goToMushafPage(currentPageNumber + 1);
                } else if (typeof showToast === "function") {
                    showToast("أنت الآن في الصفحة الأخيرة من المصحف الشريف 🌿");
                }
            } else {
                // سحب لليسار -> رجوع بالصفحة (السابق)
                if (currentPageNumber > 1) {
                    goToMushafPage(currentPageNumber - 1);
                } else if (typeof showToast === "function") {
                    showToast("أنت الآن في أول صفحة من المصحف الشريف (سورة الفاتحة) 🌿");
                }
            }
        }
    }, { passive: true });
}

// التنقل بمفاتيح الأسهم على أجهزة الكمبيوتر
function setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "ArrowLeft") {
            if (currentPageNumber < TOTAL_MUSHAF_PAGES) goToMushafPage(currentPageNumber + 1);
        } else if (e.key === "ArrowRight") {
            if (currentPageNumber > 1) goToMushafPage(currentPageNumber - 1);
        }
    });
}

// إدارة نافذة الفهرس (السور / الأجزاء / الفواصل)
function setupGoldenIndexModal() {
    const modal = document.getElementById("golden-index-modal");
    const btnOpenGrid = document.getElementById("golden-btn-index");
    const btnOpenSurah = document.getElementById("golden-btn-surah");
    const btnClose = document.getElementById("btn-close-golden-index");
    const searchInput = document.getElementById("golden-index-search-input");
    const tabs = document.querySelectorAll(".golden-index-tab-btn");

    if (!modal) return;

    const openModal = () => {
        modal.classList.add("open");
        renderSurahsInIndex();
    };

    const closeModal = () => {
        modal.classList.remove("open");
    };

    if (btnOpenGrid) btnOpenGrid.addEventListener("click", openModal);
    if (btnOpenSurah) btnOpenSurah.addEventListener("click", openModal);
    if (btnClose) btnClose.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            const tabName = tab.getAttribute("data-tab");
            if (tabName === "surahs") renderSurahsInIndex();
            else if (tabName === "juz") renderJuzInIndex();
            else if (tabName === "bookmarks") renderBookmarksInIndex();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();
            renderSurahsInIndex(query);
        });
    }
}

function renderSurahsInIndex(filter = "") {
    const list = document.getElementById("golden-index-list");
    if (!list) return;

    list.innerHTML = "";
    const filtered = SURAHS_INDEX.filter(s => {
        if (!filter) return true;
        return s.name.toLowerCase().includes(filter) || String(s.id).includes(filter) || String(s.page).includes(filter);
    });

    if (filtered.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px;">لم يتم العثور على سورة مطابقة</div>';
        return;
    }

    filtered.forEach(surah => {
        const item = document.createElement("div");
        item.className = "golden-index-item";
        item.innerHTML = `
            <div class="golden-index-item-right">
                <span class="golden-index-num">${toArabicDigits(surah.id)}</span>
                <div>
                    <div class="golden-index-name">سورة ${surah.name}</div>
                    <div class="golden-index-meta">${surah.type} • ${toArabicDigits(surah.ayahs)} آية</div>
                </div>
            </div>
            <span class="golden-index-page">صفحة ${toArabicDigits(surah.page)}</span>
        `;
        item.addEventListener("click", () => {
            goToMushafPage(surah.page);
            const modal = document.getElementById("golden-index-modal");
            if (modal) modal.classList.remove("open");
        });
        list.appendChild(item);
    });
}

function renderJuzInIndex() {
    const list = document.getElementById("golden-index-list");
    if (!list) return;

    list.innerHTML = "";
    JUZ_INDEX.forEach(juz => {
        const item = document.createElement("div");
        item.className = "golden-index-item";
        item.innerHTML = `
            <div class="golden-index-item-right">
                <span class="golden-index-num">${toArabicDigits(juz.juz)}</span>
                <div>
                    <div class="golden-index-name">${juz.name}</div>
                </div>
            </div>
            <span class="golden-index-page">صفحة ${toArabicDigits(juz.page)}</span>
        `;
        item.addEventListener("click", () => {
            goToMushafPage(juz.page);
            const modal = document.getElementById("golden-index-modal");
            if (modal) modal.classList.remove("open");
        });
        list.appendChild(item);
    });
}

function renderBookmarksInIndex() {
    const list = document.getElementById("golden-index-list");
    if (!list) return;

    list.innerHTML = "";
    let bookmarks = [];
    try {
        bookmarks = JSON.parse(localStorage.getItem("zad_quran_bookmarks") || "[]");
    } catch (e) {}

    if (bookmarks.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 25px;">لا توجد علامات محفوظة بعد.<br><small style="color: var(--gold-400);">انقر على أيقونة 🔖 في الترويسة لحفظ أي صفحة تقف عندها.</small></div>';
        return;
    }

    bookmarks.forEach(bm => {
        const item = document.createElement("div");
        item.className = "golden-index-item";
        item.innerHTML = `
            <div class="golden-index-item-right">
                <span class="golden-index-num" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b;">🔖</span>
                <div>
                    <div class="golden-index-name">سورة ${bm.surahName}</div>
                    <div class="golden-index-meta">${bm.date || "محفوظة"}</div>
                </div>
            </div>
            <span class="golden-index-page">صفحة ${toArabicDigits(bm.page)}</span>
        `;
        item.addEventListener("click", () => {
            goToMushafPage(bm.page);
            const modal = document.getElementById("golden-index-modal");
            if (modal) modal.classList.remove("open");
        });
        list.appendChild(item);
    });
}

// تحديث بطاقة "أكمل من حيث توقفت"
function updateResumeCardUI(page, surah) {
    const container = document.getElementById("quran-hub-resume-card");
    if (!container) return;

    container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 14px 18px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(212, 175, 55, 0.2); color: var(--gold-400); display: grid; place-items: center; font-size: 1.2rem;">
                    <i class="fa-solid fa-bookmark"></i>
                </div>
                <div>
                    <span style="font-size: 0.82rem; color: #94a3b8; display: block;">أكمل من حيث توقفت:</span>
                    <strong style="font-size: 1.05rem; color: #fff;">سورة ${surah.name} • صفحة ${toArabicDigits(page)}</strong>
                </div>
            </div>
            <button type="button" class="btn btn-gold btn-sm" id="btn-continue-reading-hub" style="padding: 8px 18px; border-radius: 20px; font-weight: 800;">
                <span>متابعة القراءة 📖</span>
            </button>
        </div>
    `;

    const btn = document.getElementById("btn-continue-reading-hub");
    if (btn) {
        btn.addEventListener("click", () => {
            const wrapper = document.getElementById("golden-quran-wrapper");
            if (wrapper) wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }
}

// نافذة التفسير الميسر للصفحة الحالية
function initTafsirModal() {
    const btnTafsir = document.getElementById("btn-page-tafsir");
    const modal = document.getElementById("quran-tafsir-modal");
    const btnClose = document.getElementById("btn-close-tafsir-modal");

    if (btnTafsir) {
        btnTafsir.addEventListener("click", () => {
            loadPageTafsir(currentPageNumber);
        });
    }

    if (btnClose && modal) {
        btnClose.addEventListener("click", () => {
            modal.classList.remove("open");
        });
    }
}

async function loadPageTafsir(page) {
    const modal = document.getElementById("quran-tafsir-modal");
    const content = document.getElementById("tafsir-modal-body");
    const title = document.getElementById("tafsir-modal-title");

    if (title) title.textContent = `التفسير الميسر • صفحة ${toArabicDigits(page)}`;
    if (modal) modal.classList.add("open");

    if (!content) return;
    content.innerHTML = '<div style="text-align: center; padding: 25px; color: #d4af37;"><i class="fa-solid fa-spinner fa-spin"></i> جاري فتح التفسير...</div>';

    // فحص الكاش المحلي أولاً
    const cached = localStorage.getItem(`tafsir_cache_p${page}`);
    if (cached) {
        try {
            renderTafsirAyahs(JSON.parse(cached), content);
            return;
        } catch (e) {}
    }

    try {
        const res = await fetchQuranReference(`https://api.alquran.cloud/v1/page/${page}/ar.muyassar`);
        const json = await res.json();
        if (!res.ok || !Array.isArray(json?.data?.ayahs)) throw new Error("Content unavailable");
        if (json && json.data && json.data.ayahs) {
            localStorage.setItem(`tafsir_cache_p${page}`, JSON.stringify(json.data.ayahs));
            renderTafsirAyahs(json.data.ayahs, content);
        } else {
            content.innerHTML = '<div style="text-align: center; padding: 20px; color: #94a3b8;">التفسير متاح عند توفر اتصال بالإنترنت.</div>';
        }
    } catch (e) {
        content.innerHTML = '<div style="text-align: center; padding: 20px; color: #94a3b8;">التفسير متاح عند توفر اتصال بالإنترنت.</div>';
    }
}

function renderTafsirAyahs(ayahs, container) {
    renderSheetTafsir(ayahs, container);
}

function initKhatmaTabs() {
    const tabBtns = document.querySelectorAll(".quran-tab-btn");
    const subpartMushaf = document.getElementById("subpart-mushaf");
    const subpartKhatma = document.getElementById("subpart-khatma");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const target = btn.getAttribute("data-tab");
            if (target === "mushaf") {
                if (subpartMushaf) subpartMushaf.classList.remove("is-hidden");
                if (subpartKhatma) subpartKhatma.classList.add("is-hidden");
            } else {
                if (subpartMushaf) subpartMushaf.classList.add("is-hidden");
                if (subpartKhatma) subpartKhatma.classList.remove("is-hidden");
            }
        });
    });
}

// إعادة ضبط العرض تلقائياً عند تغيير مقاس الشاشة بين وضع الصفحة المزدوجة والمفردة
let goldenResizeDebounce = null;
window.addEventListener("resize", () => {
    clearTimeout(goldenResizeDebounce);
    goldenResizeDebounce = setTimeout(() => {
        if (typeof currentPageNumber === "number" && currentPageNumber >= 1) {
            goToMushafPage(currentPageNumber);
        }
    }, 150);
});

// ==========================================================================
// 1. وضع ملء الشاشة الكامل (Fullscreen Mode)
// ==========================================================================
function setupGoldenFullScreen() {
    const btnFs = document.getElementById("golden-btn-fullscreen");
    const iconFs = document.getElementById("golden-fullscreen-icon");
    const wrapper = document.getElementById("golden-quran-wrapper");
    if (!btnFs || !wrapper) return;

    let toastTimer = null;

    const showArabicFullscreenToast = () => {
        let toast = document.getElementById("golden-fullscreen-arabic-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "golden-fullscreen-arabic-toast";
            toast.className = "golden-fullscreen-arabic-toast";
            toast.innerHTML = `
                <i class="fa-solid fa-expand text-gold"></i>
                <span>وضع ملء الشاشة للمصحف الشريف ⛶</span>
                <span class="fs-toast-action">اسحب لأسفل أو انقر هنا للخروج</span>
            `;
            toast.addEventListener("click", () => {
                exitFs();
            });
            wrapper.appendChild(toast);
        }

        clearTimeout(toastTimer);
        // إعادة تفعيل الأنيميشن
        toast.classList.remove("is-visible");
        void toast.offsetWidth;
        toast.classList.add("is-visible");

        toastTimer = setTimeout(() => {
            if (toast) toast.classList.remove("is-visible");
        }, 3800);
    };

    const enterFs = () => {
        wrapper.classList.add("is-fullscreen");
        if (iconFs) iconFs.className = "fa-solid fa-compress";
        showArabicFullscreenToast();
    };

    const exitFs = () => {
        wrapper.classList.remove("is-fullscreen");
        if (iconFs) iconFs.className = "fa-solid fa-expand";
        const toast = document.getElementById("golden-fullscreen-arabic-toast");
        if (toast) toast.classList.remove("is-visible");
        if (typeof showToast === "function") showToast("تم الخروج من ملء الشاشة");
    };

    const toggleFs = () => {
        if (!wrapper.classList.contains("is-fullscreen")) {
            enterFs();
        } else {
            exitFs();
        }
    };

    btnFs.addEventListener("click", toggleFs);

    // دعم إيماءة السحب لأسفل من أعلى الشاشة للخروج من وضع ملء الشاشة (Swipe down to exit)
    let touchStartY = 0;
    wrapper.addEventListener("touchstart", (e) => {
        if (wrapper.classList.contains("is-fullscreen") && e.touches.length === 1) {
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    wrapper.addEventListener("touchend", (e) => {
        if (wrapper.classList.contains("is-fullscreen") && touchStartY > 0 && touchStartY < 120) {
            const touchEndY = e.changedTouches[0].clientY;
            // سحب لأسفل بأكثر من 50 بكسل من أعلى الشاشة
            if (touchEndY - touchStartY > 50) {
                exitFs();
            }
        }
        touchStartY = 0;
    }, { passive: true });

    // الخروج بالضغط على زر Escape في لوحة المفاتيح
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && wrapper.classList.contains("is-fullscreen")) {
            exitFs();
        }
    });
}

// ==========================================================================
// 2. وضع القراءة الغامرة بدون شتات (Immersive Mode)
// ==========================================================================
function setupGoldenImmersiveMode() {
    const viewport = document.getElementById("golden-mushaf-viewport");
    const wrapper = document.getElementById("golden-quran-wrapper");
    if (!viewport || !wrapper) return;

    viewport.addEventListener("click", (e) => {
        if (e.target.closest(".golden-tap-zone") || 
            e.target.closest(".golden-desktop-nav-btn") ||
            e.target.closest(".golden-page-ribbon")) {
            return;
        }
        wrapper.classList.toggle("is-immersive");
    });
}

// ==========================================================================
// 3. نافذة التفاعل مع الآية والمراجع والتلاوة (طبق الأصل من المصحف الذهبي)
// ==========================================================================
function setupGoldenAyahSheet() {
    const modal = document.getElementById("golden-ayah-modal");
    const btnClose = document.getElementById("btn-close-ayah-sheet");
    if (!modal) return;

    if (btnClose) {
        btnClose.addEventListener("click", () => {
            modal.classList.remove("open");
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("open");
    });

    // 4 أزرار سريعة
    const btnBookmark = document.getElementById("btn-sheet-bookmark");
    if (btnBookmark) {
        btnBookmark.addEventListener("click", () => {
            toggleBookmarkForPage(currentPageNumber);
            if (typeof showToast === "function") showToast("تم حفظ العلامة المرجعية بنجاح 🔖");
        });
    }

    const btnRibbon = document.getElementById("btn-sheet-ribbon");
    if (btnRibbon) {
        btnRibbon.addEventListener("click", () => {
            localStorage.setItem("mushaf_saved_bookmark", String(currentPageNumber));
            updateBookmarkStateUI(currentPageNumber);
            if (typeof showToast === "function") showToast(`تم تثبيت فاصل الورد عند صفحة ${toArabicDigits(currentPageNumber)} 📖`);
        });
    }

    const btnNote = document.getElementById("btn-sheet-note");
    if (btnNote) {
        btnNote.addEventListener("click", () => {
            const surah = getSurahForPage(currentPageNumber);
            const savedNote = localStorage.getItem(`zad_note_p${currentPageNumber}`) || "";
            const newNote = prompt(`أدخل خاطرتك الإيمانية أو تدبرك لسورة ${surah.name} (صفحة ${toArabicDigits(currentPageNumber)}):`, savedNote);
            if (newNote !== null) {
                localStorage.setItem(`zad_note_p${currentPageNumber}`, newNote);
                if (typeof showToast === "function") showToast("تم حفظ خاطرتك الإيمانية بنجاح 📝");
            }
        });
    }

    const btnRecite = document.getElementById("btn-sheet-recite");
    if (btnRecite) {
        btnRecite.addEventListener("click", () => {
            modal.classList.remove("open");
            startGoldenAudioPlayer();
        });
    }

    // نسخ ومشاركة الآية
    const btnCopy = document.getElementById("btn-ayah-copy");
    if (btnCopy) {
        btnCopy.addEventListener("click", () => {
            const txt = document.getElementById("golden-ayah-text")?.textContent || "";
            const ref = document.getElementById("golden-ayah-ref")?.textContent || "";
            navigator.clipboard.writeText(`"${txt}" [${ref}] - زاد المسلم`).then(() => {
                if (typeof showToast === "function") showToast("تم نسخ الآية الكريمة ✓");
            });
        });
    }

    const btnShare = document.getElementById("btn-ayah-share");
    if (btnShare) {
        btnShare.addEventListener("click", () => {
            const txt = document.getElementById("golden-ayah-text")?.textContent || "";
            const ref = document.getElementById("golden-ayah-ref")?.textContent || "";
            const shareText = `"${txt}" [${ref}] - تطبيق زاد المسلم`;
            if (navigator.share) {
                navigator.share({ title: "زاد المسلم", text: shareText }).catch(() => {});
            } else {
                navigator.clipboard.writeText(shareText);
                if (typeof showToast === "function") showToast("تم نسخ نص الآية للمشاركة ↗");
            }
        });
    }

    // زر مشاركة الآية كبطاقة ستوري مصممة
    const btnStoryCard = document.getElementById("btn-ayah-story-card");
    if (btnStoryCard) {
        btnStoryCard.addEventListener("click", () => {
            const txt = document.getElementById("golden-ayah-text")?.textContent || "";
            const ref = document.getElementById("golden-ayah-ref")?.textContent || "";
            if (window.ShareCardGenerator) {
                modal.classList.remove("open");
                window.ShareCardGenerator.openModal({ text: txt, title: "آية من كتاب الله", ref: ref });
            }
        });
    }

    window.handleSheetShareAsStoryCard = function() {
        const title = document.getElementById("ayah-sheet-title")?.innerText || document.getElementById("golden-ayah-ref")?.textContent || "آية كريمة";
        const text = document.getElementById("ayah-sheet-text")?.innerText || document.getElementById("golden-ayah-text")?.textContent || "";
        if (window.ShareCardGenerator) {
            if (typeof window.closeAyahActionSheet === "function") window.closeAyahActionSheet();
            const gModal = document.getElementById("golden-ayah-modal");
            if (gModal) gModal.classList.remove("open");
            window.ShareCardGenerator.openModal({ text: text, title: "آية من كتاب الله", ref: title });
        }
    };

    // تفاعل فتح وإغلاق كروت المراجع (Accordion)
    document.querySelectorAll(".golden-ref-card").forEach(card => {
        const item = card.querySelector(".golden-ref-item");
        if (item) {
            item.addEventListener("click", () => {
                card.classList.toggle("open");
            });
        }
    });
}

function openGoldenAyahSheet(page) {
    const modal = document.getElementById("golden-ayah-modal");
    if (!modal) return;

    const surah = getSurahForPage(page || currentPageNumber);
    const txtEl = document.getElementById("golden-ayah-text");
    const refEl = document.getElementById("golden-ayah-ref");

    if (refEl) refEl.textContent = `سورة ${surah.name} • صفحة ${toArabicDigits(page || currentPageNumber)}`;
    if (txtEl) {
        txtEl.textContent = (page === 1) 
            ? "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾"
            : `تلاوة وتدبر آيات سورة ${surah.name} المباركة`;
    }

    loadAyahReferencesContent(page || currentPageNumber, surah);
    if (!modal.querySelector('.zad-report-content')) {
        const report = document.createElement('button'); report.className = 'btn outline zad-report-content';
        report.textContent = 'بلّغ عن خطأ في المحتوى';
        report.onclick = () => window.ZadUserTools?.report('مراجع المصحف — صفحة ' + currentPageNumber);
        (modal.querySelector('.modal-content') || modal).append(report);
    }
    modal.classList.add("open");
}

async function loadAyahReferencesContent(page, surah) {
    const bodyTafsir = document.getElementById("golden-ref-body-tafsir");
    const bodyEnglish = document.getElementById("golden-ref-body-english");
    const bodyWords = document.getElementById("golden-ref-body-words");
    const bodyAsbab = document.getElementById("golden-ref-body-asbab");
    const bodyIrab = document.getElementById("golden-ref-body-irab");
    const bodyTopic = document.getElementById("golden-ref-body-topic");

    const unavailable = 'لم يُضف محتوى موثّق لهذا القسم بعد. لا يُعرض نص عام باعتباره شرحًا للآيات.';
    [bodyWords, bodyAsbab, bodyIrab, bodyTopic].forEach(el => { if (el) el.textContent = unavailable; });
    if (bodyTafsir) {
        bodyTafsir.innerHTML = '<div style="color: #d4af37;"><i class="fa-solid fa-spinner fa-spin"></i> جاري استحضار التفسير الميسر...</div>';
    }

    if (bodyEnglish) {
        bodyEnglish.innerHTML = '<div style="color: #3b82f6;"><i class="fa-solid fa-spinner fa-spin"></i> Loading English translation...</div>';
    }

    // جلب التفسير والترجمة مع الكاش
    const cacheKey = `tafsir_cache_p${page}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            renderSheetTafsir(JSON.parse(cached), bodyTafsir);
        } catch (e) {}
    }

    try {
        const res = await fetchQuranReference(`https://api.alquran.cloud/v1/page/${page}/ar.muyassar`);
        const json = await res.json();
        if (json && json.data && json.data.ayahs) {
            localStorage.setItem(cacheKey, JSON.stringify(json.data.ayahs));
            renderSheetTafsir(json.data.ayahs, bodyTafsir);
        }
    } catch (e) {
        if (bodyTafsir && !cached) {
            bodyTafsir.textContent = "تعذّر تحميل التفسير الميسر. اتصل بالإنترنت أو نزّل التفسير من التنزيلات.";
        }
    }

    try {
        const resEn = await fetchQuranReference(`https://api.alquran.cloud/v1/page/${page}/en.sahih`);
        const jsonEn = await resEn.json();
        if (jsonEn && jsonEn.data && jsonEn.data.ayahs && bodyEnglish) {
            bodyEnglish.innerHTML = jsonEn.data.ayahs.map(a => `<div style="margin-bottom: 8px;"><strong>[${a.numberInSurah}]</strong> ${a.text}</div>`).join("");
        }
    } catch (e) {
        if (bodyEnglish) {
            bodyEnglish.innerHTML = "<p>English translation is available with internet connection.</p>";
        }
    }
}

function renderSheetTafsir(ayahs, container) {
    if (!container) return;
    container.replaceChildren();
    const source = document.createElement('p');
    source.textContent = 'المصدر: التفسير الميسر — خدمة AlQuran Cloud (ar.muyassar). الأرقام تشير إلى آيات الصفحة.';
    container.append(source);
    ayahs.forEach(a => {
        const row = document.createElement('p');
        row.textContent = '[' + toArabicDigits(a.numberInSurah) + '] ' + a.text;
        container.append(row);
    });
}

// ==========================================================================
// 4. المشغل الصوتي العائم المدمج للتلاوة (Floating Mini Player)
// ==========================================================================
function setupGoldenMiniPlayer() {
    const player = document.getElementById("golden-mini-player");
    const btnToggle = document.getElementById("golden-player-btn-toggle");
    const btnClose = document.getElementById("golden-player-btn-close");
    const icon = document.getElementById("golden-player-icon");

    if (btnToggle) {
        btnToggle.addEventListener("click", () => {
            if (isQuranAudioPlaying) {
                quranAudio.pause();
                isQuranAudioPlaying = false;
                if (icon) icon.className = "fa-solid fa-play";
            } else {
                quranAudio.play();
                isQuranAudioPlaying = true;
                if (icon) icon.className = "fa-solid fa-pause";
            }
        });
    }

    if (btnClose && player) {
        btnClose.addEventListener("click", () => {
            quranAudio.pause();
            isQuranAudioPlaying = false;
            player.style.display = "none";
        });
    }

    quranAudio.addEventListener("ended", () => {
        isQuranAudioPlaying = false;
        if (icon) icon.className = "fa-solid fa-play";
    });
}

async function startGoldenAudioPlayer() {
    const player = document.getElementById("golden-mini-player");
    const titleEl = document.getElementById("golden-player-title");
    const icon = document.getElementById("golden-player-icon");
    const surah = getSurahForPage(currentPageNumber);
    const padded = String(surah.id).padStart(3, "0");

    if (player) player.style.display = "block";
    if (titleEl) titleEl.textContent = `تلاوة سورة ${surah.name}`;

    quranAudio.src = await getDownloadedAudioUrl(`https://server8.mp3quran.net/afs/${padded}.mp3`);
    quranAudio.play().then(() => {
        isQuranAudioPlaying = true;
        if (icon) icon.className = "fa-solid fa-pause";
        if (typeof showToast === "function") showToast(`جاري الاستماع لتلاوة سورة ${surah.name} 🎙️`);
    }).catch(() => {
        if (typeof showToast === "function") showToast("تتطلب التلاوة الصوتية اتصالاً بالإنترنت.");
    });
}

// ==========================================================================
// 5. استوديو ومساعد الحفظ وتكرار الآيات الشريفة آية آية (Ayah Memorization & Repetition)
// ==========================================================================
let ayahMemorizeAudio = null;
let currentMemorizeAyahs = [];
let activeAyahIndex = -1;
let currentRepeatTarget = 3;
let currentRepeatCount = 1;
let isMemorizePlaying = false;
let selectedMemorizeReciter = "ar.alafasy";

function setupGoldenMemorizeStudio() {
    const btnOpen = document.getElementById("golden-btn-memorize");
    const modal = document.getElementById("golden-memorize-modal");
    const btnClose = document.getElementById("btn-close-memorize-modal");
    const reciterSelect = document.getElementById("memorize-reciter-select");
    const repeatPills = document.querySelectorAll("#memorize-repeat-pills .repeat-pill");

    if (!modal) return;
    if (!ayahMemorizeAudio) {
        ayahMemorizeAudio = new Audio();
    }

    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
            openGoldenMemorizeStudio();
        });
    }

    if (btnClose) {
        btnClose.addEventListener("click", () => {
            closeGoldenMemorizeStudio();
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeGoldenMemorizeStudio();
    });

    if (reciterSelect) {
        reciterSelect.addEventListener("change", () => {
            selectedMemorizeReciter = reciterSelect.value;
            if (isMemorizePlaying && activeAyahIndex >= 0) {
                playCurrentAyahWithRepeat();
            }
        });
    }

    repeatPills.forEach(pill => {
        pill.addEventListener("click", () => {
            repeatPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentRepeatTarget = parseInt(pill.getAttribute("data-repeat"), 10) || 3;
            currentRepeatCount = 1;
            updateMemorizeCounterUI();
        });
    });

    ayahMemorizeAudio.addEventListener("ended", () => {
        handleAyahRepetitionEnded();
    });

    ayahMemorizeAudio.addEventListener("error", () => {
        console.warn("Ayah audio load error, trying fallback EveryAyah...");
        handleAyahAudioFallback();
    });
}

function closeGoldenMemorizeStudio() {
    const modal = document.getElementById("golden-memorize-modal");
    if (modal) modal.classList.remove("open");
    stopMemorizeAudio();
}

function stopMemorizeAudio() {
    if (ayahMemorizeAudio) {
        ayahMemorizeAudio.pause();
        ayahMemorizeAudio.currentTime = 0;
    }
    isMemorizePlaying = false;
    updateActiveAyahCardUI(-1);
    updateMemorizeCounterUI();
}

function updateMemorizeCounterUI() {
    const counterBox = document.getElementById("memorize-current-counter");
    const badge = document.getElementById("memorize-counter-badge");
    if (!counterBox || !badge) return;

    if (isMemorizePlaying && activeAyahIndex >= 0) {
        counterBox.style.display = "block";
        if (currentRepeatTarget >= 999) {
            badge.textContent = `تكرار مستمر (المرة ${toArabicDigits(currentRepeatCount)}) 🔁`;
        } else {
            badge.textContent = `التكرار: ${toArabicDigits(currentRepeatCount)} من ${toArabicDigits(currentRepeatTarget)}`;
        }
    } else {
        counterBox.style.display = "none";
    }
}

async function openGoldenMemorizeStudio(pageNumber) {
    const modal = document.getElementById("golden-memorize-modal");
    const pageRefEl = document.getElementById("memorize-page-ref");
    const listEl = document.getElementById("memorize-ayahs-list");
    if (!modal) return;

    const page = pageNumber || currentPageNumber;
    const surah = getSurahForPage(page);

    if (pageRefEl) {
        pageRefEl.textContent = `سورة ${surah.name} • صفحة ${toArabicDigits(page)}`;
    }

    modal.classList.add("open");
    stopMemorizeAudio();

    if (listEl) {
        listEl.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #ffd875;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; margin-bottom: 10px;"></i>
                <div>جاري جلب آيات الصفحة وتجهيز التلاوة والتكرار... 📖</div>
            </div>
        `;
    }

    try {
        currentMemorizeAyahs = await fetchPageAyahsForMemorization(page);
        renderMemorizeAyahsList(currentMemorizeAyahs);
    } catch (err) {
        if (listEl) {
            listEl.innerHTML = `
                <div style="text-align: center; padding: 25px; color: #ef4444;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 1.8rem; margin-bottom: 8px;"></i>
                    <div>تعذر تحميل بيانات الآيات، يرجى التحقق من اتصال الإنترنت.</div>
                </div>
            `;
        }
    }
}

async function fetchPageAyahsForMemorization(page) {
    const cacheKey = `ayahs_data_p${page}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch(e) {}
    }

    const res = await fetchQuranReference(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`);
    if (!res.ok) throw new Error("API response error");
    const json = await res.json();
    if (json && json.data && json.data.ayahs) {
        localStorage.setItem(cacheKey, JSON.stringify(json.data.ayahs));
        return json.data.ayahs;
    }
    throw new Error("No ayahs data found");
}

function renderMemorizeAyahsList(ayahs) {
    const listEl = document.getElementById("memorize-ayahs-list");
    if (!listEl) return;

    if (!ayahs || ayahs.length === 0) {
        listEl.innerHTML = `<div style="text-align: center; padding: 20px; color: #94a3b8;">لا توجد آيات متاحة في هذه الصفحة.</div>`;
        return;
    }

    listEl.innerHTML = ayahs.map((ayah, idx) => {
        const isMemorized = localStorage.getItem(`zad_memorized_${ayah.number}`) === "true";
        return `
            <div class="memorize-ayah-card" id="memorize-card-${idx}" data-index="${idx}">
                <div class="memorize-ayah-top">
                    <span class="memorize-ayah-badge">الآية ${toArabicDigits(ayah.numberInSurah)}</span>
                    <div class="memorize-ayah-actions">
                        <button type="button" class="memorize-ayah-btn btn-play-single" data-index="${idx}">
                            <i class="fa-solid fa-play"></i>
                            <span>تكرار وحفظ</span>
                        </button>
                        <button type="button" class="memorize-ayah-btn btn-memorized-toggle ${isMemorized ? 'active' : ''}" data-ayah-num="${ayah.number}">
                            <i class="${isMemorized ? 'fa-solid fa-check-double text-success' : 'fa-regular fa-circle-check'}"></i>
                            <span>${isMemorized ? 'تم الحفظ' : 'حفظ'}</span>
                        </button>
                    </div>
                </div>
                <div class="memorize-ayah-text">
                    ${ayah.text} ﴿${toArabicDigits(ayah.numberInSurah)}﴾
                </div>
            </div>
        `;
    }).join("");

    // مستمعات النقر على كروت الآيات
    const cards = listEl.querySelectorAll(".memorize-ayah-card");
    cards.forEach((card, idx) => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".btn-memorized-toggle")) return;
            selectAndPlayAyah(idx);
        });
    });

    // مستمعات زر تم الحفظ
    const memBtns = listEl.querySelectorAll(".btn-memorized-toggle");
    memBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const aNum = btn.getAttribute("data-ayah-num");
            const current = localStorage.getItem(`zad_memorized_${aNum}`) === "true";
            const newVal = !current;
            localStorage.setItem(`zad_memorized_${aNum}`, newVal ? "true" : "false");
            btn.classList.toggle("active", newVal);
            btn.innerHTML = `<i class="${newVal ? 'fa-solid fa-check-double text-success' : 'fa-regular fa-circle-check'}"></i> <span>${newVal ? 'تم الحفظ' : 'حفظ'}</span>`;
            if (typeof showToast === "function") {
                showToast(newVal ? "ما شاء الله! مبارك حفظك لهذه الآية الكريمة 🌿✓" : "تم إلغاء علامة الحفظ.");
            }
        });
    });
}

function selectAndPlayAyah(index) {
    if (index < 0 || index >= currentMemorizeAyahs.length) return;
    activeAyahIndex = index;
    currentRepeatCount = 1;
    playCurrentAyahWithRepeat();
}

function playCurrentAyahWithRepeat() {
    if (activeAyahIndex < 0 || activeAyahIndex >= currentMemorizeAyahs.length) return;
    const ayah = currentMemorizeAyahs[activeAyahIndex];
    if (!ayah) return;

    updateActiveAyahCardUI(activeAyahIndex);
    isMemorizePlaying = true;
    updateMemorizeCounterUI();

    // 1. تجربة الرابط من Islamic Network CDN
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${selectedMemorizeReciter}/${ayah.number}.mp3`;
    ayahMemorizeAudio.src = audioUrl;

    ayahMemorizeAudio.play().then(() => {
        isMemorizePlaying = true;
        updateMemorizeCounterUI();
    }).catch(err => {
        console.warn("Primary Ayah audio failed, trying fallback EveryAyah:", err);
        handleAyahAudioFallback();
    });
}

function handleAyahAudioFallback() {
    if (activeAyahIndex < 0 || activeAyahIndex >= currentMemorizeAyahs.length) return;
    const ayah = currentMemorizeAyahs[activeAyahIndex];
    if (!ayah) return;

    // حساب رقم السورة ورقم الآية بصيغة 001001
    const surahId = (ayah.surah && ayah.surah.number) ? ayah.surah.number : getSurahForPage(currentPageNumber).id;
    const paddedSurah = String(surahId).padStart(3, "0");
    const paddedAyah = String(ayah.numberInSurah).padStart(3, "0");

    let reciterFolder = "Alafasy_128kbps";
    if (selectedMemorizeReciter.includes("husary")) reciterFolder = "Husary_128kbps";
    else if (selectedMemorizeReciter.includes("minshawi")) reciterFolder = "Minshawy_Murattal_128kbps";
    else if (selectedMemorizeReciter.includes("abdulbasit")) reciterFolder = "Abdul_Basit_Murattal_192kbps";

    const fallbackUrl = `https://everyayah.com/data/${reciterFolder}/${paddedSurah}${paddedAyah}.mp3`;
    ayahMemorizeAudio.src = fallbackUrl;
    ayahMemorizeAudio.play().catch(e => {
        console.error("All ayah audio sources failed:", e);
        if (typeof showToast === "function") showToast("تعذر تحميل تلاوة هذه الآية، يرجى التأكد من الاتصال بالإنترنت.");
    });
}

function handleAyahRepetitionEnded() {
    if (!isMemorizePlaying || activeAyahIndex < 0) return;

    if (currentRepeatCount < currentRepeatTarget) {
        currentRepeatCount++;
        updateMemorizeCounterUI();
        if (ayahMemorizeAudio) {
            ayahMemorizeAudio.currentTime = 0;
            ayahMemorizeAudio.play().catch(() => {});
        }
    } else {
        // انتهت تكرارات الآية الحالية
        const autoNext = document.getElementById("memorize-auto-next")?.checked;
        if (autoNext && activeAyahIndex < currentMemorizeAyahs.length - 1) {
            // الانتقال للآية التالية
            activeAyahIndex++;
            currentRepeatCount = 1;
            playCurrentAyahWithRepeat();
        } else {
            // التوقف
            stopMemorizeAudio();
            if (typeof showToast === "function") {
                showToast("أحسنت! اكتمل تكرار الآية بنجاح، ثبّت الله القرآن في صدرك 🌿✨");
            }
        }
    }
}

function updateActiveAyahCardUI(activeIndex) {
    const cards = document.querySelectorAll(".memorize-ayah-card");
    cards.forEach((card, idx) => {
        const isCurrent = idx === activeIndex;
        card.classList.toggle("is-active", isCurrent);
        const playBtn = card.querySelector(".btn-play-single");
        if (playBtn) {
            playBtn.innerHTML = isCurrent
                ? `<i class="fa-solid fa-volume-high"></i> <span>جاري التكرار</span>`
                : `<i class="fa-solid fa-play"></i> <span>تكرار وحفظ</span>`;
        }
    });

    if (activeIndex >= 0) {
        const activeCard = document.getElementById(`memorize-card-${activeIndex}`);
        if (activeCard) {
            activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }
}

