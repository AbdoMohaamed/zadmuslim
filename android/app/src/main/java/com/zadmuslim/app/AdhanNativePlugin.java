package com.zadmuslim.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
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

        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            call.reject("AlarmManager not available");
            return;
        }

        // حفظ الإعدادات في SharedPreferences للاسترجاع
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .putString("last_timings_json", timingsObj.toString())
                .putString("selected_muazzin", muazzin)
                .apply();

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

        Log.d(TAG, "Successfully scheduled " + scheduledCount + " exact alarms in native Android OS");
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("scheduledCount", scheduledCount);
        call.resolve(ret);
    }

    private void schedulePeriodicBroadcastCheck(Context context, AlarmManager alarmManager) {
        try {
            AdhanAlarmReceiver.scheduleNextBroadcastCheck(context);
        } catch (Exception e) {
            Log.w(TAG, "Failed to schedule periodic broadcast check", e);
        }
    }

    private void scheduleExactAlarm(AlarmManager alarmManager, long triggerAtMillis, PendingIntent pendingIntent) {
        Context context = getContext();
        Intent showIntent = new Intent(context, MainActivity.class);
        showIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingShow = PendingIntent.getActivity(
                context, (int) (triggerAtMillis % 100000), showIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            AlarmManager.AlarmClockInfo clockInfo = new AlarmManager.AlarmClockInfo(triggerAtMillis, pendingShow);
            alarmManager.setAlarmClock(clockInfo, pendingIntent);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
        }
    }

    private void cancelExistingAlarms(Context context, AlarmManager alarmManager) {
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
}
