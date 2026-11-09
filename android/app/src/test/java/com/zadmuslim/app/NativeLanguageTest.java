package com.zadmuslim.app;

import static org.junit.Assert.*;
import org.junit.Test;

public class NativeLanguageTest {
    @Test public void reminderBodiesTranslateKnownTextsAndKeepUnrecognizedText() {
        assertEquals("It is time for evening adhkar", NativeLanguage.reminderBodyForLanguage("en", "حان وقت أذكار المساء"));
        String bedtime = "باسمك ربي وضعت جنبي وبك أرفعه";
        assertEquals("In Your name, my Lord, I lie down, and by You I rise.", NativeLanguage.reminderBodyForLanguage("en", bedtime));
        assertEquals("اے میرے رب، تیرے نام سے میں لیٹتا ہوں اور تیری مدد سے اٹھتا ہوں۔", NativeLanguage.reminderBodyForLanguage("ur", bedtime));
        assertEquals(bedtime, NativeLanguage.reminderBodyForLanguage("ar", bedtime));
        String quote="سلام هي حتى مطلع الفجر";
        assertEquals(quote, NativeLanguage.reminderBodyForLanguage("en", quote));
        assertEquals(quote, NativeLanguage.reminderBodyForLanguage("ur", quote));
        assertEquals("الفجر", NativeLanguage.textForLanguage("invalid", "الفجر"));
    }
    @Test public void prayerNamesAndCountdownsKeepTheirCanonicalSource() {
        String source = "صلاة الفجر";
        assertEquals("Fajr prayer", NativeLanguage.textForLanguage("en", source));
        assertEquals("فجر کی نماز", NativeLanguage.textForLanguage("ur", source));
        assertEquals(source, NativeLanguage.textForLanguage("ar", source));
        assertEquals("2h 3m remaining", NativeLanguage.textForLanguage("en", "متبقي 2 س و 3 د"));
        assertEquals("3 min remaining", NativeLanguage.textForLanguage("en", "متبقي 3 دقيقة"));
    }

    @Test public void datesAndTimePeriodsDoNotCollideWithCountdownAbbreviations() {
        assertEquals("4 December 2026 CE", NativeLanguage.textForLanguage("en", "٤ ديسمبر ٢٠٢٦ م"));
        assertEquals("24 Jumada al-Ula 1448 AH", NativeLanguage.textForLanguage("en", "٢٤ جمادى الأولى ١٤٤٨ هـ"));
        assertEquals("Next prayer: Fajr (5:10 AM)", NativeLanguage.textForLanguage("en", "الصلاة القادمة: الفجر (٥:١٠ ص)"));
    }

    @Test public void longestLabelsAreTranslatedBeforeShorterActionNames() {
        assertEquals("Pause", NativeLanguage.textForLanguage("en", "إيقاف مؤقت"));
        assertEquals("Stop adhan ⏹", NativeLanguage.textForLanguage("en", "إيقاف الأذان ⏹"));
        assertEquals("Quran radio", NativeLanguage.textForLanguage("en", "راديو القرآن الكريم"));
    }
}
