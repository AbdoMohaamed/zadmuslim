const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('web worker replaces active alarms when prayer preferences change', () => {
    const listeners = [];
    const timers = new Map();
    let next = 0;
    const now = Date.now();
    const context = {
        self:{addEventListener(name, fn) { if (name === 'message') listeners.push(fn); }},
        Date:class extends Date { static now() { return now; } },
        setTimeout(fn, delay) { timers.set(++next, delay); return next; },
        clearTimeout(id) { timers.delete(id); }
    };
    vm.runInNewContext(fs.readFileSync('sw.js', 'utf8'), context);
    const send = data => listeners.forEach(fn => fn({data}));
    const schedule = ['asr','isha'].map(key => ({key, timestamp:now + 30 * 60000}));
    send({type:'SCHEDULE_PRAYERS', schedule, preferences:{prePrayer:false, adhan:false}});
    assert.equal(timers.size, 0);
    send({type:'PRAYER_PREFERENCES', preferences:{prePrayerInterval:15, enabledPrayers:{isha:false}}});
    assert.deepEqual([...timers.values()], [15 * 60000, 30 * 60000]);
    send({type:'PRAYER_PREFERENCES', preferences:{prePrayer:false, adhan:false}});
    assert.equal(timers.size, 0);
});

test('web scheduler uses the dated response for tomorrow and ignores a mismatched date', async () => {
    const app = fs.readFileSync('assets/js/app.js', 'utf8');
    const messages = [];
    let responseDate = '01-01-2027';
    const timings = {Fajr:'05:10'};
    const context = {
        Date:class extends Date { constructor(...args) { super(...(args.length ? args : [2026,11,31,15])); } },
        URL, AbortSignal, console,
        window:{zadPrayerVerified:true, prayerTimings:timings, zadPrayerApiSource:'https://example.org/timingsByCity?city=Riyadh',
            NativeAdhanService:{webPrayerPreferences:()=>({adhan:false})}},
        navigator:{serviceWorker:{controller:{postMessage:m=>messages.push(m)}}},
        localStorage:{getItem:()=>null,setItem(){}}, prayerNotificationText:()=>({}),
        fetch:async url => {
            assert.equal(url.pathname,'/timingsByCity/01-01-2027');
            assert.equal(url.searchParams.get('city'),'Riyadh');
            return {ok:true,json:async()=>({code:200,data:{date:{gregorian:{date:responseDate}},timings:{Fajr:'05:12'}}})};
        }
    };
    vm.runInNewContext(app.slice(app.indexOf('let webScheduleRevision'), app.indexOf('function startPrayerCountdown')), context);
    await context.syncPrayersWithServiceWorker(timings);
    assert.deepEqual(Array.from(messages.at(-1).schedule, p=>p.timeStr), ['05:10','05:12']);
    assert.equal(messages.at(-1).preferences.adhan,false);
    messages.length = 0;
    responseDate = '31-12-2026';
    await context.syncPrayersWithServiceWorker(timings);
    assert.deepEqual(Array.from(messages.at(-1).schedule, p=>p.timeStr), ['05:10']);
});

test('foreground countdown respects disabled alerts, selected prayers and lead time', () => {
    const app = fs.readFileSync('assets/js/app.js', 'utf8');
    const preferences = {adhan:false, prePrayer:false, prePrayerInterval:15, enabledPrayers:{}};
    const toasts = [], adhans = [], saved = new Map();
    const now = new Date(2026,10,13,12);
    const context = {
        Date:class extends Date { constructor(...args) { super(...(args.length ? args : [now.getTime()])); } },
        Intl, prayerTimerInterval:null, setInterval(){}, clearInterval(){},
        prayerTimings:{Fajr:'05:00',Sunrise:'06:00',Dhuhr:'12:15',Asr:'15:00',Maghrib:'18:00',Isha:'19:30'},
        window:{zadPrayerVerified:true,NativeAdhanService:{webPrayerPreferences:()=>preferences},addEventListener(){}},
        document:{getElementById:()=>null,querySelectorAll:()=>[],addEventListener(){}},
        localStorage:{getItem:key=>saved.get(key),setItem:(key,val)=>saved.set(key,val)},
        prayerNotificationText:(name, upcoming, minutes)=>({body:String(minutes)}),
        showToast:message=>toasts.push(message),triggerPrayerAdhanNotification:name=>adhans.push(name)
    };
    saved.set('zad_prayer_verified', JSON.stringify({date:now.toLocaleDateString('en-CA'),offset:now.getTimezoneOffset(),zone:Intl.DateTimeFormat().resolvedOptions().timeZone}));
    vm.runInNewContext(app.slice(app.indexOf('function startPrayerCountdown()'),app.indexOf('/* ===',app.indexOf('function startPrayerCountdown()'))),context);
    context.startPrayerCountdown();
    preferences.prePrayer = true;
    preferences.enabledPrayers.dhuhr = false;
    context.window._zadRefreshPrayerCountdown();
    assert.deepEqual(toasts,[]);
    preferences.enabledPrayers.dhuhr = true;
    context.window._zadRefreshPrayerCountdown();
    assert.deepEqual(toasts,['15']);
    now.setMinutes(15);
    context.window._zadRefreshPrayerCountdown();
    assert.deepEqual(adhans,[]);
    preferences.adhan = true;
    context.window._zadRefreshPrayerCountdown();
    assert.deepEqual(adhans,['صلاة الظهر']);
});
