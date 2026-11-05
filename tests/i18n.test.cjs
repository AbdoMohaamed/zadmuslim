const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM,requestInterceptor}=require('jsdom');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
test('notification feedback and home prayer countdown switch between English, Urdu and Arabic',async()=>{
 const dom=await setup('ar');try{
  const w=dom.window,d=w.document,box=d.createElement('section');
  const labels=[
   ['تم حفظ إعدادات التنبيهات.','Reminder settings saved.','یاد دہانیوں کی ترتیبات محفوظ ہو گئیں۔'],
   ['تمت جدولة إشعار الأذان بنجاح بعد 60 ثانية (٠٦:٤٥ م). اقفل شاشة هاتفك للتجربة 📱','Adhan scheduled in 60 seconds (06:45 PM). Lock your phone to test it. 📱','اذان 60 سیکنڈ بعد (06:45 شام) مقرر ہے۔ آزمائش کے لیے فون مقفل کریں۔ 📱'],
   ['موعد الأذان: ٦:٤٥ م (متبقي ٥ د)','Adhan: 6:45 PM (5 min remaining)','اذان: 6:45 شام (5 منٹ باقی)'],
   ['سورة الحشر - آية 10','Surah Al-Hashr – Ayah 10','سورۃ الحشر – آیت 10'],
  ];
  for(const [source] of labels){const p=d.createElement('p');p.textContent=source;box.append(p);}
  d.body.append(box);await tick();
  for(const [language,column] of [['en',1],['ur',2],['ar',0]]){
   w.ZadI18n.set(language);await tick();
   assert.deepEqual([...box.children].map(el=>el.textContent),labels.map(row=>row[column]));
  }
 }finally{dom.window.close();}
});
test('footer dedication translates while original prayer quotations keep Arabic direction',async()=>{
 for(const page of ['index.html','services.html','settings.html','privacy.html']){
  const dom=new JSDOM(fs.readFileSync(page,'utf8'),{url:'https://zad.test/'+page,runScripts:'outside-only'});
  try{
   const w=dom.window,d=w.document,footers=[...d.querySelectorAll('footer')];assert.ok(footers.length,page);
   const originals=footers.map(f=>f.textContent);w.localStorage.setItem('zad_language','en');
   for(const name of ['i18n-dictionary','i18n'])w.eval(fs.readFileSync('assets/js/'+name+'.js','utf8'));await tick();
   for(const footer of footers){const walker=d.createTreeWalker(footer,4);let node;while(node=walker.nextNode())if(!node.parentElement.closest('[translate=no],[lang=ar],script,style'))assert.doesNotMatch(node.data,/[\u0600-\u06ff]/,page);}
   for(const quote of d.querySelectorAll('.footer-quote,.settings-footer-quote')){assert.equal(quote.dir,'rtl');assert.equal(quote.lang,'ar');assert.match(quote.textContent,/اللهم/);}
   w.ZadI18n.set('ur');await tick();if(page==='index.html')assert.match(d.querySelector('.footer-author').textContent,/عبدہ محمد/);
   w.ZadI18n.set('ar');await tick();assert.deepEqual(footers.map(f=>f.textContent),originals);
  }finally{dom.window.close();}
 }
});

