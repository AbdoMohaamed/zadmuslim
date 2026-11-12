const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

for (const file of ['index.html', 'www/index.html']) {
    test(`${file}: charity names are text and sharing has a manual fallback`, async () => {
        const html = fs.readFileSync(file, 'utf8');
        const source = html.slice(html.indexOf('        function makeCard()'), html.indexOf("        document.addEventListener('keydown', e => {", html.indexOf('        function makeCard()')));
        const dom = new JSDOM('<input id="deceased" required><div id="cardResult"></div>', { url: 'https://preview.test/', runScripts: 'outside-only' });
        try {
            const w = dom.window, d = w.document;
            const app = fs.readFileSync(file.replace('index.html', 'assets/js/app.js'), 'utf8');
            w.eval(app.slice(0, app.indexOf(';') + 1));
            w.eval(source);
            w.makeCard();
            assert.equal(d.querySelector('#cardResult').children.length, 0);
            const name = '<img src=x onerror=alert(1)>';
            d.querySelector('input').value = name;
            w.makeCard();
            assert.equal(d.querySelector('#cardResult img'), null);
            assert.ok(d.querySelector('.notice p').textContent.includes(name));
            await d.querySelector('#cardResult button').onclick();
            const fallback = d.querySelector('textarea');
            assert.ok(fallback.readOnly);
            assert.ok(fallback.value.includes(name));
            assert.equal(fallback.value.split('\n\n').at(-1), 'https://play.google.com/store/apps/details?id=com.abdomohamed.zadmuslim');
            Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async text => { assert.ok(text.includes(name)); } }, configurable: true });
            await d.querySelector('#cardResult button').onclick();
            assert.match(d.querySelector('#cardResult button').textContent, /تم نسخ/);
        } finally { dom.window.close(); }
    });
}
