/**
 * مصحف الصدقة الجارية - المصحف الشريف الحقيقي (طبعة مجمع الملك فهد بالمدينة المنورة)
 * صفحات مصحف المدينة المنورة الحقيقية برواية حفص عن عاصم (604 صفحات بدقة فيكتور فائقة)
 */

// خريطة سور القرآن الكريم والصفحة الأولى لكل سورة
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

// السور الفاضلة السريعة
const MUSHAF_QUICK_JUMPS = [
    { name: "سورة الملك", page: 562, surahId: 67 },
    { name: "سورة يس", page: 440, surahId: 36 },
    { name: "سورة الفاتحة", page: 1, surahId: 1 },
    { name: "سورة الواقعة", page: 534, surahId: 56 },
    { name: "سورة الرحمن", page: 531, surahId: 55 },
    { name: "سورة الكهف", page: 293, surahId: 18 },
    { name: "الإخلاص والمعوذات", page: 604, surahId: 112 }
];

// قائمة كبار قراء القرآن الكريم المعتمدة
const MUSHAF_RECITERS = [
    { id: "afs", name: "مشاري راشد العفاسي", server: "https://server8.mp3quran.net/afs/" },
    { id: "husr_moalim", name: "محمود خليل الحصري (المصحف المعلم)", server: "https://server13.mp3quran.net/husr_moalim/" },
    { id: "husr", name: "محمود خليل الحصري (مرتل)", server: "https://server13.mp3quran.net/husr/" },
    { id: "minsh", name: "محمد صديق المنشاوي (مرتل)", server: "https://server10.mp3quran.net/minsh/" },
    { id: "minsh_mjwd", name: "محمد صديق المنشاوي (مجود)", server: "https://server10.mp3quran.net/minsh_mjwd/" },
    { id: "basit", name: "عبد الباسط عبد الصمد (مرتل)", server: "https://server7.mp3quran.net/basit/" },
    { id: "basit_mjwd", name: "عبد الباسط عبد الصمد (مجود)", server: "https://server7.mp3quran.net/basit_mjwd/" },
    { id: "maher", name: "ماهر المعيقلي", server: "https://server12.mp3quran.net/maher/" },
    { id: "yasser", name: "ياسر الدوسري", server: "https://server11.mp3quran.net/yasser/" },
    { id: "s_gmd", name: "سعد الغامدي", server: "https://server7.mp3quran.net/s_gmd/" },
    { id: "qtm", name: "ناصر القطامي", server: "https://server6.mp3quran.net/qtm/" },
    { id: "shatri", name: "أبو بكر الشاطري", server: "https://server11.mp3quran.net/shatri/" },
    { id: "a_jbr", name: "علي عبد الله جابر", server: "https://server11.mp3quran.net/a_jbr/" },
    { id: "sds", name: "عبد الرحمن السديس", server: "https://server11.mp3quran.net/sds/" },
    { id: "shur", name: "سعود الشريم", server: "https://server7.mp3quran.net/shur/" }
];

// المتغيرات العامة
let currentPageNumber = 562; // البداية الافتراضية مع سورة الملك
const TOTAL_MUSHAF_PAGES = 604;
let mushafAudio = new Audio();
let isAudioPlaying = false;
let currentReciterKey = localStorage.getItem("mushaf_selected_reciter") || "afs";

document.addEventListener("DOMContentLoaded", () => {
    initRealMushaf();
});

function initRealMushaf() {
    renderQuickJumpButtons();
    populateSurahsDropdown();
    populateRecitersDropdown();
    setupMushafNavigation();
    initReadingTrackerButton();
    initTafsirModal();
    initMushafComfortTools();
    initQuranSearchEngine();
    initMushafOfflineManager();
    initMushafTouchGestures();
    initMushafFullscreen();
    initQuranHifzEngine();
    initAyahSyncPlayer();
    restoreMushafPreferences();
    
    // استعادة آخر صفحة تمت قراءتها إذا وجدت
    const savedLast = localStorage.getItem("mushaf_last_page");
    if (savedLast) {
        const p = parseInt(savedLast, 10);
        if (!isNaN(p) && p >= 1 && p <= TOTAL_MUSHAF_PAGES) {
            currentPageNumber = p;
        }
    }

    // تحميل الصفحة
    goToMushafPage(currentPageNumber);
}

function renderQuickJumpButtons() {
    const container = document.getElementById("featured-surahs-pills");
    if (!container) return;

    container.innerHTML = "";
    MUSHAF_QUICK_JUMPS.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "surah-pill";
        btn.setAttribute("data-page", item.page);
        btn.innerHTML = `<i class="fa-solid fa-book-quran"></i> <span>${item.name}</span>`;
        btn.onclick = () => {
            goToMushafPage(item.page, item.surahId);
        };
        container.appendChild(btn);
    });
}

function populateSurahsDropdown() {
    const select = document.getElementById("select-all-surahs");
    if (!select) return;

    select.innerHTML = '<option value="">📖 تصفح فهرس المصحف الشريف (114 سورة - 604 صفحات)...</option>';
    SURAHS_INDEX.forEach((surah) => {
        const option = document.createElement("option");
        option.value = surah.page;
        option.setAttribute("data-surah-id", surah.id);
        option.textContent = `${surah.id}. سورة ${surah.name} (صفحة ${surah.page}) - ${surah.type} (${surah.ayahs} آية)`;
        select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
        const page = parseInt(e.target.value, 10);
        if (page) {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const surahId = selectedOption ? parseInt(selectedOption.getAttribute("data-surah-id"), 10) : null;
            goToMushafPage(page, surahId);
        }
    });
}

function populateRecitersDropdown() {
    const select = document.getElementById("select-mushaf-reciter");
    if (!select) return;

    select.innerHTML = "";
    MUSHAF_RECITERS.forEach((r) => {
        const opt = document.createElement("option");
        opt.value = r.id;
        opt.textContent = `🎙️ ${r.name}`;
        if (r.id === currentReciterKey) opt.selected = true;
        select.appendChild(opt);
    });

    select.addEventListener("change", (e) => {
        currentReciterKey = e.target.value;
        localStorage.setItem("mushaf_selected_reciter", currentReciterKey);
        
        // تحديث رابط التلاوة الحالية
        const currentSurah = findSurahForPage(currentPageNumber);
        const surahId = currentSurah ? currentSurah.id : 67;
        const reciter = MUSHAF_RECITERS.find(r => r.id === currentReciterKey) || MUSHAF_RECITERS[0];
        const paddedSurah = String(surahId).padStart(3, "0");
        mushafAudio.src = `${reciter.server}${paddedSurah}.mp3`;
        
        if (isAudioPlaying) {
            mushafAudio.play();
        }

        if (typeof showToast === "function") {
            showToast(`تم اختيار القارئ: ${reciter.name} 🎙️✨`);
        }
    });
}

