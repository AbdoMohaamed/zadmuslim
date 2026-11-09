(() => {
    if (document.readyState !== 'loading') return;

    const excerpts = location.hash.split('?')[0] === '#islamic-media';
    if (excerpts) document.documentElement.classList.add('zad-excerpts-pending');
    let loader;
    const observer = new MutationObserver(() => {
        if (document.body) showLoader();
    });
    function showLoader() {
        observer.disconnect();
        let language = document.documentElement.lang;
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
        document.body.prepend(loader);
    }
    const delay = setTimeout(() => {
        if (document.body) showLoader();
        else observer.observe(document.documentElement, { childList: true });
    }, 150);

    document.addEventListener('DOMContentLoaded', () => {
        clearTimeout(delay);
        observer.disconnect();
        document.documentElement.classList.remove('zad-excerpts-pending');
        loader?.remove();
    }, { once: true });
})();
