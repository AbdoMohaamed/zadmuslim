package com.zadmuslim.app;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;

import android.Manifest;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;

/** Opt-in manual test: plays real audio after 15 seconds, without changing saved schedules. */
@RunWith(AndroidJUnit4.class)
public class ManualAdhanImageDeviceTest {
    @Test public void scheduleOneImageAdhan() {
        assumeTrue("Requires explicit manual audio-test opt-in",
            "true".equals(InstrumentationRegistry.getArguments().getString("runAdhanImageSmoke")));
        Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        assertNotNull(manager);
        if (Build.VERSION.SDK_INT >= 31) assertTrue("Exact alarm permission is required", manager.canScheduleExactAlarms());
        if (Build.VERSION.SDK_INT >= 33) assertTrue("Notification permission is required",
            context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED);
        long at = System.currentTimeMillis() + 15000;
        String muazzin = context.getSharedPreferences(AdhanNativePlugin.PREFS_NAME, 0)
            .getString("selected_muazzin", "qatami");
        Intent intent = new Intent(context, AdhanAlarmReceiver.class)
            .setAction(AdhanAlarmReceiver.ACTION_PRAYER_ALARM)
            .putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_NAME, "تجربة الأذان والصورة")
            .putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_KEY, "asr")
            .putExtra(AdhanAlarmReceiver.EXTRA_MUAZZIN, muazzin)
            .putExtra(AdhanAlarmReceiver.EXTRA_IS_PRE_ALERT, false)
            .putExtra(AdhanAlarmReceiver.EXTRA_SHOW_PRAYER_IMAGES, true)
            .putExtra("is_test", true).putExtra("scheduled_time", at);
        PendingIntent pending = PendingIntent.getBroadcast(context, 99983, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        AdhanNativePlugin.scheduleExactAlarmStatic(context, manager, at, pending);
    }
}
