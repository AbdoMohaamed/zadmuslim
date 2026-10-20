const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function worker(saved) {
    const handlers = {};
    const ctx = { URL, Response, Request, console, setTimeout, clearTimeout,
        self: { addEventListener(type, fn) { handlers[type] = fn; }, skipWaiting(){}, clients:{claim(){}} },
        caches:{open:async()=>({match:async()=>saved?.clone()}),match:async()=>undefined},
        fetch:async()=>{throw Error('offline');}
    };
    vm.runInNewContext(fs.readFileSync('sw.js','utf8'),ctx);
    return handlers;
}
test('offline downloaded audio supports byte-range playback and rejects invalid ranges',async()=>{
    const handlers=worker(new Response(new Uint8Array([1,2,3,4,5]),{headers:{'content-type':'audio/mpeg'}}));
    let pending;
    handlers.fetch({request:new Request('https://server8.mp3quran.net/afs/001.mp3',{headers:{range:'bytes=1-3'}}),respondWith(p){pending=p;}});
    const res=await pending;
    assert.equal(res.status,206);assert.equal(res.headers.get('content-range'),'bytes 1-3/5');
    assert.deepEqual([...new Uint8Array(await res.arrayBuffer())],[2,3,4]);
    handlers.fetch({request:new Request('https://server8.mp3quran.net/afs/001.mp3',{headers:{range:'bytes=99-'}}),respondWith(p){pending=p;}});
    assert.equal((await pending).status,416);
});
test('private APIs, live prayer requests and admin HTML never enter service worker cache',()=>{
    const handlers=worker(new Response('stale'));
    for(const url of ['https://zad.test/api/send-push','https://zad.test/admin.html','https://api.aladhan.com/v1/timings']){
        let intercepted=false;
        handlers.fetch({request:new Request(url),respondWith(){intercepted=true;}});
        assert.equal(intercepted,false,url);
    }
});
test('downloaded Quran pages remain available offline; missing resources return failure',async()=>{
    let pending;
    let handlers=worker(new Response('<svg>page</svg>'));
    handlers.fetch({request:new Request('https://zad.test/assets/quran-pages/001.svg'),respondWith(p){pending=p;}});
    assert.equal(await (await pending).text(),'<svg>page</svg>');
    handlers=worker(null);
    handlers.fetch({request:new Request('https://zad.test/assets/quran-pages/002.svg'),respondWith(p){pending=p;}});
    assert.equal((await pending).status,503);
});
