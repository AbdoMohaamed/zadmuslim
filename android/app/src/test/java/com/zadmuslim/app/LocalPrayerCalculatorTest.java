package com.zadmuslim.app;

import org.junit.Test;
import org.json.JSONObject;
import java.util.*;
import static org.junit.Assert.*;

public class LocalPrayerCalculatorTest {
    private JSONObject cairo() throws Exception {
        return new JSONObject("{\"latitude\":30.0444,\"longitude\":31.2357,\"methodId\":5,\"school\":0,\"params\":{\"Fajr\":19.5,\"Isha\":17.5},\"latitudeAdjustmentMethod\":\"ANGLE_BASED\"}");
    }
    private Calendar date(int day) {
        Calendar c=Calendar.getInstance(TimeZone.getTimeZone("Africa/Cairo"));
        c.clear();c.set(2026,Calendar.OCTOBER,day,12,0);return c;
    }
    @Test public void dstChangesClockButNotSolarInstantByOneHour() throws Exception {
        Date[] before=LocalPrayerCalculator.day(cairo(),date(29));
        Date[] after=LocalPrayerCalculator.day(cairo(),date(30));
        long elapsed=after[0].getTime()-before[0].getTime();
        assertTrue(Math.abs(elapsed-86400000L)<180000L);
        assertNotEquals(TimeZone.getTimeZone("Africa/Cairo").getOffset(before[0].getTime()),TimeZone.getTimeZone("Africa/Cairo").getOffset(after[0].getTime()));
    }
    @Test public void hanafiAsrIsLaterAndPrayersAreOrdered() throws Exception {
        JSONObject config=cairo();Date[] normal=LocalPrayerCalculator.day(config,date(31));
        Date[] hanafi=LocalPrayerCalculator.day(config.put("school",1),date(31));
        assertTrue(hanafi[2].after(normal[2]));
        for(int i=1;i<normal.length;i++)assertTrue(normal[i].after(normal[i-1]));
    }
    @Test(expected=IllegalArgumentException.class) public void invalidLocationRejected() throws Exception {
        LocalPrayerCalculator.day(cairo().put("latitude",91),date(31));
    }
    @Test(expected=IllegalArgumentException.class) public void incompatibleReferenceRejected() throws Exception {
        JSONObject refs=new JSONObject();for(String k:LocalPrayerCalculator.KEYS)refs.put(k,"00:00");
        LocalPrayerCalculator.validateReference(cairo(),refs,date(31));
    }
    @Test public void matchingReferenceAccepted() throws Exception {
        Calendar c=date(31);Date[] times=LocalPrayerCalculator.day(cairo(),c);
        JSONObject refs=new JSONObject();
        for(int i=0;i<times.length;i++){
            Calendar at=(Calendar)c.clone();at.setTime(times[i]);
            refs.put(LocalPrayerCalculator.KEYS[i],String.format(Locale.US,"%02d:%02d",at.get(Calendar.HOUR_OF_DAY),at.get(Calendar.MINUTE)));
        }
        LocalPrayerCalculator.validateReference(cairo(),refs,c);
    }
    @Test(expected=IllegalArgumentException.class) public void intervalMethodRequiresCalendar() throws Exception {
        JSONObject config=cairo();config.getJSONObject("params").put("Isha","90 min");
        LocalPrayerCalculator.day(config,date(31));
    }
}
