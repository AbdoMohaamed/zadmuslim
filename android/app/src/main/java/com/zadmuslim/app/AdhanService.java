package com.zadmuslim.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class AdhanService extends Service {
    private static final String TAG = "AdhanService";
    public static final String CHANNEL_ID = "adhan_alarm_channel_v2";
    public static final int NOTIFICATION_ID = 99991;

    public static final String ACTION_START_ADHAN = "com.zadmuslim.app.ACTION_START_ADHAN";
    public static final String ACTION_STOP_ADHAN = "com.zadmuslim.app.ACTION_STOP_ADHAN";

    public static final String EXTRA_PRAYER_NAME = "prayer_name";
    public static final String EXTRA_PRAYER_KEY = "prayer_key";
    public static final String EXTRA_MUAZZIN = "muazzin";

    public static volatile boolean isPlaying = false;

    private MediaPlayer mediaPlayer;
    private PowerManager.WakeLock wakeLock;
    private AudioManager audioManager;
    private Object audioFocusRequestObj; // Holds AudioFocusRequest on API 26+

    private final AudioManager.OnAudioFocusChangeListener audioFocusChangeListener = new AudioManager.OnAudioFocusChangeListener() {
        @Override
        public void onAudioFocusChange(int focusChange) {
            Log.d(TAG, "Audio focus changed: " + focusChange);
            if (focusChange == AudioManager.AUDIOFOCUS_LOSS || focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                // فقدان التركيز الصوتي (مكالمة هاتفية واردة أو منبه آخر)
                stopSelf();
            } else if (focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) {
                // خفض الصوت مؤقتاً
                if (mediaPlayer != null && isPlaying) {
                    try { mediaPlayer.setVolume(0.2f, 0.2f); } catch (Exception ignored) {}
                }
            } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
                // استعادة الصوت بالكامل
                if (mediaPlayer != null && isPlaying) {
                    try { mediaPlayer.setVolume(1.0f, 1.0f); } catch (Exception ignored) {}
                }
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);

        // إبقاء المعالج يعمل أثناء تشغيل الأذان كاملاً في الخلفية وشاشة القفل
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "zadmuslim:adhan_wakelock");
            wakeLock.acquire(5 * 60 * 1000L); // 5 دقائق كحد أقصى
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP_ADHAN.equals(intent.getAction())) {
            Log.d(TAG, "Received ACTION_STOP_ADHAN - Stopping");
            stopSelf();
            return START_NOT_STICKY;
        }

        String prayerName = "الصلاة";
        String prayerKey = "dhuhr";
        String muazzin = "makkah";

        if (intent != null) {
            if (intent.hasExtra(EXTRA_PRAYER_NAME)) {
                prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME);
            }
            if (intent.hasExtra(EXTRA_PRAYER_KEY)) {
                prayerKey = intent.getStringExtra(EXTRA_PRAYER_KEY);
            }
            if (intent.hasExtra(EXTRA_MUAZZIN)) {
                muazzin = intent.getStringExtra(EXTRA_MUAZZIN);
            }
        }

        // إظهار إشعار Foreground فوري مع زر إيقاف
        Notification notification = buildAdhanNotification(prayerName, prayerKey);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        // طلب التركيز الصوتي وتشغيل صوت الأذان
        requestAudioFocusAndPlay(prayerKey, muazzin);

        return START_NOT_STICKY;
    }

    private void requestAudioFocusAndPlay(String prayerKey, String muazzin) {
        // التحقق مما إذا كان المستخدم يجري مكالمة هاتفية حالياً
        if (audioManager != null) {
            int mode = audioManager.getMode();
            if (mode == AudioManager.MODE_IN_CALL || mode == AudioManager.MODE_IN_COMMUNICATION) {
                Log.w(TAG, "User currently in call - suppressing loud Adhan playback");
                return;
            }
        }

        // طلب AudioFocus
        boolean focusGranted = false;
        if (audioManager != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AudioAttributes playbackAttrs = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build();

                android.media.AudioFocusRequest afr = new android.media.AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                        .setAudioAttributes(playbackAttrs)
                        .setOnAudioFocusChangeListener(audioFocusChangeListener)
                        .build();

                audioFocusRequestObj = afr;
                focusGranted = (audioManager.requestAudioFocus(afr) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED);
            } else {
                focusGranted = (audioManager.requestAudioFocus(
                        audioFocusChangeListener,
                        AudioManager.STREAM_ALARM,
                        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
                ) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED);
            }
        }

        Log.d(TAG, "Audio focus granted: " + focusGranted);
        playAdhanAudio(prayerKey, muazzin);
    }

    private void releaseAudioFocus() {
        if (audioManager != null) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequestObj instanceof android.media.AudioFocusRequest) {
                    audioManager.abandonAudioFocusRequest((android.media.AudioFocusRequest) audioFocusRequestObj);
                } else {
                    audioManager.abandonAudioFocus(audioFocusChangeListener);
                }
            } catch (Exception ignored) {}
            audioFocusRequestObj = null;
        }
    }

    private void playAdhanAudio(String prayerKey, String muazzin) {
        stopMediaPlayer();

        int soundResId = getSoundResourceId(prayerKey, muazzin);
        if (soundResId == 0) {
            soundResId = R.raw.adhan_makkah;
        }

        try {
            mediaPlayer = new MediaPlayer();
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM) // استخدام تيار المنبه ليعمل دائماً بصوت واضح
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();
            mediaPlayer.setAudioAttributes(audioAttributes);
            mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);

            Uri uri = Uri.parse("android.resource://" + getPackageName() + "/" + soundResId);
            mediaPlayer.setDataSource(getApplicationContext(), uri);
            mediaPlayer.prepare();
            mediaPlayer.setOnCompletionListener(mp -> {
                Log.d(TAG, "Adhan completed naturally - Stopping Service");
                stopSelf();
            });
            mediaPlayer.start();
            isPlaying = true;
            Log.d(TAG, "Adhan MediaPlayer started successfully with resource: " + soundResId);
        } catch (Exception e) {
            Log.e(TAG, "Error playing adhan audio", e);
            stopSelf();
        }
    }

    private int getSoundResourceId(String prayerKey, String muazzin) {
        if ("fajr".equalsIgnoreCase(prayerKey)) {
            return R.raw.adhan_fajr;
        }
        if (muazzin == null) muazzin = "makkah";
        String name = "adhan_" + muazzin.toLowerCase();
        int res = getResources().getIdentifier(name, "raw", getPackageName());
        return res != 0 ? res : R.raw.adhan_makkah;
    }

    private Notification buildAdhanNotification(String prayerName, String prayerKey) {
        // نية فتح التطبيق عند النقر
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingOpen = PendingIntent.getActivity(
                this, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        // نية إيقاف الأذان عند الضغط على زر الإيقاف
        Intent stopIntent = new Intent(this, AdhanService.class);
        stopIntent.setAction(ACTION_STOP_ADHAN);
        PendingIntent pendingStop = PendingIntent.getService(
                this, 1, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_icon)
                .setContentTitle("🕌 حان الآن موعد " + prayerName)
                .setContentText("الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح")
                .setContentIntent(pendingOpen)
                .setDeleteIntent(pendingStop) // عند مسح الإشعار يتم إيقاف الأذان
                .addAction(R.drawable.ic_stat_icon, "إيقاف الأذان ⏹", pendingStop)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setAutoCancel(false)
                .setColor(0xFFD4AF37) // لون ذهبي زاد المسلم
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        "أذان الصلوات المفروضة",
                        NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("تشغيل الأذان الصوتي الكامل والتنبيهات عند دخول الوقت");
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                channel.enableVibration(true);
                channel.enableLights(true);
                channel.setLightColor(0xFFD4AF37);
                // الصوت يُدار عبر MediaPlayer في الخدمة بصوت منبه كامل
                channel.setSound(null, null);
                nm.createNotificationChannel(channel);
            }
        }
    }

    private void stopMediaPlayer() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
            } catch (Exception ignored) {}
            mediaPlayer = null;
        }
        isPlaying = false;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopMediaPlayer();
        releaseAudioFocus();

        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {}
        }

        Log.d(TAG, "AdhanService destroyed cleanly");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
