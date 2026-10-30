const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('assets/js/native-adhan-service.js', 'utf8');
const off = { morning:false, evening:false, sleep:false, friday:false, fasting:false, hourlySalawat:false, prePrayer:false, adhan:false };
function harness({platform='android', permission='granted', settings={}, verified=true, exact=true}={}) {
    const calls = {local:[],native:[],reminders:[],cancel:[],legacy:0};
    const data = new Map(Object.entries({
        selected_prayer_city:'Cairo', smart_notify_settings:JSON.stringify({...off,...settings}),
        zad_prayer_verified:JSON.stringify({date:new Date().toLocaleDateString('en-CA'),city:'Cairo',method:'',school:'0',offset:new Date().getTimezoneOffset(),zone:Intl.DateTimeFormat().resolvedOptions().timeZone})
    }));
    const timings={Fajr:'23:51',Dhuhr:'23:52',Asr:'23:53',Maghrib:'23:54',Isha:'23:55'};
    const local = {
        checkPermissions:async()=>({display:permission}),requestPermissions:async()=>({display:permission}),
        createChannel:async()=>{},getPending:async()=>({notifications:[{id:100},{id:70000},{id:99982},{id:1000001}]}),
        cancel:async o=>calls.cancel.push(...o.notifications),schedule:async o=>calls.local.push(...o.notifications),
        checkExactNotificationSetting:async()=>({exact_alarm:exact?'granted':'denied'})
    };
    const native = {
        scheduleReminders:async o=>{calls.reminders=o.reminders;return {success:true};},
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
    assert.ok(h.calls.reminders.some(n=>n.extra.type==='morning_azkar'));
    assert.ok(h.calls.reminders.some(n=>n.extra.type==='fasting'));
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
    h.native.scheduleReminders=async()=>{throw Error('OS failure');};
    assert.equal((await h.service.schedulePrayers()).success,false);
    assert.equal(h.service.getNotificationSettings().salawatInterval,60);
    assert.equal(h.service.getNotificationSettings().morningTime,'06:30');
});


test('salawat and daily reminders repeat in the OS instead of expiring as a finite list',async()=>{
    for (const platform of ['android','ios']) {
        const h=harness({platform,verified:false,settings:{hourlySalawat:true,salawatInterval:45,morning:true,friday:true,fasting:true}});
        await h.service.scheduleLocalNotifications();
        const rules=platform==='android'?h.calls.reminders:h.calls.local;
        assert.equal(rules.filter(n=>n.extra.type==='hourly_salawat').length,1);
        assert.equal(rules.find(n=>n.extra.type==='hourly_salawat').schedule.count,45);
        assert.equal(rules.find(n=>n.extra.type==='morning_azkar').schedule.on.hour,6);
        assert.equal(rules.find(n=>n.extra.type==='friday_kahf').schedule.on.weekday,6);
        assert.deepEqual(Array.from(rules.filter(n=>n.extra.type==='fasting'),n=>n.schedule.on.weekday),[1,4]);
    }
});

test('dated prayer calendar crosses months, uses distinct daily times, caches requests and respects iOS budget',async()=>{
    for (const platform of ['android','ios']) {
        const h=harness({platform,settings:{adhan:true,prePrayer:true,hourlySalawat:true}});
        h.context.zadPrayerApiSource='https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt';
        h.context.AbortSignal={timeout:()=>undefined};
        let requests=0;
        h.context.fetch=async url=>{
            requests++;
            const [,year,month]=url.match(/calendarByCity\/(\d+)\/(\d+)/);
            const data=[];
            for(let day=1;day<=new Date(Number(year),Number(month),0).getDate();day++) {
                const stamp=year+'-'+month.padStart(2,'0')+'-'+String(day).padStart(2,'0');
                data.push({date:{gregorian:{day:String(day)}},timings:Object.fromEntries(['Fajr','Dhuhr','Asr','Maghrib','Isha'].map((key,i)=>[key,stamp+'T'+String(5+i*3).padStart(2,'0')+':'+String(day).padStart(2,'0')+':00+03:00']))});
            }
            return {ok:true,json:async()=>({code:200,data})};
        };
        const result=await h.service.schedulePrayers();
        assert.equal(result.success,true);
        if(platform==='android') {
            const alarms=h.calls.native[0].alarmSchedule;
            assert.ok(alarms.length>=130);
            assert.equal(new Set(alarms.map(n=>n.at)).size,alarms.length);
            assert.ok(alarms.some(n=>n.at>Date.now()+12*86400000));
        } else {
            assert.equal(h.calls.local.filter(n=>n.id<70000).length,50);
            assert.ok(h.calls.local.length<64);
            assert.equal(new Set(h.calls.local.map(n=>n.id)).size,h.calls.local.length);
        }
        const count=requests;
        await h.service.schedulePrayers();
        assert.equal(requests,count);
        h.context.zadPrayerVerified=false;
        await h.service.scheduleLocalNotifications();
        assert.equal(requests,count);
    }
});

