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
        assert.equal(d.querySelectorAll('.settings-fav-card').length,8);
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
            assert.ok(html.includes('id="'+target.hash.slice(1).split('?')[0]+'"'),id+' destination exists');
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
        assert.equal(cards.length,7,'remaining home sections must be controllable');
        
        assert.equal(d.querySelector('[data-section-id="smart_dhikr"]'),null);
        const clipCard=d.querySelector('[data-section-id="daily_clip"]');
        clipCard.click();
        assert.equal(clipCard.getAttribute('aria-checked'),'false');

        const config=JSON.parse(w.localStorage.getItem('zad_home_sections'));
        assert.equal(config.daily_clip,false);
        saved=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
    }finally{dom.window.close();}

    const home=await load('index.html',{storage:saved});
    try{
        const hd=home.dom.window.document;
        assert.deepEqual(home.errors,[]);
        assert.equal(hd.getElementById('smart-dhikr-panel'),null);
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
 w.pageYOffset=500;w.ZadRadioHost.openPanel();w.dispatchEvent(new w.Event('scroll'));assert.equal(panel.classList.contains('open'),true);
 w.pageYOffset=600;w.dispatchEvent(new w.Event('scroll'));assert.equal(panel.classList.contains('open'),false);
 assert.equal(errors.length,0);dom.window.close();
});

test('services search resets category and zakat has its own category',async()=>{
 const {dom,errors}=await load('services.html');const w=dom.window,d=w.document;
 w.filterCategory('الصلاة');d.getElementById('servicesSearch').value='قصص';w.filterServices();
 assert.equal(d.querySelector('.cat-pill-btn.active').dataset.categoryFilter,'all');
 assert.equal(d.querySelector('[data-category="المعرفة الإسلامية"]').style.display,'block');
 assert.equal(d.querySelector('a[href="#zakat-calculator-section"]').closest('.category-block').dataset.category,'الزكاة');
 assert.equal(d.querySelector('.services-search-hint'),null);assert.deepEqual(errors,[]);w.close();
});
test('services open correct Quran tabs and radio, and restore directory position',async()=>{
 const {dom,errors}=await load('services.html');const w=dom.window,d=w.document;let scroll;
 w.scrollTo=options=>{scroll=options.top;};Object.defineProperty(w,'scrollY',{value:640,configurable:true});
 w.filterCategory('القرآن الكريم');d.querySelector('a[href="#quran-khatma?tab=khatma"]').click();
 assert.equal(d.querySelector('.quran-tab-btn.active').dataset.tab,'khatma');assert.equal(w.location.hash,'#quran-khatma?tab=khatma');
 w.closeServiceFocusView();await new Promise(r=>setTimeout(r,30));assert.equal(scroll,640);assert.match(d.querySelector('.cat-pill-btn.active').textContent,/القرآن/);
 d.querySelector('a[href="#quran-khatma?tab=mushaf"]').click();assert.equal(d.querySelector('.quran-tab-btn.active').dataset.tab,'mushaf');
 w.closeServiceFocusView();d.querySelector('[data-open-radio]').click();assert.equal(d.getElementById('radio-panel').classList.contains('open'),true);assert.equal(d.body.classList.contains('single-service-mode'),false);
 assert.deepEqual(errors,[]);w.close();
});
test('direct khatma link selects the group tab',async()=>{
 const {dom,errors}=await load('services.html',{url:'http://localhost:4173/services.html#quran-khatma?tab=khatma'});
 assert.equal(dom.window.document.querySelector('.quran-tab-btn.active').dataset.tab,'khatma');assert.deepEqual(errors,[]);dom.window.close();
});

