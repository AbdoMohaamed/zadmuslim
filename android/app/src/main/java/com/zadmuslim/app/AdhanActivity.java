package com.zadmuslim.app;

import androidx.appcompat.app.AppCompatActivity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class AdhanActivity extends AppCompatActivity {
    public static final String ACTION_DISMISS_ADHAN_ACTIVITY = "com.zadmuslim.app.ACTION_DISMISS_ADHAN_ACTIVITY";
    public static final String EXTRA_PRAYER_NAME = "prayer_name";
    public static final String EXTRA_PRAYER_KEY = "prayer_key";
    public static final String EXTRA_SHOW_PRAYER_IMAGES = "show_prayer_images";

    private BroadcastReceiver dismissReceiver;
    private String prayerName = "الصلاة";
    private String prayerKey = "";

    public static int getPrayerImageResId(String prayerKey) {
        if (prayerKey == null || prayerKey.trim().isEmpty()) {
            return R.drawable.pre_fajr;
        }
        String key = prayerKey.trim().toLowerCase(java.util.Locale.US);
        switch (key) {
            case "dhuhr": return R.drawable.pre_dhuhr;
            case "asr": return R.drawable.pre_asr;
            case "maghrib": return R.drawable.pre_maghrib;
            case "isha": return R.drawable.pre_isha;
            case "fajr": return R.drawable.pre_fajr;
            default:
                if (key.contains("ظهر") || key.contains("dhuhr")) return R.drawable.pre_dhuhr;
                if (key.contains("عصر") || key.contains("asr")) return R.drawable.pre_asr;
                if (key.contains("مغرب") || key.contains("maghrib")) return R.drawable.pre_maghrib;
                if (key.contains("عشاء") || key.contains("isha")) return R.drawable.pre_isha;
                if (key.contains("فجر") || key.contains("fajr")) return R.drawable.pre_fajr;
                return R.drawable.pre_fajr;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        supportRequestWindowFeature(Window.FEATURE_NO_TITLE);
        super.onCreate(savedInstanceState);
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }

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
            getWindow().setStatusBarColor(Color.TRANSPARENT);
            getWindow().setNavigationBarColor(Color.TRANSPARENT);
        }

        // فتح الشاشة بالكامل من الحافة للحافة (Edge-to-Edge Immersive)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            );
        }

        String pName = getIntent().getStringExtra(EXTRA_PRAYER_NAME);
        if (pName != null && !pName.trim().isEmpty()) {
            prayerName = pName.trim();
        }

        String pKey = getIntent().getStringExtra(EXTRA_PRAYER_KEY);
        if (pKey != null) {
            prayerKey = pKey.trim().toLowerCase(java.util.Locale.US);
        }
        if ((prayerKey == null || prayerKey.isEmpty()) && prayerName != null) {
            if (prayerName.contains("فجر")) prayerKey = "fajr";
            else if (prayerName.contains("ظهر")) prayerKey = "dhuhr";
            else if (prayerName.contains("عصر")) prayerKey = "asr";
            else if (prayerName.contains("مغرب")) prayerKey = "maghrib";
            else if (prayerName.contains("عشاء")) prayerKey = "isha";
        }

        DisplayMetrics dm = getResources().getDisplayMetrics();
        float density = dm.density;

        // Container رئيسي (FrameLayout) لملء الشاشة بالكامل بالصورة كخلفية
        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // 1. صورة الصلاة المخصصة كخلفية كاملة للشاشة (Full-screen background image)
        int imgResId = getPrayerImageResId(prayerKey);
        ImageView bgImageView = new ImageView(this);
        boolean showImages = getSharedPreferences(AdhanNativePlugin.PREFS_NAME, Context.MODE_PRIVATE).getBoolean("show_prayer_images", true);
        rootLayout.setBackgroundColor(0xFF03231C);
        if (showImages) bgImageView.setImageResource(imgResId);
        bgImageView.setScaleType(ImageView.ScaleType.CENTER_CROP);
        rootLayout.addView(bgImageView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));

        // 2. طبقة تظليل إسلامية فخمة ومتدرجة تبرز جمال الصورة وتمنح النصوص وضوحاً فائقاً
        View scrimView = new View(this);
        GradientDrawable scrim = new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{0x00000000, 0x00000000, 0x66000000}
        );
        scrimView.setBackground(scrim);
        rootLayout.addView(scrimView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));

        // 3. المحتوى فوق الخلفية
        LinearLayout mainLayout = new LinearLayout(this);
        mainLayout.setOrientation(LinearLayout.VERTICAL);
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(mainLayout, (view, insets) -> {
            androidx.core.graphics.Insets safe = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars() | androidx.core.view.WindowInsetsCompat.Type.displayCutout());
            view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
            return insets;
        });

        // 4. حاوية الزرين (إيقاف باللون الأحمر + استكمال باللون الأخضر)
        LinearLayout buttonsLayout = new LinearLayout(this);
        buttonsLayout.setOrientation(LinearLayout.HORIZONTAL);
        buttonsLayout.setGravity(Gravity.CENTER);

        // أ) زر الاستكمال (أخضر فخم)
        Button continueBtn = new Button(this);
        continueBtn.setText("استمرار الأذان");
        continueBtn.setTextSize(16);
        continueBtn.setTextColor(Color.WHITE);
        continueBtn.setTypeface(Typeface.DEFAULT_BOLD);

        GradientDrawable continueBg = new GradientDrawable();
        continueBg.setColor(0xFF15803D); // أخضر إسلامي حيوي وواضح
        continueBg.setCornerRadius(26 * density);
        continueBg.setStroke((int) (2 * density), 0xFFD4AF37); // إطار ذهبي راقٍ
        continueBtn.setBackground(continueBg);
        continueBtn.setOnClickListener(v -> continueAdhanAndFinish());

        LinearLayout.LayoutParams continueParams = new LinearLayout.LayoutParams(
                0,
                (int) (52 * density),
                1f
        );
        continueParams.setMargins((int) (8 * density), 0, (int) (14 * density), 0);
        buttonsLayout.addView(continueBtn, continueParams);

        // ب) زر الإيقاف (أحمر أنيق)
        Button stopBtn = new Button(this);
        stopBtn.setText("إيقاف الأذان");
        stopBtn.setTextSize(16);
        stopBtn.setTextColor(Color.WHITE);
        stopBtn.setTypeface(Typeface.DEFAULT_BOLD);

        GradientDrawable stopBg = new GradientDrawable();
        stopBg.setColor(0xFFDC2626); // أحمر واضح ومريح للإيقاف
        stopBg.setCornerRadius(26 * density);
        stopBg.setStroke((int) (2 * density), 0xFFD4AF37); // إطار ذهبي
        stopBtn.setBackground(stopBg);
        stopBtn.setOnClickListener(v -> stopAdhanAndFinish());

        LinearLayout.LayoutParams stopParams = new LinearLayout.LayoutParams(
                0,
                (int) (52 * density),
                1f
        );
        stopParams.setMargins((int) (14 * density), 0, (int) (8 * density), 0);
        buttonsLayout.addView(stopBtn, stopParams);

        LinearLayout.LayoutParams btnContainerParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        btnContainerParams.setMargins((int) (8 * density), (int) (8 * density), (int) (8 * density), (int) (8 * density));

        // بناء كامل الشاشة
        mainLayout.addView(new View(this), new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        mainLayout.addView(buttonsLayout, btnContainerParams);


        rootLayout.addView(mainLayout, new FrameLayout.LayoutParams(-1, -1));

        setContentView(rootLayout);

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
     * الضغط على زر استكمال (الأخضر):
     * يترك الأذان يعمل بالخلفية ويغلق الشاشة المنبثقة فوق القفل ليعود المستخدم لهاتفه
     */
    private void continueAdhanAndFinish() {
        finish();
    }

    /**
     * الضغط على زر إيقاف (الأحمر):
     * يوقف صوت الأذان فوراً ويمسح الإشعار ويغلق الشاشة
     */
    private void stopAdhanAndFinish() {
        AdhanPlayer.stop();
        AdhanAlarmReceiver.dismissAdhanNotification(this);
        finish();
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
