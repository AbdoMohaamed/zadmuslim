const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('assets/js/native-adhan-service.js', 'utf8');
const off = { morning:false, evening:false, sleep:false, friday:false, fasting:false, hourlySalawat:false, prePrayer:false, adhan:false };
function harness({platform='android', permission='granted', settings={}, verified=true, exact=true}={}) {
    const calls = {local:[],native:[],cancel:[],legacy:0};
    const data = new Map(Object.entries({
        selected_prayer_city:'Cairo', smart_notify_settings:JSON.stringify({...off,...settings}),
        zad_prayer_verified:JSON.stringify({date:new Date().toLocaleDateString('en-CA'),city:'Cairo',method:'',school:'0'})
    }));
    const timings={Fajr:'23:51',Dhuhr:'23:52',Asr:'23:53',Maghrib:'23:54',Isha:'23:55'};
    const local = {
        checkPermissions:async()=>({display:permission}),requestPermissions:async()=>({display:permission}),
        createChannel:async()=>{},getPending:async()=>({notifications:[{id:100},{id:70000},{id:99982},{id:1000001}]}),
        cancel:async o=>calls.cancel.push(...o.notifications),schedule:async o=>calls.local.push(...o.notifications),
        checkExactNotificationSetting:async()=>({exact_alarm:exact?'granted':'denied'})
    };
    const native = {
        schedulePrayerAlarms:async o=>{calls.native.push(o);return {success:true};},
        cancelAllAlarms:async()=>{calls.legacy++;},
        checkExactAlarmPermission:async()=>({canSchedule:exact}),
        testAdhanNotification:async()=>{calls.test=true;},
        scheduleDiagnosticTestAlarm:async()=>{calls.diagnostic=true;return {success:true};}
    };
    const context={console:{log(){},warn(){}},Date,Intl,setTimeout,clearTimeout,
        localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))},
        document:{readyState:'loading',addEventListener(){},getElementById(){return null;}},
        navigator:{},zadPrayerVerified:verified,prayerTimings:timings,
        getSelectedMuazzinId:()=> 'refaat',
        Capacitor:{isNativePlatform:()=>platform!=='web',getPlatform:()=>platform,Plugins:{LocalNotifications:local,AdhanNative:native}}
    };
    context.window=context;
    vm.runInNewContext(source,context);
    return {service:context.NativeAdhanService,calls,context,data,local,native,timings};
}
test('disabling every alert cancels old schedules but preserves diagnostics and cloud messages',async()=>{
    const h=harness();
    assert.equal((await h.service.schedulePrayers()).success,true);
    assert.deepEqual(h.calls.cancel.map(n=>n.id),[100,70000]);
    assert.equal(h.calls.local.length,0);
    assert.equal(h.calls.native[0].adhan,false);
    assert.equal(h.calls.native[0].preAlert,false);
});
test('Android delegates prayer audio once; iOS uses only one scheduler and clears legacy requests',async()=>{
    for(const platform of ['android','ios']){
        const h=harness({platform,settings:{adhan:true,prePrayer:true,morning:true}});
        await h.service.schedulePrayers();
        if(platform==='android'){
            assert.equal(h.calls.native.length,1);
            assert.ok(h.calls.local.every(n=>n.id>=70000));
        }else{
            assert.equal(h.calls.native.length,0);
            assert.equal(h.calls.legacy,1);
            assert.equal(new Set(h.calls.local.map(n=>n.id)).size,h.calls.local.length);
            assert.ok(h.calls.local.filter(n=>n.id<70000).every(n=>n.schedule.at.toDateString()===new Date().toDateString()));
        }
    }
});
test('individual prayer switch reschedules current verified timings',async()=>{
    const h=harness({settings:{adhan:true}});
    h.service.setPrayerEnabled('asr',false);
    await new Promise(r=>setImmediate(r));
    assert.equal(h.calls.native.length,1);
    assert.equal(h.calls.native[0].enabledPrayers.asr,false);
});
test('daily and fasting reminders work without prayer timings and stop when disabled',async()=>{
    const h=harness({verified:false,settings:{morning:true,fasting:true}});
    assert.equal((await h.service.scheduleLocalNotifications()).success,true);
    assert.ok(h.calls.local.some(n=>n.extra.type==='morning_azkar'));
    assert.ok(h.calls.local.some(n=>n.extra.type==='fasting'));
    assert.equal(h.calls.native.length,0);
    h.data.set('smart_notify_settings',JSON.stringify(off));
    h.calls.local.length=0;
    await h.service.scheduleLocalNotifications();
    assert.equal(h.calls.local.length,0);
    assert.ok(h.calls.legacy>0);
});
test('denied permission never reports scheduling or test success',async()=>{
    const h=harness({permission:'denied',settings:{adhan:true}});
    assert.equal((await h.service.schedulePrayers()).success,false);
    assert.equal((await h.service.testNotification()).success,false);
    assert.equal((await h.service.scheduleBackgroundDiagnosticTest()).success,false);
    assert.equal(h.calls.native.length+h.calls.local.length,0);
    assert.equal(h.calls.test,undefined);
});
test('background diagnostic requires exact alarms, and web does not claim background delivery',async()=>{
    const denied=harness({exact:false});
    assert.equal((await denied.service.scheduleBackgroundDiagnosticTest()).success,false);
    const web=harness({platform:'web'});
    assert.equal((await web.service.scheduleBackgroundDiagnosticTest()).success,false);
    delete web.context.Capacitor;
    assert.equal((await web.service.testNotification()).success,false);
    assert.equal((await web.service.checkPermissionsStatus()).notificationsGranted,false);
    const allowed=harness();
    assert.equal((await allowed.service.scheduleBackgroundDiagnosticTest()).success,true);
    assert.equal(allowed.calls.diagnostic,true);
});
test('stale date or changed location never schedules prayer times',async()=>{
    const h=harness({settings:{adhan:true}});
    h.data.set('selected_prayer_city','London');
    await h.service.schedulePrayers();
    assert.equal(h.calls.native.length,0);
    h.data.set('selected_prayer_city','Cairo');
    h.data.set('zad_prayer_verified',JSON.stringify({date:'2000-01-01',city:'Cairo',method:'',school:'0'}));
    await h.service.schedulePrayers();
    assert.equal(h.calls.native.length,0);
});
test('failed OS scheduling is surfaced and invalid intervals are normalized',async()=>{
    const h=harness({settings:{morning:true,salawatInterval:-5,morningTime:'99:99'}});
    h.local.schedule=async()=>{throw Error('OS failure');};
    assert.equal((await h.service.schedulePrayers()).success,false);
    assert.equal(h.service.getNotificationSettings().salawatInterval,60);
    assert.equal(h.service.getNotificationSettings().morningTime,'06:30');
});
