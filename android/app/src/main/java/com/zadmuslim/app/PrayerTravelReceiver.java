package com.zadmuslim.app;

import android.app.job.*;
import android.content.*;
import android.location.*;

public class PrayerTravelReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent) {
        Location fix=intent.getParcelableExtra(LocationManager.KEY_LOCATION_CHANGED);
        SharedPreferences prefs=PrayerTravelPlugin.prefs(context);
        if(fix==null || !prefs.getBoolean("enabled",false) || !PrayerTravelPlugin.permitted(context)
            || System.currentTimeMillis()-fix.getTime()>3600000 || fix.getAccuracy()>5000) return;
        float[] distance=new float[1];
        if(prefs.contains("lat")){
            Location.distanceBetween(prefs.getFloat("lat",0),prefs.getFloat("lon",0),fix.getLatitude(),fix.getLongitude(),distance);
            if(distance[0]<5000)return;
        }
        prefs.edit().putFloat("lat",(float)fix.getLatitude()).putFloat("lon",(float)fix.getLongitude()).apply();
        schedule(context);
    }
    static void schedule(Context c){
        c.getSystemService(JobScheduler.class).schedule(new JobInfo.Builder(61002,new ComponentName(c,PrayerTravelJob.class))
            .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setPersisted(true).build());
    }
}
