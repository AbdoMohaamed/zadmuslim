const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const wait=()=>new Promise(r=>setTimeout(r,120));
function setup(){const dom=new JSDOM('<section id="nearby-mosques-section"><button id="btn-mosques-view-list"></button><button id="btn-mosques-view-map"></button><div id="mosques-list-container"></div><div id="mosques-map-container"><div id="mosques-leaflet-map"></div></div></section>',{url:'https://zad.test',runScripts:'outside-only'});const w=dom.window;w.eval(fs.readFileSync('assets/js/nearby-mosques.js','utf8'));w.initNearbyMosques();return{w,d:w.document,close:()=>w.close()};}
test('map assets load only on demand, share pending requests and do not open after returning to list',async()=>{
 const h=setup();try{assert.equal(h.d.querySelectorAll('[data-map-resource]').length,0);h.d.getElementById('btn-mosques-view-map').click();h.d.getElementById('btn-mosques-view-map').click();await wait();assert.equal(h.d.querySelectorAll('[data-map-resource]').length,2);h.d.getElementById('btn-mosques-view-list').click();let maps=0;
 const map={setView(){return this;},invalidateSize(){}};h.w.L={map(){maps++;return map;},tileLayer(){return{addTo(){}};},layerGroup(){return{addTo(){return this;},clearLayers(){}};}};
 h.d.querySelectorAll('[data-map-resource]').forEach(el=>el.onload());await wait();assert.equal(maps,0);h.d.getElementById('btn-mosques-view-map').click();await wait();assert.equal(maps,1);assert.equal(h.d.querySelectorAll('[data-map-resource]').length,2);
 }finally{h.close();}
});
test('failed map loading offers retry and offline never requests map assets',async()=>{
 const h=setup();try{Object.defineProperty(h.w.navigator,'onLine',{value:false,configurable:true});h.d.getElementById('btn-mosques-view-map').click();await wait();assert.equal(h.d.querySelectorAll('[data-map-resource]').length,0);assert.match(h.d.getElementById('mosques-leaflet-map').textContent,/الإنترنت/);
 Object.defineProperty(h.w.navigator,'onLine',{value:true});h.d.getElementById('btn-mosques-view-map').click();await wait();h.d.querySelectorAll('[data-map-resource]').forEach(el=>el.onerror());await wait();assert.match(h.d.getElementById('mosques-leaflet-map').textContent,/مجددًا/);assert.equal(h.d.getElementById('mosques-leaflet-map').getAttribute('aria-busy'),'false');h.d.getElementById('btn-mosques-view-map').click();await wait();assert.equal(h.d.querySelectorAll('[data-map-resource]').length,2);
 }finally{h.close();}
});
