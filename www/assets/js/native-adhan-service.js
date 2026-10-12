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
                { id: "adhan_makkah", name: "أذان الحرم المكي", sound: "adhan_makkah", importance: 5 },
                { id: "adhan_madinah", name: "أذان المسجد النبوي", sound: "adhan_madinah", importance: 5 },
                { id: "adhan_aqsa", name: "أذان المسجد الأقصى", sound: "adhan_aqsa", importance: 5 },
                { id: "adhan_abdulbasit", name: "أذان الشيخ عبد الباسط", sound: "adhan_abdulbasit", importance: 5 },
                { id: "adhan_refaat", name: "أذان الشيخ محمد رفعت", sound: "adhan_refaat", importance: 5 },
                { id: "adhan_qatami", name: "أذان الشيخ ناصر القطامي", sound: "adhan_qatami", importance: 5 },
                { id: "adhan_fajr", name: "أذان الفجر المخصوص", sound: "adhan_fajr", importance: 5 },
                { id: "daily_adhkar", name: "أذكار الصباح والمساء وسورة الكهف", sound: null, importance: 4 },
                { id: "zad_cloud_broadcast_channel", name: "إشعارات ورسائل زاد المسلم العامة", sound: "adhan_makkah", importance: 5 }
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

            // عند النقر على إشعار الأذان من شاشة القفل أو الستارة في نظام iOS و Android
            LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
                console.log("🕌 Native Notification Action performed:", action);
                const notif = action.notification;
                if (notif && notif.extra) {
                    if (notif.extra.type === "adhan_call" && notif.extra.prayerKey) {
                        const pKey = notif.extra.prayerKey;
                        const pName = notif.extra.prayerName || "الصلاة";
                        const muazzin = notif.extra.muazzin;
                        if (typeof playAdhanAudio === "function") {
                            playAdhanAudio(pKey, muazzin, pName);
                        }
                    } else if (notif.extra.type === "pre_prayer_alert" && notif.extra.prayerKey) {
                        if (typeof playPrePrayerAudio === "function") {
                            playPrePrayerAudio(notif.extra.prayerKey);
                        }
                    }
                }
            });

            // الاستماع أيضاً لاستلام الإشعار عند فتح التطبيق
            LocalNotifications.addListener("localNotificationReceived", (notif) => {
                console.log("🕌 Native Notification received:", notif);
                if (notif && notif.extra && notif.extra.type === "pre_prayer_alert" && notif.extra.prayerKey) {
                    if (typeof playPrePrayerAudio === "function") {
                        playPrePrayerAudio(notif.extra.prayerKey);
                    }
                }
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

            const selectedMuazzin = (typeof getSelectedMuazzinId === "function") ? getSelectedMuazzinId() : "makkah";
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

                // 3. جدولة أذكار الصباح والمساء في نظام الهاتف الأصلي (Morning & Evening Azkar)
                // أذكار الصباح: الساعة 06:30 صباحاً
                const morningMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), 6, 30, 0);
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

                // أذكار المساء: الساعة 17:00 (5:00 عصراً)
                const eveningMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), 17, 0, 0);
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

                // تذكير سورة الكهف والصلاة على النبي يوم الجمعة (الساعة 09:00 صباحاً)
                if (targetDay.getDay() === 5) { // 5 = Friday
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

            // 1. استخدام بلجن الأذان الأصلي لنظام أندرويد (AdhanNative) لتشغيل الأذان الحقيقي في الخلفية والمغلق والتحكم عبر زر القفل
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
                try {
                    const nativeRes = await window.Capacitor.Plugins.AdhanNative.schedulePrayerAlarms({
                        timings: prayersTimings,
                        muazzin: selectedMuazzin,
                        preAlert: true,
                        enabledPrayers: enabledPrayers
                    });
                    console.log("✅ Native Adhan Android Service: Exact alarms scheduled successfully:", nativeRes);
                } catch(nativeErr) {
                    console.warn("Native Adhan Android plugin call failed, falling back to LocalNotifications:", nativeErr);
                }
            }

            if (notificationsToSchedule.length > 0) {
                // إلغاء الجدولة القديمة أولاً لعدم تكرار التنبيهات
                try {
                    const pending = await LocalNotifications.getPending();
                    if (pending && pending.notifications && pending.notifications.length > 0) {
                        await LocalNotifications.cancel({ notifications: pending.notifications });
                    }
                } catch(cancelErr) {}

                // جدولة الإشعارات الكاملة في نظام التشغيل (يدعم نظام iOS وأندرويد)
                await LocalNotifications.schedule({ notifications: notificationsToSchedule });
                console.log(`✅ Native Adhan Service: Scheduled ${notificationsToSchedule.length} upcoming prayer alarms & pre-alerts directly into OS.`);
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
     * تجربة صوت الأذان
     */
    async testAdhanAudio(muazzin) {
        const m = muazzin || ((typeof getSelectedMuazzinId === "function") ? getSelectedMuazzinId() : "makkah");
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
     * اختبار إرسال إشعار الأذان الفوري
     */
    async testNotification(prayerKey = "asr", prayerName = "صلاة العصر") {
        const muazzin = (typeof getSelectedMuazzinId === "function") ? getSelectedMuazzinId() : "makkah";
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
        const muazzin = (typeof getSelectedMuazzinId === "function") ? getSelectedMuazzinId() : "makkah";
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
