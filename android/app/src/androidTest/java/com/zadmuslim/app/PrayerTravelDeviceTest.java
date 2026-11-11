package com.zadmuslim.app;

import android.content.*;
import android.location.Location;
import android.location.LocationManager;
import android.os.SystemClock;
import androidx.test.platform.app.InstrumentationRegistry;
import org.json.JSONArray;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.junit.Assume.assumeTrue;

/** Opt-in network test on a disposable emulator. No Activity or WebView is started. */
public class PrayerTravelDeviceTest {
    @Test public void travelReplacesRiyadhAlarmsWithMakkahAlarms() throws Exception {
        assumeTrue("true".equals(InstrumentationRegistry.getArguments().getString("travel")));
        Context context=InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertTrue(PrayerTravelPlugin.permitted(context));
        SharedPreferences prefs=context.getSharedPreferences(AdhanNativePlugin.PREFS_NAME,0);
        prefs.edit().putBoolean("adhan_enabled",true).putBoolean("pre_alert_enabled",false).apply();
        PrayerTravelPlugin.prefs(context).edit().putBoolean("enabled",true).remove("lat").remove("lon").apply();
        PrayerTravelPlugin.restore(context);
        long riyadh=update(context,prefs,24.7136,46.6753);
        long makkah=update(context,prefs,21.4225,39.8262);
        assertNotEquals(riyadh,makkah);
    }
    private long update(Context c,SharedPreferences prefs,double lat,double lon) throws Exception {
        long before=prefs.getLong("local_renewed_at",0);
        Location fix=new Location(LocationManager.GPS_PROVIDER);
        fix.setLatitude(lat);fix.setLongitude(lon);fix.setAccuracy(20);fix.setTime(System.currentTimeMillis());
        new PrayerTravelReceiver().onReceive(c,new Intent().putExtra(LocationManager.KEY_LOCATION_CHANGED,fix));
        InstrumentationRegistry.getInstrumentation().getUiAutomation().executeShellCommand(
            "cmd jobscheduler run -f "+c.getPackageName()+" 61002").close();
        long deadline=SystemClock.elapsedRealtime()+55000;
        while(prefs.getLong("local_renewed_at",0)<=before && SystemClock.elapsedRealtime()<deadline)SystemClock.sleep(300);
        assertTrue("Expected new native alarm schedule",prefs.getLong("local_renewed_at",0)>before);
        JSONArray alarms=new JSONArray(prefs.getString("prepared_alarms","[]"));
        assertTrue(alarms.length()>60);
        return alarms.getJSONObject(alarms.length()-1).getLong("at");
    }
}
