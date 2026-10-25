const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, requestInterceptor, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const localResources = { interceptors: [requestInterceptor(request => {
        const target = new URL(request.url);
        if (target.origin !== 'http://localhost:4173' || !target.pathname.endsWith('.js')) return new Response('', { status: 404 });
        const file = path.join(root, target.pathname);
        return fs.existsSync(file) ? new Response(fs.readFileSync(file), { headers: { 'Content-Type': 'application/javascript' } }) : new Response('', {status:404});
})] };
async function load(file, options = {}) {
    const errors = [];
    const console = new VirtualConsole();
    console.on('jsdomError', e => {
        if (e.type === 'unhandled-exception') errors.push(e.cause?.message || e.message);
    });
    const dom = new JSDOM(fs.readFileSync(path.join(root,file),'utf8'), {
        url:options.url || 'http://localhost:4173/'+file, ...(options.referrer ? {referrer:options.referrer} : {}), runScripts:'dangerously', resources:localResources, virtualConsole:console,
        pretendToBeVisual:true,
        beforeParse(w) {
            w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){}});
            w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
            w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
            w.HTMLDialogElement.prototype.close=function(){this.open=false;};
            w.HTMLMediaElement.prototype.load=function(){};
            w.HTMLMediaElement.prototype.pause=function(){};
            w.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
            w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({}, { get(_t,key) {
                if (key === 'measureText') return () => ({width:100});
                if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({addColorStop(){}});
                return () => {};
            },set(){return true;} });};
            w.IntersectionObserver=class{observe(){}disconnect(){}unobserve(){}};
            w.ResizeObserver=class{observe(){}disconnect(){}};
            w.fetch=async()=>{throw Error('Offline test');};
            w.confirm=()=>true;
            w.localStorage.setItem('user_manually_selected_city','true');
            w.localStorage.setItem('selected_prayer_city','Cairo');
            for (const [key,value] of Object.entries(options.storage || {})) w.localStorage.setItem(key,value);
            options.setup?.(w);
        }
    });
    await new Promise(resolve=>dom.window.addEventListener('load',resolve,{once:true}));
    await new Promise(resolve=>setTimeout(resolve,30));
    return {dom,errors};
}
test('services renders settings, saves choices and handles offline timings',async()=>{
    const {dom,errors}=await load('services.html');
    try {
        const w=dom.window,d=w.document;
        assert.deepEqual(errors,[]);
        assert.ok(d.getElementById('prayer-times'));
        assert.ok(d.querySelector('a[href="settings.html"]'));
        d.querySelector('#notifications-modal .zad-open-tools').click();
        await new Promise(r=>setTimeout(r,0));
        assert.equal(d.getElementById('notifications-modal').classList.contains('open'),true);
        assert.equal(d.getElementById('notif-view-settings').style.display,'block');
        d.getElementById('zad-font').value='large';
        d.getElementById('zad-method').value='5';
        d.getElementById('zad-school').value='1';
        d.getElementById('zad-save-settings').click();
        assert.equal(w.localStorage.getItem('zad_prayer_method'),'5');
        assert.equal(w.localStorage.getItem('zad_prayer_school'),'1');
        assert.equal(d.documentElement.dataset.readingSize,'large');
        assert.match(d.getElementById('zad-tools-status').textContent,/تم حفظ/);
        d.getElementById('btn-close-notifications-modal').click();
        assert.equal(d.getElementById('notifications-modal').classList.contains('open'),false);
        assert.equal(w.zadPrayerVerified,false);
        assert.equal(w.getPrayerTimings(),null);
        assert.ok(d.getElementById('quran-khatma'));
        assert.ok(d.getElementById('zakat-calculator-section'));
        await new Promise(r=>setTimeout(r,100));
    } finally {dom.window.close();}
});
test('web home and services expose personal tools without JavaScript exceptions',async()=>{
    for(const file of ['index.html','services.html']){
        const {dom,errors}=await load(file);
        try{
            assert.deepEqual(errors,[],file);
            assert.ok(dom.window.document.querySelector('#notifications-modal .zad-open-tools'),file);
            assert.equal(dom.window.document.querySelector('main .zad-personal-panel, .zad-home-shortcuts'),null,file);
            assert.ok(dom.window.document.querySelector('#zad-import-backup'),file);
        }finally{dom.window.close();}
    }
});

