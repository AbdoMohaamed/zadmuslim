/**
 * الوحدات الإضافية الشاملة لتطبيق زاد المسلم
 * 1. روابط الصدقة الجارية المخصصة (Custom Memorial Links)
 * 2. الأربعون النووية كاملة (42 Hadiths)
 * 3. أسماء الله الحسنى الـ 99 (99 Names of Allah)
 * 4. مواسم الطاعات والتقويم الهجري والعد التنازلي (Seasons of Worship)
 * 5. دليل وفتاوى أحكام الجنائز والصدقة الجارية (Islamic FAQ)
 * 6. نظام التنبيهات والإشعارات الذكية (Smart Notifications)
 */

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initMobileNavDrawer();
    initCustomShareLink();
    initNawawiHadiths();
    initAsmaaAllah();
    initSeasonsOfWorship();
    initIslamicGuideFaq();
    initSmartNotifications();
    initHourlySalawatReminder();
    initEnhancedCardGenerator();
    initEnhancedCategorizedDuas();
    initDailySpiritualMessage();
    initIslamicStories();
    initIslamicQuiz();
    initLiveRadioWidgetWithSleepTimer();
    initGlobalCommunityCounter();
    initSpiritualGarden();
    initSmartTimelyReminders();
    initIslamicMediaHub();
    trackSiteTelemetry();
    initAdminDashboard();
    initModernZadDashboard();
});

/* ==========================================================================
   1. ميزة إنشاء رابط صدقة جارية مخصص لفقيد الزائر (Custom Memorial Links)
   ========================================================================== */
function initCustomShareLink() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const customName = urlParams.get("name");
        const customRel = urlParams.get("rel") || "فقيدنا الغالي";

        if (customName && customName.trim()) {
            const formattedName = `${customRel} (${decodeURIComponent(customName.trim())})`;
            if (typeof DECEASED_INFO !== "undefined") {
                DECEASED_INFO.name = formattedName;
            }
            
            document.querySelectorAll(".deceased-name").forEach(el => {
                el.textContent = formattedName;
            });

            const charityBanner = document.querySelector(".charity-memorial-text");
            if (charityBanner) {
                charityBanner.innerHTML = `تطبيق إسلامي متاح مجاناً لوجه الله تعالى • <strong>صدقة جارية على روح ${formattedName} وموتى المسلمين جميعاً</strong> — نسألكم الفاتحة وصالح الدعاء.`;
            }
        }
    } catch(e) {
        console.error("Error parsing URL params:", e);
    }

    const modal = document.getElementById("custom-share-modal");
    const openBtns = document.querySelectorAll("#btn-open-custom-share-nav, #btn-open-custom-share-hero, .btn-open-custom-share");
    const closeBtn = document.getElementById("btn-close-custom-share-modal");
    const nameInput = document.getElementById("custom-deceased-name-input");
    const relSelect = document.getElementById("custom-deceased-relation-select");
    const urlOutput = document.getElementById("generated-share-url");
    const copyBtn = document.getElementById("btn-copy-custom-url");
    const whatsappBtn = document.getElementById("btn-share-custom-whatsapp");

    openBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                if (modal) modal.classList.add("open");
                updateGeneratedUrl();
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

    function updateGeneratedUrl() {
        if (!urlOutput) return;
        const nameVal = nameInput ? nameInput.value.trim() : "";
        const relVal = relSelect ? relSelect.value : "فقيدنا الغالي";
        const baseUrl = (window.getPublicAppUrl ? window.getPublicAppUrl() : "https://zadmuslim-zeta.vercel.app/").replace(/\/+$/, "");

        if (nameVal) {
            const fullUrl = `${baseUrl}?name=${encodeURIComponent(nameVal)}&rel=${encodeURIComponent(relVal)}`;
            urlOutput.value = fullUrl;
        } else {
            urlOutput.value = baseUrl + "/";
        }
    }

    if (nameInput) nameInput.addEventListener("input", updateGeneratedUrl);
    if (relSelect) relSelect.addEventListener("change", updateGeneratedUrl);

    if (copyBtn && urlOutput) {
        copyBtn.addEventListener("click", () => {
            copyTextToClipboard(urlOutput.value);
            showToast("تم نسخ رابط الصدقة المخصص بنجاح 📋");
        });
    }

    if (whatsappBtn && urlOutput) {
        whatsappBtn.addEventListener("click", () => {
            const nameVal = nameInput ? nameInput.value.trim() : "فقيدنا الغالي";
            const relVal = relSelect ? relSelect.value : "فقيدنا الغالي";
            const msg = `🌿 *صدقة جارية ودعاء لروح ${relVal} (${nameVal})*\n\nأهديكم هذا التطبيق الإسلامي الشامل (زاد المسلم): للقرآن الكريم ومواقيت الصلاة والأذكار والسبحة الإلكترونية ليكون صدقة جارية ونوراً على روحه.\n\n📲 ادخل واكسب الأجر وادعُ له:\n${urlOutput.value}`;
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
            window.open(waUrl, "_blank");
        });
    }
}

/* ==========================================================================
   2. قسم الأربعين النووية الشاملة (42 Hadiths)
   ========================================================================== */
let currentNawawiAudio = null;
let currentPlayingHadithId = null;

function initNawawiHadiths() {
    const grid = document.getElementById("nawawi-grid");
    const searchInput = document.getElementById("nawawi-search-input");
    const filterPills = document.querySelectorAll("#nawawi-filter-bar .nawawi-filter-pill");

    if (!grid || typeof NAWAWI_HADITHS === "undefined") return;

    let activeCat = "all";
    let searchQuery = "";

    function renderHadiths() {
        grid.innerHTML = "";
        const filtered = NAWAWI_HADITHS.filter(h => {
            const matchCat = activeCat === "all" || h.category === activeCat;
            const matchQuery = !searchQuery || 
                h.title.includes(searchQuery) || 
                h.text.includes(searchQuery) || 
                h.narrator.includes(searchQuery) || 
                h.explanation.includes(searchQuery);
            return matchCat && matchQuery;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    <i class="fa-solid fa-book-open" style="font-size: 2.5rem; color: var(--gold-400); margin-bottom: 1rem;"></i>
                    <p style="font-size: 1.1rem;">لا توجد أحاديث تطابق بحثك، جرّب كلمة أخرى.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(h => {
            const card = document.createElement("div");
            card.className = "hadith-card";
            const isPlaying = currentPlayingHadithId === h.id;

            card.innerHTML = `
                <div class="hadith-card-header">
                    <span class="hadith-number-badge">الحديث ${h.id}</span>
                    <span class="hadith-category-tag">${h.category}</span>
                </div>
                <h3 class="hadith-title">${h.title}</h3>
                <div class="hadith-narrator"><i class="fa-solid fa-user-pen text-gold"></i> عن ${h.narrator}</div>
                <div class="hadith-text">${h.text}</div>
                
                <button type="button" class="hadith-details-toggle">
                    <i class="fa-solid fa-chevron-down text-gold"></i>
                    <span>الشرح والفوائد التربوية</span>
                </button>
                
                <div class="hadith-details-body">
                    <div style="margin-bottom: 0.75rem;">
                        <strong style="color: var(--gold-300);"><i class="fa-solid fa-lightbulb"></i> الشرح الميسر:</strong>
                        <p style="margin: 0.3rem 0 0.6rem 0;">${h.explanation}</p>
                    </div>
                    <div>
                        <strong style="color: var(--gold-300);"><i class="fa-solid fa-check-double"></i> من فوائد الحديث:</strong>
                        <ul style="padding-right: 1.2rem; margin: 0.3rem 0 0 0;">
                            ${h.benefits.map(b => `<li>${b}</li>`).join("")}
                        </ul>
                    </div>
                </div>

                <div class="hadith-actions">
                    <button type="button" class="btn-hadith-audio ${isPlaying ? 'playing' : ''}" data-id="${h.id}" data-audio="${h.audioUrl}">
                        <i class="fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                        <span>${isPlaying ? 'إيقاف' : 'استماع صوتي'}</span>
                    </button>

                    <div class="hadith-card-btns">
                        <button type="button" class="btn btn-outline btn-sm btn-copy-hadith" title="نسخ الحديث">
                            <i class="fa-solid fa-copy"></i>
                        </button>
                        <button type="button" class="btn btn-outline btn-sm btn-share-hadith" title="مشاركة لواتساب">
                            <i class="fa-brands fa-whatsapp" style="color: #25D366;"></i>
                        </button>
                    </div>
                </div>
            `;

            const toggleBtn = card.querySelector(".hadith-details-toggle");
            const detailsBody = card.querySelector(".hadith-details-body");
            if (toggleBtn && detailsBody) {
                toggleBtn.addEventListener("click", () => {
                    const isOpen = detailsBody.classList.toggle("open");
                    toggleBtn.querySelector("i").style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
                });
            }

            const audioBtn = card.querySelector(".btn-hadith-audio");
            if (audioBtn) {
                audioBtn.addEventListener("click", () => {
                    playHadithAudio(h.id, h.audioUrl, h.text);
                });
            }

            const copyBtn = card.querySelector(".btn-copy-hadith");
            if (copyBtn) {
                copyBtn.addEventListener("click", () => {
                    const textToCopy = `📖 *الحديث ${h.id} من الأربعين النووية:* [${h.title}]\n\nعن ${h.narrator}:\n${h.text}\n\n💡 *الشرح:* ${h.explanation}\n\n🕊️ زاد المسلم: https://zadmuslim-zeta.vercel.app/`;
                    copyTextToClipboard(textToCopy);
                    showToast("تم نسخ الحديث بنجاح 📋");
                });
            }

            const shareBtn = card.querySelector(".btn-share-hadith");
            if (shareBtn) {
                shareBtn.addEventListener("click", () => {
                    const msg = `📖 *الحديث ${h.id} من الأربعين النووية:* [${h.title}]\n\nعن ${h.narrator}:\n${h.text}\n\n🌸 من تطبيق زاد المسلم (صدقة جارية لوجه الله تعالى)\n📲 للمزيد من الأحاديث والتلاوات: https://zadmuslim-zeta.vercel.app/`;
                    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                    window.open(waUrl, "_blank");
                });
            }

            grid.appendChild(card);
        });
    }

    function updateAudioButtonsState() {
        document.querySelectorAll(".btn-hadith-audio").forEach(btn => {
            const btnId = parseInt(btn.getAttribute("data-id"), 10);
            if (btnId === currentPlayingHadithId) {
                btn.classList.add("playing");
                btn.style.background = "var(--gold-400)";
                btn.style.color = "#070d18";
                btn.innerHTML = '<i class="fa-solid fa-pause"></i> <span>إيقاف التلاوة</span>';
            } else {
                btn.classList.remove("playing");
                btn.style.background = "rgba(212, 175, 55, 0.15)";
                btn.style.color = "var(--gold-300)";
                btn.innerHTML = '<i class="fa-solid fa-play"></i> <span>استماع صوتي</span>';
            }
        });
    }

    function playHadithAudio(id, url, hadithText) {
        if (currentPlayingHadithId === id && currentNawawiAudio && !currentNawawiAudio.paused) {
            currentNawawiAudio.pause();
            currentPlayingHadithId = null;
            updateAudioButtonsState();
            return;
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        if (currentNawawiAudio) {
            currentNawawiAudio.pause();
            currentNawawiAudio = null;
        }

        currentPlayingHadithId = id;
        updateAudioButtonsState();

        currentNawawiAudio = new Audio(url);
        currentNawawiAudio.play().then(() => {
            showToast("جاري الاستماع للحديث النبوي الشريف 🎧");
        }).catch(e => {
            console.warn("Audio play error, trying speech synthesis fallback:", e);
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(hadithText);
                utterance.lang = 'ar-SA';
                utterance.rate = 0.9;
                utterance.onend = () => {
                    currentPlayingHadithId = null;
                    updateAudioButtonsState();
                };
                window.speechSynthesis.speak(utterance);
                showToast("جاري تلاوة الحديث 🔊");
            } else {
                showToast("تعذر تشغيل التسجيل الصوتي.");
                currentPlayingHadithId = null;
                updateAudioButtonsState();
            }
        });

        currentNawawiAudio.onended = () => {
            currentPlayingHadithId = null;
            updateAudioButtonsState();
        };

        currentNawawiAudio.onerror = () => {
            console.warn("Audio file error, falling back to speech synthesis.");
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(hadithText);
                utterance.lang = 'ar-SA';
                utterance.rate = 0.9;
                utterance.onend = () => {
                    currentPlayingHadithId = null;
                    updateAudioButtonsState();
                };
                window.speechSynthesis.speak(utterance);
            } else {
                showToast("تعذر تشغيل الصوت.");
                currentPlayingHadithId = null;
                updateAudioButtonsState();
            }
        };
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            renderHadiths();
        });
    }

    filterPills.forEach(pill => {
        pill.addEventListener("click", () => {
            filterPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            activeCat = pill.getAttribute("data-cat");
            renderHadiths();
        });
    });

    renderHadiths();
}

/* ==========================================================================
   3. قسم ومكتبة أسماء الله الحسنى الـ 99 (Asmaa Allah)
   ========================================================================== */
function initAsmaaAllah() {
    const grid = document.getElementById("asmaa-grid");
    const filterPills = document.querySelectorAll("#asmaa-filter-bar .nawawi-filter-pill");
    const modal = document.getElementById("asmaa-detail-modal");
    const closeBtn = document.getElementById("btn-close-asmaa-modal");
    const searchInput = document.getElementById("asmaa-search-input");
    const clearSearchBtn = document.getElementById("btn-clear-asmaa-search");
    const searchStatus = document.getElementById("asmaa-search-status");

    const modalNum = document.getElementById("modal-asmaa-num");
    const modalName = document.getElementById("modal-asmaa-name");
    const modalCat = document.getElementById("modal-asmaa-cat");
    const modalMeaning = document.getElementById("modal-asmaa-meaning");
    const modalVirtue = document.getElementById("modal-asmaa-virtue");
    const modalDua = document.getElementById("modal-asmaa-dua");
    const copyBtn = document.getElementById("btn-copy-asmaa");
    const shareBtn = document.getElementById("btn-share-asmaa");

    let currentSelectedName = null;
    let activeCat = "all";
    let searchQuery = "";

    if (!grid || typeof ASMAA_ALLAH === "undefined") return;

    function normalizeArabic(text) {
        if (!text) return "";
        return text
            .replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z0-9])/g, "")
            .replace(/[أإآ]/g, "ا")
            .replace(/ى/g, "ي")
            .replace(/ة/g, "ه")
            .toLowerCase();
    }

    function getDuaFormula(item) {
        const cat = item.category || "";
        if (cat === "رحمة") return `يا ${item.name} يا ذا الجلال والإكرام، ارحمني برحمتك الواسعة وتولَّ أمري بلطفك وسترك.`;
        if (cat === "رزق") return `يا ${item.name} يا واسع الفضل، افتح لي ولأهلي أبواب رزقك الحلال وبارك لنا فيما أعطيتنا.`;
        if (cat === "مغفرة") return `يا ${item.name} يا عفوّ يا غفار، اغفر لي ذنبي كله دقه وجله وأوله وآخره وتب عليّ إنك أنت التواب الرحيم.`;
        if (cat === "قدرة") return `يا ${item.name} يا قوي يا عزيز، تولَّ كفايتي واصرف عني كل سوء ويسر لي كل عسير.`;
        if (cat === "علم") return `يا ${item.name} يا سميع يا بصير، علمني ما ينفعني وانفعني بما علمتني وزدني نوراً وبصيرة.`;
        if (cat === "حكمة") return `يا ${item.name} يا عدل يا حكيم، اهدِ قلبي وسدد قولي وارضني بقضائك وقدرك.`;
        return `اللهم إني أسألك باسمك ${item.name} وبأسمائك الحسنى كلها، أن تبارك في حياتي وعملي وترزقني الفردوس الأعلى من الجنة.`;
    }

    function renderAsmaa() {
        grid.innerHTML = "";
        const cleanQuery = normalizeArabic(searchQuery);

        const filtered = ASMAA_ALLAH.filter(item => {
            const matchCat = activeCat === "all" || item.category === activeCat;
            if (!matchCat) return false;
            if (!cleanQuery) return true;

            const nameClean = normalizeArabic(item.name);
            const meaningClean = normalizeArabic(item.meaning);
            const virtueClean = normalizeArabic(item.virtue);
            const catClean = normalizeArabic(item.category);

            return nameClean.includes(cleanQuery) || 
                   meaningClean.includes(cleanQuery) || 
                   virtueClean.includes(cleanQuery) || 
                   catClean.includes(cleanQuery);
        });

        // تحديث رسالة الحالة
        if (searchStatus) {
            if (cleanQuery) {
                searchStatus.innerHTML = `تم العثور على <strong>${filtered.length}</strong> اسم مطابق لـ "${searchQuery}"`;
            } else if (activeCat !== "all") {
                searchStatus.innerHTML = `عرض أسماء <strong>${activeCat}</strong> (${filtered.length} اسماً)`;
            } else {
                searchStatus.innerHTML = `عرض جميع الأسماء (99 اسماً) • اضغط على أي اسم لعرض معناه وثمرته وصيغة الدعاء به`;
            }
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="asmaa-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: var(--gold-400); margin-bottom: 0.8rem; opacity: 0.7;"></i>
                    <p style="font-size: 1.05rem; color: var(--text-primary); margin: 0 0 0.5rem 0;">لم يتم العثور على اسم مطابق للبحث</p>
                    <span style="font-size: 0.88rem;">جرب البحث بكلمة أخرى أو مسح حقل البحث</span>
                </div>
            `;
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement("div");
            card.className = "asmaa-card";
            card.setAttribute("title", `اضغط لعرض تفاصيل اسم الله (${item.name})`);
            card.innerHTML = `
                <div class="asmaa-card-num">${item.id}</div>
                <div class="asmaa-card-name">${item.name}</div>
                <div class="asmaa-card-cat">${item.category}</div>
                <div class="asmaa-card-meaning">${item.meaning}</div>
            `;

            card.addEventListener("click", () => {
                openAsmaaDetail(item);
            });

            grid.appendChild(card);
        });
    }

    function openAsmaaDetail(item) {
        currentSelectedName = item;
        const duaFormula = getDuaFormula(item);

        if (modalNum) modalNum.textContent = item.id;
        if (modalName) modalName.textContent = item.name;
        if (modalCat) modalCat.textContent = `أسماء ${item.category}`;
        if (modalMeaning) modalMeaning.textContent = item.meaning;
        if (modalVirtue) modalVirtue.textContent = item.virtue;
        if (modalDua) modalDua.textContent = duaFormula;

        if (modal) {
            modal.classList.add("open");
            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        }
    }

    const closeModal = () => {
        if (modal) {
            modal.classList.remove("open");
            modal.classList.remove("active");
            document.body.style.overflow = "";
        }
    };

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // البحث الفوري
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchQuery = searchInput.value.trim();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery ? "flex" : "none";
            }
            renderAsmaa();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            searchQuery = "";
            clearSearchBtn.style.display = "none";
            renderAsmaa();
            if (searchInput) searchInput.focus();
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            if (!currentSelectedName) return;
            const dua = getDuaFormula(currentSelectedName);
            const textToCopy = `✨ *اسم الله الأعظم:* [ ${currentSelectedName.name} ]\n\n` +
                               `📖 *المعنى:* ${currentSelectedName.meaning}\n\n` +
                               `💡 *الثمرة الإيمانية:* ${currentSelectedName.virtue}\n\n` +
                               `🤲 *الدعاء والتعبد بهذا الاسم:*\n${dua}\n\n` +
                               `🌿 موقع زاد المسلم: ${window.location.origin + window.location.pathname}`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast(`تم نسخ اسم (${currentSelectedName.name}) ومعناه ودعاؤه بنجاح 📋`);
                }).catch(() => {
                    showToast(`تم النسخ 📋`);
                });
            }
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            if (!currentSelectedName) return;
            const dua = getDuaFormula(currentSelectedName);
            const msg = `✨ *اسم الله الحسنى:* [ ${currentSelectedName.name} ]\n\n` +
                        `📖 *المعنى:* ${currentSelectedName.meaning}\n\n` +
                        `💡 *الثمرة الإيمانية:* ${currentSelectedName.virtue}\n\n` +
                        `🤲 *الدعاء به:*\n${dua}\n\n` +
                        `🌸 _من تطبيق زاد المسلم (صدقة جارية لوجه الله تعالى)_\n` +
                        `📲 تصفح أسماء الله الحسنى كاملة:\n${window.location.origin + window.location.pathname}#asmaa-allah`;
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
            window.open(waUrl, "_blank");
        });
    }

    filterPills.forEach(pill => {
        pill.addEventListener("click", () => {
            filterPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            activeCat = pill.getAttribute("data-cat");
            renderAsmaa();
        });
    });

    renderAsmaa();
}

