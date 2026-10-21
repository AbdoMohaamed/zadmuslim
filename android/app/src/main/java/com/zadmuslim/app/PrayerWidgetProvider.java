package com.zadmuslim.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.util.Calendar;
import java.util.Locale;

/**
 * PrayerWidgetProvider.java
 * ويدجت الشاشة الرئيسية وشاشة القفل لتطبيق زاد المسلم (Android Home Screen Widget)
 * يعرض الصلاة القادمة، العد التنازلي المتبقي، شريط الصلوات الخمس، والتاريخ والذكر اليومي
 */
public class PrayerWidgetProvider extends AppWidgetProvider {
    private static final String TAG = "PrayerWidgetProvider";
    public static final String ACTION_UPDATE_PRAYER_WIDGET = "com.zadmuslim.app.ACTION_UPDATE_PRAYER_WIDGET";
    private static final String PREFS_NAME = "zad_adhan_native_prefs";

    // باقة مختارة من الأذكار والآيات القرآنية المطمئنة للقلب تتناوب دورياً
    private static final String[] SPIRITUAL_REMINDERS = {
            "«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ» 🌿",
            "«وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ» 🕋",
            "«رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي» 🤲",
            "اللهم صلِّ وسلِّم وبارك على نبينا محمد ﷺ",
            "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ 🕊️",
            "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ ✨",
            "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ 🤍",
            "«إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا» 🕌"
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int widgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();
        if (ACTION_UPDATE_PRAYER_WIDGET.equals(action)
                || Intent.ACTION_TIME_CHANGED.equals(action)
                || Intent.ACTION_TIMEZONE_CHANGED.equals(action)
                || Intent.ACTION_DATE_CHANGED.equals(action)) {
            updateAllWidgets(context);
        }
    }