test('personal services start quiet, pin up to four and keep controls separate from links',async()=>{
 const {dom,errors}=await load('services.html');const w=dom.window,d=w.document;
 assert.equal(d.getElementById('services-resume').hidden,true);assert.equal(d.getElementById('services-favorites').hidden,true);assert.equal(d.getElementById('services-recent').hidden,true);
 const stars=[...d.querySelectorAll('.service-favorite')];assert.equal(stars.length,23);assert.equal(d.querySelector('.service-card button'),null);
 stars.slice(0,5).forEach(b=>b.click());assert.equal(JSON.parse(w.localStorage.getItem('zad_services_favorites')).length,4);assert.match(d.getElementById('services-personal-status').textContent,/4/);
 assert.equal(d.body.classList.contains('single-service-mode'),false);
 stars[0].click();assert.equal(JSON.parse(w.localStorage.getItem('zad_services_favorites')).length,3);
 w.filterCategory('الصلاة');assert.equal(d.querySelector('a[href="#azkar"]').parentElement.hidden,true);
 assert.deepEqual(errors,[]);w.close();
});
test('personal services resume saved Quran and remember recent visibility',async()=>{
 const {dom,errors}=await load('services.html',{storage:{zad_quran_last_read:JSON.stringify({pageNumber:12}),zad_services_favorites:JSON.stringify(['#azkar','javascript:alert(1)'])}});const w=dom.window,d=w.document;
 assert.match(d.getElementById('services-resume').textContent,/12/);assert.equal(d.querySelectorAll('#services-favorites .services-personal-links button').length,1);
 d.querySelector('#services-resume button').click();assert.equal(d.querySelector('.quran-tab-btn.active').dataset.tab,'mushaf');w.closeServiceFocusView();
 assert.equal(d.getElementById('services-recent').hidden,false);d.getElementById('services-hide-recent').click();assert.equal(d.getElementById('services-recent').hidden,true);assert.equal(w.localStorage.getItem('zad_services_recent_hidden'),'true');d.getElementById('services-show-recent').click();assert.equal(d.getElementById('services-recent').hidden,false);
 assert.deepEqual(errors,[]);w.close();
});
test('personal services do not fabricate resume from hidden reader initialization',async()=>{
 const {dom,errors}=await load('services.html',{storage:{zad_services_personal_seen:'true',zad_quran_last_read:JSON.stringify({pageNumber:562}),zad_services_favorites:'null',zad_services_recent:'{}'}});
 assert.equal(dom.window.document.getElementById('services-resume').hidden,true);assert.deepEqual(errors,[]);dom.window.close();
});

test('personal offline badges reflect actual cached pages and disappear after deletion',async()=>{
 let files=[{url:'http://localhost:4173/assets/quran-pages/12.svg'}];
 const {dom,errors}=await load('services.html',{setup(w){w.caches={keys:async()=>['zad-downloads-v1'],open:async()=>({keys:async()=>files,match:async()=>undefined})};}});const w=dom.window,d=w.document;
 assert.match(d.querySelector('.service-offline-badge').textContent,/1 صفحة/);assert.match(d.getElementById('services-offline-count').textContent,/1 ملف/);
 files=[];d.dispatchEvent(new w.Event('zad:downloads-changed'));await new Promise(r=>setImmediate(r));assert.equal(d.querySelector('.service-offline-badge'),null);assert.equal(d.getElementById('services-offline-count').textContent,'');assert.deepEqual(errors,[]);w.close();
});

test('service search understands synonyms, Arabic spelling and clear action',async()=>{
 const {dom,errors}=await load('services.html');const w=dom.window,d=w.document,input=d.getElementById('servicesSearch');
 for(const [query,href]of [['جامع قريب','#nearby-mosques-section'],['تسبيح','#smart-dhikr-panel'],['راديو','#radio-panel'],['قُرآن','#quran-khatma?tab=mushaf'],['زكاه','#zakat-calculator-section']]){
 input.value=query;w.filterServices();assert.equal(d.querySelector('a[href="'+href+'"]').style.display,'flex');assert.equal(d.getElementById('services-clear-search').hidden,false);
 }
 input.value='خدمة غير موجودة';w.filterServices();assert.equal(d.getElementById('noResultsBox').style.display,'block');d.getElementById('services-clear-search').click();assert.equal(input.value,'');assert.equal(d.activeElement,input);assert.equal(d.getElementById('services-clear-search').hidden,true);
 assert.equal(d.querySelector('script[src*="leaflet"]'),null);assert.equal(d.getElementById('audio-adhan').preload,'none');assert.deepEqual(errors,[]);w.close();
});

