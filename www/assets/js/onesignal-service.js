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
        if (typeof rawUrl !== 'string') return;
        try {
            const base='https://zadmuslim-zeta.vercel.app/';
            const target=new URL(rawUrl || './',base);
            if (!['https:','http:'].includes(target.protocol) || target.username || target.password) return;
            if (![new URL(base).origin,window.location.origin].includes(target.origin)) return;
            let file=target.pathname.replace(/^\//,'') || 'index.html';
            if (!['index.html','services.html','settings.html','privacy.html','app.html'].includes(file)) return;
            let hash=target.hash;
            const id=hash.slice(1).split('?')[0];
            const services=['prayer-times','prayer-guide-section','nearby-mosques-section','mood-compass-section','zakat-calculator-section','seasons','quran-khatma','wall-of-duas','prayers','spiritual-garden','categorized-duas','daily-wird','asmaa-allah','islamic-stories','islamic-quiz','islamic-guide','cemetery-guide','azkar','islamic-media'];
            if (['subpart-mushaf','khatma'].includes(id)) { file='services.html';hash='#quran-khatma?tab='+(id==='khatma'?'khatma':'mushaf'); }
            else if (services.includes(id)) file='services.html';
            else if(file==='app.html') file='index.html';
            const current=window.location.pathname.split('/').pop() || 'index.html';
            if(current===file && file==='services.html' && hash && typeof window.openServiceView==='function') window.openServiceView(hash,true);
            else (window.zadNavigate || window.location.assign.bind(window.location))(file+target.search+hash);
        } catch(err) { console.warn('OneSignal navigation handler warning:',err); }
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
