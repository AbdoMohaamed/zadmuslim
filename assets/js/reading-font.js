(function () {
    'use strict';
    const groups = [
        { name: 'azkar', label: 'خط الأذكار', selector: '.azkar-text', host: '#azkar .container' },
        { name: 'hadith', label: 'خط الأحاديث', selector: '.hadith-text, .sadaqa-hadith-text, #wisdom-hadith-text, .pg-prohibition-hadith', host: '.pg-card-body, .sadaqa-hadith-card, section' }
    ];
    const fonts = { amiri: ['أميري', 'Amiri'], naskh: ['نسخ', 'Noto Naskh Arabic'], scheherazade: ['شهرزاد', 'Scheherazade New'], cairo: ['القاهرة', 'Cairo'] };
    // Leave combining hamza and madda intact: these are parts of letters.
    const stripMarks = text => text.replace(/[\u0610-\u061A\u064B-\u0652\u0656-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED]/g, '');
    let initialized = false;
    function init() {
        if (initialized) return;
        initialized = true;
        groups.forEach(group => {
            const key = 'zad_reading_font_' + group.name;
            let size = 100;
            try {
                const saved = Number(localStorage.getItem(key));
                if (Number.isFinite(saved) && saved >= 100 && saved <= 200) size = Math.round(saved / 10) * 10;
            } catch (_) { /* Reading controls also work without storage. */ }
            let font = 'amiri';
            let showMarks = true;
            try {
                const saved = JSON.parse(localStorage.getItem(key + '_options') || '{}');
                if (saved && Object.hasOwn(fonts, saved.font)) font = saved.font;
                if (saved && typeof saved.showMarks === 'boolean') showMarks = saved.showMarks;
            } catch (_) {}
            const originals = new WeakMap();
            function renderText(node) {
                const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
                let text;
                while ((text = walker.nextNode())) {
                    const previous = originals.get(text);
                    const original = previous && text.data === previous.rendered ? previous.original : text.data;
                    const rendered = showMarks ? original : stripMarks(original);
                    originals.set(text, { original, rendered });
                    if (text.data !== rendered) text.data = rendered;
                }
            }
            function save() {
                try {
                    localStorage.setItem(key, String(size));
                    localStorage.setItem(key + '_options', JSON.stringify({ font, showMarks }));
                } catch (_) {}
                paint();
            }
            const texts = new Map();
            const toolbars = new Map();
            let deepLinkOpened = false;
            function paint() {
                texts.forEach((base, node) => {
                    node.style.fontSize = `calc(${base}rem * ${size / 100})`;
                    node.style.overflowWrap = 'anywhere';
                    node.style.fontFamily = `'${fonts[font][1]}', serif`;
                    renderText(node);
                });
                toolbars.forEach(bar => {
                    const output = bar.querySelector('output');
                    if (output.textContent !== size + '٪') output.textContent = size + '٪';
                    bar.querySelector('select').value = font;
                    bar.querySelector('input').checked = showMarks;
                    const preview = bar.querySelector('.reading-font-preview');
                    preview.style.fontFamily = `'${fonts[font][1]}', serif`;
                    preview.style.fontSize = `${1.3 * size / 100}rem`;
                    const sample = 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ';
                    const sampleText = showMarks ? sample : stripMarks(sample);
                    if (preview.textContent !== sampleText) preview.textContent = sampleText;
                    bar.querySelector('[data-step="-10"]').disabled = size === 100;
                    bar.querySelector('[data-step="10"]').disabled = size === 200;
                });
            }
            function scan() {
                if (!window.document) return;
                let changed = false;
                document.querySelectorAll(group.selector).forEach(node => {
                    if (texts.has(node)) { renderText(node); return; }
                    const host = node.closest(group.host) || node.parentElement;
                    if (!host) return;
                    node.classList.add('reading-text-custom');
                    texts.set(node, parseFloat(getComputedStyle(node).fontSize) / parseFloat(getComputedStyle(document.documentElement).fontSize));
                    if (!toolbars.has(host)) {
                        const bar = document.createElement('div');
                        bar.className = 'reading-font-controls';
                        bar.setAttribute('role', 'group');
                        bar.setAttribute('aria-label', group.label);
                        const panelId = 'reading-options-' + group.name + '-' + toolbars.size;
                        bar.innerHTML = `<div class="reading-font-quick"><button type="button" data-step="-10" aria-label="تصغير ${group.label}"><span aria-hidden="true">أ −</span></button><button type="button" data-step="10" aria-label="تكبير ${group.label}"><span aria-hidden="true">أ +</span></button><output aria-label="حجم الخط" aria-live="polite"></output><button type="button" class="reading-font-toggle" data-toggle aria-expanded="false" aria-controls="${panelId}"><span aria-hidden="true">⚙</span> الخط والتشكيل</button></div><p class="reading-font-hint" hidden>ظبّط الخط والتشكيل لقراءة أريح</p><div class="reading-font-panel" id="${panelId}" hidden><label class="reading-font-choice">نوع الخط<select aria-label="نوع ${group.label}">${Object.entries(fonts).map(([value, item]) => `<option value="${value}">${item[0]}</option>`).join('')}</select></label><label class="reading-font-marks"><input type="checkbox"> إظهار التشكيل</label><p class="reading-font-preview" dir="rtl"></p><button type="button" data-reset>استعادة الافتراضي</button></div>`;
                        const hint = bar.querySelector('.reading-font-hint');
                        const hintKey = key + '_hint_seen';
                        function dismissHint() {
                            hint.hidden = true;
                            try { localStorage.setItem(hintKey, '1'); } catch (_) {}
                        }
                        let hintSeen = false;
                        try { hintSeen = localStorage.getItem(hintKey) === '1'; } catch (_) {}
                        if (!hintSeen) {
                            if (typeof IntersectionObserver === 'function') {
                                const observer = new IntersectionObserver(entries => {
                                    if (!entries.some(entry => entry.isIntersecting)) return;
                                    hint.hidden = false;
                                    try { localStorage.setItem(hintKey, '1'); } catch (_) {}
                                    observer.disconnect();
                                });
                                observer.observe(bar);
                            } else {
                                hint.hidden = false;
                                try { localStorage.setItem(hintKey, '1'); } catch (_) {}
                            }
                        }
                        bar.addEventListener('change', event => {
                            if (event.target.matches('select') && Object.hasOwn(fonts, event.target.value)) font = event.target.value;
                            if (event.target.matches('input')) showMarks = event.target.checked;
                            save();
                        });
                        bar.addEventListener('click', event => {
                            const button = event.target.closest('button');
                            if (!button) return;
                            dismissHint();
                            if (button.hasAttribute('data-toggle')) {
                                const expanded = button.getAttribute('aria-expanded') !== 'true';
                                button.setAttribute('aria-expanded', String(expanded));
                                bar.querySelector('.reading-font-panel').hidden = !expanded;
                                return;
                            }
                            size = button.hasAttribute('data-reset') ? 100 : Math.max(100, Math.min(200, size + Number(button.dataset.step)));
                            if (button.hasAttribute('data-reset')) { font = 'amiri'; showMarks = true; }
                            save();
                        });
                        const header = host.querySelector(':scope > .section-header');
                        if (header) header.after(bar);
                        else host.prepend(bar);
                        toolbars.set(host, bar);
                        if (!deepLinkOpened && new URLSearchParams(location.search).get('reading') === group.name) {
                            deepLinkOpened = true;
                            bar.querySelector('[data-toggle]').click();
                            setTimeout(() => {
                                if (!bar.isConnected) return;
                                bar.scrollIntoView?.({ block: 'center' });
                                bar.querySelector('[data-toggle]').focus({ preventScroll: true });
                            }, 0);
                        }
                    }
                    changed = true;
                });
                texts.forEach((_, node) => { if (!node.isConnected) texts.delete(node); });
                toolbars.forEach((_, host) => { if (!host.isConnected) toolbars.delete(host); });
                if (changed) paint();
            }
            scan();
            new MutationObserver(records => {
                if (records.some(record => {
                    const element = record.target.nodeType === 1 ? record.target : record.target.parentElement;
                    if (element && element.closest('.reading-font-controls')) return false;
                    return record.type === 'characterData' || record.addedNodes.length || record.removedNodes.length;
                })) scan();
            }).observe(document.body, { childList: true, characterData: true, subtree: true });
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