test('every radio station has localized metadata and fallback states translate',async()=>{
 const dom=await setup('en');try{
  const w=dom.window,stations=w.eval(fs.readFileSync('assets/js/radio-stations-data.js','utf8')+';RADIO_STATIONS_LIST');
  for(const station of stations)for(const field of ['name','desc','badge'])for(const language of ['en','ur']){
   const translated=w.ZadI18n.t(station[field],language);assert.notEqual(translated,station[field],`${station.id}: ${field}: ${language}`);
   if(language==='en')assert.doesNotMatch(translated,/[\u0600-\u06ff]/,`${station.id}: ${field}`);
  }
  assert.equal(w.ZadI18n.t('متوقف — مشغّل بديل'),'Stopped — alternative player');
  assert.equal(w.ZadI18n.t('لا توجد محطات في المفضلة حالياً'),'No favorite stations yet');
 }finally{dom.window.close();}
});
test('every bundled daily clip has translated titles, descriptions, speakers, badges and view labels',async()=>{
 const dom=await setup('en');try{
  const w=dom.window;const media=w.eval(fs.readFileSync('assets/js/media-data.js','utf8')+';ISLAMIC_MEDIA_DATA');
  assert.equal(media.length,24);
  for(const item of media)for(const field of ['title','desc','speaker','badge','views']){
   for(const language of ['en','ur']){
    const result=w.ZadI18n.t(item[field],language);assert.notEqual(result,item[field],`${item.id}: ${field}: ${language}`);
    if(language==='en'&&field!=='desc')assert.doesNotMatch(result,/[\u0600-\u06ff]/,`${item.id}: ${field}`);
   }
   assert.equal(w.ZadI18n.t(item[field],'ar'),item[field]);
  }
 }finally{dom.window.close();}
});
test('surah references remain distinct from weekdays and prayers in every language',async()=>{
 const dom=await setup('en');try{
  const api=dom.window.ZadI18n;
  assert.equal(api.t('الجمعة'),'Friday');assert.equal(api.t('الفجر'),'Fajr');assert.equal(api.t('العصر'),'Asr');
  assert.equal(api.t('سورة الجمعة'),'Surah Al-Jumuah');assert.equal(api.t('سورة الفجر'),'Surah Al-Fajr');
  assert.equal(api.t('سورة طه: ١١٤'),'Surah Ta-Ha: 114');
  assert.equal(api.t('62 · الجمعة'),'62 · Al-Jumuah');assert.equal(api.t('103. العصر'),'103. Al-Asr');
  assert.equal(api.t('الجمعة','ur'),'جمعہ');assert.equal(api.t('سورة الجمعة','ur'),'سورۃ الجمعہ');
  assert.equal(api.t('الجمعة 6 نوفمبر 2026 م'),'Friday, 6 November 2026 CE');
  const heading=dom.window.document.createElement('h2');heading.id='golden-surah-title';heading.textContent='الفجر';dom.window.document.body.append(heading);await tick();assert.equal(heading.textContent,'Al-Fajr');
  heading.textContent='الفجر - الناس';await tick();assert.equal(heading.textContent,'Al-Fajr – An-Nas');
  api.set('ar');assert.equal(api.t('سورة الجمعة'),'سورة الجمعة');
 }finally{dom.window.close();}
});

test('generated completion, calendar, quiz and money labels translate and restore without changing values',async()=>{
 const dom=await setup('en');try{
  const w=dom.window,d=w.document,section=d.createElement('section');
  assert.equal(w.ZadI18n.t('1 خدمة'),'1 service');assert.equal(w.ZadI18n.t('نتائج البحث: 1 خدمة'),'Search results: 1 service');
  assert.doesNotMatch(w.ZadI18n.t('تشغيل أقومية القرآن – لماذا كان القرآن أعظم معجزة لهداية البشرية؟'),/[\u0600-\u06ff]/);
  assert.match(w.ZadI18n.t('مثال: د. نايف بن نهار | بودكاست بدون ورق'),/^Example: Dr\. Nayef/);
  const labels=['الجزء الثلاثون','يبدأ من: سورة النبأ 1 (عمّ)','الصفحات: 582 - 604','1 مرات','السؤال 2 من 5','النقاط: 3','11 ركعة','13 سنة','عرض الأوسمة (2 / 10)','📖 ورد اليوم (اليوم 2 من 30)','الهدف للترقية إلى «المرحلة الثانية: غرس مبارك 🌿»:','100٪','26,350 ر.س'];
  labels.forEach(text=>{const p=d.createElement('p');p.textContent=text;section.append(p);});d.body.append(section);await tick();
  assert.equal(section.children[0].textContent,'Juz 30');assert.equal(section.children[2].textContent,'Pages: 582 – 604');
  assert.equal(section.children[3].textContent,'1 time');assert.equal(section.children[4].textContent,'Question 2 of 5');
  assert.equal(section.children[6].textContent,'11 rakahs');assert.equal(section.children[7].textContent,'13 years');
  assert.equal(section.children[11].textContent,'100%');assert.equal(section.children[12].textContent,'SAR 26,350');
  w.ZadI18n.set('ur');await tick();assert.equal(section.children[0].textContent,'پارہ 30');assert.match(section.children[4].textContent,/سوال/);
  w.ZadI18n.set('ar');await tick();assert.deepEqual([...section.children].map(p=>p.textContent),labels);
 }finally{dom.window.close();}
});

