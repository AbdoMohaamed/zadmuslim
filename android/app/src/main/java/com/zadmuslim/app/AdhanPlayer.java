package com.zadmuslim.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.PowerManager;
import android.util.Log;

public class AdhanPlayer {
    private static final String TAG = "AdhanPlayer";
    private static MediaPlayer mediaPlayer;
    private static PowerManager.WakeLock wakeLock;
    private static BroadcastReceiver screenOffReceiver;
    private static Context appContext;

    public static synchronized void play(Context context, String prayerName, String prayerKey, String muazzin) {
        stop();
        appContext = context.getApplicationContext();

        try {
            PowerManager pm = (PowerManager) appContext.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "zadmuslim:adhan_audio_wakelock");
                wakeLock.acquire(4 * 60 * 1000L); // 4 دقائق كحد أقصى
            }

            int soundResId = getSoundResourceId(appContext, prayerKey, muazzin);
            mediaPlayer = new MediaPlayer();

            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();
            mediaPlayer.setAudioAttributes(audioAttributes);
            mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);

            Uri uri = Uri.parse("android.resource://" + appContext.getPackageName() + "/" + soundResId);
            mediaPlayer.setDataSource(appContext, uri);
            mediaPlayer.prepare();
            mediaPlayer.setOnCompletionListener(mp -> stop());
            mediaPlayer.start();

            // الاستماع لزر قفل الهاتف لإيقاف الأذان فوراً
            registerScreenOffReceiver();

            Log.d(TAG, "AdhanPlayer started successfully on STREAM_ALARM with resource: " + soundResId);
        } catch (Exception e) {
            Log.e(TAG, "Error starting AdhanPlayer", e);
            stop();
        }
    }

    public static synchronized void stop() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
            } catch (Exception ignored) {}
            mediaPlayer = null;
        }

        unregisterScreenOffReceiver();

        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {}
            wakeLock = null;
        }

        Log.d(TAG, "AdhanPlayer stopped completely");
    }

    public static synchronized boolean isPlaying() {
        return mediaPlayer != null && mediaPlayer.isPlaying();
    }

    private static void registerScreenOffReceiver() {
        if (appContext == null || screenOffReceiver != null) return;
        try {
            screenOffReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    if (Intent.ACTION_SCREEN_OFF.equals(intent.getAction())) {
                        Log.d(TAG, "Screen turned off / Lock button pressed by user - Stopping Adhan");
                        stop();
                    }
                }
            };
            IntentFilter filter = new IntentFilter(Intent.ACTION_SCREEN_OFF);
            appContext.registerReceiver(screenOffReceiver, filter);
        } catch (Exception e) {
            Log.w(TAG, "Failed to register screen off receiver in AdhanPlayer", e);
        }
    }

    private static void unregisterScreenOffReceiver() {
        if (appContext != null && screenOffReceiver != null) {
            try {
                appContext.unregisterReceiver(screenOffReceiver);
            } catch (Exception ignored) {}
            screenOffReceiver = null;
        }
    }

    private static int getSoundResourceId(Context context, String prayerKey, String muazzin) {
        if ("fajr".equalsIgnoreCase(prayerKey)) {
            return R.raw.adhan_fajr;
        }
        if (muazzin == null || muazzin.isEmpty()) muazzin = "makkah";
        String name = "adhan_" + muazzin.toLowerCase();
        int res = context.getResources().getIdentifier(name, "raw", context.getPackageName());
        return res != 0 ? res : R.raw.adhan_makkah;
    }
}
