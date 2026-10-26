/* Personal shortcuts stay on this device; no account or network request. */
(function () {
 'use strict';
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
 const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
 let savedReading=read('zad_services_reading',null);
 if(read('zad_services_personal_seen',false)!==true)savedReading=read('zad_quran_last_read',null);
 function init(){
  const directory=document.getElementById('services-directory');if(!directory)return;
  write('zad_services_personal_seen',true);
  if(savedReading)write('zad_services_reading',savedReading);
  let openedQuran=location.hash==='#quran-khatma?tab=mushaf';
  const cards=[...directory.querySelectorAll('.service-card')];
  const byId=new Map(cards.map(card=>[card.getAttribute('href'),card]));
  const validList=value=>Array.isArray(value)?[...new Set(value)].filter(id=>byId.has(id)):[];
  let favorites=validList(read('zad_services_favorites',[])).slice(0,4);
  let recent=validList(read('zad_services_recent',[])).slice(0,3);
  let hideRecent=read('zad_services_recent_hidden',false)===true;
  const area=document.createElement('div');area.className='services-personal';area.id='services-personal';
  area.innerHTML='<section id="services-favorites" hidden aria-label="خدماتك المفضلة"><h2>مفضلتك</h2><div class="services-personal-links"></div></section><section id="services-recent" hidden aria-label="آخر الخدمات"><div class="services-personal-heading"><h2>استخدمتها مؤخرًا</h2><button type="button" id="services-hide-recent">إخفاء</button></div><div class="services-personal-links"></div></section><div class="services-personal-tools"><button type="button" id="services-show-recent" hidden>إظهار آخر الخدمات</button><span id="services-offline-count"></span></div><p id="services-personal-status" role="status" aria-live="polite"></p>';
  (directory.querySelector('.category-filter-pills') || directory.querySelector('#services-search-results') || directory.querySelector('.services-search-wrapper')).after(area);
  const $=id=>document.getElementById(id);
  const say=text=>{$('services-personal-status').textContent=text;};
  const title=id=>byId.get(id).querySelector('h3').textContent.trim();
  const launch=id=>{const card=byId.get(id);if(card)card.click();};
  function links(container,ids){container.replaceChildren();for(const id of ids){const button=document.createElement('button');button.type='button';button.textContent=title(id);button.onclick=()=>launch(id);container.append(button);}}
  function render(){
   $('services-favorites').hidden=!favorites.length;links($('services-favorites').querySelector('.services-personal-links'),favorites);
   const visibleRecent=recent.filter(id=>!favorites.includes(id));
   $('services-recent').hidden=!visibleRecent.length||hideRecent;$('services-show-recent').hidden=!visibleRecent.length||!hideRecent;
   links($('services-recent').querySelector('.services-personal-links'),visibleRecent);
   for(const [id,card] of byId){const button=card.parentElement.querySelector('.service-favorite');const selected=favorites.includes(id);button.textContent=selected?'★':'☆';button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',(selected?'إزالة من المفضلة: ':'إضافة للمفضلة: ')+title(id));}
  }
  for(const [id,card] of byId){
   const wrap=document.createElement('div');wrap.className='service-card-shell';card.before(wrap);wrap.append(card);
   const button=document.createElement('button');button.type='button';button.className='service-favorite';
   button.onclick=()=>{if(!favorites.includes(id)&&favorites.length>=4){say('يمكنك تثبيت 4 خدمات. أزل نجمة من خدمة لاستبدالها.');return;}
    const next=favorites.includes(id)?favorites.filter(item=>item!==id):[...favorites,id];
    if(!write('zad_services_favorites',next)){say('تعذّر حفظ المفضلة على هذا الجهاز. حاول مجددًا.');return;}
    favorites=next;render();say(favorites.includes(id)?'تمت الإضافة إلى مفضلتك.':'تمت الإزالة من المفضلة.');};wrap.append(button);
  }
  function resume(){
    let box=$('services-resume');
    if(!box){
      box=document.createElement('div');box.id='services-resume';box.hidden=true;
      const qBlock=document.querySelector('.category-block[data-category="القرآن الكريم"]');
      if(qBlock){const g=qBlock.querySelector('.services-grid');if(g)g.before(box);else qBlock.append(box);}
      else{const p=$('services-personal');if(p)p.prepend(box);}
    }box.replaceChildren();box.hidden=true;
   if(savedReading&&Number.isInteger(savedReading.pageNumber)&&savedReading.pageNumber>=1&&savedReading.pageNumber<=604){
    const button=document.createElement('button');button.type='button';button.className='services-resume-button';
    const textWrap=document.createElement('div');textWrap.className='services-resume-text';
    const heading=document.createElement('strong');heading.textContent='كمّل من مكانك';const detail=document.createElement('span');detail.textContent='آخر موضع محفوظ في المصحف — صفحة '+savedReading.pageNumber;
    textWrap.append(heading,detail);button.append(textWrap);button.onclick=()=>{launch('#quran-khatma?tab=mushaf');if(typeof window.goToMushafPage==='function')window.goToMushafPage(savedReading.pageNumber);};box.append(button);box.hidden=false;
   }
  }
  document.addEventListener('click',event=>{
   if(event.target.closest?.('.quran-tab-btn[data-tab="mushaf"]')&&document.getElementById('quran-khatma')?.classList.contains('active-service-view'))openedQuran=true;
   const card=event.target.closest?.('.service-card');if(!cards.includes(card))return;
   const id=card.getAttribute('href');if(id==='#quran-khatma?tab=mushaf')openedQuran=true;recent=[id,...recent.filter(item=>item!==id)].slice(0,3);write('zad_services_recent',recent);render();
  });
  $('services-hide-recent').onclick=()=>{hideRecent=true;write('zad_services_recent_hidden',true);render();};
  $('services-show-recent').onclick=()=>{hideRecent=false;write('zad_services_recent_hidden',false);render();};
  let cacheBusy=false;
  async function downloads(){if(cacheBusy)return;cacheBusy=true;try{
   const label=$('services-offline-count');label.textContent='';directory.querySelector('.service-offline-badge')?.remove();if(!window.caches)return;
   const names=await caches.keys();if(!names.includes('zad-downloads-v1'))return;
   const cache=await caches.open('zad-downloads-v1');const entries=await cache.keys();
   const files=entries.filter(req=>/\/quran-pages\/\d+\.svg(?:\?|$)|\/\d+\.mp3(?:\?|$)|\/ar\.muyassar/.test(req.url));
   if(files.length)label.textContent=files.length+' ملف محفوظ على الجهاز';
   const pages=files.filter(req=>/\/quran-pages\/\d+\.svg(?:\?|$)/.test(req.url));
   if(pages.length){const badge=document.createElement('span');badge.className='service-offline-badge';badge.textContent=pages.length+' صفحة منزّلة';byId.get('#quran-khatma?tab=mushaf')?.append(badge);}
  }catch{}finally{cacheBusy=false;}}
  document.addEventListener('zad:services-return',()=>{if(openedQuran){savedReading=read('zad_quran_last_read',savedReading);write('zad_services_reading',savedReading);openedQuran=false;}resume();downloads();});
  window.addEventListener('pagehide',()=>{if(openedQuran)write('zad_services_reading',read('zad_quran_last_read',savedReading));});
  window.addEventListener('focus',downloads);document.addEventListener('zad:downloads-changed',downloads);
  render();resume();downloads();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
