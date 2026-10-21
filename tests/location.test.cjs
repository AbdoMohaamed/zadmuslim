const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');
function setup({saved,offline=false,denied=false,native=false}={}) {
    const dom = new JSDOM(`<section id="nearby-mosques-section"><button id="btn-find-nearby-mosques"></button><button class="mosques-radius-pill" data-radius="1000"></button><input id="input-mosques-city-search"><button id="btn-mosques-city-search"></button><div id="mosques-status-box"></div><div id="mosques-manual-fallback"></div><div id="mosques-results-list"></div></section>`,{url:'https://example.test/',runScripts:'outside-only'});
    const w=dom.window,calls={gps:0,fetch:0};
    w.AbortController=AbortController;
    Object.defineProperty(w.navigator,'onLine',{value:!offline,configurable:true});
    if(saved) w.localStorage.setItem('gps_prayer_coords',JSON.stringify(saved));
    const coords={latitude:0,longitude:0,accuracy:20};
    w.navigator.geolocation={getCurrentPosition(ok,fail){calls.gps++; if(denied) fail({code:1}); else setTimeout(()=>ok({coords}),5);}};
    if(native) w.Capacitor={isNativePlatform:()=>true,Plugins:{Geolocation:{checkPermissions:async()=>({location:'denied',coarseLocation:'granted'}),getCurrentPosition:async options=>{calls.gps++;calls.options=options;return {coords};}}}};
    w.fetch=async url=>{calls.fetch++;calls.url=url;return {ok:true,json:async()=>({elements:[{id:1,lat:0,lon:0.001,tags:{amenity:'place_of_worship',religion:'muslim',name:'مسجد قريب'}},{id:2,lat:0,lon:0.2,tags:{building:'mosque',name:'مسجد بعيد'}}]})};};
    w.eval(fs.readFileSync('assets/js/location-service.js','utf8'));
    w.eval(fs.readFileSync('assets/js/nearby-mosques.js','utf8'));
    w.initNearbyMosques();
    return {w,dom,calls};
}
test('location service is idle until requested, reuses saved zero coordinates and merges concurrent requests',async()=>{
    const h=setup({saved:{lat:0,lng:0}});
    try{
        assert.equal(h.calls.gps+h.calls.fetch,0);
        assert.equal((await h.w.ZadLocation.get()).lat,0);
        assert.equal(h.calls.gps,0);
        await Promise.all([h.w.ZadLocation.get({refresh:true}),h.w.ZadLocation.get({refresh:true})]);
        assert.equal(h.calls.gps,1);
    }finally{h.dom.window.close();}
});
test('native approximate location permission works without a second browser prompt',async()=>{
    const h=setup({native:true});
    try{await h.w.ZadLocation.get();assert.equal(h.calls.gps,1);assert.equal(h.calls.options.enableHighAccuracy,false);}
    finally{h.dom.window.close();}
});
test('mosques use one spatial query, filter radius, save results, and reuse them offline',async()=>{
    const h=setup({saved:{lat:0,lng:0}});
    try{
        await h.w.requestUserLocationAndFindMosques();
        assert.equal(h.calls.fetch,1);assert.equal(h.calls.gps,0);
        assert.match(h.calls.url,/overpass/);
        assert.match(h.w.document.getElementById('mosques-results-list').textContent,/مسجد قريب/);
        assert.doesNotMatch(h.w.document.getElementById('mosques-results-list').textContent,/مسجد بعيد/);
        Object.defineProperty(h.w.navigator,'onLine',{value:false});
        await h.w.requestUserLocationAndFindMosques();
        assert.equal(h.calls.fetch,1);
        assert.match(h.w.document.getElementById('mosques-status-box').textContent,/محفوظة/);
        assert.equal(h.w.document.getElementById('btn-find-nearby-mosques').disabled,false);
    }finally{h.dom.window.close();}
});
test('denied location never falls back to IP or an invented city',async()=>{
    const h=setup({denied:true});
    try{await h.w.requestUserLocationAndFindMosques();assert.equal(h.calls.gps,1);assert.equal(h.calls.fetch,0);assert.match(h.w.document.getElementById('mosques-status-box').textContent,/مرفوض/);}
    finally{h.dom.window.close();}
});
test('offline without saved mosques gives an explicit error and sends no network requests',async()=>{
    const h=setup({saved:{lat:0,lng:0},offline:true});
    try{await h.w.requestUserLocationAndFindMosques();assert.equal(h.calls.fetch,0);assert.match(h.w.document.getElementById('mosques-status-box').textContent,/لا توجد نتائج محفوظة/);}
    finally{h.dom.window.close();}
});
test('repeated searches share one operation and service failures do not claim there are no mosques',async()=>{
    const h=setup({saved:{lat:0,lng:0}});
    try{
        h.w.fetch=async()=>{h.calls.fetch++;throw Error('network');};
        await Promise.all([h.w.requestUserLocationAndFindMosques(),h.w.requestUserLocationAndFindMosques()]);
        assert.equal(h.calls.fetch,2,'one attempt per endpoint, no automatic radius expansion');
        assert.match(h.w.document.getElementById('mosques-status-box').textContent,/تعذّر الاتصال/);
    }finally{h.dom.window.close();}
});

test('mosque search falls back to Photon and accepts worship places only',async()=>{
    const h=setup({saved:{lat:0,lng:0}});
    try{
        h.w.fetch=async url=>{
            h.calls.fetch++;
            if(url.includes('overpass')) throw Error('unavailable');
            return {ok:true,json:async()=>({features:[
                {geometry:{coordinates:[0.001,0]},properties:{osm_id:1,osm_value:'place_of_worship',name:'مسجد بديل'}},
                {geometry:{coordinates:[0.002,0]},properties:{osm_id:2,osm_value:'school',name:'مدرسة مسجد'}}
            ]})};
        };
        await h.w.requestUserLocationAndFindMosques();
        assert.equal(h.calls.fetch,2);
        assert.match(h.w.document.getElementById('mosques-results-list').textContent,/مسجد بديل/);
        assert.doesNotMatch(h.w.document.getElementById('mosques-results-list').textContent,/مدرسة مسجد/);
    }finally{h.dom.window.close();}
});