test('calendar failure does not invent future prayers and settings changed during fetch are discarded',async()=>{
    const h=harness({settings:{adhan:true}});
    h.context.zadPrayerApiSource='https://api.aladhan.com/v1/timings?latitude=1&longitude=1';
    h.context.AbortSignal={timeout:()=>undefined};
    h.context.fetch=async()=>{throw Error('offline');};
    await h.service.schedulePrayers();
    assert.ok(h.calls.native[0].alarmSchedule.every(n=>new Date(n.at).toDateString()===new Date().toDateString()));
    h.calls.native.length=0;
    h.context.fetch=async()=>{h.data.set('smart_notify_settings',JSON.stringify(off));throw Error('offline');};
    assert.equal((await h.service.schedulePrayers()).success,false);
    assert.equal(h.calls.native.length,0);
});


test('Android reports missing prayer timings while still scheduling salawat',async()=>{
 const h=harness({verified:false,settings:{adhan:true,hourlySalawat:true}});
 const result=await h.service.scheduleLocalNotifications();
 assert.equal(result.success,false);
 assert.equal(result.remindersScheduled,true);
 assert.equal(h.calls.native.length,0);
 assert.equal(h.calls.reminders.length,1);
 assert.match(result.message,/الأذان لم/);
});
test('Android native rejection is surfaced without changing iOS recurring scheduling',async()=>{
 const h=harness({verified:false,settings:{hourlySalawat:true}});
 h.native.scheduleReminders=async()=>({success:false});
 assert.equal((await h.service.scheduleLocalNotifications()).success,false);
 const ios=harness({platform:'ios',verified:false,settings:{hourlySalawat:true}});
 assert.equal((await ios.service.scheduleLocalNotifications()).success,true);
 assert.equal(ios.calls.local[0].schedule.every,'minute');
});

test('iOS missing prayer times reports incomplete setup while keeping recurring reminders',async()=>{
 const h=harness({platform:'ios',verified:false,settings:{adhan:true,hourlySalawat:true}});
 const result=await h.service.scheduleLocalNotifications();
 assert.equal(result.success,false);
 assert.equal(result.remindersScheduled,true);
 assert.ok(h.calls.local.some(n=>n.id===80001));
 assert.ok(h.calls.local.every(n=>n.id>=70000));
});
test('Android prayer plugin failure does not claim full adhan delivery',async()=>{
 const h=harness({settings:{adhan:true,hourlySalawat:true}});
 h.native.schedulePrayerAlarms=async()=>{throw new Error('native unavailable');};
 const result=await h.service.schedulePrayers();
 assert.equal(result.success,false);
 assert.equal(result.remindersScheduled,true);
 assert.ok(h.calls.reminders.some(n=>n.id===80001));
});

test('Android missing exact alarm access reports incomplete setup rather than guaranteed adhan',async()=>{const h=harness({exact:false,settings:{adhan:true,hourlySalawat:true}});const r=await h.service.schedulePrayers();assert.equal(r.success,false);assert.equal(r.remindersScheduled,true);assert.match(r.message,/الدقيقة/);});
test('enabled adhan with no future times does not claim success',async()=>{const h=harness({platform:'ios',settings:{adhan:true}});const r=await h.service.schedulePrayers({Fajr:'00:00',Dhuhr:'00:00',Asr:'00:00',Maghrib:'00:00',Isha:'00:00'});assert.equal(r.success,false);assert.match(r.message,/لا توجد/);});

