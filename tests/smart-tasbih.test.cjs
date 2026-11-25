const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const script = fs.readFileSync('assets/js/smart-tasbih.js', 'utf8');

function openTasbih(storage) {
    const window = {};
    const counter = { animate() {} };
    const target = {};
    const document = {
        readyState: 'complete',
        getElementById: id => ({ counter, 'quick-bead-target': target })[id] ?? null,
        querySelectorAll: () => []
    };
    const localStorage = {
        getItem: key => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value)
    };

    vm.runInNewContext(script, { window, document, localStorage, setTimeout: callback => callback() });
    return { tasbih: window.SmartTasbih, counter, target };
}

test('resumes the selected dhikr and unfinished round after reopening', () => {
    const storage = new Map([
        ['zad_tasbih_sound_enabled', 'false'],
        ['zad_tasbih_haptic_enabled', 'false']
    ]);
    const { tasbih } = openTasbih(storage);
    tasbih.switchZkr(1);
    tasbih.setTarget(33);
    tasbih.tapBead();

    const reopened = openTasbih(storage);
    reopened.tasbih.openModal();
    assert.equal(reopened.counter.textContent, 1);
    assert.equal(reopened.target.textContent, '1 / 33');
    assert.equal(JSON.parse(storage.get('zad_tasbih_round')).activeZkrIndex, 1);

    for (let count = 1; count < 33; count++) reopened.tasbih.tapBead();
    const nextRound = openTasbih(storage);
    assert.equal(nextRound.target.textContent, '0 / 33');
    nextRound.tasbih.tapBead();
    nextRound.tasbih.resetCurrentRound();
    assert.equal(openTasbih(storage).counter.textContent, 0);
    assert.equal(storage.get('zad_tasbih_lifetime_count'), '34');
});