test('all quiz questions and choices have English and Urdu interface translations',async()=>{
 const dom=await setup('en');try{
  const w=dom.window;const questions=w.eval(fs.readFileSync('assets/js/quiz-data.js','utf8')+';ISLAMIC_QUIZ_QUESTIONS');
  for(const language of ['en','ur'])for(const q of questions){
   for(const label of [q.question,...q.options]){
    const translated=w.ZadI18n.t(label,language);
    if(language==='en')assert.doesNotMatch(translated,/[\u0600-\u06ff]/,`${q.id}: ${label}`);
    // Proper names can have identical Arabic and Urdu spelling.
    else assert.ok(translated!==label || w.ZadTranslations[label]?.ur,`${q.id}: missing Urdu choice: ${label}`);
   }
  }
 }finally{dom.window.close();}
});
async function setup(language='ar',configure){
 const dom=new JSDOM(`<html lang="ar" dir="rtl"><head></head><body><h1>الرئيسية</h1><p id="description">\n اختر لغة الواجهة. تظل نصوص القرآن والأذكار والأحاديث بالعربية.\n</p><button title="إغلاق" aria-label="إغلاق">إغلاق</button><input placeholder="ابحث عن خدمة…"><select data-language-select translate="no"><option value="ar">العربية</option><option value="en">English</option><option value="ur">اردو</option></select><div class="azkar-text">أذكار الصباح</div><p class="reading-font-preview">اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ</p><div translate="no">الرئيسية</div><textarea placeholder="اكتب دعاءك هنا بصدق وإخلاص...">الدعاء</textarea><div class="ask-zad-msg-bubble"><div>الرئيسية</div></div></body></html>`,{url:'https://zad.test',runScripts:'outside-only'});
 const w=dom.window;w.localStorage.setItem('zad_language',language);
 configure?.(w);
 for(const file of ['i18n-dictionary','i18n'])w.eval(fs.readFileSync(`assets/js/${file}.js`,'utf8'));
 await tick();return dom;
}
test('language switching translates labels and attributes, persists choice and restores Arabic',async()=>{
 const dom=await setup();try{
  const w=dom.window,d=w.document,api=w.ZadI18n;
  assert.equal(api.set('en'),true);await tick();
  assert.equal(d.documentElement.lang,'en');assert.equal(d.documentElement.dir,'ltr');
  assert.equal(d.querySelector('h1').textContent,'Home');assert.equal(d.querySelector('button').title,'Close');
  assert.equal(d.querySelector('input').placeholder,'Search services…');
  assert.equal(d.querySelector('textarea').placeholder,'Write your heartfelt dua here…');
  assert.equal(d.querySelector('textarea').value,'الدعاء');
  assert.match(d.getElementById('description').textContent,/Choose the interface language/);
  assert.equal(w.localStorage.getItem('zad_language'),'en');assert.equal(d.querySelector('select').value,'en');
  assert.equal(api.originalText(d.querySelector('h1')),'الرئيسية');
  api.set('ur');await tick();assert.equal(d.querySelector('h1').textContent,'ہوم');assert.equal(d.documentElement.dir,'rtl');
  api.set('ar');await tick();assert.equal(d.querySelector('h1').textContent,'الرئيسية');assert.equal(d.querySelector('button').title,'إغلاق');
  assert.equal(d.querySelector('textarea').placeholder,'اكتب دعاءك هنا بصدق وإخلاص...');assert.equal(d.querySelector('textarea').value,'الدعاء');
  assert.equal(api.set('de'),false);assert.equal(api.language,'ar');
 }finally{dom.window.close();}
});
test('dynamic UI updates translate while scripture, personal text and action identifiers stay intact',async()=>{
 const dom=await setup('en');try{
  const w=dom.window,d=w.document;
  assert.equal(d.querySelector('.azkar-text').textContent,'أذكار الصباح');assert.equal(d.querySelector('.azkar-text').dir,'rtl');
  assert.equal(d.querySelector('[translate=no] option').textContent,'العربية');
  assert.equal(d.querySelector('textarea').value,'الدعاء');assert.equal(d.querySelector('.ask-zad-msg-bubble>div').textContent,'الرئيسية');
  const a=d.createElement('a');a.href='services.html#azkar';a.textContent='أذكار الصباح';d.body.append(a);await tick();
  assert.equal(a.textContent,'Morning adhkar');assert.equal(a.hash,'#azkar');
  a.textContent='أذكار المساء';await tick();assert.equal(a.textContent,'Evening adhkar');
  const textarea=d.querySelector('textarea');textarea.value='دعائي الشخصي الذي كتبته';
  w.ZadI18n.set('ur');await tick();assert.equal(textarea.value,'دعائي الشخصي الذي كتبته');assert.equal(textarea.placeholder,'یہاں اخلاص سے اپنی دعا لکھیں…');
  w.ZadI18n.set('ar');await tick();assert.equal(a.textContent,'أذكار المساء');
  assert.equal(textarea.value,'دعائي الشخصي الذي كتبته');
 }finally{dom.window.close();}
});
test('saved language and storage events synchronise pages and safely handle invalid preferences',async()=>{
 const dom=await setup('ur');try{
  const w=dom.window;assert.equal(w.ZadI18n.language,'ur');
  w.localStorage.setItem('zad_language','en');w.dispatchEvent(new w.StorageEvent('storage',{key:'zad_language',newValue:'en'}));await tick();
  assert.equal(w.document.querySelector('h1').textContent,'Home');
  w.ZadI18n.set('ar');assert.equal(w.ZadI18n.t('3 خدمات'),'3 خدمات');
  assert.equal(w.ZadI18n.t('الخدمات المتاحة: 3','en'),'Available services: 3');
 }finally{dom.window.close();}
});