/* ==========================================================================
   4. مواسم الطاعات والتقويم والعد التنازلي للمناسبات الإسلامية
   ========================================================================== */
function initSeasonsOfWorship() {
    const grid = document.getElementById("seasons-grid");
    if (!grid) return;

    function getHijriDateDetails(date) {
        try {
            const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
            });
            const parts = formatter.formatToParts(date);
            let day = 1, month = 1, year = 1448;
            for (const p of parts) {
                if (p.type === 'day') day = parseInt(p.value, 10);
                if (p.type === 'month') month = parseInt(p.value, 10);
                if (p.type === 'year') year = parseInt(p.value, 10);
            }
            return { day, month, year };
        } catch (e) {
            const jd = Math.floor(date.getTime() / 86400000) + 2440587.5;
            const l = Math.floor(jd - 1948440 + 10632);
            const n = Math.floor((l - 1) / 10631);
            const l2 = l - 10631 * n + 354;
            const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
            const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
            const m = Math.floor((24 * l3) / 709);
            const d = l3 - Math.floor((709 * m) / 24);
            const y = 30 * n + j - 30;
            return { day: d, month: m, year: y };
        }
    }

    function findNextHijriEventDate(targetMonth, targetDay) {
        const now = new Date();
        const testDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        for (let i = 0; i <= 400; i++) {
            const h = getHijriDateDetails(testDate);
            if (h.month === targetMonth && h.day === targetDay) {
                return testDate;
            }
            testDate.setDate(testDate.getDate() + 1);
        }
        return new Date(now.getTime() + 180 * 86400000);
    }

    function getNextWhiteDaysDate() {
        const now = new Date();
        const testDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        for (let i = 0; i <= 35; i++) {
            const h = getHijriDateDetails(testDate);
            if (h.day === 13) {
                return testDate;
            }
            testDate.setDate(testDate.getDate() + 1);
        }
        return new Date(now.getTime() + 14 * 86400000);
    }

    function getNextMondayOrThursday() {
        const now = new Date();
        const testDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        testDate.setDate(testDate.getDate() + 1);
        for (let i = 0; i < 7; i++) {
            const day = testDate.getDay();
            if (day === 1 || day === 4) { // 1: الاثنين، 4: الخميس
                return testDate;
            }
            testDate.setDate(testDate.getDate() + 1);
        }
        return testDate;
    }

    function getSeasonsList() {
        const list = [
            {
                title: "صيام الإثنين والخميس القادم 🌿",
                icon: "fa-hands-praying",
                dateStr: "سنة نبوية مؤكدة",
                targetDate: getNextMondayOrThursday(),
                virtue: "تعرض الأعمال على الله تعالى يومي الإثنين والخميس، وأحب أن يعرض عملي وأنا صائم."
            },
            {
                title: "الأيام البيض القادمة 🌕",
                icon: "fa-circle",
                dateStr: "13، 14، 15 من كل شهر هجري",
                targetDate: getNextWhiteDaysDate(),
                virtue: "صيام ثلاثة أيام من كل شهر تعدل صيام الدهر كله كما جاء في الحديث الصحيح."
            },
            {
                title: "شهر رمضان المبارك 🌙",
                icon: "fa-moon",
                dateStr: "1 رمضان المبارك",
                targetDate: findNextHijriEventDate(9, 1),
                virtue: "شهر الصيام والقرآن، فيه ليلة القدر خير من ألف شهر، وتفتح فيه أبواب الجنان."
            },
            {
                title: "وقفة عرفات المباركة 🕋",
                icon: "fa-kaaba",
                dateStr: "9 ذو الحجة",
                targetDate: findNextHijriEventDate(12, 9),
                virtue: "أعظم أيام الدهر، وصيامه لغير الحاج يكفر ذنوب سنة ماضية وسنة باقية."
            },
            {
                title: "عيد الأضحى المبارك 🐑",
                icon: "fa-heart",
                dateStr: "10 ذو الحجة",
                targetDate: findNextHijriEventDate(12, 10),
                virtue: "يوم النحر، أعظم الأيام عند الله، يوم فرح وشكر وإطعام الطعام وصلة الأرحام."
            },
            {
                title: "يوم عاشوراء المبارك 🌊",
                icon: "fa-water",
                dateStr: "10 محرم",
                targetDate: findNextHijriEventDate(1, 10),
                virtue: "اليوم الذي نجى الله فيه موسى عليه السلام، وصيامه يكفر ذنوب السنة الماضية."
            }
        ];

        // ترتيب المواسم تصاعدياً بحسب الأقرب تاريخاً
        list.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
        return list;
    }

    function renderSeasons() {
        grid.innerHTML = "";
        const now = new Date().getTime();
        const seasons = getSeasonsList();

        seasons.forEach(season => {
            const diff = season.targetDate.getTime() - now;
            const isToday = diff <= 0 && diff > -86400000;
            const validDiff = Math.max(0, diff);

            const days = Math.floor(validDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((validDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((validDiff % (1000 * 60 * 60)) / (1000 * 60));

            const card = document.createElement("div");
            card.className = "season-card";
            card.innerHTML = `
                <div class="season-card-icon"><i class="fa-solid ${season.icon}"></i></div>
                <h3 class="season-card-title">${season.title}</h3>
                <div class="season-card-date"><i class="fa-solid fa-calendar-day text-gold"></i> ${season.dateStr}</div>
                
                <div class="season-countdown-box">
                    ${isToday ? `
                        <div style="width: 100%; color: var(--emerald-400); font-weight: 700; font-size: 1.05rem; text-align: center; padding: 0.3rem;">
                            <i class="fa-solid fa-star"></i> اليوم هو الموعد المبارك! تقبل الله طاعتكم
                        </div>
                    ` : `
                        <div class="countdown-unit">
                            <span class="countdown-val">${days}</span>
                            <span class="countdown-label">يوم</span>
                        </div>
                        <div class="countdown-unit">
                            <span class="countdown-val">${hours}</span>
                            <span class="countdown-label">ساعة</span>
                        </div>
                        <div class="countdown-unit">
                            <span class="countdown-val">${minutes}</span>
                            <span class="countdown-label">دقيقة</span>
                        </div>
                    `}
                </div>

                <div class="season-card-virtue">
                    ${season.virtue}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderSeasons();
    setInterval(renderSeasons, 60000);
}

/* ==========================================================================
   5. دليل وفتاوى أحكام الجنائز والصدقة الجارية (Islamic FAQ)
   ========================================================================== */
function initIslamicGuideFaq() {
    const list = document.getElementById("islamic-faq-list");
    if (!list || typeof ISLAMIC_DECEASED_GUIDE === "undefined") return;

    list.innerHTML = "";
    ISLAMIC_DECEASED_GUIDE.forEach((item, index) => {
        const faqItem = document.createElement("div");
        faqItem.className = `faq-item ${index === 0 ? 'active' : ''}`;
        faqItem.innerHTML = `
            <div class="faq-header">
                <h4 class="faq-question">
                    <i class="fa-solid fa-circle-question text-gold"></i>
                    <span>${item.title}</span>
                </h4>
                <i class="fa-solid fa-chevron-down faq-icon-arrow"></i>
            </div>
            <div class="faq-body">
                ${item.content}
            </div>
        `;

        const header = faqItem.querySelector(".faq-header");
        if (header) {
            header.addEventListener("click", () => {
                faqItem.classList.toggle("active");
            });
        }

        list.appendChild(faqItem);
    });
}

window.openNotificationsModal = function() {
    const modal = document.getElementById("notifications-modal");
    if (modal) {
        modal.classList.add("open");
    } else {
        console.warn("Notifications modal element not found in DOM");
    }
};

window.closeNotificationsModal = function() {
    const modal = document.getElementById("notifications-modal");
    if (modal) {
        modal.classList.remove("open");
    }
};

/* ==========================================================================
   6. نظام التنبيهات والإشعارات الذكية للطاعات (Smart Notifications)
   ========================================================================== */
function initSmartNotifications() {
    const modal = document.getElementById("notifications-modal");
    const openBtns = document.querySelectorAll("#btn-open-notifications-nav, #btn-open-notifications-hero, .btn-open-notifications, #app-btn-notifications-nav");
    const closeBtn = document.getElementById("btn-close-notifications-modal");
    const requestBtn = document.getElementById("btn-request-notification-perm");
    const selectAllBtn = document.getElementById("btn-select-all-notifs");
    const deselectAllBtn = document.getElementById("btn-deselect-all-notifs");

    const chkMorning = document.getElementById("notify-morning-azkar");
    const timeMorning = document.getElementById("time-morning-azkar");
    const chkEvening = document.getElementById("notify-evening-azkar");
    const timeEvening = document.getElementById("time-evening-azkar");
    const chkSleep = document.getElementById("notify-sleep-azkar");
    const timeSleep = document.getElementById("time-sleep-azkar");
    const chkFriday = document.getElementById("notify-friday-kahf");
    const chkFasting = document.getElementById("notify-fasting-days");
    const chkPrePrayer = document.getElementById("notify-pre-prayer");
    const chkAdhan = document.getElementById("notify-adhan-calls");
    const chkHourlySalawat = document.getElementById("notify-hourly-salawat");
    const selectSalawatInterval = document.getElementById("select-salawat-interval");
    const btnTestSalawatSound = document.getElementById("btn-test-salawat-sound");

    const allCheckboxes = [chkMorning, chkEvening, chkSleep, chkFriday, chkFasting, chkPrePrayer, chkAdhan, chkHourlySalawat].filter(Boolean);

    // استعادة الإعدادات المحفوظة مع تفعيل الأذان والتنبيه المسبق والصلاة على النبي افتراضياً
    try {
        const rawSettings = localStorage.getItem("smart_notify_settings");
        const savedSettings = rawSettings ? JSON.parse(rawSettings) : null;
        if (savedSettings) {
            if (chkMorning) chkMorning.checked = savedSettings.morning === true;
            if (timeMorning && savedSettings.morningTime) timeMorning.value = savedSettings.morningTime;
            if (chkEvening) chkEvening.checked = savedSettings.evening === true;
            if (timeEvening && savedSettings.eveningTime) timeEvening.value = savedSettings.eveningTime;
            if (chkSleep) chkSleep.checked = savedSettings.sleep === true;
            if (timeSleep && savedSettings.sleepTime) timeSleep.value = savedSettings.sleepTime;
            if (chkFriday) chkFriday.checked = savedSettings.friday === true;
            if (chkFasting) chkFasting.checked = savedSettings.fasting === true;
            if (chkPrePrayer) chkPrePrayer.checked = savedSettings.prePrayer !== false;
            if (chkAdhan) chkAdhan.checked = savedSettings.adhan !== false;
            if (chkHourlySalawat) chkHourlySalawat.checked = savedSettings.hourlySalawat !== false;
            if (selectSalawatInterval && savedSettings.salawatInterval) selectSalawatInterval.value = String(savedSettings.salawatInterval);
        } else {
            // الإعداد الافتراضي الذكي: الأذان والتنبيه المسبق والصلاة على النبي مفعلة تلقائياً
            if (chkPrePrayer) chkPrePrayer.checked = true;
            if (chkAdhan) chkAdhan.checked = true;
            if (chkHourlySalawat) chkHourlySalawat.checked = true;
            if (selectSalawatInterval) selectSalawatInterval.value = "60";
        }
    } catch(e) {
        if (chkPrePrayer) chkPrePrayer.checked = true;
        if (chkAdhan) chkAdhan.checked = true;
        if (chkHourlySalawat) chkHourlySalawat.checked = true;
        if (selectSalawatInterval) selectSalawatInterval.value = "60";
    }

    // زر تحديد الكل
    if (selectAllBtn) {
        selectAllBtn.addEventListener("click", () => {
            allCheckboxes.forEach(chk => { if (chk) chk.checked = true; });
        });
    }

    // زر إلغاء الكل
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener("click", () => {
            allCheckboxes.forEach(chk => { if (chk) chk.checked = false; });
        });
    }

    openBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                if (modal) modal.classList.add("open");
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

    // استعادة وضبط مفاتيح الصلوات الفردية وأزرار الاختبار وضبط النظام
    const prayerSubToggles = document.querySelectorAll(".prayer-sub-toggle");
    if (window.NativeAdhanService && typeof window.NativeAdhanService.getEnabledPrayers === "function") {
        const enabledPrayers = window.NativeAdhanService.getEnabledPrayers();
        prayerSubToggles.forEach(t => {
            const pKey = t.getAttribute("data-prayer");
            if (pKey && enabledPrayers[pKey] !== undefined) {
                t.checked = enabledPrayers[pKey];
            }
            t.addEventListener("change", () => {
                if (window.NativeAdhanService) {
                    window.NativeAdhanService.setPrayerEnabled(pKey, t.checked);
                }
            });
        });
    }

    const btnTestAdhanAudio = document.getElementById("btn-test-adhan-audio");
    if (btnTestAdhanAudio) {
        btnTestAdhanAudio.addEventListener("click", () => {
            if (window.NativeAdhanService) {
                window.NativeAdhanService.testAdhanAudio();
                if (typeof showToast === "function") showToast("جاري تجربة صوت الأذان 🔊");
            }
        });
    }

    const btnTestAdhanNotif = document.getElementById("btn-test-adhan-notif");
    if (btnTestAdhanNotif) {
        btnTestAdhanNotif.addEventListener("click", () => {
            if (window.NativeAdhanService) {
                window.NativeAdhanService.testNotification();
                if (typeof showToast === "function") showToast("تم إرسال إشعار تجريبي 🔔");
            }
        });
    }

    const btnOpenOsNotifSettings = document.getElementById("btn-open-os-notif-settings");
    if (btnOpenOsNotifSettings) {
        btnOpenOsNotifSettings.addEventListener("click", () => {
            if (window.NativeAdhanService) {
                window.NativeAdhanService.openNotificationSettings();
            }
        });
    }

    const btnOpenOsBatterySettings = document.getElementById("btn-open-os-battery-settings");
    if (btnOpenOsBatterySettings) {
        btnOpenOsBatterySettings.addEventListener("click", () => {
            if (window.NativeAdhanService) {
                window.NativeAdhanService.openBatterySettings();
            }
        });
    }

    const btnTestAdhanBackground = document.getElementById("btn-test-adhan-background");
    const statusBox = document.getElementById("adhan-bg-test-status");
    if (btnTestAdhanBackground) {
        btnTestAdhanBackground.addEventListener("click", async () => {
            if (btnTestAdhanBackground.disabled) return;
            btnTestAdhanBackground.disabled = true;
            btnTestAdhanBackground.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-gold"></i> <span>جاري الجدولة...</span>';

            if (statusBox) {
                statusBox.style.display = "block";
                statusBox.innerHTML = `
                    <div style="font-weight: 700; color: var(--gold-500); margin-bottom: 4px;">
                        <i class="fa-solid fa-clock"></i> جاري إرسال طلب المنبه الأصلي للنظام...
                    </div>
                `;
            }

            if (window.NativeAdhanService) {
                const res = await window.NativeAdhanService.scheduleBackgroundDiagnosticTest(120);
                if (statusBox) {
                    statusBox.innerHTML = `
                        <div style="font-weight: 700; color: var(--gold-500); margin-bottom: 6px;">
                            <i class="fa-solid fa-circle-check text-success"></i> ${res.platform === "android_native" ? "تم ضبط منبه أندرويد الأصلي بنجاح!" : "تمت جدولة إشعار الأذان المسموع بنجاح!"}
                        </div>
                        <div style="font-size: 0.8rem; opacity: 0.95;">
                            ⏰ وقت انطلاق الأذان الصوتي: <strong>${res.triggerTime}</strong> (بعد دقيقتين).<br>
                            🔒 <strong>الخطوة المطلوبة الآن:</strong> اغلق التطبيق أو اقفل شاشة هاتفك (Lock Screen) ودع الهاتف، سينطلق صوت الأذان كاملاً تلقائياً من نظام التشغيل.
                        </div>
                    `;
                }
                if (typeof showToast === "function") showToast("تمت جدولة الأذان بعد دقيقتين.. اقفل الشاشة للتجربة 📱");
            }

            setTimeout(() => {
                btnTestAdhanBackground.disabled = false;
                btnTestAdhanBackground.innerHTML = '<i class="fa-solid fa-mobile-screen-button text-gold"></i> <span>اختبار الأذان في الخلفية (دقيقتين) ⏳</span>';
            }, 5000);
        });
    }

    if (btnTestSalawatSound) {
        btnTestSalawatSound.addEventListener("click", () => {
            if (typeof window.playSalawatAudio === "function") {
                window.playSalawatAudio(true);
            }
        });
    }

    // الاستماع الدائم للبث السحابي لجميع الزوار لظهور الإشعار المنبثق والصوت
    listenToCloudBroadcastNotifications();
    registerPushSubscriberInFirebase();

    // حفظ التفضيلات
    if (requestBtn) {
        requestBtn.addEventListener("click", async () => {
            const settings = {
                morning: chkMorning ? chkMorning.checked : false,
                morningTime: (timeMorning && timeMorning.value) ? timeMorning.value : "06:30",
                evening: chkEvening ? chkEvening.checked : false,
                eveningTime: (timeEvening && timeEvening.value) ? timeEvening.value : "17:00",
                sleep: chkSleep ? chkSleep.checked : false,
                sleepTime: (timeSleep && timeSleep.value) ? timeSleep.value : "22:30",
                friday: chkFriday ? chkFriday.checked : false,
                fasting: chkFasting ? chkFasting.checked : false,
                prePrayer: chkPrePrayer ? chkPrePrayer.checked : true,
                adhan: chkAdhan ? chkAdhan.checked : true,
                hourlySalawat: chkHourlySalawat ? chkHourlySalawat.checked : true,
                salawatInterval: (selectSalawatInterval && selectSalawatInterval.value) ? parseInt(selectSalawatInterval.value, 10) : 60
            };
            localStorage.setItem("smart_notify_settings", JSON.stringify(settings));
            localStorage.setItem("smart_notify_configured", "true");

            // إعادة ضبط مؤقت الصلاة على النبي بالفاصل الزمني الجديد فوراً
            if (typeof window.restartSalawatReminder === "function") {
                window.restartSalawatReminder();
            }

            // مزامنة مواقيت الأذان والمنبهات مع نظام التشغيل فوراً
            if (window.NativeAdhanService && typeof window.NativeAdhanService.schedulePrayers === "function" && window.prayerTimings) {
                window.NativeAdhanService.schedulePrayers(window.prayerTimings);
            }

            const hasAnyActive = Object.values(settings).some(v => v === true);

            if (!hasAnyActive) {
                showToast("تم حفظ التفضيلات (جميع التنبيهات معطلة حالياً 🔕)");
                if (modal) modal.classList.remove("open");
                return;
            }

            // 1. إذا كان التطبيق يعمل داخل الموبايل كـ Native App (Capacitor iOS & Android)
            if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
                try {
                    if (window.NativeAdhanService && typeof window.NativeAdhanService.requestPermissions === "function") {
                        await window.NativeAdhanService.requestPermissions();
                    } else if (window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
                        await window.Capacitor.Plugins.LocalNotifications.requestPermissions();
                    }
                } catch (e) {
                    console.warn("Native notification permission request:", e);
                }
                showToast("تم تفعيل وتثبيت التنبيهات والأذان في نظام الهاتف لتصلك داخل وخارج التطبيق والشاشة مقفلة 🔔✨");
                registerPushSubscriberInFirebase();
                if (modal) modal.classList.remove("open");
                return;
            }

            // 2. إذا كان متصفح ويب عادي / PWA
            if ("Notification" in window) {
                if (Notification.permission === "granted") {
                    showToast("تم حفظ وتفعيل التنبيهات المختارة بنجاح لتصلك في مواعيدها المباركة 🔔✨");
                    registerPushSubscriberInFirebase();
                    if (modal) modal.classList.remove("open");
                } else if (Notification.permission !== "denied") {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        showToast("تم تفعيل إشعارات المتصفح بنجاح! جزاكم الله خيراً 🌿");
                        registerPushSubscriberInFirebase();
                        triggerNativeNotification("زاد المسلم • تنبيهات الطاعات", "تم تفعيل التنبيهات التي اخترتها بنجاح لتصلك في مواعيدها المباركة 🤲✨", "./");
                        if (modal) modal.classList.remove("open");
                    } else {
                        showToast("يرجى السماح بالإشعارات من إعدادات المتصفح لتصلك التنبيهات في الخلفية.");
                    }
                } else {
                    showToast("تم حفظ التفضيلات! لتصلك خارج المتصفح يرجى تمكين الإشعارات من إعدادات المتصفح 🔔");
                    if (modal) modal.classList.remove("open");
                }
            } else {
                showToast("تم تفعيل وحفظ التنبيهات المختارة بنجاح 🔔✨");
                if (modal) modal.classList.remove("open");
            }
        });
    }

    // اقتراح لطيف للمستخدم الجديد بعد 4 ثوانٍ لفتح نافذة الإشعارات وتخصيصها
    if (!localStorage.getItem("smart_notify_configured") && !sessionStorage.getItem("zad_notif_prompted")) {
        sessionStorage.setItem("zad_notif_prompted", "true");
        setTimeout(() => {
            if (("Notification" in window) && Notification.permission !== "denied") {
                showToast("🔔 يمكنك تخصيص تنبيهات الأذكار والصلوات وتفعيل ما ترغب به من أيقونة الجرس بالأعلى");
            }
        }, 4000);
    }
}

/**
 * تشغيل المقطع الصوتي النقي (صلى الله على محمد ﷺ)
 */
window.playSalawatAudio = function(isUserTest = false) {
    try {
        const audio = new Audio("assets/audio/salawat.mp3");
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (isUserTest && typeof showToast === "function") {
                    showToast("ﷺ تم تشغيل صوت الصلاة على النبي بنجاح");
                }
            }).catch(e => {
                console.warn("Audio autoplay blocked or failed:", e);
                if (isUserTest && typeof showToast === "function") {
                    showToast("يرجى النقر على الشاشة للسماح بتشغيل الصوت 🔊");
                }
            });
        }
    } catch(err) {
        console.warn("playSalawatAudio error:", err);
    }
};

/**
 * نظام التذكير الصوتي والتنبيه الدوري بالصلاة على النبي ﷺ حسب الفاصل الزمني المختار
 */
function initHourlySalawatReminder() {
    let salawatTimer = null;
    let salawatIntervalId = null;

    function getSalawatConfig() {
        let isEnabled = true;
        let intervalMins = 60;
        try {
            const raw = localStorage.getItem("smart_notify_settings");
            if (raw) {
                const s = JSON.parse(raw);
                if (s.hourlySalawat === false) isEnabled = false;
                if (s.salawatInterval) {
                    const parsed = parseInt(s.salawatInterval, 10);
                    if (!isNaN(parsed) && parsed > 0) intervalMins = parsed;
                }
            }
        } catch(e) {}
        return { isEnabled, intervalMins };
    }

    function triggerSalawat() {
        const { isEnabled } = getSalawatConfig();
        if (!isEnabled) return;

        // 1. تشغيل الصوت النقي
        window.playSalawatAudio(false);

        // 2. إظهار Toast داخل التطبيق
        if (typeof showToast === "function") {
            showToast("ﷺ صلِّ على النبي • اللهم صلِّ وسلِّم وبارك على نبينا محمد");
        }

        // 3. إشعار النظام المكتبي / إشعار المتصفح عند إتاحته
        if (typeof triggerNativeNotification === "function") {
            triggerNativeNotification("ﷺ صلِّ على النبي", "اللهم صلِّ وسلِّم وبارك على نبينا وحبيبنا محمد ﷺ", "./");
        }
    }

    function scheduleSalawat() {
        if (salawatTimer) clearTimeout(salawatTimer);
        if (salawatIntervalId) clearInterval(salawatIntervalId);

        const { isEnabled, intervalMins } = getSalawatConfig();
        if (!isEnabled) return;

        const intervalMs = intervalMins * 60 * 1000;

        // إذا كان التكرار كل ساعة (60 دقيقة)، نضبطه مع رأس الساعة القادمة بدقة
        if (intervalMins === 60) {
            const now = new Date();
            const msUntilNextHour = (60 - now.getMinutes()) * 60000 - (now.getSeconds() * 1000) - now.getMilliseconds();
            salawatTimer = setTimeout(() => {
                triggerSalawat();
                salawatIntervalId = setInterval(triggerSalawat, 3600000);
            }, Math.max(1000, msUntilNextHour));
        } else {
            // للتكرارات المخصصة (15، 30، 45 دقيقة وغيرها)
            salawatIntervalId = setInterval(triggerSalawat, intervalMs);
        }
    }

    window.restartSalawatReminder = scheduleSalawat;
    scheduleSalawat();
}

/**
 * دالة آمنة لجلب قاعدة بيانات Firebase مع التهيئة التلقائية
 */
function getSafeFirebaseDb() {
    try {
        if (typeof firebase === "undefined" || !isFirebaseConfigured()) return null;
        if (!firebase.apps || !firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        return firebase.database();
    } catch(e) {
        console.warn("Firebase safe init error:", e);
        return null;
    }
}

/**
 * تسجيل المشترك في PushManager وقاعدة بيانات فايربيز لاستقبال الإشعارات حتى والتطبيق مغلق
 */
async function registerPushSubscriberInFirebase() {
    try {
        const db = getSafeFirebaseDb();
        if (!db) return;

        let subscriberId = localStorage.getItem("zad_push_sub_id");
        if (!subscriberId) {
            subscriberId = "sub_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
            localStorage.setItem("zad_push_sub_id", subscriberId);
        }

        let pushSubscriptionJson = null;

        // الحصول على اشتراك PushManager الفعلي من المتصفح / الهاتف
        if ("serviceWorker" in navigator && "PushManager" in window) {
            try {
                const reg = await navigator.serviceWorker.ready;
                let subscription = await reg.pushManager.getSubscription();

                // إذا كان المستخدم وافق على الإشعارات ولم يكن مسجلاً في السيرفر بعد
                if (!subscription && typeof Notification !== "undefined" && Notification.permission === "granted" && typeof ZAD_VAPID_PUBLIC_KEY !== "undefined" && ZAD_VAPID_PUBLIC_KEY) {
                    const convertedVapidKey = urlBase64ToUint8Array(ZAD_VAPID_PUBLIC_KEY);
                    subscription = await reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedVapidKey
                    });
                }

                if (subscription) {
                    pushSubscriptionJson = subscription.toJSON();
                }
            } catch (swErr) {
                console.warn("Push subscription acquisition error:", swErr);
            }
        }

        const subRef = db.ref("push_subscribers/" + subscriberId);
        await subRef.set({
            id: subscriberId,
            subscription: pushSubscriptionJson || null,
            userAgent: navigator.userAgent || "Unknown",
            platform: navigator.platform || "Web",
            language: navigator.language || "ar",
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (e) {
        console.warn("Push subscriber registration skipped:", e);
    }
}

/**
 * الاستماع اللحظي للبث السحابي للإشعارات الصادرة من لوحة المسؤول لجميع الزوار
 */
function listenToCloudBroadcastNotifications() {
    try {
        const db = getSafeFirebaseDb();
        if (!db) return;

        const broadcastRef = db.ref("push_broadcasts").limitToLast(10);
        let isInitialLoad = true;

        broadcastRef.on("child_added", (snapshot) => {
            const data = snapshot.val();
            const broadcastId = snapshot.key;
            if (!data) return;

            const seenKey = "zad_seen_broadcast_" + broadcastId;
            const hasSeen = localStorage.getItem(seenKey);

            // التأكد من أن الإشعار جديد ولم يمض عليه أكثر من 24 ساعة
            const now = Date.now();
            const broadcastTime = data.timestamp || now;
            const isFresh = (now - broadcastTime) < (24 * 60 * 60 * 1000);

            if (hasSeen || !isFresh) {
                return;
            }

            localStorage.setItem(seenKey, "true");

            // تشغيل نغمة الإشعار العذبة
            playNotificationChime();

            // إظهار البنر المنبثق الأنيق داخل الموقع دائماً
            showInAppPushBanner(data);

            // إظهار إشعار النظام الأصلي للموبايل والمتصفح
            triggerNativeNotification(data.title || "زاد المسلم • تذكير بالطاعة", data.body || "", data.url || "./");
        });

        // بعد انتهاء التحميل الأولي
        setTimeout(() => {
            isInitialLoad = false;
        }, 1500);

    } catch (e) {
        console.warn("Cloud broadcast listener error:", e);
    }
}

/**
 * إطلاق إشعار النظام الأصلي للمتصفح والموبايل عبر Capacitor أو Service Worker
 */
async function triggerNativeNotification(title, body, url = "./") {
    try {
        // 1. إذا كان التطبيق يعمل على الهاتف (Capacitor Android / iOS)
        if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
            const LocalNotifications = window.Capacitor.Plugins ? window.Capacitor.Plugins.LocalNotifications : null;
            if (LocalNotifications) {
                const notifId = Math.floor(Date.now() % 100000) + Math.floor(Math.random() * 1000);
                await LocalNotifications.schedule({
                    notifications: [{
                        id: notifId,
                        title: title || "زاد المسلم 🌿",
                        body: body || "",
                        channelId: "zad_cloud_broadcast_channel",
                        sound: "adhan_makkah.mp3",
                        extra: { url: url },
                        schedule: { at: new Date(Date.now() + 500) }
                    }]
                });
                return;
            }
        }

        // 2. إذا كان متصفح ويب عادي / PWA
        if ("Notification" in window && Notification.permission === "granted") {
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification(title, {
                        body: body,
                        icon: "assets/icon-192.png",
                        badge: "assets/icon-192.png",
                        vibrate: [120, 80, 120],
                        data: { url: url }
                    });
                }).catch(() => {
                    try {
                        new Notification(title, { body: body, icon: "assets/icon-192.png" });
                    } catch(e) {}
                });
            } else {
                new Notification(title, { body: body, icon: "assets/icon.svg" });
            }
        }
    } catch(e) {
        console.warn("Native notification error:", e);
    }
}

/**
 * نغمة إشعار إسلامية عذبة مبنية برمجياً عبر Web Audio API
 */
function playNotificationChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === "suspended") ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";

        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.85);
    } catch(e) {}
}

/**
 * بنر إشعار تفاعلي منبثق يظهر مباشرة أسفل شريط التنقل (Header) لحماية الجزيرة التفاعلية والبار العلوي
 */
function showInAppPushBanner(data) {
    let banner = document.getElementById("zad-cloud-push-banner");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "zad-cloud-push-banner";
        banner.className = "zad-cloud-push-banner";
        document.body.appendChild(banner);
    }

    // قياس وتحديث ارتفاع الهيدر الفعلي لوضع الإشعار تحته بدقة تامة
    try {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const navRect = navbar.getBoundingClientRect();
            const navH = navRect.height || navbar.offsetHeight;
            if (navH > 0) {
                document.documentElement.style.setProperty('--navbar-actual-height', `${Math.round(navH)}px`);
            }
        }
    } catch (e) {}

    const title = data.title || "زاد المسلم • تذكير بالطاعة 🌿";
    const body = data.body || "";
    const targetUrl = data.url || "#";

    banner.innerHTML = `
        <div class="push-banner-inner">
            <div class="push-banner-icon">
                <i class="fa-solid fa-bell fa-shake text-gold"></i>
            </div>
            <div class="push-banner-content">
                <div class="push-banner-title">${escapeHtml(title)}</div>
                <div class="push-banner-body">${escapeHtml(body)}</div>
            </div>
            <div class="push-banner-actions">
                <a href="${targetUrl}" class="btn-banner-action" onclick="document.getElementById('zad-cloud-push-banner').classList.remove('show');">
                    <span>فتح 📖</span>
                </a>
                <button type="button" class="btn-banner-close" onclick="document.getElementById('zad-cloud-push-banner').classList.remove('show');" aria-label="إغلاق">
                    &times;
                </button>
            </div>
        </div>
    `;

    // إظهار البنر مع الأنيميشن أسفل الهيدر
    setTimeout(() => {
        banner.classList.add("show");
    }, 50);

    // إلغاء أي مؤقت إخفاء سابق وإخفاء تلقائي بعد 10 ثوانٍ
    if (window._zadPushBannerTimeout) clearTimeout(window._zadPushBannerTimeout);
    window._zadPushBannerTimeout = setTimeout(() => {
        if (banner) banner.classList.remove("show");
    }, 10000);
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}



/* ==========================================================================
   7. ترقية صانع بطاقات الأدعية والمشاركات الاجتماعية ومقاطع الاستوري (Enhanced Card & Story Studio)
   ========================================================================== */
let currentCardFormat = "story"; // 'story' | 'card' | 'post'
let currentCardTheme = "royal-navy"; // 'royal-navy' | 'emerald' | 'burgundy' | 'parchment'
let currentCardContentType = "dua"; // 'dua' | 'quran' | 'azkar' | 'asmaa'
let currentCardOutputType = "image"; // 'image' | 'video'
let storyAnimationId = null;
let storyParticles = [];

const STORY_PRESETS = {
    dua: [
        { label: "اللهم اغفر له وارحمه وعافه واعف عنه...", text: "اللهم اغفر له وارحمه، وعافه واعف عنه، وأكرم نزله، ووسع مدخله، واغسله بالماء والثلج والبرد، ونقه من الذنوب والخطايا كما ينقى الثوب الأبيض من الدنس." },
        { label: "اللهم اجعل قبره روضة من رياض الجنة...", text: "اللهم اجعل قبره روضة من رياض الجنة، ولا تجعله حفرة من حفر النار، وافسح له في قبره مد بصره، وافرش قبره من فراش الجنة." },
        { label: "اللهم يمن كتابه ويسر حسابه...", text: "اللهم يَمِّن كتابه، ويَسِّر حسابه، وثَقِّل بالحسنات ميزانه، وثَبِّت على الصراط أقدامه، وأسكنه في أعلى الجنات بجوار حبيبك ومصطفاك ﷺ." },
        { label: "اللهم أبدله داراً خيراً من داره...", text: "اللهم أبدله داراً خيراً من داره، وأهلاً خيراً من أهله، وأدخله الجنة، وأعذه من عذاب القبر ومن عذاب النار يا أرحم الراحمين." },
        { label: "اللهم إنه كان يشهد أنك لا إله إلا أنت...", text: "اللهم إنه كان يشهد أنك لا إله إلا أنت، وأن محمداً عبدك ورسولك، وأنت أعلم به، فارحمه برحمتك التي وسعت كل شيء." }
    ],
    quran: [
        { label: "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ﴾ - آية الكرسي", text: "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ﴾ [البقرة: 255]" },
        { label: "﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾", text: "﴿الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾ [الرعد: 28]" },
        { label: "﴿وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ﴾", text: "﴿وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ﴾ [البقرة: 186]" },
        { label: "﴿رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي﴾", text: "﴿قَالَ رَبِّ اشْرَحْ لِي صَدْرِي * وَيَسِّرْ لِي أَمْرِي * وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي * يَفْقَهُوا قَوْلِي﴾ [طه: 25-28]" },
        { label: "﴿فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾", text: "﴿فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا * فَإِذَا فَرَغْتَ فَانصَبْ * وَإِلَىٰ رَبِّكَ فَارْغَب﴾ [الشرح: 5-8]" }
    ],
    azkar: [
        { label: "سيد الاستغفار", text: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت." },
        { label: "دعاء تفريج الهم والكرب", text: "لا إله إلا أنت سبحانك إني كنت من الظالمين.. اللهم فرج هم المهمومين ونفس كرب المكروبين واقض الدين عن المدينين واشف مرضانا ومرضى المسلمين." },
        { label: "حسبنا الله ونعم الوكيل", text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ • نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ • وَأُفَوِّضُ أَمْرِي إِلَى اللَّهِ إِنَّ اللَّهَ بَصِيرٌ بِالْعِبَادِ." },
        { label: "رضيت بالله رباً وبالإسلام ديناً", text: "رضيتُ باللهِ رباً، وبالإسلامِ ديناً، وبمحمدٍ ﷺ نبياً ورسولاً.. أصبحنا وأصبح الملك لله والحمد لله ولا إله إلا الله." }
    ],
    asmaa: [
        { label: "يا حي يا قيوم برحمتك أستغيث", text: "«يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ»." },
        { label: "الرحمن الرحيم - وسعت رحمته كل شيء", text: "يا رَحْمَٰنُ يا رَحِيمُ.. نسألك برحمتك التي وسعت كل شيء أن تغفر لنا ولموتانا وترحمنا في الدنيا والآخرة." },
        { label: "الغفور الشكور - يغفر الذنوب ويجزل الثواب", text: "يا غَفُورُ يا شَكُورُ.. اغفر لنا زلاتنا وتقبل يسير طاعاتنا واجعلنا من عتقائك من النار 🤲" }
    ]
};

function initEnhancedCardGenerator() {
    const formatPills = document.querySelectorAll("#dua-format-pills .theme-pill");
    const themePills = document.querySelectorAll(".dua-theme-pills .theme-pill[data-theme]");
    const contentTypePills = document.querySelectorAll("#dua-content-type-pills .theme-pill");
    const outputTypePills = document.querySelectorAll("#dua-output-type-pills .theme-pill");

    // Init particles
    initStoryParticles();

    // 1. تبديل تصنيف المحتوى (أدعية / قرآن / أذكار / أسماء)
    contentTypePills.forEach(pill => {
        pill.addEventListener("click", () => {
            contentTypePills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentCardContentType = pill.getAttribute("data-type") || "dua";
            populateTemplateOptionsForType(currentCardContentType);
            drawEnhancedDuaCard();
        });
    });

    // 2. تبديل الحجم
    formatPills.forEach(pill => {
        pill.addEventListener("click", () => {
            formatPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentCardFormat = pill.getAttribute("data-format") || "story";
            drawEnhancedDuaCard();
        });
    });

    // 3. تبديل السمة
    themePills.forEach(pill => {
        pill.addEventListener("click", () => {
            themePills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentCardTheme = pill.getAttribute("data-theme") || "royal-navy";
            drawEnhancedDuaCard();
        });
    });

    // 4. تبديل نوع الإخراج (صورة / فيديو)
    outputTypePills.forEach(pill => {
        pill.addEventListener("click", () => {
            outputTypePills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            currentCardOutputType = pill.getAttribute("data-output") || "image";

            const downloadImgBtn = document.getElementById("btn-download-dua-image");
            const exportVidBtn = document.getElementById("btn-export-story-video");

            if (currentCardOutputType === "video") {
                if (downloadImgBtn) downloadImgBtn.style.display = "none";
                if (exportVidBtn) exportVidBtn.style.display = "inline-flex";
                startStoryAnimationLoop();
            } else {
                if (downloadImgBtn) downloadImgBtn.style.display = "inline-flex";
                if (exportVidBtn) exportVidBtn.style.display = "none";
                stopStoryAnimationLoop();
                drawEnhancedDuaCard();
            }
        });
    });

    // أزرار التحميل والمشاركة والتصدير
    const downloadBtn = document.getElementById("btn-download-dua-image");
    const shareBtn = document.getElementById("btn-share-dua-image");
    const exportVideoBtn = document.getElementById("btn-export-story-video");

    if (downloadBtn) downloadBtn.onclick = downloadEnhancedDuaCard;
    if (shareBtn) shareBtn.onclick = shareEnhancedDuaCard;
    if (exportVideoBtn) exportVideoBtn.onclick = exportStoryVideo;

    // حقول الإدخال
    const recipientInput = document.getElementById("dua-card-recipient-input");
    const templateSelect = document.getElementById("dua-template-select");
    const customInput = document.getElementById("custom-dua-input");

    if (recipientInput) recipientInput.addEventListener("input", () => drawEnhancedDuaCard());
    if (templateSelect) {
        templateSelect.addEventListener("change", (e) => {
            const customGroup = document.getElementById("custom-dua-group");
            if (e.target.value === "custom") {
                if (customGroup) customGroup.style.display = "block";
            } else {
                if (customGroup) customGroup.style.display = "none";
            }
            drawEnhancedDuaCard();
        });
    }
    if (customInput) customInput.addEventListener("input", () => drawEnhancedDuaCard());

    setTimeout(drawEnhancedDuaCard, 300);
}

function populateTemplateOptionsForType(type) {
    const select = document.getElementById("dua-template-select");
    if (!select) return;

    const list = STORY_PRESETS[type] || STORY_PRESETS.dua;
    select.innerHTML = list.map(item => `<option value="${escapeSingleQuotes(item.text)}">${item.label}</option>`).join("") +
        `<option value="custom">✏️ كتابة نص مخصص بقلمك...</option>`;
}

function initStoryParticles() {
    storyParticles = [];
    for (let i = 0; i < 35; i++) {
        storyParticles.push({
            x: Math.random() * 1080,
            y: Math.random() * 1920,
            radius: Math.random() * 3 + 1,
            speedY: Math.random() * 0.8 + 0.3,
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.7 + 0.2,
            pulseSpeed: Math.random() * 0.03 + 0.01
        });
    }
}

function startStoryAnimationLoop() {
    if (storyAnimationId) return;
    function loop() {
        drawEnhancedDuaCard(true);
        storyAnimationId = requestAnimationFrame(loop);
    }
    storyAnimationId = requestAnimationFrame(loop);
}

function stopStoryAnimationLoop() {
    if (storyAnimationId) {
        cancelAnimationFrame(storyAnimationId);
        storyAnimationId = null;
    }
}

function drawEnhancedDuaCard(isAnimated = false) {
    const canvas = document.getElementById("dua-card-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 1080;
    let height = 1920; // Default: Story 9:16

    if (currentCardFormat === "post") {
        height = 1080; // 1:1
    } else if (currentCardFormat === "card") {
        height = 1350; // 4:5
    }

    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }

    // 1. تدرجات الألوان الفاخرة
    let bgGradient;
    let borderColor = "#d4af37";
    let textColor = "#ffffff";
    let subTextColor = "#cbd5e1";
    let accentGold = "#d4af37";

    if (currentCardTheme === "emerald") {
        bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, "#042f24");
        bgGradient.addColorStop(0.5, "#011a14");
        bgGradient.addColorStop(1, "#042f24");
        borderColor = "#10b981";
        accentGold = "#6ee7b7";
    } else if (currentCardTheme === "burgundy") {
        bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, "#4a0e17");
        bgGradient.addColorStop(0.5, "#25050a");
        bgGradient.addColorStop(1, "#4a0e17");
        borderColor = "#d4af37";
        accentGold = "#fbbf24";
    } else if (currentCardTheme === "parchment") {
        bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, "#fbf8ee");
        bgGradient.addColorStop(0.5, "#f3eedd");
        bgGradient.addColorStop(1, "#fbf8ee");
        borderColor = "#aa820a";
        textColor = "#1f2937";
        subTextColor = "#4b5563";
        accentGold = "#b45309";
    } else {
        // royal-navy
        bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, "#0b172a");
        bgGradient.addColorStop(0.5, "#030712");
        bgGradient.addColorStop(1, "#0b172a");
        borderColor = "#d4af37";
        accentGold = "#f59e0b";
    }

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // رسم الجزيئات النورانية المتحركة إذا كان في وضع الفيديو / الأنيميشن
    if (isAnimated || currentCardOutputType === "video") {
        ctx.save();
        storyParticles.forEach(p => {
            p.y -= p.speedY;
            p.x += p.speedX;
            if (p.y < 0) p.y = height;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;

            ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    // 2. إطار إسلامي مزدوج مزخرف
    ctx.lineWidth = 4;
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.lineWidth = 1.5;
    ctx.strokeRect(55, 55, width - 110, height - 110);

    // زخارف الأركان
    const cornerSize = 40;
    const drawCorner = (x, y) => {
        ctx.save();
        ctx.strokeStyle = accentGold;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, cornerSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };
    drawCorner(55, 55);
    drawCorner(width - 55, 55);
    drawCorner(55, height - 55);
    drawCorner(width - 55, height - 55);

    // 3. نصوص البطاقة
    ctx.textAlign = "center";
    ctx.direction = "rtl";

    // البسملة
    ctx.fillStyle = accentGold;
    ctx.font = "bold 38px 'Amiri', 'Traditional Arabic', serif";
    ctx.fillText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", width / 2, height * 0.12);

    // شريط الإهداء
    const recipientInput = document.getElementById("dua-card-recipient-input");
    const recipientName = (recipientInput && recipientInput.value.trim()) || ((typeof DECEASED_INFO !== "undefined" && DECEASED_INFO.name) ? DECEASED_INFO.name : "فقيدنا الغالي");

    ctx.fillStyle = subTextColor;
    ctx.font = "32px 'Tajawal', sans-serif";
    ctx.fillText(`صدقة جارية ودعاء لروح`, width / 2, height * 0.18);

    ctx.fillStyle = accentGold;
    ctx.font = "bold 44px 'Tajawal', sans-serif";
    ctx.fillText(recipientName, width / 2, height * 0.23);

    // خط فاصل مزخرف
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 220, height * 0.26);
    ctx.lineTo(width / 2 + 220, height * 0.26);
    ctx.stroke();

    // استخراج النص المحدد
    let mainText = "اللهم اغفر له وارحمه، وعافه واعف عنه، وأكرم نزله، ووسع مدخله، واغسله بالماء والثلج والبرد، ونقه من الذنوب والخطايا كما ينقى الثوب الأبيض من الدنس.";
    const templateSelect = document.getElementById("dua-template-select");
    const customInput = document.getElementById("custom-dua-input");

    if (templateSelect && templateSelect.value === "custom" && customInput && customInput.value.trim()) {
        mainText = customInput.value.trim();
    } else if (templateSelect && templateSelect.value && templateSelect.value !== "custom") {
        mainText = templateSelect.value;
    }

    ctx.fillStyle = textColor;
    ctx.font = "bold 42px 'Amiri', 'Traditional Arabic', serif";

    // التفاف الأسطر
    const maxWidth = width - 200;
    const lineHeight = 68;
    const words = mainText.split(" ");
    let line = "";
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + " ";
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    let startY = height * 0.38;
    if (currentCardFormat === "story") startY = height * 0.42;
    if (currentCardFormat === "post") startY = height * 0.35;

    lines.forEach((l, i) => {
        ctx.fillText(l.trim(), width / 2, startY + (i * lineHeight));
    });

    // الختام
    const footerY = height - 120;
    ctx.fillStyle = accentGold;
    ctx.font = "bold 32px 'Tajawal', sans-serif";
    ctx.fillText("اللهم استجب واجعل ثواب هذا العمل نوراً وضياءً 🤲", width / 2, footerY - 40);

    ctx.fillStyle = subTextColor;
    ctx.font = "24px 'Tajawal', sans-serif";
    ctx.fillText("زاد المسلم • تطبيق إسلامي شامل", width / 2, footerY);
}

function downloadEnhancedDuaCard() {
    const canvas = document.getElementById("dua-card-canvas");
    if (!canvas) return;
    drawEnhancedDuaCard();
    const link = document.createElement("a");
    link.download = `zad-muslim-card-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("تم تنزيل البطاقة بنجاح، تقبل الله منكم 🌿🖼️");
}

/**
 * تصدير وتحميل فيديو واستوري متحرك (Reels 9:16) عبر MediaRecorder
 */
async function exportStoryVideo() {
    const canvas = document.getElementById("dua-card-canvas");
    const exportBtn = document.getElementById("btn-export-story-video");
    const btnText = document.getElementById("btn-video-export-text");

    if (!canvas || !window.MediaRecorder) {
        showToast("عذراً، تصدير الفيديو غير مدعوم في هذا المتصفح. يمكنك تحميل الصورة PNG مباشرة.");
        return;
    }

    startStoryAnimationLoop();

    if (exportBtn) exportBtn.disabled = true;
    if (btnText) btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري إنتاج وتصدير مقطع الفيديو (6 ثوانٍ)...';

    try {
        const stream = canvas.captureStream(30);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
        }

        const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined });
        const chunks = [];

        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: chunks[0] ? chunks[0].type : "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `zad-muslim-story-reel-${Date.now()}.mp4`;
            a.click();

            if (exportBtn) exportBtn.disabled = false;
            if (btnText) btnText.innerHTML = 'تصدير فيديو الاستوري (MP4) 🎬';
            showToast("تم إنتاج وتحميل مقطع الفيديو والاستوري بنجاح! 🎬✨ جاهز للنشر على واتساب وإنستغرام");
        };

        recorder.start();

        // تسجيل 6 ثوانٍ
        setTimeout(() => {
            recorder.stop();
        }, 6000);

    } catch (e) {
        console.error("Video export error:", e);
        if (exportBtn) exportBtn.disabled = false;
        if (btnText) btnText.innerHTML = 'تصدير فيديو الاستوري (MP4)';
        showToast("فشل تصدير الفيديو، يمكنك تحميل الصورة PNG كبديل فوري.");
    }
}

async function shareEnhancedDuaCard() {
    const canvas = document.getElementById("dua-card-canvas");
    if (!canvas) return;

    if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], "dua-card.png", { type: "image/png" });
            if (navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: "زاد المسلم • بطاقة واستوري إسلامي",
                        text: "نسألكم الدعاء لفقيدنا الغالي وجميع موتى المسلمين 🤲"
                    });
                    return;
                } catch(e) {}
            }
            fallbackShareWhatsApp();
        });
    } else {
        fallbackShareWhatsApp();
    }
}

