/* Keep the live media document mounted while internal pages change. */
(function(){
'use strict';
const allowed=new Set(['index.html','services.html','settings.html']);
function target(href){try{const url=new URL(href,location.href);return url.origin===location.origin&&allowed.has(url.pathname.split('/').pop()||'index.html')?url:null;}catch{return null;}}
let parentHost;
try{if(parent!==window&&parent.location.origin===location.origin)parentHost=parent.ZadRadioHost;}catch{}
if(parentHost){
 window.ZadRadioEmbedded=true;
 window.zadNavigate=href=>parentHost.navigate(new URL(href,location.href).href);
 window.addEventListener('hashchange',()=>parentHost.sync(location.href));
 window.addEventListener('scroll',()=>{parentHost.closePanel?.();},{passive:true});
 document.addEventListener('touchmove',event=>{
  if(!event.target.closest('#radio-panel')&&!event.target.closest('#radio-fab-btn')){
   parentHost.closePanel?.();
  }
 },{passive:true});
 document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('live-radio-widget')?.remove();
  const nav=document.getElementById('btn-toggle-radio-nav');if(nav)nav.addEventListener('click',event=>{event.preventDefault();parentHost.openPanel();});
 });
 document.addEventListener('play',event=>{if(['AUDIO','VIDEO'].includes(event.target.tagName))parentHost.pause();},true);
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('a[href]');if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
  const url=target(link.href);if(!url)return;
  if(url.pathname===location.pathname&&url.search===location.search&&url.hash)return;
  event.preventDefault();parentHost.navigate(url.href);
 },true);
 return;
}
const initial=location.href,initialTitle=document.title;
let frame=null,player=null;
function openPanel(){document.getElementById('radio-panel')?.classList.add('open');document.getElementById('radio-fab-btn')?.setAttribute('aria-expanded','true');}
function closePanel(){document.getElementById('radio-panel')?.classList.remove('open');document.getElementById('radio-fab-btn')?.setAttribute('aria-expanded','false');}
function render(href){
 const url=target(href);if(!url)return;
 const original=new URL(initial);
 if(url.pathname===original.pathname&&url.search===original.search){
  frame?.remove();frame=null;document.title=initialTitle;document.body.classList.remove('zad-radio-host');
  if(url.hash){try{document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();}catch{}}
  return;
 }
 if(!frame){
  frame=document.createElement('iframe');frame.id='zad-radio-page';frame.title='صفحة التطبيق';frame.allow='autoplay; geolocation; accelerometer; gyroscope; magnetometer';
  frame.addEventListener('load',()=>{
   try{
    const current=target(frame.contentWindow.location.href);
    if(current){document.title=frame.contentDocument.title;history.replaceState({...history.state,zadRadioRoute:current.href},'',current.href);}
    frame.contentWindow.addEventListener('scroll',closePanel,{passive:true});
    frame.contentDocument.addEventListener('touchmove',e=>{
     if(!e.target.closest('#radio-panel')&&!e.target.closest('#radio-fab-btn'))closePanel();
    },{passive:true});
   }catch{}
  });document.body.append(frame);
 }
 document.body.classList.add('zad-radio-host');frame.src=url.href;document.getElementById('radio-panel')?.classList.remove('open');
}
function navigate(href){const url=target(href);if(!url)return;if(!frame)history.replaceState({...history.state,zadRadioRoute:location.href},'',location.href);history.pushState({zadRadioRoute:url.href},'',url.href);render(url.href);}
window.zadNavigate=href=>{if((player?.wanted||frame)&&!(window.Capacitor?.getPlatform?.()==='android'&&window.Capacitor?.isPluginAvailable?.('RadioNative')))navigate(href);else location.assign(href);};
window.ZadRadioHost={sync(href){const url=target(href);if(url)history.replaceState({...history.state,zadRadioRoute:url.href},'',url.href);},attach(value){player=value;},navigate,openPanel,closePanel,pause(){player?.stop();}};
document.addEventListener('click',event=>{
 if(!player?.wanted&&!frame)return;
 // Android's native service already survives full document navigation.
 if(window.Capacitor?.getPlatform?.()==='android'&&window.Capacitor?.isPluginAvailable?.('RadioNative'))return;
 const link=event.target.closest?.('a[href]');if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
 const url=target(link.href);if(!url||url.pathname===location.pathname&&url.search===location.search&&url.hash)return;
 event.preventDefault();navigate(url.href);
},true);
window.addEventListener('popstate',()=>{if(frame||history.state?.zadRadioRoute)render(location.href);});
})();
