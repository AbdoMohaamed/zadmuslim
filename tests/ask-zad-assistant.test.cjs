const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
function setup(){const d=new JSDOM('<body></body>',{url:'https://zad.test',runScripts:'outside-only'});for(const f of ['ask-zad-knowledge','ask-zad'])d.window.eval(fs.readFileSync('assets/js/'+f+'.js','utf8'));d.window.AskZad.init();return d;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
test('Arabic greetings, mixed requests, colloquial routes and uncertain answers',async()=>{const d=setup(),w=d.window;try{
for(const q of ['السلام عليكم','أهلاً','هاي','صباح الخير','مساء الخير','إزيك','عامل إيه'])assert.ok((await w.AskZad.answer(q)).data.answer);
assert.match((await w.AskZad.answer('السلام عليكم افتح المصحف')).data.answer,/وعليكم/);
assert.equal((await w.AskZad.answer('السلام عليكم افتح المصحف')).data.actions[0].href,'services.html#quran-khatma?tab=mushaf');
assert.match((await w.AskZad.answer('تسلم')).data.answer,/وإياك/);
assert.equal((await w.AskZad.answer('فين السبحة؟')).data.actions[0].href,'services.html#smart-dhikr-panel');
assert.match((await w.AskZad.answer('عاوز أغير المؤذن')).data.answer,/لم أغيّر/);
assert.match((await w.AskZad.answer('أنا حلفت على مراتي')).data.answer,/فتوى شخصية/);
assert.equal((await w.AskZad.answer('الصلاة في مركبة فضائية')).found,false);
}finally{w.close();}});
test('prayer answers refuse missing/stale/wrong-city data and calculate a named prayer',async()=>{const d=setup(),w=d.window;try{
assert.match((await w.AskZad.answer('فاضل كام ع المغرب')).data.answer,/محتاج مواقيت/);
const RealDate=w.Date;w.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[2026,9,29,16,0]));}};
w.localStorage.setItem('selected_prayer_city','Cairo');const snapshot={date:new w.Date().toLocaleDateString('en-CA'),signature:JSON.stringify(['Cairo','','0',null,w.Intl.DateTimeFormat().resolvedOptions().timeZone]),timings:{Fajr:'05:00',Dhuhr:'12:00',Asr:'15:00',Maghrib:'18:00',Isha:'20:00'}};
w.localStorage.setItem('zad_home_prayer_snapshot',JSON.stringify(snapshot));assert.match((await w.AskZad.answer('فاضل كام ع المغرب')).data.answer,/متبقي 2 ساعة/);
w.localStorage.setItem('selected_prayer_city','Riyadh');assert.match((await w.AskZad.answer('الصلاة القادمة')).data.answer,/محتاج مواقيت/);
}finally{w.close();}});
test('diagnostics only read permissions and distinguish remote push readiness',async()=>{const d=setup(),w=d.window;try{
w.Capacitor={getPlatform:()=> 'android',Plugins:{AdhanNative:{checkAlarmPermissions:async()=>({notificationsGranted:false,exactAlarmsGranted:false,fullScreenIntentGranted:false}),getPrayerScheduleStatus:async()=>({count:0})}}};
w.plugins={OneSignal:{User:{pushSubscription:{getIdAsync:async()=> 'id',getTokenAsync:async()=> null,getOptedInAsync:async()=> true}}}};
const r=await w.AskZad.answer('الإشعارات مش بتوصل');assert.match(r.data.answer,/غير مفعّل/);assert.match(r.data.answer,/الاشتراك غير جاهز/);assert.match(r.data.answer,/لم أغيّر أي إعداد/);
}finally{w.close();}});
test('slow replies preserve question order, actions use app navigation, clearing cancels pending work',async()=>{const d=setup(),w=d.window;try{
w.Capacitor={getPlatform:()=> 'android',Plugins:{AdhanNative:{checkAlarmPermissions:()=>new Promise(r=>setTimeout(()=>r({}),120)),getPrayerScheduleStatus:async()=>({count:0})}}};
w.AskZad.send('الإشعارات مش بتوصل');w.AskZad.send('افتح المصحف');await wait(650);
const history=JSON.parse(w.localStorage.getItem('zad_ask_zad_history'));assert.deepEqual(history.map(m=>m.sender),['user','bot','user','bot']);
let target;w.zadNavigate=url=>target=url;w.document.querySelectorAll('.ask-zad-action-btn')[1].click();assert.equal(target,'services.html#quran-khatma?tab=mushaf');
assert.equal(w.document.querySelector('.ask-zad-vote'),null);
w.AskZad.send('الإشعارات مش بتوصل');await wait(380);w.AskZad.clear();await wait(250);assert.equal(w.localStorage.getItem('zad_ask_zad_history'),null);assert.equal(w.localStorage.getItem('zad_ask_zad_feedback'),null);assert.equal(w.document.querySelectorAll('.ask-zad-msg-row').length,0);
}finally{w.close();}});
