package com.zadmuslim.app;

import android.app.*;
import android.content.*;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import org.json.*;
import java.util.Calendar;

/** Persistent, self-rearming reminders; no WebView or running service required. */
public class BackgroundReminderReceiver extends BroadcastReceiver {
    private static final String PREFS = "zad_recurring_reminders";
    private static final int[] IDS = {70000,71000,72000,73000,74001,74004,80001};
    private static PendingIntent intent(Context c, int id) {
        return PendingIntent.getBroadcast(c,id,new Intent(c,BackgroundReminderReceiver.class).putExtra("id",id),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    public static void replace(Context c, JSONArray rules) throws JSONException {
        AlarmManager manager=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
        for(int id:IDS) manager.cancel(intent(c,id));
        SharedPreferences.Editor reset=c.getSharedPreferences(PREFS,0).edit();
        JSONArray previous=new JSONArray(c.getSharedPreferences(PREFS,0).getString("rules","[]"));
        for(int id:IDS) {
            JSONObject oldRule=null, newRule=null;
            for(int i=0;i<previous.length();i++) if(previous.getJSONObject(i).optInt("id")==id) oldRule=previous.getJSONObject(i);
            for(int i=0;i<rules.length();i++) if(rules.getJSONObject(i).optInt("id")==id) newRule=rules.getJSONObject(i);
            if(oldRule==null || newRule==null || !oldRule.getJSONObject("schedule").toString().equals(newRule.getJSONObject("schedule").toString())) reset.remove("next_"+id);
        }
        reset.apply();
        c.getSharedPreferences(PREFS,0).edit().putString("rules",rules.toString()).apply();
        ensureChannels(c);
        for(int i=0;i<rules.length();i++) arm(c,rules.getJSONObject(i));
    }
    public static void restore(Context c) {
        try {
            JSONArray rules=new JSONArray(c.getSharedPreferences(PREFS,0).getString("rules","[]"));
            ensureChannels(c);
            for(int i=0;i<rules.length();i++) {
                try { arm(c,rules.getJSONObject(i)); }
                catch(Exception e) { android.util.Log.e("ZadReminders","Cannot restore reminder",e); }
            }
        } catch(Exception e) { android.util.Log.e("ZadReminders","Cannot restore reminders",e); }
    }
    private static void ensureChannels(Context c) {
        if(Build.VERSION.SDK_INT < 26) return;
        NotificationManager manager=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);
        String[] ids={"daily_adhkar","hourly_salawat","hourly_salawat_silent"};
        String[] names={"أذكار وتذكيرات يومية","الصلاة على النبي ﷺ","الصلاة على النبي ﷺ بدون صوت"};
        for(int i=0;i<ids.length;i++) {
            if(manager.getNotificationChannel(ids[i])!=null) continue;
            NotificationChannel channel=new NotificationChannel(ids[i],names[i],NotificationManager.IMPORTANCE_HIGH);
            channel.enableVibration(true);
            channel.setSound(i==1 ? android.net.Uri.parse("android.resource://"+c.getPackageName()+"/raw/salawat") : null,
                new android.media.AudioAttributes.Builder().setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION).build());
            manager.createNotificationChannel(channel);
        }
    }
    private static void arm(Context c,JSONObject rule) throws JSONException {
        JSONObject schedule=rule.getJSONObject("schedule");
        long now=System.currentTimeMillis();
        long next;
        if(schedule.has("on")) {
            JSONObject on=schedule.getJSONObject("on");
            Calendar date=Calendar.getInstance();
            date.set(Calendar.HOUR_OF_DAY,on.getInt("hour"));date.set(Calendar.MINUTE,on.getInt("minute"));date.set(Calendar.SECOND,0);date.set(Calendar.MILLISECOND,0);
            while(date.getTimeInMillis()<=now+1000 || (on.has("weekday") && date.get(Calendar.DAY_OF_WEEK)!=on.getInt("weekday"))) date.add(Calendar.DATE,1);
            next=date.getTimeInMillis();
        } else {
            long saved=c.getSharedPreferences(PREFS,0).getLong("next_"+rule.getInt("id"),0);
            next=saved>now+1000 ? saved : now+Math.max(1,schedule.optInt("count",60))*60000L;
        }
        AlarmManager manager=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pending=intent(c,rule.getInt("id"));
        if(Build.VERSION.SDK_INT<31 || manager.canScheduleExactAlarms()) manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next,pending);
        else manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next,pending);
        c.getSharedPreferences(PREFS,0).edit().putLong("next_"+rule.getInt("id"),next).apply();
    }
    @Override public void onReceive(Context c,Intent intent) {
        try {
            JSONArray rules=new JSONArray(c.getSharedPreferences(PREFS,0).getString("rules","[]"));
            for(int i=0;i<rules.length();i++) {
                JSONObject rule=rules.getJSONObject(i);
                if(rule.getInt("id")!=intent.getIntExtra("id",-1)) continue;
                c.getSharedPreferences(PREFS,0).edit().remove("next_"+rule.getInt("id")).apply();
                try { arm(c,rule); } catch(Exception e) { android.util.Log.e("ZadReminders","Next reminder scheduling failed",e); }
                ensureChannels(c);
                Intent launch=c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
                NotificationCompat.Builder builder=new NotificationCompat.Builder(c,rule.optString("channelId","daily_adhkar"))
                    .setSmallIcon(R.drawable.ic_stat_icon).setContentTitle(rule.getString("title")).setContentText(rule.getString("body"))
                    .setAutoCancel(true).setVisibility(NotificationCompat.VISIBILITY_PUBLIC).setPriority(NotificationCompat.PRIORITY_HIGH);
                if(launch!=null) builder.setContentIntent(PendingIntent.getActivity(c,rule.getInt("id"),launch,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE));
                ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(rule.getInt("id"),builder.build());
            }
        } catch(Exception e) { android.util.Log.e("ZadReminders","Reminder delivery failed",e); }
    }
}
