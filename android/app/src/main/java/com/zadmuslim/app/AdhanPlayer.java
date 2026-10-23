package com.zadmuslim.app;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.res.AssetFileDescriptor;
import android.database.ContentObserver;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;

public class AdhanPlayer {
    private static final String TAG = "AdhanPlayer";
    private static MediaPlayer mediaPlayer;
    private static PowerManager.WakeLock wakeLock;
    private static Context appContext;
    private static AudioManager audioManager;
    private static Object audioFocusRequestObj;
    private static BroadcastReceiver hardwareKeysReceiver;
    private static ContentObserver volumeContentObserver;
    private static volatile boolean isPlaying = false;

    public static synchronized void play(Context context, String prayerName, String prayerKey, String muazzin) {
        releasePlayback(false);
        if (context == null) return;
        appContext = context.getApplicationContext();

        try {
            audioManager = (AudioManager) appContext.getSystemService(Context.AUDIO_SERVICE);

            // 1. حجز WakeLock لضمان استمرار عمل المعالج أثناء تشغيل الأذان كاملاً والشاشة مقفلة
            PowerManager pm = (PowerManager) appContext.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "zadmuslim:adhan_audio_wakelock");
                wakeLock.setReferenceCounted(false);
                wakeLock.acquire(4 * 60 * 1000L); // 4 دقائق كحد أقصى للأذان
            }

            // 2. طلب التركيز الصوتي (Audio Focus)
            requestAudioFocus();

            // 3. التأكد من أن مستوى صوت المنبه مسموع
            // Respect the system alarm volume; the in-app slider scales this playback.

            // 4. جلب ملف الصوت من res/raw عبر AssetFileDescriptor لضمان عدم حدوث أي خطأ في فتح الملف
            int soundResId = getSoundResourceId(appContext, prayerKey, muazzin);
            AssetFileDescriptor afd = null;
            try {
                afd = appContext.getResources().openRawResourceFd(soundResId);
            } catch (Exception e) {
                Log.w(TAG, "Could not open primary adhan sound resource, falling back to qatami", e);
            }
            if (afd == null) {
                afd = appContext.getResources().openRawResourceFd(R.raw.adhan_qatami);
            }

            mediaPlayer = new MediaPlayer();
            mediaPlayer.setWakeMode(appContext, PowerManager.PARTIAL_WAKE_LOCK);
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                    .build();
            mediaPlayer.setAudioAttributes(audioAttributes);
            mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
            float chosenVolume = appContext.getSharedPreferences(AdhanNativePlugin.PREFS_NAME,0).getFloat("adhan_volume",1.0f);
            mediaPlayer.setVolume(chosenVolume, chosenVolume);

            if (afd != null) {
                mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                afd.close();
            } else {
                Uri uri = Uri.parse("android.resource://" + appContext.getPackageName() + "/" + soundResId);
                mediaPlayer.setDataSource(appContext, uri);
            }

            mediaPlayer.prepare();
            mediaPlayer.setOnCompletionListener(mp -> {
                Log.d(TAG, "Adhan finished playing naturally");
                stop();
            });

            mediaPlayer.start();
            isPlaying = true;
            Log.d(TAG, "Adhan started successfully on STREAM_ALARM with resource: " + soundResId);

