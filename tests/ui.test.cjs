const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, requestInterceptor, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const backupTools = require('../assets/js/user-tools.js');
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
            w.localStorage.setItem('zad_language','ar');
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
test('generated surah and group completion lists follow language changes without altering selections',async()=>{
 const {dom,errors}=await load('services.html',{storage:{zad_language:'en'}});
 try{
  const w=dom.window,d=w.document,select=d.getElementById('offline-audio-surah');assert.deepEqual(errors,[]);
  assert.equal(select.options.length,115);assert.equal(select.value,'67');
  assert.equal(select.options[61].textContent,'62 · Al-Jumuah');assert.equal(select.options[88].textContent,'89 · Al-Fajr');
  assert.equal(select.options[102].textContent,'103 · Al-Asr');
  assert.doesNotMatch(d.querySelector('.juz-card').textContent,/[\u0600-\u06ff]/);
  for(const language of ['ur','ar','en']){
   w.ZadI18n.set(language);await new Promise(resolve=>setTimeout(resolve,20));assert.equal(select.value,'67');
   assert.equal(d.documentElement.dir,language==='en'?'ltr':'rtl');
   assert.equal(select.options[0].textContent,language==='en'?'1 · Al-Fatihah':'1 · الفاتحة');
  }
 }finally{dom.window.close();}
});

test('web notification state translates all fragments and refreshes on language changes',async()=>{
 const {dom,errors}=await load('settings.html',{storage:{zad_language:'en'}});
 try{
  const w=dom.window,d=w.document,box=d.getElementById('zad-notification-state');assert.deepEqual(errors,[]);
  assert.match(box.textContent,/Permission:/);assert.doesNotMatch(box.textContent,/[\u0600-\u06ff]/);
  w.ZadI18n.set('ur');await new Promise(resolve=>setTimeout(resolve,20));assert.match(box.textContent,/اجازت/);assert.doesNotMatch(box.textContent,/Permission:/);
  w.ZadI18n.set('ar');await new Promise(resolve=>setTimeout(resolve,20));assert.match(box.textContent,/الإذن:/);assert.doesNotMatch(box.textContent,/Today's/);
 }finally{dom.window.close();}
});

test('settings language control updates the whole interface and preserves reading preferences',async()=>{
 const {dom,errors}=await load('settings.html',{storage:{zad_language:'en'}});
 try{
  const w=dom.window,d=w.document,select=d.getElementById('zad-language');
  assert.deepEqual(errors,[]);assert.ok(select);assert.equal(select.value,'en');
  assert.match(d.querySelector('#settings-language-section').textContent,/App language/);
  assert.equal(d.documentElement.dir,'ltr');
  const previous=JSON.stringify(w.ZadReadingSettings.get());select.value='ur';select.dispatchEvent(new w.Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,0));
  assert.equal(d.documentElement.lang,'ur');assert.equal(d.documentElement.dir,'rtl');assert.equal(w.localStorage.getItem('zad_language'),'ur');
  assert.match(d.querySelector('#settings-language-section').textContent,/ایپ کی زبان/);
  assert.equal(JSON.stringify(w.ZadReadingSettings.get()),previous);
  select.value='ar';select.dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,0));
  assert.match(d.querySelector('#settings-language-section').textContent,/لغة التطبيق/);
 }finally{dom.window.close();}
});

