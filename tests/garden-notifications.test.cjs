const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const extended=fs.readFileSync('assets/js/extended-modules.js','utf8');
test('garden sends a deep link only on stage promotion',()=>{
 const data=new Map(),sent=[];
 const c={Date,console,localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},document:{getElementById:()=>null},CustomEvent:function(){},updateGardenUI(){},triggerNativeNotification:(...args)=>sent.push(args)};
 c.window=c;c.dispatchEvent=()=>{};
 const start=extended.indexOf('const GARDEN_STAGES');const end=extended.indexOf('function updateGardenUI',start);
 vm.runInNewContext(extended.slice(start,end),c);
 c.addSpiritualGardenDeed('tasbeeh',24,24);assert.equal(sent.length,0);
 c.addSpiritualGardenDeed('tasbeeh',1);assert.equal(sent.length,1);
 assert.equal(sent[0][2],'services.html#spiritual-garden');assert.match(sent[0][1],/اضغط/);
 c.addSpiritualGardenDeed('tasbeeh',1);assert.equal(sent.length,1);
});
test('local notification preserves garden deep link for the operating system',async()=>{
 let scheduled;const c={console,Date,window:{Capacitor:{isNativePlatform:()=>true,Plugins:{LocalNotifications:{schedule:async o=>scheduled=o}}}}};
 const start=extended.indexOf('async function triggerNativeNotification('),end=extended.indexOf('function playNotificationChime',start);
 vm.runInNewContext(extended.slice(start,end),c);
 await c.triggerNativeNotification('شجرتك','افتح الحديقة','services.html#spiritual-garden');
 assert.equal(scheduled.notifications[0].extra.url,'services.html#spiritual-garden');
 assert.equal(scheduled.notifications[0].channelId,'zad_cloud_broadcast_channel');
});
test('native garden tap navigates on launch and opens existing services view without prayer audio',()=>{
 const source=fs.readFileSync('assets/js/native-adhan-service.js','utf8');
 for(const alreadyOpen of [false,true]){
 const listeners={},navigations=[];const c={console,window:{location:{pathname:alreadyOpen?'/services.html':'/index.html'},zadNavigate:u=>navigations.push(u),openServiceView:u=>navigations.push(u),Capacitor:{Plugins:{LocalNotifications:{addListener:(event,cb)=>listeners[event]=cb}}}}};
 const start=source.indexOf('    setupListeners()'),end=source.indexOf('    /**',start);
 const service=vm.runInNewContext('({'+source.slice(start,end)+'})',c);service.setupListeners();
 listeners.localNotificationActionPerformed({notification:{extra:{url:'services.html#spiritual-garden'}}});
 assert.deepEqual(navigations,[alreadyOpen?'#spiritual-garden':'services.html#spiritual-garden']);
 }
});
test('web garden notification opens a window when closed or navigates existing window',async()=>{
 const source=fs.readFileSync('sw.js','utf8');
 for(const open of [false,true]){
 let click,pending;const navigations=[];const c={self:{addEventListener:(_,cb)=>click=cb},clients:{matchAll:async()=>open?[{focus(){},navigate:u=>navigations.push(u)}]:[],openWindow:u=>navigations.push(u)}};
 vm.runInNewContext(source.slice(source.indexOf('self.addEventListener("notificationclick"')),c);
 click({notification:{close(){},data:{url:'services.html#spiritual-garden'}},waitUntil:p=>pending=p});await pending;
 assert.deepEqual(navigations,['services.html#spiritual-garden']);
 }
});
