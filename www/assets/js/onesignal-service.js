/**
 * onesignal-service.js
 * خدمة استقبال الإشعارات السحابية الفورية للأجهزة المغلقة والشاشة مقفلة
 * استقبال إشعارات الموبايل عبر APNs وFCM بحسب التسجيل والأذونات والاتصال.
 */

const OneSignalService = {
    initialized: false,

    async init() {
        if (this.initialized) return this.refreshStatus();
        if (this.pending) return this.pending;
        this.pending = this.initializeDevice().finally(() => { this.pending = null; });
        return this.pending;
    },

    async initializeDevice() {
        if (this.initialized) return;

        try {
            // التحقق مما إذا كان التطبيق يعمل داخل بيئة الموبايل الأصلية المزودة بـ OneSignal
            if (typeof window === "undefined" || !window.plugins || !window.plugins.OneSignal) {
                if (typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.()) this.renderStatus("خدمة رسائل الإدارة غير متاحة في هذه النسخة. حدّث التطبيق ثم أعد التحقق.");
                return;
            }

            // جلب App ID من التخزين المحلي أو من قاعدة بيانات فايربيز تلقائياً
            let appId = localStorage.getItem("zad_onesignal_app_id");

            if (window.FIREBASE_CONFIG?.databaseURL && typeof fetch === 'function') {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);
                try {
                    const response = await fetch(window.FIREBASE_CONFIG.databaseURL.replace(/\/$/,'') + '/public_config/onesignal_app_id.json', {signal:controller.signal});
                    const configured = response.ok ? await response.json() : null;
                    if (typeof configured === 'string' && /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(configured)) {
                        appId=configured;localStorage.setItem('zad_onesignal_app_id',appId);
                    }
                } catch {} finally { clearTimeout(timeout); }
            }

            if (!appId || appId === "00000000-0000-0000-0000-000000000000") {
                console.log("ℹ️ OneSignal: App ID not configured yet in admin panel");
                this.renderStatus('إعداد استقبال رسائل الإدارة غير متاح. اتصل بالإنترنت وأعد المحاولة.');
                return;
            }

            const OneSignal = window.plugins.OneSignal;
            OneSignal.initialize(appId);

            // طلب الصلاحية للإشعارات في نظامي iOS و Android
            if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === "function") {
                OneSignal.Notifications.requestPermission(true).then((accepted) => {
                    this.refreshStatus();
                    console.log("✅ OneSignal Notification Permission status:", accepted);
                }).catch(() => this.renderStatus("تعذّر طلب إذن الإشعارات. أعد المحاولة."));
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

            OneSignal.User?.pushSubscription?.addEventListener?.('change', () => this.refreshStatus());
            OneSignal.Notifications?.addEventListener?.('permissionChange', () => this.refreshStatus());
            this.initialized = true;
            await this.refreshStatus();
            console.log("✅ OneSignal Push Service initialized successfully on device");

        } catch (e) {
            console.warn("OneSignal initialization notice:", e);
        }
    },

    renderStatus(message, id = '') {
        if (typeof document === 'undefined' || !document.body?.hasAttribute('data-settings-page')) return;
        let panel=document.getElementById('zad-admin-push-status');
        if(!panel){
            panel=document.createElement('div');panel.id='zad-admin-push-status';panel.className='settings-delivery-status';
            panel.innerHTML='<strong>رسائل الإدارة خارج التطبيق</strong><p role="status"></p><label>معرّف الجهاز للتجربة<input readonly aria-label="معرّف الجهاز لتجربة إشعار الإدارة" style="width:100%;direction:ltr"></label><button type="button" class="btn outline">إعادة التحقق</button>';
            document.getElementById('notifications-section')?.append(panel);
            panel.querySelector('button').onclick=()=>this.init();
        }
        panel.querySelector('p').textContent=message;panel.querySelector('input').value=id;
        panel.querySelector('label').hidden=!id;
    },

    async refreshStatus() {
        try {
            const subscription=window.plugins?.OneSignal?.User?.pushSubscription;
            if(!subscription) return;
            const [id,token,optedIn]=await Promise.all([subscription.getIdAsync(),subscription.getTokenAsync(),subscription.getOptedInAsync()]);
            this.renderStatus(id && token && optedIn ? 'الجهاز مسجّل لاستقبال رسائل الإدارة. تأكيد الوصول يحتاج تجربة إرسال والتطبيق مقفول.' : 'اشتراك رسائل الإدارة غير جاهز. راجع إذن الإشعارات والاتصال؛ ظهور الرسالة داخل التطبيق لا يؤكد استقبالها في الخلفية.',id || '');
        } catch { this.renderStatus('تعذّر التحقق من اشتراك رسائل الإدارة. أعد المحاولة.'); }
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

// Retry when the native bridge or network becomes available; do not depend on one timer.
if (typeof document !== 'undefined') {
    const start=()=>OneSignalService.init();
    document.addEventListener('deviceready',start);
    window.addEventListener?.('online',start);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)start();});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
    else start();
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = OneSignalService;
}