test('English and Urdu service search retain Arabic aliases and stable favorite links',async()=>{
 const {dom,errors}=await load('services.html',{storage:{zad_language:'en'}});
 try{
  const w=dom.window,d=w.document,input=d.getElementById('servicesSearch');assert.deepEqual(errors,[]);
  const card=d.querySelector('.service-card[href="#azkar"]');assert.match(card.textContent,/Daily adhkar/);
  for(const query of ['adhkar','أذكار']){input.value=query;w.filterServices();assert.notEqual(card.style.display,'none');}
  input.value='';w.filterServices();card.parentElement.querySelector('.service-favorite').click();await new Promise(r=>setTimeout(r,0));
  const favorites=w.localStorage.getItem('zad_services_favorites');assert.match(favorites,/#azkar/);
  w.ZadI18n.set('ur');await new Promise(r=>setTimeout(r,0));input.value='اذکار';w.filterServices();
  assert.notEqual(card.style.display,'none');assert.equal(w.localStorage.getItem('zad_services_favorites'),favorites);
  w.ZadI18n.set('ar');await new Promise(r=>setTimeout(r,0));assert.match(card.textContent,/أذكار اليوم وحصن المسلم/);
 }finally{dom.window.close();}
});

test('daily featured clip translates all metadata and media search accepts its translated titles',async()=>{
 const home=await load('index.html',{storage:{zad_language:'en'}});
 try{
  const w=home.dom.window,d=w.document;assert.deepEqual(home.errors,[]);
  const item=w.getActiveIslamicMediaList().find(item=>item.title===w.ZadI18n.originalText(d.getElementById('daily-clip-title')));assert.ok(item);
  for(const language of ['en','ur','ar']){
   w.ZadI18n.set(language);w.initDailyFeaturedMediaClip();await new Promise(r=>setTimeout(r,0));
   for(const [id,field] of [['daily-clip-title','title'],['daily-clip-desc','desc'],['daily-clip-cat-tag','badge']])assert.equal(d.getElementById(id).textContent,w.ZadI18n.t(item[field]));
   assert.equal(d.getElementById('daily-clip-thumb').alt,w.ZadI18n.t(item.title));assert.ok(d.getElementById('daily-clip-speaker').textContent.includes(w.ZadI18n.t(item.speaker)));
  }
 }finally{home.dom.window.close();}
 const services=await load('services.html',{storage:{zad_language:'en'}});
 try{
  const w=services.dom.window,d=w.document,input=d.getElementById('media-search-input');assert.deepEqual(services.errors,[]);
  for(const query of ['understanding the Quran','قرآن کو سمجھنا','كيف يمكن فهمك']){
   input.value=query;input.dispatchEvent(new w.Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,10));
   assert.ok(d.querySelector('.media-card[data-id="pod_top_1"]'),query);
  }
 }finally{services.dom.window.close();}
});

test('next and previous cards scroll in reading order in English, Arabic and Urdu',async()=>{
 const {dom,errors}=await load('services.html');
 try{
  const w=dom.window,d=w.document;assert.deepEqual(errors,[]);
  const carousels=[['scrollKhatmaGrid','khatma-grid-container'],['scrollAzkarContainer','azkar-cards-container'],['scrollDuasContainer','categorized-duas-grid'],['scrollAsmaaContainer','asmaa-grid'],['scrollStoriesContainer','stories-grid'],['scrollMediaContainer','islamic-media-grid']];
  for(const language of ['en','ar','ur']){
   w.ZadI18n.set(language);
   for(const [action,id]of carousels){
    const container=d.getElementById(id);assert.ok(container,id);let amount;
    container.scrollBy=options=>{amount=options.left;};
    w[action]('left');assert.equal(Math.sign(amount),language==='en'?1:-1,action+' next '+language);
    w[action]('right');assert.equal(Math.sign(amount),language==='en'?-1:1,action+' previous '+language);
   }
  }
 }finally{dom.window.close();}
});

test('home dates follow the selected language and retain the Hijri adjustment',async()=>{
 const {dom,errors}=await load('index.html',{storage:{zad_language:'en'}});
 try{
  const w=dom.window,d=w.document,date=new w.Date('2026-11-04T12:00:00');assert.deepEqual(errors,[]);
  assert.match(w.getFullFormattedDate(date),/Wednesday/);assert.match(d.getElementById('today').textContent,/November/);
  const before=w.getFullFormattedDate(date);w.localStorage.setItem('zad_hijri_offset','1');assert.notEqual(w.getFullFormattedDate(date),before);
  w.ZadI18n.set('ur');assert.match(w.getFullFormattedDate(date),/بدھ/);assert.doesNotMatch(d.getElementById('today').textContent,/November/);
  assert.match(w.getFullFormattedDate(date),/جمادی الاولیٰ 1448 ھ/);
  assert.doesNotMatch(w.getFullFormattedDate(date),/قبل مسیح/);
  w.ZadI18n.set('ar');assert.match(w.getFullFormattedDate(date),/الأربعاء/);assert.match(d.getElementById('today').textContent,/نوفمبر/);
 }finally{dom.window.close();}
});

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
        assert.equal(d.getElementById('zad-font'),null);
        w.ZadReadingSettings.set({size:120});
        d.getElementById('zad-method').value='5';
        d.getElementById('zad-school').value='1';
        d.getElementById('zad-save-settings').click();
        assert.equal(w.localStorage.getItem('zad_prayer_method'),'5');
        assert.equal(w.localStorage.getItem('zad_prayer_school'),'1');
        assert.equal(w.ZadReadingSettings.get().size,120);
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
        w.ZadReadingSettings.set({size:140});
        await d.getElementById('zad-save-settings').onclick();
        assert.equal(w.localStorage.getItem('zad_favorites'),favorites);
        assert.equal(w.localStorage.getItem('selected_prayer_city'),'London');
        assert.equal(w.ZadReadingSettings.get().size,140);
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
  assert.equal(d.getElementById('zad-font'),null);
  assert.equal(d.querySelectorAll('.reading-font-controls').length,1);
  assert.ok(d.querySelector('#settings-reading-section [data-size]'));
  assert.equal(d.querySelector('#settings-reading-section select').options.length,4);
  assert.equal(d.querySelector('.settings-reading-links'),null);
  assert.equal(d.getElementById('zad-save-settings').hidden,true);
  assert.deepEqual(errors,[]);
 } finally {dom.window.close();}
});

