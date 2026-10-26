const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync('assets/js/quran.js', 'utf8');
function setup() {
 const dom = new JSDOM('<div id="origin"><div id="golden-quran-wrapper"><button id="golden-btn-fullscreen"><i id="golden-fullscreen-icon"></i></button><div id="golden-mushaf-viewport"><button id="edge"></button></div></div></div>', { runScripts: 'outside-only' });
 const w=dom.window;
 w.visualViewport = new w.EventTarget(); w.visualViewport.scale=1; w.visualViewport.height=640;
 w.eval('let currentPageNumber=10; const TOTAL_MUSHAF_PAGES=604; let dual=false; function isDualPageMode(){return dual;} function goToMushafPage(n){currentPageNumber=n;} window.page=()=>currentPageNumber; window.setDual=()=>dual=true;'+source.slice(source.indexOf('function setupTouchSwipe()'),source.indexOf('// التنقل بمفاتيح الأسهم'))+source.slice(source.indexOf('function setupGoldenFullScreen()'),source.indexOf('// ==========================================================================',source.indexOf('function setupGoldenFullScreen()')+50))+';setupTouchSwipe();setupGoldenFullScreen();');
 const viewport=w.document.getElementById('golden-mushaf-viewport');
 const touch=(type,points,changed=points)=>{const e=new w.Event(type,{bubbles:true});e.touches=points.map(([x,y])=>({clientX:x,clientY:y}));e.changedTouches=changed.map(([x,y])=>({clientX:x,clientY:y}));viewport.dispatchEvent(e);};
 return {w,dom,touch};
}
test('single swipe turns once, synthetic click is suppressed, dual spread advances two',()=>{
 const h=setup();let clicks=0;h.w.document.getElementById('edge').onclick=()=>clicks++;
 h.touch('touchstart',[[100,100]]);h.touch('touchend',[],[[200,105]]);
 assert.equal(h.w.page(),11);h.w.document.getElementById('edge').click();assert.equal(clicks,0);
 h.w.setDual();h.touch('touchstart',[[100,100]]);h.touch('touchend',[],[[200,105]]);assert.equal(h.w.page(),13);h.dom.window.close();
});
test('pinch, zoomed pan, vertical scrolling and cancelled touches never turn pages',()=>{
 const h=setup();h.touch('touchstart',[[100,100]]);h.touch('touchstart',[[100,100],[200,100]]);h.touch('touchend',[],[[250,100]]);assert.equal(h.w.page(),10);
 h.w.visualViewport.scale=2;h.touch('touchstart',[[100,100]]);h.touch('touchend',[],[[250,100]]);assert.equal(h.w.page(),10);
 h.w.visualViewport.scale=1;h.touch('touchstart',[[100,100]]);h.touch('touchend',[],[[110,300]]);
 h.touch('touchstart',[[100,100]]);h.touch('touchcancel',[]);h.touch('touchend',[],[[250,100]]);assert.equal(h.w.page(),10);h.dom.window.close();
});
test('fullscreen escapes clipped ancestors, tracks viewport height and restores DOM and scrolling',()=>{
 const h=setup(),d=h.w.document,b=d.getElementById('golden-btn-fullscreen'),reader=d.getElementById('golden-quran-wrapper');d.body.style.overflow='auto';
 b.click();assert.equal(reader.parentElement,d.body);assert.equal(reader.style.getPropertyValue('--mushaf-screen-height'),'640px');assert.equal(d.body.style.overflow,'hidden');
 h.w.visualViewport.height=400;h.w.visualViewport.dispatchEvent(new h.w.Event('resize'));assert.equal(reader.style.getPropertyValue('--mushaf-screen-height'),'400px');
 b.click();assert.equal(reader.parentElement.id,'origin');assert.equal(d.body.style.overflow,'auto');assert.equal(b.getAttribute('aria-pressed'),'false');
 b.click();h.w.dispatchEvent(new h.w.Event('popstate'));assert.equal(reader.parentElement.id,'origin');h.dom.window.close();
});
