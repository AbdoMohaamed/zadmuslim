const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync('assets/js/reading-font.js', 'utf8');
const original = 'أَذْكَارٌ إِيمَانٌ آيَةٌ ا\u0654 ا\u0655 ا\u0653';
function setup(saved = {}, url = 'https://reading.test') {
    const dom = new JSDOM('<section id="azkar"><div class="container"><p class="azkar-text" style="font-size:24px"></p></div></section><section><div class="sadaqa-hadith-card"><p class="sadaqa-hadith-text">حَدِيثٌ</p></div></section>', { url, runScripts: 'outside-only' });
    const w = dom.window;
    w.document.documentElement.style.fontSize = '16px';
    w.document.querySelector('.azkar-text').innerHTML = `<strong>${original}</strong>`;
    for (const [key, value] of Object.entries(saved)) w.localStorage.setItem(key, value);
    w.eval(source);
    w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
    return dom;
}
const tick = w => new Promise(resolve => w.setTimeout(resolve, 0));
test('diacritics restore exactly, preserve markup and letter hamzas, and follow replaced content', async () => {
    const d = setup(), w = d.window;
    try {
        const bar = w.document.querySelector('.reading-font-controls');
        const toggle = bar.querySelector('input');
        const text = w.document.querySelector('.azkar-text');
        toggle.click();
        assert.equal(text.textContent, 'أذكار إيمان آية ا\u0654 ا\u0655 ا\u0653');
        assert.ok(text.querySelector('strong'));
        assert.equal(w.document.querySelector('.sadaqa-hadith-text').textContent, 'حَدِيثٌ');
        toggle.click();
        assert.equal(text.textContent, original);
        toggle.click();
        text.querySelector('strong').firstChild.data = 'ذِكْرٌ جَدِيدٌ';
        await tick(w);
        assert.equal(text.textContent, 'ذكر جديد');
        toggle.click();
        assert.equal(text.textContent, 'ذِكْرٌ جَدِيدٌ');
    } finally { w.close(); }
});
test('four fonts, saved preferences, dynamic cards, size bounds and full reset', async () => {
    const d = setup({ zad_reading_font_azkar: '140', zad_reading_font_azkar_options: JSON.stringify({font:'naskh', showMarks:false}) }), w = d.window;
    try {
        const bar = w.document.querySelector('.reading-font-controls');
        const select = bar.querySelector('select');
        const panel = bar.querySelector('.reading-font-panel');
        const toggle = bar.querySelector('[data-toggle]');
        assert.equal(panel.hidden, true);
        assert.equal(bar.querySelector('[data-step="10"]').closest('[hidden]'), null);
        assert.equal(bar.querySelector('.reading-font-hint').hidden, false);
        toggle.click();
        assert.equal(panel.hidden, false);
        assert.equal(toggle.getAttribute('aria-expanded'), 'true');
        assert.equal(bar.querySelector('output').textContent, '140٪');
        assert.equal(bar.querySelector('.reading-font-hint').hidden, true);
        assert.equal(w.localStorage.getItem('zad_reading_font_azkar_hint_seen'), '1');
        toggle.click();
        assert.equal(panel.hidden, true);
        assert.equal(select.options.length, 4);
        assert.equal(select.value, 'naskh');
        assert.equal(bar.querySelector('input').checked, false);
        for (const value of ['scheherazade', 'cairo', 'amiri', 'naskh']) {
            select.value = value;
            select.dispatchEvent(new w.Event('change', {bubbles:true}));
            assert.equal(JSON.parse(w.localStorage.getItem('zad_reading_font_azkar_options')).font, value);
        }
        const fresh = w.document.createElement('p');
        fresh.className = 'azkar-text'; fresh.style.fontSize = '24px'; fresh.textContent = 'ذِكْرٌ';
        w.document.querySelector('#azkar .container').append(fresh);
        await tick(w);
        assert.equal(fresh.textContent, 'ذكر');
        assert.ok(fresh.style.fontFamily.includes('Noto Naskh Arabic'));
        assert.equal(fresh.style.fontSize, w.document.querySelector('.azkar-text').style.fontSize);
        assert.equal(w.document.querySelectorAll('.reading-font-controls').length, 2);
        for(let i=0;i<20;i++) bar.querySelector('[data-step="10"]').click();
        assert.equal(bar.querySelector('output').textContent, '200٪');
        assert.ok(bar.querySelector('[data-step="10"]').disabled);
        bar.querySelector('[data-reset]').click();
        assert.equal(select.value, 'amiri');
        assert.equal(fresh.textContent, 'ذِكْرٌ');
        assert.equal(bar.querySelector('output').textContent, '100٪');
    } finally { w.close(); }
});
test('reading hint stays hidden on later visits', () => {
    const d = setup({zad_reading_font_azkar_hint_seen: '1'});
    try { assert.equal(d.window.document.querySelector('.reading-font-hint').hidden, true); }
    finally { d.window.close(); }
});
test('settings links open only the requested reading controls without changing saved choices', async () => {
    for (const name of ['azkar', 'hadith']) {
        const d = setup({ ['zad_reading_font_' + name]: '150' }, 'https://reading.test/?reading=' + name);
        try {
            const bars=d.window.document.querySelectorAll('.reading-font-controls');
            const index=name==='azkar'?0:1;
            assert.equal(bars[index].querySelector('.reading-font-panel').hidden,false);
            assert.equal(bars[1-index].querySelector('.reading-font-panel').hidden,true);
            assert.equal(bars[index].querySelector('output').textContent,'150٪');
            assert.equal(d.window.localStorage.getItem('zad_reading_font_' + name),'150');
            assert.ok(d.window.document.querySelector('.azkar-text').classList.contains('reading-text-custom'));
            await tick(d.window);
        } finally { d.window.close(); }
    }
});
test('invalid saved options fall back safely', () => {
    for (const value of ['null', '{bad', '{"font":"__proto__","showMarks":"no"}']) {
        const d = setup({zad_reading_font_azkar_options:value});
        try { assert.equal(d.window.document.querySelector('.reading-font-controls select').value, 'amiri'); }
        finally { d.window.close(); }
    }
});
