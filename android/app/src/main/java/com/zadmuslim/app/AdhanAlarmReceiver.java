package com.zadmuslim.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;

public class AdhanAlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AdhanAlarmReceiver";
    public static final String PRE_ALERT_CHANNEL_ID = "prayer_pre_alert_channel";
    public static final String ADHAN_ALARM_CHANNEL_ID = "adhan_alarm_notification_channel";
    public static final String BROADCAST_CHANNEL_ID = "zad_cloud_broadcast_channel";

    public static final String ACTION_CHECK_CLOUD_BROADCASTS = "com.zadmuslim.app.ACTION_CHECK_CLOUD_BROADCASTS";
    public static final String ACTION_STOP_ADHAN = "com.zadmuslim.app.ACTION_STOP_ADHAN";

    public static final String EXTRA_IS_PRE_ALERT = "is_pre_alert";
    public static final String EXTRA_PRAYER_NAME = "prayer_name";
    public static final String EXTRA_PRAYER_KEY = "prayer_key";
    public static final String EXTRA_MUAZZIN = "muazzin";

    public static final int ADHAN_NOTIFICATION_ID = 99992;

    private static final String FIREBASE_BROADCASTS_URL = "https://sadqah-jaddi-default-rtdb.firebaseio.com/push_broadcasts.json";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        Log.d(TAG, "onReceive triggered with action: " + action);

        if (ACTION_STOP_ADHAN.equals(action)) {
            Log.d(TAG, "User requested to stop Adhan");
            AdhanPlayer.stop();
            dismissAdhanNotification(context);
            return;
        }

        if (Intent.ACTION_BOOT_COMPLETED.equals(action) || "android.intent.action.QUICKBOOT_POWERON".equals(action) || "com.htc.intent.action.QUICKBOOT_POWERON".equals(action)) {
            Log.d(TAG, "Device rebooted - Rescheduling prayer alarms and periodic broadcast check");
            AdhanNativePlugin.rescheduleAlarmsFromPrefs(context);
            checkCloudBroadcastsInBackground(context);
            scheduleNextBroadcastCheck(context);
            return;
        }

        if (ACTION_CHECK_CLOUD_BROADCASTS.equals(action)) {
            Log.d(TAG, "Checking cloud broadcasts in background");
            checkCloudBroadcastsInBackground(context);
            scheduleNextBroadcastCheck(context);
            return;
        }

        boolean isPreAlert = intent.getBooleanExtra(EXTRA_IS_PRE_ALERT, false);
        String prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME);
        String prayerKey = intent.getStringExtra(EXTRA_PRAYER_KEY);
        String muazzin = intent.getStringExtra(EXTRA_MUAZZIN);

        if (prayerName == null) prayerName = "الصلاة";

        if (isPreAlert) {
            // تنبيه اقتراب موعد الصلاة قبل 5 دقائق بصوت ناطق: "اقتربت صلاة..."
            AdhanPlayer.playPrePrayerVoice(context, prayerKey);
            showPrePrayerNotification(context, prayerName, prayerKey);
        } else {
            // 1. تشغيل الأذان الصوتي فوراً عبر AdhanPlayer على تيار المنبه (STREAM_ALARM)
            AdhanPlayer.play(context, prayerName, prayerKey, muazzin);

            // 2. إظهار إشعار الأذان المتكامل مع زر إيقاف الأذان وميزة الإيقاف عند المسح
            showAdhanAlarmNotification(context, prayerName, prayerKey);
        }
    }

    private void showAdhanAlarmNotification(Context context, String prayerName, String prayerKey) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    ADHAN_ALARM_CHANNEL_ID,
                    "أذان الصلوات المفروضة (صوت كامل)",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("تشغيل الأذان والتنبيه بدخول وقت الصلاة");
            channel.enableVibration(true);
            channel.enableLights(true);
            channel.setLightColor(0xFFD4AF37);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(channel);
        }

        // نية فتح التطبيق
        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingOpen = PendingIntent.getActivity(
                context, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        // نية إيقاف الأذان عند النقر على زر الإيقاف أو مسح الإشعار
        Intent stopIntent = new Intent(context, AdhanAlarmReceiver.class);
        stopIntent.setAction(ACTION_STOP_ADHAN);
        PendingIntent pendingStop = PendingIntent.getBroadcast(
                context, 9991, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, ADHAN_ALARM_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_icon)
                .setContentTitle("🕌 حَانَ الآنَ مَوْعِدُ " + prayerName)
                .setContentText("الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح")
                .setContentIntent(pendingOpen)
                .setDeleteIntent(pendingStop) // عند مسح الإشعار يتم إيقاف الصوت
                .addAction(R.drawable.ic_stat_icon, "إيقاف الأذان ⏹", pendingStop)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setColor(0xFFD4AF37)
                .setAutoCancel(true);

        nm.notify(ADHAN_NOTIFICATION_ID, builder.build());
    }

    private void dismissAdhanNotification(Context context) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.cancel(ADHAN_NOTIFICATION_ID);
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
            channel.setSound(null, null); // الصوت يتم تشغيله ناطقاً عبر AdhanPlayer
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

    private void checkCloudBroadcastsInBackground(Context context) {
        new Thread(() -> {
            try {
                URL url = new URL(FIREBASE_BROADCASTS_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(8000);

                if (conn.getResponseCode() == 200) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = in.readLine()) != null) {
                        response.append(line);
                    }
                    in.close();

                    String jsonStr = response.toString().trim();
                    if (jsonStr.isEmpty() || jsonStr.equals("null")) return;

                    JSONObject root = new JSONObject(jsonStr);
                    Iterator<String> keys = root.keys();
                    if (!keys.hasNext()) return;

                    String broadcastKey = "";
                    while (keys.hasNext()) {
                        broadcastKey = keys.next();
                    }
                    if (broadcastKey.isEmpty()) return;

                    JSONObject broadcast = root.getJSONObject(broadcastKey);

                    String title = broadcast.optString("title", "زاد المسلم 🌿");
                    String body = broadcast.optString("body", "");
                    long timestamp = broadcast.optLong("timestamp", 0);

                    long now = System.currentTimeMillis();
                    if (timestamp > 0 && (now - timestamp) > 24 * 60 * 60 * 1000L) {
                        return;
                    }

                    SharedPreferences prefs = context.getSharedPreferences("zad_broadcast_prefs", Context.MODE_PRIVATE);
                    String lastSeenKey = prefs.getString("last_seen_broadcast_id", "");

                    if (!broadcastKey.equals(lastSeenKey) && !body.isEmpty()) {
                        showCloudBroadcastNotification(context, title, body);
                        prefs.edit().putString("last_seen_broadcast_id", broadcastKey).apply();
                        Log.d(TAG, "New cloud broadcast displayed successfully: " + broadcastKey);
                    }
                }
                conn.disconnect();
            } catch (Exception e) {
                Log.w(TAG, "Error checking cloud broadcasts in background: " + e.getMessage());
            } finally {
                scheduleNextBroadcastCheck(context);
            }
        }).start();
    }

    public static void scheduleNextBroadcastCheck(Context context) {
        try {
            android.app.AlarmManager am = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            Intent syncIntent = new Intent(context, AdhanAlarmReceiver.class);
            syncIntent.setAction(ACTION_CHECK_CLOUD_BROADCASTS);
            PendingIntent pendingSync = PendingIntent.getBroadcast(
                    context, 77701, syncIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );
            long nextTrigger = System.currentTimeMillis() + (15 * 60 * 1000L); // فحص دوري كل 15 دقيقة
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, nextTrigger, pendingSync);
            } else {
                am.setExact(android.app.AlarmManager.RTC_WAKEUP, nextTrigger, pendingSync);
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to schedule next broadcast check: " + e.getMessage());
        }
    }

    private void showCloudBroadcastNotification(Context context, String title, String body) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    BROADCAST_CHANNEL_ID,
                    "إشعارات ورسائل زاد المسلم العامة",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("استقبال رسائل وتذكيرات الأدمن العامة");
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

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, BROADCAST_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_icon)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setContentIntent(pendingOpen)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setColor(0xFFD4AF37);

        nm.notify((int) (System.currentTimeMillis() % 100000), builder.build());
    }
}
