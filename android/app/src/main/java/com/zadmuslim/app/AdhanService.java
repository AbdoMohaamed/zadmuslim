package com.zadmuslim.app;

import android.app.Notification;
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

public class AdhanService extends Service {
    private static final String TAG = "AdhanService";
    public static final String CHANNEL_ID = AdhanAlarmReceiver.ADHAN_ALARM_CHANNEL_ID;
    public static final int NOTIFICATION_ID = AdhanAlarmReceiver.ADHAN_NOTIFICATION_ID;

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

        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "zadmuslim:adhan_service_wakelock");
            wakeLock.setReferenceCounted(false);
            wakeLock.acquire(5 * 60 * 1000L); // 5 دقائق كحد أقصى للأذان
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

        // إظهار إشعار Foreground الموحد
        Notification notification = AdhanAlarmReceiver.buildAdhanAlarmNotification(this, prayerName, prayerKey);
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
        try {
            stopForeground(true);
        } catch (Exception ignored) {}
        stopSelf();
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
