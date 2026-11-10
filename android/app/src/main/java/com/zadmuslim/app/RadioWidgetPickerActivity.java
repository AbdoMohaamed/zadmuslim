package com.zadmuslim.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.*;
import org.json.*;
import java.io.*;
import java.util.*;

/** User-opened native picker, independent of the WebView. */
public class RadioWidgetPickerActivity extends Activity {
    private final List<JSONObject> stations = new ArrayList<>();
    private final List<JSONObject> filtered = new ArrayList<>();
    private ArrayAdapter<String> adapter;
    private String selected;
    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        selected = getSharedPreferences("radio-widget", 0).getString("id", "cairo");
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL); root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        int padding = (int)(16 * getResources().getDisplayMetrics().density);
        root.setPadding(padding, padding, padding, padding); root.setBackgroundColor(Color.rgb(248, 245, 235));
        TextView title = new TextView(this);
        title.setText("اختيار المحطة أو الشيخ"); title.setTextSize(22); title.setTextColor(Color.rgb(12, 48, 35)); root.addView(title);
        TextView help = new TextView(this);
        help.setText("اختر لحفظ المحطة. إذا كان الراديو يعمل سيتحول إليها مباشرة."); help.setTextSize(14); root.addView(help);
        EditText search = new EditText(this); search.setSingleLine(true); search.setHint("ابحث عن شيخ أو محطة"); root.addView(search);
        ListView list = new ListView(this);
        adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_single_choice, new ArrayList<>());
        list.setAdapter(adapter); list.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
        root.addView(list, new LinearLayout.LayoutParams(-1, 0, 1));
        Button close = new Button(this); close.setText("رجوع"); close.setOnClickListener(v -> finish()); root.addView(close);
        setContentView(root);
        try (InputStream in = getResources().openRawResource(R.raw.radio_widget_stations)) {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream(); byte[] buffer = new byte[4096]; int count;
            while ((count = in.read(buffer)) != -1) bytes.write(buffer, 0, count);
            JSONArray data = new JSONArray(bytes.toString("UTF-8"));
            for (int i=0; i<data.length(); i++) stations.add(data.getJSONObject(i));
        } catch (Exception error) { Toast.makeText(this, "تعذّر تحميل قائمة المحطات", Toast.LENGTH_LONG).show(); }
        filter("", list);
        search.addTextChangedListener(new TextWatcher() {
            public void beforeTextChanged(CharSequence s,int start,int count,int after) {}
            public void onTextChanged(CharSequence s,int start,int before,int count) { filter(s.toString(), list); }
            public void afterTextChanged(Editable e) {}
        });
        list.setOnItemClickListener((parent, view, position, id) -> select(filtered.get(position)));
    }
    private void filter(String query, ListView list) {
        filtered.clear(); adapter.clear(); list.clearChoices();
        String normalized = normalize(query);
        for (JSONObject station : stations) if (normalize(station.optString("name")).contains(normalized)) {
            filtered.add(station); adapter.add(station.optString("name"));
        }
        for (int i=0; i<filtered.size(); i++) if (selected.equals(filtered.get(i).optString("id"))) list.setItemChecked(i, true);
    }
    private String normalize(String value) {
        return value.toLowerCase(Locale.ROOT).replaceAll("[\\u064B-\\u065F\\u0670\\u0640]", "").replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي').trim();
    }
    private void select(JSONObject station) {
        boolean playing = RadioService.wanted && !RadioService.stationId.startsWith("offline-") && !RadioService.stationId.startsWith("recitation-");
        if (playing) {
            Intent intent = new Intent(this, RadioService.class).setAction("PLAY");
            for (String key : new String[]{"id", "name", "url", "backup"}) intent.putExtra(key, station.optString(key));
            try { if (Build.VERSION.SDK_INT >= 26) startForegroundService(intent); else startService(intent); }
            catch (Exception error) { Toast.makeText(this, "تعذّر تبديل المحطة، حاول مرة أخرى", Toast.LENGTH_LONG).show(); return; }
        }
        android.content.SharedPreferences.Editor edit = getSharedPreferences("radio-widget", 0).edit();
        for (String key : new String[]{"id", "name", "url", "backup"}) edit.putString(key, station.optString(key));
        edit.apply(); PrayerWidgetAgendaProvider.updateAll(this); finish();
    }
}
