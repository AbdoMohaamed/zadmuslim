package com.zadmuslim.app;
import android.content.Intent;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
@CapacitorPlugin(name="RadioNative")
public class RadioNativePlugin extends Plugin {
 @PluginMethod public void play(PluginCall call){
  String url=call.getString("url", "");String backup=call.getString("backupUrl", "");
  if(!allowed(url)||(!backup.isEmpty()&&!allowed(backup))){call.reject("Unsupported stream");return;}
  Intent intent=new Intent(getContext(),RadioService.class).setAction("PLAY");
  intent.putExtra("url",url).putExtra("backup",backup).putExtra("name",call.getString("name","راديو القرآن"))
   .putExtra("id",call.getString("id", "")).putExtra("volume",call.getDouble("volume",.8).floatValue());
  try{androidx.core.content.ContextCompat.startForegroundService(getContext(),intent);call.resolve();}catch(Exception e){call.reject("Cannot start radio",e);}
 }
 private boolean allowed(String value){try{android.net.Uri u=android.net.Uri.parse(value);return "https".equals(u.getScheme()) && java.util.Arrays.asList("qurango.net","backup.qurango.net","stream.radiojar.com").contains(u.getHost());}catch(Exception e){return false;}}
 @PluginMethod public void stop(PluginCall call){RadioService.stopPlayback();getContext().stopService(new Intent(getContext(),RadioService.class));call.resolve();}
 @PluginMethod public void setVolume(PluginCall call){RadioService.setVolume(call.getDouble("volume",.8).floatValue());call.resolve();}
 @PluginMethod public void setSleepTimer(PluginCall call){RadioService.setSleepDeadline(call.getDouble("at",0.0).longValue());call.resolve();}
 @PluginMethod public void getState(PluginCall call){JSObject result=new JSObject();result.put("state",RadioService.state);result.put("wanted",RadioService.wanted);result.put("id",RadioService.stationId);result.put("deadline",RadioService.sleepDeadline);call.resolve(result);}
}