function setupMushafNavigation() {
    // أزرار التنقل بين الصفحات
    const btnNext = document.getElementById("btn-mushaf-next");
    const btnPrev = document.getElementById("btn-mushaf-prev");
    const pageInput = document.getElementById("mushaf-page-input");
    const btnAudio = document.getElementById("btn-surah-audio");
    const btnGift = document.getElementById("btn-gift-quran-reward");

    // في المصحف العربي: التالي يتقدم بالصفحة (أو لليسار في اتجاه القراءة)
    if (btnNext) {
        btnNext.addEventListener("click", () => {
            if (currentPageNumber < TOTAL_MUSHAF_PAGES) {
                goToMushafPage(currentPageNumber + 1);
            } else {
                showToast("أنت الآن في الصفحة الأخيرة من المصحف الشريف 🌿");
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            if (currentPageNumber > 1) {
                goToMushafPage(currentPageNumber - 1);
            } else {
                showToast("أنت الآن في أول صفحة من المصحف الشريف (سورة الفاتحة) 🌿");
            }
        });
    }

    // إدخال رقم الصفحة يدوياً
    if (pageInput) {
        pageInput.addEventListener("change", (e) => {
            let val = parseInt(e.target.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            if (val > TOTAL_MUSHAF_PAGES) val = TOTAL_MUSHAF_PAGES;
            goToMushafPage(val);
        });
    }

    // تشغيل تلاوة السورة
    if (btnAudio) {
        btnAudio.addEventListener("click", toggleAudioRecitation);
    }

    // زر إهداء الثواب لروح الجد
    if (btnGift) {
        btnGift.addEventListener("click", handleGiftReward);
    }

    // دعم مفاتيح الأسهم للتنقل السريع
    document.addEventListener("keydown", (e) => {
        // إذا كان المستخدم لا يكتب في حقل نصي
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
            if (e.key === "ArrowLeft") {
                if (currentPageNumber < TOTAL_MUSHAF_PAGES) goToMushafPage(currentPageNumber + 1);
            } else if (e.key === "ArrowRight") {
                if (currentPageNumber > 1) goToMushafPage(currentPageNumber - 1);
            }
        }
    });
}

// الانتقال لصفحة المصحف المحددة مع نظام التبديل الذكي بين السيرفرات والتخزين المحلي
function goToMushafPage(pageNumber, surahId = null) {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > TOTAL_MUSHAF_PAGES) pageNumber = TOTAL_MUSHAF_PAGES;

    currentPageNumber = pageNumber;

    // معرفة السورة الحالية المتواجدة في هذه الصفحة
    const currentSurah = findSurahForPage(pageNumber);
    const targetSurahId = surahId || (currentSurah ? currentSurah.id : 67);

    // روابط السيرفرات البديلة لضمان العمل الدائم
    const pagePadded = String(pageNumber).padStart(3, "0");
    const primaryUrl = `https://cdn.quran.ws/svg/pages/v1.1.1/hafs-kfqc/${pagePadded}.svg`;
    const fallbackPngUrl = `https://quran.ksu.edu.sa/ayat/safahat1/${pageNumber}.png`;
    const fallbackCdnUrl = `https://raw.githubusercontent.com/quran/quran.com-images/master/width_1024/page${pagePadded}.png`;

    // تحديث العناصر في الواجهة
    const imgEl = document.getElementById("mushaf-real-page-img");
    const loaderEl = document.getElementById("mushaf-page-loader");
    const inputEl = document.getElementById("mushaf-page-input");
    const titleEl = document.getElementById("quran-surah-title");
    const countEl = document.getElementById("quran-verses-count");
    const selectEl = document.getElementById("select-all-surahs");

    if (inputEl) inputEl.value = pageNumber;

    if (titleEl && currentSurah) {
        titleEl.textContent = `سُورَةُ ${currentSurah.name}`;
    }

    if (countEl && currentSurah) {
        // حساب رقم الجزء تقريبياً
        const juzNumber = Math.ceil(pageNumber / 20.13);
        countEl.textContent = `الجزء ${juzNumber} • صفحة ${pageNumber} من ${TOTAL_MUSHAF_PAGES}`;
    }

    // تحديث شريط متابع القراءة والختمة
    updateReadingTrackerUI(pageNumber, currentSurah);
    localStorage.setItem("mushaf_last_page", String(pageNumber));

    // تسجيل تقدم القراءة في حديقة الحسنات
    const todayKey = `quran_pages_read_${new Date().toISOString().slice(0, 10)}`;
    const visitedKey = `quran_p_${pageNumber}_${new Date().toISOString().slice(0, 10)}`;
    if (!sessionStorage.getItem(visitedKey)) {
        sessionStorage.setItem(visitedKey, "1");
        const currentCount = parseInt(localStorage.getItem(todayKey) || "0", 10) + 1;
        localStorage.setItem(todayKey, String(currentCount));
        const todayPagesEl = document.getElementById("tracker-today-pages-count");
        if (todayPagesEl) todayPagesEl.textContent = currentCount;
        if (typeof window.addSpiritualGardenDeed === "function") {
            window.addSpiritualGardenDeed("quran", 5);
        }
    }

    // إظهار اللودر ريثما تنتهي الصورة من التحميل
    if (loaderEl) loaderEl.style.display = "flex";
    if (imgEl) {
        imgEl.style.opacity = "0.2";
        let attempt = 0;

        const tryLoadImage = (url) => {
            imgEl.src = url;
        };

        imgEl.onload = () => {
            imgEl.style.opacity = "1";
            if (loaderEl) loaderEl.style.display = "none";
        };

        imgEl.onerror = () => {
            attempt++;
            if (attempt === 1) {
                tryLoadImage(fallbackPngUrl);
            } else if (attempt === 2) {
                tryLoadImage(fallbackCdnUrl);
            } else {
                if (loaderEl) loaderEl.style.display = "none";
                imgEl.style.opacity = "1";
            }
        };

        tryLoadImage(primaryUrl);
    }

    // التحميل المسبق التنبؤي للصفحات المجاورة في الخلفية (Predictive Pre-caching)
    prefetchAdjacentPages(pageNumber);

    // ضبط رابط التلاوة الصوتية بحسب القارئ المفضل
    const reciterObj = MUSHAF_RECITERS.find(r => r.id === currentReciterKey) || MUSHAF_RECITERS[0];
    const paddedSurah = String(targetSurahId).padStart(3, "0");
    mushafAudio.src = `${reciterObj.server}${paddedSurah}.mp3`;
    if (isAudioPlaying) {
        mushafAudio.play().catch(() => {});
    }

    // تحديث زر السورة في الشريط
    document.querySelectorAll(".surah-pill").forEach(btn => {
        const p = parseInt(btn.getAttribute("data-page"), 10);
        if (p === pageNumber) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // تحديث القائمة المنسدلة
    if (selectEl && currentSurah) {
        selectEl.value = currentSurah.page;
    }

    // جلب وتجهيز الآيات التزامنية للصفحة الحالية
    if (typeof loadAyahsForCurrentMushafPage === "function") {
        loadAyahsForCurrentMushafPage(pageNumber);
    }
}

// استخراج السورة بناءً على رقم الصفحة
function findSurahForPage(pageNumber) {
    for (let i = SURAHS_INDEX.length - 1; i >= 0; i--) {
        if (pageNumber >= SURAHS_INDEX[i].page) {
            return SURAHS_INDEX[i];
        }
    }
    return SURAHS_INDEX[0];
}

// التحكم في الصوت
function toggleAudioRecitation() {
    const btn = document.getElementById("btn-surah-audio");
    if (!btn) return;

    if (isAudioPlaying) {
        mushafAudio.pause();
        isAudioPlaying = false;
        btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span class="btn-audio-text">استماع السورة</span>';
        btn.classList.remove("active");
    } else {
        mushafAudio.play().then(() => {
            isAudioPlaying = true;
            btn.innerHTML = '<i class="fa-solid fa-pause"></i> <span class="btn-audio-text">إيقاف التلاوة</span>';
            btn.classList.add("active");
        }).catch(() => {
            showToast("يرجى النقر أولاً في الصفحة لتفعيل الصوت");
        });
    }
}

// إهداء ثواب القراءة (صدقة جارية)
function handleGiftReward() {
    playCompletionChime();
    showToast("تقبل الله تلاوتكم، وجعل ثوابها نوراً وبركة وأجراً مضاعفاً في ميزان حسناتكم ولموتى المسلمين 🌿🤲");

    const btn = document.getElementById("btn-gift-quran-reward");
    if (btn) {
        btn.classList.add("gifted");
        btn.innerHTML = '<i class="fa-solid fa-check-double"></i> <span>تم إهداء الثواب بحمد الله</span>';
        setTimeout(() => {
            btn.classList.remove("gifted");
            btn.innerHTML = '<i class="fa-solid fa-gift"></i> <span>أهديت ثواب هذه القراءة (صدقة جارية)</span>';
        }, 5000);
    }
}

// إتاحة التنقل لصفحة المصحف من خارج الملف (لقسم الختمة القرآنية)
window.goToQuranPage = function(pageNumber) {
    if (typeof goToMushafPage === "function") {
        goToMushafPage(pageNumber);
    }
};

/* ==========================================================================
   نافذة التفسير الميسر لصفحة المصحف الشريف
   ========================================================================== */
let currentTafsirFontSize = 1.1;

function initTafsirModal() {
    const modal = document.getElementById("tafsir-modal");
    const btnOpen = document.getElementById("btn-page-tafsir");
    const btnClose = document.getElementById("btn-close-tafsir-modal");
    const btnZoomIn = document.getElementById("btn-zoom-in");
    const btnZoomOut = document.getElementById("btn-zoom-out");
    const contentBox = document.getElementById("tafsir-content-box");

    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
            openTafsirModal();
        });
    }

    if (btnClose && modal) {
        btnClose.addEventListener("click", () => modal.classList.remove("open"));
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("open");
        });
    }

    if (btnZoomIn && contentBox) {
        btnZoomIn.addEventListener("click", () => {
            if (currentTafsirFontSize < 1.6) {
                currentTafsirFontSize += 0.1;
                contentBox.style.fontSize = `${currentTafsirFontSize}rem`;
            }
        });
    }

    if (btnZoomOut && contentBox) {
        btnZoomOut.addEventListener("click", () => {
            if (currentTafsirFontSize > 0.85) {
                currentTafsirFontSize -= 0.1;
                contentBox.style.fontSize = `${currentTafsirFontSize}rem`;
            }
        });
    }
}

function openTafsirModal() {
    const modal = document.getElementById("tafsir-modal");
    const titleEl = document.getElementById("tafsir-modal-title");
    const pageBadge = document.getElementById("tafsir-page-badge");
    const contentBox = document.getElementById("tafsir-content-box");

    if (!modal || !contentBox) return;

    modal.classList.add("open");
    if (pageBadge) pageBadge.textContent = `صفحة ${currentPageNumber}`;
    if (titleEl) {
        const surahInfo = findSurahForPage(currentPageNumber);
        titleEl.textContent = `التفسير الميسر - ${surahInfo ? 'سورة ' + surahInfo.name : ''}`;
    }

    loadTafsirForPage(currentPageNumber);
}

function loadTafsirForPage(pageNum) {
    const contentBox = document.getElementById("tafsir-content-box");
    if (!contentBox) return;

    const cacheKey = `tafsir_cache_p${pageNum}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const data = JSON.parse(cached);
            renderTafsirData(data);
            return;
        } catch(e) {}
    }

    contentBox.innerHTML = `
        <div class="tafsir-loader">
            <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
            <span>جاري جلب التفسير الميسر لصفحة ${pageNum}...</span>
        </div>
    `;

    fetch(`https://api.alquran.cloud/v1/page/${pageNum}/ar.muyassar`)
        .then(res => res.json())
        .then(result => {
            if (result && result.code === 200 && result.data && result.data.ayahs) {
                localStorage.setItem(cacheKey, JSON.stringify(result.data.ayahs));
                renderTafsirData(result.data.ayahs);
            } else {
                contentBox.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--gold-300);">
                        <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
                        <p style="margin-top: 1rem;">تعذر جلب التفسير حالياً، يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.</p>
                    </div>
                `;
            }
        })
        .catch(() => {
            contentBox.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gold-300);">
                    <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
                    <p style="margin-top: 1rem;">تعذر جلب التفسير حالياً، يرجى المحاولة لاحقاً.</p>
                </div>
            `;
        });
}

function renderTafsirData(ayahs) {
    const contentBox = document.getElementById("tafsir-content-box");
    if (!contentBox) return;

    if (!ayahs || ayahs.length === 0) {
        contentBox.innerHTML = "<p>لا يوجد تفسير متاح لهذه الصفحة.</p>";
        return;
    }

    contentBox.innerHTML = "";
    ayahs.forEach(item => {
        const div = document.createElement("div");
        div.className = "tafsir-ayah-item";
        div.innerHTML = `
            <div class="tafsir-ayah-header">
                <span class="ayah-badge">الآية ${item.numberInSurah}</span>
                <span class="ayah-quran-text">${item.surah ? 'سورة ' + item.surah.name : ''}</span>
            </div>
            <div class="ayah-tafsir-text">${item.text}</div>
        `;
        contentBox.appendChild(div);
    });
}

/* ==========================================================================
   أدوات راحة القراءة وتخصيص المصحف (Reading Comfort, Zoom, Sepia & Bookmark)
   ========================================================================== */
let mushafZoomLevel = 1.0;

