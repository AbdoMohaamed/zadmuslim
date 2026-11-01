package com.zadmuslim.app;

import com.batoulapps.adhan.*;
import com.batoulapps.adhan.data.DateComponents;
import org.json.*;
import java.util.*;

/** Pure calculation: UTC instants, never copies yesterday's clock times. */
public final class LocalPrayerCalculator {
    public static final String[] KEYS = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"};
    private static PrayerTimes calculate(JSONObject config, Calendar date) throws JSONException {
        double lat = config.getDouble("latitude"), lon = config.getDouble("longitude");
        if (!Double.isFinite(lat) || !Double.isFinite(lon) || Math.abs(lat)>90 || Math.abs(lon)>180)
            throw new IllegalArgumentException("Invalid coordinates");
        JSONObject angles = config.getJSONObject("params");
        if (angles.has("Maghrib")) throw new IllegalArgumentException("Maghrib angle method requires online calendar");
        double fajr = angles.getDouble("Fajr");
        Object isha = angles.get("Isha");
        CalculationParameters params;
        if (isha instanceof Number) params = new CalculationParameters(fajr, ((Number)isha).doubleValue());
        else throw new IllegalArgumentException("Interval-based Isha requires online calendar, including Ramadan rules");
        if (fajr<=0 || fajr>30 || params.ishaAngle<0 || params.ishaAngle>30 || params.ishaInterval>180)
            throw new IllegalArgumentException("Invalid prayer angles");
        // AlAdhan's method 15 uses seasonal twilight rules, not just angles.
        if (config.optInt("methodId") == 15) params = CalculationMethod.MOON_SIGHTING_COMMITTEE.getParameters();
        params.madhab = config.optInt("school") == 1 ? Madhab.HANAFI : Madhab.SHAFI;
        String rule = config.optString("latitudeAdjustmentMethod", "ANGLE_BASED");
        if ("MIDDLE_OF_THE_NIGHT".equals(rule)) params.highLatitudeRule=HighLatitudeRule.MIDDLE_OF_THE_NIGHT;
        else if ("ONE_SEVENTH".equals(rule)) params.highLatitudeRule=HighLatitudeRule.SEVENTH_OF_THE_NIGHT;
        else if ("ANGLE_BASED".equals(rule)) params.highLatitudeRule=HighLatitudeRule.TWILIGHT_ANGLE;
        else throw new IllegalArgumentException("Unsupported high-latitude rule");
        JSONObject offsets=config.optJSONObject("offset");
        if(offsets!=null) {
            params.adjustments.fajr=offsets.optInt("Fajr");params.adjustments.dhuhr=offsets.optInt("Dhuhr");
            params.adjustments.asr=offsets.optInt("Asr");params.adjustments.maghrib=offsets.optInt("Maghrib");params.adjustments.isha=offsets.optInt("Isha");
        }
        PrayerTimes times=new PrayerTimes(new Coordinates(lat,lon),new DateComponents(date.get(Calendar.YEAR),date.get(Calendar.MONTH)+1,date.get(Calendar.DAY_OF_MONTH)),params);
        Date[] result={times.fajr,times.dhuhr,times.asr,times.maghrib,times.isha};
        for(Date time:result) if(time==null) throw new IllegalArgumentException("No valid solar times at this location");
        return times;
    }
    public static Date[] day(JSONObject config, Calendar date) throws JSONException {
        PrayerTimes times=calculate(config,date);
        return new Date[]{times.fajr,times.dhuhr,times.asr,times.maghrib,times.isha};
    }
    public static JSONObject clockTimes(JSONObject config, Calendar date) throws JSONException {
        PrayerTimes times=calculate(config,date);
        Date[] values={times.fajr,times.dhuhr,times.asr,times.maghrib,times.isha,times.sunrise};
        String[] keys={"Fajr","Dhuhr","Asr","Maghrib","Isha","Sunrise"};
        java.text.SimpleDateFormat clock=new java.text.SimpleDateFormat("HH:mm",Locale.US);
        clock.setTimeZone(date.getTimeZone());
        JSONObject result=new JSONObject();
        for(int i=0;i<keys.length;i++)if(values[i]!=null)result.put(keys[i],clock.format(values[i]));
        return result;
    }
    public static void validateReference(JSONObject config, JSONObject reference, Calendar date) throws JSONException {
        Date[] calculated = day(config,date);
        for (int i=0;i<KEYS.length;i++) {
            String[] parts=reference.getString(KEYS[i]).split(" ")[0].split(":");
            Calendar expected=(Calendar)date.clone();
            expected.set(Calendar.HOUR_OF_DAY,Integer.parseInt(parts[0]));
            expected.set(Calendar.MINUTE,Integer.parseInt(parts[1]));
            expected.set(Calendar.SECOND,0);expected.set(Calendar.MILLISECOND,0);
            if(Math.abs(expected.getTimeInMillis()-calculated[i].getTime())>2*60000L)
                throw new IllegalArgumentException("Local calculation differs from verified timings: "+KEYS[i]);
        }
    }
    public static JSONArray calendar(JSONObject config, int days) throws JSONException {
        JSONArray result=new JSONArray();
        Calendar date=Calendar.getInstance();date.set(Calendar.HOUR_OF_DAY,12);
        for(int d=0;d<days;d++,date.add(Calendar.DATE,1)) {
            Date[] times=day(config,date);JSONObject entry=new JSONObject();
            entry.put("date",String.format(Locale.US,"%04d-%02d-%02d",date.get(Calendar.YEAR),date.get(Calendar.MONTH)+1,date.get(Calendar.DAY_OF_MONTH)));
            JSONObject timings=new JSONObject();
            for(int i=0;i<KEYS.length;i++) timings.put(KEYS[i],times[i].getTime());
            entry.put("timings",timings);result.put(entry);
        }
        return result;
    }
}