function fallbackShareWhatsApp() {
    const recipientInput = document.getElementById("dua-card-recipient-input");
    const nameVal = (recipientInput && recipientInput.value.trim()) || "فقيدنا الغالي";
    const msg = `🌿 *بطاقة واستوري لروح (${nameVal})*\n\nاللهم اغفر له وارحمه وعافه واعف عنه واجعل قبره روضة من رياض الجنة.\n\n📲 صمم بطاقة لفقيدك واكسب الأجر: https://zadmuslim-zeta.vercel.app/`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
    showToast("جاري فتح واتساب للمشاركة 📲");
}

/* ==========================================================================
   7. القائمة الجانبية للشاشات الصغيرة (Mobile Navigation Drawer)
   ========================================================================== */
function initMobileNavDrawer() {
    const toggleBtn = document.getElementById("btn-mobile-menu-toggle");
    const drawer = document.getElementById("mobile-nav-drawer");
    const overlay = document.getElementById("mobile-nav-overlay");
    const closeBtn = document.getElementById("btn-close-mobile-nav");
    const navLinks = document.querySelectorAll(".mobile-nav-link");
    const customShareBtn = document.getElementById("btn-mobile-custom-share");

    if (!drawer) return;

    function openDrawer() {
        drawer.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
        drawer.classList.remove("open");
        document.body.style.overflow = "";
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (drawer.classList.contains("open")) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeDrawer);
    }

    if (overlay) {
        overlay.addEventListener("click", closeDrawer);
    }

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            closeDrawer();
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });

    if (customShareBtn) {
        customShareBtn.addEventListener("click", () => {
            closeDrawer();
            const modal = document.getElementById("custom-share-modal");
            if (modal) modal.classList.add("open");
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && drawer.classList.contains("open")) {
            closeDrawer();
        }
    });
}

