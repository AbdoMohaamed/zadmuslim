const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
function setup(){
 const timers=new Map();let seq=0;
 const window=new EventTarget();const navigator={onLine:true};
 class Audio extends EventTarget{constructor(){super();this.volume=.8;this.plays=[];this.src='';}load(){}removeAttribute(){this.src='';}pause(){this.dispatchEvent(new Event('pause'));}play(){this.plays.push(this.src);return this.reject?Promise.reject(this.reject):Promise.resolve();}}
 const audio=new Audio();const context={window,navigator,document:{hidden:false,addEventListener(){}},setTimeout:(fn,ms)=>{const id=++seq;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),setInterval:()=>0,console};
 vm.runInNewContext(fs.readFileSync('assets/js/radio-player.js','utf8'),context);
 const changes=[];const player=new window.ZadRadioPlayer(audio,s=>changes.push(s));
 const tick=(ms)=>{const entry=[...timers].find(([id,t])=>t.ms===ms);assert.ok(entry,'timer '+ms);timers.delete(entry[0]);entry[1].fn();};
 player.select({id:'cairo',name:'Cairo',url:'https://stream.test/cairo'});
 return {player,audio,window,navigator,timers,tick,changes};
}
const flush=()=>new Promise(r=>setImmediate(r));
test('saved recitation plays without internet, pauses in place, seeks, and ends without reconnect',async()=>{
 const h=setup();h.navigator.onLine=false;h.audio.currentTime=42;h.audio.duration=120;
 h.player.select({id:'offline-123-1',url:'blob:saved-audio',offline:true});h.player.play();await flush();
 assert.equal(h.audio.plays.length,1);h.audio.dispatchEvent(new Event('playing'));h.player.pause();assert.equal(h.audio.currentTime,42);assert.equal(h.player.wanted,false);
 h.player.seek(80);assert.equal(h.audio.currentTime,80);h.player.play();await flush();h.audio.dispatchEvent(new Event('ended'));assert.equal(h.player.state,'ended');assert.equal(h.player.wanted,false);assert.equal(h.audio.currentTime,0);assert.equal(h.timers.size,0);
});
test('first playback failure reconnects to the selected station and duplicate errors share one retry',async()=>{
 const h=setup();h.audio.reject=new Error('network');h.player.play();await flush();
 h.audio.dispatchEvent(new Event('error'));assert.equal([...h.timers.values()].filter(t=>t.ms===1000).length,1);
 h.audio.reject=null;h.tick(1000);await flush();assert.equal(h.audio.plays.length,2);assert.ok(h.audio.plays.every(url=>url.endsWith('/cairo')));
 h.audio.dispatchEvent(new Event('playing'));assert.equal(h.player.state,'playing');h.player.stop();
});
test('stop during buffering cancels all retry timers and online cannot restart it',()=>{
 const h=setup();h.player.play();h.audio.dispatchEvent(new Event('waiting'));h.player.stop();assert.equal(h.timers.size,0);
 h.window.dispatchEvent(new Event('online'));assert.equal(h.audio.plays.length,1);assert.equal(h.player.wanted,false);
});
test('offline playback waits and resumes the same station when internet returns',()=>{
 const h=setup();h.navigator.onLine=false;h.player.play();assert.equal(h.player.state,'offline');assert.equal(h.audio.plays.length,0);
 h.navigator.onLine=true;h.window.dispatchEvent(new Event('online'));assert.equal(h.audio.plays[0],'https://stream.test/cairo');h.player.stop();
});
test('late rejected play from an old station cannot restart it',async()=>{
 const h=setup();let reject;h.audio.play=()=>new Promise((resolve,r)=>{reject=r;});h.player.play();
 h.player.select({id:'new',url:'https://stream.test/new'},false);reject(new Error('old'));await flush();assert.equal(h.player.station.id,'new');assert.equal(h.player.wanted,false);assert.equal(h.timers.size,0);
});
test('stalled streams time out and retry; autoplay denial requires a user gesture',async()=>{
 const h=setup();h.player.play();h.tick(18000);assert.equal(h.player.state,'retrying');h.player.stop();
 h.audio.reject=Object.assign(new Error('gesture'),{name:'NotAllowedError'});h.player.play();await flush();assert.equal(h.player.state,'blocked');assert.equal(h.timers.size,0);
});
test('Cairo switches to its backup and returns to primary if the backup later stalls',()=>{
 const ctx={};vm.runInNewContext(fs.readFileSync('assets/js/radio-stations-data.js','utf8')+';this.stations=RADIO_STATIONS_LIST;',ctx);
 const cairo=ctx.stations.find(s=>s.id==='cairo');
 assert.equal(cairo.url,'https://stream.radiojar.com/8s5u5tpdtwzuv');
 assert.equal(cairo.backupUrl,'https://radio.xecod.com/station/quran-cairo');
 assert.equal(ctx.stations.find(s=>s.id==='makkah').backupUrl,undefined);
 const h=setup();h.player.select(cairo,true);
 h.audio.dispatchEvent(new Event('error'));h.tick(1000);
 assert.deepEqual(h.audio.plays,[cairo.url,cairo.backupUrl]);
 h.audio.dispatchEvent(new Event('playing'));h.audio.currentTime=1;h.audio.dispatchEvent(new Event('timeupdate'));
 h.tick(30000);h.tick(18000);h.tick(1000);
 assert.deepEqual(h.audio.plays,[cairo.url,cairo.backupUrl,cairo.url]);
 assert.equal(h.player.station.id,'cairo');h.player.stop();
});

