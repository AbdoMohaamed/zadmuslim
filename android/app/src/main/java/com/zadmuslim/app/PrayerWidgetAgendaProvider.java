package com.zadmuslim.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.RemoteViews;

/** Keep the former agenda component so installed widgets migrate without being removed. */
public class PrayerWidgetAgendaProvider extends AppWidgetProvider {
    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) { updateAll(context); }
    @Override public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int id, Bundle options) { updateAll(context); }
    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, PrayerWidgetAgendaProvider.class));
        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.radio_home_widget);
            android.content.SharedPreferences prefs = context.getSharedPreferences("radio-widget", 0);
            boolean active = RadioService.wanted && !RadioService.stationId.startsWith("offline-") && !RadioService.stationId.startsWith("recitation-");
            views.setTextViewText(R.id.radio_widget_station, prefs.getString("name", "إذاعة القرآن الكريم من القاهرة"));
            String status = !active ? "متوقف" : "playing".equals(RadioService.state) ? "يعمل الآن" : "offline".equals(RadioService.state) ? "لا يوجد اتصال بالإنترنت" : "interrupted".equals(RadioService.state) ? "متوقف مؤقتًا" : "جارٍ الاتصال…";
            if (!active && ("failed".equals(RadioService.state) || "blocked".equals(RadioService.state))) status = "تعذّر التشغيل، حاول مجددًا";
            views.setTextViewText(R.id.radio_widget_status, NativeLanguage.text(context, status));
            views.setTextViewText(R.id.radio_widget_toggle, active ? "■" : "▶");
            views.setContentDescription(R.id.radio_widget_toggle, NativeLanguage.text(context, active ? "إيقاف" : "تشغيل"));
            Intent choose = new Intent(context, RadioWidgetPickerActivity.class);
            views.setOnClickPendingIntent(R.id.radio_widget_choose, PendingIntent.getActivity(context, 99985, choose, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            Intent playback = new Intent(context, RadioService.class).setAction("WIDGET_TOGGLE");
            int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
            views.setOnClickPendingIntent(R.id.radio_widget_toggle, (android.os.Build.VERSION.SDK_INT >= 26 ? PendingIntent.getForegroundService(context, 99983, playback, flags) : PendingIntent.getService(context, 99983, playback, flags)));
            Intent open = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
            if (open != null) views.setOnClickPendingIntent(R.id.radio_widget_root, PendingIntent.getActivity(context, 99984, open, flags));
            manager.updateAppWidget(id, views);
        }
    }
}