/* ==========================================================================
   8. ترقية موسوعة الأدعية النبوية لتطابق تصميم وتجربة قسم أذكار اليوم
   ========================================================================== */
function initEnhancedCategorizedDuas() {
    function safeEscape(str) {
        if (typeof escapeHTML === "function") return escapeHTML(str);
        if (typeof escapeHtml === "function") return escapeHtml(str);
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ترقية دالة رسم بطاقات الأدعية لتطابق بطاقات الأذكار
    window.renderDuasCardsList = function(duasList) {
        const gridContainer = document.getElementById("categorized-duas-grid");
        if (!gridContainer) return;

        gridContainer.innerHTML = "";

        if (!duasList || duasList.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    <i class="fa-solid fa-magnifying-glass fa-2x text-gold" style="margin-bottom: 0.8rem; opacity: 0.7;"></i>
                    <p style="color: var(--text-primary); font-weight: 700; font-size: 1.1rem; margin-bottom: 0.4rem;">لا توجد أدعية مطابقة</p>
                    <p style="font-size: 0.88rem;">يرجى اختيار تصنيف آخر أو تجربة كلمة بحث مختلفة</p>
                </div>
            `;
            return;
        }

        duasList.forEach((dua, idx) => {
            const card = document.createElement("div");
            const duaId = dua.id || `dua_${idx}`;
            const targetRepeat = dua.repeat || 1;
            card.className = "azkar-card cat-dua-card";
            card.id = `cat-dua-card-${duaId}`;
            card.setAttribute("data-dua-id", duaId);

            card.innerHTML = `
                <div class="cat-dua-header">
                    <h3 class="cat-dua-title">${safeEscape(dua.title)}</h3>
                    <span class="cat-dua-category-badge"><i class="fa-solid fa-hands-praying text-gold"></i> دعاء نبوي مأثور</span>
                </div>
                <div class="azkar-text">"${safeEscape(dua.text)}"</div>
                <div class="azkar-virtue">
                    <i class="fa-solid fa-award text-gold"></i>
                    <span>${safeEscape(dua.source)}</span>
                </div>
                <div class="azkar-footer">
                    <div class="azkar-count-badge">
                        <span>التكرار المستحب: <strong>${targetRepeat} مرات</strong></span>
                    </div>
                    <div class="cat-dua-actions-wrapper">
                        <button type="button" class="azkar-tap-btn btn-repeat-dua" data-remaining="${targetRepeat}" title="انقر لتكرار الدعاء ونيل الأجر">
                            <i class="fa-solid fa-hand-pointer"></i>
                            <span class="btn-repeat-text">تبقى: ${targetRepeat}</span>
                        </button>
                        <button type="button" class="btn btn-outline btn-sm btn-icon-round btn-copy-cat-dua" title="نسخ الدعاء">
                            <i class="fa-solid fa-copy"></i>
                        </button>
                        <button type="button" class="btn btn-outline btn-sm btn-icon-round btn-share-cat-dua" title="مشاركة الدعاء لواتساب">
                            <i class="fa-brands fa-whatsapp" style="color: #25D366;"></i>
                        </button>
                    </div>
                </div>
            `;

            // 1. زر النسخ
            const copyBtn = card.querySelector(".btn-copy-cat-dua");
            if (copyBtn) {
                copyBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const textToCopy = `🤲 *${dua.title}*\n"${dua.text}"\n📍 [${dua.source}]\n\n🕊️ صدقة جارية: https://zadmuslim-zeta.vercel.app/`;
                    copyTextToClipboard(textToCopy);
                    showToast("تم نسخ الدعاء بنجاح 📋");
                });
            }

            // 2. زر المشاركة لواتساب
            const shareBtn = card.querySelector(".btn-share-cat-dua");
            if (shareBtn) {
                shareBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const msg = `🤲 *${dua.title}*\n"${dua.text}"\n📍 [${dua.source}]\n\n🌸 من تطبيق زاد المسلم (صدقة جارية لوجه الله تعالى)\n📲 الرابط: https://zadmuslim-zeta.vercel.app/`;
                    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
                    window.open(url, "_blank");
                });
            }

            // 3. زر التكرار التفاعلي بالصوت والاهتزاز وحالة الإتمام
            const repeatBtn = card.querySelector(".btn-repeat-dua");
            if (repeatBtn) {
                repeatBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    let rem = parseInt(repeatBtn.getAttribute("data-remaining"), 10);
                    if (rem > 1) {
                        rem--;
                        repeatBtn.setAttribute("data-remaining", rem);
                        const textEl = repeatBtn.querySelector(".btn-repeat-text");
                        if (textEl) textEl.textContent = `تبقى: ${rem}`;
                        if ("vibrate" in navigator) navigator.vibrate(25);
                        if (typeof playTasbeehClickTone === "function") playTasbeehClickTone();
                    } else if (rem === 1) {
                        rem = 0;
                        repeatBtn.setAttribute("data-remaining", 0);
                        card.classList.add("is-finished");
                        repeatBtn.classList.add("all-done");
                        repeatBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> <span>تم الدعاء بنجاح</span>';
                        if ("vibrate" in navigator) navigator.vibrate([40, 60, 40]);
                        if (typeof playCompletionChime === "function") playCompletionChime();
                        showToast(`تقبل الله دعاءك وذكرك، وجعله في ميزان حسناتك 🌿🤲`);
                    } else {
                        // إعادة التعيين
                        repeatBtn.setAttribute("data-remaining", targetRepeat);
                        card.classList.remove("is-finished");
                        repeatBtn.classList.remove("all-done");
                        repeatBtn.innerHTML = `<i class="fa-solid fa-hand-pointer"></i> <span class="btn-repeat-text">تبقى: ${targetRepeat}</span>`;
                    }
                });
            }

            gridContainer.appendChild(card);
        });
    };

    window.scrollDuasContainer = function(direction) {
        const container = document.getElementById("categorized-duas-grid");
        if (!container) return;
        const card = container.querySelector(".cat-dua-card, .azkar-card");
        const scrollAmount = card ? (card.offsetWidth + 20) : 320;
        const delta = direction === "left" ? -scrollAmount : scrollAmount;
        container.scrollBy({ left: delta, behavior: "smooth" });
    };

    window.scrollNawawiContainer = function(direction) {
        const container = document.getElementById("nawawi-grid");
        if (!container) return;
        const card = container.querySelector(".hadith-card");
        const scrollAmount = card ? (card.offsetWidth + 20) : 320;
        const delta = direction === "left" ? -scrollAmount : scrollAmount;
        container.scrollBy({ left: delta, behavior: "smooth" });
    };

    window.scrollAsmaaContainer = function(direction) {
        const container = document.getElementById("asmaa-grid");
        if (!container) return;
        const card = container.querySelector(".asmaa-card");
        const scrollAmount = card ? (card.offsetWidth + 16) : 260;
        const delta = direction === "left" ? -scrollAmount : scrollAmount;
        container.scrollBy({ left: delta, behavior: "smooth" });
    };

    // إعادة رسم القسم المفتوح حالياً بالتصميم المحدث فور التحميل
    if (typeof CATEGORIZED_DUAS !== "undefined") {
        const activeTab = document.querySelector(".duas-tab-btn.active");
        const catKey = activeTab ? activeTab.getAttribute("data-cat") : "karb_debt";
        if (CATEGORIZED_DUAS[catKey]) {
            window.renderDuasCardsList(CATEGORIZED_DUAS[catKey].duas || []);
        }
    }
}

/* ==========================================================================
   7. رسالة وتدبر آية اليوم لقلبك (Daily Spiritual Message & Story Share)
   ========================================================================== */
function initDailySpiritualMessage() {
    const dailyWisdomCard = document.getElementById("daily-wisdom-card");
    const dailyMsgModal = document.getElementById("daily-message-modal");
    const closeBtn = document.getElementById("btn-close-daily-msg-modal");
    const shareStoryBtn = document.getElementById("btn-share-wisdom-story");
    const copyBtn = document.getElementById("btn-copy-daily-msg");
    const shareWaBtn = document.getElementById("btn-share-daily-msg-wa");

    if (typeof getDailyMessageOfTheDay !== "function") return;
    const todayMsg = getDailyMessageOfTheDay();
    if (!todayMsg) return;

    // تحديث المحتوى في البطاقة الرئيسية بالصفحة
    const ayahSurahEl = document.getElementById("wisdom-ayah-surah");
    const ayahTextEl = document.getElementById("wisdom-ayah-text");
    const ayahTadabburEl = document.getElementById("wisdom-ayah-tadabbur");

    if (ayahSurahEl) ayahSurahEl.textContent = todayMsg.surah;
    if (ayahTextEl) ayahTextEl.textContent = todayMsg.verse;
    if (ayahTadabburEl) ayahTadabburEl.textContent = todayMsg.reflection;

    const openModal = () => {
        if (!dailyMsgModal) return;
        const tagEl = document.getElementById("modal-msg-tag");
        const titleEl = document.getElementById("modal-msg-title");
        const verseEl = document.getElementById("modal-msg-verse");
        const surahEl = document.getElementById("modal-msg-surah");
        const reflectionEl = document.getElementById("modal-msg-reflection");
        const duaEl = document.getElementById("modal-msg-dua");

        if (tagEl) tagEl.textContent = todayMsg.tag || "قبس إيماني متجدد";
        if (titleEl) titleEl.textContent = todayMsg.title || "رسالة لقلبك اليوم";
        if (verseEl) verseEl.textContent = todayMsg.verse;
        if (surahEl) surahEl.textContent = todayMsg.surah;
        if (reflectionEl) reflectionEl.textContent = todayMsg.reflection;
        if (duaEl) duaEl.textContent = todayMsg.dua;

        dailyMsgModal.classList.add("open");
        dailyMsgModal.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        if (!dailyMsgModal) return;
        dailyMsgModal.classList.remove("open");
        dailyMsgModal.classList.remove("active");
        document.body.style.overflow = "";
    };

    if (dailyWisdomCard) {
        dailyWisdomCard.addEventListener("click", (e) => {
            if (e.target.closest("#btn-share-wisdom-story")) return;
            openModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (dailyMsgModal) {
        dailyMsgModal.addEventListener("click", (e) => {
            if (e.target === dailyMsgModal) closeModal();
        });
    }

    const formatShareText = () => {
        return `✨ *${todayMsg.title}* ✨\n\n` +
               `📖 ${todayMsg.verse}\n` +
               `📌 (${todayMsg.surah})\n\n` +
               `💡 *الخاطرة والتدبر:*\n${todayMsg.reflection}\n\n` +
               `🤲 *دعاء اليوم:*\n${todayMsg.dua}\n\n` +
               `🌸 _من تطبيق زاد المسلم (صدقة جارية لوجه الله تعالى)_\n` +
               `📲 تصفح المزيد وتدبر القرآن كاملاً:\n${window.location.origin + window.location.pathname}`;
    };

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(formatShareText()).then(() => {
                showToast("تم نسخ رسالة اليوم بنجاح 📋");
            }).catch(() => {
                showToast("تعذر النسخ تلقائياً");
            });
        });
    }

    const handleWhatsAppShare = (e) => {
        if (e) e.stopPropagation();
        const text = encodeURIComponent(formatShareText());
        window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    };

    if (shareStoryBtn) shareStoryBtn.addEventListener("click", handleWhatsAppShare);
    if (shareWaBtn) shareWaBtn.addEventListener("click", handleWhatsAppShare);
}

