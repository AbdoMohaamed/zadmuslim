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
                await LocalNotifications.requestPermissions();
            }
        } catch (e) {
            console.warn("Failed to request native notification permissions:", e);
        }
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
                { id: "hourly_salawat", name: "تذكير الصلاة على النبي ﷺ كل ساعة", sound: "salawat", importance: 4 },
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
    async schedulePrayers(prayersTimings) {
        if (!prayersTimings) return;
        if (!this.isNative) {
            if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
                this.isNative = true;
            } else {
                return;
            }
        }

        try {
            if (!window.Capacitor || !window.Capacitor.Plugins) return;
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications) return;

            // التأكد من الصلاحيات والقنوات أولاً
            await this.requestPermissions();
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

            let notifySettings = { morning: true, morningTime: "06:30", evening: true, eveningTime: "17:00", sleep: true, sleepTime: "22:30", friday: true, hourlySalawat: true };
            try {
                const rawSettings = localStorage.getItem("smart_notify_settings");
                if (rawSettings) {
                    const parsed = JSON.parse(rawSettings);
                    notifySettings = { ...notifySettings, ...parsed };
                }
            } catch(e) {}

            // جدولة لليوم الحالي ولليومين القادمين (3 أيام = 36 إشعاراً) للبقاء بأمان تام تحت الحد الأقصى لنظام iOS (64 إشعاراً)
            for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
                const targetDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);

                for (const p of prayersList) {
                    if (!p.time) continue;
                    const clean = p.time.split(" ")[0];
                    const [h, m] = clean.split(":").map(Number);

                    const prayerMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), h, m, 0);

                    // 1. تنبيه اقتراب موعد الصلاة قبل 5 دقائق (Pre-prayer 5-minute reminder بصوت ناطق)
                    const preAlertMoment = new Date(prayerMoment.getTime() - (5 * 60 * 1000));
                    if (preAlertMoment.getTime() > now.getTime() + 1000) {
                        const preNotifId = p.idBase + 1000 + (dayOffset * 10);
                        const preSoundName = `pre_${p.key}.mp3`;
                        notificationsToSchedule.push({
                            id: preNotifId,
                            title: `⏳ اقتربت ${p.name}`,
                            body: `بقي 5 دقائق على دخول وقت ${p.name}. تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿`,
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

                    // 2. إشعار دخول وقت الصلاة والأذان التام (Main Adhan Notification)
                    if (prayerMoment.getTime() > now.getTime() + 1000) {
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

            // 4. جدولة تذكير الصلاة على النبي ﷺ في نظام التشغيل حسب الفاصل الزمني المحدد (مع ملف الصوت المدمج salawat.mp3)
            if (notifySettings.hourlySalawat !== false) {
                const intervalMins = parseInt(notifySettings.salawatInterval, 10) || 60;
                const intervalMs = intervalMins * 60 * 1000;

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
                        sound: "salawat.mp3",
                        channelId: "hourly_salawat",
                        smallIcon: "res://ic_stat_icon",
                        iconColor: "#d4af37",
                        extra: { type: "hourly_salawat" }
                    });
                }
            }

            // 1. استخدام بلجن الأذان الأصلي لنظام أندرويد (AdhanNative) لتشغيل الأذان الحقيقي وتحديث ويدجت الشاشة
            let hasNativePlugin = false;
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
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
                        preAlert: true,
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

            if (notificationsForLocal.length > 0) {
                // إلغاء الجدولة القديمة أولاً لعدم تكرار التنبيهات
                try {
                    const pending = await LocalNotifications.getPending();
                    if (pending && pending.notifications && pending.notifications.length > 0) {
                        await LocalNotifications.cancel({ notifications: pending.notifications });
                    }
                } catch(cancelErr) {}

                // جدولة الإشعارات الكاملة في نظام التشغيل (يدعم نظام iOS وأندرويد)
                await LocalNotifications.schedule({ notifications: notificationsForLocal });
                console.log(`✅ Native Adhan Service: Scheduled ${notificationsForLocal.length} notifications via LocalNotifications directly into OS.`);
            }
        } catch (e) {
            console.warn("Failed to schedule native prayer alarms:", e);
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
        if (typeof window.lastFetchedPrayerTimings !== "undefined" && window.lastFetchedPrayerTimings) {
            this.schedulePrayers(window.lastFetchedPrayerTimings);
        }
        return current;
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

                await window.Capacitor.Plugins.AdhanNative.updatePrayerWidget({
                    timings: timings || window.lastFetchedPrayerTimings,
                    hijriDate: hDate,
                    gregorianDate: gDate
                });
                console.log("✅ Home Screen Widget updated successfully via AdhanNative (Hijri & Gregorian)");
            } catch(e) {
                console.warn("Update prayer widget notice:", e);
            }
        }
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
        const muazzin = (typeof getSelectedMuazzinId === "function") ? getSelectedMuazzinId() : "qatami";
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.testAdhanNotification({
                    prayerName: prayerName,
                    prayerKey: prayerKey,
                    muazzin: muazzin
                });
                return { success: true, native: true };
            } catch(e) {
                console.warn("Native test notification failed:", e);
            }
        }

        // Fallback via LocalNotifications plugin
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
            try {
                await window.Capacitor.Plugins.LocalNotifications.schedule({
                    notifications: [{
                        id: 99999,
                        title: `🕌 تجربة إشعار الأذان • ${prayerName}`,
                        body: "الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح 🕋",
                        schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
                        sound: `adhan_${muazzin}.mp3`,
                        channelId: `adhan_${muazzin}`,
                        smallIcon: "res://ic_stat_icon",
                        iconColor: "#d4af37"
                    }]
                });
                return { success: true, plugin: "LocalNotifications" };
            } catch(e) {
                console.warn("LocalNotifications test failed:", e);
            }
        }

        // Web Notification fallback
        if (typeof Notification !== "undefined") {
            if (Notification.permission === "granted") {
                new Notification(`🕌 تجربة إشعار الأذان • ${prayerName}`, {
                    body: "الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح 🕋",
                    icon: "assets/icons/icon-192.png"
                });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(p => {
                    if (p === "granted") {
                        new Notification(`🕌 تجربة إشعار الأذان • ${prayerName}`, {
                            body: "الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح 🕋",
                            icon: "assets/icons/icon-192.png"
                        });
                    }
                });
            }
        }
        return { success: true, fallback: "web" };
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
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                const res = await window.Capacitor.Plugins.AdhanNative.checkExactAlarmPermission();
                return res && res.canSchedule;
            } catch(e) {
                return true;
            }
        }
        return true;
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
     * اختبار الأذان الحقيقي في الخلفية والشاشة مقفلة (تشغيل منبه أندرويد حقيقي بعد دقيقتين)
     */
    async scheduleBackgroundDiagnosticTest(delaySeconds = 120) {
        const muazzin = (typeof getSelectedMuazzinId === "function") ? getSelectedMuazzinId() : "qatami";
        const triggerTime = new Date(Date.now() + (delaySeconds * 1000));
        const timeStr = triggerTime.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        // أندرويد عبر بلجن AdhanNative
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                const res = await window.Capacitor.Plugins.AdhanNative.scheduleDiagnosticTestAlarm({
                    delaySeconds: delaySeconds,
                    muazzin: muazzin,
                    prayerName: "صلاة العصر (اختبار الخلفية)"
                });
                return {
                    success: true,
                    platform: "android_native",
                    delaySeconds,
                    triggerTime: timeStr,
                    message: `تمت جدولة منبه الأذان الفعلي في النظام بعد ${delaySeconds} ثانية (${timeStr}). يرجى قفل شاشة الهاتف أو الخروج من التطبيق الآن للتأكد من انطلاق صوت الأذان 🕌`
                };
            } catch(e) {
                console.warn("Native diagnostic alarm failed:", e);
            }
        }

        // iOS أو Fallback عبر LocalNotifications
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
            try {
                await window.Capacitor.Plugins.LocalNotifications.schedule({
                    notifications: [{
                        id: 99997,
                        title: "🕌 اختبار الأذان في الخلفية",
                        body: "الله أكبر، الله أكبر.. اختبار صوت الأذان والتنبيه الفعلي من شاشة القفل 🕋",
                        schedule: { at: triggerTime, allowWhileIdle: true },
                        sound: `adhan_${muazzin}.mp3`,
                        channelId: `adhan_${muazzin}`,
                        smallIcon: "res://ic_stat_icon",
                        iconColor: "#d4af37",
                        extra: { type: "adhan_call", prayerKey: "asr", muazzin: muazzin }
                    }]
                });
                return {
                    success: true,
                    platform: "ios_local_notification",
                    delaySeconds,
                    triggerTime: timeStr,
                    message: `تمت جدولة إشعار الأذان المسموع بنجاح بعد ${delaySeconds} ثانية (${timeStr}). اقفل شاشة هاتفك للتجربة 📱`
                };
            } catch(e) {
                console.warn("LocalNotifications test failed:", e);
            }
        }

        return {
            success: true,
            platform: "web_fallback",
            delaySeconds,
            triggerTime: timeStr,
            message: `في بيئة المتصفح: سيتم تشغيل الصوت بعد ${delaySeconds} ثانية (${timeStr}). على الهاتف الحقيقي يتم تشغيل المنبه الأصلي من النظام مباشرة.`
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
