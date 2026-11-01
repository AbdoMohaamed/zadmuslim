const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

test('cached prayer categories, IDs and counters cannot inject markup or event attributes', async () => {
    const dom = new JSDOM('<body><div id="wall-duas-grid"></div></body>', { url: 'https://zad.test', runScripts: 'outside-only' });
    const w = dom.window;
    try {
        const attack = '\"><img src=x onerror="window.attacked=true">';
        w.localStorage.setItem('wall_duas_cache', JSON.stringify([
            { id: attack, category: attack, author: attack, text: attack, amenCount: attack, timestamp: Date.now() },
            { id: 'valid', category: 'shifa', author: 'اسم', text: 'دعاء', amenCount: 5, timestamp: Date.now() },
            { id: 'prototype', category: '__proto__', author: 'اسم', text: 'دعاء', amenCount: 1, timestamp: Date.now() }
        ]));
        w.eval(fs.readFileSync('assets/js/wall-of-duas.js', 'utf8'));
        await tick();
        const grid = w.document.getElementById('wall-duas-grid');
        assert.equal(grid.querySelectorAll('.dua-wall-card').length, 3);
        assert.equal(grid.querySelector('img,script,[onerror]'), null);
        assert.equal(grid.querySelector('.dua-wall-card').dataset.category, 'faraj');
        assert.equal(grid.querySelector('.dua-wall-card').dataset.id, attack);
        assert.equal(grid.querySelector('[data-id="valid"]').dataset.category, 'shifa');
        assert.equal(grid.querySelector('[data-id="prototype"]').dataset.category, 'faraj');
    } finally { w.close(); }
});

test('community prayer validation accepts known categories and rejects injected or reserved ones', () => {
    const predicate = JSON.parse(fs.readFileSync('database.rules.json', 'utf8')).rules.community_duas.$id['.validate'];
    for (const category of ['shifa', 'faraj', 'rizq', 'tawfeeq', 'hidaya', 'rahma', 'all', 'mine', '__proto__', '<img>', null]) {
        const record = { category, text: 'دعاء', author: 'اسم', timestamp: Date.now() };
        const snapshot = value => ({
            val: () => value,
            isString: () => typeof value === 'string',
            child: name => snapshot(value?.[name]),
            hasChildren: names => names.every(name => value?.[name] != null)
        });
        assert.equal(vm.runInNewContext(predicate, { newData: snapshot(record) }), ['shifa', 'faraj', 'rizq', 'tawfeeq', 'hidaya', 'rahma'].includes(category), String(category));
    }
});

test('zakat labels identify reference prices and currency changes discard stale manual prices', async () => {
    const dom = new JSDOM(`<body><section id="zakat-calculator-section">
        <select id="zakat-currency-select"><option>SAR</option><option>EGP</option></select>
        <form id="zakat-calculator-form"><input type="number" id="zakat-gold24-price"><input type="number" id="zakat-silver-price"></form>
        <span id="zakat-prices-date"></span><span id="zakat-res-nisab-value"></span>
        </section></body>`, { url: 'https://zad.test', runScripts: 'outside-only' });
    const w = dom.window, d = w.document;
    try {
        w.eval(fs.readFileSync('assets/js/zakat-calculator.js', 'utf8'));
        await tick();
        const label = d.getElementById('zakat-prices-date');
        assert.match(label.textContent, /قيم مرجعية غير محدثة/);
        assert.doesNotMatch(label.textContent, /اليوم|\d/);
        d.getElementById('zakat-gold24-price').value = '4000';
        d.getElementById('zakat-silver-price').value = '50';
        w.calculateZakat();
        assert.match(label.textContent, /يدويًا/);
        const select = d.getElementById('zakat-currency-select');
        select.value = 'EGP'; select.dispatchEvent(new w.Event('change'));
        assert.equal(d.getElementById('zakat-gold24-price').value, '');
        assert.equal(d.getElementById('zakat-silver-price').value, '');
        assert.match(label.textContent, /قيم مرجعية غير محدثة/);
        assert.match(d.getElementById('zakat-res-nisab-value').textContent, /ج\.م/);
    } finally { w.close(); }
});
