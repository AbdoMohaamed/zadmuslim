/* Public developer attribution. Add only the owner's approved name and contact links. */
(function(root,factory){
    const api=factory();
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.ZadAppDeveloper=api;
})(typeof window==='undefined'?globalThis:window,function(){
    'use strict';
    const profile={
        name:'المهندس عبدالمعبود محمد، المعروف باسم عبدو محمد',
        whatsapp:'https://wa.me/abdo_mohamed275?s=p',
        facebook:'https://www.facebook.com/share/1EqcLoYN2v/?mibextid=wwXIfr',
        x:''
    };
    const normalize=text=>String(text||'').normalize('NFC').replace(/[\u064B-\u065F\u0670]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[^\u0600-\u06FFa-z0-9\s]/gi,' ').replace(/\s+/g,' ').trim().toLowerCase();
    function isQuestion(text){
        const q=normalize(text);
        const app=/(تطبيق|برنامج|موقع|ابلكيشن|ابليكشن|ابليكيشن|زاد المسلم)/.test(q);
        const creator=/(^|\s)(مين|من)(\s|$)/.test(q)||/(اسم|صاحب|مطور|مبرمج|مصمم|تطوير|برمجه|تواصل|اتواصل|واتساب|واتس|فيسبوك|فيس|تويتر|حساب)/.test(q);
        return app&&creator&&/(عمل|عامل|صنع|صانع|صمم|برمج|انشا|طور|صاحب|مطور|مبرمج|مصمم|تطوير|برمجه)/.test(q)||/(مين (عملك|برمجك|صممك|طورك)|من (برمجك|صممك|طورك)|مطورك|مبرمجك|(?:رقم|حساب|التواصل مع|لينك) (?:المطور|المبرمج))/.test(q);
    }
    function create(value){
        const name=typeof value.name==='string'?value.name.trim():'';
        const links=[];
        for(const [key,label,hosts]of [['whatsapp','واتساب',['wa.me','api.whatsapp.com']],['facebook','فيسبوك',['facebook.com','www.facebook.com','m.facebook.com','fb.com']],['x','X',['x.com','www.x.com','twitter.com','www.twitter.com']]]){
            try{const url=new URL(value[key]);if(url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&hosts.includes(url.hostname))links.push({label,href:url.href});}catch{}
        }
        return {
            isContact(href){try{return links.some(link=>link.href===new URL(href).href);}catch{return false;}},
            answer(query){if(!name||!isQuestion(query))return null;return {answer:'تطبيق زاد المسلم من تطوير '+name+'.\n'+(links.length?'تقدر تتواصل مع مطوّر التطبيق من الروابط التالية:':''),actions:links.map(link=>({...link}))};},
            instruction(){return name?'معلومة ثابتة: تطبيق زاد المسلم من تطوير '+name+'. روابط المطوّر المعتمدة: '+links.map(link=>link.label+': '+link.href).join('،')+'. لا تنسب التطبيق إلى شخص آخر ولا تختلق بيانات تواصل.':'لا تتوفر بيانات معتمدة عن اسم مطوّر التطبيق أو حساباته. لا تختلق اسمًا أو رقمًا أو رابط تواصل.';}
        };
    }
    return {...create(profile),create,isQuestion};
});
