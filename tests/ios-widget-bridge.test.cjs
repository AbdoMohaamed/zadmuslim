const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('iOS widget bridge marks only verified current-city timings fresh',async()=>{
 const values=new Map([['selected_prayer_city','Cairo']]);
 values.set('zad_prayer_verified',JSON.stringify({date:new Date().toLocaleDateString('en-CA'),city:'Cairo',offset:new Date().getTimezoneOffset(),zone:Intl.DateTimeFormat().resolvedOptions().timeZone,method:'',school:'0'}));
 const calls=[];
 const window={zadPrayerVerified:true,Capacitor:{getPlatform:()=> 'ios',Plugins:{PrayerWidgetNative:{updatePrayerWidget:async args=>calls.push(args)}}}};
 const context={window,document:{readyState:'loading',addEventListener(){},getElementById(){return null;}},localStorage:{getItem:key=>values.get(key)||null},console,Date,Intl};
 vm.runInNewContext(fs.readFileSync('assets/js/native-adhan-service.js','utf8'),context);
 const timings={Fajr:'05:00',Dhuhr:'12:00',Asr:'15:00',Maghrib:'18:00',Isha:'20:00'};
 assert.equal((await window.NativeAdhanService.updateWidget(timings,'هجري','ميلادي')).success,true);
 assert.equal(calls.at(-1).dataVerified,true);
 values.set('selected_prayer_city','Riyadh');
 assert.equal((await window.NativeAdhanService.updateWidget(timings,'هجري','ميلادي')).success,false);
 assert.equal(calls.at(-1).dataVerified,false);
 assert.equal(calls.at(-1).timingsJson,JSON.stringify(timings));
});

test('widget refresh reports missing signing capability and keeps the guide open',async()=>{
 let finish;
 const pending=new Promise((resolve,reject)=>{finish=reject;});
 const messages=[];
 let removed=false;
 const window={showToast:message=>messages.push(message),Capacitor:{getPlatform:()=> 'ios',Plugins:{PrayerWidgetNative:{updatePrayerWidget:()=>pending}}}};
 const context={window,document:{readyState:'loading',addEventListener(){},getElementById(id){return id==='zad-widget-guide-modal'?{remove(){removed=true;}}:null;}},localStorage:{getItem:()=>null},console:{warn(){},log(){}},Date,Intl};
 vm.runInNewContext(fs.readFileSync('assets/js/native-adhan-service.js','utf8'),context);
 const button={disabled:false};
 const refresh=window.NativeAdhanService.refreshWidgetFromGuide(button);
 assert.equal(button.disabled,true);
 assert.deepEqual(messages,[]);
 finish({code:'WIDGET_APP_GROUP_UNAVAILABLE'});
 const result=await refresh;
 assert.equal(result.success,false);
 assert.match(messages[0],/App Groups/);
 assert.equal(removed,false);
 assert.equal(button.disabled,false);
});

test('missing native widget bridge never reports a successful refresh',async()=>{
 const window={Capacitor:{getPlatform:()=> 'ios',Plugins:{}}};
 const context={window,document:{readyState:'loading',addEventListener(){}},console,Date,Intl};
 vm.runInNewContext(fs.readFileSync('assets/js/native-adhan-service.js','utf8'),context);
 assert.equal((await window.NativeAdhanService.updateWidget()).success,false);
});
