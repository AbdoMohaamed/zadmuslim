(function(root){
 'use strict';
 const KEY='zad_language',supported=['ar','en','ur'],doc=root.document;
 const normalize=text=>text.replace(/\s+/g,' ').trim();
 const stored=()=>{try{return root.localStorage.getItem(KEY);}catch{return null;}};
 const detect=()=>{const value=(root.navigator.language||'ar').split('-')[0];return supported.includes(value)?value:'ar';};
 let language=supported.includes(stored())?stored():detect();
 const pendingClass='zad-language-pending';
 // Inline protection works before external stylesheets load, including restored
 // back/forward snapshots. No JavaScript means no class and no hidden content.
 const startupStyle=doc.createElement('style');
 startupStyle.textContent='html.zad-language-pending body{visibility:hidden!important}';
 doc.head.append(startupStyle);
 if(language!=='ar')doc.documentElement.classList.add(pendingClass);
 let startupTimeout=root.setTimeout(()=>doc.documentElement.classList.remove(pendingClass),3000);
 function ready(force=false){
  if(force||(root.ZadTranslations&&doc.body?.childElementCount)){
   root.clearTimeout(startupTimeout);doc.documentElement.classList.remove(pendingClass);
  }
 }
 const texts=new WeakMap(),attributes=new WeakMap();
 const sacred='.azkar-text,.azkar-virtue,.hadith-text,.hadith-explanation,.hadith-meaning,.hadith-lesson,.sadaqa-hadith-text,#wisdom-hadith-text,#wisdom-hadith-lesson,.reading-font-preview,.pg-prohibition-hadith,.pg-prohibition-explanation,.pg-card-intro,.pg-item-detail,.cat-dua-body,.cat-dua-source,.fasting-dua-text,.mood-dua-text,.mood-dua-note,.dua-text,.cemetery-dua-text,.prophetic-text,.ayah-verse-text,.memorize-ayah-text,.story-verse-box,.story-verse-preview,.ayah-sheet-text,#wisdom-ayah-text,.daily-verse-text,.quran-ayah-text,.tafsir-ayah-text';
 const originalQuotes='.golden-ayah-text,.hifz-verse-text,.pg-dua-arabic,.quick-dhikr-text,.challenge-quote-text,.prayer-main-text,.prayer-body,.verse-text';
 const skip='script,style,noscript,textarea,svg,canvas,[translate="no"],[data-i18n-skip],.ask-zad-msg-bubble>div:first-child,.dua-wall-text,.visitor-dua-text,.dua-author-info,.visitor-dua-name';
 // Textarea contents belong to the user; their placeholder and label are UI.
 const attributeSkip=skip.replace('textarea,','');
 const serviceQuoteMeanings=new WeakMap();
 const serviceQuoteMarkup='[data-service-quote],#islamic-guide em,#quick-dhikr-text,.mood-ayah-quote,.mood-dhikr-txt,.dua-hadith-pill';
 const serviceQuotes=sacred+',.pg-dua-arabic,.quick-dhikr-text,.challenge-quote-text,.prayer-main-text,.prayer-body,.verse-text,'+serviceQuoteMarkup;
 function renderServiceMeaning(element){
  const dictionary=root.ZadServiceMeanings;
  if(!dictionary||element.closest(skip))return;
  const source=root.ZadReadingSettings?.originalText?.(element)??element.textContent;
  const key=normalize(source).replace(/^["“«]\s*|\s*["”»]$/g,'');
  const meaning=language==='ar'?null:(dictionary[key]||root.ZadTranslations?.[key])?.[language];
  let translation=serviceQuoteMeanings.get(element);
  element.toggleAttribute('data-zad-translated-quote',Boolean(meaning));
  if(!meaning){translation?.remove();return;}
  if(!translation){
   translation=doc.createElement('span');
   translation.className='zad-service-meaning';
   translation.setAttribute('data-i18n-skip','');
   serviceQuoteMeanings.set(element,translation);
  }
  translation.lang=language;
  translation.dir=language==='en'?'ltr':'rtl';
  const displayed=language==='en'?englishHonorifics(meaning):meaning;
  if(translation.textContent!==displayed)translation.textContent=displayed;
  if(element.nextElementSibling!==translation)element.after(translation);
 }
 function surahName(name,lang){
  if(lang==='ar')return name;
  const range=name.split(/\s+-\s+/);if(range.length>1)return range.map(part=>surahName(part,lang)).join(' – ');
  const names={الجمعة:{en:'Al-Jumuah',ur:'الجمعہ'},الفجر:{en:'Al-Fajr',ur:'الفجر'},العصر:{en:'Al-Asr',ur:'العصر'}};
  return names[normalize(name)]?.[lang]||t(name,lang);
 }
 const templates=[
  [/^(المسافة: )?(\d+(?:\.\d+)?) (متر|كم)$/, (prefix,n,unit)=>[
   `${prefix?'Distance: ':''}${n} ${unit==='متر'?'m':'km'}`,
   `${prefix?'فاصلہ: ':''}${n} ${unit==='متر'?'میٹر':'کلومیٹر'}`
  ]],
  [/^دعاء لـ (.+)$/,name=>[`A dua for ${name}`,`${name} کے لیے دعا`]],
  [/^أسماء (جلال|رحمة|قدرة|علم|رزق|مغفرة|حكمة)$/,category=>[`Names of ${t(category,'en').toLowerCase()}`,`${t(category,'ur')} کے نام`]],
  [/^تم العثور على (\d+) اسم مطابق لـ "(.+)"$/, (count,query)=>[`Found ${count} matching names for "${query}"`,`"${query}" سے ملتے جلتے ${count} نام ملے`]],
  [/^عرض أسماء (.+) \((\d+) اسماً\)$/, (category,count)=>[`Showing ${count} names of ${t(category,'en').toLowerCase()}`,`${t(category,'ur')} کے ${count} نام دکھائے جا رہے ہیں`]],
  [/^حَانَ الآنَ مَوْعِدُ (.+)$/,name=>[`It is time for ${t(name,'en')}`,`اب وقت ہے: ${t(name,'ur')}`]],
  [/^موعد الأذان: (\d{1,2}:\d{2} [صم])(?: \((متبقي .+)\))?$/, (time,left)=>[`Adhan: ${t(time,'en')}${left?' ('+t(left,'en')+')':''}`,`اذان: ${t(time,'ur')}${left?' ('+t(left,'ur')+')':''}`]],
  [/^متبقي (\d+) د$/,n=>[`${n} min remaining`,`${n} منٹ باقی`]],
  [/^تمت الجدولة في الهاتف؛ الأذان حتى (.+)\. افتح التطبيق لتجديد المواعيد قبل انتهاء المدة\.$/,date=>[`Scheduled on your phone. Adhan reminders are set through ${date}. Open the app before then to renew them.`,`فون میں اوقات مقرر ہو گئے۔ اذان کی یاد دہانیاں ${date} تک مقرر ہیں۔ تجدید کے لیے اس سے پہلے ایپ کھولیں۔`]],
  [/^تمت جدولة (?:إشعار )?(التنبيه المسبق الناطق|التنبيه المسبق|الأذان الكامل|الأذان)(?: في نظام الهاتف| بنجاح) بعد (\d+) ثانية \((.+)\)\..+📱(?:✨)?$/, (kind,n,time)=>{
   const pre=kind.startsWith('التنبيه');
   return [`${pre?'Pre-prayer reminder':'Adhan'} scheduled in ${n} seconds (${t(time,'en')}). Lock your phone to test it. 📱`,`${pre?'نماز سے پہلے یاد دہانی':'اذان'} ${n} سیکنڈ بعد (${t(time,'ur')}) مقرر ہے۔ آزمائش کے لیے فون مقفل کریں۔ 📱`];
  }],
  [/^سورة (.+) [-–] آية (\d+)$/, (name,n)=>[`Surah ${surahName(name,'en')} – Ayah ${n}`,`سورۃ ${surahName(name,'ur')} – آیت ${n}`]],
  [/^المال أقل من النصاب الشرعي \((.+)\)، فلا زكاة واجبة فيه شرعاً، وتُستحب الصدقة\.$/,amount=>[`Your wealth is below the nisab (${t(amount,'en')}). Zakat is not due; voluntary charity is encouraged.`,`آپ کا مال نصاب (${t(amount,'ur')}) سے کم ہے۔ زکوٰۃ واجب نہیں؛ نفلی صدقہ مستحب ہے۔`]],
  [/^منذ (\d+) (دقيقة|دقائق|ساعة|ساعات|يوم|أيام)$/, (n,unit)=>{
   const [en,ur]=/دقيق/.test(unit)?['minute','منٹ']:/ساع/.test(unit)?['hour','گھنٹے']:['day','دن'];
   return [`${n} ${en}${n==='1'?'':'s'} ago`,`${n} ${ur} پہلے`];
  }],
  [/^(.+) — مشغّل بديل$/,label=>[`${t(label,'en')} — alternative player`,`${t(label,'ur')} — متبادل پلیئر`]],
  [/^تعذّر تشغيل البث على مشغّل أندرويد \((.+)\)$/,code=>[`Android stream playback failed (${code})`,`اینڈرائیڈ پر نشریات نہیں چل سکیں (${code})`]],
  [/^(\d+) تلاوة · (.+)$/, (n,size)=>[`${n} saved recitations · ${t(size,'en')}`,`${n} محفوظ تلاوتیں · ${t(size,'ur')}`]],
  [/^(.+) · ([\d.,]+) م\.ب$/, (label,size)=>[`${t(label,'en')} · ${size} MB`,`${t(label,'ur')} · ${size} ایم بی`]],
  [/^تشغيل (.+)$/,title=>[`Play: ${t(title,'en')}`,`چلائیں: ${t(title,'ur')}`]],
  [/^اضغط لعرض تفاصيل اسم الله \((.+)\)$/,name=>[`View details for Allah's name: ${t(name,'en')}`,`اللہ کے نام ${t(name,'ur')} کی تفصیل دیکھیں`]],
  [/^مثال: (.+)$/,example=>[`Example: ${t(example,'en')}`,`مثال: ${t(example,'ur')}`]],
  [/^([\d.,]+[MK]?) مشاهدة$/,n=>[`${n} views`,`${n} ملاحظات`]],
  [/^تمت جدولة اختبار (التنبيه المسبق|الأذان) بعد (\d+) ثانية بنجاح$/, (kind,n)=>[`${kind==='الأذان'?'Adhan':'Pre-prayer'} test scheduled in ${n} seconds`,`${kind==='الأذان'?'اذان':'نماز سے پہلے اطلاع'} کی آزمائش ${n} سیکنڈ بعد مقرر کر دی گئی`]],
  [/^🕌 (?:حَانَ الآنَ مَوْعِدُ|حان الآن موعد) (.+)$/,name=>[`🕌 It is time for ${t(name,'en')}`,`🕌 اب وقت ہے: ${t(name,'ur')}`]],
  [/^⏳ اقتربت (.+)$/,name=>[`⏳ Coming up: ${t(name,'en')}`,`⏳ وقت قریب ہے: ${t(name,'ur')}`]],
  [/^بقي (\d+) دقائق على دخول وقت (.+)\. تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿$/, (n,name)=>[`${n} minutes until ${t(name,'en')}. Prepare for wudu and prayer 🌿`,`${t(name,'ur')} میں ${n} منٹ باقی ہیں۔ وضو اور نماز کی تیاری کریں 🌿`]],
  [/^الله أكبر، الله أكبر\.\. حان الآن موعد (.+) حسب (?:توقيتك المحلي|التوقيت المحلي)\. حيّ على الصلاة، حيّ على الفلاح ([🕋🌿]+)$/u,(name,icon)=>[`Allah is the Greatest, Allah is the Greatest. It is time for ${t(name,'en')} locally. Come to prayer, come to success. ${icon}`,`اللہ سب سے بڑا ہے، اللہ سب سے بڑا ہے۔ مقامی وقت کے مطابق ${t(name,'ur')} کا وقت ہو گیا۔ نماز کی طرف آؤ، کامیابی کی طرف آؤ۔ ${icon}`]],
  [/^اليوم (\d+) من الشهر الهجري \(الأيام البيض\)$/,(day)=>[`Hijri day ${day} (White Days)`,`ہجری مہینے کا دن ${day} (ایام بیض)`]],
  [/^حذف (.+) من تنزيلات الجهاز؟$/,name=>[`Delete ${t(name,'en')} from this device's downloads?`,`اس آلے کے ڈاؤن لوڈز سے ${t(name,'ur')} حذف کریں؟`]],
  [/^حجم التنزيل: (.+)$/,size=>[`Download size: ${t(size,'en')}`,`ڈاؤن لوڈ کا حجم: ${t(size,'ur')}`]],
  [/^جاري التنزيل: (\d+) \/ (\d+) — يمكنك إيقافه واستكماله لاحقًا\.$/, (n,total)=>[`Downloading: ${n} / ${total} — you can stop and resume later.`,`ڈاؤن لوڈ جاری: ${n} / ${total} — آپ روک کر بعد میں جاری کر سکتے ہیں۔`]],
  [/^جاري التنزيل: (.+)$/,value=>[`Downloading: ${value.replace(/م\.ب/g,'MB')}`,`ڈاؤن لوڈ جاری: ${value.replace(/م\.ب/g,'ایم بی')}`]],
  [/^(.+): (\d+) ملف — ([\d.]+) م\.ب$/, (name,n,size)=>[`${t(name,'en')}: ${n} files — ${size} MB`,`${t(name,'ur')}: ${n} فائلیں — ${size} ایم بی`]],
  [/^تلاوة السورة (\d+)$/,n=>[`Surah ${n} recitation`,`سورۃ ${n} کی تلاوت`]],
  [/^(تعذّر تجهيز النسخة الاحتياطية:|تعذّر الاسترجاع:|بيانات غير صالحة في النسخة:) (.+)$/, (prefix,reason)=>[`${t(prefix,'en')} ${t(reason,'en')}`,`${t(prefix,'ur')} ${t(reason,'ur')}`]],
  [/^نتائج محفوظة للموقع المعروض بتاريخ (.+)\. معروضة من تخزين الجهاز\.( نتائج بديلة محدودة\.)? استخدم زر التحديث عند الحاجة\.$/, (date,partial)=>[`Saved results for this location from ${date}. Displayed from device storage.${partial?' Limited fallback results.':''} Refresh when needed.`,`اس مقام کے ${date} کے محفوظ نتائج۔ آلے کے ذخیرے سے دکھائے گئے ہیں۔${partial?' محدود متبادل نتائج۔':''} ضرورت پر تازہ کریں۔`]],
  [/^(.+) عليه السلام$/,name=>[`${t(name,'en')} (peace be upon him)`,`${t(name,'ur')} علیہ السلام`]],
  [/^(.+) رضي الله عنه$/,name=>[`${t(name,'en')} (may Allah be pleased with him)`,`${t(name,'ur')} رضی اللہ عنہ`]],
  [/^(\d+) (سنوات|سنة)$/,n=>[`${n} years`,`${n} سال`]],
  [/^(\d+) (?:ركعات|ركعة)$/,n=>[`${n} rakahs`,`${n} رکعتیں`]],
  [/^(\d+) (محرم|محرّم|صفر|ربيع الأول|ربيع الآخر|جمادى الأولى|جمادى الآخرة|رجب|شعبان|رمضان|شوال|شوّال|ذو القعدة|ذو الحجة)(?: المبارك)?$/, (n,name)=>[`${n} ${t(name,'en')}`,`${n} ${t(name,'ur')}`]],
  [/^سورة (.+): (.+)$/, (name,verse)=>[`Surah ${surahName(name,'en')}: ${verse}`,`سورۃ ${surahName(name,'ur')}: ${verse}`]],
  [/^(.+) (\d+) (.+) (\d+) (هـ|م)$/, (day,n,month,year,era)=>[`${t(day,'en')}, ${n} ${t(month,'en')} ${year} ${era==='هـ'?'AH':'CE'}`,`${t(day,'ur')}، ${n} ${t(month,'ur')} ${year} ${era==='هـ'?'ھ':'ء'}`]],
  [/^(\d+) (.+) (\d+)$/, (n,month,year)=>[`${n} ${t(month,'en')} ${year}`,`${n} ${t(month,'ur')} ${year}`]],
  [/^انقضاء شهر (.+):$/,month=>[`${t(month,'en')} progress:`,`ماہ ${t(month,'ur')} کی پیش رفت:`]],
  [/^صيام (الخميس|الإثنين) القادم \(بعد (\d+) أيام\) 🌿$/, (day,n)=>[`Next ${day==='الخميس'?'Thursday':'Monday'} fast (in ${n} days) 🌿`,`اگلا ${day==='الخميس'?'جمعرات':'پیر'} کا روزہ (${n} دن بعد) 🌿`]],
  [/^اليوم: (\d+) زيارة$/,n=>[`Today: ${n} visits`,`آج: ${n} ملاحظات`]],
  [/^(\d+)% \((\d+) زيارة\)$/, (pct,n)=>[`${pct}% (${n} visits)`,`${pct}% (${n} ملاحظات)`]],
  [/^(\d+)(\s*[.·]\s*)(.+)$/, (n,separator,name)=>[n+separator+surahName(name,'en'),n+separator+surahName(name,'ur')]],
  [/^الصفحات: (\d+) - (\d+)$/, (a,b)=>[`Pages: ${a} – ${b}`,`صفحات: ${a} – ${b}`]],
  [/^يبدأ من: سورة (.+) (\d+)(.*)$/, (name,n,note)=>[`Starts at: Surah ${surahName(name,'en')} ${n}${note?` (${t(note.replace(/[()]/g,'').trim(),'en')})`:''}`,`آغاز: سورۃ ${surahName(name,'ur')} ${n}${note?` (${t(note.replace(/[()]/g,'').trim(),'ur')})`:''}`]],
  [/^(\d+) مرات$/,n=>[n==='1'?'1 time':`${n} times`,`${n} مرتبہ`]],
  [/^(.+) - (.+)$/, (a,b)=>[`${t(a,'en')} – ${t(b,'en')}`,`${t(a,'ur')} – ${t(b,'ur')}`]],
  [/^الهدف للترقية إلى «(.+)»:$/,name=>[`Next level target: ${t(name,'en')}:`,`اگلے درجے کا ہدف: ${t(name,'ur')}:`]],
  [/^السؤال (\d+) من (\d+)$/, (n,total)=>[`Question ${n} of ${total}`,`سوال ${n} از ${total}`]],
  [/^النقاط: (\d+)$/,n=>[`Score: ${n}`,`اسکور: ${n}`]],
  [/^عرض الأوسمة \((\d+) \/ (\d+)\)$/, (n,total)=>[`View badges (${n} / ${total})`,`اعزازات دیکھیں (${n} / ${total})`]],
  [/^📖 ورد اليوم \(اليوم (\d+) من (\d+)\)$/, (n,total)=>[`📖 Today's reading (day ${n} of ${total})`,`📖 آج کی تلاوت (دن ${n} از ${total})`]],
  [/^خطة الـ (\d+) يوماً • (\d+) صفحات بعد كل صلاة$/, (days,pages)=>[`${days}-day plan • ${pages} pages after each prayer`,`${days} دن کا منصوبہ • ہر نماز کے بعد ${pages} صفحات`]],
  [/^المطلوب: (\d+) صفحات فقط بعد كل صلاة من الصلوات الخمس$/,n=>[`Read ${n} pages after each of the five daily prayers`,`پانچوں نمازوں میں سے ہر نماز کے بعد ${n} صفحات پڑھیں`]],
  [/^\((.+)\) إلى صفحة$/,name=>[`(${t(name,'en')}) to page`,`(${t(name,'ur')}) تا صفحہ`]],
  [/^\((.+)\)$/,name=>[`(${t(name,'en')})`,`(${t(name,'ur')})`]],
  [/^المؤذن: (.+)$/,name=>[`Muazzin: ${t(name,'en')}`,`مؤذن: ${t(name,'ur')}`]],
  [/^([\d, .]+) ر\.س$/,n=>[`SAR ${n}`,`${n} سعودی ریال`]],
  [/^(مكية|مدنية) • (\d+) آية$/, (place,n)=>[(place==='مكية'?'Meccan':'Medinan')+' • '+n+' ayahs',(place==='مكية'?'مکی':'مدنی')+' • '+n+' آیات']],
  [/^(الجزء|الحزب) (\d+) - (\d+)$/, (kind,a,b)=>[(kind==='الجزء'?'Juz':'Hizb')+' '+a+' – '+b,(kind==='الجزء'?'پارہ':'حزب')+' '+a+' – '+b]],
  [/^التفسير الميسر • صفحة (\d+)$/,n=>['Simplified tafsir • page '+n,'آسان تفسیر • صفحہ '+n]],
  [/^تكرار مستمر \(المرة (\d+)\) 🔁$/,n=>['Continuous repeat (round '+n+') 🔁','مسلسل تکرار (بار '+n+') 🔁']],
  [/^(\d+)° من الشمال$/,n=>[n+'° from north',n+'° شمال سے']],
  [/^(\d{1,2}:\d{2}(?::\d{2})?)\s*(ص|م)$/, (time,period)=>[time+' '+(period==='ص'?'AM':'PM'),time+' '+(period==='ص'?'صبح':'شام')]],
  [/^صفحة ([\d.]+)$/,n=>['Page '+n,'صفحہ '+n]],
  [/^الآية (\d+)$/,n=>['Ayah '+n,'آیت '+n]],
  [/^سورة (.+) • (صفحة|آية) (\d+)$/, (name,kind,n)=>['Surah '+surahName(name,'en')+' • '+(kind==='صفحة'?'page':'ayah')+' '+n,'سورۃ '+surahName(name,'ur')+' • '+(kind==='صفحة'?'صفحہ':'آیت')+' '+n]],
  [/^سورة (.+)$/, name=>['Surah '+surahName(name,'en'),'سورۃ '+surahName(name,'ur')]],
  [/^([\d.,]+) م\.ب$/,n=>[n+' MB',n+' ایم بی']],
  [/^([\d.,]+) كم$/,n=>[n+' km',n+' کلومیٹر']],
  [/^(\d+) (?:خدمة|خدمات)$/,n=>[`${n} ${n==='1'?'service':'services'}`,`${n} ${n==='1'?'خدمت':'خدمات'}`]],
  [/^نتائج البحث: (\d+) خدمة$/,n=>[`Search results: ${n} ${n==='1'?'service':'services'}`,`تلاش کے نتائج: ${n} ${n==='1'?'خدمت':'خدمات'}`]],
  [/^الخدمات المتاحة: (\d+)$/,n=>[`Available services: ${n}`,`دستیاب خدمات: ${n}`]],
  [/^(\d+) من (\d+) مهام \((\d+)%\)$/, (n,total,pct)=>[`${n} of ${total} tasks (${pct}%)`,`${total} میں سے ${n} کام (${pct}%)`]],
  [/^آخر موضع محفوظ في المصحف — صفحة (\d+)$/,n=>[`Last saved Mushaf position — page ${n}`,`مصحف کا آخری محفوظ مقام — صفحہ ${n}`]],
  [/^(\d+) ملف محفوظ على الجهاز$/,n=>[`${n} files saved on this device`,`${n} فائلیں آلے پر محفوظ ہیں`]],
  [/^(\d+) صفحة منزّلة$/,n=>[`${n} downloaded pages`,`${n} ڈاؤن لوڈ شدہ صفحات`]]
  ,[/^تبقى: (\d+)$/,n=>[`Remaining: ${n}`,`باقی: ${n}`]]
  ,[/^الهدف: (\d+)$/,n=>[`Goal: ${n}`,`ہدف: ${n}`]]
  ,[/^الجزء ([\d٠-٩۰-۹]+)$/,n=>[`Juz ${latinDigits(n)}`,`پارہ ${n}`]]
  ,[/^الحزب ([\d٠-٩۰-۹]+)$/,n=>[`Hizb ${latinDigits(n)}`,`حزب ${n}`]]
  ,[/^رقم (\d+)$/,n=>[`No. ${n}`,`نمبر ${n}`]]
  ,[/^(\d+) كم$/,n=>[`${n} km`,`${n} کلومیٹر`]]
  ,[/^التكرار: (\d+) من (\d+)$/,(n,total)=>[`Repeat: ${n} of ${total}`,`تکرار: ${total} میں سے ${n}`]]
  ,[/^متبقي ([\d٠-٩۰-۹]+) س و ([\d٠-٩۰-۹]+) د$/,(h,m)=>[`${latinDigits(h)}h ${latinDigits(m)}m remaining`,`باقی: ${h} گھنٹے ${m} منٹ`]]
  ,[/^استرجاع (\d+) إعداد وسجل؟ ستُستبدل القيم المطابقة ثم يُعاد فتح التطبيق\.$/,n=>[`Restore ${n} settings and records? Matching values will be replaced and the app will reopen.`,`${n} ترتیبات اور ریکارڈ بحال کریں؟ متعلقہ اقدار بدل جائیں گی اور ایپ دوبارہ کھلے گی۔`]]
  ,[/^إضافة للمفضلة: (.+)$/,name=>[`Add to favorites: ${t(name,'en')}`,`پسندیدہ میں شامل کریں: ${t(name,'ur')}`]]
  ,[/^إزالة من المفضلة: (.+)$/,name=>[`Remove from favorites: ${t(name,'en')}`,`پسندیدہ سے ہٹائیں: ${t(name,'ur')}`]]
  ,[/^المدينة الحالية: (.+)$/,name=>[`Current city: ${t(name,'en')}`,`موجودہ شہر: ${t(name,'ur')}`]]
  ,[/^صلاة (الفجر|الظهر|العصر|المغرب|العشاء)$/,name=>[`${t(name,'en')} prayer`,`${t(name,'ur')} کی نماز`]]
  ,[/^زاد المسلم © (\d{4}) • نسأل الله القبول(?: والإخلاص)?$/,year=>[`Zad Al Muslim © ${year} • May Allah accept this work`,`زاد المسلم © ${year} • اللہ یہ کام قبول فرمائے`]]
  ,[/^منصة وتطبيق زاد المسلم • صدقة جارية لوجه الله تعالى • الإصدار ([\d.]+)$/,version=>[`Zad Al Muslim • An ongoing charity for Allah’s sake • Version ${version}`,`زاد المسلم • اللہ کے لیے صدقہ جاریہ • ورژن ${version}`]]
 ];
 const latinDigits=value=>value.replace(/[٠-٩۰-۹]/g,char=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(char)>=0?'٠١٢٣٤٥٦٧٨٩'.indexOf(char):'۰۱۲۳۴۵۶۷۸۹'.indexOf(char)));
 const englishHonorifics=value=>value.replace(/\s*ﷺ/g,' (peace be upon him)');
 function t(text,lang=language){
  if(lang==='ar')return text;
  const source=normalize(text),key=latinDigits(source),entry=root.ZadTranslations?.[source]||root.ZadTranslations?.[key]||root.ZadTranslations?.[key.replace(/[–—]/g,'-')];
  const digits=value=>lang==='en'?latinDigits(root.ZadServiceMeanings?englishHonorifics(value):value).replace(/([0-9])[٫]/g,'$1.').replace(/([0-9])[٬]/g,'$1,').replace(/٪/g,'%'):value;
  if(entry?.[lang])return digits(entry[lang]);
  const prefix=key.match(/^([·✦]\s*)(.+)$/);if(prefix){const value=t(prefix[2],lang);if(value!==prefix[2])return prefix[1]+value;}
  for(const [pattern,format] of templates){const match=key.match(pattern);if(match)return digits(format(...match.slice(1))[lang==='en'?0:1]);}
  return digits(text);
 }
 function original(node){
  if(node.nodeType===3){const saved=texts.get(node);return saved&&node.data===saved.rendered?saved.original:node.data;}
  return Array.from(node.childNodes||[],original).join('');
 }
 function renderText(node){
  const parent=node.parentElement;if(!parent||parent.closest(skip))return;
  const quote=root.ZadServiceMeanings&&parent.closest(serviceQuotes);
  if(quote)renderServiceMeaning(quote);
  if(parent.closest(sacred+','+originalQuotes+','+serviceQuoteMarkup))return;
  const previous=texts.get(node),source=previous&&node.data===previous.rendered?previous.original:node.data;
  const key=normalize(source);if(!key)return;
  const translated=parent.closest('#golden-surah-title')?surahName(key,language):parent.matches('option[value="naskh"]')?(language==='en'?'Naskh':language==='ur'?'نسخ':key):t(key);
  const rendered=translated===key?source:source.match(/^\s*/)[0]+translated+source.match(/\s*$/)[0];
  texts.set(node,{original:source,rendered});if(node.data!==rendered)node.data=rendered;
 }
 function renderElement(element){
  // Parser-created selects can arrive before their options. Reconcile when
  // each option appears as well as when the control itself is scanned.
  const languageSelect=element.matches('[data-language-select]')?element:element.matches('option')?element.closest('[data-language-select]'):null;
  if(languageSelect&&languageSelect.value!==language)languageSelect.value=language;
  if(element.matches('.fa-arrow-left,.fa-arrow-right,.fa-chevron-left,.fa-chevron-right,.fa-angle-left,.fa-angle-right,.fa-angles-left,.fa-angles-right')){
   element.classList.toggle('i18n-direction-icon',!element.closest('[data-direction-fixed],#golden-mushaf-viewport,.compass-container,.qibla-compass,.media-player-controls'));
  }
  if(element.matches('#ask-zad-input,input[type="search"],input[inputmode="search"]'))element.dir=language==='en'?'ltr':'rtl';
  else if(element.matches('textarea,input:not([type]),input[type="text"]')&&!element.hasAttribute('dir'))element.dir='auto';
  if(element.matches('input[type="email"],input[type="url"],input[type="tel"],input[type="number"],input[type="date"],input[type="time"],input[type="range"],input[inputmode="numeric"],input[inputmode="decimal"]'))element.dir='ltr';
  if(element.matches('.ask-zad-msg-bubble>div:first-child'))element.dir='auto';
  // Untranslated Arabic paragraphs and mixed-language notes retain their own text flow
  // without reversing the surrounding English card, toolbar or form.
  if(element.matches('p,h1,h2,h3,h4,h5,h6,blockquote,option,.category-desc,.category-result-count,.radio-station-name,.radio-station-desc,.radio-item-name,.radio-item-desc,.golden-player-title,.golden-index-name,.golden-index-meta,.offline-audio-status')&&!element.hasAttribute('dir'))element.dir='auto';
  if(element.matches(sacred+','+originalQuotes+','+serviceQuoteMarkup)){
   element.lang='ar';element.dir='rtl';
   if(element.matches(serviceQuotes))renderServiceMeaning(element);
   return;
  }
  if(element.closest(attributeSkip+','+sacred+','+originalQuotes))return;
  const saved=attributes.get(element)||{};
  for(const name of ['title','aria-label','placeholder','alt']){
   const value=element.getAttribute(name);if(value===null)continue;
   const previous=saved[name],source=previous&&value===previous.rendered?previous.original:value,rendered=t(source);
   saved[name]={original:source,rendered};if(value!==rendered)element.setAttribute(name,rendered);
  }
  attributes.set(element,saved);
 }
 function scan(node){
  if(node.nodeType===3){renderText(node);return;}
  if(node.nodeType!==1&&node.nodeType!==9)return;
  if(node.nodeType===1)renderElement(node);
  const walker=doc.createTreeWalker(node,root.NodeFilter.SHOW_ELEMENT|root.NodeFilter.SHOW_TEXT);let child;
  while((child=walker.nextNode())){if(child.nodeType===3)renderText(child);else renderElement(child);}
 }
 function updateLanguageDropdownUI(lang){
  const badgeText={ar:'ع',en:'EN',ur:'اردو'}[lang]||'ع';
  doc.querySelectorAll('.zad-language-switch').forEach(sw=>{
   let badge=sw.querySelector('.zad-lang-badge');
   if(!badge){
    badge=doc.createElement('span');badge.className='zad-lang-badge';badge.setAttribute('aria-hidden','true');badge.setAttribute('translate','no');
    sw.append(badge);
   }
   badge.textContent=badgeText;
   sw.querySelectorAll('.zad-lang-item').forEach(btn=>{
    const isActive=btn.dataset.lang===lang;
    btn.classList.toggle('active',isActive);
    btn.setAttribute('aria-selected',String(isActive));
   });
  });
 }
 function positionDropdown(sw,menu){
  if(menu.hidden)return;
  menu.classList.remove('open-upward','align-start','align-end');
  menu.style.removeProperty('--zad-drop-shift-x');
  menu.style.left='';
  menu.style.right='';
  menu.style.transform='';
  const swRect=sw.getBoundingClientRect();
  const viewportWidth=doc.documentElement.clientWidth||root.innerWidth||360;
  const viewportHeight=doc.documentElement.clientHeight||root.innerHeight||640;
  const padding=10;

  // Natural anchoring based on where the switch sits on screen:
  // If the switch center is in the left half, anchor to the left (opens toward center).
  // Otherwise anchor to the right (opens toward center).
  const swCenter=swRect.left+(swRect.width/2);
  const isLeftHalf=swCenter<(viewportWidth/2);
  if(isLeftHalf){
   menu.style.left='0px';
   menu.style.right='auto';
   menu.classList.add('align-start');
  }else{
   menu.style.left='auto';
   menu.style.right='0px';
   menu.classList.add('align-end');
  }

  const menuRect=menu.getBoundingClientRect();
  if(!menuRect.width&&!menuRect.height)return;

  let shiftX=0;
  if(menuRect.left<padding){
   shiftX=Math.round(padding-menuRect.left);
  }else if(menuRect.right>viewportWidth-padding){
   shiftX=Math.round((viewportWidth-padding)-menuRect.right);
  }
  if(shiftX!==0){
   menu.style.setProperty('--zad-drop-shift-x',shiftX+'px');
   menu.style.transform='translate3d('+shiftX+'px,0,0)';
  }
  if(menuRect.bottom>viewportHeight-padding&&swRect.top>menuRect.height+padding){
   menu.classList.add('open-upward');
  }
 }
 function closeAllDropdowns(){
  doc.querySelectorAll('.zad-language-dropdown').forEach(m=>{
   m.hidden=true;
   m.parentElement?.classList.remove('is-open');
   m.style.removeProperty('--zad-drop-shift-x');
   m.style.transform='';
  });
 }
 function setupLanguageDropdowns(){
  doc.querySelectorAll('.zad-language-switch').forEach(sw=>{
   if(sw.querySelector('.zad-language-dropdown'))return;
   const badgeText={ar:'ع',en:'EN',ur:'اردو'}[language]||'ع';
   let badge=sw.querySelector('.zad-lang-badge');
   if(!badge){
    badge=doc.createElement('span');badge.className='zad-lang-badge';badge.setAttribute('aria-hidden','true');badge.setAttribute('translate','no');
    badge.textContent=badgeText;
    sw.append(badge);
   }
   const menu=doc.createElement('div');
   menu.className='zad-language-dropdown';
   menu.setAttribute('role','listbox');
   menu.setAttribute('translate','no');
   menu.hidden=true;
   const options=[
    {code:'ar',name:'العربية',flag:'🇸🇦'},
    {code:'en',name:'English',flag:'🇬🇧'},
    {code:'ur',name:'اردو',flag:'🇵🇰'}
   ];
   options.forEach(opt=>{
    const btn=doc.createElement('button');
    btn.type='button';
    btn.className='zad-lang-item'+(opt.code===language?' active':'');
    btn.dataset.lang=opt.code;
    btn.setAttribute('role','option');
    btn.setAttribute('aria-selected',String(opt.code===language));
    btn.innerHTML='<span class="zad-lang-label"><span class="zad-lang-flag">'+opt.flag+'</span><span class="zad-lang-name">'+opt.name+'</span></span><i class="fa-solid fa-check zad-lang-check" aria-hidden="true"></i>';
    btn.addEventListener('click',e=>{
     e.stopPropagation();e.preventDefault();
     const select=sw.querySelector('select[data-language-select]');
     if(select){
      select.value=opt.code;
      select.dispatchEvent(new root.Event('change',{bubbles:true}));
     }else{
      set(opt.code);
     }
     closeAllDropdowns();
    });
    menu.append(btn);
   });
   sw.append(menu);
   sw.addEventListener('click',e=>{
    if(e.target.closest('.zad-language-dropdown'))return;
    e.preventDefault();
    const isOpen=!menu.hidden;
    closeAllDropdowns();
    menu.hidden=isOpen;
    sw.classList.toggle('is-open',!isOpen);
    if(!menu.hidden){
     positionDropdown(sw,menu);
    }
   });
  });
 }
 function apply(){
  doc.documentElement.lang=language;doc.documentElement.dir=language==='en'?'ltr':'rtl';
  doc.querySelectorAll('[data-language-select]').forEach(select=>{select.value=language;});
  scan(doc.documentElement);
  updateLanguageDropdownUI(language);
  ready();
 }
 function set(value,persist=true){
  if(!supported.includes(value))return false;
  language=value;if(persist)try{root.localStorage.setItem(KEY,value);}catch{}
  apply();root.dispatchEvent(new root.CustomEvent('zad:language-change',{detail:{language}}));return true;
 }
 root.ZadI18n={get language(){return language;},set,t,originalText:original,refresh:apply,locale:()=>({ar:'ar-EG',en:'en',ur:'ur-PK'})[language]};
 // Native browser dialogs sit outside the DOM observer. Translate only known UI
 // messages, preserving dialog return values and the user's prompt input.
 for(const name of ['alert','confirm','prompt']){
  const native=root[name];if(typeof native==='function')root[name]=function(message,...args){return native.call(this,t(String(message)),...args);};
 }
 // Set direction and translate parser mutations before the first paint. Waiting
 // for DOMContentLoaded lets slow third-party scripts expose the Arabic source.
 doc.documentElement.lang=language;doc.documentElement.dir=language==='en'?'ltr':'rtl';
 function init(){
  doc.addEventListener('change',event=>{if(event.target.matches?.('[data-language-select]'))set(event.target.value);});
  apply();
  setupLanguageDropdowns();
  doc.addEventListener('click',e=>{
   if(!e.target.closest('.zad-language-switch')){
    closeAllDropdowns();
   }
  });
  doc.addEventListener('pointerdown',e=>{
   if(!e.target.closest('.zad-language-switch')){
    closeAllDropdowns();
   }
  });
  if(root.addEventListener){
   root.addEventListener('resize',closeAllDropdowns,{passive:true});
   root.addEventListener('orientationchange',closeAllDropdowns,{passive:true});
  }
  doc.addEventListener('keydown',e=>{
   if(e.key==='Escape'){
    closeAllDropdowns();
   }
  });
  const observer=new root.MutationObserver(records=>{
   const changed=new Set();for(const record of records){
    if(record.type==='childList'){
     record.addedNodes.forEach(node=>changed.add(node));
     if(root.ZadServiceMeanings){
      const quote=record.target.closest?.(serviceQuotes);
      if(quote)changed.add(quote);
     }
    }else changed.add(record.target);
   }
   // Parsing adds parents and their descendants in the same batch. Scan each
   // subtree once rather than repeatedly translating the whole growing page.
   const branches=[...changed].filter(node=>{
    if(!node.isConnected)return false;
    for(let parent=node.parentNode;parent;parent=parent.parentNode)if(changed.has(parent))return false;
    return true;
   });
   // Disconnect for our own writes: prevents retranslation loops and preserves Arabic originals.
   observer.disconnect();try{branches.forEach(scan);ready();}finally{observe();}
  });
  function observe(){observer.observe(doc.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt']});}
  observe();
  function sync(event){
   try{
    const current=supported.includes(stored())?stored():detect();
    if(current!==language)set(current,false);
    else if(event?.persisted||event?.type==='popstate')apply();
    setupLanguageDropdowns();
   }finally{ready(doc.readyState!=='loading');}
  }
  doc.addEventListener('DOMContentLoaded',sync,{once:true});
  // Hide the cached snapshot before navigation, then translate it with the
  // current preference when returning, even if another page changed the locale.
  root.addEventListener('pagehide',()=>doc.documentElement.classList.add(pendingClass));
  root.addEventListener('pageshow',sync);
  root.addEventListener('popstate',sync);
  root.addEventListener('storage',event=>{if(event.key===KEY||event.key===null)set(supported.includes(stored())?stored():detect(),false);});
  doc.addEventListener('visibilitychange',()=>{if(!doc.hidden){const value=stored();if(supported.includes(value)&&value!==language)set(value,false);}});
 }
 init();
})(window);
