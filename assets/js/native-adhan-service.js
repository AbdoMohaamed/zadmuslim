/**
 * native-adhan-service.js
 * نظام جدولة الأذان والمنبهات الأصلية لتطبيقات الموبايل (Capacitor Android & iOS)
 * تنبيهات نظام الهاتف: أذان كامل على Android، وصوت إشعار محدود على iOS، حسب الأذونات.
 */

const NativeAdhanService = {
    isNative: false,
    channelsCreated: false,

    getSalawatAudioUrl() {
        const voice=this.getNotificationSettings().salawatVoice;
        return 'assets/audio/' + ({voice1:'salawat-1',voice2:'salawat-2'}[voice] || 'salawat') + '.mp3';
    },

    async init() {
        // التحقق مما إذا كان التطبيق يعمل كـ Native App (Capacitor)
        if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
            this.isNative = true;
            console.log("🕌 Native Adhan Service: Running on Native Platform (Android / iOS)");
            await this.requestPermissions();
            await this.createNotificationChannels();
            await this.registerPrayerActions();
            this.setupListeners();
            if (localStorage.getItem('smart_notify_configured') === 'true') await this.scheduleLocalNotifications();
        } else {
            console.log("🌐 Native Adhan Service: Running on Web / PWA fallback mode");
        }
    },

    getSelectedMuazzin() {
        if (typeof window !== "undefined" && typeof window.getSelectedMuazzinId === "function") {
            const id = window.getSelectedMuazzinId();
            if (id) return id;
        }
        const saved = typeof localStorage !== "undefined" ? localStorage.getItem("zad_selected_muazzin") : null;
        const valid = ["qatami", "abdulbasit", "refaat", "makkah", "madinah", "aqsa"];
        return (saved && valid.includes(saved)) ? saved : "qatami";
    },

    prayerImageOptions(prayerKey) {
        const enabled = this.getNotificationSettings().prayerImages === true || localStorage.getItem('zad_show_prayer_images') === '1';
        if (!enabled || window.Capacitor?.getPlatform?.() !== 'ios' || !['fajr','dhuhr','asr','maghrib','isha'].includes(prayerKey)) return {};
        return {attachments:[{id:'prayer-'+prayerKey,url:'res:///assets/images/prayers/pre_'+prayerKey+'.jpg'}]};
    },

    async registerPrayerActions() {
        const plugin = window.Capacitor?.Plugins?.LocalNotifications;
        if (window.Capacitor?.getPlatform?.() !== 'ios' || this.prayerActionsRegistered || !plugin?.registerActionTypes) return;
        await plugin.registerActionTypes({types:[{id:'OPEN_PRAYER',actions:[{id:'dismiss_adhan',title:'إغلاق التنبيه',foreground:false}]}]});
        this.prayerActionsRegistered = true;
    },

    async requestPermissions() {
        try {
            if (!window.Capacitor || !window.Capacitor.Plugins) return;
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications) return;
            const status = await LocalNotifications.checkPermissions();
            if (status.display !== "granted") {
                const requested = await LocalNotifications.requestPermissions();
                return requested.display === "granted";
            }
            return true;
        } catch (e) {
            console.warn("Failed to request native notification permissions:", e);
        }
        return false;
    },

    async createNotificationChannels() {
        try {
            if (!window.Capacitor || !window.Capacitor.Plugins) return;
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications || this.channelsCreated) return;

            // قنوات الأذان وقنوات التنبيه المسبق بصوت ناطق
            const channels = [
                { id: "prayer_pre_alert", name: "تنبيه اقتراب موعد الصلاة", sound: "pre_prayer", importance: 4 },
                { id: "prayer_pre_fajr", name: "تنبيه اقتراب صلاة الفجر", sound: "pre_fajr", importance: 4 },
                { id: "prayer_pre_dhuhr", name: "تنبيه اقتراب صلاة الظهر", sound: "pre_dhuhr", importance: 4 },
                { id: "prayer_pre_asr", name: "تنبيه اقتراب صلاة العصر", sound: "pre_asr", importance: 4 },
                { id: "prayer_pre_maghrib", name: "تنبيه اقتراب صلاة المغرب", sound: "pre_maghrib", importance: 4 },
                { id: "prayer_pre_isha", name: "تنبيه اقتراب صلاة العشاء", sound: "pre_isha", importance: 4 },
                { id: "adhan_qatami", name: "أذان الشيخ ناصر القطامي (الافتراضي)", sound: "adhan_qatami", importance: 5 },
                { id: "adhan_abdulbasit", name: "أذان الشيخ عبد الباسط", sound: "adhan_abdulbasit", importance: 5 },
                { id: "adhan_refaat", name: "أذان الشيخ محمد رفعت", sound: "adhan_refaat", importance: 5 },
                { id: "adhan_fajr", name: "أذان الفجر المخصوص", sound: "adhan_fajr", importance: 5 },
                { id: "daily_adhkar", name: "أذكار الصباح والمساء وسورة الكهف", sound: null, importance: 4 },
                { id: "hourly_salawat", name: "تذكير الصلاة على النبي ﷺ", sound: "salawat", importance: 4 },
                { id: "hourly_salawat_voice1", name: "الصلاة على النبي ﷺ — الصوت الأول", sound: "salawat_1", importance: 4 },
                { id: "hourly_salawat_voice2", name: "الصلاة على النبي ﷺ — الصوت الثاني", sound: "salawat_2", importance: 4 },
                { id: "hourly_salawat_silent", name: "تذكير الصلاة على النبي ﷺ (بدون صوت)", sound: null, importance: 3 },
                { id: "zad_cloud_broadcast_channel", name: "إشعارات ورسائل زاد المسلم العامة", sound: null, importance: 4 }
            ];

            for (const ch of channels) {
                try {
                    await LocalNotifications.createChannel({
                        id: ch.id,
                        name: ch.name,
                        description: `قناة تنبيهات ${ch.name}`,
                        sound: ch.sound,
                        importance: ch.importance, // 5 = MAX (Heads-up notification + Full Sound), 4 = HIGH
                        visibility: 1, // إشعار مرئي على شاشة القفل
                        vibration: true,
                        lights: true,
                        lightColor: "#d4af37"
                    });
                } catch (chErr) {
                    // القناة قد تكون مسجلة مسبقاً
                }
            }

            this.channelsCreated = true;
            console.log("✅ Native Adhan Channels created successfully");
        } catch (e) {
            console.warn("Failed to create native notification channels:", e);
        }
    },

    setupListeners() {
        try {
            if (!window.Capacitor || !window.Capacitor.Plugins) return;
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications) return;

            // عند النقر على إشعار من شاشة القفل أو الستارة في نظام iOS و Android
            LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
                console.log("🕌 Native Notification Action performed:", action);
                const notif = action.notification;
                if (action.actionId === "dismiss_adhan") {
                    LocalNotifications.removeDeliveredNotifications({notifications:[{id:notif.id}]}).catch(e=>console.warn("Dismiss notification failed",e));
                    return;
                }
                if (notif && notif.extra) {
                    // تشغيل صوت الأذان داخل التطبيق فقط إذا ضغط المستخدم عمداً وبشكل صريح على زر "سماع الأذان" (actionId === 'play_adhan')
                    // أما إذا نقر على الإشعار لفتح التطبيق، فلن يتم تشغيل الصوت مجدداً لأن الأذان أذّن في وقته بالفعل
                    if (notif.extra.type === "adhan_call" && notif.extra.prayerKey && action.actionId === "play_adhan") {
                        const pKey = notif.extra.prayerKey;
                        const pName = notif.extra.prayerName || "الصلاة";
                        const muazzin = notif.extra.muazzin;
                        if (typeof playAdhanAudio === "function") {
                            playAdhanAudio(pKey, muazzin, pName);
                        }
                    }
                }
            });

            // الاستماع أيضاً لاستلام الإشعار أثناء فتح التطبيق (دون إعادة تشغيل أصوات قديمة)
            LocalNotifications.addListener("localNotificationReceived", (notif) => {
                console.log("🕌 Native Notification received:", notif);
            });
        } catch (e) {
            console.warn("Error setting up native notification listeners:", e);
        }
    },

    /**
     * جدولة مواقيت الصلوات الخمس والتنبيه المسبق بـ 5 دقائق في نظام الهاتف الأصلي (AlarmManager / iOS Notifications)
     */
    async cancelPrayerAlarms() {
        const plugins = window.Capacitor?.Plugins;
        try { await plugins?.AdhanNative?.cancelAllAlarms(); } catch {}
        try {
            const pending = await plugins?.LocalNotifications?.getPending();
            const prayers = pending?.notifications?.filter(n => n.id < 70000) || [];
            if (prayers.length) await plugins.LocalNotifications.cancel({ notifications: prayers });
        } catch {}
    },
    async futurePrayerDays(now) {
        const source = window.zadPrayerApiSource;
        if (!source || !window.Capacitor?.isNativePlatform?.()) return [];
        const days = [];
        const months = new Map();
        for (let offset = 1; offset < 14; offset++) {
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
            const month = date.getFullYear() + '/' + (date.getMonth() + 1);
            if (!months.has(month)) {
                const url = source.replace('/timingsByCity?', '/calendarByCity/' + month + '?').replace('/timings?', '/calendar/' + month + '?') + '&iso8601=true';
                const key = 'zad_alarm_calendar:' + url;
                let entries;
                try { entries = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
                if (!Array.isArray(entries)) {
                    try {
                        const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
                        if (!response.ok) throw new Error('Calendar unavailable');
                        const result = await response.json();
                        entries = result.code === 200 && Array.isArray(result.data) ? result.data : [];
                        if (entries.length) localStorage.setItem(key, JSON.stringify(entries));
                    } catch { entries = []; }
                }
                months.set(month, entries);
            }
            const entry = months.get(month).find(e => Number(e.date?.gregorian?.day) === date.getDate());
            const expected = date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0') + 'T';
            if (entry && ['Fajr','Dhuhr','Asr','Maghrib','Isha'].every(k => entry.timings?.[k]?.startsWith(expected) && Number.isFinite(Date.parse(entry.timings[k])))) days.push({date, timings:entry.timings});
        }
        return window.zadPrayerApiSource === source ? days : [];
    },

    async recurringReminders(settings) {
        const list = [];
        const daily = (id, type, title, body, time, weekday) => {
            const [hour, minute] = time.split(':').map(Number);
            list.push({id, title, body, channelId:'daily_adhkar', smallIcon:'res://ic_stat_icon', extra:{type}, schedule:{on:{hour,minute,...(weekday ? {weekday}: {})},allowWhileIdle:true}});
        };
        if (settings.morning !== false) daily(70000,'morning_azkar','أذكار الصباح','ابدأ يومك بذكر الله',settings.morningTime);
        if (settings.evening !== false) daily(71000,'evening_azkar','أذكار المساء','حان وقت أذكار المساء',settings.eveningTime);
        if (settings.sleep) daily(73000,'sleep_azkar','أذكار النوم','باسمك ربي وضعت جنبي وبك أرفعه',settings.sleepTime);
        if (settings.friday !== false) daily(72000,'friday_kahf','جمعة مباركة','تذكير بسورة الكهف والصلاة على النبي ﷺ','09:00',6);
        if (settings.fasting) for (const day of [1,4]) daily(74000+day,'fasting','تذكير بالصيام','غدًا موعد صيام الإثنين أو الخميس','20:00',day);
        const salawatStem = {voice1:'salawat_1',voice2:'salawat_2'}[settings.salawatVoice] || 'salawat';
        const salawatChannel = {voice1:'hourly_salawat_voice1',voice2:'hourly_salawat_voice2'}[settings.salawatVoice] || 'hourly_salawat';
        if (settings.hourlySalawat !== false) list.push({id:80001,title:'ﷺ صلِّ على النبي',body:'اللهم صلِّ وسلِّم وبارك على نبينا محمد ﷺ',sound:settings.salawatSound !== false ? salawatStem + (window.Capacitor?.getPlatform?.()==='ios' ? '.wav' : '.mp3'):null,channelId:settings.salawatSound !== false ? salawatChannel:'hourly_salawat_silent',extra:{type:'hourly_salawat'},schedule:{every:'minute',count:settings.salawatInterval,allowWhileIdle:true}});
        if (window.Capacitor?.getPlatform?.() === 'android') {
            const plugin = window.Capacitor.Plugins.AdhanNative;
            if (!plugin?.scheduleReminders) throw new Error('حدّث تطبيق الهاتف لتفعيل التذكيرات المستمرة');
            const scheduled = await plugin.scheduleReminders({reminders:list});
            if (scheduled?.success === false) throw new Error('تعذّرت جدولة تذكيرات أندرويد');
            return [];
        }
        return list;
    },

    async schedulePrayers(prayersTimings) {
        const revision = this.scheduleRevision = (this.scheduleRevision || 0) + 1;
        if (!window.zadPrayerVerified) {
            try {
                const saved = JSON.parse(localStorage.getItem('zad_alarm_days') || 'null');
                const signature = JSON.stringify([localStorage.getItem('selected_prayer_city'),localStorage.getItem('zad_prayer_method')||'',localStorage.getItem('zad_prayer_school')||'0',localStorage.getItem('gps_prayer_coords'),Intl.DateTimeFormat().resolvedOptions().timeZone]);
                const today = new Date().toLocaleDateString('en-CA');
                const entry = saved?.signature === signature && saved.days.find(d => d.date === today);
                if (entry) {
                    prayersTimings = Object.fromEntries(Object.entries(entry.timings).map(([k,v])=>[k,v.includes('T') ? v.slice(11,16) : v]));
                    window.zadPrayerApiSource = saved.source;
                    window.zadPrayerVerified = true;
                    localStorage.setItem('zad_prayer_verified',JSON.stringify({date:today,city:localStorage.getItem('selected_prayer_city'),method:localStorage.getItem('zad_prayer_method')||'',school:localStorage.getItem('zad_prayer_school')||'0'}));
                }
            } catch {}
        }
        let verified;
        try { verified = JSON.parse(localStorage.getItem('zad_prayer_verified') || 'null'); } catch { return; }
        if (!window.zadPrayerVerified || verified?.date !== new Date().toLocaleDateString('en-CA') ||
            verified.city !== localStorage.getItem('selected_prayer_city') ||
            verified.method !== (localStorage.getItem('zad_prayer_method') || '') ||
            verified.school !== (localStorage.getItem('zad_prayer_school') || '0')) return;
        if (!prayersTimings) {
            if (typeof window !== "undefined" && typeof window.getPrayerTimings === "function") {
                prayersTimings = window.getPrayerTimings();
            } else if (typeof window !== "undefined" && window.prayerTimings) {
                prayersTimings = window.prayerTimings;
            } else {
                try {
                    const raw = localStorage.getItem("last_active_prayer_timings");
                    if (raw) prayersTimings = JSON.parse(raw);
                } catch(e) {}
            }
        }
        if (!prayersTimings) return;
        if (!this.isNative) {
            if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
                this.isNative = true;
            }
        }

        try {
            if (!window.Capacitor || !window.Capacitor.Plugins) return;
            const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
            if (!LocalNotifications) return;

            // التأكد من الصلاحيات والقنوات أولاً
            if (!await this.requestPermissions()) return { success: false, message: 'إذن الإشعارات غير متاح؛ فعّله من إعدادات الهاتف.' };
            await this.createNotificationChannels();
            await this.registerPrayerActions();

            const selectedMuazzin = this.getSelectedMuazzin();
            const enabledPrayers = this.getEnabledPrayers();
            const now = new Date();

            const settingsSnapshot = localStorage.getItem('smart_notify_settings');
            const futureDays = await this.futurePrayerDays(now);
            if (revision !== this.scheduleRevision || settingsSnapshot !== localStorage.getItem('smart_notify_settings')) return {success:false};
            if (!window.zadPrayerVerified || JSON.stringify(verified) !== localStorage.getItem('zad_prayer_verified')) return {success:false};
            localStorage.setItem('zad_alarm_days',JSON.stringify({
                signature:JSON.stringify([localStorage.getItem('selected_prayer_city'),localStorage.getItem('zad_prayer_method')||'',localStorage.getItem('zad_prayer_school')||'0',localStorage.getItem('gps_prayer_coords'),Intl.DateTimeFormat().resolvedOptions().timeZone]),
                source:window.zadPrayerApiSource,
                days:[{date:now.toLocaleDateString('en-CA'),timings:prayersTimings},...futureDays.map(d=>({date:d.date.toLocaleDateString('en-CA'),timings:d.timings}))]
            }));
            const prayersList = [
                { idBase: 100, name: "صلاة الفجر", key: "fajr", time: prayersTimings.Fajr },
                { idBase: 200, name: "صلاة الظهر", key: "dhuhr", time: prayersTimings.Dhuhr },
                { idBase: 300, name: "صلاة العصر", key: "asr", time: prayersTimings.Asr },
                { idBase: 400, name: "صلاة المغرب", key: "maghrib", time: prayersTimings.Maghrib },
                { idBase: 500, name: "صلاة العشاء", key: "isha", time: prayersTimings.Isha }
            ].filter(p => enabledPrayers[p.key] !== false);

            const notificationsToSchedule = [];

            const notifySettings = this.getNotificationSettings();

            const preInterval = parseInt(notifySettings.prePrayerInterval, 10) || 5;

            // Dated daily timings; iOS requests are capped below before submission.
            for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
                const targetDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);

                for (const p of prayersList) {
                    const future = futureDays.find(d => d.date.toDateString() === targetDay.toDateString());
                    if (dayOffset > 0 && !future) continue;
                    if (!p.time) continue;
                    const clean = p.time.split(" ")[0];
                    const [h, m] = clean.split(":").map(Number);

                    const timingKey = p.key[0].toUpperCase() + p.key.slice(1);
                    const prayerMoment = dayOffset > 0 ? new Date(future.timings[timingKey]) : new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), h, m, 0);

                    // 1. تنبيه اقتراب موعد الصلاة قبل دقائق مخصصة (Pre-prayer reminder بصوت ناطق)
                    if (notifySettings.prePrayer !== false) {
                        const preAlertMoment = new Date(prayerMoment.getTime() - (preInterval * 60 * 1000));
                        if (preAlertMoment.getTime() > now.getTime() + 1000) {
                            const preNotifId = p.idBase + 1000 + (dayOffset * 2000);
                            const preSoundName = `pre_${p.key}.mp3`;
                            notificationsToSchedule.push({
                                id: preNotifId,
                                ...this.prayerImageOptions(p.key),
                                actionTypeId: "OPEN_PRAYER",
                                title: `⏳ اقتربت ${p.name}`,
                                body: `بقي ${preInterval} دقائق على دخول وقت ${p.name}. تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿`,
                                schedule: {
                                    at: preAlertMoment,
                                    allowWhileIdle: true
                                },
                                sound: preSoundName,
                                channelId: `prayer_pre_${p.key}`,
                                smallIcon: "res://ic_stat_icon",
                                iconColor: "#d4af37",
                                extra: {
                                    prayerKey: p.key,
                                    prayerName: p.name,
                                    type: "pre_prayer_alert"
                                }
                            });
                        }
                    }

                    // 2. إشعار دخول وقت الصلاة والأذان التام (Main Adhan Notification)
                    if (notifySettings.adhan !== false && prayerMoment.getTime() > now.getTime() + 1000) {
                        const notifId = p.idBase + (dayOffset * 2000);
                        const isFajr = p.key === "fajr";
                        const channelId = isFajr ? "adhan_fajr" : `adhan_${selectedMuazzin}`;
                        const soundName = isFajr ? "adhan_fajr.mp3" : `adhan_${selectedMuazzin}.mp3`;

                        notificationsToSchedule.push({
                            id: notifId,
                            ...this.prayerImageOptions(p.key),
                            title: `🕌 حَانَ الآنَ مَوْعِدُ ${p.name}`,
                            body: `الله أكبر، الله أكبر.. حان الآن موعد ${p.name} حسب توقيتك المحلي. حيّ على الصلاة، حيّ على الفلاح 🕋`,
                            schedule: {
                                at: prayerMoment,
                                allowWhileIdle: true // يعمل حتى في وضع توفير الطاقة وقفل الشاشة العميق (Doze Mode)
                            },
                            sound: soundName,
                            channelId: channelId,
                            smallIcon: "res://ic_stat_icon",
                            iconColor: "#d4af37",
                            actionTypeId: "OPEN_PRAYER",
                            extra: {
                                prayerKey: p.key,
                                prayerName: p.name,
                                muazzin: selectedMuazzin,
                                type: "adhan_call"
                            }
                        });
                    }
                }

            }

            // 1. استخدام بلجن الأذان الأصلي لنظام أندرويد (AdhanNative) لتشغيل الأذان الحقيقي وتحديث ويدجت الشاشة
            let hasNativePlugin = false;
            if (window.Capacitor?.getPlatform?.() === 'android' && window.Capacitor.Plugins.AdhanNative) {
                try {
                    let hijriDateStr = "";
                    let gregorianDateStr = "";
                    try {
                        const hEl = document.getElementById("daily-hijri-date") || document.getElementById("hijri-date-text") || document.getElementById("app-header-hijri-date") || document.getElementById("hero-hijri-date-text");
                        if (hEl && hEl.innerText) hijriDateStr = hEl.innerText.trim();
                    } catch(e) {}
                    if (!hijriDateStr) {
                        try {
                            const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                            hijriDateStr = hijriFormatter.format(new Date()) + " هـ";
                        } catch(e) {}
                    }
                    try {
                        const gregFormatter = new Intl.DateTimeFormat('ar-EG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        });
                        gregorianDateStr = gregFormatter.format(new Date()) + " م";
                    } catch(e) {}

                    const showPrayerImages = notifySettings.prayerImages === true || localStorage.getItem('zad_show_prayer_images') === '1';
                    await window.Capacitor.Plugins.AdhanNative.setAdhanVolume?.({volume:Math.max(0.1,Math.min(1,Number(localStorage.getItem('zad_adhan_volume') || 1)))});
                    const nativeRes = await window.Capacitor.Plugins.AdhanNative.schedulePrayerAlarms({
                        alarmSchedule: notificationsToSchedule.filter(n => n.id < 70000).map(n => ({at:n.schedule.at.getTime(),prayerKey:n.extra.prayerKey,prayerName:n.extra.prayerName,isPreAlert:n.extra.type==='pre_prayer_alert',muazzin:selectedMuazzin,preAlertInterval:preInterval,showImages:showPrayerImages})),
                        timings: prayersTimings,
                        muazzin: selectedMuazzin,
                        preAlert: notifySettings.prePrayer !== false,
                        preAlertInterval: preInterval,
                        adhan: notifySettings.adhan !== false,
                        enabledPrayers: enabledPrayers,
                        prayerImages: showPrayerImages,
                        hijriDate: hijriDateStr,
                        gregorianDate: gregorianDateStr
                    });
                    if (nativeRes?.success === false) throw new Error('Native scheduling rejected');
                    hasNativePlugin = true;
                    console.log("✅ Native Adhan Android Service: Alarms & Home Widget scheduled successfully:", nativeRes);
                } catch(nativeErr) {
                    await window.Capacitor.Plugins.AdhanNative.cancelAllAlarms();
                    console.warn("Native Adhan Android plugin call failed, falling back to LocalNotifications:", nativeErr);
                }
            }

            // في نظام أندرويد: بلجن AdhanNative يتكفل بجميع منبهات الأذان والتنبيه المسبق وتشغيل الصوت والتحكم بأزرار الصوت والقفل
            // بينما نجدول عبر LocalNotifications تذكيرات الأذكار الصباحية والمسائية وسورة الكهف فقط لمنع ازدواجية الإشعارات
            const isAndroid = window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android';
            let notificationsForLocal = notificationsToSchedule;
            if (isAndroid && hasNativePlugin) {
                notificationsForLocal = notificationsToSchedule.filter(n => n.id >= 70000);
            }

            notificationsForLocal = notificationsForLocal.filter(n => n.id < 70000).sort((a,b)=>a.schedule.at-b.schedule.at).slice(0,50);
            notificationsForLocal.push(...await this.recurringReminders(notifySettings));
            // Remove legacy iOS native prayer requests; LocalNotifications owns iOS scheduling.
            if (window.Capacitor?.getPlatform?.() === 'ios') await window.Capacitor.Plugins.AdhanNative?.cancelAllAlarms?.();
            const pending = await LocalNotifications.getPending();
            const owned = (pending.notifications || []).filter(n => n.id > 0 && n.id < 90000);
            if (owned.length) await LocalNotifications.cancel({ notifications: owned });

            if (notificationsForLocal.length > 0) {
                // جدولة الإشعارات الكاملة في نظام التشغيل (يدعم نظام iOS وأندرويد)
                await LocalNotifications.schedule({ notifications: notificationsForLocal });
                console.log(`✅ Native Adhan Service: Scheduled ${notificationsForLocal.length} notifications via LocalNotifications directly into OS.`);
            }
            if (isAndroid && !hasNativePlugin && (notifySettings.adhan !== false || notifySettings.prePrayer !== false)) {
                return {success:false, remindersScheduled:true, message:'تم حفظ التذكيرات، لكن تعذّر تفعيل تشغيل الأذان الكامل في أندرويد. أعد التفعيل بعد مراجعة الأذونات.'};
            }
            const prayerRequests = notificationsToSchedule.filter(n=>n.id<70000);
            const actualRequests = isAndroid && hasNativePlugin ? prayerRequests : notificationsForLocal.filter(n=>n.id<70000);
            const needsPrayerAlerts = (notifySettings.adhan !== false || notifySettings.prePrayer !== false) && Object.values(enabledPrayers).some(enabled=>enabled!==false);
            if (needsPrayerAlerts && actualRequests.length === 0) return {success:false,remindersScheduled:true,message:'لا توجد مواعيد صلاة قادمة مجدولة. حدّث المواقيت من الرئيسية؛ التذكيرات الأخرى محفوظة.'};
            if (isAndroid && actualRequests.length && !await this.checkExactAlarmPermission()) return {success:false,prayersScheduled:true,remindersScheduled:true,message:'حُفظت التنبيهات، لكن إذن المنبّهات الدقيقة غير مفعّل. فعّله لضبط توقيت الأذان وتشغيله في الخلفية.'};
            const until = actualRequests.length ? new Date(Math.max(...actualRequests.map(n=>n.schedule.at.getTime()))).toLocaleDateString('ar-EG') : '';
            return { success: true, message: until ? 'تمت الجدولة في الهاتف؛ الأذان حتى ' + until + '. افتح التطبيق لتجديد المواعيد قبل انتهاء المدة.' : 'تم حفظ التذكيرات المتكررة في الهاتف.' };
        } catch (e) {
            console.warn("Failed to schedule native prayer alarms:", e);
            return { success: false, message: 'تعذّرت جدولة التنبيهات في نظام الهاتف.' };
        }
    },

    getNotificationSettings() {
        const defaults = { morning: true, morningTime: '06:30', evening: true, eveningTime: '17:00', sleep: true, sleepTime: '22:30', friday: true, hourlySalawat: true, salawatInterval: 60, prePrayer: true, prePrayerInterval: 5, adhan: true };
        let saved;
        try { saved = JSON.parse(localStorage.getItem('smart_notify_settings')); } catch {}
        const settings = { ...defaults, ...(saved && typeof saved === 'object' ? saved : {}) };
        for (const key of ['morningTime','eveningTime','sleepTime']) {
            if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(settings[key])) settings[key] = defaults[key];
        }
        for (const key of ['salawatInterval','prePrayerInterval']) {
            const value = Number(settings[key]);
            settings[key] = Number.isInteger(value) && value > 0 && value <= 1440 ? value : defaults[key];
        }
        settings.salawatVoice = ["voice1","voice2"].includes(settings.salawatVoice) ? settings.salawatVoice : "default";
        return settings;
    },

    getEnabledPrayers() {
        try {
            const raw = localStorage.getItem("zad_enabled_prayers");
            if (raw) return JSON.parse(raw);
        } catch(e) {}
        return { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true };
    },

    setPrayerEnabled(prayerKey, isEnabled) {
        const current = this.getEnabledPrayers();
        current[prayerKey] = !!isEnabled;
        localStorage.setItem("zad_enabled_prayers", JSON.stringify(current));
        // إعادة الجدولة إن كانت المواقيت متوفرة
        this.schedulePrayers();
        return current;
    },

    /**
     * جدولة إشعارات الأذكار والصلاة على النبي وسنن الأسبوع فورياً في نظام التشغيل (مع تحديث الصلوات إن كانت متوفرة)
     */
    async scheduleLocalNotifications() {
        {
            const result = await this.schedulePrayers();
            if (result) return result;
        }
        if (!window.Capacitor || !window.Capacitor.Plugins) return;
        const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
        if (!LocalNotifications) return;

        try {
            if (!await this.requestPermissions()) return { success: false, message: 'إذن الإشعارات غير متاح؛ فعّله من إعدادات الهاتف.' };
            await this.createNotificationChannels();
            await this.registerPrayerActions();

            const notifySettings = this.getNotificationSettings();
            if (notifySettings.adhan === false && notifySettings.prePrayer === false) await this.cancelPrayerAlarms();
            // إلغاء الإشعارات السابقة من نوع أذكار وصلاة على النبي فقط (IDs 70000 to 89999)
            const pending = await LocalNotifications.getPending();
            if (pending && pending.notifications && pending.notifications.length > 0) {
                const oldNonPrayers = pending.notifications.filter(n => n.id >= 70000 && n.id < 90000);
                if (oldNonPrayers.length > 0) {
                    await LocalNotifications.cancel({ notifications: oldNonPrayers });
                }
            }

            const recurring = await this.recurringReminders(notifySettings);
            if (recurring.length > 0) {
                await LocalNotifications.schedule({ notifications: recurring });
            }

            if ((notifySettings.adhan !== false || notifySettings.prePrayer !== false)) {
                return {success:false, remindersScheduled:true, message:'تم حفظ الأذكار والصلاة على النبي، لكن الأذان لم يُجدول لعدم توفر مواقيت مؤكدة. افتح الرئيسية وحدّث مواقيت الصلاة لموقعك ثم أعد التفعيل.'};
            }
            return { success: true };
        } catch (e) {
            console.warn("NativeAdhanService.scheduleLocalNotifications error:", e);
            return { success: false, message: 'تعذّرت جدولة التذكيرات في نظام الهاتف.' };
        }
    },

    /**
     * تحديث ويدجت الشاشة الرئيسية (Home Screen Widget) بمواقيت الصلاة والتاريخ الهجري والميلادي
     */
    async updateWidget(timings, hijriDate, gregorianDate) {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                let hDate = hijriDate || "";
                let gDate = gregorianDate || "";
                if (!hDate) {
                    try {
                        const hEl = document.getElementById("daily-hijri-date") || document.getElementById("hijri-date-text") || document.getElementById("app-header-hijri-date") || document.getElementById("hero-hijri-date-text");
                        if (hEl && hEl.innerText) hDate = hEl.innerText.trim();
                    } catch(e) {}
                    if (!hDate) {
                        try {
                            const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                            hDate = hijriFormatter.format(new Date()) + " هـ";
                        } catch(e) {}
                    }
                }
                if (!gDate) {
                    try {
                        const gregFormatter = new Intl.DateTimeFormat('ar-EG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        });
                        gDate = gregFormatter.format(new Date()) + " م";
                    } catch(e) {}
                }

                const finalTimings = timings || window.prayerTimings || window.lastFetchedPrayerTimings || (function() {
                    try { return JSON.parse(localStorage.getItem("last_active_prayer_timings") || "null"); } catch(e) { return null; }
                })();

                await window.Capacitor.Plugins.AdhanNative.updatePrayerWidget({
                    timings: finalTimings,
                    timingsJson: JSON.stringify(finalTimings || {}),
                    hijriDate: hDate,
                    gregorianDate: gDate
                });
                console.log("✅ Home Screen Widget updated successfully via AdhanNative (Hijri & Gregorian)");
            } catch(e) {
                console.warn("Update prayer widget notice:", e);
            }
        }
    },

    updatePrayerWidget(timings, hijriDate, gregorianDate) {
        return this.updateWidget(timings, hijriDate, gregorianDate);
    },

    async toggleStickyNotification(enable) {
        localStorage.setItem("zad_sticky_prayer_notification", enable ? "true" : "false");
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.toggleStickyNotification({ enabled: enable });
                console.log("🕌 Sticky Notification toggled:", enable);
            } catch (e) {
                console.warn("Failed to toggle native sticky notification:", e);
            }
        }
    },

    async updateStickyNotification() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.updateStickyNotification();
            } catch (e) {}
        }
    },

    /**
     * تجربة صوت الأذان
     */
    async testAdhanAudio(muazzin) {
        const m = muazzin || this.getSelectedMuazzin();
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                return await window.Capacitor.Plugins.AdhanNative.testAdhanAudio({ muazzin: m });
            } catch(e) {
                console.warn("Native test adhan failed:", e);
            }
        }
        // Fallback for Web
        const previewAudio = document.getElementById("audio-adhan-preview") || document.getElementById("audio-adhan");
        if (previewAudio) {
            if (!previewAudio.paused) {
                previewAudio.pause();
                previewAudio.currentTime = 0;
            } else {
                previewAudio.src = `assets/audio/adhan/${m}.mp3`;
                previewAudio.play().catch(e => console.warn("HTML5 adhan preview failed:", e));
            }
        }
        return { success: true, muazzin: m, fallback: "web" };
    },

    /**
     * تجربة صوت الصلاة على النبي ﷺ
     */
    async testSalawatAudio() {
        if (typeof window.playSalawatAudio === "function") {
            window.playSalawatAudio(true);
            return { success: true };
        }
        try {
            const audio = new Audio(this.getSalawatAudioUrl());
            audio.volume = 1.0;
            await audio.play();
            return { success: true };
        } catch(e) {
            console.warn("Error playing salawat audio:", e);
            return { success: false, error: e };
        }
    },

    /**
     * اختبار إرسال إشعار الأذان الفوري
     */
    async testNotification(prayerKey = "asr", prayerName = "صلاة العصر") {
        const muazzin = this.getSelectedMuazzin();
        try {
            if (window.Capacitor?.isNativePlatform?.()) {
                if (!await this.requestPermissions()) return { success: false, message: 'اسمح بالإشعارات من إعدادات الهاتف.' };
                await this.createNotificationChannels();
            await this.registerPrayerActions();
                const plugins = window.Capacitor.Plugins;
                if (plugins.AdhanNative) {
                    await plugins.AdhanNative.testAdhanNotification({ prayerKey, prayerName, muazzin });
                } else {
                    await plugins.LocalNotifications.schedule({ notifications: [{
                        id: 99999, title: 'تجربة إشعار الأذان', body: prayerName,
                        schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
                        sound: 'adhan_' + muazzin + '.mp3', channelId: 'adhan_' + muazzin
                    }] });
                }
                return { success: true };
            }
            if (typeof Notification === 'undefined') return { success: false, message: 'الإشعارات غير مدعومة في هذا المتصفح.' };
            const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
            if (permission !== 'granted') return { success: false, message: 'إذن الإشعارات مرفوض؛ غيّره من إعدادات المتصفح.' };
            const options = { body: prayerName, icon: 'assets/icon-192.png' };
            const reg = await navigator.serviceWorker?.getRegistration();
            if (reg) await reg.showNotification('تجربة إشعار الأذان', options);
            else new Notification('تجربة إشعار الأذان', options);
            return { success: true };
        } catch (e) {
            return { success: false, message: 'تعذّر إرسال الإشعار التجريبي.' };
        }
    },

    async openNotificationSettings() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.openNotificationSettings();
            } catch(e) {
                console.warn("Cannot open notification settings:", e);
            }
        }
    },

    async openBatterySettings() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.openBatteryOptimizationSettings();
            } catch(e) {
                console.warn("Cannot open battery settings:", e);
            }
        }
    },

    async checkExactAlarmPermission() {
        if (window.Capacitor?.getPlatform?.() !== 'android') return true;
        try {
            const plugins = window.Capacitor.Plugins;
            if (plugins.AdhanNative) return (await plugins.AdhanNative.checkExactAlarmPermission()).canSchedule === true;
            return (await plugins.LocalNotifications.checkExactNotificationSetting()).exact_alarm === 'granted';
        } catch { return false; }
    },

    async requestExactAlarmPermission() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                await window.Capacitor.Plugins.AdhanNative.requestExactAlarmPermission();
            } catch(e) {
                console.warn("Cannot request exact alarm permission:", e);
            }
        }
    },

    /**
     * إيقاف الأذان الجاري تشغيله في الخلفية فوراً
     */
    async stopAdhan() {
        try {
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
                await window.Capacitor.Plugins.AdhanNative.stopAdhan();
            }
            const audioEl = document.getElementById("audio-adhan");
            if (audioEl) {
                audioEl.pause();
                audioEl.currentTime = 0;
            }
            const previewEl = document.getElementById("audio-adhan-preview");
            if (previewEl) {
                previewEl.pause();
                previewEl.currentTime = 0;
            }
        } catch(e) {
            console.warn("Error stopping native adhan:", e);
        }
    },

    /**
     * اختبار حقيقي في الخلفية والشاشة مقفلة (منبه أندرويد حقيقي / إشعار iOS مسموع)
     * type: "pre_prayer" (تنبيه مسبق 60 ثانية) أو "adhan" (أذان كامل 120 ثانية)
     */
    async scheduleBackgroundDiagnosticTest(type = "adhan", delaySeconds = null) {
        if (!window.Capacitor?.isNativePlatform?.()) return { success: false, message: 'اختبار الخلفية يحتاج تطبيق الهاتف؛ المتصفح لا يضمن التنبيه عند قفل الشاشة.' };
        if (!await this.requestPermissions()) return { success: false, message: 'فعّل إذن الإشعارات قبل الاختبار.' };
        await this.createNotificationChannels();
            await this.registerPrayerActions();
        if (window.Capacitor.getPlatform?.() === 'android' && !await this.checkExactAlarmPermission()) return { success: false, message: 'فعّل إذن المنبّهات الدقيقة من إعدادات الهاتف ثم أعد الاختبار.' };
        if (!delaySeconds) {
            delaySeconds = (type === "pre_prayer") ? 60 : 120;
        }
        const muazzin = this.getSelectedMuazzin();
        const triggerTime = new Date(Date.now() + (delaySeconds * 1000));
        const timeStr = triggerTime.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const isPreAlert = (type === "pre_prayer");
        const testTitle = isPreAlert ? "⏳ اختبار التنبيه المسبق للصلاة" : "🕌 اختبار الأذان في الخلفية";
        const testBody = isPreAlert ? "اقتربت الصلاة، تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿" : "الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح 🕋";

        // بلجن أصلي (أندرويد / iOS عبر AdhanNative)
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                const res = await window.Capacitor.Plugins.AdhanNative.scheduleDiagnosticTestAlarm({
                    type: type,
                    delaySeconds: delaySeconds,
                    muazzin: muazzin,
                    prayerName: isPreAlert ? "صلاة العصر (تنبيه مسبق)" : "صلاة العصر (أذان)"
                });
                return {
                    success: true,
                    type: type,
                    platform: "native_alarm",
                    delaySeconds: delaySeconds,
                    triggerTime: timeStr,
                    message: `تمت جدولة ${isPreAlert ? "التنبيه المسبق الناطق" : "الأذان الكامل"} في نظام الهاتف بعد ${delaySeconds} ثانية (${timeStr}). يرجى قفل شاشة الهاتف أو الخروج من التطبيق الآن للتأكد من انطلاق الصوت والتنبيه تلقائياً 📱✨`
                };
            } catch(e) {
                console.warn("Native diagnostic alarm failed:", e);
            }
        }

        // iOS أو Fallback عبر LocalNotifications
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
            try {
                await this.registerPrayerActions();
                const soundFile = isPreAlert ? "pre_asr.mp3" : `adhan_${muazzin}.mp3`;
                const channelId = isPreAlert ? "prayer_pre_asr" : `adhan_${muazzin}`;
                await window.Capacitor.Plugins.LocalNotifications.schedule({
                    notifications: [{
                        id: isPreAlert ? 99981 : 99982,
                        ...this.prayerImageOptions("asr"),
                        actionTypeId: "OPEN_PRAYER",
                        title: testTitle,
                        body: testBody,
                        schedule: { at: triggerTime, allowWhileIdle: true },
                        sound: soundFile,
                        channelId: channelId,
                        smallIcon: "res://ic_stat_icon",
                        iconColor: "#d4af37",
                        extra: { type: isPreAlert ? "pre_prayer_alert" : "adhan_call", prayerKey: "asr", muazzin: muazzin }
                    }]
                });
                return {
                    success: true,
                    type: type,
                    platform: "local_notifications",
                    delaySeconds: delaySeconds,
                    triggerTime: timeStr,
                    message: `تمت جدولة إشعار ${isPreAlert ? "التنبيه المسبق" : "الأذان"} بنجاح بعد ${delaySeconds} ثانية (${timeStr}). اقفل شاشة هاتفك للتجربة 📱`
                };
            } catch(e) {
                console.warn("LocalNotifications test failed:", e);
            }
        }

        return { success: false, platform: 'unsupported', message: 'تعذّرت جدولة اختبار الخلفية. راجع أذونات الهاتف؛ مؤقت المتصفح لا يضمن العمل والشاشة مقفولة.' };
    },

    /**
     * فحص صلاحيات المنبهات الدقيقة والإشعارات وتحسين البطارية
     */
    async checkPermissionsStatus() {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdhanNative) {
            try {
                return await window.Capacitor.Plugins.AdhanNative.checkAlarmPermissions();
            } catch (e) {
                console.warn("Error checking alarm permissions:", e);
            }
        }
        return {
            notificationsGranted: typeof Notification !== 'undefined' && Notification.permission === 'granted',
            exactAlarmsGranted: null,
            batteryOptimizationsIgnored: null
        };
    }
};

// إتاحة الكائن عالمياً
if (typeof window !== "undefined") {
    window.NativeAdhanService = NativeAdhanService;
}

// التهيئة التلقائية فور تجهيز DOM
if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => NativeAdhanService.init());
    } else {
        NativeAdhanService.init();
    }
}