test('services search stays above personal shortcuts and favorites are excluded from recents',async()=>{
 const {dom,errors}=await load('services.html',{storage:{zad_services_favorites:JSON.stringify(['#azkar']),zad_services_recent:JSON.stringify(['#azkar','#prayer-times'])}});const w=dom.window,d=w.document;
 assert.ok(d.querySelector('.services-search-wrapper').compareDocumentPosition(d.getElementById('services-personal')) & w.Node.DOCUMENT_POSITION_FOLLOWING);
 const labels=()=>[...d.querySelectorAll('#services-recent .services-personal-links button')].map(b=>b.textContent);
 assert.equal(labels().length,1);assert.match(labels()[0],/الصلاة/);
 const prayer=d.querySelector('a[href="#prayer-times"]').parentElement.querySelector('.service-favorite');prayer.click();assert.equal(d.getElementById('services-recent').hidden,true);assert.equal(labels().length,0);
 prayer.click();assert.equal(d.getElementById('services-recent').hidden,false);assert.equal(labels().length,1);assert.deepEqual(errors,[]);w.close();
});

test('single service has one return control and preserves directory position',async()=>{
 const {dom,errors}=await load('services.html');const w=dom.window,d=w.document;let restored;
 w.scrollTo=opts=>{restored=opts.top;};Object.defineProperty(w,'scrollY',{value:510,configurable:true});
 w.filterCategory('الصلاة');d.querySelector('a[href="#prayer-times"]').click();
 assert.equal(d.body.classList.contains('single-service-mode'),true);assert.equal(d.getElementById('serviceFocusHeader').style.display,'block');
 assert.equal(d.querySelectorAll('button[onclick="closeServiceFocusView(true)"]').length,1);assert.equal(d.getElementById('floatingBackToServices'),null);assert.equal(d.getElementById('serviceFocusBottomBar'),null);
 const back=d.getElementById('btnServiceFocusBack');assert.equal(back.textContent.trim(),'رجوع للخدمات');back.click();await new Promise(r=>setTimeout(r,35));
 assert.equal(d.body.classList.contains('services-hub-mode'),true);assert.equal(d.getElementById('serviceFocusHeader').style.display,'none');assert.equal(restored,510);assert.match(d.querySelector('.cat-pill-btn.active').textContent,/الصلاة/);assert.deepEqual(errors,[]);w.close();
});


