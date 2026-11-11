package com.zadmuslim.app;

import android.content.Context;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicBoolean;

/** Private, complete files only. A cancelled/failed download never appears in the library. */
final class OfflineAudioStore {
 static final long MAX_BYTES=256L*1024*1024;
 private static final AtomicBoolean busy=new AtomicBoolean(false), cancelled=new AtomicBoolean(false);
 private static volatile long received=0,total=0;
 private static volatile HttpURLConnection connection;
 static boolean adhkar(String id){return "azkar".equals(id)||"azkar-evening".equals(id);}
 static boolean validId(String id){return adhkar(id)||id!=null&&id.matches("offline-[0-9]{1,4}-[0-9]{1,3}");}
 static String adhkarUrl(String id){return "https://download.tvquran.com/download/TvQuran.com__Athkar/TvQuran.com_athkar_"+("azkar".equals(id)?"03":"04")+".mp3";}
 static boolean allowed(String value){
  if(adhkarUrl("azkar").equals(value)||adhkarUrl("azkar-evening").equals(value))return true;
  try{URI uri=new URI(value);return "https".equals(uri.getScheme())&&uri.getUserInfo()==null&&uri.getPort()==-1&&uri.getQuery()==null&&uri.getFragment()==null&&"cdn.mp3quran.net".equals(uri.getHost())&&uri.getPath().matches("/audio/(mishary-alafasy/r1|abdulrahman-sudais/r1|mahmoud-husary/r2|muhammad-minshawi/r3|khalid-jalil/r1|yasser-dosari/r1|maher-muaiqly/r1|ali-jaber/r1)/[0-9]{3}\\.mp3");}catch(Exception e){return false;}
 }
 static File directory(Context context){File dir=new File(context.getFilesDir(),"offline-audio");dir.mkdirs();return dir;}
 static File file(Context context,String id)throws IOException {if(!validId(id))throw new IOException("Invalid recording");return new File(directory(context),id+".mp3");}
 static JSObject metadata(Context context,String id)throws Exception {
  File audio=file(context,id),meta=new File(directory(context),id+".json");
  if(!audio.isFile()||!meta.isFile()||audio.length()==0)throw new IOException("Recording missing");
  try(InputStream in=new FileInputStream(meta);ByteArrayOutputStream bytes=new ByteArrayOutputStream()){byte[] buffer=new byte[4096];int n;while((n=in.read(buffer))!=-1){bytes.write(buffer,0,n);if(bytes.size()>16384)throw new IOException("Invalid metadata");}JSObject result=new JSObject(bytes.toString("UTF-8"));result.put("bytes",audio.length());return result;}
 }
 static JSArray list(Context context)throws Exception {
  JSArray items=new JSArray();File[] files=directory(context).listFiles((dir,name)->name.endsWith(".json"));
  if(files!=null)for(File entry:files){try{items.put(metadata(context,entry.getName().replace(".json","")));}catch(Exception ignored){}}
  return items;
 }
 static JSObject progress(){JSObject result=new JSObject();result.put("busy",busy.get());result.put("received",received);result.put("total",total);return result;}
 static void cancel(){cancelled.set(true);HttpURLConnection active=connection;if(active!=null)active.disconnect();}
 static boolean reserve(){if(!busy.compareAndSet(false,true))return false;cancelled.set(false);received=total=0;return true;}
 static HttpURLConnection open(String url,String method)throws Exception {
  for(int redirect=0;redirect<4;redirect++){
   if(!allowed(url))throw new IOException("Unsupported audio source");
   HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();c.setInstanceFollowRedirects(false);c.setConnectTimeout(15000);c.setReadTimeout(20000);c.setRequestMethod(method);c.setRequestProperty("Accept-Encoding","identity");
   int status=c.getResponseCode();
   if(status>=300&&status<400){String next=c.getHeaderField("Location");c.disconnect();if(next==null)throw new IOException("Invalid redirect");url=new URL(new URL(url),next).toString();continue;}
   if(status!=200){c.disconnect();throw new IOException("Audio source returned "+status);}return c;
  }throw new IOException("Too many redirects");
 }
 static JSObject inspect(String url)throws Exception {HttpURLConnection c=open(url,"HEAD");try{JSObject result=new JSObject();result.put("bytes",Math.max(0,c.getContentLengthLong()));return result;}finally{c.disconnect();}}
 static JSObject download(Context context,JSObject item)throws Exception {
  File temp=null,metaTemp=null;boolean published=false;String id=item.getString("id");
  try{
   File target=file(context,id);String url=item.getString("url");if(!allowed(url)||adhkar(id)&&!adhkarUrl(id).equals(url))throw new IOException("Unsupported audio source");
   if(target.isFile())return metadata(context,id);
   temp=new File(directory(context),id+".part");metaTemp=new File(directory(context),id+".json.part");
   if(cancelled.get())throw new IOException("Cancelled");
   connection=open(url,"GET");total=Math.max(0,connection.getContentLengthLong());
   if(total>MAX_BYTES||directory(context).getUsableSpace()<Math.max(total,8L*1024*1024)+8L*1024*1024)throw new IOException("Insufficient storage");
   String contentType=connection.getContentType();if(contentType!=null&&(contentType.contains("text/")||contentType.contains("json")))throw new IOException("Invalid audio response");
   try(InputStream input=connection.getInputStream();FileOutputStream output=new FileOutputStream(temp)){
    byte[] buffer=new byte[65536];int n;boolean checked=false;
    while((n=input.read(buffer))!=-1){
     if(cancelled.get())throw new IOException("Cancelled");
     if(!checked&&n>=3){checked=true;boolean mp3=buffer[0]=='I'&&buffer[1]=='D'&&buffer[2]=='3'||(buffer[0]&255)==255&&(buffer[1]&224)==224;if(!mp3)throw new IOException("Invalid MP3 file");}
     received+=n;if(received>MAX_BYTES)throw new IOException("Recording too large");output.write(buffer,0,n);
    }
    output.getFD().sync();
   }
   if(cancelled.get()||received<3||total>0&&received!=total)throw new IOException("Incomplete download");
   try(InputStream check=new FileInputStream(temp)){int a=check.read(),b=check.read(),c=check.read();if(!(a=='I'&&b=='D'&&c=='3'||a==255&&(b&224)==224))throw new IOException("Invalid MP3 file");}
   item.put("bytes",received);try(FileOutputStream out=new FileOutputStream(metaTemp)){out.write(item.toString().getBytes(StandardCharsets.UTF_8));out.getFD().sync();}
   if(!temp.renameTo(target))throw new IOException("Cannot save audio");published=true;
   if(!metaTemp.renameTo(new File(directory(context),id+".json")))throw new IOException("Cannot save recording details");
   return item;
  }catch(Exception e){if(published)file(context,id).delete();throw e;}
  finally{if(connection!=null)connection.disconnect();connection=null;if(temp!=null)temp.delete();if(metaTemp!=null)metaTemp.delete();busy.set(false);}
 }
 static void delete(Context context,String id)throws Exception {
  if(busy.get())throw new IOException("Wait for download");
  File target=file(context,id);if(target.exists()&&!target.delete())throw new IOException("Cannot delete recording");
  new File(directory(context),id+".json").delete();context.getSharedPreferences("offline-audio",0).edit().remove(id).apply();
 }
}
