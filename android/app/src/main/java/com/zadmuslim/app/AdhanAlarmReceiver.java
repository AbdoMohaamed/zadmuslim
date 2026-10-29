package com.zadmuslim.app;

import android.app.AlarmManager;
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
    public static final String ACTION_PRAYER_ALARM = "com.zadmuslim.app.ACTION_PRAYER_ALARM";

    public static final String EXTRA_IS_PRE_ALERT = "is_pre_alert";
    public static final String EXTRA_PRAYER_NAME = "prayer_name";
    public static final String EXTRA_PRAYER_KEY = "prayer_key";
    public static final String EXTRA_MUAZZIN = "muazzin";
    public static final String EXTRA_PRE_ALERT_INTERVAL = "pre_alert_interval";
    public static final String EXTRA_SHOW_PRAYER_IMAGES = "show_prayer_images";

    public static final int ADHAN_NOTIFICATION_ID = 99992;

    private static final String FIREBASE_BROADCASTS_URL = "https://sadqah-jaddi-default-rtdb.firebaseio.com/push_broadcasts.json";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || context == null) return;

        final PendingResult pendingResult = goAsync();
        String action = intent.getAction();
        Log.d(TAG, "onReceive triggered with action: " + action);

        // 1. إيقاف الأذان الفوري
        if (ACTION_STOP_ADHAN.equals(action)) {
            Log.d(TAG, "User requested to stop Adhan via broadcast action");
            AdhanPlayer.stop();
            dismissAdhanNotification(context);
            if (pendingResult != null) pendingResult.finish();
            return;
        }

        // 2. إعادة جدولة المنبهات عند إعادة تشغيل الهاتف أو تحديث التطبيق أو تغيير الوقت والمنطقة الزمنية
        if (AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED.equals(action) ||
            Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            "android.intent.action.QUICKBOOT_POWERON".equals(action) ||
            "com.htc.intent.action.QUICKBOOT_POWERON".equals(action) ||
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action) ||
            "android.intent.action.TIME_SET".equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action)) {
            Log.d(TAG, "System event (" + action + ") - Rescheduling prayer alarms");
            BackgroundReminderReceiver.restore(context);
            AdhanNativePlugin.rescheduleAlarmsFromPrefs(context);
            PrayerWidgetProvider.updateAllWidgets(context);

            cancelLegacyBroadcastCheck(context);
            if (pendingResult != null) pendingResult.finish();
            return;
        }

        if (ACTION_CHECK_CLOUD_BROADCASTS.equals(action)) {

            cancelLegacyBroadcastCheck(context);
            if (pendingResult != null) pendingResult.finish();
            return;
        }

        boolean isPreAlert = intent.getBooleanExtra(EXTRA_IS_PRE_ALERT, false);
        String prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME);
        String prayerKey = intent.getStringExtra(EXTRA_PRAYER_KEY);
        String muazzin = intent.getStringExtra(EXTRA_MUAZZIN);
        int preAlertInterval = intent.getIntExtra(EXTRA_PRE_ALERT_INTERVAL, 5);
        boolean showPrayerImages = intent.getBooleanExtra(EXTRA_SHOW_PRAYER_IMAGES, true);
        if (!intent.hasExtra(EXTRA_SHOW_PRAYER_IMAGES)) {
            try { showPrayerImages = context.getSharedPreferences(AdhanNativePlugin.PREFS_NAME, Context.MODE_PRIVATE).getBoolean("show_prayer_images", true); } catch(Exception ignored) {}
        }

        // صمام أمان: تجاهل أي برودكاست عشوائي ليس مخصصاً لمنبه الصلاة
        if (!ACTION_PRAYER_ALARM.equals(action) && !intent.hasExtra(EXTRA_PRAYER_KEY)) {
            Log.d(TAG, "Ignoring unrelated broadcast without prayer alarm intent: " + action);
            if (pendingResult != null) pendingResult.finish();
            return;
        }

        if (prayerKey == null || prayerKey.trim().isEmpty()) {
            Log.w(TAG, "Rejected adhan trigger with null or empty prayerKey");
            if (pendingResult != null) pendingResult.finish();
            return;
        }

        if (!prayerKey.equals("fajr") && !prayerKey.equals("dhuhr") && !prayerKey.equals("asr") && 
            !prayerKey.equals("maghrib") && !prayerKey.equals("isha")) {
            Log.w(TAG, "Rejected unrecognized prayerKey: " + prayerKey);
            if (pendingResult != null) pendingResult.finish();
            return;
        }

        boolean isTest = intent.getBooleanExtra("is_test", false);

        // صمام أمان زمني لمنع انطلاق أذان قديم أو متأخر جداً (أكثر من 25 دقيقة تأخير بسبب إغلاق الهاتف تماماً)
        long scheduledTime = intent.getLongExtra("scheduled_time", 0L);
        if (!isTest && scheduledTime > 0) {
            long diff = Math.abs(System.currentTimeMillis() - scheduledTime);
            if (diff > 25 * 60 * 1000L) {
                Log.w(TAG, "Discarding stale/delayed alarm (time diff: " + diff + "ms). Phone was likely powered off.");
                if (pendingResult != null) pendingResult.finish();
                return;
            }
        }

        if (prayerName == null || prayerName.isEmpty()) prayerName = "الصلاة";

        // حجز WakeLock فوري لحماية تنفيذ المعالج
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock receiverWakeLock = null;
        if (pm != null) {
            receiverWakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "zadmuslim:alarm_receiver_wakelock");
            receiverWakeLock.acquire(30 * 1000L);
        }

        try {
            if (isPreAlert) {
                // 1. تنبيه اقتراب موعد الصلاة بصوت ناطق
                Log.d(TAG, "Pre-alert alarm triggered for: " + prayerName + " (Interval: " + preAlertInterval + "m)");
                Intent serviceIntent = new Intent(context, AdhanService.class);
                serviceIntent.setAction(AdhanService.ACTION_START_ADHAN);
                serviceIntent.putExtra(EXTRA_IS_PRE_ALERT, true);
                serviceIntent.putExtra(EXTRA_PRAYER_NAME, prayerName);
                serviceIntent.putExtra(EXTRA_PRAYER_KEY, prayerKey);
                serviceIntent.putExtra(EXTRA_PRE_ALERT_INTERVAL, preAlertInterval);
                serviceIntent.putExtra(EXTRA_SHOW_PRAYER_IMAGES, showPrayerImages);
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(serviceIntent);
                    else context.startService(serviceIntent);
                } catch (Exception e) {
                    Log.e(TAG, "Cannot start pre-prayer audio service", e);
                    ((NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE)).notify(
                        88800, buildPrePrayerNotification(context, prayerName, prayerKey, preAlertInterval));
                }
            } else {
                // 2. موعد الأذان الفعلي: تشغيل الصوت فوراً وبأعلى أولوية
                Log.d(TAG, "Main Adhan alarm triggered for: " + prayerName + " with muazzin: " + muazzin);

                // أ. تشغيل الصوت فوراً عبر AdhanPlayer (يعمل على STREAM_ALARM بحجم كامل)
                // Service enters foreground before starting audio and requesting audio focus.

                // ب. إظهار إشعار شاشة القفل التفاعلي مع FullScreenIntent
                showAdhanAlarmNotification(context, prayerName, prayerKey);

                // تحديث ويدجت الشاشة الرئيسية فوراً لينتقل للصلاة التالية
                try {
                    PrayerWidgetProvider.updateAllWidgets(context);
                } catch (Exception ignored) {}

                // ج. تشغيل AdhanService كـ Foreground Service لضمان حماية المعالج في الخلفية
                try {
                    Intent serviceIntent = new Intent(context, AdhanService.class);
                    serviceIntent.setAction(AdhanService.ACTION_START_ADHAN);
                    serviceIntent.putExtra(AdhanService.EXTRA_PRAYER_NAME, prayerName);
                    serviceIntent.putExtra(AdhanService.EXTRA_PRAYER_KEY, prayerKey);
                    serviceIntent.putExtra(AdhanService.EXTRA_MUAZZIN, muazzin);

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent);
                    } else {
                        context.startService(serviceIntent);
                    }
                } catch (Exception serviceErr) {
                    Log.w(TAG, "Notice on starting AdhanService foreground: " + serviceErr.getMessage());
                }

                // د. محاولة فتح شاشة الأذان الكاملة على شاشة القفل
                try {
                    Intent activityIntent = new Intent(context, AdhanActivity.class);
                    activityIntent.putExtra(AdhanActivity.EXTRA_PRAYER_NAME, prayerName);
                    activityIntent.putExtra(AdhanActivity.EXTRA_PRAYER_KEY, prayerKey);
                    activityIntent.putExtra(EXTRA_SHOW_PRAYER_IMAGES, showPrayerImages);
                    activityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    context.startActivity(activityIntent);
                } catch (Exception actErr) {
                    Log.w(TAG, "Notice on launching AdhanActivity: " + actErr.getMessage());
                }
            }
        } finally {
            if (receiverWakeLock != null && receiverWakeLock.isHeld()) {
                try {
                    receiverWakeLock.release();
                } catch (Exception ignored) {}
            }
            if (pendingResult != null) {
                try {
                    pendingResult.finish();
                } catch (Exception ignored) {}
            }
        }
    }

    public static Notification buildAdhanAlarmNotification(Context context, String prayerName, String prayerKey) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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
            channel.setSound(null, null); // كتم صوت الإشعار الافتراضي لأن الأذان يعمل عبر AdhanPlayer
            nm.createNotificationChannel(channel);
        }

        // نية فتح التطبيق
        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingOpen = PendingIntent.getActivity(
                context, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        // نية فتح شاشة الأذان الكاملة على شاشة القفل (Full Screen Intent)
        Intent fullScreenIntent = new Intent(context, AdhanActivity.class);
        fullScreenIntent.putExtra(AdhanActivity.EXTRA_PRAYER_NAME, prayerName);
        fullScreenIntent.putExtra(AdhanActivity.EXTRA_PRAYER_KEY, prayerKey);
        fullScreenIntent.putExtra(AdhanActivity.EXTRA_SHOW_PRAYER_IMAGES, true);
        // AdhanActivity reads the saved image preference when no override is supplied.
        fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingFullScreen = PendingIntent.getActivity(
                context, 9993, fullScreenIntent,
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
                .setFullScreenIntent(pendingFullScreen, true)
                .setDeleteIntent(pendingStop) // عند مسح الإشعار يتم إيقاف الصوت
                .addAction(R.drawable.ic_stat_icon, "إيقاف الأذان ⏹", pendingStop)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setColor(0xFFD4AF37)
                .setOngoing(true)
                .setAutoCancel(false);

        // إرفاق صورة الصلاة الخاصة بدخول الوقت للأذان
        boolean showImagesPref = true;
        try { showImagesPref = context.getSharedPreferences(AdhanNativePlugin.PREFS_NAME, Context.MODE_PRIVATE).getBoolean("show_prayer_images", true); } catch(Exception ignored) {}
        if (showImagesPref) {
            try {
                int resId = AdhanActivity.getPrayerImageResId(prayerKey != null ? prayerKey : prayerName);
                if (resId != 0) {
                    android.graphics.Bitmap bitmap = android.graphics.BitmapFactory.decodeResource(context.getResources(), resId);
                    if (bitmap != null) {
                        builder.setLargeIcon(bitmap);
                        builder.setStyle(new NotificationCompat.BigPictureStyle()
                                .bigPicture(bitmap)
                                .setBigContentTitle("🕌 حَانَ الآنَ مَوْعِدُ " + prayerName)
                                .setSummaryText("الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح"));
                    }
                }
            } catch (Throwable t) {
                Log.w(TAG, "Error attaching prayer image to adhan notification: " + t.getMessage());
            }
        }

        return builder.build();
    }

    private void showAdhanAlarmNotification(Context context, String prayerName, String prayerKey) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        nm.notify(ADHAN_NOTIFICATION_ID, buildAdhanAlarmNotification(context, prayerName, prayerKey));
    }

    public static void dismissAdhanNotification(Context context) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.cancel(ADHAN_NOTIFICATION_ID);
            nm.cancel(AdhanService.NOTIFICATION_ID);
        }
    }

    public static Notification buildPrePrayerNotification(Context context, String prayerName, String prayerKey, int intervalMinutes) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) throw new IllegalStateException("NotificationManager unavailable");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    PRE_ALERT_CHANNEL_ID,
                    "تنبيه اقتراب موعد الصلاة",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("تذكير بالاستعداد للصلاة والوضوء قبل الأذان");
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

        Intent stopIntent = new Intent(context, AdhanAlarmReceiver.class).setAction(ACTION_STOP_ADHAN);
        PendingIntent pendingStop = PendingIntent.getBroadcast(context, 9991, stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String minutesWord = (intervalMinutes == 1) ? "دقيقة واحدة" : (intervalMinutes == 2) ? "دقيقتين" : (intervalMinutes <= 10) ? (intervalMinutes + " دقائق") : (intervalMinutes + " دقيقة");
        String contentText = "بقي " + minutesWord + " على دخول وقت " + prayerName + ". تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, PRE_ALERT_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_icon)
                .setContentTitle("⏳ اقتربت " + prayerName)
                .setContentText(contentText)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(contentText))
                .addAction(R.drawable.ic_stat_icon, "إيقاف الصوت", pendingStop)
                .setDeleteIntent(pendingStop)
                .setContentIntent(pendingOpen)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setColor(0xFFD4AF37);

        // إرفاق صورة الصلاة لتنبيه اقتراب موعد الصلاة
        boolean showPreImagesPref = true;
        try { showPreImagesPref = context.getSharedPreferences(AdhanNativePlugin.PREFS_NAME, Context.MODE_PRIVATE).getBoolean("show_prayer_images", true); } catch(Exception ignored) {}
        if (showPreImagesPref) {
            try {
                int resId = AdhanActivity.getPrayerImageResId(prayerKey != null ? prayerKey : prayerName);
                if (resId != 0) {
                    android.graphics.Bitmap bitmap = android.graphics.BitmapFactory.decodeResource(context.getResources(), resId);
                    if (bitmap != null) {
                        builder.setLargeIcon(bitmap);
                        builder.setStyle(new NotificationCompat.BigPictureStyle()
                                .bigPicture(bitmap)
                                .setBigContentTitle("⏳ اقتربت " + prayerName)
                                .setSummaryText(contentText));
                    }
                }
            } catch (Throwable t) {
                Log.w(TAG, "Error attaching prayer image to pre-prayer notification: " + t.getMessage());
            }
        }

        return builder.build();
    }

    // Compatibility entry points cancel old polling alarms after an app update.
    // OneSignal is the only owner of remote admin notifications.
    public static void triggerImmediateBroadcastCheck(Context context) {
        cancelLegacyBroadcastCheck(context);
    }

    public static void cancelLegacyBroadcastCheck(Context context) {
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, AdhanAlarmReceiver.class).setAction(ACTION_CHECK_CLOUD_BROADCASTS);
        PendingIntent pending = PendingIntent.getBroadcast(context, 77701, intent,
                PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
        if (pending != null) {
            if (manager != null) manager.cancel(pending);
            pending.cancel();
        }
    }
}
