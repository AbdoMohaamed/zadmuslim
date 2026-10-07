/**
 * native-adhan-service.js
 * نظام جدولة الأذان والمنبهات الأصلية لتطبيقات الموبايل (Capacitor Android & iOS)
 * يتيح خروج إشعار الصلاة وصوت الأذان كاملاً تلقائياً حتى والتطبيق مغلق تماماً والشاشة مقفلة
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
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications || this.channelsCreated) return;

            const channels = [
                { id: "adhan_makkah", name: "أذان الحرم المكي", sound: "adhan_makkah" },
                { id: "adhan_madinah", name: "أذان المسجد النبوي", sound: "adhan_madinah" },
                { id: "adhan_aqsa", name: "أذان المسجد الأقصى", sound: "adhan_aqsa" },
                { id: "adhan_abdulbasit", name: "أذان الشيخ عبد الباسط", sound: "adhan_abdulbasit" },
                { id: "adhan_refaat", name: "أذان الشيخ محمد رفعت", sound: "adhan_refaat" },
                { id: "adhan_qatami", name: "أذان الشيخ ناصر القطامي", sound: "adhan_qatami" },
                { id: "adhan_fajr", name: "أذان الفجر المخصوص", sound: "adhan_fajr" }
            ];

            for (const ch of channels) {
                try {
                    await LocalNotifications.createChannel({
                        id: ch.id,
                        name: ch.name,
                        description: `قناة تشغيل الأذان بصوت ${ch.name}`,
                        sound: ch.sound,
                        importance: 5, // MAX importance (Heads-up notification + Full Sound)
                        visibility: 1, // Secret / Public on lockscreen
                        vibration: true,
                        lights: true,
                        lightColor: "#d4af37"
                    });
                } catch (chErr) {
                    // القناة قد تكون موجودة بالفعل
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
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications) return;

            // عند النقر على إشعار الأذان من شاشة القفل
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
     * جدولة مواقيت الصلوات الخمس في نظام تشغيل الهاتف الأصلي (AlarmManager / iOS Notifications)
     */
    async schedulePrayers(prayersTimings) {
        if (!this.isNative || !prayersTimings) return;

        try {
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications) return;

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

            // جدولة لليوم وللأيام الثلاثة القادمة لضمان استمرار الأذان دون فتح التطبيق
            for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
                const targetDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);

                for (const p of prayersList) {
                    if (!p.time) continue;
                    const clean = p.time.split(" ")[0];
                    const [h, m] = clean.split(":").map(Number);

                    const prayerMoment = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), h, m, 0);

                    // إذا كان موعد الصلاة في المستقبل
                    if (prayerMoment.getTime() > now.getTime() + 1000) {
                        const notifId = p.idBase + (dayOffset * 10);
                        const isFajr = p.key === "fajr";
                        const channelId = isFajr ? "adhan_fajr" : `adhan_${selectedMuazzin}`;
                        const soundName = isFajr ? "adhan_fajr.mp3" : `adhan_${selectedMuazzin}.mp3`;

                        notificationsToSchedule.push({
                            id: notifId,
                            title: `🕌 حَانَ الآنَ مَوْعِدُ ${p.name}`,
                            body: `الله أكبر، الله أكبر.. حان الآن موعد ${p.name} حسب توقيتك المحلي. حيّ على الصلاة، حيّ على الفلاح 🌿`,
                            schedule: {
                                at: prayerMoment,
                                allowWhileIdle: true // يعمل حتى في وضع توفير الطاقة وقفل الشاشة (Doze Mode)
                            },
                            sound: soundName,
                            channelId: channelId,
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            actionTypeId: "OPEN_PRAYER",
                            extra: {
                                prayerKey: p.key,
                                prayerName: p.name,
                                muazzin: selectedMuazzin
                            }
                        });
                    }
                }
            }

            if (notificationsToSchedule.length > 0) {
                // إلغاء الجدولة القديمة أولاً
                try {
                    const pending = await LocalNotifications.getPending();
                    if (pending && pending.notifications && pending.notifications.length > 0) {
                        await LocalNotifications.cancel({ notifications: pending.notifications });
                    }
                } catch(cancelErr) {}

                // جدولة الإشعارات الجديدة في نظام التشغيل
                await LocalNotifications.schedule({ notifications: notificationsToSchedule });
                console.log(`✅ Native Adhan Service: Scheduled ${notificationsToSchedule.length} upcoming prayer alarms directly into OS.`);
            }
        } catch (e) {
            console.warn("Failed to schedule native prayer alarms:", e);
        }
    }
};

// التهيئة التلقائية عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    NativeAdhanService.init();
});
