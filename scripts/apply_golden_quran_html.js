const fs = require('fs');
const path = require('path');

const goldenQuranHtml = `
                <!-- المصحف الذهبي الشريف المدمج بدون إنترنت (طبعة مجمع الملك فهد) -->
                <div class="golden-quran-wrapper theme-golden-night" id="golden-quran-wrapper">
                    <!-- الترويسة الذهبية العلوية -->
                    <div class="golden-mushaf-header" id="golden-mushaf-header">
                        <button type="button" class="golden-hdr-btn golden-hdr-surah" id="golden-btn-surah" title="اختيار السورة">
                            <span id="golden-surah-title">سورة يس</span>
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>

                        <button type="button" class="golden-hdr-btn golden-hdr-grid" id="golden-btn-index" title="فهرس القرآن الكريم">
                            <div class="golden-grid-icon">
                                <div></div><div></div>
                                <div></div><div></div>
                            </div>
                        </button>

                        <div class="golden-hdr-left">
                            <span class="golden-juz-title" id="golden-juz-title">الجزء ٢٣</span>
                            <button type="button" class="golden-hdr-btn golden-hdr-bookmark" id="golden-btn-bookmark" title="حفظ فاصلة القراءة">
                                <i class="fa-regular fa-bookmark golden-bookmark-icon" id="golden-bookmark-icon"></i>
                            </button>
                            <button type="button" class="golden-hdr-btn golden-hdr-theme" id="golden-btn-theme" title="تبديل وضع راحة العين (ليلي دافئ / ورقي هادئ)">
                                <i class="fa-solid fa-circle-half-stroke"></i>
                            </button>
                        </div>
                    </div>

                    <!-- مساحة عرض صفحة المصحف -->
                    <div class="golden-mushaf-viewport" id="golden-mushaf-viewport">
                        <!-- شريط موضع الوقوف المحفوظ -->
                        <div class="golden-page-ribbon" id="golden-page-ribbon" style="display: none;">
                            <i class="fa-solid fa-bookmark"></i>
                            <span>موضع وقوفك المحفوظ</span>
                        </div>

                        <!-- صفحة المصحف الشريف المدمجة محلياً بدون إنترنت -->
                        <img id="mushaf-real-page-img" class="golden-mushaf-img" src="assets/quran-pages/562.svg" alt="المصحف الشريف" draggable="false">

                        <!-- مناطق التقليب السريع باللمس يميناً ويساراً -->
                        <div class="golden-tap-zone golden-tap-prev" id="golden-tap-prev" title="الصفحة السابقة"></div>
                        <div class="golden-tap-zone golden-tap-next" id="golden-tap-next" title="الصفحة التالية"></div>
                    </div>

                    <!-- التذييل السفلي الأنيق -->
                    <div class="golden-mushaf-footer" id="golden-mushaf-footer">
                        <div class="golden-page-pill" id="golden-page-pill" title="انقر للانتقال المباشر لأي صفحة">
                            <span id="golden-page-num">٥٦٢</span>
                            <span id="golden-hizb-num">الحزب ٥٧</span>
                        </div>

                        <div class="golden-footer-actions">
                            <button type="button" class="golden-footer-action-btn" id="btn-mushaf-prev" title="الصفحة السابقة">
                                <i class="fa-solid fa-chevron-right"></i>
                                <span>السابق</span>
                            </button>
                            <button type="button" class="golden-footer-action-btn" id="btn-page-tafsir" title="تفسير الصفحة الحالية">
                                <i class="fa-solid fa-book-open"></i>
                                <span>تفسير</span>
                            </button>
                            <button type="button" class="golden-footer-action-btn" id="btn-surah-audio" title="استماع التلاوة">
                                <i class="fa-solid fa-volume-high"></i>
                                <span class="btn-audio-text">تلاوة</span>
                            </button>
                            <button type="button" class="golden-footer-action-btn" id="btn-mushaf-next" title="الصفحة التالية">
                                <span>التالي</span>
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- مودال الفهرس السريع المدمج (Index Modal) -->
                <div class="golden-index-modal" id="golden-index-modal">
                    <div class="golden-index-card">
                        <div class="golden-index-hdr">
                            <h3><i class="fa-solid fa-book-quran text-gold"></i> فهرس المصحف الشريف</h3>
                            <button type="button" class="golden-index-close-btn" id="btn-close-golden-index">&times;</button>
                        </div>
                        <div class="golden-index-tabs">
                            <button type="button" class="golden-index-tab-btn active" data-tab="surahs">السور (114)</button>
                            <button type="button" class="golden-index-tab-btn" data-tab="juz">الأجزاء (30)</button>
                            <button type="button" class="golden-index-tab-btn" data-tab="bookmarks">علاماتي المحفوظة</button>
                        </div>
                        <div class="golden-index-search">
                            <input type="text" id="golden-index-search-input" placeholder="ابحث باسم السورة أو رقمها (مثال: الكهف، 18)...">
                        </div>
                        <div class="golden-index-list" id="golden-index-list">
                            <!-- يُملأ ديناميكياً من quran.js -->
                        </div>
                    </div>
                </div>
`;

function updateHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find the start of real-mushaf-card
    const startPattern = /<!--\s*بطاقة صفحة المصحف الشريف الحقيقية الكبرى\s*-->[\s\S]*?<div class="quran-mushaf-card real-mushaf-card" id="real-mushaf-card">/;
    const endPattern = /<!--\s*الجزء الثاني: ختمة القرآن الكريم الجماعية/;

    const startIndex = content.search(startPattern);
    const endIndex = content.search(endPattern);

    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        // Find the closing </div> of subpart-mushaf right before subpart-khatma
        const before = content.substring(0, startIndex);
        const after = content.substring(endIndex);
        
        // Also remove redundant tracker bar and surahs controls if present right before real-mushaf-card
        const cleanBefore = before.replace(
            /<div class="mushaf-reading-tracker-bar"[\s\S]*?<\/div>\s*<\/div>\s*<!-- عناصر اختيار السورة -->[\s\S]*?<\/div>\s*<\/div>/,
            ''
        );

        const newContent = cleanBefore + goldenQuranHtml + '\n            </div>\n\n            ' + after;
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Successfully updated ${filePath}`);
    } else {
        console.error(`Could not locate insertion bounds in ${filePath}`);
    }
}

updateHtmlFile(path.join(__dirname, '..', 'services.html'));
// The canonical Quran reader is in services.html.
