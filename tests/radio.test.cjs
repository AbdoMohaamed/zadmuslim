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
test('Cairo and Makkah do not silently fall back to a different station',()=>{
 const ctx={};vm.runInNewContext(fs.readFileSync('assets/js/radio-stations-data.js','utf8')+';this.stations=RADIO_STATIONS_LIST;',ctx);
 for(const id of ['cairo','makkah'])assert.equal(ctx.stations.find(s=>s.id===id).backupUrl,undefined);
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
