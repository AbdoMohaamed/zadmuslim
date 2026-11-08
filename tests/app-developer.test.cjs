const test=require('node:test');
const assert=require('node:assert/strict');
const developer=require('../assets/js/app-developer.js');
const approved=developer.create({name:'اسم تجريبي',whatsapp:'https://wa.me/201000000000',facebook:'https://www.facebook.com/example',x:'https://x.com/example'});
test('approved developer name and supplied contacts appear without an invented X account',()=>{
 const result=developer.answer('مين عمل التطبيق؟');
 assert.match(result.answer,/المهندس عبدالمعبود محمد، المعروف باسم عبدو محمد/);
 assert.deepEqual(result.actions,[{label:'واتساب',href:'https://wa.me/abdo_mohamed275?s=p'},{label:'فيسبوك',href:'https://www.facebook.com/share/1EqcLoYN2v/?mibextid=wwXIfr'}]);
});
test('developer attribution recognizes Arabic creator and contact questions without intercepting app help',()=>{
 for(const query of ['مين عمل التطبيق','مين عامل التطبيق','مين صاحب الابليكشن','من عمل التطبيق؟','من صمّم زاد المسلم؟','مين مطورك','مين عمل تطبيق زاد','عاوز اتواصل مع صاحب التطبيق','لينك المطور']){
  const answer=approved.answer(query);assert.ok(answer,query);assert.match(answer.answer,/اسم تجريبي/);assert.equal(answer.actions.length,3);
 }
 for(const query of ['كيف يعمل التطبيق','ازاي اشغل الراديو','افتح المصحف','ما فضل الصدقة','ازاي اعمل برنامج'])assert.equal(approved.answer(query),null,query);
});
test('chat displays the approved contacts as safe external buttons without calling the model',async()=>{
 const fs=require('node:fs'),{JSDOM}=require('jsdom');
 const dom=new JSDOM('<body></body>',{url:'https://zad.test',runScripts:'outside-only'}),w=dom.window;
 try{
  for(const file of ['app-developer','ask-zad-knowledge','ask-zad'])w.eval(fs.readFileSync('assets/js/'+file+'.js','utf8'));
  w.fetch=()=>{throw Error('developer answers must be local');};
  w.AskZad.init();w.AskZad.send('مين عبدو');
  await new Promise(resolve=>setTimeout(resolve,600));
  const links=[...w.document.querySelectorAll('.ask-zad-action-btn')];
  assert.equal(links.length,2);
  assert.deepEqual(links.map(a=>a.textContent),['واتساب','فيسبوك']);
  assert.ok(links.every(a=>a.target==='_blank'&&a.rel==='noopener noreferrer'));
  assert.match(w.document.querySelector('#ask-zad-messages').textContent,/عبدالمعبود محمد/);
 }finally{w.close();}
});
test('server also returns the approved identity and contacts without provider credentials',async()=>{
 const handler=require('../api/ask-zad.js');
 const res={setHeader(){},status(code){this.code=code;return this;},json(value){this.body=value;return this;}};
 await handler({method:'POST',headers:{origin:'https://localhost','content-type':'application/json'},body:{query:'من هو مطور التطبيق؟'}},res);
 assert.match(res.body.answer,/عبدالمعبود محمد/);assert.match(res.body.answer,/wa\.me\/abdo_mohamed275/);assert.doesNotMatch(res.body.answer,/x\.com/);
});
test('only owner-configured HTTPS contact URLs become external actions',()=>{
 assert.equal(approved.isContact('https://x.com/example'),true);assert.equal(approved.isContact('https://x.com/another'),false);
 const unsafe=developer.create({name:'مطور',whatsapp:'javascript:alert(1)',facebook:'https://facebook.com.evil.test/account',x:'https://user@x.com/example'});
 assert.equal(unsafe.answer('مين عمل التطبيق').actions.length,0);
 assert.equal(developer.create({name:''}).answer('مين عمل التطبيق'),null);
 assert.match(approved.instruction(),/اسم تجريبي/);
});
