package com.zadmuslim.app;

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
import androidx.core.content.ContextCompat;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;

public class AdhanAlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AdhanAlarmReceiver";
    public static final String PRE_ALERT_CHANNEL_ID = "prayer_pre_alert_channel";
    public static final String BROADCAST_CHANNEL_ID = "zad_cloud_broadcast_channel";

    public static final String ACTION_CHECK_CLOUD_BROADCASTS = "com.zadmuslim.app.ACTION_CHECK_CLOUD_BROADCASTS";
    public static final String EXTRA_IS_PRE_ALERT = "is_pre_alert";
    public static final String EXTRA_PRAYER_NAME = "prayer_name";
    public static final String EXTRA_PRAYER_KEY = "prayer_key";
    public static final String EXTRA_MUAZZIN = "muazzin";

    private static final String FIREBASE_BROADCASTS_URL = "https://sadqah-jaddi-default-rtdb.firebaseio.com/push_broadcasts.json?orderBy=\"$key\"&limitToLast=1";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        Log.d(TAG, "onReceive triggered with action: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action)) {
            Log.d(TAG, "Device rebooted - Scheduling periodic broadcast check");
            checkCloudBroadcastsInBackground(context);
            return;
        }

        if (ACTION_CHECK_CLOUD_BROADCASTS.equals(action)) {
            Log.d(TAG, "Checking cloud broadcasts in background");
            checkCloudBroadcastsInBackground(context);
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

    /**
     * فحص الإشعارات السحابية المرسلة من الأدمن وعرضها حتى والتطبيق مغلق تماماً
     */
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

                    String broadcastKey = keys.next();
                    JSONObject broadcast = root.getJSONObject(broadcastKey);

                    String title = broadcast.optString("title", "زاد المسلم 🌿");
                    String body = broadcast.optString("body", "");
                    long timestamp = broadcast.optLong("timestamp", 0);

                    // التأكد من أن الإشعار جديد ولم يمض عليه أكثر من 24 ساعة
                    long now = System.currentTimeMillis();
                    if (timestamp > 0 && (now - timestamp) > 24 * 60 * 60 * 1000L) {
                        return;
                    }

                    SharedPreferences prefs = context.getSharedPreferences("zad_broadcast_prefs", Context.MODE_PRIVATE);
                    String lastSeenKey = prefs.getString("last_seen_broadcast_id", "");

                    if (!broadcastKey.equals(lastSeenKey) && !body.isEmpty()) {
                        // إشعار جديد لم يسبق للمستخدم رؤيته
                        showCloudBroadcastNotification(context, title, body);
                        prefs.edit().putString("last_seen_broadcast_id", broadcastKey).apply();
                        Log.d(TAG, "New cloud broadcast displayed successfully: " + broadcastKey);
                    }
                }
                conn.disconnect();
            } catch (Exception e) {
                Log.w(TAG, "Error checking cloud broadcasts in background: " + e.getMessage());
            }
        }).start();
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
