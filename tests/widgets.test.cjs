const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');const {JSDOM}=require('jsdom');
const root='android/app/src/main/';
test('five prayer designs and one radio widget have valid resources and resizing',()=>{
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
  if(receiver.getAttribute('android:name')==='.PrayerWidgetAgendaProvider'){
   for(const id of ['radio_widget_root','radio_widget_station','radio_widget_status','radio_widget_toggle'])assert.ok(ids.includes('@+id/'+id));
   continue;
  }
  for(const id of ['widget_city','widget_root','widget_btn_refresh','widget_txt_hijri_date','widget_txt_gregorian_date','widget_txt_next_prayer_name','widget_txt_next_prayer_time','widget_txt_countdown','widget_txt_dhikr',...['fajr','dhuhr','asr','maghrib','isha'].flatMap(k=>['col_'+k,'widget_time_'+k,'widget_label_'+k])])assert.ok(ids.includes('@+id/'+id),layout+': '+id);
 }
 assert.equal(layouts.size,6);
});

test('radio widget calls the foreground playback service and updates from real playback state',()=>{
 const provider=fs.readFileSync(root+'java/com/zadmuslim/app/PrayerWidgetAgendaProvider.java','utf8');
 const service=fs.readFileSync(root+'java/com/zadmuslim/app/RadioService.java','utf8');
 assert.match(provider,/getForegroundService/);assert.match(provider,/RadioService.wanted/);
 assert.match(service,/"WIDGET_TOGGLE"/);assert.match(service,/PrayerWidgetAgendaProvider.updateAll/);
 assert.ok(service.includes('getSharedPreferences("radio-widget"'));
});
test('iOS packages two widgets and shares signed storage with the app',()=>{
 const project=fs.readFileSync('ios/App/App.xcodeproj/project.pbxproj','utf8');
 for(const file of ['RadioWidget.swift','PrayerWidget.swift','RadioPlayback.swift','RadioNativePlugin.swift'])assert.ok(project.includes(file));
 assert.match(project,/com.apple.product-type.app-extension/);assert.match(project,/Embed App Extensions/);
 for(const path of ['ios/App/App/App.entitlements','ios/App/PrayerWidget/Widget.entitlements']){
  const doc=new JSDOM(fs.readFileSync(path,'utf8'),{contentType:'text/xml'}).window.document;
  assert.ok(doc.documentElement.textContent.includes('group.com.zadmuslim.app'));
 }
 const radio=fs.readFileSync('ios/App/PrayerWidget/RadioWidget.swift','utf8');
 assert.ok(radio.includes('PrayerWidget(); RadioWidget()'));assert.ok(radio.includes('Button(intent: ToggleZadRadioIntent'));
 const playback=fs.readFileSync('ios/App/Shared/RadioPlayback.swift','utf8');assert.match(playback,/AudioPlaybackIntent/);assert.ok(playback.includes('AVPlayer(playerItem:'));
 const prayer=fs.readFileSync('ios/App/PrayerWidget/PrayerWidget.swift','utf8');assert.match(prayer,/prayerUpdated/);assert.match(prayer,/parsedTimes.count == 5/);assert.doesNotMatch(prayer,/diffMinutes = 240/);
});
