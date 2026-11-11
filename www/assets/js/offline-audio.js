/* Downloaded recitations share the radio transport, volume and sleep timer. */
(function(root){
'use strict';
const CACHE='zad-downloads-v1',MAX=256*1024*1024;
const bytes=value=>value>0?(value/1048576).toLocaleString('ar',{maximumFractionDigits:1})+' م.ب':'الحجم غير متاح';
const clock=value=>{value=Number.isFinite(value)?Math.max(0,Math.floor(value)):0;return Math.floor(value/60)+':'+String(value%60).padStart(2,'0');};
function validAudio(url){try{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='cdn.mp3quran.net'&&!u.username&&!u.password&&!u.port&&!u.search&&!u.hash&&/^\/audio\/(mishary-alafasy\/r1|abdulrahman-sudais\/r1|mahmoud-husary\/r2|muhammad-minshawi\/r3|khalid-jalil\/r1|yasser-dosari\/r1|maher-muaiqly\/r1|ali-jaber\/r1)\/\d{3}\.mp3$/.test(u.pathname);}catch{return false;}}
class Library {
 constructor(plugin){this.plugin=plugin;this.busy=false;}
 async list(){
  if(this.plugin)return ((await this.plugin.listDownloads()).items||[]).filter(item=>item.id!=='azkar'&&item.id!=='azkar-evening');
  if(!root.caches)throw Error('حفظ التلاوات غير مدعوم في هذا المتصفح.');
  const cache=await caches.open(CACHE),items=[];
  for(const request of await cache.keys()){
   if(!validAudio(request.url))continue;
   const response=await cache.match(request),raw=response.headers.get('X-Zad-Audio');
   if(!raw)continue;
   try{const item=JSON.parse(decodeURIComponent(raw));if(/^offline-\d{1,4}-\d{1,3}$/.test(item.id)&&item.url===request.url)items.push(item);}catch{}
  }return items;
 }
 async inspect(url){
  if(!validAudio(url))throw Error('مصدر التلاوة غير صالح.');
  if(this.plugin)return (await this.plugin.inspectAudio({url})).bytes;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch(url,{method:'HEAD',signal:controller.signal});if(!response.ok)throw Error('تعذّر معرفة الحجم.');return Number(response.headers.get('Content-Length'))||0;}finally{clearTimeout(timeout);}
 }
 cancel(){this.cancelled=true;if(this.plugin)return this.plugin.cancelDownload();this.controller?.abort();}
 async download(item,notify){
  if(this.busy)throw Error('انتظر اكتمال التنزيل الحالي.');
  if(!validAudio(item.url))throw Error('مصدر التلاوة غير صالح.');
  this.busy=true;this.cancelled=false;let timer;
  try{
   if(this.plugin){
    timer=setInterval(()=>this.plugin.downloadProgress().then(s=>notify(s.received,s.total)).catch(()=>{}),500);
    return await this.plugin.downloadAudio(item);
   }
   if(!root.caches)throw Error('التخزين غير مدعوم.');
   this.controller=new AbortController();
   const cache=await caches.open(CACHE);
   const existing=await cache.match(item.url);if(existing)return item;
   const timeout=setTimeout(()=>this.controller?.abort(),300000);
   let response;
   try{
    response=await fetch(item.url,{signal:this.controller.signal,cache:'no-store'});
    if(!response.ok||response.type==='opaque'||!response.body)throw Error('تعذّر تنزيل التلاوة.');
    const total=Number(response.headers.get('Content-Length'))||0;
    const type=response.headers.get('Content-Type')||'';
    if(/text\/|json/.test(type)||total>MAX)throw Error('الملف غير صالح أو حجمه أكبر من المسموح.');
    const estimate=await navigator.storage?.estimate?.();
    if(total&&estimate?.quota&&estimate.quota-(estimate.usage||0)<total+1048576)throw Error('مساحة التخزين غير كافية.');
    const reader=response.body.getReader(),parts=[];let received=0;
    try{while(true){const {done,value}=await reader.read();if(done)break;if(this.cancelled)throw new DOMException('Cancelled','AbortError');received+=value.length;if(received>MAX)throw Error('التلاوة أكبر من الحد المسموح.');parts.push(value);notify(received,total);}}finally{reader.releaseLock();}
    if(!received||total&&received!==total||this.cancelled)throw Error('التنزيل لم يكتمل.');
    const blob=new Blob(parts,{type:'audio/mpeg'}),signature=new Uint8Array(await blob.slice(0,3).arrayBuffer());
    if(!(signature[0]===73&&signature[1]===68&&signature[2]===51||signature[0]===255&&(signature[1]&224)===224))throw Error('الملف ليس تلاوة صوتية صالحة.');
    item={...item,bytes:received};
    await cache.put(item.url,new Response(blob,{headers:{'Content-Type':'audio/mpeg','Content-Length':String(received),'X-Zad-Audio':encodeURIComponent(JSON.stringify(item))}}));
    navigator.storage?.persist?.().catch(()=>{});
    return item;
   }finally{clearTimeout(timeout);}
  }finally{clearInterval(timer);this.controller?.abort();this.controller=null;this.busy=false;}
 }
 async remove(item){if(this.busy)throw Error('أوقف التنزيل أولًا.');if(this.plugin)return this.plugin.deleteDownload({id:item.id});return (await caches.open(CACHE)).delete(item.url);}
 async source(item){if(this.plugin)return 'zad-offline:'+item.id;const response=await (await caches.open(CACHE)).match(item.url);if(!response)throw Error('الملف غير موجود؛ نزّله من جديد.');return URL.createObjectURL(await response.blob());}
}
function mount({player,audio,stations,setStation,start,native}){
 const box=document.getElementById('radio-tab-downloads'),transport=document.getElementById('radio-offline-transport'),catalog=root.ZadOfflineCatalog;
 if(!box||!transport||!catalog||box.dataset.ready)return;
 box.dataset.ready='true';const plugin=native?root.Capacitor.Plugins.RadioNative:null,library=new Library(plugin);
 let items=[],sourceUrl=null,selectionGeneration=0,probeGeneration=0;
 let downloading=false,stopRequested=false;
 box.innerHTML=`<p class="offline-audio-note"><i class="fa-solid fa-wifi" aria-hidden="true"></i> تلاواتك المحفوظة تعمل بدون إنترنت</p><div class="offline-audio-storage"></div><div class="offline-audio-list"></div><details class="offline-audio-add"><summary>إضافة تلاوة جديدة</summary><label>القارئ<select id="offline-audio-reciter"></select></label><label>السورة<select id="offline-audio-surah"></select></label><div class="offline-audio-size">اعرف حجم التلاوة قبل التنزيل.</div><div class="offline-audio-actions"><button type="button" data-recitation-inspect>معرفة الحجم</button><button type="button" data-recitation-download disabled>تنزيل</button><button type="button" data-recitation-cancel hidden>إلغاء التنزيل</button></div><progress hidden aria-label="تقدّم تنزيل التلاوة" max="100"></progress></details><p class="offline-audio-status" role="status" aria-live="polite"></p>`;
 transport.innerHTML=`<label class="offline-audio-seek-label">موضع التلاوة<input type="range" min="0" max="0" value="0" step="1" aria-label="موضع التلاوة" disabled dir="ltr"></label><div class="offline-audio-times" dir="ltr"><span data-position>0:00</span><span data-duration>0:00</span></div><div class="offline-audio-actions"><button type="button" data-back aria-label="رجوع ١٥ ثانية">−١٥ ثانية</button><button type="button" data-forward aria-label="تقديم ١٥ ثانية">+١٥ ثانية</button></div>`;
 const $=selector=>box.querySelector(selector),reciter=$('#offline-audio-reciter'),surah=$('#offline-audio-surah'),status=$('.offline-audio-status'),download=$('[data-recitation-download]'),inspect=$('[data-recitation-inspect]'),cancel=$('[data-recitation-cancel]'),progress=$('progress'),seek=transport.querySelector('input');
 for(const item of catalog.reciters){const option=document.createElement('option');option.value=item.id;option.textContent=item.name;reciter.append(option);}
 for(const item of catalog.surahs){const option=document.createElement('option');option.value=item.id;option.textContent=item.id+' · '+item.name;surah.append(option);}
 const all=document.createElement('option');all.value='all';all.textContent='المصحف كاملًا';surah.append(all);
 surah.value='67';
 function chosen(){
  const reader=catalog.reciters.find(item=>item.id===reciter.value);
  const selected=catalog.surahs.filter(item=>surah.value==='all'||String(item.id)===surah.value);
  return selected.map(item=>({id:`offline-${reader.id}-${item.id}`,name:'سورة '+item.name,desc:reader.name,url:reader.server+String(item.id).padStart(3,'0')+'.mp3',offline:true}));
 }
 function message(text){status.textContent=text;}
 function release(){if(sourceUrl){URL.revokeObjectURL(sourceUrl);sourceUrl=null;}}
 function position(){return plugin?Number(player.position)||0:audio.currentTime||0;}
 function duration(){return plugin?Number(player.duration)||0:audio.duration||0;}
 function updateTransport(){
  const active=!!player.station?.offline;transport.hidden=!active;if(!active)return;
  const length=duration(),current=position();seek.disabled=!Number.isFinite(length)||length<=0;
  seek.max=String(Number.isFinite(length)?length:0);if(document.activeElement!==seek)seek.value=String(current);
  transport.querySelector('[data-position]').textContent=clock(current);transport.querySelector('[data-duration]').textContent=clock(length);
  if(!plugin&&Number.isFinite(current)){try{localStorage.setItem('zad_audio_position_'+player.station.id,String(current));}catch{}}
  if(!plugin&&navigator.mediaSession&&Number.isFinite(length)&&length>0){try{navigator.mediaSession.setPositionState({duration:length,position:Math.min(current,length),playbackRate:1});}catch{}}
 }
 async function selectItem(item,toggle=true){
  const ticket=++selectionGeneration;
  try{
   if(player.station?.id===item.id){if(player.wanted&&toggle)await player.pause();else if(!player.wanted)start();return true;}
   player.stop();if(plugin)await player.chain;
   const url=item.saved===false?item.url:await library.source(item);if(ticket!==selectionGeneration){if(!plugin&&item.saved!==false)URL.revokeObjectURL(url);return false;}
   release();if(!plugin&&item.saved!==false)sourceUrl=url;
   const station={...item,url,offline:true};const index=stations.findIndex(s=>s.id===item.id);if(index>=0)stations[index]=station;else stations.push(station);
   setStation(station,false);
   if(!plugin){let saved=0;try{saved=Number(localStorage.getItem('zad_audio_position_'+item.id))||0;}catch{}audio.addEventListener('loadedmetadata',()=>{if(ticket===selectionGeneration&&Number.isFinite(audio.duration)&&saved<audio.duration-1)audio.currentTime=saved;},{once:true});}
   start();updateTransport();render();return true;
  }catch{message('تعذّر فتح التلاوة. أعد المحاولة أو نزّلها من جديد.');return false;}
 }
 function render(){
  const list=$('.offline-audio-list');list.replaceChildren();
  $('.offline-audio-storage').textContent=items.length?items.length+' تلاوة · '+bytes(items.reduce((n,item)=>n+(Number(item.bytes)||0),0)):'لسه مفيش تلاوات محفوظة. اختار سورة وقارئ وابدأ التنزيل.';
  for(const item of items){
   const row=document.createElement('div');row.className='offline-audio-item';
   const info=document.createElement('div'),title=document.createElement('strong'),desc=document.createElement('span');title.textContent=item.name;desc.textContent=item.desc+' · '+bytes(item.bytes);info.append(title,desc);
   const play=document.createElement('button');play.type='button';const active=player.station?.id===item.id&&player.wanted;play.textContent=active?'إيقاف مؤقت':'تشغيل';play.setAttribute('aria-label',play.textContent+' '+item.name+' — '+item.desc);play.onclick=()=>selectItem(item);
   const remove=document.createElement('button');remove.type='button';remove.textContent='حذف';remove.setAttribute('aria-label','حذف '+item.name+' — '+item.desc);remove.disabled=downloading;
   remove.onclick=async()=>{if(!root.confirm('حذف '+item.name+' من تنزيلات الجهاز؟'))return;remove.disabled=true;try{if(player.station?.id===item.id){++selectionGeneration;player.stop();if(plugin)await player.chain;release();player.station=null;transport.hidden=true;}await library.remove(item);try{localStorage.removeItem('zad_audio_position_'+item.id);}catch{}await refresh();message('تم حذف التلاوة من هذا الجهاز.');}catch{message('تعذّر الحذف. أوقف التنزيل أو التشغيل وأعد المحاولة.');remove.disabled=false;}};
   row.append(info,play,remove);list.append(row);
  }
 }
 async function refresh(){try{items=(await library.list()).map(item=>({...item,offline:true,recording:true,saved:true,surahId:Number(item.id.split('-')[2]),reciterId:item.id.split('-')[1]}));render();document.dispatchEvent(new Event('zad:downloads-changed'));}catch{message('تعذّر قراءة التنزيلات. التخزين قد لا يكون متاحًا على هذا الجهاز.');}}
 function resetProbe(){
  ++probeGeneration;
  const complete=surah.value==='all';
  inspect.hidden=complete;inspect.disabled=downloading||complete;download.disabled=downloading;
  download.textContent=complete?'تنزيل المصحف كاملًا':'تنزيل';
  $('.offline-audio-size').textContent=complete?'سيتم تنزيل السور غير المحفوظة واحدة تلو الأخرى. قد يحتاج المصحف الكامل إلى مساحة كبيرة.':'اعرف حجم التلاوة قبل التنزيل.';
 }
 reciter.onchange=surah.onchange=resetProbe;
 resetProbe();
 inspect.onclick=async()=>{
  if(downloading||surah.value==='all')return;
  const ticket=++probeGeneration;
  inspect.disabled=true;
  try{
   const size=await library.inspect(chosen()[0].url);
   if(ticket!==probeGeneration)return;
   if(size>MAX){message('التلاوة أكبر من الحد المسموح (٢٥٦ م.ب).');return;}
   $('.offline-audio-size').textContent=size?'حجم التنزيل: '+bytes(size):'الحجم غير متاح؛ سيظهر الاستهلاك أثناء التنزيل.';
  }catch{
   if(ticket===probeGeneration)$('.offline-audio-size').textContent='تعذّر معرفة الحجم؛ يمكنك محاولة التنزيل مع متابعة الاستهلاك.';
  }finally{if(ticket===probeGeneration)inspect.disabled=false;}
 };
 download.onclick=async()=>{
  if(downloading)return;
  const complete=surah.value==='all';
  const queue=chosen().filter(item=>!items.some(saved=>saved.id===item.id));
  if(!queue.length){message(complete?'كل سور القارئ محفوظة بالفعل.':'التلاوة محفوظة بالفعل.');return;}
  if(complete&&!root.confirm('تنزيل المصحف كاملًا؟ قد يستهلك مساحة وبيانات كثيرة.'))return;
  downloading=true;stopRequested=false;++probeGeneration;
  download.disabled=inspect.disabled=reciter.disabled=surah.disabled=true;
  cancel.hidden=false;progress.hidden=false;progress.removeAttribute('value');render();
  try{
   for(const [index,item] of queue.entries()){
    if(stopRequested)break;
    if(complete){
     progress.value=index/queue.length*100;
     message(`جاري التنزيل: ${index} / ${queue.length} — يمكنك إيقافه واستكماله لاحقًا.`);
    }else message('جاري بدء التنزيل…');
    await library.download(item,(received,total)=>{
     if(stopRequested)return;
     if(complete){
      if(total>0)progress.value=(index+Math.min(1,received/total))/queue.length*100;
     }else if(total>0){
      progress.value=Math.min(100,received/total*100);
      message('جاري التنزيل: '+Math.floor(received/total*100)+'٪ · '+bytes(received)+' / '+bytes(total));
     }else message('جاري التنزيل: '+bytes(received));
    });
   }
   if(!stopRequested)message(complete?'اكتمل تنزيل المصحف؛ السور جاهزة بدون إنترنت.':'اكتمل التنزيل؛ التلاوة جاهزة بدون إنترنت.');
  }catch(error){
   if(!stopRequested)message(error.name==='QuotaExceededError'?'مساحة التخزين غير كافية. احذف بعض التنزيلات وحاول مجددًا.':'تعذّر إكمال التنزيل. تحقق من الاتصال والمساحة ثم أعد المحاولة.');
  }finally{
   if(stopRequested)message(complete?'تم إيقاف التنزيل. السور المكتملة محفوظة.':'تم إلغاء التنزيل؛ لم يُحفظ ملف ناقص.');
   await refresh();
   downloading=false;reciter.disabled=surah.disabled=false;
   cancel.hidden=true;cancel.disabled=false;progress.hidden=true;resetProbe();render();
  }
 };
 cancel.onclick=()=>{stopRequested=true;cancel.disabled=true;message('جاري إلغاء التنزيل…');Promise.resolve(library.cancel()).catch(()=>{});};
 seek.onchange=()=>{player.seek(Number(seek.value));updateTransport();};
 transport.querySelector('[data-back]').onclick=()=>player.seek(position()-15);
 transport.querySelector('[data-forward]').onclick=()=>player.seek(position()+15);
 for(const event of ['timeupdate','loadedmetadata','durationchange','ended'])audio.addEventListener(event,updateTransport);
 if(!plugin&&navigator.mediaSession)for(const [action,handler]of Object.entries({seekto:e=>player.seek(e.seekTime),seekbackward:e=>player.seek(position()-(e.seekOffset||15)),seekforward:e=>player.seek(position()+(e.seekOffset||15))})){try{navigator.mediaSession.setActionHandler(action,handler);}catch{}}
 const subscribers=new Set();
 const snapshot=()=>({station:player.station?{...player.station}:null,wanted:player.wanted,state:player.state,position:position(),duration:duration()});
 const emit=()=>{for(const callback of subscribers){try{callback(snapshot());}catch{}}};
 let requestGeneration=0;
 root.ZadQuranAudio={
  getState:snapshot,
  subscribe(callback){subscribers.add(callback);callback(snapshot());return()=>subscribers.delete(callback);},
  pause(){if(player.station?.offline)return player.pause();if(player.wanted)return player.stop();},
  stop(){++requestGeneration;++selectionGeneration;player.stop();},
  seek(seconds){return player.seek(seconds);},
  async playSurah({surahId,reciterId='123',toggle=true}){
   const request=++requestGeneration;
   const s=catalog.surahs.find(s=>s.id===Number(surahId)),r=catalog.reciters.find(r=>r.id===String(reciterId));
   if(!s||!r)throw Error('اختر سورة وقارئًا صحيحين.');
   if(player.station?.recording&&Number(player.station.surahId)===s.id&&String(player.station.reciterId)===r.id){const ok=await selectItem(player.station,toggle);emit();return ok;}
   await refresh();if(request!==requestGeneration)return false;
   const saved=items.find(item=>item.id===`offline-${r.id}-${s.id}`);
   if(!saved&&navigator.onLine===false)throw Error('السورة مش محفوظة بصوت القارئ المختار. نزّلها أولًا أو اختار قارئًا حفظت له السورة.');
   const item=saved||{id:`recitation-${r.id}-${s.id}`,name:'سورة '+s.name,desc:r.name+' · عبر الإنترنت',url:r.server+String(s.id).padStart(3,'0')+'.mp3',offline:true,recording:true,saved:false,surahId:s.id,reciterId:r.id};
   if(!await selectItem(item,toggle))throw Error('تعذّر تشغيل السورة. أعد المحاولة.');
   emit();return true;
  },
  openDownloads({surahId,reciterId='123'}){
   if(catalog.reciters.some(r=>r.id===String(reciterId)))reciter.value=String(reciterId);
   if(catalog.surahs.some(s=>s.id===Number(surahId)))surah.value=String(surahId);
   resetProbe();box.querySelector('details').open=true;
   document.getElementById('tab-btn-downloads')?.click();root.ZadRadioHost?.openPanel?.();
   document.getElementById('radio-panel')?.classList.add('open');
  }
 };
 root.dispatchEvent(new Event('zad:quran-audio-ready'));
 let renderedState='';
 document.addEventListener('zad:radio-state',()=>{updateTransport();const state=player.station?.id+':'+player.wanted;if(state!==renderedState){renderedState=state;render();}emit();});
 audio.addEventListener('timeupdate',emit);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 root.addEventListener('pagehide',()=>{if(library.busy)library.cancel();});
 updateTransport();
 refresh().then(async()=>{if(plugin){try{for(const item of items)if(!stations.some(s=>s.id===item.id))stations.push({...item,url:'zad-offline:'+item.id});await player.poll();}catch{}}});
}
root.ZadOfflineAudio={Library,validAudio,mount};
})(window);