function initMushafComfortTools() {
    const btnZoomIn = document.getElementById("btn-mushaf-zoom-in");
    const btnZoomOut = document.getElementById("btn-mushaf-zoom-out");
    const btnTheme = document.getElementById("btn-mushaf-theme");
    const btnBookmark = document.getElementById("btn-mushaf-bookmark");
    const btnGotoBookmark = document.getElementById("btn-mushaf-goto-bookmark");
    const mushafCard = document.querySelector(".real-mushaf-card");
    const pageImg = document.getElementById("mushaf-real-page-img");

    // 1. تكبير صفحة المصحف
    if (btnZoomIn) {
        btnZoomIn.addEventListener("click", () => {
            if (mushafZoomLevel < 1.6) {
                mushafZoomLevel = Math.min(1.6, +(mushafZoomLevel + 0.15).toFixed(2));
                applyMushafZoom();
                if (typeof showToast === "function") {
                    showToast(`تم تكبير صفحة المصحف (${Math.round(mushafZoomLevel * 100)}%) 🔍`);
                }
            }
        });
    }

    // 2. تصغير صفحة المصحف
    if (btnZoomOut) {
        btnZoomOut.addEventListener("click", () => {
            if (mushafZoomLevel > 0.8) {
                mushafZoomLevel = Math.max(0.8, +(mushafZoomLevel - 0.15).toFixed(2));
                applyMushafZoom();
                if (typeof showToast === "function") {
                    showToast(`تم تصغير صفحة المصحف (${Math.round(mushafZoomLevel * 100)}%) 🔍`);
                }
            }
        });
    }

    // 3. نمط القراءة الورقي الدافئ (Sepia Theme)
    if (btnTheme && mushafCard) {
        btnTheme.addEventListener("click", () => {
            const isSepia = mushafCard.classList.toggle("theme-sepia");
            localStorage.setItem("mushaf_theme_sepia", isSepia ? "1" : "0");
            btnTheme.classList.toggle("active", isSepia);
            
            const label = btnTheme.querySelector("span");
            if (label) {
                label.textContent = isSepia ? "الوضع الليلي" : "الوضع المريح";
            }
            
            if (typeof showToast === "function") {
                showToast(isSepia ? "تم تفعيل وضع القراءة الورقي المريح للعين 📜" : "تم الرجوع للوضع الليلي الملكي 🌙");
            }
        });
    }

    // 4. حفظ علامة القراءة (Bookmark)
    if (btnBookmark) {
        btnBookmark.addEventListener("click", () => {
            localStorage.setItem("mushaf_saved_bookmark", String(currentPageNumber));
            updateBookmarkButtonUI(currentPageNumber);
            if (typeof playCompletionChime === "function") playCompletionChime();
            if (typeof showToast === "function") {
                showToast(`تم حفظ صفحة ${currentPageNumber} في علامتك المرجعية بنجاح 🔖`);
            }
        });
    }

    // 5. الانتقال إلى العلامة المحفوظة
    if (btnGotoBookmark) {
        btnGotoBookmark.addEventListener("click", () => {
            const saved = localStorage.getItem("mushaf_saved_bookmark");
            if (saved) {
                const page = parseInt(saved, 10);
                if (!isNaN(page) && page >= 1 && page <= TOTAL_MUSHAF_PAGES) {
                    goToMushafPage(page);
                    if (typeof showToast === "function") {
                        showToast(`تم الانتقال إلى علامتك المحفوظة (صفحة ${page}) 📖`);
                    }
                }
            }
        });
    }

    // 6. زر إظهار/إخفاء درج خيارات وأدوات القراءة
    const btnToolsToggle = document.getElementById("btn-mushaf-tools-toggle");
    const drawerTools = document.getElementById("mushaf-drawer-tools");
    if (btnToolsToggle && drawerTools) {
        btnToolsToggle.addEventListener("click", () => {
            const isHidden = drawerTools.style.display === "none";
            if (isHidden) {
                drawerTools.style.display = "block";
                btnToolsToggle.classList.add("active");
                drawerTools.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } else {
                drawerTools.style.display = "none";
                btnToolsToggle.classList.remove("active");
            }
        });
    }
}

function toggleMushafZenMode() {
    const card = document.querySelector(".real-mushaf-card");
    if (!card) return;
    const isZen = card.classList.toggle("zen-reading-mode");
    if (typeof showToast === "function") {
        showToast(isZen ? "وضع القراءة الهادئ • انقر بوسط الصفحة للرجوع 🌿" : "تم إظهار أدوات المصحف الشريف 📖");
    }
}

function applyMushafZoom() {
    const pageImg = document.getElementById("mushaf-real-page-img");
    if (pageImg) {
        pageImg.style.transform = `scale(${mushafZoomLevel})`;
        pageImg.style.transformOrigin = "top center";
        pageImg.style.transition = "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
    }
}

function restoreMushafPreferences() {
    // استعادة وضع Sepia المحفوظ
    const savedSepia = localStorage.getItem("mushaf_theme_sepia");
    const mushafCard = document.querySelector(".real-mushaf-card");
    const btnTheme = document.getElementById("btn-mushaf-theme");
    if (savedSepia === "1" && mushafCard) {
        mushafCard.classList.add("theme-sepia");
        if (btnTheme) {
            btnTheme.classList.add("active");
            const label = btnTheme.querySelector("span");
            if (label) label.textContent = "الوضع الليلي";
        }
    }

    // استعادة العلامة المحفوظة
    const savedBookmark = localStorage.getItem("mushaf_saved_bookmark");
    if (savedBookmark) {
        const page = parseInt(savedBookmark, 10);
        if (!isNaN(page)) {
            updateBookmarkButtonUI(page);
        }
    }
}

function updateBookmarkButtonUI(pageNumber) {
    const btnGotoBookmark = document.getElementById("btn-mushaf-goto-bookmark");
    const labelText = document.getElementById("bookmark-label-text");
    if (btnGotoBookmark) {
        btnGotoBookmark.style.display = "inline-flex";
        if (labelText) {
            labelText.textContent = `العلامة (ص ${pageNumber})`;
        }
    }
}

function updateReadingTrackerUI(pageNumber, currentSurah) {
    const trackerText = document.getElementById("tracker-bookmark-text");
    const khatmaPercent = document.getElementById("tracker-khatma-percent");
    const currentPageEl = document.getElementById("tracker-current-page-num");
    const progressFill = document.getElementById("tracker-progress-fill");
    const todayPagesEl = document.getElementById("tracker-today-pages-count");

    const pct = Math.min(100, Math.max(1, Math.round((pageNumber / TOTAL_MUSHAF_PAGES) * 100)));
    
    if (khatmaPercent) khatmaPercent.textContent = `${pct}%`;
    if (currentPageEl) currentPageEl.textContent = pageNumber;
    if (progressFill) progressFill.style.width = `${pct}%`;

    // استعادة العلامة المرجعية أو آخر صفحة
    const savedBookmark = localStorage.getItem("mushaf_saved_bookmark");
    if (trackerText) {
        if (savedBookmark) {
            const bPage = parseInt(savedBookmark, 10);
            const bSurah = findSurahForPage(bPage);
            trackerText.textContent = `سورة ${bSurah ? bSurah.name : ''} • صفحة ${bPage}`;
        } else if (currentSurah) {
            trackerText.textContent = `سورة ${currentSurah.name} • صفحة ${pageNumber}`;
        }
    }

    // تتبع عدد صفحات اليوم
    const todayKey = `quran_pages_read_${new Date().toISOString().slice(0, 10)}`;
    const todayCount = parseInt(localStorage.getItem(todayKey) || "0", 10);
    if (todayPagesEl) todayPagesEl.textContent = todayCount;
}

function initReadingTrackerButton() {
    const btnResume = document.getElementById("btn-tracker-resume-reading");
    if (btnResume) {
        btnResume.addEventListener("click", () => {
            const savedBookmark = localStorage.getItem("mushaf_saved_bookmark") || localStorage.getItem("mushaf_last_page");
            const page = savedBookmark ? parseInt(savedBookmark, 10) : 562;
            goToMushafPage(page);
            const mushafCard = document.querySelector(".real-mushaf-card");
            if (mushafCard) {
                mushafCard.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            if (typeof showToast === "function") {
                showToast(`تم الانتقال لعلامتك المرجعية (صفحة ${page}) 📖✨`);
            }
        });
    }
}

/* ==========================================================================
   محرك البحث الفوري في القرآن الكريم (Quran Search Engine)
   ========================================================================== */
function initQuranSearchEngine() {
    const modal = document.getElementById("quran-search-modal");
    const btnOpen = document.getElementById("btn-open-quran-search");
    const btnClose = document.getElementById("btn-close-quran-search-modal");
    const input = document.getElementById("quran-search-input");
    const btnSubmit = document.getElementById("btn-submit-quran-search");

    if (btnOpen && modal) {
        btnOpen.addEventListener("click", () => {
            modal.classList.add("open");
            setTimeout(() => {
                if (input) input.focus();
            }, 100);
        });
    }

    if (btnClose && modal) {
        btnClose.addEventListener("click", () => {
            modal.classList.remove("open");
        });
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("open");
        });
    }

    if (btnSubmit) {
        btnSubmit.addEventListener("click", () => {
            if (input) handleQuranSearch(input.value.trim());
        });
    }

    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleQuranSearch(input.value.trim());
            }
        });
    }
}

// تنظيف وتوحيد الحروف العربية للبحث الدقيق
function normalizeArabicText(str) {
    if (!str) return "";
    return str
        .replace(/[\u064B-\u065F\u0670]/g, "") // إزالة حركات التشكيل والتنوين
        .replace(/[إأآا]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/[ـ]/g, "") // إزالة التطويل (الكشيدة)
        .trim();
}

function handleQuranSearch(query) {
    const resultsContainer = document.getElementById("quran-search-results");
    const statusEl = document.getElementById("quran-search-status");

    if (!query || query.length < 2) {
        if (statusEl) statusEl.innerHTML = '<span style="color: var(--gold-400);">يرجى كتابة كلمة من حرفين أو أكثر للبحث في القرآن الكريم 🔍</span>';
        return;
    }

    if (statusEl) {
        statusEl.innerHTML = `<span>جاري البحث عن "<strong>${escapeHtml(query)}</strong>" في المصحف الشريف... <i class="fa-solid fa-spinner fa-spin"></i></span>`;
    }

    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2.5rem; color: var(--gold-300);">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p style="margin-top: 0.8rem; font-size: 0.95rem;">جاري البحث في آيات الذكر الحكيم...</p>
            </div>
        `;
    }

    const cleanQuery = normalizeArabicText(query);
    const cacheKey = `q_search_${cleanQuery}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
        try {
            const data = JSON.parse(cached);
            renderQuranSearchResults(data, query);
            return;
        } catch(e) {}
    }

    // استعلام محرك البحث عبر واجهة AlQuran Cloud
    fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanQuery)}/all/ar.muyassar`)
        .then(res => res.json())
        .then(res => {
            if (res && res.code === 200 && res.data && res.data.matches && res.data.matches.length > 0) {
                sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
                renderQuranSearchResults(res.data, query);
            } else {
                // محاولة بحث احتياطية بنص بسيط
                fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/quran-simple-clean`)
                    .then(r => r.json())
                    .then(fallbackRes => {
                        if (fallbackRes && fallbackRes.code === 200 && fallbackRes.data && fallbackRes.data.matches && fallbackRes.data.matches.length > 0) {
                            sessionStorage.setItem(cacheKey, JSON.stringify(fallbackRes.data));
                            renderQuranSearchResults(fallbackRes.data, query);
                        } else {
                            renderEmptySearchResults(query);
                        }
                    })
                    .catch(() => renderEmptySearchResults(query));
            }
        })
        .catch(() => {
            renderEmptySearchResults(query);
        });
}

