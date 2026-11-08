package com.zadmuslim.app;

import android.app.AlarmManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AdhanScheduleRestoreReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (!AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED.equals(action) &&
            !Intent.ACTION_BOOT_COMPLETED.equals(action) &&
            !"android.intent.action.QUICKBOOT_POWERON".equals(action) &&
            !"com.htc.intent.action.QUICKBOOT_POWERON".equals(action) &&
            !Intent.ACTION_MY_PACKAGE_REPLACED.equals(action) &&
            !Intent.ACTION_TIME_CHANGED.equals(action) &&
            !Intent.ACTION_TIMEZONE_CHANGED.equals(action)) {
            return;
        }

        BackgroundReminderReceiver.restore(context);
        AdhanNativePlugin.rescheduleAlarmsFromPrefs(context);
        PrayerWidgetProvider.updateAllWidgets(context);
        AdhanAlarmReceiver.cancelLegacyBroadcastCheck(context);
    }
}
