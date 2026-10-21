/**
 * ==============================================================================
 * زاد المسلم — السبحة الإلكترونية التفاعلية المدمجة في لوحة الذكر (Smart In-Panel Tasbih)
 * تتيح للمستخدم التسبيح والتنقل بين الأذكار وضبط الأهداف مباشرة بدون أي نوافذ منبثقة
 * ==============================================================================
 */

(function(window, document) {
    "use strict";

    const STORAGE_KEY_LIFETIME = "zad_tasbih_lifetime_count";
    const STORAGE_KEY_TODAY = "zad_tasbih_today_count";
    const STORAGE_KEY_TODAY_DATE = "zad_tasbih_today_date";
    const STORAGE_KEY_SOUND = "zad_tasbih_sound_enabled";
    const STORAGE_KEY_HAPTIC = "zad_tasbih_haptic_enabled";

    const PRESET_ATHKAR = [
        {
            id: "tasbih_1",
            shortName: "سبحان الله وبحمده",
            text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
            virtue: "حبيبتان إلى الرحمن، خفيفتان على اللسان، ثقيلتان في الميزان.",
            defaultTarget: 33
        },
        {
            id: "tasbih_2",
            shortName: "أستغفر الله",
            text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
            virtue: "من لزم الاستغفار جعل الله له من كل هم فرجاً ومن كل ضيق مخرجاً.",
            defaultTarget: 100
        },
        {
            id: "tasbih_3",
            shortName: "الصلاة على النبي",
            text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
            virtue: "من صلى عليّ صلاة صلى الله عليه بها عشراً ورُفعت له بها عشر درجات.",
            defaultTarget: 33
        },
        {
            id: "tasbih_4",
            shortName: "الحوقلة",
            text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
            virtue: "كنز من تحت عرش الرحمن وباب عظيم لتفريج الكروب والهموم.",
            defaultTarget: 33
        },
        {
            id: "tasbih_5",
            shortName: "التوحيد",
            text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
            virtue: "كانت له عدل عشر رقاب، وكُتبت له مائة حسنة، ومُحيت عنه مائة سيئة.",
            defaultTarget: 100
        },
        {
            id: "tasbih_6",
            shortName: "الباقيات الصالحات",
            text: "سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلَا إِلَهَ إِلَّا اللَّهُ ، وَاللَّهُ أَكْبَرُ",
            virtue: "هن الباقيات الصالحات وأحب الكلام إلى الله تعالى.",
            defaultTarget: 33
        }
    ];

    let activeZkrIndex = 0;
    let currentRoundCount = 0;
    let currentTarget = 33;
    let sessionCount = 0;
    let todayCount = 0;
    let lifetimeCount = 0;
    let isSoundEnabled = true;
    let isHapticEnabled = true;
    let audioCtx = null;

    function getTodayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    const SmartTasbih = {
        init() {
            this.loadStats();
            this.renderPanelChips();
            this.updatePanelUI();
        },

        loadStats() {
            try {
                lifetimeCount = parseInt(localStorage.getItem(STORAGE_KEY_LIFETIME) || "0", 10);
                const savedDate = localStorage.getItem(STORAGE_KEY_TODAY_DATE);
                const todayKey = getTodayKey();

                if (savedDate === todayKey) {
                    todayCount = parseInt(localStorage.getItem(STORAGE_KEY_TODAY) || "0", 10);
                } else {
                    todayCount = 0;
                    localStorage.setItem(STORAGE_KEY_TODAY_DATE, todayKey);
                    localStorage.setItem(STORAGE_KEY_TODAY, "0");
                }

                const soundPref = localStorage.getItem(STORAGE_KEY_SOUND);
                isSoundEnabled = soundPref !== "false";

                const hapticPref = localStorage.getItem(STORAGE_KEY_HAPTIC);
                isHapticEnabled = hapticPref !== "false";
            } catch (e) {
                console.warn("SmartTasbih: Error reading storage", e);
            }
        },

        saveStats() {
            try {
                localStorage.setItem(STORAGE_KEY_LIFETIME, lifetimeCount.toString());
                localStorage.setItem(STORAGE_KEY_TODAY, todayCount.toString());
                localStorage.setItem(STORAGE_KEY_TODAY_DATE, getTodayKey());
            } catch (e) {}
        },

        playBeadClick() {
            if (!isSoundEnabled) return;
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) return;
                if (!audioCtx) audioCtx = new AudioContextClass();
                if (audioCtx.state === "suspended") audioCtx.resume();

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                const baseFreq = 520 + (currentRoundCount % 12) * 15;
                osc.type = "sine";
                osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.045);

                gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.045);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start();
                osc.stop(audioCtx.currentTime + 0.05);
            } catch (e) {}
        },

        playChimeSound() {
            if (!isSoundEnabled) return;
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) return;
                if (!audioCtx) audioCtx = new AudioContextClass();
                if (audioCtx.state === "suspended") audioCtx.resume();

                const now = audioCtx.currentTime;
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(freq, now + i * 0.08);

                    gain.gain.setValueAtTime(0.14, now + i * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);

                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + i * 0.08);
                    osc.stop(now + i * 0.08 + 0.5);
                });
            } catch (e) {}
        },

        triggerHaptic(type = "click") {
            if (!isHapticEnabled || !("vibrate" in navigator)) return;
            try {
                if (type === "complete") {
                    navigator.vibrate([60, 40, 80, 40, 120]);
                } else if (type === "milestone") {
                    navigator.vibrate([40, 30, 40]);
                } else {
                    navigator.vibrate(20);
                }
            } catch (e) {}
        },

        renderPanelChips() {
            const container = document.getElementById("dhikr-chips-strip");
            if (!container) return;

            container.innerHTML = PRESET_ATHKAR.map((item, idx) => `
                <button type="button" class="dhikr-chip ${idx === activeZkrIndex ? 'active' : ''}" onclick="SmartTasbih.switchZkr(${idx})">
                    ${item.shortName || item.text.split("،")[0].trim()}
                </button>
            `).join("");
        },

        switchZkr(index) {
            if (index < 0 || index >= PRESET_ATHKAR.length) return;
            activeZkrIndex = index;
            currentRoundCount = 0;
            const zkr = PRESET_ATHKAR[index];
            currentTarget = zkr.defaultTarget;
            this.updatePanelUI();
            this.triggerHaptic("click");
        },

        nextZkr() {
            const nextIdx = (activeZkrIndex + 1) % PRESET_ATHKAR.length;
            this.switchZkr(nextIdx);
        },

        prevZkr() {
            const prevIdx = (activeZkrIndex - 1 + PRESET_ATHKAR.length) % PRESET_ATHKAR.length;
            this.switchZkr(prevIdx);
        },

        setTarget(target, el) {
            currentTarget = target;
            currentRoundCount = 0;
            this.updatePanelUI();
            this.triggerHaptic("click");
            if (typeof window.showToast === "function") {
                window.showToast(target === 0 ? "تم ضبط دورة التسبيح على: مفتوح ∞" : `تم ضبط دورة التسبيح على: ${target} تسبيحة 🎯`);
            }
        },

        tapBead(e) {
            currentRoundCount++;
            sessionCount++;
            todayCount++;
            lifetimeCount++;

            this.saveStats();
            this.playBeadClick();
            this.triggerHaptic("click");

            if (typeof window.addSpiritualGardenDeed === "function") {
                window.addSpiritualGardenDeed("tasbeeh", 1);
            }

            // تأثير التموج الضوئي في موضع النقر (Ripple Effect)
            const bead = document.getElementById("btn-quick-bead-tap");
            if (bead) {
                if (typeof bead.blur === "function") {
                    bead.blur();
                }
                if (e) {
                    const rect = bead.getBoundingClientRect();
                    const ripple = document.createElement("span");
                    ripple.className = "quick-bead-ripple";
                    const size = Math.max(rect.width, rect.height);
                    ripple.style.width = ripple.style.height = `${size}px`;
                    const clientX = e.clientX || (rect.left + rect.width / 2);
                    const clientY = e.clientY || (rect.top + rect.height / 2);
                    ripple.style.left = `${clientX - rect.left - size / 2}px`;
                    ripple.style.top = `${clientY - rect.top - size / 2}px`;
                    bead.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                }
            }

            // تحديث شاشة العداد بسلاسة تامة دون تحريك الصفحة
            const counterEl = document.getElementById("counter");
            if (counterEl) {
                counterEl.textContent = currentRoundCount;
                if (typeof counterEl.animate === "function") {
                    counterEl.animate([
                        { transform: "scale(1)" },
                        { transform: "scale(1.18)" },
                        { transform: "scale(1)" }
                    ], {
                        duration: 150,
                        easing: "ease-out"
                    });
                } else {
                    counterEl.classList.remove("bump");
                    void counterEl.offsetWidth;
                    counterEl.classList.add("bump");
                }
            }

            const targetEl = document.getElementById("quick-bead-target");
            if (targetEl) {
                if (currentTarget === 0) {
                    targetEl.textContent = `مستمر: ${currentRoundCount}`;
                } else {
                    targetEl.textContent = `${currentRoundCount} / ${currentTarget}`;
                }
            }

            // فحص منح أوسمة الختمة الإيمانية
            if (window.SmartKhatmaService && typeof window.SmartKhatmaService.awardBadge === "function") {
                if (lifetimeCount >= 100) window.SmartKhatmaService.awardBadge("badge_tasbih_100");
                if (lifetimeCount >= 1000) window.SmartKhatmaService.awardBadge("badge_tasbih_1000");
            }

            // إتمام الدورة المحددة
            if (currentTarget > 0 && currentRoundCount >= currentTarget) {
                this.playChimeSound();
                this.triggerHaptic("complete");
                if (typeof window.showToast === "function") {
                    window.showToast(`هنيئاً لك! أتممت ${currentTarget} تسبيحة بميزان حسناتك إن شاء الله 🤍`);
                }
                currentRoundCount = 0;
                setTimeout(() => {
                    this.updatePanelUI();
                }, 400);
            }
        },

        resetCurrentRound() {
            currentRoundCount = 0;
            sessionCount = 0;
            try { localStorage.setItem("zadCount", "0"); } catch (_) {}
            if (typeof window.c !== 'undefined') window.c = 0;
            this.updatePanelUI();
            this.triggerHaptic("click");
            if (typeof window.showToast === "function") {
                window.showToast("تم تصفير عداد الذكر بنجاح 🔄");
            }
        },

        updatePanelUI() {
            const zkr = PRESET_ATHKAR[activeZkrIndex];
            if (!zkr) return;

            // 1. تحديث نص الذكر وفضله مع تأثير انتقال لطيف
            const textEl = document.getElementById("quick-dhikr-text");
            const virtueEl = document.getElementById("quick-dhikr-virtue");
            if (textEl) {
                textEl.style.opacity = "0.2";
                setTimeout(() => {
                    textEl.textContent = zkr.text;
                    textEl.style.opacity = "1";
                }, 120);
            }
            if (virtueEl) {
                virtueEl.textContent = zkr.virtue;
            }

            // 2. تحديث رقم الخرزة الحالية والهدف
            const counterEl = document.getElementById("counter");
            if (counterEl) {
                counterEl.textContent = currentRoundCount;
            }

            const targetEl = document.getElementById("quick-bead-target");
            if (targetEl) {
                if (currentTarget === 0) {
                    targetEl.textContent = "مفتوح ∞";
                } else {
                    targetEl.textContent = `${currentRoundCount} / ${currentTarget}`;
                }
            }

            // 3. تحديث الشرائح النشطة
            document.querySelectorAll(".dhikr-chip").forEach((chip, idx) => {
                chip.classList.toggle("active", idx === activeZkrIndex);
            });

            // 4. تحديث أزرار الهدف
            document.querySelectorAll(".dhikr-target-pill").forEach(pill => {
                const val = parseInt(pill.getAttribute("data-target") || "0", 10);
                pill.classList.toggle("active", val === currentTarget);
            });

            // 5. أيقونة الصوت
            const soundIcon = document.getElementById("dhikr-sound-icon");
            if (soundIcon) {
                soundIcon.className = isSoundEnabled ? "fa-solid fa-volume-high text-gold" : "fa-solid fa-volume-xmark";
            }
            const soundText = document.getElementById("dhikr-sound-text");
            if (soundText) {
                soundText.textContent = isSoundEnabled ? "صوت" : "صامت";
            }
        },

        toggleSound() {
            isSoundEnabled = !isSoundEnabled;
            try {
                localStorage.setItem(STORAGE_KEY_SOUND, isSoundEnabled.toString());
            } catch (e) {}

            const soundIcon = document.getElementById("dhikr-sound-icon");
            if (soundIcon) {
                soundIcon.className = isSoundEnabled ? "fa-solid fa-volume-high text-gold" : "fa-solid fa-volume-xmark";
            }
            const soundText = document.getElementById("dhikr-sound-text");
            if (soundText) {
                soundText.textContent = isSoundEnabled ? "صوت" : "صامت";
            }

            if (typeof window.showToast === "function") {
                window.showToast(isSoundEnabled ? "تم تفعيل صوت نقر الخرزات 🔊" : "تم كتم الصوت 🔇");
            }
        },

        toggleHaptic() {
            isHapticEnabled = !isHapticEnabled;
            try {
                localStorage.setItem(STORAGE_KEY_HAPTIC, isHapticEnabled.toString());
            } catch (e) {}

            if (isHapticEnabled && "vibrate" in navigator) {
                navigator.vibrate(30);
            }
            if (typeof window.showToast === "function") {
                window.showToast(isHapticEnabled ? "تم تفعيل الاهتزاز التفاعلي 📳" : "تم تعطيل الاهتزاز 📴");
            }
        },

        shareCurrentZkr() {
            const zkr = PRESET_ATHKAR[activeZkrIndex] || PRESET_ATHKAR[0];
            const gen = window.ShareCardGenerator;
            if (gen && (typeof gen.openShareModal === "function" || typeof gen.openModal === "function")) {
                const fn = (gen.openShareModal || gen.openModal).bind(gen);
                fn({
                    title: "ذكر مبارك • زاد المسلم",
                    text: zkr.text,
                    ref: "رياض الصالحين",
                    subtitle: zkr.virtue
                });
            } else {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(`${zkr.text}\n— ${zkr.virtue}\n\nزاد المسلم 🌿: https://zadmuslim-zeta.vercel.app/`);
                    if (typeof window.showToast === "function") {
                        window.showToast("تم نسخ الذكر المبارك بنجاح 📋");
                    }
                }
            }
        },

        // عدم فتح أي نافذة منبثقة، بل التمرير للوحة الذكر مباشرة إن لزم الأمر
        openModal(initialIdx = 0) {
            if (typeof initialIdx === "number" && initialIdx >= 0 && initialIdx < PRESET_ATHKAR.length) {
                this.switchZkr(initialIdx);
            }
            const panel = document.getElementById("smart-dhikr-panel") || document.getElementById("tasbeeh");
            if (panel) {
                panel.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    };

    window.SmartTasbih = SmartTasbih;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => SmartTasbih.init());
    } else {
        SmartTasbih.init();
    }

})(window, document);
