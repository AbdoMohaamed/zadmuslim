package com.zadmuslim.app;
import android.content.Intent;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
@CapacitorPlugin(name="RadioNative")
public class RadioNativePlugin extends Plugin {
 @PluginMethod public void play(PluginCall call){
  String url=call.getString("url", "");String backup=call.getString("backupUrl", "");
  boolean saved=url.startsWith("zad-offline:"),recording=call.getBoolean("recording",false),offline=saved||recording;
  if(saved){try{String id=call.getString("id","");OfflineAudioStore.metadata(getContext(),id);url=OfflineAudioStore.file(getContext(),id).getAbsolutePath();backup="";}catch(Exception e){call.reject("Recording missing",e);return;}}
  else if(!(allowed(url)||recording&&OfflineAudioStore.allowed(url))||(!backup.isEmpty()&&!allowed(backup))){call.reject("Unsupported stream");return;}
  Intent intent=new Intent(getContext(),RadioService.class).setAction("PLAY");
  intent.putExtra("offline",offline).putExtra("saved",saved).putExtra("url",url).putExtra("backup",backup).putExtra("name",call.getString("name","راديو القرآن"))
   .putExtra("id",call.getString("id", "")).putExtra("volume",call.getDouble("volume",.8).floatValue());
  try{androidx.core.content.ContextCompat.startForegroundService(getContext(),intent);call.resolve();}catch(Exception e){call.reject("Cannot start radio",e);}
 }
 private boolean allowed(String value){try{android.net.Uri u=android.net.Uri.parse(value);return "https".equals(u.getScheme()) && java.util.Arrays.asList("qurango.net","backup.qurango.net","stream.radiojar.com").contains(u.getHost());}catch(Exception e){return false;}}
 @PluginMethod public void stop(PluginCall call){new android.os.Handler(android.os.Looper.getMainLooper()).post(()->{RadioService.stopPlayback();getContext().stopService(new Intent(getContext(),RadioService.class));call.resolve();});}
 @PluginMethod public void setVolume(PluginCall call){RadioService.setVolume(call.getDouble("volume",.8).floatValue());call.resolve();}
 @PluginMethod public void setSleepTimer(PluginCall call){RadioService.setSleepDeadline(call.getDouble("at",0.0).longValue());call.resolve();}
 @PluginMethod public void pause(PluginCall call){RadioService.pausePlayback();call.resolve();}
 @PluginMethod public void seek(PluginCall call){RadioService.seek(call.getDouble("seconds",0.0));call.resolve();}
 @PluginMethod public void getState(PluginCall call){JSObject result=new JSObject();result.put("state",RadioService.state);result.put("error",RadioService.lastError);result.put("wanted",RadioService.wanted);result.put("id",RadioService.stationId);result.put("deadline",RadioService.sleepDeadline);result.put("position",RadioService.position);result.put("duration",RadioService.duration);call.resolve(result);}
 @PluginMethod public void listDownloads(PluginCall call){try{JSObject result=new JSObject();result.put("items",OfflineAudioStore.list(getContext()));call.resolve(result);}catch(Exception e){call.reject("Cannot read downloads",e);}}
 @PluginMethod public void inspectAudio(PluginCall call){new Thread(()->{try{call.resolve(OfflineAudioStore.inspect(call.getString("url","")));}catch(Exception e){call.reject("Cannot inspect recording",e);}}).start();}
 @PluginMethod public void downloadAudio(PluginCall call){
  if(!OfflineAudioStore.reserve()){call.reject("Download already running");return;}
  JSObject item=new JSObject();item.put("id",call.getString("id",""));item.put("url",call.getString("url",""));item.put("name",call.getString("name","تلاوة"));item.put("desc",call.getString("desc",""));
  new Thread(()->{try{call.resolve(OfflineAudioStore.download(getContext(),item));}catch(Exception e){call.reject("Download failed or cancelled: "+e.getMessage(),e);}}).start();
 }
 @PluginMethod public void cancelDownload(PluginCall call){OfflineAudioStore.cancel();call.resolve();}
 @PluginMethod public void downloadProgress(PluginCall call){call.resolve(OfflineAudioStore.progress());}
 @PluginMethod public void deleteDownload(PluginCall call){String id=call.getString("id","");if(id.equals(RadioService.stationId)&&RadioService.wanted){call.reject("Pause recording before deletion");return;}try{OfflineAudioStore.delete(getContext(),id);call.resolve();}catch(Exception e){call.reject("Cannot delete recording",e);}}
}
