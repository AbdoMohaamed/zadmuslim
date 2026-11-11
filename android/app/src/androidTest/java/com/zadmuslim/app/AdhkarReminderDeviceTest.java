package com.zadmuslim.app;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.service.notification.StatusBarNotification;
import androidx.test.platform.app.InstrumentationRegistry;
import com.getcapacitor.JSObject;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.junit.Assume.assumeTrue;

/** Two opt-in phases on a disposable emulator: download online, then play in airplane mode. */
public class AdhkarReminderDeviceTest {
    private final Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
    private String phase() { return InstrumentationRegistry.getArguments().getString("adhkarPhase", ""); }

    @Test public void downloadBothRecordings() throws Exception {
        assumeTrue("download".equals(phase()));
        for (String id : new String[]{"azkar", "azkar-evening"}) {
            JSObject item = new JSObject();
            item.put("id", id);
            item.put("url", OfflineAudioStore.adhkarUrl(id));
            assertTrue(OfflineAudioStore.reserve());
            OfflineAudioStore.download(context, item);
            assertTrue(OfflineAudioStore.metadata(context, id).getLong("bytes") > 0);
        }
    }

    @Test public void bothReminderButtonsPlayOffline() throws Exception {
        assumeTrue("offline".equals(phase()));
        android.net.ConnectivityManager network = context.getSystemService(android.net.ConnectivityManager.class);
        assertNull("Run this phase with networking disabled", network.getActiveNetwork());
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        JSONArray old = new JSONArray(context.getSharedPreferences("zad_recurring_reminders",0).getString("rules","[]"));
        try {
            for (int id : new int[]{70000,71000}) {
                JSONObject rule = new JSONObject().put("id",id).put("title","أذكار").put("body","تذكير")
                    .put("schedule",new JSONObject().put("on",new JSONObject().put("hour",7).put("minute",0)));
                BackgroundReminderReceiver.replace(context,new JSONArray().put(rule));
                new BackgroundReminderReceiver().onReceive(context,new Intent().putExtra("id",id));
                Notification.Action play = null;
                long postedBy=SystemClock.elapsedRealtime()+5000;
                while(play==null && SystemClock.elapsedRealtime()<postedBy) {
                    for (StatusBarNotification entry : manager.getActiveNotifications()) {
                        if (entry.getId()==id) play=entry.getNotification().actions[0];
                    }
                    if(play==null) SystemClock.sleep(100);
                }
                assertNotNull(play);
                play.actionIntent.send();
                String station = id == 70000 ? "azkar" : "azkar-evening";
                long deadline = SystemClock.elapsedRealtime()+10000;
                while (SystemClock.elapsedRealtime()<deadline &&
                    !(station.equals(RadioService.stationId) && "playing".equals(RadioService.state))) SystemClock.sleep(100);
                assertEquals(station,RadioService.stationId);
                assertEquals("playing",RadioService.state);
            }
        } finally {
            RadioService.stopPlayback();
            BackgroundReminderReceiver.replace(context,old);
            manager.cancel(70000);
            manager.cancel(71000);
        }
    }
}
