/**
 * share-card-generator.js
 * محرك توليد بطاقات "شارك الأجر" لقصص الواتساب وإنستغرام (Viral Story Cards)
 * يتيح للمستخدم تحويل أي آية أو ذكر أو دعاء لبطاقة ستوري احترافية عالية الدقة 1080x1920 بضغطة زر
 * لتطبيق زاد المسلم
 */

(function(window, document) {
    "use strict";

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
            currentCardState = {
                text: params.text || currentCardState.text,
                title: params.title || "آية مباركة",
                ref: params.ref || "زاد المسلم",
                subtitle: params.subtitle || "",
                theme: params.theme || currentCardState.theme || "royal_dark"
            };

            let modal = document.getElementById("zad-share-card-modal");
            if (modal) modal.remove();

            const modalHtml = `
                <div class="modal-overlay active" id="zad-share-card-modal" onclick="if(event.target===this)this.remove();" style="z-index: 100000;">
                    <div class="modal-card modal-box share-card-modal-box">
                        <div class="modal-head">
                            <div class="modal-head-title">
                                <i class="fa-solid fa-camera-retro text-gold"></i>
                                <span>بطاقة ستوري • شارك الأجر واكسب الثواب 🌿</span>
                            </div>
                            <button type="button" class="btn-close-modal" aria-label="إغلاق" onclick="document.getElementById('zad-share-card-modal').remove();">&times;</button>
                        </div>
                        <div class="modal-body-content share-modal-layout">
                            <div class="share-card-preview-area">
                                <div class="canvas-aspect-wrapper">
                                    <canvas id="zad-story-canvas" width="1080" height="1920"></canvas>
                                </div>
                            </div>
                            <div class="share-card-controls">
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
                                        <i class="fa-brands fa-whatsapp"></i> <span>نشر في ستوري / واتساب 📲</span>
                                    </button>
                                    <button type="button" class="btn btn-solid btn-download-story" onclick="ShareCardGenerator.downloadCardImage();">
                                        <i class="fa-solid fa-download"></i> <span>حفظ بجودة HD</span>
                                    </button>
                                    <button type="button" class="btn btn-outline btn-copy-story-text" onclick="ShareCardGenerator.copyCardText();">
                                        <i class="fa-solid fa-copy"></i> <span>نسخ النص</span>
                                    </button>
                                </div>
                                <p class="share-hint-txt">💡 كل شخص يقرأ الآية أو يحمل التطبيق بسببك، لك مثل أجره إن شاء الله.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML("beforeend", modalHtml);

            // تأخير بسيط لضمان تجهيز عناصر الـ DOM والخطوط
            setTimeout(() => {
                this.renderCanvas();
            }, 50);
        },

        switchTheme(themeId, btn) {
            currentCardState.theme = themeId;
            document.querySelectorAll(".theme-selection-row .theme-pill-btn").forEach(b => b.classList.remove("active"));
            if (btn) btn.classList.add("active");
            this.renderCanvas();
        },

        renderCanvas() {
            const canvas = document.getElementById("zad-story-canvas");
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
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

            const categoryText = `✦ ${currentCardState.title} ✦`;
            ctx.fillText(categoryText, w / 2, 220);

            // 2. البسملة الشريفة بخط قرآني جميل
            ctx.font = "normal 52px 'Amiri', 'Traditional Arabic', serif";
            ctx.fillStyle = t.accentGold;
            ctx.fillText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", w / 2, 330);

            // فاصل مذهب تحت البسملة
            ctx.strokeStyle = t.borderColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo((w / 2) - 150, 400);
            ctx.lineTo((w / 2) + 150, 400);
            ctx.stroke();

            // حلية في منتصف الفاصل
            ctx.fillStyle = t.accentGold;
            ctx.beginPath();
            ctx.arc(w / 2, 400, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        drawMainText(ctx, w, h, t) {
            ctx.save();
            ctx.textAlign = "center";
            ctx.direction = "rtl";

            const rawText = currentCardState.text.trim();
            const maxWidth = w - 240;

            // تحديد حجم الخط بناء على طول النص
            let fontSize = 54;
            if (rawText.length > 200) fontSize = 42;
            else if (rawText.length > 120) fontSize = 48;
            else if (rawText.length < 50) fontSize = 62;

            ctx.font = `bold ${fontSize}px 'Amiri', 'Traditional Arabic', 'Cairo', serif`;
            ctx.fillStyle = t.primaryText;

            const lineHeight = fontSize * 1.8;
            const lines = this.wrapText(ctx, rawText, maxWidth);

            const totalHeight = lines.length * lineHeight;
            let startY = (h / 2) - (totalHeight / 2) + 20;

            lines.forEach((line) => {
                ctx.fillText(line, w / 2, startY);
                startY += lineHeight;
            });

            // لو فيه شرح أو تدبر
            if (currentCardState.subtitle) {
                ctx.font = "34px 'Cairo', Tahoma, sans-serif";
                ctx.fillStyle = t.secondaryText;
                const subLines = this.wrapText(ctx, `« ${currentCardState.subtitle} »`, maxWidth - 80);
                startY += 40;
                subLines.forEach(sLine => {
                    ctx.fillText(sLine, w / 2, startY);
                    startY += 54;
                });
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
                ctx.fillText(`— ${currentCardState.ref} —`, w / 2, h - 340);
            }

            // فاصل سفلي
            ctx.strokeStyle = t.subtleBorder;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo((w / 2) - 200, h - 280);
            ctx.lineTo((w / 2) + 200, h - 280);
            ctx.stroke();

            // 2. توقيع زاد المسلم
            ctx.font = "bold 44px 'Cairo', Tahoma, sans-serif";
            ctx.fillStyle = t.primaryText;
            ctx.fillText("زاد المسلم 🌿", w / 2, h - 210);

            ctx.font = "28px 'Cairo', Tahoma, sans-serif";
            ctx.fillStyle = t.secondaryText;
            ctx.fillText("زادٌ لقلبك، ونورٌ ليومك • صدقة جارية", w / 2, h - 150);

            ctx.restore();
        },

        wrapText(ctx, text, maxWidth) {
            const words = text.split(" ");
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
            const canvas = document.getElementById("zad-story-canvas");
            if (!canvas) return;

            // منح وسام سفير الخير
            if (window.SmartKhatmaService && typeof window.SmartKhatmaService.awardBadge === "function") {
                window.SmartKhatmaService.awardBadge("badge_share_hero");
            }

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const file = new File([blob], "zadmuslim-story.png", { type: "image/png" });
                const shareText = `${currentCardState.text}\n\n${currentCardState.ref ? '— ' + currentCardState.ref : ''}\n\nتطبيق زاد المسلم 🌿: https://zadmuslim-zeta.vercel.app/`;

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: "زاد المسلم",
                            text: shareText,
                            files: [file]
                        });
                        if (typeof window.showToast === "function") {
                            window.showToast("تم فتح شاشة المشاركة بنجاح! تقبل الله منك 🤍");
                        }
                    } catch (err) {
                        if (err.name !== "AbortError") {
                            this.fallbackDownloadAndCopy(blob, shareText);
                        }
                    }
                } else {
                    this.fallbackDownloadAndCopy(blob, shareText);
                }
            }, "image/png");
        },

        fallbackDownloadAndCopy(blob, shareText) {
            // تحميل الصورة
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "zadmuslim-story.png";
            a.click();
            URL.revokeObjectURL(url);

            // نسخ النص للحافظة
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareText);
            }

            if (typeof window.showToast === "function") {
                window.showToast("تم حفظ بطاقة الستوري بنجاح ونسخ النص لنشرها في الواتساب وإنستغرام 🌿");
            }
        },

        downloadCardImage() {
            const canvas = document.getElementById("zad-story-canvas");
            if (!canvas) return;

            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `zadmuslim-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);

                if (window.SmartKhatmaService) {
                    window.SmartKhatmaService.awardBadge("badge_share_hero");
                }

                if (typeof window.showToast === "function") {
                    window.showToast("تم تنزيل بطاقة الستوري بدقة فائقة HD 📥");
                }
            }, "image/png");
        },

        copyCardText() {
            const textToCopy = `${currentCardState.text}\n${currentCardState.ref ? '— ' + currentCardState.ref : ''}\n\nزاد المسلم 🌿: https://zadmuslim-zeta.vercel.app/`;
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