test('new Quran readers start at the Fatiha and page navigation accepts Arabic digits without opening tafsir',async()=>{
 const {dom,errors}=await load('services.html',{url:'http://localhost:4173/services.html#quran-khatma?tab=mushaf'});
 try{
  const w=dom.window,d=w.document;
  assert.equal(JSON.parse(w.localStorage.getItem('zad_quran_last_read')).pageNumber,1);
  assert.equal(d.querySelector('#golden-index-wird').contains(d.getElementById('smart-khatma-dashboard-slot')),true);
  assert.equal(d.querySelector('.quran-tab-btn[data-tab="mushaf"] span').textContent,'المصحف');
  d.getElementById('golden-page-pill').click();assert.ok(d.getElementById('golden-page-jump').classList.contains('open'));assert.equal(d.getElementById('golden-ayah-modal').classList.contains('open'),false);
  const input=d.getElementById('quran-page-number');input.value='٦٠٤';d.getElementById('quran-page-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(JSON.parse(w.localStorage.getItem('zad_quran_last_read')).pageNumber,604);assert.equal(d.getElementById('golden-page-jump').classList.contains('open'),false);
  d.getElementById('golden-page-pill').click();input.value='0';d.getElementById('quran-page-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(input.getAttribute('aria-invalid'),'true');assert.equal(JSON.parse(w.localStorage.getItem('zad_quran_last_read')).pageNumber,604);
  d.getElementById('quran-page-close').click();d.getElementById('golden-btn-tafsir-sheet').click();assert.ok(d.getElementById('golden-ayah-modal').classList.contains('open'));
  assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});
test('saved Quran reading position survives the simplified reader and reciter choices reach the shared player',async()=>{
 const {dom,errors}=await load('services.html',{url:'http://localhost:4173/services.html#quran-khatma?tab=mushaf',storage:{zad_quran_last_read:JSON.stringify({pageNumber:293})}});
 try{
  const w=dom.window,d=w.document;assert.equal(JSON.parse(w.localStorage.getItem('zad_quran_last_read')).pageNumber,293);
  let played,downloaded;
  w.ZadQuranAudio={playSurah:async value=>played=value,getState:()=>({}),openDownloads:value=>downloaded=value};
  d.getElementById('quran-reciter-select').value='54';d.getElementById('quran-reciter-select').dispatchEvent(new w.Event('change'));
  d.getElementById('btn-surah-audio').click();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(played.surahId,18);assert.equal(played.reciterId,'54');
  d.getElementById('quran-open-downloads').click();assert.equal(downloaded.surahId,18);assert.equal(downloaded.reciterId,'54');assert.deepEqual(errors,[]);
  const playback={station:{id:'recitation-54-18',surahId:18,reciterId:'54',offline:true,saved:false,name:'سورة الكهف',desc:'السديس'},wanted:true,state:'playing',position:30};
  w.ZadQuranAudio.getState=()=>playback;w.ZadQuranAudio.stop=()=>{playback.wanted=false;};w.updateQuranAudioUI(playback);
  assert.equal(d.getElementById('golden-mini-player').style.display,'block');d.getElementById('golden-player-btn-close').click();w.updateQuranAudioUI(playback);assert.equal(d.getElementById('golden-mini-player').style.display,'none');
 }finally{dom.window.close();}
});
test('personal wird lives in the Quran index and starting it closes the index without resetting the plan',async()=>{
 const {dom,errors}=await load('services.html',{url:'http://localhost:4173/services.html#quran-khatma?tab=mushaf'});
 try{
  const w=dom.window,d=w.document,modal=d.getElementById('golden-index-modal'),panel=d.getElementById('golden-index-wird');
  assert.equal(d.querySelectorAll('#smart-khatma-dashboard-slot').length,1);
  assert.equal(d.getElementById('subpart-mushaf').contains(d.getElementById('smart-khatma-dashboard-slot')),false);
  d.getElementById('golden-btn-index').click();d.querySelector('.golden-index-tab-btn[data-tab="wird"]').click();
  assert.equal(panel.hidden,false);assert.equal(d.getElementById('golden-index-list').hidden,true);assert.equal(d.querySelector('.golden-index-search').hidden,true);assert.ok(panel.querySelector('.smart-khatma-card'));
  const before=w.localStorage.getItem('zad_smart_khatma_plan');panel.querySelector('.btn-read-wird').click();
  assert.equal(modal.classList.contains('open'),false);assert.equal(w.localStorage.getItem('zad_smart_khatma_plan'),before);
  d.getElementById('golden-btn-index').click();d.querySelector('.golden-index-tab-btn[data-tab="surahs"]').click();assert.equal(panel.hidden,true);assert.equal(d.getElementById('golden-index-list').hidden,false);
  assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});
test('Quran listening controls are in a dismissible sheet and successful playback leaves only the mini player',async()=>{
 const {dom,errors}=await load('services.html',{url:'http://localhost:4173/services.html#quran-khatma?tab=mushaf'});
 try{
  const w=dom.window,d=w.document,sheet=d.getElementById('quran-listen-sheet'),trigger=d.getElementById('golden-btn-listen');
  assert.ok(sheet.contains(d.querySelector('.quran-listen-bar')));assert.equal(d.getElementById('golden-quran-wrapper').contains(d.querySelector('.quran-listen-bar')),false);assert.equal(sheet.classList.contains('open'),false);
  trigger.click();assert.equal(sheet.classList.contains('open'),true);assert.equal(trigger.getAttribute('aria-expanded'),'true');
  d.getElementById('quran-listen-close').click();assert.equal(sheet.classList.contains('open'),false);assert.equal(d.activeElement,trigger);
  trigger.click();d.getElementById('quran-open-downloads').click();assert.equal(sheet.classList.contains('open'),false);assert.equal(d.getElementById('radio-panel').classList.contains('open'),true);assert.equal(d.getElementById('tab-btn-downloads').getAttribute('aria-selected'),'true');
  d.getElementById('btn-close-radio').click();
  const actual=w.ZadQuranAudio;let play;
  w.ZadQuranAudio={...actual,playSurah:async value=>{play=value;return true;}};
  trigger.click();d.getElementById('quran-reciter-select').value='54';d.getElementById('quran-reciter-select').dispatchEvent(new w.Event('change'));assert.equal(sheet.classList.contains('open'),true);
  d.getElementById('btn-surah-audio').click();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(play.reciterId,'54');assert.equal(sheet.classList.contains('open'),false);assert.equal(trigger.getAttribute('aria-expanded'),'false');
  w.updateQuranAudioUI({station:{id:'recitation-54-1',offline:true,saved:false,surahId:1,reciterId:'54',name:'الفاتحة',desc:'السديس'},wanted:true,state:'playing',position:0});assert.equal(d.getElementById('golden-mini-player').style.display,'block');
  trigger.click();w.ZadQuranAudio.playSurah=async()=>{throw Error('تعذّر الاتصال');};d.getElementById('btn-surah-audio').click();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(sheet.classList.contains('open'),true);assert.match(d.getElementById('quran-audio-status').textContent,/تعذّر الاتصال/);
  assert.deepEqual(errors,[]);
 }finally{dom.window.close();}
});

test('phone permission status is translated and refreshed when the interface language changes',async()=>{
 const {dom,errors}=await load('settings.html',{storage:{zad_language:'en'},setup(w){
  w.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',Plugins:{
   AdhanNative:{checkAlarmPermissions:async()=>({notificationsGranted:true,exactAlarmsGranted:false,batteryOptimizationsIgnored:true,fullScreenIntentGranted:false}),getPrayerScheduleStatus:async()=>({count:5,next:Date.now()+60000,until:Date.now()+86400000})},
   LocalNotifications:{checkPermissions:async()=>({display:'granted'}),getPending:async()=>({notifications:[]}),createChannel:async()=>{},addListener:()=>{}}
  }};
 }});
 try{
  const w=dom.window,d=w.document;assert.deepEqual(errors,[]);
  const status=()=>d.querySelector('.settings-delivery-status>p').textContent;
  assert.match(status(),/Notifications: allowed/);assert.match(status(),/Exact alarms: permission needed/);assert.doesNotMatch(status(),/[\u0600-\u06ff]/);
  w.ZadI18n.set('ur');await new Promise(r=>setTimeout(r,20));assert.match(status(),/اطلاعات/);assert.doesNotMatch(status(),/Notifications/);
  w.ZadI18n.set('ar');await new Promise(r=>setTimeout(r,20));assert.match(status(),/المواعيد الدقيقة: تحتاج إذنًا/);
 }finally{dom.window.close();}
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

test('Android settings surface full-screen intent permission requirement and request handler',async()=>{
 let requested=false;
 const {dom,errors}=await load('settings.html',{setup(w){
  w.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',Plugins:{
   AdhanNative:{
    checkAlarmPermissions:async()=>({notificationsGranted:true,exactAlarmsGranted:true,batteryOptimizationsIgnored:true,fullScreenIntentGranted:false}),
    getPrayerScheduleStatus:async()=>({count:5,next:Date.now()+60000,until:Date.now()+86400000}),
    requestFullScreenIntentPermission:async()=>{requested=true;return {opened:true};}
   },
   LocalNotifications:{checkPermissions:async()=>({display:'granted'}),getPending:async()=>({notifications:[]}),createChannel:async()=>{},addListener:()=>{}}
  }};
 }});
 try {
  const w=dom.window,d=w.document;
  await new Promise(r=>setTimeout(r,50));
  assert.match(d.querySelector('.settings-delivery-status').textContent,/شاشة الأذان: تحتاج إذنًا لفتح الشاشة عند القفل/);
  const btn=[...d.querySelectorAll('.settings-status-actions button')].find(b=>b.textContent==='إذن شاشة الأذان الكاملة');
  assert.ok(btn,'full-screen intent permission button exists');
  assert.equal(btn.hidden,false);
  await btn.onclick();
  assert.equal(requested,true);
  assert.deepEqual(errors,[]);
 } finally {dom.window.close();}
});

test('open radio panel translates station changes, playback, empty favorites and timer across languages',async()=>{
 const {dom,errors}=await load('index.html',{storage:{zad_language:'en'}});const w=dom.window,d=w.document;
 try{
  assert.deepEqual(errors,[]);d.getElementById('radio-fab-btn').click();assert.ok(d.getElementById('radio-panel').classList.contains('open'));
  const select=d.getElementById('radio-station-select'),button=d.getElementById('btn-radio-play'),audio=d.getElementById('live-radio-audio');
  for(const id of [...select.options].map(o=>o.value)){
   select.value=id;select.dispatchEvent(new w.Event('change'));await new Promise(r=>setTimeout(r,0));
   for(const target of ['current-station-name','current-station-desc'])assert.doesNotMatch(d.getElementById(target).textContent,/[\u0600-\u06ff]/,id);
  }
  const selected=select.value;d.getElementById('btn-radio-favorite').click();await new Promise(r=>setTimeout(r,0));const favorites=w.localStorage.getItem('zadmuslim_radio_favorites');
  for(const language of ['ur','ar','en']){w.ZadI18n.set(language);await new Promise(r=>setTimeout(r,0));assert.equal(select.value,selected);assert.equal(w.localStorage.getItem('zadmuslim_radio_favorites'),favorites);}
  assert.equal(button.getAttribute('aria-label'),'Play');button.click();await new Promise(r=>setTimeout(r,0));
  audio.dispatchEvent(new w.Event('playing'));await new Promise(r=>setTimeout(r,0));assert.doesNotMatch(d.querySelector('.radio-live-status-text').textContent,/[\u0600-\u06ff]/);
  audio.dispatchEvent(new w.Event('error'));await new Promise(r=>setTimeout(r,0));assert.equal(select.value,selected);assert.doesNotMatch(d.querySelector('.radio-live-status-text').textContent,/[\u0600-\u06ff]/);
  button.click();await new Promise(r=>setTimeout(r,0));assert.equal(button.getAttribute('aria-label'),'Play');
  d.getElementById('btn-radio-favorite').click();const filter=d.getElementById('radio-fav-only-checkbox');filter.checked=true;filter.dispatchEvent(new w.Event('change'));await new Promise(r=>setTimeout(r,0));assert.equal(d.querySelector('.radio-empty-state').textContent,'No favorite stations yet');
  d.querySelector('.radio-timer-chip[data-minutes="15"]').click();await new Promise(r=>setTimeout(r,0));assert.doesNotMatch(d.getElementById('radio-timer-countdown').textContent,/[\u0600-\u06ff]/);
  d.querySelector('.radio-timer-chip[data-minutes="0"]').click();assert.equal(errors.length,0);
 }finally{w.close();}
});

test('radio starts with Cairo, preserves station on failure, and exposes accessible stop and favorites',async()=>{
 const {dom,errors}=await load('index.html');const w=dom.window,d=w.document;
 const select=d.getElementById('radio-station-select');assert.equal(select.value,'cairo');
 assert.ok(d.querySelector('.radio-sleep-details summary'));
 const button=d.getElementById('btn-radio-play');button.click();assert.equal(button.getAttribute('aria-label'),'إيقاف');
 const audio=d.getElementById('live-radio-audio');audio.dispatchEvent(new w.Event('error'));assert.equal(select.value,'cairo');
 button.click();assert.equal(button.getAttribute('aria-label'),'تشغيل');
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
 const back=d.getElementById('btnServiceFocusBack');assert.equal(back.getAttribute('aria-label'),'رجوع للخدمات');back.click();await new Promise(r=>setTimeout(r,35));
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
 w.prayerTimings={Fajr:'05:00',Sunrise:'06:30',Dhuhr:'12:00',Asr:'15:00',Maghrib:'18:00',Isha:'20:00'};w.localStorage.setItem('zad_prayer_verified',JSON.stringify({offset:new w.Date().getTimezoneOffset(),zone:w.Intl.DateTimeFormat().resolvedOptions().timeZone}));
 const cases=[[30,12,'quran-khatma?tab=mushaf&page=293'],[26,12,'prayer-times'],[25,19,'azkar'],[27,3,'categorized-duas'],[27,6,'azkar?tab=morning'],[27,9,'prayer-guide-section'],[27,12,'quran-khatma?tab=mushaf'],[27,16,'azkar?tab=evening'],[27,19,'smart-dhikr-panel'],[27,22,'quran-khatma?tab=mushaf&page=562']];
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

test('Fajr and the other prayers use the same selected muezzin on the web',async()=>{
 const {dom}=await load('services.html');
 const w=dom.window;
 try{
  const audio=w.document.getElementById('audio-adhan');
  audio.load=()=>{};
  audio.play=()=>Promise.resolve();
  const prayers=['fajr','dhuhr','asr','maghrib','isha'];
  for(const [selection,expected] of [[null,'qatami'],['madinah','madinah']]){
   if(selection)w.localStorage.setItem('zad_selected_muazzin',selection);
   else w.localStorage.removeItem('zad_selected_muazzin');
   for(const prayer of prayers){
    w.playAdhanAudio(prayer);
    assert.ok(audio.src.endsWith('/adhan/'+expected+'.mp3'),prayer);
   }
  }
  await Promise.resolve();
 }finally{w.close();}
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

test('settings city overview updates immediately with the Arabic selected city',async()=>{const {dom}=await load('settings.html');try{const w=dom.window,d=w.document;d.getElementById('zad-city').value='Riyadh';d.getElementById('zad-city').dispatchEvent(new w.Event('change',{bubbles:true}));assert.match(d.getElementById('hero-current-city').textContent,/الرياض/);}finally{dom.window.close();}});

test('mobile navigation highlights excerpts when selected and restores services highlight on return',async()=>{
 const {dom,errors}=await load('services.html',{url:'http://localhost:4173/services.html#islamic-media'});
 try {
  const d=dom.window.document;
  const mediaLink=d.querySelector('.mobilebar a[href="#islamic-media"]');
  const servicesLink=d.querySelector('.mobilebar a[href="services.html"]');
  assert.ok(mediaLink,'excerpts link in mobilebar');
  assert.ok(servicesLink,'services link in mobilebar');
  assert.equal(mediaLink.classList.contains('active'),true,'excerpts should be active');
  assert.equal(servicesLink.classList.contains('active'),false,'services should not be active');

  servicesLink.click();
  assert.equal(servicesLink.classList.contains('active'),true,'services should be active now');
  assert.equal(mediaLink.classList.contains('active'),false,'excerpts should not be active');
  assert.deepEqual(errors,[]);
 } finally {dom.window.close();}
});


test('real home progress exports and restores through the settings file handler on a separate device',async()=>{
 const source=await load('index.html',{storage:{zad_note_p3:'ملاحظة تجربة',zad_adhan_volume:'0.6',zad_show_prayer_images:'1',zad_home_sections:'{"daily_clip":false}'}});
 let backup;
 try{
  source.dom.window.document.querySelector('.wird-checkbox[data-task="quran"]').click();
  backup=backupTools.makeBackup(source.dom.window.localStorage);
  assert.ok(Object.keys(backup.data).some(key=>key.startsWith('daily_wird_home_import_')));
  backupTools.validateBackup(backup);
 }finally{source.dom.window.close();}
 const destination=await load('settings.html',{url:'http://localhost:4173/settings.html#zad-backup-section'});
 try{
  const w=destination.dom.window,d=w.document;
  await d.getElementById('zad-import-backup').onchange({target:{files:[{size:JSON.stringify(backup).length,text:async()=>JSON.stringify(backup)}],value:'test.json'}});
  for(const [key,value]of Object.entries(backup.data))assert.equal(w.localStorage.getItem(key),value,key);
  assert.equal(w.localStorage.getItem('zad_note_p3'),'ملاحظة تجربة');
  assert.deepEqual(destination.errors,[]);
 }finally{destination.dom.window.close();}
});

test('backup import cancellation and corrupted files preserve existing progress and show a local error',async()=>{
 const h=await load('settings.html',{url:'http://localhost:4173/settings.html#zad-backup-section',storage:{zad_note_p3:'الأصل'}});
 try{
  const w=h.dom.window,d=w.document,input=d.getElementById('zad-import-backup');
  w.confirm=()=>false;
  await input.onchange({target:{files:[{size:80,text:async()=>JSON.stringify({app:'zad-muslim',version:1,data:{zad_note_p3:'بديل'}})}],value:'file.json'}});
  assert.equal(w.localStorage.getItem('zad_note_p3'),'الأصل');
  w.confirm=()=>true;
  for(const file of [{size:10,text:async()=>'{broken'},{size:10,text:async()=>JSON.stringify({app:'other',version:1,data:{}})},{size:6*1024*1024,text:async()=>{throw Error('Should not read oversized file');}}]){
   await input.onchange({target:{files:[file],value:'bad.json'}});
   assert.match(d.getElementById('zad-backup-status').textContent,/تعذّر الاسترجاع/);
   assert.equal(w.localStorage.getItem('zad_note_p3'),'الأصل');
  }
  assert.deepEqual(h.errors,[]);
 }finally{h.dom.window.close();}
});

test('Android backup export waits for actual file saving, handles cancellation and failure honestly',async()=>{
 const h=await load('settings.html');
 try{
 const w=h.dom.window,d=w.document;let finish,received;
 w.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'android',Plugins:{BackupFiles:{saveBackup:args=>{received=args;return new Promise(resolve=>finish=resolve);}}}};
 const button=d.getElementById('zad-export-backup');const promise=button.onclick();
 assert.equal(button.disabled,true);assert.match(d.getElementById('zad-backup-status').textContent,/اختر مكان/);
 backupTools.validateBackup(JSON.parse(received.content));assert.match(received.fileName,/^zad-backup-.*\.json$/);
 finish({saved:true});await promise;assert.equal(button.disabled,false);assert.match(d.getElementById('zad-backup-status').textContent,/تم حفظ ملف/);
 w.Capacitor.Plugins.BackupFiles.saveBackup=async()=>({cancelled:true});await button.onclick();assert.match(d.getElementById('zad-backup-status').textContent,/إلغاء/);
 w.Capacitor.Plugins.BackupFiles.saveBackup=async()=>{throw Error('فشل الحفظ');};await button.onclick();assert.match(d.getElementById('zad-backup-status').textContent,/تعذّر/);assert.equal(button.disabled,false);
 }finally{h.dom.window.close();}
});
