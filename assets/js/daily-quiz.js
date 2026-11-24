(() => {
    const card = document.getElementById('daily-quiz');
    if (!card || typeof ISLAMIC_QUIZ_QUESTIONS === 'undefined') return;

    const title = document.getElementById('daily-quiz-title');
    const toggle = document.getElementById('daily-quiz-open');
    const toggleLabel = document.getElementById('daily-quiz-open-label');
    const body = document.getElementById('daily-quiz-body');
    const question = document.getElementById('daily-quiz-question');
    const options = document.getElementById('daily-quiz-options');
    const feedback = document.getElementById('daily-quiz-feedback');
    const share = document.getElementById('daily-quiz-share');
    const todayLink = document.getElementById('daily-quiz-today');
    const copy = document.getElementById('daily-quiz-copy');
    const shareStatus = document.getElementById('daily-quiz-share-status');
    const bank = new Map(ISLAMIC_QUIZ_QUESTIONS.map(item => [item.id, item]));
    const sharedId = new URLSearchParams(location.search).get('quiz');
    const sharedQuestion = bank.get(sharedId);
    const answers = new Map();
    const dayLength = 86400000;
    let active;
    let answerKey;
    let answered;
    let rollover;

    function setExpanded(expanded) {
        body.hidden = !expanded;
        toggle.hidden = expanded;
        toggle.setAttribute('aria-expanded', String(expanded));
    }

    function renderAnswer() {
        const result = document.createElement('strong');
        const correct = answered === active.correctIndex;
        const icon = document.createElement('i');
        icon.className = 'fa-solid ' + (correct ? 'fa-circle-check' : 'fa-circle-info');
        icon.setAttribute('aria-hidden', 'true');
        const resultLabel = document.createElement('span');
        resultLabel.textContent = correct ? 'إجابة صحيحة!' : 'الإجابة الصحيحة';
        result.append(icon, resultLabel);
        feedback.classList.toggle('is-success', correct);
        const explanation = document.createElement('p');
        explanation.translate = false;
        explanation.lang = 'ar';
        explanation.dir = 'rtl';
        explanation.textContent = active.options[active.correctIndex] + ' — ' + active.explanation;
        feedback.replaceChildren(result, explanation);
        [...options.children].forEach((button, index) => {
            button.disabled = true;
            const isCorrect = index === active.correctIndex;
            button.classList.toggle('is-correct', isCorrect);
            if (isCorrect || index === answered) {
                const marker = button.querySelector('.daily-quiz-choice-marker');
                marker.textContent = isCorrect ? '✓' : '×';
            }
            button.classList.toggle('is-incorrect', index === answered && index !== active.correctIndex);
        });
        share.hidden = false;
    }

    function refresh() {
        if (sharedQuestion && active) return;
        clearTimeout(rollover);
        const day = Math.floor(Date.now() / dayLength);
        // The original 40 IDs keep the published rotation stable when the bank grows.
        const daily = bank.get('q' + (day % 40 + 1));
        const selected = sharedQuestion || daily;
        if (!selected) return;
        const key = 'zad_daily_quiz_' + (sharedQuestion && selected !== daily ? 'shared_' + selected.id : day);
        if (!sharedQuestion) rollover = setTimeout(refresh, dayLength - Date.now() % dayLength + 100);
        if (key === answerKey) return;
        answerKey = key;
        active = selected;
        answered = answers.get(key);
        if (answered === undefined) {
            try {
                const stored = localStorage.getItem(key);
                if (stored !== null && /^[0-3]$/.test(stored)) answered = Number(stored);
            } catch {}
        }
        toggleLabel.textContent = answered === undefined ? 'جاوب الآن' : 'راجع إجابتك';
        title.textContent = sharedQuestion ? 'سؤال شاركه معك صديق' : 'سؤال اليوم';
        todayLink.hidden = !sharedQuestion;
        question.textContent = active.question;
        feedback.replaceChildren();
        share.hidden = true;
        copy.hidden = true;
        shareStatus.textContent = '';
        options.replaceChildren(...active.options.map((label, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            const marker = document.createElement('span');
            marker.className = 'daily-quiz-choice-marker';
            marker.setAttribute('aria-hidden', 'true');
            marker.textContent = String(index + 1);
            const text = document.createElement('span');
            text.textContent = label;
            button.append(marker, text);
            button.addEventListener('click', () => {
                if (answered !== undefined) return;
                answered = index;
                answers.set(answerKey, index);
                try { localStorage.setItem(answerKey, String(index)); } catch {}
                renderAnswer();
                share.focus();
            });
            return button;
        }));
        if (answered !== undefined) renderAnswer();
        card.hidden = false;
    }

    toggle.addEventListener('click', () => {
        setExpanded(true);
        (options.querySelector('button:not(:disabled)') || share).focus();
    });

    share.addEventListener('click', async () => {
        const canonical = document.querySelector('link[rel="canonical"]').href;
        const url = new URL(canonical);
        url.searchParams.set('quiz', active.id);
        url.hash = 'daily-quiz';
        const message = 'جاوب على سؤال من زاد المسلم';
        if (navigator.share) {
            try {
                await navigator.share({ text: window.ZadI18n?.t(message) || message, url: url.href });
                return;
            } catch (error) {
                if (error.name === 'AbortError') return;
            }
        }
        try {
            await navigator.clipboard.writeText(url.href);
            shareStatus.textContent = 'تم نسخ رابط السؤال';
        } catch {
            copy.hidden = false;
            const input = copy.querySelector('input');
            input.value = url.href;
            input.focus();
            input.select();
        }
    });

    refresh();
    if (sharedQuestion || location.hash === '#daily-quiz') {
        setExpanded(true);
        requestAnimationFrame(() => card.scrollIntoView({ block: 'start' }));
    }
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) refresh();
    });
})();