test('search follows the interface while free text stays automatic and numeric controls stay LTR',async()=>{
 const dom=await setup('en');try{
  const w=dom.window,d=w.document;
  const fields=d.createElement('section');fields.innerHTML='<input type="search"><textarea></textarea><input type="email"><input type="number"><input type="range"><input type="time"><input type="text" inputmode="numeric"><p>نص عربي غير مترجم (123)</p><div class="memorize-ayah-text">بِسْمِ اللَّهِ</div>';
  d.body.append(fields);await tick();
  for(const language of ['en','ur','ar','en']){
   w.ZadI18n.set(language);await tick();
   assert.equal(d.documentElement.dir,language==='en'?'ltr':'rtl');
   assert.equal(fields.querySelector('input[type=search]').dir,language==='en'?'ltr':'rtl');assert.equal(fields.querySelector('textarea').dir,'auto');
   for(const field of fields.querySelectorAll('input[type=email],input[type=number],input[type=range],input[type=time],input[inputmode=numeric]'))assert.equal(field.dir,'ltr');
   assert.equal(fields.querySelector('p').dir,'auto');assert.equal(fields.querySelector('.memorize-ayah-text').dir,'rtl');
   assert.equal(fields.querySelector('.memorize-ayah-text').textContent,'بِسْمِ اللَّهِ');
  }
 }finally{dom.window.close();}
});

test('UI arrows mirror independently of Quran page turns, including dynamically inserted dialogs',async()=>{
 const dom=await setup('en');try{
  const w=dom.window,d=w.document,section=d.createElement('section');
  section.innerHTML='<button id="back"><i class="fa-arrow-right"></i></button><div id="golden-mushaf-viewport"><button><i class="fa-chevron-left"></i></button></div><div data-direction-fixed><i class="fa-arrow-right"></i></div><div class="ask-zad-msg-bubble"><div>English answer ثم نص عربي</div></div>';
  d.body.append(section);await tick();
  assert.ok(d.querySelector('#back i').classList.contains('i18n-direction-icon'));
  assert.equal(d.querySelector('#golden-mushaf-viewport i').classList.contains('i18n-direction-icon'),false);
  assert.equal(d.querySelector('[data-direction-fixed] i').classList.contains('i18n-direction-icon'),false);
  assert.equal(section.querySelector('.ask-zad-msg-bubble>div').dir,'auto');
  w.ZadI18n.set('ur');await tick();assert.equal(d.querySelector('#back i').classList.contains('fa-arrow-right'),true);
 }finally{dom.window.close();}
});

test('dynamic labels translate counts, favorite actions and city names without losing Arabic originals',async()=>{
 const dom=await setup('en');try{
  const w=dom.window,d=w.document,section=d.createElement('section');
  section.innerHTML='<span>· 3 خدمات</span><button aria-label="إضافة للمفضلة: المصحف">تبقى: 3</button><p>المدينة الحالية: القاهرة (مصر)</p><div class="dua-author-info">الدعاء</div>';
  d.body.append(section);await tick();
  assert.equal(section.querySelector('span').textContent,'· 3 services');
  assert.equal(section.querySelector('button').getAttribute('aria-label'),'Add to favorites: Mushaf');
  assert.equal(section.querySelector('button').textContent,'Remaining: 3');
  assert.equal(section.querySelector('p').textContent,'Current city: Cairo (Egypt)');
  assert.equal(section.querySelector('.dua-author-info').textContent,'الدعاء');
  assert.equal(w.ZadI18n.t('الجزء ١٢','en'),'Juz 12');assert.equal(w.ZadI18n.t('متبقي ٣ س و ٠ د','en'),'3h 0m remaining');
  w.ZadI18n.set('ur');await tick();assert.match(section.querySelector('button').getAttribute('aria-label'),/پسندیدہ/);
  w.ZadI18n.set('ar');await tick();assert.equal(section.querySelector('button').textContent,'تبقى: 3');assert.equal(section.querySelector('span').textContent,'· 3 خدمات');
 }finally{dom.window.close();}
});

