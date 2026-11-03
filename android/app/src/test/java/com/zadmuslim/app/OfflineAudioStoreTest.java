package com.zadmuslim.app;
import org.junit.Test;
import static org.junit.Assert.*;
public class OfflineAudioStoreTest {
 @Test public void onlyPrivateRecordingIdsAreAccepted(){assertTrue(OfflineAudioStore.validId("offline-123-67"));for(String id:new String[]{"../file","offline-123-67/../../x","","/sdcard/music"})assertFalse(OfflineAudioStore.validId(id));}
 @Test public void audioHostsAndPathsAreRestricted(){assertTrue(OfflineAudioStore.allowed("https://cdn.mp3quran.net/audio/mishary-alafasy/r1/001.mp3"));for(String url:new String[]{"http://cdn.mp3quran.net/audio/mishary-alafasy/r1/001.mp3","https://cdn.mp3quran.net.evil.test/audio/mishary-alafasy/r1/001.mp3","https://user@cdn.mp3quran.net/audio/mishary-alafasy/r1/001.mp3","https://cdn.mp3quran.net/audio/../../001.mp3","file:///private.mp3"})assertFalse(OfflineAudioStore.allowed(url));}
}
