package com.zadmuslim.app;

import android.app.job.*;
import android.content.SharedPreferences;
import org.json.*;
import java.net.*;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class PrayerTravelJob extends JobService {
    private volatile JobParameters active;
    @Override public boolean onStartJob(JobParameters job){
        active=job;
        new Thread(()->{
            boolean retry=false;
            try{update(job);}catch(Exception e){android.util.Log.w("PrayerTravel","Calendar update deferred",e);retry=true;}
            if(active==job)jobFinished(job,retry);
        }).start();
        return true;
    }
    @Override public boolean onStopJob(JobParameters job){active=null;return true;}
    private JSONArray month(Calendar date,float lat,float lon,String method,String school)throws Exception{
        String endpoint="https://api.aladhan.com/v1/calendar/"+date.get(Calendar.YEAR)+"/"+(1+date.get(Calendar.MONTH))+
            "?latitude="+lat+"&longitude="+lon+(method.isEmpty() ? "" : "&method="+method)+"&school="+school+"&iso8601=true";
        HttpURLConnection connection=(HttpURLConnection)new URL(endpoint).openConnection();
        connection.setConnectTimeout(10000);connection.setReadTimeout(12000);
        try(BufferedReader input=new BufferedReader(new InputStreamReader(connection.getInputStream(),"UTF-8"))){
            StringBuilder json=new StringBuilder();String line;
            while((line=input.readLine())!=null)json.append(line);
            return new JSONObject(json.toString()).getJSONArray("data");
        }finally{connection.disconnect();}
    }
    private void update(JobParameters job)throws Exception{
        SharedPreferences travel=PrayerTravelPlugin.prefs(this),alarms=getSharedPreferences(AdhanNativePlugin.PREFS_NAME,0);
        if(!PrayerTravelPlugin.enabled(this)||!travel.contains("lat")||!PrayerTravelPlugin.permitted(this)||
            !(alarms.getBoolean("adhan_enabled",false)||alarms.getBoolean("pre_alert_enabled",false)))return;
        float lat=travel.getFloat("lat",0),lon=travel.getFloat("lon",0);
        String selected=travel.getString("method",""),school=travel.getString("school","0");
        SimpleDateFormat iso=new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX",Locale.US);
        SimpleDateFormat day=new SimpleDateFormat("yyyy-MM-dd",Locale.US);
        Calendar date=Calendar.getInstance();JSONArray days=new JSONArray(),calendar=null;
        JSONObject clocks=new JSONObject();int loaded=-1;
        for(int i=0;i<14;i++,date.add(Calendar.DATE,1)){
            if(active!=job)return;
            if(loaded!=date.get(Calendar.MONTH)){calendar=month(date,lat,lon,selected,school);loaded=date.get(Calendar.MONTH);}
            JSONObject times=calendar.getJSONObject(date.get(Calendar.DAY_OF_MONTH)-1).getJSONObject("timings"),instants=new JSONObject();
            for(String key:new String[]{"Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"}){
                String value=times.getString(key);
                if(!value.startsWith(day.format(date.getTime())+"T"))throw new IOException("Unexpected calendar date");
                instants.put(key,iso.parse(value).getTime());
                if(i==0)clocks.put(key,value.substring(11,16));
            }
            days.put(new JSONObject().put("date",day.format(date.getTime())).put("timings",instants));
        }
        if(active!=job||!PrayerTravelPlugin.enabled(this)||!PrayerTravelPlugin.permitted(this)||
            lat!=travel.getFloat("lat",0)||lon!=travel.getFloat("lon",0)||
            !selected.equals(travel.getString("method",""))||!school.equals(travel.getString("school","0"))||
            !(alarms.getBoolean("adhan_enabled",false)||alarms.getBoolean("pre_alert_enabled",false)))return;
        PrayerRenewalReceiver.replaceDays(this,alarms,days,clocks);
        alarms.edit().remove("local_calculation").apply();
        PrayerRenewalReceiver.arm(this);
        PrayerWidgetProvider.updateAllWidgets(this);
    }
}
