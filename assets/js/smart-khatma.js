/**
 * smart-khatma.js
 * نظام "الختمة الذكية" والالتزام اليومي (Personal Smart Khatma Planner & Tracker + Streaks + Badges)
 * لتطبيق زاد المسلم
 */

(function(window, document) {
    "use strict";

    const TOTAL_QURAN_PAGES = 604;
    const STORAGE_KEY_PLAN = "zad_smart_khatma_plan";
    const STORAGE_KEY_BADGES = "zad_user_badges_unlocked";
    const STORAGE_KEY_STREAK = "zad_khatma_streak_data";

    // فهرس مبسط لسور القرآن لتحديد اسم السورة ورقم الجزء
    const SURAH_PAGES = [
        { id: 1, name: "الفاتحة", page: 1 }, { id: 2, name: "البقرة", page: 2 },
        { id: 3, name: "آل عمران", page: 50 }, { id: 4, name: "النساء", page: 77 },
        { id: 5, name: "المائدة", page: 106 }, { id: 6, name: "الأنعام", page: 128 },
        { id: 7, name: "الأعراف", page: 151 }, { id: 8, name: "الأنفال", page: 177 },
        { id: 9, name: "التوبة", page: 187 }, { id: 10, name: "يونس", page: 208 },
        { id: 11, name: "هود", page: 221 }, { id: 12, name: "يوسف", page: 235 },
        { id: 13, name: "الرعد", page: 249 }, { id: 14, name: "إبراهيم", page: 255 },
        { id: 15, name: "الحجر", page: 262 }, { id: 16, name: "النحل", page: 267 },
        { id: 17, name: "الإسراء", page: 282 }, { id: 18, name: "الكهف", page: 293 },
        { id: 19, name: "مريم", page: 305 }, { id: 20, name: "طه", page: 312 },
        { id: 21, name: "الأنبياء", page: 322 }, { id: 22, name: "الحج", page: 332 },
        { id: 23, name: "المؤمنون", page: 342 }, { id: 24, name: "النور", page: 350 },
        { id: 25, name: "الفرقان", page: 359 }, { id: 26, name: "الشعراء", page: 367 },
        { id: 27, name: "النمل", page: 377 }, { id: 28, name: "القصص", page: 385 },
        { id: 29, name: "العنكبوت", page: 396 }, { id: 30, name: "الروم", page: 404 },
        { id: 31, name: "لقمان", page: 411 }, { id: 32, name: "السجدة", page: 415 },
        { id: 33, name: "الأحزاب", page: 418 }, { id: 34, name: "سبأ", page: 428 },
        { id: 35, name: "فاطر", page: 434 }, { id: 36, name: "يس", page: 440 },
        { id: 37, name: "الصافات", page: 446 }, { id: 38, name: "ص", page: 453 },
        { id: 39, name: "الزمر", page: 458 }, { id: 40, name: "غافر", page: 467 },
        { id: 41, name: "فصلت", page: 477 }, { id: 42, name: "الشورى", page: 483 },
        { id: 43, name: "الزخرف", page: 489 }, { id: 44, name: "الدخان", page: 496 },
        { id: 45, name: "الجاثية", page: 499 }, { id: 46, name: "الأحقاف", page: 502 },
        { id: 47, name: "محمد", page: 507 }, { id: 48, name: "الفتح", page: 511 },
        { id: 49, name: "الحجرات", page: 515 }, { id: 50, name: "ق", page: 518 },
        { id: 51, name: "الذاريات", page: 520 }, { id: 52, name: "الطور", page: 523 },
        { id: 53, name: "النجم", page: 526 }, { id: 54, name: "القمر", page: 528 },
        { id: 55, name: "الرحمن", page: 531 }, { id: 56, name: "الواقعة", page: 534 },
        { id: 57, name: "الحديد", page: 537 }, { id: 58, name: "المجادلة", page: 542 },
        { id: 59, name: "الحشر", page: 545 }, { id: 60, name: "الممتحنة", page: 549 },
        { id: 61, name: "الصف", page: 551 }, { id: 62, name: "الجمعة", page: 553 },
        { id: 63, name: "المنافقون", page: 554 }, { id: 64, name: "التغابن", page: 556 },
        { id: 65, name: "الطلاق", page: 558 }, { id: 66, name: "التحريم", page: 560 },
        { id: 67, name: "الملك", page: 562 }, { id: 68, name: "القلم", page: 564 },
        { id: 69, name: "الحاقة", page: 566 }, { id: 70, name: "المعارج", page: 568 },
        { id: 71, name: "نوح", page: 570 }, { id: 72, name: "الجن", page: 572 },
        { id: 73, name: "المزمل", page: 574 }, { id: 74, name: "المدثر", page: 575 },
        { id: 75, name: "القيامة", page: 577 }, { id: 76, name: "الإنسان", page: 578 },
        { id: 77, name: "المرسلات", page: 580 }, { id: 78, name: "النبأ", page: 582 },
        { id: 79, name: "النازعات", page: 583 }, { id: 80, name: "عبس", page: 585 },
        { id: 81, name: "التكوير", page: 586 }, { id: 82, name: "الانفطار", page: 587 },
        { id: 83, name: "المطففين", page: 587 }, { id: 84, name: "الانشقاق", page: 589 },
        { id: 85, name: "البروج", page: 590 }, { id: 86, name: "الطارق", page: 591 },
        { id: 87, name: "الأعلى", page: 591 }, { id: 88, name: "الغاشية", page: 592 },
        { id: 89, name: "الفجر", page: 593 }, { id: 90, name: "البلد", page: 594 },
        { id: 91, name: "الشمس", page: 595 }, { id: 92, name: "الليل", page: 595 },
        { id: 93, name: "الضحى", page: 596 }, { id: 94, name: "الشرح", page: 596 },
        { id: 95, name: "التين", page: 597 }, { id: 96, name: "العلق", page: 597 },
        { id: 97, name: "القدر", page: 598 }, { id: 98, name: "البينة", page: 598 },
        { id: 99, name: "الزلزلة", page: 599 }, { id: 100, name: "العاديات", page: 599 },
        { id: 101, name: "القارعة", page: 600 }, { id: 102, name: "التكاثر", page: 600 },
        { id: 103, name: "العصر", page: 601 }, { id: 104, name: "الهمزة", page: 601 },
        { id: 105, name: "الفيل", page: 601 }, { id: 106, name: "قريش", page: 602 },
        { id: 107, name: "الماعون", page: 602 }, { id: 108, name: "الكوثر", page: 602 },
        { id: 109, name: "الكافرون", page: 603 }, { id: 110, name: "النصر", page: 603 },
        { id: 111, name: "المسد", page: 603 }, { id: 112, name: "الإخلاص", page: 604 },
        { id: 113, name: "الفلق", page: 604 }, { id: 114, name: "الناس", page: 604 }
    ];

    // قائمة الأوسمة والإنجازات التشجيعية
    const ALL_BADGES = [
        {
            id: "badge_first_day",
            title: "خطوة البداية 🌱",
            desc: "أنجزت أول يوم في وردك القرآني",
            icon: "fa-seedling",
            color: "#10b981"
        },
        {
            id: "badge_streak_3",
            title: "همّة مباركة 🌿",
            desc: "واصلت وردك لـ 3 أيام متتالية",
            icon: "fa-leaf",
            color: "#34d399"
        },
        {
            id: "badge_streak_7",
            title: "شعلة الأسبوع 🔥",
            desc: "التزام كامل لـ 7 أيام متتالية دون انقطاع",
            icon: "fa-fire-flame-curved",
            color: "#f59e0b"
        },
        {
            id: "badge_streak_15",
            title: "بدر الالتزام 🌕",
            desc: "15 يوماً من النور المستمر مع القرآن",
            icon: "fa-moon",
            color: "#fbbf24"
        },
        {
            id: "badge_streak_30",
            title: "نور الشهر 💎",
            desc: "30 يوماً من الطاعة والثبات الراسخ",
            icon: "fa-gem",
            color: "#60a5fa"
        },
        {
            id: "badge_tasbih_100",
            title: "رطّب لسانك 📿",
            desc: "أتممت 100 تسبيحة في السبحة الإلكترونية",
            icon: "fa-hand-dots",
            color: "#a78bfa"
        },
        {
            id: "badge_tasbih_1000",
            title: "ألفية الذكر 🌟",
            desc: "بلغت 1,000 تسبيحة في سبحتك",
            icon: "fa-star",
            color: "#eab308"
        },
        {
            id: "badge_khatma_first",
            title: "تاج الختام 👑",
            desc: "أتممت ختمة كاملة لكتاب الله العظيم",
            icon: "fa-crown",
            color: "#f59e0b"
        },
        {
            id: "badge_share_hero",
            title: "سفير الخير 🕊️",
            desc: "شاركت بطاقة إيمانية لنشر الأجر في الستوري",
            icon: "fa-share-nodes",
            color: "#38bdf8"
        },
        {
            id: "badge_mood_peace",
            title: "طمأنينة القلب 🌿",
            desc: "استعنت ببوصلة السكينة وأرحت قلبك بآيات وأدعية الشفاء الروحي",
            icon: "fa-heart-pulse",
            color: "#10b981"
        }
    ];

    function getTodayString() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }

    function getYesterdayString() {
        const d = new Date(Date.now() - 86400000);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }

    function getSurahNameByPage(page) {
        if (!page || page < 1) return "الفاتحة";
        if (page > 604) page = 604;
        for (let i = SURAH_PAGES.length - 1; i >= 0; i--) {
            if (page >= SURAH_PAGES[i].page) {
                return SURAH_PAGES[i].name;
            }
        }
        return "الفاتحة";
    }

    const SmartKhatmaService = {
        plan: null,
        streakData: null,
        unlockedBadges: [],

        init() {
            this.loadState();
            this.verifyStreakIntegrity();
            this.checkAndAwardBadges();
            this.renderAllUI();
        },

        loadState() {
            try {
                const savedPlan = localStorage.getItem(STORAGE_KEY_PLAN);
                if (savedPlan) {
                    this.plan = JSON.parse(savedPlan);
                } else {
                    // خطة افتراضية: ختمة في شهر (30 يوماً)
                    this.plan = {
                        isActive: true,
                        targetDays: 30,
                        pagesPerDay: 20,
                        pagesPerPrayer: 4,
                        currentDay: 1,
                        startPage: 1,
                        completedPagesCount: 0,
                        lastCompletedDate: null,
                        totalKhatmas: 0,
                        startDate: getTodayString()
                    };
                    this.savePlan();
                }

                const savedStreak = localStorage.getItem(STORAGE_KEY_STREAK);
                if (savedStreak) {
                    this.streakData = JSON.parse(savedStreak);
                } else {
                    this.streakData = {
                        currentStreak: 1,
                        highestStreak: 1,
                        lastActiveDate: getTodayString()
                    };
                    this.saveStreak();
                }

                const savedBadges = localStorage.getItem(STORAGE_KEY_BADGES);
                this.unlockedBadges = savedBadges ? JSON.parse(savedBadges) : [];
            } catch (e) {
                console.error("SmartKhatma: Error loading state", e);
            }
        },

        savePlan() {
            try {
                localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(this.plan));
            } catch (e) {}
        },

        saveStreak() {
            try {
                localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(this.streakData));
            } catch (e) {}
        },

        saveBadges() {
            try {
                localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(this.unlockedBadges));
            } catch (e) {}
        },

        verifyStreakIntegrity() {
            const today = getTodayString();
            const yesterday = getYesterdayString();

            if (!this.streakData) return;
            const last = this.streakData.lastActiveDate;

            if (last && last !== today && last !== yesterday) {
                // انقطع أكثر من يوم، يُعاد العداد إلى 1 عند استئناف الطاعة
                this.streakData.currentStreak = 1;
                this.saveStreak();
            }
        },

        setPlan(targetDays) {
            targetDays = parseInt(targetDays, 10) || 30;
            if (targetDays < 3) targetDays = 3;
            if (targetDays > 365) targetDays = 365;

            const pagesPerDay = Math.max(1, Math.ceil(TOTAL_QURAN_PAGES / targetDays));
            const pagesPerPrayer = Math.max(1, Math.ceil(pagesPerDay / 5));

            this.plan = {
                isActive: true,
                targetDays: targetDays,
                pagesPerDay: pagesPerDay,
                pagesPerPrayer: pagesPerPrayer,
                currentDay: 1,
                startPage: 1,
                completedPagesCount: 0,
                lastCompletedDate: null,
                totalKhatmas: (this.plan && this.plan.totalKhatmas) || 0,
                startDate: getTodayString()
            };

            this.savePlan();
            this.renderAllUI();

            if (typeof window.showToast === "function") {
                window.showToast(`تم ضبط خطة الختمة بنجاح: ختمة خلال ${targetDays} يوماً (${pagesPerPrayer} صفحات بعد كل صلاة) ✨`);
            }
        },

        getTodayWirdPages() {
            if (!this.plan) return { fromPage: 1, toPage: 20, isCompletedToday: false };

            const today = getTodayString();
            const isCompletedToday = (this.plan.lastCompletedDate === today);

            const dayIndex = isCompletedToday ? Math.max(1, this.plan.currentDay - 1) : this.plan.currentDay;
            const fromPage = Math.min(TOTAL_QURAN_PAGES, ((dayIndex - 1) * this.plan.pagesPerDay) + 1);
            const toPage = Math.min(TOTAL_QURAN_PAGES, dayIndex * this.plan.pagesPerDay);

            return {
                fromPage: fromPage,
                toPage: toPage,
                pagesCount: Math.max(1, (toPage - fromPage) + 1),
                surahFrom: getSurahNameByPage(fromPage),
                surahTo: getSurahNameByPage(toPage),
                isCompletedToday: isCompletedToday,
                dayIndex: dayIndex
            };
        },

        markTodayWirdComplete() {
            const today = getTodayString();
            const yesterday = getYesterdayString();

            if (this.plan.lastCompletedDate === today) {
                if (typeof window.showToast === "function") {
                    window.showToast("ما شاء الله! لقد أتممت ورد اليوم بالفعل، تقبل الله طاعتك 🌿");
                }
                return;
            }

            // 1. تحديث الـ Streak
            if (this.streakData.lastActiveDate === yesterday) {
                this.streakData.currentStreak += 1;
            } else if (this.streakData.lastActiveDate !== today) {
                this.streakData.currentStreak = 1;
            }

            if (this.streakData.currentStreak > (this.streakData.highestStreak || 1)) {
                this.streakData.highestStreak = this.streakData.currentStreak;
            }
            this.streakData.lastActiveDate = today;
            this.saveStreak();

            // 2. تحديث الخطة
            const wird = this.getTodayWirdPages();
            this.plan.completedPagesCount = Math.min(TOTAL_QURAN_PAGES, this.plan.completedPagesCount + wird.pagesCount);
            this.plan.lastCompletedDate = today;
            this.plan.currentDay += 1;

            // فحص إتمام الختمة كاملة
            let isKhatmaFinished = false;
            if (this.plan.completedPagesCount >= TOTAL_QURAN_PAGES || this.plan.currentDay > this.plan.targetDays) {
                this.plan.totalKhatmas = (this.plan.totalKhatmas || 0) + 1;
                isKhatmaFinished = true;
                this.awardBadge("badge_khatma_first");
            }

            this.savePlan();

            // 3. فحص الأوسمة
            this.awardBadge("badge_first_day");
            if (this.streakData.currentStreak >= 3) this.awardBadge("badge_streak_3");
            if (this.streakData.currentStreak >= 7) this.awardBadge("badge_streak_7");
            if (this.streakData.currentStreak >= 15) this.awardBadge("badge_streak_15");
            if (this.streakData.currentStreak >= 30) this.awardBadge("badge_streak_30");

            // 4. تسجيل أجر قراءة صفحات الورد في حديقة الحسنات
            if (typeof window.addSpiritualGardenDeed === "function") {
                const count = (wird && wird.pagesCount) ? wird.pagesCount : 1;
                window.addSpiritualGardenDeed("quran", count * 5, count);
            }

            // 5. عرض احتفال وتحديث الشاشات
            this.renderAllUI();
            this.triggerCelebrationEffect(isKhatmaFinished);
        },

        awardBadge(badgeId) {
            if (this.unlockedBadges.includes(badgeId)) return;
            const badge = ALL_BADGES.find(b => b.id === badgeId);
            if (!badge) return;

            this.unlockedBadges.push(badgeId);
            this.saveBadges();

            // إشعار تهنئة بالحصول على وسام
            this.showBadgeUnlockedToast(badge);
        },

        checkAndAwardBadges() {
            // فحص التسبيح
            try {
                const tasbihTotal = parseInt(localStorage.getItem("total_dhikr_count") || localStorage.getItem("counter") || "0", 10);
                if (tasbihTotal >= 100) this.awardBadge("badge_tasbih_100");
                if (tasbihTotal >= 1000) this.awardBadge("badge_tasbih_1000");
            } catch (e) {}
        },

        showBadgeUnlockedToast(badge) {
            const toast = document.createElement("div");
            toast.className = "zad-badge-unlocked-toast";
            toast.innerHTML = `
                <div class="badge-toast-icon" style="background: ${badge.color}20; color: ${badge.color};">
                    <i class="fa-solid ${badge.icon}"></i>
                </div>
                <div class="badge-toast-content">
                    <div class="badge-toast-eyebrow">🎉 وسام جديد مكتسب!</div>
                    <div class="badge-toast-title">${badge.title}</div>
                    <div class="badge-toast-desc">${badge.desc}</div>
                </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add("show"), 100);
            setTimeout(() => {
                toast.classList.remove("show");
                setTimeout(() => toast.remove(), 400);
            }, 5000);
        },

        triggerCelebrationEffect(isFullKhatma) {
            // تشغيل صوت خفيف واهتزاز haptic
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate([100, 50, 150]);
            }

            if (isFullKhatma) {
                this.showFullKhatmaCelebrationModal();
            } else {
                if (typeof window.showToast === "function") {
                    window.showToast(`تقبل الله طاعتك! ✨ واصلت استمرارك لليوم الـ ${this.streakData.currentStreak} على التوالي`);
                }
            }
        },

        showFullKhatmaCelebrationModal() {
            const modal = document.createElement("div");
            modal.className = "zad-khatma-celebration-overlay";
            modal.innerHTML = `
                <div class="zad-khatma-celebration-box">
                    <div class="celebration-confetti-badge">👑</div>
                    <h2>مبارك! أتممت ختم كتاب الله العظيم</h2>
                    <p class="celebration-subtitle">هنيئاً لك ما حفظت وتدبرت.. أسأل الله أن يجعله نوراً لك في الدنيا والآخرة وشفيعاً لأهلك.</p>
                    <div class="celebration-stat-pills">
                        <div class="stat-pill"><span>عدد الصفحات</span><strong>604 صفحة</strong></div>
                        <div class="stat-pill"><span>الختمات المكتملة</span><strong>${this.plan.totalKhatmas} ختمة</strong></div>
                        <div class="stat-pill"><span>الاستمرارية</span><strong>${this.streakData.currentStreak} يوماً ✨</strong></div>
                    </div>
                    <div class="celebration-actions">
                        <button type="button" class="btn gold" onclick="SmartKhatmaService.startNewKhatma(); this.closest('.zad-khatma-celebration-overlay').remove();">
                            بدء ختمة جديدة مباركة 📖
                        </button>
                        <button type="button" class="btn outline" onclick="this.closest('.zad-khatma-celebration-overlay').remove();">
                            إغلاق ✕
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        },

        startNewKhatma() {
            this.setPlan(this.plan.targetDays || 30);
            if (typeof window.showToast === "function") {
                window.showToast("على بركة الله.. بدأت ختمتك المباركة الجديدة 🌿");
            }
        },

        openTodayWirdInMushaf() {
            const wird = this.getTodayWirdPages();
            const destination = 'quran-khatma?tab=mushaf&page=' + wird.fromPage;
            if (typeof window.openServiceView === 'function') window.openServiceView(destination, true);
            else (window.zadNavigate || location.assign.bind(location))('services.html#' + destination);
        },

        openSetupModal() {
            let existingModal = document.getElementById("khatma-setup-modal");
            if (existingModal) existingModal.remove();

            const currentDays = (this.plan && this.plan.targetDays) || 30;

            const modalHtml = `
                <div class="modal-overlay active" id="khatma-setup-modal" onclick="if(event.target===this)this.remove();" style="z-index: 99999;">
                    <div class="modal-card modal-box khatma-planner-modal">
                        <div class="modal-head">
                            <div class="modal-head-title">
                                <i class="fa-solid fa-compass-drafting text-gold"></i>
                                <span>تخطيط ختمتك الذكية المباركة</span>
                            </div>
                            <button type="button" class="btn-close-modal" aria-label="إغلاق" onclick="document.getElementById('khatma-setup-modal').remove();">&times;</button>
                        </div>
                        <div class="modal-body-content">
                            <p class="planner-lead">اختر المدة التي ترغب بختم القرآن الكريم خلالها، وسيقوم التطبيق بتقسيم الورد تلقائياً وتذكيرك بصفحاتك بعد كل صلاة:</p>

                            <div class="khatma-plans-selector">
                                <div class="plan-option ${currentDays === 15 ? 'active' : ''}" onclick="SmartKhatmaService.selectPlanOption(15, this)">
                                    <div class="plan-header">
                                        <span class="plan-badge">⚡ همّة عالية</span>
                                        <strong class="plan-days">15 يوماً</strong>
                                    </div>
                                    <div class="plan-desc">40 صفحة يومياً (8 صفحات بعد كل صلاة) • جزئين يومياً</div>
                                </div>

                                <div class="plan-option ${currentDays === 30 ? 'active' : ''}" onclick="SmartKhatmaService.selectPlanOption(30, this)">
                                    <div class="plan-header">
                                        <span class="plan-badge popular">🌟 الخطة الأنسب</span>
                                        <strong class="plan-days">30 يوماً (شهر)</strong>
                                    </div>
                                    <div class="plan-desc">20 صفحة يومياً (4 صفحات بعد كل صلاة) • جزء يومياً</div>
                                </div>

                                <div class="plan-option ${currentDays === 60 ? 'active' : ''}" onclick="SmartKhatmaService.selectPlanOption(60, this)">
                                    <div class="plan-header">
                                        <span class="plan-badge">🌿 تأنٍ وتدبر</span>
                                        <strong class="plan-days">60 يوماً (شهرين)</strong>
                                    </div>
                                    <div class="plan-desc">10 صفحات يومياً (صفحتان بعد كل صلاة) • نصف جزء يومياً</div>
                                </div>
                            </div>

                            <div class="custom-plan-input-row">
                                <label>أو حدد عدد الأيام حسب وقتك:</label>
                                <div class="input-with-action">
                                    <input type="number" id="custom-khatma-days-input" min="3" max="365" value="${currentDays}" placeholder="مثلاً: 45 يوماً">
                                    <span>يوم</span>
                                </div>
                            </div>

                            <div class="planner-actions">
                                <button type="button" class="btn btn-gold btn-confirm-plan" onclick="SmartKhatmaService.confirmSelectedPlan();">
                                    حفظ وتطبيق الخطة ✦
                                </button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('khatma-setup-modal').remove();">
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML("beforeend", modalHtml);
        },

        selectPlanOption(days, el) {
            document.querySelectorAll(".khatma-plans-selector .plan-option").forEach(p => p.classList.remove("active"));
            el.classList.add("active");
            const input = document.getElementById("custom-khatma-days-input");
            if (input) input.value = days;
        },

        confirmSelectedPlan() {
            const input = document.getElementById("custom-khatma-days-input");
            const days = input ? parseInt(input.value, 10) : 30;
            this.setPlan(days);
            const m = document.getElementById("khatma-setup-modal");
            if (m) m.remove();
        },

        openBadgesModal() {
            let existing = document.getElementById("zad-badges-modal");
            if (existing) existing.remove();

            const badgesHtml = ALL_BADGES.map(badge => {
                const isUnlocked = this.unlockedBadges.includes(badge.id);
                return `
                    <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}">
                        <div class="badge-item-icon" style="${isUnlocked ? `background: ${badge.color}20; color: ${badge.color}; border-color: ${badge.color};` : ''}">
                            <i class="fa-solid ${badge.icon}"></i>
                        </div>
                        <div class="badge-item-info">
                            <div class="badge-item-title">${badge.title} ${isUnlocked ? '✓' : '🔒'}</div>
                            <div class="badge-item-desc">${badge.desc}</div>
                        </div>
                    </div>
                `;
            }).join("");

            const modal = `
                <div class="modal-overlay active" id="zad-badges-modal" onclick="if(event.target===this)this.remove();" style="z-index: 99999;">
                    <div class="modal-card modal-box badges-modal-box">
                        <div class="modal-head">
                            <div class="modal-head-title">
                                <i class="fa-solid fa-trophy text-gold"></i>
                                <span>أوسمتي وإنجازاتي الإيمانية 🏆</span>
                            </div>
                            <button type="button" class="btn-close-modal" aria-label="إغلاق" onclick="document.getElementById('zad-badges-modal').remove();">&times;</button>
                        </div>
                        <div class="modal-body-content">
                            <div class="badges-stats-header">
                                <div class="stat-bubble">
                                    <strong>${this.unlockedBadges.length} / ${ALL_BADGES.length}</strong>
                                    <span>وسام مكتمل</span>
                                </div>
                                <div class="stat-bubble highlight">
                                    <strong>✨ ${this.streakData.currentStreak}</strong>
                                    <span>أيام متتالية</span>
                                </div>
                                <div class="stat-bubble">
                                    <strong>📖 ${this.plan.totalKhatmas}</strong>
                                    <span>ختمة كاملة</span>
                                </div>
                            </div>
                            <div class="badges-list-grid">
                                ${badgesHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML("beforeend", modal);
        },

        renderAllUI() {
            this.renderDashboardCard();
            this.renderHeaderPill();
        },

        renderHeaderPill() {
            // تحديث بادج الـ Streak في الهيدر إذا وُجد
            const streakPill = document.getElementById("header-streak-pill");
            if (streakPill) {
                streakPill.innerHTML = `✨ ${this.streakData.currentStreak} <span class="streak-label">يوم</span>`;
                streakPill.style.display = "inline-flex";
            }
            // تحديث شارة الـ Streak في بانل الأذكار والتسبيح
            const dhikrStreak = document.getElementById("dhikr-streak-num");
            if (dhikrStreak) {
                dhikrStreak.textContent = this.streakData.currentStreak;
            }
        },

        renderDashboardCard() {
            const container = document.getElementById("smart-khatma-dashboard-slot");
            if (!container) return;

            const wird = this.getTodayWirdPages();
            const pct = Math.min(100, Math.round((this.plan.completedPagesCount / TOTAL_QURAN_PAGES) * 100));

            container.innerHTML = `
                <div class="smart-khatma-card">
                    <div class="khatma-card-header">
                        <div class="khatma-header-title">
                            <div class="khatma-icon-tag"><i class="fa-solid fa-book-quran text-gold"></i></div>
                            <div>
                                <h3 class="khatma-title">ختمتي الذكية ووردي القرآني 🌿</h3>
                                <span class="khatma-subtitle">خطة الـ ${this.plan.targetDays} يوماً • ${this.plan.pagesPerPrayer} صفحات بعد كل صلاة</span>
                            </div>
                        </div>
                        <div class="khatma-streak-badge" onclick="SmartKhatmaService.openBadgesModal()" title="أوسمة الإنجاز والاستمرارية">
                            <span class="streak-num">${this.streakData.currentStreak}</span>
                            <span class="streak-txt">يوم مستمر</span>
                        </div>
                    </div>

                    <div class="khatma-progress-section">
                        <div class="khatma-progress-meta">
                            <span>إنجاز الختمة: <strong>${this.plan.completedPagesCount}</strong> من ${TOTAL_QURAN_PAGES} صفحة</span>
                            <span class="khatma-pct-gold">${pct}%</span>
                        </div>
                        <div class="khatma-bar-wrap">
                            <div class="khatma-bar-fill" style="width: ${pct}%;"></div>
                        </div>
                    </div>

                    <div class="today-wird-box ${wird.isCompletedToday ? 'completed' : ''}">
                        <div class="wird-box-info">
                            <span class="wird-eyebrow">
                                ${wird.isCompletedToday ? '✅ تم إنجاز ورد اليوم مباركاً' : `📖 ورد اليوم (اليوم ${wird.dayIndex} من ${this.plan.targetDays})`}
                            </span>
                            <div class="wird-pages-range">
                                من صفحة <strong>${wird.fromPage}</strong> (${wird.surahFrom}) إلى صفحة <strong>${wird.toPage}</strong> (${wird.surahTo})
                            </div>
                            <span class="wird-prayer-hint">المطلوب: ${this.plan.pagesPerPrayer} صفحات فقط بعد كل صلاة من الصلوات الخمس</span>
                        </div>
                        <div class="wird-box-actions">
                            <button type="button" class="btn gold btn-read-wird" onclick="SmartKhatmaService.openTodayWirdInMushaf()">
                                <i class="fa-solid fa-book-open"></i> <span>قراءة الورد</span>
                            </button>
                            ${!wird.isCompletedToday ? `
                                <button type="button" class="btn solid btn-complete-wird" onclick="SmartKhatmaService.markTodayWirdComplete()">
                                    <i class="fa-solid fa-check"></i> <span>تم الإنجاز</span>
                                </button>
                            ` : `
                                <span class="badge-done"><i class="fa-solid fa-circle-check"></i> تم بنجاح</span>
                            `}
                        </div>
                    </div>

                    <div class="khatma-card-footer">
                        <button type="button" class="btn-link-action" onclick="SmartKhatmaService.openSetupModal()">
                            <i class="fa-solid fa-sliders"></i> تغيير الخطة والمدة
                        </button>
                        <button type="button" class="btn-link-action" onclick="SmartKhatmaService.openBadgesModal()">
                            <i class="fa-solid fa-trophy text-gold"></i> عرض الأوسمة (${this.unlockedBadges.length} / ${ALL_BADGES.length})
                        </button>
                    </div>
                </div>
            `;
        }
    };

    window.SmartKhatmaService = SmartKhatmaService;

    // تهيئة الخدمة تلقائياً عند تحميل الصفحة
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => SmartKhatmaService.init());
    } else {
        SmartKhatmaService.init();
    }

})(window, document);
