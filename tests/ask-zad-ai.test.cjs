const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const knowledge = require('../assets/js/ask-zad-knowledge.js');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitForReply(predicate) {
    const deadline = Date.now() + 4000;
    while (!predicate()) {
        if (Date.now() > deadline) assert.fail('Assistant reply did not settle');
        await wait(10);
    }
}

function setup() {
    const dom = new JSDOM('<body></body>', { url: 'https://zad.test', runScripts: 'outside-only' });
    for (const name of ['ask-zad-knowledge', 'ask-zad']) {
        dom.window.eval(fs.readFileSync(`assets/js/${name}.js`, 'utf8'));
    }
    dom.window.AskZad.init();
    return dom;
}

test('specific sleep and worship questions take priority over generic distress', () => {
    assert.equal(knowledge.findBestAnswer('أنا تعبان ومش عارف أنام').data.id, 'empathy_insomnia');
    assert.equal(knowledge.findBestAnswer('أنا تعبان وحزين').data.id, 'empathy_distress');
    const sickPrayer = knowledge.findBestAnswer('حكم صلاة المريض تعبان ومش قادر يقف');
    assert.ok(!sickPrayer.found || sickPrayer.data.id.startsWith('fiqh_'));
    assert.equal(knowledge.findBestAnswer('أنا تعبان ما حكم سجود السهو').data.id, 'fiqh_sujud_sahw');
});

test('Gemini keeps its waiting indicator and renders a successful response', async () => {
    const dom = setup(), w = dom.window;
    try {
        let resolve, request;
        w.fetch = (url, options) => {
            request = { url, options };
            return new Promise(done => { resolve = done; });
        };
        w.AskZad.send('اشرح لي ظاهرة الشفق القطبي');
        await wait(400);
        assert.ok(w.document.querySelector('.ask-zad-typing-indicator'));
        assert.equal(request.url, '/api/ask-zad');
        assert.deepEqual(JSON.parse(request.options.body), { query: 'اشرح لي ظاهرة الشفق القطبي' });
        assert.ok(!request.url.includes('test-key'));
        assert.equal(request.options.headers['x-goog-api-key'], undefined);
        resolve({ ok: true, json: async () => ({ answer: 'إجابة تجريبية' }) });
        await wait(20);
        assert.equal(w.document.querySelector('.ask-zad-typing-indicator'), null);
        assert.match(w.document.querySelector('.ask-zad-msg-row.bot').textContent, /إجابة تجريبية/);
    } finally { w.close(); }
});

test('Gemini timeouts cover stalled fetch and response body; HTTP failures are visible', async t => {
    for (const mode of ['fetch', 'body', 'http']) {
        await t.test(mode, async () => {
            const dom = setup(), w = dom.window;
            try {
                const originalTimeout = w.setTimeout.bind(w);
                w.setTimeout = (fn, ms, ...args) => originalTimeout(fn, ms === 12000 ? 30 : ms, ...args);
                let signal;
                w.fetch = (_, options) => {
                    signal = options.signal;
                    if (mode === 'fetch') return new Promise(() => {});
                    return Promise.resolve({ ok: mode !== 'http', json: () => new Promise(() => {}) });
                };
                w.AskZad.send('اشرح لي ظاهرة الشفق القطبي');
                await waitForReply(() => w.document.querySelector('.ask-zad-msg-row.bot')?.textContent.includes('تعذّر الاتصال'));
                assert.match(w.document.querySelector('.ask-zad-msg-row.bot').textContent, /تعذّر الاتصال/);
                assert.equal(w.document.querySelector('.ask-zad-typing-indicator'), null);
                if (mode !== 'http') assert.equal(signal.aborted, true);
            } finally { w.close(); }
        });
    }
});

test('clearing a conversation aborts the active Gemini request without a late reply', async () => {
    const dom = setup(), w = dom.window;
    try {
        let signal;
        w.fetch = (_, options) => { signal = options.signal; return new Promise(() => {}); };
        w.AskZad.send('اشرح لي ظاهرة الشفق القطبي');
        await wait(400);
        w.AskZad.clear();
        await wait(20);
        assert.equal(signal.aborted, true);
        assert.equal(w.localStorage.getItem('zad_ask_zad_history'), null);
        assert.equal(w.document.querySelectorAll('.ask-zad-msg-row').length, 0);
    } finally { w.close(); }
});

test('native requests use the public server root and usage limits keep local suggestions available', async () => {
    const dom = setup(), w = dom.window;
    try {
        w.Capacitor = { isNativePlatform: () => true };
        w.getPublicAppUrl = () => 'https://zad.test/index.html';
        let request;
        w.fetch = async (url, options) => { request = { url, body: JSON.parse(options.body) }; return { ok: false, status: 429 }; };
        w.AskZad.send('اشرح لي ظاهرة الشفق القطبي');
        await wait(430);
        assert.equal(request.url, 'https://zad.test/api/ask-zad');
        assert.deepEqual(Object.keys(request.body), ['query']);
        assert.match(w.document.querySelector('.ask-zad-msg-row.bot').textContent, /حد الاستخدام/);
        assert.ok(w.document.querySelector('.ask-zad-action-btn'));
    } finally { w.close(); }
});

test('local answers and offline questions never send cloud requests', async () => {
    const dom = setup(), w = dom.window;
    try {
        let calls = 0;
        w.fetch = async () => { calls++; throw Error('Unexpected request'); };
        w.AskZad.send('افتح المصحف');
        await wait(430);
        assert.equal(calls, 0);
        Object.defineProperty(w.navigator, 'onLine', { value: false });
        w.AskZad.send('اشرح لي ظاهرة الشفق القطبي');
        await wait(430);
        assert.equal(calls, 0);
        assert.ok(w.document.querySelectorAll('.ask-zad-msg-row.bot').length >= 2);
    } finally { w.close(); }
});

test('initialization removes an old locally stored Gemini key', () => {
    const dom = new JSDOM('<body></body>', { url: 'https://zad.test', runScripts: 'outside-only' });
    try {
        dom.window.localStorage.setItem('zad_gemini_api_key', 'legacy-secret');
        dom.window.eval(fs.readFileSync('assets/js/ask-zad.js', 'utf8'));
        dom.window.AskZad.init();
        assert.equal(dom.window.localStorage.getItem('zad_gemini_api_key'), null);
    } finally { dom.window.close(); }
});