test('every home local page link resolves, including the deceased guide and Quran tab',async()=>{
 const {dom,errors}=await load('index.html');const d=dom.window.document;
 for(const link of d.querySelectorAll('a[href]')){const url=new URL(link.href);if(url.origin!=='http://localhost:4173'||!url.hash||url.hash==='#')continue;const file=path.join(root,url.pathname);if(!fs.existsSync(file))continue;const target=new JSDOM(fs.readFileSync(file,'utf8'));assert.ok(target.window.document.getElementById(url.hash.slice(1).split('?')[0]),link.textContent+' '+url.href);target.window.close();}
 assert.deepEqual(errors,[]);dom.window.close();
});
test('service hash navigation opens hidden sections and selects Quran pages and azkar tabs',async()=>{
 const {dom,errors}=await load('services.html');const w=dom.window,d=w.document;
 for(const [hash,id]of [['#islamic-guide','islamic-guide'],['#daily-wird','daily-wird'],['#quran-khatma?tab=mushaf&page=293','quran-khatma'],['#azkar?tab=evening','azkar']]){
 w.location.hash=hash;await new Promise(r=>setTimeout(r,40));assert.ok(d.getElementById(id).classList.contains('active-service-view'));
 if(id==='quran-khatma'){assert.equal(d.getElementById('subpart-mushaf').classList.contains('is-hidden'),false);assert.match(d.getElementById('mushaf-real-page-img-right').src,/293\.svg/);}
 if(id==='azkar')assert.ok(d.getElementById('tab-evening').classList.contains('active'));
 }
 assert.deepEqual(errors,[]);w.close();
});
test('all timed home reminder actions navigate to current service routes',async()=>{
 const {dom,errors}=await load('index.html');const w=dom.window,NativeDate=w.Date;let destination;w.zadNavigate=url=>destination=url;
 const cases=[[30,12,'quran-khatma?tab=mushaf&page=293'],[26,10,'prayer-times'],[25,20,'azkar'],[27,3,'categorized-duas'],[27,6,'azkar?tab=morning'],[27,9,'prayer-guide-section'],[27,12,'quran-khatma?tab=mushaf'],[27,16,'azkar?tab=evening'],[27,19,'smart-dhikr-panel'],[27,22,'quran-khatma?tab=mushaf&page=562']];
 for(const [day,hour,expected]of cases){const stamp=new NativeDate(2026,9,day,hour).getTime();w.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[stamp]));}};w.initSmartTimelyReminders();w.document.getElementById('btn-reminder-act').click();assert.equal(destination.split('#')[1],expected);}
 assert.deepEqual(errors,[]);w.close();
});
test('a direct home shortcut reveals a hidden section without altering preferences',async()=>{
 const config=JSON.stringify({smart_dhikr:false,daily_journey:false});const {dom,errors}=await load('index.html',{url:'http://localhost:4173/index.html#daily-wird',storage:{zad_home_sections:config}});const w=dom.window,d=w.document;await new Promise(r=>setTimeout(r,30));assert.notEqual(d.getElementById('daily-journey-panel').style.display,'none');assert.notEqual(d.querySelector('.dashboard').style.display,'none');assert.equal(w.localStorage.getItem('zad_home_sections'),config);assert.deepEqual(errors,[]);w.close();
});

test('secondary categories collapse initially, stay searchable and reopen for a restored selection',async()=>{
 const {dom,errors}=await load('services.html');const w=dom.window,d=w.document,extra=d.getElementById('services-extra-categories'),toggle=d.getElementById('services-more-categories');
 assert.equal(extra.hidden,true);assert.equal(d.querySelectorAll('.category-filter-pills > .cat-pill-btn').length,5);
 toggle.click();assert.equal(extra.hidden,false);assert.equal(toggle.getAttribute('aria-expanded'),'true');toggle.click();assert.equal(extra.hidden,true);
 d.getElementById('servicesSearch').value='مواسم';w.filterServices();assert.equal(d.querySelector('a[href="#seasons"]').style.display,'flex');assert.equal(extra.hidden,true);
 w.filterCategory('المواسم والتقويم');assert.equal(extra.hidden,false);d.querySelector('a[href="#seasons"]').click();w.closeServiceFocusView();await new Promise(r=>setTimeout(r,35));assert.equal(extra.hidden,false);assert.equal(d.querySelector('.cat-pill-btn.active').dataset.categoryFilter,'المواسم والتقويم');assert.deepEqual(errors,[]);w.close();
});

test('salawat voice selection persists, drives preview and reschedules native reminders',async()=>{
 const {dom,errors}=await load('settings.html',{storage:{smart_notify_settings:JSON.stringify({salawatVoice:'voice1'})}});const w=dom.window,d=w.document;assert.equal(d.getElementById('select-salawat-voice').value,'voice1');let calls=0;w.NativeAdhanService.scheduleLocalNotifications=async()=>{calls++;return {success:true};};const select=d.getElementById('select-salawat-voice');select.value='voice2';select.dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,50));assert.equal(JSON.parse(w.localStorage.getItem('smart_notify_settings')).salawatVoice,'voice2');d.getElementById('btn-test-salawat-sound').click();await new Promise(r=>setImmediate(r));assert.match(d.getElementById('audio-salawat-preview').src,/salawat-2\.mp3/);assert.ok(calls>0);assert.deepEqual(errors,[]);w.close();
});

