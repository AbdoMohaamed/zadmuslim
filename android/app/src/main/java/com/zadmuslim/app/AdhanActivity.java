package com.zadmuslim.app;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
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

        String prayerName = getIntent().getStringExtra(EXTRA_PRAYER_NAME);
        if (prayerName == null || prayerName.isEmpty()) {
            prayerName = "الصلاة";
        }
        String prayerKey = getIntent().getStringExtra(EXTRA_PRAYER_KEY);
        boolean showImages = getIntent().getBooleanExtra(EXTRA_SHOW_PRAYER_IMAGES, false);
        if (!getIntent().hasExtra(EXTRA_SHOW_PRAYER_IMAGES)) {
            try { showImages = getSharedPreferences(AdhanNativePlugin.PREFS_NAME, Context.MODE_PRIVATE).getBoolean("show_prayer_images", false); } catch (Exception ignored) {}
        }

        // بناء واجهة إسلامية راقية برمجياً
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(48, 48, 48, 48);

        // خلفية خضراء داكنة إسلامية
        GradientDrawable bg = new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{0xFF042B23, 0xFF064034, 0xFF021B16}
        );
        root.setBackground(bg);

        // عرض صورة الصلاة المباركة إن وجدت
        int imgResId = (showImages && prayerKey != null && !prayerKey.isEmpty())
                ? getResources().getIdentifier("pre_" + prayerKey, "drawable", getPackageName())
                : 0;

        if (imgResId != 0) {
            ImageView iv = new ImageView(this);
            iv.setImageResource(imgResId);
            iv.setScaleType(ImageView.ScaleType.CENTER_CROP);
            iv.setAdjustViewBounds(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                iv.setClipToOutline(true);
                iv.setOutlineProvider(new android.view.ViewOutlineProvider() {
                    @Override
                    public void getOutline(View view, android.graphics.Outline outline) {
                        outline.setRoundRect(0, 0, view.getWidth(), view.getHeight(), 28f);
                    }
                });
            }
            int imageMaxHeight = (int) (220 * getResources().getDisplayMetrics().density);
            iv.setMaxHeight(imageMaxHeight);
            LinearLayout.LayoutParams ivParams = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    imageMaxHeight
            );
            ivParams.setMargins(16, 0, 16, 20);
            root.addView(iv, ivParams);
        } else {
            // أيقونة المسجد كبديل
            TextView iconView = new TextView(this);
            iconView.setText("🕌");
            iconView.setTextSize(64);
            iconView.setGravity(Gravity.CENTER);
            root.addView(iconView);
        }

        // عنوان حان الآن موعد
        TextView titleView = new TextView(this);
        titleView.setText("حَانَ الآنَ مَوْعِدُ " + prayerName);
        titleView.setTextSize(24);
        titleView.setTextColor(0xFFD4AF37); // Gold
        titleView.setTypeface(Typeface.DEFAULT_BOLD);
        titleView.setGravity(Gravity.CENTER);
        titleView.setPadding(0, 16, 0, 12);
        root.addView(titleView);

        // نص التكبير
        TextView descView = new TextView(this);
        descView.setText("الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح");
        descView.setTextSize(16);
        descView.setTextColor(0xFFE2E8F0);
        descView.setGravity(Gravity.CENTER);
        descView.setPadding(0, 0, 0, 32);
        root.addView(descView);

        // زر إيقاف الأذان الكبير
        Button stopBtn = new Button(this);
        stopBtn.setText("إيقاف الأذان ⏹");
        stopBtn.setTextSize(18);
        stopBtn.setTextColor(Color.WHITE);
        stopBtn.setTypeface(Typeface.DEFAULT_BOLD);
        stopBtn.setPadding(40, 24, 40, 24);

        GradientDrawable btnBg = new GradientDrawable();
        btnBg.setColor(0xFFB91C1C); // أحمر أنيق للإيقاف
        btnBg.setCornerRadius(30);
        btnBg.setStroke(3, 0xFFD4AF37); // إطار ذهبي
        stopBtn.setBackground(btnBg);
        stopBtn.setOnClickListener(v -> stopAdhanAndFinish());

        LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        btnParams.setMargins(32, 16, 32, 20);
        root.addView(stopBtn, btnParams);

        // تلميح أزرار الصوت وزر القفل
        TextView hintView = new TextView(this);
        hintView.setText("🔕 يمكنك أيضاً إيقاف الأذان بالضغط على أي من أزرار الصوت");
        hintView.setTextSize(13);
        hintView.setTextColor(0xFFA0AEC0);
        hintView.setGravity(Gravity.CENTER);
        hintView.setPadding(16, 12, 16, 0);
        root.addView(hintView);

        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        scrollView.addView(root, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));
        setContentView(scrollView);

        // استقبال أمر إغلاق الشاشة عند إيقاف الأذان من أي مكان
        dismissReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                finish();
            }
        };
        androidx.core.content.ContextCompat.registerReceiver(this, dismissReceiver, new IntentFilter(ACTION_DISMISS_ADHAN_ACTIVITY), androidx.core.content.ContextCompat.RECEIVER_NOT_EXPORTED);
    }

    /**
     * اعتراض أزرار الهاتف المادية (Volume Up/Down و Power) لإيقاف الأذان فوراً
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
            dismissReceiver = null;
        }
    }
}
