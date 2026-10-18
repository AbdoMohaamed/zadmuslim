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

    private PowerManager.WakeLock wakeLock;
    private BroadcastReceiver stopKeysReceiver;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();

        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "zadmuslim:adhan_service_wakelock");
            wakeLock.setReferenceCounted(false);
            wakeLock.acquire(5 * 60 * 1000L); // 5 دقائق كحد أقصى
        }

        // تسجيل مستمع أزرار الصوت وزر القفل لإيقاف الخدمة فوراً
        stopKeysReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null) return;
                String action = intent.getAction();
                if (Intent.ACTION_SCREEN_OFF.equals(action) || "android.media.VOLUME_CHANGED_ACTION".equals(action)) {
                    Log.d(TAG, "AdhanService stopped by hardware key (Screen off / Volume change)");
                    stopAdhanAndSelf();
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        filter.addAction("android.media.VOLUME_CHANGED_ACTION");
        try {
            registerReceiver(stopKeysReceiver, filter);
        } catch (Exception ignored) {}
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP_ADHAN.equals(intent.getAction())) {
            Log.d(TAG, "Received ACTION_STOP_ADHAN in service");
            stopAdhanAndSelf();
            return START_NOT_STICKY;
        }

        String prayerName = "الصلاة";
        String prayerKey = "dhuhr";
        String muazzin = "qatami";

        if (intent != null) {
            if (intent.hasExtra(EXTRA_PRAYER_NAME)) prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME);
            if (intent.hasExtra(EXTRA_PRAYER_KEY)) prayerKey = intent.getStringExtra(EXTRA_PRAYER_KEY);
            if (intent.hasExtra(EXTRA_MUAZZIN)) muazzin = intent.getStringExtra(EXTRA_MUAZZIN);
        }

        // إظهار إشعار Foreground فوري مع زر إيقاف
        Notification notification = buildAdhanNotification(prayerName);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not startForeground with mediaPlayback type, falling back", e);
            try {
                startForeground(NOTIFICATION_ID, notification);
            } catch (Exception ignored) {}
        }

        isPlaying = true;

        // التأكد من أن الصوت يعمل عبر AdhanPlayer
        if (!AdhanPlayer.isPlaying()) {
            AdhanPlayer.play(this, prayerName, prayerKey, muazzin);
        }

        return START_NOT_STICKY;
    }

    private void stopAdhanAndSelf() {
        isPlaying = false;
        AdhanPlayer.stop();
        stopSelf();
    }

    private Notification buildAdhanNotification(String prayerName) {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingOpen = PendingIntent.getActivity(
                this, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        Intent fullScreenIntent = new Intent(this, AdhanActivity.class);
        fullScreenIntent.putExtra(AdhanActivity.EXTRA_PRAYER_NAME, prayerName);
        fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingFullScreen = PendingIntent.getActivity(
                this, 9994, fullScreenIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        Intent stopIntent = new Intent(this, AdhanService.class);
        stopIntent.setAction(ACTION_STOP_ADHAN);
        PendingIntent pendingStop = PendingIntent.getService(
                this, 1, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_icon)
                .setContentTitle("🕌 حَانَ الآنَ مَوْعِدُ " + prayerName)
                .setContentText("الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح")
                .setContentIntent(pendingOpen)
                .setFullScreenIntent(pendingFullScreen, true)
                .setDeleteIntent(pendingStop)
                .addAction(R.drawable.ic_stat_icon, "إيقاف الأذان ⏹", pendingStop)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setAutoCancel(false)
                .setColor(0xFFD4AF37)
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
                channel.setSound(null, null); // الصوت يُدار عبر AdhanPlayer ليعمل على STREAM_ALARM
                nm.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isPlaying = false;

        if (stopKeysReceiver != null) {
            try {
                unregisterReceiver(stopKeysReceiver);
            } catch (Exception ignored) {}
            stopKeysReceiver = null;
        }

        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {}
            wakeLock = null;
        }

        Log.d(TAG, "AdhanService destroyed cleanly");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
