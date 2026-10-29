(function () {
'use strict';
function init() {
 const $=id=>document.getElementById(id);
 const service=()=>window.NativeAdhanService;
 const platform=window.Capacitor?.getPlatform?.();
 const native=window.Capacitor?.isNativePlatform?.();
 const font=$('zad-font')?.closest('.zad-form-group');
 if(font) {
  const section=document.createElement('section'); section.id='settings-reading-section';section.className='settings-section-card';
  section.innerHTML='<div class="settings-section-title">القراءة والمظهر</div><p>يتم حفظ حجم الخط تلقائيًا.</p>';
  section.append(font);$('settings-prayer-timing-section').after(section);
  const link=document.createElement('a');link.className='settings-nav-chip';link.href='#settings-reading-section';link.textContent='القراءة والمظهر';document.querySelector('.settings-nav-strip')?.append(link);
 }
 const notice=document.createElement('p');notice.className='settings-autosave-note';notice.textContent='تُحفظ التغييرات تلقائيًا. حالة التنبيهات أدناه توضّح هل تم تطبيقها في الهاتف.';
 document.querySelector('.settings-nav-strip')?.after(notice);
 document.querySelectorAll('.settings-section-card').forEach(section=>{
  const title=section.querySelector(':scope > .settings-section-title'); if(!title)return;
  const details=document.createElement('details');details.open=section.id==='notifications-section';
  const summary=document.createElement('summary');summary.append(title);details.append(summary);
  while(section.firstChild)details.append(section.firstChild);
  section.append(details);
  summary.querySelectorAll('button').forEach(button=>button.addEventListener('click',event=>event.stopPropagation()));
 });
 function revealHash() { const section=$(location.hash.slice(1)); if(section){const details=section.querySelector('details')||section.closest('details');if(details)details.open=true;} }
 window.addEventListener('hashchange',revealHash);revealHash();
 document.querySelectorAll('.settings-nav-chip').forEach(link=>link.addEventListener('click',()=>{const section=$(link.hash.slice(1));const details=section?.querySelector('details');if(details)details.open=true;}));
 const state=$('zad-notification-state');if(!state)return;
 const panel=document.createElement('div');panel.className='settings-delivery-status';panel.setAttribute('aria-live','polite');
 const text=document.createElement('p');const actions=document.createElement('div');actions.className='settings-status-actions';panel.append(text,actions);state.parentElement.after(panel);
 if(native)state.hidden=true;
 const message=document.createElement('p');message.setAttribute('role','status');panel.append(message);
 function button(label,fn){const b=document.createElement('button');b.type='button';b.className='btn outline';b.textContent=label;b.onclick=async()=>{b.disabled=true;try{const r=await fn();if(r?.message)message.textContent=r.message;}catch{message.textContent='تعذّر تنفيذ الطلب. حاول مرة أخرى.';}finally{b.disabled=false;await refresh();}};actions.append(b);return b;}
 let notificationButton,exactButton,batteryButton,fullScreenButton;
 if(platform==='android') {
  notificationButton=button('فتح أذونات الإشعارات',()=>service().openNotificationSettings());
  exactButton=button('السماح بالمواعيد الدقيقة',()=>service().requestExactAlarmPermission());
  batteryButton=button('إعدادات تشغيل الخلفية',()=>service().openBatterySettings());
  fullScreenButton=button('إذن شاشة الأذان الكاملة',()=>service().requestFullScreenIntentPermission());
 }
 if(native)button('اختبار الأذان بعد دقيقة',()=>service().scheduleBackgroundDiagnosticTest('adhan',60));
 const help=document.createElement('p');help.className='settings-test-help';help.textContent=native?'«سماع » يشغّل الصوت الآن. اختبار الخلفية يجدول تنبيهًا بعد دقيقة؛ اقفل الشاشة بعد تأكيد الجدولة.':'سماع العينة يختبر الصوت فقط. اختبار الخلفية متاح داخل تطبيق الهاتف.';panel.append(help);
 async function refresh(){
  try {
   if(platform==='android') {
    const plugin=window.Capacitor.Plugins.AdhanNative;
    const [permissions,schedule]=await Promise.all([plugin.checkAlarmPermissions(),plugin.getPrayerScheduleStatus()]);
    const fmt=value=>new Date(value).toLocaleString('ar-EG');
    text.textContent='الإشعارات: '+(permissions.notificationsGranted?'مسموح بها':'غير مسموح بها')+' — المواعيد الدقيقة: '+(permissions.exactAlarmsGranted?'مسموح بها':'تحتاج إذنًا')+(permissions.fullScreenIntentGranted===false?' — شاشة الأذان: تحتاج إذنًا لفتح الشاشة عند القفل':'')+'. '+(schedule.count ? 'تنبيه الصلاة القادم: '+fmt(schedule.next)+'. المواعيد محفوظة حتى '+fmt(schedule.until)+'. افتح التطبيق قبلها لتجديدها.' : 'لا توجد تنبيهات صلاة قادمة محفوظة. راجع تفعيل الأذان ومواقيت مدينتك.');
    notificationButton.hidden=permissions.notificationsGranted===true;exactButton.hidden=permissions.exactAlarmsGranted===true;batteryButton.hidden=permissions.batteryOptimizationsIgnored===true;
    if(fullScreenButton)fullScreenButton.hidden=permissions.fullScreenIntentGranted!==false;
    if(!permissions.batteryOptimizationsIgnored)text.textContent+=' راجع قيود البطارية إذا تأخر التنبيه.';
   } else if(native) {
    const plugin=window.Capacitor.Plugins.LocalNotifications;
    const [permission,pending]=await Promise.all([plugin.checkPermissions(),plugin.getPending()]);
    const times=(pending.notifications||[]).filter(n=>n.id>0&&n.id<70000).map(n=>new Date(n.schedule?.at).getTime()).filter(t=>t>Date.now()).sort((a,b)=>a-b);
    text.textContent='إذن الإشعارات: '+(permission.display==='granted'?'مسموح':'غير مفعّل')+'. '+(times.length?'تنبيه الصلاة القادم: '+new Date(times[0]).toLocaleString('ar-EG')+'. الجدولة حتى '+new Date(times.at(-1)).toLocaleString('ar-EG')+'.':'لا توجد تنبيهات صلاة قادمة يمكن تأكيدها.');
   } else text.textContent='المتصفح لا يضمن تشغيل الأذان عند إغلاقه.';
  }catch{text.textContent='تعذّر التحقق من الجدولة. حدّث التطبيق أو أعد المحاولة؛ حفظ الاختيارات لا يؤكد وصول التنبيه.';}
 }
 $('zad-refresh-notifications')?.addEventListener('click',refresh);
 document.addEventListener('zad:notification-saved',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 for(const id of ['zad-city','zad-method','zad-school']) $(id)?.addEventListener('change',async()=>{
  if(!native)return;
  await service()?.cancelPrayerAlarms();
  window.zadPrayerVerified=false;
  localStorage.removeItem('zad_prayer_verified');
  message.textContent='تم حفظ مواقيت الصلاة المختارة وإلغاء المواعيد القديمة. افتح الرئيسية لتحديث المواقيت وجدولتها.';
  await refresh();
 });
 const volume=$('slider-adhan-volume');
 const hint=document.createElement('p');hint.className='settings-test-help';
 if(platform==='ios') {hint.textContent='على آيفون: مستوى الصوت هنا للعينة فقط؛ صوت الإشعار يتحكم فيه إعداد صوت الهاتف.';}
 else if(platform==='android') {hint.textContent='هذا المستوى يطبّق على الأذان الفعلي فوق مستوى صوت المنبّه في الهاتف. إذا كان صوت المنبّه مكتومًا فلن يُسمع الأذان.';}
 else hint.textContent='مستوى الصوت للعينة والتشغيل داخل المتصفح.';
 volume?.parentElement.after(hint);
 refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