test('standalone settings persist shortcuts independently of Save, theme, and prayer preferences',async()=>{
    const {dom,errors}=await load('settings.html',{referrer:'http://localhost:4173/services.html',storage:{'zadmuslim-theme':'light'}});
    let saved;
    try {
        const w=dom.window,d=w.document;
        assert.deepEqual(errors,[]);
        const ids=[...d.querySelectorAll('[id]')].map(e=>e.id);
        assert.equal(new Set(ids).size,ids.length,'duplicate element IDs');
        assert.equal(d.querySelectorAll('.settings-fav-card').length,7);
        assert.equal(d.documentElement.dataset.theme,'light');
        d.querySelector('.btn-theme-toggle').click();
        assert.equal(w.localStorage.getItem('zadmuslim-theme'),'dark');
        d.querySelector('[data-id="sadaqa"]').click();
        d.querySelector('[data-id="azkar"]').click();
        const favorites=w.localStorage.getItem('zad_favorites');
        assert.ok(JSON.parse(favorites).includes('sadaqa'));
        assert.ok(!JSON.parse(favorites).includes('azkar'));
        d.getElementById('zad-city').value='London';
        d.getElementById('zad-method').value='3';
        d.getElementById('zad-school').value='1';
        d.getElementById('zad-font').value='larger';
        await d.getElementById('zad-save-settings').onclick();
        assert.equal(w.localStorage.getItem('zad_favorites'),favorites);
        assert.equal(w.localStorage.getItem('selected_prayer_city'),'London');
        assert.equal(d.documentElement.dataset.readingSize,'larger');
        assert.equal(new URL(d.getElementById('btn-settings-back').href).pathname,'/services.html');
        assert.equal(new URL(d.getElementById('settings-open-notifications').href).search,'?panel=notifications');
        saved=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
    }finally{dom.window.close();}
    const again=await load('settings.html',{storage:saved});
    try{
        const d=again.dom.window.document;
        assert.deepEqual(again.errors,[]);
        assert.equal(d.documentElement.dataset.theme,'dark');
        assert.equal(d.getElementById('zad-city').value,'London');
        assert.equal(d.querySelector('[data-id="sadaqa"]').getAttribute('aria-pressed'),'true');
        assert.equal(d.querySelector('[data-id="azkar"]').getAttribute('aria-pressed'),'false');
    }finally{again.dom.window.close();}
});

test('home shortcuts resolve to real sections and notifications deep link opens alerts',async()=>{
    const ids=['quran-khatma','azkar','prayer-times','tasbeeh','islamic-media','zakat-calculator-section','sadaqa'];
    const {dom,errors}=await load('index.html',{url:'http://localhost:4173/index.html?panel=notifications',storage:{zad_favorites:JSON.stringify(ids)}});
    try{
        const d=dom.window.document;
        assert.deepEqual(errors,[]);
        assert.ok(d.getElementById('notifications-modal').classList.contains('open'));
        assert.equal(d.getElementById('notif-view-alerts').style.display,'block');
        for(const id of ids){
            const link=d.querySelector('.quick-access-grid [data-service="'+id+'"]');
            assert.ok(link,id);
            const target=new URL(link.href);
            assert.ok(['/index.html','/services.html'].includes(target.pathname));
            const html=fs.readFileSync(path.join(root,target.pathname),'utf8');
            assert.ok(html.includes('id="'+target.hash.slice(1)+'"'),id+' destination exists');
            assert.equal(link.onclick,null,'normal links support native browser navigation');
        }
        assert.equal(d.querySelector('a[href*="app.html"]'),null);
    }finally{dom.window.close();}
});

test('configured cities and prayer calculation choices reach the timings request',async()=>{
    const calls=[];
    const {dom,errors}=await load('services.html',{storage:{selected_prayer_city:'New York',zad_prayer_method:'3',zad_prayer_school:'1'},setup(w){
        w.fetch=async url=>{calls.push(String(url));throw Error('offline');};
    }});
    try{
        assert.deepEqual(errors,[]);
        const url=new URL(calls.find(u=>u.includes('timingsByCity')));
        assert.equal(url.searchParams.get('city'),'New York');
        assert.equal(url.searchParams.get('country'),'United States');
        assert.equal(url.searchParams.get('method'),'3');
        assert.equal(url.searchParams.get('school'),'1');
        assert.equal(dom.window.document.getElementById('select-prayer-city').value,'New York');
    }finally{dom.window.close();}
});

test('tools modal downloads audio, lists it and removes only downloaded resources',async()=>{
    const entries=new Map();
    const {dom,errors}=await load('services.html',{url:'http://localhost:4173/services.html?panel=notifications',setup(w){
        w.caches={open:async()=>({
            match:async req=>entries.get(typeof req==='string'?req:req.url)?.clone(),
            put:async(url,response)=>entries.set(url,response.clone()),
            keys:async()=>[...entries.keys()].map(url=>({url})),
            delete:async req=>entries.delete(req.url)
        })};
        w.fetch=async()=>new Response('audio contents',{headers:{'Content-Type':'audio/mpeg'}});
    }});
    try{
        const d=dom.window.document;
        assert.deepEqual(errors,[]);
        await d.querySelector('.zad-open-tools').onclick();
        d.querySelector('[data-tab="downloads"]').click();
        await d.querySelector('[data-download="audio"]').onclick();
        assert.equal(entries.size,1);
        assert.match(d.getElementById('zad-tools-status').textContent,/اكتمل/);
        assert.match(d.getElementById('zad-download-list').textContent,/1 ملف/);
        await d.querySelector('#zad-download-list button').onclick();
        assert.equal(entries.size,0);
        assert.match(d.getElementById('zad-tools-status').textContent,/تم حذف/);
        assert.deepEqual(errors,[]);
    }finally{dom.window.close();}
});

