package com.zadmuslim.app;

import android.content.Context;

/** Presentation only: alarm identifiers, prayer keys and stored timings stay canonical. */
public final class NativeLanguage {
    private NativeLanguage() {}

    public static String language(Context context) {
        String language;
        try {
            language = context.getSharedPreferences(AdhanNativePlugin.PREFS_NAME, 0).getString("interface_language", "ar");
        } catch (ClassCastException invalidPreference) {
            return "ar";
        }
        return "en".equals(language) || "ur".equals(language) ? language : "ar";
    }

    public static String choose(Context context, String ar, String en, String ur) {
        String language = language(context);
        return "en".equals(language) ? en : "ur".equals(language) ? ur : ar;
    }

    // Only presentation text uses this table; alarm payloads stay canonical.
    private static final String[][] LABELS = {
        {"رسائل زاد المسلم", "Zad Al Muslim messages", "زاد المسلم کے پیغامات"},
        {"الإشعارات المرسلة من إدارة زاد المسلم", "Announcements from Zad Al Muslim", "زاد المسلم کی انتظامیہ کی اطلاعات"},
        {"تلاوة محفوظة · بدون إنترنت", "Saved recitation · Offline", "محفوظ تلاوت · آف لائن"},
        {"تلاوة القرآن · عبر الإنترنت", "Quran recitation · Online", "قرآن کی تلاوت · آن لائن"},
        {"متوقف مؤقتًا للمكالمة أو الأذان", "Paused for a call or adhan", "کال یا اذان کے لیے عارضی طور پر بند"},
        {"جاري فتح التلاوة", "Opening recitation", "تلاوت کھولی جا رہی ہے"},
        {"جاري الاتصال بالبث", "Connecting to stream", "نشریات سے رابطہ کیا جا رہا ہے"},
        {"متوقف مؤقتًا", "Paused", "عارضی طور پر بند"}, {"يعمل الآن", "Playing", "چل رہا ہے"},
        {"أذكار وتذكيرات يومية", "Daily adhkar and reminders", "روزانہ اذکار اور یاد دہانیاں"},
        {"أذكار الصباح", "Morning adhkar", "صبح کے اذکار"}, {"أذكار المساء", "Evening adhkar", "شام کے اذکار"},
        {"أذكار النوم", "Bedtime adhkar", "سونے کے اذکار"},
        {"ابدأ يومك بذكر الله", "Begin your day with the remembrance of Allah", "اپنے دن کا آغاز اللہ کے ذکر سے کریں"},
        {"حان وقت أذكار المساء", "It is time for evening adhkar", "شام کے اذکار کا وقت ہے"},
        {"جمعة مباركة", "Blessed Friday", "جمعہ مبارک"},
        {"تذكير بسورة الكهف والصلاة على النبي ﷺ", "A reminder to recite Surah Al-Kahf and send blessings upon the Prophet.", "سورۃ الکہف کی تلاوت اور نبی کریم پر درود کی یاد دہانی۔"},
        {"تذكير بالصيام", "Fasting reminder", "روزے کی یاد دہانی"},
        {"غدًا موعد صيام الإثنين أو الخميس", "Tomorrow is a Monday or Thursday fasting day", "کل پیر یا جمعرات کے روزے کا دن ہے"},
        {"ﷺ صلِّ على النبي", "Send blessings upon the Prophet", "نبی کریم پر درود بھیجیں"},
        {"باسمك ربي وضعت جنبي وبك أرفعه", "In Your name, my Lord, I lie down, and by You I rise.", "اے میرے رب، تیرے نام سے میں لیٹتا ہوں اور تیری مدد سے اٹھتا ہوں۔"},
        {"اللهم صلِّ وسلِّم وبارك على نبينا محمد ﷺ", "O Allah, send blessings, peace and favor upon our Prophet Muhammad.", "اے اللہ، ہمارے نبی محمد پر درود، سلام اور برکت نازل فرما۔"},
        {"الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح", "Allah is the Greatest, Allah is the Greatest. Come to prayer, come to success.", "اللہ سب سے بڑا ہے، اللہ سب سے بڑا ہے۔ نماز کی طرف آؤ، کامیابی کی طرف آؤ۔"},
        {"«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ» 🌿", "Surely, in the remembrance of Allah hearts find peace. 🌿", "خبردار، اللہ کے ذکر سے دلوں کو اطمینان ملتا ہے۔ 🌿"},
        {"«وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ» 🕋", "Seek help through patience and prayer. 🕋", "صبر اور نماز سے مدد چاہو۔ 🕋"},
        {"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ 🕊️", "Glory and praise be to Allah. Glory be to Allah, the Magnificent. 🕊️", "اللہ کی پاکی اور تعریف ہے۔ اللہ عظمت والا پاک ہے۔ 🕊️"},
        {"لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ ✨", "There is no power or strength except through Allah, the Most High, the Magnificent. ✨", "اللہ بلند و برتر، عظمت والے کی مدد کے سوا نہ کوئی طاقت ہے نہ قوت۔ ✨"},
        {"أَسْتَغْفِرُ اللَّهِ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ 🤍", "I seek forgiveness from Allah the Magnificent and turn to Him in repentance. 🤍", "میں عظمت والے اللہ سے مغفرت مانگتا ہوں اور اسی کی طرف توبہ کرتا ہوں۔ 🤍"},
        {"الصلاة على النبي ﷺ بدون صوت", "Silent salawat reminders", "درود کی خاموش یاد دہانیاں"},
        {"الصلاة على النبي ﷺ — الصوت الأول", "Salawat — Voice 1", "درود — پہلی آواز"},
        {"الصلاة على النبي ﷺ — الصوت الثاني", "Salawat — Voice 2", "درود — دوسری آواز"},
        {"الصلاة على النبي ﷺ", "Blessings upon the Prophet", "نبی کریم پر درود"},
        {"تنبيهات الصلاة الصامتة أثناء المكالمات", "Silent prayer alerts during calls", "کال کے دوران نماز کی خاموش اطلاعات"},
        {"أذان الصلوات المفروضة (صوت كامل)", "Prayer adhan (full audio)", "فرض نمازوں کی اذان (مکمل آواز)"},
        {"تشغيل الأذان والتنبيه بدخول وقت الصلاة", "Adhan and prayer time alerts", "اذان اور نماز کے وقت کی اطلاع"},
        {"تذكير بالاستعداد للصلاة والوضوء قبل الأذان", "A reminder to prepare for prayer before adhan", "اذان سے پہلے وضو اور نماز کی تیاری کی یاد دہانی"},
        {"تنبيه اقتراب موعد الصلاة", "Upcoming prayer alert", "نماز کا وقت قریب ہونے کی اطلاع"},
        {"إشعار الصلاة والذكر الدائم", "Ongoing prayer and dhikr notification", "نماز اور ذکر کی مستقل اطلاع"},
        {"عرض الصلاة القادمة والوقت المتبقي والذكر في شريط الإشعارات", "Next prayer, countdown and dhikr in notifications", "اطلاعات میں اگلی نماز، باقی وقت اور ذکر"},
        {"اختر المدينة من التطبيق", "Choose a city in the app", "ایپ سے شہر منتخب کریں"},
        {"افتح التطبيق لتحديث المواقيت", "Open the app to update prayer times", "اوقات تازہ کرنے کے لیے ایپ کھولیں"},
        {"استمرار الأذان", "Continue adhan", "اذان جاری رکھیں"},
        {"إيقاف الأذان", "Stop adhan", "اذان بند کریں"},
        {"إيقاف الصوت", "Stop audio", "آواز بند کریں"},
        {"الصلاة القادمة:", "Next prayer:", "اگلی نماز:"},
        {"الصلاة القادمة", "Next prayer", "اگلی نماز"},
        {"حَانَ الآنَ مَوْعِدُ ", "It is time for ", "اب وقت ہے: "},
        {"حان الآن موعد ", "It is time for ", "اب وقت ہے: "},
        {"اقترب موعد ", "Coming up: ", "وقت قریب ہے: "},
        {"حان موعد ", "It is time for ", "وقت ہو گیا: "},
        {"اقتربت ", "Coming up: ", "وقت قریب ہے: "},
        {"صلاة الفجر", "Fajr prayer", "فجر کی نماز"},
        {"صلاة الظهر", "Dhuhr prayer", "ظہر کی نماز"},
        {"صلاة العصر", "Asr prayer", "عصر کی نماز"},
        {"صلاة المغرب", "Maghrib prayer", "مغرب کی نماز"},
        {"صلاة العشاء", "Isha prayer", "عشاء کی نماز"},
        {"مواقيت الصلاة", "Prayer times", "نماز کے اوقات"},
        {"تنبيه الصلاة", "Prayer alert", "نماز کی اطلاع"},
        {"الفجر", "Fajr", "فجر"}, {"الظهر", "Dhuhr", "ظہر"},
        {"العصر", "Asr", "عصر"}, {"المغرب", "Maghrib", "مغرب"}, {"العشاء", "Isha", "عشاء"},
        {"موقعك الحالي", "Your location", "آپ کا مقام"},
        {"انقر هنا 🕌", "Tap here 🕌", "یہاں دبائیں 🕌"},
        {"حان وقت الصلاة", "It is prayer time", "نماز کا وقت ہو گیا"},
        {"متبقي عليها", "Time remaining", "باقی وقت"},
        {"متبقي ", "Remaining: ", "باقی: "},
        {" (اختبار التشخيص)", " (diagnostic test)", " (تشخیصی آزمائش)"},
        {" (اختبار)", " (test)", " (آزمائش)"},
        {" راديو القرآن", " Quran radio", " قرآن ریڈیو"},
        {"راديو القرآن الكريم", "Quran radio", "قرآن ریڈیو"},
        {"راديو القرآن", "Quran radio", "قرآن ریڈیو"},
        {"تلاوة محفوظة", "Saved recitation", "محفوظ تلاوت"},
        {"تلاوة", "Recitation", "تلاوت"},
        {"إيقاف", "Stop", "بند کریں"}, {"استكمال", "Resume", "جاری رکھیں"},
        {"إيقاف مؤقت", "Pause", "عارضی روکیں"},
        {"زاد المسلم", "Zad Al Muslim", "زاد المسلم"},
        {"جمادى الأولى", "Jumada al-Ula", "جمادی الاولیٰ"}, {"جمادى الآخرة", "Jumada al-Akhirah", "جمادی الآخرۃ"},
        {"ربيع الأول", "Rabi al-Awwal", "ربیع الاول"}, {"ربيع الآخر", "Rabi al-Thani", "ربیع الثانی"},
        {"ذو القعدة", "Dhu al-Qadah", "ذوالقعدہ"}, {"ذو الحجة", "Dhu al-Hijjah", "ذوالحجہ"},
        {"محرم", "Muharram", "محرم"}, {"صفر", "Safar", "صفر"}, {"رجب", "Rajab", "رجب"},
        {"شعبان", "Sha'ban", "شعبان"}, {"رمضان", "Ramadan", "رمضان"}, {"شوال", "Shawwal", "شوال"},
        {"يناير", "January", "جنوری"}, {"فبراير", "February", "فروری"}, {"مارس", "March", "مارچ"},
        {"أبريل", "April", "اپریل"}, {"مايو", "May", "مئی"}, {"يونيو", "June", "جون"},
        {"يوليو", "July", "جولائی"}, {"أغسطس", "August", "اگست"}, {"سبتمبر", "September", "ستمبر"},
        {"أكتوبر", "October", "اکتوبر"}, {"نوفمبر", "November", "نومبر"}, {"ديسمبر", "December", "دسمبر"}
    };
    static { java.util.Arrays.sort(LABELS, (a, b) -> Integer.compare(b[0].length(), a[0].length())); }