function renderQuranSearchResults(data, rawQuery) {
    const resultsContainer = document.getElementById("quran-search-results");
    const statusEl = document.getElementById("quran-search-status");
    if (!resultsContainer) return;

    const matches = data.matches || [];
    const count = data.count || matches.length;

    if (statusEl) {
        statusEl.innerHTML = `<span>تم العثور على <strong>${count}</strong> ${count === 1 ? 'آية كريمة' : 'آيات كريمة'} مطابقة لكلمة "<strong>${escapeHtml(rawQuery)}</strong>":</span>`;
    }

    resultsContainer.innerHTML = "";
    const cleanTokens = normalizeArabicText(rawQuery).split(/\s+/).filter(Boolean);

    matches.slice(0, 50).forEach(match => {
        const surah = match.surah || {};
        const surahName = surah.name ? surah.name.replace(/^سُورَةُ\s+/, "") : "";
        const ayahNum = match.numberInSurah || 1;
        const pageNum = match.page || calculateEstimatedPage(surah.number, ayahNum);

        const card = document.createElement("div");
        card.className = "quran-search-item";
        card.setAttribute("title", "اضغط للانتقال الفوري إلى صفحة الآية في المصحف");

        // تمييز الكلمة المبحوث عنها
        let displayText = match.text || "";
        cleanTokens.forEach(token => {
            if (token.length >= 2) {
                const regex = new RegExp(`(${escapeRegex(token)})`, "gi");
                displayText = displayText.replace(regex, "<mark>$1</mark>");
            }
        });

        card.innerHTML = `
            <div class="quran-match-header">
                <span class="quran-match-surah"><i class="fa-solid fa-quran text-gold"></i> سورة ${surahName} (آية ${ayahNum})</span>
                <span class="quran-match-page-badge"><i class="fa-solid fa-file-lines"></i> صفحة ${pageNum}</span>
            </div>
            <div class="quran-match-text">" ${displayText} "</div>
        `;

        card.addEventListener("click", () => {
            const modal = document.getElementById("quran-search-modal");
            if (modal) modal.classList.remove("open");

            goToMushafPage(pageNum, surah.number);

            // تمرير سلس لقسم المصحف
            const quranSec = document.getElementById("quran-khatma");
            if (quranSec) {
                quranSec.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            if (typeof showToast === "function") {
                showToast(`تم الانتقال لصفحة ${pageNum} (سورة ${surahName} - آية ${ayahNum}) 📖`);
            }
        });

        resultsContainer.appendChild(card);
    });
}

function renderEmptySearchResults(query) {
    const resultsContainer = document.getElementById("quran-search-results");
    const statusEl = document.getElementById("quran-search-status");

    if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--gold-400);">لم يتم العثور على نتائج لكلمة "<strong>${escapeHtml(query)}</strong>"</span>`;
    }

    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
                <i class="fa-solid fa-magnifying-glass fa-2x text-gold" style="margin-bottom: 0.8rem; opacity: 0.7;"></i>
                <p style="margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 600;">لا توجد آيات مطابقة للبحث</p>
                <p style="font-size: 0.85rem;">تأكد من كتابة الكلمة بصورة صحيحة (مثال: الصابرين، الرحمن، الجنة، النور)</p>
            </div>
        `;
    }
}

function calculateEstimatedPage(surahNumber, ayahNumber) {
    if (!surahNumber) return 1;
    const surahData = SURAHS_INDEX.find(s => s.id === surahNumber);
    if (!surahData) return 1;

    // تقدير الصفحة بناءً على رقم الآية
    const nextSurah = SURAHS_INDEX.find(s => s.id === surahNumber + 1);
    const endPage = nextSurah ? nextSurah.page : 604;
    const totalPagesInSurah = Math.max(1, endPage - surahData.page);
    const progress = Math.min(1, Math.max(0, (ayahNumber - 1) / (surahData.ayahs || 1)));
    const estimated = Math.round(surahData.page + progress * (totalPagesInSurah - 1));
    return Math.min(604, Math.max(1, estimated));
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ==========================================================================
   نظام التخزين والتصفح بدون إنترنت 100% (Offline Quran Engine & Pre-caching)
   ========================================================================== */
const QURAN_CACHE_STORE_NAME = "sadqah-quran-cache-v1";
let isOfflineDownloadRunning = false;
let isOfflineDownloadCancelled = false;

// 1. التحميل المسبق التنبؤي للصفحات المجاورة (Predictive Pre-caching)
function prefetchAdjacentPages(currentPage) {
    if (!('caches' in window)) return;

    // الصفحات الأقرب للتصفح: 3 للأمام وصفحتين للخلف
    const targets = [
        currentPage + 1,
        currentPage + 2,
        currentPage + 3,
        currentPage - 1,
        currentPage - 2
    ].filter(p => p >= 1 && p <= TOTAL_MUSHAF_PAGES && p !== currentPage);

    caches.open(QURAN_CACHE_STORE_NAME).then(cache => {
        targets.forEach(p => {
            const padded = String(p).padStart(3, "0");
            const svgUrl = `https://cdn.quran.ws/svg/pages/v1.1.1/hafs-kfqc/${padded}.svg`;
            const tafsirUrl = `https://api.alquran.cloud/v1/page/${p}/ar.muyassar`;

            // فحص وجود الصفحة مسبقاً قبل الطلب
            cache.match(svgUrl).then(match => {
                if (!match) {
                    fetch(svgUrl, { mode: "cors" }).then(res => {
                        if (res && res.status === 200) cache.put(svgUrl, res);
                    }).catch(() => {});
                }
            });

            // تحميل مسبق للتفسير
            const cachedTafsir = localStorage.getItem(`tafsir_cache_p${p}`);
            if (!cachedTafsir) {
                fetch(tafsirUrl).then(r => r.json()).then(result => {
                    if (result && result.code === 200 && result.data && result.data.ayahs) {
                        localStorage.setItem(`tafsir_cache_p${p}`, JSON.stringify(result.data.ayahs));
                    }
                }).catch(() => {});
            }
        });
    }).catch(() => {});
}

// 2. إيماءات اللمس والنقر السريع لتقليب صفحات المصحف الشريف (Touch & Tap Gestures)
function initMushafTouchGestures() {
    const wrapper = document.getElementById("mushaf-real-page-wrapper") || document.querySelector(".mushaf-real-page-wrapper");
    if (!wrapper) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let touchStartTime = 0;

    wrapper.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }
    }, { passive: true });

    wrapper.addEventListener("touchend", (e) => {
        if (e.changedTouches && e.changedTouches.length === 1) {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            const elapsedTime = Date.now() - touchStartTime;

            // أ) حركة السحب الأفقي (Swipe)
            if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
                if (diffX < 0) {
                    // سحب لليسار: الصفحة التالية في المصحف
                    flipToNextPage();
                } else {
                    // سحب لليمين: الصفحة السابقة
                    flipToPrevPage();
                }
                return;
            }

            // ب) النقر السريع على جانبي الصفحة (Tap-to-flip)
            if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15 && elapsedTime < 350) {
                const rect = wrapper.getBoundingClientRect();
                const tapXRelative = touchEndX - rect.left;
                const width = rect.width;

                // النقر على الثلث الأيسر = الصفحة التالية
                if (tapXRelative < width * 0.35) {
                    flipToNextPage();
                }
                // النقر على الثلث الأيمن = الصفحة السابقة
                else if (tapXRelative > width * 0.65) {
                    flipToPrevPage();
                }
                // النقر في الثلث الأوسط = وضع القراءة الهادئ (إخفاء/إظهار الأدوات)
                else {
                    toggleMushafZenMode();
                }
            }
        }
    }, { passive: true });

    // دعم النقر بالماوس أيضاً على جانبي الصفحة أو في الوسط
    wrapper.addEventListener("click", (e) => {
        if (e.target.closest("button, a, input, select, .mushaf-page-loader")) return;
        const rect = wrapper.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;

        if (clickX < width * 0.32) {
            flipToNextPage();
        } else if (clickX > width * 0.68) {
            flipToPrevPage();
        } else {
            toggleMushafZenMode();
        }
    });

    function flipToNextPage() {
        if (currentPageNumber < TOTAL_MUSHAF_PAGES) {
            if (navigator.vibrate) navigator.vibrate(12);
            goToMushafPage(currentPageNumber + 1);
        }
    }

    function flipToPrevPage() {
        if (currentPageNumber > 1) {
            if (navigator.vibrate) navigator.vibrate(12);
            goToMushafPage(currentPageNumber - 1);
        }
    }
}

// 3. وضع ملء الشاشة والتركيز في التلاوة (Fullscreen Focus Mode)
function initMushafFullscreen() {
    const btnFullscreen = document.getElementById("btn-mushaf-fullscreen");
    const mushafCard = document.querySelector(".real-mushaf-card");
    if (!btnFullscreen || !mushafCard) return;

    btnFullscreen.addEventListener("click", () => {
        toggleMushafFullscreen(mushafCard);
    });

    document.addEventListener("fullscreenchange", updateFullscreenButtonUI);
    document.addEventListener("webkitfullscreenchange", updateFullscreenButtonUI);
}