test('native dialogs use the selected language and preserve confirmation results and prompt defaults',async()=>{
 const calls=[];const dom=await setup('en',w=>{
  w.confirm=message=>{calls.push(message);return false;};w.prompt=(message,value)=>{calls.push([message,value]);return 'نص كتبه المستخدم';};
 });try{
  const w=dom.window;
  assert.equal(w.confirm('حذف هذه الملفات المنزّلة؟ تقدّمك في القراءة سيظل محفوظًا.'),false);assert.match(calls[0],/^Delete these downloads/);
  assert.equal(w.prompt('اسمك الكريم...','Abdo'),'نص كتبه المستخدم');assert.deepEqual(calls[1],['Your name…','Abdo']);
  w.ZadI18n.set('ur');w.confirm('حذف هذه الملفات المنزّلة؟ تقدّمك في القراءة سيظل محفوظًا.');assert.match(calls[2],/ڈاؤن لوڈز/);
  w.ZadI18n.set('ar');w.confirm('هل تريد حذف النص؟');assert.equal(calls[3],'هل تريد حذف النص؟');
 }finally{dom.window.close();}
});

test('parser content is translated before a slow script permits DOMContentLoaded',async()=>{
 let release;const blocked=new Promise(resolve=>{release=resolve;});
 const scripts=['i18n-dictionary','i18n'].map(name=>'<script>'+fs.readFileSync(`assets/js/${name}.js`,'utf8')+'</script>').join('');
 const dom=new JSDOM('<!doctype html><html lang="ar" dir="rtl"><head>'+scripts+'<script>window.pendingAtHead=document.documentElement.classList.contains("zad-language-pending")</script></head><body><h1>الرئيسية</h1><button title="إغلاق">إغلاق</button><select data-language-select translate="no"><option value="ar">العربية</option><option value="en">English</option><option value="ur">اردو</option></select><script src="/slow.js"></script></body></html>',{
  url:'https://zad.test/',runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){w.localStorage.setItem('zad_language','en');},
  resources:{interceptors:[requestInterceptor(async()=>{await blocked;return new Response('window.slowLoaded=true',{headers:{'Content-Type':'application/javascript'}});})]}
 });
 try{
  const w=dom.window,d=w.document;await tick();
  assert.equal(w.pendingAtHead,true);assert.equal(d.readyState,'loading');
  assert.equal(d.querySelector('[data-language-select]').value,'en');
  assert.equal(d.querySelector('h1').textContent,'Home');assert.equal(d.querySelector('button').title,'Close');
  assert.equal(d.documentElement.classList.contains('zad-language-pending'),false);
  const beforePaint=await new Promise(resolve=>w.requestAnimationFrame(()=>resolve(d.querySelector('h1').textContent)));
  assert.equal(beforePaint,'Home');assert.equal(w.slowLoaded,undefined);
  release();await new Promise(resolve=>w.addEventListener('load',resolve,{once:true}));
  assert.equal(d.querySelector('h1').textContent,'Home');
 }finally{release();dom.window.close();}
});

test('back-forward restores the current preference before revealing the cached page',async()=>{
 const dom=await setup('ar');try{
  const w=dom.window,d=w.document;
  w.dispatchEvent(new w.PageTransitionEvent('pagehide',{persisted:true}));
  assert.equal(d.documentElement.classList.contains('zad-language-pending'),true);
  w.localStorage.setItem('zad_language','en');
  w.dispatchEvent(new w.PageTransitionEvent('pageshow',{persisted:true}));
  assert.equal(d.querySelector('h1').textContent,'Home');assert.equal(d.documentElement.dir,'ltr');
  assert.equal(d.documentElement.classList.contains('zad-language-pending'),false);
  w.localStorage.setItem('zad_language','ur');w.dispatchEvent(new w.PopStateEvent('popstate'));
  assert.equal(d.querySelector('h1').textContent,'ہوم');assert.equal(d.documentElement.dir,'rtl');
  w.localStorage.setItem('zad_language','ar');w.dispatchEvent(new w.PageTransitionEvent('pageshow',{persisted:true}));
  assert.equal(d.querySelector('h1').textContent,'الرئيسية');
 }finally{dom.window.close();}
});