/* ==========================================================================
   8. مكتبة قصص الأنبياء وسير الصحابة الكرام (Islamic Stories)
   ========================================================================== */
function initIslamicStories() {
    const storiesGrid = document.getElementById("stories-grid");
    const filterPills = document.querySelectorAll("#stories-filter-bar .nawawi-filter-pill");
    const storyModal = document.getElementById("story-details-modal");
    const closeBtn = document.getElementById("btn-close-story-modal");
    const copyBtn = document.getElementById("btn-copy-story");
    const shareWaBtn = document.getElementById("btn-share-story-wa");

    if (!storiesGrid || typeof ISLAMIC_STORIES_DATA === "undefined") return;

    let activeStory = null;

    // استخراج كافة القصص في مصفوفة مسطحة مع تصنيفاتها
    const getAllStories = () => {
        if (Array.isArray(ISLAMIC_STORIES_DATA)) {
            return ISLAMIC_STORIES_DATA;
        }
        let list = [];
        if (ISLAMIC_STORIES_DATA.prophets && Array.isArray(ISLAMIC_STORIES_DATA.prophets)) {
            list = list.concat(ISLAMIC_STORIES_DATA.prophets.map(s => ({ ...s, category: "prophets" })));
        }
        if (ISLAMIC_STORIES_DATA.sahaba && Array.isArray(ISLAMIC_STORIES_DATA.sahaba)) {
            list = list.concat(ISLAMIC_STORIES_DATA.sahaba.map(s => ({ ...s, category: "sahaba" })));
        }
        return list;
    };

    const allStories = getAllStories();

    const renderStories = (cat = "all") => {
        storiesGrid.innerHTML = "";
        const filtered = cat === "all" ? allStories : allStories.filter(s => s.category === cat);

        filtered.forEach(story => {
            const card = document.createElement("div");
            card.className = "story-card";
            const storyTitle = story.name || story.title || "قصة مباركة";
            const storyTag = story.tag || (story.category === 'prophets' ? 'قصص الأنبياء' : 'سير الصحابة');
            const storyVerse = story.keyVerse || story.verse || '';
            const storySummary = story.summary || '';
            const firstLesson = (story.lessons && story.lessons[0]) ? story.lessons[0] : 'عبرة إيمانية ملهمة';

            card.innerHTML = `
                <div class="story-card-header">
                    <div class="story-header-info">
                        <div class="story-icon-badge"><i class="${story.icon || 'fa-solid fa-book-open'}"></i></div>
                        <div class="story-title-group">
                            <h3>${storyTitle}</h3>
                            <span class="story-card-tag">${storyTag}</span>
                        </div>
                    </div>
                </div>

                <div class="story-card-body">
                    ${storyVerse ? `<div class="story-verse-preview">${storyVerse}</div>` : ''}
                    <p class="story-card-summary">${storySummary}</p>
                    <div class="story-lesson-preview">
                        <i class="fa-solid fa-lightbulb"></i>
                        <span>${firstLesson}</span>
                    </div>
                </div>

                <div class="story-card-footer">
                    <button type="button" class="btn btn-gold btn-read-story" data-story-id="${story.id}">
                        <i class="fa-solid fa-book-open-reader"></i>
                        <span>اقرأ القصة كاملة والعِبر</span>
                    </button>
                </div>
            `;

            const readBtn = card.querySelector(".btn-read-story");
            if (readBtn) {
                readBtn.addEventListener("click", () => {
                    openStoryModal(story);
                });
            }

            storiesGrid.appendChild(card);
        });
    };

    const openStoryModal = (story) => {
        activeStory = story;
        if (!storyModal) return;

        const iconEl = document.getElementById("modal-story-icon");
        const titleEl = document.getElementById("modal-story-title");
        const tagEl = document.getElementById("modal-story-tag");
        const verseEl = document.getElementById("modal-story-verse");
        const textEl = document.getElementById("modal-story-text");
        const lessonsEl = document.getElementById("modal-story-lessons");

        const storyTitle = story.name || story.title || "قصة مباركة";
        const storyTag = story.tag || (story.category === "prophets" ? "قصص الأنبياء عليهم السلام" : "العشرة المبشرون وسير الصحابة");
        const storyVerse = story.keyVerse || story.verse || "";
        const storyFullText = story.fullStory || story.summary || "";

        if (iconEl) iconEl.innerHTML = `<i class="${story.icon || 'fa-solid fa-book-open'}"></i>`;
        if (titleEl) titleEl.textContent = storyTitle;
        if (tagEl) tagEl.textContent = storyTag;
        if (verseEl) verseEl.textContent = storyVerse;
        if (textEl) textEl.textContent = storyFullText;

        if (lessonsEl) {
            lessonsEl.innerHTML = "";
            if (story.lessons && Array.isArray(story.lessons)) {
                story.lessons.forEach(lesson => {
                    const li = document.createElement("li");
                    li.style.marginBottom = "0.4rem";
                    li.textContent = lesson;
                    lessonsEl.appendChild(li);
                });
            }
        }

        storyModal.classList.add("open");
        storyModal.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    const closeStoryModal = () => {
        if (!storyModal) return;
        storyModal.classList.remove("open");
        storyModal.classList.remove("active");
        document.body.style.overflow = "";
    };

    if (closeBtn) closeBtn.addEventListener("click", closeStoryModal);
    if (storyModal) {
        storyModal.addEventListener("click", (e) => {
            if (e.target === storyModal) closeStoryModal();
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            if (!activeStory) return;
            const title = activeStory.name || activeStory.title;
            const verse = activeStory.keyVerse || activeStory.verse || '';
            const text = `📜 *${title}*\n\n${verse}\n\n💡 *أهم العبر والدروس:*\n` +
                         (activeStory.lessons ? activeStory.lessons.map(l => `• ${l}`).join('\n') : '') +
                         `\n\n🌿 موقع زاد المسلم: ${window.location.origin + window.location.pathname}`;
            navigator.clipboard.writeText(text).then(() => {
                showToast("تم نسخ قصة وعبر اليوم بنجاح 📋");
            });
        });
    }

    if (shareWaBtn) {
        shareWaBtn.addEventListener("click", () => {
            if (!activeStory) return;
            const title = activeStory.name || activeStory.title;
            const verse = activeStory.keyVerse || activeStory.verse || '';
            const text = encodeURIComponent(
                `📜 *${title}*\n\n` +
                `${verse}\n\n` +
                `💡 *الدروس المستفادة:*\n` +
                (activeStory.lessons ? activeStory.lessons.map(l => `• ${l}`).join('\n') : '') +
                `\n\n🌿 اقرأ المزيد من القصص والسير المباركة:\n${window.location.origin + window.location.pathname}`
            );
            window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
        });
    }

    // تبديل التصنيفات
    filterPills.forEach(pill => {
        pill.addEventListener("click", () => {
            filterPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            const cat = pill.getAttribute("data-cat") || "all";
            renderStories(cat);
        });
    });

    window.scrollStoriesContainer = function(direction) {
        const container = document.getElementById("stories-grid");
        if (!container) return;
        const card = container.querySelector(".story-card");
        const scrollAmount = card ? (card.offsetWidth + 20) : 340;
        const delta = direction === "left" ? -scrollAmount : scrollAmount;
        container.scrollBy({ left: delta, behavior: "smooth" });
    };

    renderStories("all");
}

/* ==========================================================================
   9. مسابقة واختبر معلوماتك الإسلامية (Islamic Quiz & Trivia)
   ========================================================================== */
function initIslamicQuiz() {
    const quizContainer = document.getElementById("quiz-container-card");
    if (!quizContainer || typeof ISLAMIC_QUIZ_QUESTIONS === "undefined") return;

    let roundQuestions = [];
    let currentIndex = 0;
    let score = 0;
    let isAnswered = false;

    const startQuizRound = () => {
        // خلط واختيار 5 أسئلة عشوائية في كل جولة
        const shuffled = [...ISLAMIC_QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
        roundQuestions = shuffled.slice(0, 5);
        currentIndex = 0;
        score = 0;
        isAnswered = false;
        renderQuestion();
    };

    const renderQuestion = () => {
        const q = roundQuestions[currentIndex];
        if (!q) {
            renderQuizResult();
            return;
        }

        isAnswered = false;
        const progressPct = ((currentIndex + 1) / roundQuestions.length) * 100;
        const correctIdx = (typeof q.correctIndex !== "undefined") ? q.correctIndex : ((typeof q.correct !== "undefined") ? q.correct : 0);

        quizContainer.innerHTML = `
            <div class="quiz-header-bar">
                <span class="quiz-progress-text">السؤال ${currentIndex + 1} من ${roundQuestions.length}</span>
                <span class="quiz-score-pill"><i class="fa-solid fa-star text-gold"></i> النقاط: ${score}</span>
            </div>

            <div class="quiz-progress-track">
                <div class="quiz-progress-fill" style="width: ${progressPct}%;"></div>
            </div>

            <div class="quiz-question-box">
                <div class="quiz-question-category"><i class="fa-solid fa-tag"></i> ${q.category || 'معلومات إسلامية'}</div>
                <h3 class="quiz-question-title">${q.question}</h3>
            </div>

            <div class="quiz-options-list" id="quiz-options-list">
                ${q.options.map((opt, idx) => `
                    <button type="button" class="quiz-option-btn" data-opt-index="${idx}">
                        <span>${opt}</span>
                        <i class="fa-regular fa-circle-check opt-icon"></i>
                    </button>
                `).join('')}
            </div>

            <div id="quiz-feedback-container"></div>
        `;

        const optionButtons = quizContainer.querySelectorAll(".quiz-option-btn");
        optionButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                if (isAnswered) return;
                isAnswered = true;
                const selectedIdx = parseInt(btn.getAttribute("data-opt-index"), 10);
                const isCorrect = selectedIdx === correctIdx;

                optionButtons.forEach((b, idx) => {
                    b.disabled = true;
                    if (idx === correctIdx) {
                        b.classList.add("correct");
                        const icon = b.querySelector(".opt-icon");
                        if (icon) icon.className = "fa-solid fa-circle-check opt-icon";
                    } else if (idx === selectedIdx && !isCorrect) {
                        b.classList.add("wrong");
                        const icon = b.querySelector(".opt-icon");
                        if (icon) icon.className = "fa-solid fa-circle-xmark opt-icon";
                    }
                });

                if (isCorrect) {
                    score++;
                    const scorePill = quizContainer.querySelector(".quiz-score-pill");
                    if (scorePill) scorePill.innerHTML = `<i class="fa-solid fa-star text-gold"></i> النقاط: ${score}`;
                    if ("vibrate" in navigator) navigator.vibrate(30);
                    if (typeof playCompletionChime === "function") playCompletionChime();
                } else {
                    if ("vibrate" in navigator) navigator.vibrate([60, 40, 60]);
                }

                // إظهار الشرح وزر الانتقال
                const feedbackBox = document.getElementById("quiz-feedback-container");
                if (feedbackBox) {
                    const isLast = currentIndex === roundQuestions.length - 1;
                    feedbackBox.innerHTML = `
                        <div class="quiz-explanation-box">
                            <div style="font-size: 0.95rem; color: ${isCorrect ? 'var(--emerald-400)' : '#f87171'}; font-weight: 700; margin-bottom: 0.4rem;">
                                ${isCorrect ? '🎉 إجابة صحيحة وممتازة!' : '❌ إجابة غير صحيحة، والإجابة الصواب موضحة بالأخضر.'}
                            </div>
                            <p style="font-size: 0.92rem; color: var(--text-primary); line-height: 1.6; margin: 0 0 1rem 0;">${q.explanation || ''}</p>
                            <button type="button" class="btn btn-gold" id="btn-next-question" style="width: 100%;">
                                <span>${isLast ? 'عرض النتيجة النهائية 🏆' : 'السؤال التالي ➡️'}</span>
                            </button>
                        </div>
                    `;

                    const nextBtn = document.getElementById("btn-next-question");
                    if (nextBtn) {
                        nextBtn.addEventListener("click", () => {
                            currentIndex++;
                            renderQuestion();
                        });
                    }
                }
            });
        });
    };

    const renderQuizResult = () => {
        let message = "ما شاء الله! بداية مباركة للعلم النافع 🌿";
        if (score === 5) message = "ما شاء الله تبارك الله! علامة كاملة ومستوى متميز في العلوم الإسلامية 🌟👑";
        else if (score >= 3) message = "أحسنت! إجابات رائعة ومستوى طيب جداً، داوم على الاستزادة 🌸";

        quizContainer.innerHTML = `
            <div class="quiz-result-view">
                <div class="quiz-result-score-circle">
                    <div>${score}/5</div>
                    <span class="quiz-result-score-label">النتيجة النهائية</span>
                </div>
                <h3 class="quiz-result-title">اكتملت الجولة الإيمانية بنجاح!</h3>
                <p class="quiz-result-desc">${message}</p>

                <div class="quiz-result-actions">
                    <button type="button" class="btn btn-outline" id="btn-retry-quiz">
                        <i class="fa-solid fa-rotate-right"></i>
                        <span>جولة جديدة بأسئلة مختلفة</span>
                    </button>
                    <button type="button" class="btn btn-gold" id="btn-share-quiz-score">
                        <i class="fa-brands fa-whatsapp"></i>
                        <span>تحدَّ أصدقاءك بنتيجتك</span>
                    </button>
                </div>
            </div>
        `;

        const retryBtn = document.getElementById("btn-retry-quiz");
        const shareScoreBtn = document.getElementById("btn-share-quiz-score");

        if (retryBtn) retryBtn.addEventListener("click", startQuizRound);
        if (shareScoreBtn) {
            shareScoreBtn.addEventListener("click", () => {
                const text = encodeURIComponent(
                    `🎯 حصلت على (${score} من 5) في مسابقة المعلومات الإسلامية على موقع زاد المسلم!\n` +
                    `اختبر معلوماتك الدينية وتحدَّ أصدقاءك في القرآن والسيرة العطرة:\n` +
                    `${window.location.origin + window.location.pathname}#islamic-quiz`
                );
                window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
            });
        }
    };

    startQuizRound();
}

/* ==========================================================================
   10. ويدجت إذاعة القرآن الكريم ومؤقت النوم الذكي (Live Radio & Sleep Timer)
   ========================================================================== */