function toggleMushafFullscreen(cardEl) {
    const isFs = document.fullscreenElement || document.webkitFullscreenElement || cardEl.classList.contains("mushaf-fullscreen-mode");

    if (!isFs) {
        if (cardEl.requestFullscreen) {
            cardEl.requestFullscreen().catch(() => {
                cardEl.classList.add("mushaf-fullscreen-mode");
                updateFullscreenButtonUI();
            });
        } else if (cardEl.webkitRequestFullscreen) {
            cardEl.webkitRequestFullscreen();
        } else {
            cardEl.classList.add("mushaf-fullscreen-mode");
            updateFullscreenButtonUI();
        }
        if (typeof showToast === "function") {
            showToast("تم تفعيل وضع القراءة بملء الشاشة والتركيز 📖✨");
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        cardEl.classList.remove("mushaf-fullscreen-mode");
        updateFullscreenButtonUI();
        if (typeof showToast === "function") {
            showToast("تم الخروج من وضع ملء الشاشة 🌿");
        }
    }
}

function updateFullscreenButtonUI() {
    const btnFullscreen = document.getElementById("btn-mushaf-fullscreen");
    const mushafCard = document.querySelector(".real-mushaf-card");
    if (!btnFullscreen) return;

    const isFs = document.fullscreenElement || document.webkitFullscreenElement || (mushafCard && mushafCard.classList.contains("mushaf-fullscreen-mode"));
    const icon = btnFullscreen.querySelector("i");
    if (icon) {
        icon.className = isFs ? "fa-solid fa-compress" : "fa-solid fa-expand";
    }
    btnFullscreen.classList.toggle("active", !!isFs);
}

// 4. مدير التحميل والتخزين بدون نت (Offline Quran Manager)
function initMushafOfflineManager() {
    const modal = document.getElementById("mushaf-offline-modal");
    const btnOpen = document.getElementById("btn-mushaf-offline");
    const btnClose = document.getElementById("btn-close-offline-modal");
    const btnQuick = document.getElementById("btn-start-quick-download");
    const btnFull = document.getElementById("btn-start-full-download");
    const btnCancel = document.getElementById("btn-cancel-offline-download");
    const btnClear = document.getElementById("btn-clear-quran-cache");

    if (btnOpen && modal) {
        btnOpen.addEventListener("click", () => {
            modal.classList.add("open");
            checkQuranOfflineStatus();
        });
    }

    if (btnClose && modal) {
        btnClose.addEventListener("click", () => {
            modal.classList.remove("open");
        });
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("open");
        });
    }

    // التحميل السريع للسور الفاضلة
    if (btnQuick) {
        btnQuick.addEventListener("click", () => {
            // قائمة صفحات السور الفاضلة (الفاتحة، الكهف، يس، الواقعة، الرحمن، الملك، جزء عم وتبارك)
            const pagesSet = new Set();
            pagesSet.add(1); // الفاتحة
            for (let i = 293; i <= 304; i++) pagesSet.add(i); // الكهف
            for (let i = 440; i <= 445; i++) pagesSet.add(i); // يس
            for (let i = 531; i <= 534; i++) pagesSet.add(i); // الرحمن
            for (let i = 534; i <= 537; i++) pagesSet.add(i); // الواقعة
            for (let i = 562; i <= 604; i++) pagesSet.add(i); // تبارك وعم والمعوذات

            const pagesArray = Array.from(pagesSet).sort((a, b) => a - b);
            startQuranOfflineDownload(pagesArray, "السور الفاضلة والأكثر قراءة");
        });
    }

    // تحميل المصحف كاملاً
    if (btnFull) {
        btnFull.addEventListener("click", () => {
            const allPages = [];
            for (let i = 1; i <= TOTAL_MUSHAF_PAGES; i++) allPages.push(i);
            startQuranOfflineDownload(allPages, "المصحف الشريف كاملاً (604 صفحات)");
        });
    }

    // إلغاء التحميل
    if (btnCancel) {
        btnCancel.addEventListener("click", () => {
            isOfflineDownloadCancelled = true;
            if (typeof showToast === "function") {
                showToast("تم إيقاف عملية التنزيل ⚠️");
            }
        });
    }

    // تفريغ الذاكرة المؤقتة للمصحف
    if (btnClear) {
        btnClear.addEventListener("click", () => {
            if (confirm("هل أنت متأكد من تفريغ ملفات المصحف المحفوظة بدون إنترنت على هذا الجهاز؟")) {
                clearQuranOfflineCache();
            }
        });
    }

    // التحقق المبدئي من حالة التخزين عند فتح الصفحة
    checkQuranOfflineStatus();
}

// فحص عدد الصفحات المحفوظة حالياً وتحديث الواجهة
async function checkQuranOfflineStatus() {
    const cachedCountText = document.getElementById("offline-cached-count-text");
    const readinessPill = document.getElementById("offline-readiness-pill");
    const progressBar = document.getElementById("offline-storage-progress-bar");
    const indicatorBadge = document.getElementById("mushaf-offline-indicator-badge");

    if (!('caches' in window)) {
        if (cachedCountText) cachedCountText.textContent = "المتصفح لا يدعم التخزين التلقائي";
        return;
    }

    try {
        const cache = await caches.open(QURAN_CACHE_STORE_NAME);
        const keys = await cache.keys();
        
        // حساب عدد صفحات المصحف المخزنة
        let pageCount = 0;
        keys.forEach(req => {
            if (req.url.includes("cdn.quran.ws/svg/pages") || req.url.includes("quran.ksu.edu.sa/ayat")) {
                pageCount++;
            }
        });

        // التأكد من عدم تجاوز الإجمالي
        pageCount = Math.min(TOTAL_MUSHAF_PAGES, pageCount);
        const percent = Math.round((pageCount / TOTAL_MUSHAF_PAGES) * 100);

        if (cachedCountText) {
            cachedCountText.textContent = `${pageCount} من أصل ${TOTAL_MUSHAF_PAGES} صفحة محفوظة (${percent}%)`;
        }

        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }

        if (readinessPill) {
            if (pageCount >= 600) {
                readinessPill.className = "offline-badge-pill ready-full";
                readinessPill.innerHTML = '<i class="fa-solid fa-circle-check"></i> متاح كاملاً بدون نت 100%';
            } else if (pageCount >= 30) {
                readinessPill.className = "offline-badge-pill ready-partial";
                readinessPill.innerHTML = `<i class="fa-solid fa-cloud-arrow-down"></i> متاح جزئياً (${pageCount} صفحة)`;
            } else {
                readinessPill.className = "offline-badge-pill ready-none";
                readinessPill.innerHTML = '<i class="fa-solid fa-cloud"></i> يحتاج اتصال إنترنت';
            }
        }

        if (indicatorBadge) {
            if (pageCount >= 30) {
                indicatorBadge.style.display = "inline-flex";
                indicatorBadge.title = `المصحف متاح بدون إنترنت (${pageCount} صفحة محفوظة)`;
            } else {
                indicatorBadge.style.display = "none";
            }
        }
    } catch (err) {
        console.warn("Quran cache status check error:", err);
    }
}

// بدء عملية التنزيل المتسلسل الذكي
async function startQuranOfflineDownload(pagesList, label) {
    if (isOfflineDownloadRunning) {
        if (typeof showToast === "function") showToast("هناك عملية تنزيل جارية بالفعل!");
        return;
    }

    if (!('caches' in window)) {
        alert("متصفحك لا يدعم التخزين المحلي بدون إنترنت.");
        return;
    }

    const activeBox = document.getElementById("offline-active-download-box");
    const actionText = document.getElementById("download-current-action-text");
    const percentText = document.getElementById("download-percentage-text");
    const liveBar = document.getElementById("offline-download-live-bar");
    const optionsContainer = document.querySelector(".offline-download-options");

    isOfflineDownloadRunning = true;
    isOfflineDownloadCancelled = false;

    if (activeBox) activeBox.style.display = "block";
    if (optionsContainer) optionsContainer.style.opacity = "0.5";
    if (actionText) actionText.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-gold"></i> جاري تنزيل ${label}...`;

    try {
        const cache = await caches.open(QURAN_CACHE_STORE_NAME);
        const total = pagesList.length;
        let completed = 0;

        for (let i = 0; i < pagesList.length; i++) {
            if (isOfflineDownloadCancelled) break;

            const pageNum = pagesList[i];
            const padded = String(pageNum).padStart(3, "0");
            const svgUrl = `https://cdn.quran.ws/svg/pages/v1.1.1/hafs-kfqc/${padded}.svg`;
            const tafsirUrl = `https://api.alquran.cloud/v1/page/${pageNum}/ar.muyassar`;

            if (actionText) {
                actionText.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-gold"></i> جاري حفظ صفحة <strong>${pageNum}</strong> من ${total}...`;
            }

            // تحميل وحفظ صفحة المصحف
            try {
                const match = await cache.match(svgUrl);
                if (!match) {
                    const response = await fetch(svgUrl, { mode: "cors" });
                    if (response && response.status === 200) {
                        await cache.put(svgUrl, response);
                    }
                }
            } catch(e) {}

            // تحميل وحفظ التفسير الميسر للصفحة
            try {
                const cachedTafsir = localStorage.getItem(`tafsir_cache_p${pageNum}`);
                if (!cachedTafsir) {
                    const tRes = await fetch(tafsirUrl);
                    const tData = await tRes.json();
                    if (tData && tData.code === 200 && tData.data && tData.data.ayahs) {
                        localStorage.setItem(`tafsir_cache_p${pageNum}`, JSON.stringify(tData.data.ayahs));
                    }
                }
            } catch(e) {}

            completed++;
            const pct = Math.round((completed / total) * 100);
            if (percentText) percentText.textContent = `${pct}%`;
            if (liveBar) liveBar.style.width = `${pct}%`;

            // إعطاء فرصة لمعالجة مهام الواجهة
            if (i % 3 === 0) {
                await new Promise(r => setTimeout(r, 40));
            }
        }

        if (!isOfflineDownloadCancelled) {
            if (typeof playCompletionChime === "function") playCompletionChime();
            if (typeof showToast === "function") {
                showToast(`تم تنزيل ${label} بنجاح! متاح الآن بدون إنترنت 100% 🟢`);
            }
            if (actionText) actionText.innerHTML = `<i class="fa-solid fa-circle-check text-emerald"></i> اكتمل التنزيل بنجاح بحمد الله!`;
        } else {
            if (actionText) actionText.innerHTML = `<i class="fa-solid fa-circle-exclamation text-gold"></i> تم إيقاف التنزيل.`;
        }
    } catch (err) {
        console.error("Offline download failed:", err);
        if (typeof showToast === "function") showToast("حدث خطأ أثناء التنزيل، يرجى المحاولة لاحقاً.");
    } finally {
        isOfflineDownloadRunning = false;
        if (optionsContainer) optionsContainer.style.opacity = "1";
        setTimeout(() => {
            if (activeBox) activeBox.style.display = "none";
            checkQuranOfflineStatus();
        }, 2000);
    }
}