test('long outage keeps retrying at a capped interval and explicit stop cancels recovery',()=>{
 const h=setup();h.player.play();
 for(let i=0;i<12;i++){h.audio.dispatchEvent(new Event('error'));assert.equal(h.player.wanted,true);assert.equal(h.player.state,'retrying');h.tick(Math.min(1000*2**Math.min(i,6),60000));}
 assert.equal(h.audio.plays.length,13);assert.ok(h.audio.plays.every(url=>url.endsWith('/cairo')));
 h.audio.dispatchEvent(new Event('error'));h.player.stop();assert.equal(h.timers.size,0);h.window.dispatchEvent(new Event('online'));assert.equal(h.audio.plays.length,13);
});
test('buffered audio progress prevents needless reconnect and online does not restart healthy playback',()=>{
 const h=setup();h.player.play();h.audio.dispatchEvent(new Event('playing'));h.audio.dispatchEvent(new Event('stalled'));
 h.audio.currentTime=1;h.audio.dispatchEvent(new Event('timeupdate'));assert.equal(h.player.state,'playing');assert.equal([...h.timers.values()].filter(t=>t.ms===18000).length,1);
 h.window.dispatchEvent(new Event('online'));assert.equal(h.audio.plays.length,1);h.tick(18000);assert.equal(h.player.state,'retrying');h.player.stop();
});

function nativeSetup(stop){const h=setup();h.window.Capacitor={Plugins:{RadioNative:{getState:async()=>({wanted:false,state:'paused'}),stop,play:async()=>{},setVolume:async()=>{}}}};const changes=[];const p=new h.window.ZadNativeRadioPlayer(h.audio,s=>changes.push(s),[]);p.select({id:'cairo',url:'https://stream.test/cairo'});return {...h,p,changes};}
test('selecting a saved recording exits the web fallback before native playback',async()=>{
 const h=nativeSetup(async()=>{});let played;
 h.p.plugin.play=async station=>{played=station;};
 await h.p.useWebPlayer();assert.ok(h.p.fallback);
 h.p.select({id:'offline-123-1',url:'zad-offline:offline-123-1',offline:true},true);await h.p.chain;
 assert.equal(h.p.fallback,null);assert.equal(played.id,'offline-123-1');assert.equal(h.audio.src,'');
});
test('native Quran playback restores the reader and surah after page navigation',async()=>{
 const h=nativeSetup(async()=>{});await flush();
 h.window.ZadOfflineCatalog={reciters:[{id:'123',name:'القارئ',server:'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/'}],surahs:[{id:1,name:'الفاتحة'}]};
 h.p.plugin.getState=async()=>({id:'recitation-123-1',wanted:true,state:'playing',position:45,duration:120});await h.p.poll();
 assert.equal(h.p.station.surahId,1);assert.equal(h.p.station.reciterId,'123');assert.equal(h.p.station.saved,false);assert.equal(h.p.position,45);
});
test('alternative playback waits for native stop and retains the same station',async()=>{let finish;const h=nativeSetup(()=>new Promise(r=>finish=r));assert.equal(h.p.survivesNavigation,true);const switched=h.p.useWebPlayer();assert.equal(h.p.survivesNavigation,false);await flush();assert.equal(h.audio.plays.length,0);finish();await switched;assert.equal(h.p.survivesNavigation,false);assert.deepEqual(h.audio.plays,['https://stream.test/cairo']);assert.equal(h.p.wanted,true);h.p.stop();assert.equal(h.p.wanted,false);});
test('a failed native stop cannot start a second player',async()=>{const h=nativeSetup(async()=>{throw Error('stop failed');});await h.p.useWebPlayer();assert.equal(h.audio.plays.length,0);assert.equal(h.changes.at(-1).state,'failed');});
test('stopping during a pending switch prevents delayed playback',async()=>{let finish;const h=nativeSetup(()=>new Promise(r=>finish=r));const switched=h.p.useWebPlayer();await flush();h.p.stop();finish();await switched;assert.equal(h.audio.plays.length,0);});
