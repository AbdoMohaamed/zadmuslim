const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const source=fs.readFileSync('assets/js/reading-font.js','utf8');
const text='أَذْكَارٌ إِيمَانٌ آيَةٌ ا\u0654 ا\u0655 ا\u0653';
function setup(saved={},settings=true,legacy=false){
 const dom=new JSDOM((settings?'<section><div id="settings-reading-controls"></div></section>':'')+'<p class="azkar-text" style="font-size:24px"><strong>'+text+'</strong></p><p class="sadaqa-hadith-text" style="font-size:20px">حَدِيثٌ</p><div class="cat-dua-body">دُعَاءٌ</div><div class="pg-prohibition-explanation">شَرْحٌ</div><div class="azkar-virtue"><span>فَضْلٌ</span></div><div id="quran-khatma"><p class="hadith-text">قُرْآنٌ</p></div><button>زِرٌّ</button>',{url:'https://reading.test',runScripts:'outside-only'});
 const w=dom.window;w.document.documentElement.style.fontSize='16px';if(legacy)w.Object.hasOwn=undefined;for(const [k,v]of Object.entries(saved))w.localStorage.setItem(k,v);w.eval(source);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));return dom;
}
const tick=w=>new Promise(resolve=>w.setTimeout(resolve,0));
test('reading settings work without Object.hasOwn on older supported iOS engines',()=>{
 const d=setup({zad_reading_preferences:'{"size":140,"font":"cairo","showMarks":true}'},true,true),w=d.window;
 try{assert.equal(w.ZadReadingSettings.get().font,'cairo');w.ZadReadingSettings.set({font:'naskh',size:160,showMarks:false});assert.equal(w.document.querySelector('select').value,'naskh');assert.equal(w.document.querySelector('output').textContent,'160٪');assert.equal(w.document.querySelector('.sadaqa-hadith-text').textContent,'حديث');}finally{w.close();}
});
test('one settings panel controls every reading category and preserves Quran, buttons and markup',async()=>{
 const d=setup(),w=d.window;
 try{
  assert.equal(w.document.querySelectorAll('.reading-font-controls').length,1);
  assert.ok(w.document.querySelector('#settings-reading-controls .reading-font-controls'));
  const toggle=w.document.querySelector('[data-marks]');toggle.click();
  assert.equal(w.document.querySelector('.azkar-text').textContent,'أذكار إيمان آية ا\u0654 ا\u0655 ا\u0653');
  assert.equal(w.document.querySelector('.sadaqa-hadith-text').textContent,'حديث');
  assert.equal(w.document.querySelector('.cat-dua-body').textContent,'دعاء');
  assert.equal(w.document.querySelector('.pg-prohibition-explanation').textContent,'شرح');
  assert.equal(w.document.querySelector('.azkar-virtue span').textContent,'فضل');
  assert.equal(w.document.querySelector('#quran-khatma p').textContent,'قُرْآنٌ');
  assert.equal(w.document.querySelector('#quran-khatma p').style.fontSize,'');
  assert.equal(w.document.querySelector('body > button').textContent,'زِرٌّ');
  assert.ok(w.document.querySelector('.azkar-text strong'));
  toggle.click();assert.equal(w.document.querySelector('.azkar-text').textContent,text);
  toggle.click();w.document.querySelector('.azkar-text strong').firstChild.data='ذِكْرٌ جَدِيدٌ';await tick(w);
  assert.equal(w.document.querySelector('.azkar-text').textContent,'ذكر جديد');toggle.click();assert.equal(w.document.querySelector('.azkar-text').textContent,'ذِكْرٌ جَدِيدٌ');
 }finally{w.close();}
});
test('four fonts, shared size and shaping persist across pages without injecting controls into content',async()=>{
 const d=setup(),w=d.window;let saved;
 try{
  const select=w.document.querySelector('select');assert.equal(select.options.length,4);select.value='naskh';select.dispatchEvent(new w.Event('change',{bubbles:true}));
  const slider=w.document.querySelector('[data-size]');slider.value='150';slider.dispatchEvent(new w.Event('input',{bubbles:true}));w.document.querySelector('[data-marks]').click();
  const item=w.document.createElement('p');item.className='mood-dua-text';item.textContent='دُعَاءٌ';w.document.body.append(item);await tick(w);assert.equal(item.textContent,'دعاء');assert.ok(item.style.fontFamily.includes('Noto Naskh Arabic'));
  assert.equal(w.document.querySelector('.azkar-text').style.fontSize,'2.25rem');
  saved={zad_reading_preferences:w.localStorage.getItem('zad_reading_preferences')};
 }finally{w.close();}
 const other=setup(saved,false);
 try{assert.equal(other.window.document.querySelectorAll('.reading-font-controls').length,0);assert.equal(other.window.document.querySelector('.sadaqa-hadith-text').textContent,'حديث');assert.ok(other.window.document.querySelector('.cat-dua-body').style.fontFamily.includes('Noto Naskh Arabic'));assert.equal(other.window.document.querySelector('.azkar-text').style.fontSize,'2.25rem');}finally{other.window.close();}
});
test('existing preferences migrate once and reset replaces all old independent options',()=>{
 for(const [saved,expected]of [[{zad_reading_font_azkar:'150',zad_reading_font_azkar_options:'{"font":"cairo","showMarks":false}'},150],[{zad_font_size:'larger'},140]]){
  const d=setup(saved);try{const w=d.window;assert.equal(w.ZadReadingSettings.get().size,expected);assert.ok(w.localStorage.getItem('zad_reading_preferences'));w.document.querySelector('[data-reset]').click();assert.equal(w.ZadReadingSettings.get().size,100);assert.equal(w.ZadReadingSettings.get().font,'amiri');assert.equal(w.ZadReadingSettings.get().showMarks,true);w.ZadReadingSettings.refresh();assert.equal(w.ZadReadingSettings.get().size,100);}finally{d.window.close();}
 }
});
test('updated storage applies across open pages and malformed preferences are safe',()=>{
 const d=setup({zad_reading_preferences:'null'}),w=d.window;
 try{assert.equal(w.ZadReadingSettings.get().size,100);w.localStorage.setItem('zad_reading_preferences',JSON.stringify({size:170,font:'scheherazade',showMarks:false}));w.dispatchEvent(new w.StorageEvent('storage',{key:'zad_reading_preferences'}));assert.equal(w.document.querySelector('output').textContent,'170٪');assert.equal(w.document.querySelector('.sadaqa-hadith-text').textContent,'حديث');for(let i=0;i<30;i++)w.document.querySelector('[data-step="10"]').click();assert.equal(w.ZadReadingSettings.get().size,200);assert.ok(w.document.querySelector('[data-step="10"]').disabled);}finally{w.close();}
});
