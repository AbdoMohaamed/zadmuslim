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
        c.getSharedPreferences(PREFS,0).edit().putString("rules",rules.toString()).apply();
        restore(c);
    }
    public static void restore(Context c) {
        try {
            JSONArray rules=new JSONArray(c.getSharedPreferences(PREFS,0).getString("rules","[]"));
            for(int i=0;i<rules.length();i++) arm(c,rules.getJSONObject(i));
        } catch(Exception e) { android.util.Log.e("ZadReminders","Cannot restore reminders",e); }
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
        } else next=now+Math.max(1,schedule.optInt("count",60))*60000L;
        AlarmManager manager=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pending=intent(c,rule.getInt("id"));
        if(Build.VERSION.SDK_INT<31 || manager.canScheduleExactAlarms()) manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next,pending);
        else manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next,pending);
    }
    @Override public void onReceive(Context c,Intent intent) {
        try {
            JSONArray rules=new JSONArray(c.getSharedPreferences(PREFS,0).getString("rules","[]"));
            for(int i=0;i<rules.length();i++) {
                JSONObject rule=rules.getJSONObject(i);
                if(rule.getInt("id")!=intent.getIntExtra("id",-1)) continue;
                arm(c,rule);
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
