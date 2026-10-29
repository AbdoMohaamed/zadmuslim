const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const AskZadKnowledge = require('../assets/js/ask-zad-knowledge.js');

test('AskZadKnowledge normalizes Arabic text properly', () => {
    assert.equal(AskZadKnowledge.normalizeArabic('أَحْكَامُ الصَّلَاةِ'), 'احكام الصلاه');
    assert.equal(AskZadKnowledge.normalizeArabic('إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ'), 'اياك نعبد واياك نستعين');
    assert.equal(AskZadKnowledge.normalizeArabic('فِي هُدًى'), 'في هدي');
});

test('AskZadKnowledge accurately matches fiqh and quran questions', () => {
    // 1. صلاة الجنازة
    const janazah = AskZadKnowledge.findBestAnswer('كيف اصلي صلاة الجنازة بالتفصيل؟');
    assert.ok(janazah.found);
    assert.equal(janazah.data.id, 'fiqh_salat_janazah');
    assert.ok(janazah.data.answer.includes('التكبيرة الأولى'));
    assert.ok(janazah.data.actions.some(a => a.href.includes('islamic-guide') || a.href.includes('sadaqa')));

    // 2. سجود السهو
    const sahw = AskZadKnowledge.findBestAnswer('احكام سجود السهو قبل ولا بعد السلام');
    assert.ok(sahw.found);
    assert.equal(sahw.data.id, 'fiqh_sujud_sahw');
    assert.ok(sahw.data.answer.includes('قبل السلام'));
    assert.ok(sahw.data.answer.includes('بعد السلام'));

    // 3. آيات الصبر
    const sabr = AskZadKnowledge.findBestAnswer('عايز اية وتفسير عن الصبر والابتلاء');
    assert.ok(sabr.found);
    assert.equal(sabr.data.id, 'quran_sabr');
    assert.ok(sabr.data.answer.includes('الصابرون'));

    // 4. زكاة المال
    const zakat = AskZadKnowledge.findBestAnswer('كيف احسب زكاة مالي والذهب المدخر؟');
    assert.ok(zakat.found);
    assert.equal(zakat.data.id, 'zakat_calculator_info');
    assert.ok(zakat.data.answer.includes('85'));
    assert.ok(zakat.data.actions.some(a => a.href.includes('zakat-calculator')));

    // 5. دعاء الكرب والهم
    const karb = AskZadKnowledge.findBestAnswer('دعاء تفريج الهم والحزن وفك الكرب');
    assert.ok(karb.found);
    assert.equal(karb.data.id, 'azkar_hamm_karb');
    assert.ok(karb.data.answer.includes('ذي النون'));

    // 6. إذاعة القرآن
    const radio = AskZadKnowledge.findBestAnswer('عايز اسمع اذاعة القران الكريم القاهرة');
    assert.ok(radio.found);
    assert.equal(radio.data.id, 'app_radio');
    assert.ok(radio.data.actions.some(a => a.href.includes('radio-panel')));
});

test('AskZadKnowledge provides helpful suggestions for unfamiliar queries', () => {
    const fallback = AskZadKnowledge.findBestAnswer('سؤال عشوائي غير موجود إطلاقاً في المعرفة');
    assert.equal(fallback.found, false);
    assert.ok(fallback.suggestions.length > 0);
});

test('AskZad UI initializes, manages chat lifecycle, and stores history safely in DOM', async () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
        url: 'http://localhost:4173/index.html',
        runScripts: 'dangerously'
    });

    const window = dom.window;
    global.window = window;
    global.document = window.document;
    global.localStorage = window.localStorage;

    window.AskZadKnowledge = AskZadKnowledge;
    const AskZad = require('../assets/js/ask-zad.js');

    // Init UI
    AskZad.init();
    assert.ok(window.document.getElementById('btn-ask-zad-fab'));
    assert.ok(window.document.getElementById('ask-zad-modal'));

    // Open chat
    AskZad.open();
    assert.ok(window.document.getElementById('ask-zad-modal').classList.contains('is-active'));

    // Send query
    AskZad.send('أحكام سجود السهو');

    // Wait for async processing
    await new Promise(r => setTimeout(r, 450));

    const messages = window.document.querySelectorAll('.ask-zad-msg-row');
    assert.ok(messages.length >= 2, 'Should have user and bot messages');

    // Check localStorage persistence
    const saved = JSON.parse(window.localStorage.getItem('zad_ask_zad_history'));
    assert.ok(Array.isArray(saved) && saved.length >= 2);
    assert.equal(saved[0].sender, 'user');
    assert.equal(saved[1].sender, 'bot');

    // Clear chat
    AskZad.clear();
    assert.equal(window.localStorage.getItem('zad_ask_zad_history'), null);

    // Close chat
    AskZad.close();
    assert.ok(!window.document.getElementById('ask-zad-modal').classList.contains('is-active'));
});
