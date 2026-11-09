(function(root){
    'use strict';
    const KEY='zad_reading_preferences';
    const fonts={amiri:['أميري','Amiri'],naskh:['نسخ','Noto Naskh Arabic'],scheherazade:['شهرزاد','Scheherazade New'],cairo:['القاهرة','Cairo']};
    const defaults={size:100,font:'amiri',showMarks:true};
    const selector=['.azkar-text','.azkar-virtue span','.hadith-text','.sadaqa-hadith-text','#wisdom-hadith-text','#wisdom-hadith-lesson','.hadith-explanation','.hadith-meaning','.hadith-lesson','.pg-prohibition-hadith','.pg-prohibition-explanation','.pg-card-intro','.pg-item-detail','.cat-dua-body','.cat-dua-source','.fasting-dua-text','.mood-dua-text','.mood-dua-note','.dua-text','.cemetery-dua-text','.prophetic-text'].join(',');
    // Preserve combining hamza and madda, which are parts of letters.
    const stripMarks=text=>text.replace(/[\u0610-\u061A\u064B-\u0652\u0656-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED]/g,'');
    const get=key=>{try{return localStorage.getItem(key);}catch{return null;}};
    function clean(value){
        const size=Number(value?.size);
        return {size:Number.isFinite(size)&&size>=100&&size<=200?Math.round(size/10)*10:100,font:Object.prototype.hasOwnProperty.call(fonts,value?.font)?value.font:'amiri',showMarks:typeof value?.showMarks==='boolean'?value.showMarks:true};
    }
    function load(){
        const raw=get(KEY);
        if(raw!==null){try{return clean(JSON.parse(raw));}catch{return {...defaults};}}
        for(const group of ['azkar','hadith']){
            const size=get('zad_reading_font_'+group),options=get('zad_reading_font_'+group+'_options');
            if(size===null&&options===null)continue;
            let parsed={};try{parsed=JSON.parse(options)||{};}catch{}
            return clean({...parsed,size:size===null?100:Number(size)});
        }
        return {...defaults,size:({large:120,larger:140})[get('zad_font_size')]||100};
    }
    let preferences=load(),initialized=false,controls;
    const texts=new Map(),originals=new WeakMap();
    function write(){try{localStorage.setItem(KEY,JSON.stringify(preferences));}catch{}}
    function renderText(node){
        const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let text;
        while((text=walker.nextNode())){
            if(text.parentElement?.closest('button,select,input,textarea,a,svg,[aria-hidden="true"]'))continue;
            const previous=originals.get(text);
            const original=previous&&text.data===previous.rendered?previous.original:text.data;
            const rendered=preferences.showMarks?original:stripMarks(original);
            originals.set(text,{original,rendered});if(text.data!==rendered)text.data=rendered;
        }
    }
    function apply(node,base){
        node.style.fontFamily=`'${fonts[preferences.font][1]}', serif`;
        node.style.fontSize=`${base*preferences.size/100}rem`;
        node.style.overflowWrap='anywhere';renderText(node);
    }
    function paint(){
        texts.forEach((base,node)=>{if(!node.isConnected)texts.delete(node);else apply(node,base);});
        if(!controls?.isConnected)return;
        controls.querySelector('select').value=preferences.font;
        controls.querySelector('[data-size]').value=preferences.size;
        controls.querySelector('[data-size]').setAttribute('aria-valuetext',preferences.size+'٪');
        const output=controls.querySelector('output'),label=preferences.size+'٪';if(output.textContent!==label)output.textContent=label;
        controls.querySelector('[data-marks]').checked=preferences.showMarks;
        controls.querySelector('[data-step="-10"]').disabled=preferences.size===100;
        controls.querySelector('[data-step="10"]').disabled=preferences.size===200;
        const preview=controls.querySelector('.reading-font-preview');
        preview.style.fontFamily=`'${fonts[preferences.font][1]}', serif`;
        preview.style.fontSize=1.3*preferences.size/100+'rem';
        const sample='اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ';
        const text=preferences.showMarks?sample:stripMarks(sample);if(preview.textContent!==text)preview.textContent=text;
    }
    function update(value){preferences=clean({...preferences,...value});write();paint();}
    function mount(){
        const host=document.getElementById('settings-reading-controls');if(!host||controls?.isConnected)return;
        controls=document.createElement('div');controls.className='reading-font-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','الخط والقراءة');
        controls.innerHTML=`<label class="reading-font-choice">نوع الخط<select aria-label="نوع خط القراءة">${Object.entries(fonts).map(([value,item])=>`<option value="${value}">${item[0]}</option>`).join('')}</select></label><label class="reading-font-size-label" for="reading-size-slider">حجم الخط <output for="reading-size-slider" aria-live="polite"></output></label><div class="reading-font-size"><button type="button" data-step="-10" aria-label="تصغير خط القراءة">أ −</button><input id="reading-size-slider" data-size type="range" min="100" max="200" step="10" aria-label="حجم خط القراءة"><button type="button" data-step="10" aria-label="تكبير خط القراءة">أ +</button></div><label class="reading-font-marks"><input type="checkbox" data-marks> إظهار التشكيل</label><p class="reading-font-preview" aria-label="معاينة القراءة" dir="rtl"></p><button type="button" data-reset>استعادة الافتراضي</button><p class="reading-font-save-note" role="status" aria-live="polite"></p>`;
        const saved=()=>{controls.querySelector('.reading-font-save-note').textContent='تم حفظ إعدادات القراءة وتطبيقها.';};
        controls.addEventListener('change',event=>{if(event.target.matches('select'))update({font:event.target.value});else if(event.target.matches('[data-marks]'))update({showMarks:event.target.checked});else if(event.target.matches('[data-size]'))update({size:Number(event.target.value)});else return;saved();});
        controls.querySelector('[data-size]').addEventListener('input',event=>update({size:Number(event.target.value)}));
        controls.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-reset'))update(defaults);else update({size:Math.max(100,Math.min(200,preferences.size+Number(button.dataset.step)))});saved();});
        host.append(controls);paint();
    }
    function scan(){
        if(!root.document)return;
        document.querySelectorAll(selector).forEach(node=>{
            if(node.closest('#quran-khatma,.golden-quran-page,.reading-font-controls'))return;
            if(!texts.has(node)){
                node.classList.add('reading-text-custom');
                const base=parseFloat(getComputedStyle(node).fontSize)/parseFloat(getComputedStyle(document.documentElement).fontSize);
                texts.set(node,Number.isFinite(base)&&base>0?base:1.2);
            }
            apply(node,texts.get(node));
        });
        texts.forEach((_,node)=>{if(!node.isConnected)texts.delete(node);});mount();
    }
    function refresh(){preferences=load();paint();scan();}
    function originalText(node){
        if(node.nodeType===3){
            const previous=originals.get(node);
            return previous&&node.data===previous.rendered?previous.original:node.data;
        }
        return Array.from(node.childNodes,originalText).join('');
    }
    function init(){
        if(initialized)return;initialized=true;document.documentElement.removeAttribute('data-reading-size');write();scan();
        new MutationObserver(records=>{
            if(records.some(record=>{const node=record.target.nodeType===1?record.target:record.target.parentElement;return !node?.closest('.reading-font-controls')&&(record.type==='characterData'||record.addedNodes.length||record.removedNodes.length);}))scan();
        }).observe(document.body,{childList:true,subtree:true,characterData:true});
        root.addEventListener('storage',event=>{if(event.key===KEY||event.key===null)refresh();});
        document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
    }
    root.ZadReadingSettings={get:()=>({...preferences}),set:update,refresh,originalText,key:KEY};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window);