// تفريغ كاش المصحف الشريف
async function clearQuranOfflineCache() {
    try {
        if ('caches' in window) {
            await caches.delete(QURAN_CACHE_STORE_NAME);
        }
        
        // مسح تفاسير الكاش من localStorage
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith("tafsir_cache_p")) {
                localStorage.removeItem(key);
            }
        }

        if (typeof showToast === "function") {
            showToast("تم تفريغ الذاكرة المؤقتة للمصحف الشريف بنجاح 🗑️");
        }

        checkQuranOfflineStatus();
    } catch (err) {
        console.warn("Clear cache failed:", err);
    }
}

/* ==========================================================================
   محرك تحفيظ وتكرار القرآن الكريم (Quran Memorization & Hifz Engine)
   ========================================================================== */
let hifzAudio = new Audio();
let isHifzPlaying = false;
let currentHifzSurahId = 1;
let currentHifzFromAyah = 1;
let currentHifzToAyah = 5;
let currentHifzActiveAyah = 1;
let currentHifzAyahRepeatTarget = 3;
let currentHifzAyahRepeatCurrent = 1;
let currentHifzRangeRepeatTarget = 1;
let currentHifzRangeRepeatCurrent = 1;
let currentHifzDelaySeconds = 4;
let currentHifzReciter = "Husary_128kbps";
let hifzDelayTimer = null;
let isHifzTextHidden = false;

function initQuranHifzEngine() {
    const modal = document.getElementById("quran-hifz-modal");
    const btnOpen = document.getElementById("btn-open-hifz-modal");
    const btnClose = document.getElementById("btn-close-hifz-modal");
    const surahSelect = document.getElementById("hifz-surah-select");
    const reciterSelect = document.getElementById("hifz-reciter-select");
    const fromInput = document.getElementById("hifz-ayah-from");
    const toInput = document.getElementById("hifz-ayah-to");
    const repeatCountSelect = document.getElementById("hifz-repeat-count");
    const rangeRepeatSelect = document.getElementById("hifz-range-repeat-count");
    const delaySelect = document.getElementById("hifz-delay-interval");
    const btnToggleText = document.getElementById("btn-toggle-hifz-text");
    const btnPlay = document.getElementById("btn-hifz-toggle-play");
    const btnNext = document.getElementById("btn-hifz-next-ayah");
    const btnPrev = document.getElementById("btn-hifz-prev-ayah");
    const btnReset = document.getElementById("btn-hifz-reset-range");

    if (!modal) return;

    // 1. فتح وإغلاق النافذة
    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
            modal.classList.add("open");
            // مزامنة السورة الحالية مع السورة المعروضة في المصحف
            const curSurah = findSurahForPage(currentPageNumber);
            if (curSurah && surahSelect) {
                surahSelect.value = curSurah.id;
                onHifzSurahChange(curSurah.id);
            }
        });
    }

    if (btnClose) {
        btnClose.addEventListener("click", () => {
            modal.classList.remove("open");
            stopHifzPlayback();
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("open");
            stopHifzPlayback();
        }
    });

    // 2. تعبئة قائمة السور في نافذة التحفيظ
    if (surahSelect) {
        surahSelect.innerHTML = "";
        SURAHS_INDEX.forEach(s => {
            const opt = document.createElement("option");
            opt.value = s.id;
            opt.textContent = `${s.id}. سورة ${s.name} (${s.ayahs} آية)`;
            surahSelect.appendChild(opt);
        });

        surahSelect.addEventListener("change", (e) => {
            const sId = parseInt(e.target.value, 10);
            onHifzSurahChange(sId);
        });
    }

    // 3. مستمعي إعدادات التكرار والنطاق
    if (fromInput) {
        fromInput.addEventListener("change", (e) => {
            let v = parseInt(e.target.value, 10) || 1;
            const surah = SURAHS_INDEX.find(s => s.id === currentHifzSurahId) || SURAHS_INDEX[0];
            v = Math.max(1, Math.min(v, surah.ayahs));
            fromInput.value = v;
            currentHifzFromAyah = v;
            if (currentHifzToAyah < v) {
                currentHifzToAyah = v;
                if (toInput) toInput.value = v;
            }
            currentHifzActiveAyah = v;
            currentHifzAyahRepeatCurrent = 1;
            loadHifzVerseText(currentHifzSurahId, currentHifzActiveAyah);
        });
    }

    if (toInput) {
        toInput.addEventListener("change", (e) => {
            let v = parseInt(e.target.value, 10) || 1;
            const surah = SURAHS_INDEX.find(s => s.id === currentHifzSurahId) || SURAHS_INDEX[0];
            v = Math.max(currentHifzFromAyah, Math.min(v, surah.ayahs));
            toInput.value = v;
            currentHifzToAyah = v;
        });
    }

    if (repeatCountSelect) {
        repeatCountSelect.addEventListener("change", (e) => {
            currentHifzAyahRepeatTarget = parseInt(e.target.value, 10) || 3;
            updateHifzRepeatIndicator();
        });
    }

    if (rangeRepeatSelect) {
        rangeRepeatSelect.addEventListener("change", (e) => {
            currentHifzRangeRepeatTarget = parseInt(e.target.value, 10) || 1;
        });
    }

    if (delaySelect) {
        delaySelect.addEventListener("change", (e) => {
            currentHifzDelaySeconds = parseInt(e.target.value, 10) || 4;
        });
    }

    if (reciterSelect) {
        reciterSelect.addEventListener("change", (e) => {
            currentHifzReciter = e.target.value;
            if (isHifzPlaying) {
                playHifzCurrentAyah();
            }
        });
    }

    // 4. زر إخفاء النص لاختبار الحفظ
    if (btnToggleText) {
        btnToggleText.addEventListener("click", () => {
            isHifzTextHidden = !isHifzTextHidden;
            const display = document.getElementById("hifz-verse-display");
            const eyeIcon = document.getElementById("hifz-eye-icon");
            const eyeText = document.getElementById("hifz-eye-text");

            if (display) display.classList.toggle("hidden-for-test", isHifzTextHidden);
            if (eyeIcon) eyeIcon.className = isHifzTextHidden ? "fa-solid fa-eye" : "fa-solid fa-eye-slash";
            if (eyeText) eyeText.textContent = isHifzTextHidden ? "إظهار النص (رؤية الآية)" : "اختبر حفظك (إخفاء النص)";
            
            if (typeof showToast === "function") {
                showToast(isHifzTextHidden ? "تم إخفاء النص لاختبار استحضار حفظك 👁️" : "تم إظهار نص الآية الكريمة 📖");
            }
        });
    }

    // 5. أزرار التشغيل والتنقل
    if (btnPlay) {
        btnPlay.addEventListener("click", toggleHifzPlayPause);
    }

    if (btnNext) {
        btnNext.addEventListener("click", () => {
            if (currentHifzActiveAyah < currentHifzToAyah) {
                currentHifzActiveAyah++;
                currentHifzAyahRepeatCurrent = 1;
                loadHifzVerseText(currentHifzSurahId, currentHifzActiveAyah);
                if (isHifzPlaying) playHifzCurrentAyah();
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            if (currentHifzActiveAyah > currentHifzFromAyah) {
                currentHifzActiveAyah--;
                currentHifzAyahRepeatCurrent = 1;
                loadHifzVerseText(currentHifzSurahId, currentHifzActiveAyah);
                if (isHifzPlaying) playHifzCurrentAyah();
            }
        });
    }

    if (btnReset) {
        btnReset.addEventListener("click", () => {
            currentHifzActiveAyah = currentHifzFromAyah;
            currentHifzAyahRepeatCurrent = 1;
            currentHifzRangeRepeatCurrent = 1;
            loadHifzVerseText(currentHifzSurahId, currentHifzActiveAyah);
            if (isHifzPlaying) playHifzCurrentAyah();
            if (typeof showToast === "function") showToast("تمت إعادة المقطع من الآية الأولى 🔄");
        });
    }

    // 6. التعامل مع نهاية تلاوة الآية
    hifzAudio.onended = handleHifzAyahEnded;
    hifzAudio.onerror = () => {
        const msgEl = document.getElementById("hifz-status-message");
        if (msgEl) msgEl.innerHTML = '<span style="color: #f59e0b;"><i class="fa-solid fa-triangle-exclamation"></i> تعذر تحميل صوت الآية، جاري الانتقال...</span>';
        setTimeout(handleHifzAyahEnded, 1500);
    };

    // تهيئة أولية
    onHifzSurahChange(67);
}

function onHifzSurahChange(surahId) {
    currentHifzSurahId = surahId;
    const surah = SURAHS_INDEX.find(s => s.id === surahId) || SURAHS_INDEX[0];
    const fromInput = document.getElementById("hifz-ayah-from");
    const toInput = document.getElementById("hifz-ayah-to");
    const surahBadge = document.getElementById("hifz-current-surah-badge");

    currentHifzFromAyah = 1;
    currentHifzToAyah = Math.min(surah.ayahs, 5);
    currentHifzActiveAyah = 1;
    currentHifzAyahRepeatCurrent = 1;
    currentHifzRangeRepeatCurrent = 1;

    if (fromInput) {
        fromInput.max = surah.ayahs;
        fromInput.value = 1;
    }
    if (toInput) {
        toInput.max = surah.ayahs;
        toInput.value = currentHifzToAyah;
    }
    if (surahBadge) {
        surahBadge.textContent = `سورة ${surah.name}`;
    }

    loadHifzVerseText(surahId, 1);
    updateHifzRepeatIndicator();
}

function loadHifzVerseText(surahNum, ayahNum) {
    const textEl = document.getElementById("hifz-verse-text");
    const ayahBadge = document.getElementById("hifz-current-ayah-badge");
    const surahBadge = document.getElementById("hifz-current-surah-badge");
    const surah = SURAHS_INDEX.find(s => s.id === surahNum) || SURAHS_INDEX[0];

    if (ayahBadge) ayahBadge.textContent = `الآية ${ayahNum}`;
    if (surahBadge) surahBadge.textContent = `سورة ${surah.name}`;
    updateHifzRepeatIndicator();

    const cacheKey = `hifz_verse_${surahNum}_${ayahNum}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        if (textEl) textEl.textContent = cached;
        return;
    }

    if (textEl) textEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استحضار الآية...';

    // جلب نص الآية برسم عثماني نقي
    fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/ar.alafasy`)
        .then(r => r.json())
        .then(res => {
            if (res && res.code === 200 && res.data && res.data.text) {
                let txt = res.data.text;
                // إزالة البسملة الزائدة إن وجدت في أول السورة ما عدا الفاتحة
                if (ayahNum === 1 && surahNum !== 1 && txt.startsWith("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")) {
                    txt = txt.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "");
                }
                localStorage.setItem(cacheKey, txt);
                if (textEl) textEl.textContent = txt;
            } else {
                if (textEl) textEl.textContent = `الآية رقم (${ayahNum}) من سورة ${surah.name}`;
            }
        })
        .catch(() => {
            if (textEl) textEl.textContent = `الآية رقم (${ayahNum}) من سورة ${surah.name}`;
        });
}