            // 5. تسجيل مستمعات أزرار الصوت وزر القفل لإيقاف الأذان فوراً عند الضغط عليها
            registerHardwareStopListeners(appContext);

        } catch (Exception e) {
            Log.e(TAG, "Error starting Adhan playback", e);
            stop();
        }
    }

    private static void requestAudioFocus() {
        if (audioManager == null) return;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AudioAttributes playbackAttrs = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build();

                AudioFocusRequest afr = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE)
                        .setAudioAttributes(playbackAttrs)
                        .setOnAudioFocusChangeListener(focusChange -> {
                            if (focusChange == AudioManager.AUDIOFOCUS_LOSS || focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                                Log.d(TAG, "Audio focus lost - stopping adhan");
                                stop();
                            }
                        })
                        .build();

                audioFocusRequestObj = afr;
                audioManager.requestAudioFocus(afr);
            } else {
                audioManager.requestAudioFocus(
                        focusChange -> {
                            if (focusChange == AudioManager.AUDIOFOCUS_LOSS || focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
                                stop();
                            }
                        },
                        AudioManager.STREAM_ALARM,
                        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE
                );
            }
        } catch (Exception e) {
            Log.w(TAG, "Error requesting audio focus", e);
        }
    }

    private static void ensureAudibleAlarmVolume() {
        if (audioManager == null) return;
        try {
            int currentVol = audioManager.getStreamVolume(AudioManager.STREAM_ALARM);
            int maxVol = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
            if (currentVol < (maxVol / 2)) {
                // ضبط مستوى الصوت ليكون مسموعاً بوضوح (على الأقل 70% من الحد الأقصى للمنبه)
                audioManager.setStreamVolume(AudioManager.STREAM_ALARM, (int) (maxVol * 0.75), 0);
            }
        } catch (Exception ignored) {}
    }

    /**
     * تسجيل مستمعات النظام لأزرار الهاتف المادية (Volume Up/Down وزر Power/Lock)
     */
    private static void registerHardwareStopListeners(Context context) {
        unregisterHardwareStopListeners(context);

        // Screen locking and unrelated settings changes must not stop the adhan.
        final AudioManager manager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        final int[] volume = {manager == null ? -1 : manager.getStreamVolume(AudioManager.STREAM_ALARM)};
        hardwareKeysReceiver = new BroadcastReceiver() {
            @Override public void onReceive(Context ctx, Intent intent) {
                if (manager == null || intent == null || !"android.media.VOLUME_CHANGED_ACTION".equals(intent.getAction())) return;
                int current = manager.getStreamVolume(AudioManager.STREAM_ALARM);
                if (isPlaying && current != volume[0]) stop();
                volume[0] = current;
            }
        };
        androidx.core.content.ContextCompat.registerReceiver(context, hardwareKeysReceiver,
            new IntentFilter("android.media.VOLUME_CHANGED_ACTION"), androidx.core.content.ContextCompat.RECEIVER_NOT_EXPORTED);
    }

    private static void unregisterHardwareStopListeners(Context context) {
        if (hardwareKeysReceiver != null) {
            try {
                if (context != null) context.unregisterReceiver(hardwareKeysReceiver);
            } catch (Exception ignored) {}
            hardwareKeysReceiver = null;
        }

        if (volumeContentObserver != null) {
            try {
                if (context != null) context.getContentResolver().unregisterContentObserver(volumeContentObserver);
            } catch (Exception ignored) {}
            volumeContentObserver = null;
        }
    }

    public static synchronized void stop() {
        releasePlayback(true);
    }

    private static synchronized void releasePlayback(boolean stopService) {
        isPlaying = false;

        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
            } catch (Exception ignored) {}
            mediaPlayer = null;
        }

        if (audioManager != null) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequestObj instanceof AudioFocusRequest) {
                    audioManager.abandonAudioFocusRequest((AudioFocusRequest) audioFocusRequestObj);
                }
            } catch (Exception ignored) {}
            audioFocusRequestObj = null;
        }

        if (appContext != null) {
            unregisterHardwareStopListeners(appContext);
        }

        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {}
            wakeLock = null;
        }

        // Do not stop the foreground service when replacing its audio.
        if (stopService && appContext != null) {
            try {
                appContext.stopService(new Intent(appContext, AdhanService.class));
            } catch (Exception ignored) {}

            // مسح إشعار الأذان من شريط الإشعارات
            try {
                NotificationManager nm = (NotificationManager) appContext.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    nm.cancel(AdhanAlarmReceiver.ADHAN_NOTIFICATION_ID);
                    nm.cancel(AdhanService.NOTIFICATION_ID);
                }
            } catch (Exception ignored) {}

            // إرسال برودكاست لإغلاق شاشة AdhanActivity إن كانت مفتوحة
            try {
                Intent closeActivity = new Intent(AdhanActivity.ACTION_DISMISS_ADHAN_ACTIVITY);
                closeActivity.setPackage(appContext.getPackageName());
                appContext.sendBroadcast(closeActivity);
            } catch (Exception ignored) {}
        }

        Log.d(TAG, "Adhan stopped completely");
    }

    public static synchronized boolean isPlaying() {
        return isPlaying && mediaPlayer != null && mediaPlayer.isPlaying();
    }

    private static int getSoundResourceId(Context context, String prayerKey, String muazzin) {
        if ("fajr".equalsIgnoreCase(prayerKey)) {
            return R.raw.adhan_fajr;
        }
        if (muazzin == null || muazzin.isEmpty()) muazzin = "qatami";
        String name = "adhan_" + muazzin.toLowerCase();
        int res = context.getResources().getIdentifier(name, "raw", context.getPackageName());
        return res != 0 ? res : R.raw.adhan_qatami;
    }

    public static synchronized void playPrePrayerVoice(Context context, String prayerKey) {
        releasePlayback(false);
        if (context == null) return;
        appContext = context.getApplicationContext();

        try {
            audioManager = (AudioManager) appContext.getSystemService(Context.AUDIO_SERVICE);
            requestAudioFocus();
            PowerManager pm = (PowerManager) appContext.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "zadmuslim:pre_prayer_audio_wakelock");
                wakeLock.setReferenceCounted(false);
                wakeLock.acquire(15 * 1000L); // 15 ثانية كافية للتنبيه المسبق
            }

            int soundResId = getPrePrayerSoundResourceId(appContext, prayerKey);
            AssetFileDescriptor afd = null;
            try {
                afd = appContext.getResources().openRawResourceFd(soundResId);
            } catch (Exception ignored) {}

            mediaPlayer = new MediaPlayer();
            mediaPlayer.setWakeMode(appContext, PowerManager.PARTIAL_WAKE_LOCK);
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                    .build();
            mediaPlayer.setAudioAttributes(audioAttributes);
            mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
            mediaPlayer.setVolume(1.0f, 1.0f);

            if (afd != null) {
                mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                afd.close();
            } else {
                Uri uri = Uri.parse("android.resource://" + appContext.getPackageName() + "/" + soundResId);
                mediaPlayer.setDataSource(appContext, uri);
            }

            mediaPlayer.prepare();
            mediaPlayer.setOnCompletionListener(mp -> stop());
            mediaPlayer.start();
            isPlaying = true;
            registerHardwareStopListeners(appContext);

            Log.d(TAG, "PrePrayerVoice started successfully with resource: " + soundResId + " for " + prayerKey);
        } catch (Exception e) {
            Log.e(TAG, "Error playing PrePrayerVoice", e);
            stop();
        }
    }

    private static int getPrePrayerSoundResourceId(Context context, String prayerKey) {
        if (prayerKey != null && !prayerKey.trim().isEmpty()) {
            String name = "pre_" + prayerKey.trim().toLowerCase();
            int res = context.getResources().getIdentifier(name, "raw", context.getPackageName());
            if (res != 0) return res;
        }
        return R.raw.pre_prayer;
    }
}
