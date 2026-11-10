const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const source=fs.readFileSync('assets/js/route-loading.js','utf8');
function setup(hash='') {
 const dom=new JSDOM('<!doctype html><html lang="ar"><head></head><body><a id="page" href="services.html">services</a><a id="hash" href="#home">home</a><a id="external" href="https://example.com/">external</a></body></html>',{url:'https://zad.test/index.html'+hash,runScripts:'outside-only'});
 const w=dom.window,frames=[],timers=new Map();let seq=0;
 Object.defineProperty(w.document,'readyState',{value:'loading',configurable:true});
 w.requestAnimationFrame=fn=>frames.push(fn);
 w.setTimeout=(fn,ms)=>{timers.set(++seq,{fn,ms});return seq;};w.clearTimeout=id=>timers.delete(id);
 w.eval(source);
 return {dom,w,d:w.document,frames,timers,paint(){while(frames.length)frames.shift()();}};
}
test('loader mounts immediately outside the hidden body and waits for the ready paint',()=>{
 const h=setup('#islamic-media');try{
 assert.equal(h.d.querySelectorAll('#zad-route-loader').length,1);
 assert.equal(h.d.getElementById('zad-route-loader').parentElement,h.d.documentElement);
 h.d.body.style.display='none';h.d.dispatchEvent(new h.w.Event('DOMContentLoaded'));
 assert.ok(h.d.getElementById('zad-route-loader'));h.paint();assert.equal(h.d.getElementById('zad-route-loader'),null);
 assert.equal(h.d.documentElement.classList.contains('zad-excerpts-pending'),false);
 }finally{h.dom.window.close();}
});
test('internal navigation shows loading; cancelled, anchor and external clicks do not',()=>{
 const h=setup();try{
 h.w.ZadRouteLoading.hide();
 const click=(id,cancel=false)=>{const e=new h.w.MouseEvent('click',{bubbles:true,cancelable:true,button:0});if(cancel)e.preventDefault();h.d.addEventListener('click',ev=>ev.preventDefault(),{once:true});h.d.getElementById(id).dispatchEvent(e);};
 click('hash');assert.equal(h.d.getElementById('zad-route-loader'),null);
 click('external');assert.equal(h.d.getElementById('zad-route-loader'),null);
 click('page',true);assert.equal(h.d.getElementById('zad-route-loader'),null);
 click('page');assert.ok(h.d.getElementById('zad-route-loader'));
 h.w.ZadRouteLoading.show();assert.equal(h.d.querySelectorAll('#zad-route-loader').length,1);
 h.w.dispatchEvent(new h.w.PageTransitionEvent('pageshow',{persisted:true}));assert.equal(h.d.getElementById('zad-route-loader'),null);
 }finally{h.dom.window.close();}
});
test('stale ready callbacks cannot dismiss a new navigation and the fail-safe releases it',()=>{
 const h=setup();try{
 h.w.ZadRouteLoading.ready();h.w.ZadRouteLoading.show();h.paint();assert.ok(h.d.getElementById('zad-route-loader'));
 [...h.timers.values()].find(t=>t.ms===12000).fn();assert.equal(h.d.getElementById('zad-route-loader'),null);
 }finally{h.dom.window.close();}
});
