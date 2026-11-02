const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync('assets/js/app.js', 'utf8');
const start = source.indexOf('let deferredPrompt = null;');
const code = source.slice(start, source.indexOf('let prayerTimings = null;', start));

function setup({ ios = false, native = false, mode = null, flag = false, blockedStorage = false } = {}) {
    const dom = new JSDOM(`<body><button id="btn-install-app"></button>
        <div id="pwa-install-banner" style="display:none"><button id="btn-pwa-banner-install"></button><button id="btn-pwa-banner-dismiss"></button></div>
        <div id="ios-install-modal"><button id="btn-close-ios-install-modal"></button><button id="btn-ios-install-understood"></button></div></body>`,
        { url: 'https://zad.test/services.html', runScripts: 'outside-only', pretendToBeVisual: true });
    const w = dom.window, timers = new Map(), modes = new Map(); let timerId = 0, nativeActive = native;
    w.setTimeout = fn => { timers.set(++timerId, fn); return timerId; };
    w.clearTimeout = id => timers.delete(id);
    w.matchMedia = query => {
        if (!modes.has(query)) { const media = new w.EventTarget(); media.matches = query === '(display-mode: ' + mode + ')'; modes.set(query, media); }
        return modes.get(query);
    };
    Object.defineProperty(w.navigator, 'userAgent', { value: ios ? 'iPhone Safari' : 'Android Chrome', configurable: true });
    Object.defineProperty(w.navigator, 'standalone', { value: false, writable: true });
    w.Capacitor = { isNativePlatform: () => nativeActive, getPlatform: () => nativeActive ? (ios ? 'ios' : 'android') : 'web' };
    if (flag) w.localStorage.setItem('zad_app_installed', 'true');
    if (blockedStorage) Object.defineProperty(w, 'localStorage', { value: { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } } });
    w.eval(code + '\ninitPWA();');
    return { dom, w, timers, modes, banner: w.document.getElementById('pwa-install-banner'),
        button: w.document.getElementById('btn-install-app'), setNative(value) { nativeActive = value; },
        flush() { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()); },
        prompt(outcome = 'accepted') {
            const event = new w.Event('beforeinstallprompt', { cancelable: true });
            event.prompt = async () => {}; event.userChoice = Promise.resolve({ outcome });
            w.dispatchEvent(event); return event;
        } };
}

test('installed Android and iOS native/PWA display modes never display installation UI', () => {
    for (const options of [{ native: true }, { native: true, ios: true }, { mode: 'standalone' }, { mode: 'minimal-ui' }, { mode: 'fullscreen' }, { ios: true, mode: 'standalone' }, { flag: true }]) {
        const h = setup(options); try {
            h.prompt(); h.flush();
            assert.equal(h.banner.style.display, 'none'); assert.equal(h.button.style.display, 'none');
        } finally { h.dom.window.close(); }
    }
});

test('Android browser promotion requires an actual install prompt; installation cancels pending display', () => {
    const h = setup(); try {
        h.flush(); assert.equal(h.banner.style.display, 'none');
        const event = h.prompt(); assert.equal(event.defaultPrevented, true);
        h.flush(); assert.equal(h.banner.style.display, 'flex');
        h.w.dispatchEvent(new h.w.Event('appinstalled')); h.flush();
        assert.equal(h.banner.style.display, 'none'); assert.equal(h.button.style.display, 'none');
        assert.equal(h.w.localStorage.getItem('zad_app_installed'), 'true');
        h.w.dispatchEvent(new h.w.Event('pageshow')); h.prompt(); h.flush();
        assert.equal(h.banner.style.display, 'none');
    } finally { h.dom.window.close(); }
});

test('late native bridge and changed display mode hide an already visible banner', () => {
    for (const native of [true, false]) {
        const h = setup(); try {
            h.prompt(); h.flush(); assert.equal(h.banner.style.display, 'flex');
            if (native) { h.setNative(true); h.w.document.dispatchEvent(new h.w.Event('deviceready')); }
            else { const media = h.modes.get('(display-mode: standalone)'); media.matches = true; media.dispatchEvent(new h.w.Event('change')); }
            h.flush(); assert.equal(h.banner.style.display, 'none');
            assert.equal(h.w.localStorage.getItem('zad_app_installed'), 'true');
        } finally { h.dom.window.close(); }
    }
});

test('iOS home-screen detection on pageshow hides the guide, and dismissals survive pending timers', () => {
    const h = setup({ ios: true }); try {
        h.flush(); assert.equal(h.banner.style.display, 'flex');
        h.button.click(); assert.ok(h.w.document.getElementById('ios-install-modal').classList.contains('open'));
        h.w.navigator.standalone = true; h.w.dispatchEvent(new h.w.Event('pageshow'));
        assert.equal(h.banner.style.display, 'none');
        assert.ok(!h.w.document.getElementById('ios-install-modal').classList.contains('open'));
    } finally { h.dom.window.close(); }
    const dismissed = setup({ ios: true }); try {
        dismissed.w.document.getElementById('btn-pwa-banner-dismiss').click(); dismissed.flush();
        assert.equal(dismissed.banner.style.display, 'none');
    } finally { dismissed.dom.window.close(); }
});

test('accepted browser install hides UI even without appinstalled, and unavailable storage does not break detection', async () => {
    const h = setup(); try {
        h.prompt(); h.button.click(); await new Promise(resolve => setImmediate(resolve)); h.flush();
        assert.equal(h.banner.style.display, 'none'); assert.equal(h.w.localStorage.getItem('zad_app_installed'), 'true');
    } finally { h.dom.window.close(); }
    const blocked = setup({ ios: true, mode: 'standalone', blockedStorage: true }); try {
        blocked.flush(); assert.equal(blocked.banner.style.display, 'none');
    } finally { blocked.dom.window.close(); }
});
