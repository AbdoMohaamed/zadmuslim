const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');const {JSDOM}=require('jsdom');
const root='android/app/src/main/';
test('six selectable widget designs have valid resources, all data slots and unlimited horizontal resizing',()=>{
 const manifest=new JSDOM(fs.readFileSync(root+'AndroidManifest.xml','utf8'),{contentType:'text/xml'}).window.document;
 const receivers=[...manifest.querySelectorAll('receiver')].filter(r=>r.getAttribute('android:name').startsWith('.PrayerWidget'));
 assert.equal(receivers.length,6);
 const layouts=new Set();
 for(const receiver of receivers){
  const resource=receiver.querySelector('meta-data').getAttribute('android:resource').split('/')[1];
  const info=new JSDOM(fs.readFileSync(root+'res/xml/'+resource+'.xml','utf8'),{contentType:'text/xml'}).window.document.documentElement;
  assert.equal(info.getAttribute('android:maxResizeWidth'),null);
  assert.match(info.getAttribute('android:resizeMode'),/horizontal/);
  const layout=info.getAttribute('android:initialLayout').split('/')[1];layouts.add(layout);
  const text=fs.readFileSync(root+'res/layout/'+layout+'.xml','utf8');assert.doesNotMatch(text,/زاد المسلم/);
  const doc=new JSDOM(text,{contentType:'text/xml'}).window.document;
  const ids=[...doc.querySelectorAll('*')].map(e=>e.getAttribute('android:id')).filter(Boolean);assert.equal(ids.length,new Set(ids).size);
  for(const id of ['widget_city','widget_root','widget_btn_refresh','widget_txt_hijri_date','widget_txt_gregorian_date','widget_txt_next_prayer_name','widget_txt_next_prayer_time','widget_txt_countdown','widget_txt_dhikr',...['fajr','dhuhr','asr','maghrib','isha'].flatMap(k=>['col_'+k,'widget_time_'+k,'widget_label_'+k])])assert.ok(ids.includes('@+id/'+id),layout+': '+id);
 }
 assert.equal(layouts.size,6);
});
