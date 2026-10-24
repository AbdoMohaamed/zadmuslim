(function(){
'use strict';
function start(){
 if(window.parent!==window||window.ZadRadioEmbedded||document.getElementById('zad-brand-intro'))return;
 const key='zad_intro_seen_v1';try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');}catch{}
 const prior=document.activeElement;
 const dialog=document.createElement('dialog');dialog.id='zad-brand-intro';dialog.setAttribute('aria-label','مرحبًا بك في زاد المسلم');
 const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');video.preload='metadata';video.poster='assets/branding/intro-logo.png';video.setAttribute('aria-label','مقدمة زاد المسلم');
 const actions=document.createElement('div');actions.className='brand-intro-actions';
 const skip=document.createElement('button');skip.type='button';skip.textContent='تخطي';skip.autofocus=true;
 const sound=document.createElement('button');sound.type='button';sound.textContent='تشغيل الصوت';sound.setAttribute('aria-pressed','false');actions.append(skip,sound);dialog.append(video,actions);document.body.append(dialog);
 let timer,limit,closed=false;
 function finish(){if(closed)return;closed=true;clearTimeout(timer);clearTimeout(limit);video.pause();video.removeAttribute('src');video.load();if(dialog.open)dialog.close();dialog.remove();if(prior?.isConnected)prior.focus();}
 function watchdog(){clearTimeout(timer);timer=setTimeout(finish,8000);}
 skip.onclick=finish;dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});video.addEventListener('ended',finish);video.addEventListener('timeupdate',watchdog);video.addEventListener('error',()=>{clearTimeout(timer);timer=setTimeout(finish,1500);});
 sound.onclick=()=>{video.muted=!video.muted;sound.textContent=video.muted?'تشغيل الصوت':'كتم الصوت';sound.setAttribute('aria-pressed',String(!video.muted));};
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){sound.hidden=true;timer=setTimeout(finish,1200);return;}
 video.src='assets/branding/intro.mp4';watchdog();limit=setTimeout(finish,60000);
 try{const playing=video.play();playing?.catch(()=>{clearTimeout(timer);timer=setTimeout(finish,1500);});}catch{timer=setTimeout(finish,1500);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
