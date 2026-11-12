/**
 * share-card-generator.js
 * محرك توليد بطاقات "شارك الأجر" لقصص الواتساب وإنستغرام (Viral Story Cards)
 * يتيح للمستخدم تحويل أي آية أو ذكر أو دعاء لبطاقة ستوري احترافية عالية الدقة 1080x1920 بضغطة زر
 * لتطبيق زاد المسلم
 */

(function(window, document) {
    "use strict";
    const label = text => window.ZadI18n?.t(text) ?? text;

    const THEMES = {
        "royal_dark": {
            id: "royal_dark",
            name: "داكن ملكي 🌌",
            bgGradient: ["#051510", "#0c271e", "#061812"],
            primaryText: "#F4E5B8",
            secondaryText: "#A3C2B4",
            accentGold: "#D4AF37",
            borderColor: "rgba(212, 175, 55, 0.4)",
            subtleBorder: "rgba(212, 175, 55, 0.15)",
            badgeBg: "rgba(212, 175, 55, 0.15)",
            badgeText: "#E6CA65"
        },
        "parchment_gold": {
            id: "parchment_gold",
            name: "ورقي مذهّب 📜",
            bgGradient: ["#FAF7F0", "#F4EFE6", "#EDE6D6"],
            primaryText: "#1F2E28",
            secondaryText: "#556B62",
            accentGold: "#997316",
            borderColor: "rgba(153, 115, 22, 0.45)",
            subtleBorder: "rgba(153, 115, 22, 0.2)",
            badgeBg: "rgba(153, 115, 22, 0.12)",
            badgeText: "#805B0D"
        },
        "emerald_luminous": {
            id: "emerald_luminous",
            name: "أخضر زمردي 🌿",
            bgGradient: ["#07281D", "#0F4232", "#0A3326"],
            primaryText: "#FFFFFF",
            secondaryText: "#B7E4D3",
            accentGold: "#E0BC48",
            borderColor: "rgba(224, 188, 72, 0.4)",
            subtleBorder: "rgba(224, 188, 72, 0.15)",
            badgeBg: "rgba(224, 188, 72, 0.18)",
            badgeText: "#F4D779"
        }
    };

    let currentCardState = {
        text: "﴿فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾",
        title: "آية كريمة",
        ref: "سورة الشرح: 5-6",
        subtitle: "بشارة ربانية بالفرج واليسر",
        theme: "royal_dark"
    };

    const ShareCardGenerator = {
        init() {
            window.addEventListener('zad:language-change', () => {
                if (document.getElementById('zad-share-card-modal')) this.renderCanvas();
            });
            // الاستماع لأي أزرار مشاركة تحمل الصنف .btn-share-as-card
            document.addEventListener("click", (e) => {
                const btn = e.target.closest(".btn-share-as-card");
                if (btn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const text = btn.getAttribute("data-card-text") || "";
                    const title = btn.getAttribute("data-card-title") || "زاد المسلم";
                    const ref = btn.getAttribute("data-card-ref") || "";
                    const subtitle = btn.getAttribute("data-card-sub") || "";
                    this.openModal({ text, title, ref, subtitle });
                }
            });
        },

        openShareModal(params) {
            return this.openModal(params);
        },

        openModal(params) {
            this.closeModal();
            this.returnFocus = document.activeElement;
            currentCardState = {
                text: params.text || currentCardState.text,
                title: params.title || "آية مباركة",
                ref: params.ref || "زاد المسلم",
                subtitle: params.subtitle || "",
                theme: THEMES[params.theme] ? params.theme : "royal_dark",
                format: params.format === "square" ? "square" : "story",
                dailyVerse: !!params.dailyVerse
            };

            let modal = document.getElementById("zad-share-card-modal");
            if (modal) modal.remove();

            const modalHtml = `
                <div class="modal-overlay active" id="zad-share-card-modal" onclick="if(event.target===this)ShareCardGenerator.closeModal();" style="z-index: 100000;">
                    <div class="modal-card modal-box share-card-modal-box" role="dialog" aria-modal="true" aria-labelledby="share-card-heading">
                        <div class="modal-head">
                            <div class="modal-head-title">
                                <i class="fa-solid fa-camera-retro text-gold"></i>
                                <span id="share-card-heading">مشاركة البطاقة كصورة</span>
                            </div>
                            <button type="button" class="btn-close-modal" aria-label="إغلاق" onclick="ShareCardGenerator.closeModal();">&times;</button>
                        </div>
                        <div class="modal-body-content share-modal-layout">
                            <div class="share-card-preview-area">
                                <div class="canvas-aspect-wrapper">
                                    <canvas id="zad-story-canvas" width="1080" height="1920" role="img"></canvas>
                                </div>
                            </div>
                            <div class="share-card-controls">
                                <div class="share-format-options" role="group" aria-label="مقاس الصورة">
                                    <button type="button" class="theme-pill-btn" data-format="story" onclick="ShareCardGenerator.switchFormat('story')">حالة / ستوري · 9:16</button>
                                    <button type="button" class="theme-pill-btn" data-format="square" onclick="ShareCardGenerator.switchFormat('square')">منشور مربع · 1:1</button>
                                </div>
                                <label class="control-label">اختر مظهر وألوان البطاقة:</label>
                                <div class="theme-selection-row">
                                    <button type="button" class="theme-pill-btn ${currentCardState.theme === 'royal_dark' ? 'active' : ''}" onclick="ShareCardGenerator.switchTheme('royal_dark', this)">
                                        🌌 داكن ملكي
                                    </button>
                                    <button type="button" class="theme-pill-btn ${currentCardState.theme === 'parchment_gold' ? 'active' : ''}" onclick="ShareCardGenerator.switchTheme('parchment_gold', this)">
                                        📜 ورقي مذهّب
                                    </button>
                                    <button type="button" class="theme-pill-btn ${currentCardState.theme === 'emerald_luminous' ? 'active' : ''}" onclick="ShareCardGenerator.switchTheme('emerald_luminous', this)">
                                        🌿 أخضر زمردي
                                    </button>
                                </div>

                                <div class="share-primary-actions">
                                    <button type="button" class="btn btn-share-story" onclick="ShareCardGenerator.shareDirectlyToStory();">
                                        <i class="fa-solid fa-share-nodes"></i> <span>مشاركة الصورة</span>
                                    </button>
                                    <button type="button" class="btn btn-solid btn-download-story" onclick="ShareCardGenerator.downloadCardImage();">
                                        <i class="fa-solid fa-download"></i> <span>حفظ الصورة</span>
                                    </button>
                                    <button type="button" class="btn btn-outline btn-copy-story-text" ${currentCardState.dailyVerse ? 'hidden' : ''} onclick="ShareCardGenerator.copyCardText();">
                                        <i class="fa-solid fa-copy"></i> <span>نسخ النص</span>
                                    </button>
                                </div>
                                <p class="share-hint-txt">اختر التطبيق من قائمة المشاركة وأكمل النشر بنفسك، أو احفظ الصورة لاستخدامها لاحقًا.</p>
                                <p id="share-card-status" role="status" aria-live="polite"></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML("beforeend", modalHtml);

            const dialog = document.getElementById('zad-share-card-modal');
            dialog.querySelector('.btn-close-modal').focus();
            dialog.onkeydown = e => {
                if (e.key === 'Escape') { e.preventDefault(); this.closeModal(); }
                if (e.key === 'Tab') {
                    const buttons = [...dialog.querySelectorAll('button:not([hidden]):not(:disabled)')];
                    const first = buttons[0], last = buttons[buttons.length - 1];
                    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            };
            this.switchFormat(currentCardState.format);
        },

        closeModal() {
            this.renderVersion = (this.renderVersion || 0) + 1;
            this.prepared = null;
            document.getElementById('zad-share-card-modal')?.remove();
            this.returnFocus?.focus();
        },
        status(text) { const el = document.getElementById('share-card-status'); if (el) el.textContent = text; },
        switchFormat(format) {
            currentCardState.format = format === 'square' ? 'square' : 'story';
            document.querySelectorAll('#zad-share-card-modal [data-format]').forEach(button => {
                const selected = button.dataset.format === currentCardState.format;
                button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
            });
            this.renderCanvas();
        },

        switchTheme(themeId, btn) {
            currentCardState.theme = themeId;
            document.querySelectorAll(".theme-selection-row .theme-pill-btn").forEach(b => b.classList.remove("active"));
            if (btn) btn.classList.add("active");
            this.renderCanvas();
        },

        async renderCanvas() {
            const canvas = document.getElementById("zad-story-canvas");
            if (!canvas) return;
            canvas.setAttribute('aria-label', label('معاينة صورة المشاركة'));
            const version = this.renderVersion = (this.renderVersion || 0) + 1;
            this.prepared = null;
            const buttons = document.querySelectorAll('#zad-share-card-modal .btn-share-story, #zad-share-card-modal .btn-download-story');
            buttons.forEach(button => button.disabled = true);
            this.status('جارٍ تجهيز الصورة…');
            try {
            if (document.fonts) await Promise.all([document.fonts.load("bold 62px Amiri", currentCardState.text), document.fonts.load("bold 34px Cairo", currentCardState.ref)]);
            if (version !== this.renderVersion || !canvas.isConnected) return;
            canvas.height = currentCardState.format === 'square' ? 1080 : 1920;
            canvas.parentElement.style.aspectRatio = `1080 / ${canvas.height}`;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error('Canvas unavailable');
            ctx.direction = document.documentElement.dir || 'rtl';
            const w = canvas.width;
            const h = canvas.height;

            const t = THEMES[currentCardState.theme] || THEMES.royal_dark;

            // 1. تدرج الخلفية
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, t.bgGradient[0]);
            grad.addColorStop(0.5, t.bgGradient[1]);
            grad.addColorStop(1, t.bgGradient[2]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // 2. نقوش وزخارف خلفية هندسية إسلامية خفيفة (Subtle Watermark)
            this.drawIslamicBackgroundGeometry(ctx, w, h, t);

            // 3. إطار خارجي مذهب فاخر
            this.drawCardBorders(ctx, w, h, t);

            // 4. البسملة وشعار الترويسة
            this.drawHeader(ctx, w, h, t);

            // 5. النص الرئيسي للآية / الذكر
            this.drawMainText(ctx, w, h, t);

            // 6. المرجع والتذييل السفلي
            this.drawFooter(ctx, w, h, t);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (version !== this.renderVersion || !canvas.isConnected) return;
            if (!blob) throw new Error('Image export failed');
            this.prepared = { file: new File([blob], `zadmuslim-${currentCardState.format}.png`, {type:'image/png'}), base64: canvas.toDataURL('image/png').split(',')[1] };
            buttons.forEach(button => button.disabled = false);
            this.status('الصورة جاهزة للمشاركة أو الحفظ');
            } catch (error) { if (version === this.renderVersion) this.status('تعذّر تجهيز الصورة. جرّب اختيار المقاس مرة أخرى.'); }
        },

        drawIslamicBackgroundGeometry(ctx, w, h, t) {
            ctx.save();
            ctx.strokeStyle = t.subtleBorder;
            ctx.lineWidth = 1.5;

            // دوائر وأشكال هندسية في المركز
            const cx = w / 2;
            const cy = h / 2;

            for (let r = 260; r <= 460; r += 100) {
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.stroke();
            }

            // مضلع نجمي ثماني في المركز
            ctx.beginPath();
            const starRadius = 380;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const x = cx + Math.cos(angle) * starRadius;
                const y = cy + Math.sin(angle) * starRadius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        },

        drawCardBorders(ctx, w, h, t) {
            ctx.save();
            const padding = 60;
            const innerPadding = 80;

            // إطار خارجي نحيف
            ctx.strokeStyle = t.borderColor;
            ctx.lineWidth = 4;
            ctx.strokeRect(padding, padding, w - (padding * 2), h - (padding * 2));

            // إطار داخلي ناعم
            ctx.strokeStyle = t.subtleBorder;
            ctx.lineWidth = 2;
            ctx.strokeRect(innerPadding, innerPadding, w - (innerPadding * 2), h - (innerPadding * 2));

            // زخارف الأركان الذهبية الأربعة (Corner Accents)
            this.drawCornerAccent(ctx, innerPadding, innerPadding, 1, 1, t.accentGold);
            this.drawCornerAccent(ctx, w - innerPadding, innerPadding, -1, 1, t.accentGold);
            this.drawCornerAccent(ctx, innerPadding, h - innerPadding, 1, -1, t.accentGold);
            this.drawCornerAccent(ctx, w - innerPadding, h - innerPadding, -1, -1, t.accentGold);

            ctx.restore();
        },

        drawCornerAccent(ctx, x, y, scaleX, scaleY, color) {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scaleX, scaleY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(0, 40);
            ctx.lineTo(0, 0);
            ctx.lineTo(40, 0);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(16, 16, 8, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.restore();
        },

        drawHeader(ctx, w, h, t) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // 1. التصنيف (مثل: آية كريمة، دعاء، أذكار الصباح)
            ctx.font = "bold 32px 'Cairo', 'Amiri', Tahoma, sans-serif";
            ctx.fillStyle = t.badgeText;

            const categoryText = `✦ ${label(currentCardState.title)} ✦`;
            ctx.fillText(categoryText, w / 2, h === 1080 ? 145 : 220);

            // 2. البسملة الشريفة بخط قرآني جميل
            ctx.font = "normal 52px 'Amiri', 'Traditional Arabic', serif";
            ctx.direction = 'rtl';
            ctx.fillStyle = t.accentGold;
            ctx.fillText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", w / 2, h === 1080 ? 220 : 330);

            // فاصل مذهب تحت البسملة
            ctx.strokeStyle = t.borderColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo((w / 2) - 150, h === 1080 ? 275 : 400);
            ctx.lineTo((w / 2) + 150, h === 1080 ? 275 : 400);
            ctx.stroke();

            // حلية في منتصف الفاصل
            ctx.fillStyle = t.accentGold;
            ctx.beginPath();
            ctx.arc(w / 2, h === 1080 ? 275 : 400, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        fitText(ctx, text, width, height, maxSize = 72) {
            for (let size = maxSize; size >= 12; size--) {
                ctx.font = `bold ${size}px 'Amiri', 'Traditional Arabic', serif`;
                const lines = this.wrapText(ctx, text, width);
                if (lines.length * size * 1.85 <= height && lines.every(line => ctx.measureText(line).width <= width)) return {lines, size, lineHeight: size * 1.85};
            }
            throw new Error('Text exceeds image bounds');
        },
        drawMainText(ctx, w, h, t) {
            ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
            const top = h === 1080 ? 315 : 460, bottom = h === 1080 ? h - 285 : h - 410;
            const subtitleHeight = currentCardState.subtitle ? Math.min(180, (bottom-top)*.3) : 0;
            const fitted = this.fitText(ctx, currentCardState.text.trim(), w-260, bottom-top-subtitleHeight);
            ctx.fillStyle = t.primaryText;
            let y = top + (bottom-top-subtitleHeight-fitted.lines.length*fitted.lineHeight)/2 + fitted.lineHeight/2;
            fitted.lines.forEach(line => { ctx.fillText(line, w/2, y); y += fitted.lineHeight; });
            if (currentCardState.subtitle) {
                const subtitle = label(currentCardState.subtitle);
                ctx.direction = /\p{Script=Arabic}/u.test(subtitle) ? 'rtl' : 'ltr';
                const sub = this.fitText(ctx, subtitle, w-280, subtitleHeight, 30);
                ctx.fillStyle = t.secondaryText; y = bottom-subtitleHeight+sub.lineHeight/2;
                sub.lines.forEach(line => { ctx.fillText(line,w/2,y); y+=sub.lineHeight; });
            }
            ctx.restore();
        },

        drawFooter(ctx, w, h, t) {
            ctx.save();
            ctx.textAlign = "center";

            // 1. المرجع (مثلاً: سورة الكهف: الآية 10)
            if (currentCardState.ref) {
                ctx.font = "bold 34px 'Cairo', Tahoma, sans-serif";
                ctx.fillStyle = t.accentGold;
                ctx.fillText(`— ${label(currentCardState.ref)} —`, w / 2, h - (h === 1080 ? 235 : 340), w - 240);
            }

            // فاصل سفلي
            ctx.strokeStyle = t.subtleBorder;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo((w / 2) - 200, h - (h === 1080 ? 195 : 280));
            ctx.lineTo((w / 2) + 200, h - (h === 1080 ? 195 : 280));
            ctx.stroke();

            // 2. توقيع زاد المسلم
            ctx.font = "bold 32px 'Cairo', Tahoma, sans-serif";
            ctx.fillStyle = t.primaryText;
            ctx.fillText(label("زاد المسلم"), w / 2, h - (h === 1080 ? 150 : 210));

            ctx.font = "24px 'Cairo', Tahoma, sans-serif";
            ctx.fillStyle = t.secondaryText;
            ctx.fillText(label("زادٌ لقلبك، ونورٌ ليومك • صدقة جارية"), w / 2, h - (h === 1080 ? 110 : 150), w - 240);

            ctx.restore();
        },

        wrapText(ctx, text, maxWidth) {
            const words = text.trim().split(/\s+/);
            const lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = ctx.measureText(currentLine + " " + word).width;
                if (width < maxWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        },

        async shareDirectlyToStory() {
            const image = this.prepared;
            if (!image || this.sharing) return;
            this.sharing = true;
            try {
                const native = window.Capacitor?.isPluginAvailable?.('ImageShare') ? window.Capacitor.Plugins.ImageShare : null;
                if (native) await native.share({base64:image.base64, text:window.ZAD_APP_SHARE_URL});
                else if (navigator.share && navigator.canShare?.({files:[image.file]})) {
                    // The file is ready before this click, preserving Safari's user activation.
                    await navigator.share({files:[image.file], title:label('زاد المسلم'), text:window.ZAD_APP_SHARE_URL});
                } else { this.status('المشاركة المباشرة غير متاحة هنا؛ استخدم حفظ الصورة ثم شاركها من جهازك.'); return; }
            } catch (error) {
                if (error.name !== 'AbortError') this.status('تعذّرت المشاركة. يمكنك حفظ الصورة ومشاركتها من جهازك.');
            } finally { this.sharing = false; }
        },
        async downloadCardImage() {
            const image = this.prepared;
            if (!image) return;
            try {
                const native = window.Capacitor?.isPluginAvailable?.('ImageShare') ? window.Capacitor.Plugins.ImageShare : null;
                if (native) {
                    const result = await native.save({base64:image.base64});
                    if (result.saved) this.status('تم حفظ الصورة');
                    return;
                }
                const url = URL.createObjectURL(image.file), link = document.createElement('a');
                link.href = url; link.download = image.file.name; document.body.append(link); link.click(); link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 60000);
                this.status('تم طلب تنزيل الصورة. إذا ظهرت في صفحة جديدة، اضغط مطولًا عليها للحفظ.');
            } catch (error) { if (error.name !== 'AbortError') this.status('تعذّر حفظ الصورة. حاول مرة أخرى.'); }
        },

        copyCardText() {
            const textToCopy = `${currentCardState.text}\n${currentCardState.ref ? '— ' + label(currentCardState.ref) : ''}\n\n${label('زاد المسلم')} 🌿: ${window.ZAD_APP_SHARE_URL}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    if (typeof window.showToast === "function") {
                        window.showToast("تم نسخ النص بنجاح 📋");
                    }
                });
            }
        }
    };

    window.ShareCardGenerator = ShareCardGenerator;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => ShareCardGenerator.init());
    } else {
        ShareCardGenerator.init();
    }

})(window, document);