function toggleHifzPlayPause() {
    if (isHifzPlaying) {
        pauseHifzPlayback();
    } else {
        startHifzPlayback();
    }
}

function startHifzPlayback() {
    isHifzPlaying = true;
    updateHifzPlayButtonUI(true);
    playHifzCurrentAyah();
}

function pauseHifzPlayback() {
    isHifzPlaying = false;
    if (hifzDelayTimer) clearTimeout(hifzDelayTimer);
    hifzAudio.pause();
    updateHifzPlayButtonUI(false);
    const msgEl = document.getElementById("hifz-status-message");
    if (msgEl) msgEl.innerHTML = '<span>تم إيقاف التحفيظ مؤقتاً ⏸️</span>';
}

function stopHifzPlayback() {
    isHifzPlaying = false;
    if (hifzDelayTimer) clearTimeout(hifzDelayTimer);
    hifzAudio.pause();
    updateHifzPlayButtonUI(false);
}

function updateHifzPlayButtonUI(isPlaying) {
    const btnPlay = document.getElementById("btn-hifz-toggle-play");
    const icon = document.getElementById("hifz-play-icon");
    const text = document.getElementById("hifz-play-text");

    if (btnPlay) {
        btnPlay.classList.toggle("is-playing", isPlaying);
    }
    if (icon) {
        icon.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
    }
    if (text) {
        text.textContent = isPlaying ? "إيقاف مؤقت" : "بدء التحفيظ والتكرار";
    }
}

function playHifzCurrentAyah() {
    if (!isHifzPlaying) return;
    if (hifzDelayTimer) clearTimeout(hifzDelayTimer);

    loadHifzVerseText(currentHifzSurahId, currentHifzActiveAyah);
    updateHifzRepeatIndicator();

    const surahPadded = String(currentHifzSurahId).padStart(3, "0");
    const ayahPadded = String(currentHifzActiveAyah).padStart(3, "0");
    const audioUrl = `https://everyayah.com/data/${currentHifzReciter}/${surahPadded}${ayahPadded}.mp3`;

    const msgEl = document.getElementById("hifz-status-message");
    if (msgEl) {
        msgEl.innerHTML = `<span><i class="fa-solid fa-volume-high text-gold"></i> يستمع القارئ ويتلو الآية <strong>${currentHifzActiveAyah}</strong>...</span>`;
    }

    hifzAudio.src = audioUrl;
    hifzAudio.play().catch(() => {
        // خطأ تشغيل أوتوماتيكي
    });
}

function handleHifzAyahEnded() {
    if (!isHifzPlaying) return;

    const msgEl = document.getElementById("hifz-status-message");

    // 1. هل ما زال هناك تكرار لنفس الآية الحالية؟
    if (currentHifzAyahRepeatCurrent < currentHifzAyahRepeatTarget) {
        currentHifzAyahRepeatCurrent++;
        updateHifzRepeatIndicator();

        if (currentHifzDelaySeconds > 0) {
            let secondsLeft = currentHifzDelaySeconds;
            if (msgEl) {
                msgEl.innerHTML = `<span style="color: #10b981;"><i class="fa-solid fa-microphone"></i> <strong>دورك الآن:</strong> ردد الآية بصوتك وكررها (${secondsLeft} ثوانٍ)...</span>`;
            }

            const interval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft > 0 && isHifzPlaying && msgEl) {
                    msgEl.innerHTML = `<span style="color: #10b981;"><i class="fa-solid fa-microphone"></i> <strong>دورك الآن:</strong> ردد الآية بصوتك وكررها (${secondsLeft} ثوانٍ)...</span>`;
                } else {
                    clearInterval(interval);
                }
            }, 1000);

            hifzDelayTimer = setTimeout(() => {
                clearInterval(interval);
                if (isHifzPlaying) playHifzCurrentAyah();
            }, currentHifzDelaySeconds * 1000);
        } else {
            playHifzCurrentAyah();
        }
    } 
    // 2. انتهى تكرار الآية الحالية -> الانتقال للآية التالية في النطاق
    else if (currentHifzActiveAyah < currentHifzToAyah) {
        currentHifzActiveAyah++;
        currentHifzAyahRepeatCurrent = 1;
        
        if (msgEl) {
            msgEl.innerHTML = `<span>الانتقال للآية التالية (<strong>${currentHifzActiveAyah}</strong>)...</span>`;
        }

        setTimeout(() => {
            if (isHifzPlaying) playHifzCurrentAyah();
        }, 600);
    } 
    // 3. وصل إلى نهاية النطاق -> هل يعيد المقطع كاملاً؟
    else if (currentHifzRangeRepeatCurrent < currentHifzRangeRepeatTarget) {
        currentHifzRangeRepeatCurrent++;
        currentHifzActiveAyah = currentHifzFromAyah;
        currentHifzAyahRepeatCurrent = 1;

        if (msgEl) {
            msgEl.innerHTML = `<span style="color: var(--gold-400);"><i class="fa-solid fa-rotate-left"></i> إعادة المقطع بالكامل (الجولة <strong>${currentHifzRangeRepeatCurrent}</strong> من <strong>${currentHifzRangeRepeatTarget}</strong>)...</span>`;
        }

        setTimeout(() => {
            if (isHifzPlaying) playHifzCurrentAyah();
        }, 1500);
    } 
    // 4. اكتمل حفظ وتكرار كامل المقطع بنجاح!
    else {
        isHifzPlaying = false;
        updateHifzPlayButtonUI(false);
        if (typeof playCompletionChime === "function") playCompletionChime();
        if (typeof showToast === "function") {
            showToast("ما شاء الله تبارك الله! تم إتمام تكرار وحفظ المقطع بنجاح 🌿🤲");
        }
        if (msgEl) {
            msgEl.innerHTML = '<span style="color: #10b981; font-weight: 700;"><i class="fa-solid fa-circle-check"></i> مبارك! اكتمل تكرار وحفظ المقطع بالكامل بحمد الله 🌿</span>';
        }
    }
}

function updateHifzRepeatIndicator() {
    const indicator = document.getElementById("hifz-repeat-indicator");
    if (!indicator) return;

    const targetText = currentHifzAyahRepeatTarget >= 999 ? "∞" : currentHifzAyahRepeatTarget;
    indicator.innerHTML = `<span>تكرار الآية: <strong>${currentHifzAyahRepeatCurrent} / ${targetText}</strong></span>`;
}

/* ==========================================================================
   مشغل الآيات التزامني التفاعلي (Ayah Sync Player & Memorization Engine)
   ========================================================================== */
let ayahSyncAudio = new Audio();
let isAyahSyncPlaying = false;
let currentAyahIndexInPage = 0;
let currentPageAyahsList = [];
let currentAyahRepeatTarget = 1; // 1, 3, 5, 999 (infinity)
let currentAyahRepeatCount = 1;
let currentAyahReciter = localStorage.getItem("selected_ayah_reciter") || "Alafasy_128kbps";
let currentAyahSpeed = 1.0;
let ayahPageCache = {};

function initAyahSyncPlayer() {
    const toggleBtn = document.getElementById("btn-toggle-ayah-sync");
    const panel = document.getElementById("ayah-sync-player-panel");
    const playBtn = document.getElementById("btn-ayah-play-toggle");
    const prevBtn = document.getElementById("btn-ayah-prev");
    const nextBtn = document.getElementById("btn-ayah-next");
    const repeatBtn = document.getElementById("btn-ayah-repeat-mode");
    const reciterSelect = document.getElementById("select-ayah-reciter");
    const speedSelect = document.getElementById("select-ayah-playback-speed");
    const btnViewImg = document.getElementById("btn-view-mushaf-img");
    const btnViewText = document.getElementById("btn-view-mushaf-text");

    if (reciterSelect) {
        reciterSelect.value = currentAyahReciter;
        reciterSelect.addEventListener("change", (e) => {
            currentAyahReciter = e.target.value;
            localStorage.setItem("selected_ayah_reciter", currentAyahReciter);
            if (isAyahSyncPlaying) {
                playAyahSync(currentAyahIndexInPage, false);
            }
        });
    }

    if (speedSelect) {
        speedSelect.addEventListener("change", (e) => {
            currentAyahSpeed = parseFloat(e.target.value) || 1.0;
            ayahSyncAudio.playbackRate = currentAyahSpeed;
        });
    }

    if (repeatBtn) {
        repeatBtn.addEventListener("click", () => {
            if (currentAyahRepeatTarget === 1) currentAyahRepeatTarget = 3;
            else if (currentAyahRepeatTarget === 3) currentAyahRepeatTarget = 5;
            else if (currentAyahRepeatTarget === 5) currentAyahRepeatTarget = 999;
            else currentAyahRepeatTarget = 1;

            const label = document.getElementById("ayah-repeat-label");
            if (label) {
                label.textContent = currentAyahRepeatTarget >= 999 ? "تكرار: مستمر ∞" : `تكرار: ${currentAyahRepeatTarget} مرات`;
            }
            if (typeof showToast === "function") {
                showToast(`تم ضبط تكرار الآية: ${currentAyahRepeatTarget >= 999 ? "مستمر للحفظ" : currentAyahRepeatTarget + " مرات"} 🔁`);
            }
        });
    }

    if (toggleBtn && panel) {
        toggleBtn.addEventListener("click", () => {
            const isVisible = panel.style.display !== "none";
            if (isVisible) {
                panel.style.display = "none";
                toggleBtn.classList.remove("active");
                stopAyahSyncAudio();
            } else {
                panel.style.display = "flex";
                toggleBtn.classList.add("active");
                panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        });
    }

    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (isAyahSyncPlaying) {
                pauseAyahSyncAudio();
            } else {
                playAyahSync(currentAyahIndexInPage);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentAyahIndexInPage > 0) {
                playAyahSync(currentAyahIndexInPage - 1);
            } else if (currentPageNumber > 1) {
                goToMushafPage(currentPageNumber - 1);
                setTimeout(() => {
                    playAyahSync(currentPageAyahsList.length - 1);
                }, 700);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currentAyahIndexInPage < currentPageAyahsList.length - 1) {
                playAyahSync(currentAyahIndexInPage + 1);
            } else if (currentPageNumber < TOTAL_MUSHAF_PAGES) {
                goToMushafPage(currentPageNumber + 1);
                setTimeout(() => {
                    playAyahSync(0);
                }, 700);
            }
        });
    }

    if (btnViewImg && btnViewText) {
        btnViewImg.addEventListener("click", () => {
            btnViewImg.classList.add("active");
            btnViewText.classList.remove("active");
            document.getElementById("mushaf-real-page-wrapper").style.display = "block";
            document.getElementById("mushaf-interactive-verses-wrapper").style.display = "none";
        });

        btnViewText.addEventListener("click", () => {
            btnViewText.classList.add("active");
            btnViewImg.classList.remove("active");
            document.getElementById("mushaf-real-page-wrapper").style.display = "none";
            document.getElementById("mushaf-interactive-verses-wrapper").style.display = "block";
        });
    }

    // Audio onended handler
    ayahSyncAudio.addEventListener("ended", onAyahSyncAudioEnded);
    ayahSyncAudio.addEventListener("error", () => {
        console.warn("Ayah audio load error, trying fallback...");
        const ayah = currentPageAyahsList[currentAyahIndexInPage];
        if (ayah && !ayahSyncAudio.src.includes("islamic.network")) {
            ayahSyncAudio.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
            ayahSyncAudio.play().catch(() => {});
        }
    });
}

