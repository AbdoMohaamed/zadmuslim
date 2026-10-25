const test = require('node:test');
const assert = require('node:assert/strict');
const OneSignalService = require('../assets/js/onesignal-service.js');
const keys = require('web-push').generateVAPIDKeys();

function mockResponse() {
    const res = {
        statusCode: 200,
        headers: {},
        setHeader(k, v) { this.headers[k] = v; },
        status(code) { this.statusCode = code; return this; },
        json(data) { this.body = data; return this; }
    };
    return res;
}

test('OneSignalService.handleNotificationUrl correctly resolves services and avoids external escapes', () => {
    // Test 1: Full external URL is stripped to local path and stays in app
    let navigated = null;
    global.window = {
        location: { pathname: '/index.html', href: 'http://localhost/index.html', hash: '' }
    };
    Object.defineProperty(global.window.location, 'href', {
        set(val) { navigated = val; },
        get() { return 'http://localhost/index.html'; }
    });

    OneSignalService.handleNotificationUrl('https://zadmuslim-zeta.vercel.app/services.html#prayer-times');
    assert.equal(navigated, 'services.html#prayer-times');

    // Test 2: Legacy index.html#subpart-mushaf is remapped to services.html#subpart-mushaf
    navigated = null;
    OneSignalService.handleNotificationUrl('index.html#subpart-mushaf');
    assert.equal(navigated, 'services.html#subpart-mushaf');

    // Test 3: Standalone hash for services section maps to services.html if on index.html
    navigated = null;
    OneSignalService.handleNotificationUrl('#mood-compass-section');
    assert.equal(navigated, 'services.html#mood-compass-section');

    // Test 4: If already on services.html, openServiceView is invoked directly
    let openedView = null;
    global.window = {
        location: { pathname: '/services.html', href: 'http://localhost/services.html', hash: '' },
        openServiceView(hash) { openedView = hash; }
    };
    OneSignalService.handleNotificationUrl('services.html#azkar');
    assert.equal(openedView, '#azkar');

    // Test 5: Empty or ./ does not trigger navigation
    navigated = null;
    openedView = null;
    OneSignalService.handleNotificationUrl('./');
    assert.equal(navigated, null);
    assert.equal(openedView, null);
});

test('api/send-push respects channel selection and detailed reporting', async () => {
    const env = { ...process.env };
    const originalFetch = global.fetch;

    try {
        Object.assign(process.env, {
            FIREBASE_WEB_API_KEY: 'test',
            ADMIN_UIDS: 'admin1',
            FIREBASE_DATABASE_URL: 'https://db.test',
            VAPID_PUBLIC_KEY: keys.publicKey,
            VAPID_PRIVATE_KEY: keys.privateKey,
            ONESIGNAL_APP_ID: 'os-app-id',
            ONESIGNAL_REST_API_KEY: 'os-rest-key'
        });

        delete require.cache[require.resolve('../api/send-push')];
        const handler = require('../api/send-push');

        const fetchCalls = [];
        global.fetch = async (url, opts) => {
            fetchCalls.push({ url, opts });
            if (url.includes('accounts:lookup')) {
                return { ok: true, json: async () => ({ users: [{ localId: 'admin1' }] }) };
            }
            if (url.includes('api.onesignal.com/notifications')) {
                return { ok: true, json: async () => ({ id: 'os-msg-123', recipients: 42 }) };
            }
            if (url.includes('push_subscribers.json')) {
                return { ok: true, json: async () => null };
            }
            return { ok: true, json: async () => ({}) };
        };

        // 1. Send mobile only
        const reqMobile = {
            method: 'POST',
            headers: { authorization: 'Bearer token' },
            body: { title: 'تنبيه', body: 'نص التنبيه', channel: 'mobile' }
        };
        let res = mockResponse();
        await handler(reqMobile, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.channels.mobile.success, true);
        assert.equal(res.body.channels.mobile.recipients, 42);
        assert.equal(res.body.channels.web.attempted, false);

        // 2. Database read failure aborts before OneSignal to prevent duplicate pushes
        fetchCalls.length = 0;
        global.fetch = async (url) => {
            if (url.includes('accounts:lookup')) {
                return { ok: true, json: async () => ({ users: [{ localId: 'admin1' }] }) };
            }
            if (url.includes('push_subscribers.json')) {
                return { ok: false, status: 502 };
            }
            if (url.includes('onesignal')) {
                throw new Error('OneSignal should NOT be called when DB read fails!');
            }
            return { ok: true, json: async () => ({}) };
        };

        const reqAll = {
            method: 'POST',
            headers: { authorization: 'Bearer token' },
            body: { title: 'تنبيه', body: 'نص التنبيه', channel: 'all' }
        };
        res = mockResponse();
        await handler(reqAll, res);
        assert.equal(res.statusCode, 502);
        assert.equal(res.body.preventedSend, true);
        assert.ok(fetchCalls.every(c => !c.url.includes('onesignal')), 'OneSignal was protected from redundant dispatch');

    } finally {
        global.fetch = originalFetch;
        for (const k of Object.keys(process.env)) {
            if (!(k in env)) delete process.env[k];
        }
        Object.assign(process.env, env);
        delete require.cache[require.resolve('../api/send-push')];
    }
});