function initLiveRadioWidgetWithSleepTimer() {
    const radioAudio = document.getElementById("live-radio-audio");
    const fabBtn = document.getElementById("radio-fab-btn");
    const navBtn = document.getElementById("btn-toggle-radio-nav");
    const panel = document.getElementById("radio-panel");
    const closeBtn = document.getElementById("btn-close-radio");
    const playBtn = document.getElementById("btn-radio-play");
    const playIcon = document.getElementById("radio-play-icon");
    const select = document.getElementById("radio-station-select");
    const volumeSlider = document.getElementById("radio-volume-slider");
    const muteBtn = document.getElementById("btn-radio-mute");
    const volumeIcon = document.getElementById("radio-volume-icon");
    const nameEl = document.getElementById("current-station-name");
    const descEl = document.getElementById("current-station-desc");
    const badgeEl = document.getElementById("current-station-badge");
    const sleepSelect = document.getElementById("radio-sleep-timer-select");
    const countdownEl = document.getElementById("radio-timer-countdown");
    const remTimeEl = document.getElementById("radio-timer-rem-time");
    const wavesEl = document.getElementById("radio-waves");

    if (!radioAudio || !panel || !fabBtn) return;

    const stations = (typeof RADIO_STATIONS_LIST !== "undefined" && RADIO_STATIONS_LIST.length > 0)
        ? RADIO_STATIONS_LIST
        : (typeof RADIO_STATIONS !== "undefined" ? RADIO_STATIONS : []);

    if (stations.length === 0) return;

    let isPlaying = false;
    let sleepTimerInterval = null;
    let previousVolume = 0.8;
    let fallbackAttempts = 0;

    // 1. ملء قائمة المحطات واختيار المحطة النشطة
    if (select) {
        select.innerHTML = "";
        stations.forEach(st => {
            const opt = document.createElement("option");
            opt.value = st.id;
            opt.textContent = st.name;
            select.appendChild(opt);
        });
    }

    // استرجاع المحطة المحفوظة أو البدء بالإذاعة العامة المستقرة 100%
    let savedStationId = null;
    try {
        savedStationId = localStorage.getItem("zadmuslim_active_radio_station");
    } catch(e) {}

    let currentStation = stations.find(s => s.id === savedStationId);
    if (!currentStation) {
        // افتراضياً الإذاعة العامة المضمونة أو الشيخ علي جابر
        currentStation = stations.find(s => s.id === "general") || stations.find(s => s.id === "ali_jaber") || stations[0];
    }

    const applyStationUI = (st) => {
        if (!st) return;
        if (nameEl) nameEl.textContent = st.name;
        if (descEl) descEl.textContent = st.desc;
        if (select) select.value = st.id;
        if (badgeEl && st.icon) {
            badgeEl.innerHTML = `<i class="${st.icon}"></i>`;
        }
    };

    let isLoadingStream = false;

    const setLoadingState = (loading, message = "جاري الاتصال بالبث المباشر... ⏳") => {
        isLoadingStream = loading;
        if (loading) {
            if (playIcon) playIcon.className = "fa-solid fa-spinner fa-spin";
            if (playBtn) {
                playBtn.classList.add("is-loading");
                playBtn.setAttribute("title", message);
            }
            if (fabBtn) fabBtn.classList.add("is-loading");
            if (descEl) descEl.innerHTML = `<span style="color: #ffd875; font-weight: 700;"><i class="fa-solid fa-spinner fa-spin"></i> ${message}</span>`;
        } else {
            if (playBtn) {
                playBtn.classList.remove("is-loading");
                playBtn.setAttribute("title", isPlaying ? "إيقاف مؤقت" : "تشغيل البث");
            }
            if (fabBtn) fabBtn.classList.remove("is-loading");
            if (descEl && currentStation) descEl.textContent = currentStation.desc;
        }
    };

    const setStation = (st, autoPlay = false) => {
        if (!st) return;
        currentStation = st;
        try {
            localStorage.setItem("zadmuslim_active_radio_station", st.id);
        } catch(e) {}
        applyStationUI(st);
        radioAudio.src = st.url;
        if (autoPlay || isPlaying) {
            setLoadingState(true, `جاري تشغيل «${st.name}»... ⏳`);
            radioAudio.play().then(() => {
                fallbackAttempts = 0;
                setLoadingState(false);
                updatePlayState(true);
            }).catch(e => {
                console.warn("Radio playback error, trying fallback:", e);
                triggerStreamFallback(st);
            });
        }
    };

    applyStationUI(currentStation);
    radioAudio.src = currentStation.url;

    if (select) {
        select.addEventListener("change", () => {
            const st = stations.find(s => s.id === select.value) || stations[0];
            fallbackAttempts = 0;
            setStation(st, isPlaying);
        });
    }

    // التحويل التلقائي الذكي للبث البديل في حال تعثر أي إذاعة لضمان عدم انقطاع التلاوة
    const triggerStreamFallback = (failedStation) => {
        setLoadingState(false);
        fallbackAttempts++;
        if (fallbackAttempts > 4) {
            fallbackAttempts = 0;
            updatePlayState(false);
            if (typeof showToast === "function") {
                showToast("تعذر الاتصال بالبث حالياً، يرجى اختيار إذاعة أخرى من القائمة 📻");
            }
            return;
        }

        // إذا كانت المحطة تحتوي على رابط احتياطي
        if (failedStation && failedStation.backupUrl && radioAudio.src !== failedStation.backupUrl) {
            console.warn("Switching to backup stream URL:", failedStation.backupUrl);
            radioAudio.src = failedStation.backupUrl;
            if (isPlaying) {
                setLoadingState(true, "جاري الانتقال للتردد الاحتياطي... ⏳");
                radioAudio.play().then(() => {
                    setLoadingState(false);
                    updatePlayState(true);
                }).catch(() => triggerStreamFallback(null));
            }
            return;
        }

        // الانتقال الفوري لمحطة بديلة فائقة الاستقرار (الإذاعة العامة أو الشيخ علي جابر أو المنشاوي)
        const reliable = stations.find(s => s.id === "general" && s.id !== failedStation?.id)
                      || stations.find(s => s.id === "ali_jaber" && s.id !== failedStation?.id)
                      || stations.find(s => s.id === "minshawi")
                      || stations[0];

        if (reliable && reliable.id !== failedStation?.id) {
            console.warn("Switching to reliable station:", reliable.name);
            setStation(reliable, isPlaying);
            if (typeof showToast === "function") {
                showToast(`تم التحويل تلقائياً إلى «${reliable.name}» لضمان استمرار البث 📻✨`);
            }
        }
    };

    // مراقبة أحداث الصوت وإظهار اللودينج أثناء التحميل والبفرينج
    radioAudio.addEventListener("loadstart", () => {
        if (!radioAudio.paused) setLoadingState(true, "جاري تهيئة البث المباشر... ⏳");
    });
    radioAudio.addEventListener("waiting", () => {
        setLoadingState(true, "جاري تحضير البث المباشر والاتصال بالسيرفر... ⏳");
    });
    radioAudio.addEventListener("canplay", () => {
        setLoadingState(false);
    });
    radioAudio.addEventListener("playing", () => {
        setLoadingState(false);
        updatePlayState(true);
    });
    radioAudio.addEventListener("pause", () => {
        setLoadingState(false);
        updatePlayState(false);
    });
    radioAudio.addEventListener("error", () => {
        setLoadingState(false);
        console.warn("Radio stream error event fired, attempting fallback...");
        triggerStreamFallback(currentStation);
    });

    // 2. تحديث حالة التشغيل والمظهر
    const updatePlayState = (playing) => {
        isPlaying = playing;
        if (!isLoadingStream && playIcon) {
            playIcon.className = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
        }
        if (fabBtn) {
            if (playing) {
                fabBtn.classList.add("is-playing");
            } else {
                fabBtn.classList.remove("is-playing");
            }
        }
        if (navBtn) {
            if (playing) {
                navBtn.classList.add("active");
            } else {
                navBtn.classList.remove("active");
            }
        }
        if (panel) {
            if (playing) {
                panel.classList.add("is-playing");
            } else {
                panel.classList.remove("is-playing");
            }
        }
        if (wavesEl) {
            wavesEl.style.display = playing ? "flex" : "none";
        }
    };

    const toggleRadioPlayback = () => {
        if (isPlaying) {
            setLoadingState(false);
            radioAudio.pause();
            updatePlayState(false);
            if (typeof showToast === "function") showToast("تم إيقاف إذاعة القرآن الكريم ⏸️");
        } else {
            // إيقاف مشغلات الصوت الأخرى لمنع التداخل
            const legacyAudio = document.getElementById("quran-audio");
            if (legacyAudio && !legacyAudio.paused) {
                legacyAudio.pause();
                const btnToggleAudio = document.getElementById("btn-toggle-audio");
                if (btnToggleAudio) btnToggleAudio.classList.remove("active");
            }

            setLoadingState(true, "جاري الاتصال بالبث المباشر... ⏳");

            radioAudio.play().then(() => {
                fallbackAttempts = 0;
                setLoadingState(false);
                updatePlayState(true);
                if (typeof showToast === "function") showToast("جاري الاستماع لإذاعة القرآن الكريم 📻🌿");
            }).catch(e => {
                console.warn("Radio stream play error:", e);
                triggerStreamFallback(currentStation);
            });
        }
    };

    if (playBtn) {
        playBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleRadioPlayback();
        });
    }

    // التحكم بالصوت وزر الكتم
    const updateVolumeUI = (vol) => {
        if (volumeIcon) {
            if (vol <= 0) {
                volumeIcon.className = "fa-solid fa-volume-xmark";
            } else if (vol < 0.5) {
                volumeIcon.className = "fa-solid fa-volume-low";
            } else {
                volumeIcon.className = "fa-solid fa-volume-high";
            }
        }
    };

    if (volumeSlider) {
        radioAudio.volume = parseFloat(volumeSlider.value) || 0.8;
        previousVolume = radioAudio.volume;
        updateVolumeUI(radioAudio.volume);

        volumeSlider.addEventListener("input", () => {
            const val = parseFloat(volumeSlider.value);
            radioAudio.volume = val;
            if (val > 0) previousVolume = val;
            updateVolumeUI(val);
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (radioAudio.volume > 0) {
                previousVolume = radioAudio.volume || 0.8;
                radioAudio.volume = 0;
                if (volumeSlider) volumeSlider.value = 0;
                updateVolumeUI(0);
            } else {
                const restore = previousVolume > 0 ? previousVolume : 0.8;
                radioAudio.volume = restore;
                if (volumeSlider) volumeSlider.value = restore;
                updateVolumeUI(restore);
            }
        });
    }

    // 3. فتح وإغلاق النافذة المنبثقة للراديو
    fabBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.toggle("open");
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            panel.classList.remove("open");
        });
    }

    if (navBtn) {
        navBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            panel.classList.toggle("open");
            if (!isPlaying) {
                toggleRadioPlayback();
            }
        });
    }

    // منع إغلاق النافذة عند النقر بداخلها
    panel.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // إغلاق النافذة عند النقر خارجها
    document.addEventListener("click", (e) => {
        if (panel.classList.contains("open") && !panel.contains(e.target) && e.target !== fabBtn && !fabBtn.contains(e.target)) {
            panel.classList.remove("open");
        }
    });

    // 4. التحكم بمؤقت النوم الذكي (Sleep Timer)
    if (sleepSelect) {
        sleepSelect.addEventListener("change", () => {
            if (sleepTimerInterval) {
                clearInterval(sleepTimerInterval);
                sleepTimerInterval = null;
            }

            const minutes = parseInt(sleepSelect.value, 10);
            if (minutes > 0) {
                const targetTime = Date.now() + minutes * 60 * 1000;
                if (countdownEl) countdownEl.style.display = "flex";

                const updateTimer = () => {
                    const remMs = targetTime - Date.now();
                    if (remMs <= 0) {
                        clearInterval(sleepTimerInterval);
                        sleepTimerInterval = null;
                        if (countdownEl) countdownEl.style.display = "none";
                        sleepSelect.value = "0";
                        radioAudio.pause();
                        updatePlayState(false);
                        if (typeof showToast === "function") {
                            showToast("تم إيقاف تلاوة القرآن الكريم بموجب مؤقت النوم 🌙 تقبل الله طاعتكم");
                        }
                        return;
                    }

                    const totalSec = Math.floor(remMs / 1000);
                    const m = Math.floor(totalSec / 60);
                    const s = totalSec % 60;
                    if (remTimeEl) {
                        remTimeEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                    }
                };

                updateTimer();
                sleepTimerInterval = setInterval(updateTimer, 1000);
                if (typeof showToast === "function") {
                    showToast(`تم ضبط مؤقت إيقاف التلاوة بعد ${minutes} دقيقة ⏱️`);
                }
            } else {
                if (countdownEl) countdownEl.style.display = "none";
            }
        });
    }
}

/* ==========================================================================
   11. العداد الإيماني التفاعلي الشامل (Global Community Counter)
   ========================================================================== */
function initGlobalCommunityCounter() {
    const statCards = document.querySelectorAll(".stat-card");
    statCards.forEach(card => {
        card.addEventListener("click", () => {
            if ("vibrate" in navigator) navigator.vibrate(20);
            if (typeof playTasbeehClickTone === "function") playTasbeehClickTone();
        });
    });
}

/* ==========================================================================
   12. حديقة الحسنات وشجرة الذكر التفاعلية (Spiritual Garden & Tree)
   ========================================================================== */
const GARDEN_STAGES = [
    {
        id: 1,
        title: "المرحلة الأولى: بذرة الإيمان 🌱",
        desc: "غرس طيب مبارك، ابدأ بالتسبيح والقرآن لتنمو شجرتك",
        minPoints: 0,
        nextTarget: 25,
        emoji: "🌱",
        nextTitle: "غرس مبارك 🌿"
    },
    {
        id: 2,
        title: "المرحلة الثانية: غرس مبارك 🌿",
        desc: "أورقت شجرتك الإيمانية بفضل أذكارك وتلاوتك",
        minPoints: 25,
        nextTarget: 75,
        emoji: "🌿",
        nextTitle: "شجرة الاستغفار 🌳"
    },
    {
        id: 3,
        title: "المرحلة الثالثة: شجرة الاستغفار 🌳",
        desc: "شجرة باسقة مباركة تظلل صاحبها بالأجر والثواب",
        minPoints: 75,
        nextTarget: 150,
        emoji: "🌳",
        nextTitle: "أصلها ثابت وفرعها في السماء 🌳✨"
    },
    {
        id: 4,
        title: "المرحلة الرابعة: أصلها ثابت وفرعها في السماء 🌳✨",
        desc: "تؤتي أُكُلها كل حين بإذن ربها، تقبل الله طاعاتك",
        minPoints: 150,
        nextTarget: 300,
        emoji: "🌳✨",
        nextTitle: "روضة الرضوان والجنة 🌺🌸"
    },
    {
        id: 5,
        title: "المرحلة الخامسة: روضة الرضوان والجنة 🌺🌸",
        desc: "ما شاء الله! حديقة إيمانية متكاملة عامرة بالبركة والحسنات",
        minPoints: 300,
        nextTarget: 300,
        emoji: "🌺🌸",
        nextTitle: "أعلى المراتب 🌟"
    }
];

function getGardenStorageKey() {
    return `spiritual_garden_${new Date().toISOString().slice(0, 10)}`;
}

function getGardenData() {
    const key = getGardenStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch(e) {}
    }
    return {
        points: 0,
        tasbeeh: 0,
        quran: 0,
        azkar: 0,
        quiz: 0,
        streak: parseInt(localStorage.getItem("spiritual_garden_streak") || "1", 10)
    };
}

function saveGardenData(data) {
    const key = getGardenStorageKey();
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem("spiritual_garden_streak", String(data.streak || 1));
}

window.addSpiritualGardenDeed = function(type, points = 1) {
    const data = getGardenData();
    const prevPoints = data.points;
    data.points += points;

    if (type === "tasbeeh") data.tasbeeh = (data.tasbeeh || 0) + 1;
    else if (type === "quran") data.quran = (data.quran || 0) + 1;
    else if (type === "azkar") data.azkar = (data.azkar || 0) + 1;
    else if (type === "quiz") data.quiz = (data.quiz || 0) + 1;

    saveGardenData(data);
    updateGardenUI(data);

    // التحقق من الترقية لمرحلة جديدة
    const prevStage = GARDEN_STAGES.slice().reverse().find(s => prevPoints >= s.minPoints) || GARDEN_STAGES[0];
    const newStage = GARDEN_STAGES.slice().reverse().find(s => data.points >= s.minPoints) || GARDEN_STAGES[0];

    if (newStage.id > prevStage.id) {
        if (typeof playCompletionChime === "function") playCompletionChime();
        if (typeof showToast === "function") {
            showToast(`مبارك! ارتقت شجرة حسناتك إلى «${newStage.title}» 🌳🎉`);
        }
        const emojiEl = document.getElementById("tree-stage-emoji");
        if (emojiEl) {
            emojiEl.style.transform = "scale(1.4) rotate(10deg)";
            setTimeout(() => { emojiEl.style.transform = ""; }, 600);
        }
    }
};

function updateGardenUI(data = null) {
    if (!data) data = getGardenData();

    const pointsEl = document.getElementById("garden-points-count");
    const streakEl = document.getElementById("garden-streak-count");
    const emojiEl = document.getElementById("tree-stage-emoji");
    const titleEl = document.getElementById("tree-stage-title");
    const descEl = document.getElementById("tree-stage-desc");
    const nextLabelEl = document.getElementById("garden-next-level-label");
    const ratioEl = document.getElementById("garden-progress-ratio");
    const barEl = document.getElementById("garden-progress-bar");

    const tasbeehEl = document.getElementById("garden-tasbeeh-deeds");
    const quranEl = document.getElementById("garden-quran-deeds");
    const azkarEl = document.getElementById("garden-azkar-deeds");
    const quizEl = document.getElementById("garden-quiz-deeds");

    if (pointsEl) pointsEl.textContent = data.points;
    if (streakEl) streakEl.textContent = data.streak || 1;
    if (tasbeehEl) tasbeehEl.textContent = data.tasbeeh || 0;
    if (quranEl) quranEl.textContent = data.quran || 0;
    if (azkarEl) azkarEl.textContent = data.azkar || 0;
    if (quizEl) quizEl.textContent = data.quiz || 0;

    const currentStage = GARDEN_STAGES.slice().reverse().find(s => data.points >= s.minPoints) || GARDEN_STAGES[0];

    if (emojiEl) emojiEl.textContent = currentStage.emoji;
    if (titleEl) titleEl.textContent = currentStage.title;
    if (descEl) descEl.textContent = currentStage.desc;

    if (currentStage.id === 5) {
        if (nextLabelEl) nextLabelEl.textContent = "حديقتك في أعلى درجات البركة والازدهار ✨";
        if (ratioEl) ratioEl.textContent = `${data.points} حسنة`;
        if (barEl) barEl.style.width = "100%";
    } else {
        const nextStage = GARDEN_STAGES.find(s => s.id === currentStage.id + 1);
        if (nextStage) {
            const range = nextStage.minPoints - currentStage.minPoints;
            const progress = data.points - currentStage.minPoints;
            const pct = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
            if (nextLabelEl) nextLabelEl.textContent = `الهدف للترقية إلى «${nextStage.title}»:`;
            if (ratioEl) ratioEl.textContent = `${data.points} / ${nextStage.minPoints}`;
            if (barEl) barEl.style.width = `${pct}%`;
        }
    }
}

function initSpiritualGarden() {
    updateGardenUI();

    const shareBtn = document.getElementById("btn-share-garden-status");
    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            const data = getGardenData();
            const currentStage = GARDEN_STAGES.slice().reverse().find(s => data.points >= s.minPoints) || GARDEN_STAGES[0];
            
            const msg = `🌳 *شجرة الذكر وحديقة الحسنات في تطبيق زاد المسلم*\n\n🌱 وصلت اليوم إلى: *${currentStage.title}*\n✨ رصيد بركتي: *${data.points} حسنة/نقطة*\n📿 تسبيحات: ${data.tasbeeh || 0} • 📖 صفحات قرآن: ${data.quran || 0}\n\n🌸 صدقة جارية لوجه الله تعالى\n📲 ازرع شجرتك في الجنة الآن: https://zadmuslim-zeta.vercel.app/`;
            
            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
            window.open(url, "_blank");
        });
    }
}

/* ==========================================================================
   13. التذكير السياقي الذكي بحسب الوقت واليوم (Smart Timely Reminders)
   يتغير تلقائياً بحسب وقت اليوم:
   - سورة الكهف يوم الجمعة المباركة
   - صيام الإثنين والخميس
   - قيام الليل والأسحار والوتر
   - أذكار الصباح وحصن المسلم
   - صلاة الضحى صدقة المفاصل
   - وقت الظهيرة وتلاوة القرآن الكريم
   - أذكار المساء وحفظ الرحمن
   - ما بين المغرب والعشاء وروضة الطاعات
   - سكينة الليل وسورة الملك وركعة الوتر
   ========================================================================== */
