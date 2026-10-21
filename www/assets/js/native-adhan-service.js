/**
 * native-adhan-service.js
 * نظام جدولة الأذان والمنبهات الأصلية لتطبيقات الموبايل (Capacitor Android & iOS)
 * يتيح خروج إشعار وتنبيه قبل الصلاة بـ 5 دقائق، وصوت الأذان كاملاً تلقائياً حتى والتطبيق مغلق تماماً والشاشة مقفلة
 */

const NativeAdhanService = {
    isNative: false,
    channelsCreated: false,

    async init() {
        // التحقق مما إذا كان التطبيق يعمل كـ Native App (Capacitor)
        if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
            this.isNative = true;
            console.log("🕌 Native Adhan Service: Running on Native Platform (Android / iOS)");
            await this.requestPermissions();
            await this.createNotificationChannels();
            this.setupListeners();
            if (localStorage.getItem('smart_notify_configured') === 'true') await this.scheduleLocalNotifications();
        } else {
            console.log("🌐 Native Adhan Service: Running on Web / PWA fallback mode");
        }
    },

    async requestPermissions() {
        try {
            if (!window.Capacitor || !window.Capacitor.Plugins) return;
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications) return;
            const status = await LocalNotifications.checkPermissions();
            if (status.display !== "granted") {
                const requested = await LocalNotifications.requestPermissions();
                return requested.display === "granted";
            }
            return true;
        } catch (e) {
            console.warn("Failed to request native notification permissions:", e);
        }
        return false;
    },

    async createNotificationChannels() {
        try {
            if (!window.Capacitor || !window.Capacitor.Plugins) return;
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications || this.channelsCreated) return;

            // قنوات الأذان وقنوات التنبيه المسبق بصوت ناطق
            const channels = [
                { id: "prayer_pre_alert", name: "تنبيه اقتراب موعد الصلاة", sound: "pre_prayer", importance: 4 },
                { id: "prayer_pre_fajr", name: "تنبيه اقتراب صلاة الفجر", sound: "pre_fajr", importance: 4 },
                { id: "prayer_pre_dhuhr", name: "تنبيه اقتراب صلاة الظهر", sound: "pre_dhuhr", importance: 4 },
                { id: "prayer_pre_asr", name: "تنبيه اقتراب صلاة العصر", sound: "pre_asr", importance: 4 },
                { id: "prayer_pre_maghrib", name: "تنبيه اقتراب صلاة المغرب", sound: "pre_maghrib", importance: 4 },
                { id: "prayer_pre_isha", name: "تنبيه اقتراب صلاة العشاء", sound: "pre_isha", importance: 4 },
                { id: "adhan_qatami", name: "أذان الشيخ ناصر القطامي (الافتراضي)", sound: "adhan_qatami", importance: 5 },
                { id: "adhan_abdulbasit", name: "أذان الشيخ عبد الباسط", sound: "adhan_abdulbasit", importance: 5 },
                { id: "adhan_refaat", name: "أذان الشيخ محمد رفعت", sound: "adhan_refaat", importance: 5 },
                { id: "adhan_fajr", name: "أذان الفجر المخصوص", sound: "adhan_fajr", importance: 5 },
                { id: "daily_adhkar", name: "أذكار الصباح والمساء وسورة الكهف", sound: null, importance: 4 },
                { id: "hourly_salawat", name: "تذكير الصلاة على النبي ﷺ", sound: "salawat", importance: 4 },
                { id: "hourly_salawat_silent", name: "تذكير الصلاة على النبي ﷺ (بدون صوت)", sound: null, importance: 3 },
                { id: "zad_cloud_broadcast_channel", name: "إشعارات ورسائل زاد المسلم العامة", sound: null, importance: 4 }
            ];

            for (const ch of channels) {
                try {
                    await LocalNotifications.createChannel({
                        id: ch.id,
                        name: ch.name,
                        description: `قناة تنبيهات ${ch.name}`,
                        sound: ch.sound,
                        importance: ch.importance, // 5 = MAX (Heads-up notification + Full Sound), 4 = HIGH
                        visibility: 1, // إشعار مرئي على شاشة القفل
                        vibration: true,
                        lights: true,
                        lightColor: "#d4af37"
                    });
                } catch (chErr) {
                    // القناة قد تكون مسجلة مسبقاً
                }
            }

            this.channelsCreated = true;
            console.log("✅ Native Adhan Channels created successfully");
        } catch (e) {
            console.warn("Failed to create native notification channels:", e);
        }
    },

    setupListeners() {
        try {
            if (!window.Capacitor || !window.Capacitor.Plugins) return;
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications) return;

            // عند النقر على إشعار من شاشة القفل أو الستارة في نظام iOS و Android
            LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
                console.log("🕌 Native Notification Action performed:", action);
                const notif = action.notification;
                if (notif && notif.extra) {
                    // تشغيل صوت الأذان داخل التطبيق فقط إذا ضغط المستخدم عمداً وبشكل صريح على زر "سماع الأذان" (actionId === 'play_adhan')
                    // أما إذا نقر على الإشعار لفتح التطبيق، فلن يتم تشغيل الصوت مجدداً لأن الأذان أذّن في وقته بالفعل
                    if (notif.extra.type === "adhan_call" && notif.extra.prayerKey && action.actionId === "play_adhan") {
                        const pKey = notif.extra.prayerKey;
                        const pName = notif.extra.prayerName || "الصلاة";
                        const muazzin = notif.extra.muazzin;
                        if (typeof playAdhanAudio === "function") {
                            playAdhanAudio(pKey, muazzin, pName);
                        }
                    }
                }
            });

            // الاستماع أيضاً لاستلام الإشعار أثناء فتح التطبيق (دون إعادة تشغيل أصوات قديمة)
            LocalNotifications.addListener("localNotificationReceived", (notif) => {
                console.log("🕌 Native Notification received:", notif);
            });
        } catch (e) {
            console.warn("Error setting up native notification listeners:", e);
        }
    },

    /**
     * جدولة مواقيت الصلوات الخمس والتنبيه المسبق بـ 5 دقائق في نظام الهاتف الأصلي (AlarmManager / iOS Notifications)
     */
    async cancelPrayerAlarms() {
        const plugins = window.Capacitor?.Plugins;
        try { await plugins?.AdhanNative?.cancelAllAlarms(); } catch {}
        try {
            const pending = await plugins?.LocalNotifications?.getPending();
            const prayers = pending?.notifications?.filter(n => n.id < 70000) || [];
            if (prayers.length) await plugins.LocalNotifications.cancel({ notifications: prayers });
        } catch {}
    },
    async schedulePrayers(prayersTimings) {
        let verified;
        try { verified = JSON.parse(localStorage.getItem('zad_prayer_verified') || 'null'); } catch { return; }
        if (!window.zadPrayerVerified || verified?.date !== new Date().toLocaleDateString('en-CA') ||
            verified.city !== localStorage.getItem('selected_prayer_city') ||
            verified.method !== (localStorage.getItem('zad_prayer_method') || '') ||
            verified.school !== (localStorage.getItem('zad_prayer_school') || '0')) return;
        if (!prayersTimings) {
            if (typeof window !== "undefined" && typeof window.getPrayerTimings === "function") {
                prayersTimings = window.getPrayerTimings();
            } else if (typeof window !== "undefined" && window.prayerTimings) {
                prayersTimings = window.prayerTimings;
            } else {
                try {
                    const raw = localStorage.getItem("last_active_prayer_timings");
                    if (raw) prayersTimings = JSON.parse(raw);
                } catch(e) {}
            }
        }
        if (!prayersTimings) return;
        if (!this.isNative) {
            if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
                this.isNative = true;
            }
        }

        try {
            if (!window.Capacitor || !window.Capacitor.Plugins) return;
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications) return;

            // التأكد من الصلاحيات والقنوات أولاً
            if (!await this.requestPermissions()) return { success: false, message: 'إذن الإشعارات غير متاح؛ فعّله من إعدادات الهاتف.' };
            await this.createNotificationChannels();

            const selectedMuazzin = (typeof getSelectedMuazzinId === "function") ? getSelectedMuazzinId() : "qatami";
            const enabledPrayers = this.getEnabledPrayers();
            const now = new Date();

            const prayersList = [
                { idBase: 100, name: "صلاة الفجر", key: "fajr", time: prayersTimings.Fajr },
                { idBase: 200, name: "صلاة الظهر", key: "dhuhr", time: prayersTimings.Dhuhr },
                { idBase: 300, name: "صلاة العصر", key: "asr", time: prayersTimings.Asr },
                { idBase: 400, name: "صلاة المغرب", key: "maghrib", time: prayersTimings.Maghrib },
                { idBase: 500, name: "صلاة العشاء", key: "isha", time: prayersTimings.Isha }
            ].filter(p => enabledPrayers[p.key] !== false);

            const notificationsToSchedule = [];

            const notifySettings = this.getNotificationSettings();

            const preInterval = parseInt(notifySettings.prePrayerInterval, 10) || 5;

            // جدولة لليوم الحالي ولليومين القادمين (3 أيام = 36 إشعاراً) للبقاء بأمان تام تحت الحد الأقصى لنظام iOS (64 إشعاراً)
            for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
                const targetDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);

                for (const p of prayersList) {
                    if (dayOffset > 0) continue; // Never reuse today's prayer times for another date.
                    if (!p.time) continue;
                    const clean = p.time.split(" ")[0];
                    const [h, m] = clean.split(":").map(Number);

                    const prayerMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), h, m, 0);

                    // 1. تنبيه اقتراب موعد الصلاة قبل دقائق مخصصة (Pre-prayer reminder بصوت ناطق)
                    if (notifySettings.prePrayer !== false) {
                        const preAlertMoment = new Date(prayerMoment.getTime() - (preInterval * 60 * 1000));
                        if (preAlertMoment.getTime() > now.getTime() + 1000) {
                            const preNotifId = p.idBase + 1000 + (dayOffset * 10);
                            const preSoundName = `pre_${p.key}.mp3`;
                            notificationsToSchedule.push({
                                id: preNotifId,
                                title: `⏳ اقتربت ${p.name}`,
                                body: `بقي ${preInterval} دقائق على دخول وقت ${p.name}. تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿`,
                                schedule: {
                                    at: preAlertMoment,
                                    allowWhileIdle: true
                                },
                                sound: preSoundName,
                                channelId: `prayer_pre_${p.key}`,
                                smallIcon: "res://ic_stat_icon",
                                iconColor: "#d4af37",
                                extra: {
                                    prayerKey: p.key,
                                    prayerName: p.name,
                                    type: "pre_prayer_alert"
                                }
                            });
                        }
                    }

                    // 2. إشعار دخول وقت الصلاة والأذان التام (Main Adhan Notification)
                    if (notifySettings.adhan !== false && prayerMoment.getTime() > now.getTime() + 1000) {
                        const notifId = p.idBase + (dayOffset * 10);
                        const isFajr = p.key === "fajr";
                        const channelId = isFajr ? "adhan_fajr" : `adhan_${selectedMuazzin}`;
                        const soundName = isFajr ? "adhan_fajr.mp3" : `adhan_${selectedMuazzin}.mp3`;

                        notificationsToSchedule.push({
                            id: notifId,
                            title: `🕌 حَانَ الآنَ مَوْعِدُ ${p.name}`,
                            body: `الله أكبر، الله أكبر.. حان الآن موعد ${p.name} حسب توقيتك المحلي. حيّ على الصلاة، حيّ على الفلاح 🕋`,
                            schedule: {
                                at: prayerMoment,
                                allowWhileIdle: true // يعمل حتى في وضع توفير الطاقة وقفل الشاشة العميق (Doze Mode)
                            },
                            sound: soundName,
                            channelId: channelId,
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            actionTypeId: "OPEN_PRAYER",
                            extra: {
                                prayerKey: p.key,
                                prayerName: p.name,
                                muazzin: selectedMuazzin,
                                type: "adhan_call"
                            }
                        });
                    }
                }

                // 3. جدولة أذكار الصباح والمساء والنوم في نظام الهاتف الأصلي وفق التوقيت المخصص للمستخدم
                // أذكار الصباح: بالوقت المخصص من المستخدم (افتراضياً 06:30)
                if (notifySettings.morning !== false) {
                    let [mH, mM] = (notifySettings.morningTime || "06:30").split(":").map(Number);
                    if (isNaN(mH)) mH = 6;
                    if (isNaN(mM)) mM = 30;
                    const morningMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), mH, mM, 0);
                    if (morningMoment.getTime() > now.getTime() + 1000) {
                        notificationsToSchedule.push({
                            id: 70000 + (dayOffset * 10),
                            title: "🌅 أذكار الصباح • حصن المسلم",
                            body: "أصبحنا وأصبح الملك لله.. ابدأ يومك بذكر الله وحصّن نفسك وأهلك بنور الأذكار 🌿",
                            schedule: { at: morningMoment, allowWhileIdle: true },
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            extra: { type: "morning_azkar" }
                        });
                    }
                }

                // أذكار المساء: بالوقت المخصص من المستخدم (افتراضياً 17:00)
                if (notifySettings.evening !== false) {
                    let [eH, eM] = (notifySettings.eveningTime || "17:00").split(":").map(Number);
                    if (isNaN(eH)) eH = 17;
                    if (isNaN(eM)) eM = 0;
                    const eveningMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), eH, eM, 0);
                    if (eveningMoment.getTime() > now.getTime() + 1000) {
                        notificationsToSchedule.push({
                            id: 71000 + (dayOffset * 10),
                            title: "🌇 أذكار المساء • طمأنينة القلب",
                            body: "أمسينا وأمسى الملك لله.. حان وقت أذكار المساء لطمأنينة القلب وحفظ الرحمن 🤲",
                            schedule: { at: eveningMoment, allowWhileIdle: true },
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            extra: { type: "evening_azkar" }
                        });
                    }
                }

                // أذكار النوم: بالوقت المخصص من المستخدم (افتراضياً 22:30)
                if (notifySettings.sleep === true) {
                    let [sH, sM] = (notifySettings.sleepTime || "22:30").split(":").map(Number);
                    if (isNaN(sH)) sH = 22;
                    if (isNaN(sM)) sM = 30;
                    const sleepMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), sH, sM, 0);
                    if (sleepMoment.getTime() > now.getTime() + 1000) {
                        notificationsToSchedule.push({
                            id: 73000 + (dayOffset * 10),
                            title: "🌙 أذكار النوم والتحصين • باسمك ربي",
                            body: "باسمك ربي وضعت جنبي وبك أرفعه.. حصّن نفسك بآية الكرسي والمعوذات وخواتيم سورة البقرة 🕊️",
                            schedule: { at: sleepMoment, allowWhileIdle: true },
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            extra: { type: "sleep_azkar" }
                        });
                    }
                }

                // تذكير سورة الكهف والصلاة على النبي يوم الجمعة (الساعة 09:00 صباحاً)
                if (notifySettings.friday !== false && targetDay.getDay() === 5) { // 5 = Friday
                    const fridayMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), 9, 0, 0);
                    if (fridayMoment.getTime() > now.getTime() + 1000) {
                        notificationsToSchedule.push({
                            id: 72000 + (dayOffset * 10),
                            title: "✨ جمعة مباركة • نور ما بين الجمعتين",
                            body: "لا تنس قراءة سورة الكهف والإكثار من الصلاة والسلام على الحبيب المصطفى ﷺ 🌿",
                            schedule: { at: fridayMoment, allowWhileIdle: true },
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            extra: { type: "friday_kahf" }
                        });
                    }
                }
            }

            this.appendFastingReminders(notificationsToSchedule, notifySettings, now);
            // 4. جدولة تذكير الصلاة على النبي ﷺ في نظام التشغيل حسب الفاصل الزمني المحدد (مع ملف الصوت المدمج salawat.mp3)
            if (notifySettings.hourlySalawat !== false) {
                const intervalMins = parseInt(notifySettings.salawatInterval, 10) || 60;
                const intervalMs = intervalMins * 60 * 1000;
                const hasSound = notifySettings.salawatSound !== false;

                // عدد الإشعارات المتاحة بحيث لا نتجاوز حد نظام iOS البالغ 64 إشعاراً كلياً
                const remainingSlots = Math.max(5, 60 - notificationsToSchedule.length);
                const countToSchedule = Math.min(remainingSlots, Math.max(1, Math.floor((24 * 60) / intervalMins)));

                for (let i = 1; i <= countToSchedule; i++) {
                    const salawatMoment = new Date(now.getTime() + (i * intervalMs));
                    notificationsToSchedule.push({
                        id: 80000 + i,
                        title: "ﷺ صلِّ على النبي",
                        body: "اللهم صلِّ وسلِّم وبارك على نبينا وحبيبنا محمد ﷺ",
                        schedule: { at: salawatMoment, allowWhileIdle: true },
                        sound: hasSound ? "salawat.mp3" : null,
                        channelId: hasSound ? "hourly_salawat" : "hourly_salawat_silent",
                        smallIcon: "res://ic_stat_icon",
                        iconColor: "#d4af37",
                        extra: { type: "hourly_salawat" }
                    });
                }
            }

            // 1. استخدام بلجن الأذان الأصلي لنظام أندرويد (AdhanNative) لتشغيل الأذان الحقيقي وتحديث ويدجت الشاشة
            let hasNativePlugin = false;
            if (window.Capacitor?.getPlatform?.() === 'android' && window.Capacitor.Plugins.AdhanNative) {
                try {
                    let hijriDateStr = "";
                    let gregorianDateStr = "";
                    try {
                        const hEl = document.getElementById("daily-hijri-date") || document.getElementById("hijri-date-text") || document.getElementById("app-header-hijri-date") || document.getElementById("hero-hijri-date-text");
                        if (hEl && hEl.innerText) hijriDateStr = hEl.innerText.trim();
                    } catch(e) {}
                    if (!hijriDateStr) {
                        try {
                            const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                            hijriDateStr = hijriFormatter.format(new Date()) + " هـ";
                        } catch(e) {}
                    }
                    try {
                        const gregFormatter = new Intl.DateTimeFormat('ar-EG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        });
                        gregorianDateStr = gregFormatter.format(new Date()) + " م";
                    } catch(e) {}

                    const nativeRes = await window.Capacitor.Plugins.AdhanNative.schedulePrayerAlarms({
                        timings: prayersTimings,
                        muazzin: selectedMuazzin,
                        preAlert: notifySettings.prePrayer !== false,
                        preAlertInterval: preInterval,
                        adhan: notifySettings.adhan !== false,
                        enabledPrayers: enabledPrayers,
                        hijriDate: hijriDateStr,
                        gregorianDate: gregorianDateStr
                    });
                    hasNativePlugin = true;
                    console.log("✅ Native Adhan Android Service: Alarms & Home Widget scheduled successfully:", nativeRes);
                } catch(nativeErr) {
                    console.warn("Native Adhan Android plugin call failed, falling back to LocalNotifications:", nativeErr);
                }
            }

            // في نظام أندرويد: بلجن AdhanNative يتكفل بجميع منبهات الأذان والتنبيه المسبق وتشغيل الصوت والتحكم بأزرار الصوت والقفل
            // بينما نجدول عبر LocalNotifications تذكيرات الأذكار الصباحية والمسائية وسورة الكهف فقط لمنع ازدواجية الإشعارات
            const isAndroid = window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android';
            let notificationsForLocal = notificationsToSchedule;
            if (isAndroid && hasNativePlugin) {
                notificationsForLocal = notificationsToSchedule.filter(n => n.id >= 70000);
            }

            // Remove legacy iOS native prayer requests; LocalNotifications owns iOS scheduling.
            if (window.Capacitor?.getPlatform?.() === 'ios') await window.Capacitor.Plugins.AdhanNative?.cancelAllAlarms?.();
            const pending = await LocalNotifications.getPending();
            const owned = (pending.notifications || []).filter(n => n.id > 0 && n.id < 90000);
            if (owned.length) await LocalNotifications.cancel({ notifications: owned });

            if (notificationsForLocal.length > 0) {
                // جدولة الإشعارات الكاملة في نظام التشغيل (يدعم نظام iOS وأندرويد)
                await LocalNotifications.schedule({ notifications: notificationsForLocal });
                console.log(`✅ Native Adhan Service: Scheduled ${notificationsForLocal.length} notifications via LocalNotifications directly into OS.`);
            }
            return { success: true };
        } catch (e) {
            console.warn("Failed to schedule native prayer alarms:", e);
            return { success: false, message: 'تعذّرت جدولة التنبيهات في نظام الهاتف.' };
        }
    },

    getNotificationSettings() {
        const defaults = { morning: true, morningTime: '06:30', evening: true, eveningTime: '17:00', sleep: true, sleepTime: '22:30', friday: true, hourlySalawat: true, salawatInterval: 60, prePrayer: true, prePrayerInterval: 5, adhan: true };
        let saved;
        try { saved = JSON.parse(localStorage.getItem('smart_notify_settings')); } catch {}
        const settings = { ...defaults, ...(saved && typeof saved === 'object' ? saved : {}) };
        for (const key of ['morningTime','eveningTime','sleepTime']) {
            if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(settings[key])) settings[key] = defaults[key];
        }
        for (const key of ['salawatInterval','prePrayerInterval']) {
            const value = Number(settings[key]);
            settings[key] = Number.isInteger(value) && value > 0 && value <= 1440 ? value : defaults[key];
        }
        return settings;
    },

    appendFastingReminders(notifications, settings, now) {
        if (settings.fasting !== true) return;
        for (let day = 0; day < 7; day++) {
            const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, 20, 0, 0);
            if (![0, 3].includes(at.getDay()) || at <= now) continue;
            notifications.push({ id: 74000 + day, title: 'تذكير بصيام الإثنين والخميس',
                body: 'غدًا ' + (at.getDay() === 0 ? 'الإثنين' : 'الخميس') + '؛ تذكير لمن ينوي صيام التطوع.',
                schedule: { at, allowWhileIdle: true }, channelId: 'daily_adhkar', extra: { type: 'fasting' } });
        }
    },

    getEnabledPrayers() {
        try {
            const raw = localStorage.getItem("zad_enabled_prayers");
            if (raw) return JSON.parse(raw);
        } catch(e) {}
        return { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true };
    },

    setPrayerEnabled(prayerKey, isEnabled) {
        const current = this.getEnabledPrayers();
        current[prayerKey] = !!isEnabled;
        localStorage.setItem("zad_enabled_prayers", JSON.stringify(current));
        // إعادة الجدولة إن كانت المواقيت متوفرة
        this.schedulePrayers();
        return current;
    },

    /**
     * جدولة إشعارات الأذكار والصلاة على النبي وسنن الأسبوع فورياً في نظام التشغيل (مع تحديث الصلوات إن كانت متوفرة)
     */
    async scheduleLocalNotifications() {
        if (window.zadPrayerVerified) {
            const result = await this.schedulePrayers();
            if (result) return result;
        }
        if (!window.Capacitor || !window.Capacitor.Plugins) return;
        const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
        if (!LocalNotifications) return;

        try {
            if (!await this.requestPermissions()) return { success: false, message: 'إذن الإشعارات غير متاح؛ فعّله من إعدادات الهاتف.' };
            await this.createNotificationChannels();

            const notifySettings = this.getNotificationSettings();
            if (notifySettings.adhan === false && notifySettings.prePrayer === false) await this.cancelPrayerAlarms();
            const now = new Date();
            const notificationsToSchedule = [];

            // 1. أذكار الصباح والمساء والنوم وسورة الكهف لليومين القادمين
            for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
                const targetDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);

                // أذكار الصباح
                if (notifySettings.morning !== false) {
                    let [mH, mM] = (notifySettings.morningTime || "06:30").split(":").map(Number);
                    if (isNaN(mH)) mH = 6; if (isNaN(mM)) mM = 30;
                    const morningMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), mH, mM, 0);
                    if (morningMoment.getTime() > now.getTime() + 1000) {
                        notificationsToSchedule.push({
                            id: 70000 + (dayOffset * 10),
                            title: "🌅 أذكار الصباح • حصن المسلم",
                            body: "أصبحنا وأصبح الملك لله.. ابدأ يومك بذكر الله وحصّن نفسك وأهلك بنور الأذكار 🌿",
                            schedule: { at: morningMoment, allowWhileIdle: true },
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            extra: { type: "morning_azkar" }
                        });
                    }
                }

                // أذكار المساء
                if (notifySettings.evening !== false) {
                    let [eH, eM] = (notifySettings.eveningTime || "17:00").split(":").map(Number);
                    if (isNaN(eH)) eH = 17; if (isNaN(eM)) eM = 0;
                    const eveningMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), eH, eM, 0);
                    if (eveningMoment.getTime() > now.getTime() + 1000) {
                        notificationsToSchedule.push({
                            id: 71000 + (dayOffset * 10),
                            title: "🌇 أذكار المساء • طمأنينة القلب",
                            body: "أمسينا وأمسى الملك لله.. حان وقت أذكار المساء لطمأنينة القلب وحفظ الرحمن 🤲",
                            schedule: { at: eveningMoment, allowWhileIdle: true },
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            extra: { type: "evening_azkar" }
                        });
                    }
                }

                // أذكار النوم
                if (notifySettings.sleep === true) {
                    let [sH, sM] = (notifySettings.sleepTime || "22:30").split(":").map(Number);
                    if (isNaN(sH)) sH = 22; if (isNaN(sM)) sM = 30;
                    const sleepMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), sH, sM, 0);
                    if (sleepMoment.getTime() > now.getTime() + 1000) {
                        notificationsToSchedule.push({
                            id: 73000 + (dayOffset * 10),
                            title: "🌙 أذكار النوم والتحصين • باسمك ربي",
                            body: "باسمك ربي وضعت جنبي وبك أرفعه.. حصّن نفسك بآية الكرسي والمعوذات وخواتيم سورة البقرة 🕊️",
                            schedule: { at: sleepMoment, allowWhileIdle: true },
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            extra: { type: "sleep_azkar" }
                        });
                    }
                }

                // تذكير سورة الكهف والصلاة على النبي يوم الجمعة
                if (notifySettings.friday !== false && targetDay.getDay() === 5) {
                    const fridayMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), 9, 0, 0);
                    if (fridayMoment.getTime() > now.getTime() + 1000) {
                        notificationsToSchedule.push({
                            id: 72000 + (dayOffset * 10),
                            title: "✨ جمعة مباركة • نور ما بين الجمعتين",
                            body: "لا تنس قراءة سورة الكهف والإكثار من الصلاة والسلام على الحبيب المصطفى ﷺ 🌿",
                            schedule: { at: fridayMoment, allowWhileIdle: true },
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            extra: { type: "friday_kahf" }
                        });
                    }
                }
            }

            this.appendFastingReminders(notificationsToSchedule, notifySettings, now);
            // 2. تذكير الصلاة على النبي ﷺ
            if (notifySettings.hourlySalawat !== false) {
                const intervalMins = parseInt(notifySettings.salawatInterval, 10) || 60;
                const intervalMs = intervalMins * 60 * 1000;
                const hasSound = notifySettings.salawatSound !== false;

                const remainingSlots = Math.max(5, 50 - notificationsToSchedule.length);
                const countToSchedule = Math.min(remainingSlots, Math.max(1, Math.floor((24 * 60) / intervalMins)));

                for (let i = 1; i <= countToSchedule; i++) {
                    const salawatMoment = new Date(now.getTime() + (i * intervalMs));
                    notificationsToSchedule.push({
                        id: 80000 + i,
                        title: "ﷺ صلِّ على النبي",
                        body: "اللهم صلِّ وسلِّم وبارك على نبينا وحبيبنا محمد ﷺ",
                        schedule: { at: salawatMoment, allowWhileIdle: true },
                        sound: hasSound ? "salawat.mp3" : null,
                        channelId: hasSound ? "hourly_salawat" : "hourly_salawat_silent",
                        smallIcon: "res://ic_stat_icon",
                        iconColor: "#d4af37",
                        extra: { type: "hourly_salawat" }
                    });
                }
            }

            // إلغاء الإشعارات السابقة من نوع أذكار وصلاة على النبي فقط (IDs 70000 to 89999)
            const pending = await LocalNotifications.getPending();
            if (pending && pending.notifications && pending.notifications.length > 0) {
                const oldNonPrayers = pending.notifications.filter(n => n.id >= 70000 && n.id < 90000);
                if (oldNonPrayers.length > 0) {
                    await LocalNotifications.cancel({ notifications: oldNonPrayers });
                }
            }

            if (notificationsToSchedule.length > 0) {
                await LocalNotifications.schedule({ notifications: notificationsToSchedule });
            }

            // إذا كانت الصلوات مفعّلة ومتاحة، نحدّث جدول الصلوات أيضاً
            return { success: true };
        } catch (e) {
            console.warn("NativeAdhanService.scheduleLocalNotifications error:", e);
            return { success: false, message: 'تعذّرت جدولة التذكيرات في نظام الهاتف.' };
        }
    },

    /**
     * تحديث ويدجت الشاشة الرئيسية (Home Screen Widget) بمواقيت الصلاة والتاريخ الهجري والميلادي
     */
    async updateWidget(timings, hijriDate, gregorianDate) {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                let hDate = hijriDate || "";
                let gDate = gregorianDate || "";
                if (!hDate) {
                    try {
                        const hEl = document.getElementById("daily-hijri-date") || document.getElementById("hijri-date-text") || document.getElementById("app-header-hijri-date") || document.getElementById("hero-hijri-date-text");
                        if (hEl && hEl.innerText) hDate = hEl.innerText.trim();
                    } catch(e) {}
                    if (!hDate) {
                        try {
                            const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                            hDate = hijriFormatter.format(new Date()) + " هـ";
                        } catch(e) {}
                    }
                }
                if (!gDate) {
                    try {
                        const gregFormatter = new Intl.DateTimeFormat('ar-EG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        });
                        gDate = gregFormatter.format(new Date()) + " م";
                    } catch(e) {}
                }

                const finalTimings = timings || window.prayerTimings || window.lastFetchedPrayerTimings || (function() {
                    try { return JSON.parse(localStorage.getItem("last_active_prayer_timings") || "null"); } catch(e) { return null; }
                })();

                await window.Capacitor.Plugins.AdhanNative.updatePrayerWidget({
                    timings: finalTimings,
                    timingsJson: JSON.stringify(finalTimings || {}),
                    hijriDate: hDate,
                    gregorianDate: gDate
                });
                console.log("✅ Home Screen Widget updated successfully via AdhanNative (Hijri & Gregorian)");
            } catch(e) {
                console.warn("Update prayer widget notice:", e);
            }
        }
    },

    updatePrayerWidget(timings, hijriDate, gregorianDate) {
        return this.updateWidget(timings, hijriDate, gregorianDate);
    },

    async toggleStickyNotification(enable) {
        localStorage.setItem("zad_sticky_prayer_notification", enable ? "true" : "false");
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.toggleStickyNotification({ enabled: enable });
                console.log("🕌 Sticky Notification toggled:", enable);
            } catch (e) {
                console.warn("Failed to toggle native sticky notification:", e);
            }
        }
    },

    async updateStickyNotification() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.updateStickyNotification();
            } catch (e) {}
        }
    },

    /**
     * تجربة صوت الأذان
     */
    async testAdhanAudio(muazzin) {
        const m = muazzin || ((typeof getSelectedMuazzinId === "function") ? getSelectedMuazzinId() : "qatami");
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                return await window.Capacitor.Plugins.AdhanNative.testAdhanAudio({ muazzin: m });
            } catch(e) {
                console.warn("Native test adhan failed:", e);
            }
        }
        // Fallback for Web
        const previewAudio = document.getElementById("audio-adhan-preview") || document.getElementById("audio-adhan");
        if (previewAudio) {
            if (!previewAudio.paused) {
                previewAudio.pause();
                previewAudio.currentTime = 0;
            } else {
                previewAudio.src = `assets/audio/adhan/${m}.mp3`;
                previewAudio.play().catch(e => console.warn("HTML5 adhan preview failed:", e));
            }
        }
        return { success: true, muazzin: m, fallback: "web" };
    },

    /**
     * تجربة صوت الصلاة على النبي ﷺ
     */
    async testSalawatAudio() {
        if (typeof window.playSalawatAudio === "function") {
            window.playSalawatAudio(true);
            return { success: true };
        }
        try {
            const audio = new Audio("assets/audio/salawat.mp3?v=" + Date.now());
            audio.volume = 1.0;
            await audio.play();
            return { success: true };
        } catch(e) {
            console.warn("Error playing salawat audio:", e);
            return { success: false, error: e };
        }
    },

    /**
     * اختبار إرسال إشعار الأذان الفوري
     */
    async testNotification(prayerKey = "asr", prayerName = "صلاة العصر") {
        const muazzin = typeof getSelectedMuazzinId === 'function' ? getSelectedMuazzinId() : 'qatami';
        try {
            if (window.Capacitor?.isNativePlatform?.()) {
                if (!await this.requestPermissions()) return { success: false, message: 'اسمح بالإشعارات من إعدادات الهاتف.' };
                await this.createNotificationChannels();
                const plugins = window.Capacitor.Plugins;
                if (plugins.AdhanNative) {
                    await plugins.AdhanNative.testAdhanNotification({ prayerKey, prayerName, muazzin });
                } else {
                    await plugins.LocalNotifications.schedule({ notifications: [{
                        id: 99999, title: 'تجربة إشعار الأذان', body: prayerName,
                        schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
                        sound: 'adhan_' + muazzin + '.mp3', channelId: 'adhan_' + muazzin
                    }] });
                }
                return { success: true };
            }
            if (typeof Notification === 'undefined') return { success: false, message: 'الإشعارات غير مدعومة في هذا المتصفح.' };
            const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
            if (permission !== 'granted') return { success: false, message: 'إذن الإشعارات مرفوض؛ غيّره من إعدادات المتصفح.' };
            const options = { body: prayerName, icon: 'assets/icon-192.png' };
            const reg = await navigator.serviceWorker?.getRegistration();
            if (reg) await reg.showNotification('تجربة إشعار الأذان', options);
            else new Notification('تجربة إشعار الأذان', options);
            return { success: true };
        } catch (e) {
            return { success: false, message: 'تعذّر إرسال الإشعار التجريبي.' };
        }
    },

    async openNotificationSettings() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.openNotificationSettings();
            } catch(e) {
                console.warn("Cannot open notification settings:", e);
            }
        }
    },

    async openBatterySettings() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.openBatteryOptimizationSettings();
            } catch(e) {
                console.warn("Cannot open battery settings:", e);
            }
        }
    },

    async checkExactAlarmPermission() {
        if (window.Capacitor?.getPlatform?.() !== 'android') return true;
        try {
            const plugins = window.Capacitor.Plugins;
            if (plugins.AdhanNative) return (await plugins.AdhanNative.checkExactAlarmPermission()).canSchedule === true;
            return (await plugins.LocalNotifications.checkExactNotificationSetting()).exact_alarm === 'granted';
        } catch { return false; }
    },

    async requestExactAlarmPermission() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.requestExactAlarmPermission();
            } catch(e) {
                console.warn("Cannot request exact alarm permission:", e);
            }
        }
    },

    /**
     * إيقاف الأذان الجاري تشغيله في الخلفية فوراً
     */
    async stopAdhan() {
        try {
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
                await window.Capacitor.Plugins.AdhanNative.stopAdhan();
            }
            const audioEl = document.getElementById("audio-adhan");
            if (audioEl) {
                audioEl.pause();
                audioEl.currentTime = 0;
            }
            const previewEl = document.getElementById("audio-adhan-preview");
            if (previewEl) {
                previewEl.pause();
                previewEl.currentTime = 0;
            }
        } catch(e) {
            console.warn("Error stopping native adhan:", e);
        }
    },

    /**
     * اختبار حقيقي في الخلفية والشاشة مقفلة (منبه أندرويد حقيقي / إشعار iOS مسموع)
     * type: "pre_prayer" (تنبيه مسبق 60 ثانية) أو "adhan" (أذان كامل 120 ثانية)
     */
    async scheduleBackgroundDiagnosticTest(type = "adhan", delaySeconds = null) {
        if (!window.Capacitor?.isNativePlatform?.()) return { success: false, message: 'اختبار الخلفية يحتاج تطبيق الهاتف؛ المتصفح لا يضمن التنبيه عند قفل الشاشة.' };
        if (!await this.requestPermissions()) return { success: false, message: 'فعّل إذن الإشعارات قبل الاختبار.' };
        await this.createNotificationChannels();
        if (window.Capacitor.getPlatform?.() === 'android' && !await this.checkExactAlarmPermission()) return { success: false, message: 'فعّل إذن المنبّهات الدقيقة من إعدادات الهاتف ثم أعد الاختبار.' };
        if (!delaySeconds) {
            delaySeconds = (type === "pre_prayer") ? 60 : 120;
        }
        const muazzin = (typeof getSelectedMuazzinId === "function") ? getSelectedMuazzinId() : "qatami";
        const triggerTime = new Date(Date.now() + (delaySeconds * 1000));
        const timeStr = triggerTime.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const isPreAlert = (type === "pre_prayer");
        const testTitle = isPreAlert ? "⏳ اختبار التنبيه المسبق للصلاة" : "🕌 اختبار الأذان في الخلفية";
        const testBody = isPreAlert ? "اقتربت الصلاة، تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿" : "الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح 🕋";

        // بلجن أصلي (أندرويد / iOS عبر AdhanNative)
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                const res = await window.Capacitor.Plugins.AdhanNative.scheduleDiagnosticTestAlarm({
                    type: type,
                    delaySeconds: delaySeconds,
                    muazzin: muazzin,
                    prayerName: isPreAlert ? "صلاة العصر (تنبيه مسبق)" : "صلاة العصر (أذان)"
                });
                return {
                    success: true,
                    type: type,
                    platform: "native_alarm",
                    delaySeconds: delaySeconds,
                    triggerTime: timeStr,
                    message: `تمت جدولة ${isPreAlert ? "التنبيه المسبق الناطق" : "الأذان الكامل"} في نظام الهاتف بعد ${delaySeconds} ثانية (${timeStr}). يرجى قفل شاشة الهاتف أو الخروج من التطبيق الآن للتأكد من انطلاق الصوت والتنبيه تلقائياً 📱✨`
                };
            } catch(e) {
                console.warn("Native diagnostic alarm failed:", e);
            }
        }

        // iOS أو Fallback عبر LocalNotifications
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
            try {
                const soundFile = isPreAlert ? "pre_asr.mp3" : `adhan_${muazzin}.mp3`;
                const channelId = isPreAlert ? "prayer_pre_asr" : `adhan_${muazzin}`;
                await window.Capacitor.Plugins.LocalNotifications.schedule({
                    notifications: [{
                        id: isPreAlert ? 99981 : 99982,
                        title: testTitle,
                        body: testBody,
                        schedule: { at: triggerTime, allowWhileIdle: true },
                        sound: soundFile,
                        channelId: channelId,
                        smallIcon: "res://ic_stat_icon",
                        iconColor: "#d4af37",
                        extra: { type: isPreAlert ? "pre_prayer_alert" : "adhan_call", prayerKey: "asr", muazzin: muazzin }
                    }]
                });
                return {
                    success: true,
                    type: type,
                    platform: "local_notifications",
                    delaySeconds: delaySeconds,
                    triggerTime: timeStr,
                    message: `تمت جدولة إشعار ${isPreAlert ? "التنبيه المسبق" : "الأذان"} بنجاح بعد ${delaySeconds} ثانية (${timeStr}). اقفل شاشة هاتفك للتجربة 📱`
                };
            } catch(e) {
                console.warn("LocalNotifications test failed:", e);
            }
        }

        return { success: false, platform: 'unsupported', message: 'تعذّرت جدولة اختبار الخلفية. راجع أذونات الهاتف؛ مؤقت المتصفح لا يضمن العمل والشاشة مقفولة.' };
    },

    /**
     * فحص صلاحيات المنبهات الدقيقة والإشعارات وتحسين البطارية
     */
    async checkPermissionsStatus() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                return await window.Capacitor.Plugins.AdhanNative.checkAlarmPermissions();
            } catch (e) {
                console.warn("Error checking alarm permissions:", e);
            }
        }
        return {
            notificationsGranted: typeof Notification !== 'undefined' && Notification.permission === 'granted',
            exactAlarmsGranted: null,
            batteryOptimizationsIgnored: null
        };
    }
};

// إتاحة الكائن عالمياً
if (typeof window !== "undefined") {
    window.NativeAdhanService = NativeAdhanService;
}

// التهيئة التلقائية فور تجهيز DOM
if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => NativeAdhanService.init());
    } else {
        NativeAdhanService.init();
    }
}
