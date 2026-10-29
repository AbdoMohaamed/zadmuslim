/**
 * اسأل زاد (Ask Zad) - تحكم المساعد الإسلامي الذكي
 * تشغيل فوري ومرن على كافة الصفحات بدون أي تعارض (Zero Exceptions)
 */
(function(root) {
    'use strict';

    const STORAGE_KEY = 'zad_ask_zad_history';
    const MAX_HISTORY = 25;

    // حالة المحادثة
    let isInitialized = false;
    let isOpen = false;

    // استرجاع التاريخ من التخزين المحلي
    function loadHistory() {
        try {
            if (typeof localStorage === 'undefined') return [];
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    // حفظ التاريخ
    function saveHistory(messages) {
        try {
            if (typeof localStorage === 'undefined') return;
            const slice = messages.slice(-MAX_HISTORY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
        } catch (e) {}
    }

    // تنسيق الوقت
    function formatTime(timestamp) {
        try {
            const date = timestamp ? new Date(timestamp) : new Date();
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'م' : 'ص';
            hours = hours % 12 || 12;
            return `${hours}:${minutes} ${ampm}`;
        } catch (e) {
            return '';
        }
    }

    // تحويل التنسيق البسيط (Markdown-like bold & newlines) إلى HTML آمن
    function formatMessageText(text) {
        if (!text) return '';
        // تنظيف مدخلات المستخدم ومنع XSS
        const escapeHtml = (str) => {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        const safe = escapeHtml(text);
        // دعم التنسيق العريض والأسطر
        return safe
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // تهيئة واجهة المستخدم وحقنها في الـ DOM
    function initUI() {
        if (typeof document === 'undefined' || isInitialized) return;
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', initUI);
            return;
        }

        isInitialized = true;

        // 1. حقن زر الإطلاق العائم إذا لم يكن موجوداً
        if (!document.getElementById('btn-ask-zad-fab')) {
            const fab = document.createElement('button');
            fab.id = 'btn-ask-zad-fab';
            fab.className = 'ask-zad-fab';
            fab.setAttribute('type', 'button');
            fab.setAttribute('aria-label', 'اسأل زاد - المساعد الإسلامي الذكي');
            fab.setAttribute('title', 'اسأل زاد - المساعد الإسلامي الذكي');
            fab.innerHTML = `
                <span class="ask-zad-fab-icon">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <span class="ask-zad-fab-sparkle"></span>
                </span>
                <span>اسأل زاد</span>
            `;
            fab.addEventListener('click', () => openChat());
            document.body.appendChild(fab);
        }

        // 2. حقن نافذة المحادثة (Modal) إذا لم تكن موجودة
        if (!document.getElementById('ask-zad-modal')) {
            const overlay = document.createElement('div');
            overlay.id = 'ask-zad-modal';
            overlay.className = 'ask-zad-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-hidden', 'true');
            overlay.innerHTML = `
                <div class="ask-zad-container">
                    <header class="ask-zad-header">
                        <div class="ask-zad-header-brand">
                            <div class="ask-zad-avatar">
                                <i class="fa-solid fa-kaaba"></i>
                                <span class="ask-zad-online-dot" title="متاح دائماً"></span>
                            </div>
                            <div class="ask-zad-header-text">
                                <h3>اسأل زاد <span style="font-size: 11px; color: #ffdb4d; font-weight: normal; background: rgba(212,175,55,0.2); padding: 2px 7px; border-radius: 9999px;">الذكي</span></h3>
                                <p>رفيقك في القرآن والأذكار وأحكام العبادات</p>
                            </div>
                        </div>
                        <div class="ask-zad-header-actions">
                            <button type="button" class="ask-zad-header-btn" id="btn-ask-zad-clear" title="مسح المحادثة" aria-label="مسح المحادثة">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                            <button type="button" class="ask-zad-header-btn" id="btn-ask-zad-close" title="إغلاق النافذة" aria-label="إغلاق">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </header>

                    <div class="ask-zad-body" id="ask-zad-messages">
                        <!-- ترحيب واقتراحات افتراضية -->
                        <div class="ask-zad-welcome-card" id="ask-zad-welcome">
                            <div class="ask-zad-welcome-title">أهلاً بك في "اسأل زاد" 🌿</div>
                            <p class="ask-zad-welcome-desc">
                                مساعدك الإسلامي للإجابة على تساؤلاتك في القرآن الكريم، الأذكار والأدعية، وأحكام الصلاة اليومية.
                            </p>
                            <div class="ask-zad-chips-container" id="ask-zad-chips">
                                <button type="button" class="ask-zad-chip" data-prompt="كيف أصلي صلاة الجنازة؟">
                                    <i class="fa-solid fa-mosque"></i> صلاة الجنازة بالتفصيل
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="أحكام سجود السهو قبل أم بعد السلام؟">
                                    <i class="fa-solid fa-scale-balanced"></i> سجود السهو
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="آيات وتفسير عن الصبر وفضله">
                                    <i class="fa-solid fa-book-quran"></i> آيات الصبر وتفسيرها
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="دعاء تفريج الهم والكرب">
                                    <i class="fa-solid fa-hands-praying"></i> دعاء تفريج الكرب
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="كيف أحسب زكاة مالي؟">
                                    <i class="fa-solid fa-coins"></i> حساب زكاة المال والذهب
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="أذكار النوم الصحيحة">
                                    <i class="fa-solid fa-moon"></i> أذكار النوم
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="تشغيل إذاعة القرآن الكريم">
                                    <i class="fa-solid fa-radio"></i> إذاعة القرآن
                                </button>
                                <button type="button" class="ask-zad-chip" data-prompt="كيف أتوضأ وضوء صحيح؟">
                                    <i class="fa-solid fa-faucet-drip"></i> صفة الوضوء ونواقضه
                                </button>
                            </div>
                        </div>
                    </div>

                    <footer class="ask-zad-footer">
                        <form class="ask-zad-input-form" id="ask-zad-form">
                            <input type="text" class="ask-zad-input" id="ask-zad-input" placeholder="اكتب سؤالك هنا... (مثال: صلاة الجنازة، أذكار النوم)" autocomplete="off">
                            <button type="submit" class="ask-zad-send-btn" id="btn-ask-zad-send" aria-label="إرسال">
                                <i class="fa-solid fa-paper-plane"></i>
                            </button>
                        </form>
                        <p class="ask-zad-disclaimer">
                            «مساعد ذكي للإرشاد والبحث؛ للفتاوى المعقدة يُرجى الرجوع لدار الإفتاء وأهل الذكر»
                        </p>
                    </footer>
                </div>
            `;
            document.body.appendChild(overlay);

            // مستمعات الأحداث
            setupEventListeners(overlay);

            // تحميل الرسائل السابقة
            renderHistory();
        }
    }

    // إعداد مستمعات الأحداث
    function setupEventListeners(overlay) {
        const closeBtn = overlay.querySelector('#btn-ask-zad-close');
        if (closeBtn) closeBtn.addEventListener('click', closeChat);

        const clearBtn = overlay.querySelector('#btn-ask-zad-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (typeof confirm === 'function' && !confirm('هل تريد مسح سجل المحادثة؟')) return;
                clearChat();
            });
        }

        // إغلاق عند النقر على الخلفية
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeChat();
        });

        // زر الهروب Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) closeChat();
        });

        // إرسال الرسالة
        const form = overlay.querySelector('#ask-zad-form');
        const input = overlay.querySelector('#ask-zad-input');
        if (form && input) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = input.value.trim();
                if (!query) return;
                input.value = '';
                sendMessage(query);
            });
        }

        // النقر على الشرائح الافتراضية
        const chipsContainer = overlay.querySelector('#ask-zad-chips');
        if (chipsContainer) {
            chipsContainer.addEventListener('click', (e) => {
                const chip = e.target.closest('.ask-zad-chip');
                if (chip && chip.dataset.prompt) {
                    sendMessage(chip.dataset.prompt);
                }
            });
        }
    }

    // فتح نافذة الشات
    function openChat(initialQuery) {
        initUI();
        const overlay = document.getElementById('ask-zad-modal');
        if (!overlay) return;
        isOpen = true;
        overlay.classList.add('is-active');
        overlay.setAttribute('aria-hidden', 'false');

        const input = document.getElementById('ask-zad-input');
        if (input) {
            setTimeout(() => {
                try { input.focus(); } catch (e) {}
            }, 200);
        }

        if (initialQuery && typeof initialQuery === 'string') {
            sendMessage(initialQuery);
        }
    }

    // إغلاق نافذة الشات
    function closeChat() {
        const overlay = document.getElementById('ask-zad-modal');
        if (!overlay) return;
        isOpen = false;
        overlay.classList.remove('is-active');
        overlay.setAttribute('aria-hidden', 'true');
    }

    // مسح المحادثة
    function clearChat() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (e) {}
        const messagesContainer = document.getElementById('ask-zad-messages');
        if (messagesContainer) {
            // الإبقاء فقط على بطاقة الترحيب
            const welcome = document.getElementById('ask-zad-welcome');
            messagesContainer.innerHTML = '';
            if (welcome) messagesContainer.appendChild(welcome);
        }
    }

    // إرسال رسالة المستخدم ومعالجتها
    function sendMessage(query) {
        if (!query) return;
        const messagesContainer = document.getElementById('ask-zad-messages');
        if (!messagesContainer) return;

        // إخفاء بطاقة الترحيب بعد بدء المحادثة
        const welcome = document.getElementById('ask-zad-welcome');
        if (welcome) welcome.style.display = 'none';

        const history = loadHistory();

        // 1. إضافة رسالة المستخدم
        const userMsg = {
            sender: 'user',
            text: query,
            time: Date.now()
        };
        history.push(userMsg);
        appendMessageRow(userMsg, messagesContainer);

        // التمرير لأسفل
        scrollToBottom(messagesContainer);

        // 2. إظهار مؤشر الكتابة
        const typingEl = showTypingIndicator(messagesContainer);
        scrollToBottom(messagesContainer);

        // 3. استدعاء محرك المعرفة
        setTimeout(() => {
            if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);

            const result = (window.AskZadKnowledge && typeof window.AskZadKnowledge.findBestAnswer === 'function')
                ? window.AskZadKnowledge.findBestAnswer(query)
                : null;

            let botMsg;
            if (result && result.found && result.data) {
                botMsg = {
                    sender: 'bot',
                    text: result.data.answer,
                    actions: result.data.actions || [],
                    time: Date.now()
                };
            } else if (result && !result.found) {
                botMsg = {
                    sender: 'bot',
                    text: result.fallbackMessage || 'عذراً، لم أعثر على تطابق مباشر. إليك بعض الخيارات المفيدة:',
                    actions: (result.suggestions || []).map(s => ({ label: s.label, href: s.href, type: 'link' })),
                    time: Date.now()
                };
            } else {
                botMsg = {
                    sender: 'bot',
                    text: 'مرحباً بك، أنا في خدمتك دائماً في زاد المسلم. يمكنك سؤالي عن كيفية صلاة الجنازة، أحكام سجود السهو، آيات الصبر وتفسيرها، أو أذكار اليوم.',
                    actions: [
                        { label: '📖 المصحف الشريف', href: 'services.html#quran-reading-section', type: 'link' },
                        { label: '🤲 الأذكار وحصن المسلم', href: 'services.html#azkar', type: 'link' }
                    ],
                    time: Date.now()
                };
            }

            history.push(botMsg);
            saveHistory(history);
            appendMessageRow(botMsg, messagesContainer);
            scrollToBottom(messagesContainer);
        }, 350);
    }

    // إلحاق سطر رسالة في الـ DOM
    function appendMessageRow(msg, container) {
        const row = document.createElement('div');
        row.className = `ask-zad-msg-row ${msg.sender}`;

        const bubble = document.createElement('div');
        bubble.className = 'ask-zad-msg-bubble';

        // محتوى النص
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = formatMessageText(msg.text);
        bubble.appendChild(contentDiv);

        // أزرار الإجراءات التفاعلية (Actions)
        if (msg.actions && Array.isArray(msg.actions) && msg.actions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'ask-zad-msg-actions';
            for (const act of msg.actions) {
                const btn = document.createElement('a');
                btn.className = 'ask-zad-action-btn';
                btn.href = act.href || '#';
                btn.innerHTML = act.label;
                btn.addEventListener('click', (e) => {
                    // إذا كان رابط لراديو أو قسم في نفس الصفحة، إغلاق المودال
                    if (act.href && act.href.startsWith('#')) {
                        closeChat();
                    } else if (act.href && act.href.includes('.html')) {
                        // صفحة أخرى
                        closeChat();
                    }
                });
                actionsDiv.appendChild(btn);
            }
            bubble.appendChild(actionsDiv);
        }

        // تفاصيل أسفل الفقاعة (الوقت وزر النسخ)
        const metaDiv = document.createElement('div');
        metaDiv.className = 'ask-zad-msg-meta';
        metaDiv.innerHTML = `<span>${formatTime(msg.time)}</span>`;

        if (msg.sender === 'bot') {
            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'ask-zad-copy-btn';
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> نسخ';
            copyBtn.addEventListener('click', async () => {
                try {
                    if (navigator && navigator.clipboard) {
                        await navigator.clipboard.writeText(msg.text.replace(/\*\*/g, ''));
                        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> تم النسخ';
                        setTimeout(() => { copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> نسخ'; }, 2000);
                    }
                } catch (e) {}
            });
            metaDiv.appendChild(copyBtn);
        }

        bubble.appendChild(metaDiv);
        row.appendChild(bubble);
        container.appendChild(row);
    }

    // إظهار مؤشر الكتابة
    function showTypingIndicator(container) {
        const row = document.createElement('div');
        row.className = 'ask-zad-msg-row bot';
        row.innerHTML = `
            <div class="ask-zad-msg-bubble" style="padding: 10px 14px;">
                <div class="ask-zad-typing-indicator">
                    <span class="ask-zad-typing-dot"></span>
                    <span class="ask-zad-typing-dot"></span>
                    <span class="ask-zad-typing-dot"></span>
                </div>
            </div>
        `;
        container.appendChild(row);
        return row;
    }

    // التمرير إلى الأسفل
    function scrollToBottom(container) {
        try {
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        } catch (e) {}
    }

    // رسم المحفوظات السابقة
    function renderHistory() {
        const messagesContainer = document.getElementById('ask-zad-messages');
        if (!messagesContainer) return;

        const history = loadHistory();
        if (history.length > 0) {
            const welcome = document.getElementById('ask-zad-welcome');
            if (welcome) welcome.style.display = 'none';

            for (const msg of history) {
                appendMessageRow(msg, messagesContainer);
            }
            scrollToBottom(messagesContainer);
        }
    }

    // تصدير الكائن العام
    const AskZad = {
        init: initUI,
        open: openChat,
        close: closeChat,
        clear: clearChat,
        send: sendMessage
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AskZad;
    }
    if (typeof window !== 'undefined') {
        window.AskZad = AskZad;
        // تشغيل آلي فور اكتمال تحميل الصفحة
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initUI);
        } else {
            initUI();
        }
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);