test('native settings cancel outdated prayer alarms and schedule a test notification',async()=>{
    const calls=[];
    const {dom,errors}=await load('settings.html',{setup(w){
        w.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'android',Plugins:{
            AdhanNative:{cancelAllAlarms:async()=>calls.push('cancel-adhan')},
            LocalNotifications:{
                checkPermissions:async()=>({display:'granted'}),
                requestPermissions:async()=>({display:'granted'}),
                getPending:async()=>({notifications:[{id:101},{id:990001}]}),
                cancel:async data=>calls.push(data),
                schedule:async data=>calls.push(data)
            }
        }};
    }});
    try{
        const d=dom.window.document;
        assert.deepEqual(errors,[]);
        assert.equal(new URL(d.getElementById('btn-settings-back').href).pathname,'/index.html');
        d.getElementById('zad-city').value='Paris';
        await d.getElementById('zad-save-settings').onclick();
        assert.ok(calls.includes('cancel-adhan'));
        const cancellation=calls.find(c=>c?.notifications?.[0]?.id===101);
        assert.equal(cancellation.notifications.length,1,'unrelated notifications must remain');
        await d.getElementById('zad-test-notification').onclick();
        assert.ok(calls.some(c=>c?.notifications?.[0]?.schedule?.at > new Date()));
        assert.match(d.getElementById('zad-tools-status').textContent,/جدولة/);
    }finally{dom.window.close();}
});

test('settings retain the final shortcut and reject empty reports',async()=>{
    const {dom,errors}=await load('settings.html',{storage:{zad_favorites:'["quran-khatma"]'}});
    try{
        const d=dom.window.document;
        d.querySelector('[data-id="quran-khatma"]').click();
        assert.equal(dom.window.localStorage.getItem('zad_favorites'),'["quran-khatma"]');
        assert.match(d.getElementById('zad-tools-status').textContent,/اختصار واحد/);
        d.getElementById('zad-send-report').click();
        assert.match(d.getElementById('zad-tools-status').textContent,/اكتب تفاصيل/);
        assert.deepEqual(errors,[]);
    }finally{dom.window.close();}
});

test('opening the app never prompts for location or calls IP geolocation automatically',async()=>{
    let gpsCalls=0; const urls=[];
    const {dom,errors}=await load('services.html',{setup(w){
        w.localStorage.removeItem('user_manually_selected_city');
        w.navigator.geolocation={getCurrentPosition(){gpsCalls++;}};
        w.fetch=async url=>{urls.push(String(url));throw Error('offline');};
    }});
    try{
        await new Promise(r=>setTimeout(r,900));
        assert.equal(gpsCalls,0);
        assert.ok(!urls.some(u=>/bigdatacloud|ipwho/.test(u)));
        assert.deepEqual(errors,[]);
    }finally{dom.window.close();}
});

test('notification enable keeps the dialog open and reports cloud registration failure',async()=>{
    const {dom,errors}=await load('index.html');
    try{
        const w=dom.window,d=w.document;
        w.Notification={permission:'granted'};
        let message='';w.showToast=text=>{message=text;};
        w.registerPushSubscriberInFirebase=async()=>({status:'configuration-required',message:'إعداد الإشعارات السحابية غير مكتمل'});
        d.getElementById('notify-adhan-calls').checked=true;
        w.openNotificationsModal();
        d.getElementById('btn-request-notification-perm').click();
        await new Promise(r=>setTimeout(r,0));
        assert.match(message,/غير مكتمل/);
        assert.ok(d.getElementById('notifications-modal').classList.contains('open'));
        assert.deepEqual(errors,[]);
    }finally{dom.window.close();}
});

test('settings never return users to the retired app page',async()=>{
    const {dom,errors}=await load('settings.html',{referrer:'http://localhost:4173/app.html'});
    try{
        const d=dom.window.document;
        assert.equal(new URL(d.getElementById('btn-settings-back').href).pathname,'/index.html');
        assert.equal(new URL(d.getElementById('settings-open-notifications').href).pathname,'/index.html');
        assert.deepEqual(errors,[]);
    }finally{dom.window.close();}
});

