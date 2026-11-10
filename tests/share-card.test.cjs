const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');
const source = fs.readFileSync('assets/js/share-card-generator.js', 'utf8');
function setup() {
    const dom = new JSDOM('<button id="open">Open</button>', {runScripts:'outside-only',url:'https://example.com'});
    const w = dom.window, draws = [];
    const ctx = new Proxy({font:'', measureText(text) { return {width:[...text.replace(/[\u064b-\u065f]/g,'')].length * (parseFloat(this.font.match(/\d+/)?.[0]) || 30)*.5}; },
        fillText(text,x,y) { draws.push({text,x,y}); }, createLinearGradient() {return {addColorStop(){}};}
    }, {get(target,key) {return key in target ? target[key] : ()=>{};}});
    w.HTMLCanvasElement.prototype.getContext = () => ctx;
    w.HTMLCanvasElement.prototype.toBlob = function(callback) {callback(new w.Blob(['PNG-'+this.height],{type:'image/png'}));};
    w.HTMLCanvasElement.prototype.toDataURL = function() {return 'data:image/png;base64,PNG'+this.height;};
    w.eval(source);
    return {dom,w,g:w.ShareCardGenerator,ctx,draws};
}
const ready = () => new Promise(resolve=>setImmediate(resolve));
test('daily card offers both image formats, hides copy, and closes with focus restored',async()=>{
    const {dom,w,g}=setup();
    try {
        w.document.getElementById('open').focus();
        g.openModal({text:'إِنَّ مَعَ الْعُسْرِ يُسْرًا',ref:'سورة الشرح: ٦',dailyVerse:true});await ready();
        assert.ok(g.prepared.file instanceof w.File);
        assert.equal(w.document.querySelector('canvas').height,1920);
        assert.equal(w.document.querySelector('.btn-copy-story-text').hidden,true);
        g.switchFormat('square');await ready();assert.equal(w.document.querySelector('canvas').height,1080);
        assert.equal(g.prepared.file.name,'zadmuslim-square.png');
        assert.equal(w.document.querySelector('[data-format="square"]').getAttribute('aria-pressed'),'true');
        g.closeModal();assert.equal(w.document.activeElement.id,'open');assert.equal(g.prepared,null);
    } finally {dom.window.close();}
});
test('all daily verses and a long verse keep every word within the available text box',()=>{
    const {dom,g,ctx}=setup();
    try {
        const app=fs.readFileSync('assets/js/app.js','utf8');
        const texts=[...app.slice(app.indexOf('const DAILY_QURAN_VERSES'),app.indexOf('function initDailyQuranVerse')).matchAll(/text: "([^"]+)"/g)].map(m=>m[1]);
        assert.ok(texts.length>10);texts.push('إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ '.repeat(40).trim());
        for(const text of texts)for(const height of [480,1050]){
            const result=g.fitText(ctx,text,820,height);
            assert.equal(result.lines.join(' '),text.replace(/\s+/g,' '));
            assert.ok(result.lines.length*result.lineHeight<=height);
            assert.ok(result.lines.every(line=>ctx.measureText(line).width<=820));
        }
    } finally {dom.window.close();}
});
test('sharing uses a prepared PNG immediately and cancellation never downloads or copies',async()=>{
    const {dom,w,g}=setup();
    try {
        g.openModal({text:'آية',ref:'مرجع'});await ready();let called=false;
        w.navigator.canShare=()=>true;
        w.navigator.share=({files})=>{called=true;assert.equal(files[0],g.prepared.file);return Promise.reject(new w.DOMException('Cancelled','AbortError'));};
        w.URL.createObjectURL=()=>{throw Error('Unexpected download');};
        const result=g.shareDirectlyToStory();assert.ok(called);await result;
        assert.equal(g.sharing,false);
        assert.doesNotMatch(w.document.getElementById('share-card-status').textContent,/تعذّر/);
    } finally {dom.window.close();}
});
test('new format wins over stale font loading and native sharing receives its matching image',async()=>{
    const {dom,w,g}=setup();
    try {
        const waits=[];Object.defineProperty(w.document,'fonts',{value:{load:()=>new Promise(r=>waits.push(r))}});
        g.openModal({text:'آية',ref:'مرجع'});g.switchFormat('square');
        waits.slice(2).forEach(r=>r());await ready();assert.equal(g.prepared.base64,'PNG1080');
        waits.slice(0,2).forEach(r=>r());await ready();assert.equal(g.prepared.base64,'PNG1080');
        let payload;w.Capacitor={isPluginAvailable:()=>true,Plugins:{ImageShare:{share:async value=>{payload=value;}}}};
        await g.shareDirectlyToStory();assert.equal(payload.base64,'PNG1080');
    } finally {dom.window.close();}
});
