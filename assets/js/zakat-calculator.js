/**
 * ZadMuslim V4 — Zakat Calculator Engine (حاسبة الزكاة الذكية الشاملة)
 * متوافقة 100% مع الضوابط الشرعية للأموال والذهب والفضة والأسهم وعروض التجارة والديون
 */

(function () {
    'use strict';

    // ثوابت النصاب الشرعي
    const NISAB_GOLD_GRAMS = 85;       // 85 جرام ذهب خالص (عيار 24)
    const NISAB_SILVER_GRAMS = 595;    // 595 جرام فضة خالصة
    const ZAKAT_RATE = 0.025;          // ربع العشر 2.5% للحول القمري

    // أسعار الذهب والفضة الافتراضية المرجعية (لكل جرام عيار 24)
    const DEFAULT_PRICES = {
        SAR: { gold24: 310, silver: 3.8, symbol: 'ر.س', name: 'ريال سعودي' },
        EGP: { gold24: 4150, silver: 52, symbol: 'ج.م', name: 'جنيه مصري' },
        AED: { gold24: 305, silver: 3.7, symbol: 'د.إ', name: 'درهم إماراتي' },
        KWD: { gold24: 25.5, silver: 0.31, symbol: 'د.ك', name: 'دينار كويتي' },
        QAR: { gold24: 302, silver: 3.7, symbol: 'ر.ق', name: 'ريال قطري' },
        USD: { gold24: 83, silver: 1.05, symbol: '$', name: 'دولار أمريكي' },
        EUR: { gold24: 78, silver: 0.98, symbol: '€', name: 'يورو' }
    };

    let currentCurrency = localStorage.getItem('zad_zakat_currency') || 'SAR';
    let nisabBasis = localStorage.getItem('zad_zakat_nisab_basis') || 'gold'; // 'gold' or 'silver'

    // حفظ واسترجاع آخر نتيجة
    const STORAGE_KEY_LAST_CALC = 'zad_zakat_last_calculation';

    function initZakatCalculator() {
        const section = document.getElementById('zakat-calculator-section');
        if (!section) return;

        setupCurrencySelector();
        setupNisabBasisToggle();
        setupInputListeners();
        setupActionButtons();
        restoreLastSavedCalculation();
        calculateZakat();
    }

    function setupCurrencySelector() {
        const select = document.getElementById('zakat-currency-select');
        if (!select) return;

        select.value = currentCurrency;
        updatePriceInputsPlaceholders();

        select.addEventListener('change', (e) => {
            currentCurrency = e.target.value;
            localStorage.setItem('zad_zakat_currency', currentCurrency);
            updatePriceInputsPlaceholders();
            calculateZakat();
        });
    }

    function setupNisabBasisToggle() {
        const goldRadio = document.getElementById('zakat-nisab-basis-gold');
        const silverRadio = document.getElementById('zakat-nisab-basis-silver');

        if (goldRadio && silverRadio) {
            if (nisabBasis === 'silver') silverRadio.checked = true;
            else goldRadio.checked = true;

            const onBasisChange = (basis) => {
                nisabBasis = basis;
                localStorage.setItem('zad_zakat_nisab_basis', nisabBasis);
                calculateZakat();
            };

            goldRadio.addEventListener('change', () => onBasisChange('gold'));
            silverRadio.addEventListener('change', () => onBasisChange('silver'));
        }
    }

    function updatePriceInputsPlaceholders() {
        const currData = DEFAULT_PRICES[currentCurrency] || DEFAULT_PRICES.SAR;
        const goldPriceInput = document.getElementById('zakat-gold24-price');
        const silverPriceInput = document.getElementById('zakat-silver-price');
        const currencyBadges = document.querySelectorAll('.zakat-currency-unit');

        if (goldPriceInput && !goldPriceInput.value) {
            goldPriceInput.placeholder = currData.gold24.toString();
        }
        if (silverPriceInput && !silverPriceInput.value) {
            silverPriceInput.placeholder = currData.silver.toString();
        }

        currencyBadges.forEach(el => {
            el.textContent = currData.symbol;
        });

        const nisabDateBadge = document.getElementById('zakat-prices-date');
        if (nisabDateBadge) {
            nisabDateBadge.textContent = new Date().toLocaleDateString('ar-EG');
        }
    }

    function setupInputListeners() {
        const inputs = document.querySelectorAll('#zakat-calculator-form input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                calculateZakat();
            });
        });

        const hawlCheckbox = document.getElementById('zakat-hawl-confirmed');
        if (hawlCheckbox) {
            hawlCheckbox.addEventListener('change', () => {
                calculateZakat();
            });
        }
    }

    function getInputValue(id) {
        const el = document.getElementById(id);
        if (!el) return 0;
        const val = parseFloat(el.value);
        return isNaN(val) || val < 0 ? 0 : val;
    }

    function getGold24Price() {
        const input = document.getElementById('zakat-gold24-price');
        const custom = input ? parseFloat(input.value) : 0;
        if (!isNaN(custom) && custom > 0) return custom;
        return (DEFAULT_PRICES[currentCurrency] || DEFAULT_PRICES.SAR).gold24;
    }

    function getSilverPrice() {
        const input = document.getElementById('zakat-silver-price');
        const custom = input ? parseFloat(input.value) : 0;
        if (!isNaN(custom) && custom > 0) return custom;
        return (DEFAULT_PRICES[currentCurrency] || DEFAULT_PRICES.SAR).silver;
    }

    /**
     * تحويل جرامات الذهب باختلاف الأعيرة إلى مكافئ الذهب الخالص عيار 24
     */
    function calculatePureGoldGrams() {
        const g24 = getInputValue('zakat-gold-24k');
        const g22 = getInputValue('zakat-gold-22k');
        const g21 = getInputValue('zakat-gold-21k');
        const g18 = getInputValue('zakat-gold-18k');

        const pureGrams = g24 + (g22 * 22 / 24) + (g21 * 21 / 24) + (g18 * 18 / 24);
        return {
            totalPureGrams: pureGrams,
            g24, g22, g21, g18
        };
    }

    function calculateZakat() {
        const currData = DEFAULT_PRICES[currentCurrency] || DEFAULT_PRICES.SAR;
        const priceGold24 = getGold24Price();
        const priceSilver = getSilverPrice();

        // 1. حساب قيمة الذهب
        const goldData = calculatePureGoldGrams();
        const goldValue = goldData.totalPureGrams * priceGold24;

        // 2. حساب قيمة الفضة
        const silverGrams = getInputValue('zakat-silver-grams');
        const silverValue = silverGrams * priceSilver;

        // 3. النقدية والسيولة والبنك
        const cashValue = getInputValue('zakat-cash-in-hand') + getInputValue('zakat-bank-balance');

        // 4. عروض التجارة والأسهم والاستثمارات والديون المرجوة
        const tradeGoods = getInputValue('zakat-trade-goods');
        const stocksValue = getInputValue('zakat-stocks-shares');
        const receivables = getInputValue('zakat-receivables');

        // إجمالي الموجودات الزكوية
        const totalAssets = goldValue + silverValue + cashValue + tradeGoods + stocksValue + receivables;

        // 5. الخصومات: الديون المستحقة الفورية
        const debtsDue = getInputValue('zakat-debts-due');

        // صافي الوعاء الزكوي
        const netZakatableWealth = Math.max(0, totalAssets - debtsDue);

        // 6. تحديد النصاب الشرعي بناءً على الاختيار (ذهب 85 جم أو فضة 595 جم)
        const nisabGoldValue = NISAB_GOLD_GRAMS * priceGold24;
        const nisabSilverValue = NISAB_SILVER_GRAMS * priceSilver;
        const currentNisabThreshold = (nisabBasis === 'silver') ? nisabSilverValue : nisabGoldValue;

        const isNisabReached = netZakatableWealth >= currentNisabThreshold && netZakatableWealth > 0;

        // 7. شرط حولان الحول
        const hawlCheckbox = document.getElementById('zakat-hawl-confirmed');
        const isHawlConfirmed = hawlCheckbox ? hawlCheckbox.checked : true;

        // 8. حساب مقدار الزكاة الواجب إخراجها (2.5%)
        let zakatDue = 0;
        if (isNisabReached && isHawlConfirmed) {
            zakatDue = netZakatableWealth * ZAKAT_RATE;
        }

        // تحديث واجهة النتائج
        renderResults({
            currency: currData,
            netZakatableWealth,
            totalAssets,
            debtsDue,
            goldValue,
            goldPureGrams: goldData.totalPureGrams,
            silverValue,
            silverGrams,
            cashValue,
            tradeGoods,
            stocksValue,
            receivables,
            currentNisabThreshold,
            isNisabReached,
            isHawlConfirmed,
            zakatDue
        });
    }

    function formatNumber(num) {
        return num.toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    function renderResults(res) {
        const wealthEl = document.getElementById('zakat-res-net-wealth');
        const nisabEl = document.getElementById('zakat-res-nisab-value');
        const statusBadge = document.getElementById('zakat-res-status-badge');
        const statusText = document.getElementById('zakat-res-status-text');
        const dueEl = document.getElementById('zakat-res-due-amount');
        const dueUnitEl = document.getElementById('zakat-res-due-unit');
        const breakdownEl = document.getElementById('zakat-res-breakdown-details');

        if (wealthEl) wealthEl.textContent = `${formatNumber(res.netZakatableWealth)} ${res.currency.symbol}`;
        if (nisabEl) nisabEl.textContent = `${formatNumber(res.currentNisabThreshold)} ${res.currency.symbol}`;
        if (dueEl) dueEl.textContent = formatNumber(res.zakatDue);
        if (dueUnitEl) dueUnitEl.textContent = res.currency.symbol;

        if (statusBadge && statusText) {
            if (!res.isNisabReached) {
                statusBadge.className = 'zakat-status-badge badge-warning';
                statusBadge.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> لم يبلغ النصاب`;
                statusText.textContent = `المال أقل من النصاب الشرعي (${formatNumber(res.currentNisabThreshold)} ${res.currency.symbol})، فلا زكاة واجبة فيه شرعاً، وتُستحب الصدقة.`;
            } else if (!res.isHawlConfirmed) {
                statusBadge.className = 'zakat-status-badge badge-info';
                statusBadge.innerHTML = `<i class="fa-solid fa-clock"></i> في انتظار تمام الحول`;
                statusText.textContent = `بلغ المال النصاب بحمد الله، لكن يشترط لوجوب الزكاة مضي حول قمري كامل (عام هجري) على امتلاكه.`;
            } else {
                statusBadge.className = 'zakat-status-badge badge-success';
                statusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> تجب فيه الزكاة شرعاً`;
                statusText.textContent = `بلغ مالك النصاب الشرعي ودار عليه الحول كاملاً، فالزكاة واجبة فيه بنسبة 2.5% (ربع العشر) طهرة لأموالك وبركة.`;
            }
        }

        if (breakdownEl) {
            breakdownEl.innerHTML = `
                <div class="zakat-breakdown-row">
                    <span>إجمالي الأصول والأموال:</span>
                    <strong>${formatNumber(res.totalAssets)} ${res.currency.symbol}</strong>
                </div>
                ${res.debtsDue > 0 ? `
                <div class="zakat-breakdown-row text-danger">
                    <span>الديون والالتزامات المخصومة:</span>
                    <strong>- ${formatNumber(res.debtsDue)} ${res.currency.symbol}</strong>
                </div>` : ''}
                <div class="zakat-breakdown-row text-gold font-bold">
                    <span>صافي الوعاء الزكوي:</span>
                    <strong>${formatNumber(res.netZakatableWealth)} ${res.currency.symbol}</strong>
                </div>
                <div class="zakat-breakdown-row text-muted" style="font-size: 0.82rem;">
                    <span>حد النصاب المعتمد (${nisabBasis === 'gold' ? '85 جم ذهب' : '595 جم فضة'}):</span>
                    <span>${formatNumber(res.currentNisabThreshold)} ${res.currency.symbol}</span>
                </div>
            `;
        }
    }

    function setupActionButtons() {
        const btnReset = document.getElementById('btn-zakat-reset');
        const btnSave = document.getElementById('btn-zakat-save');
        const btnShare = document.getElementById('btn-zakat-share');

        if (btnReset) {
            btnReset.addEventListener('click', () => {
                const inputs = document.querySelectorAll('#zakat-calculator-form input[type="number"]');
                inputs.forEach(input => input.value = '');
                calculateZakat();
                if (typeof showToast === 'function') {
                    showToast('تمت إعادة تعيين حاسبة الزكاة 🔄');
                }
            });
        }

        if (btnSave) {
            btnSave.addEventListener('click', () => {
                saveCurrentCalculation();
            });
        }

        if (btnShare) {
            btnShare.addEventListener('click', () => {
                shareZakatResult();
            });
        }
    }

    function saveCurrentCalculation() {
        const currData = DEFAULT_PRICES[currentCurrency] || DEFAULT_PRICES.SAR;
        const dueEl = document.getElementById('zakat-res-due-amount');
        const wealthEl = document.getElementById('zakat-res-net-wealth');

        const record = {
            date: new Date().toISOString(),
            currency: currentCurrency,
            symbol: currData.symbol,
            due: dueEl ? dueEl.textContent : '0',
            wealth: wealthEl ? wealthEl.textContent : '0',
            basis: nisabBasis
        };

        localStorage.setItem(STORAGE_KEY_LAST_CALC, JSON.stringify(record));
        if (typeof showToast === 'function') {
            showToast('تم حفظ نتيجة حساب الزكاة على جهازك بنجاح 💾✨');
        }
        renderSavedHistoryBadge();
    }

    function restoreLastSavedCalculation() {
        renderSavedHistoryBadge();
    }

    function renderSavedHistoryBadge() {
        const container = document.getElementById('zakat-last-saved-badge');
        if (!container) return;

        try {
            const raw = localStorage.getItem(STORAGE_KEY_LAST_CALC);
            if (!raw) {
                container.style.display = 'none';
                return;
            }
            const record = JSON.parse(raw);
            const dateStr = new Date(record.date).toLocaleDateString('ar-EG');
            container.style.display = 'block';
            container.innerHTML = `
                <div class="saved-calc-pill">
                    <i class="fa-solid fa-clock-rotate-left text-gold"></i>
                    <span>آخر حساب محفوظ (${dateStr}): <strong>${record.due} ${record.symbol}</strong> زكاة واجبة</span>
                </div>
            `;
        } catch (e) {
            container.style.display = 'none';
        }
    }

    function shareZakatResult() {
        const currData = DEFAULT_PRICES[currentCurrency] || DEFAULT_PRICES.SAR;
        const due = document.getElementById('zakat-res-due-amount')?.textContent || '0';
        const wealth = document.getElementById('zakat-res-net-wealth')?.textContent || '0';

        const text = `حساب زكاة المال عبر تطبيق زاد المسلم 🕌\n• صافي المال الخاضع للزكاة: ${wealth}\n• مقدار الزكاة الواجب إخراجها: ${due} ${currData.symbol}\n(طهور وبركة ونماء لأموالكم بإذن الله)`;

        if (navigator.share) {
            navigator.share({
                title: 'نتيجة حساب الزكاة — زاد المسلم',
                text: text
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                if (typeof showToast === 'function') {
                    showToast('تم نسخ نتيجة حساب الزكاة للمشاركة 📋');
                }
            });
        }
    }

    window.initZakatCalculator = initZakatCalculator;
    window.calculateZakat = calculateZakat;

    document.addEventListener('DOMContentLoaded', () => {
        initZakatCalculator();
    });
})();
