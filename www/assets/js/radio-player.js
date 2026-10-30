/* One selected station, one playback intent, persistent reconnect with bounded delays. */
(function(global){
'use strict';
class RadioPlayer {
 constructor(audio, notify=()=>{}) {
  this.audio=audio;this.notify=notify;this.wanted=false;this.generation=0;this.attempt=0;this.state='paused';
  this.online=()=>navigator.onLine!==false;
  audio.addEventListener('playing',()=>{if(!this.wanted){audio.pause();return;}this.clear();this.setState('playing');this.watch();this.stable=setTimeout(()=>{this.attempt=0;},30000);});
  for(const event of ['waiting','stalled'])audio.addEventListener(event,()=>{if(this.wanted&&!this.retry){this.setState('buffering');this.watch();}});
  for(const event of ['error','ended'])audio.addEventListener(event,()=>this.reconnect());
  audio.addEventListener('pause',()=>{if(this.wanted&&!this.retry&&this.state==='playing'){this.wanted=false;this.clear();this.setState('paused');}});
  global.addEventListener('offline',()=>{if(this.wanted){
   if(this.state==='playing'||this.state==='buffering'){this.watch();return;}
   this.generation++;this.clear();this.setState('offline');audio.pause();
  }});
  global.addEventListener('online',()=>{if(this.wanted&&this.state!=='playing'){this.attempt=0;this.connect();}});
  audio.addEventListener('timeupdate',()=>{
   const position=audio.currentTime;
   if(this.wanted&&!this.retry&&!audio.paused&&Number.isFinite(position)&&position>this.lastPosition){
    clearTimeout(this.watchdog);this.watchdog=null;this.watch();
    if(this.state==='buffering')this.setState('playing');
   }
   this.lastPosition=position;
  });
 }
 setState(state){this.state=state;this.notify({state,station:this.station,wanted:this.wanted,attempt:this.attempt});}
 clear(){clearTimeout(this.retry);clearTimeout(this.watchdog);clearTimeout(this.stable);this.retry=this.watchdog=this.stable=null;}
 watch(){if(!this.watchdog)this.watchdog=setTimeout(()=>{this.watchdog=null;this.reconnect();},18000);}
 select(station,play=this.wanted){this.stop();this.station=station;this.attempt=0;if(play)this.play();else this.setState('paused');}
 play(){if(!this.station)return;this.wanted=true;this.attempt=0;this.connect();}
 stop(){this.wanted=false;this.generation++;this.clear();this.setState('paused');this.audio.pause();this.audio.removeAttribute('src');this.audio.load();}
 async connect(){
  if(!this.wanted)return;
  const generation=++this.generation;this.clear();
  if(!this.online()){this.setState('offline');return;}
  this.lastPosition=-1;this.setState('connecting');
  const urls=[this.station.url,...(this.station.backupUrl?[this.station.backupUrl]:[])];
  this.audio.src=urls[this.attempt%urls.length];this.audio.load();this.watch();
  try{await this.audio.play();}catch(error){
   if(generation!==this.generation||!this.wanted)return;
   if(error.name==='NotAllowedError'){this.wanted=false;this.clear();this.setState('blocked');}
   else this.reconnect();
  }
 }
 reconnect(){
  if(!this.wanted||this.retry)return;
  this.generation++;this.clear();
  if(!this.online()){this.setState('offline');this.audio.pause();return;}
  const delay=Math.min(1000*2**Math.min(this.attempt,6),60000);this.attempt=Math.min(this.attempt+1,7);
  this.setState('retrying');this.retry=setTimeout(()=>{this.retry=null;this.connect();},delay);
 }
}
class NativeRadioPlayer {
 constructor(audio,notify,stations){this.audio=audio;this.notify=notify;this.stations=stations;this.wanted=false;this.chain=Promise.resolve();this.state='paused';this.plugin=global.Capacitor.Plugins.RadioNative;
 this.poll=async()=>{if(document.hidden||this.busy||this.fallback||this.switching)return;try{const result=await this.plugin.getState();if(this.busy||this.fallback||this.switching)return;if(result.wanted)this.station=this.stations.find(s=>s.id===result.id)||this.station;this.wanted=result.wanted;this.state=result.state;this.notify({...result,station:this.station});}catch{}};
 this.interval=setInterval(()=>{if(this.fallback&&this.deadline&&Date.now()>=this.deadline){this.deadline=0;this.fallback.stop();}else this.poll();},1500);document.addEventListener('visibilitychange',this.poll);this.poll();
 }
 async useWebPlayer(){
  if(this.fallback||this.switching||!this.station)return;
  this.switching=true;
  const revision=this.switchRevision=(this.switchRevision||0)+1;
  try {
   await this.chain;
   await this.plugin.stop();
   if(revision!==this.switchRevision)return;
   this.fallback=new RadioPlayer(this.audio,result=>{
    this.wanted=result.wanted;this.state=result.state;this.station=result.station;
    this.notify({...result,fallback:true});
   });
   this.fallback.select(this.station,true);
  } catch(error){this.notify({state:'failed',wanted:false,station:this.station,error:'تعذّر إيقاف المشغّل الأصلي؛ أعد المحاولة'});}
  finally{this.switching=false;}
 }
 command(fn){this.pending=(this.pending||0)+1;this.busy=true;this.chain=this.chain.then(fn).catch(()=>{this.wanted=false;this.state='failed';this.notify({state:'failed',wanted:false,station:this.station});}).finally(()=>{this.pending--;this.busy=this.pending>0;});return this.chain;}
 select(station,play=this.wanted){if(this.fallback){this.station=station;this.fallback.select(station,play);return;}if(this.station)this.stop();this.station=station;if(play)this.play();else this.notify({state:'paused',wanted:false,station});}
 play(){this.switchRevision=(this.switchRevision||0)+1;if(this.fallback){this.fallback.play();return;}this.wanted=true;const station=this.station;this.notify({state:'connecting',wanted:true,station});this.command(async()=>{await this.plugin.play({...station,volume:this.audio.volume});if(this.deadline)await this.plugin.setSleepTimer({at:this.deadline});});}
 stop(){this.switchRevision=(this.switchRevision||0)+1;if(this.fallback){this.fallback.stop();return;}this.wanted=false;this.notify({state:'paused',wanted:false,station:this.station});this.command(()=>this.plugin.stop());}
 setVolume(volume){if(this.fallback){this.audio.volume=volume;return;}this.command(()=>this.plugin.setVolume({volume}));}
 setSleepTimer(at){this.deadline=at;if(this.fallback)return;this.command(()=>this.plugin.setSleepTimer({at}));}
}
global.ZadNativeRadioPlayer=NativeRadioPlayer;
global.ZadRadioPlayer=RadioPlayer;
})(window);
