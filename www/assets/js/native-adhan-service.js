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

            // قنوات الأذان وقناة التنبيه المسبق
            const channels = [
                { id: "prayer_pre_alert", name: "تنبيه اقتراب موعد الصلاة (قبل 5 دقائق)", sound: null, importance: 4 },
                { id: "adhan_makkah", name: "أذان الحرم المكي", sound: "adhan_makkah", importance: 5 },
                { id: "adhan_madinah", name: "أذان المسجد النبوي", sound: "adhan_madinah", importance: 5 },
                { id: "adhan_aqsa", name: "أذان المسجد الأقصى", sound: "adhan_aqsa", importance: 5 },
                { id: "adhan_abdulbasit", name: "أذان الشيخ عبد الباسط", sound: "adhan_abdulbasit", importance: 5 },
                { id: "adhan_refaat", name: "أذان الشيخ محمد رفعت", sound: "adhan_refaat", importance: 5 },
                { id: "adhan_qatami", name: "أذان الشيخ ناصر القطامي", sound: "adhan_qatami", importance: 5 },
                { id: "adhan_fajr", name: "أذان الفجر المخصوص", sound: "adhan_fajr", importance: 5 }
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

            // عند النقر على إشعار الأذان من شاشة القفل أو الستارة
            LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
                console.log("Native Notification clicked:", action);
                const notif = action.notification;
                if (notif && notif.extra && notif.extra.prayerKey) {
                    if (typeof playAdhanAudio === "function") {
                        playAdhanAudio(notif.extra.prayerKey);
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
            const now = new Date();

            const prayersList = [
                { idBase: 100, name: "صلاة الفجر", key: "fajr", time: prayersTimings.Fajr },
                { idBase: 200, name: "صلاة الظهر", key: "dhuhr", time: prayersTimings.Dhuhr },
                { idBase: 300, name: "صلاة العصر", key: "asr", time: prayersTimings.Asr },
                { idBase: 400, name: "صلاة المغرب", key: "maghrib", time: prayersTimings.Maghrib },
                { idBase: 500, name: "صلاة العشاء", key: "isha", time: prayersTimings.Isha }
            ];

            const notificationsToSchedule = [];

            // جدولة لليوم الحالي وللأيام الأربعة القادمة لضمان استمرار العمل حتى والتطبيق مغلق تماماً
            for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
                const targetDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);

                for (const p of prayersList) {
                    if (!p.time) continue;
                    const clean = p.time.split(" ")[0];
                    const [h, m] = clean.split(":").map(Number);

                    const prayerMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), h, m, 0);

                    // 1. تنبيه اقتراب موعد الصلاة قبل 5 دقائق (Pre-prayer 5-minute reminder)
                    const preAlertMoment = new Date(prayerMoment.getTime() - (5 * 60 * 1000));
                    if (preAlertMoment.getTime() > now.getTime() + 1000) {
                        const preNotifId = p.idBase + 1000 + (dayOffset * 10);
                        notificationsToSchedule.push({
                            id: preNotifId,
                            title: `⏳ اقتربت ${p.name}`,
                            body: `بقي 5 دقائق على دخول وقت ${p.name}. تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿`,
                            schedule: {
                                at: preAlertMoment,
                                allowWhileIdle: true
                            },
                            channelId: "prayer_pre_alert",
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
            }

            // 1. استخدام بلجن الأذان الأصلي لنظام أندرويد (AdhanNative) لتشغيل الأذان الحقيقي في الخلفية والمغلق والتحكم عبر زر القفل
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
                try {
                    const nativeRes = await window.Capacitor.Plugins.AdhanNative.schedulePrayerAlarms({
                        timings: prayersTimings,
                        muazzin: selectedMuazzin,
                        preAlert: true
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
        } catch(e) {
            console.warn("Error stopping native adhan:", e);
        }
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
