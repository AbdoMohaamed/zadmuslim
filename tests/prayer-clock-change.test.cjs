const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const app=fs.readFileSync('assets/js/app.js','utf8');
test('same-day offset change bypasses old cache, cancels stale alarms and verifies new clock',async()=>{
 const data=new Map([['selected_prayer_city','Cairo'],['zad_prayer_verified',JSON.stringify({date:'2026-10-29',city:'Cairo',method:'',school:'0',offset:-180,zone:'Africa/Cairo'})]]);
 const timings={Fajr:'04:40',Dhuhr:'11:40',Asr:'14:45',Maghrib:'17:10',Isha:'18:30'};
 let cancellations=0,requests=0,scheduled=0;
 class Clock extends Date {constructor(...args){super(...(args.length?args:[2026,9,29,23,15]));}getTimezoneOffset(){return -120;}}
 const c={Date:Clock,Intl:{DateTimeFormat:()=>({resolvedOptions:()=>({timeZone:'Africa/Cairo'})})},JSON,encodeURIComponent,Number,Event,window:{NativeAdhanService:{cancelPrayerAlarms:async()=>cancellations++,schedulePrayers:()=>scheduled++}},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},navigator:{},document:{dispatchEvent(){}},clearInterval(){},CITY_CONFIGS:{Cairo:{city:'Cairo',country:'Egypt',method:5}},renderPrayerTimesUI(){},startPrayerCountdown(){},initFastingTracker(){},useFallbackTimings(){throw Error('unexpected fallback');},fetch:async()=>{requests++;return {ok:true,json:async()=>({code:200,data:{timings}})};}};
 vm.runInNewContext('let prayerTimerInterval=null;let prayerTimings=null;'+app.slice(app.indexOf('let prayerRequestVersion = 0;'),app.indexOf('function useFallbackTimings()')),c);
 await c.fetchPrayerTimes('Cairo');await new Promise(r=>setImmediate(r));assert.equal(cancellations,1);assert.equal(requests,1);assert.equal(scheduled,1);assert.equal(JSON.parse(data.get('zad_prayer_verified')).offset,-120);assert.ok([...data.keys()].some(k=>k.includes('_clock_v2_')&&k.endsWith('_-120')));
 await c.fetchPrayerTimes('Cairo');await new Promise(r=>setImmediate(r));assert.equal(requests,1);assert.equal(cancellations,1);
});
