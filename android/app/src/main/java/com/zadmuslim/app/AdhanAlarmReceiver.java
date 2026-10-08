package com.zadmuslim.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

public class AdhanAlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AdhanAlarmReceiver";
    public static final String PRE_ALERT_CHANNEL_ID = "prayer_pre_alert_channel";

    public static final String EXTRA_IS_PRE_ALERT = "is_pre_alert";
    public static final String EXTRA_PRAYER_NAME = "prayer_name";
    public static final String EXTRA_PRAYER_KEY = "prayer_key";
    public static final String EXTRA_MUAZZIN = "muazzin";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        Log.d(TAG, "onReceive triggered with action: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action)) {
            Log.d(TAG, "Device rebooted - Alarms should be reloaded on next app open or saved state");
            return;
        }

        boolean isPreAlert = intent.getBooleanExtra(EXTRA_IS_PRE_ALERT, false);
        String prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME);
        String prayerKey = intent.getStringExtra(EXTRA_PRAYER_KEY);
        String muazzin = intent.getStringExtra(EXTRA_MUAZZIN);

        if (prayerName == null) prayerName = "الصلاة";

        if (isPreAlert) {
            // تنبيه اقتراب موعد الصلاة قبل 5 دقائق
            showPrePrayerNotification(context, prayerName, prayerKey);
        } else {
            // تشغيل الأذان الفعلي في الخلفية عبر Foreground Service
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            PowerManager.WakeLock wakeLock = null;
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "zadmuslim:alarm_receiver_wake");
                wakeLock.acquire(10 * 1000L); // 10 ثوانٍ
            }

            try {
                Intent serviceIntent = new Intent(context, AdhanService.class);
                serviceIntent.putExtra(AdhanService.EXTRA_PRAYER_NAME, prayerName);
                serviceIntent.putExtra(AdhanService.EXTRA_PRAYER_KEY, prayerKey);
                serviceIntent.putExtra(AdhanService.EXTRA_MUAZZIN, muazzin);

                ContextCompat.startForegroundService(context, serviceIntent);
                Log.d(TAG, "AdhanService started successfully for " + prayerName);
            } catch (Exception e) {
                Log.e(TAG, "Failed to start AdhanService", e);
            } finally {
                if (wakeLock != null && wakeLock.isHeld()) {
                    try {
                        wakeLock.release();
                    } catch (Exception ignored) {}
                }
            }
        }
    }

    private void showPrePrayerNotification(Context context, String prayerName, String prayerKey) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    PRE_ALERT_CHANNEL_ID,
                    "تنبيه اقتراب موعد الصلاة (قبل 5 دقائق)",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("تذكير بالاستعداد للصلاة والوضوء قبل الأذان بـ 5 دقائق");
            channel.enableVibration(true);
            channel.enableLights(true);
            channel.setLightColor(0xFFD4AF37);
            nm.createNotificationChannel(channel);
        }

        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingOpen = PendingIntent.getActivity(
                context, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, PRE_ALERT_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_icon)
                .setContentTitle("⏳ اقتربت " + prayerName)
                .setContentText("بقي 5 دقائق على دخول وقت " + prayerName + ". تهيأ للوضوء والصلاة 🌿")
                .setContentIntent(pendingOpen)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setColor(0xFFD4AF37);

        int notifId = 88800 + (prayerKey != null ? Math.abs(prayerKey.hashCode() % 100) : 1);
        nm.notify(notifId, builder.build());
    }
}
