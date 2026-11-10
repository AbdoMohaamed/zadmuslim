/* Visible from parsing through the first ready paint, including Safari page restores. */
(() => {
    if (window.ZadRouteLoading) return;
    let loader, watchdog, revision = 0;
    const root = document.documentElement;
    const excerpts = location.hash.split('?')[0] === '#islamic-media';
    function hide() {
        revision++;
        clearTimeout(watchdog);
        loader?.remove();
        loader = null;
        root.classList.remove('zad-excerpts-pending');
    }
    function show() {
        revision++;
        clearTimeout(watchdog);
        if (!loader) {
            let language = root.lang;
            try { language = localStorage.getItem('zad_language') || language; } catch (_) {}
            const labels = {
                ar: excerpts ? 'جارٍ تحميل المقتطفات…' : 'جارٍ تحميل المحتوى…',
                en: excerpts ? 'Loading excerpts…' : 'Loading content…',
                ur: excerpts ? 'اقتباسات لوڈ ہو رہے ہیں…' : 'مواد لوڈ ہو رہا ہے…'
            };
            language = ['ar', 'en', 'ur'].includes(language) ? language : 'ar';
            loader = document.createElement('div');
            loader.id = 'zad-route-loader';
            loader.lang = language;
            loader.dir = language === 'en' ? 'ltr' : 'rtl';
            loader.setAttribute('role', 'status');
            loader.setAttribute('data-i18n-skip', '');
            const ring = document.createElement('span');
            ring.className = 'zad-loading-ring';
            ring.setAttribute('aria-hidden', 'true');
            loader.append(ring, labels[language]);
            // Outside body: language and persistent-radio visibility rules must not hide it.
            root.appendChild(loader);
        }
        // A failed/cancelled navigation must never permanently cover usable content.
        watchdog = setTimeout(hide, 12000);
    }
    function ready() {
        const current = revision;
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (revision === current) hide();
        }));
    }
    window.ZadRouteLoading = { show, hide, ready };
    if (document.readyState === 'loading') {
        if (excerpts) root.classList.add('zad-excerpts-pending');
        show();
        document.addEventListener('DOMContentLoaded', ready, { once: true });
    }
    window.addEventListener('pageshow', event => { if (event.persisted) hide(); });
    window.addEventListener('pagehide', hide);
    // Do not intercept the navigation; preserve native links, gestures and radio handling.
    document.addEventListener('click', event => {
        const link = event.target.closest?.('a[href]');
        if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
        let url;
        try { url = new URL(link.href, location.href); } catch (_) { return; }
        if (url.origin !== location.origin || !/\/(?:index|services|settings|privacy|admin|embed|app)\.html$/.test(url.pathname)) return;
        if (url.pathname === location.pathname && url.search === location.search) return;
        show();
    });
})();
