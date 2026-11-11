package com.zadmuslim.app;

import android.Manifest;
import android.app.PendingIntent;
import android.content.*;
import android.content.pm.PackageManager;
import android.location.*;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name="PrayerTravel")
public class PrayerTravelPlugin extends Plugin {
    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("prayer_travel",0); }
    static boolean permitted(Context c) {
        return (c.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED ||
                c.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)==PackageManager.PERMISSION_GRANTED) &&
                (Build.VERSION.SDK_INT<29 || c.checkSelfPermission(Manifest.permission.ACCESS_BACKGROUND_LOCATION)==PackageManager.PERMISSION_GRANTED);
    }
    static void restore(Context c) {
        LocationManager manager=c.getSystemService(LocationManager.class);
        Intent delivery=new Intent(c,PrayerTravelReceiver.class).setAction("com.zadmuslim.app.TRAVEL_LOCATION");
        int flags=PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT>=31?PendingIntent.FLAG_MUTABLE:0);
        PendingIntent pending=PendingIntent.getBroadcast(c,61002,delivery,flags);
        if(!prefs(c).getBoolean("enabled",false)||!permitted(c)){
            manager.removeUpdates(pending);
            c.getSystemService(android.app.job.JobScheduler.class).cancel(61002);
            return;
        }
        for(String provider:new String[]{LocationManager.NETWORK_PROVIDER,LocationManager.GPS_PROVIDER}){
            if(manager.getAllProviders().contains(provider)){
                try { manager.requestLocationUpdates(provider,900000,5000,pending); }
                catch(SecurityException ignored){ /* Approximate access excludes GPS. */ }
            }
        }
    }
    @PluginMethod public void configure(PluginCall call){
        Context c=getContext();
        boolean enabled=call.getBoolean("enabled",false);
        SharedPreferences.Editor edit=prefs(c).edit().putBoolean("enabled",enabled)
            .putString("method",call.getString("method","")).putString("school",call.getString("school","0"));
        if(!enabled) edit.remove("lat").remove("lon");
        edit.apply();
        restore(c);
        if(enabled && !permitted(c) && call.getBoolean("prompt",false)){
            Intent settings=new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:"+c.getPackageName()));
            getActivity().startActivity(settings);
        }
        JSObject result=new JSObject();result.put("authorized",permitted(c));call.resolve(result);
    }
}
