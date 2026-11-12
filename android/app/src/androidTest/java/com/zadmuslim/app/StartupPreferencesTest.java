package com.zadmuslim.app;

import android.content.Context;
import android.content.ContextWrapper;
import android.content.SharedPreferences;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import static org.junit.Assert.*;

public class StartupPreferencesTest {
    @Test public void malformedPreferencesDoNotPreventOpeningTheApp() {
        Context testApp = InstrumentationRegistry.getInstrumentation().getContext();
        SharedPreferences fixture = testApp.getSharedPreferences("startup_regression", Context.MODE_PRIVATE);
        Context context = new ContextWrapper(testApp) {
            @Override public SharedPreferences getSharedPreferences(String name, int mode) {
                return fixture;
            }
        };
        try {
            fixture.edit().putInt("interface_language", 1).putString("enabled", "false")
                .putBoolean("local_calculation", false).apply();
            assertEquals("ar", NativeLanguage.language(context));
            assertFalse(PrayerTravelPlugin.enabled(context));
            assertFalse(PrayerRenewalReceiver.renew(context));

            fixture.edit().putString("interface_language", "ur").putBoolean("enabled", true).apply();
            assertEquals("ur", NativeLanguage.language(context));
            assertTrue(PrayerTravelPlugin.enabled(context));
        } finally {
            fixture.edit().clear().commit();
        }
    }
}