test('moved tasbeeh and challenge work in services and legacy tasbeeh links redirect',async()=>{
 const h=await load('index.html',{url:'http://localhost:4173/index.html#smart-dhikr-panel',setup:w=>{w.zadNavigate=url=>w.__destination=url;}});try{h.dom.window.zadNavigate=url=>h.dom.window.__destination=url;h.dom.window.dispatchEvent(new h.dom.window.HashChangeEvent('hashchange'));assert.equal(h.dom.window.__destination,'services.html#smart-dhikr-panel');assert.equal(h.dom.window.document.querySelector('.panel.challenge'),null);assert.deepEqual(h.errors,[]);}finally{h.dom.window.close();}
 const h2=await load('services.html',{url:'http://localhost:4173/services.html#smart-dhikr-panel'});try{const w=h2.dom.window,d=w.document;assert.ok(d.getElementById('smart-dhikr-panel').classList.contains('active-service-view'));const before=Number(d.getElementById('counter').textContent);d.getElementById('btn-quick-bead-tap').click();assert.equal(Number(d.getElementById('counter').textContent),before+1);w.openServiceView('#seven-day-challenge');d.getElementById('btn-open-7days-challenge').click();assert.ok(d.getElementById('challenge-modal').classList.contains('active'));assert.equal(d.getElementById('challenge-days-list').children.length,7);assert.deepEqual(h2.errors,[]);}finally{h2.dom.window.close();}
});

test('selected muazzin persists and reaches native scheduler without resetting to default',async()=>{
 const {dom,errors}=await load('settings.html',{storage:{zad_selected_muazzin:'makkah'}});
 const w=dom.window,d=w.document;
 assert.equal(d.getElementById('select-adhan-muazzin').value,'makkah');
 let scheduledMuazzin=null;
 w.NativeAdhanService.scheduleLocalNotifications=async()=>{
  scheduledMuazzin=w.NativeAdhanService.getSelectedMuazzin();
  return {success:true};
 };
 const select=d.getElementById('select-adhan-muazzin');
 select.value='madinah';
 select.dispatchEvent(new w.Event('change',{bubbles:true}));
 await new Promise(r=>setTimeout(r,50));
 assert.equal(w.localStorage.getItem('zad_selected_muazzin'),'madinah');
 assert.equal(scheduledMuazzin,'madinah');
 assert.deepEqual(errors,[]);w.close();
});


test('prayer image preview initializes after markup, switches every prayer and closes safely',async()=>{
 const {dom,errors}=await load('settings.html');
 try{
  const d=dom.window.document,modal=d.getElementById('modal-prayer-image-preview');
  assert.deepEqual(errors,[]);
  d.getElementById('btn-preview-prayer-image').click();
  assert.equal(modal.style.display,'flex');
  for(const key of ['fajr','dhuhr','asr','maghrib','isha']){
   const button=d.querySelector('#prayer-preview-tabs [data-prayer="'+key+'"]');button.click();
   assert.ok(d.getElementById('prayer-preview-img').src.endsWith('pre_'+key+'.jpg'));
   assert.ok(button.classList.contains('gold'));
  }
  d.getElementById('btn-mock-stop-adhan').click();assert.equal(modal.style.display,'none');
  d.getElementById('btn-preview-prayer-image').click();
  d.getElementById('btn-close-prayer-preview').click();assert.equal(modal.style.display,'none');
 }finally{dom.window.close();}
});

test('every category filter has content and excerpts opens its populated media library',async()=>{
 const {dom,errors}=await load('services.html');try{
 const d=dom.window.document;assert.deepEqual(errors,[]);
 for(const button of d.querySelectorAll('[data-category-filter]')){
  button.click();assert.ok([...d.querySelectorAll('.service-card')].some(c=>c.style.display!=='none'),button.dataset.categoryFilter);
 }
 d.querySelector('[data-category-filter="المرئيات"]').click();
 const card=d.querySelector('.service-card[href="#islamic-media"]');assert.notEqual(card.style.display,'none');card.click();
 assert.ok(d.body.classList.contains('single-service-mode'));
 assert.ok(d.getElementById('islamic-media-grid').children.length>0);
 }finally{dom.window.close();}
});
