/**
 * ==============================================================================
 * زاد المسلم — حائط الدعاء بظهر الغيب (Wall of Duas — Mutual Brotherhood Prayers)
 * ------------------------------------------------------------------------------
 * مصداقاً لحديث النبي ﷺ:
 * «مَا مِنْ عَبْدٍ مُسْلِمٍ يَدْعُو لأَخِيهِ بِظَهْرِ الْغَيْبِ، إِلَّا قَالَ الْمَلَكُ: وَلَكَ بِمِثْلٍ»
 * [صحيح مسلم]
 * ==============================================================================
 */

(function(window, document) {
    "use strict";

    // التصنيفات المعتمدة لحائط الأدعية
    const DUA_CATEGORIES = {
        all: { id: "all", label: "جميع الدعوات", icon: "🌟", color: "#d4af37" },
        shifa: { id: "shifa", label: "شفاء مريض", icon: "🩺", color: "#10b981" },
        faraj: { id: "faraj", label: "تفريج هم وكرب", icon: "🕊️", color: "#38bdf8" },
        rizq: { id: "rizq", label: "تيسير ورزق", icon: "🤲", color: "#f59e0b" },
        tawfeeq: { id: "tawfeeq", label: "نجاح وتوفيق", icon: "🎓", color: "#a855f7" },
        hidaya: { id: "hidaya", label: "هداية وصلاح", icon: "🤍", color: "#14b8a6" },
        rahma: { id: "rahma", label: "رحمة ومغفرة", icon: "🌿", color: "#84cc16" },
        mine: { id: "mine", label: "دعواتي الخاصة", icon: "💌", color: "#ec4899" }
    };

    // نماذج جاهزة وسريعة للاقتراح عند كتابة دعاء جديد
    const QUICK_TEMPLATES = {
        shifa: [
            "اللهم اشفِ أمي شفاءً لا يغادر سقماً وألبسها ثوب الصحة والعافية 🤲",
            "أسأل الله العظيم رب العرش العظيم أن يشفي مريضنا ويعافيه عاجلاً غير آجل.",
            "ادعوا لوالدي بالشفاء، يرقد في المستشفى ونرجو منكم دعوة صالحة بظهر الغيب."
        ],
        faraj: [
            "أمر بكرب وضيق لا يعلمه إلا الله، أسألكم بالله دعوة بظهر الغيب أن يفرج همي ويشرح صدري.",
            "اللهم فرج هم المهمومين ونفس كرب المكروبين واقضِ الدين عن المدينين.",
            "ادعوا لي بتفريج همي وتيسير أمري المعسّر، لعل فيكم من لو أقسم على الله لأبره."
        ],
        rizq: [
            "أسعى لوظيفة كريمة تعفني وتعينني على بر أهلي، ادعوا لي بالتيسير والرزق المبارك.",
            "اللهم اكفني بحلالك عن حرامك وأغنني بفضلك عمن سواك.. ادعوا لي بالبركة في الرزق.",
            "ادعوا لأخي بتيسير زواجه وفتح أبواب الفضل له."
        ],
        tawfeeq: [
            "امتحاني غداً، أسألكم الدعاء بالتيسير والتوفيق وأن يفتح الله عليّ فتوح العارفين 🎓",
            "مقبل على خطوة مصيرية في حياتي، أسألكم دعوة صالحة بالرشد والسداد.",
            "اللهم لا سهل إلا ما جعلته سهلاً، ادعوا لي بالتوفيق في دراستي وعملي."
        ],
        hidaya: [
            "ادعوا لي بصلاح القلب والثبات على الصلاة، فالقلوب بين أصبعين من أصابع الرحمن 🤍",
            "ادعوا لأولادي بالهداية والصحبة الصالحة وأن يحفظهم الله من كل سوء.",
            "اللهم يا مقلب القلوب ثبت قلبي على دينك.. دعوة منكم تعينني على طاعة الله."
        ],
        rahma: [
            "اللهم ارحم والدي واغفر له واجعل قبره روضة من رياض الجنة واجمعنا به في الفردوس الأعلى 🌿",
            "ادعوا لفقيدنا بالرحمة والمغفرة ونور القبر وأنس الوحشة.. نسألكم الفاتحة.",
            "اللهم اغفر لجميع موتى المسلمين الذين شهدوا لك بالوحدانية ولنبيك بالرسالة."
        ]
    };

    // قائمة الأدعية التأسيسية الدافئة (Seed Duas) لتظهر فوراً دون انقطاع حتى بدون إنترنت
    const SEED_DUAS = [
        {
            id: "seed_1",
            category: "shifa",
            author: "ابن بار بوالدته",
            text: "أمي ترقد في العناية المركزة، أسألكم بالله أن تدعوا لها بالشفاء العاجل وأن يقر أعيننا بسلامتها وابتسامتها في بيتنا من جديد 🤲",
            timestamp: Date.now() - 1000 * 60 * 45, // منذ 45 دقيقة
            amenCount: 84
        },
        {
            id: "seed_2",
            category: "faraj",
            author: "مكروب يرجو فرج الله",
            text: "أمر بكرب شديد وهمٍّ جثم على صدري لا يعلم به إلا الله، أسألكم دعوة خالصة بظهر الغيب أن يرزقني الله السكينة ويفرج همي عاجلاً.",
            timestamp: Date.now() - 1000 * 60 * 120, // منذ ساعتين
            amenCount: 126
        },
        {
            id: "seed_3",
            category: "tawfeeq",
            author: "طالب علم يرجو التوفيق",
            text: "امتحاني النهائي غداً، اجتهدت طوال العام وأرجو منكم دعوة بالتيسير والفتوح وأن يشرح الله صدري ويذكرني ما نسيت 🎓",
            timestamp: Date.now() - 1000 * 60 * 210, // منذ 3 ساعات
            amenCount: 67
        },
        {
            id: "seed_4",
            category: "rizq",
            author: "شاب يسعى للعفاف",
            text: "أسعى للحصول على وظيفة حلال تعفني وتعينني على بر والديّ وتأسيس بيت مسلم، ادعوا لي بالتيسير والبركة في السعي 🤲",
            timestamp: Date.now() - 1000 * 60 * 360, // منذ 6 ساعات
            amenCount: 92
        },
        {
            id: "seed_5",
            category: "hidaya",
            author: "أم تدعو لذريتها",
            text: "ادعوا لأبنائي وبناتي بصلاح القلب والهداية والمحافظة على صلاتهم في وقتها، فاللهم احفظ أبناءنا وأبناء المسلمين جميعاً 🤍",
            timestamp: Date.now() - 1000 * 60 * 720, // منذ 12 ساعة
            amenCount: 153
        },
        {
            id: "seed_6",
            category: "rahma",
            author: "مشتاق لوالده رحمه الله",
            text: "رحل والدي الحبيب عن الدنيا وترك فراغاً كبيراً في حياتنا، أسألكم الدعاء له بالرحمة والمغفرة وأن يفسح الله في قبره ويجعله روضة من رياض الجنة 🌿",
            timestamp: Date.now() - 1000 * 60 * 1440, // منذ يوم
            amenCount: 218
        },
        {
            id: "seed_7",
            category: "shifa",
            author: "أختكم في الله",
            text: "طفلي الصغير يعاني من حمى ووعكة صحية شديدة، أسأل كل من يقرأ كلماتي أن يدعو له بالشفاء العاجل وأن يقر عيني بعافيته.",
            timestamp: Date.now() - 1000 * 60 * 1800,
            amenCount: 110
        },
        {
            id: "seed_8",
            category: "faraj",
            author: "عبد فقير إلى عفو ربه",
            text: "عليّ دين أثقل كاهلي وأرق مضجعي، أسأل الله تعالى أن يقضي عني ديني ويغنيني بحلاله عن حرامه وبفضله عمن سواه.",
            timestamp: Date.now() - 1000 * 60 * 2600,
            amenCount: 79
        }
    ];

    // حالة التطبيق الداخلية
    let state = {
        allDuas: [],
        activeCategory: "all",
        votedDuas: new Set(),
        mySubmittedIds: new Set(),
        firebaseConnected: false,
        displayLimit: 9,
        lastSeenAmens: 0
    };

    /**
     * الحصول على مرجع قاعدة بيانات فايربيز
     */
    function getDb() {
        if (typeof window.getFirebaseDb === "function") {
            const db = window.getFirebaseDb();
            if (db) return db;
        }
        if (typeof firebase !== "undefined" && firebase.database) {
            try {
                if (!firebase.apps.length && typeof FIREBASE_CONFIG !== "undefined") {
                    firebase.initializeApp(FIREBASE_CONFIG);
                }
                return firebase.database();
            } catch (e) {
                console.warn("[WallOfDuas] Firebase init error:", e);
            }
        }
        return null;
    }

    /**
     * استرجاع البيانات المحفوظة محلياً
     */
    function loadLocalState() {
        try {
            // أصوات التأمين التي قام بها المستخدم سابقاً
            const voted = JSON.parse(localStorage.getItem("wall_duas_voted") || "[]");
            state.votedDuas = new Set(voted);

            // أدعية نشرها المستخدم نفسه
            const mine = JSON.parse(localStorage.getItem("my_wall_duas") || "[]");
            state.mySubmittedIds = new Set(mine);

            // آخر عدد تأمينات مسجل لأدعية المستخدم
            state.lastSeenAmens = parseInt(localStorage.getItem("my_wall_duas_last_amens") || "0", 10);

            // كاش الأدعية الكامل
            const cached = JSON.parse(localStorage.getItem("wall_duas_cache") || "null");
            if (Array.isArray(cached) && cached.length > 0) {
                state.allDuas = cached;
            } else {
                state.allDuas = [...SEED_DUAS];
            }
        } catch (e) {
            console.warn("[WallOfDuas] Error loading local storage:", e);
            state.allDuas = [...SEED_DUAS];
        }
    }

    /**
     * حفظ الكاش محلياً
     */
    function saveLocalCache() {
        try {
            localStorage.setItem("wall_duas_cache", JSON.stringify(state.allDuas.slice(0, 100)));
            localStorage.setItem("wall_duas_voted", JSON.stringify(Array.from(state.votedDuas)));
            localStorage.setItem("my_wall_duas", JSON.stringify(Array.from(state.mySubmittedIds)));
        } catch (e) {
            console.warn("[WallOfDuas] Error saving local storage:", e);
        }
    }

    /**
     * مزامنة الأدعية مع فايربيز في الوقت الفعلي
     */
    function initFirebaseSync() {
        const db = getDb();
        if (!db) {
            console.log("[WallOfDuas] Running in offline / local mode.");
            return;
        }

        try {
            const duasRef = db.ref("community_duas");
            duasRef.limitToLast(120).on("value", snapshot => {
                state.firebaseConnected = true;
                const data = snapshot.val();
                if (data) {
                    const cloudList = [];
                    Object.keys(data).forEach(key => {
                        const item = data[key];
                        cloudList.push({
                            id: key,
                            category: item.category || "faraj",
                            author: item.author || "فاعل خير",
                            text: item.text || "",
                            timestamp: item.timestamp || Date.now(),
                            amenCount: typeof item.amenCount === "number" ? item.amenCount : 1
                        });
                    });

                    // دمج الأدعية السحابية مع البذور الفريدة
                    const mergedMap = new Map();

                    // أولاً نضع السحابية
                    cloudList.forEach(d => mergedMap.set(d.id, d));

                    // ثانياً نضيف أدعية البذور إن لم تكن متوفرة بالسحابة
                    SEED_DUAS.forEach(d => {
                        if (!mergedMap.has(d.id)) {
                            mergedMap.set(d.id, d);
                        }
                    });

                    // فرز تنازلي حسب التاريخ
                    state.allDuas = Array.from(mergedMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                    saveLocalCache();
                    renderDuasGrid();
                    updateStatsBar();
                    checkRequesterNotification();
                } else {
                    // إذا كانت العقدة فارغة في فايربيز لأول مرة، نرفع البذور لتبدأ المنصة عامرة بالخير
                    SEED_DUAS.forEach(seed => {
                        try {
                            duasRef.child(seed.id).set({
                                category: seed.category,
                                author: seed.author,
                                text: seed.text,
                                timestamp: seed.timestamp,
                                amenCount: seed.amenCount
                            });
                        } catch (err) {}
                    });
                }
            });
        } catch (e) {
            console.warn("[WallOfDuas] Firebase listener error:", e);
        }
    }

    /**
     * فحص وإظهار إشعار دافئ لصاحب الدعاء عند عودته للتطبيق:
     * "✨ أبشر! [X] مسلماً أمّنوا على دعائك اليوم بظهر الغيب.. نسأل الله أن يتقبل ويفرج كربك"
     */
    function checkRequesterNotification() {
        if (!state.mySubmittedIds || state.mySubmittedIds.size === 0) return;

        let totalAmensOnMyDuas = 0;
        let myDuasCount = 0;

        state.allDuas.forEach(d => {
            if (state.mySubmittedIds.has(d.id)) {
                totalAmensOnMyDuas += (d.amenCount || 1);
                myDuasCount++;
            }
        });

        const bannerEl = document.getElementById("wall-my-duas-banner");
        if (bannerEl) {
            if (myDuasCount > 0) {
                bannerEl.style.display = "flex";
                const countSpan = bannerEl.querySelector(".banner-amen-count");
                if (countSpan) {
                    countSpan.textContent = totalAmensOnMyDuas.toLocaleString("ar-EG");
                }
            } else {
                bannerEl.style.display = "none";
            }
        }

        // إذا كان هناك زيادة جديدة في التأمينات عن آخر مرة شاهدها
        if (totalAmensOnMyDuas > state.lastSeenAmens && state.lastSeenAmens > 0) {
            const diff = totalAmensOnMyDuas - state.lastSeenAmens;
            setTimeout(() => {
                showWarmNotificationToast(
                    `✨ أبشر! انضم ${diff.toLocaleString("ar-EG")} مسلماً جديداً بالدعاء لك بظهر الغيب (الإجمالي: ${totalAmensOnMyDuas.toLocaleString("ar-EG")} تأمينة) 🤲`
                );
            }, 1500);
        }

        state.lastSeenAmens = totalAmensOnMyDuas;
        localStorage.setItem("my_wall_duas_last_amens", totalAmensOnMyDuas.toString());
    }

    /**
     * توست إشعار دافئ مخصص لحائط الدعاء
     */
    function showWarmNotificationToast(message) {
        if (typeof window.showToast === "function") {
            window.showToast(message);
            return;
        }

        let container = document.getElementById("wall-warm-toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "wall-warm-toast-container";
            container.className = "wall-warm-toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = "wall-warm-toast";
        toast.innerHTML = `
            <div class="toast-icon">🤲</div>
            <div class="toast-body">
                <strong>دعاء مستجاب بإذن الله</strong>
                <p>${message}</p>
            </div>
            <button type="button" class="toast-close" aria-label="إغلاق">&times;</button>
        `;

        toast.querySelector(".toast-close").onclick = () => {
            toast.classList.add("fade-out");
            setTimeout(() => toast.remove(), 300);
        };

        container.appendChild(toast);
        setTimeout(() => toast.classList.add("visible"), 50);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove("visible");
                setTimeout(() => toast.remove(), 400);
            }
        }, 8000);
    }

    /**
     * تحديث شريط الإحصائيات (Stats Bar)
     */
    function updateStatsBar() {
        const totalDuasEl = document.getElementById("wall-stat-total-duas");
        const totalAmensEl = document.getElementById("wall-stat-total-amens");
        const myDuasCountEl = document.getElementById("wall-stat-my-duas");

        let totalAmens = 0;
        state.allDuas.forEach(d => {
            totalAmens += (d.amenCount || 1);
        });

        if (totalDuasEl) {
            totalDuasEl.textContent = state.allDuas.length.toLocaleString("ar-EG");
        }
        if (totalAmensEl) {
            totalAmensEl.textContent = totalAmens.toLocaleString("ar-EG");
        }
        if (myDuasCountEl) {
            myDuasCountEl.textContent = state.mySubmittedIds.size.toLocaleString("ar-EG");
        }

        // تحديث بادج التبويب الخاص بي
        const minePillCount = document.getElementById("mine-pill-badge");
        if (minePillCount) {
            minePillCount.textContent = state.mySubmittedIds.size.toLocaleString("ar-EG");
        }
    }

    /**
     * تحويل الطابع الزمني إلى نص نسبي عربي بليغ
     */
    function formatTimeAgo(timestamp) {
        if (typeof window.formatArabicRelativeTime === "function") {
            const formatted = window.formatArabicRelativeTime(timestamp);
            if (formatted) return formatted;
        }

        if (!timestamp) return "منذ قليل";
        const diffMs = Date.now() - Number(timestamp);
        const mins = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (mins < 1) return "الآن";
        if (mins < 60) return `منذ ${mins} دقيقة`;
        if (hours === 1) return "منذ ساعة";
        if (hours === 2) return "منذ ساعتين";
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days === 1) return "منذ يوم";
        if (days === 2) return "منذ يومين";
        return `منذ ${days} أيام`;
    }

    /**
     * رسم شبكة بطاقات الأدعية (Duas Cards Grid)
     */
    function renderDuasGrid() {
        const grid = document.getElementById("wall-duas-grid");
        if (!grid) return;

        // تصفية حسب التصنيف النشط
        let filtered = state.allDuas;
        if (state.activeCategory === "mine") {
            filtered = state.allDuas.filter(d => state.mySubmittedIds.has(d.id));
        } else if (state.activeCategory !== "all") {
            filtered = state.allDuas.filter(d => d.category === state.activeCategory);
        }

        // في حال عدم وجود أدعية بالتصنيف
        if (filtered.length === 0) {
            if (state.activeCategory === "mine") {
                grid.innerHTML = `
                    <div class="wall-empty-state">
                        <div class="empty-icon">💌</div>
                        <h3>لم تنشر دعاءً بعد</h3>
                        <p>اكتب ما في قلبك بصدق، وسيقوم إخوتك في الله حول العالم بالتأمين والدعاء لك بظهر الغيب.</p>
                        <button type="button" class="btn btn-gold btn-open-request-dua">
                            <i class="fa-solid fa-hands-praying"></i> <span>اطلب دعاءً بظهر الغيب الآن</span>
                        </button>
                    </div>
                `;
            } else {
                grid.innerHTML = `
                    <div class="wall-empty-state">
                        <div class="empty-icon">🌿</div>
                        <h3>كن أول من يطلب الدعاء في هذا الباب</h3>
                        <p>شارك إخوانك حاجتك ليرفعوا أيديهم لك بالدعاء والتأمين.</p>
                        <button type="button" class="btn btn-gold btn-open-request-dua">
                            <i class="fa-solid fa-hands-praying"></i> <span>اطلب دعاءً الآن</span>
                        </button>
                    </div>
                `;
            }
            bindOpenModalButtons();
            return;
        }

        // تحديد العدد المعروض
        const visibleList = filtered.slice(0, state.displayLimit);

        let html = "";
        visibleList.forEach(dua => {
            const cat = DUA_CATEGORIES[dua.category] || DUA_CATEGORIES.faraj;
            const isVoted = state.votedDuas.has(dua.id);
            const isMyDua = state.mySubmittedIds.has(dua.id);
            const timeAgo = formatTimeAgo(dua.timestamp);
            const amenCount = (dua.amenCount || 1).toLocaleString("ar-EG");

            html += `
                <article class="dua-wall-card ${isMyDua ? 'my-dua-card' : ''}" data-id="${dua.id}" data-category="${dua.category}">
                    <div class="dua-card-header">
                        <div class="dua-author-box">
                            <div class="dua-avatar">
                                <i class="fa-solid fa-user-shield"></i>
                            </div>
                            <div class="dua-author-info">
                                <span class="dua-author-name">${escapeHtml(dua.author || "فاعل خير")}</span>
                                <span class="dua-time" title="تاريخ النشر">${timeAgo}</span>
                            </div>
                        </div>
                        <div class="dua-category-badge" style="--badge-color: ${cat.color};">
                            <span>${cat.icon}</span>
                            <span>${cat.label}</span>
                        </div>
                    </div>

                    ${isMyDua ? `
                        <div class="dua-my-tag">
                            <i class="fa-solid fa-heart text-gold"></i>
                            <span>دعاؤك المنشور — يتابعه المسلمون بالدعاء لك</span>
                        </div>
                    ` : ''}

                    <div class="dua-card-body">
                        <p class="dua-text">"${escapeHtml(dua.text)}"</p>
                    </div>

                    <div class="dua-hadith-pill">
                        <i class="fa-solid fa-feather-pointed text-gold"></i>
                        <span>«الملَك الموكّل يقول: آمين، ولكَ بمثل»</span>
                    </div>

                    <div class="dua-card-footer">
                        <button type="button" 
                                class="btn-wall-amen ${isVoted ? 'voted' : ''}" 
                                data-id="${dua.id}"
                                ${isVoted ? 'disabled' : ''}
                                title="${isVoted ? 'تم التأمين والدعاء بظهر الغيب' : 'اضغط للتأمين والدعاء لأخيك ونيل أجر: ولك بمثل'}">
                            <span class="amen-icon">${isVoted ? '✓' : '🤲'}</span>
                            <span class="amen-label">${isVoted ? 'أمّنتَ ودعوتَ له' : 'آمَنْتُ وَدَعَوْتُ لَكَ'}</span>
                            <span class="amen-badge-count" id="amen-count-${dua.id}">${amenCount}</span>
                        </button>

                        <div class="dua-card-actions">
                            <button type="button" class="btn-card-icon-action btn-share-dua-wa" data-id="${dua.id}" title="مشاركة الدعاء عبر واتساب">
                                <i class="fa-brands fa-whatsapp"></i>
                            </button>
                            <button type="button" class="btn-card-icon-action btn-copy-dua-text" data-id="${dua.id}" title="نسخ نص الدعاء">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        });

        // زر عرض المزيد إن وُجد
        if (filtered.length > state.displayLimit) {
            html += `
                <div class="wall-load-more-box">
                    <button type="button" class="btn btn-outline btn-load-more-duas" id="btn-load-more-duas">
                        <i class="fa-solid fa-arrow-down-short-wide"></i> 
                        <span>عرض المزيد من دعوات الإخوة (${(filtered.length - state.displayLimit).toLocaleString("ar-EG")})</span>
                    </button>
                </div>
            `;
        }

        grid.innerHTML = html;
        bindCardEvents();
    }

    /**
     * ربط أحداث النقر للبطاقات (التأمين، المشاركة، النسخ)
     */
    function bindCardEvents() {
        // 1. أزرار التأمين
        document.querySelectorAll(".btn-wall-amen:not(.voted)").forEach(btn => {
            btn.onclick = function(e) {
                e.preventDefault();
                const id = this.getAttribute("data-id");
                handleAmenClick(id, this);
            };
        });

        // 2. زر عرض المزيد
        const loadMoreBtn = document.getElementById("btn-load-more-duas");
        if (loadMoreBtn) {
            loadMoreBtn.onclick = function() {
                state.displayLimit += 6;
                renderDuasGrid();
            };
        }

        // 3. أزرار المشاركة عبر واتساب
        document.querySelectorAll(".btn-share-dua-wa").forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute("data-id");
                shareDua(id, "whatsapp");
            };
        });

        // 4. أزرار النسخ
        document.querySelectorAll(".btn-copy-dua-text").forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute("data-id");
                shareDua(id, "copy");
            };
        });

        bindOpenModalButtons();
    }

    /**
     * التعامل مع ضغطة "آمَنْتُ وَدَعَوْتُ لَكَ 🤲"
     */
    function handleAmenClick(duaId, buttonEl) {
        if (!duaId || state.votedDuas.has(duaId)) return;

        // تسجيل التصويت محلياً
        state.votedDuas.add(duaId);

        // اهتزاز تفاعلي هادئ
        if ("vibrate" in navigator) {
            try { navigator.vibrate([25, 40, 25]); } catch (e) {}
        }

        // نغمة صوتية شجية
        if (typeof window.playCompletionChime === "function") {
            window.playCompletionChime();
        }

        // تحديث محلي في الذاكرة
        const targetDua = state.allDuas.find(d => d.id === duaId);
        if (targetDua) {
            targetDua.amenCount = (targetDua.amenCount || 0) + 1;
        }

        // تحديث مظهر الزر فوراً
        if (buttonEl) {
            buttonEl.classList.add("voted", "pulse-amen");
            buttonEl.disabled = true;
            buttonEl.innerHTML = `
                <span class="amen-icon">✓</span>
                <span class="amen-label">أمّنتَ ودعوتَ له</span>
                <span class="amen-badge-count">${(targetDua ? targetDua.amenCount : 1).toLocaleString("ar-EG")}</span>
            `;
            setTimeout(() => buttonEl.classList.remove("pulse-amen"), 800);
        }

        // إظهار البشارة النبوية العظيمة: «قال الملك: ولكَ بمثل!»
        showFloatingBlessing(buttonEl);

        // إضافة حسنة لبستان الطاعات إن كان متوفراً
        if (typeof window.addSpiritualGardenDeed === "function") {
            window.addSpiritualGardenDeed("dua", 1);
        }

        // مزامنة مع فايربيز
        const db = getDb();
        if (db) {
            try {
                db.ref("community_duas/" + duaId + "/amenCount").transaction(curr => (curr || 0) + 1);
                db.ref("stats/globalCommunityAmensCount").transaction(curr => (curr || 0) + 1);
            } catch (err) {
                console.warn("[WallOfDuas] Error syncing amen to Firebase:", err);
            }
        }

        saveLocalCache();
        updateStatsBar();
    }

    /**
     * تأثير بصري طائر للبشارة النبوية («ولكَ بمثل»)
     */
    function showFloatingBlessing(targetElement) {
        if (!targetElement) return;

        const rect = targetElement.getBoundingClientRect();
        const pill = document.createElement("div");
        pill.className = "floating-blessing-pill";
        pill.innerHTML = `<span>✨ قال الملك: ولكَ بمثل!</span>`;

        document.body.appendChild(pill);

        // تحديد الموقع فوق الزر
        const top = rect.top + window.scrollY - 36;
        const left = rect.left + window.scrollX + (rect.width / 2);

        pill.style.top = `${top}px`;
        pill.style.left = `${left}px`;

        requestAnimationFrame(() => {
            pill.classList.add("active");
        });

        setTimeout(() => {
            pill.classList.remove("active");
            pill.classList.add("fade-out");
            setTimeout(() => pill.remove(), 400);
        }, 2200);
    }

    /**
     * مشاركة الدعاء
     */
    function shareDua(duaId, type) {
        const dua = state.allDuas.find(d => d.id === duaId);
        if (!dua) return;

        const siteUrl = (typeof window.getPublicAppUrl === "function") ? window.getPublicAppUrl() : window.location.href.split("#")[0];
        const shareText = `🤲 دعاء بظهر الغيب من إخوانك في زاد المسلم:\n"${dua.text}"\n(صاحب الدعاء: ${dua.author})\n\nادعُ له وأمّن على دعائه لتنال بشارة النبي ﷺ: «ولكَ بمثل» 🌿\n${siteUrl}#wall-of-duas`;

        if (type === "whatsapp") {
            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
            window.open(url, "_blank");
        } else if (type === "copy") {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareText).then(() => {
                    if (typeof window.showToast === "function") {
                        window.showToast("تم نسخ نص الدعاء ورابط المشاركة بنجاح 📋");
                    }
                }).catch(() => fallbackCopy(shareText));
            } else {
                fallbackCopy(shareText);
            }
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        if (typeof window.showToast === "function") {
            window.showToast("تم نسخ نص الدعاء ورابط المشاركة 📋");
        }
    }

    /**
     * إعداد نافذة "اطلب دعاءً بظهر الغيب" (Request Dua Modal)
     */
    function initRequestModal() {
        const modal = document.getElementById("modal-request-dua");
        if (!modal) return;

        const closeBtn = document.getElementById("btn-close-request-dua-modal");
        const form = document.getElementById("form-request-dua");
        const categorySelect = document.getElementById("request-dua-category");
        const textarea = document.getElementById("request-dua-text");
        const authorInput = document.getElementById("request-dua-author");
        const charCountEl = document.getElementById("request-dua-char-count");
        const templatesContainer = document.getElementById("request-dua-templates");

        // إغلاق النافذة
        function closeModal() {
            modal.classList.remove("open");
            document.body.classList.remove("modal-open");
        }

        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }

        modal.addEventListener("click", e => {
            if (e.target === modal) closeModal();
        });

        // ملء قوالب الاقتراحات السريعة وفق التصنيف المحدد
        function updateTemplatesForCategory(catId) {
            if (!templatesContainer) return;
            templatesContainer.innerHTML = "";
            const list = QUICK_TEMPLATES[catId] || QUICK_TEMPLATES.faraj;

            list.forEach(tpl => {
                const chip = document.createElement("button");
                chip.type = "button";
                chip.className = "quick-tpl-chip";
                chip.textContent = tpl;
                chip.onclick = () => {
                    if (textarea) {
                        textarea.value = tpl;
                        textarea.focus();
                        updateCharCount();
                    }
                };
                templatesContainer.appendChild(chip);
            });
        }

        if (categorySelect) {
            categorySelect.addEventListener("change", () => {
                updateTemplatesForCategory(categorySelect.value);
            });
            updateTemplatesForCategory(categorySelect.value || "faraj");
        }

        // عداد الحروف
        function updateCharCount() {
            if (!textarea || !charCountEl) return;
            const len = textarea.value.length;
            charCountEl.textContent = `${len} / 280`;
            if (len > 280) {
                charCountEl.classList.add("limit-exceeded");
            } else {
                charCountEl.classList.remove("limit-exceeded");
            }
        }

        if (textarea) {
            textarea.addEventListener("input", updateCharCount);
        }

        // إرسال النموذج ونشر الدعاء
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                const text = textarea ? textarea.value.trim() : "";
                if (!text) {
                    alert("يرجى كتابة نص الدعاء أولاً بارك الله فيك.");
                    return;
                }
                if (text.length > 300) {
                    alert("يرجى اختصار الدعاء إلى أقل من 280 حرفاً لتسهل قراءته والتأمين عليه.");
                    return;
                }

                const cat = categorySelect ? categorySelect.value : "faraj";
                const author = (authorInput && authorInput.value.trim()) ? authorInput.value.trim() : "أخوكم في الله";

                const newId = "dua_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
                const now = Date.now();

                const newDua = {
                    id: newId,
                    category: cat,
                    author: author,
                    text: text,
                    timestamp: now,
                    amenCount: 1
                };

                // 1. إضافته في ذاكرة المتصفح
                state.allDuas.unshift(newDua);
                state.mySubmittedIds.add(newId);
                state.votedDuas.add(newId); // صاحب الدعاء مؤمّن على دعائه تلقائياً

                // 2. مزامنته مع فايربيز ليظهر فوراً لكل المسلمين حول العالم
                const db = getDb();
                if (db) {
                    try {
                        const newRef = db.ref("community_duas").push();
                        const cloudKey = newRef.key;
                        newDua.id = cloudKey; // استخدام معرف فيربيز
                        state.mySubmittedIds.add(cloudKey);

                        newRef.set({
                            category: cat,
                            author: author,
                            text: text,
                            timestamp: (typeof firebase !== "undefined" && firebase.database && firebase.database.ServerValue) ? firebase.database.ServerValue.TIMESTAMP : now,
                            amenCount: 1
                        });

                        db.ref("stats/globalCommunityDuasCount").transaction(curr => (curr || 0) + 1);
                    } catch (err) {
                        console.warn("[WallOfDuas] Error pushing to Firebase:", err);
                    }
                }

                saveLocalCache();
                closeModal();
                form.reset();
                updateCharCount();

                // التبديل إلى تصنيف الكل وإعادة الرسم
                state.activeCategory = "all";
                document.querySelectorAll(".wall-filter-pill").forEach(p => {
                    p.classList.toggle("active", p.getAttribute("data-cat") === "all");
                });

                renderDuasGrid();
                updateStatsBar();

                // نغمة نجاح وبشارة
                if (typeof window.playCompletionChime === "function") {
                    window.playCompletionChime();
                }

                showWarmNotificationToast("تقبل الله! تم نشر دعائك بظهر الغيب، وسيبدأ إخوتك في التأمين والدعاء لك فوراً 🤲");

                // تمرير سلس للبطاقة الجديدة وإبرازها بنبض ذهبي
                setTimeout(() => {
                    const firstCard = document.querySelector(".dua-wall-card");
                    if (firstCard) {
                        firstCard.scrollIntoView({ behavior: "smooth", block: "center" });
                        firstCard.classList.add("prayer-card-newly-added");
                        setTimeout(() => firstCard.classList.remove("prayer-card-newly-added"), 5000);
                    }
                }, 300);
            };
        }
    }

    /**
     * ربط أزرار فتح النافذة المنبثقة
     */
    function bindOpenModalButtons() {
        document.querySelectorAll(".btn-open-request-dua").forEach(btn => {
            btn.onclick = function() {
                const modal = document.getElementById("modal-request-dua");
                if (modal) {
                    modal.classList.add("open");
                    document.body.classList.add("modal-open");
                    const textarea = document.getElementById("request-dua-text");
                    if (textarea) setTimeout(() => textarea.focus(), 200);
                }
            };
        });
    }

    /**
     * تفعيل أزرار فلترة التصنيفات (Filter Pills)
     */
    function initFilterPills() {
        const container = document.getElementById("wall-filter-pills");
        if (!container) return;

        container.querySelectorAll(".wall-filter-pill").forEach(pill => {
            pill.onclick = function() {
                const cat = this.getAttribute("data-cat");
                if (!cat || cat === state.activeCategory) return;

                container.querySelectorAll(".wall-filter-pill").forEach(p => p.classList.remove("active"));
                this.classList.add("active");

                state.activeCategory = cat;
                state.displayLimit = 9;
                renderDuasGrid();
            };
        });
    }

    /**
     * الهروب من وسوم HTML لمنع ثغرات XSS
     */
    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * التهيئة الشاملة لحائط الأدعية
     */
    function init() {
        loadLocalState();
        initFilterPills();
        initRequestModal();
        bindOpenModalButtons();
        renderDuasGrid();
        updateStatsBar();
        checkRequesterNotification();

        // بدء مزامنة فايربيز بعد نصف ثانية لضمان اكتمال تحميل الصفحة
        setTimeout(initFirebaseSync, 400);

        // تحديث نسبي للتوقيت كل دقيقة
        setInterval(() => {
            document.querySelectorAll(".dua-time").forEach(el => {
                const card = el.closest(".dua-wall-card");
                if (card) {
                    const id = card.getAttribute("data-id");
                    const dua = state.allDuas.find(d => d.id === id);
                    if (dua) {
                        el.textContent = formatTimeAgo(dua.timestamp);
                    }
                }
            });
        }, 60000);
    }

    // تشغيل عند اكتمال الـ DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // تصدير واجهة برمجية مصغرة لربطها من الصفحات الأخرى
    window.WallOfDuas = {
        openModal: function() {
            const modal = document.getElementById("modal-request-dua");
            if (modal) {
                modal.classList.add("open");
                document.body.classList.add("modal-open");
            }
        },
        refresh: function() {
            renderDuasGrid();
            updateStatsBar();
        }
    };

})(window, document);
