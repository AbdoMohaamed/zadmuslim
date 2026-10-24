const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');const {JSDOM}=require('jsdom');
function setup(){const dom=new JSDOM('<title>الرئيسية</title><main>Home</main><div id="live-radio-widget"><audio id="live-radio-audio"></audio><div id="radio-panel"></div></div><a id="services" href="services.html#azkar">Services</a>',{url:'https://zad.test/index.html',runScripts:'outside-only'});dom.window.eval(fs.readFileSync('assets/js/radio-navigation.js','utf8'));return dom;}
test('navigation preserves the exact audio node and player without stopping or restarting',()=>{
 const dom=setup(),w=dom.window,d=w.document;let stops=0;const player={wanted:true,stop(){stops++;}};w.ZadRadioHost.attach(player);const audio=d.querySelector('audio');d.querySelector('#services').click();
 assert.equal(w.location.pathname,'/services.html');assert.equal(d.querySelector('iframe').src,'https://zad.test/services.html#azkar');assert.strictEqual(d.querySelector('audio'),audio);assert.equal(stops,0);
 w.ZadRadioHost.navigate('settings.html');assert.equal(d.querySelectorAll('iframe').length,1);assert.strictEqual(d.querySelector('audio'),audio);
 w.ZadRadioHost.navigate('index.html');assert.equal(d.querySelectorAll('iframe').length,0);assert.strictEqual(d.querySelector('audio'),audio);assert.equal(player.wanted,true);dom.window.close();
});
test('back navigation restores the original page while the player stays mounted',()=>{
 const dom=setup(),w=dom.window;w.ZadRadioHost.attach({wanted:true});w.ZadRadioHost.navigate('services.html');w.history.replaceState({zadRadioRoute:'https://zad.test/index.html'},'','index.html');w.dispatchEvent(new w.PopStateEvent('popstate'));
 assert.equal(w.document.querySelector('iframe'),null);assert.ok(w.document.querySelector('audio'));dom.window.close();
});
test('external routes cannot be loaded into the persistent radio host',()=>{
 const dom=setup(),w=dom.window;w.ZadRadioHost.attach({wanted:true});w.ZadRadioHost.navigate('https://outside.test/services.html');assert.equal(w.document.querySelector('iframe'),null);assert.equal(w.location.origin,'https://zad.test');dom.window.close();
});

test('embedded pages reuse parent radio controls and never create a second player',()=>{
 const dom=setup(),w=dom.window;let stops=0;w.ZadRadioHost.attach({wanted:true,stop(){stops++;}});w.ZadRadioHost.navigate('services.html');
 const child=w.document.querySelector('iframe').contentWindow;child.document.open();child.document.write('<body><div id="live-radio-widget"></div><button id="btn-toggle-radio-nav">Radio</button><audio></audio></body>');child.document.close();
 child.eval(fs.readFileSync('assets/js/radio-navigation.js','utf8'));child.document.dispatchEvent(new child.Event('DOMContentLoaded'));
 assert.equal(child.ZadRadioEmbedded,true);assert.equal(child.document.getElementById('live-radio-widget'),null);
 child.document.getElementById('btn-toggle-radio-nav').click();assert.equal(w.document.getElementById('radio-panel').classList.contains('open'),true);
 child.document.querySelector('audio').dispatchEvent(new child.Event('play'));assert.equal(stops,1);dom.window.close();
});
