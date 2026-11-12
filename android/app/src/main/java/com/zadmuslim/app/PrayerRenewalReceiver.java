package com.zadmuslim.app;

import android.app.*;
import android.content.*;
import org.json.*;
import java.util.*;

/** Daily offline renewal; survives closing the WebView and reboot via AdhanAlarmReceiver. */
public class PrayerRenewalReceiver extends BroadcastReceiver {
    private static PendingIntent pending(Context c) {
        return PendingIntent.getBroadcast(c,61001,new Intent(c,PrayerRenewalReceiver.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    public static void cancel(Context c) {((AlarmManager)c.getSystemService(Context.ALARM_SERVICE)).cancel(pending(c));}
    static void arm(Context c) {
        Calendar next=Calendar.getInstance();next.add(Calendar.DATE,1);next.set(Calendar.HOUR_OF_DAY,3);next.set(Calendar.MINUTE,0);next.set(Calendar.SECOND,0);
        // Renewal is not an audible alarm; an inexact idle-compatible wakeup is sufficient.
        ((AlarmManager)c.getSystemService(Context.ALARM_SERVICE)).setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next.getTimeInMillis(),pending(c));
    }
    public static synchronized boolean renew(Context c) {
        SharedPreferences prefs=c.getSharedPreferences(AdhanNativePlugin.PREFS_NAME,0);
        Object raw = prefs.getAll().get("local_calculation");
        if (!(raw instanceof String)) return false;
        try {
            if(!prefs.getBoolean("adhan_enabled",false)&&!prefs.getBoolean("pre_alert_enabled",false)){cancel(c);return false;}
            JSONObject config=new JSONObject((String) raw);
            JSONArray days=LocalPrayerCalculator.calendar(config,14);
            JSONObject clockTimes=LocalPrayerCalculator.clockTimes(config,Calendar.getInstance());
            replaceDays(c, prefs, days, clockTimes);
            arm(c);
            prefs.edit().putBoolean("local_renewal_ok",true).apply();
            return true;
        } catch(Exception e) {
            prefs.edit().putBoolean("local_renewal_ok",false).apply();
            android.util.Log.e("ZadPrayerRenewal","Offline renewal failed",e);
            arm(c); // Keep existing alarms and retry tomorrow, rather than erasing coverage.
            return false;
        }
    }
    static synchronized void replaceDays(Context c, SharedPreferences prefs, JSONArray days, JSONObject clockTimes) throws JSONException {
        JSONArray alarms = new JSONArray();
        JSONObject enabled=new JSONObject(prefs.getString("enabled_prayers_json","{}"));
        String[] names={"صلاة الفجر","صلاة الظهر","صلاة العصر","صلاة المغرب","صلاة العشاء"};
        int minutes=prefs.getInt("pre_alert_interval",5);
        for(int d=0;d<days.length();d++) for(int i=0;i<5;i++) {
            String key=LocalPrayerCalculator.KEYS[i].toLowerCase(Locale.US);
            if(!enabled.optBoolean(key,true))continue;
            long at=days.getJSONObject(d).getJSONObject("timings").getLong(LocalPrayerCalculator.KEYS[i]);
            for(boolean pre:new boolean[]{true,false}) {
                if(!prefs.getBoolean(pre?"pre_alert_enabled":"adhan_enabled",false))continue;
                long trigger=at-(pre?minutes*60000L:0);
                if(trigger<=System.currentTimeMillis()+1000)continue;
                alarms.put(new JSONObject().put("at",trigger).put("prayerKey",key).put("prayerName",names[i]).put("isPreAlert",pre)
                .put("muazzin",prefs.getString("selected_muazzin","qatami")).put("preAlertInterval",minutes).put("showImages",prefs.getBoolean("show_prayer_images",true)));
            }
        }
        // Compute a full replacement before touching working alarms.
        AdhanNativePlugin.cancelExistingAlarmsStatic(c,(AlarmManager)c.getSystemService(Context.ALARM_SERVICE));
        prefs.edit().putString("prepared_alarms",alarms.toString()).putLong("local_renewed_at",System.currentTimeMillis())
            .putString("last_timings_json",clockTimes.toString()).putString("timings_date",days.getJSONObject(0).getString("date")).apply();
        AdhanNativePlugin.restorePrepared(c,alarms);
    }
    @Override public void onReceive(Context context,Intent intent){
        if(!renew(context) && PrayerTravelPlugin.enabled(context)) PrayerTravelReceiver.schedule(context);
    }
}
