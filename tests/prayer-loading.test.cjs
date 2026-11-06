const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const app = fs.readFileSync('assets/js/app.js', 'utf8');
const source = 'let prayerTimerInterval=null;let prayerTimings=null;' + app.slice(app.indexOf('let prayerRequestVersion = 0;'), app.indexOf('function useFallbackTimings()'));
const local = { Fajr:'04:40', Dhuhr:'11:40', Asr:'14:45', Maghrib:'17:10', Isha:'18:30' };
const updated = { ...local, Fajr:'04:41' };
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup(nativeResult = { timings:local, renewed:false }) {
 const data = new Map([['selected_prayer_city','Cairo']]);
 const renders=[], requests=[], timers=new Map(); let serial=0, fallback=0;
 const c = {
  AbortController, Date, Intl, Event, JSON, Number, encodeURIComponent,
  setTimeout(fn,ms){assert.equal(ms,8000);timers.set(++serial,fn);return serial;},
  clearTimeout(id){timers.delete(id);}, clearInterval(){},
  window:{Capacitor:{getPlatform:()=> 'android',Plugins:{AdhanNative:{getLocalPrayerTimings:async()=>nativeResult}}}},
  localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},
  navigator:{},document:{dispatchEvent(){}},
  CITY_CONFIGS:{Cairo:{city:'Cairo',country:'Egypt',method:5},Riyadh:{city:'Riyadh',country:'Saudi Arabia',method:4}},
  renderPrayerTimesUI:t=>renders.push(t),startPrayerCountdown(){},initFastingTracker(){},useFallbackTimings(){fallback++;},
  fetch(url,{signal}){return new Promise((resolve,reject)=>{requests.push({url,signal,resolve,reject});signal.addEventListener('abort',()=>reject(Error('aborted')),{once:true});});}
 };
 vm.runInNewContext(source,c);
 return {c,data,renders,requests,timers,get fallback(){return fallback;}};
}
test('today local timings display before network, even with alarms disabled, then refresh',async()=>{
 const h=setup();await h.c.fetchPrayerTimes('Cairo');
 assert.equal(h.renders[0],local);assert.equal(h.requests.length,1);assert.equal(h.c.window.zadPrayerVerified,true);
 h.requests[0].resolve({ok:true,json:async()=>({code:200,data:{timings:updated}})});await flush();
 assert.equal(h.renders.at(-1),updated);assert.equal(h.timers.size,0);assert.equal(h.fallback,0);
});
test('slow network times out while valid local timings remain visible',async()=>{
 const h=setup();await h.c.fetchPrayerTimes('Cairo');
 [...h.timers.values()][0]();await flush();
 assert.equal(h.requests[0].signal.aborted,true);assert.equal(h.renders.length,1);assert.equal(h.fallback,0);assert.equal(h.timers.size,0);
});
test('missing or invalid context-matched local times do not display old values on failure',async()=>{
 for(const native of [{},{renewed:true,timings:{...local,Fajr:'invalid'}}]){
  const h=setup(native);await h.c.fetchPrayerTimes('Cairo');assert.equal(h.renders.length,0);
  [...h.timers.values()][0]();await flush();assert.equal(h.fallback,1);assert.equal(h.timers.size,0);
 }
});
test('changing city cancels prior request and never displays its late response',async()=>{
 const h=setup({});await h.c.fetchPrayerTimes('Cairo');
 // The response headers arrive before cancellation, but its body is delayed.
 let finish;h.requests[0].resolve({ok:true,json:()=>new Promise(r=>{finish=r;})});await flush();
 h.data.set('selected_prayer_city','Riyadh');await h.c.fetchPrayerTimes('Riyadh');
 assert.equal(h.requests[0].signal.aborted,true);
 finish({code:200,data:{timings:local}});await flush();assert.equal(h.renders.length,0);
 h.requests[1].resolve({ok:true,json:async()=>({code:200,data:{timings:updated}})});await flush();
 assert.deepEqual(h.renders,[updated]);assert.equal(h.fallback,0);assert.equal(h.timers.size,0);
});