test('English numbers, prayer periods and dynamic counts normalize both Arabic digit sets and restore originals',async()=>{
 const dom=await setup('en');try{
  const w=dom.window,d=w.document,section=d.createElement('section');
  section.innerHTML='<span id="count">١٬٢٣٤٫٥</span><p id="time">٠٥:٣٠ ص</p><p id="tasks">٣ من ١٠ مهام (٣٠%)</p><p id="page">سورة يس • صفحة ٥٦٢</p><button title="الآية ۱۲">۱۲</button><div class="azkar-text">ذكر ٣٣</div><div class="visitor-dua-text">دعائي ١٢</div>';
  d.body.append(section);await tick();
  assert.equal(section.querySelector('#count').textContent,'1,234.5');
  assert.equal(section.querySelector('#time').textContent,'05:30 AM');
  assert.equal(section.querySelector('#tasks').textContent,'3 of 10 tasks (30%)');
  assert.equal(section.querySelector('#page').textContent,'Surah Ya-Sin • page 562');
  assert.equal(section.querySelector('button').title,'Ayah 12');
  assert.equal(section.querySelector('button').textContent,'12');
  assert.equal(section.querySelector('.azkar-text').textContent,'ذكر ٣٣');
  assert.equal(section.querySelector('.visitor-dua-text').textContent,'دعائي ١٢');
  section.querySelector('#time').textContent='٠٦:٤٥ م';await tick();
  assert.equal(section.querySelector('#time').textContent,'06:45 PM');
  w.ZadI18n.set('ur');await tick();w.ZadI18n.set('ar');await tick();
  assert.equal(section.querySelector('#count').textContent,'١٬٢٣٤٫٥');
  assert.equal(section.querySelector('#time').textContent,'٠٦:٤٥ م');
  assert.equal(section.querySelector('#tasks').textContent,'٣ من ١٠ مهام (٣٠%)');
  assert.equal(section.querySelector('button').title,'الآية ۱۲');
 }finally{dom.window.close();}
});

test('every page header exposes a synchronized accessible language control',async()=>{
 for(const file of ['index.html','services.html','settings.html','privacy.html','embed.html','admin.html']){
  const dom=new JSDOM(fs.readFileSync(file,'utf8'),{url:'https://zad.test/'+file,runScripts:'outside-only'});
  try{
   const w=dom.window,d=w.document;w.localStorage.setItem('zad_language','ar');
   for(const name of ['i18n-dictionary','i18n'])w.eval(fs.readFileSync('assets/js/'+name+'.js','utf8'));
   if(file==='admin.html')d.getElementById('mock-preview-title').textContent='أذكار الصباح';
   const select=d.querySelector('header .zad-language-switch select,nav.admin-nav .zad-language-switch select');
   assert.ok(select,file);assert.equal(select.getAttribute('aria-label'),'لغة التطبيق');
   assert.deepEqual([...select.options].map(o=>o.value),['ar','en','ur']);
   select.value='en';select.dispatchEvent(new w.Event('change',{bubbles:true}));await tick();
   assert.equal(w.localStorage.getItem('zad_language'),'en');assert.equal(d.documentElement.dir,'ltr');
   assert.equal(select.getAttribute('aria-label'),'App language');
   assert.doesNotMatch(d.title,/[\u0600-\u06ff]/,file+' title');
   if(file==='admin.html')assert.equal(d.getElementById('mock-preview-title').textContent,'أذكار الصباح');
   for(const other of d.querySelectorAll('[data-language-select]'))assert.equal(other.value,'en');
   assert.equal(select.options[0].textContent,'العربية');assert.equal(select.options[2].textContent,'اردو');
   if(file==='services.html')assert.ok(d.querySelector('#serviceFocusHeader .zad-language-switch select'));
   select.value='ar';select.dispatchEvent(new w.Event('change',{bubbles:true}));await tick();
   assert.equal(d.documentElement.dir,'rtl');assert.equal(select.getAttribute('aria-label'),'لغة التطبيق');
  }finally{dom.window.close();}
 }
});
