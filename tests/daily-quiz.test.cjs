const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

test('daily questions rotate while a shared question and its answer stay open', () => {
    const day = 20000;
    let clock = day * 86400000;
    const html = fs.readFileSync('index.html', 'utf8');
    const source = ['quiz-data', 'daily-quiz'].map(name => fs.readFileSync('assets/js/' + name + '.js', 'utf8')).join('\n');
    function open(query = '') {
        const {window} = new JSDOM(html, {url: 'https://zad.test/' + query, runScripts: 'outside-only', pretendToBeVisual: true});
        window.Date.now = () => clock;
        window.HTMLElement.prototype.scrollIntoView = () => {};
        window.eval(source);
        return window;
    }
    const home = open();
    const friend = open('?quiz=q1#daily-quiz');
    try {
        const question = '#daily-quiz-question';
        const option = '#daily-quiz-options button';
        const today = home.document.querySelector(question).textContent;
        assert.equal(friend.document.querySelector(question).textContent, today);
        friend.document.querySelector(option).click();
        assert.equal(friend.document.querySelectorAll(option + ':disabled').length, 4);
        clock += 86400000;
        for (const window of [home, friend]) window.dispatchEvent(new window.Event('pageshow'));
        assert.notEqual(home.document.querySelector(question).textContent, today);
        assert.equal(friend.document.querySelector(question).textContent, today);
        assert.equal(friend.document.querySelectorAll(option + ':disabled').length, 4);
    } finally {
        home.close();
        friend.close();
    }
});
