package com.zadmuslim.app;
import android.app.*;
import android.content.*;
import android.media.*;
import android.media.session.*;
import android.os.*;
import androidx.core.app.NotificationCompat;

/** User-started radio playback independent of the WebView and its timers. */
public class RadioService extends Service {
 private static final int ID=99980;
 private static final String CHANNEL="zad_radio_playback";
 public static volatile String state="paused", stationId="";
 public static volatile boolean wanted=false;
 public static volatile long sleepDeadline=0;
 private static RadioService instance;
 private MediaPlayer player;
 private MediaSession session;
 private AudioManager audioManager;
 private BroadcastReceiver noisyReceiver;
 private AudioFocusRequest focus;
 private AudioManager.OnAudioFocusChangeListener focusListener;
 private final Handler handler=new Handler(Looper.getMainLooper());
 private String url="", backup="", name="راديو القرآن";
 private float volume=.8f;
 private int attempt=0, generation=0;
 private boolean focusHeld=false, interrupted=false;
 private Runnable retry, watchdog, stable;
 private final Runnable sleeper=()->{if(sleepDeadline>0 && System.currentTimeMillis()>=sleepDeadline)stopPlayback();};
 public static void stopPlayback(){RadioService s=instance;if(s!=null)s.handler.post(()->{wanted=false;sleepDeadline=0;s.handler.removeCallbacks(s.sleeper);s.releasePlayer();s.publish("paused");s.stopSelf();});else{wanted=false;state="paused";}}
 public static void setVolume(float value){RadioService s=instance;if(s!=null)s.handler.post(()->{s.volume=Math.max(0,Math.min(1,value));if(s.player!=null)s.player.setVolume(s.volume,s.volume);});}
 public static void setSleepDeadline(long at){sleepDeadline=at;RadioService s=instance;if(s!=null)s.handler.post(()->{s.handler.removeCallbacks(s.sleeper);if(at>0)s.handler.postDelayed(s.sleeper,Math.max(0,at-System.currentTimeMillis()));});}
 @Override public void onCreate(){
  super.onCreate();instance=this;audioManager=(AudioManager)getSystemService(AUDIO_SERVICE);
  if(Build.VERSION.SDK_INT>=26){NotificationChannel channel=new NotificationChannel(CHANNEL,"تشغيل الراديو",NotificationManager.IMPORTANCE_LOW);channel.setSound(null,null);((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(channel);}
  session=new MediaSession(this,"ZadRadio");session.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS|MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS);
  session.setCallback(new MediaSession.Callback(){@Override public void onPause(){stopPlayback();}@Override public void onStop(){stopPlayback();}});
  session.setActive(true);
  noisyReceiver=new BroadcastReceiver(){@Override public void onReceive(Context context,Intent intent){stopPlayback();}};
  androidx.core.content.ContextCompat.registerReceiver(this,noisyReceiver,new IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY),androidx.core.content.ContextCompat.RECEIVER_NOT_EXPORTED);
 }
 private Notification notification(){
  Intent open=getPackageManager().getLaunchIntentForPackage(getPackageName());
  PendingIntent content=PendingIntent.getActivity(this,ID,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  PendingIntent stop=PendingIntent.getService(this,ID,new Intent(this,RadioService.class).setAction("STOP"),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  String text="playing".equals(state)?"يعمل الآن":"interrupted".equals(state)?"متوقف مؤقتًا للمكالمة أو الأذان":"جاري الاتصال بالبث";
  Notification.Builder builder=Build.VERSION.SDK_INT>=26?new Notification.Builder(this,CHANNEL):new Notification.Builder(this);
  return builder.setSmallIcon(R.drawable.ic_stat_icon).setContentTitle(name).setContentText(text).setContentIntent(content)
    .setOngoing(true).setVisibility(Notification.VISIBILITY_PUBLIC).setOnlyAlertOnce(true)
    .addAction(new Notification.Action.Builder(android.R.drawable.ic_media_pause,"إيقاف",stop).build())
    .setStyle(new Notification.MediaStyle().setMediaSession(session.getSessionToken()).setShowActionsInCompactView(0)).build();
 }
 @Override public int onStartCommand(Intent intent,int flags,int startId){
  if(intent==null||"STOP".equals(intent.getAction())){stopPlayback();return START_NOT_STICKY;}
  name=intent.getStringExtra("name");url=intent.getStringExtra("url");backup=intent.getStringExtra("backup");stationId=intent.getStringExtra("id");volume=intent.getFloatExtra("volume",.8f);
  try{startForeground(ID,notification());}catch(Exception e){wanted=false;state="failed";stopSelf();return START_NOT_STICKY;}
  wanted=true;attempt=0;interrupted=false;
  session.setMetadata(new MediaMetadata.Builder().putString(MediaMetadata.METADATA_KEY_TITLE,name).putString(MediaMetadata.METADATA_KEY_ARTIST,"زاد المسلم").build());
  setSleepDeadline(sleepDeadline);connect();return START_NOT_STICKY;
 }
 private void publish(String value){state=value;int playback="playing".equals(value)?PlaybackState.STATE_PLAYING:PlaybackState.STATE_PAUSED;
  session.setPlaybackState(new PlaybackState.Builder().setActions(PlaybackState.ACTION_PAUSE|PlaybackState.ACTION_STOP).setState(playback,PlaybackState.PLAYBACK_POSITION_UNKNOWN,1).build());
  if(wanted)((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).notify(ID,notification());
 }
 private void clearTimers(){if(retry!=null)handler.removeCallbacks(retry);if(watchdog!=null)handler.removeCallbacks(watchdog);if(stable!=null)handler.removeCallbacks(stable);retry=watchdog=stable=null;}
 private void releasePlayer(){generation++;clearTimers();if(player!=null){try{player.release();}catch(Exception ignored){}player=null;}}
 private boolean requestFocus(){
  if(focusHeld)return true;
  AudioManager.OnAudioFocusChangeListener listener=change->{
   if(change==AudioManager.AUDIOFOCUS_GAIN){focusHeld=true;if(wanted&&interrupted){interrupted=false;connect();}}
   else if(change==AudioManager.AUDIOFOCUS_LOSS){focusHeld=false;stopPlayback();}
   else if(change==AudioManager.AUDIOFOCUS_LOSS_TRANSIENT||change==AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK){interrupted=true;releasePlayer();publish("interrupted");}
  };
  focusListener=listener;
  if(Build.VERSION.SDK_INT<26){focusHeld=audioManager.requestAudioFocus(listener,AudioManager.STREAM_MUSIC,AudioManager.AUDIOFOCUS_GAIN)==AudioManager.AUDIOFOCUS_REQUEST_GRANTED;return focusHeld;}
  focus=new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN).setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build()).setOnAudioFocusChangeListener(listener,handler).build();
  focusHeld=audioManager.requestAudioFocus(focus)==AudioManager.AUDIOFOCUS_REQUEST_GRANTED;return focusHeld;
 }
 private void connect(){
  if(!wanted||interrupted)return;
  if(sleepDeadline>0&&System.currentTimeMillis()>=sleepDeadline){stopPlayback();return;}
  releasePlayer();publish("connecting");
  if(!requestFocus()){wanted=false;publish("blocked");stopSelf();return;}
  final int ticket=generation;
  try{
   MediaPlayer next=new MediaPlayer();player=next;
   next.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
   next.setWakeMode(this,PowerManager.PARTIAL_WAKE_LOCK);next.setVolume(volume,volume);
   next.setDataSource(attempt%2==1&&backup!=null&&!backup.isEmpty()?backup:url);
   next.setOnPreparedListener(mp->{if(ticket!=generation||!wanted)return;mp.start();clearTimers();publish("playing");stable=()->{attempt=0;};handler.postDelayed(stable,30000);});
   next.setOnErrorListener((mp,what,extra)->{if(ticket==generation)reconnect();return true;});
   next.setOnCompletionListener(mp->{if(ticket==generation)reconnect();});
   next.setOnInfoListener((mp,what,extra)->{if(ticket!=generation)return false;if(what==MediaPlayer.MEDIA_INFO_BUFFERING_START){publish("buffering");watch();}else if(what==MediaPlayer.MEDIA_INFO_BUFFERING_END){if(watchdog!=null)handler.removeCallbacks(watchdog);watchdog=null;publish("playing");}return false;});
   next.prepareAsync();watch();
  }catch(Exception e){reconnect();}
 }
 private void watch(){if(watchdog==null){watchdog=()->{watchdog=null;reconnect();};handler.postDelayed(watchdog,18000);}}
 private boolean online(){android.net.ConnectivityManager cm=(android.net.ConnectivityManager)getSystemService(CONNECTIVITY_SERVICE);android.net.Network network=cm.getActiveNetwork();return network!=null;}
 private void reconnect(){
  if(!wanted||interrupted||retry!=null)return;
  releasePlayer();if(!online()){publish("offline");retry=()->{retry=null;connect();};handler.postDelayed(retry,5000);return;}if(attempt>=6){wanted=false;publish("failed");stopSelf();return;}
  long delay=Math.min(1000L<<attempt,30000);attempt++;publish("retrying");retry=()->{retry=null;connect();};handler.postDelayed(retry,delay);
 }
 @Override public void onDestroy(){if(noisyReceiver!=null)unregisterReceiver(noisyReceiver);wanted=false;releasePlayer();handler.removeCallbacksAndMessages(null);if(Build.VERSION.SDK_INT>=26&&focus!=null)audioManager.abandonAudioFocusRequest(focus);else if(focusListener!=null)audioManager.abandonAudioFocus(focusListener);if(session!=null){session.setActive(false);session.release();}instance=null;stopForeground(true);super.onDestroy();}
 @Override public IBinder onBind(Intent intent){return null;}
}