    public static String reminderBody(Context context, String source) {
        return reminderBodyForLanguage(language(context), source);
    }

    static String reminderBodyForLanguage(String language, String source) {
        if (!"en".equals(language) && !"ur".equals(language)) return source;
        for (String[] row : LABELS) if (row[0].equals(source)) return row["en".equals(language) ? 1 : 2];
        // Only translate complete, known reminders.
        return source;
    }

    public static String text(Context context, String source) {
        return textForLanguage(language(context), source);
    }

    static String textForLanguage(String language, String source) {
        if (source == null || (!"en".equals(language) && !"ur".equals(language))) return source;
        int column = "en".equals(language) ? 1 : 2;
        java.util.regex.Matcher countdown = java.util.regex.Pattern.compile("^متبقي (\\d+) س و (\\d+) د$").matcher(source);
        if (countdown.matches()) return column == 1 ? countdown.group(1) + "h " + countdown.group(2) + "m remaining"
            : "باقی: " + countdown.group(1) + " گھنٹے " + countdown.group(2) + " منٹ";
        countdown = java.util.regex.Pattern.compile("^متبقي (\\d+) دقيقة$").matcher(source);
        if (countdown.matches()) return column == 1 ? countdown.group(1) + " min remaining" : "باقی: " + countdown.group(1) + " منٹ";
        String result = source;
        for (String[] row : LABELS) result = result.replace(row[0], row[column]);
        if (column == 1) {
            StringBuilder latin = new StringBuilder();
            for (char ch : result.toCharArray()) {
                if (ch >= '٠' && ch <= '٩') ch = (char) ('0' + ch - '٠');
                if (ch >= '۰' && ch <= '۹') ch = (char) ('0' + ch - '۰');
                latin.append(ch);
            }
            result = latin.toString().replaceAll("(\\d{1,2}:\\d{2})\\s*ص", "$1 AM")
                .replaceAll("(\\d{1,2}:\\d{2})\\s*م", "$1 PM").replace(" هـ", " AH").replaceAll(" م$", " CE");
        }
        return result;
    }

}
