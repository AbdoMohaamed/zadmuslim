/* Public developer attribution. Add only the owner's approved name and contact links. */
(function(root,factory){
    const api=factory();
    if(typeof module==='object'&&module.exports)module.exports=api;
    else {
        root.ZadAppDeveloper=api;
        const container=root.document.querySelector('[data-developer-contacts]');
        if(container){
            for(const contact of api.contacts()){
                const link=root.document.createElement('a');
                link.href=contact.href;
                link.textContent=contact.label;
                link.target=root.Capacitor?.isNativePlatform?.() ? '_self' : '_blank';
                link.rel='noopener noreferrer';
                container.appendChild(link);
            }
        }
    }
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
        if (/^(?:مين|من|من هو|من يكون) (?:عبدو(?: محمد)?|عبد المعبود محمد|عبدالمعبود محمد)$/.test(q)) return true;
        if (/(who (made|built|created|developed|owns)|(?:app|application|zad).*(developer|creator)|contact.*developer|developer.*contact|(?:ایپ|اپلیکیشن).*(?:بنای|بنائ|مالک|ڈویلپر)|(?:کس نے).*(?:بنایا|بنائی))/.test(q)) return true;
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
            contacts(){return links.map(link=>({...link}));},
            isContact(href){try{return links.some(link=>link.href===new URL(href).href);}catch{return false;}},
            answer(query,language='ar'){
                if(!name||!isQuestion(query))return null;
                const displayName=name===profile.name?'Engineer Abdel Maaboud Mohamed, known as Abdo Mohamed':name;
                const answer=language==='en'?'Zad Al Muslim was developed by '+displayName+'.\n'+(links.length?'You can contact the developer using these links:':''):language==='ur'?'زاد المسلم کے ڈویلپر انجینئر عبدالمعبود محمد ہیں، جو عبدو محمد کے نام سے معروف ہیں۔\n'+(links.length?'ڈویلپر سے رابطے کے لیے یہ لنکس استعمال کریں:':''):'تطبيق زاد المسلم من تطوير '+name+'.\n'+(links.length?'تقدر تتواصل مع مطوّر التطبيق من الروابط التالية:':'');
                return {answer,actions:links.map(link=>({...link,label:language==='en'?({'واتساب':'WhatsApp','فيسبوك':'Facebook'}[link.label]||link.label):language==='ur'?({'واتساب':'واٹس ایپ','فيسبوك':'فیس بک'}[link.label]||link.label):link.label}))};
            },
            instruction(){return name?'معلومة ثابتة: تطبيق زاد المسلم من تطوير '+name+'. روابط المطوّر المعتمدة: '+links.map(link=>link.label+': '+link.href).join('،')+'. لا تنسب التطبيق إلى شخص آخر ولا تختلق بيانات تواصل.':'لا تتوفر بيانات معتمدة عن اسم مطوّر التطبيق أو حساباته. لا تختلق اسمًا أو رقمًا أو رابط تواصل.';}
        };
    }
    return {...create(profile),create,isQuestion};
});
