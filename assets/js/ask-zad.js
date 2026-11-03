/**
 * اسأل زاد (Ask Zad) - تحكم المساعد الإسلامي الذكي
 * تشغيل فوري ومرن على كافة الصفحات بدون أي تعارض (Zero Exceptions)
 */
(function(root) {
    'use strict';

    const STORAGE_KEY = 'zad_ask_zad_history';
    const MAX_HISTORY = 25;

    // حالة المحادثة
    let isInitialized = false;
    let isOpen = false;
    let previousFocus = null;
    let generation = 0;
    const pendingReplies = new Set();
    const activeAIRequests = new Set();
    const AI_TIMEOUT_MS = 12000;

    // استرجاع التاريخ من التخزين المحلي
    function loadHistory() {
        try {
            if (typeof localStorage === 'undefined') return [];
            const raw = localStorage.getItem(STORAGE_KEY);
            const data=raw?JSON.parse(raw):[]; return Array.isArray(data)?data.filter(m=>m && typeof m.text==='string' && ['user','bot'].includes(m.sender)).slice(-MAX_HISTORY):[];
        } catch (e) {
            return [];
        }
    }

    // حفظ التاريخ
    function saveHistory(messages) {
        try {
            if (typeof localStorage === 'undefined') return;
            const slice = messages.slice(-MAX_HISTORY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
        } catch (e) {}
    }

    // تنسيق الوقت
    function formatTime(timestamp) {
        try {
            const date = timestamp ? new Date(timestamp) : new Date();
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'م' : 'ص';
            hours = hours % 12 || 12;
            return `${hours}:${minutes} ${ampm}`;
        } catch (e) {
            return '';
        }
    }

    // تحويل التنسيق البسيط (Markdown-like bold & newlines) إلى HTML آمن
    function formatMessageText(text) {
        if (!text) return '';
        // تنظيف مدخلات المستخدم ومنع XSS
        const escapeHtml = (str) => {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        const safe = escapeHtml(text);
        // دعم التنسيق العريض والأسطر
        return safe
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    const action = (label, href) => ({label, href});
    const settingsAction = action('فتح إعدادات التنبيهات', 'settings.html#notifications-section');
    const normalize = text => window.AskZadKnowledge?.normalizeArabic(text) || text.trim();
    const reply = (answer, actions = []) => ({found:true,data:{answer,actions}});
    const bounded = promise => new Promise(resolve => {
        const timer = setTimeout(() => resolve(null), 3000);
        Promise.resolve(promise).then(value => {clearTimeout(timer);resolve(value);}, () => {clearTimeout(timer);resolve(null);});
    });

    async function notificationReply() {
        const plugins = window.Capacitor?.Plugins;
        const platform = window.Capacitor?.getPlatform?.();
        const lines = ['الأذان والتنبيه قبل الصلاة، والأذكار والصلاة على النبي، ورسائل الإدارة خدمات منفصلة.'];
        if (platform === 'android') {
            const [permission, schedule] = await Promise.all([
                bounded(Promise.resolve().then(() => plugins?.AdhanNative?.checkAlarmPermissions())),
                bounded(Promise.resolve().then(() => plugins?.AdhanNative?.getPrayerScheduleStatus()))
            ]);
            lines.push(permission ? 'إذن الإشعارات: ' + (permission.notificationsGranted ? 'مسموح.' : 'غير مفعّل؛ راجعه في الإعدادات.') : 'تعذّر قراءة إذن الإشعارات.');
            if (permission?.exactAlarmsGranted === false) lines.push('إذن المنبّهات الدقيقة يحتاج تفعيلًا للأذان.');
            if (permission?.fullScreenIntentGranted === false) lines.push('إذن شاشة الأذان الكاملة غير مفعّل.');
            if (permission?.batteryOptimizationsIgnored === false) lines.push('راجع قيود البطارية إذا تأخر التنبيه.');
            lines.push(schedule?.count > 0 && schedule.until > Date.now() ? 'مواعيد الأذان محفوظة حتى ' + new Date(schedule.until).toLocaleString('ar-EG') + '.' : 'لم أتمكن من تأكيد وجود مواعيد أذان قادمة.');
        } else if (platform === 'ios') {
            const [permission,pending] = await Promise.all([
                bounded(Promise.resolve().then(() => plugins?.LocalNotifications?.checkPermissions())),
                bounded(Promise.resolve().then(() => plugins?.LocalNotifications?.getPending()))
            ]);
            lines.push(permission ? 'إذن الإشعارات: ' + (permission.display === 'granted' ? 'مسموح.' : 'غير مفعّل.') : 'تعذّر قراءة الإذن.');
            const count = pending?.notifications?.filter(n => n.id > 0 && n.id < 70000 && new Date(n.schedule?.at).getTime() > Date.now()).length;
            lines.push(count ? 'يوجد ' + count + ' تنبيه صلاة قادم محفوظ في الهاتف.' : 'لم أتمكن من تأكيد جدولة الأذان.');
            lines.push('آيفون يستخدم صوت إشعار قصير؛ تشغيل الأذان كاملًا في الخلفية ليس مضمونًا.');
        } else lines.push('في المتصفح: إذن الإشعارات ' + (window.Notification?.permission === 'granted' ? 'مسموح' : 'غير مفعّل أو غير متاح') + '؛ إغلاق المتصفح لا يضمن تشغيل الأذان.');
        const subscription = window.plugins?.OneSignal?.User?.pushSubscription;
        if (subscription) {
            const status = await bounded(Promise.all([subscription.getIdAsync(),subscription.getTokenAsync(),subscription.getOptedInAsync()]));
            lines.push(status?.every(Boolean) ? 'رسائل الإدارة: الجهاز مسجّل للاستقبال.' : 'رسائل الإدارة: الاشتراك غير جاهز أو تعذّر التحقق منه.');
        } else lines.push('رسائل الإدارة: لا يمكن تأكيد اشتراك الهاتف من هذه الجلسة.');
        lines.push('حفظ الجدولة أو منح الإذن لا يؤكد وصول التنبيه. جرّب اختبار الخلفية من الإعدادات واقفل الشاشة. لم أغيّر أي إعداد.');
        return reply(lines.join('\n'), [settingsAction]);
    }

    function prayerReply(query) {
        const links = [action('عرض وتحديث المواقيت','services.html#prayer-times')];
        let timings = null;
        try {
            const today = new Date().toLocaleDateString('en-CA');
            const verified = JSON.parse(localStorage.getItem('zad_prayer_verified') || 'null');
            if (verified?.offset === new Date().getTimezoneOffset() && verified?.zone === Intl.DateTimeFormat().resolvedOptions().timeZone && window.zadPrayerVerified && verified?.date === today && verified.city === localStorage.getItem('selected_prayer_city') && verified.method === (localStorage.getItem('zad_prayer_method') || '') && verified.school === (localStorage.getItem('zad_prayer_school') || '0')) timings = window.prayerTimings;
            const saved = JSON.parse(localStorage.getItem('zad_home_prayer_snapshot') || 'null');
            const signature = JSON.stringify([localStorage.getItem('selected_prayer_city'),localStorage.getItem('zad_prayer_method') || '',localStorage.getItem('zad_prayer_school') || '0',localStorage.getItem('gps_prayer_coords'),Intl.DateTimeFormat().resolvedOptions().timeZone,new Date().getTimezoneOffset()]);
            if (!timings && saved?.date === today && saved.signature === signature) timings = saved.timings;
        } catch (_) {}
        const prayers = [['الفجر','Fajr'],['الظهر','Dhuhr'],['العصر','Asr'],['المغرب','Maghrib'],['العشاء','Isha']];
        if (!timings || !prayers.every(([,key]) => /^(?:[01]\d|2[0-3]):[0-5]\d/.test(timings[key] || ''))) return reply('محتاج مواقيت مؤكدة لليوم ومدينتك عشان أقول لك الوقت بدقة. افتح المواقيت وحدّثها.',links);
        const now = new Date();
        const list = prayers.map(([name,key]) => {const [h,m] = timings[key].split(' ')[0].split(':').map(Number);return {name,date:new Date(now.getFullYear(),now.getMonth(),now.getDate(),h,m)};});
        const named = list.find(p => query.includes(normalize(p.name)));
        const next = named || list.find(p => p.date > now);
        if (!next) return reply('مواقيت اليوم انتهت. افتح المواقيت لتحديث موعد فجر الغد.',links);
        const mins = Math.ceil((next.date-now)/60000);
        const remaining = mins > 0 ? 'متبقي ' + Math.floor(mins/60) + ' ساعة و' + mins%60 + ' دقيقة.' : 'هذا موعد اليوم وقد دخل وقته؛ حدّث المواقيت لمعرفة الموعد القادم.';
        return reply(next.name + ': ' + next.date.toLocaleTimeString('ar-EG',{hour:'numeric',minute:'2-digit'}) + ' حسب المدينة المختارة.\n' + remaining,links);
    }

    async function contextualReply(raw) {
        let query = normalize(raw), greeting = '';
        const hello = /^(السلام عليكم(?: ورحمه الله(?: وبركاته)?)?|اهلا(?: وسهلا)?|مرحبا|هاي|صباح الخير|مساء الخير|ازيك|عامل ايه)(?:\s|$)/;
        const match = query.match(hello);
        if (match) { greeting = match[1].startsWith('السلام') ? 'وعليكم السلام ورحمة الله وبركاته 🌿' : match[1] === 'صباح الخير' ? 'صباح النور 🌿' : match[1] === 'مساء الخير' ? 'مساء النور 🌿' : 'أهلًا بيك 🌿';query = query.slice(match[0].length).replace(/^(يا (باشا|زاد|غالي)\s*)/, '').trim(); }
        if (!query) return reply(greeting + ' أقدر أساعدك في إيه؟');
        if (/^(شكرا|متشكر|تسلم|جزاك الله خيرا?|جزاكم الله خيرا?)( يا (باشا|غالي))?$/.test(query)) return reply('وإياك، أهلًا بيك دايمًا 🌿');
        const developer = root.ZadAppDeveloper?.answer(query);
        let result = developer ? reply(developer.answer, developer.actions) : null;
        if (result) { /* Approved attribution takes precedence over generated guesses. */ }
        else if (/(اشعار|اشعارات|تنبيه|تنبيهات|منبه|منبهات)/.test(query) && !/(الغ|ايقاف|اقفل|اطفي|تفعيل|تغيير)/.test(query)) result = await notificationReply();
        else if (/(المؤذن|الموذن|مؤذن|موذن|صوت الاذان)/.test(query)) result = reply('تقدر تختار المؤذن وتسمع عينة من إعدادات الأذان. لم أغيّر اختيارك.',[settingsAction]);
        else if (/(الغ|ايقاف|اطفي|اقفل|وقف|تفعيل|شغل)/.test(query) && /(اذان|اشعار|تنبيه)/.test(query)) result = reply('تقدر تعدّل اختيارك من إعدادات التنبيهات. لم أغيّر أي إعداد.',[settingsAction]);
        else if (/(القادمه|فاضل|باقي|متبقي|الساعه كام|ميعاد|موعد|امتي)/.test(query) && /(صلاه|فجر|ظهر|عصر|مغرب|عشاء|اذان)/.test(query)) result = prayerReply(query);
        else {
            const routes = [
                [/مصحف/,'المصحف','quran-khatma?tab=mushaf'],[/سبحه|تسبيح/,'السبحة','smart-dhikr-panel'],
                [/اذكار الصباح/,'أذكار الصباح','azkar?tab=morning'],[/اذكار المساء/,'أذكار المساء','azkar?tab=evening'],
                [/^الاذكار$|افتح الاذكار/,'الأذكار','azkar'],[/راديو|اذاعه/,'إذاعات القرآن','radio-panel']
            ];
            const route = routes.find(([pattern]) => pattern.test(query));
            if(route) result = reply('اضغط الزر لفتح ' + route[1] + '.',[action('فتح ' + route[1],'services.html#'+route[2])]);
        }
        if (!result && /(طلقت|مراتي|زوجتي|حلفت|فتوي شخصيه|افتي)/.test(query)) result = reply('المسألة دي محتاجة معرفة التفاصيل من جهة علمية موثوقة. أقدر أساعدك توصل لخدمات التطبيق، لكن مش هقدّم فتوى شخصية.');
        result ||= window.AskZadKnowledge?.findBestAnswer(query);
        if (greeting && result?.data) result = {...result,data:{...result.data,answer:greeting+'\n'+result.data.answer}};
        else if (greeting && result) result = {...result,fallbackMessage:greeting+'\n'+result.fallbackMessage};
        return result;
    }

    function refreshSuggestions() {
        const container = document.getElementById('ask-zad-chips');
        if (!container) return;
        let suggested = 'الأذكار';
        try { const t = window.readHomePrayerTimings?.(); const slot = t && window.getHomeReminderSlot?.(new Date(),t); if(slot === 'morning_azkar') suggested='أذكار الصباح'; if(slot === 'evening_azkar') suggested='أذكار المساء'; } catch (_) {}
        container.replaceChildren();
        for (const text of ['الصلاة القادمة',suggested,'افتح المصحف','الإشعارات مش بتوصل']) {
            const button = document.createElement('button');button.type='button';button.className='ask-zad-chip';button.dataset.prompt=text;button.textContent=text;container.append(button);
        }
    }

    // تهيئة واجهة المستخدم وحقنها في الـ DOM
    function initUI() {
        if (typeof document === 'undefined' || isInitialized) return;
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', initUI);
            return;
        }

        isInitialized = true;
        // Retire credentials left by older client-side integrations.
        try { localStorage.removeItem('zad_gemini_api_key'); } catch (_) {}

        // 1. حقن زر الإطلاق العائم إذا لم يكن موجوداً
        if (!document.getElementById('btn-ask-zad-fab')) {
            const fab = document.createElement('button');
            fab.id = 'btn-ask-zad-fab';
            fab.className = 'ask-zad-fab';
            fab.setAttribute('type', 'button');
            fab.setAttribute('aria-label', 'اسأل زاد - المساعد الإسلامي الذكي');
            fab.setAttribute('title', 'اسأل زاد - المساعد الإسلامي الذكي');
            fab.innerHTML = `
                <span class="ask-zad-fab-icon">
                    <i class="fa-solid fa-headset"></i>
                </span>
                <span class="ask-zad-fab-sparkle"></span>
            `;
            fab.addEventListener('click', () => openChat());
            document.body.appendChild(fab);
        }

        // 2. حقن نافذة المحادثة (Modal) إذا لم تكن موجودة
        if (!document.getElementById('ask-zad-modal')) {
            const overlay = document.createElement('div');
            overlay.id = 'ask-zad-modal';
            overlay.className = 'ask-zad-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-hidden', 'true');
            overlay.innerHTML = `
                <div class="ask-zad-container">
                    <div class="ask-zad-drag-bar" aria-hidden="true"><span class="ask-zad-drag-handle"></span></div>
                    <header class="ask-zad-header">
                        <div class="ask-zad-header-brand">
                            <div class="ask-zad-avatar">
                                <i class="fa-solid fa-headset"></i>
                                <span class="ask-zad-online-dot" title="متاح دائماً"></span>
                            </div>
                            <div class="ask-zad-header-text">
                                <h3>اسأل زاد <span class="ask-zad-badge">الذكي</span></h3>
                                <p>رفيقك في القرآن والأذكار وأحكام العبادات</p>
                            </div>
                        </div>
                        <div class="ask-zad-header-actions">
                            <button type="button" class="ask-zad-header-btn" id="btn-ask-zad-clear" title="مسح المحادثة" aria-label="مسح المحادثة">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                            <button type="button" class="ask-zad-header-btn" id="btn-ask-zad-close" title="إغلاق النافذة" aria-label="إغلاق">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </header>

                    <div class="ask-zad-body" id="ask-zad-messages">
                        <!-- ترحيب واقتراحات افتراضية -->
                        <div class="ask-zad-welcome-card" id="ask-zad-welcome">
                            <div class="ask-zad-welcome-title">أهلاً بك في "اسأل زاد" 🌿</div>
                            <p class="ask-zad-welcome-desc">
                                أساعدك تفتح الخدمات وتعرف مواقيت الصلاة وتراجع التنبيهات. الإجابات من معلومات التطبيق، وقد أستعين بـ Google Gemini للأسئلة الأخرى.
                            </p>
                            <div class="ask-zad-chips-container" id="ask-zad-chips">
                                <button type="button" class="ask-zad-chip" data-prompt="كيف أصلي صلاة الجنازة؟">
                                    <i class="fa-solid fa-mosque"></i> صلاة الجنازة بالتفصيل
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="أحكام سجود السهو قبل أم بعد السلام؟">
                                    <i class="fa-solid fa-scale-balanced"></i> سجود السهو
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="آيات وتفسير عن الصبر وفضله">
                                    <i class="fa-solid fa-book-quran"></i> آيات الصبر وتفسيرها
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="دعاء تفريج الهم والكرب">
                                    <i class="fa-solid fa-hands-praying"></i> دعاء تفريج الكرب
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="كيف أحسب زكاة مالي؟">
                                    <i class="fa-solid fa-coins"></i> حساب زكاة المال والذهب
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="أذكار النوم الصحيحة">
                                    <i class="fa-solid fa-moon"></i> أذكار النوم
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="تشغيل إذاعة القرآن الكريم">
                                    <i class="fa-solid fa-radio"></i> إذاعة القرآن
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="كيف أتوضأ وضوء صحيح؟">
                                    <i class="fa-solid fa-faucet-drip"></i> صفة الوضوء ونواقضه
                                </button>
                            </div>
                        </div>
                    </div>

                    <footer class="ask-zad-footer">
                        <form class="ask-zad-input-form" id="ask-zad-form">
                            <input type="text" class="ask-zad-input" id="ask-zad-input" maxlength="1000" aria-label="رسالتك إلى اسأل زاد" placeholder="اكتب سؤالك أو الخدمة اللي محتاجها…" autocomplete="off">
                            <button type="submit" class="ask-zad-send-btn" id="btn-ask-zad-send" aria-label="إرسال">
                                <i class="fa-solid fa-paper-plane"></i>
                            </button>
                        </form>
                        <p class="ask-zad-disclaimer">
                            قد يُرسل السؤال إلى Google Gemini عند غياب إجابة محلية. للفتاوى الشخصية ارجع إلى جهة علمية موثوقة.
                        </p>
                    </footer>
                </div>
            `;
            document.body.appendChild(overlay);

            // مستمعات الأحداث
            setupEventListeners(overlay);

            // تحميل الرسائل السابقة
            renderHistory();
            refreshSuggestions();
        }
    }

    // إعداد مستمعات الأحداث
    function setupEventListeners(overlay) {
        const closeBtn = overlay.querySelector('#btn-ask-zad-close');
        if (closeBtn) closeBtn.addEventListener('click', closeChat);

        const clearBtn = overlay.querySelector('#btn-ask-zad-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (typeof confirm === 'function' && !confirm('هل تريد مسح سجل المحادثة؟')) return;
                clearChat();
            });
        }

        // منع انتشار النقرات داخل حاوية المحادثة حتى لا يُغلق الشات بالخطأ أثناء الكتابة أو القراءة
        const container = overlay.querySelector('.ask-zad-container');
        if (container) {
            container.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // إغلاق عند النقر في أي مكان خارج نافذة المحادثة
        overlay.addEventListener('click', (e) => {
            if (!e.target.closest('.ask-zad-container')) {
                closeChat();
            }
        });

        // إغلاق فوري عند اللمس خارج الحاوية على الهواتف الذكية (iOS & Android)
        overlay.addEventListener('touchend', (e) => {
            if (!e.target.closest('.ask-zad-container')) {
                e.preventDefault();
                closeChat();
            }
        }, { passive: false });

        // إعداد التفاعل مع شريط السحب والرأس (Tap & Swipe Down to Dismiss)
        let touchStartY = 0;
        let isDraggingSheet = false;
        let hasMoved = false;

        const dragTargets = [
            overlay.querySelector('.ask-zad-drag-bar'),
            overlay.querySelector('.ask-zad-header')
        ].filter(Boolean);

        dragTargets.forEach((target) => {
            target.addEventListener('touchstart', (e) => {
                // إذا كان اللمس على زر داخل الرأس (كزر الإغلاق أو المسح) لا نبدأ السحب
                if (e.target.closest('button, a')) return;
                if (e.touches && e.touches.length === 1) {
                    touchStartY = e.touches[0].clientY;
                    isDraggingSheet = true;
                    hasMoved = false;
                    if (container) {
                        container.style.transition = 'none'; // إلغاء التأخير الزمني لتتبع حركة الإصبع بدقة 60fps
                    }
                }
            }, { passive: true });

            target.addEventListener('touchmove', (e) => {
                if (!isDraggingSheet || !e.touches || e.touches.length !== 1) return;
                const currentY = e.touches[0].clientY;
                const deltaY = currentY - touchStartY;
                if (deltaY > 5) {
                    hasMoved = true;
                    if (container) {
                        container.style.transform = `translateY(${deltaY}px)`;
                    }
                }
            }, { passive: true });

            target.addEventListener('touchcancel', () => {
                isDraggingSheet = false;
                hasMoved = false;
                if (container) {
                    container.style.transform = '';
                    container.style.transition = '';
                }
            }, { passive: true });

            target.addEventListener('touchend', (e) => {
                if (!isDraggingSheet) return;
                isDraggingSheet = false;
                const currentY = e.changedTouches && e.changedTouches.length ? e.changedTouches[0].clientY : touchStartY;
                const deltaY = currentY - touchStartY;

                if (deltaY > 60) {
                    // سحب كافٍ للإغلاق: انزلاق ناعم للأسفل ثم إغلاق النافذة
                    if (container) {
                        container.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
                        container.style.transform = 'translateY(100%)';
                    }
                    setTimeout(() => {
                        closeChat();
                        if (container) {
                            container.style.transform = '';
                            container.style.transition = '';
                        }
                    }, 200);
                } else {
                    // سحب خفيف دون الحد: ارتداد ناعم للموضع الأصلي
                    if (container) {
                        container.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
                        container.style.transform = '';
                        setTimeout(() => {
                            if (container) container.style.transition = '';
                        }, 230);
                    }
                }
            }, { passive: true });
        });

        // إغلاق عند النقر المباشر على شريط السحب (Tap)
        const dragBar = overlay.querySelector('.ask-zad-drag-bar');
        if (dragBar) {
            dragBar.addEventListener('click', () => {
                if (!hasMoved) {
                    closeChat();
                }
            });
        }

        // منع تسريب التمرير (Scroll Bleed / Chaining) إلى الصفحة الرئيسية خلف المساعد
        overlay.addEventListener('touchmove', (e) => {
            if (!e.target.closest('#ask-zad-messages')) {
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });

        overlay.addEventListener('wheel', (e) => {
            if (!e.target.closest('#ask-zad-messages')) {
                e.preventDefault();
            }
        }, { passive: false });

        // مستمع عام على المستند لإغلاق النافذة إذا تم النقر في أي مساحة خارجية
        document.addEventListener('click', (e) => {
            if (!isOpen) return;
            const fab = document.getElementById('btn-ask-zad-fab');
            if (fab && fab.contains(e.target)) return;
            if (overlay && overlay.classList.contains('is-active') && !e.target.closest('.ask-zad-container')) {
                closeChat();
            }
        });

        // زر الهروب Escape
        const resize = () => {
            if (!window.visualViewport) return;
            overlay.style.height = window.visualViewport.height + 'px';
            overlay.style.top = window.visualViewport.offsetTop + 'px';
        };
        window.visualViewport?.addEventListener('resize',resize);
        window.visualViewport?.addEventListener('scroll',resize);
        resize();
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) closeChat();
            if (e.key === 'Tab' && isOpen) {
                const nodes = [...overlay.querySelectorAll('button,input,a[href]')].filter(el => el.getClientRects().length && !el.disabled);
                const first=nodes[0],last=nodes.at(-1);
                if (e.shiftKey && document.activeElement===first) {e.preventDefault();last?.focus();}
                else if (!e.shiftKey && document.activeElement===last) {e.preventDefault();first?.focus();}
            }
        });

        // إرسال الرسالة
        const form = overlay.querySelector('#ask-zad-form');
        const input = overlay.querySelector('#ask-zad-input');
        if (form && input) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = input.value.trim();
                if (!query) return;
                input.value = '';
                sendMessage(query);
            });
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    const messages = document.getElementById('ask-zad-messages');
                    scrollToBottom(messages);
                }, 280);
            });
        }

        // النقر على الشرائح الافتراضية
        const chipsContainer = overlay.querySelector('#ask-zad-chips');
        if (chipsContainer) {
            chipsContainer.addEventListener('click', (e) => {
                const chip = e.target.closest('.ask-zad-chip');
                if (chip && chip.dataset.prompt) {
                    sendMessage(chip.dataset.prompt);
                }
            });
        }
    }

    let savedScrollY = 0;
    let isScrollLocked = false;

    // قفل تمرير الصفحة الخلفية تماماً لمنع اهتزاز أو تحرك الرئيسية أثناء استخدام المساعد
    function lockBodyScroll() {
        if (isScrollLocked || typeof document === 'undefined' || !document.body) return;
        savedScrollY = window.scrollY || window.pageYOffset || document.documentElement?.scrollTop || 0;
        isScrollLocked = true;
        document.documentElement.classList.add('ask-zad-open');
        document.body.classList.add('ask-zad-open');
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
    }

    // استعادة وضع التمرير الطبيعي وموقع الصفحة السابق بدقة
    function unlockBodyScroll() {
        if (!isScrollLocked || typeof document === 'undefined' || !document.body) return;
        isScrollLocked = false;
        document.documentElement.classList.remove('ask-zad-open');
        document.body.classList.remove('ask-zad-open');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        try {
            if (typeof window !== 'undefined' && typeof window.scrollTo === 'function' && !window.scrollTo.toString().includes('notImplementedMethod')) {
                window.scrollTo(0, savedScrollY);
            }
        } catch (_) {}
    }

    // فتح نافذة الشات
    function openChat(initialQuery) {
        initUI();
        const overlay = document.getElementById('ask-zad-modal');
        if (!overlay) return;
        isOpen = true;
        lockBodyScroll();
        refreshSuggestions();
        previousFocus = document.activeElement;
        overlay.setAttribute('aria-label', 'اسأل زاد');
        overlay.classList.add('is-active');
        overlay.setAttribute('aria-hidden', 'false');

        const input = document.getElementById('ask-zad-input');
        if (input) {
            setTimeout(() => {
                try { if (isOpen) input.focus(); } catch (e) {}
            }, 200);
        }

        if (initialQuery && typeof initialQuery === 'string') {
            sendMessage(initialQuery);
        }
    }

    // إغلاق نافذة الشات
    function closeChat() {
        const overlay = document.getElementById('ask-zad-modal');
        if (!overlay) return;
        isOpen = false;
        unlockBodyScroll();
        previousFocus?.focus?.();
        overlay.classList.remove('is-active');
        overlay.setAttribute('aria-hidden', 'true');
    }

    // مسح المحادثة
    function clearChat() {
        generation++; pendingReplies.forEach(clearTimeout); pendingReplies.clear();
        activeAIRequests.forEach(controller => controller.abort());
        activeAIRequests.clear();
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem('zad_ask_zad_feedback');
            }
        } catch (e) {}
        const messagesContainer = document.getElementById('ask-zad-messages');
        if (messagesContainer) {
            // الإبقاء فقط على بطاقة الترحيب
            const welcome = document.getElementById('ask-zad-welcome');
            messagesContainer.innerHTML = '';
            if (welcome) { welcome.style.display=""; messagesContainer.appendChild(welcome); }
        }
    }

    async function queryGeminiAIFallback(query) {
        const controller = new AbortController();
        let timeout;
        try {
            if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
            const native = window.Capacitor?.isNativePlatform?.();
            const endpoint = native
                ? new URL('/api/ask-zad', window.getPublicAppUrl?.() || 'https://zadmuslim-zeta.vercel.app/').href
                : '/api/ask-zad';
            activeAIRequests.add(controller);
            const aborted = new Promise((_, reject) => {
                controller.signal.addEventListener('abort', () => reject(new Error('AI request cancelled')), { once: true });
            });
            timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
            const request = fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({ query })
            }).then(res => {
                if (res.status === 429) return res.json().then(limit => ({ rateLimited: true, limit }));
                if (!res.ok) throw new Error('AI service unavailable');
                return res.json();
            });
            const data = await Promise.race([request, aborted]);
            if (data?.rateLimited) {
                if (data.limit?.scope === 'provider') return { found: false, reason: 'limit', message: 'حصة خدمة الإجابات الذكية المجانية غير متاحة حاليًا. جرّب لاحقًا؛ وقت الرجوع يعتمد على حدود الخدمة. الإجابات المحلية وخدمات التطبيق ما زالت متاحة، وجرّب سؤالًا عن الوضوء أو الأذكار أو استخدام التطبيق.' };
                const seconds = Number(data.limit?.retryAfterSeconds);
                const minutes = Math.max(1, Math.ceil((Number.isFinite(seconds) && seconds > 0 ? seconds : 60) / 60));
                const duration = minutes >= 60 ? Math.floor(minutes / 60) + ' ساعة و' + minutes % 60 + ' دقيقة' : minutes + ' دقيقة';
                return { found: false, reason: 'limit', message: data.limit?.scope === 'day'
                    ? 'وصلت الإجابات الذكية للحد اليومي. تقدر تسأل تاني بعد حوالي ' + duration + '. بيتجدد الحد يوميًا الساعة ٣ صباحًا بتوقيت السعودية (منتصف الليل UTC). تقدر تستخدم الإجابات المحلية والخدمات دلوقتي.'
                    : 'وصلت للحد المسموح خلال الدقيقة. جرّب بعد حوالي ' + minutes + ' دقيقة، أو استخدم الخيارات التالية.' };
            }
            const text = data?.answer;
            if (typeof text !== 'string' || !text.trim()) return null;

            return {
                found: true,
                data: {
                    id: 'gemini_ai_response',
                    title: 'اسأل زاد الذكي',
                    answer: text.trim(),
                    actions: [
                        { label: '🧭 بوصلة القلوب والسكينة', href: 'services.html#mood-compass-section', type: 'link' },
                        { label: '🤲 أدعية تفريج الهم وحصن المسلم', href: 'services.html#categorized-duas', type: 'link' },
                        { label: '📻 راديو القرآن الكريم', href: 'services.html#radio-panel', type: 'link' }
                    ]
                }
            };
        } catch (_) {
            return null;
        } finally {
            clearTimeout(timeout);
            activeAIRequests.delete(controller);
        }
    }

    // إرسال رسالة المستخدم ومعالجتها
    function sendMessage(query) {
        if (typeof query !== 'string' || !query.trim()) return;
        query = query.trim().slice(0, 1000);
        const messagesContainer = document.getElementById('ask-zad-messages');
        if (!messagesContainer) return;

        // إخفاء بطاقة الترحيب بعد بدء المحادثة
        const welcome = document.getElementById('ask-zad-welcome');
        if (welcome) welcome.style.display = 'none';

        const history = loadHistory();

        // 1. إضافة رسالة المستخدم
        const userMsg = {
            sender: 'user',
            text: query,
            time: Date.now()
        };
        history.push(userMsg);
        saveHistory(history);
        const userRow = appendMessageRow(userMsg, messagesContainer);

        // التمرير لأسفل
        scrollToBottom(messagesContainer);

        // 2. إظهار مؤشر الكتابة
        const typingEl = showTypingIndicator(messagesContainer);
        scrollToBottom(messagesContainer);

        // 3. استدعاء محرك المعرفة
        const currentGeneration=generation;
        const timer=setTimeout(async () => {
            pendingReplies.delete(timer);
            if(currentGeneration!==generation)return;
            let result;
            try { result = await contextualReply(query); } catch (_) { result = reply('تعذّر التحقق الآن. جرّب تاني أو افتح الإعدادات.',[settingsAction]); }
            if (currentGeneration !== generation) return;

            // Unknown questions use the server; credentials never enter the browser.
            if (!result || !result.found) {
                const aiResult = await queryGeminiAIFallback(query);
                if (aiResult && aiResult.found && currentGeneration === generation) {
                    result = aiResult;
                } else if (currentGeneration === generation) {
                    result = { ...result, found: false, fallbackMessage: aiResult?.reason === 'limit' ? aiResult.message : 'تعذّر الاتصال بالمساعد الذكي الآن. جرّب مرة أخرى، أو استخدم الخيارات التالية.' };
                }
            }
            if (currentGeneration !== generation) return;

            if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
            let botMsg;
            if (result && result.found && result.data) {
                botMsg = {
                    sender: 'bot',
                    text: result.data.answer,
                    actions: result.data.actions || [],
                    time: Date.now()
                };
            } else if (result && !result.found) {
                botMsg = {
                    sender: 'bot',
                    text: result.fallbackMessage || 'عذراً، لم أعثر على تطابق مباشر. إليك بعض الخيارات المفيدة:',
                    actions: (result.suggestions || []).map(s => ({ label: s.label, href: s.href, type: 'link' })),
                    time: Date.now()
                };
            } else {
                botMsg = {
                    sender: 'bot',
                    text: 'ممكن توضح تقصد أي خدمة أو سؤال؟ جرّب «افتح المصحف» أو «الصلاة القادمة».',
                    actions: [
                        { label: '📖 المصحف الشريف', href: 'services.html#quran-khatma?tab=mushaf', type: 'link' },
                        { label: '🤲 الأذكار وحصن المسلم', href: 'services.html#azkar', type: 'link' }
                    ],
                    time: Date.now()
                };
            }

            const latestHistory=loadHistory();
            latestHistory.push(botMsg);
            saveHistory(latestHistory);
            botMsg.id = 'reply-' + Date.now() + '-' + Math.random().toString(36).slice(2);
            const row = appendMessageRow(botMsg, messagesContainer);
            userRow.after(row);
            saveHistory([...messagesContainer.querySelectorAll('.ask-zad-msg-row')].map(el => el._message).filter(Boolean));
            scrollToBottom(messagesContainer);
        }, 350);
        pendingReplies.add(timer);
    }

    // إلحاق سطر رسالة في الـ DOM
    function appendMessageRow(msg, container) {
        const row = document.createElement('div');
        row.className = `ask-zad-msg-row ${msg.sender}`;
        row._message = msg;

        const bubble = document.createElement('div');
        bubble.className = 'ask-zad-msg-bubble';

        // محتوى النص
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = formatMessageText(msg.text);
        bubble.appendChild(contentDiv);

        // أزرار الإجراءات التفاعلية (Actions)
        if (msg.actions && Array.isArray(msg.actions) && msg.actions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'ask-zad-msg-actions';
            for (const act of msg.actions) {
                const btn = document.createElement('a');
                btn.className = 'ask-zad-action-btn';
                const external=root.ZadAppDeveloper?.isContact(act.href)===true;
                if (typeof act.href !== 'string' || !external&&!/^(services|settings|index)\.html(?:[?#]|$)/.test(act.href)) continue;
                btn.href = act.href;
                btn.textContent = act.label;
                if(external){btn.target='_blank';btn.rel='noopener noreferrer';actionsDiv.appendChild(btn);continue;}
                btn.addEventListener('click', (e) => {
                    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();closeChat();
                    (window.zadNavigate || window.location.assign.bind(window.location))(act.href);
                });
                actionsDiv.appendChild(btn);
            }
            bubble.appendChild(actionsDiv);
        }

        // وقت الرسالة
        const metaDiv = document.createElement('div');
        metaDiv.className = 'ask-zad-msg-meta';
        metaDiv.innerHTML = `<span>${formatTime(msg.time)}</span>`;

        bubble.appendChild(metaDiv);
        row.appendChild(bubble);
        container.appendChild(row);
        return row;
    }

    // إظهار مؤشر الكتابة
    function showTypingIndicator(container) {
        const row = document.createElement('div');
        row.className = 'ask-zad-msg-row bot';
        row.innerHTML = `
            <div class="ask-zad-msg-bubble" style="padding: 10px 14px;">
                <div class="ask-zad-typing-indicator">
                    <span class="ask-zad-typing-dot"></span>
                    <span class="ask-zad-typing-dot"></span>
                    <span class="ask-zad-typing-dot"></span>
                </div>
            </div>
        `;
        container.appendChild(row);
        return row;
    }

    // التمرير إلى الأسفل
    function scrollToBottom(container) {
        try {
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        } catch (e) {}
    }

    // رسم المحفوظات السابقة
    function renderHistory() {
        const messagesContainer = document.getElementById('ask-zad-messages');
        if (!messagesContainer) return;

        const history = loadHistory();
        if (history.length > 0) {
            const welcome = document.getElementById('ask-zad-welcome');
            if (welcome) welcome.style.display = 'none';

            for (const msg of history) {
                appendMessageRow(msg, messagesContainer);
            }
            scrollToBottom(messagesContainer);
        }
    }

    // تصدير الكائن العام
    const AskZad = {
        init: initUI,
        open: openChat,
        close: closeChat,
        clear: clearChat,
        send: sendMessage,
        answer: contextualReply
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AskZad;
    }
    if (typeof window !== 'undefined') {
        window.AskZad = AskZad;
        // تشغيل آلي فور اكتمال تحميل الصفحة
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initUI);
        } else {
            initUI();
        }
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);
