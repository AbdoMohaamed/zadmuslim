package com.zadmuslim.app;

import android.content.Context;
import android.media.AudioManager;

/** Uses system audio mode for cellular and communication apps; no phone permission needed. */
public final class CallAudioGuard {
    static boolean blocksPlayback(int mode) { return mode != AudioManager.MODE_NORMAL; }
    public static boolean isBusy(Context context) {
        try {
            AudioManager manager=(AudioManager)context.getSystemService(Context.AUDIO_SERVICE);
            return manager == null || blocksPlayback(manager.getMode());
        } catch (Exception e) { return true; }
    }
}