    public static void updateAllWidgets(Context context) {
        try {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            ComponentName widgetComponent = new ComponentName(context, PrayerWidgetProvider.class);
            int[] widgetIds = manager.getAppWidgetIds(widgetComponent);
            if (widgetIds != null && widgetIds.length > 0) {
                for (int id : widgetIds) {
                    updateWidget(context, manager, id);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error updating all prayer widgets: ", e);
        }
    }

    public static void updateWidget(Context context, AppWidgetManager appWidgetManager, int widgetId) {
        try {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget_layout);

            // 1. فتح التطبيق عند النقر على الويدجت
            Intent appIntent = new Intent(context, MainActivity.class);
            appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            PendingIntent pendingApp = PendingIntent.getActivity(context, 0, appIntent, flags);
            views.setOnClickPendingIntent(R.id.widget_root, pendingApp);

            // 2. زر التحديث اليدوي السريع
            Intent refreshIntent = new Intent(context, PrayerWidgetProvider.class);
            refreshIntent.setAction(ACTION_UPDATE_PRAYER_WIDGET);
            PendingIntent pendingRefresh = PendingIntent.getBroadcast(context, 1001, refreshIntent, flags);
            views.setOnClickPendingIntent(R.id.widget_btn_refresh, pendingRefresh);

            // 3. قراءة البيانات المحفوظة لمواقيت الصلاة والتاريخ
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String timingsJson = prefs.getString("last_timings_json", null);
            String savedHijri = prefs.getString("widget_hijri_date", null);
            String savedGregorian = prefs.getString("widget_gregorian_date", null);

            if (savedHijri == null || savedHijri.trim().isEmpty()) {
                savedHijri = getNativeHijriDate();
            }
            if (savedGregorian == null || savedGregorian.trim().isEmpty()) {
                savedGregorian = getNativeGregorianDate();
            }

            views.setTextViewText(R.id.widget_txt_hijri_date, savedHijri);
            views.setTextViewText(R.id.widget_txt_gregorian_date, savedGregorian);

            // اختيار ذكر / آية دورية بحسب ساعة اليوم
            Calendar nowCal = Calendar.getInstance();
            int dhikrIndex = nowCal.get(Calendar.HOUR_OF_DAY) % SPIRITUAL_REMINDERS.length;
            views.setTextViewText(R.id.widget_txt_dhikr, SPIRITUAL_REMINDERS[dhikrIndex]);

            if (timingsJson != null && !timingsJson.isEmpty()) {
                JSONObject json = new JSONObject(timingsJson);

                String fajrTime = formatPrayerTime12H(getPrayerTimeRaw(json, "Fajr", "fajr", "05:00"));
                String dhuhrTime = formatPrayerTime12H(getPrayerTimeRaw(json, "Dhuhr", "dhuhr", "12:00"));
                String asrTime = formatPrayerTime12H(getPrayerTimeRaw(json, "Asr", "asr", "15:30"));
                String maghribTime = formatPrayerTime12H(getPrayerTimeRaw(json, "Maghrib", "maghrib", "18:00"));
                String ishaTime = formatPrayerTime12H(getPrayerTimeRaw(json, "Isha", "isha", "19:30"));

                views.setTextViewText(R.id.widget_time_fajr, fajrTime);
                views.setTextViewText(R.id.widget_time_dhuhr, dhuhrTime);
                views.setTextViewText(R.id.widget_time_asr, asrTime);
                views.setTextViewText(R.id.widget_time_maghrib, maghribTime);
                views.setTextViewText(R.id.widget_time_isha, ishaTime);

                // حساب الصلاة القادمة والوقت المتبقي
                PrayerCalculation calc = calculateNextPrayer(json);
                views.setTextViewText(R.id.widget_txt_next_prayer_name, calc.prayerName);
                views.setTextViewText(R.id.widget_txt_next_prayer_time, calc.prayerTime12H);
                views.setTextViewText(R.id.widget_txt_countdown, calc.countdownText);

                // إبراز عمود الصلاة القادمة بلون ذهبي متناسق
                resetPrayerColumnBackgrounds(views);
                highlightActivePrayerColumn(views, calc.prayerKey);
            } else {
                views.setTextViewText(R.id.widget_txt_next_prayer_name, "افتح التطبيق لتحديث المواقيت");
                views.setTextViewText(R.id.widget_txt_next_prayer_time, "--:--");
                views.setTextViewText(R.id.widget_txt_countdown, "انقر هنا 🕌");
                resetPrayerColumnBackgrounds(views);
            }

            appWidgetManager.updateAppWidget(widgetId, views);
        } catch (Exception e) {
            Log.e(TAG, "Failed to render prayer widget: ", e);
        }
    }

    private static String getPrayerTimeRaw(JSONObject json, String keyCap, String keyLower, String def) {
        String val = json.optString(keyCap, "");
        if (val.isEmpty()) val = json.optString(keyLower, def);
        return val;
    }

    private static void resetPrayerColumnBackgrounds(RemoteViews views) {
        int normalBg = R.drawable.widget_prayer_col_normal;
        int normalLabelColor = 0xFF8FAEA1;
        int normalTimeColor = 0xFFFFFFFF;

        views.setInt(R.id.col_fajr, "setBackgroundResource", normalBg);
        views.setTextColor(R.id.widget_label_fajr, normalLabelColor);
        views.setTextColor(R.id.widget_time_fajr, normalTimeColor);

        views.setInt(R.id.col_dhuhr, "setBackgroundResource", normalBg);
        views.setTextColor(R.id.widget_label_dhuhr, normalLabelColor);
        views.setTextColor(R.id.widget_time_dhuhr, normalTimeColor);

        views.setInt(R.id.col_asr, "setBackgroundResource", normalBg);
        views.setTextColor(R.id.widget_label_asr, normalLabelColor);
        views.setTextColor(R.id.widget_time_asr, normalTimeColor);

        views.setInt(R.id.col_maghrib, "setBackgroundResource", normalBg);
        views.setTextColor(R.id.widget_label_maghrib, normalLabelColor);
        views.setTextColor(R.id.widget_time_maghrib, normalTimeColor);

        views.setInt(R.id.col_isha, "setBackgroundResource", normalBg);
        views.setTextColor(R.id.widget_label_isha, normalLabelColor);
        views.setTextColor(R.id.widget_time_isha, normalTimeColor);
    }

    private static void highlightActivePrayerColumn(RemoteViews views, String prayerKey) {
        int activeBg = R.drawable.widget_prayer_col_active;
        int activeGoldColor = 0xFFD4AF37;

        if ("fajr".equalsIgnoreCase(prayerKey)) {
            views.setInt(R.id.col_fajr, "setBackgroundResource", activeBg);
            views.setTextColor(R.id.widget_label_fajr, activeGoldColor);
            views.setTextColor(R.id.widget_time_fajr, activeGoldColor);
        } else if ("dhuhr".equalsIgnoreCase(prayerKey)) {
            views.setInt(R.id.col_dhuhr, "setBackgroundResource", activeBg);
            views.setTextColor(R.id.widget_label_dhuhr, activeGoldColor);
            views.setTextColor(R.id.widget_time_dhuhr, activeGoldColor);
        } else if ("asr".equalsIgnoreCase(prayerKey)) {
            views.setInt(R.id.col_asr, "setBackgroundResource", activeBg);
            views.setTextColor(R.id.widget_label_asr, activeGoldColor);
            views.setTextColor(R.id.widget_time_asr, activeGoldColor);
        } else if ("maghrib".equalsIgnoreCase(prayerKey)) {
            views.setInt(R.id.col_maghrib, "setBackgroundResource", activeBg);
            views.setTextColor(R.id.widget_label_maghrib, activeGoldColor);
            views.setTextColor(R.id.widget_time_maghrib, activeGoldColor);
        } else if ("isha".equalsIgnoreCase(prayerKey)) {
            views.setInt(R.id.col_isha, "setBackgroundResource", activeBg);
            views.setTextColor(R.id.widget_label_isha, activeGoldColor);
            views.setTextColor(R.id.widget_time_isha, activeGoldColor);
        }
    }

    public static String formatPrayerTime12H(String raw) {
        if (raw == null || raw.isEmpty()) return "--:--";
        try {
            String clean = raw.split(" ")[0].trim();
            String[] parts = clean.split(":");
            if (parts.length >= 2) {
                int h = Integer.parseInt(parts[0]);
                int m = Integer.parseInt(parts[1]);
                String period = (h >= 12) ? "م" : "ص";
                int h12 = h % 12;
                if (h12 == 0) h12 = 12;
                return String.format(Locale.US, "%02d:%02d %s", h12, m, period);
            }
        } catch (Exception e) {}
        return raw;
    }

    public static class PrayerCalculation {
        public String prayerKey;
        public String prayerName;
        public String prayerTime12H;
        public String countdownText;
    }

    public static PrayerCalculation calculateNextPrayer(JSONObject json) {
        PrayerCalculation res = new PrayerCalculation();
        try {
            String[] keys = {"fajr", "dhuhr", "asr", "maghrib", "isha"};
            String[] names = {"صلاة الفجر", "صلاة الظهر", "صلاة العصر", "صلاة المغرب", "صلاة العشاء"};
            String[] jsonKeys = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"};

            Calendar now = Calendar.getInstance();
            long nowMs = now.getTimeInMillis();

            Calendar nextCal = null;
            int foundIdx = -1;

            // 1. فحص ما إذا كانت الصلاة قد حان وقتها الآن (خلال الـ 15 دقيقة الماضية)
            for (int i = 0; i < keys.length; i++) {
                String raw = getPrayerTimeRaw(json, jsonKeys[i], keys[i], "");
                if (raw.isEmpty()) continue;
                String clean = raw.split(" ")[0];
                String[] p = clean.split(":");
                if (p.length < 2) continue;

                Calendar cal = (Calendar) now.clone();
                cal.set(Calendar.HOUR_OF_DAY, Integer.parseInt(p[0]));
                cal.set(Calendar.MINUTE, Integer.parseInt(p[1]));
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);

                long pMs = cal.getTimeInMillis();
                if (nowMs >= pMs && (nowMs - pMs) <= (15 * 60 * 1000L)) {
                    res.prayerKey = keys[i];
                    res.prayerName = "حان الآن موعد " + names[i];
                    res.prayerTime12H = formatPrayerTime12H(raw);
                    res.countdownText = "وقت الصلاة 🕋";
                    return res;
                }
            }

            // 2. البحث عن الصلاة القادمة اليوم
            for (int i = 0; i < keys.length; i++) {
                String raw = getPrayerTimeRaw(json, jsonKeys[i], keys[i], "");
                if (raw.isEmpty()) continue;
                String clean = raw.split(" ")[0];
                String[] p = clean.split(":");
                if (p.length < 2) continue;

                Calendar cal = (Calendar) now.clone();
                cal.set(Calendar.HOUR_OF_DAY, Integer.parseInt(p[0]));
                cal.set(Calendar.MINUTE, Integer.parseInt(p[1]));
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);

                if (cal.getTimeInMillis() > nowMs) {
                    nextCal = cal;
                    foundIdx = i;
                    break;
                }
            }

            // 3. إذا انتهت صلوات اليوم بعد العشاء، الصلاة القادمة هي فجر الغد
            if (foundIdx == -1) {
                foundIdx = 0; // Fajr
                String raw = getPrayerTimeRaw(json, "Fajr", "fajr", "05:00");
                String clean = raw.split(" ")[0];
                String[] p = clean.split(":");
                Calendar cal = (Calendar) now.clone();
                cal.add(Calendar.DAY_OF_YEAR, 1);
                cal.set(Calendar.HOUR_OF_DAY, Integer.parseInt(p[0]));
                cal.set(Calendar.MINUTE, Integer.parseInt(p[1]));
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                nextCal = cal;
            }

            res.prayerKey = keys[foundIdx];
            res.prayerName = names[foundIdx];
            String targetRaw = getPrayerTimeRaw(json, jsonKeys[foundIdx], keys[foundIdx], "");
            res.prayerTime12H = formatPrayerTime12H(targetRaw);

            long diffMs = nextCal.getTimeInMillis() - nowMs;
            long diffMins = Math.max(1, diffMs / (60 * 1000L));
            long hours = diffMins / 60;
            long mins = diffMins % 60;

            if (hours > 0) {
                res.countdownText = "متبقي " + hours + " س و " + mins + " د";
            } else {
                res.countdownText = "متبقي " + mins + " دقيقة";
            }

        } catch (Exception e) {
            res.prayerKey = "fajr";
            res.prayerName = "مواقيت الصلاة";
            res.prayerTime12H = "--:--";
            res.countdownText = "زاد المسلم 🌿";
        }
        return res;
    }

    public static String getNativeGregorianDate() {
        try {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("d MMMM yyyy", new java.util.Locale("ar"));
            return sdf.format(new java.util.Date()) + " م";
        } catch (Exception e) {
            return "";
        }
    }

    public static String getNativeHijriDate() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                android.icu.util.IslamicCalendar cal = new android.icu.util.IslamicCalendar();
                android.icu.text.SimpleDateFormat sdf = new android.icu.text.SimpleDateFormat("d MMMM yyyy", new java.util.Locale("ar"));
                sdf.setCalendar(cal);
                return sdf.format(new java.util.Date()) + " هـ";
            }
        } catch (Exception ignored) {}
        return "التقويم الهجري المبارك";
    }
}
