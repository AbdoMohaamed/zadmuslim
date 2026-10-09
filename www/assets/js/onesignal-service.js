/**
 * onesignal-service.js
 * خدمة استقبال الإشعارات السحابية الفورية للأجهزة المغلقة والشاشة مقفلة
 * تدعم إيقاظ أجهزة iOS (Apple APNs) و Android (Google FCM) في نفس اللحظة
 */

const OneSignalService = {
    initialized: false,

    async init() {
        if (this.initialized) return;

        try {
            // التحقق مما إذا كان التطبيق يعمل داخل بيئة الموبايل الأصلية المزودة بـ OneSignal
            if (typeof window === "undefined" || !window.plugins || !window.plugins.OneSignal) {
                return;
            }

            // جلب App ID من التخزين المحلي أو من قاعدة بيانات فايربيز تلقائياً
            let appId = localStorage.getItem("zad_onesignal_app_id");

            if (!appId && typeof getSafeFirebaseDb === "function") {
                try {
                    const db = getSafeFirebaseDb();
                    if (db) {
                        const snap = await db.ref("admin_settings/onesignal/app_id").once("value");
                        if (snap.exists() && snap.val()) {
                            appId = snap.val().trim();
                            localStorage.setItem("zad_onesignal_app_id", appId);
                        }
                    }
                } catch (dbErr) {
                    console.warn("OneSignal config fetch warning:", dbErr);
                }
            }

            if (!appId || appId === "00000000-0000-0000-0000-000000000000") {
                console.log("ℹ️ OneSignal: App ID not configured yet in admin panel");
                return;
            }

            const OneSignal = window.plugins.OneSignal;
            OneSignal.initialize(appId);

            // طلب الصلاحية للإشعارات في نظامي iOS و Android
            if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === "function") {
                OneSignal.Notifications.requestPermission(true).then((accepted) => {
                    console.log("✅ OneSignal Notification Permission status:", accepted);
                });
            }

            // الاستماع للنقر على الإشعار من شاشة القفل لفتح الرابط المطلوب
            if (OneSignal.Notifications && typeof OneSignal.Notifications.addEventListener === "function") {
                OneSignal.Notifications.addEventListener("click", (event) => {
                    console.log("🕌 OneSignal Notification Clicked:", event);
                    try {
                        const notif = event && event.notification ? event.notification : null;
                        const data = notif ? notif.additionalData : null;
                        if (data && data.url) {
                            window.location.hash = data.url;
                        }
                    } catch (clickErr) {}
                });
            }

            this.initialized = true;
            console.log("✅ OneSignal Push Service initialized successfully on device");

        } catch (e) {
            console.warn("OneSignal initialization notice:", e);
        }
    }
};

// تهيئة الخدمة تلقائياً عند تشغيل التطبيق
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            OneSignalService.init();
        }, 1500);
    });
}
