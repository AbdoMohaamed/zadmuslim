package com.zadmuslim.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Calendar;

@CapacitorPlugin(name = "AdhanNative")
public class AdhanNativePlugin extends Plugin {
    private static final String TAG = "AdhanNativePlugin";
    private static final String PREFS_NAME = "zad_adhan_native_prefs";

    @PluginMethod
    public void schedulePrayerAlarms(PluginCall call) {
        JSObject timingsObj = call.getObject("timings");
        if (timingsObj == null) {
            call.reject("Timings object is required");
            return;
        }

        String muazzin = call.getString("muazzin", "makkah");
        boolean preAlert = call.getBoolean("preAlert", true);
        JSObject enabledPrayers = call.getObject("enabledPrayers");

        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            call.reject("AlarmManager not available");
            return;
        }

        // حفظ الإعدادات في SharedPreferences للاسترجاع
        String hijriDate = call.getString("hijriDate", null);
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit()
                .putString("last_timings_json", timingsObj.toString())
                .putString("selected_muazzin", muazzin);
        if (hijriDate != null && !hijriDate.isEmpty()) {
            editor.putString("widget_hijri_date", hijriDate);
        }
        if (enabledPrayers != null) {
            editor.putString("enabled_prayers_json", enabledPrayers.toString());
        }
        editor.apply();

        // إلغاء الجدولة القديمة أولاً
        cancelExistingAlarms(context, alarmManager);

        String[] prayerKeys = {"fajr", "dhuhr", "asr", "maghrib", "isha"};
        String[] prayerNames = {"صلاة الفجر", "صلاة الظهر", "صلاة العصر", "صلاة المغرب", "صلاة العشاء"};
        String[] timingKeys = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"};

        long now = System.currentTimeMillis();
        int scheduledCount = 0;

        // جدولة لليوم الحالي وللأيام الـ 4 القادمة لضمان استمرار العمل تلقائياً
        for (int dayOffset = 0; dayOffset <= 4; dayOffset++) {
            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.DAY_OF_YEAR, dayOffset);

