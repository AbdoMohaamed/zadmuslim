(function(){
'use strict';
function start(){
 if(window.parent!==window||window.ZadRadioEmbedded||document.getElementById('zad-brand-intro'))return;
 const key='zad_intro_seen_v1';try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');}catch{}
 const prior=document.activeElement;
 const dialog=document.createElement('dialog');dialog.id='zad-brand-intro';dialog.setAttribute('aria-label','مرحبًا بك في زاد المسلم');
 const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');video.preload='metadata';video.poster='assets/branding/intro-logo.png';video.setAttribute('aria-label','مقدمة زاد المسلم');
 const muteSvg='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
 const soundSvg='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
 const closeSvg='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
 const actions=document.createElement('div');actions.className='brand-intro-actions';
 const skip=document.createElement('button');skip.type='button';skip.className='brand-intro-btn brand-intro-close';skip.setAttribute('aria-label','تخطي');skip.innerHTML=closeSvg;skip.autofocus=true;
 const sound=document.createElement('button');sound.type='button';sound.className='brand-intro-btn brand-intro-sound';sound.setAttribute('aria-label','تشغيل الصوت');sound.setAttribute('aria-pressed','false');sound.innerHTML=muteSvg;actions.append(skip,sound);dialog.append(video,actions);document.body.append(dialog);
 let timer,limit,closed=false;
 function finish(){if(closed)return;closed=true;clearTimeout(timer);clearTimeout(limit);video.pause();video.removeAttribute('src');video.load();if(dialog.open)dialog.close();dialog.remove();if(prior?.isConnected)prior.focus();}
 function watchdog(){clearTimeout(timer);timer=setTimeout(finish,8000);}
 skip.onclick=finish;dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});video.addEventListener('ended',finish);video.addEventListener('timeupdate',watchdog);video.addEventListener('error',()=>{clearTimeout(timer);timer=setTimeout(finish,1500);});
 sound.onclick=()=>{video.muted=!video.muted;sound.innerHTML=video.muted?muteSvg:soundSvg;sound.setAttribute('aria-label',video.muted?'تشغيل الصوت':'كتم الصوت');sound.setAttribute('aria-pressed',String(!video.muted));};
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){sound.hidden=true;timer=setTimeout(finish,1200);return;}
 video.src='assets/branding/intro.mp4';watchdog();limit=setTimeout(finish,60000);
 try{const playing=video.play();playing?.catch(()=>{clearTimeout(timer);timer=setTimeout(finish,1500);});}catch{timer=setTimeout(finish,1500);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