/**
 * جلب وعرض آيات الصفحة الحالية بالرسم العثماني
 */
async function loadAyahsForCurrentMushafPage(pageNumber) {
    const container = document.getElementById("mushaf-verses-container");
    if (!container) return;

    if (ayahPageCache[pageNumber]) {
        currentPageAyahsList = ayahPageCache[pageNumber];
        renderPageInteractiveVerses(currentPageAyahsList);
        return;
    }

    container.innerHTML = `
        <div style="text-align: center; color: var(--gold-400); padding: 25px;">
            <i class="fa-solid fa-spinner fa-spin"></i> جاري تجهيز الآيات الكريمة للصفحة ${pageNumber}...
        </div>
    `;

    try {
        const response = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
        const json = await response.json();
        if (json && json.data && json.data.ayahs) {
            currentPageAyahsList = json.data.ayahs;
            ayahPageCache[pageNumber] = currentPageAyahsList;
            renderPageInteractiveVerses(currentPageAyahsList);
        }
    } catch (e) {
        console.warn("Could not fetch Uthmani page ayahs:", e);
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                اضغط على زر المصحف المصور لقراءة الصفحة أو أعد المحاولة.
            </div>
        `;
    }
}

/**
 * رسم بطاقات الآيات وتضمين الإجراءات التفاعلية
 */
function renderPageInteractiveVerses(ayahs) {
    const container = document.getElementById("mushaf-verses-container");
    if (!container) return;

    if (!ayahs || ayahs.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:var(--text-muted);">لا توجد آيات متوفرة لهذه الصفحة.</div>`;
        return;
    }

    container.innerHTML = ayahs.map((ayah, idx) => {
        const surahName = ayah.surah ? ayah.surah.name : "السورة";
        return `
            <div class="ayah-verse-card ${idx === currentAyahIndexInPage && isAyahSyncPlaying ? 'is-active-ayah' : ''}" 
                 id="ayah-card-${idx}" 
                 onclick="playAyahSync(${idx})">
                <div class="ayah-verse-text">
                    <span>${ayah.text}</span>
                    <span class="ayah-num-symbol">﴿${ayah.numberInSurah}﴾</span>
                </div>
                <div class="ayah-verse-actions" onclick="event.stopPropagation();">
                    <span style="font-size: 0.75rem; color: var(--gold-400); margin-inline-end: auto;">
                        ${surahName} • آية ${ayah.numberInSurah}
                    </span>
                    <button type="button" class="ayah-action-btn" onclick="playAyahSync(${idx})" title="استماع">
                        <i class="fa-solid fa-play"></i> استماع
                    </button>
                    <button type="button" class="ayah-action-btn" onclick="copyAyahText('${escapeSingleQuotes(ayah.text)}', '${surahName}', ${ayah.numberInSurah})" title="نسخ">
                        <i class="fa-solid fa-copy"></i> نسخ
                    </button>
                    <button type="button" class="ayah-action-btn" onclick="createStoryCardFromAyah('${escapeSingleQuotes(ayah.text)}', '${surahName}', ${ayah.numberInSurah})" title="صناعة بطاقة واستوري">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> بطاقة
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function escapeSingleQuotes(str) {
    return String(str).replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

/**
 * تشغيل الآية المحددة مع التظليل والمزامنة
 */
function playAyahSync(index, resetRepeat = true) {
    if (!currentPageAyahsList || currentPageAyahsList.length === 0) return;
    if (index < 0) index = 0;
    if (index >= currentPageAyahsList.length) index = currentPageAyahsList.length - 1;

    currentAyahIndexInPage = index;
    if (resetRepeat) currentAyahRepeatCount = 1;

    const ayah = currentPageAyahsList[index];
    if (!ayah) return;

    // إيقاف تلاوة السورة الكاملة إذا كانت تعمل لتجنب تداخل الأصوات
    if (mushafAudio && !mushafAudio.paused) {
        mushafAudio.pause();
        isAudioPlaying = false;
        const btnSurahAudio = document.getElementById("btn-surah-audio");
        if (btnSurahAudio) btnSurahAudio.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>استماع السورة</span>';
    }

    const surahId = ayah.surah ? ayah.surah.number : 1;
    const surahPadded = String(surahId).padStart(3, "0");
    const ayahPadded = String(ayah.numberInSurah).padStart(3, "0");

    // بناء مسار ملف الصوت للآية
    const audioSrc = `https://everyayah.com/data/${currentAyahReciter}/${surahPadded}${ayahPadded}.mp3`;
    ayahSyncAudio.src = audioSrc;
    ayahSyncAudio.playbackRate = currentAyahSpeed;
    
    ayahSyncAudio.play().then(() => {
        isAyahSyncPlaying = true;
        updateAyahSyncUI(ayah, index);
    }).catch(err => {
        console.warn("Audio play blocked or error:", err);
        // تجربة السيرفر البديل
        ayahSyncAudio.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
        ayahSyncAudio.play().catch(() => {});
        isAyahSyncPlaying = true;
        updateAyahSyncUI(ayah, index);
    });
}

function pauseAyahSyncAudio() {
    ayahSyncAudio.pause();
    isAyahSyncPlaying = false;
    const playBtn = document.getElementById("btn-ayah-play-toggle");
    const playText = document.getElementById("ayah-play-btn-text");
    if (playBtn) playBtn.querySelector("i").className = "fa-solid fa-play";
    if (playText) playText.textContent = "استئناف الاستماع";
}

function stopAyahSyncAudio() {
    ayahSyncAudio.pause();
    ayahSyncAudio.currentTime = 0;
    isAyahSyncPlaying = false;
    const playBtn = document.getElementById("btn-ayah-play-toggle");
    const playText = document.getElementById("ayah-play-btn-text");
    if (playBtn) playBtn.querySelector("i").className = "fa-solid fa-play";
    if (playText) playText.textContent = "بدء الاستماع آية بآية";
    document.querySelectorAll(".ayah-verse-card").forEach(c => c.classList.remove("is-active-ayah"));
}

function updateAyahSyncUI(ayah, index) {
    const playBtn = document.getElementById("btn-ayah-play-toggle");
    const playText = document.getElementById("ayah-play-btn-text");
    const titleEl = document.getElementById("ayah-sync-current-title");

    if (playBtn) playBtn.querySelector("i").className = "fa-solid fa-pause";
    if (playText) playText.textContent = "إيقاف مؤقت";

    const surahName = ayah.surah ? ayah.surah.name : "سورة";
    if (titleEl) {
        titleEl.textContent = `${surahName} • الآية ${ayah.numberInSurah} (جزء ${ayah.juz || 1})`;
    }

    // تظليل بطاقة الآية الحالية
    document.querySelectorAll(".ayah-verse-card").forEach((card, idx) => {
        if (idx === index) {
            card.classList.add("is-active-ayah");
            card.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            card.classList.remove("is-active-ayah");
        }
    });
}

function onAyahSyncAudioEnded() {
    if (!isAyahSyncPlaying) return;

    // تكرار نفس الآية إذا تم تحديد وضع التكرار
    if (currentAyahRepeatCount < currentAyahRepeatTarget) {
        currentAyahRepeatCount++;
        playAyahSync(currentAyahIndexInPage, false);
        return;
    }

    // الانتقال للآية التالية في الصفحة
    if (currentAyahIndexInPage < currentPageAyahsList.length - 1) {
        currentAyahRepeatCount = 1;
        playAyahSync(currentAyahIndexInPage + 1);
    } 
    // نهاية الصفحة -> تقليب تلقائي للصفحة التالية وتشغيل أول آية!
    else if (currentPageNumber < TOTAL_MUSHAF_PAGES) {
        goToMushafPage(currentPageNumber + 1);
        setTimeout(() => {
            playAyahSync(0);
        }, 800);
    } else {
        stopAyahSyncAudio();
        if (typeof showToast === "function") {
            showToast("تم إتمام تلاوة آخر آية في المصحف الشريف بحمد الله 🌿🤲");
        }
    }
}

// أدوات التفاعل السريع مع الآيات
window.copyAyahText = function(text, surahName, ayahNum) {
    const full = `﴿${text}﴾ [${surahName}: ${ayahNum}]\n— عبر تطبيق زاد المسلم`;
    navigator.clipboard.writeText(full).then(() => {
        if (typeof showToast === "function") showToast("تم نسخ الآية الكريمة بنجاح 📋✨");
    });
};

window.createStoryCardFromAyah = function(text, surahName, ayahNum) {
    const modal = document.getElementById("dua-card-modal");
    const customGroup = document.getElementById("custom-dua-group");
    const customInput = document.getElementById("custom-dua-input");
    const templateSelect = document.getElementById("dua-template-select");

    if (templateSelect) templateSelect.value = "custom";
    if (customGroup) customGroup.style.display = "block";
    if (customInput) customInput.value = `﴿${text}﴾\n[${surahName}: ${ayahNum}]`;

    if (modal) modal.classList.add("open");
    if (typeof drawDuaCard === "function") drawDuaCard();
};