test('selected salawat voices reach Android channels and iOS bundled WAVs; mute and invalid values are safe',async()=>{
 for(const platform of ['android','ios'])for(const voice of ['default','voice1','voice2','invalid']){
 const h=harness({platform,settings:{hourlySalawat:true,salawatVoice:voice}});await h.service.schedulePrayers();const rules=platform==='android'?h.calls.reminders:h.calls.local;const rule=rules.find(n=>n.extra?.type==='hourly_salawat');const suffix=voice==='voice1'?'_1':voice==='voice2'?'_2':'';assert.equal(rule.sound,'salawat'+suffix+(platform==='ios'?'.wav':'.mp3'));assert.equal(rule.channelId, suffix?'hourly_salawat_'+voice:'hourly_salawat');
 const filename=platform==='ios'?'ios/App/App/salawat'+suffix+'.wav':'android/app/src/main/res/raw/salawat'+suffix+'.mp3';assert.ok(fs.existsSync(filename));
 }
 const h=harness({settings:{hourlySalawat:true,salawatVoice:'voice2',salawatSound:false}});await h.service.schedulePrayers();const rule=h.calls.reminders.find(n=>n.extra.type==='hourly_salawat');assert.equal(rule.sound,null);assert.equal(rule.channelId,'hourly_salawat_silent');
});

test('prayer images are attached on iOS only when enabled and bundled paths exist',async()=>{
 for(const platform of ['ios','android'])for(const enabled of [true,false]){
  const h=harness({platform,settings:{adhan:true,prePrayer:true,prayerImages:enabled}});
  await h.service.schedulePrayers();
  for(const prayer of ['fajr','dhuhr','asr','maghrib','isha']){
   const options=h.service.prayerImageOptions(prayer);
   if(platform==='ios' && enabled){assert.equal(options.attachments[0].url,'res:///assets/images/prayers/pre_'+prayer+'.jpg');assert.ok(fs.existsSync(options.attachments[0].url.replace('res:///','')));}else assert.equal(options.attachments,undefined);
  }
  if(platform==='ios'){for(const n of h.calls.local.filter(n=>n.id<70000)){assert.equal(n.actionTypeId,'OPEN_PRAYER');assert.equal(Boolean(n.attachments),enabled);}}
 }
});
test('iOS dismiss action removes the delivered alert without cancelling future prayers',async()=>{
 const h=harness({platform:'ios'});let listener,types,removed;
 h.local.registerActionTypes=async value=>types=value;
 h.local.addListener=(name,fn)=>{if(name==='localNotificationActionPerformed')listener=fn;};
 h.local.removeDeliveredNotifications=async value=>removed=value;
 await h.service.registerPrayerActions();h.service.setupListeners();
 assert.equal(types.types[0].actions[0].id,'dismiss_adhan');
 listener({actionId:'dismiss_adhan',notification:{id:123}});
 assert.equal(removed.notifications[0].id,123);assert.equal(h.calls.cancel.length,0);
});
test('prayer image references in page and service worker point at actual jpg resources',()=>{
 for(const file of ['assets/js/app.js','sw.js'])assert.doesNotMatch(fs.readFileSync(file,'utf8'),/prayers\/pre_[^\n]*\.jpeg/);
 for(const prayer of ['fajr','dhuhr','asr','maghrib','isha'])assert.ok(fs.readFileSync('assets/images/prayers/pre_'+prayer+'.jpg').equals(fs.readFileSync('android/app/src/main/res/drawable/pre_'+prayer+'.jpg')));
});

test('same-day clock offset mismatch prevents scheduling stale local times',async()=>{
 const h=harness({settings:{adhan:true}});const v=JSON.parse(h.data.get('zad_prayer_verified'));v.offset=new Date().getTimezoneOffset()+60;h.data.set('zad_prayer_verified',JSON.stringify(v));await h.service.schedulePrayers(h.timings);assert.equal(h.calls.native.length,0);assert.equal(h.calls.local.length,0);
});
