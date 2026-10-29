// ==========================================================================
// زاد المسلم • المتحكم المركزي الموحد للمظهر (Authoritative Theme Controller)
// ==========================================================================

(function() {
    'use strict';

    const STORAGE_KEY = 'zadmuslim-theme';
    const LEGACY_STORAGE_KEY = 'sadqah_theme';

    // كشف فوري لمنصة التشغيل (iOS / Android / Capacitor) لضبط الرأس والحواف الآمنة فوراً بدون تأخير
    try {
        const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
        const isIOS = /iPad|iPhone|iPod/.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isAndroid = /Android/i.test(ua) || (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android');

        if (isIOS) {
            document.documentElement.classList.add('ios-device');
        } else if (isAndroid) {
            document.documentElement.classList.add('android-device');
        }
        if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
            document.documentElement.classList.add('capacitor-native-app');
        }
    } catch(e) {}

    /**
     * قراءة المظهر وتحديده بأمان:
     * 1. التحقق من التفضيل المحفوظ تحت 'zadmuslim-theme'
     * 2. إن لم يوجد، نقل التفضيل القديم 'sadqah_theme' بأمان دون الكتابة فوقه
     * 3. إذا كان التفضيل 'system' أو لم يحدد المستخدم تفضيلاً، يتم اعتماد تفضيل النظام
     */
    function resolveTheme() {
        let saved = null;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                // ترحيل آمن للتفضيل القديم
                const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
                if (legacy === 'light' || legacy === 'dark') {
                    saved = legacy;
                    localStorage.setItem(STORAGE_KEY, saved);
                }
            }
        } catch (e) {
            console.warn('localStorage is restricted:', e);
        }

        if (saved === 'light' || saved === 'dark') {
            return { theme: saved, isExplicit: true };
        }

        // إذا كان التفضيل system أو أول زيارة للموقع
        const systemTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? 'dark'
            : 'light';

        return { theme: systemTheme, isExplicit: (saved === 'system') };
    }

    /**
     * تطبيق المظهر فوراً على مستند DOM
     * @param {string} theme ('light' | 'dark')
     * @param {string|boolean} persistMode (true | false | 'system')
     */
    function applyTheme(theme, persistMode = false) {
        const isLight = (theme === 'light');
        const resolvedTheme = isLight ? 'light' : 'dark';
        const root = document.documentElement;

        // تطبيق السمات الدلالية الموحدة
        root.setAttribute('data-theme', resolvedTheme);
        root.style.colorScheme = resolvedTheme;
        root.classList.toggle('light-theme', isLight);

        if (document.body) {
            document.body.classList.toggle('light-theme', isLight);
        }

        // حفظ التفضيل عند التبديل اليدوي
        if (persistMode === true) {
            try {
                localStorage.setItem(STORAGE_KEY, resolvedTheme);
            } catch (e) {}
        } else if (persistMode === 'system') {
            try {
                localStorage.setItem(STORAGE_KEY, 'system');
            } catch (e) {}
        }

        // تحديث لون شريط الحالة في متصفحات الهواتف
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', isLight ? '#F7F9F6' : '#081C17');
        }

        // تحديث أيقونات التبديل عبر كامل عناصر الصفحة
        updateIcons(isLight);

        // إطلاق حدث للمكونات التي تعتمد على المظهر
        window.dispatchEvent(new CustomEvent('zadThemeChanged', {
            detail: { theme: resolvedTheme, isLight }
        }));
    }

    function updateIcons(isLight) {
        document.querySelectorAll('#theme-toggle-icon, .btn-theme-toggle i, #app-theme-icon').forEach(icon => {
            if (isLight) {
                icon.className = 'fa-solid fa-moon';
            } else {
                icon.className = 'fa-solid fa-circle-half-stroke text-gold';
            }
        });

        document.querySelectorAll('#theme-toggle-text, #mobile-theme-toggle-text').forEach(el => {
            el.textContent = isLight ? 'المظهر الليلي' : 'المظهر النهاري';
        });
    }

    // تبديل المظهر عند نقر المستخدم
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || resolveTheme().theme;
        const next = (current === 'light') ? 'dark' : 'light';
        applyTheme(next, true);

        if (typeof window.showToast === 'function') {
            window.showToast(next === 'light' ? 'تم تفعيل المظهر النهاري ☀️' : 'تم تفعيل المظهر الليلي الملكي 🌙');
        }
    }

    function onThemeButtonClick(e) {
        if (e) e.preventDefault();
        toggleTheme();
    }

    // ربط أزرار المظهر بطريقة آمنة غير قابلة للتكرار
    function bindThemeButtons() {
        const toggleSelectors = [
            '#btn-toggle-theme-nav',
            '#app-btn-theme-toggle',
            '#app-btn-toggle-theme-more',
            '#btn-mobile-theme-toggle',
            '#admin-theme-toggle',
            '.btn-theme-toggle'
        ];

        document.querySelectorAll(toggleSelectors.join(', ')).forEach(btn => {
            if (btn.__zadThemeBound) return;
            btn.__zadThemeBound = true;
            btn.addEventListener('click', onThemeButtonClick);
        });

        updateIcons(document.documentElement.getAttribute('data-theme') === 'light');
    }

    // التهيئة الفورية وترحيل المفاتيح القديمة عند معالجة الملف
    const initialThemeInfo = resolveTheme();
    applyTheme(initialThemeInfo.theme, false);

    // إتاحة الكائن البرمجي للمنصة
    window.zadTheme = {
        get: function() {
            return document.documentElement.getAttribute('data-theme') || resolveTheme().theme;
        },
        getSavedPreference: function() {
            try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
        },
        set: function(theme, persist = true) {
            applyTheme(theme, persist);
        },
        toggle: toggleTheme,
        init: function() {
            bindThemeButtons();
        }
    };
    window.ThemeController = window.zadTheme;

    // مزامنة فورية بين جميع التبويبات المفتوحة في المتصفح
    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY || e.key === LEGACY_STORAGE_KEY) {
            const nextTheme = (e.newValue === 'light' || e.newValue === 'dark')
                ? e.newValue
                : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            applyTheme(nextTheme, false);
        }
    });

    // الاستماع لتغييرات تفضيل النظام فقط إذا لم يكن للمستخدم تفضيل يدوي صريح
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            try {
                const explicit = localStorage.getItem(STORAGE_KEY);
                // تجاهل تفضيل النظام إذا كان المستخدم قد اختار 'light' أو 'dark' يدوياً
                if (!explicit || explicit === 'system') {
                    applyTheme(e.matches ? 'dark' : 'light', false);
                }
            } catch (err) {}
        });
    }

    // إزالة كلاس كبح الانتقالات بعد اكتمال جاهزية الصفحة
    function enableTransitions() {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.documentElement.classList.remove('preload-theme-no-transitions');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            bindThemeButtons();
            enableTransitions();
        });
    } else {
        bindThemeButtons();
        enableTransitions();
    }

    // حماية واجهة التطبيق من تشويش كونسول المتصفح بأخطاء إضافات المتصفح الخارجية (Chrome/Edge Extensions)
    window.addEventListener('unhandledrejection', function(event) {
        try {
            const reason = event ? event.reason : null;
            const msg = reason && (reason.message || String(reason));
            const stack = reason && (reason.stack || '');
            if (
                (msg && (msg.includes('M_ID') || msg.includes("reading 'M_ID'"))) ||
                (stack && (stack.includes('200.js') || stack.includes('chrome-extension://') || stack.includes('moz-extension://')))
            ) {
                event.preventDefault();
            }
        } catch (_) {}
    });
})();
