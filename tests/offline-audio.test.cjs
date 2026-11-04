const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const source=fs.readFileSync('assets/js/offline-audio.js','utf8');
const recording={id:'offline-123-1',name:'سورة الفاتحة',desc:'مشاري العفاسي',url:'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/001.mp3'};
function setup(fetcher){
 const entries=new Map();const cache={keys:async()=>[...entries.keys()].map(url=>({url})),match:async request=>entries.get(request.url||request)?.clone(),put:async(url,response)=>entries.set(url,response.clone()),delete:async url=>entries.delete(url)};
 const caches={open:async()=>cache};const window={caches};const context={window,caches,URL,Blob,Response,AbortController,DOMException,Uint8Array,TextEncoder,setInterval,clearInterval,setTimeout,clearTimeout,navigator:{storage:{estimate:async()=>({quota:1e9,usage:0}),persist:async()=>true}},fetch:fetcher};
 vm.runInNewContext(source,context);return {Library:window.ZadOfflineAudio.Library,api:window.ZadOfflineAudio,entries,context};
}
test('only complete MP3 downloads become playable offline and deleting removes the file',async()=>{
 const data=Buffer.from('ID3complete-audio');let requests=0;const h=setup(async()=>{requests++;return new Response(data,{headers:{'Content-Length':data.length,'Content-Type':'audio/mpeg'}});});
 const store=new h.Library();const updates=[];await store.download({...recording},(n,total)=>updates.push([n,total]));
 assert.equal(updates.at(-1)[0],data.length);const list=await store.list();assert.equal(list.length,1);assert.equal(list[0].bytes,data.length);
 h.context.fetch=()=>{throw Error('network must not be needed');};const url=await store.source(list[0]);assert.ok(url.startsWith('blob:'));URL.revokeObjectURL(url);
 await store.download({...recording},()=>{});assert.equal(requests,1);await store.remove(list[0]);assert.equal((await store.list()).length,0);
});
test('failed, truncated, non-audio and quota-exhausted downloads never report saved items',async()=>{
 for(const response of [()=>new Response('ID3short',{headers:{'Content-Length':99}}),()=>new Response('<html>error</html>',{headers:{'Content-Type':'text/html'}}),()=>new Response('not an mp3')]){
  const h=setup(async()=>response()),store=new h.Library();await assert.rejects(store.download({...recording},()=>{}));assert.equal((await store.list()).length,0);assert.equal(store.busy,false);
 }
 const h=setup(async()=>new Response(Buffer.from('ID3ok')));h.context.caches.open=async()=>({match:async()=>null,put:async()=>{throw new DOMException('Full','QuotaExceededError');}});
 await assert.rejects(new h.Library().download({...recording},()=>{}),{name:'QuotaExceededError'});
});
test('cancel and concurrency guard cannot publish an incomplete recording',async()=>{
 let release;const pending=new Promise(resolve=>release=resolve);const h=setup(async()=>{await pending;return new Response('ID3cancelled');});const store=new h.Library();const task=store.download({...recording},()=>{});
 await assert.rejects(store.download({...recording},()=>{}));store.cancel();release();await assert.rejects(task);assert.equal(h.entries.size,0);assert.equal(store.busy,false);
});
test('audio sources reject external hosts, traversal, credentials and malformed paths',()=>{
 const h=setup();assert.equal(h.api.validAudio(recording.url),true);
 for(const url of ['https://evil.test/001.mp3','https://cdn.mp3quran.net.evil.test/audio/mishary-alafasy/r1/001.mp3','https://user@cdn.mp3quran.net/audio/mishary-alafasy/r1/001.mp3',recording.url+'?token=1','file:///private/audio.mp3'])assert.equal(h.api.validAudio(url),false);
});
test('native backend delegates download, cancellation, listing and deletion without fetching web audio',async()=>{
 const calls=[];const plugin={downloadAudio:async item=>{calls.push('download');return {...item,bytes:100};},downloadProgress:async()=>({received:50,total:100}),listDownloads:async()=>({items:[recording]}),cancelDownload:async()=>calls.push('cancel'),deleteDownload:async()=>calls.push('delete')};
 const h=setup(()=>{throw Error('unexpected fetch');}),store=new h.Library(plugin);await store.download({...recording},()=>{});await store.cancel();assert.equal((await store.list()).length,1);assert.equal(await store.source(recording),'zad-offline:'+recording.id);await store.remove(recording);assert.deepEqual(calls,['download','cancel','delete']);
});
test('radio library mounts with four reciters and all surahs; tab data and controls stay accessible',async()=>{
 const dom=new JSDOM('<div id="radio-tab-downloads"></div><div id="radio-offline-transport"></div>',{url:'https://app.test',runScripts:'outside-only'});const w=dom.window;
 try{
  w.eval(fs.readFileSync('assets/js/offline-audio-catalog.js','utf8'));w.eval(source);
  const player={wanted:false,station:null,poll:async()=>{},stop(){},seek(){},pause(){}};const audio=w.document.createElement('audio');
  w.ZadOfflineAudio.mount({player,audio,stations:[],setStation(){},start(){},native:false});
  assert.equal(w.document.querySelectorAll('#offline-audio-reciter option').length,4);assert.equal(w.document.querySelectorAll('#offline-audio-surah option').length,114);
  assert.equal(w.document.querySelector('[data-download]').disabled,true);assert.equal(w.document.getElementById('radio-offline-transport').hidden,true);
  w.document.dispatchEvent(new w.CustomEvent('zad:radio-state'));assert.equal(w.document.getElementById('radio-offline-transport').hidden,true);
 }finally{await new Promise(r=>setImmediate(r));w.close();}
});
test('Quran and downloads share the same recording, pause and resume without replacing its source',async()=>{
 const dom=new JSDOM('<div id="radio-tab-downloads"></div><div id="radio-offline-transport"></div>',{url:'https://app.test',runScripts:'outside-only'}),w=dom.window;
 try{
  w.eval(fs.readFileSync('assets/js/offline-audio-catalog.js','utf8'));w.eval(source);
  let starts=0,pauses=0,selections=0;
  w.Capacitor={Plugins:{RadioNative:{listDownloads:async()=>({items:[{...recording,bytes:100}]})}}};
  const player={wanted:false,station:null,chain:Promise.resolve(),position:42,duration:120,poll:async()=>{},stop(){this.wanted=false;},seek(){},pause(){pauses++;this.wanted=false;}};
  w.ZadOfflineAudio.mount({player,audio:w.document.createElement('audio'),stations:[],setStation(item){selections++;player.station=item;},start(){starts++;player.wanted=true;},native:true});
  await w.ZadQuranAudio.playSurah({surahId:1,reciterId:'123'});assert.equal(player.station.url,'zad-offline:offline-123-1');assert.equal(player.station.saved,true);
  await w.ZadQuranAudio.playSurah({surahId:1,reciterId:'123'});assert.equal(pauses,1);assert.equal(player.position,42);
  await w.ZadQuranAudio.playSurah({surahId:1,reciterId:'123'});assert.equal(starts,2);assert.equal(selections,1);assert.equal(player.position,42);
  Object.defineProperty(w.navigator,'onLine',{value:false,configurable:true});
  await assert.rejects(w.ZadQuranAudio.playSurah({surahId:1,reciterId:'54'}),/مش محفوظة/);
  Object.defineProperty(w.navigator,'onLine',{value:true});
  await w.ZadQuranAudio.playSurah({surahId:1,reciterId:'54'});assert.equal(player.station.saved,false);assert.ok(player.station.url.startsWith('https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1/'));
  w.Capacitor.Plugins.RadioNative.listDownloads=async()=>({items:[{...recording,id:'offline-54-1'}]});
  await w.ZadQuranAudio.playSurah({surahId:1,reciterId:'54'});assert.equal(player.station.id,'recitation-54-1');assert.equal(player.wanted,false);assert.equal(pauses,2);
 }finally{await new Promise(resolve=>setImmediate(resolve));w.close();}
});
