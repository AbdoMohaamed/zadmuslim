const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/extended-modules.js','utf8');
const start = source.indexOf('let pushRegistrationTask = null;');
const code = source.slice(start, source.indexOf('\n/**',start));
function setup({permission='granted',native=false,error=null,ready=true}={}) {
    const calls={auth:0,subscribe:0,writes:[]};
    const key=new Uint8Array([1,2,3]);
    const subscription={options:{applicationServerKey:key.buffer},toJSON:()=>({endpoint:'https://push.test/sub',keys:{auth:'a',p256dh:'p'}})};
    const auth={currentUser:null,signInAnonymously:async()=>{calls.auth++;if(error)throw {code:error};return {user:{uid:'visitor'}};}};
    const db={ref:path=>({set:async value=>calls.writes.push({path,value})})};
    const firebase={auth:()=>auth,database:{ServerValue:{TIMESTAMP:123}}};
    const reg={active:ready,pushManager:{getSubscription:async()=>subscription,subscribe:async()=>{calls.subscribe++;return subscription;}}};
    const context={Promise,Uint8Array,Array,Notification:{permission},PushManager:function(){},
        navigator:{serviceWorker:{getRegistration:async()=>reg},userAgent:'test',platform:'Web',language:'ar'},
        document:{getElementById:()=>null,querySelector:()=>null},
        Capacitor:{isNativePlatform:()=>native},firebase,getSafeFirebaseDb:()=>db,
        ZAD_VAPID_PUBLIC_KEY:'key',urlBase64ToUint8Array:()=>key};
    context.window=context;
    vm.createContext(context);vm.runInContext(code,context);
    return {calls,context,auth,reg};
}
test('web push never creates anonymous accounts without permission or on native mobile',async()=>{
    for(const opts of [{permission:'default'},{permission:'denied'},{native:true},{ready:false}]) {
        const h=setup(opts);await h.context.registerPushSubscriberInFirebase();
        assert.equal(h.calls.auth,0);assert.equal(h.calls.writes.length,0);
    }
});
test('simultaneous push registration calls share one auth request and write a real subscription',async()=>{
    const h=setup();await Promise.all([h.context.registerPushSubscriberInFirebase(),h.context.registerPushSubscriberInFirebase()]);
    assert.equal(h.calls.auth,1);assert.equal(h.calls.writes.length,1);
    assert.equal(h.calls.writes[0].path,'push_subscribers/visitor');
    assert.ok(h.calls.writes[0].value.subscription.endpoint);
    assert.equal(h.context.ZadPushRegistrationState.status,'registered');
});
test('Firebase configuration errors are visible, suppress automatic retries, and permit an explicit retry',async()=>{
    const h=setup({error:'auth/configuration-not-found'});
    const result=await h.context.registerPushSubscriberInFirebase();
    assert.equal(result.status,'configuration-required');
    assert.match(result.message,/Anonymous/);
    await h.context.registerPushSubscriberInFirebase();
    assert.equal(h.calls.auth,1);assert.equal(h.calls.writes.length,0);
    h.auth.signInAnonymously=async()=>{h.calls.auth++;return {user:{uid:'visitor'}};};
    assert.equal((await h.context.registerPushSubscriberInFirebase({retry:true})).status,'registered');
    assert.equal(h.calls.auth,2);
});
test('a failed subscription never creates an empty subscriber record',async()=>{
    const h=setup();h.reg.pushManager.getSubscription=async()=>null;
    h.reg.pushManager.subscribe=async()=>{throw Error('Subscription failed');};
    assert.equal((await h.context.registerPushSubscriberInFirebase()).status,'failed');
    assert.equal(h.calls.writes.length,0);
});
