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
                        const snap = await db.ref("public_config/onesignal_app_id").once("value");
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
                            OneSignalService.handleNotificationUrl(data.url);
                        }
                    } catch (clickErr) {
                        console.warn("OneSignal click handler warning:", clickErr);
                    }
                });
            }

            this.initialized = true;
            console.log("✅ OneSignal Push Service initialized successfully on device");

        } catch (e) {
            console.warn("OneSignal initialization notice:", e);
        }
    },

    // معالجة رابط الإشعار بدقة ومنع أي أخطاء في العناوين أو الهروب خارج التطبيق
    handleNotificationUrl(rawUrl) {
        if (!rawUrl || rawUrl === './' || rawUrl === '/') {
            return;
        }
        try {
            let targetPath = '';
            let targetSearch = '';
            let targetHash = '';

            if (/^https?:\/\//i.test(rawUrl)) {
                try {
                    const u = new URL(rawUrl);
                    targetPath = u.pathname.replace(/^\/+/, '');
                    targetSearch = u.search || '';
                    targetHash = u.hash || '';
                } catch {
                    targetPath = '';
                }
            } else {
                const hashIndex = rawUrl.indexOf('#');
                let pathPart = hashIndex !== -1 ? rawUrl.slice(0, hashIndex) : rawUrl;
                targetHash = hashIndex !== -1 ? rawUrl.slice(hashIndex) : '';
                const queryIndex = pathPart.indexOf('?');
                if (queryIndex !== -1) {
                    targetSearch = pathPart.slice(queryIndex);
                    pathPart = pathPart.slice(0, queryIndex);
                }
                targetPath = pathPart.replace(/^\.?\/+/, '');
            }

            let targetFile = targetPath.split('/').pop() || '';
            const cleanHash = targetHash.split('?')[0];

            // قائمة الأقسام والخدمات التابعة لصفحة services.html
            const servicesSections = [
                '#prayer-times', '#prayer-guide-section', '#nearby-mosques-section',
                '#mood-compass-section', '#zakat-calculator-section', '#seasons',
                '#quran-khatma', '#subpart-mushaf', '#khatma', '#wall-of-duas',
                '#prayers', '#spiritual-garden', '#categorized-duas', '#daily-wird',
                '#asmaa-allah', '#islamic-stories', '#islamic-quiz', '#islamic-guide', '#cemetery-guide'
            ];

            // إذا كان القسم موجوداً في صفحة الخدمات، نوجهه إلى services.html حصراً
            if (servicesSections.includes(cleanHash)) {
                if (!targetFile || targetFile === 'index.html') {
                    targetFile = 'services.html';
                }
            } else if (!targetFile) {
                targetFile = 'index.html';
            }

            const currentFile = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
            const destinationFile = targetFile.toLowerCase();

            if (currentFile === destinationFile) {
                if (targetHash) {
                    if (destinationFile === 'services.html' && typeof window.openServiceView === 'function') {
                        window.openServiceView(targetHash, true);
                    } else {
                        window.location.hash = targetHash;
                    }
                }
            } else {
                window.location.href = targetFile + targetSearch + targetHash;
            }
        } catch (err) {
            console.warn('OneSignal navigation handler warning:', err);
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

if (typeof module !== "undefined" && module.exports) {
    module.exports = OneSignalService;
}
