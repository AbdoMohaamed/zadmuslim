// Render the home prayer card before network scripts or the rest of the app load.
(function () {
    const valid = t => t && ['Fajr','Dhuhr','Asr','Maghrib','Isha'].every(k => /^(?:[01]\d|2[0-3]):[0-5]\d(?:\s|$)/.test(t[k] || ''));
    const signature = () => JSON.stringify([localStorage.getItem('selected_prayer_city'), localStorage.getItem('zad_prayer_method') || '', localStorage.getItem('zad_prayer_school') || '0', localStorage.getItem('gps_prayer_coords'), Intl.DateTimeFormat().resolvedOptions().timeZone]);
    function readHomePrayerTimings() {
        if (valid(window.prayerTimings)) return window.prayerTimings;
        try {
            const today = new Date().toLocaleDateString('en-CA'), key = signature();
            const saved = JSON.parse(localStorage.getItem('zad_home_prayer_snapshot') || 'null');
            if (saved?.date === today && saved.signature === key && valid(saved.timings)) return saved.timings;
            const calendar = JSON.parse(localStorage.getItem('zad_alarm_days') || 'null');
            const day = calendar?.signature === key && calendar.days?.find(d => d.date === today);
            if (day) {
                const timings = Object.fromEntries(Object.entries(day.timings).map(([k,v]) => [k, v.includes('T') ? v.slice(11,16) : v]));
                if (valid(timings)) return timings;
            }
        } catch (_) {}
        return null;
    }
    window.readHomePrayerTimings = readHomePrayerTimings;
        function updateHomePrayerCard() {
            const prayerNameEl = document.getElementById("daily-next-prayer-name");
            const prayerTimeEl = document.getElementById("daily-next-prayer-time");
            if (!prayerNameEl || !prayerTimeEl) return;

            const timings = readHomePrayerTimings();

            const toArabicDigits = (str) => String(str).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

            const formatPrayerTime12H = (timeStr) => {
                if (!timeStr) return "--:--";
                const clean = timeStr.split(" ")[0];
                const [h, m] = clean.split(":").map(Number);
                if (isNaN(h) || isNaN(m)) return "--:--";
                const period = h >= 12 ? "م" : "ص";
                const formattedHour = h % 12 || 12;
                return `${toArabicDigits(formattedHour)}:${toArabicDigits(String(m).padStart(2, "0"))} ${period}`;
            };

            if (timings && ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].every(k => timings[k])) {
                const now = new Date();
                const prayersList = [
                    { name: "صلاة الفجر", key: "fajr", time: timings.Fajr },
                    { name: "صلاة الظهر", key: "dhuhr", time: timings.Dhuhr },
                    { name: "صلاة العصر", key: "asr", time: timings.Asr },
                    { name: "صلاة المغرب", key: "maghrib", time: timings.Maghrib },
                    { name: "صلاة العشاء", key: "isha", time: timings.Isha }
                ];

                let nextP = null;
                let nextPIndex = -1;
                let nextPDate = null;
                let minDiff = Infinity;

                for (let i = 0; i < prayersList.length; i++) {
                    const p = prayersList[i];
                    if (!p.time) continue;
                    const clean = p.time.split(" ")[0];
                    const [h, m] = clean.split(":").map(Number);
                    if (isNaN(h) || isNaN(m)) continue;
                    const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
                    const diff = pDate.getTime() - now.getTime();
                    if (diff > 0 && diff < minDiff) {
                        minDiff = diff;
                        nextP = { ...p, diffMs: diff, cleanTime: clean };
                        nextPIndex = i;
                        nextPDate = pDate;
                    }
                }

                if (!nextP) {
                    const fajrClean = timings.Fajr ? timings.Fajr.split(" ")[0] : "05:00";
                    const [fh, fm] = fajrClean.split(":").map(Number);
                    const tomorrowFajr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, fh, fm, 0);
                    nextP = {
                        name: "صلاة الفجر",
                        key: "fajr",
                        time: timings.Fajr,
                        cleanTime: fajrClean,
                        diffMs: Math.max(0, tomorrowFajr.getTime() - now.getTime())
                    };
                    nextPIndex = 0;
                    nextPDate = tomorrowFajr;
                }

                // اسم الصلاة في البطاقة الرئيسية
                prayerNameEl.textContent = nextP.name;

                // حساب الوقت المتبقي
                const totalMins = Math.max(0, Math.floor(nextP.diffMs / 60000));
                const hours = Math.floor(totalMins / 60);
                const mins = totalMins % 60;
                let remainingBadgeText = '';
                let remainingLegacyText = '';

                if (hours > 0) {
                    remainingBadgeText = `متبقي ${toArabicDigits(hours)} س و ${toArabicDigits(mins)} د`;
                    remainingLegacyText = ` (متبقي ${hours} س و ${mins} د)`;
                } else if (mins > 0) {
                    remainingBadgeText = `متبقي ${toArabicDigits(mins)} د`;
                    remainingLegacyText = ` (متبقي ${mins} د)`;
                } else {
                    remainingBadgeText = `متبقي أقل من دقيقة`;
                    remainingLegacyText = ` (متبقي أقل من دقيقة)`;
                }

                // تحديث العداد والموعد في البطاقة الرئيسية
                const homeRemainingEl = document.getElementById("home-prayer-remaining");
                if (homeRemainingEl) homeRemainingEl.textContent = remainingBadgeText;

                const homeTimeEl = document.getElementById("home-prayer-time");
                if (homeTimeEl) homeTimeEl.textContent = formatPrayerTime12H(nextP.time);

                // حساب نسبة شريط التقدم بين الصلاة السابقة والقادمة
                const progressBarEl = document.getElementById("home-prayer-progress-bar");
                if (progressBarEl) {
                    let prevPDate = null;
                    if (nextPIndex > 0) {
                        const prevP = prayersList[nextPIndex - 1];
                        const [ph, pm] = (prevP.time || "00:00").split(" ")[0].split(":").map(Number);
                        prevPDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ph, pm, 0);
                    } else {
                        const [ih, im] = (timings.Isha || "20:00").split(" ")[0].split(":").map(Number);
                        prevPDate = new Date(nextPDate.getFullYear(), nextPDate.getMonth(), nextPDate.getDate() - 1, ih, im, 0);
                    }
                    let pct = 0;
                    if (prevPDate && nextPDate && nextPDate > prevPDate) {
                        const elapsed = now.getTime() - prevPDate.getTime();
                        const total = nextPDate.getTime() - prevPDate.getTime();
                        if (total > 0) {
                            pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
                        }
                    }
                    progressBarEl.style.width = `${pct}%`;
                }

                // تحديث شريط الصلوات الخمس وتحديد الصلاة القادمة
                const setStripVal = (id, time) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = formatPrayerTime12H(time);
                };
                setStripVal("home-time-fajr", timings.Fajr);
                setStripVal("home-time-dhuhr", timings.Dhuhr);
                setStripVal("home-time-asr", timings.Asr);
                setStripVal("home-time-maghrib", timings.Maghrib);
                setStripVal("home-time-isha", timings.Isha);

                const activeKey = (nextP.key === "sunrise") ? "dhuhr" : nextP.key;
                ["fajr", "dhuhr", "asr", "maghrib", "isha"].forEach(k => {
                    const stripItem = document.getElementById(`home-strip-${k}`);
                    if (stripItem) {
                        if (k === activeKey) {
                            stripItem.classList.add("is-active");
                        } else {
                            stripItem.classList.remove("is-active");
                        }
                    }
                });

                // النص للتوافق القديم
                const clean = nextP.cleanTime;
                const [h, m] = clean.split(":").map(Number);
                const period = h >= 12 ? "م" : "ص";
                const formattedHour = h % 12 || 12;
                const formattedTime = `${formattedHour}:${String(m).padStart(2, "0")} ${period}`;
                prayerTimeEl.textContent = `موعد الأذان: ${formattedTime}${remainingLegacyText}`;
                return;
            }

            // في حال عدم توفر مواقيت إطلاقاً، إبقاء العبارة الترحيبية اللطيفة دون إظهار أخطاء شبكة
            if (!prayerNameEl.textContent || prayerNameEl.textContent === 'المواقيت غير متاحة') {
                prayerNameEl.textContent = 'صلاتك في وقتها';
                prayerTimeEl.textContent = 'تختلف المواقيت حسب مدينتك';
            }
            const fallbackProgress = document.getElementById("home-prayer-progress-bar");
            if (fallbackProgress) fallbackProgress.style.width = "0%";
            const fallbackRem = document.getElementById("home-prayer-remaining");
            if (fallbackRem) fallbackRem.textContent = 'جارٍ تحديث مواقيت مدينتك…';
            const fallbackTime = document.getElementById("home-prayer-time");
            if (fallbackTime) fallbackTime.textContent = '--:--';
        }


    window.updateHomePrayerCard = updateHomePrayerCard;
    document.addEventListener('zad:prayer-updated', () => {
        if (window.zadPrayerVerified && valid(window.prayerTimings)) {
            try { localStorage.setItem('zad_home_prayer_snapshot', JSON.stringify({date:new Date().toLocaleDateString('en-CA'), signature:signature(), timings:window.prayerTimings})); } catch (_) {}
        }
        updateHomePrayerCard();
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) updateHomePrayerCard(); });
    updateHomePrayerCard();
    setInterval(updateHomePrayerCard, 2000);
})();
