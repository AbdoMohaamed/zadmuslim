package com.zadmuslim.app;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.graphics.Outline;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class AdhanActivity extends Activity {
    public static final String ACTION_DISMISS_ADHAN_ACTIVITY = "com.zadmuslim.app.ACTION_DISMISS_ADHAN_ACTIVITY";
    public static final String EXTRA_PRAYER_NAME = "prayer_name";
    public static final String EXTRA_PRAYER_KEY = "prayer_key";
    public static final String EXTRA_SHOW_PRAYER_IMAGES = "show_prayer_images";

    private BroadcastReceiver dismissReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // إضاءة الشاشة والظهور فوق شاشة القفل عند الأذان
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }
        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(0xFF03231C);
            getWindow().setNavigationBarColor(0xFF021611);
        }

        String prayerName = getIntent().getStringExtra(EXTRA_PRAYER_NAME);
        if (prayerName == null || prayerName.trim().isEmpty()) {
            prayerName = "الصلاة";
        }

        String prayerKey = getIntent().getStringExtra(EXTRA_PRAYER_KEY);
        if (prayerKey != null) {
            prayerKey = prayerKey.trim().toLowerCase(java.util.Locale.US);
        }
        if ((prayerKey == null || prayerKey.isEmpty()) && prayerName != null) {
            if (prayerName.contains("فجر")) prayerKey = "fajr";
            else if (prayerName.contains("ظهر")) prayerKey = "dhuhr";
            else if (prayerName.contains("عصر")) prayerKey = "asr";
            else if (prayerName.contains("مغرب")) prayerKey = "maghrib";
            else if (prayerName.contains("عشاء")) prayerKey = "isha";
        }

        boolean showImages = getIntent().getBooleanExtra(EXTRA_SHOW_PRAYER_IMAGES, true);
        if (!getIntent().hasExtra(EXTRA_SHOW_PRAYER_IMAGES)) {
            try {
                showImages = getSharedPreferences(AdhanNativePlugin.PREFS_NAME, Context.MODE_PRIVATE)
                        .getBoolean("show_prayer_images", true);
            } catch (Exception ignored) {}
        }

        DisplayMetrics dm = getResources().getDisplayMetrics();
        float density = dm.density;
        int screenHeightPx = dm.heightPixels;

        // Container رئيسي
        LinearLayout mainLayout = new LinearLayout(this);
        mainLayout.setOrientation(LinearLayout.VERTICAL);
        mainLayout.setFitsSystemWindows(true);

        GradientDrawable bg = new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{0xFF03231C, 0xFF063D31, 0xFF021611}
        );
        mainLayout.setBackground(bg);

        // ScrollView لملاءمة جميع أحجام الشاشات
        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);

        LinearLayout contentLayout = new LinearLayout(this);
        contentLayout.setOrientation(LinearLayout.VERTICAL);
        contentLayout.setGravity(Gravity.CENTER_HORIZONTAL);
        int horizPadding = (int) (20 * density);
        int vertPadding = (int) (18 * density);
        contentLayout.setPadding(horizPadding, vertPadding, horizPadding, vertPadding);

        // 1. آية قرآنية عليا راقية
        TextView ayahView = new TextView(this);
        ayahView.setText("« إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا »");
        ayahView.setTextSize(13);
        ayahView.setTextColor(0xFFA7D7C5);
        ayahView.setTypeface(Typeface.DEFAULT_BOLD);
        ayahView.setGravity(Gravity.CENTER);
        ayahView.setPadding(0, 0, 0, (int) (8 * density));
        contentLayout.addView(ayahView);

        // 2. عنوان حان الآن موعد الصلاة
        TextView titleView = new TextView(this);
        titleView.setText("حَانَ الآنَ مَوْعِدُ " + prayerName);
        titleView.setTextSize(22);
        titleView.setTextColor(0xFFD4AF37); // Gold
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        titleView.setGravity(Gravity.CENTER);
        titleView.setPadding(0, 0, 0, (int) (6 * density));
        contentLayout.addView(titleView);

        // 3. نص التكبير
        TextView descView = new TextView(this);
        descView.setText("الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح");
        descView.setTextSize(14);
        descView.setTextColor(0xFFE2E8F0);
        descView.setGravity(Gravity.CENTER);
        descView.setPadding(0, 0, 0, (int) (14 * density));
        contentLayout.addView(descView);

        // 4. عرض صورة الصلاة المخصصة المباركة
        int imgResId = 0;
        if (prayerKey != null && !prayerKey.isEmpty()) {
            imgResId = getResources().getIdentifier("pre_" + prayerKey, "drawable", getPackageName());
        }

        if (imgResId != 0 && showImages) {
            FrameLayout imageCard = new FrameLayout(this);
            GradientDrawable cardBg = new GradientDrawable();
            cardBg.setColor(0xFF042820);
            cardBg.setCornerRadius(22 * density);
            cardBg.setStroke((int) (2 * density), 0xFFD4AF37); // إطار ذهبي راقٍ
            imageCard.setBackground(cardBg);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                imageCard.setClipToOutline(true);
                imageCard.setOutlineProvider(new ViewOutlineProvider() {
                    @Override
                    public void getOutline(View view, Outline outline) {
                        outline.setRoundRect(0, 0, view.getWidth(), view.getHeight(), 22 * density);
                    }
                });
            }

            ImageView iv = new ImageView(this);
            iv.setImageResource(imgResId);
            iv.setScaleType(ImageView.ScaleType.CENTER_CROP);

            int targetHeight = (int) Math.min(screenHeightPx * 0.45f, 320 * density);
            if (targetHeight < (int) (180 * density)) {
                targetHeight = (int) (180 * density);
            }

            FrameLayout.LayoutParams ivParams = new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT
            );
            imageCard.addView(iv, ivParams);

            LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    targetHeight
            );
            cardParams.setMargins((int) (6 * density), 0, (int) (6 * density), (int) (16 * density));
            contentLayout.addView(imageCard, cardParams);
        } else {
            // بديل في حال عدم توفر الصورة
            TextView iconView = new TextView(this);
            iconView.setText("🕌");
            iconView.setTextSize(64);
            iconView.setGravity(Gravity.CENTER);
            iconView.setPadding(0, (int) (24 * density), 0, (int) (24 * density));
            contentLayout.addView(iconView);
        }

        // إضافة محتوى الـ ScrollView
        scrollView.addView(contentLayout, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
        ));

        // 5. زر إيقاف الأذان الكبير في الأسفل
        Button stopBtn = new Button(this);
        stopBtn.setText("إيقاف الأذان ⏹");
        stopBtn.setTextSize(18);
        stopBtn.setTextColor(Color.WHITE);
        stopBtn.setTypeface(Typeface.DEFAULT_BOLD);

        GradientDrawable btnBg = new GradientDrawable();
        btnBg.setColor(0xFFB91C1C); // أحمر أنيق للإيقاف
        btnBg.setCornerRadius(28 * density);
        btnBg.setStroke((int) (2.5f * density), 0xFFD4AF37); // إطار ذهبي
        stopBtn.setBackground(btnBg);
        stopBtn.setOnClickListener(v -> stopAdhanAndFinish());

        LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                (int) (52 * density)
        );
        btnParams.setMargins((int) (24 * density), (int) (8 * density), (int) (24 * density), (int) (6 * density));

        // 6. تلميح أزرار الصوت
        TextView hintView = new TextView(this);
        hintView.setText("🔕 يمكنك أيضاً إيقاف الأذان بالضغط على أزرار الصوت");
        hintView.setTextSize(12);
        hintView.setTextColor(0xFFA0AEC0);
        hintView.setGravity(Gravity.CENTER);
        hintView.setPadding(0, 0, 0, (int) (14 * density));

        // بناء الشاشة الكاملة
        mainLayout.addView(scrollView, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        mainLayout.addView(stopBtn, btnParams);
        mainLayout.addView(hintView);

        setContentView(mainLayout);

        // استقبال أمر إغلاق الشاشة عند إيقاف الأذان من أي مكان
        dismissReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                finish();
            }
        };
        androidx.core.content.ContextCompat.registerReceiver(
                this,
                dismissReceiver,
                new IntentFilter(ACTION_DISMISS_ADHAN_ACTIVITY),
                androidx.core.content.ContextCompat.RECEIVER_NOT_EXPORTED
        );
    }

    /**
     * اعتراض أزرار الهاتف المادية (Volume Up/Down) لإيقاف الأذان فوراً
     */
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            int keyCode = event.getKeyCode();
            if (keyCode == KeyEvent.KEYCODE_VOLUME_UP ||
                keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
                stopAdhanAndFinish();
                return true;
            }
        }
        return super.dispatchKeyEvent(event);
    }

    private void stopAdhanAndFinish() {
        AdhanPlayer.stop();
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (dismissReceiver != null) {
            try {
                unregisterReceiver(dismissReceiver);
            } catch (Exception ignored) {}
        }
    }
}