test('home section toggles in settings persist and control visibility on index.html',async()=>{
    const {dom,errors}=await load('settings.html');
    let saved;
    try{
        const w=dom.window,d=w.document;
        assert.deepEqual(errors,[]);
        const cards=d.querySelectorAll('.settings-home-section-card');
        assert.equal(cards.length,9,'all 9 home sections must be controllable');
        
        const dhikrCard=d.querySelector('[data-section-id="smart_dhikr"]');
        assert.ok(dhikrCard);
        assert.equal(dhikrCard.getAttribute('aria-checked'),'true');
        dhikrCard.click();
        assert.equal(dhikrCard.getAttribute('aria-checked'),'false');
        
        const clipCard=d.querySelector('[data-section-id="daily_clip"]');
        clipCard.click();
        assert.equal(clipCard.getAttribute('aria-checked'),'false');

        const config=JSON.parse(w.localStorage.getItem('zad_home_sections'));
        assert.equal(config.smart_dhikr,false);
        assert.equal(config.daily_clip,false);
        saved=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
    }finally{dom.window.close();}

    const home=await load('index.html',{storage:saved});
    try{
        const hd=home.dom.window.document;
        assert.deepEqual(home.errors,[]);
        assert.equal(hd.getElementById('smart-dhikr-panel').style.display,'none');
        assert.equal(hd.getElementById('daily-featured-media-card').style.display,'none');
        assert.notEqual(hd.getElementById('daily-journey-panel').style.display,'none');
    }finally{home.dom.window.close();}
});


test('settings groups expand from navigation and reading settings are separated',async()=>{
 const {dom,errors}=await load('settings.html');
 try {
  const d=dom.window.document;
  assert.equal(d.querySelector('#notifications-section details').open,true);
  assert.equal(d.querySelector('#settings-reading-section details').open,false);
  d.querySelector('a[href="#settings-reading-section"]').click();
  assert.equal(d.querySelector('#settings-reading-section details').open,true);
  assert.ok(d.querySelector('#settings-reading-section #zad-font'));
  assert.equal(d.getElementById('zad-save-settings').hidden,true);
  assert.deepEqual(errors,[]);
 } finally {dom.window.close();}
});

test('Android settings show actual prayer coverage and synchronize volume before scheduling',async()=>{
 const volumeCalls=[];
 const {dom,errors}=await load('settings.html',{setup(w){
  w.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'android',Plugins:{
   AdhanNative:{setAdhanVolume:async o=>volumeCalls.push(o.volume),checkAlarmPermissions:async()=>({notificationsGranted:true,exactAlarmsGranted:false,batteryOptimizationsIgnored:false}),getPrayerScheduleStatus:async()=>({count:5,next:Date.now()+60000,until:Date.now()+86400000})},
   LocalNotifications:{checkPermissions:async()=>({display:'granted'}),getPending:async()=>({notifications:[]}),createChannel:async()=>{},addListener:()=>{}}
  }};
 }});
 try {
  const w=dom.window,d=w.document;
  w.NativeAdhanService.scheduleLocalNotifications=async()=>({success:true,message:'تم التطبيق'});
  const slider=d.getElementById('slider-adhan-volume');slider.value='0.35';slider.dispatchEvent(new w.Event('change'));
  await new Promise(r=>setTimeout(r,20));
  assert.equal(volumeCalls.at(-1),0.35);
  assert.match(d.querySelector('.settings-delivery-status').textContent,/المواعيد محفوظة حتى/);
  assert.equal(d.getElementById('btn-save-notif-settings').hidden,true);
  assert.deepEqual(errors,[]);
 } finally {dom.window.close();}
});

test('radio starts with Cairo, preserves station on failure, and exposes accessible stop and favorites',async()=>{
 const {dom,errors}=await load('index.html');const w=dom.window,d=w.document;
 const select=d.getElementById('radio-station-select');assert.equal(select.value,'cairo');
 assert.ok(d.querySelector('.radio-sleep-details summary'));
 const button=d.getElementById('btn-radio-play');button.click();assert.equal(button.getAttribute('aria-label'),'إيقاف');
 const audio=d.getElementById('live-radio-audio');audio.dispatchEvent(new w.Event('error'));assert.equal(select.value,'cairo');
 button.click();assert.equal(button.getAttribute('aria-label'),'سماع');
 const favorite=[...d.querySelectorAll('#radio-panel button')].find(b=>b.textContent.includes('إضافة للمفضلة'));favorite.click();assert.deepEqual(JSON.parse(w.localStorage.getItem('zadmuslim_radio_favorites')),['cairo']);
 const fab=d.getElementById('radio-fab-btn');const panel=d.getElementById('radio-panel');
 fab.click();assert.equal(panel.classList.contains('open'),true);
 w.pageYOffset=100;w.dispatchEvent(new w.Event('scroll'));assert.equal(panel.classList.contains('open'),false);
 assert.equal(errors.length,0);dom.window.close();
});