function initSmartTimelyReminders() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, 4 = Thursday, 5 = Friday
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const timeVal = hour + (minutes / 60);

    const banner = document.getElementById("smart-reminder-banner");
    if (!banner) return;

    let reminderConfig = null;

    // 1. يوم الجمعة المباركة (من مغرب الخميس 18:30 وحتى مغرب الجمعة 18:00)
    const isFridayTime = (dayOfWeek === 4 && timeVal >= 18.5) || (dayOfWeek === 5 && timeVal < 18.0);
    if (isFridayTime) {
        reminderConfig = {
            id: "friday_kahf",
            icon: "fa-solid fa-star-and-crescent",
            title: "اليوم الجمعة المباركة • نور ما بين الجمعتين 🌸",
            desc: "خير يوم طلعت عليه الشمس؛ لا تنسَ قراءة سورة الكهف، والإكثار من الصلاة والسلام على النبي ﷺ، والدعاء في ساعة الاستجابة.",
            actionText: "قراءة سورة الكهف 📖",
            actionCallback: () => {
                const quranSec = document.getElementById("quran-khatma");
                if (quranSec) {
                    if (typeof goToMushafPage === "function") goToMushafPage(293, 18);
                    quranSec.scrollIntoView({ behavior: "smooth" });
                } else {
                    sessionStorage.setItem("target_mushaf_page", JSON.stringify({ page: 293, surah: 18 }));
                    window.location.href = "services.html#quran-khatma";
                }
            }
        };
    }
    // 2. سنة صيام الإثنين والخميس (نهار الإثنين حتى 15:30، أو نهار الخميس حتى 15:30)
    else if ((dayOfWeek === 1 && timeVal >= 5.0 && timeVal < 15.5) || (dayOfWeek === 4 && timeVal >= 5.0 && timeVal < 15.5)) {
        const dayName = dayOfWeek === 1 ? "الإثنين" : "الخميس";
        reminderConfig = {
            id: `fasting_${dayName}`,
            icon: "fa-solid fa-hand-holding-heart",
            title: `سنة صيام ${dayName} • ترفع فيه الأعمال 🌿`,
            desc: "قال ﷺ: 'تُعرض الأعمال يوم الاثنين والخميس، فأحب أن يُعرض عملي وأنا صائم'. هنيئاً للصائمين وبشرى بباب الريان.",
            actionText: "تتبع صيام النوافل 🤲",
            actionCallback: () => {
                const fastingSec = document.getElementById("fasting-tracker") || document.getElementById("hero-prayers-strip");
                if (fastingSec) {
                    fastingSec.scrollIntoView({ behavior: "smooth" });
                } else {
                    window.location.href = "services.html#fasting-tracker";
                }
            }
        };
    }
    // 3. التذكير بصيام الغد (ليلة الإثنين: الأحد بعد 18:30، أو ليلة الخميس: الأربعاء بعد 18:30)
    else if ((dayOfWeek === 0 && timeVal >= 18.5 && timeVal < 23.5) || (dayOfWeek === 3 && timeVal >= 18.5 && timeVal < 23.5)) {
        const targetDay = dayOfWeek === 0 ? "الإثنين" : "الخميس";
        reminderConfig = {
            id: `eve_fasting_${targetDay}`,
            icon: "fa-solid fa-moon text-gold",
            title: `غداً سنة صيام ${targetDay} المبارك 🌙`,
            desc: "بيّت النية لصيام الغد؛ تُعرض الأعمال على الله تعالى ويُباعد الله وجه الصائم عن النار سبعين خريفاً.",
            actionText: "أذكار وطاعات الصيام 🤲",
            actionCallback: () => {
                const azkarSec = document.getElementById("azkar");
                if (azkarSec) {
                    azkarSec.scrollIntoView({ behavior: "smooth" });
                } else {
                    window.location.href = "services.html#azkar";
                }
            }
        };
    }
    // 4. الثلث الأخير من الليل • قيام الليل والاستغفار بالأسحار (02:00 إلى 05:00 فجراً)
    else if (timeVal >= 2.0 && timeVal < 5.0) {
        reminderConfig = {
            id: "night_qiyam_sahoor",
            icon: "fa-solid fa-mosque",
            title: "قيام الليل والأسحار • شرف المؤمن 🌌",
            desc: "ينزل ربنا تبارك وتعالى إلى السماء الدنيا: 'هل من داعٍ فأستجيب له؟'... صلِّ ركعتين خاشعتين واختم ليلتك بالوتر واستغفر بالأسحار.",
            actionText: "أدعية قيام الليل والوتر 🤲",
            actionCallback: () => {
                const duaaSec = document.getElementById("daily-duas") || document.getElementById("azkar");
                if (duaaSec) {
                    duaaSec.scrollIntoView({ behavior: "smooth" });
                } else {
                    window.location.href = "services.html#daily-duas";
                }
            }
        };
    }
    // 5. أذكار الصباح وحصن المسلم (05:00 إلى 08:30 صباحاً)
    else if (timeVal >= 5.0 && timeVal < 8.5) {
        reminderConfig = {
            id: "morning_azkar",
            icon: "fa-solid fa-sun",
            title: "ألا بذكر الله تطمئن القلوب • أذكار الصباح 🌅",
            desc: "ابدأ يومك بحفظ الله ورعايته؛ أذكار الصباح حصن منيع وانشراح للصدر وبركة في الرزق ليومك كله.",
            actionText: "أذكار الصباح 🛡️",
            actionCallback: () => {
                const azkarSec = document.getElementById("azkar");
                if (azkarSec) {
                    const azkarTab = document.getElementById("tab-morning");
                    if (azkarTab) azkarTab.click();
                    azkarSec.scrollIntoView({ behavior: "smooth" });
                } else {
                    sessionStorage.setItem("target_azkar_tab", "tab-morning");
                    window.location.href = "services.html#azkar";
                }
            }
        };
    }
    // 6. صلاة الضحى • صلاة الأوابين وصدقة المفاصل (08:30 إلى 11:30 صباحاً)
    else if (timeVal >= 8.5 && timeVal < 11.5) {
        reminderConfig = {
            id: "duha_prayer",
            icon: "fa-solid fa-cloud-sun",
            title: "صلاة الضحى • صدقة عن كل مفصل ☀️",
            desc: "يصبح على كل سلامى من أحدكم صدقة، وتجزئ عن ذلك ركعتان يركعهما من الضحى صلاة الأوابين لجلب البركة والسكينة.",
            actionText: "فضل صلاة الضحى 🕌",
            actionCallback: () => {
                const prayersSec = document.getElementById("prayer-times") || document.getElementById("azkar");
                if (prayersSec) {
                    prayersSec.scrollIntoView({ behavior: "smooth" });
                } else {
                    window.location.href = "services.html#prayer-times";
                }
            }
        };
    }
    // 7. وقت الظهيرة وما بعد الظهر • ورد القرآن وذكر الله (11:30 إلى 15:30 عصراً)
    else if (timeVal >= 11.5 && timeVal < 15.5) {
        reminderConfig = {
            id: "noon_quran",
            icon: "fa-solid fa-book-quran",
            title: "طيّب وقتك بذكر الله وتلاوة كتابه 📖",
            desc: "اجعل لقلبك نصيباً من كتاب الله في منتصف يومك؛ تلاوة صفحة من المصحف الشريف والصلاة على النبي ﷺ تنير دربك وتبارك وقتك.",
            actionText: "ورد القرآن اليومي 📖",
            actionCallback: () => {
                const quranSec = document.getElementById("quran-khatma");
                if (quranSec) {
                    quranSec.scrollIntoView({ behavior: "smooth" });
                } else {
                    window.location.href = "services.html#quran-khatma";
                }
            }
        };
    }
    // 8. أذكار المساء وحفظ الرحمن (15:30 إلى 18:30 مساءً)
    else if (timeVal >= 15.5 && timeVal < 18.5) {
        reminderConfig = {
            id: "evening_azkar",
            icon: "fa-solid fa-cloud-sun",
            title: "حصّن نفسك وأهلك • أذكار المساء 🌇",
            desc: "أمسينا وأمسى الملك لله؛ حان وقت أذكار المساء لطمأنينة القلب والوقاية من كل سوء والتحصين الشامل حتى تصبح.",
            actionText: "أذكار المساء 🛡️",
            actionCallback: () => {
                const azkarSec = document.getElementById("azkar");
                if (azkarSec) {
                    const azkarTab = document.getElementById("tab-evening");
                    if (azkarTab) azkarTab.click();
                    azkarSec.scrollIntoView({ behavior: "smooth" });
                } else {
                    sessionStorage.setItem("target_azkar_tab", "tab-evening");
                    window.location.href = "services.html#azkar";
                }
            }
        };
    }
    // 9. ما بين المغرب والعشاء • روضة الطاعات والسنن (18:30 إلى 20:30 مساءً)
    else if (timeVal >= 18.5 && timeVal < 20.5) {
        reminderConfig = {
            id: "maghrib_isha_awabin",
            icon: "fa-solid fa-hands-praying",
            title: "ما بين المغرب والعشاء • روضة الطاعات 🕌",
            desc: "وقت مبارك لشهود السنن الرواتب، وتدبر آيات الذكر الحكيم، ومداومة الاستغفار والتسبيح قبل صلاة العشاء.",
            actionText: "السبحة والأذكار 📿",
            actionCallback: () => {
                const sebhaSec = document.getElementById("sebha") || document.getElementById("azkar");
                if (sebhaSec) {
                    sebhaSec.scrollIntoView({ behavior: "smooth" });
                } else {
                    window.location.href = "services.html#sebha";
                }
            }
        };
    }
    // 10. سكينة الليل وسورة الملك وركعة الوتر (20:30 إلى 02:00 بعد منتصف الليل)
    else {
        reminderConfig = {
            id: "night_mulk",
            icon: "fa-solid fa-moon",
            title: "سكينة الليل ونور القبر 🌙",
            desc: "سورة الملك تنجي من عذاب القبر وتشفع لصاحبها، واختم ليلتك بركعة الوتر قبل النوم لتنام على طاعة.",
            actionText: "قراءة سورة الملك 📖",
            actionCallback: () => {
                const quranSec = document.getElementById("quran-khatma");
                if (quranSec) {
                    if (typeof goToMushafPage === "function") goToMushafPage(562, 67);
                    quranSec.scrollIntoView({ behavior: "smooth" });
                } else {
                    sessionStorage.setItem("target_mushaf_page", JSON.stringify({ page: 562, surah: 67 }));
                    window.location.href = "services.html#quran-khatma";
                }
            }
        };
    }

    if (reminderConfig) {
        const dismissKey = `reminder_dismissed_${reminderConfig.id}_${now.toISOString().slice(0, 10)}`;

        if (sessionStorage.getItem(dismissKey)) {
            banner.style.display = "none";
            return;
        }

        banner.style.display = "flex";
        const iconEl = banner.querySelector(".smart-reminder-icon i");
        if (iconEl) iconEl.className = `${reminderConfig.icon} text-gold`;
        const titleEl = banner.querySelector(".smart-reminder-title");
        if (titleEl) titleEl.textContent = reminderConfig.title;
        const descEl = banner.querySelector(".smart-reminder-desc");
        if (descEl) descEl.textContent = reminderConfig.desc;

        const actBtn = banner.querySelector(".btn-reminder-act");
        if (actBtn) {
            const actSpan = actBtn.querySelector("span");
            if (actSpan) actSpan.textContent = reminderConfig.actionText;
            actBtn.onclick = () => reminderConfig.actionCallback();
        }

        const dismissBtn = banner.querySelector(".btn-dismiss-reminder");
        if (dismissBtn) {
            dismissBtn.onclick = () => {
                banner.style.display = "none";
                sessionStorage.setItem(dismissKey, "1");
            };
        }
    }

    // جدولة التحديث الدوري كل دقيقة ليتغير المحتوى تلقائياً بالثانية
    if (!window._smartReminderTimerInitialized) {
        window._smartReminderTimerInitialized = true;
        setInterval(initSmartTimelyReminders, 60000);
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) initSmartTimelyReminders();
        });
    }
}

/* ==========================================================================
   21. مكتبة المرئيات والبودكاست الإسلامي (Islamic Media & Podcasts Hub)
   ========================================================================== */
function initIslamicMediaHub() {
    const grid = document.getElementById("islamic-media-grid");
    const filterTabs = document.querySelectorAll("#media-filter-tabs .media-filter-btn");
    const searchInput = document.getElementById("media-search-input");
    const searchClear = document.getElementById("media-search-clear");
    const emptyState = document.getElementById("media-empty-state");
    const resetFilterBtn = document.getElementById("btn-reset-media-filter");
    const loadMoreWrapper = document.getElementById("media-load-more-wrapper");
    const loadMoreBtn = document.getElementById("btn-load-more-media");
    const loadMoreRemainingBadge = document.getElementById("load-more-remaining-badge");
    const visibleCountEl = document.getElementById("media-visible-count");
    const totalCountEl = document.getElementById("media-total-count");

    const modal = document.getElementById("media-player-modal");
    const closeBtn = document.getElementById("btn-close-media-modal");
    const iframe = document.getElementById("media-player-iframe");
    const modalBadge = document.getElementById("media-player-badge");
    const modalDuration = document.getElementById("media-player-duration");
    const modalTitle = document.getElementById("media-player-title");
    const modalSpeaker = document.getElementById("media-player-speaker");
    const modalDesc = document.getElementById("media-player-desc");
    const btnShareWhatsapp = document.getElementById("btn-share-media-whatsapp");
    const btnCopyLink = document.getElementById("btn-copy-media-link");

    if (!grid || typeof ISLAMIC_MEDIA_DATA === "undefined") return;

    if (grid.dataset.initialized === "true") {
        if (typeof window.refreshIslamicMediaGrid === "function") {
            window.refreshIslamicMediaGrid();
        }
        return;
    }
    grid.dataset.initialized = "true";
    const PAGE_SIZE = 9;
    let visibleCount = PAGE_SIZE;
    let currentCategory = "all";
    let searchQuery = "";
    let currentActiveMedia = null;

    const categoryLabels = {
        podcast: { label: "بودكاست", icon: "fa-solid fa-podcast" },
        reminder: { label: "موعظة وترقيق", icon: "fa-solid fa-heart-pulse" },
        quran: { label: "تأملات وتدبر", icon: "fa-solid fa-book-quran" },
        seerah: { label: "سيرة وقصص", icon: "fa-solid fa-feather-pointed" },
        shorts: { label: "خاطرة قصيرة", icon: "fa-solid fa-bolt" }
    };

    // Update count badges on tabs
    function updateCategoryCounts() {
        const counts = { all: ISLAMIC_MEDIA_DATA.length };
        ISLAMIC_MEDIA_DATA.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });
        document.querySelectorAll("[id^='count-cat-']").forEach(el => {
            const cat = el.id.replace("count-cat-", "");
            el.textContent = counts[cat] || 0;
        });
    }

    function renderMedia() {
        const filtered = ISLAMIC_MEDIA_DATA.filter(item => {
            const matchesCat = currentCategory === "all" || item.category === currentCategory;
            const q = searchQuery.trim().toLowerCase();
            const matchesSearch = !q ||
                item.title.toLowerCase().includes(q) ||
                item.speaker.toLowerCase().includes(q) ||
                item.desc.toLowerCase().includes(q);
            return matchesCat && matchesSearch;
        });

        if (totalCountEl) totalCountEl.textContent = filtered.length;

        if (filtered.length === 0) {
            grid.innerHTML = "";
            grid.style.display = "none";
            if (emptyState) emptyState.style.display = "block";
            if (loadMoreWrapper) loadMoreWrapper.style.display = "none";
            if (visibleCountEl) visibleCountEl.textContent = "0";
            return;
        }

        if (emptyState) emptyState.style.display = "none";
        grid.style.display = "grid";

        const itemsToShow = filtered.slice(0, visibleCount);
        if (visibleCountEl) visibleCountEl.textContent = itemsToShow.length;

        grid.innerHTML = itemsToShow.map(item => {
            const catInfo = categoryLabels[item.category] || { label: "مرئي", icon: "fa-solid fa-video" };
            const thumbUrl = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;

            return `
                <article class="media-card" data-id="${item.id}">
                    <div class="media-thumbnail-container" data-action="play">
                        <img src="${thumbUrl}" alt="${item.title}" class="media-thumbnail-img" loading="lazy" onerror="this.src='assets/images/logo.png'">
                        <span class="media-duration-pill"><i class="fa-regular fa-clock"></i> ${item.duration}</span>
                        <span class="media-badge-tag">${item.badge || catInfo.label}</span>
                        <div class="media-play-overlay">
                            <button type="button" class="media-play-btn" aria-label="تشغيل ${item.title}">
                                <i class="fa-solid fa-play"></i>
                            </button>
                        </div>
                    </div>
                    <div class="media-card-content">
                        <div>
                            <div class="media-header-meta">
                                <span class="media-speaker-tag">
                                    <span class="speaker-avatar-icon"><i class="${catInfo.icon}"></i></span>
                                    <span>${item.speaker}</span>
                                    <i class="fa-solid fa-circle-check text-gold" style="font-size: 0.72rem;" title="موثوق"></i>
                                </span>
                                ${item.views ? `<span class="media-views-pill"><i class="fa-solid fa-fire text-gold"></i> ${item.views}</span>` : ''}
                            </div>
                            <h3 class="media-card-title" data-action="play">${item.title}</h3>
                        </div>
                        <p class="media-card-desc">${item.desc}</p>
                        <div class="media-card-footer">
                            <button type="button" class="btn-watch-media" data-action="play">
                                <i class="fa-solid fa-circle-play"></i> <span>مشاهدة الآن</span>
                            </button>
                            <button type="button" class="btn-share-media-card" data-action="share-card" title="مشاركة المقطع عبر واتساب كصدقة جارية">
                                <i class="fa-brands fa-whatsapp"></i> <span>مشاركة</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        // Handle Load More Button
        if (loadMoreWrapper) {
            if (visibleCount < filtered.length) {
                loadMoreWrapper.style.display = "block";
                const remaining = filtered.length - visibleCount;
                const nextBatch = Math.min(PAGE_SIZE, remaining);
                if (loadMoreRemainingBadge) {
                    loadMoreRemainingBadge.textContent = `+${nextBatch} مقاطع`;
                }
            } else {
                loadMoreWrapper.style.display = "none";
            }
        }

        // Attach event listeners to card elements
        grid.querySelectorAll(".media-card").forEach(card => {
            const id = card.dataset.id;
            const item = ISLAMIC_MEDIA_DATA.find(x => x.id === id);
            if (!item) return;

            card.querySelectorAll('[data-action="play"]').forEach(el => {
                el.addEventListener("click", () => openMediaPlayer(item));
            });

            const shareBtn = card.querySelector('[data-action="share-card"]');
            if (shareBtn) {
                shareBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    shareMediaItemWhatsApp(item);
                });
            }
        });
    }

    function openMediaPlayer(item) {
        currentActiveMedia = item;
        if (!modal) return;

        const catInfo = categoryLabels[item.category] || { label: "مرئي", icon: "fa-solid fa-video" };

        if (modalBadge) modalBadge.textContent = item.badge || catInfo.label;
        if (modalDuration) modalDuration.innerHTML = `<i class="fa-regular fa-clock"></i> ${item.duration}`;
        if (modalTitle) modalTitle.textContent = item.title;
        if (modalSpeaker) modalSpeaker.textContent = item.speaker;
        if (modalDesc) modalDesc.textContent = item.desc;

        if (iframe) {
            iframe.src = `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`;
        }

        modal.classList.add("open");
        modal.classList.add("active");
        document.body.style.overflow = "hidden";

        // Award +5 points to Spiritual Garden if available
        try {
            if (typeof window.addSpiritualGardenDeed === "function") {
                window.addSpiritualGardenDeed("quiz", 5);
            }
        } catch (e) {
            console.error(e);
        }
    }

    function closeMediaPlayer() {
        if (!modal) return;
        modal.classList.remove("open");
        modal.classList.remove("active");
        document.body.style.overflow = "";
        if (iframe) {
            iframe.src = "";
        }
        currentActiveMedia = null;
    }

    function shareMediaItemWhatsApp(item) {
        const videoUrl = `https://www.youtube.com/watch?v=${item.youtubeId}`;
        const siteUrl = (window.getPublicAppUrl ? window.getPublicAppUrl() : "https://zadmuslim-zeta.vercel.app/").replace(/\/+$/, "");

        const text = `🎥 *${item.title}*\n🎙️ *${item.speaker}*\n⏱️ المدة: ${item.duration}\n\n📖 ${item.desc}\n\n▶️ لمشاهدة المقطع على يوتيوب:\n${videoUrl}\n\n🌸 من مكتبة المرئيات والبودكاست في زاد المسلم (صدقة جارية)\n🕌 تصفح المزيد:\n${siteUrl}#islamic-media`;

        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    }

    // Modal Close Triggers
    if (closeBtn) {
        closeBtn.addEventListener("click", closeMediaPlayer);
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeMediaPlayer();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && modal.classList.contains("open")) {
            closeMediaPlayer();
        }
    });

    // Modal Action Buttons
    if (btnShareWhatsapp) {
        btnShareWhatsapp.addEventListener("click", () => {
            if (currentActiveMedia) shareMediaItemWhatsApp(currentActiveMedia);
        });
    }

    if (btnCopyLink) {
        btnCopyLink.addEventListener("click", () => {
            if (!currentActiveMedia) return;
            const videoUrl = `https://www.youtube.com/watch?v=${currentActiveMedia.youtubeId}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(videoUrl).then(() => {
                    showToast("تم نسخ رابط المقطع بنجاح 📋✨");
                }).catch(() => {
                    copyTextToClipboard(videoUrl);
                    showToast("تم نسخ رابط المقطع 📋✨");
                });
            } else {
                copyTextToClipboard(videoUrl);
                showToast("تم نسخ رابط المقطع 📋✨");
            }
        });
    }

    // Load More Button Event
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", () => {
            visibleCount += PAGE_SIZE;
            renderMedia();
        });
    }

    // Filter Tabs
    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            filterTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentCategory = tab.dataset.category || "all";
            visibleCount = PAGE_SIZE; // Reset pagination
            renderMedia();
        });
    });

    // Search Input
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchQuery = searchInput.value;
            if (searchClear) {
                searchClear.style.display = searchQuery.trim().length > 0 ? "block" : "none";
            }
            visibleCount = PAGE_SIZE; // Reset pagination on new search
            renderMedia();
        });
    }

    if (searchClear && searchInput) {
        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            searchQuery = "";
            searchClear.style.display = "none";
            searchInput.focus();
            visibleCount = PAGE_SIZE;
            renderMedia();
        });
    }

    if (resetFilterBtn) {
        resetFilterBtn.addEventListener("click", () => {
            currentCategory = "all";
            searchQuery = "";
            visibleCount = PAGE_SIZE;
            if (searchInput) searchInput.value = "";
            if (searchClear) searchClear.style.display = "none";
            filterTabs.forEach(t => {
                if (t.dataset.category === "all") t.classList.add("active");
                else t.classList.remove("active");
            });
            renderMedia();
        });
    }

    // Mobile horizontal scroll helper
    window.scrollMediaContainer = function(direction) {
        const container = document.getElementById("islamic-media-grid");
        if (!container) return;
        const card = container.querySelector(".media-card");
        const scrollAmount = card ? (card.offsetWidth + 20) : 320;
        const delta = direction === "left" ? -scrollAmount : scrollAmount;
        container.scrollBy({ left: delta, behavior: "smooth" });
    };

    // Initial run
    updateCategoryCounts();
    renderMedia();
    window.refreshIslamicMediaGrid = renderMedia;
}

/* ==========================================================================
   22. تتبع الإحصائيات الحية وسحابة Firebase (Site Telemetry)
   ========================================================================== */
function trackSiteTelemetry() {
    if (typeof firebase === "undefined" || typeof isFirebaseConfigured !== "function" || !isFirebaseConfigured()) return;

    try {
        const db = firebase.database();
        const now = new Date();
        const todayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const sessionVisitKey = `visited_${todayKey}`;

        // Track Pageview once per session
        if (!sessionStorage.getItem(sessionVisitKey)) {
            sessionStorage.setItem(sessionVisitKey, "1");
            db.ref("stats/totalVisits").transaction(curr => (curr || 0) + 1);
            db.ref(`stats/dailyVisits/${todayKey}`).transaction(curr => (curr || 0) + 1);

            // Device detection
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(navigator.userAgent);
            const deviceKey = isTablet ? "tablet" : (isMobile ? "mobile" : "desktop");
            db.ref(`stats/devices/${deviceKey}`).transaction(curr => (curr || 0) + 1);
        }

        // Track Unique Visitor
        if (!localStorage.getItem("sadqah_uid")) {
            const newUid = "uid_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
            localStorage.setItem("sadqah_uid", newUid);
            db.ref("stats/uniqueVisitors").transaction(curr => (curr || 0) + 1);
        }

        // Track App Installs (PWA Download)
        window.addEventListener("appinstalled", () => {
            db.ref("stats/totalDownloads").transaction(curr => (curr || 0) + 1);
        });
    } catch (e) {
        console.warn("Telemetry tracking error:", e);
    }
}

/* ==========================================================================
   23. لوحة الإحصائيات والإدارة الخاصة (Admin & Analytics Dashboard)
   ========================================================================== */
function initAdminDashboard() {
    const loginModal = document.getElementById("admin-login-modal");
    const dashboardModal = document.getElementById("admin-dashboard-modal");
    const pinForm = document.getElementById("admin-pin-form");
    const pinInput = document.getElementById("admin-pin-input");
    const pinError = document.getElementById("admin-pin-error");
    const btnCloseLogin = document.getElementById("btn-close-admin-login");
    const btnCancelLogin = document.getElementById("btn-cancel-admin-login");
    const btnCloseDashboard = document.getElementById("btn-close-admin-dashboard");
    const btnLogout = document.getElementById("btn-admin-logout");
    const btnRefresh = document.getElementById("btn-refresh-admin-stats");
    const btnChangePin = document.getElementById("btn-change-admin-pin");
    const btnExport = document.getElementById("btn-export-admin-stats");
    const footerTrigger = document.getElementById("footer-admin-trigger");

    let clickCount = 0;
    let clickTimeout = null;
    let currentFetchedStats = {};

    function getAdminPin() {
        return localStorage.getItem("zad_admin_pin") || localStorage.getItem("sadqah_admin_pin") || "zad2026";
    }

    function openLoginModal() {
        if (!loginModal) return;
        if (pinInput) { pinInput.value = ""; }
        if (pinError) { pinError.style.display = "none"; }
        loginModal.classList.add("open");
        loginModal.classList.add("active");
        document.body.style.overflow = "hidden";
        setTimeout(() => { if (pinInput) pinInput.focus(); }, 150);
    }

    function closeLoginModal() {
        if (!loginModal) return;
        loginModal.classList.remove("open");
        loginModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    function openDashboard() {
        closeLoginModal();
        if (!dashboardModal) return;
        dashboardModal.classList.add("open");
        dashboardModal.classList.add("active");
        document.body.style.overflow = "hidden";
        loadLiveStatistics();
    }

    function closeDashboard() {
        if (!dashboardModal) return;
        dashboardModal.classList.remove("open");
        dashboardModal.classList.remove("active");
        document.body.style.overflow = "";
        if (window.location.hash === "#admin") {
            history.replaceState(null, "", window.location.pathname + window.location.search);
        }
    }

    // Check PIN submission
    if (pinForm) {
        pinForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const inputVal = (pinInput ? pinInput.value.trim() : "");
            const correctPin = getAdminPin();

            if (inputVal === correctPin) {
                openDashboard();
            } else {
                if (pinError) {
                    pinError.textContent = "رمز المرور غير صحيح! حاول مرة أخرى.";
                    pinError.style.display = "block";
                }
                if (pinInput) {
                    pinInput.select();
                    pinInput.focus();
                }
            }
        });
    }

    // Triggers to open Admin login:
    // 1. Footer click (5 consecutive clicks on author name)
    if (footerTrigger) {
        footerTrigger.addEventListener("click", () => {
            clickCount++;
            clearTimeout(clickTimeout);
            if (clickCount >= 5) {
                clickCount = 0;
                openLoginModal();
            } else {
                clickTimeout = setTimeout(() => { clickCount = 0; }, 2000);
            }
        });
    }

    // 2. Keyboard shortcut: Ctrl + Shift + A or Cmd + Shift + A
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a" || e.key === "ش")) {
            e.preventDefault();
            openLoginModal();
        }
        if (e.key === "Escape") {
            if (loginModal && loginModal.classList.contains("open")) closeLoginModal();
            if (dashboardModal && dashboardModal.classList.contains("open")) closeDashboard();
        }
    });

    // 3. URL Hash or query param check
    if (window.location.hash === "#admin" || new URLSearchParams(window.location.search).get("admin") === "1") {
        setTimeout(openLoginModal, 600);
    }

    // Close buttons
    if (btnCloseLogin) btnCloseLogin.addEventListener("click", closeLoginModal);
    if (btnCancelLogin) btnCancelLogin.addEventListener("click", closeLoginModal);
    if (btnCloseDashboard) btnCloseDashboard.addEventListener("click", closeDashboard);
    if (btnLogout) btnLogout.addEventListener("click", closeDashboard);

    if (loginModal) {
        loginModal.addEventListener("click", (e) => {
            if (e.target === loginModal) closeLoginModal();
        });
    }
    if (dashboardModal) {
        dashboardModal.addEventListener("click", (e) => {
            if (e.target === dashboardModal) closeDashboard();
        });
    }

    // Fetch and display live statistics
    function loadLiveStatistics() {
        const todayKey = new Date().toISOString().slice(0, 10);
        
        if (typeof firebase === "undefined" || typeof isFirebaseConfigured !== "function" || !isFirebaseConfigured()) {
            showLocalFallbackStats();
            return;
        }

        const db = firebase.database();
        db.ref("stats").once("value").then(snap => {
            const stats = snap.val() || {};
            currentFetchedStats = stats;

            const totalVisits = stats.totalVisits || 0;
            const uniqueVisitors = stats.uniqueVisitors || 0;
            const totalDownloads = stats.totalDownloads || 0;
            const todayVisits = (stats.dailyVisits && stats.dailyVisits[todayKey]) || 0;
            const totalTasbeeh = stats.globalTasbeehCount || 0;

            const visitsEl = document.getElementById("stat-total-visits");
            const todayEl = document.getElementById("stat-today-visits");
            const uniqueEl = document.getElementById("stat-unique-visitors");
            const downloadsEl = document.getElementById("stat-total-downloads");
            const tasbeehEl = document.getElementById("stat-total-tasbeeh");

            if (visitsEl) visitsEl.textContent = totalVisits.toLocaleString("ar-EG");
            if (todayEl) todayEl.textContent = `اليوم: ${todayVisits.toLocaleString("ar-EG")} زيارة`;
            if (uniqueEl) uniqueEl.textContent = uniqueVisitors.toLocaleString("ar-EG");
            if (downloadsEl) downloadsEl.textContent = totalDownloads.toLocaleString("ar-EG");
            if (tasbeehEl) tasbeehEl.textContent = totalTasbeeh.toLocaleString("ar-EG");

            // Devices breakdown
            const devices = stats.devices || {};
            const mobileCount = (devices.mobile || 0) + (devices.tablet || 0);
            const desktopCount = devices.desktop || 0;
            const totalDevices = mobileCount + desktopCount || 1;

            const mobilePct = Math.round((mobileCount / totalDevices) * 100);
            const desktopPct = Math.round((desktopCount / totalDevices) * 100);

            const mobilePctEl = document.getElementById("stat-device-mobile-pct");
            const desktopPctEl = document.getElementById("stat-device-desktop-pct");
            const fillMobile = document.getElementById("fill-device-mobile");
            const fillDesktop = document.getElementById("fill-device-desktop");

            if (mobilePctEl) mobilePctEl.textContent = `${mobilePct}%`;
            if (desktopPctEl) desktopPctEl.textContent = `${desktopPct}%`;
            if (fillMobile) fillMobile.style.width = `${mobilePct}%`;
            if (fillDesktop) fillDesktop.style.width = `${desktopPct}%`;

            // Daily list (last 7 days)
            const dailyListEl = document.getElementById("admin-daily-list");
            if (dailyListEl && stats.dailyVisits) {
                const days = Object.keys(stats.dailyVisits).sort().reverse().slice(0, 7);
                if (days.length === 0) {
                    dailyListEl.innerHTML = '<div style="font-size:0.82rem; color:var(--text-muted); text-align:center;">لا توجد سجلات سابقة بعد</div>';
                } else {
                    dailyListEl.innerHTML = days.map(d => {
                        return `
                            <div class="admin-daily-item">
                                <span><i class="fa-regular fa-calendar text-muted"></i> ${d}</span>
                                <strong>${stats.dailyVisits[d].toLocaleString("ar-EG")} زيارة</strong>
                            </div>
                        `;
                    }).join("");
                }
            }
        }).catch(err => {
            console.error("Error loading stats:", err);
            showLocalFallbackStats();
        });

        // Load Prayers Count
        db.ref("prayers").once("value").then(snap => {
            const prayers = snap.val() || {};
            const count = Object.keys(prayers).length;
            const prayersEl = document.getElementById("stat-total-prayers");
            if (prayersEl) prayersEl.textContent = count.toLocaleString("ar-EG");
            currentFetchedStats.totalPrayers = count;
        });

        // Load Khatma Count
        db.ref("khatma").once("value").then(snap => {
            const khatma = snap.val() || {};
            let reservedCount = 0;
            Object.keys(khatma).forEach(k => {
                if (khatma[k] && khatma[k].reserved) reservedCount++;
            });
            const khatmaEl = document.getElementById("stat-total-khatmas");
            if (khatmaEl) khatmaEl.textContent = `${reservedCount} / 30 جزء`;
            currentFetchedStats.totalKhatmasReserved = reservedCount;
        });
    }

    function showLocalFallbackStats() {
        const visitsEl = document.getElementById("stat-total-visits");
        const uniqueEl = document.getElementById("stat-unique-visitors");
        const downloadsEl = document.getElementById("stat-total-downloads");
        if (visitsEl) visitsEl.textContent = "1";
        if (uniqueEl) uniqueEl.textContent = "1";
        if (downloadsEl) downloadsEl.textContent = "0";
    }

    if (btnRefresh) {
        btnRefresh.addEventListener("click", () => {
            loadLiveStatistics();
            showToast("تم تحديث الإحصائيات الحية 🔄✨");
        });
    }

    // Change PIN handler
    if (btnChangePin) {
        btnChangePin.addEventListener("click", () => {
            const currentPin = getAdminPin();
            const enteredOld = prompt("أدخل رمز المرور الحالي:");
            if (!enteredOld) return;

            if (enteredOld.trim() !== currentPin) {
                alert("رمز المرور الحالي غير صحيح!");
                return;
            }

            const newPin = prompt("أدخل رمز المرور الجديد (أرقام أو حروف):");
            if (newPin && newPin.trim().length >= 4) {
                localStorage.setItem("sadqah_admin_pin", newPin.trim());
                showToast("تم تغيير رمز المرور بنجاح 🔑✅");
            } else if (newPin) {
                alert("يجب أن يتكون رمز المرور من 4 خانات على الأقل.");
            }
        });
    }

    // Export report
    if (btnExport) {
        btnExport.addEventListener("click", () => {
            const nowStr = new Date().toLocaleString("ar-EG");
            const report = {
                title: "تقرير إحصائيات موقع زاد المسلم - صدقة جارية",
                timestamp: nowStr,
                stats: currentFetchedStats
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
            const downloadAnchor = document.createElement("a");
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `zad-almuslim-stats-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast("تم تصدير ملف الإحصائيات بنجاح 📥📊");
        });
    }
}

