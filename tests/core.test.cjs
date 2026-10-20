const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { makeBackup, validateBackup, restoreBackup } = require('../assets/js/user-tools');
function storage(initial = {}) {
    const map = new Map(Object.entries(initial));
    return { get length() { return map.size; }, key(i) { return [...map.keys()][i]; },
        getItem(k) { return map.get(k) ?? null; }, setItem(k,v) { map.set(k,v); }, removeItem(k) { map.delete(k); } };
}
test('backup includes progress and excludes credentials, GPS and cloud data', () => {
    const data = makeBackup(storage({ zad_admin_pin:'secret', gps_prayer_coords:'private',
        zad_quran_bookmarks:'[{"page":1,"surahName":"الفاتحة"}]', zad_smart_khatma_plan:'{"days":30}', 'azkar_progress_morning_Tue Oct 20 2026':'{}',
        'firebase:authUser:example':'secret', zad_note_p3:'ملاحظة', zad_custom_media:'{}' }));
    assert.deepEqual(Object.keys(data.data).sort(), ['azkar_progress_morning_Tue Oct 20 2026','zad_note_p3','zad_quran_bookmarks','zad_smart_khatma_plan']);
    assert.equal(validateBackup(data).length, 4);
});
test('backup rejects malicious keys and malformed progress before mutation', () => {
    assert.throws(() => validateBackup({app:'zad-muslim',version:1,data:{zad_admin_pin:'new'}}));
    assert.throws(() => validateBackup({app:'zad-muslim',version:1,data:{zad_quran_bookmarks:'invalid'}}));
    assert.throws(() => validateBackup({app:'other',version:1,data:{}}));
});
test('restore preserves unrelated data and rolls back on storage failure', () => {
    const data = {app:'zad-muslim',version:1,data:{mushaf_last_page:'10',zad_note_p2:'new',wird_streak_history:'{"2026-10-20":true}',zadTasks:'{"date":"2026-10-20","tasks":{}}'}};
    const target = storage({mushaf_last_page:'3',unrelated:'keep'});
    restoreBackup(target,data);
    assert.equal(target.getItem('mushaf_last_page'),'10'); assert.equal(target.getItem('unrelated'),'keep');
    const original = target.setItem; let failed = false;
    target.setItem = (key,val) => { if(key==='zad_note_p2' && !failed){failed=true;throw Error('Quota');} original(key,val); };
    assert.throws(() => restoreBackup(target,{...data,data:{mushaf_last_page:'20',zad_note_p2:'next'}}));
    assert.equal(target.getItem('mushaf_last_page'),'10'); assert.equal(target.getItem('zad_note_p2'),'new');
});
test('all application scripts and inline scripts parse', () => {
    for (const name of fs.readdirSync('assets/js').filter(n => n.endsWith('.js'))) new vm.Script(fs.readFileSync('assets/js/'+name,'utf8'), {filename:name});
    for (const name of ['app.html','index.html','services.html','settings.html','admin.html']) {
        const text = fs.readFileSync(name,'utf8');
        for (const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
            if (match[1].includes('application/ld+json')) { JSON.parse(match[2]); continue; }
            if (match[2].trim()) new vm.Script(match[2],{filename:name});
        }
    }
});
test('local script and stylesheet references resolve', () => {
    for (const name of ['app.html','index.html','services.html','settings.html','admin.html']) {
        for (const m of fs.readFileSync(name,'utf8').matchAll(/(?:src|href)="(assets\/[^"<>]+\.(?:js|css)(?:\?[^"<>]*)?)"/g)) {
            assert.ok(fs.existsSync(m[1].split('?')[0]), name + ': ' + m[1]);
        }
    }
    for (let i=1;i<=604;i++) assert.ok(fs.existsSync('assets/quran-pages/'+String(i).padStart(3,'0')+'.svg'));
});
function response() { return { statusCode:200, setHeader(){}, status(n){this.statusCode=n;return this;}, json(v){this.body=v;return this;} }; }
test('admin authorization rejects missing tokens, invalid sessions and non-admins', async () => {
    const { authorize } = require('../server/admin-auth');
    const original = global.fetch;
    const oldKey = process.env.FIREBASE_WEB_API_KEY, oldUids = process.env.ADMIN_UIDS;
    try {
        process.env.FIREBASE_WEB_API_KEY='test'; process.env.ADMIN_UIDS='admin1';
        let res=response(); assert.equal(await authorize({headers:{}},res),null); assert.equal(res.statusCode,401);
        global.fetch=async()=>({ok:false,json:async()=>({})});
        res=response(); await authorize({headers:{authorization:'Bearer invalid'}},res); assert.equal(res.statusCode,401);
        global.fetch=async()=>({ok:true,json:async()=>({users:[{localId:'visitor'}]})});
        res=response(); await authorize({headers:{authorization:'Bearer valid'}},res); assert.equal(res.statusCode,403);
        global.fetch=async()=>({ok:true,json:async()=>({users:[{localId:'admin1'}]})});
        res=response(); assert.equal((await authorize({headers:{authorization:'Bearer valid'}},res)).uid,'admin1');
    } finally {
        global.fetch=original;
        for(const [key,value] of [['FIREBASE_WEB_API_KEY',oldKey],['ADMIN_UIDS',oldUids]]) {if(value===undefined)delete process.env[key];else process.env[key]=value;}
    }
});
test('push endpoint cannot send without authentication or accept GET', async () => {
    const handler = require('../api/send-push');
    let res=response(); await handler({method:'POST',headers:{},body:{title:'x',body:'x'}},res); assert.equal(res.statusCode,401);
    res=response(); await handler({method:'GET',headers:{}},res); assert.equal(res.statusCode,405);
});
test('authenticated push rejects external links and never reports delivery with no subscribers', async () => {
    const keys = require('web-push').generateVAPIDKeys();
    const env = {...process.env}, original = global.fetch;
    try {
        Object.assign(process.env, { FIREBASE_WEB_API_KEY:'test',ADMIN_UIDS:'admin1',
            FIREBASE_DATABASE_URL:'https://db.test',VAPID_PUBLIC_KEY:keys.publicKey,VAPID_PRIVATE_KEY:keys.privateKey });
        delete process.env.ONESIGNAL_APP_ID; delete process.env.ONESIGNAL_REST_API_KEY;
        delete require.cache[require.resolve('../api/send-push')];
        const handler = require('../api/send-push');
        const calls = [];
        global.fetch = async url => {
            calls.push(url);
            return {ok:true,json:async()=>url.includes('accounts:lookup') ? {users:[{localId:'admin1'}]} : null};
        };
        const request = { method:'POST',headers:{authorization:'Bearer valid'},body:{title:'اختبار',body:'نص',url:'https://outside.test'} };
        let res=response(); await handler(request,res); assert.equal(res.statusCode,400);
        request.body.url='./'; request.body.onesignalRestKey='client-secret-must-be-ignored';
        res=response(); await handler(request,res);
        assert.equal(res.statusCode,200);assert.equal(res.body.success,false);assert.equal(res.body.sentCount,0);
        assert.ok(calls.every(url=>!url.includes('onesignal')));
    } finally {
        global.fetch=original;
        for(const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key];
        Object.assign(process.env,env);
        delete require.cache[require.resolve('../api/send-push')];
    }
});

test('spiritual garden deeds and interactive tree increment with tasbeeh and quran', () => {
    const store = storage();
    const sandbox = {
        localStorage: store,
        document: {
            getElementById: () => null,
            addEventListener: () => {},
        },
        window: {},
        CustomEvent: function(name, opts) { this.name = name; this.detail = opts ? opts.detail : null; }
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);

    const extCode = fs.readFileSync('assets/js/extended-modules.js', 'utf8');
    vm.runInContext(extCode, sandbox);

    assert.equal(typeof sandbox.window.addSpiritualGardenDeed, 'function');

    // 1. Tasbeeh increment (+1 deed, +1 point)
    sandbox.window.addSpiritualGardenDeed('tasbeeh', 1);
    const today = new Date().toISOString().slice(0, 10);
    let garden = JSON.parse(store.getItem(`spiritual_garden_${today}`));
    assert.equal(garden.points, 1);
    assert.equal(garden.tasbeeh, 1);
    assert.equal(garden.quran, 0);

    // 2. Quran page reading (+1 page, +5 points)
    sandbox.window.addSpiritualGardenDeed('quran', 5, 1);
    garden = JSON.parse(store.getItem(`spiritual_garden_${today}`));
    assert.equal(garden.points, 6);
    assert.equal(garden.tasbeeh, 1);
    assert.equal(garden.quran, 1);

    // 3. Multi-page completion (+4 pages, +20 points)
    sandbox.window.addSpiritualGardenDeed('quran', 20, 4);
    garden = JSON.parse(store.getItem(`spiritual_garden_${today}`));
    assert.equal(garden.points, 26);
    assert.equal(garden.quran, 5);
    assert.equal(garden.tasbeeh, 1);
});