            for (int i = 0; i < prayerKeys.length; i++) {
                if (enabledPrayers != null && !enabledPrayers.optBoolean(prayerKeys[i], true)) {
                    continue; // الصلاة تم إلغاء تفعيل تنبيهها برغبة المستخدم
                }

                String rawTime = timingsObj.getString(timingKeys[i]);
                if (rawTime == null) continue;

                String clean = rawTime.split(" ")[0]; // إزالة أي رموز
                String[] parts = clean.split(":");
                if (parts.length < 2) continue;

                int hour = Integer.parseInt(parts[0]);
                int minute = Integer.parseInt(parts[1]);

                Calendar prayerCal = (Calendar) calendar.clone();
                prayerCal.set(Calendar.HOUR_OF_DAY, hour);
                prayerCal.set(Calendar.MINUTE, minute);
                prayerCal.set(Calendar.SECOND, 0);
                prayerCal.set(Calendar.MILLISECOND, 0);

                long prayerMillis = prayerCal.getTimeInMillis();

                // 1. تنبيه اقتراب موعد الصلاة قبل 5 دقائق
                if (preAlert) {
                    long preAlertMillis = prayerMillis - (5 * 60 * 1000L);
                    if (preAlertMillis > now + 2000L) {
                        int reqCode = 50000 + (dayOffset * 100) + (i * 2);
                        Intent preIntent = new Intent(context, AdhanAlarmReceiver.class);
                        preIntent.putExtra(AdhanAlarmReceiver.EXTRA_IS_PRE_ALERT, true);
                        preIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_NAME, prayerNames[i]);
                        preIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_KEY, prayerKeys[i]);

                        PendingIntent pendingPre = PendingIntent.getBroadcast(
                                context, reqCode, preIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
                        );

                        scheduleExactAlarm(alarmManager, preAlertMillis, pendingPre);
                        scheduledCount++;
                    }
                }

                // 2. تنبيه الأذان الفعلي وتشغيل الصوت كاملاً
                if (prayerMillis > now + 2000L) {
                    int reqCode = 50000 + (dayOffset * 100) + (i * 2) + 1;
                    Intent adhanIntent = new Intent(context, AdhanAlarmReceiver.class);
                    adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_IS_PRE_ALERT, false);
                    adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_NAME, prayerNames[i]);
                    adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_KEY, prayerKeys[i]);
                    adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_MUAZZIN, muazzin);

                    PendingIntent pendingAdhan = PendingIntent.getBroadcast(
                            context, reqCode, adhanIntent,
                            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
                    );

                    scheduleExactAlarm(alarmManager, prayerMillis, pendingAdhan);
                    scheduledCount++;
                }
            }
        }

        // جدولة فحص الإشعارات السحابية دورياً حتى والتطبيق مغلق
        schedulePeriodicBroadcastCheck(context, alarmManager);

        // تحديث ويدجت الشاشة الرئيسية وشاشة القفل فوراً
        try {
            PrayerWidgetProvider.updateAllWidgets(context);
        } catch (Exception e) {
            Log.w(TAG, "Notice: could not update prayer widget immediately: ", e);
        }

        Log.d(TAG, "Successfully scheduled " + scheduledCount + " exact alarms in native Android OS");
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("scheduledCount", scheduledCount);
        call.resolve(ret);
    }

    @PluginMethod
    public void updatePrayerWidget(PluginCall call) {
        JSObject timingsObj = call.getObject("timings");
        String hijriDate = call.getString("hijriDate", null);
        Context context = getContext();
        if (timingsObj != null) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit()
                    .putString("last_timings_json", timingsObj.toString());
            if (hijriDate != null && !hijriDate.isEmpty()) {
                editor.putString("widget_hijri_date", hijriDate);
            }
            editor.apply();
        }
        PrayerWidgetProvider.updateAllWidgets(context);
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    private void schedulePeriodicBroadcastCheck(Context context, AlarmManager alarmManager) {
        try {
            AdhanAlarmReceiver.scheduleNextBroadcastCheck(context);
        } catch (Exception e) {
            Log.w(TAG, "Failed to schedule periodic broadcast check", e);
        }
    }

    public static void rescheduleAlarmsFromPrefs(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String jsonStr = prefs.getString("last_timings_json", null);
            String muazzin = prefs.getString("selected_muazzin", "makkah");
            if (jsonStr == null || jsonStr.isEmpty()) return;

            org.json.JSONObject timingsObj = new org.json.JSONObject(jsonStr);
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;

            String enabledPrayersJson = prefs.getString("enabled_prayers_json", null);
            org.json.JSONObject enabledPrayers = (enabledPrayersJson != null && !enabledPrayersJson.isEmpty()) ? new org.json.JSONObject(enabledPrayersJson) : null;

            cancelExistingAlarmsStatic(context, alarmManager);

            String[] prayerKeys = {"fajr", "dhuhr", "asr", "maghrib", "isha"};
            String[] prayerNames = {"صلاة الفجر", "صلاة الظهر", "صلاة العصر", "صلاة المغرب", "صلاة العشاء"};
            String[] timingKeys = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"};

            long now = System.currentTimeMillis();
            for (int dayOffset = 0; dayOffset <= 4; dayOffset++) {
                Calendar calendar = Calendar.getInstance();
                calendar.add(Calendar.DAY_OF_YEAR, dayOffset);

                for (int i = 0; i < prayerKeys.length; i++) {
                    if (enabledPrayers != null && !enabledPrayers.optBoolean(prayerKeys[i], true)) {
                        continue;
                    }

                    String rawTime = timingsObj.optString(timingKeys[i], null);
                    if (rawTime == null) continue;

                    String clean = rawTime.split(" ")[0];
                    String[] parts = clean.split(":");
                    if (parts.length < 2) continue;

                    int hour = Integer.parseInt(parts[0]);
                    int minute = Integer.parseInt(parts[1]);

                    Calendar prayerCal = (Calendar) calendar.clone();
                    prayerCal.set(Calendar.HOUR_OF_DAY, hour);
                    prayerCal.set(Calendar.MINUTE, minute);
                    prayerCal.set(Calendar.SECOND, 0);
                    prayerCal.set(Calendar.MILLISECOND, 0);

                    long prayerMillis = prayerCal.getTimeInMillis();

                    // Pre-alert (5 min before)
                    long preAlertMillis = prayerMillis - (5 * 60 * 1000L);
                    if (preAlertMillis > now + 2000L) {
                        int reqCode = 50000 + (dayOffset * 100) + (i * 2);
                        Intent preIntent = new Intent(context, AdhanAlarmReceiver.class);
                        preIntent.putExtra(AdhanAlarmReceiver.EXTRA_IS_PRE_ALERT, true);
                        preIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_NAME, prayerNames[i]);
                        preIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_KEY, prayerKeys[i]);

                        PendingIntent pendingPre = PendingIntent.getBroadcast(
                                context, reqCode, preIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
                        );
                        scheduleExactAlarmStatic(context, alarmManager, preAlertMillis, pendingPre);
                    }

                    // Adhan alarm
                    if (prayerMillis > now + 2000L) {
                        int reqCode = 50000 + (dayOffset * 100) + (i * 2) + 1;
                        Intent adhanIntent = new Intent(context, AdhanAlarmReceiver.class);
                        adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_IS_PRE_ALERT, false);
                        adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_NAME, prayerNames[i]);
                        adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_KEY, prayerKeys[i]);
                        adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_MUAZZIN, muazzin);

                        PendingIntent pendingAdhan = PendingIntent.getBroadcast(
                            context, reqCode, adhanIntent,
                            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
                        );
                        scheduleExactAlarmStatic(context, alarmManager, prayerMillis, pendingAdhan);
                    }
                }
            }
            Log.d(TAG, "Alarms successfully rescheduled on device reboot / sync");
        } catch (Exception e) {
            Log.w(TAG, "Failed to reschedule alarms from prefs", e);
        }
    }

    private void scheduleExactAlarm(AlarmManager alarmManager, long triggerAtMillis, PendingIntent pendingIntent) {
        scheduleExactAlarmStatic(getContext(), alarmManager, triggerAtMillis, pendingIntent);
    }

    public static void scheduleExactAlarmStatic(Context context, AlarmManager alarmManager, long triggerAtMillis, PendingIntent pendingIntent) {
        Intent showIntent = new Intent(context, MainActivity.class);
        showIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingShow = PendingIntent.getActivity(
                context, (int) (triggerAtMillis % 100000), showIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        // محاولة استخدام AlarmClock أولاً (لأنه يوقظ الجهاز ويتجاوز Doze Mode تماماً)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                AlarmManager.AlarmClockInfo clockInfo = new AlarmManager.AlarmClockInfo(triggerAtMillis, pendingShow);
                alarmManager.setAlarmClock(clockInfo, pendingIntent);
                return;
            }
        } catch (SecurityException se) {
            Log.w(TAG, "AlarmClock permission restricted, trying setExactAndAllowWhileIdle", se);
        } catch (Exception e) {
            Log.w(TAG, "AlarmClock failed, falling back", e);
        }

        // البديل الثاني: setExactAndAllowWhileIdle
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                return;
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                return;
            }
        } catch (SecurityException se2) {
            Log.w(TAG, "Exact alarm permission restricted, trying setAndAllowWhileIdle fallback", se2);
        } catch (Exception e2) {
            Log.w(TAG, "Exact alarm failed", e2);
        }

        // البديل الثالث الآمن غير المقيد: setAndAllowWhileIdle
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            } else {
                alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            }
        } catch (Exception e3) {
            Log.e(TAG, "All alarm scheduling methods failed", e3);
        }
    }

    private void cancelExistingAlarms(Context context, AlarmManager alarmManager) {
        cancelExistingAlarmsStatic(context, alarmManager);
    }

    public static void cancelExistingAlarmsStatic(Context context, AlarmManager alarmManager) {
        for (int dayOffset = 0; dayOffset <= 4; dayOffset++) {
            for (int i = 0; i < 5; i++) {
                // إلغاء Pre-alert
                int preCode = 50000 + (dayOffset * 100) + (i * 2);
                Intent preIntent = new Intent(context, AdhanAlarmReceiver.class);
                PendingIntent pendingPre = PendingIntent.getBroadcast(
                        context, preCode, preIntent,
                        PendingIntent.FLAG_NO_CREATE | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
                );
                if (pendingPre != null) {
                    alarmManager.cancel(pendingPre);
                    pendingPre.cancel();
                }

                // إلغاء Adhan
                int adhanCode = 50000 + (dayOffset * 100) + (i * 2) + 1;
                Intent adhanIntent = new Intent(context, AdhanAlarmReceiver.class);
                PendingIntent pendingAdhan = PendingIntent.getBroadcast(
                        context, adhanCode, adhanIntent,
                        PendingIntent.FLAG_NO_CREATE | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
                );
                if (pendingAdhan != null) {
                    alarmManager.cancel(pendingAdhan);
                    pendingAdhan.cancel();
                }
            }
        }
    }

    @PluginMethod
    public void stopAdhan(PluginCall call) {
        AdhanPlayer.stop();

        Context context = getContext();
        Intent stopIntent = new Intent(context, AdhanService.class);
        stopIntent.setAction(AdhanService.ACTION_STOP_ADHAN);
        try {
            context.startService(stopIntent);
        } catch (Exception ignored) {}

        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("stopped", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void isAdhanPlaying(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("isPlaying", AdhanPlayer.isPlaying() || AdhanService.isPlaying);
        call.resolve(ret);
    }

    @PluginMethod
    public void cancelAllAlarms(PluginCall call) {
        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            cancelExistingAlarms(context, alarmManager);
        }
        stopAdhan(call);
    }

    @PluginMethod
    public void testAdhanAudio(PluginCall call) {
        Context context = getContext();
        String muazzin = call.getString("muazzin", "makkah");
        if (AdhanPlayer.isPlaying() || AdhanService.isPlaying) {
            stopAdhan(call);
            return;
        }
        AdhanPlayer.play(context, "تجربة صوت الأذان", "dhuhr", muazzin);
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("playing", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void testAdhanNotification(PluginCall call) {
        Context context = getContext();
        String prayerName = call.getString("prayerName", "صلاة العصر");
        String prayerKey = call.getString("prayerKey", "asr");
        String muazzin = call.getString("muazzin", "makkah");

        Intent testIntent = new Intent(context, AdhanAlarmReceiver.class);
        testIntent.putExtra(AdhanAlarmReceiver.EXTRA_IS_PRE_ALERT, false);
        testIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_NAME, prayerName + " (اختبار)");
        testIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_KEY, prayerKey);
        testIntent.putExtra(AdhanAlarmReceiver.EXTRA_MUAZZIN, muazzin);
        context.sendBroadcast(testIntent);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        Context context = getContext();
        try {
            Intent intent = new Intent();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                intent.setAction(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.getPackageName());
            } else {
                intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.fromParts("package", context.getPackageName(), null));
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not open notification settings", e);
        }
    }

    @PluginMethod
    public void openBatteryOptimizationSettings(PluginCall call) {
        Context context = getContext();
        try {
            Intent intent = new Intent();
            intent.setAction(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            try {
                Intent fallback = new Intent(Settings.ACTION_SETTINGS);
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(fallback);
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception ex) {
                call.reject("Could not open battery settings", ex);
            }
        }
    }

    @PluginMethod
    public void checkExactAlarmPermission(PluginCall call) {
        Context context = getContext();
        boolean canSchedule = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null) {
                canSchedule = alarmManager.canScheduleExactAlarms();
            }
        }
        JSObject ret = new JSObject();
        ret.put("canSchedule", canSchedule);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestExactAlarmPermission(PluginCall call) {
        Context context = getContext();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.fromParts("package", context.getPackageName(), null));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not request exact alarm permission", e);
        }
    }

    @PluginMethod
    public void scheduleDiagnosticTestAlarm(PluginCall call) {
        Context context = getContext();
        int delaySeconds = call.getInt("delaySeconds", 120);
        String muazzin = call.getString("muazzin", "makkah");
        String prayerName = call.getString("prayerName", "صلاة العصر (اختبار)");

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            call.reject("AlarmManager not available");
            return;
        }

        long triggerAtMillis = System.currentTimeMillis() + (delaySeconds * 1000L);

        Intent adhanIntent = new Intent(context, AdhanAlarmReceiver.class);
        adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_IS_PRE_ALERT, false);
        adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_NAME, prayerName);
        adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_KEY, "asr");
        adhanIntent.putExtra(AdhanAlarmReceiver.EXTRA_MUAZZIN, muazzin);

        int reqCode = 99995;
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context, reqCode, adhanIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        scheduleExactAlarmStatic(context, alarmManager, triggerAtMillis, pendingIntent);

        Log.d(TAG, "Scheduled diagnostic background adhan test in " + delaySeconds + " seconds (at " + triggerAtMillis + ")");
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("triggerAtMillis", triggerAtMillis);
        ret.put("delaySeconds", delaySeconds);
        call.resolve(ret);
    }
}
