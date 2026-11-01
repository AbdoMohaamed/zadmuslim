package com.zadmuslim.app;
import org.junit.Test;
import static org.junit.Assert.*;
import android.media.AudioManager;
public class CallAudioGuardTest {
    @Test public void idleAudioAllowsAdhan() {assertFalse(CallAudioGuard.blocksPlayback(AudioManager.MODE_NORMAL));}
    @Test public void ringingAndCellularCallsBlockAdhan() {
        assertTrue(CallAudioGuard.blocksPlayback(AudioManager.MODE_RINGTONE));
        assertTrue(CallAudioGuard.blocksPlayback(AudioManager.MODE_IN_CALL));
    }
    @Test public void internetCallsAndUnknownModesBlockAdhan() {
        assertTrue(CallAudioGuard.blocksPlayback(AudioManager.MODE_IN_COMMUNICATION));
        assertTrue(CallAudioGuard.blocksPlayback(-1));
        assertTrue(CallAudioGuard.blocksPlayback(4));
    }
}
