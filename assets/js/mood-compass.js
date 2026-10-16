/**
 * ==============================================================================
 * زاد المسلم — بوصلة القلوب والسكينة الإيمانية (Spiritual First-Aid Compass)
 * دواء القلب بالقرآن والدعاء والذكر وفق الحالة النفسية والشعورية للمسلم
 * ==============================================================================
 */

(function(window, document) {
    "use strict";

    const MOODS_DATA = [
        {
            id: "sadness",
            emoji: "😔",
            title: "حزين أو مهموم",
            shortTag: "انشراح الصدر والفرج",
            sub: "«وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ»",
            ayahText: "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا",
            surah: "سورة التوبة • الآية 40",
            audioUrl: "https://everyayah.com/data/Alafasy_128kbps/009040.mp3",
            duaText: "اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجِلَاءَ حُزْنِي، وَذَهَابَ هَمِّي.",
            duaExplanation: "دعاء نبوي عظيم، ما قاله مكروب إلا أذهب الله همه وحزنه وأبدله مكانه فرحاً وسلواناً.",
            dhikrText: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
            dhikrVirtue: "كنز من كنوز الجنة وباب عظيم لتفريج الكروب وانشراح الصدور.",
            dhikrTarget: 10,
            reflection: "تذكر أن أشد ساعات الليل ظلمة هي التي تسبق الفجر، وما ضاقت إلا لتفرج بلطف الله الخفي."
        },
        {
            id: "anxiety",
            emoji: "😟",
            title: "قلق أو متوتر",
            shortTag: "السكينة وراحة البال",
            sub: "«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»",
            ayahText: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
            surah: "سورة الشرح • الآية 5-6",
            audioUrl: "https://everyayah.com/data/Alafasy_128kbps/094005.mp3",
            duaText: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ.",
            duaExplanation: "الافتقار إلى الله وتفويض المقادير إليه ينزع الخوف من المستقبل ويبعث الطمأنينة التامة.",
            dhikrText: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
            dhikrVirtue: "قالها إبراهيم حين أُلقي في النار فكانت برداً وسلاماً، وقالها النبي ﷺ وصحابته فكفاهم الله ما أهمهم.",
            dhikrTarget: 7,
            reflection: "كل ما يقلقك غداً هو بيد من يدبّر أمر السماوات والأرض، سلّم أمرك لله وخذ نفساً عميقاً."
        },
        {
            id: "sustenance",
            emoji: "🤲",
            title: "ضيق في الرزق",
            shortTag: "مفاتيح الفرج والبركة",
            sub: "«إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ»",
            ayahText: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
            surah: "سورة الطلاق • الآية 2-3",
            audioUrl: "https://everyayah.com/data/Alafasy_128kbps/065002.mp3",
            duaText: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ.",
            duaExplanation: "دعاء أوصى به النبي ﷺ لقضاء أثقل الديون وفتح أبواب العفاف والغنى من واسع فضل الله.",
            dhikrText: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
            dhikrVirtue: "«فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا • يُرْسِلِ السَّمَاءَ عَلَيْكُم مِّدْرَارًا • وَيُمْدِدْكُم بِأَمْوَالٍ وَبَنِينَ».",
            dhikrTarget: 33,
            reflection: "الرزق ليس مالاً فحسب؛ الصحة، راحة البال، وتيسير الخطوات كلها أرزاق يسوقها الله إليك في وقتها."
        },
        {
            id: "anger",
            emoji: "😡",
            title: "غاضب أو منفعل",
            shortTag: "إطفاء جمرة الغضب",
            sub: "«وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ»",
            ayahText: "وَإِمَّا يَنزَغَنَّكَ مِنَ الشَّيْطَانِ نَزْغٌ فَاسْتَعِذْ بِاللَّهِ ۚ إِنَّهُ سَمِيعٌ عَلِيمٌ",
            surah: "سورة الأعراف • الآية 200",
            audioUrl: "https://everyayah.com/data/Alafasy_128kbps/007200.mp3",
            duaText: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ • اللَّهُمَّ اغْفِرْ لِي ذَنْبِي وَأَذْهِبْ غَيْظَ قَلْبِي وَأَجِرْنِي مِنَ الشَّيْطَانِ.",
            duaExplanation: "الغضب نزغ من الشيطان يزول بالاستعاذة، والوضوء، والجلوس إن كنت قائماً.",
            dhikrText: "أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
            dhikrVirtue: "الاحتماء بحصن الله الحصين من كيد الشيطان ووسوسته عند الغضب والانفعال.",
            dhikrTarget: 10,
            reflection: "ليس الشديد بالصُّرَعَة، إنما الشديد الذي يملك نفسه عند الغضب. عفوك اليوم هو أجر لك عند رب العالمين."
        },
        {
            id: "hopelessness",
            emoji: "💔",
            title: "محبط أو ضعيف الهمة",
            shortTag: "إحياء الرجاء وباب التوبة",
            sub: "«لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ»",
            ayahText: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
            surah: "سورة الزمر • الآية 53",
            audioUrl: "https://everyayah.com/data/Alafasy_128kbps/039053.mp3",
            duaText: "يَا حَيُّ يَا قَيُّومُ، لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ، اللَّهُمَّ جَدِّدِ الإِيمَانَ فِي قَلْبِي وَقَوِّ عَزِيمَتِي.",
            duaExplanation: "دعوة يونس عليه السلام في ظلمات الحوت، ما دعا بها مؤمن في كربة إلا فرّج الله عنه وأحيا قلبه.",
            dhikrText: "لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
            dhikrVirtue: "مفتاح النجاة والفرج الأعظم عند انقطاع الحيل وتراكم الخطايا والهموم.",
            dhikrTarget: 10,
            reflection: "الله يحبك ويريد منك الإقبال عليه، مهما تعثرت بالأمس قم اليوم وتوضأ، فإن الله لا يمل حتى تملوا."
        },
        {
            id: "gratitude",
            emoji: "🤍",
            title: "ممتن وفرحان بنعمة",
            shortTag: "شكر المنعم واستزادة النعم",
            sub: "«وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا»",
            ayahText: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
            surah: "سورة إبراهيم • الآية 7",
            audioUrl: "https://everyayah.com/data/Alafasy_128kbps/014007.mp3",
            duaText: "اللَّهُمَّ مَا أَصْبَحَ (أَوْ أَمْسَى) بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.",
            duaExplanation: "من قال هذا الدعاء صباحاً ومساءً فقد أدى شكر يومه وليلته وحفظ نعمته من الزوال.",
            dhikrText: "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ",
            dhikrVirtue: "ابتدرها بضعة وثلاثون مَلَكاً أيهم يكتبها أولاً لعظيم قدرها عند الله تعالى.",
            dhikrTarget: 33,
            reflection: "قيد النعم بالشكر، والحمد يبارك في القليل ويزيد الكثير، ويسكب البركة في سائر أوقاتك."
        },
        {
            id: "fear",
            emoji: "😨",
            title: "خائف أو غير آمن",
            shortTag: "الأمان في معية الله",
            sub: "«فَاللَّهُ خَيْرٌ حَافِظًا ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ»",
            ayahText: "الَّذِينَ قَالَ لَهُمُ النَّاسُ إِنَّ النَّاسَ قَدْ جَمَعُوا لَكُمْ فَاخْشَوْهُمْ فَزَادَهُمْ إِيمَانًا وَقَالُوا حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
            surah: "سورة آل عمران • الآية 173",
            audioUrl: "https://everyayah.com/data/Alafasy_128kbps/003173.mp3",
            duaText: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
            duaExplanation: "درع واقٍ وحصانة ربانية، من قالها ثلاثاً لم يضره شيء أبداً حتى يمسي أو يصبح.",
            dhikrText: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
            dhikrVirtue: "من قالها سبع مرات كفاه الله ما أهمه من أمر دنياه وآخرته.",
            dhikrTarget: 7,
            reflection: "أنت في حفظ الحفيظ الذي لا تأخذه سنة ولا نوم، فمن ذا الذي يقدر على أذاك وهو في قبضته سبحانه؟"
        },
        {
            id: "insomnia",
            emoji: "😴",
            title: "أرق وصعوبة نوم",
            shortTag: "الهدوء ونوم السكينة",
            sub: "«وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا»",
            ayahText: "وَهُوَ الَّذِي جَعَلَ لَكُمُ اللَّيْلَ لِبَاسًا وَالنَّوْمَ سُبَاتًا وَجَعَلَ النَّهَارَ نُشُورًا",
            surah: "سورة الفرقان • الآية 47",
            audioUrl: "https://everyayah.com/data/Alafasy_128kbps/025047.mp3",
            duaText: "اللَّهُمَّ غَارَتِ النُّجُومُ، وَهَدَأَتِ الْعُيُونُ، وَأَنْتَ حَيٌّ قَيُّومٌ لَا تَأْخُذُكَ سِنَةٌ وَلَا نَوْمٌ، يَا حَيُّ يَا قَيُّومُ أَهْدِئْ لَيْلِي وَأَنِمْ عَيْنِي.",
            duaExplanation: "دعاء علمه النبي ﷺ لخالد بن الوليد رضي الله عنه لما شكا الأرق، فنال نوماً هانئاً قرير العين.",
            dhikrText: "سُبْحَانَ اللَّهِ • الْحَمْدُ لِلَّهِ • اللَّهُ أَكْبَرُ",
            dhikrVirtue: "تسبيحات النوم علّمها النبي ﷺ لابنته فاطمة رضي الله عنها، وهي خير للمؤمن من خادم وتمنح القلب هدوءاً عميقاً.",
            dhikrTarget: 33,
            reflection: "ضع يدك على صدرك، واقرأ آية الكرسي والمعوذات، وانفض كل تفكير في الدنيا، فأنت بين يدي الرحمن."
        }
    ];

    let currentAudio = null;
    let currentPlayingMoodId = null;
    const moodCounters = {};

    const MoodCompass = {
        moods: MOODS_DATA,

        init() {
            this.renderSlot();
            this.bindEvents();
        },

        renderSlot() {
            const slot = document.getElementById("mood-compass-slot");
            if (!slot) return;

            const pillsHtml = MOODS_DATA.map(m => `
                <button type="button" class="mood-pill-btn" onclick="MoodCompass.openMoodModal('${m.id}')" title="${m.title}">
                    <span class="mood-pill-emoji">${m.emoji}</span>
                    <span class="mood-pill-txt">${m.title}</span>
                </button>
            `).join("");

            slot.innerHTML = `
                <div class="mood-compass-card">
                    <div class="mood-compass-header">
                        <div class="mood-compass-title-wrap">
                            <span class="mood-icon-tag"><i class="fa-solid fa-heart-pulse text-gold"></i></span>
                            <div>
                                <h3 class="mood-compass-title">بوصلة القلوب والسكينة 🌿</h3>
                                <p class="mood-compass-subtitle">كيف تجد في قلبك الآن؟ اختر شعورك وسيدلك زاد المسلم على ما يطمئنك:</p>
                            </div>
                        </div>
                    </div>
                    <div class="mood-pills-grid">
                        ${pillsHtml}
                    </div>
                </div>
            `;
        },

        bindEvents() {
            // الاستماع لأي زر يحمل السمة data-open-mood
            document.addEventListener("click", (e) => {
                const btn = e.target.closest("[data-open-mood]");
                if (btn) {
                    const moodId = btn.getAttribute("data-open-mood");
                    this.openMoodModal(moodId);
                }
            });
        },

        getMood(id) {
            return MOODS_DATA.find(m => m.id === id) || MOODS_DATA[0];
        },

        openMoodModal(moodId) {
            const mood = this.getMood(moodId);
            if (!moodCounters[moodId]) moodCounters[moodId] = 0;

            let existing = document.getElementById("mood-compass-modal");
            if (existing) {
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio = null;
                }
                existing.remove();
            }

            // منح وسام طمأنينة القلب إن وُجد
            if (window.SmartKhatmaService && typeof window.SmartKhatmaService.awardBadge === "function") {
                window.SmartKhatmaService.awardBadge("badge_mood_peace");
            }

            const modalHtml = `
                <div class="modal-overlay active" id="mood-compass-modal" onclick="if(event.target===this)MoodCompass.closeModal();" style="z-index: 100000;">
                    <div class="modal-card modal-box mood-compass-modal-box">
                        <div class="modal-head">
                            <div class="modal-head-title">
                                <span style="font-size: 1.4rem;">${mood.emoji}</span>
                                <span>طمأنينة قلبك: ${mood.title}</span>
                            </div>
                            <button type="button" class="btn-close-modal" aria-label="إغلاق" onclick="MoodCompass.closeModal();">&times;</button>
                        </div>

                        <div class="modal-body-content mood-modal-body">
                            <!-- آية الطمأنينة -->
                            <div class="mood-section-box mood-ayah-box">
                                <div class="box-tag">
                                    <span>📖 آية الطمأنينة</span>
                                    <span class="box-meta">${mood.surah}</span>
                                </div>
                                <div class="mood-ayah-quote">
                                    « ${mood.ayahText} »
                                </div>
                                <div class="mood-ayah-actions">
                                    <button type="button" class="btn btn-audio-play" id="btn-play-mood-ayah" onclick="MoodCompass.toggleAudio('${mood.audioUrl}', this)">
                                        <i class="fa-solid fa-play"></i> <span>استمع للتلاوة الخاشعة 🎧</span>
                                    </button>
                                    <button type="button" class="btn-share-as-card" onclick="MoodCompass.shareMoodCard('${mood.id}')" title="مشاركة كستوري في واتساب وإنستغرام">
                                        <i class="fa-solid fa-camera-retro"></i> شارك كستوري 📷
                                    </button>
                                </div>
                            </div>

                            <!-- الدعاء النبوي المأثور -->
                            <div class="mood-section-box mood-dua-box">
                                <div class="box-tag">
                                    <span>🤲 دعاء النبي ﷺ لقلبك</span>
                                    <span class="box-meta">من السنة الصحيحة</span>
                                </div>
                                <div class="mood-dua-text">
                                    ${mood.duaText}
                                </div>
                                <div class="mood-dua-note">
                                    <i class="fa-solid fa-feather-pointed text-gold"></i>
                                    <span>${mood.duaExplanation}</span>
                                </div>
                            </div>

                            <!-- الذكر والعداد الفوري -->
                            <div class="mood-section-box mood-dhikr-box">
                                <div class="box-tag">
                                    <span>📿 ذكر موصى به مع عداد فوري</span>
                                    <span class="box-meta">الهدف: ${mood.dhikrTarget} مرات</span>
                                </div>
                                <div class="mood-dhikr-content">
                                    <div class="mood-dhikr-txt">${mood.dhikrText}</div>
                                    <p class="mood-dhikr-virtue">${mood.dhikrVirtue}</p>
                                </div>

                                <div class="mood-counter-row">
                                    <button type="button" class="btn-mood-counter" id="btn-mood-count" onclick="MoodCompass.incrementCount('${mood.id}')">
                                        <span class="count-digit" id="mood-count-digit">${moodCounters[moodId]}</span>
                                        <span class="count-label">سبّح الآن +1 ✦</span>
                                    </button>
                                    <div class="counter-progress-info">
                                        <div class="progress-bar-bg">
                                            <div class="progress-bar-fill" id="mood-bar-fill" style="width: ${Math.min((moodCounters[moodId] / mood.dhikrTarget) * 100, 100)}%;"></div>
                                        </div>
                                        <span class="counter-status" id="mood-counter-status">${moodCounters[moodId]} / ${mood.dhikrTarget}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- ومضة وتدبر ختامي -->
                            <div class="mood-reflection-footer">
                                <i class="fa-solid fa-seedling text-emerald"></i>
                                <span><strong>رسالة لقلبك:</strong> ${mood.reflection}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML("beforeend", modalHtml);
        },

        closeModal() {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            const m = document.getElementById("mood-compass-modal");
            if (m) m.remove();
        },

        toggleAudio(url, btn) {
            if (!url) return;

            if (currentAudio && !currentAudio.paused) {
                currentAudio.pause();
                currentAudio = null;
                if (btn) {
                    btn.innerHTML = `<i class="fa-solid fa-play"></i> <span>استمع للتلاوة الخاشعة 🎧</span>`;
                    btn.classList.remove("playing");
                }
                return;
            }

            try {
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio = null;
                }

                currentAudio = new Audio(url);
                if (btn) {
                    btn.innerHTML = `<i class="fa-solid fa-pause"></i> <span>إيقاف التلاوة المؤقت ⏸</span>`;
                    btn.classList.add("playing");
                }

                currentAudio.play().catch(e => {
                    console.warn("Autoplay blocked or audio failure", e);
                    if (btn) {
                        btn.innerHTML = `<i class="fa-solid fa-play"></i> <span>استمع للتلاوة الخاشعة 🎧</span>`;
                        btn.classList.remove("playing");
                    }
                });

                currentAudio.onended = () => {
                    if (btn) {
                        btn.innerHTML = `<i class="fa-solid fa-play"></i> <span>إعادة الاستماع للتلاوة 🎧</span>`;
                        btn.classList.remove("playing");
                    }
                };
            } catch (e) {
                console.error("Audio error", e);
            }
        },

        incrementCount(moodId) {
            const mood = this.getMood(moodId);
            moodCounters[moodId] = (moodCounters[moodId] || 0) + 1;
            const count = moodCounters[moodId];

            const digitEl = document.getElementById("mood-count-digit");
            const fillEl = document.getElementById("mood-bar-fill");
            const statusEl = document.getElementById("mood-counter-status");

            if (digitEl) digitEl.textContent = count;
            if (statusEl) statusEl.textContent = `${count} / ${mood.dhikrTarget}`;
            if (fillEl) {
                const pct = Math.min((count / mood.dhikrTarget) * 100, 100);
                fillEl.style.width = `${pct}%`;
            }

            // Haptic feedback
            if ("vibrate" in navigator) {
                try {
                    navigator.vibrate(25);
                } catch (e) {}
            }

            // عند إتمام الهدف
            if (count === mood.dhikrTarget) {
                if ("vibrate" in navigator) {
                    try {
                        navigator.vibrate([60, 40, 80, 40, 100]);
                    } catch (e) {}
                }
                if (typeof window.showToast === "function") {
                    window.showToast("هنيئاً لقلبك بطاعة الله! تقبل الله منك ورزقك السكينة التامة 🤍");
                }
            }
        },

        shareMoodCard(moodId) {
            const mood = this.getMood(moodId);
            if (window.ShareCardGenerator && typeof window.ShareCardGenerator.openShareModal === "function") {
                window.ShareCardGenerator.openShareModal({
                    title: `طمأنينة القلب • ${mood.title}`,
                    text: mood.ayahText,
                    ref: mood.surah,
                    subtitle: mood.reflection
                });
            } else {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(`« ${mood.ayahText} »\n${mood.surah}\n\nزاد المسلم 🌿: https://zadmuslim-zeta.vercel.app/`);
                    if (typeof window.showToast === "function") {
                        window.showToast("تم نسخ الآية المباركة بنجاح 📋");
                    }
                }
            }
        }
    };

    window.MoodCompass = MoodCompass;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => MoodCompass.init());
    } else {
        MoodCompass.init();
    }

})(window, document);
