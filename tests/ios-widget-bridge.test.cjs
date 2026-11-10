const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('iOS widget bridge marks only verified current-city timings fresh',async()=>{
 const values=new Map([['selected_prayer_city','Cairo']]);
 values.set('zad_prayer_verified',JSON.stringify({date:new Date().toLocaleDateString('en-CA'),city:'Cairo',offset:new Date().getTimezoneOffset(),zone:Intl.DateTimeFormat().resolvedOptions().timeZone,method:'',school:'0'}));
 const calls=[];
 const window={zadPrayerVerified:true,Capacitor:{getPlatform:()=> 'ios',Plugins:{PrayerWidgetNative:{updatePrayerWidget:async args=>calls.push(args)}}}};
 const context={window,document:{readyState:'loading',addEventListener(){},getElementById(){return null;}},localStorage:{getItem:key=>values.get(key)||null},console,Date,Intl};
 vm.runInNewContext(fs.readFileSync('assets/js/native-adhan-service.js','utf8'),context);
 const timings={Fajr:'05:00',Dhuhr:'12:00',Asr:'15:00',Maghrib:'18:00',Isha:'20:00'};
 await window.NativeAdhanService.updateWidget(timings,'هجري','ميلادي');
 assert.equal(calls.at(-1).dataVerified,true);
 values.set('selected_prayer_city','Riyadh');
 await window.NativeAdhanService.updateWidget(timings,'هجري','ميلادي');
 assert.equal(calls.at(-1).dataVerified,false);
 assert.equal(calls.at(-1).timingsJson,JSON.stringify(timings));
});
