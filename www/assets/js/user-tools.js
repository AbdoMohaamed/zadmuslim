/* Personal data stays on this device. Backups deliberately exclude credentials,
   GPS coordinates, shared records and cached network responses. */
(function (root) {
    'use strict';
    const EXACT = new Set([
        'zad_services_favorites', 'zad_services_recent', 'zad_services_recent_hidden', 'zad_services_reading', 'zad_services_personal_seen',
        'zad_quran_last_read', 'zad_quran_bookmarks', 'mushaf_last_page', 'mushaf_saved_bookmark',
        'golden_quran_theme', 'zad_smart_khatma_plan', 'zad_user_badges_unlocked',
        'zad_khatma_streak_data', 'zad_7days_challenge_progress', 'zad_quick_tasbeeh_count',
        'tasbeeh_lifetime_total', 'zadmuslim-theme', 'sadqah_theme', 'selected_prayer_city',
        'user_manually_selected_city', 'smart_notify_settings', 'zad_enabled_prayers',
        'zad_prayer_method', 'zad_prayer_school', 'zad_font_size', 'zad_favorites',
        'zadTasks', 'zad_setup_done', 'spiritual_garden_streak', 'wird_streak_history', 'counter', 'total_dhikr_count',
        'zad_selected_muazzin', 'adhan_sound_enabled', 'smart_notify_configured', 'zad_hijri_offset',
        'zad_zakat_currency', 'zad_zakat_nisab_basis', 'zad_sticky_prayer_notification', 'zad_media_bookmarks', 'zad_media_progress'
    ]);
    const allowed = key => EXACT.has(key) || /^(zad_note_p[1-9]\d{0,2}|zad_memorized_[1-9]\d{0,3}|zad_tasbih_(lifetime_count|today_count|today_date|sound_enabled|haptic_enabled)|azkar_progress_[\w -]+|zad_daily_tasks_[\w-]+|daily_wird_[\w-]+|spiritual_garden_[\w-]+|zad_quran_pages_read_[\w-]+)$/.test(key);
    function makeBackup(storage) {
        const data = {};
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (allowed(key)) data[key] = storage.getItem(key);
        }
        return { app: 'zad-muslim', version: 1, createdAt: new Date().toISOString(), data };
    }
    function validateBackup(value) {
        if (!value || value.app !== 'zad-muslim' || value.version !== 1 ||
            !value.data || Array.isArray(value.data) || typeof value.data !== 'object') throw Error('ملف النسخة الاحتياطية غير صالح.');
        const entries = Object.entries(value.data);
        if (entries.length > 12000 || JSON.stringify(value).length > 5 * 1024 * 1024) throw Error('حجم النسخة أكبر من الحد المسموح.');
        for (const [key, val] of entries) {
            if (!allowed(key) || typeof val !== 'string' || val.length > 200000) throw Error('الملف يحتوي على بيانات غير مسموح بها.');
            if (/bookmarks|progress|plan|badges|streak_data|streak_history|last_read|settings|enabled_prayers|favorites|daily_tasks|daily_wird|zadTasks/.test(key)) {
                try {
                    const parsed = JSON.parse(val); if (!parsed || typeof parsed !== 'object') throw Error();
                    if (['zad_quran_bookmarks', 'zad_user_badges_unlocked', 'zad_favorites'].includes(key) || key.startsWith('daily_wird_')) {
                        if (!Array.isArray(parsed)) throw Error();
                    }
                    if (key === 'zad_quran_bookmarks' && !parsed.every(b => Number.isInteger(b.page) && b.page >= 1 && b.page <= 604 && typeof b.surahName === 'string')) throw Error();
                    if (key === 'zad_quran_last_read' && (!Number.isInteger(parsed.pageNumber) || parsed.pageNumber < 1 || parsed.pageNumber > 604)) throw Error();
                }
                catch { throw Error('بيانات غير صالحة في النسخة: ' + key); }
            }
        }
        return entries;
    }
    function restoreBackup(storage, value) {
        const entries = validateBackup(value);
        const previous = entries.map(([key]) => [key, storage.getItem(key)]);
        try { for (const [key, val] of entries) storage.setItem(key, val); }
        catch (e) {
            for (const [key] of entries) storage.removeItem(key);
            for (const [key, val] of previous) if (val !== null) storage.setItem(key, val);
            throw e;
        }
        return entries.length;
    }
    const api = { allowed, makeBackup, validateBackup, restoreBackup };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (!root.document) return;
    const CACHE = 'zad-downloads-v1';
    const $ = id => (typeof document !== 'undefined' && document ? document.getElementById(id) : null);
    const store = localStorage;
    const standalone = document.body?.dataset.settingsPage === 'true';
    const read = (key, fallback) => { try { return JSON.parse(store.getItem(key)) ?? fallback; } catch { return fallback; } };

    const services = [
        ['quran-khatma', 'القرآن', 'book-quran'],
        ['azkar', 'الأذكار', 'hands-praying'],
        ['prayer-times', 'المواقيت', 'mosque'],
        ['tasbeeh', 'السبحة', 'ring'],
        ['islamic-media', 'المرئيات', 'circle-play'],
        ['zakat-calculator-section', 'الزكاة', 'calculator'],
        ['sadaqa', 'الصدقة', 'heart']
    ];

    const serviceMeta = {
        'quran-khatma': { fi: '📖', title: 'القرآن الكريم', desc: 'تلاوة وتدبر ومتابعة الورد والختمة القرآنية' },
        'azkar': { fi: '🤲', title: 'الأذكار والأدعية', desc: 'حصن المسلم وأذكار الصباح والمساء والأدعية المأثورة' },
        'prayer-times': { fi: '🕌', title: 'مواقيت الصلاة', desc: 'تحديد دقيق للمواقيت واتجاه القبلة مع تنبيهات الأذان' },
        'tasbeeh': { fi: '📿', title: 'السبحة الإلكترونية', desc: 'تسبيح ذكي مع عداد تفاعلي وأهداف يومية مباركة' },
        'islamic-media': { fi: '🎥', title: 'مرئيات وبودكاست', desc: 'محاضرات ودروس وبث إذاعي إسلامي مباشر خاشع' },
        'zakat-calculator-section': { fi: '🪙', title: 'حاسبة الزكاة', desc: 'حساب زكاة المال والذهب بسهولة ودقة شرعية' },
        'sadaqa': { fi: '🤍', title: 'الصدقة الجارية', desc: 'بطاقات دعاء للمتوفى ومشاركة الدعاء' }
    };

    function go(id) {
        close();
        if (id === 'tasbeeh') {
            const el = document.getElementById('smart-dhikr-panel');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else (window.zadNavigate || location.assign.bind(location))('index.html#smart-dhikr-panel');
        } else if (id === 'sadaqa') {
            const el = document.getElementById('sadaqa');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else (window.zadNavigate || location.assign.bind(location))('index.html#sadaqa');
        } else {
            (window.zadNavigate || location.assign.bind(location))('services.html#' + id);
        }
    }

    let lastFocus;

    function scrollCardTop(modal) {
        const card = modal?.querySelector('.modal-card');
        if (card) {
            if (typeof card.scrollTo === 'function') {
                try { card.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { card.scrollTop = 0; }
            } else {
                card.scrollTop = 0;
            }
        }
    }

    function showNotificationsView() {
        const alerts = $('notif-view-alerts');
        const settings = $('notif-view-settings');
        if (settings) settings.style.display = 'none';
        if (alerts) alerts.style.display = 'block';

        scrollCardTop($('notifications-modal'));
    }

    async function showSettingsView(section) {
        if (standalone) {
            if (section === 'downloads') { await listDownloads(); $('zad-downloads')?.scrollIntoView({ block: 'start' }); }
            return;
        }
        const modal = $('notifications-modal');
        if (modal) modal.classList.add('open');
        const alerts = $('notif-view-alerts');
        const settings = $('notif-view-settings');
        if (alerts) alerts.style.display = 'none';
        if (settings) settings.style.display = 'block';


        const statusEl = $('zad-tools-status');
        if (statusEl) statusEl.textContent = '';
        syncFavoriteCheckboxes();
        const targetTab = section === 'downloads' ? 'downloads' : (section === 'backup' ? 'backup' : (section === 'report' ? 'report' : 'setup'));
        settings?.querySelectorAll('.zad-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === targetTab));
        settings?.querySelectorAll('.zad-tab-panel').forEach(p => p.style.display = p.dataset.tab === targetTab ? 'block' : 'none');
        await refreshNotifications();
        if (targetTab === 'downloads') await listDownloads();
        scrollCardTop(modal);
    }

    function close() {
        const modal = $('notifications-modal');
        if (modal) modal.classList.remove('open');
        if (typeof root.closeNotificationsModal === 'function') root.closeNotificationsModal();

        showNotificationsView();
        lastFocus?.focus();
    }

    async function open(section) {
        lastFocus = document.activeElement;
        await showSettingsView(section);
    }

    function status(text) {
        const el = $('zad-tools-status');
        if (el) { el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.textContent = text; }
    }

    function applyFont() {
        const size = store.getItem('zad_font_size') || 'normal';
        document.documentElement.dataset.readingSize = ['normal', 'large', 'larger'].includes(size) ? size : 'normal';
    }

    function hasCurrentPrayerTimes() {
        const meta = read('zad_prayer_verified', null);
        return Boolean(meta && meta.date === new Date().toLocaleDateString('en-CA') &&
            meta.city === store.getItem('selected_prayer_city') && meta.method === (store.getItem('zad_prayer_method') || '') &&
            meta.school === (store.getItem('zad_prayer_school') || '0'));
    }
    async function refreshNotifications() {
        const box = $('zad-notification-state');
        if (!box) return;
        let message = 'الإذن: ' + ({ granted: 'مسموح', denied: 'مرفوض؛ غيّره من إعدادات المتصفح', default: 'لم يُطلب بعد' }[root.Notification?.permission] || 'غير مدعوم في هذا المتصفح');
        const native = root.Capacitor?.Plugins?.LocalNotifications;
        if (root.Capacitor?.isNativePlatform() && native) {
            try {
                const permission = await native.checkPermissions();
                const pending = await native.getPending();
                const dates = pending.notifications.map(n => ({ ...n, at: new Date(n.schedule?.at) })).filter(n => n.at > new Date()).sort((a,b) => a.at - b.at);
                message = 'إذن الهاتف: ' + permission.display + '. التذكير المحلي القادم: ' + (dates.length ? dates[0].at.toLocaleString('ar') : 'لا توجد تذكيرات محلية مجدولة');
                if (root.Capacitor?.getPlatform?.() === 'android') message += '. أذان Android يُدار أيضًا بواسطة منبّه الصلاة الأصلي.';
                if (native.checkExactNotificationSetting) {
                    const exact = await native.checkExactNotificationSetting();
                    message += '. إذن الموعد الدقيق: ' + exact.exact_alarm;
                }
            } catch { message = 'تعذّر قراءة حالة تنبيهات الهاتف.'; }
        } else {
            message += '. تنبيهات الصلاة في الويب لا تُضمن عند إغلاق المتصفح.';
        }
        box.textContent = message + (hasCurrentPrayerTimes() ? ' مواقيت اليوم محدّثة.' : ' مواقيت اليوم لم تُؤكد بعد؛ اتصل بالإنترنت وحدّث المدينة.');
    }

    async function testNotification() {
        const native = root.Capacitor?.Plugins?.LocalNotifications;
        if (root.Capacitor?.isNativePlatform() && native) {
            const permission = await native.requestPermissions();
            if (permission.display !== 'granted') throw Error('اسمح بالإشعارات من إعدادات الهاتف.');
            await native.schedule({ notifications: [{ id: 990001, title: 'زاد المسلم', body: 'تنبيه تجريبي', schedule: { at: new Date(Date.now() + 5000) } }] });
            status('تمت جدولة تجربة بعد ٥ ثوانٍ. تحقق من وصولها على الجهاز.');
        } else {
            if (!root.Notification) throw Error('الإشعارات غير مدعومة.');
            if (await Notification.requestPermission() !== 'granted') throw Error('لم يتم منح إذن الإشعارات.');
            const reg = await navigator.serviceWorker?.getRegistration();
            if (reg) await reg.showNotification('زاد المسلم', { body: 'تنبيه تجريبي', icon: 'assets/icon-192.png' });
            else new Notification('زاد المسلم', { body: 'تنبيه تجريبي' });
            status('أُرسل التنبيه التجريبي إلى المتصفح.');
        }
        await refreshNotifications();
    }

    let downloadAbort;
    function urlsFor(kind) {
        if (kind === 'pages') return Array.from({ length: 604 }, (_, i) => new URL(`assets/quran-pages/${String(i + 1).padStart(3, '0')}.svg`, location.href).href);
        if (kind === 'tafsir') return Array.from({ length: 604 }, (_, i) => `https://api.alquran.cloud/v1/page/${i + 1}/ar.muyassar`);
        const surah = Number($('zad-audio-surah').value);
        if (!Number.isInteger(surah) || surah < 1 || surah > 114) throw Error('اختر سورة صحيحة.');
        return [`https://server8.mp3quran.net/afs/${String(surah).padStart(3, '0')}.mp3`];
    }

    async function download(kind) {
        if (downloadAbort) throw Error('انتظر اكتمال التنزيل الحالي أو أوقفه.');
        if (!('caches' in root)) throw Error('التنزيل يحتاج إلى متصفح يدعم التخزين الآمن.');
        downloadAbort = new AbortController();
        const stopBtn = $('zad-stop-download');
        if (stopBtn) stopBtn.hidden = false;
        let completed = 0;
        try {
            const cache = await caches.open(CACHE), urls = urlsFor(kind);
            for (const url of urls) {
                if (downloadAbort.signal.aborted) throw new DOMException('Aborted', 'AbortError');
                if (!(await cache.match(url))) {
                    const response = await fetch(url, { signal: downloadAbort.signal, cache: 'no-store' });
                    if (!response.ok || response.type === 'opaque') throw Error('تعذّر تنزيل أحد الملفات. يمكنك المحاولة مجددًا لاستكمال الناقص.');
                    if (kind === 'tafsir') {
                        const json = await response.clone().json();
                        if (!Array.isArray(json?.data?.ayahs) || !json.data.ayahs.length) throw Error('لم تتوفر بيانات التفسير لهذه الصفحة.');
                    }
                    if (kind === 'pages' && !(await response.clone().text()).includes('<svg')) throw Error('ملف صفحة المصحف غير صالح.');
                    await cache.put(url, response);
                }
                completed++;
                status(`جاري التنزيل: ${completed} / ${urls.length} — يمكنك إيقافه واستكماله لاحقًا.`);
            }
            await navigator.storage?.persist?.();
            status('اكتمل التنزيل. الموارد محفوظة على هذا الجهاز.');
        } catch (e) {
            status(e.name === 'AbortError' ? 'توقف التنزيل؛ الملفات المكتملة محفوظة ويمكن استكماله.' : e.message);
        } finally {
            downloadAbort = null;
            if (stopBtn) stopBtn.hidden = true;
            await listDownloads();
        }
    }

    async function listDownloads() {
        document.dispatchEvent(new Event('zad:downloads-changed'));
        const box = $('zad-download-list');
        if (!box) return;
        box.replaceChildren();
        if (!('caches' in root)) { box.textContent = 'التخزين غير مدعوم.'; return; }
        const cache = await caches.open(CACHE), requests = await cache.keys();
        const groups = new Map();
        for (const req of requests) {
            const kind = req.url.includes('/quran-pages/') ? 'pages' : req.url.includes('/ar.muyassar') ? 'tafsir' : req.url;
            if (!groups.has(kind)) groups.set(kind, []);
            groups.get(kind).push(req);
        }
        if (!requests.length) box.textContent = 'لا توجد تنزيلات محفوظة بعد. البث المباشر والخدمات السحابية تحتاج إلى الإنترنت.';
        for (const [kind, files] of groups) {
            let bytes = 0;
            for (const req of files) bytes += (await (await cache.match(req)).blob()).size;
            const row = document.createElement('p'), label = document.createElement('span'), remove = document.createElement('button');
            label.textContent = `${kind === 'pages' ? 'صفحات المصحف' : kind === 'tafsir' ? 'التفسير الميسر' : 'تلاوة السورة ' + kind.match(/(\d+)\.mp3/)?.[1]}: ${files.length} ملف — ${(bytes / 1048576).toFixed(1)} م.ب `;
            remove.className = 'btn outline'; remove.textContent = 'حذف التنزيل';
            remove.onclick = async () => {
                if (downloadAbort) return status('أوقف التنزيل أولاً.');
                if (!confirm('حذف هذه الملفات المنزّلة؟ تقدّمك في القراءة سيظل محفوظًا.')) return;
                for (const req of files) await cache.delete(req);
                await listDownloads(); status('تم حذف التنزيل.');
            };
            row.append(label, remove); box.append(row);
        }
    }

    const defaultFavorites = ['quran-khatma', 'azkar'];
    function getFavorites() {
        const saved = read('zad_favorites', null);
        const valid = Array.isArray(saved) ? [...new Set(saved)].filter(id => services.some(s => s[0] === id)) : [];
        return valid.length ? valid : defaultFavorites;
    }
    function setFavorites(ids) {
        if (!ids.length) { status('احتفظ باختصار واحد على الأقل.'); syncFavoriteCheckboxes(); return false; }
        store.setItem('zad_favorites', JSON.stringify(ids));
        syncFavoriteCheckboxes(); renderFavorites();
        status('تم تحديث اختصاراتك.');
        return true;
    }
    function renderSettingsShortcuts() {
        const grid = $('settings-shortcuts-grid');
        if (!grid) return;
        const active = getFavorites(); grid.replaceChildren();
        services.forEach(([id, name, icon]) => {
            const card = document.createElement('button');
            card.type = 'button'; card.className = 'settings-fav-card' + (active.includes(id) ? ' active' : '');
            card.dataset.id = id; card.setAttribute('aria-pressed', String(active.includes(id)));
            const meta = serviceMeta[id];
            card.innerHTML = '<span class="settings-fav-icon"><i class="fa-solid fa-' + icon + '" aria-hidden="true"></i></span><span class="settings-fav-info"><span class="settings-fav-name"></span><span class="settings-fav-desc"></span></span><span class="settings-fav-check" aria-hidden="true">✓</span>';
            card.querySelector('.settings-fav-name').textContent = meta?.title || name;
            card.querySelector('.settings-fav-desc').textContent = meta?.desc || '';
            card.onclick = () => {
                const selected = getFavorites();
                if (setFavorites(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])) {
                    const feedback = $('settings-shortcuts-feedback');
                    if (feedback) {
                        feedback.style.display = 'block';
                        feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> تم حفظ وتحديث اختصاراتك في الصفحة الرئيسية فوراً ✨';
                        clearTimeout(root._zadShortcutsFeedbackTimer);
                        root._zadShortcutsFeedbackTimer = setTimeout(() => { feedback.style.display = 'none'; }, 2500);
                    }
                }
            };
            grid.append(card);
        });
    }
    function syncFavoriteCheckboxes() {
        const selected = getFavorites();
        const container = $('zad-favorite-choices');
        if (container) {
            container.querySelectorAll('input[type=checkbox]').forEach(input => {
                input.checked = selected.includes(input.value);
            });
        }
    }

    function renderFavorites() {
        renderSettingsShortcuts();
        const favoriteIds = getFavorites();
        const activeServices = services.filter(s => favoriteIds.includes(s[0]));
        const listToRender = activeServices.length ? activeServices : services.slice(0, 2);

        // 1. تحديث شبكة اختصارات الصفحة الرئيسية في التطبيق
        const webGrid = document.querySelector('.features.quick-access-grid');
        if (webGrid) {
            webGrid.replaceChildren();
            webGrid.style.gridTemplateColumns = `repeat(${Math.min(listToRender.length, 4)}, 1fr)`;
            listToRender.forEach(([id, name]) => {
                const meta = serviceMeta[id] || { fi: '✨', title: name, desc: 'الوصول السريع إلى قسم ' + name };
                const card = document.createElement('a');
                card.className = 'feature';
                card.href = id === 'tasbeeh' ? '#smart-dhikr-panel' : (id === 'sadaqa' ? '#sadaqa' : 'services.html#' + id + (id === 'quran-khatma' ? '?tab=mushaf' : ''));
                card.dataset.service = id;
                card.innerHTML = `
                    <div class="fi">${meta.fi}</div>
                    <h3>${meta.title}</h3>
                    <p>${meta.desc}</p>
                `;
                webGrid.appendChild(card);
            });
        }

        // 3. تحديث الحاويات في أي مكان يحمل .zad-favorite-links (مثل تاب المزيد)
        document.querySelectorAll('.zad-favorite-links').forEach(container => {
            container.replaceChildren();
            listToRender.forEach(([id, name, icon]) => {
                const btn = document.createElement('button');
                btn.className = 'btn outline';
                btn.type = 'button';
                const glyph = document.createElement('i');
                glyph.className = 'fa-solid fa-' + icon + ' text-gold';
                glyph.setAttribute('aria-hidden', 'true');
                btn.append(glyph, document.createTextNode(' ' + name));
                btn.onclick = (e) => { e.preventDefault(); go(id); };
                container.append(btn);
            });
        });
    }

    const HOME_SECTIONS = [
        {
            id: 'hero',
            name: 'بنر الترحيب الرئيسي',
            desc: 'واجهة البداية الترحيبية "زادٌ لقلبك، ونورٌ ليومك" وأزرار البدء السريع',
            icon: 'fa-sun'
        },
        {
            id: 'smart_reminder',
            name: 'شريط التذكير الذكي',
            desc: 'بنر التذكير بالسياق الزمني والأدعية المناسبة لوقتك الحالي',
            icon: 'fa-bell'
        },
        {
            id: 'daily_journey',
            name: 'رحلتك الإيمانية اليوم (مواقيت الصلاة والمهام)',
            desc: 'بطاقة موعد الصلاة القادمة، عداد إنجاز اليوم، ومتابعة الأذكار والورد القرآني',
            icon: 'fa-calendar-check'
        },
        {
            id: 'smart_dhikr',
            name: 'السبحة الإلكترونية التفاعلية',
            desc: 'لوحة التسبيح السريع التفاعلية، أهداف الأذكار، ومشاركة الاستوري',
            icon: 'fa-hand-dots'
        },
        {
            id: 'smart_khatma',
            name: 'الختمة القرآنية الذكية',
            desc: 'بطاقة خطة الختمة الشخصية والصفحات المتبقية ومتابعة القراءة اليومية',
            icon: 'fa-book-quran'
        },
        {
            id: 'daily_clip',
            name: 'موعظة اليوم المرئية والبودكاست',
            desc: 'مقاطع فيديو إيمانية قصيرة ومختارات وعظية متجددة يومياً',
            icon: 'fa-film'
        },
        {
            id: 'quick_services',
            name: 'بطاقات الوصول السريع للخدمات',
            desc: 'شبكة بطاقات الخدمات الرئيسية (القرآن، الأذكار، القبلة، الزكاة، المساجد...)',
            icon: 'fa-table-cells'
        },
        {
            id: 'sadaqa_challenge',
            name: 'الصدقة الجارية وتحدي 7 أيام',
            desc: 'إنشاء صفحة صدقة جارية للأحباب وتحدي البدايات الإيمانية السبع',
            icon: 'fa-hand-holding-heart'
        }
    ];

    function getHomeSectionsConfig() {
        try {
            const raw = store.getItem('zad_home_sections');
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    function isHomeSectionVisible(id) {
        const config = getHomeSectionsConfig();
        return config[id] !== false;
    }

    function setHomeSectionVisible(id, visible) {
        const config = getHomeSectionsConfig();
        config[id] = !!visible;
        try {
            store.setItem('zad_home_sections', JSON.stringify(config));
        } catch (_) {}
        applyHomeSectionsVisibility();
        try {
            document.dispatchEvent(new CustomEvent('zad:home-sections-updated', { detail: config }));
        } catch (_) {}
    }

    function resetAllHomeSections() {
        try {
            store.removeItem('zad_home_sections');
        } catch (_) {}
        applyHomeSectionsVisibility();
        try {
            document.dispatchEvent(new CustomEvent('zad:home-sections-updated', { detail: {} }));
        } catch (_) {}
    }

    function applyHomeSectionsVisibility() {
        const config = getHomeSectionsConfig();
        const isVisible = id => config[id] !== false;

        // 1. Hero
        const heroEl = document.querySelector('section.hero');
        if (heroEl) heroEl.style.display = isVisible('hero') ? '' : 'none';

        // 2. Smart Reminder
        const reminderEl = $('smart-reminder-banner');
        if (reminderEl) {
            if (!isVisible('smart_reminder')) {
                reminderEl.style.setProperty('display', 'none', 'important');
            } else if (reminderEl.style.display === 'none' && reminderEl.style.getPropertyPriority('display') === 'important') {
                reminderEl.style.removeProperty('display');
            }
        }

        // 3. Daily Journey & 4. Smart Dhikr
        const journeyPanel = $('daily-journey-panel');
        const dhikrPanel = $('smart-dhikr-panel');
        const dailyHead = $('daily');
        const dashboardSec = document.querySelector('section.dashboard');
        const journeyVis = isVisible('daily_journey');
        const dhikrVis = isVisible('smart_dhikr');

        if (journeyPanel) journeyPanel.style.display = journeyVis ? '' : 'none';
        const nextPrayerPanel = $('home-next-prayer');
        if (nextPrayerPanel) nextPrayerPanel.style.display = journeyVis ? '' : 'none';
        if (dhikrPanel) dhikrPanel.style.display = dhikrVis ? '' : 'none';

        if (dailyHead) dailyHead.style.display = (!journeyVis && !dhikrVis) ? 'none' : '';
        if (dashboardSec) {
            if (!journeyVis && !dhikrVis) {
                dashboardSec.style.display = 'none';
            } else {
                dashboardSec.style.display = '';
                dashboardSec.style.gridTemplateColumns = (journeyVis && !dhikrVis) || (!journeyVis && dhikrVis) ? '1fr' : '';
            }
        }

        // 5. Smart Khatma
        const khatmaSlot = $('smart-khatma-dashboard-slot');
        if (khatmaSlot) khatmaSlot.style.display = isVisible('smart_khatma') ? '' : 'none';


        // 7. Daily Clip
        const clipCard = $('daily-featured-media-card');
        if (clipCard) clipCard.style.display = isVisible('daily_clip') ? '' : 'none';

        // 8. Quick Services
        const homeServices = $('home-services-section');
        const sVis = isVisible('quick_services');
        if (homeServices) {
            homeServices.style.display = sVis ? '' : 'none';
        } else {
            const sHead = $('services');
            const sGrid = document.querySelector('.features.quick-access-grid');
            const sBtn = document.querySelector('.explore-all-btn')?.closest('div');
            if (sHead) sHead.style.display = sVis ? '' : 'none';
            if (sGrid) sGrid.style.display = sVis ? '' : 'none';
            if (sBtn) sBtn.style.display = sVis ? '' : 'none';
        }

        // 9. Sadaqa & Challenge
        const sadaqaSec = $('sadaqa');
        if (sadaqaSec) sadaqaSec.style.display = isVisible('sadaqa_challenge') ? '' : 'none';

        // Empty notice if all sections are hidden
        const emptyNotice = $('home-empty-sections-notice');
        if (emptyNotice) {
            const allHidden = HOME_SECTIONS.every(s => !isVisible(s.id));
            emptyNotice.style.display = allHidden ? 'block' : 'none';
        }
    }

    function renderHomeSectionsSettings() {
        const grid = $('home-sections-toggle-grid');
        if (!grid) return;
        const config = getHomeSectionsConfig();

        if (grid.children.length === HOME_SECTIONS.length) {
            grid.querySelectorAll('.settings-home-section-card').forEach(card => {
                const id = card.dataset.sectionId;
                const visible = config[id] !== false;
                card.classList.toggle('active', visible);
                card.setAttribute('aria-checked', String(visible));
                const pill = card.querySelector('.home-toggle-pill');
                if (pill) {
                    pill.innerHTML = `<i class="fa-solid ${visible ? 'fa-check' : 'fa-xmark'}"></i> <span>${visible ? 'ظاهر' : 'مخفي'}</span>`;
                }
            });
            return;
        }

        grid.replaceChildren();

        HOME_SECTIONS.forEach(sec => {
            const visible = config[sec.id] !== false;
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'settings-home-section-card' + (visible ? ' active' : '');
            card.dataset.sectionId = sec.id;
            card.setAttribute('role', 'switch');
            card.setAttribute('aria-checked', String(visible));

            card.innerHTML = `
                <div class="settings-home-section-icon">
                    <i class="fa-solid ${sec.icon}"></i>
                </div>
                <div class="settings-home-section-info">
                    <div class="settings-home-section-title">${sec.name}</div>
                    <div class="settings-home-section-desc">${sec.desc}</div>
                </div>
                <div class="settings-home-section-toggle">
                    <span class="home-toggle-pill">
                        <i class="fa-solid ${visible ? 'fa-check' : 'fa-xmark'}"></i>
                        <span>${visible ? 'ظاهر' : 'مخفي'}</span>
                    </span>
                </div>
            `;

            card.onclick = () => {
                const currentConfig = getHomeSectionsConfig();
                const current = currentConfig[sec.id] !== false;
                const next = !current;
                setHomeSectionVisible(sec.id, next);
                renderHomeSectionsSettings();

                const feedback = $('home-sections-feedback');
                if (feedback) {
                    feedback.style.display = 'block';
                    feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> تم ${next ? 'إظهار' : 'إخفاء'} قسم "${sec.name}" فوراً ✨`;
                    clearTimeout(root._zadHomeSectionsFeedbackTimer);
                    root._zadHomeSectionsFeedbackTimer = setTimeout(() => { feedback.style.display = 'none'; }, 2500);
                }
            };

            grid.append(card);
        });

        const resetBtn = $('btn-reset-home-sections');
        if (resetBtn && !resetBtn.dataset.bound) {
            resetBtn.dataset.bound = 'true';
            resetBtn.onclick = () => {
                resetAllHomeSections();
                renderHomeSectionsSettings();
                const feedback = $('home-sections-feedback');
                if (feedback) {
                    feedback.style.display = 'block';
                    feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> تم إظهار جميع أقسام الصفحة الرئيسية بنجاح ✨';
                    clearTimeout(root._zadHomeSectionsFeedbackTimer);
                    root._zadHomeSectionsFeedbackTimer = setTimeout(() => { feedback.style.display = 'none'; }, 2500);
                }
            };
        }
    }

    function init() {
        applyFont();
        if (standalone) {
            if (!root.Capacitor?.isNativePlatform?.() && navigator.serviceWorker) {
                navigator.serviceWorker.register('./sw.js').catch(() => status('تعذّر تجهيز القراءة بدون إنترنت؛ أعد المحاولة عند الاتصال.'));
            }
            let destination = 'index.html';
            let destTitle = 'الرئيسية';
            try {
                const ref = new URL(document.referrer);
                if (ref.origin === location.origin && /\/(index|services)\.html$/.test(ref.pathname)) {
                    destination = ref.pathname.split('/').pop();
                    if (destination === 'services.html') destTitle = 'الخدمات';
                }
            } catch {}
            if ($('btn-settings-back')) {
                $('btn-settings-back').href = destination;
                const label = $('btn-settings-back').querySelector('span');
                if (label) label.textContent = destTitle;
            }
            if ($('settings-open-notifications')) $('settings-open-notifications').href = destination + '?panel=notifications';
        }

        // 1. إعداد النافذة الموحدة داخل notifications-modal (للصفحات الأخرى فقط)
        const notifModal = $('notifications-modal');
        const modalCard = notifModal?.querySelector('.modal-card');

        if (!standalone && modalCard) {
            let alertsView = $('notif-view-alerts');
        if (modalCard && !alertsView) {
            alertsView = document.createElement('div');
            alertsView.id = 'notif-view-alerts';
            const closeBtn = $('btn-close-notifications-modal');
            const nodesToMove = [...modalCard.childNodes].filter(n => n !== closeBtn);
            nodesToMove.forEach(n => alertsView.appendChild(n));
            modalCard.appendChild(alertsView);
        }

        if (alertsView && !alertsView.querySelector('#btn-switch-to-settings')) {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'margin-top: 12px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.12); display: flex; flex-direction: column; gap: 8px;';

            const row = document.createElement('div');
            row.style.cssText = 'display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap;';

            const switchBtn = document.createElement('button');
            switchBtn.type = 'button';
            switchBtn.className = 'btn btn-outline zad-open-tools';
            switchBtn.id = 'btn-switch-to-settings';
            switchBtn.innerHTML = '<i class="fa-solid fa-sliders text-gold"></i> <span>تخصيص الإعدادات والتنزيلات</span>';
            switchBtn.onclick = () => showSettingsView();

            const fullPageLink = document.createElement('a');
            fullPageLink.href = 'settings.html';
            fullPageLink.className = 'btn btn-outline';
            fullPageLink.style.cssText = 'text-decoration: none; font-size: 0.8rem; padding: 6px 12px;';
            fullPageLink.innerHTML = '<i class="fa-solid fa-up-right-from-square text-gold"></i> <span>صفحة الإعدادات الشاملة</span>';

            row.append(switchBtn, fullPageLink);
            wrap.appendChild(row);
            alertsView.appendChild(wrap);
        }

        let settingsView = $('notif-view-settings');
        if (modalCard && !settingsView) {
            settingsView = document.createElement('div');
            settingsView.id = 'notif-view-settings';
            settingsView.style.display = 'none';
            settingsView.innerHTML = `
              <div class="zad-notif-settings-header">
                <button type="button" id="btn-back-to-notifications" class="zad-back-btn">
                  <i class="fa-solid fa-arrow-right"></i>
                  <span>العودة للإشعارات</span>
                </button>
                <h3 class="modal-title" style="margin: 0; font-size: 1.15rem; color: var(--text-primary);">
                  <i class="fa-solid fa-sliders text-gold"></i> إعداداتك وبياناتك
                </h3>
              </div>

              <nav class="zad-tools-tabs" role="tablist">
                <button type="button" class="zad-tab-btn active" data-tab="setup"><i class="fa-solid fa-gear"></i> العامة والمواقيت</button>
                <button type="button" class="zad-tab-btn" data-tab="downloads"><i class="fa-solid fa-cloud-arrow-down"></i> التنزيلات</button>
                <button type="button" class="zad-tab-btn" data-tab="backup"><i class="fa-solid fa-database"></i> النسخ والاحتياط</button>
                <button type="button" class="zad-tab-btn" data-tab="report"><i class="fa-solid fa-flag"></i> ملاحظة أو خطأ</button>
              </nav>

              <p id="zad-tools-status" role="status" aria-live="polite"></p>

              <div class="zad-tools-body">
                <!-- 1. التبويب الأول: العامة والمواقيت -->
                <section id="zad-setup" class="zad-tab-panel" data-tab="setup">
                  <h3><i class="fa-solid fa-mosque"></i> تخصيص المواقيت والواجهة</h3>
                  <p>اختر مدينتك وطريقة الحساب الفقهية المناسبة لك وحجم الخط:</p>

                  <div class="zad-form-grid">
                    <div class="zad-form-group">
                      <label for="zad-city"><i class="fa-solid fa-location-dot text-gold"></i> المدينة:</label>
                      <select id="zad-city"></select>
                    </div>

                    <div class="zad-form-group">
                      <label for="zad-method"><i class="fa-solid fa-calculator text-gold"></i> طريقة الحساب الفقهية:</label>
                      <select id="zad-method">
                        <option value="">تلقائي حسب المدينة</option>
                        <option value="4">أم القرى (مكة المكرمة والخليج)</option>
                        <option value="5">الهيئة المصرية العامة للمساحة</option>
                        <option value="3">رابطة العالم الإسلامي</option>
                        <option value="2">أمريكا الشمالية (ISNA)</option>
                        <option value="7">معهد الجيوفيزياء (طهران)</option>
                        <option value="8">منطقة الخليج</option>
                        <option value="9">وزارة الأوقاف والشؤون الإسلامية (الكويت)</option>
                        <option value="10">وزارة الأوقاف (قطر)</option>
                        <option value="13">رئاسة الشؤون الدينية (تركيا)</option>
                      </select>
                    </div>

                    <div class="zad-form-group">
                      <label for="zad-school"><i class="fa-solid fa-scale-balanced text-gold"></i> حساب صلاة العصر:</label>
                      <select id="zad-school">
                        <option value="0">الجمهور (الشافعي، المالكي، الحنبلي)</option>
                        <option value="1">المذهب الحنفي</option>
                      </select>
                    </div>

                    <div class="zad-form-group">
                      <label for="zad-font"><i class="fa-solid fa-font text-gold"></i> حجم خط القراءة:</label>
                      <select id="zad-font">
                        <option value="normal">عادي (الافتراضي)</option>
                        <option value="large">كبير (مريح للعين)</option>
                        <option value="larger">كبير جدًا (قراءة واضحة)</option>
                      </select>
                    </div>
                  </div>

                  <fieldset id="zad-favorite-choices">
                    <legend><i class="fa-solid fa-star text-gold"></i> اختصاراتك المفضلة في الصفحة الرئيسية</legend>
                    <div class="zad-chips-container"></div>
                  </fieldset>

                  <div class="zad-feature-card" style="margin-top: 10px;">
                    <div class="zad-feature-card-header">
                      <span class="zad-feature-card-title"><i class="fa-solid fa-bell text-gold"></i> حالة الأذان والتنبيهات</span>
                    </div>
                    <p id="zad-notification-state" style="font-size: 0.8rem; margin: 0; color: var(--text-muted);"></p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
                      <button type="button" class="btn outline" id="zad-config-notifications" style="font-size: 0.78rem; padding: 4px 10px;">
                        <i class="fa-solid fa-sliders text-gold"></i> تخصيص الأذان والمنبهات
                      </button>
                      <button type="button" class="btn outline" id="zad-test-notification" style="font-size: 0.78rem; padding: 4px 10px;">
                        <i class="fa-solid fa-flask text-gold"></i> تجربة تنبيه
                      </button>
                      <button type="button" class="btn outline" id="zad-refresh-notifications" style="font-size: 0.78rem; padding: 4px 10px;">
                        <i class="fa-solid fa-arrows-rotate text-gold"></i> تحديث الحالة
                      </button>
                    </div>
                  </div>

                  <div style="margin-top: 14px;">
                    <button type="button" class="btn solid btn-block" id="zad-save-settings" style="width: 100%; font-size: 0.95rem; padding: 10px;">
                      <i class="fa-solid fa-check"></i> حفظ اختياراتي ✨
                    </button>
                  </div>
                </section>

                <!-- 2. التبويب الثاني: التنزيلات بدون إنترنت -->
                <section id="zad-downloads" class="zad-tab-panel" data-tab="downloads" style="display: none;">
                  <h3><i class="fa-solid fa-cloud-arrow-down"></i> التنزيل للقراءة والاستماع أوفلاين</h3>
                  <p>نزّل ما تحتاجه ليعمل التطبيق بكامل كفاءته حتى بدون اتصال بالإنترنت:</p>

                  <div class="zad-feature-card" style="background: rgba(14, 102, 84, 0.18); border-color: rgba(115, 211, 171, 0.35);">
                    <div class="zad-feature-card-header">
                      <span class="zad-feature-card-title"><i class="fa-solid fa-circle-check text-gold" style="color: #10B981;"></i> المصحف الشريف (٦٠٤ صفحة)</span>
                      <span style="background: rgba(16, 185, 129, 0.2); color: #73D3AB; border: 1px solid rgba(16, 185, 129, 0.4); padding: 3px 10px; border-radius: 9999px; font-size: 0.74rem; font-weight: 700;">مضمّن في نسخة الهاتف؛ نزّله أولاً على الويب</span>
                    </div>
                    <p class="zad-feature-card-desc" style="color: var(--text-primary, #F3F8F4);">صفحات المصحف مضمّنة في نسخة الهاتف. في المتصفح استخدم زر التنزيل قبل القراءة بدون إنترنت.</p>
                    <button type="button" class="btn outline" data-download="pages" >تنزيل صفحات المصحف</button>
                  </div>

                  <div class="zad-feature-card">
                    <div class="zad-feature-card-header">
                      <span class="zad-feature-card-title"><i class="fa-solid fa-book-open text-gold"></i> التفسير الميسر</span>
                      <button type="button" class="btn outline" data-download="tafsir"><i class="fa-solid fa-download"></i> تنزيل التفسير</button>
                    </div>
                    <p class="zad-feature-card-desc">تنزيل تفسير آيات القرآن الكريم الميسر لجميع الصفحات.</p>
                  </div>

                  <div class="zad-feature-card">
                    <div class="zad-feature-card-header">
                      <span class="zad-feature-card-title"><i class="fa-solid fa-headphones text-gold"></i> تلاوة سورة كاملة بصوت العفاسي</span>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                      <label style="flex: 1; min-width: 140px; margin: 0;">اختر السورة:
                        <select id="zad-audio-surah" style="margin-top: 4px;">
                          <option value="1">1. الفاتحة</option>
                          <option value="18">18. الكهف</option>
                          <option value="36">36. يس</option>
                          <option value="55">55. الرحمن</option>
                          <option value="56">56. الواقعة</option>
                          <option value="67" selected>67. الملك</option>
                          <option value="112">112. الإخلاص</option>
                          <option value="113">113. الفلق</option>
                          <option value="114">114. الناس</option>
                        </select>
                      </label>
                      <button type="button" class="btn outline" data-download="audio" style="margin-top: auto;">
                        <i class="fa-solid fa-download"></i> تنزيل السورة
                      </button>
                    </div>
                  </div>

                  <div style="display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 6px;">
                    <button type="button" class="btn outline" id="zad-list-downloads">
                      <i class="fa-solid fa-hard-drive text-gold"></i> عرض الملفات المنزلة والمساحة
                    </button>
                    <button type="button" class="btn btn-danger-outline" id="zad-stop-download" hidden>
                      <i class="fa-solid fa-stop"></i> إيقاف التنزيل
                    </button>
                  </div>
                  <div id="zad-download-list"></div>
                </section>

                <!-- 3. التبويب الثالث: النسخ الاحتياطي -->
                <section id="zad-backup-section" class="zad-tab-panel" data-tab="backup" style="display: none;">
                  <h3><i class="fa-solid fa-database"></i> النسخ الاحتياطي لتقدمك الإيماني</h3>
                  <p>احفظ ختماتك، علامات القراءة، الملاحظات، وسجل أذكارك في ملف آمن لنقله لأي جهاز آخر:</p>

                  <div class="zad-feature-card">
                    <div class="zad-feature-card-header">
                      <span class="zad-feature-card-title"><i class="fa-solid fa-file-export text-gold"></i> تصدير نسخة احتياطية</span>
                      <button type="button" class="btn solid" id="zad-export-backup">
                        <i class="fa-solid fa-download"></i> حفظ ملف النسخة
                      </button>
                    </div>
                    <p class="zad-feature-card-desc">تنزيل ملف .json يحتوي على جميع بياناتك الشخصية دون المساس بأي كلمات مرور أو موقع.</p>
                  </div>

                  <div class="zad-feature-card">
                    <div class="zad-feature-card-header">
                      <span class="zad-feature-card-title"><i class="fa-solid fa-file-import text-gold"></i> استرجاع نسخة سابقة</span>
                    </div>
                    <p class="zad-feature-card-desc">اختر ملف نسخة احتياطية محفوظة لاسترجاع تقدمك السابق على هذا الجهاز:</p>
                    <div style="margin-top: 6px;">
                      <label style="cursor: pointer; display: block; margin: 0;">
                        <span class="btn outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
                          <i class="fa-solid fa-folder-open text-gold"></i> اختيار ملف النسخة (.json)
                        </span>
                        <input id="zad-import-backup" type="file" accept=".json,application/json" style="display: none;">
                      </label>
                    </div>
                  </div>
                </section>

                <!-- 4. التبويب الرابع: إبلاغ عن خطأ بالمحتوى -->
                <section id="zad-report-section" class="zad-tab-panel" data-tab="report" style="display: none;">
                  <h3><i class="fa-solid fa-flag"></i> الإبلاغ عن خطأ أو اقتراح تصويب</h3>
                  <p>جزاك الله خيراً على تنبيهنا لأي خطأ طباعي أو لغوي؛ يسعدنا مراجعته وتصويبه فوراً:</p>

                  <label for="zad-report-location"><i class="fa-solid fa-map-pin text-gold"></i> موضع الخطأ:
                    <input id="zad-report-location" maxlength="200" placeholder="مثال: سورة البقرة، آية ٢٥٥">
                  </label>

                  <label for="zad-report-text"><i class="fa-solid fa-pen-to-square text-gold"></i> تفاصيل الخطأ أو الملاحظة:
                    <textarea id="zad-report-text" maxlength="3000" rows="3" placeholder="اكتب التصويب المقترح أو الملاحظة بالتفصيل..."></textarea>
                  </label>

                  <div style="margin-top: 12px;">
                    <button type="button" class="btn solid btn-block" id="zad-send-report" style="width: 100%;">
                      <i class="fa-solid fa-envelope"></i> فتح البلاغ في تطبيق البريد للإرسال
                    </button>
                  </div>
                </section>
              </div>


            `;
            modalCard.appendChild(settingsView);
        }
    }

        // 3. ربط أزرار التنقل والتبديل
        const backBtn = $('btn-back-to-notifications');
        if (backBtn) backBtn.onclick = showNotificationsView;

        const configNotifBtn = $('zad-config-notifications');
        if (configNotifBtn) configNotifBtn.onclick = showNotificationsView;

        const closeNotifBtn = $('btn-close-notifications-modal');
        if (closeNotifBtn) closeNotifBtn.addEventListener('click', close);



        document.querySelectorAll('.zad-tab-btn').forEach(btn => {
            btn.onclick = () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('.zad-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
                document.querySelectorAll('.zad-tab-panel').forEach(p => p.style.display = p.dataset.tab === tab ? 'block' : 'none');
                if (tab === 'downloads') listDownloads().catch(e => status(e.message));
            };
        });

        const testNotifBtn = $('zad-test-notification');
        if (testNotifBtn) testNotifBtn.onclick = () => testNotification().catch(e => status(e.message));

        const refreshNotifBtn = $('zad-refresh-notifications');
        if (refreshNotifBtn) refreshNotifBtn.onclick = refreshNotifications;

        const listDlBtn = $('zad-list-downloads');
        if (listDlBtn) listDlBtn.onclick = () => listDownloads().catch(e => status(e.message));

        document.querySelectorAll('[data-download]').forEach(btn => {
            btn.onclick = () => download(btn.dataset.download).catch(e => status(e.message));
        });

        const stopDlBtn = $('zad-stop-download');
        if (stopDlBtn) stopDlBtn.onclick = () => downloadAbort?.abort();

        // 4. خيارات المدن والمواقيت والخط
        const cities = $('select-prayer-city');
        const zadCity = $('zad-city');
        if (zadCity) {
            const cityOptions = root.ZadPrayerCities || {};
            zadCity.replaceChildren();
            Object.entries(cityOptions).forEach(([key, config]) => zadCity.add(new Option(config.label || config.city, key)));
            if (store.getItem('selected_prayer_city') === 'gps') zadCity.add(new Option('الموقع الحالي (GPS)', 'gps'));
            zadCity.value = store.getItem('selected_prayer_city') || 'Cairo';
            if (!zadCity.value) zadCity.selectedIndex = 0;
            zadCity.addEventListener('change', () => {
                store.setItem('selected_prayer_city', zadCity.value);
                store.setItem('user_manually_selected_city', 'true');
                if (cities) cities.value = zadCity.value;
                if (typeof root.fetchPrayerTimes === 'function') root.fetchPrayerTimes(zadCity.value);
                status('تم حفظ وتطبيق المدينة فوراً ✨');
            });
        }

        const zadMethod = $('zad-method');
        if (zadMethod) {
            zadMethod.value = store.getItem('zad_prayer_method') || '';
            zadMethod.addEventListener('change', () => {
                store.setItem('zad_prayer_method', zadMethod.value);
                if (zadCity && typeof root.fetchPrayerTimes === 'function') root.fetchPrayerTimes(zadCity.value);
                status('تم حفظ وتطبيق طريقة الحساب فوراً ✨');
            });
        }

        const zadSchool = $('zad-school');
        if (zadSchool) {
            zadSchool.value = store.getItem('zad_prayer_school') || '0';
            zadSchool.addEventListener('change', () => {
                store.setItem('zad_prayer_school', zadSchool.value);
                if (zadCity && typeof root.fetchPrayerTimes === 'function') root.fetchPrayerTimes(zadCity.value);
                status('تم حفظ وتطبيق المذهب فوراً ✨');
            });
        }

        const zadFont = $('zad-font');
        if (zadFont) {
            zadFont.value = store.getItem('zad_font_size') || 'normal';
            zadFont.addEventListener('change', () => {
                store.setItem('zad_font_size', zadFont.value);
                applyFont();
                status('تم تطبيق حجم الخط فوراً ✨');
            });
        }

        const zadHijri = $('zad-hijri-offset');
        if (zadHijri) {
            zadHijri.value = store.getItem('zad_hijri_offset') || '0';
            zadHijri.addEventListener('change', () => {
                store.setItem('zad_hijri_offset', zadHijri.value);
                if (typeof root.adjustHijriOffset === 'function') {
                    root.adjustHijriOffset(0);
                }
                status('تم ضبط وتطبيق تعديل التاريخ الهجري فوراً 🌙');
            });
        }

        // 5. اختصاراتك المفضلة في الصفحة الرئيسية مع التحديث اللحظي
        const selected = getFavorites();
        const chipContainer = $('zad-favorite-choices')?.querySelector('.zad-chips-container') || $('zad-favorite-choices');
        if (chipContainer) {
            chipContainer.replaceChildren();
            services.forEach(([id, name, icon]) => {
                const label = document.createElement('label'), input = document.createElement('input');
                label.className = 'zad-chip-item';
                input.type = 'checkbox';
                input.value = id;
                input.checked = selected.includes(id);
                input.onchange = () => {
                    const checked = [...chipContainer.querySelectorAll('input:checked')].map(el => el.value);
                    setFavorites(checked);
                };
                const glyph = document.createElement('i');
                glyph.className = 'fa-solid fa-' + (icon || 'star') + ' text-gold';
                label.append(input, glyph, document.createTextNode(' ' + name));
                chipContainer.append(label);
            });
        }

        const saveSettingsBtn = $('zad-save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.onclick = async () => {
                const previousPrayerPrefs = ['selected_prayer_city', 'zad_prayer_method', 'zad_prayer_school'].map(k => store.getItem(k)).join('|');
                if (zadCity) {
                    store.setItem('selected_prayer_city', zadCity.value);
                    store.setItem('user_manually_selected_city', 'true');
                    if (cities) cities.value = zadCity.value;

                }
                if (zadMethod) store.setItem('zad_prayer_method', zadMethod.value);
                if (zadSchool) store.setItem('zad_prayer_school', zadSchool.value);
                if (zadFont) store.setItem('zad_font_size', zadFont.value);
                if (zadHijri) store.setItem('zad_hijri_offset', zadHijri.value);
                store.setItem('zad_setup_done', '1');
                applyFont();
                const changedPrayerPrefs = previousPrayerPrefs !== ['selected_prayer_city', 'zad_prayer_method', 'zad_prayer_school'].map(k => store.getItem(k)).join('|');
                if (zadCity && typeof root.fetchPrayerTimes === 'function') root.fetchPrayerTimes(zadCity.value);
                else if (changedPrayerPrefs) {
                    store.removeItem('zad_prayer_verified');
                    try {
                        await root.Capacitor?.Plugins?.AdhanNative?.cancelAllAlarms?.();
                        const local = root.Capacitor?.Plugins?.LocalNotifications;
                        const pending = await local?.getPending();
                        const prayerAlarms = pending?.notifications?.filter(n => n.id < 70000) || [];
                        if (prayerAlarms.length) await local.cancel({ notifications: prayerAlarms });
                    } catch { status('حُفظت الإعدادات. افتح لوحة المواقيت لتحديث تنبيهات الهاتف.'); return; }
                }
                renderFavorites();
                status(standalone ? 'تم حفظ اختياراتك وتطبيقها بنجاح ✨' : 'تم حفظ اختياراتك.');
                refreshNotifications();
            };
        }

        const resetSettingsBtn = $('zad-reset-settings');
        if (resetSettingsBtn) {
            resetSettingsBtn.onclick = () => {
                if (!confirm('هل تريد استعادة الإعدادات الافتراضية للتطبيق؟ (لن يتم حذف علامات قراءة المصحف أو أذكارك المحفوظة)')) return;
                store.removeItem('selected_prayer_city');
                store.removeItem('user_manually_selected_city');
                store.removeItem('zad_prayer_method');
                store.removeItem('zad_prayer_school');
                store.removeItem('zad_font_size');
                store.removeItem('zad_hijri_offset');
                store.removeItem('zadmuslim-theme');
                store.removeItem('zad_favorites');
                status('تمت استعادة الإعدادات الافتراضية بنجاح.');
                setTimeout(() => location.reload(), 600);
            };
        }

        const exportBtn = $('zad-export-backup');
        if (exportBtn) {
            exportBtn.onclick = () => {
                const blob = new Blob([JSON.stringify(makeBackup(store), null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob), link = document.createElement('a');
                link.href = url; link.download = `zad-backup-${new Date().toISOString().slice(0,10)}.json`; link.click();
                setTimeout(() => URL.revokeObjectURL(url), 30000); status('تم تجهيز النسخة الاحتياطية للتحميل بنجاح ✨');
            };
        }

        const importInput = $('zad-import-backup');
        if (importInput) {
            importInput.onchange = async e => {
                try {
                    const file = e.target.files[0]; if (!file) return;
                    if (file.size > 5 * 1024 * 1024) throw Error('الملف أكبر من ٥ م.ب.');
                    const data = JSON.parse(await file.text()), entries = validateBackup(data);
                    if (!confirm(`استرجاع ${entries.length} إعداد وسجل؟ ستُستبدل القيم المطابقة ثم يُعاد فتح التطبيق.`)) return;
                    restoreBackup(store, data); location.reload();
                } catch (err) { status('تعذّر الاسترجاع: ' + err.message); }
                finally { e.target.value = ''; }
            };
        }

        const sendReportBtn = $('zad-send-report');
        if (sendReportBtn) {
            sendReportBtn.onclick = async () => {
                const detail = $('zad-report-text')?.value.trim();
                if (!detail) return status('اكتب تفاصيل الخطأ أو الملاحظة أولاً.');
                const loc = $('zad-report-location')?.value?.trim() || '';

                status('جاري إرسال البلاغ إلى لوحة تحكم المسؤول...');
                const payload = {
                    location: loc,
                    details: detail,
                    page: location.pathname + location.hash,
                    platform: (root.Capacitor?.isNativePlatform?.() ? root.Capacitor.getPlatform?.() : 'web') || 'web',
                    userAgent: navigator.userAgent || '',
                    createdAt: new Date().toISOString(),
                    timestamp: Date.now(),
                    status: 'new'
                };

                try {
                    let sent = false;
                    if (root.firebase?.database) {
                        try {
                            await root.firebase.database().ref('user_reports').push({
                                ...payload,
                                timestamp: root.firebase.database.ServerValue ? root.firebase.database.ServerValue.TIMESTAMP : Date.now()
                            });
                            sent = true;
                        } catch (_) {}
                    }
                    if (!sent) {
                        const res = await fetch('https://sadqah-jaddi-default-rtdb.firebaseio.com/user_reports.json', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        if (!res.ok) throw Error('تعذّر الاتصال بخادم البلاغات.');
                    }
                    if ($('zad-report-text')) $('zad-report-text').value = '';
                    if ($('zad-report-location')) $('zad-report-location').value = '';
                    status('جزاك الله خيراً، تم إرسال البلاغ إلى لوحة تحكم الإدارة بنجاح وستتم مراجعته وتصويبه فوراً ✨');
                } catch (err) {
                    const text = `الموضع: ${loc}\nالصفحة: ${location.pathname}${location.hash}\nالتفاصيل: ${detail}`;
                    location.href = 'mailto:abdelrahman.developer@gmail.com?subject=' + encodeURIComponent('بلاغ محتوى — زاد المسلم') + '&body=' + encodeURIComponent(text);
                    status('تم تحويل البلاغ إلى تطبيق البريد الإلكتروني.');
                }
            };
        }

        // إضافة لوحة إعدادات تاب المزيد في التطبيق
        document.querySelectorAll('.zad-open-tools').forEach(btn => btn.onclick = () => open().catch(e => status(e.message)));
        document.querySelectorAll('.zad-open-downloads').forEach(btn => btn.onclick = () => open('downloads').catch(e => status(e.message)));

        // تغليف فتح التنبيهات لضمان البدء بشاشة الإشعارات دائماً
        const origOpenNotif = root.openNotificationsModal;
        root.openNotificationsModal = function() {
            showNotificationsView();
            if (typeof origOpenNotif === 'function') origOpenNotif();
            else $('notifications-modal')?.classList.add('open');
        };

        renderFavorites();
        renderHomeSectionsSettings();
        applyHomeSectionsVisibility();
        if (standalone) refreshNotifications();
        if (!standalone && new URLSearchParams(location.search).get('panel') === 'notifications') root.openNotificationsModal();
        window.addEventListener('pageshow', event => {
            renderFavorites(); syncFavoriteCheckboxes(); applyFont();
            renderHomeSectionsSettings(); applyHomeSectionsVisibility();
            if (event.persisted && typeof root.fetchPrayerTimes === 'function') root.fetchPrayerTimes(store.getItem('selected_prayer_city') || 'Cairo');
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                renderFavorites(); syncFavoriteCheckboxes(); applyFont();
                renderHomeSectionsSettings(); applyHomeSectionsVisibility();
            }
        });
        document.addEventListener('zad:prayer-updated', () => {
            const settings = $('notif-view-settings');
            if (settings && settings.style.display !== 'none') refreshNotifications();
        });
        document.addEventListener('zad:home-sections-updated', () => {
            applyHomeSectionsVisibility();
            renderHomeSectionsSettings();
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'zad_favorites') { renderFavorites(); syncFavoriteCheckboxes(); }
            if (e.key === 'zad_font_size') applyFont();
            if (e.key === 'zad_home_sections') { applyHomeSectionsVisibility(); renderHomeSectionsSettings(); }
            if (['selected_prayer_city','zad_prayer_method','zad_prayer_school'].includes(e.key) && typeof root.fetchPrayerTimes === 'function') root.fetchPrayerTimes(store.getItem('selected_prayer_city') || 'Cairo');
        });
    }

    function revealHomeDestination() {
        if (!document.getElementById('home')) return;
        const id = location.hash.slice(1).split('?')[0];
        if (!['home','daily','services','sadaqa','smart-dhikr-panel','daily-wird'].includes(id)) return;
        const target = document.getElementById(id);
        if (!target) return;
        for (let el=target; el && el!==document.body; el=el.parentElement) {
            if (el.style.display === 'none') el.style.removeProperty('display');
        }
        if (id==='daily') {
            document.querySelector('.dashboard')?.style.removeProperty('display');
            document.getElementById('daily-journey-panel')?.style.removeProperty('display');
        }
        target.scrollIntoView({block:'start'});
    }
    window.addEventListener('hashchange', revealHomeDestination);
    document.addEventListener('click', event => {
        const link=event.target.closest?.('a[href^="#"]');
        if (link && link.hash===location.hash) revealHomeDestination();
    });
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', revealHomeDestination);
    else revealHomeDestination();

    root.ZadHomeSections = {
        HOME_SECTIONS,
        getHomeSectionsConfig,
        isHomeSectionVisible,
        setHomeSectionVisible,
        resetAllHomeSections,
        applyHomeSectionsVisibility,
        renderHomeSectionsSettings
    };

    root.ZadUserTools = {
        ...api,
        open,
        close,
        showSettingsView,
        showNotificationsView,
        renderFavorites,
        report(locationText) {
            open('report');
            const loc = $('zad-report-location');
            if (loc) loc.value = locationText || '';
            $('zad-report-text')?.focus();
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { init(); revealHomeDestination(); });
    else { init(); revealHomeDestination(); }
    window.addEventListener('pageshow', () => setTimeout(revealHomeDestination, 0));
})(typeof window === 'undefined' ? globalThis : window);