/* ==========================================================================
   نظام تبديل المظهر النهاري / الليلي (White Mode / Light Theme Toggle)
   ========================================================================== */
function initThemeToggle() {
    if (window.zadTheme && typeof window.zadTheme.init === "function") {
        window.zadTheme.init();
    }
}

/* ==========================================================================
   21. لوحة المتابعة الإيمانية اليومية وشريط التنقل المتجاوب (Modern Faith Dashboard)
   ========================================================================== */
function initModernZadDashboard() {
    try {
        // --- 1. تحديث تاريخ اليوم المعروض في لوحة يومي مع الله ---
        const dateBadge = document.getElementById("daily-current-date-badge");
        if (dateBadge) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            try {
                dateBadge.textContent = today.toLocaleDateString('ar-EG', options);
            } catch(e) {
                dateBadge.textContent = "اليوم المبارك 🌿";
            }
        }

        // --- 2. إدارة ومتابعة قائمة المهام اليومية (Daily Faith Checklist) ---
        const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const storageKey = `zad_daily_tasks_${todayKey}`;
        let savedTasks = {};
        try {
            savedTasks = JSON.parse(localStorage.getItem(storageKey) || "{}");
        } catch(e) {
            savedTasks = {};
        }

        const taskButtons = document.querySelectorAll(".modern-task-btn");
        const pctEl = document.getElementById("zad-daily-pct");
        const fillEl = document.getElementById("zad-daily-fill");

        function updateTasksProgressUI() {
            if (!taskButtons || taskButtons.length === 0) return;
            let completed = 0;
            taskButtons.forEach(btn => {
                const taskName = btn.getAttribute("data-task");
                const isDone = !!savedTasks[taskName];
                const checkIcon = btn.querySelector(".modern-task-check");
                if (isDone) {
                    btn.classList.add("completed");
                    if (checkIcon) checkIcon.textContent = "✓";
                } else {
                    btn.classList.remove("completed");
                    if (checkIcon) checkIcon.textContent = "○";
                }
                if (isDone) completed++;
            });

            const total = taskButtons.length;
            const percent = Math.round((completed / total) * 100);
            if (pctEl) pctEl.textContent = `${percent}%`;
            if (fillEl) fillEl.style.width = `${percent}%`;
        }

        taskButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const taskName = btn.getAttribute("data-task");
                if (!taskName) return;
                savedTasks[taskName] = !savedTasks[taskName];
                try {
                    localStorage.setItem(storageKey, JSON.stringify(savedTasks));
                } catch(e) {}
                updateTasksProgressUI();

                if (savedTasks[taskName] && typeof showToast === "function") {
                    showToast("تقبل الله طاعتكم وجعلها في ميزان حسناتكم 🤍");
                }
            });
        });

        updateTasksProgressUI();

        // --- 3. مزامنة موعد الصلاة القادمة في شريط يومي مع الله ---
        function updateModernPrayerStrip() {
            const prayerNameEl = document.getElementById("daily-next-prayer-name");
            const prayerTimeEl = document.getElementById("daily-next-prayer-time");
            if (!prayerNameEl || !prayerTimeEl) return;

            const existingName = document.getElementById("next-prayer-name");
            const existingTimer = document.getElementById("next-prayer-timer");

            if (existingName && existingName.textContent && existingName.textContent !== "...") {
                const pName = existingName.textContent;
                const pTime = existingTimer ? existingTimer.textContent : "";
                prayerNameEl.textContent = pName;
                prayerTimeEl.textContent = pTime ? `متبقي على دخول الوقت: ${pTime}` : "صلاتك في وقتها نور وطمأنينة";
            } else if (typeof prayerTimings !== "undefined" && prayerTimings) {
                const now = new Date();
                const prayersList = [
                    { name: "صلاة الفجر", key: "fajr", time: prayerTimings.Fajr },
                    { name: "الشروق", key: "sunrise", time: prayerTimings.Sunrise },
                    { name: "صلاة الظهر", key: "dhuhr", time: prayerTimings.Dhuhr },
                    { name: "صلاة العصر", key: "asr", time: prayerTimings.Asr },
                    { name: "صلاة المغرب", key: "maghrib", time: prayerTimings.Maghrib },
                    { name: "صلاة العشاء", key: "isha", time: prayerTimings.Isha }
                ];

                let nextP = null;
                for (const p of prayersList) {
                    if (!p.time) continue;
                    const [h, m] = p.time.split(" ")[0].split(":").map(Number);
                    const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
                    if (pDate > now) {
                        nextP = p;
                        break;
                    }
                }
                if (!nextP) nextP = prayersList[0];

                prayerNameEl.textContent = nextP.name;
                prayerTimeEl.textContent = `موعد الأذان: ${nextP.time}`;
            }
        }

        updateModernPrayerStrip();
        setInterval(updateModernPrayerStrip, 2000);

        // --- 4. عداد التسبيح السريع في بطاقة يومي مع الله ---
        const quickCounterEl = document.getElementById("quick-tasbeeh-counter");
        const btnQuickAdd = document.getElementById("btn-quick-tasbeeh-add");
        const btnQuickReset = document.getElementById("btn-quick-tasbeeh-reset");

        let quickCount = parseInt(localStorage.getItem("zad_quick_tasbeeh_count") || "0", 10);
        if (isNaN(quickCount)) quickCount = 0;
        if (quickCounterEl) quickCounterEl.textContent = quickCount;

        if (btnQuickAdd && quickCounterEl) {
            btnQuickAdd.addEventListener("click", () => {
                quickCount++;
                quickCounterEl.textContent = quickCount;
                try {
                    localStorage.setItem("zad_quick_tasbeeh_count", quickCount);
                } catch(e) {}

                // اهتزاز خفيف للأجهزة الداعمة (Haptic Feedback)
                if ("vibrate" in navigator) {
                    navigator.vibrate(15);
                }
            });
        }

        if (btnQuickReset && quickCounterEl) {
            btnQuickReset.addEventListener("click", () => {
                if (quickCount === 0) return;
                quickCount = 0;
                quickCounterEl.textContent = 0;
                try {
                    localStorage.setItem("zad_quick_tasbeeh_count", "0");
                } catch(e) {}
                if (typeof showToast === "function") {
                    showToast("تمت إعادة ضبط عداد التسبيح السريع ↺");
                }
            });
        }

        // --- 5. نافذة وتحدي الـ 7 أيام الإيماني ---
        init7DaysChallengeModal();

        // --- 6. تمييز التبويب النشط في شريط الجوال السفلي عند التمرير ---
        initModernMobileBarActiveState();

    } catch(err) {
        console.warn("Modern dashboard init error:", err);
    }
}

function init7DaysChallengeModal() {
    const modal = document.getElementById("challenge-modal");
    const openBtn = document.getElementById("btn-open-7days-challenge");
    const closeBtn = document.getElementById("btn-close-challenge-modal");
    const resetBtn = document.getElementById("btn-reset-challenge");
    const listEl = document.getElementById("challenge-days-list");

    if (!modal) return;

    const challengeGoals = [
        { day: 1, title: "اليوم الأول: صفاء النية والاستغفار", task: "استغفر الله 100 مرة واقرأ صفحة من القرآن الكريم." },
        { day: 2, title: "اليوم الثاني: بر الوالدين وصلة الرحم", task: "اتصل بأحد والديك أو قريب لك وادعُ لهما بالخير." },
        { day: 3, title: "اليوم الثالث: ركعتي الضحى وصلاة على النبي", task: "صلّ ركعتي صلاة الضحى وصلّ على النبي ﷺ 50 مرة." },
        { day: 4, title: "اليوم الرابع: الصدقة وإدخال السرور", task: "تصدق ولو بالقليل أو تبسم وأدخل السرور على مسلم." },
        { day: 5, title: "اليوم الخامس: سورة الكهف أو تلاوة متأنية", task: "اقرأ ما تيسر من كتاب الله بتدبر وخشوع." },
        { day: 6, title: "اليوم السادس: أذكار الصباح والمساء كاملة", task: "حافظ على أذكار الصباح والمساء في وقتها بحضور قلب." },
        { day: 7, title: "اليوم السابع: ركعة الوتر ودعاء خاشع", task: "اختم أسبوعك بركعة الوتر وسؤال الله الثبات والقبول." }
    ];

    let savedProgress = {};
    try {
        savedProgress = JSON.parse(localStorage.getItem("zad_7days_challenge_progress") || "{}");
    } catch(e) {
        savedProgress = {};
    }

    function renderDays() {
        if (!listEl) return;
        listEl.innerHTML = "";

        challengeGoals.forEach(g => {
            const isCompleted = !!savedProgress[g.day];
            const item = document.createElement("div");
            item.className = "modern-challenge-item";
            item.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.85rem;
                padding: 0.75rem 0.9rem;
                border-radius: 12px;
                background: ${isCompleted ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)'};
                border: 1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)'};
                cursor: pointer;
                transition: all 0.2s ease;
            `;

            item.innerHTML = `
                <div style="
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: ${isCompleted ? '#10b981' : 'rgba(255,255,255,0.08)'};
                    color: ${isCompleted ? '#fff' : 'var(--text-muted)'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                    font-weight: bold;
                    flex-shrink: 0;
                ">
                    ${isCompleted ? '✓' : g.day}
                </div>
                <div style="flex: 1; text-align: right;">
                    <div style="font-size: 0.92rem; font-weight: 700; color: ${isCompleted ? '#10b981' : 'var(--text-primary)'};">
                        ${g.title}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                        ${g.task}
                    </div>
                </div>
            `;

            item.addEventListener("click", () => {
                savedProgress[g.day] = !savedProgress[g.day];
                try {
                    localStorage.setItem("zad_7days_challenge_progress", JSON.stringify(savedProgress));
                } catch(e) {}
                renderDays();
                if (savedProgress[g.day] && typeof showToast === "function") {
                    showToast(`ما شاء الله! أنجزت خطوة ${g.title} 🎉`);
                }
            });

            listEl.appendChild(item);
        });
    }

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            renderDays();
            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
            document.body.style.overflow = "";
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            savedProgress = {};
            try {
                localStorage.removeItem("zad_7days_challenge_progress");
            } catch(e) {}
            renderDays();
            if (typeof showToast === "function") {
                showToast("تمت إعادة ضبط التحدي من جديد 🌿");
            }
        });
    }
}

function initModernMobileBarActiveState() {
    const tabs = document.querySelectorAll(".modern-mobile-tab");
    if (!tabs || tabs.length === 0) return;

    const navTargets = [
        { id: "hero", target: "hero" },
        { id: "daily-faith-journey", target: "hero" },
        { id: "quran-khatma", target: "quran-khatma" },
        { id: "prayer-times", target: "prayer-times" },
        { id: "azkar", target: "azkar" },
        { id: "platform-services", target: "platform-services" }
    ];

    function updateActive() {
        const scrollY = window.scrollY || window.pageYOffset;
        let currentTarget = "hero";

        for (let i = navTargets.length - 1; i >= 0; i--) {
            const el = document.getElementById(navTargets[i].id);
            if (el && scrollY >= (el.offsetTop - 220)) {
                currentTarget = navTargets[i].target;
                break;
            }
        }

        tabs.forEach(tab => {
            const target = tab.getAttribute("data-target");
            if (target === currentTarget) {
                tab.classList.add("active");
            } else {
                tab.classList.remove("active");
            }
        });
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            if ("vibrate" in navigator) {
                navigator.vibrate(12);
            }
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
        });
    });
}
