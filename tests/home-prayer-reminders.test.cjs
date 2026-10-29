const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync('assets/js/extended-modules.js', 'utf8');
const helpers = source.slice(source.indexOf('function getHomePrayerTimings()'), source.indexOf('/* ==========================================================================', source.indexOf('function initSmartTimelyReminders()')));
const strip = fs.readFileSync('assets/js/home-prayer-display.js', 'utf8');
const timings = { Fajr: '05:00', Sunrise: '06:30', Dhuhr: '12:00', Asr: '15:00', Maghrib: '18:00', Isha: '20:00' };
function setup(hour, minute = 0, day = 27) {
    const ids = ['daily-next-prayer-name', 'daily-next-prayer-time', 'home-prayer-remaining', 'home-prayer-time', 'home-prayer-progress-bar', 'next-prayer-name', 'next-prayer-timer'];
    const dom = new JSDOM(ids.map(id => '<div id="' + id + '"></div>').join(''), { url: 'https://home.test', runScripts: 'outside-only' });
    const w = dom.window, NativeDate = w.Date;
    w.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : [2026, 9, day, hour, minute])); } };
    w.prayerTimings = timings;
    w.eval(helpers + '\n' + strip);
    return dom;
}
test('all five prayer intervals including both sides of midnight have correct progress', () => {
    for (const [h,m,pct,name] of [[8,30,50,'الظهر'],[13,30,50,'العصر'],[16,30,50,'المغرب'],[19,0,50,'العشاء'],[21,0,100/9,'الفجر'],[0,30,50,'الفجر'],[5,0,0,'الظهر']]) {
        const d=setup(h,m), w=d.window;
        try { w.document.getElementById('next-prayer-name').textContent='existing countdown'; w.updateHomePrayerCard(); assert.ok(Math.abs(parseFloat(w.document.getElementById('home-prayer-progress-bar').style.width)-pct)<0.01); assert.ok(w.document.getElementById('daily-next-prayer-name').textContent.includes(name)); } finally { w.close(); }
    }
});
test('daily reminders retain priority on Friday and follow city times', () => {
    const d=setup(5,30,30),w=d.window;
    try {
        const slot=(h,m=0,t=timings)=>w.getHomeReminderSlot(new w.Date(2026,9,30,h,m),t);
        assert.equal(slot(5,30),'morning_azkar'); assert.equal(slot(10),'duha_prayer'); assert.equal(slot(12),'friday_kahf'); assert.equal(slot(16),'evening_azkar'); assert.equal(slot(3),'night_qiyam_sahoor'); assert.equal(slot(21),'night_mulk');
        assert.equal(slot(5,30,{...timings,Fajr:'07:00',Sunrise:'08:30'}),'night_qiyam_sahoor');
        assert.equal(slot(10,0,null),'noon_quran');
    } finally { w.close(); }
});
test('dismissed reminder still installs refresh and next slot can appear', () => {
    const d=setup(5,30),w=d.window;
    try { w.document.body.insertAdjacentHTML('beforeend','<div id="smart-reminder-banner"></div>'); let intervals=0; w.setInterval=()=>{intervals++;}; w.sessionStorage.setItem('reminder_dismissed_morning_azkar_2026-10-27','1'); w.initSmartTimelyReminders(); assert.equal(intervals,1); assert.equal(w.document.getElementById('smart-reminder-banner').style.display,'none'); w.prayerTimings=null; w.initSmartTimelyReminders(); assert.equal(w.document.getElementById('smart-reminder-banner').style.display,'flex'); assert.equal(intervals,1); } finally {w.close();}
});

test('home card renders saved same-day city timings before the rest of the app loads', () => {
    const d=setup(8,30),w=d.window;
    try {
        w.prayerTimings=null;
        w.localStorage.setItem('selected_prayer_city','Cairo');
        const signature=JSON.stringify(['Cairo','','0',null,w.Intl.DateTimeFormat().resolvedOptions().timeZone]);
        const snapshot={date:new w.Date().toLocaleDateString('en-CA'),signature,timings};
        w.localStorage.setItem('zad_home_prayer_snapshot',JSON.stringify(snapshot));
        w.eval(strip);
        assert.notEqual(w.document.getElementById('home-prayer-time').textContent,'--:--');
        w.localStorage.setItem('selected_prayer_city','Riyadh');
        assert.equal(w.readHomePrayerTimings(),null);
        w.localStorage.setItem('selected_prayer_city','Cairo');
        w.localStorage.setItem('zad_home_prayer_snapshot',JSON.stringify({...snapshot,date:'2000-01-01'}));
        assert.equal(w.readHomePrayerTimings(),null);
        w.updateHomePrayerCard();
        assert.match(w.document.getElementById('home-prayer-remaining').textContent,/جارٍ تحديث/);
    } finally {w.close();}
});
